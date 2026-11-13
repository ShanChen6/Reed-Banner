import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { PVP_DRAFT_TURN_MS, PVP_ELO_START, newProfile } from "../../src/core";
import { DrizzlePvpStore } from "../../src/server/db/pvp";
import type { Db } from "../../src/server/db/store";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import { MemoryPvpStore, pvpEnqueue, pvpGetMatch, pvpOverview, type PvpDeps, type PvpStore } from "../../src/server/pvp";
import { pvpDraftGet, pvpDraftPlay, type PvpDraftView } from "../../src/server/pvpDraft";
import { PVP_TEAM_FILL_MS } from "../../src/server/pvpTeam";

const T0 = 1_700_000_000_000;
const USERS = ["u1", "u2", "u3"];

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
      return { pvp, profiles, mk };
    };

    /** Ba người xếp hàng, chờ đủ lâu để máy điền chỗ: trả mã phiên cấm chọn. */
    const toDraft = async (mk: (t: number) => PvpDeps) => {
      for (const u of USERS) assert.deepEqual(await pvpEnqueue(u, "team", mk(T0)), { ok: true });
      for (const u of USERS) assert.equal((await pvpOverview(u, mk(T0 + 5_000))).draftId, null);
      const o = await pvpOverview("u1", mk(T0 + PVP_TEAM_FILL_MS + 1000));
      assert.ok(o.draftId);
      assert.equal(o.matchId, null);
      assert.equal(o.queue, null);
      for (const u of USERS) assert.equal((await pvpOverview(u, mk(T0 + PVP_TEAM_FILL_MS + 1500))).draftId, o.draftId);
      return o.draftId!;
    };

    const view = async (id: string, u: string, mk: (t: number) => PvpDeps, t: number): Promise<PvpDraftView> => {
      const r = await pvpDraftGet(id, u, mk(t));
      assert.ok(r.ok);
      return (r as { ok: true; view: PvpDraftView }).view;
    };

    it("chưa chờ đủ lâu thì chưa ghép; vào hàng đợi không cần chọn tướng", async () => {
      const { mk } = await setup();
      await pvpEnqueue("u1", "team", mk(T0));
      assert.equal((await pvpOverview("u1", mk(T0 + 100))).queue?.format, "team");
      assert.equal((await pvpOverview("u1", mk(T0 + PVP_TEAM_FILL_MS + 1000))).draftId, null);
    });

    it("cấm chọn tay: chỉ người tới lượt làm được, xong thì dựng trận 3vs3 xếp hạng có máy điền chỗ trống", async () => {
      const { mk, pvp } = await setup();
      const id = await toDraft(mk);
      let t = T0 + PVP_TEAM_FILL_MS + 2000;
      let v = await view(id, "u1", mk, t);
      assert.equal(v.status, "active");
      assert.equal(v.steps.filter((s) => s.kind === "ban").length, 6);
      const names = ["u1", "u2", "u3"];
      // Người không tới lượt bị từ chối.
      const stranger = names.find((u) => v.turn?.name !== `Tên ${u}`)!;
      const bad = await pvpDraftPlay(id, stranger, { type: "ban", ban: { kind: "element", value: "kim" } }, mk(t));
      assert.deepEqual(bad.ok ? "ok" : bad.error, "notYourTurn");
      assert.deepEqual((await pvpDraftGet("khongCo", "u1", mk(t))).ok, false);
      assert.deepEqual((await pvpDraftGet(id, "u9", mk(t))).ok, false);
      for (let guard = 0; guard < 20 && v.status === "active"; guard++) {
        t += 1000;
        const who = names.find((u) => v.turn?.name === `Tên ${u}`)!;
        const mine = await view(id, who, mk, t);
        const free = mine.choices.find((c) => c.error === null);
        if (mine.turn!.kind === "pick" && !free) {
          // Người này không còn tướng nào chọn được: bỏ lượt cho hết giờ.
          t += PVP_DRAFT_TURN_MS;
          v = await view(id, who, mk, t);
          continue;
        }
        const res =
          mine.turn!.kind === "ban"
            ? await pvpDraftPlay(id, who, { type: "ban", ban: { kind: "hero", id: mine.roster[0]!.id } }, mk(t))
            : await pvpDraftPlay(id, who, { type: "pick", hero: free!.hero.id }, mk(t));
        assert.ok(res.ok, res.ok ? "" : res.error);
        v = (res as { ok: true; view: PvpDraftView }).view;
      }
      assert.equal(v.status, "done");
      assert.ok(v.matchId);
      const rec = (await pvp.getMatch(v.matchId!))!;
      assert.equal(rec.format, "team");
      assert.notEqual(rec.state.friendly, true);
      assert.deepEqual(rec.state.battle.sides.map((s) => s.fighters.length), [3, 3]);
      assert.equal(rec.state.seats.flat().filter((p) => p !== null).length, 3);
      assert.deepEqual(rec.state.battle.sides.map((x) => x.rages), [[0, 0, 0], [0, 0, 0]]);
      for (const side of rec.state.battle.sides) assert.equal(new Set(side.fighters.map((f) => f.id)).size, 3);
      for (const u of USERS) assert.equal((await pvpOverview(u, mk(t + 100))).matchId, v.matchId);
      const m = await pvpGetMatch(v.matchId!, "u1", mk(t + 200));
      assert.ok(m.ok);
      if (m.ok) assert.equal(m.view.seats.find((s) => s.mine)?.name, "Tên u1");
    });

    it("không ai bấm: hết giờ máy cấm, chọn thay, người hỏi sau vẫn vào được trận; không vào hàng đợi lại khi đang cấm chọn", async () => {
      const { mk, pvp } = await setup();
      const id = await toDraft(mk);
      assert.deepEqual(await pvpEnqueue("u1", "team", mk(T0 + PVP_TEAM_FILL_MS + 3000)), { ok: false, error: "inMatch" });
      const v = await view(id, "u2", mk, T0 + PVP_TEAM_FILL_MS + 3000 + 20 * PVP_DRAFT_TURN_MS);
      assert.equal(v.status, "done");
      assert.ok(v.bans.every((b) => b.auto));
      const rec = (await pvp.getMatch(v.matchId!))!;
      assert.equal(rec.state.seats.flat().filter((p) => p !== null).length, 3);
      assert.deepEqual((await pvpOverview("u3", mk(T0 + PVP_TEAM_FILL_MS + 4000 + 20 * PVP_DRAFT_TURN_MS))).matchId, v.matchId);
    });

    it("xong trận: điểm và vàng tính riêng từng người ở 3vs3, không đụng điểm 1vs1", async () => {
      const { mk, pvp, profiles } = await setup();
      const id = await toDraft(mk);
      const t = T0 + PVP_TEAM_FILL_MS + 3000 + 20 * PVP_DRAFT_TURN_MS;
      const v = await view(id, "u1", mk, t);
      const mid = (await pvp.getMatch(v.matchId!))!;
      const forced = { ...mid, state: { ...mid.state, battle: { ...mid.state.battle, winner: 0 as const } }, seq: mid.seq + 1 };
      assert.equal(await pvp.saveMatch(forced, mid.seq), true);
      await pvpGetMatch(v.matchId!, "u1", mk(t + 1000));
      const side0 = mid.state.seats[0].filter((p): p is string => p !== null);
      const side1 = mid.state.seats[1].filter((p): p is string => p !== null);
      for (const w of side0) {
        assert.equal((await loadProfile(profiles, w)).profile.gold > 0, true);
        const r = await pvp.rating(w, "team");
        assert.equal(r.wins, 1);
        assert.ok(r.rating > PVP_ELO_START);
      }
      for (const l of side1) assert.equal((await pvp.rating(l, "team")).losses, 1);
      assert.equal((await pvp.rating("u1", "duel")).wins, 0);
    });
  });
}
