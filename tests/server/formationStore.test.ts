import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { RULESETS, createPuzzle } from "../../src/core/binh-phap";
import { DrizzleFormationStore } from "../../src/server/db/formation";
import type { Db } from "../../src/server/db/store";
import { MemoryFormationStore, type FormationEntry, type FormationStore } from "../../src/server/formation";

const state = createPuzzle(RULESETS[1]!, 7);

function entry(over: Partial<FormationEntry> & { id: string; ownerId: string }): FormationEntry {
  return {
    level: "thuong",
    period: "2026-11-04",
    name: null,
    state,
    seq: 3,
    status: "won",
    score: 1000,
    turns: 40,
    startedAt: 1,
    finishedAt: 100,
    claimedAt: null,
    rewardGold: null,
    ...over,
  };
}

/** Cùng một bộ kiểm tra cho kho trong bộ nhớ và kho Postgres: thứ tự hạng, tạo một lần, ghi theo seq, nhận một lần. */
function contract(name: string, make: () => Promise<FormationStore>) {
  describe(name, () => {
    it("mỗi người một ván mỗi kỳ mỗi bậc; kỳ hoặc bậc khác thì được", async () => {
      const s = await make();
      assert.equal(await s.create(entry({ id: "1", ownerId: "a" })), true);
      assert.equal(await s.create(entry({ id: "2", ownerId: "a" })), false);
      assert.equal(await s.create(entry({ id: "3", ownerId: "a", period: "2026-11-05" })), true);
      assert.equal(await s.create(entry({ id: "4", ownerId: "a", level: "kho" })), true);
      assert.equal((await s.get("thuong", "2026-11-04", "a"))?.id, "1");
      assert.equal(await s.get("thuong", "2026-11-04", "b"), null);
    });

    it("đọc lại đúng ván đã lưu (kể cả trạng thái)", async () => {
      const s = await make();
      const e = entry({ id: "1", ownerId: "a" });
      await s.create(e);
      assert.deepEqual(await s.get("thuong", "2026-11-04", "a"), e);
    });

    it("ghi kèm điều kiện seq: bên chậm bị từ chối", async () => {
      const s = await make();
      await s.create(entry({ id: "1", ownerId: "a", seq: 0, status: "playing", score: null, turns: null, finishedAt: null }));
      const cur = (await s.get("thuong", "2026-11-04", "a"))!;
      assert.equal(await s.save({ ...cur, seq: 1 }, 0), true);
      assert.equal(await s.save({ ...cur, seq: 1, score: 5 }, 0), false);
      assert.equal((await s.get("thuong", "2026-11-04", "a"))?.score, null);
    });

    it("hạng: điểm cao trước, bằng điểm ít nước trước, bằng cả hai thì nộp sớm trước; chỉ ván thắng", async () => {
      const s = await make();
      const rows: [string, Partial<FormationEntry>][] = [
        ["c", { score: 900, turns: 40, finishedAt: 10 }],
        ["a", { score: 1200, turns: 60, finishedAt: 50 }],
        ["d", { score: 900, turns: 40, finishedAt: 20 }],
        ["b", { score: 900, turns: 30, finishedAt: 99 }],
        ["thua", { status: "lost", score: 5000, turns: 10, finishedAt: 1 }],
        ["dang-choi", { status: "playing", score: null, turns: null, finishedAt: null }],
      ];
      for (const [o, over] of rows) await s.create(entry({ id: `id-${o}`, ownerId: o, ...over }));
      await s.create(entry({ id: "khac-ky", ownerId: "z", period: "2026-11-05", score: 99999 }));
      assert.deepEqual((await s.top("thuong", "2026-11-04", 10)).map((e) => e.ownerId), ["a", "b", "c", "d"]);
      assert.deepEqual((await s.top("thuong", "2026-11-04", 2)).map((e) => e.ownerId), ["a", "b"]);
      assert.equal(await s.countWinners("thuong", "2026-11-04"), 4);
      for (const [o, rank] of [["a", 1], ["b", 2], ["c", 3], ["d", 4]] as const) {
        assert.equal(await s.rankOf((await s.get("thuong", "2026-11-04", o))!), rank, o);
      }
      assert.equal(await s.rankOf((await s.get("thuong", "2026-11-04", "thua"))!), null);
      assert.equal(await s.rankOf((await s.get("thuong", "2026-11-04", "dang-choi"))!), null);
    });

    it("nhận thưởng đúng một lần, hoàn tác được, và chỉ liệt kê ván thắng chưa nhận của kỳ trước", async () => {
      const s = await make();
      await s.create(entry({ id: "1", ownerId: "a", period: "2026-11-03" }));
      await s.create(entry({ id: "2", ownerId: "a", period: "2026-11-04" }));
      await s.create(entry({ id: "3", ownerId: "a", period: "2026-11-02", status: "lost" }));
      assert.deepEqual((await s.unclaimed("a", "thuong", "2026-11-05", 10)).map((e) => e.id), ["2", "1"]);
      assert.deepEqual((await s.unclaimed("a", "thuong", "2026-11-04", 10)).map((e) => e.id), ["1"]);
      assert.equal(await s.claim("1", 60, 500), true);
      assert.equal(await s.claim("1", 60, 600), false);
      assert.equal(await s.claim("3", 60, 600), false); // ván thua
      assert.equal(await s.claim("khong-co", 60, 600), false);
      const c = (await s.get("thuong", "2026-11-03", "a"))!;
      assert.equal(c.claimedAt, 500);
      assert.equal(c.rewardGold, 60);
      assert.deepEqual((await s.unclaimed("a", "thuong", "2026-11-05", 10)).map((e) => e.id), ["2"]);
      await s.release("1");
      assert.equal((await s.get("thuong", "2026-11-03", "a"))?.claimedAt, null);
      assert.equal(await s.claim("1", 60, 700), true);
    });

    it("nhận song song chỉ một bên thành công", async () => {
      const s = await make();
      await s.create(entry({ id: "1", ownerId: "a" }));
      const rs = await Promise.all(Array.from({ length: 6 }, () => s.claim("1", 30, 1)));
      assert.equal(rs.filter(Boolean).length, 1);
    });
  });
}

contract("kho Trận Đồ trong bộ nhớ", async () => new MemoryFormationStore());
contract("kho Trận Đồ trong Postgres (PGlite, cùng migration với Neon)", async () => {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzleFormationStore(db as unknown as Db);
});
