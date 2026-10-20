// POST /api/auth/password/reset (form): đặt mật khẩu mới bằng mã trong thư, rồi đăng nhập luôn vào tài khoản.

import { NextResponse, type NextRequest } from "next/server";
import { formText, LOGIN_MAX_AGE, sameOrigin, setAccountCookie } from "@/server/http";
import { RESET_PATH, resetPassword } from "@/server/recovery";
import { accountStore } from "@/server/store";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = formText(form, "token");
  const r = sameOrigin(request)
    ? await resetPassword(accountStore(), { token, password: formText(form, "password"), confirm: formText(form, "confirm") }, Date.now())
    : ({ ok: false, error: "badToken" } as const);
  if (!r.ok) {
    // Giữ mã trên đường dẫn để nhập lại mật khẩu (mã chỉ bị dùng khi mật khẩu mới hợp lệ).
    const url = new URL(RESET_PATH, request.nextUrl.origin);
    if (r.error !== "badToken") url.searchParams.set("token", token.slice(0, 100));
    url.searchParams.set("error", r.error);
    return NextResponse.redirect(url, 303);
  }
  const res = NextResponse.redirect(new URL("/game/account?passwordReset=1", request.nextUrl.origin), 303);
  setAccountCookie(res, r.accountId, LOGIN_MAX_AGE);
  return res;
}
