// GET /api/tam-tuong-ky: phiếu, lượt đang mở, gợi ý còn lại hôm nay và sổ khám phá của tài khoản đã đăng nhập.

import type { NextRequest } from "next/server";
import { getTamTuongKy } from "@/server/tamTuongKy";
import { guestOf, respondTamTuongKy, tamTuongKyDeps } from "@/server/http";

export async function GET(request: NextRequest) {
  return respondTamTuongKy(await getTamTuongKy(tamTuongKyDeps(), guestOf(request)));
}
