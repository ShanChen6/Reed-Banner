// GET /api/pvp/board: bảng mùa tuần này của Đấu người (tổng điểm hạng nhận được trong tuần, top 50 và hạng của người xem).
// Chỉ tài khoản đăng nhập và chỉ khi bật cờ PVP_ENABLED.

import { NextResponse, type NextRequest } from "next/server";
import { seasonKey } from "@/core";
import { pvpEnabled } from "@/server/featureFlags";
import { guestOf, isSignedInAccount, loginRequiredResponse } from "@/server/http";
import { seasonBoardView } from "@/server/seasons";
import { seasonStore } from "@/server/store";

export async function GET(request: NextRequest) {
  if (!pvpEnabled()) return NextResponse.json({ error: "featureDisabled" }, { status: 503, headers: { "cache-control": "no-store" } });
  const owner = guestOf(request);
  if (!owner || !(await isSignedInAccount(owner))) return loginRequiredResponse();
  return NextResponse.json(await seasonBoardView(seasonStore(), "pvp", seasonKey(Date.now()), owner), { headers: { "cache-control": "no-store" } });
}
