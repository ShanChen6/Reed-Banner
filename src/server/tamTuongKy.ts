// Tầm Tướng Ký chế độ Thường trên server (LT-04). Server giữ phiếu, lượt, gợi ý theo ngày và sổ khám phá trong hồ sơ
// tài khoản; client chỉ gửi ý định (mở lượt, ghép hai yếu tố, xin gợi ý) kèm `requestId`. Ghi qua `updateProfile`
// (điều kiện version, thử lại khi hai request cùng lúc). Luật thuần ở @/core/tam-tuong-ky/account.
// Thiết kế: docs/02-game-modes/future/17-tam-tuong-ky-lt04-server.md.

import { vnDay } from "@/core";
import {
  ACTIVE_PACK,
  activeSession,
  buildCatalog,
  combineInSession,
  discoveredCharacters,
  hintsLeft,
  newTtkAccount,
  normalizeTtkAccount,
  openSession,
  spendHint,
  TTK_COMBINES_PER_SESSION,
  TTK_HINTS_PER_DAY,
  TTK_MAX_TICKETS,
  TTK_SESSION_MS,
  type DiscoveryState,
  type TtkAccount,
  type TtkError,
  type TtkResponse,
  type TtkResult,
} from "@/core/tam-tuong-ky";
import { loadProfile, updateProfile, type ProfileStore } from "./profiles";

const catalog = buildCatalog(ACTIVE_PACK);

export interface TamTuongKyDeps {
  readonly profiles: ProfileStore;
  readonly now: number;
  readonly enabled: boolean;
  readonly isSignedIn: (ownerId: string) => Promise<boolean>;
}

/** Những gì client cần để vẽ màn: không có gì bí mật (catalog nằm trong bundle). */
export interface TtkView {
  readonly packId: string;
  readonly tickets: number;
  readonly maxTickets: number;
  readonly session: { readonly combinesLeft: number; readonly combinesPerSession: number; readonly expiresAt: number } | null;
  readonly hintsLeft: number;
  readonly hintsPerDay: number;
  readonly discovery: DiscoveryState;
  readonly heroesFound: number;
}

export type TtkServiceError = TtkError | "featureDisabled" | "loginRequired" | "conflict";

export type TtkServiceResult =
  | { readonly ok: true; readonly view: TtkView; readonly response?: TtkResponse }
  | { readonly ok: false; readonly error: TtkServiceError; readonly view?: TtkView };

export function ttkHttpStatus(error: TtkServiceError): number {
  switch (error) {
    case "featureDisabled":
      return 403;
    case "loginRequired":
      return 401;
    case "badRequest":
      return 400;
    case "noTicket":
    case "noSession":
    case "noHint":
    case "conflict":
      return 409;
  }
}

function viewOf(account: TtkAccount, now: number): TtkView {
  const session = activeSession(account, now);
  return {
    packId: catalog.pack.id,
    tickets: account.tickets,
    maxTickets: TTK_MAX_TICKETS,
    session: session ? { combinesLeft: session.combinesLeft, combinesPerSession: TTK_COMBINES_PER_SESSION, expiresAt: session.startedAt + TTK_SESSION_MS } : null,
    hintsLeft: hintsLeft(account, vnDay(now)),
    hintsPerDay: TTK_HINTS_PER_DAY,
    discovery: account.discovery,
    heroesFound: discoveredCharacters(catalog, account.discovery).length,
  };
}

/** Tài khoản Tầm Tướng Ký trong hồ sơ, khớp catalog đang chạy; chưa có thì tạo mới (3 phiếu). */
const accountOf = (p: { readonly tamTuongKy?: TtkAccount }) => normalizeTtkAccount(p.tamTuongKy ?? newTtkAccount(catalog), catalog);

async function gate(deps: TamTuongKyDeps, ownerId: string | null): Promise<TtkServiceError | null> {
  if (!deps.enabled) return "featureDisabled";
  if (!ownerId || !(await deps.isSignedIn(ownerId))) return "loginRequired";
  return null;
}

/** Trạng thái hiện tại. Không ghi gì (tài khoản mới chỉ được lưu ở thao tác đầu tiên). */
export async function getTamTuongKy(deps: TamTuongKyDeps, ownerId: string | null): Promise<TtkServiceResult> {
  const blocked = await gate(deps, ownerId);
  if (blocked) return { ok: false, error: blocked };
  const { profile } = await loadProfile(deps.profiles, ownerId!);
  return { ok: true, view: viewOf(accountOf(profile), deps.now) };
}

async function act(deps: TamTuongKyDeps, ownerId: string | null, step: (account: TtkAccount) => TtkResult): Promise<TtkServiceResult> {
  const blocked = await gate(deps, ownerId);
  if (blocked) return { ok: false, error: blocked };
  let response: TtkResponse | undefined;
  let lastAccount: TtkAccount | null = null;
  const r = await updateProfile<TtkError>(
    deps.profiles,
    ownerId!,
    (p) => {
      const account = accountOf(p);
      lastAccount = account;
      const out = step(account);
      if (!out.ok) return out;
      response = out.response;
      return { ok: true, profile: { ...p, tamTuongKy: out.account } };
    },
    deps.now,
  );
  if (!r.ok) return { ok: false, error: r.error, view: lastAccount ? viewOf(lastAccount, deps.now) : undefined };
  return { ok: true, view: viewOf(r.stored.profile.tamTuongKy!, deps.now), response };
}

export const openTamTuongKySession = (deps: TamTuongKyDeps, ownerId: string | null, requestId: unknown) =>
  act(deps, ownerId, (a) => openSession(a, requestId, deps.now));

export const combineTamTuongKy = (deps: TamTuongKyDeps, ownerId: string | null, requestId: unknown, first: unknown, second: unknown) =>
  act(deps, ownerId, (a) => combineInSession(catalog, a, requestId, first, second, deps.now));

export const hintTamTuongKy = (deps: TamTuongKyDeps, ownerId: string | null, requestId: unknown, level: unknown) =>
  act(deps, ownerId, (a) => spendHint(catalog, a, requestId, level, vnDay(deps.now)));
