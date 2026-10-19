// Lưu hồ sơ tiến trình vào Postgres bằng Drizzle, ghi kèm điều kiện version.

import { and, eq } from "drizzle-orm";
import type { Profile } from "@/core";
import type { ProfileStore, StoredProfile } from "../profiles";
import { profiles } from "./schema";
import type { Db } from "./store";

export class DrizzleProfileStore implements ProfileStore {
  constructor(private readonly db: Db) {}

  async get(ownerId: string): Promise<StoredProfile | null> {
    const [row] = await this.db.select().from(profiles).where(eq(profiles.ownerId, ownerId)).limit(1);
    return row ? { profile: row.data, version: row.version } : null;
  }

  async put(ownerId: string, profile: Profile, expected: number, now: number): Promise<boolean> {
    const rows =
      expected === 0
        ? await this.db
            .insert(profiles)
            .values({ ownerId, version: 1, data: profile, updatedAt: now })
            .onConflictDoNothing()
            .returning({ ownerId: profiles.ownerId })
        : await this.db
            .update(profiles)
            .set({ version: expected + 1, data: profile, updatedAt: now })
            .where(and(eq(profiles.ownerId, ownerId), eq(profiles.version, expected)))
            .returning({ ownerId: profiles.ownerId });
    return rows.length > 0;
  }
}
