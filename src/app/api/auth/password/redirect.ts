// Quay về trang đã gửi form kèm mã lỗi để form hiện lại (giữ tên đăng nhập đã nhập, không giữ mật khẩu).

import { after, NextResponse, type NextRequest } from "next/server";
import { sendMail, type Mail } from "@/server/mail";
import type { PasswordError } from "@/server/password";

export function formError(
  request: NextRequest,
  page: "/game/login" | "/game/register" | "/game/account" | "/game/forgot-password",
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

/**
 * Gửi thư sau khi đã trả lời người dùng: thời gian trả lời như nhau dù có thư hay không, và lỗi máy chủ thư
 * không làm hỏng form (chỉ ghi log).
 */
export function sendLater(mail: Mail | null): void {
  if (!mail) return;
  after(() => sendMail(mail).catch((err: unknown) => console.error("[mail] Gửi thư không được:", err)));
}
