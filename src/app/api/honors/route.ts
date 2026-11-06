// GET /api/honors: Công Trạng của người chơi, gồm các kỳ đã nhận thưởng hạng ở mọi chế độ có xếp hạng, mới nhất trước.
// Khách nhận danh sách rỗng và `signedIn` false.

import { NextResponse, type NextRequest } from "next/server";
import { honorsOf } from "@/server/honors";
import { guestOf, honorsDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  const honors = await honorsOf(honorsDeps(), guestOf(request));
  return NextResponse.json(honors, { headers: { "cache-control": "no-store" } });
}
