import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { DTK_GOLD, DTK_REWARDS_PER_DAY, chooseAction } from "../../src/core/dien-trang-ky";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { DrizzleDtkStore } from "../../src/server/db/dienTrangKy";
import type { Db } from "../../src/server/db/store";
import {
  DTK_TURN_MS,
  MemoryDtkStore,
  dtkAct,
  dtkAddBot,
  dtkGet,
  dtkHost,
  dtkJoin,
  dtkSetColor,
  dtkRemoveSeat,
  dtkResign,
  dtkStart,
  dtkStartAi,
  parseDtkAction,
  type DtkApiResult,
  type DtkDeps,
  type DtkStore,
  type DtkView,
} from "../../src/server/dienTrangKy";

const T0 = 1_700_000_000_000;

async function makeDb(): Promise<DtkStore> {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzleDtkStore(db as unknown as Db);
}

const stores: readonly [string, () => Promise<DtkStore>][] = [
  ["bộ nhớ", async () => new MemoryDtkStore()],
  ["Postgres (PGlite, cùng migration với Neon)", makeDb],
];

function harness(store: DtkStore) {
  let now = T0;
  let n = 0;
  const profiles = new MemoryProfileStore();
  const deps = (): DtkDeps => ({
    store,
    profiles,
    now,
    newId: () => `dtk-${++n}`,
    newCode: () => `ROOM${n}`.padEnd(6, "X").slice(0, 6),
    newSeed: () => 1000 + n,
    nameOf: async (id) => `Tên ${id}`,
  });
  return { deps, profiles, tick: (ms: number) => (now += ms) };
}

function ok(r: DtkApiResult): DtkView {
  assert.ok(r.ok, r.ok ? "" : r.error);
  return r.view;
}

/** Người chơi ra lệnh như máy cho tới khi ván xong. */
async function playOut(h: ReturnType<typeof harness>, owner: string, v: DtkView): Promise<DtkView> {
  for (let i = 0; i < 5000 && v.state && v.state.phase.k !== "ended"; i++) {
    assert.equal(v.state.turn, v.you, "máy phải đi hết trước khi trả về");
    v = ok(await dtkAct(owner, v.id, chooseAction(v.state), h.deps()));
  }
  return v;
}

