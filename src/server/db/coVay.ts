// Ván Vây Thành Kỳ đấu người trên Postgres (Neon trên Vercel, PGlite trong test). Ghi kèm điều kiện seq.

import { and, count, eq, gt } from "drizzle-orm";
import type { GoMatch } from "@/core/co-vay";
import type { GoAi, GoRecord, GoStatus, GoStore } from "../coVay";
import { goMatches } from "./schema";
import type { Db } from "./store";

type Row = typeof goMatches.$inferSelect;

const toRecord = (r: Row): GoRecord => ({ ...r, status: r.status as GoStatus, match: r.state as GoMatch, ai: (r.ai as GoAi | null) ?? null });

const toRow = (r: GoRecord): Row => {
  const { match, ...rest } = r;
  return { ...rest, state: match };
};

export class DrizzleGoStore implements GoStore {
  constructor(private readonly db: Db) {}

  async create(r: GoRecord): Promise<boolean> {
    const rows = await this.db.insert(goMatches).values(toRow(r)).onConflictDoNothing().returning({ id: goMatches.id });
    return rows.length > 0;
  }

  async get(id: string): Promise<GoRecord | null> {
    const [row] = await this.db.select().from(goMatches).where(eq(goMatches.id, id)).limit(1);
    return row ? toRecord(row) : null;
  }

  async findWaiting(code: string): Promise<GoRecord | null> {
    const [row] = await this.db
      .select()
      .from(goMatches)
      .where(and(eq(goMatches.code, code), eq(goMatches.status, "waiting")))
      .limit(1);
    return row ? toRecord(row) : null;
  }

  async save(r: GoRecord, expectedSeq: number): Promise<boolean> {
    const rows = await this.db
      .update(goMatches)
      .set(toRow(r))
      .where(and(eq(goMatches.id, r.id), eq(goMatches.seq, expectedSeq)))
      .returning({ id: goMatches.id });
    return rows.length > 0;
  }

  async rewardsOn(ownerId: string, day: string): Promise<number> {
    const [row] = await this.db
      .select({ n: count() })
      .from(goMatches)
      .where(and(eq(goMatches.ownerId, ownerId), eq(goMatches.rewardDay, day), gt(goMatches.reward, 0)));
    return Number(row?.n ?? 0);
  }
}
