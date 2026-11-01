// Sổ nhận thưởng hạng theo kỳ trong Postgres. Khóa chính (mode, period, owner_id) làm cho `claim` đúng một lần.

import { and, eq, inArray } from "drizzle-orm";
import type { RankRewardMode } from "@/core";
import type { RankRewardClaim, RankRewardStore } from "../rankRewards";
import { rankRewardClaims } from "./schema";
import type { Db } from "./store";

export class DrizzleRankRewardStore implements RankRewardStore {
  constructor(private readonly db: Db) {}

  async claim(c: RankRewardClaim): Promise<boolean> {
    const rows = await this.db.insert(rankRewardClaims).values(c).onConflictDoNothing().returning({ mode: rankRewardClaims.mode });
    return rows.length > 0;
  }

  async release(mode: RankRewardMode, period: string, ownerId: string): Promise<void> {
    await this.db.delete(rankRewardClaims).where(and(eq(rankRewardClaims.mode, mode), eq(rankRewardClaims.period, period), eq(rankRewardClaims.ownerId, ownerId)));
  }

  async claimed(ownerId: string, mode: RankRewardMode, periods: readonly string[]): Promise<ReadonlySet<string>> {
    if (periods.length === 0) return new Set();
    const rows = await this.db
      .select({ period: rankRewardClaims.period })
      .from(rankRewardClaims)
      .where(and(eq(rankRewardClaims.ownerId, ownerId), eq(rankRewardClaims.mode, mode), inArray(rankRewardClaims.period, [...periods])));
    return new Set(rows.map((r) => r.period));
  }
}
