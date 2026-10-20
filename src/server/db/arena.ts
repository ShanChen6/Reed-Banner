// Lưu đấu trường bóng ma vào Postgres bằng Drizzle.

import { and, asc, eq, isNotNull, lt, ne, or, sql } from "drizzle-orm";
import type { ArenaDefense } from "@/core";
import {
  RECORD_FIELD,
  type ArenaCandidate,
  type ArenaOffer,
  type ArenaRecord,
  type ArenaRow,
  type ArenaStore,
} from "../arena";
import { ARENA_START } from "@/core";
import { accounts, arenaPlayers } from "./schema";
import type { Db } from "./store";

type Row = typeof arenaPlayers.$inferSelect;

const toRow = (r: Row): ArenaRow => ({
  ...r,
  defense: (r.defense as ArenaDefense | null) ?? null,
  offers: r.offers as ArenaOffer[],
});

export class DrizzleArenaStore implements ArenaStore {
  constructor(private readonly db: Db) {}

  async get(ownerId: string): Promise<ArenaRow | null> {
    const [row] = await this.db.select().from(arenaPlayers).where(eq(arenaPlayers.ownerId, ownerId)).limit(1);
    return row ? toRow(row) : null;
  }

  async ensure(ownerId: string, now: number): Promise<ArenaRow> {
    await this.db
      .insert(arenaPlayers)
      .values({ ownerId, rating: ARENA_START, offers: [], updatedAt: now })
      .onConflictDoNothing();
    const row = await this.get(ownerId);
    if (!row) throw new Error("arena row missing");
    return row;
  }

  async setDefense(ownerId: string, defense: ArenaDefense, now: number): Promise<void> {
    await this.db.update(arenaPlayers).set({ defense, updatedAt: now }).where(eq(arenaPlayers.ownerId, ownerId));
  }

  async setOffers(ownerId: string, offers: readonly ArenaOffer[]): Promise<void> {
    await this.db.update(arenaPlayers).set({ offers }).where(eq(arenaPlayers.ownerId, ownerId));
  }

  async candidates(ownerId: string, rating: number, limit: number): Promise<ArenaCandidate[]> {
    const rows = await this.db
      .select({ ownerId: arenaPlayers.ownerId, rating: arenaPlayers.rating, defense: arenaPlayers.defense, name: accounts.name })
      .from(arenaPlayers)
      .leftJoin(accounts, eq(accounts.id, arenaPlayers.ownerId))
      .where(and(ne(arenaPlayers.ownerId, ownerId), isNotNull(arenaPlayers.defense)))
      .orderBy(sql`abs(${arenaPlayers.rating} - ${rating})`, asc(arenaPlayers.ownerId))
      .limit(limit);
    return rows.map((r) => ({ ...r, defense: r.defense as ArenaDefense, name: r.name ?? null }));
  }

  async useAttack(ownerId: string, day: string, limit: number, now: number): Promise<boolean> {
    // Một câu lệnh: hai request cùng lúc không dùng quá số trận của ngày.
    const rows = await this.db
      .update(arenaPlayers)
      .set({
        attacks: sql`case when ${arenaPlayers.day} = ${day} then ${arenaPlayers.attacks} + 1 else 1 end`,
        day,
        updatedAt: now,
      })
      .where(and(eq(arenaPlayers.ownerId, ownerId), or(ne(arenaPlayers.day, day), lt(arenaPlayers.attacks, limit))))
      .returning({ attacks: arenaPlayers.attacks });
    return rows.length > 0;
  }

  async record(ownerId: string, delta: number, result: ArenaRecord, now: number): Promise<number | null> {
    const col = arenaPlayers[RECORD_FIELD[result]];
    const rows = await this.db
      .update(arenaPlayers)
      .set({
        rating: sql`greatest(0, ${arenaPlayers.rating} + ${delta})`,
        [RECORD_FIELD[result]]: sql`${col} + 1`,
        updatedAt: now,
      })
      .where(eq(arenaPlayers.ownerId, ownerId))
      .returning({ rating: arenaPlayers.rating });
    return rows[0]?.rating ?? null;
  }
}
