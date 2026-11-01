// GET /api/rank-rewards: thưởng hạng theo kỳ đang chờ nhận (Nhật Lệnh, Tháp Thiên Mệnh). Khách nhận danh sách rỗng.

import { NextResponse, type NextRequest } from "next/server";
import { guestOf, rankRewardDeps } from "@/server/http";
import { pendingRankRewards } from "@/server/rankRewards";

export async function GET(request: NextRequest) {
  const deps = rankRewardDeps();
  const pending = await pendingRankRewards(deps, guestOf(request));
  return NextResponse.json({ ...pending, now: deps.now }, { headers: { "cache-control": "no-store" } });
}
