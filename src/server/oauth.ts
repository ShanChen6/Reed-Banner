// Luồng OAuth 2.0 (mã ủy quyền + PKCE) cho Google và GitHub, tự viết bằng fetch để không phụ thuộc thư
// viện đăng nhập: game chỉ cần biết "người này là ai" rồi gắn vào tài khoản khách (xem ./accounts).
// Nhà cung cấp chỉ bật khi có đủ biến môi trường client id và secret.

import { createHash, randomBytes } from "node:crypto";
import { signIn, type AccountStore, type OAuthProfile, type ProviderId } from "./accounts";

interface ProviderConfig {
  readonly authorizeUrl: string;
  readonly tokenUrl: string;
  readonly scopes: readonly string[];
  readonly env: { readonly id: string; readonly secret: string };
  /** Đọc hồ sơ bằng access token. */
  readonly profile: (token: string, fetcher: typeof fetch) => Promise<OAuthProfile>;
}

async function getJson(url: string, token: string, fetcher: typeof fetch): Promise<Record<string, unknown>> {
  const res = await fetcher(url, {
    // GitHub bắt buộc có User-Agent.
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "User-Agent": "co-lau" },
  });
  if (!res.ok) throw new Error(`Đọc hồ sơ lỗi ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);

export const PROVIDERS: Readonly<Record<ProviderId, ProviderConfig>> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["openid", "profile"],
    env: { id: "GOOGLE_CLIENT_ID", secret: "GOOGLE_CLIENT_SECRET" },
    profile: async (token, fetcher) => {
      const u = await getJson("https://openidconnect.googleapis.com/v1/userinfo", token, fetcher);
      const subject = str(u.sub);
      if (!subject) throw new Error("Google không trả về sub");
      return { provider: "google", subject, name: str(u.name) ?? "Người chơi", avatarUrl: str(u.picture) };
    },
  },
  github: {
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: ["read:user"],
    env: { id: "GITHUB_CLIENT_ID", secret: "GITHUB_CLIENT_SECRET" },
    profile: async (token, fetcher) => {
      const u = await getJson("https://api.github.com/user", token, fetcher);
      if (typeof u.id !== "number") throw new Error("GitHub không trả về id");
      return {
        provider: "github",
        subject: String(u.id),
        name: str(u.name) ?? str(u.login) ?? "Người chơi",
        avatarUrl: str(u.avatar_url),
      };
    },
  },
};

export function isProvider(v: string): v is ProviderId {
  return Object.hasOwn(PROVIDERS, v);
}

type Env = Readonly<Record<string, string | undefined>>;

export interface Credentials {
  readonly clientId: string;
  readonly clientSecret: string;
}

/** Client id và secret của nhà cung cấp; null nếu chưa cấu hình (nút đăng nhập đó bị ẩn). */
export function credentials(provider: ProviderId, env: Env = process.env): Credentials | null {
  const { id, secret } = PROVIDERS[provider].env;
  const clientId = env[id];
  const clientSecret = env[secret];
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function enabledProviders(env: Env = process.env): ProviderId[] {
  return (Object.keys(PROVIDERS) as ProviderId[]).filter((p) => credentials(p, env) !== null);
}

const randomToken = () => randomBytes(32).toString("base64url");

/** Trạng thái giữ trong cookie ngắn hạn giữa lúc chuyển sang nhà cung cấp và lúc quay về. */
export interface PendingLogin {
  readonly provider: ProviderId;
  readonly state: string;
  readonly verifier: string;
  readonly returnTo: string;
}

export function newPendingLogin(provider: ProviderId, returnTo: string): PendingLogin {
  return { provider, state: randomToken(), verifier: randomToken(), returnTo: safeReturnTo(returnTo) };
}

export function encodePending(p: PendingLogin): string {
  return Buffer.from(JSON.stringify(p)).toString("base64url");
}

export function decodePending(value: string | undefined): PendingLogin | null {
  if (!value) return null;
  try {
    const p = JSON.parse(Buffer.from(value, "base64url").toString()) as Partial<PendingLogin>;
    if (typeof p.provider !== "string" || !isProvider(p.provider)) return null;
    if (typeof p.state !== "string" || typeof p.verifier !== "string" || typeof p.returnTo !== "string") return null;
    return { provider: p.provider, state: p.state, verifier: p.verifier, returnTo: safeReturnTo(p.returnTo) };
  } catch {
    return null;
  }
}

/** Chỉ cho quay về đường dẫn trong cùng trang web (chặn chuyển hướng sang trang khác). */
export function safeReturnTo(v: string | null | undefined): string {
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.includes("\\")) return "/game";
  return v;
}

export function redirectUri(origin: string, provider: ProviderId): string {
  return `${origin}/api/auth/${provider}/callback`;
}

export function authorizationUrl(p: PendingLogin, creds: Credentials, redirect: string): URL {
  const cfg = PROVIDERS[p.provider];
  const url = new URL(cfg.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", creds.clientId);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("scope", cfg.scopes.join(" "));
  url.searchParams.set("state", p.state);
  url.searchParams.set("code_challenge", createHash("sha256").update(p.verifier).digest("base64url"));
  url.searchParams.set("code_challenge_method", "S256");
  return url;
}

/** Đổi mã ủy quyền lấy access token rồi đọc hồ sơ. */
export async function exchangeCode(
  p: PendingLogin,
  code: string,
  creds: Credentials,
  redirect: string,
  fetcher: typeof fetch = fetch,
): Promise<OAuthProfile> {
  const cfg = PROVIDERS[p.provider];
  const res = await fetcher(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirect,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      code_verifier: p.verifier,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const token = str(body.access_token);
  // GitHub báo lỗi bằng status 200 kèm trường `error`.
  if (!res.ok || !token) throw new Error(`Đổi mã lỗi ${res.status} ${str(body.error) ?? ""}`.trim());
  return cfg.profile(token, fetcher);
}

export interface CallbackInput {
  readonly provider: ProviderId;
  readonly pending: PendingLogin | null;
  readonly code: string | null;
  readonly state: string | null;
  /** Tài khoản khách đang dùng (từ cookie), nếu có. */
  readonly current: string | null;
  readonly creds: Credentials;
  readonly redirect: string;
  readonly store: AccountStore;
  readonly now: number;
  readonly newId: () => string;
  readonly fetcher?: typeof fetch;
}

export type CallbackResult =
  | { readonly ok: true; readonly accountId: string; readonly returnTo: string }
  | { readonly ok: false; readonly returnTo: string };

/**
 * Xử lý lúc nhà cung cấp chuyển về: kiểm tra `state` khớp cookie (chống CSRF), đổi mã, rồi gắn danh tính
 * vào tài khoản. Người chơi bấm hủy hoặc có lỗi thì quay về trang cũ, không đổi tài khoản.
 */
export async function completeLogin(i: CallbackInput): Promise<CallbackResult> {
  const returnTo = i.pending?.returnTo ?? "/game";
  if (!i.pending || i.pending.provider !== i.provider || !i.code || !i.state || i.state !== i.pending.state) {
    return { ok: false, returnTo };
  }
  try {
    const profile = await exchangeCode(i.pending, i.code, i.creds, i.redirect, i.fetcher);
    const accountId = await signIn(i.store, profile, i.current, i.now, i.newId);
    return { ok: true, accountId, returnTo };
  } catch (e) {
    console.error("Đăng nhập OAuth lỗi", i.provider, e instanceof Error ? e.message : e);
    return { ok: false, returnTo };
  }
}

/** Thêm `?login=error` vào đường dẫn quay về để trang báo đăng nhập không thành công. */
export function withLoginError(path: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}login=error`;
}
