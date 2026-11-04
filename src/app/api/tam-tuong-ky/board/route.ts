// GET /api/tam-tuong-ky/board[?week=current|<thứ Hai YYYY-MM-DD>]: bảng tuần chế độ Hạng Tầm Tướng Ký (top 50, hạng của mình)
// cho trang Xếp hạng. Cần cờ Hạng và tài khoản đã đăng nhập.

import { NextResponse, type NextRequest } from "next/server";
import { isSeasonKey } from "@/core";
import { tamTuongKyBoard, ttkHttpStatus } from "@/server/tamTuongKy";
import { guestOf, tamTuongKyDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get("week");
  if (week !== null && week !== "current" && !isSeasonKey(week)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const r = await tamTuongKyBoard(tamTuongKyDeps(), guestOf(request), week === null || week === "current" ? undefined : week);
  const headers = { "cache-control": "no-store" };
  return r.ok ? NextResponse.json(r, { headers }) : NextResponse.json({ error: r.error }, { status: ttkHttpStatus(r.error), headers });
}
