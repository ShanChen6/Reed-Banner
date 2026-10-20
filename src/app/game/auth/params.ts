// Đọc tham số chung của các phân cảnh tài khoản: mã lỗi form, tên đăng nhập đã gõ, lỗi OAuth, thông báo sau
// khi gửi form. `returnTo` do phần client đọc thẳng trên thanh địa chỉ (xem useReturnTo).

import type { PasswordError } from "@/server/password";
import { PASSWORD_ERROR } from "./PasswordForms";

export interface AuthSearchParams {
  login?: string;
  error?: string;
  username?: string;
  passwordChanged?: string;
  passwordReset?: string;
  /** Lỗi của form email ở Tài khoản (tách khỏi `error` của form mật khẩu cùng trang). */
  emailError?: string;
  emailSent?: string;
  emailVerified?: string;
  /** Đã gửi form quên mật khẩu. */
  sent?: string;
  /** Mã đặt lại mật khẩu trong thư. */
  token?: string;
}

function passwordError(code: string | undefined): PasswordError | null {
  return code && Object.hasOwn(PASSWORD_ERROR, code) ? (code as PasswordError) : null;
}

export function readAuthParams(q: AuthSearchParams) {
  return {
    oauthError: q.login === "error",
    error: passwordError(q.error),
    username: (q.username ?? "").slice(0, 40),
    passwordChanged: q.passwordChanged === "1",
    passwordReset: q.passwordReset === "1",
    emailError: passwordError(q.emailError),
    emailSent: q.emailSent === "1",
    emailVerified: q.emailVerified === "1",
    sent: q.sent === "1",
    token: (q.token ?? "").slice(0, 100),
  };
}
