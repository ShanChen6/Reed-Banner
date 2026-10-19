// Đọc tài khoản hiện tại trong server component (trang /dang-nhap, khu tài khoản của /play).

import { cookies } from "next/headers";
import type { Account } from "./accounts";
import { GUEST_COOKIE, verifyGuest } from "./guest";
import { accountStore } from "./store";

export interface CurrentUser {
  /** Id trong cookie (khách hoặc đã đăng nhập), null nếu chưa từng chơi online. */
  readonly id: string | null;
  /** Tài khoản đã đăng nhập; null nếu là khách. */
  readonly account: Account | null;
}

export async function currentUser(): Promise<CurrentUser> {
  const id = verifyGuest((await cookies()).get(GUEST_COOKIE)?.value);
  return { id, account: id ? await accountStore().get(id) : null };
}
