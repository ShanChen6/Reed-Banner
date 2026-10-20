// GET /api/health: kiểm tra cấu hình online sau khi deploy (database nối được chưa, có SESSION_SECRET chưa,
// nút đăng nhập nào đang bật, đã cấu hình SMTP để gửi thư chưa).
// Không trả về giá trị bí mật nào.

import { NextResponse } from "next/server";
import { smtpConfigured } from "@/server/mail";
import { enabledProviders } from "@/server/oauth";
import { checkDatabase } from "@/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await checkDatabase();
  const sessionSecret = Boolean(process.env.SESSION_SECRET);
  const ok = db.ok && (sessionSecret || process.env.NODE_ENV !== "production");
  // Đăng nhập OAuth và email là tùy chọn: thiếu biến thì chỉ ẩn nút/form tương ứng, không làm hỏng health.
  return NextResponse.json({ ok, db, sessionSecret, oauth: enabledProviders(), mail: smtpConfigured() }, { status: ok ? 200 : 503 });
}
