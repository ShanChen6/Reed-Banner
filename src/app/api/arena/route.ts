// GET /api/arena: điểm, thành tích, đội phòng thủ và các đối thủ đang bày của người chơi hiện tại.
// POST /api/arena `{ action: "defend" | "refresh" }`: đặt đội 3vs3 đang chọn làm đội phòng thủ, hoặc đổi đối thủ.
// Lần đầu mở thì tạo khách (nếu chưa có), đặt đội phòng thủ và bày đối thủ.

import { randomInt } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { arenaView, type ArenaCommand } from "@/server/arena";
import { guestOf, isSignedInAccount, loginRequiredResponse, readJson } from "@/server/http";
import { arenaStore, leaderboardStore, profileStore } from "@/server/store";

async function handle(request: NextRequest, command: ArenaCommand) {
  const existing = guestOf(request);
  // Quần Hùng là chế độ online có bảng xếp hạng và thưởng: khách không vào (không tạo khách mới ở đây).
  if (!existing || !(await isSignedInAccount(existing))) return loginRequiredResponse();
  const owner = existing;
  const view = await arenaView(owner, command, {
    arena: arenaStore(),
    profiles: profileStore(),
    leaderboard: leaderboardStore(),
    now: Date.now(),
    seed: randomInt(0, 2 ** 31),
  });
  const res = NextResponse.json(view, { headers: { "cache-control": "no-store" } });
  return res;
}

export function GET(request: NextRequest) {
  return handle(request, "view");
}

export async function POST(request: NextRequest) {
  const body = (await readJson(request)) as { action?: unknown } | null;
  if (body?.action !== "defend" && body?.action !== "refresh")
    return NextResponse.json({ error: "badRequest" }, { status: 400 });
  return handle(request, body.action);
}
