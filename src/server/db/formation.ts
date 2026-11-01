// Lưu ván Trận Đồ xếp hạng vào Postgres bằng Drizzle. Thứ tự hạng khớp compareResults: điểm ↓, số nước ↑, nộp sớm ↑.

import { and, asc, count, desc, eq, getTableColumns, gt, isNull, lt, or, sql } from "drizzle-orm";
import { parsePuzzle } from "@/core/binh-phap";
import type { FormationEntry, FormationStatus, FormationStore } from "../formation";
import { accounts, formationEntries } from "./schema";
import type { Db } from "./store";

type Row = typeof formationEntries.$inferSelect & { name?: string | null };

function toEntry(r: Row): FormationEntry {
  const state = parsePuzzle(r.state);
  if (!state) throw new Error(`Ván Trận Đồ lưu không đọc được: ${r.id}`);
  return {
    id: r.id,
    level: r.level,
    period: r.period,
    ownerId: r.ownerId,
    name: r.name ?? null,
    state,
    seq: r.seq,
    status: r.status as FormationStatus,
    score: r.score,
    turns: r.turns,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt,
    claimedAt: r.claimedAt,
    rewardGold: r.rewardGold,
  };
}

const values = (e: FormationEntry) => ({
  id: e.id,
  level: e.level,
  period: e.period,
  ownerId: e.ownerId,
  state: e.state,
  seq: e.seq,
  status: e.status,
  score: e.score,
  turns: e.turns,
  startedAt: e.startedAt,
  finishedAt: e.finishedAt,
  claimedAt: e.claimedAt,
  rewardGold: e.rewardGold,
});

const won = (level: string, period: string) =>
  and(eq(formationEntries.level, level), eq(formationEntries.period, period), eq(formationEntries.status, "won"));

export class DrizzleFormationStore implements FormationStore {
  constructor(private readonly db: Db) {}

  async create(entry: FormationEntry): Promise<boolean> {
    const rows = await this.db.insert(formationEntries).values(values(entry)).onConflictDoNothing().returning({ id: formationEntries.id });
    return rows.length > 0;
  }

  async get(level: string, period: string, ownerId: string): Promise<FormationEntry | null> {
    const [row] = await this.db
      .select()
      .from(formationEntries)
      .where(and(eq(formationEntries.level, level), eq(formationEntries.period, period), eq(formationEntries.ownerId, ownerId)))
      .limit(1);
    return row ? toEntry(row) : null;
  }

  async save(entry: FormationEntry, expectedSeq: number): Promise<boolean> {
    const rows = await this.db
      .update(formationEntries)
      .set(values(entry))
      .where(and(eq(formationEntries.id, entry.id), eq(formationEntries.seq, expectedSeq)))
      .returning({ id: formationEntries.id });
    return rows.length > 0;
  }

  async top(level: string, period: string, limit: number): Promise<FormationEntry[]> {
    const rows = await this.db
      .select({ ...getTableColumns(formationEntries), name: accounts.name })
      .from(formationEntries)
      .leftJoin(accounts, eq(accounts.id, formationEntries.ownerId))
      .where(won(level, period))
      .orderBy(desc(formationEntries.score), asc(formationEntries.turns), asc(formationEntries.finishedAt))
      .limit(limit);
    return rows.map(toEntry);
  }

  async countWinners(level: string, period: string): Promise<number> {
    const [row] = await this.db.select({ n: count() }).from(formationEntries).where(won(level, period));
    return row?.n ?? 0;
  }

  async rankOf(entry: FormationEntry): Promise<number | null> {
    if (entry.status !== "won" || entry.score === null || entry.turns === null || entry.finishedAt === null) return null;
    const { score, turns, finishedAt } = entry;
    const [row] = await this.db
      .select({ n: count() })
      .from(formationEntries)
      .where(
        and(
          won(entry.level, entry.period),
          or(
            gt(formationEntries.score, score),
            and(eq(formationEntries.score, score), lt(formationEntries.turns, turns)),
            and(eq(formationEntries.score, score), eq(formationEntries.turns, turns), lt(formationEntries.finishedAt, finishedAt)),
          ),
        ),
      );
    return 1 + (row?.n ?? 0);
  }

  async claim(id: string, gold: number, now: number): Promise<boolean> {
    const rows = await this.db
      .update(formationEntries)
      .set({ claimedAt: now, rewardGold: gold })
      .where(and(eq(formationEntries.id, id), eq(formationEntries.status, "won"), isNull(formationEntries.claimedAt)))
      .returning({ id: formationEntries.id });
    return rows.length > 0;
  }

  async release(id: string): Promise<void> {
    await this.db.update(formationEntries).set({ claimedAt: null, rewardGold: null }).where(eq(formationEntries.id, id));
  }

  async unclaimed(ownerId: string, level: string, beforePeriod: string, limit: number): Promise<FormationEntry[]> {
    const rows = await this.db
      .select()
      .from(formationEntries)
      .where(
        and(
          eq(formationEntries.ownerId, ownerId),
          eq(formationEntries.level, level),
          eq(formationEntries.status, "won"),
          isNull(formationEntries.claimedAt),
          lt(formationEntries.period, beforePeriod),
        ),
      )
      .orderBy(sql`${formationEntries.period} desc`)
      .limit(limit);
    return rows.map(toEntry);
  }
}
