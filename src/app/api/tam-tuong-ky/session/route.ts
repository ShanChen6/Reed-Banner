// POST /api/tam-tuong-ky/session {requestId}: mở lượt chơi Thường (trừ 1 phiếu, trừ khi đang có lượt dở).

import { NextResponse, type NextRequest } from "next/server";
import { openTamTuongKySession } from "@/server/tamTuongKy";
import { guestOf, readJson, respondTamTuongKy, sameOrigin, tamTuongKyDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const body = (await readJson(request)) as { requestId?: unknown } | null;
  return respondTamTuongKy(await openTamTuongKySession(tamTuongKyDeps(), guestOf(request), body?.requestId));
}
