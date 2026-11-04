// POST /api/tam-tuong-ky/hint {requestId, level}: gợi ý mức 1 hoặc 2, tối đa 2 lượt mỗi ngày (giờ Việt Nam).

import { NextResponse, type NextRequest } from "next/server";
import { hintTamTuongKy } from "@/server/tamTuongKy";
import { guestOf, readJson, respondTamTuongKy, sameOrigin, tamTuongKyDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const body = (await readJson(request)) as { requestId?: unknown; level?: unknown } | null;
  return respondTamTuongKy(await hintTamTuongKy(tamTuongKyDeps(), guestOf(request), body?.requestId, body?.level));
}
