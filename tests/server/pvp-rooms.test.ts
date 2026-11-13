import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { MAIN_ID, newProfile, pvpActorOwner, PVP_ELO_START } from "../../src/core";
import { DrizzlePvpStore } from "../../src/server/db/pvp";
import type { Db } from "../../src/server/db/store";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import { MemoryPvpStore, pvpGetMatch, pvpOverview, pvpPlay, type PvpStore } from "../../src/server/pvp";
import {
  normalizeRoomCode,
  makeRoomCode,
  pvpRoomCreate,
  pvpRoomFillAi,
  pvpRoomGet,
  pvpRoomHero,
  pvpRoomJoin,
  pvpRoomLeave,
  pvpRoomMove,
  pvpRoomStart,
  type PvpRoomDeps,
  type PvpRoomResult,
  type PvpRoomView,
} from "../../src/server/pvpRooms";

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

const ok = (r: PvpRoomResult): PvpRoomView => {
  assert.ok(r.ok, r.ok ? "" : r.error);
  return (r as { ok: true; room: PvpRoomView }).room;
};
const err = (r: PvpRoomResult) => (r.ok ? "ok" : r.error);

describe("PvP phòng: mã phòng", () => {
  it("chuẩn hóa mã, sinh mã không có ký tự dễ nhầm", () => {
    assert.equal(normalizeRoomCode(" abc234 "), "ABC234");
    assert.equal(normalizeRoomCode("ABC10O"), null);
    assert.equal(normalizeRoomCode("ABC"), null);
    assert.equal(normalizeRoomCode(5), null);
    for (let i = 0; i < 50; i++) assert.match(makeRoomCode(Math.random), /^[A-HJ-NP-Z2-9]{6}$/);
  });
});

