// POST /api/auth/password/forgot (form): quên mật khẩu, nhập tên đăng nhập hoặc email. Luôn quay về cùng một
// thông báo "nếu đúng thì đã gửi thư", có thư hay không cũng vậy.

import { NextResponse, type NextRequest } from "next/server";
import { formText, sameOrigin } from "@/server/http";
import { mailEnabled } from "@/server/mail";
import { requestPasswordReset } from "@/server/recovery";
import { accountStore } from "@/server/store";
import { sendLater } from "../redirect";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const origin = request.nextUrl.origin;
  if (sameOrigin(request) && mailEnabled()) {
    sendLater(await requestPasswordReset(accountStore(), formText(form, "login").slice(0, 300), Date.now(), origin));
  }
  return NextResponse.redirect(new URL("/game/forgot-password?sent=1", origin), 303);
}
