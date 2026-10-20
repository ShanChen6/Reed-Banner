// POST /api/auth/email (form): thêm hoặc đổi email của tài khoản đang đăng nhập; gửi thư xác nhận tới email đó.

import { NextResponse, type NextRequest } from "next/server";
import { formText, guestOf, sameOrigin } from "@/server/http";
import { mailEnabled } from "@/server/mail";
import { requestEmailVerify } from "@/server/recovery";
import { accountStore } from "@/server/store";
import { sendLater } from "../password/redirect";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const origin = request.nextUrl.origin;
  const id = guestOf(request);
  const url = new URL("/game/account", origin);
  const r =
    sameOrigin(request) && id && mailEnabled()
      ? await requestEmailVerify(accountStore(), id, formText(form, "email"), Date.now(), origin)
      : ({ ok: false, error: "noPassword" } as const);
  if (r.ok) {
    sendLater(r.mail);
    url.searchParams.set("emailSent", "1");
  } else {
    url.searchParams.set("emailError", r.error);
  }
  return NextResponse.redirect(url, 303);
}
