// GET /api/leaderboard?board=campaign|tower|survival|arena|mission:<M..>: top 50 và hạng của người đang xem.

import { NextResponse, type NextRequest } from "next/server";
import { isBoardId } from "@/core";
import { guestOf } from "@/server/http";
import { boardView, submitProfile } from "@/server/leaderboard";
import { loadProfile } from "@/server/profiles";
import { leaderboardStore, profileStore } from "@/server/store";

export async function GET(request: NextRequest) {
  const board = request.nextUrl.searchParams.get("board") ?? "campaign";
  if (!isBoardId(board))
    return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const owner = guestOf(request);
  const store = leaderboardStore();
  // Người chơi có thành tích từ trước khi có bảng xếp hạng: ghi điểm của chính mình khi mở bảng.
  if (owner) {
    const { profile, version } = await loadProfile(profileStore(), owner);
    if (version > 0) await submitProfile(store, owner, profile, Date.now());
  }
  return NextResponse.json(await boardView(store, board, owner), {
    headers: { "cache-control": "no-store" },
  });
}
