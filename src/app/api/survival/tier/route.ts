// POST /api/survival/tier `{ tier }`: nhận thưởng một bậc Trấn Ải theo kỷ lục số đợt (mỗi bậc một lần). Trả
// `{ claimed: { tier, gold, item, soldFor }, profile }` hoặc `{ error }`. Trấn Ải là chế độ có xếp hạng: chỉ tài khoản đăng nhập.

import { NextResponse, type NextRequest } from "next/server";
import { claimSurvivalTierReward } from "@/server/arena";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { loadProfile } from "@/server/profiles";
import { profileStore } from "@/server/store";

const noStore = { "cache-control": "no-store" };

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const owner = guestOf(request);
  if (!owner || !(await isSignedInAccount(owner))) return loginRequiredResponse();
  const body = (await readJson(request)) as { tier?: unknown } | null;
  if (typeof body?.tier !== "string" || body.tier.length > 20) return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  const profiles = profileStore();
  const r = await claimSurvivalTierReward(owner, body.tier, { profiles, now: Date.now() });
  const { profile } = await loadProfile(profiles, owner);
  return r.ok
    ? NextResponse.json({ claimed: { tier: body.tier, gold: r.gold, item: r.item, soldFor: r.soldFor }, profile }, { headers: noStore })
    : NextResponse.json({ error: r.error, profile }, { status: 422, headers: noStore });
}
