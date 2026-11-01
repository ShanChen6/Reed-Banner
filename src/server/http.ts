// Phần dùng chung của route handler online: xác định tài khoản (khách hoặc đã đăng nhập) qua cookie, trả JSON.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { httpStatus, type Deps, type ServiceResult } from "./battles";
import { GUEST_COOKIE, newGuestId, signGuest, verifyGuest } from "./guest";
import { arenaStore, dailyStore, destinyLeaderboardStore, leaderboardStore, matchStore, profileStore } from "./store";
import { formationRankedEnabled, towerFeatureFlags } from "./featureFlags";
import type { FormationDeps } from "./formation";
import { accountStore, dailyStore as dailyStoreOf, destinyLeaderboardStore as destinyBoardOf, formationStore, rankRewardStore, seasonStore } from "./store";
import { dailySource, destinySource, seasonSource, type RankRewardDeps } from "./rankRewards";

/** Cookie khách sống 30 ngày, khớp với hạn xóa tài khoản khách không hoạt động. */
const GUEST_MAX_AGE = 30 * 24 * 60 * 60;
/** Sau khi đăng nhập OAuth, cùng cookie đó sống 1 năm. */
export const LOGIN_MAX_AGE = 365 * 24 * 60 * 60;

/** Cookie ngắn hạn giữ state và PKCE verifier trong lúc đăng nhập OAuth. */
export const PENDING_COOKIE = "colau_oauth";
export const PENDING_MAX_AGE = 10 * 60;

/** Đặt cookie tài khoản (khách hoặc đã đăng nhập; cùng một cookie, khác hạn). */
export function setAccountCookie(res: NextResponse, id: string, maxAge = GUEST_MAX_AGE): void {
  res.cookies.set(GUEST_COOKIE, signGuest(id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export function guestOf(request: NextRequest): string | null {
  return verifyGuest(request.cookies.get(GUEST_COOKIE)?.value);
}

/** Đã có tài khoản đăng nhập (không phải khách). Chế độ online có bảng xếp hạng và thưởng chỉ cho tài khoản này. */
export async function isSignedInAccount(ownerId: string): Promise<boolean> {
  return (await accountStore().get(ownerId)) !== null;
}

/** Phản hồi chuẩn khi khách vào chế độ cần đăng nhập. */
export function loginRequiredResponse(): NextResponse {
  return NextResponse.json({ error: "loginRequired" }, { status: 401, headers: { "cache-control": "no-store" } });
}

export function serverDeps(): Deps {
  const features = towerFeatureFlags();
  return {
    store: matchStore(),
    profiles: profileStore(),
    // Server là nơi duy nhất được đọc giờ và bốc seed thật.
    now: Date.now(),
    seed: randomInt(0, 2 ** 32),
    newId: () => `m_${randomUUID()}`,
    daily: dailyStore(),
    leaderboard: leaderboardStore(),
    destinyLeaderboard: destinyLeaderboardStore(),
    arena: arenaStore(),
    dailySecret: process.env.SESSION_SECRET,
    destinySecret: process.env.SESSION_SECRET,
    trialEnabled: features.trial,
    destinyEnabled: features.destiny,
    seasons: seasonStore(),
    isSignedIn: isSignedInAccount,
  };
}

export function respond(result: ServiceResult, newGuest?: string): NextResponse {
  // `now` là giờ server, để client tính đồng hồ 30 giây theo đúng giờ server.
  const now = Date.now();
  const res = result.ok
    ? NextResponse.json({ id: result.id, view: result.view, events: result.events, outcome: result.outcome, now })
    : NextResponse.json({ error: result.error, view: result.view, now }, { status: httpStatus(result.error) });
  if (newGuest) setAccountCookie(res, newGuest);
  return res;
}

/**
 * Form gửi từ trang khác (đăng nhập hộ người chơi vào tài khoản của kẻ xấu) bị chặn: trình duyệt luôn gửi
 * Origin với POST, nên Origin phải trùng trang này.
 */
export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && origin === request.nextUrl.origin;
}

/** Chuỗi trong form; thiếu hoặc không phải chuỗi thì là chuỗi rỗng. */
export function formText(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export { newGuestId };

/** Phụ thuộc của Trận Đồ xếp hạng: server là nơi duy nhất đọc giờ và giữ khóa bí mật sinh seed. */
export function formationDeps(): FormationDeps {
  return {
    store: formationStore(),
    profiles: profileStore(),
    now: Date.now(),
    secret: process.env.SESSION_SECRET,
    enabled: formationRankedEnabled(),
    newId: () => `f_${randomUUID()}`,
    isSignedIn: isSignedInAccount,
  };
}

/** Phụ thuộc của thưởng hạng theo kỳ. Tháp Thiên Mệnh chỉ có nguồn khi cờ Destiny bật. */
export function rankRewardDeps(): RankRewardDeps {
  const features = towerFeatureFlags();
  return {
    sources: [
      dailySource(dailyStoreOf()),
      ...(features.destiny ? [destinySource(destinyBoardOf())] : []),
      seasonSource("survival", seasonStore()),
      seasonSource("arena", seasonStore()),
    ],
    claims: rankRewardStore(),
    profiles: profileStore(),
    now: Date.now(),
    isSignedIn: isSignedInAccount,
  };
}
