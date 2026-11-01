// GET /api/daily: đề thử thách của hôm nay (đội, đối thủ), lượt của người đang xem và bảng xếp hạng.

import { NextResponse, type NextRequest } from "next/server";
import { dailyKey, dailySetup } from "@/core";
import { dailyBoard, dailySeed } from "@/server/daily";
import { guestOf, isSignedInAccount, loginRequiredResponse } from "@/server/http";
import { dailyStore } from "@/server/store";

export async function GET(request: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const viewer = guestOf(request);
  // Nhật Lệnh có bảng xếp hạng và thưởng: khách không xem đề và bảng.
  if (!viewer || !(await isSignedInAccount(viewer))) return loginRequiredResponse();
  const now = Date.now();
  const day = dailyKey(now);
  const setup = dailySetup(dailySeed(secret, day));
  const board = await dailyBoard(dailyStore(), day, viewer);
  return NextResponse.json(
    {
      ...board,
      // Chỉ phần người chơi cần xem trước; seed không rời server.
      setup: { team: setup.team, foes: setup.foes, warlord: setup.warlord, difficulty: setup.difficulty },
      now,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
