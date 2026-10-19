import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { ABANDON_MS, newProfile } from "../../src/core";
import { signIn } from "../../src/server/accounts";
import { createBattleFor, parseNewBattle, settleAbandoned } from "../../src/server/battles";
import { DrizzleAccountStore } from "../../src/server/db/accounts";
import { deleteGuests, staleGuestIds, staleMatchIds } from "../../src/server/db/maintenance";
import { DrizzleProfileStore } from "../../src/server/db/profiles";
import { DrizzleMatchStore, type Db } from "../../src/server/db/store";
import { loadProfile } from "../../src/server/profiles";

const T0 = 5_000_000;
const DAY = 24 * 60 * 60 * 1000;
const input = parseNewBattle({ mode: "1v1", element: "moc", profession: "tuongSi", companions: [], difficulty: "easy" })!;

async function setup() {
  const db = drizzle(new PGlite()) as unknown as Db;
  await migrate(db as never, { migrationsFolder: "drizzle" });
  return { db, store: new DrizzleMatchStore(db), profiles: new DrizzleProfileStore(db), accounts: new DrizzleAccountStore(db) };
}

describe("việc định kỳ (Postgres qua PGlite)", () => {
  it("chốt trận bỏ dở quá 24 giờ và cộng thưởng một lần, không đụng trận còn mới", async () => {
    const { db, store, profiles } = await setup();
    let n = 0;
    const deps = { store, profiles, seed: 7, newId: () => `m_${++n}` };
    await createBattleFor("g_old", input, { ...deps, now: T0 });
    await createBattleFor("g_new", input, { ...deps, now: T0 + 2 * DAY });
    const now = T0 + ABANDON_MS + DAY;
    const ids = await staleMatchIds(db, now - ABANDON_MS, 10);
    assert.deepEqual(ids, ["m_1"]);
    assert.equal(await settleAbandoned(ids, { store, profiles, now }), 1);
    assert.ok((await store.get("m_1"))!.match.forfeited);
    assert.ok((await loadProfile(profiles, "g_old")).profile.main.xp > 0);
    // Đã cộng thưởng thì lần sau không còn trong danh sách.
    assert.deepEqual(await staleMatchIds(db, now - ABANDON_MS, 10), []);
  });

  it("xóa khách không chơi quá 30 ngày, giữ tài khoản đã đăng nhập và khách còn chơi", async () => {
    const { db, store, profiles, accounts } = await setup();
    let n = 0;
    const deps = { store, profiles, seed: 7, newId: () => `m_${++n}` };
    await createBattleFor("g_cu", input, { ...deps, now: T0 });
    await profiles.put("g_cu", newProfile(), 0, T0);
    await createBattleFor("g_acc", input, { ...deps, now: T0 });
    await signIn(accounts, { provider: "github", subject: "1", name: "Shan", avatarUrl: null }, "g_acc", T0, () => "x");
    await profiles.put("g_moi", newProfile(), 0, T0 + 40 * DAY);
    const before = T0 + 10 * DAY;
    const stale = await staleGuestIds(db, before, 10);
    assert.deepEqual(stale, ["g_cu"]);
    await deleteGuests(db, stale);
    assert.equal(await store.get("m_1"), null);
    assert.equal(await profiles.get("g_cu"), null);
    assert.ok(await store.get("m_2"));
    assert.ok(await profiles.get("g_moi"));
    await deleteGuests(db, []);
  });
});
