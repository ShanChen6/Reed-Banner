// GET /api/cron/daily: việc định kỳ mỗi ngày, Vercel Cron gọi theo lịch trong vercel.json.
// Chốt trận bỏ dở quá 24 giờ (xử thua, cộng thưởng vào hồ sơ) và xóa khách không chơi quá 30 ngày.
// Vercel gửi `Authorization: Bearer <CRON_SECRET>`; thiếu CRON_SECRET thì từ chối mọi lời gọi.

import { NextResponse, type NextRequest } from "next/server";
import { ABANDON_MS } from "@/core";
import { settleAbandoned } from "@/server/battles";
import { deleteGuests, staleGuestIds, staleMatchIds } from "@/server/db/maintenance";
import { database, matchStore, profileStore } from "@/server/store";

export const dynamic = "force-dynamic";
// Gói Hobby cho hàm chạy tối đa 60 giây.
export const maxDuration = 60;

/** Khách không có trận hay hồ sơ nào thay đổi quá mốc này thì bị xóa. */
const GUEST_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Giới hạn mỗi lần chạy để không vượt thời gian; còn sót thì lần sau làm tiếp. */
const MATCH_BATCH = 200;
const GUEST_BATCH = 500;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = database();
  if (!db) return NextResponse.json({ ok: true, skipped: "memory" });
  const now = Date.now();
  const deps = { store: matchStore(), profiles: profileStore(), now };
  const settled = await settleAbandoned(await staleMatchIds(db, now - ABANDON_MS, MATCH_BATCH), deps);
  const guests = await staleGuestIds(db, now - GUEST_TTL_MS, GUEST_BATCH);
  await deleteGuests(db, guests);
  return NextResponse.json({ ok: true, settled, deletedGuests: guests.length });
}
