// GET /api/tiers: trang Thưởng Bậc, trả `{ ladders }` gồm mọi dải bậc của các chế độ xếp hạng đang bật (Quần Hùng,
// Đấu người, Trấn Ải, Trận Đồ, Nhật Lệnh, Tháp Thiên Mệnh, Tầm Tướng Ký) với thước đo hiện tại và các bậc đã nhận.
// POST /api/tiers `{ mode, tier }`: nhận thưởng một bậc của dải `mode`; mỗi bậc một lần. Trả
// `{ claimed: { tier, gold, item, soldFor }, profile, ladders }` hoặc `{ error, profile, ladders }`.
// Chế độ xếp hạng: chỉ tài khoản đăng nhập.

import { NextResponse, type NextRequest } from "next/server";
import { formationRankedEnabled, pvpEnabled, tamTuongKyEnabled, towerFeatureFlags } from "@/server/featureFlags";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson, sameOrigin } from "@/server/http";
import { loadProfile } from "@/server/profiles";
import { arenaStore, profileStore, pvpStore } from "@/server/store";
import { claimHubTier, isTierHubId, tierOverview, type TierHubDeps } from "@/server/tierHub";

const noStore = { "cache-control": "no-store" };

function hubDeps(): TierHubDeps {
  return {
    profiles: profileStore(),
    arena: arenaStore(),
    pvp: pvpEnabled() ? pvpStore() : undefined,
    now: Date.now(),
    enabled: { formation: formationRankedEnabled(), destiny: towerFeatureFlags().destiny, tamTuongKy: tamTuongKyEnabled() },
  };
}

async function signedIn(request: NextRequest): Promise<string | null> {
  const owner = guestOf(request);
  return owner && (await isSignedInAccount(owner)) ? owner : null;
}

export async function GET(request: NextRequest) {
  const owner = await signedIn(request);
  if (!owner) return loginRequiredResponse();
  return NextResponse.json({ ladders: await tierOverview(owner, hubDeps()) }, { headers: noStore });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 403, headers: noStore });
  const owner = await signedIn(request);
  if (!owner) return loginRequiredResponse();
  const body = (await readJson(request)) as { mode?: unknown; tier?: unknown } | null;
  if (!isTierHubId(body?.mode) || typeof body.tier !== "string" || body.tier.length > 20)
    return NextResponse.json({ error: "badRequest" }, { status: 400, headers: noStore });
  const deps = hubDeps();
  const r = await claimHubTier(owner, body.mode, body.tier, deps);
  const [{ profile }, ladders] = await Promise.all([loadProfile(deps.profiles, owner), tierOverview(owner, deps)]);
  return r.ok
    ? NextResponse.json({ claimed: { tier: body.tier, gold: r.gold, item: r.item, soldFor: r.soldFor }, profile, ladders }, { headers: noStore })
    : NextResponse.json({ error: r.error, profile, ladders }, { status: 422, headers: noStore });
}
