// POST /api/auth/password/register (form): đăng ký tên đăng nhập + mật khẩu, gắn vào tài khoản đang dùng.

import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { formText, guestOf, LOGIN_MAX_AGE, sameOrigin, setAccountCookie } from "@/server/http";
import { safeReturnTo } from "@/server/oauth";
import { register } from "@/server/password";
import { accountStore } from "@/server/store";
import { formError } from "../redirect";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const returnTo = safeReturnTo(formText(form, "returnTo"));
  const username = formText(form, "username");
  // Đang đăng nhập thì form nằm ở /account (thêm tên đăng nhập vào tài khoản), còn lại ở /register.
  const id = guestOf(request);
  const page = id && (await accountStore().get(id)) ? "/account" : "/register";
  if (!sameOrigin(request)) return formError(request, page, "wrong", username, returnTo);
  const r = await register(
    accountStore(),
    { username, password: formText(form, "password"), confirm: formText(form, "confirm") },
    id,
    Date.now(),
    () => `g_${randomUUID()}`,
  );
  if (!r.ok) return formError(request, page, r.error, username, returnTo);
  const res = NextResponse.redirect(new URL(returnTo, request.nextUrl.origin), 303);
  setAccountCookie(res, r.accountId, LOGIN_MAX_AGE);
  return res;
}
