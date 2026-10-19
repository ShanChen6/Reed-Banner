// POST /api/auth/logout: đăng xuất (xóa cookie tài khoản). Lần chơi sau là một khách mới; đăng nhập lại
// thì vào lại đúng tài khoản cũ.

import { NextResponse, type NextRequest } from "next/server";
import { GUEST_COOKIE } from "@/server/guest";
import { safeReturnTo } from "@/server/oauth";

export async function POST(request: NextRequest) {
  // 303 để trình duyệt chuyển sang GET sau khi gửi form.
  const res = NextResponse.redirect(new URL(safeReturnTo(request.nextUrl.searchParams.get("returnTo")), request.nextUrl.origin), 303);
  res.cookies.set(GUEST_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
