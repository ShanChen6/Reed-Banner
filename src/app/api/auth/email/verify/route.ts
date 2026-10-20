// GET /api/auth/email/verify?token=…: đường dẫn trong thư xác nhận email. Không đăng nhập hộ: mở ở máy chưa
// đăng nhập tài khoản đó thì về trang đăng nhập kèm thông báo.

import { NextResponse, type NextRequest } from "next/server";
import { guestOf } from "@/server/http";
import { confirmEmail } from "@/server/recovery";
import { accountStore } from "@/server/store";

export async function GET(request: NextRequest) {
  const store = accountStore();
  const r = await confirmEmail(store, request.nextUrl.searchParams.get("token") ?? "", Date.now());
  const id = guestOf(request);
  const onAccount = id !== null && (r.ok ? id === r.accountId : (await store.get(id)) !== null);
  const url = new URL(onAccount ? "/game/account" : "/game/login", request.nextUrl.origin);
  if (r.ok) url.searchParams.set("emailVerified", "1");
  else url.searchParams.set(onAccount ? "emailError" : "error", r.error);
  return NextResponse.redirect(url, 303);
}
