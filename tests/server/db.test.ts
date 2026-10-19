import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { mainCharacter, startMatch, STARTER_COMPANIONS } from "../../src/core";
import { DrizzleAccountStore } from "../../src/server/db/accounts";
import { DrizzleMatchStore, type Db } from "../../src/server/db/store";
import { signIn } from "../../src/server/accounts";

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

  it("tài khoản: gắn danh tính, vào lại, gắn thêm nhà cung cấp, danh tính không đổi chủ", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleAccountStore(db as unknown as Db);
    const google = { provider: "google" as const, subject: "s1", name: "Shan", avatarUrl: null };
    assert.equal(await signIn(store, google, "g_1", 10, () => "g_moi"), "g_1");
    assert.equal(await signIn(store, { ...google, name: "Shan mới" }, "g_2", 20, () => "g_moi"), "g_1");
    assert.equal(await signIn(store, { provider: "github", subject: "7", name: "gh", avatarUrl: "https://a" }, "g_1", 30, () => "g_moi"), "g_1");
    assert.deepEqual(await store.get("g_1"), {
      id: "g_1",
      name: "gh",
      avatarUrl: "https://a",
      providers: ["github", "google"],
      username: null,
      createdAt: 10,
      lastLoginAt: 30,
    });
    // Gắn thẳng danh tính đã có chủ vào tài khoản khác: vẫn thuộc chủ cũ.
    assert.equal(await store.link("g_3", google, 40), "g_1");
    assert.equal(await store.get("g_2"), null);
  });

  it("mật khẩu: tạo, trùng tên, cập nhật số lần sai và khóa, tên đăng nhập trong tài khoản", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleAccountStore(db as unknown as Db);
    assert.equal(await store.createPassword("g_1", "shan", "h1", 10), true);
    assert.equal(await store.createPassword("g_2", "shan", "h2", 11), false);
    assert.deepEqual(await store.getPassword("shan"), { accountId: "g_1", hash: "h1", failedCount: 0, lockedUntil: null });
    assert.equal(await store.getPassword("khong"), null);
    await store.updatePassword("shan", { failedCount: 3 });
    await store.updatePassword("shan", { lockedUntil: 99 });
    assert.deepEqual(await store.getPassword("shan"), { accountId: "g_1", hash: "h1", failedCount: 3, lockedUntil: 99 });
    await store.updatePassword("shan", { hash: "h3", failedCount: 0, lockedUntil: null });
    assert.deepEqual(await store.getPassword("shan"), { accountId: "g_1", hash: "h3", failedCount: 0, lockedUntil: null });
    const acc = await store.get("g_1");
    assert.equal(acc?.username, "shan");
    assert.equal(acc?.name, "shan");
    assert.deepEqual(acc?.providers, []);
    // Tài khoản GitHub có sẵn thêm mật khẩu: giữ tên hiển thị.
    await store.link("g_3", { provider: "github", subject: "9", name: "Gh", avatarUrl: null }, 20);
    assert.equal(await store.createPassword("g_3", "gh_user", "h", 21), true);
    assert.equal((await store.get("g_3"))?.name, "Gh");
  });
});
