// GET /api/profile: hồ sơ tiến trình của người chơi hiện tại (chưa có thì là hồ sơ mới).
// POST /api/profile `{ action }`: nâng kỹ năng, mua nhân vật, trang bị…; server tự kiểm tra luật.

import { NextResponse, type NextRequest } from "next/server";
import { applyProfileAction, newProfile, parseProfileAction } from "@/core";
import { guestOf, newGuestId, readJson, setAccountCookie } from "@/server/http";
import { loadProfile, updateProfile } from "@/server/profiles";
import { profileStore } from "@/server/store";

export async function GET(request: NextRequest) {
  const owner = guestOf(request);
  const stored = owner ? await loadProfile(profileStore(), owner) : { profile: newProfile(), version: 0 };
  return NextResponse.json(stored, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = (await readJson(request)) as { action?: unknown } | null;
  const action = parseProfileAction(body?.action);
  if (!action) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const existing = guestOf(request);
  const owner = existing ?? newGuestId();
  const r = await updateProfile(profileStore(), owner, (p) => applyProfileAction(p, action, Date.now()), Date.now());
  const res = r.ok
    ? NextResponse.json(r.stored)
    : NextResponse.json({ error: r.error, ...(await loadProfile(profileStore(), owner)) }, { status: r.error === "conflict" ? 409 : 422 });
  if (!existing) setAccountCookie(res, owner);
  return res;
}
