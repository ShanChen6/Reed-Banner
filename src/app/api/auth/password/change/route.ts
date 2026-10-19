// POST /api/auth/password/change (form): đổi mật khẩu của tài khoản đang đăng nhập.

import { NextResponse, type NextRequest } from "next/server";
import { formText, guestOf, sameOrigin } from "@/server/http";
import { changePassword } from "@/server/password";
import { accountStore } from "@/server/store";
import { formError } from "../redirect";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const id = guestOf(request);
  if (!sameOrigin(request) || !id) return formError(request, "/account", "noPassword");
  const r = await changePassword(
    accountStore(),
    id,
    { current: formText(form, "current"), password: formText(form, "password"), confirm: formText(form, "confirm") },
    Date.now(),
  );
  if (!r.ok) return formError(request, "/account", r.error);
  return NextResponse.redirect(new URL("/account?passwordChanged=1", request.nextUrl.origin), 303);
}