for (const [name, factory] of stores) {
  describe(`PvP phòng 3vs3 (${name})`, () => {
    let n = 0;
    const setup = async () => {
      const pvp = await factory();
      const profiles: ProfileStore = new MemoryProfileStore();
      for (const id of USERS) await profiles.put(id, newProfile(), 0, T0);
      const codes = ["ABCDEF", "GHJKLM", "NPQRST"];
      let made = 0; // mã cố định theo thứ tự tạo phòng, để test viết gọn
      const mk = (now: number): PvpRoomDeps => ({
        pvp,
        profiles,
        now,
        seed: 777 + n++,
        newId: () => `room-match-${++n}`,
        newCode: () => codes[made++ % 3]!,
        nameOf: async (id) => `Tên ${id}`,
      });
      return { pvp, profiles, mk };
    };

    /** Phòng đủ sáu người, mỗi người đã chọn một tướng khác nhau trong phe. */
    const fullRoom = async (mk: (t: number) => PvpRoomDeps) => {
      const created = ok(await pvpRoomCreate("u1", mk(T0)));
      for (const u of USERS.slice(1)) ok(await pvpRoomJoin(u, created.code, mk(T0 + 100)));
      for (const [i, u] of USERS.entries()) {
        const view = ok(await pvpRoomGet(u, created.code, mk(T0 + 300)));
        const pick = view.heroes[1 + (view.slots.findIndex((s) => s.mine) % 3)]!;
        ok(await pvpRoomHero(u, i === 0 ? MAIN_ID : pick.id, undefined, mk(T0 + 400)));
      }
      return created.code;
    };

    it("tạo phòng, bạn bè vào bằng mã: chia đều hai phe, đủ sáu thì báo đầy, vào lại không đổi gì", async () => {
      const { mk } = await setup();
      const r = ok(await pvpRoomCreate("u1", mk(T0)));
      assert.match(r.code, /^[A-HJ-NP-Z2-9]{6}$/);
      assert.deepEqual([r.you.host, r.you.slot, r.status], [true, 0, "open"]);
      assert.equal(err(await pvpRoomCreate("u1", mk(T0 + 10))), "inRoom");
      const j = ok(await pvpRoomJoin("u2", r.code.toLowerCase(), mk(T0 + 100)));
      assert.equal(j.you.slot, 3, "người thứ hai vào phe còn lại");
      ok(await pvpRoomJoin("u3", r.code, mk(T0 + 200)));
      const again = ok(await pvpRoomJoin("u3", r.code, mk(T0 + 300)));
      assert.equal(again.you.slot, 1);
      for (const u of ["u4", "u5", "u6"]) ok(await pvpRoomJoin(u, r.code, mk(T0 + 400)));
      assert.equal(err(await pvpRoomJoin("u7", r.code, mk(T0 + 500))), "full");
      assert.equal(err(await pvpRoomJoin("u2", "ZZZZZZ", mk(T0 + 600))), "notFound");
      // Người đang ở phòng này không vào phòng khác được.
      assert.equal(err(await pvpRoomCreate("u2", mk(T0 + 700))), "inRoom");
    });

    it("chọn tướng: phải là tướng của mình, Đinh Bộ Lĩnh chỉ một người, không trùng tướng cùng phe", async () => {
      const { mk } = await setup();
      const r = ok(await pvpRoomCreate("u1", mk(T0)));
      ok(await pvpRoomJoin("u2", r.code, mk(T0 + 10)));
      ok(await pvpRoomJoin("u3", r.code, mk(T0 + 20))); // u3 cùng phe với u1
      const heroes = ok(await pvpRoomGet("u1", r.code, mk(T0 + 30))).heroes;
      assert.equal(heroes[0]!.id, MAIN_ID);
      assert.ok(heroes.length >= 3);
      assert.equal(err(await pvpRoomHero("u1", "khong-co-tuong-nay", undefined, mk(T0 + 40))), "badHero");
      assert.equal(err(await pvpRoomHero("u1", MAIN_ID, { element: "xyz", profession: "tuongSi" }, mk(T0 + 41))), "badBuild");
      const dbl = ok(await pvpRoomHero("u1", MAIN_ID, { element: "loi", profession: "phapSu" }, mk(T0 + 42)));
      assert.deepEqual([dbl.slots[0]!.hero?.id, dbl.slots[0]!.hero?.element, dbl.slots[0]!.hero?.profession], [MAIN_ID, "loi", "phapSu"]);
      assert.equal(err(await pvpRoomHero("u2", MAIN_ID, undefined, mk(T0 + 50))), "dblTaken");
      ok(await pvpRoomHero("u3", heroes[1]!.id, undefined, mk(T0 + 60)));
      // u1 cũng muốn tướng đó, nhưng u3 cùng phe đã lấy.
      assert.equal(err(await pvpRoomHero("u1", heroes[1]!.id, undefined, mk(T0 + 70))), "heroTaken");
      // Phe kia lấy được cùng tướng.
      ok(await pvpRoomHero("u2", heroes[1]!.id, undefined, mk(T0 + 80)));
      // Bỏ chọn rồi chọn lại.
      assert.equal(ok(await pvpRoomHero("u3", null, undefined, mk(T0 + 90))).slots[1]!.hero, null);
      assert.equal(err(await pvpRoomHero("u9", heroes[1]!.id, undefined, mk(T0 + 100))), "notMember");
    });

    it("đổi chỗ: sang chỗ trống được, chỗ có người thì không", async () => {
      const { mk } = await setup();
      const r = ok(await pvpRoomCreate("u1", mk(T0)));
      ok(await pvpRoomJoin("u2", r.code, mk(T0 + 10)));
      assert.equal(ok(await pvpRoomMove("u1", 2, mk(T0 + 20))).you.slot, 2);
      assert.equal(err(await pvpRoomMove("u1", 3, mk(T0 + 30))), "slotTaken");
      assert.equal(err(await pvpRoomMove("u1", 9, mk(T0 + 40))), "badSlot");
    });

    it("bắt đầu: cần chủ phòng, đủ người hoặc bật AI điền, mỗi người đã chọn tướng, mỗi phe có người thật", async () => {
      const { mk } = await setup();
      const r = ok(await pvpRoomCreate("u1", mk(T0)));
      assert.equal(r.startBlock, "needHumans");
      ok(await pvpRoomJoin("u2", r.code, mk(T0 + 10)));
      assert.equal(err(await pvpRoomStart("u1", mk(T0 + 20))), "needHero");
      const h = ok(await pvpRoomGet("u1", r.code, mk(T0 + 25))).heroes;
      ok(await pvpRoomHero("u1", h[1]!.id, undefined, mk(T0 + 30)));
      ok(await pvpRoomHero("u2", h[1]!.id, undefined, mk(T0 + 31)));
      assert.equal(err(await pvpRoomStart("u1", mk(T0 + 40))), "needFull");
      assert.equal(err(await pvpRoomStart("u2", mk(T0 + 41))), "notHost");
      assert.equal(err(await pvpRoomFillAi("u2", true, mk(T0 + 42))), "notHost");
      assert.equal(ok(await pvpRoomFillAi("u1", true, mk(T0 + 43))).startBlock, null);
    });

    it("bắt đầu với AI điền chỗ trống: trận giao hữu 3vs3, mỗi người thấy trận, chủ tướng mới đi được, xong không đổi điểm hay vàng", async () => {
      const { mk, pvp, profiles } = await setup();
      const r = ok(await pvpRoomCreate("u1", mk(T0)));
      ok(await pvpRoomJoin("u2", r.code, mk(T0 + 10)));
      const h = ok(await pvpRoomGet("u1", r.code, mk(T0 + 20))).heroes;
      ok(await pvpRoomHero("u1", MAIN_ID, undefined, mk(T0 + 30)));
      ok(await pvpRoomHero("u2", h[2]!.id, undefined, mk(T0 + 31)));
      ok(await pvpRoomFillAi("u1", true, mk(T0 + 40)));
      const started = ok(await pvpRoomStart("u1", mk(T0 + 50)));
      assert.equal(started.status, "started");
      assert.ok(started.matchId);
      assert.equal(err(await pvpRoomJoin("u3", r.code, mk(T0 + 60))), "started");
      assert.equal(err(await pvpRoomStart("u1", mk(T0 + 61))), "started");

      for (const u of ["u1", "u2"]) assert.equal((await pvpOverview(u, mk(T0 + 100))).matchId, started.matchId);
      const rec = (await pvp.getMatch(started.matchId!))!;
      assert.equal(rec.format, "team");
      assert.equal(rec.state.friendly, true);
      assert.deepEqual(rec.state.seats.map((s) => s.filter((p) => p === null).length), [2, 2]);
      assert.deepEqual(rec.state.captains, [0, 0]);
      assert.deepEqual(rec.state.battle.sides.map((s) => s.fighters.length), [3, 3]);
      const v = await pvpGetMatch(started.matchId!, "u1", mk(T0 + 200));
      assert.ok(v.ok);
      if (v.ok) {
        assert.equal(v.view.friendly, true);
        assert.equal(v.view.seats.length, 6);
        assert.equal(v.view.seats.find((s) => s.mine)?.name, "Tên u1");
        assert.equal(v.view.seats.filter((s) => s.ai).length, 4);
      }
      // Người không có tướng đang hành động không đi được.
      const owner = pvpActorOwner(rec.state);
      const other = owner === "u1" ? "u2" : "u1";
      if (owner !== null) {
        const bad = await pvpPlay(started.matchId!, other, { type: "swap", from: { row: 0, col: 0 }, to: { row: 0, col: 1 } }, mk(T0 + 300));
        assert.deepEqual([bad.ok, !bad.ok && bad.error], [false, "notYourTurn"]);
      }
      // Ép trận kết thúc: giao hữu không đổi điểm, không có vàng.
      const mid = (await pvp.getMatch(started.matchId!))!;
      const forced = { ...mid, state: { ...mid.state, battle: { ...mid.state.battle, winner: 0 as const } }, seq: mid.seq + 1 };
      assert.equal(await pvp.saveMatch(forced, mid.seq), true);
      const done = await pvpGetMatch(started.matchId!, "u1", mk(T0 + 400));
      assert.ok(done.ok);
      if (done.ok) assert.deepEqual([done.view.status, done.view.friendly, done.view.result], ["finished", true, null]);
      for (const u of ["u1", "u2"]) {
        assert.equal((await pvp.rating(u, "duel")).rating, PVP_ELO_START);
        assert.equal((await loadProfile(profiles, u)).profile.gold, newProfile().gold);
      }
      assert.equal((await pvp.getMatch(started.matchId!))!.settledAt !== null, true);
      // Trận xong thì rời phòng được để lập phòng mới.
      assert.equal((await pvpOverview("u1", mk(T0 + 500))).room, null);
      assert.ok(ok(await pvpRoomCreate("u1", mk(T0 + 600))).code);
    });

    it("sáu người thật: không cần AI, mỗi phe có đội trưởng là người thật ở vị trí đầu", async () => {
      const { mk, pvp } = await setup();
      const code = await fullRoom(mk);
      const room = ok(await pvpRoomGet("u1", code, mk(T0 + 450)));
      assert.equal(room.startBlock, null);
      const s = ok(await pvpRoomStart("u1", mk(T0 + 500)));
      const rec = (await pvp.getMatch(s.matchId!))!;
      assert.equal(rec.state.seats.flat().filter((p) => p === null).length, 0);
      assert.equal(rec.owners.length, 6);
      assert.deepEqual(rec.state.captains, [0, 0]);
      assert.equal(rec.state.battle.sides[0].fighters[0]!.id, MAIN_ID);
    });

    it("rời phòng: chủ phòng đi thì người khác làm chủ, hết người thì đóng phòng", async () => {
      const { mk } = await setup();
      const r = ok(await pvpRoomCreate("u1", mk(T0)));
      ok(await pvpRoomJoin("u2", r.code, mk(T0 + 10)));
      assert.deepEqual(await pvpRoomLeave("u1", mk(T0 + 20)), { ok: true });
      const view = ok(await pvpRoomGet("u2", r.code, mk(T0 + 30)));
      assert.equal(view.you.host, true);
      assert.equal(ok(await pvpRoomCreate("u1", mk(T0 + 40))).you.host, true);
      assert.deepEqual(await pvpRoomLeave("u2", mk(T0 + 50)), { ok: true });
      assert.equal(err(await pvpRoomJoin("u3", r.code, mk(T0 + 60))), "closed");
      assert.deepEqual(await pvpRoomLeave("u2", mk(T0 + 70)), { ok: false, error: "notMember" });
    });
  });
}
