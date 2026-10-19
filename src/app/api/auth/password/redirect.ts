// Quay về trang /dang-nhap kèm mã lỗi để form hiện lại đúng chỗ (giữ tên đăng nhập đã nhập, không giữ mật khẩu).

import { NextResponse, type NextRequest } from "next/server";
import type { PasswordError } from "@/server/password";

export function loginPageError(
  request: NextRequest,
  form: "dang-ky" | "mat-khau" | "doi-mat-khau",
  error: PasswordError,
  username = "",
  returnTo = "/play",
): NextResponse {
  const url = new URL("/dang-nhap", request.nextUrl.origin);
  url.searchParams.set("cach", form);
  url.searchParams.set("loi", error);
  if (username) url.searchParams.set("u", username.slice(0, 40));
  if (returnTo !== "/play") url.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(url, 303);
}
