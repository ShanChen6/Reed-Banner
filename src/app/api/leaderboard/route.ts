// GET /api/leaderboard?board=survival|arena[&season=current|<thứ Hai YYYY-MM-DD>]: top 50 và hạng của người đang xem. Có `season`
// thì là bảng mùa theo tuần của Trấn Ải hoặc Quần Hùng (Shan, 01/11/2026); không có thì bảng mọi thời đại.

import { NextResponse, type NextRequest } from "next/server";
import { isBoardId, isSeasonKey, isSeasonMode, seasonKey } from "@/core";
import { guestOf, isSignedInAccount, loginRequiredResponse } from "@/server/http";
import { boardView, submitProfile } from "@/server/leaderboard";
import { loadProfile } from "@/server/profiles";
import { seasonBoardView } from "@/server/seasons";
import { leaderboardStore, profileStore, seasonStore } from "@/server/store";

export async function GET(request: NextRequest) {
  const board = request.nextUrl.searchParams.get("board") ?? "campaign";
  if (!isBoardId(board))
    return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const owner = guestOf(request);
  // Bảng xếp hạng của chế độ online có thưởng: khách không xem (Shan, 01/11/2026).
  if (!owner || !(await isSignedInAccount(owner))) return loginRequiredResponse();
  const season = request.nextUrl.searchParams.get("season");
  if (season !== null) {
    const key = season === "current" ? seasonKey(Date.now()) : season;
    if (!isSeasonMode(board) || !isSeasonKey(key)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
    return NextResponse.json(await seasonBoardView(seasonStore(), board, key, owner), { headers: { "cache-control": "no-store" } });
  }
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
