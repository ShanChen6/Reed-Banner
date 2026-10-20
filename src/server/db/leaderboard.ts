// Lưu bảng xếp hạng vào Postgres bằng Drizzle.

import { and, asc, count, desc, eq, gt, lt, ne, or, sql } from "drizzle-orm";
import type { BoardId } from "@/core";
import type { BoardEntry, LeaderboardStore } from "../leaderboard";
import { accounts, leaderboardScores } from "./schema";
import type { Db } from "./store";

export class DrizzleLeaderboardStore implements LeaderboardStore {
  constructor(private readonly db: Db) {}

  async submit(
    ownerId: string,
    scores: readonly { board: BoardId; score: number }[],
    now: number,
  ): Promise<void> {
    if (scores.length === 0) return;
    await this.db
      .insert(leaderboardScores)
      .values(
        scores.map((s) => ({
          board: s.board,
          ownerId,
          score: s.score,
          updatedAt: now,
        })),
      )
      .onConflictDoUpdate({
        target: [leaderboardScores.board, leaderboardScores.ownerId],
        set: {
          score: sql`excluded.score`,
          updatedAt: sql`excluded.updated_at`,
        },
        // Điểm không đổi thì giữ mốc cũ (bằng điểm thì ai đạt trước đứng trên).
        setWhere: ne(leaderboardScores.score, sql`excluded.score`),
      });
  }

  async top(board: BoardId, limit: number): Promise<BoardEntry[]> {
    const rows = await this.db
      .select({
        ownerId: leaderboardScores.ownerId,
        score: leaderboardScores.score,
        updatedAt: leaderboardScores.updatedAt,
        name: accounts.name,
      })
      .from(leaderboardScores)
      .leftJoin(accounts, eq(accounts.id, leaderboardScores.ownerId))
      .where(eq(leaderboardScores.board, board))
      .orderBy(desc(leaderboardScores.score), asc(leaderboardScores.updatedAt))
      .limit(limit);
    return rows.map((r) => ({ ...r, name: r.name ?? null }));
  }

  async rankOf(
    board: BoardId,
    ownerId: string,
  ): Promise<{ rank: number; score: number } | null> {
    const [mine] = await this.db
      .select()
      .from(leaderboardScores)
      .where(
        and(
          eq(leaderboardScores.board, board),
          eq(leaderboardScores.ownerId, ownerId),
        ),
      )
      .limit(1);
    if (!mine) return null;
    const [row] = await this.db
      .select({ n: count() })
      .from(leaderboardScores)
      .where(
        and(
          eq(leaderboardScores.board, board),
          or(
            gt(leaderboardScores.score, mine.score),
            and(
              eq(leaderboardScores.score, mine.score),
              lt(leaderboardScores.updatedAt, mine.updatedAt),
            ),
          ),
        ),
      );
    return { rank: 1 + (row?.n ?? 0), score: mine.score };
  }
}
