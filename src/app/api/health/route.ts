// GET /api/health: kiểm tra cấu hình online sau khi deploy (database nối được chưa, có SESSION_SECRET chưa,
// nút đăng nhập nào đang bật).
// Không trả về giá trị bí mật nào.

import { NextResponse } from "next/server";
import { enabledProviders } from "@/server/oauth";
import { checkDatabase } from "@/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await checkDatabase();
  const sessionSecret = Boolean(process.env.SESSION_SECRET);
  const ok = db.ok && (sessionSecret || process.env.NODE_ENV !== "production");
  // Đăng nhập OAuth là tùy chọn: thiếu biến của nhà cung cấp nào thì chỉ ẩn nút đó, không làm hỏng health.
  return NextResponse.json({ ok, db, sessionSecret, oauth: enabledProviders() }, { status: ok ? 200 : 503 });
}
