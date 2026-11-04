// POST /api/tam-tuong-ky/combine {requestId, first, second}: ghép ô trước + ô sau trong lượt đang mở.

import { NextResponse, type NextRequest } from "next/server";
import { combineTamTuongKy } from "@/server/tamTuongKy";
import { guestOf, readJson, respondTamTuongKy, sameOrigin, tamTuongKyDeps } from "@/server/http";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "badRequest" }, { status: 400 });
  const body = (await readJson(request)) as { requestId?: unknown; first?: unknown; second?: unknown } | null;
  return respondTamTuongKy(await combineTamTuongKy(tamTuongKyDeps(), guestOf(request), body?.requestId, body?.first, body?.second));
}
