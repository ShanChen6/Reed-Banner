import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { BLUE, RED, chooseMove, legalMoves, replay, type Move } from "../../src/core/tam-quan-ky";
import { DrizzleTqkStore } from "../../src/server/db/tamQuanKy";
import type { Db } from "../../src/server/db/store";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import {
  MemoryTqkStore,
  TQK_GOLD,
  TQK_REWARDS_PER_DAY,
  TQK_ROOM_TTL_MS,
  tqkGet,
  tqkHost,
  tqkJoin,
  tqkMove,
  tqkResignMatch,
  tqkStartAi,
  type TqkDeps,
  type TqkResult,
  type TqkStore,
  type TqkView,
} from "../../src/server/tamQuanKy";

const T0 = 1_700_000_000_000;

async function makeDb(): Promise<TqkStore> {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzleTqkStore(db as unknown as Db);
}

const stores: readonly [string, () => Promise<TqkStore>][] = [
  ["bộ nhớ", async () => new MemoryTqkStore()],
  ["Postgres (PGlite, cùng migration với Neon)", makeDb],
];

function harness(store: TqkStore) {
  let now = T0;
  let n = 0;
  const profiles = new MemoryProfileStore();
  const deps = (): TqkDeps => ({
    store,
    profiles,
    now,
    newId: () => `m${++n}`,
    newCode: () => `ABC${String(234 + n).slice(-3)}`.replace(/[01]/g, "2"),
    nameOf: async (id) => `Tên ${id}`,
    // Máy yếu và xác định: luôn đi nước hợp lệ đầu tiên.
    think: (pos) => legalMoves(pos)[0] ?? null,
  });
  return { deps, profiles, tick: (ms: number) => (now += ms) };
}

const view = (r: TqkResult): TqkView => {
  if (!r.ok) assert.fail(`lỗi ${r.error}`);
  return r.view;
};

/** Đỏ (người) đánh bằng máy dễ cho tới khi xong ván; máy Xanh đi nước đầu tiên nên Đỏ thắng nhanh. */
async function playToWin(h: ReturnType<typeof harness>, id: string): Promise<TqkView> {
  let v = view(await tqkGet("u1", id, h.deps()));
  for (let i = 0; i < 200 && !v.result; i++) {
    const move = chooseMove(replay([...v.moves] as Move[]), "easy", 1, () => 0).move!;
    v = view(await tqkMove("u1", id, move, h.deps()));
  }
  return v;
}

