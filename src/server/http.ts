// Phần dùng chung của route handler trận online: xác định khách qua cookie, trả JSON.

import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { httpStatus, type Deps, type ServiceResult } from "./battles";
import { GUEST_COOKIE, newGuestId, signGuest, verifyGuest } from "./guest";
import { matchStore } from "./store";

/** Cookie khách sống 30 ngày, khớp với hạn xóa tài khoản khách không hoạt động. */
const GUEST_MAX_AGE = 30 * 24 * 60 * 60;

export function guestOf(request: NextRequest): string | null {
  return verifyGuest(request.cookies.get(GUEST_COOKIE)?.value);
}

export function serverDeps(): Deps {
  return {
    store: matchStore(),
    // Server là nơi duy nhất được đọc giờ và bốc seed thật.
    now: Date.now(),
    seed: randomInt(0, 2 ** 32),
    newId: () => `m_${randomUUID()}`,
  };
}

export function respond(result: ServiceResult, newGuest?: string): NextResponse {
  const res = result.ok
    ? NextResponse.json({ id: result.id, view: result.view, events: result.events })
    : NextResponse.json({ error: result.error, view: result.view }, { status: httpStatus(result.error) });
  if (newGuest) {
    res.cookies.set(GUEST_COOKIE, signGuest(newGuest), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: GUEST_MAX_AGE,
    });
  }
  return res;
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export { newGuestId };
