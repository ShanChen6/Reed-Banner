// GET /api/expedition: sáu sa bàn, bậc đã mở, sao, lượt xuất quân còn trong ngày, lượt viễn chinh đang đi và đối thủ
// của các ô còn địch đang thấy. Chế độ offline (Shan 04/11/2026): khách xem và chơi được, không có bảng xếp hạng.
import { NextResponse, type NextRequest } from "next/server";
import { expeditionOverview } from "@/server/expedition";
import { guestOf, serverDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  return NextResponse.json(await expeditionOverview(guestOf(request), serverDeps()), {
    headers: { "cache-control": "no-store" },
  });
}
