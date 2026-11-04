// GET /api/expedition: ba sa bàn, bậc đã mở, sao, lượt viễn chinh đang đi và đối thủ của các ô còn địch.
import { NextResponse, type NextRequest } from "next/server";
import { expeditionOverview } from "@/server/expedition";
import { guestOf, serverDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  return NextResponse.json(await expeditionOverview(guestOf(request), serverDeps()), {
    headers: { "cache-control": "no-store" },
  });
}