for (const [label, make] of stores) {
  describe(`Tam Quân Kỳ trên server (${label})`, () => {
    it("đấu sứ quân: máy đáp trong cùng request, thắng được vàng theo độ khó", async () => {
      const h = harness(await make());
      const start = view(await tqkStartAi("u1", { level: "hard", rival: "luDuong", human: RED }, h.deps()));
      assert.equal(start.you, RED);
      assert.equal(start.moves.length, 0);
      const first = legalMoves(replay([]))[0]!;
      const after = view(await tqkMove("u1", start.id, first, h.deps()));
      assert.equal(after.moves.length, 2, "nước của người và nước đáp của máy");
      const end = await playToWin(h, start.id);
      assert.equal(end.result?.winner, RED);
      assert.equal(end.status, "ended");
      assert.equal(end.reward, TQK_GOLD.hard);
      const p = await loadProfile(h.profiles, "u1");
      assert.equal(p.profile.gold - (await loadProfile(new MemoryProfileStore(), "x")).profile.gold, TQK_GOLD.hard);
      // Xem lại ván đã xong không cộng thêm.
      const again = view(await tqkGet("u1", start.id, h.deps()));
      assert.equal(again.reward, TQK_GOLD.hard);
      assert.equal((await loadProfile(h.profiles, "u1")).profile.gold, p.profile.gold);
      // Ván đủ dài thì cộng nhiệm vụ ngày đánh cờ, một lần mỗi ván.
      if (end.moves.length >= 10) assert.equal(p.profile.quests.dayStats.board, 1);
    });

    it("cầm Xanh thì máy đi trước; đi sai lượt hay sai luật bị từ chối", async () => {
      const h = harness(await make());
      const v = view(await tqkStartAi("u1", { level: "easy", rival: "luDuong", human: BLUE }, h.deps()));
      assert.equal(v.moves.length, 1);
      const pos = replay([...v.moves] as Move[]);
      const bad = { ...legalMoves(pos)[0]!, to: legalMoves(pos)[0]!.from };
      assert.deepEqual(await tqkMove("u1", v.id, bad, h.deps()), { ok: false, error: "illegal" });
      assert.deepEqual(await tqkMove("u2", v.id, legalMoves(pos)[0]!, h.deps()), { ok: false, error: "notMember" });
      assert.deepEqual(await tqkStartAi("u1", { level: "godlike", rival: "x", human: RED }, h.deps()), { ok: false, error: "badRequest" });
    });

    it(`tối đa ${TQK_REWARDS_PER_DAY} ván có vàng mỗi ngày; thua hay đầu hàng không có vàng`, async () => {
      const h = harness(await make());
      const lost = view(await tqkStartAi("u1", { level: "easy", rival: "luDuong", human: RED }, h.deps()));
      const resigned = view(await tqkResignMatch("u1", lost.id, h.deps()));
      assert.equal(resigned.result?.winner, BLUE);
      assert.equal(resigned.reward, null);
      assert.equal(resigned.rewardCapped, false);
      for (let i = 0; i < TQK_REWARDS_PER_DAY; i++) {
        const s = view(await tqkStartAi("u1", { level: "easy", rival: "luDuong", human: RED }, h.deps()));
        assert.equal((await playToWin(h, s.id)).reward, TQK_GOLD.easy);
      }
      const extra = view(await tqkStartAi("u1", { level: "easy", rival: "luDuong", human: RED }, h.deps()));
      const capped = await playToWin(h, extra.id);
      assert.equal(capped.reward, null);
      assert.equal(capped.rewardCapped, true);
      h.tick(24 * 60 * 60_000);
      const tomorrow = view(await tqkStartAi("u1", { level: "easy", rival: "luDuong", human: RED }, h.deps()));
      assert.equal((await playToWin(h, tomorrow.id)).reward, TQK_GOLD.easy);
    });

    it("online: mở phòng, vào bằng mã, hai bên đi lần lượt, không có vàng", async () => {
      const h = harness(await make());
      const room = view(await tqkHost("u1", { clock: 10, rival: "luDuong" }, h.deps()));
      assert.equal(room.status, "waiting");
      assert.ok(room.code);
      assert.deepEqual(await tqkMove("u1", room.id, legalMoves(replay([]))[0]!, h.deps()), { ok: false, error: "waiting" });
      assert.deepEqual(await tqkJoin("u1", room.code!, h.deps()), { ok: false, error: "ownRoom" });
      const joined = view(await tqkJoin("u2", room.code!, h.deps()));
      assert.equal(joined.you, BLUE);
      assert.equal(joined.status, "playing");
      assert.deepEqual(joined.names, { r: "Tên u1", b: "Tên u2" });
      assert.deepEqual(await tqkJoin("u3", room.code!, h.deps()), { ok: false, error: "notFound" });
      h.tick(3000);
      const m1 = legalMoves(replay([]))[0]!;
      assert.deepEqual(await tqkMove("u2", room.id, m1, h.deps()), { ok: false, error: "notYourTurn" });
      const v1 = view(await tqkMove("u1", room.id, m1, h.deps()));
      assert.equal(v1.moves.length, 1, "online không có máy đáp");
      assert.equal(v1.timeLeft.r, 10 * 60_000 - 3000);
      const seen = view(await tqkGet("u2", room.id, h.deps()));
      assert.equal(seen.seq, v1.seq);
      const v2 = view(await tqkResignMatch("u2", room.id, h.deps()));
      assert.equal(v2.result?.winner, RED);
      assert.equal(v2.reward, null);
      assert.equal(v2.rewardCapped, false);
    });

    it("online: hết giờ xử khi có người hỏi ván; phòng chờ quá lâu thì mã hết hạn", async () => {
      const h = harness(await make());
      const room = view(await tqkHost("u1", { clock: 10, rival: "luDuong" }, h.deps()));
      view(await tqkJoin("u2", room.code!, h.deps()));
      h.tick(10 * 60_000 + 1);
      const v = view(await tqkGet("u2", room.id, h.deps()));
      assert.deepEqual(v.result, { winner: BLUE, reason: "timeout" });
      assert.equal(v.status, "ended");
      const old = view(await tqkHost("u1", { clock: 15, rival: "luDuong" }, h.deps()));
      h.tick(TQK_ROOM_TTL_MS + 1);
      assert.deepEqual(await tqkJoin("u2", old.code!, h.deps()), { ok: false, error: "notFound" });
      const cancelled = view(await tqkResignMatch("u1", old.id, h.deps()));
      assert.equal(cancelled.status, "ended");
      assert.deepEqual(await tqkHost("u1", { clock: 7, rival: "luDuong" }, h.deps()), { ok: false, error: "badRequest" });
    });
  });
}
