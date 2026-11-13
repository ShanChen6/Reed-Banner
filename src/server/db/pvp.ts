// Lưu Quần Hùng online (PvP) vào Postgres bằng Drizzle. Neon HTTP không có transaction tương tác, nên mọi bước tranh chấp
// (ghép trận, ghi trận, tính điểm) đều là một câu lệnh có điều kiện.

import { and, asc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import type { PvpFormat, PvpPlayerResult, PvpState } from "@/core";
import { PVP_ELO_START } from "@/core";
import type { PvpMatchRecord, PvpMatchStatus, PvpQueueRow, PvpRatingRow, PvpResultInput, PvpStore } from "../pvp";
import { pvpMatches, pvpQueue, pvpRatings } from "./schema";
import type { Db } from "./store";

const toMatch = (r: typeof pvpMatches.$inferSelect): PvpMatchRecord => ({
  id: r.id,
  format: r.format as PvpFormat,
  state: r.state as PvpState,
  seq: r.seq,
  status: r.status as PvpMatchStatus,
  owners: r.owners as string[],
  results: (r.results as PvpPlayerResult[] | null) ?? null,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  settledAt: r.settledAt,
});

const toQueue = (r: typeof pvpQueue.$inferSelect): PvpQueueRow => ({ ...r, format: r.format as PvpFormat });

export class DrizzlePvpStore implements PvpStore {
  constructor(private readonly db: Db) {}

  async rating(ownerId: string, format: PvpFormat): Promise<PvpRatingRow> {
    const [r] = await this.db.select().from(pvpRatings).where(and(eq(pvpRatings.ownerId, ownerId), eq(pvpRatings.format, format))).limit(1);
    if (r) return { ...r, format };
    return { ownerId, format, rating: PVP_ELO_START, wins: 0, losses: 0, forgiveDay: "", forgiveUsed: 0, updatedAt: 0 };
  }

  async applyResult(ownerId: string, format: PvpFormat, i: PvpResultInput): Promise<void> {
    const win = i.counted && i.won ? 1 : 0;
    const loss = i.counted && !i.won ? 1 : 0;
    await this.db
      .insert(pvpRatings)
      .values({
        ownerId,
        format,
        rating: Math.max(0, PVP_ELO_START + i.delta),
        wins: win,
        losses: loss,
        forgiveDay: i.day,
        forgiveUsed: i.forgiven,
        updatedAt: i.now,
      })
      .onConflictDoUpdate({
        target: [pvpRatings.ownerId, pvpRatings.format],
        set: {
          rating: sql`greatest(0, ${pvpRatings.rating} + ${i.delta})`,
          wins: sql`${pvpRatings.wins} + ${win}`,
          losses: sql`${pvpRatings.losses} + ${loss}`,
          forgiveUsed: sql`case when ${pvpRatings.forgiveDay} = ${i.day} then ${pvpRatings.forgiveUsed} + ${i.forgiven} else ${i.forgiven} end`,
          forgiveDay: i.day,
          updatedAt: i.now,
        },
      });
  }

  async enqueue(row: PvpQueueRow): Promise<void> {
    await this.db
      .insert(pvpQueue)
      .values({ ...row, matchId: null })
      .onConflictDoUpdate({
        target: pvpQueue.ownerId,
        set: { format: row.format, rating: row.rating, enqueuedAt: row.enqueuedAt, lastSeen: row.lastSeen, matchId: null },
      });
  }

  async dequeue(ownerId: string): Promise<void> {
    await this.db.delete(pvpQueue).where(eq(pvpQueue.ownerId, ownerId));
  }

  async queueOf(ownerId: string): Promise<PvpQueueRow | null> {
    const [r] = await this.db.select().from(pvpQueue).where(eq(pvpQueue.ownerId, ownerId)).limit(1);
    return r ? toQueue(r) : null;
  }

  async touch(ownerId: string, now: number): Promise<void> {
    await this.db.update(pvpQueue).set({ lastSeen: now }).where(eq(pvpQueue.ownerId, ownerId));
  }

  async waiting(format: PvpFormat, since: number): Promise<PvpQueueRow[]> {
    const rows = await this.db
      .select()
      .from(pvpQueue)
      .where(and(eq(pvpQueue.format, format), isNull(pvpQueue.matchId), gte(pvpQueue.lastSeen, since)))
      .orderBy(asc(pvpQueue.enqueuedAt), asc(pvpQueue.ownerId));
    return rows.map(toQueue);
  }

  async claimPair(a: string, b: string, matchId: string): Promise<boolean> {
    // Một câu lệnh: chỉ cập nhật khi cả hai còn chờ; đủ hai dòng bị cập nhật thì mới là đã ghép.
    const rows = await this.db
      .update(pvpQueue)
      .set({ matchId })
      .where(and(inArray(pvpQueue.ownerId, [a, b]), isNull(pvpQueue.matchId)))
      .returning({ ownerId: pvpQueue.ownerId });
    if (rows.length === 2) return true;
    // Một người đã bị ghép chỗ khác: trả lại người còn lại về trạng thái chờ.
    if (rows.length === 1) await this.db.update(pvpQueue).set({ matchId: null }).where(and(eq(pvpQueue.ownerId, rows[0]!.ownerId), eq(pvpQueue.matchId, matchId)));
    return false;
  }

  async createMatch(r: PvpMatchRecord): Promise<void> {
    await this.db.insert(pvpMatches).values({
      id: r.id,
      format: r.format,
      state: r.state,
      seq: r.seq,
      status: r.status,
      owners: r.owners,
      results: r.results,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      settledAt: r.settledAt,
    });
  }

  async getMatch(id: string): Promise<PvpMatchRecord | null> {
    const [r] = await this.db.select().from(pvpMatches).where(eq(pvpMatches.id, id)).limit(1);
    return r ? toMatch(r) : null;
  }

  async saveMatch(r: PvpMatchRecord, expectedSeq: number): Promise<boolean> {
    const rows = await this.db
      .update(pvpMatches)
      .set({ state: r.state, seq: r.seq, status: r.status, updatedAt: r.updatedAt })
      .where(and(eq(pvpMatches.id, r.id), eq(pvpMatches.seq, expectedSeq)))
      .returning({ id: pvpMatches.id });
    return rows.length === 1;
  }

  async claimSettle(id: string, results: readonly PvpPlayerResult[], now: number): Promise<boolean> {
    const rows = await this.db
      .update(pvpMatches)
      .set({ settledAt: now, results: [...results] })
      .where(and(eq(pvpMatches.id, id), isNull(pvpMatches.settledAt)))
      .returning({ id: pvpMatches.id });
    return rows.length === 1;
  }
}
