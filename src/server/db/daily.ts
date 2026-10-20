// Lưu thử thách hằng ngày vào Postgres bằng Drizzle.

import { and, asc, count, desc, eq, gt, isNotNull, isNull, lt, or } from "drizzle-orm";
import type { DailyEntry, DailyStore } from "../daily";
import type { DailyScore } from "@/core";
import { accounts, dailyEntries } from "./schema";
import type { Db } from "./store";

type Row = typeof dailyEntries.$inferSelect & { name?: string | null };

function toEntry(r: Row): DailyEntry {
  return {
    day: r.day,
    ownerId: r.ownerId,
    matchId: r.matchId,
    startedAt: r.startedAt,
    result:
      r.score === null || r.finishedAt === null
        ? null
        : { score: r.score, won: r.won ?? false, turns: r.turns ?? 0, permille: r.permille ?? 0, finishedAt: r.finishedAt },
    name: r.name ?? null,
  };
}

export class DrizzleDailyStore implements DailyStore {
  constructor(private readonly db: Db) {}

  async start(day: string, ownerId: string, matchId: string, now: number): Promise<boolean> {
    const rows = await this.db
      .insert(dailyEntries)
      .values({ day, ownerId, matchId, startedAt: now })
      .onConflictDoNothing()
      .returning({ day: dailyEntries.day });
    return rows.length > 0;
  }

  async get(day: string, ownerId: string): Promise<DailyEntry | null> {
    const [row] = await this.db
      .select()
      .from(dailyEntries)
      .where(and(eq(dailyEntries.day, day), eq(dailyEntries.ownerId, ownerId)))
      .limit(1);
    return row ? toEntry(row) : null;
  }

  async finish(day: string, ownerId: string, s: DailyScore, now: number): Promise<void> {
    await this.db
      .update(dailyEntries)
      .set({ score: s.score, won: s.won, turns: s.turns, permille: s.permille, finishedAt: now })
      .where(and(eq(dailyEntries.day, day), eq(dailyEntries.ownerId, ownerId), isNull(dailyEntries.score)));
  }

  async top(day: string, limit: number): Promise<DailyEntry[]> {
    const rows = await this.db
      .select({
        day: dailyEntries.day,
        ownerId: dailyEntries.ownerId,
        matchId: dailyEntries.matchId,
        startedAt: dailyEntries.startedAt,
        finishedAt: dailyEntries.finishedAt,
        score: dailyEntries.score,
        won: dailyEntries.won,
        turns: dailyEntries.turns,
        permille: dailyEntries.permille,
        name: accounts.name,
      })
      .from(dailyEntries)
      .leftJoin(accounts, eq(accounts.id, dailyEntries.ownerId))
      .where(and(eq(dailyEntries.day, day), isNotNull(dailyEntries.score)))
      .orderBy(desc(dailyEntries.score), asc(dailyEntries.finishedAt))
      .limit(limit);
    return rows.map(toEntry);
  }

  async rankOf(day: string, ownerId: string): Promise<number | null> {
    const mine = await this.get(day, ownerId);
    if (!mine?.result) return null;
    const { score, finishedAt } = mine.result;
    const [row] = await this.db
      .select({ n: count() })
      .from(dailyEntries)
      .where(
        and(
          eq(dailyEntries.day, day),
          isNotNull(dailyEntries.score),
          or(gt(dailyEntries.score, score), and(eq(dailyEntries.score, score), lt(dailyEntries.finishedAt, finishedAt))),
        ),
      );
    return 1 + (row?.n ?? 0);
  }
}
