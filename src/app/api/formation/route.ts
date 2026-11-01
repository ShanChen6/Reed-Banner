// GET /api/formation: tổng quan Trận Đồ xếp hạng (kỳ hiện tại, ván của người xem, bảng, thưởng chờ nhận). Không tạo khách.

import { NextResponse, type NextRequest } from "next/server";
import { formationOverview } from "@/server/formation";
import { formationDeps, guestOf } from "@/server/http";

export async function GET(request: NextRequest) {
  const deps = formationDeps();
  const overview = await formationOverview(deps, guestOf(request));
  return NextResponse.json({ ...overview, now: deps.now }, { headers: { "cache-control": "no-store" } });
}
