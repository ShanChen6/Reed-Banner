// Điểm mùa theo tuần trong Postgres. Thứ tự hạng khớp bộ nhớ: điểm dương ↓, đạt sớm ↑.

import { and, asc, count, desc, eq, gt, lt, or, sql } from "drizzle-orm";
import type { SeasonMode } from "@/core";
import type { SeasonEntry, SeasonStore } from "../seasons";
import { accounts, seasonScores } from "./schema";
import type { Db } from "./store";

export class DrizzleSeasonStore implements SeasonStore {
  constructor(private readonly db: Db) {}

  async best(mode: SeasonMode, season: string, ownerId: string, score: number, now: number): Promise<void> {
    await this.db
      .insert(seasonScores)
      .values({ mode, season, ownerId, score, updatedAt: now })
      .onConflictDoUpdate({
        target: [seasonScores.mode, seasonScores.season, seasonScores.ownerId],
        set: { score: sql`excluded.score`, updatedAt: sql`excluded.updated_at` },
        setWhere: lt(seasonScores.score, score),
      });
  }

  async add(mode: SeasonMode, season: string, ownerId: string, delta: number, now: number): Promise<void> {
    if (delta === 0) return;
    await this.db
      .insert(seasonScores)
      .values({ mode, season, ownerId, score: delta, updatedAt: now })
      .onConflictDoUpdate({
        target: [seasonScores.mode, seasonScores.season, seasonScores.ownerId],
        set: { score: sql`${seasonScores.score} + excluded.score`, updatedAt: sql`excluded.updated_at` },
      });
  }

  async top(mode: SeasonMode, season: string, limit: number): Promise<SeasonEntry[]> {
    const rows = await this.db
      .select({
        mode: seasonScores.mode,
        season: seasonScores.season,
        ownerId: seasonScores.ownerId,
        score: seasonScores.score,
        updatedAt: seasonScores.updatedAt,
        name: accounts.name,
      })
      .from(seasonScores)
      .leftJoin(accounts, eq(accounts.id, seasonScores.ownerId))
      .where(and(eq(seasonScores.mode, mode), eq(seasonScores.season, season), gt(seasonScores.score, 0)))
      .orderBy(desc(seasonScores.score), asc(seasonScores.updatedAt))
      .limit(limit);
    return rows.map((r) => ({ ...r, mode: r.mode as SeasonMode, name: r.name ?? null }));
  }

  async rankOf(mode: SeasonMode, season: string, ownerId: string): Promise<{ rank: number; score: number } | null> {
    const [mine] = await this.db
      .select({ score: seasonScores.score, updatedAt: seasonScores.updatedAt })
      .from(seasonScores)
      .where(and(eq(seasonScores.mode, mode), eq(seasonScores.season, season), eq(seasonScores.ownerId, ownerId)))
      .limit(1);
    if (!mine || mine.score <= 0) return null;
    const [row] = await this.db
      .select({ n: count() })
      .from(seasonScores)
      .where(
        and(
          eq(seasonScores.mode, mode),
          eq(seasonScores.season, season),
          or(gt(seasonScores.score, mine.score), and(eq(seasonScores.score, mine.score), lt(seasonScores.updatedAt, mine.updatedAt))),
        ),
      );
    return { rank: 1 + (row?.n ?? 0), score: mine.score };
  }

  async count(mode: SeasonMode, season: string): Promise<number> {
    const [row] = await this.db
      .select({ n: count() })
      .from(seasonScores)
      .where(and(eq(seasonScores.mode, mode), eq(seasonScores.season, season), gt(seasonScores.score, 0)));
    return row?.n ?? 0;
  }
}
