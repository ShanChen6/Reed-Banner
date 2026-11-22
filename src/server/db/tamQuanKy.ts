// Ván Tam Quân Kỳ trên Postgres (Neon trên Vercel, PGlite trong test). Ghi kèm điều kiện seq.

import { and, count, eq, gt } from "drizzle-orm";
import type { TqkMatch } from "@/core/tam-quan-ky";
import type { TqkRecord, TqkStatus, TqkStore } from "../tamQuanKy";
import { tqkMatches } from "./schema";
import type { Db } from "./store";

type Row = typeof tqkMatches.$inferSelect;

const toRecord = (r: Row): TqkRecord => ({ ...r, status: r.status as TqkStatus, match: r.state as TqkMatch });

const toRow = (r: TqkRecord): Row => {
  const { match, ...rest } = r;
  return { ...rest, state: match };
};

export class DrizzleTqkStore implements TqkStore {
  constructor(private readonly db: Db) {}

  async create(r: TqkRecord): Promise<boolean> {
    const rows = await this.db.insert(tqkMatches).values(toRow(r)).onConflictDoNothing().returning({ id: tqkMatches.id });
    return rows.length > 0;
  }

  async get(id: string): Promise<TqkRecord | null> {
    const [row] = await this.db.select().from(tqkMatches).where(eq(tqkMatches.id, id)).limit(1);
    return row ? toRecord(row) : null;
  }

  async findWaiting(code: string): Promise<TqkRecord | null> {
    const [row] = await this.db
      .select()
      .from(tqkMatches)
      .where(and(eq(tqkMatches.code, code), eq(tqkMatches.status, "waiting")))
      .limit(1);
    return row ? toRecord(row) : null;
  }

  async save(r: TqkRecord, expectedSeq: number): Promise<boolean> {
    const rows = await this.db
      .update(tqkMatches)
      .set(toRow(r))
      .where(and(eq(tqkMatches.id, r.id), eq(tqkMatches.seq, expectedSeq)))
      .returning({ id: tqkMatches.id });
    return rows.length > 0;
  }

  async rewardsOn(ownerId: string, day: string): Promise<number> {
    const [row] = await this.db
      .select({ n: count() })
      .from(tqkMatches)
      .where(and(eq(tqkMatches.ownerId, ownerId), eq(tqkMatches.rewardDay, day), gt(tqkMatches.reward, 0)));
    return Number(row?.n ?? 0);
  }
}
