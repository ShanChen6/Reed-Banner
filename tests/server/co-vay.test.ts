import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { BLACK, PASS, WHITE } from "../../src/core/co-vay";
import { DrizzleGoStore } from "../../src/server/db/coVay";
import type { Db } from "../../src/server/db/store";
import { GO_ROOM_TTL_MS, MemoryGoStore, goGet, goHost, goJoin, goMove, goResignMatch, type GoApiResult, type GoDeps, type GoStore, type GoView } from "../../src/server/coVay";

const T0 = 1_700_000_000_000;

async function makeDb(): Promise<GoStore> {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzleGoStore(db as unknown as Db);
}

const stores: readonly [string, () => Promise<GoStore>][] = [
  ["bộ nhớ", async () => new MemoryGoStore()],
  ["Postgres (PGlite, cùng migration với Neon)", makeDb],
];

function harness(store: GoStore) {
  let now = T0;
  let n = 0;
  const deps = (): GoDeps => ({ store, now, newId: () => `go-${++n}`, newCode: () => `CODE${n}A`.slice(0, 6), nameOf: async (id) => `Tên ${id}` });
  return { deps, tick: (ms: number) => (now += ms) };
}

function ok(r: GoApiResult): GoView {
  assert.ok(r.ok, r.ok ? "" : r.error);
  return r.view;
}

for (const [label, make] of stores) {
  describe(`Vây Thành Kỳ đấu người (${label})`, () => {
    it("mở phòng, vào bằng mã, đi luân phiên rồi đếm điểm khi hai bên bỏ lượt", async () => {
      const h = harness(await make());
      const room = ok(await goHost("an", { size: 9, mode: "full", clock: 10, element: "hoa" }, h.deps()));
      assert.equal(room.status, "waiting");
      assert.equal(room.you, BLACK);
      assert.ok(room.code);
      assert.deepEqual(await goMove("an", room.id, 40, h.deps()), { ok: false, error: "waiting" });
      assert.deepEqual(await goJoin("an", room.code!, { element: "thuy" }, h.deps()), { ok: false, error: "ownRoom" });

      const joined = ok(await goJoin("binh", room.code!, { element: "hoa" }, h.deps()));
      assert.equal(joined.you, WHITE);
      assert.equal(joined.elements[BLACK], "hoa");
      assert.notEqual(joined.elements[WHITE], "hoa", "trùng hệ thì server đổi hệ khác");
      assert.deepEqual(await goJoin("chi", room.code!, { element: "moc" }, h.deps()), { ok: false, error: "notFound" });

      h.tick(3000);
      assert.deepEqual(await goMove("binh", room.id, 40, h.deps()), { ok: false, error: "notYourTurn" });
      const a = ok(await goMove("an", room.id, 40, h.deps()));
      assert.equal(a.timeLeft[BLACK], 10 * 60_000 - 3000);
      assert.deepEqual(await goMove("binh", room.id, 40, h.deps()), { ok: false, error: "illegal" });
      ok(await goMove("binh", room.id, PASS, h.deps()));
      const end = ok(await goMove("an", room.id, PASS, h.deps()));
      assert.equal(end.status, "ended");
      assert.equal(end.result?.reason, "score");
      assert.equal(end.result?.winner, BLACK);
      assert.deepEqual(await goGet("chi", room.id, h.deps()), { ok: false, error: "notMember" });
    });

    it("hết giờ xử khi có request tới; đầu hàng; hủy phòng", async () => {
      const h = harness(await make());
      const room = ok(await goHost("an", { size: 13, mode: "capture", clock: 10, element: "kim" }, h.deps()));
      ok(await goJoin("binh", room.code!, { element: "loi" }, h.deps()));
      h.tick(10 * 60_000 + 1);
      const late = ok(await goGet("binh", room.id, h.deps()));
      assert.deepEqual(late.result, { winner: WHITE, reason: "timeout" });

      const r2 = ok(await goHost("an", { size: 19, mode: "full", clock: 20, element: "moc" }, h.deps()));
      ok(await goJoin("binh", r2.code!, { element: "phong" }, h.deps()));
      const gave = ok(await goResignMatch("binh", r2.id, h.deps()));
      assert.equal(gave.result?.winner, BLACK);

      const r3 = ok(await goHost("an", { size: 9, mode: "full", clock: 30, element: "tho" }, h.deps()));
      const closed = ok(await goResignMatch("an", r3.id, h.deps()));
      assert.equal(closed.status, "ended");
      assert.deepEqual(await goJoin("binh", r3.code!, { element: "moc" }, h.deps()), { ok: false, error: "notFound" });
    });

    it("mã quá hạn và lệnh sai", async () => {
      const h = harness(await make());
      const room = ok(await goHost("an", { size: 9, mode: "full", clock: 10, element: "hoa" }, h.deps()));
      h.tick(GO_ROOM_TTL_MS + 1);
      assert.deepEqual(await goJoin("binh", room.code!, { element: "moc" }, h.deps()), { ok: false, error: "notFound" });
      assert.deepEqual(await goHost("an", { size: 10, mode: "full", clock: 10, element: "hoa" }, h.deps()), { ok: false, error: "badRequest" });
      assert.deepEqual(await goHost("an", { size: 9, mode: "full", clock: 5, element: "hoa" }, h.deps()), { ok: false, error: "badRequest" });
      assert.deepEqual(await goHost("an", { size: 9, mode: "full", clock: 10, element: "lua" }, h.deps()), { ok: false, error: "badRequest" });
    });
  });
}
