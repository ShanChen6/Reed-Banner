// GET /api/health: kiểm tra cấu hình online sau khi deploy (database nối được chưa, có SESSION_SECRET chưa).
// Không trả về giá trị bí mật nào.

import { NextResponse } from "next/server";
import { checkDatabase } from "@/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await checkDatabase();
  const sessionSecret = Boolean(process.env.SESSION_SECRET);
  const ok = db.ok && (sessionSecret || process.env.NODE_ENV !== "production");
  return NextResponse.json({ ok, db, sessionSecret }, { status: ok ? 200 : 503 });
}
