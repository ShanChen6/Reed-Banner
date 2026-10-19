// Lưu trận vào Postgres bằng Drizzle. Chạy với Neon (HTTP) trên Vercel, PGlite trong test.

import { and, eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type { MatchRecord, MatchStore } from "../store";
import { matches } from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, Record<string, never>>;

export class DrizzleMatchStore implements MatchStore {
  constructor(private readonly db: Db) {}

  async create(r: MatchRecord): Promise<void> {
    await this.db.insert(matches).values({
      id: r.id,
      ownerId: r.ownerId,
      seq: r.match.seq,
      state: r.match,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async get(id: string): Promise<MatchRecord | null> {
    const [row] = await this.db.select().from(matches).where(eq(matches.id, id)).limit(1);
    return row ? { id: row.id, ownerId: row.ownerId, match: row.state, createdAt: row.createdAt, updatedAt: row.updatedAt } : null;
  }

  async save(r: MatchRecord, expectedSeq: number): Promise<boolean> {
    const rows = await this.db
      .update(matches)
      .set({ seq: r.match.seq, state: r.match, updatedAt: r.updatedAt })
      .where(and(eq(matches.id, r.id), eq(matches.seq, expectedSeq)))
      .returning({ id: matches.id });
    return rows.length > 0;
  }
}
