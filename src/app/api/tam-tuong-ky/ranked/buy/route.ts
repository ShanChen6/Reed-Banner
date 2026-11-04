// POST /api/tam-tuong-ky/ranked/buy {requestId}: mua một bó nguyên tố (300 vàng, tối đa 2 bó mỗi tuần).

import { NextResponse, type NextRequest } from "next/server";
import { buyTamTuongKyBundle } from "@/server/tamTuongKy";
import { guestOf, readJson, respondTamTuongKy, sameOrigin, tamTuongKyDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const body = (await readJson(request)) as { requestId?: unknown } | null;
  return respondTamTuongKy(await buyTamTuongKyBundle(tamTuongKyDeps(), guestOf(request), body?.requestId));
}
