// GET /api/trial: tổng quan Tháp Thí Luyện (tầng công khai, trạng thái khóa/mở, kỷ lục, đá). Không tạo khách.

import { NextResponse, type NextRequest } from "next/server";
import { guestOf, serverDeps } from "@/server/http";
import { trialOverview, trialRegistry } from "@/server/trialApi";

export async function GET(request: NextRequest) {
  const overview = await trialOverview(serverDeps().profiles, guestOf(request), trialRegistry());
  return NextResponse.json(overview, { headers: { "cache-control": "no-store" } });
}
