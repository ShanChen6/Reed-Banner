import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { mainCharacter, startMatch, STARTER_COMPANIONS } from "../../src/core";
import { DrizzleMatchStore, type Db } from "../../src/server/db/store";

describe("lưu trận vào Postgres (PGlite, cùng migration với Neon)", () => {
  it("tạo, đọc, ghi kèm điều kiện seq", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleMatchStore(db as unknown as Db);
    const { match } = startMatch({
      sides: [
        { fighters: [mainCharacter()], leader: 0 },
        { fighters: [STARTER_COMPANIONS[0]!], leader: 0 },
      ],
      difficulty: "normal",
      seed: 9,
      firstSide: 0,
      now: 1000,
    });
    const record = { id: "m_1", ownerId: "g_1", match, createdAt: 1000, updatedAt: 1000 };
    await store.create(record);
    assert.deepEqual(await store.get("m_1"), record);
    assert.equal(await store.get("m_khong"), null);
    const next = { ...record, match: { ...match, seq: match.seq + 1 }, updatedAt: 2000 };
    assert.equal(await store.save(next, match.seq), true);
    assert.equal(await store.save(next, match.seq), false);
    assert.equal((await store.get("m_1"))!.match.seq, match.seq + 1);
  });
});
