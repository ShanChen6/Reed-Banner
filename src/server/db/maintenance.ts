// Truy vấn cho việc định kỳ (Vercel Cron): tìm trận bỏ dở và tài khoản khách đã lâu không chơi.
// Chỉ chạy với Postgres; bản bộ nhớ khi dev không cần dọn.

import { and, inArray, isNull, lt, sql } from "drizzle-orm";
import { arenaPlayers, dailyEntries, leaderboardScores, matches, profiles } from "./schema";
import type { Db } from "./store";

/** Trận chưa cộng thưởng và không có gì thay đổi từ trước `before` (cũ nhất trước). */
export async function staleMatchIds(db: Db, before: number, limit: number): Promise<string[]> {
  const rows = await db
    .select({ id: matches.id })
    .from(matches)
    .where(and(isNull(matches.rewardedAt), lt(matches.updatedAt, before)))
    .orderBy(matches.updatedAt)
    .limit(limit);
  return rows.map((r) => r.id);
}

/**
 * Khách (chưa đăng nhập lần nào, không có dòng ở `accounts`) mà lần cuối có trận hoặc hồ sơ thay đổi
 * trước `before`.
 */
export async function staleGuestIds(db: Db, before: number, limit: number): Promise<string[]> {
  const rows = (await db.execute(sql`
    select owner_id from (
      select owner_id, updated_at from matches
      union all
      select owner_id, updated_at from profiles
    ) activity
    where owner_id not in (select id from accounts)
    group by owner_id
    having max(updated_at) < ${before}
    limit ${limit}
  `)) as unknown as { rows?: { owner_id: string }[] } | { owner_id: string }[];
  // PGlite trả `{ rows }`, Neon HTTP trả mảng.
  const list = Array.isArray(rows) ? rows : (rows.rows ?? []);
  return list.map((r) => r.owner_id);
}

/** Xóa trận, hồ sơ, lượt thử thách ngày, điểm xếp hạng và đấu trường của các khách này. */
export async function deleteGuests(db: Db, ids: readonly string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(matches).where(inArray(matches.ownerId, [...ids]));
  await db.delete(profiles).where(inArray(profiles.ownerId, [...ids]));
  await db.delete(dailyEntries).where(inArray(dailyEntries.ownerId, [...ids]));
  await db.delete(leaderboardScores).where(inArray(leaderboardScores.ownerId, [...ids]));
  await db.delete(arenaPlayers).where(inArray(arenaPlayers.ownerId, [...ids]));
}
