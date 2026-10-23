import { and, asc, count, desc, eq, gt, lt, or, sql } from "drizzle-orm";
import type {
  DestinyLeaderboardEntry,
  DestinyLeaderboardStore,
  DestinyLeaderboardSubmission,
} from "../destinyLeaderboard";
import { accounts, destinyLeaderboardScores } from "./schema";
import type { Db } from "./store";
import { destinyCycleById } from "../destinyCycle";

const betterSql = (value: DestinyLeaderboardSubmission) => or(
  lt(destinyLeaderboardScores.clearedFloor, value.clearedFloor),
  and(
    eq(destinyLeaderboardScores.clearedFloor, value.clearedFloor),
    gt(destinyLeaderboardScores.totalTurns, value.totalTurns),
  ),
  and(
    eq(destinyLeaderboardScores.clearedFloor, value.clearedFloor),
    eq(destinyLeaderboardScores.totalTurns, value.totalTurns),
    gt(destinyLeaderboardScores.completedAt, value.completedAt),
  ),
);

export class DrizzleDestinyLeaderboardStore implements DestinyLeaderboardStore {
  constructor(private readonly db: Db) {}

  async submit(value: DestinyLeaderboardSubmission): Promise<boolean> {
    if (!Number.isInteger(value.clearedFloor) || value.clearedFloor < 1 || value.clearedFloor > 1_000 ||
        !Number.isInteger(value.totalTurns) || value.totalTurns < 0 ||
        !Number.isSafeInteger(value.completedAt) || value.completedAt < 0 ||
        !destinyCycleById(value.cycleId) || !value.eventId) return false;
    const rows = await this.db.insert(destinyLeaderboardScores).values(value).onConflictDoUpdate({
      target: [destinyLeaderboardScores.cycleId, destinyLeaderboardScores.ownerId],
      set: {
        clearedFloor: sql`excluded.cleared_floor`,
        totalTurns: sql`excluded.total_turns`,
        completedAt: sql`excluded.completed_at`,
        eventId: sql`excluded.event_id`,
      },
      setWhere: betterSql(value),
    }).returning({ eventId: destinyLeaderboardScores.eventId });
    return rows.length > 0;
  }

  async page(cycleId: string, offset: number, limit: number): Promise<readonly DestinyLeaderboardEntry[]> {
    const rows = await this.db.select({
      cycleId: destinyLeaderboardScores.cycleId,
      ownerId: destinyLeaderboardScores.ownerId,
      clearedFloor: destinyLeaderboardScores.clearedFloor,
      totalTurns: destinyLeaderboardScores.totalTurns,
      completedAt: destinyLeaderboardScores.completedAt,
      eventId: destinyLeaderboardScores.eventId,
      name: accounts.name,
    }).from(destinyLeaderboardScores)
      .leftJoin(accounts, eq(accounts.id, destinyLeaderboardScores.ownerId))
      .where(eq(destinyLeaderboardScores.cycleId, cycleId))
      .orderBy(
        desc(destinyLeaderboardScores.clearedFloor),
        asc(destinyLeaderboardScores.totalTurns),
        asc(destinyLeaderboardScores.completedAt),
        asc(destinyLeaderboardScores.ownerId),
      ).offset(offset).limit(limit);
    return rows.map((row) => ({ ...row, name: row.name ?? null }));
  }

  async rankOf(cycleId: string, ownerId: string) {
    const [mine] = await this.db.select({
      cycleId: destinyLeaderboardScores.cycleId,
      ownerId: destinyLeaderboardScores.ownerId,
      clearedFloor: destinyLeaderboardScores.clearedFloor,
      totalTurns: destinyLeaderboardScores.totalTurns,
      completedAt: destinyLeaderboardScores.completedAt,
      eventId: destinyLeaderboardScores.eventId,
      name: accounts.name,
    }).from(destinyLeaderboardScores)
      .leftJoin(accounts, eq(accounts.id, destinyLeaderboardScores.ownerId)).where(and(
      eq(destinyLeaderboardScores.cycleId, cycleId),
      eq(destinyLeaderboardScores.ownerId, ownerId),
    )).limit(1);
    if (!mine) return null;
    const [row] = await this.db.select({ n: count() }).from(destinyLeaderboardScores).where(and(
      eq(destinyLeaderboardScores.cycleId, cycleId),
      or(
        gt(destinyLeaderboardScores.clearedFloor, mine.clearedFloor),
        and(eq(destinyLeaderboardScores.clearedFloor, mine.clearedFloor), lt(destinyLeaderboardScores.totalTurns, mine.totalTurns)),
        and(eq(destinyLeaderboardScores.clearedFloor, mine.clearedFloor), eq(destinyLeaderboardScores.totalTurns, mine.totalTurns), lt(destinyLeaderboardScores.completedAt, mine.completedAt)),
        and(eq(destinyLeaderboardScores.clearedFloor, mine.clearedFloor), eq(destinyLeaderboardScores.totalTurns, mine.totalTurns), eq(destinyLeaderboardScores.completedAt, mine.completedAt), lt(destinyLeaderboardScores.ownerId, mine.ownerId)),
      ),
    ));
    return { rank: 1 + (row?.n ?? 0), entry: { ...mine, name: mine.name ?? null } };
  }
}
