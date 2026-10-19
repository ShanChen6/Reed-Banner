import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { MemoryAccountStore, signIn, type OAuthProfile } from "../../src/server/accounts";
import {
  authorizationUrl,
  completeLogin,
  decodePending,
  enabledProviders,
  encodePending,
  newPendingLogin,
  redirectUri,
  safeReturnTo,
  withLoginError,
} from "../../src/server/oauth";

const creds = { clientId: "cid", clientSecret: "secret" };
const profile = (subject: string, provider: OAuthProfile["provider"] = "google"): OAuthProfile => ({
  provider,
  subject,
  name: `Người ${subject}`,
  avatarUrl: null,
});

/** fetch giả: trả token rồi hồ sơ, ghi lại các request. */
function fakeFetch(user: Record<string, unknown>, token: Record<string, unknown> = { access_token: "tok" }) {
  const calls: { url: string; body?: string }[] = [];
  const fetcher = (async (url: string, init?: RequestInit) => {
    calls.push({ url, body: init?.body?.toString() });
    const json = calls.length === 1 ? token : user;
    return new Response(JSON.stringify(json), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  return { fetcher, calls };
}

describe("đăng nhập OAuth", () => {
  it("chỉ bật nhà cung cấp có đủ client id và secret", () => {
    assert.deepEqual(enabledProviders({}), []);
    assert.deepEqual(enabledProviders({ GITHUB_CLIENT_ID: "a", GITHUB_CLIENT_SECRET: "b", GOOGLE_CLIENT_ID: "c" }), ["github"]);
  });

  it("chỉ cho quay về đường dẫn trong trang", () => {
    assert.equal(safeReturnTo("/play?x=1"), "/play?x=1");
    for (const bad of ["https://ac.com", "//ac.com", "/\\ac.com", "", null, undefined]) assert.equal(safeReturnTo(bad), "/play");
    assert.equal(withLoginError("/play"), "/play?login=error");
    assert.equal(withLoginError("/play?a=1"), "/play?a=1&login=error");
  });

  it("URL ủy quyền có state và PKCE S256; cookie chờ mã hóa và giải mã được", () => {
    const p = newPendingLogin("google", "//ac.com");
    assert.equal(p.returnTo, "/play");
    const url = authorizationUrl(p, creds, redirectUri("https://co-lau.vercel.app", "google"));
    assert.equal(url.searchParams.get("state"), p.state);
    assert.equal(url.searchParams.get("redirect_uri"), "https://co-lau.vercel.app/api/auth/google/callback");
    assert.equal(url.searchParams.get("code_challenge"), createHash("sha256").update(p.verifier).digest("base64url"));
    assert.deepEqual(decodePending(encodePending(p)), p);
    assert.equal(decodePending("rác"), null);
    assert.equal(decodePending(Buffer.from(JSON.stringify({ ...p, provider: "x" })).toString("base64url")), null);
  });

  it("khách đăng nhập lần đầu: danh tính gắn vào chính tài khoản khách", async () => {
    const store = new MemoryAccountStore();
    const pending = newPendingLogin("github", "/play");
    const { fetcher, calls } = fakeFetch({ id: 42, login: "shan", name: null, avatar_url: "https://a/x.png" });
    const r = await completeLogin({
      provider: "github",
      pending,
      code: "c",
      state: pending.state,
      current: "g_khach",
      creds,
      redirect: "https://x/api/auth/github/callback",
      store,
      now: 10,
      newId: () => "g_moi",
      fetcher,
    });
    assert.deepEqual(r, { ok: true, accountId: "g_khach", returnTo: "/play" });
    assert.ok(calls[0]!.body!.includes(`code_verifier=${pending.verifier}`));
    const acc = await store.get("g_khach");
    assert.equal(acc?.name, "shan");
    assert.deepEqual(acc?.providers, ["github"]);
  });

  it("state lệch, thiếu cookie, người chơi hủy hoặc đổi mã lỗi: không đăng nhập", async () => {
    const store = new MemoryAccountStore();
    const pending = newPendingLogin("google", "/play");
    const base = { provider: "google" as const, pending, code: "c", state: pending.state, current: null, creds, redirect: "r", store, now: 1, newId: () => "g_1" };
    assert.equal((await completeLogin({ ...base, state: "khac" })).ok, false);
    assert.equal((await completeLogin({ ...base, pending: null })).ok, false);
    assert.equal((await completeLogin({ ...base, code: null })).ok, false);
    assert.equal((await completeLogin({ ...base, provider: "github" })).ok, false);
    const { fetcher } = fakeFetch({}, { error: "bad_verification_code" });
    assert.equal((await completeLogin({ ...base, fetcher })).ok, false);
    assert.equal(await store.get("g_1"), null);
  });

  it("danh tính đã có tài khoản: vào lại tài khoản đó; nhà cung cấp mới gắn thêm vào tài khoản đang dùng", async () => {
    const store = new MemoryAccountStore();
    let n = 0;
    const newId = () => `g_${++n}`;
    assert.equal(await signIn(store, profile("s1"), null, 1, newId), "g_1");
    // Máy khác, đang là khách g_x: đăng nhập Google cũ thì về g_1.
    assert.equal(await signIn(store, profile("s1"), "g_x", 2, newId), "g_1");
    assert.equal(await store.get("g_x"), null);
    // Đang ở g_1, đăng nhập GitHub lần đầu: gắn vào g_1.
    assert.equal(await signIn(store, profile("99", "github"), "g_1", 3, newId), "g_1");
    assert.deepEqual((await store.get("g_1"))?.providers, ["github", "google"]);
    assert.equal((await store.get("g_1"))?.createdAt, 1);
  });
});
