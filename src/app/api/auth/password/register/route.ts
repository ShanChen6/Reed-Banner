// POST /api/auth/password/register (form): đăng ký tên đăng nhập + mật khẩu, gắn vào tài khoản đang dùng.
// Có email (tùy chọn) thì gửi thư xác nhận email đó sau khi đăng ký.

import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { formText, guestOf, LOGIN_MAX_AGE, sameOrigin, setAccountCookie } from "@/server/http";
import { mailEnabled } from "@/server/mail";
import { safeReturnTo } from "@/server/oauth";
import { register } from "@/server/password";
import { normalizeEmail, requestEmailVerify } from "@/server/recovery";
import { accountStore } from "@/server/store";
import { formError, sendLater } from "../redirect";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const returnTo = safeReturnTo(formText(form, "returnTo"));
  const username = formText(form, "username");
  const email = mailEnabled() ? formText(form, "email").trim() : "";
  // Đang đăng nhập thì form nằm ở /account (thêm tên đăng nhập vào tài khoản), còn lại ở /register.
  const id = guestOf(request);
  const page = id && (await accountStore().get(id)) ? "/game/account" : "/game/register";
  if (!sameOrigin(request)) return formError(request, page, "wrong", username, returnTo);
  if (email && !normalizeEmail(email)) return formError(request, page, "badEmail", username, returnTo);
  const r = await register(
    accountStore(),
    { username, password: formText(form, "password"), confirm: formText(form, "confirm") },
    id,
    Date.now(),
    () => `g_${randomUUID()}`,
  );
  if (!r.ok) return formError(request, page, r.error, username, returnTo);
  let target = new URL(returnTo, request.nextUrl.origin);
  if (email) {
    const v = await requestEmailVerify(accountStore(), r.accountId, email, Date.now(), request.nextUrl.origin);
    if (v.ok) {
      sendLater(v.mail);
      // Qua trang Tài khoản để báo "đã gửi thư xác nhận"; nút Vào chơi ở đó vẫn về `returnTo`.
      target = new URL("/game/account?emailSent=1", request.nextUrl.origin);
      if (returnTo !== "/game") target.searchParams.set("returnTo", returnTo);
    }
  }
  const res = NextResponse.redirect(target, 303);
  setAccountCookie(res, r.accountId, LOGIN_MAX_AGE);
  return res;
}
