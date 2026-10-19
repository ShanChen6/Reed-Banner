// Đọc tham số chung của các trang tài khoản: mã lỗi form, tên đăng nhập đã gõ, trang quay về.

import { safeReturnTo } from "@/server/oauth";
import type { PasswordError } from "@/server/password";
import { PASSWORD_ERROR } from "./PasswordForms";

export interface AuthSearchParams {
  returnTo?: string;
  login?: string;
  error?: string;
  username?: string;
}

export function readAuthParams(q: AuthSearchParams) {
  return {
    returnTo: safeReturnTo(q.returnTo),
    oauthError: q.login === "error",
    error: q.error && Object.hasOwn(PASSWORD_ERROR, q.error) ? (q.error as PasswordError) : null,
    username: (q.username ?? "").slice(0, 40),
  };
}
