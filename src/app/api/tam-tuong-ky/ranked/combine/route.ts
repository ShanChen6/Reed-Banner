// POST /api/tam-tuong-ky/ranked/combine {requestId, first, second}: ghép chế độ Hạng (tiêu nguyên liệu, kể cả ghép sai).

import { NextResponse, type NextRequest } from "next/server";
import { combineTamTuongKyRanked } from "@/server/tamTuongKy";
import { guestOf, readJson, respondTamTuongKy, sameOrigin, tamTuongKyDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const body = (await readJson(request)) as { requestId?: unknown; first?: unknown; second?: unknown } | null;
  return respondTamTuongKy(await combineTamTuongKyRanked(tamTuongKyDeps(), guestOf(request), body?.requestId, body?.first, body?.second));
}
