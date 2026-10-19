// Quay về trang /login kèm mã lỗi để form hiện lại đúng chỗ (giữ tên đăng nhập đã nhập, không giữ mật khẩu).

import { NextResponse, type NextRequest } from "next/server";
import type { PasswordError } from "@/server/password";

export function loginPageError(
  request: NextRequest,
  form: "register" | "password" | "change-password",
  error: PasswordError,
  username = "",
  returnTo = "/play",
): NextResponse {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("form", form);
  url.searchParams.set("error", error);
  if (username) url.searchParams.set("username", username.slice(0, 40));
  if (returnTo !== "/play") url.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(url, 303);
}
