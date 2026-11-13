import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { MAIN_ID, PVP_ELO_START, newProfile } from "../../src/core";
import { DrizzlePvpStore } from "../../src/server/db/pvp";
import type { Db } from "../../src/server/db/store";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import { MemoryPvpStore, pvpEnqueue, pvpGetMatch, pvpOverview, type PvpDeps, type PvpStore } from "../../src/server/pvp";
import { heroesOf } from "../../src/server/pvpRooms";
import { PVP_TEAM_FILL_MS } from "../../src/server/pvpTeam";

const T0 = 1_700_000_000_000;
const USERS = ["u1", "u2", "u3", "u4", "u5", "u6"];

async function makeDb(): Promise<PvpStore> {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzlePvpStore(db as unknown as Db);
}

const stores: readonly [string, () => Promise<PvpStore>][] = [
  ["bộ nhớ", async () => new MemoryPvpStore()],
  ["Postgres (PGlite, cùng migration với Neon)", makeDb],
];

for (const [name, factory] of stores) {
  describe(`PvP 3vs3 xếp hạng (${name})`, () => {
    let n = 0;
    const setup = async () => {
      const pvp = await factory();
      const profiles: ProfileStore = new MemoryProfileStore();
      for (const id of USERS) await profiles.put(id, newProfile(), 0, T0);
      const mk = (now: number): PvpDeps => ({ pvp, profiles, now, seed: 99 + n++, newId: () => `team-${++n}`, nameOf: async (id) => `Tên ${id}` });
      const heroes = await heroesOf("u1", mk(T0));
      return { pvp, profiles, mk, heroes };
    };

    it("vào hàng đợi cần chọn tướng của mình; tướng lạ bị từ chối", async () => {
      const { mk } = await setup();
      assert.deepEqual(await pvpEnqueue("u1", "team", mk(T0)), { ok: false, error: "badHero" });
      assert.deepEqual(await pvpEnqueue("u1", "team", mk(T0), { hero: "khongCo" }), { ok: false, error: "badHero" });
      assert.deepEqual(await pvpEnqueue("u1", "team", mk(T0), { hero: MAIN_ID }), { ok: true });
      assert.equal((await pvpOverview("u1", mk(T0 + 100))).queue?.format, "team");
    });

    it("chưa chờ đủ lâu thì chưa ghép; chờ đủ thì máy điền chỗ trống, hai phe cân nhau, không trùng tướng", async () => {
      const { mk, pvp, heroes } = await setup();
      const picks = [heroes[0]!.id, heroes[1]!.id, heroes[2]!.id];
      for (const [i, hero] of picks.entries()) await pvpEnqueue(USERS[i]!, "team", mk(T0), { hero });
      for (const u of USERS.slice(0, 3)) assert.equal((await pvpOverview(u, mk(T0 + 5_000))).matchId, null);
      const id = (await pvpOverview("u1", mk(T0 + PVP_TEAM_FILL_MS + 1000))).matchId;
      assert.ok(id);
      for (const u of USERS.slice(0, 3)) assert.equal((await pvpOverview(u, mk(T0 + PVP_TEAM_FILL_MS + 2000))).matchId, id);
      const rec = (await pvp.getMatch(id!))!;
      assert.equal(rec.format, "team");
      assert.notEqual(rec.state.friendly, true);
      assert.deepEqual(rec.state.battle.sides.map((s) => s.fighters.length), [3, 3]);
      assert.deepEqual(rec.state.seats.map((s) => s.filter((p) => p !== null).length), [1, 2]);
      for (const side of rec.state.battle.sides) assert.equal(new Set(side.fighters.map((f) => f.id)).size, 3);
      const v = await pvpGetMatch(id!, "u1", mk(T0 + 30_000));
      assert.ok(v.ok);
      if (v.ok) assert.equal(v.view.seats.find((s) => s.mine)?.name, "Tên u1");
    });

    it("hai người trùng tướng không vào cùng trận dù chờ lâu", async () => {
      const { mk, heroes } = await setup();
      await pvpEnqueue("u1", "team", mk(T0), { hero: heroes[1]!.id });
      await pvpEnqueue("u2", "team", mk(T0), { hero: heroes[1]!.id });
      assert.equal((await pvpOverview("u1", mk(T0 + PVP_TEAM_FILL_MS + 100))).matchId, null);
      assert.equal((await pvpOverview("u2", mk(T0 + PVP_TEAM_FILL_MS + 200))).matchId, null);
    });

    it("xong trận: điểm và vàng tính riêng từng người, trận có máy thì ít điểm hơn", async () => {
      const { mk, pvp, profiles, heroes } = await setup();
      const picks = [heroes[0]!.id, heroes[1]!.id, heroes[2]!.id];
      for (const [i, hero] of picks.entries()) await pvpEnqueue(USERS[i]!, "team", mk(T0), { hero });
      const id = (await pvpOverview("u1", mk(T0 + PVP_TEAM_FILL_MS + 1000))).matchId!;
      const mid = (await pvp.getMatch(id))!;
      const forced = { ...mid, state: { ...mid.state, battle: { ...mid.state.battle, winner: 0 as const } }, seq: mid.seq + 1 };
      assert.equal(await pvp.saveMatch(forced, mid.seq), true);
      await pvpGetMatch(id, "u1", mk(T0 + 40_000));
      const side0 = mid.state.seats[0].filter((p): p is string => p !== null);
      const side1 = mid.state.seats[1].filter((p): p is string => p !== null);
      for (const w of side0) {
        assert.equal((await loadProfile(profiles, w)).profile.gold > 0, true);
        const r = await pvp.rating(w, "team");
        assert.equal(r.wins, 1);
        assert.ok(r.rating > PVP_ELO_START);
      }
      for (const l of side1) assert.equal((await pvp.rating(l, "team")).losses, 1);
      assert.equal((await pvp.rating(side0[0]!, "duel")).wins, 0);
    });
  });
}
