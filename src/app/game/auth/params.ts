// Đọc tham số chung của các phân cảnh tài khoản: mã lỗi form, tên đăng nhập đã gõ, lỗi OAuth.
// `returnTo` do phần client đọc thẳng trên thanh địa chỉ (xem useReturnTo).

import type { PasswordError } from "@/server/password";
import { PASSWORD_ERROR } from "./PasswordForms";

export interface AuthSearchParams {
  login?: string;
  error?: string;
  username?: string;
  passwordChanged?: string;
}

export function readAuthParams(q: AuthSearchParams) {
  return {
    oauthError: q.login === "error",
    error: q.error && Object.hasOwn(PASSWORD_ERROR, q.error) ? (q.error as PasswordError) : null,
    username: (q.username ?? "").slice(0, 40),
    passwordChanged: q.passwordChanged === "1",
  };
}
