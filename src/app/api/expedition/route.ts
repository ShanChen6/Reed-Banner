// GET /api/expedition: ba sa bàn, bậc đã mở, sao, lượt xuất quân còn trong ngày, lượt viễn chinh đang đi và đối thủ
// của các ô còn địch. Viễn Chinh có bảng xếp hạng nên khách không xem (401), như Quần Hùng.
import { NextResponse, type NextRequest } from "next/server";
import { expeditionOverview } from "@/server/expedition";
import { guestOf, isSignedInAccount, loginRequiredResponse, serverDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  const owner = guestOf(request);
  if (!owner || !(await isSignedInAccount(owner))) return loginRequiredResponse();
  return NextResponse.json(await expeditionOverview(owner, serverDeps()), {
    headers: { "cache-control": "no-store" },
  });
}
