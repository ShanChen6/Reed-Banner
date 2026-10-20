// Quay về trang đã gửi form kèm mã lỗi để form hiện lại (giữ tên đăng nhập đã nhập, không giữ mật khẩu).

import { NextResponse, type NextRequest } from "next/server";
import type { PasswordError } from "@/server/password";

export function formError(
  request: NextRequest,
  page: "/game/login" | "/game/register" | "/game/account",
  error: PasswordError,
  username = "",
  returnTo = "/game",
): NextResponse {
  const url = new URL(page, request.nextUrl.origin);
  url.searchParams.set("error", error);
  if (username) url.searchParams.set("username", username.slice(0, 40));
  if (returnTo !== "/game" && returnTo !== page) url.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(url, 303);
}
