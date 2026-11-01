// POST /api/rank-rewards/claim {mode, period}: nhận thưởng vàng theo hạng của một kỳ đã khép. Chỉ tài khoản đã đăng nhập.

import { NextResponse, type NextRequest } from "next/server";
import { guestOf, rankRewardDeps, readJson, sameOrigin } from "@/server/http";
import { claimRankReward, rankRewardHttpStatus } from "@/server/rankRewards";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const owner = guestOf(request);
  if (!owner) return NextResponse.json({ error: "loginRequired" }, { status: 401 });
  const body = (await readJson(request)) as { mode?: unknown; period?: unknown } | null;
  const result = await claimRankReward(rankRewardDeps(), owner, body?.mode, body?.period);
  return result.ok
    ? NextResponse.json(result, { headers: { "cache-control": "no-store" } })
    : NextResponse.json({ error: result.error }, { status: rankRewardHttpStatus(result.error) });
}
