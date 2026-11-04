// GET /api/tam-tuong-ky/ranked: tuần Hạng hiện tại (túi, kho tuần, ô đề cử chỉ có lời dẫn, điểm, bảng tuần).

import type { NextRequest } from "next/server";
import { getTamTuongKyRanked } from "@/server/tamTuongKy";
import { guestOf, respondTamTuongKy, tamTuongKyDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  return respondTamTuongKy(await getTamTuongKyRanked(tamTuongKyDeps(), guestOf(request)));
}