for (const [label, make] of stores) {
  describe(`Điền Trang Ký trên server (${label})`, () => {
    it("đấu sứ quân: máy đi ngay, xong ván cộng vàng theo hạng", async () => {
      const h = harness(await make());
      const before = (await loadProfile(h.profiles, "a")).profile.gold;
      let v = ok(await dtkStartAi("a", { element: "hoa", rivals: ["tranLam", "lyKhue", "doCanhThac"] }, h.deps()));
      assert.equal(v.seats.length, 4);
      assert.equal(new Set(v.seats.map((s) => s.element)).size, 4);
      v = await playOut(h, "a", v);
      assert.equal(v.status, "ended");
      const rank = v.state!.ranking!.indexOf(0);
      const due = DTK_GOLD[4]![rank]!;
      assert.equal(v.reward, due > 0 ? due : null);
      assert.equal((await loadProfile(h.profiles, "a")).profile.gold - before, due);
    });

    it("giới hạn số ván có vàng mỗi ngày", async () => {
      const h = harness(await make());
      let paid = 0;
      let capped = 0;
      for (let g = 0; g < 12 && capped === 0; g++) {
        let v = ok(await dtkStartAi("a", { element: "kim", rivals: ["kieuThuan"] }, h.deps()));
        v = await playOut(h, "a", v);
        if (v.reward) paid++;
        if (v.rewardCapped) capped++;
      }
      assert.equal(paid, DTK_REWARDS_PER_DAY);
      assert.equal(capped, 1);
    });

    it("lệnh sai và người ngoài bị chặn", async () => {
      const h = harness(await make());
      assert.deepEqual(await dtkStartAi("a", { element: "hoa", rivals: [] }, h.deps()), { ok: false, error: "badRequest" });
      assert.deepEqual(await dtkStartAi("a", { element: "hoa", rivals: ["tranLam", "tranLam"] }, h.deps()), { ok: false, error: "badRequest" });
      const v = ok(await dtkStartAi("a", { element: "hoa", rivals: ["tranLam"] }, h.deps()));
      assert.deepEqual(await dtkGet("b", v.id, h.deps()), { ok: false, error: "notMember" });
      assert.deepEqual(await dtkAct("a", v.id, { t: "pay" }, h.deps()), { ok: false, error: "illegal" });
      assert.equal(parseDtkAction({ t: "buy", level: 2 })?.t, "buy");
      assert.equal(parseDtkAction({ t: "buy", level: -1 }), null);
      assert.equal(parseDtkAction({ t: "hack" }), null);
    });

    it("phòng mã: vào phòng, thêm máy, khai cuộc, quá giờ thì máy đi thay", async () => {
      const h = harness(await make());
      const room = ok(await dtkHost("a", { element: "thuy", color: "lam" }, h.deps()));
      assert.ok(room.code);
      // Cùng hệ vẫn được; màu đã có người chọn thì bị khóa.
      assert.deepEqual(await dtkJoin("b", room.code!, { element: "thuy", color: "lam" }, h.deps()), { ok: false, error: "colorTaken" });
      const joined = ok(await dtkJoin("b", room.code!, { element: "thuy", color: "son" }, h.deps()));
      assert.equal(joined.you, 1);
      assert.equal(joined.seats[1]!.element, "thuy");
      assert.deepEqual(joined.seats.map((x) => x.color), ["lam", "son"]);
      assert.deepEqual(await dtkSetColor("b", room.id, "lam", h.deps()), { ok: false, error: "colorTaken" });
      assert.equal(ok(await dtkSetColor("b", room.id, "luc", h.deps())).seats[1]!.color, "luc");
      assert.deepEqual(await dtkAddBot("b", room.id, "tranLam", h.deps()), { ok: false, error: "notHost" });
      ok(await dtkAddBot("a", room.id, "tranLam", h.deps()));
      ok(await dtkAddBot("a", room.id, "lyKhue", h.deps()));
      assert.deepEqual(await dtkJoin("c", room.code!, { element: "kim" }, h.deps()), { ok: false, error: "full" });
      ok(await dtkRemoveSeat("a", room.id, 3, h.deps()));
      const started = ok(await dtkStart("a", room.id, h.deps()));
      assert.equal(started.status, "playing");
      assert.equal(new Set(started.state!.players.map((p) => p.color)).size, started.state!.players.length);
      assert.equal(started.state!.turn, 0);
      assert.equal(started.turnLeftMs, DTK_TURN_MS);

      // Người ghế 0 để quá giờ: máy đi thay, lượt sang người khác.
      h.tick(DTK_TURN_MS + 1);
      const after = ok(await dtkGet("b", room.id, h.deps()));
      assert.ok(after.seq > started.seq);
      assert.ok(after.state!.log.length > started.state!.log.length);
    });

    it("phòng mã: cả hai người chơi tới cuối, mỗi người nhận vàng theo hạng của mình", async () => {
      const h = harness(await make());
      const room = ok(await dtkHost("a", { element: "hoa" }, h.deps()));
      ok(await dtkJoin("b", room.code!, { element: "moc" }, h.deps()));
      let v = ok(await dtkStart("a", room.id, h.deps()));
      for (let i = 0; i < 6000 && v.state!.phase.k !== "ended"; i++) {
        const who = v.state!.turn === 0 ? "a" : "b";
        v = ok(await dtkAct(who, v.id, chooseAction(v.state!), h.deps()));
      }
      assert.equal(v.status, "ended");
      const winner = v.state!.ranking![0] === 0 ? "a" : "b";
      const w = ok(await dtkGet(winner, v.id, h.deps()));
      assert.equal(w.reward, DTK_GOLD[2]![0]);
    });

    it("rời ván: chủ phòng rời phòng chờ là đóng phòng; đang chơi thì như phá sản", async () => {
      const h = harness(await make());
      const room = ok(await dtkHost("a", { element: "hoa" }, h.deps()));
      ok(await dtkJoin("b", room.code!, { element: "moc" }, h.deps()));
      const left = ok(await dtkResign("b", room.id, h.deps()));
      assert.equal(left.you, -1);
      const closed = ok(await dtkResign("a", room.id, h.deps()));
      assert.equal(closed.status, "ended");

      const v = ok(await dtkStartAi("a", { element: "hoa", rivals: ["tranLam", "lyKhue"] }, h.deps()));
      const gave = ok(await dtkResign("a", v.id, h.deps()));
      assert.equal(gave.status, "ended");
      assert.equal(gave.state!.ranking!.at(-1), 0);
      assert.equal(gave.reward, null);
    });
  });
}
