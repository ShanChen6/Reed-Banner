// GET /api/arena: điểm, thành tích, đội phòng thủ và các đối thủ đang bày của người chơi hiện tại.
// POST /api/arena `{ action: "defend" | "refresh" }`: đặt đội 3vs3 đang chọn làm đội phòng thủ, hoặc đổi đối thủ.
// POST /api/arena `{ action: "claimTier", tier }`: nhận thưởng vàng một bậc hạng (mỗi bậc một lần), trả view mới kèm
// `claimed: { tier, gold, item, soldFor }` (món trang bị thưởng; túi đầy thì item null và đã bán) hoặc `claimError`.
// POST /api/arena `{ action: "claimTierGear", tier }`: nhận bù món trang bị của bậc đã nhận vàng trước khi có thưởng
// trang bị; trả view kèm `claimed: { tier, gold: 0, item, soldFor }` hoặc `claimError`.
// Lần đầu mở thì tạo khách (nếu chưa có), đặt đội phòng thủ và bày đối thủ.

import { randomInt } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { arenaView, claimArenaTierGearReward, claimArenaTierReward, type ArenaCommand } from "@/server/arena";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson } from "@/server/http";
import { arenaStore, leaderboardStore, profileStore } from "@/server/store";

async function handle(request: NextRequest, command: ArenaCommand, tier?: string, gearOnly = false) {
  const existing = guestOf(request);
  // Quần Hùng là chế độ online có bảng xếp hạng và thưởng: khách không vào (không tạo khách mới ở đây).
  if (!existing || !(await isSignedInAccount(existing))) return loginRequiredResponse();
  const owner = existing;
  const deps = {
    arena: arenaStore(),
    profiles: profileStore(),
    leaderboard: leaderboardStore(),
    now: Date.now(),
    seed: randomInt(0, 2 ** 31),
  };
  const claim =
    tier === undefined
      ? null
      : gearOnly
        ? await claimArenaTierGearReward(owner, tier, deps).then((c) => (c.ok ? { ...c, gold: 0 } : c))
        : await claimArenaTierReward(owner, tier, deps);
  const view = await arenaView(owner, command, deps);
  const body = claim === null ? view : claim.ok ? { ...view, claimed: { tier, gold: claim.gold, item: claim.item, soldFor: claim.soldFor } } : { ...view, claimError: claim.error };
  return NextResponse.json(body, { headers: { "cache-control": "no-store" } });
}

export function GET(request: NextRequest) {
  return handle(request, "view");
}

export async function POST(request: NextRequest) {
  const body = (await readJson(request)) as { action?: unknown; tier?: unknown } | null;
  if (body?.action === "claimTier" || body?.action === "claimTierGear") {
    if (typeof body.tier !== "string" || body.tier.length > 20) return NextResponse.json({ error: "badRequest" }, { status: 400 });
    return handle(request, "view", body.tier, body.action === "claimTierGear");
  }
  if (body?.action !== "defend" && body?.action !== "refresh")
    return NextResponse.json({ error: "badRequest" }, { status: 400 });
  return handle(request, body.action);
}
