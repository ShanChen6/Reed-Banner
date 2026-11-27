// Ván Điền Trang Ký trên Postgres (Neon trên Vercel, PGlite trong test). Ghi kèm điều kiện seq.

import { and, count, eq, gt } from "drizzle-orm";
import type { DtkState } from "@/core/dien-trang-ky";
import type { DtkKind, DtkRecord, DtkSeatInfo, DtkStatus, DtkStore } from "../dienTrangKy";
import { dtkMatches, dtkRewards } from "./schema";
import type { Db } from "./store";

type Row = typeof dtkMatches.$inferSelect;

const toRecord = (r: Row): DtkRecord => ({
  ...r,
  kind: r.kind as DtkKind,
  status: r.status as DtkStatus,
  seats: r.seats as DtkSeatInfo[],
  state: (r.state as DtkState | null) ?? null,
  idle: r.idle as number[],
  rewards: (r.rewards as Record<string, number> | null) ?? null,
});

export class DrizzleDtkStore implements DtkStore {
  constructor(private readonly db: Db) {}

  async create(r: DtkRecord): Promise<boolean> {
    const rows = await this.db.insert(dtkMatches).values(r).onConflictDoNothing().returning({ id: dtkMatches.id });
    return rows.length > 0;
  }

  async get(id: string): Promise<DtkRecord | null> {
    const [row] = await this.db.select().from(dtkMatches).where(eq(dtkMatches.id, id)).limit(1);
    return row ? toRecord(row) : null;
  }

  async findWaiting(code: string): Promise<DtkRecord | null> {
    const [row] = await this.db
      .select()
      .from(dtkMatches)
      .where(and(eq(dtkMatches.code, code), eq(dtkMatches.status, "waiting")))
      .limit(1);
    return row ? toRecord(row) : null;
  }

  async save(r: DtkRecord, expectedSeq: number): Promise<boolean> {
    const rows = await this.db
      .update(dtkMatches)
      .set(r)
      .where(and(eq(dtkMatches.id, r.id), eq(dtkMatches.seq, expectedSeq)))
      .returning({ id: dtkMatches.id });
    return rows.length > 0;
  }

  async rewardsOn(ownerId: string, day: string): Promise<number> {
    const [row] = await this.db
      .select({ n: count() })
      .from(dtkRewards)
      .where(and(eq(dtkRewards.ownerId, ownerId), eq(dtkRewards.day, day), gt(dtkRewards.gold, 0)));
    return Number(row?.n ?? 0);
  }

  async addRewards(matchId: string, day: string, rewards: Readonly<Record<string, number>>): Promise<void> {
    const rows = Object.entries(rewards).map(([ownerId, gold]) => ({ matchId, ownerId, day, gold }));
    if (rows.length) await this.db.insert(dtkRewards).values(rows).onConflictDoNothing();
  }
}
