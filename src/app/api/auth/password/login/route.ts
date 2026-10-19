// POST /api/auth/password/login (form): đăng nhập bằng tên đăng nhập + mật khẩu.

import { NextResponse, type NextRequest } from "next/server";
import { formText, LOGIN_MAX_AGE, sameOrigin, setAccountCookie } from "@/server/http";
import { safeReturnTo } from "@/server/oauth";
import { login } from "@/server/password";
import { accountStore } from "@/server/store";
import { loginPageError } from "../redirect";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const returnTo = safeReturnTo(formText(form, "returnTo"));
  const username = formText(form, "username");
  if (!sameOrigin(request)) return loginPageError(request, "mat-khau", "wrong", username, returnTo);
  const r = await login(accountStore(), { username, password: formText(form, "password") }, Date.now());
  if (!r.ok) return loginPageError(request, "mat-khau", r.error, username, returnTo);
  const res = NextResponse.redirect(new URL(returnTo, request.nextUrl.origin), 303);
  setAccountCookie(res, r.accountId, LOGIN_MAX_AGE);
  return res;
}
