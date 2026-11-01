import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { SEASON_MODES, isSeasonKey, seasonKey } from "../../src/core";
import { actBattle, createBattleFor, getBattle, parseNewBattle } from "../../src/server/battles";
import { arenaView, MemoryArenaStore } from "../../src/server/arena";
import { DrizzleSeasonStore } from "../../src/server/db/seasons";
import type { Db } from "../../src/server/db/store";
import { MemoryLeaderboardStore } from "../../src/server/leaderboard";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryRankRewardStore, claimRankReward, pendingRankRewards, seasonSource, type RankRewardDeps } from "../../src/server/rankRewards";
import { MemorySeasonStore, recordSeason, seasonBoardView, type SeasonStore } from "../../src/server/seasons";
import { MemoryMatchStore } from "../../src/server/store";

const VN = (iso: string) => Date.parse(iso) - 7 * 3600_000;
const NOW = VN("2026-11-04T12:00:00Z"); // thứ Tư; mùa hiện tại bắt đầu 2026-11-02
const PREV = "2026-10-26"; // mùa trước

describe("khóa mùa", () => {
  it("mùa đổi vào thứ Hai 0 giờ giờ Việt Nam; chỉ thứ Hai hợp lệ", () => {
    assert.equal(seasonKey(VN("2026-11-08T23:59:59Z")), "2026-11-02"); // Chủ nhật vẫn mùa cũ
    assert.equal(seasonKey(VN("2026-11-09T00:00:00Z")), "2026-11-09");
    assert.ok(isSeasonKey("2026-11-02"));
    for (const bad of ["2026-11-03", "2026-02-30", "hôm nay", "", null, 5]) assert.equal(isSeasonKey(bad), false, String(bad));
    assert.deepEqual([...SEASON_MODES], ["survival", "arena"]);
  });
});

/** Cùng một bộ kiểm tra cho kho điểm mùa trong bộ nhớ và Postgres. */
function contract(name: string, make: () => Promise<SeasonStore>) {
  describe(name, () => {
    it("best giữ điểm cao nhất và chỉ đổi mốc thời gian khi tăng", async () => {
      const s = await make();
      await s.best("survival", "S", "a", 5, 10);
      await s.best("survival", "S", "a", 3, 20); // thấp hơn: bỏ qua
      await s.best("survival", "S", "a", 5, 30); // bằng: bỏ qua, giữ mốc 10
      await s.best("survival", "S", "b", 5, 15);
      assert.deepEqual((await s.top("survival", "S", 10)).map((e) => [e.ownerId, e.score]), [["a", 5], ["b", 5]]); // a đạt trước
      await s.best("survival", "S", "b", 7, 40);
      assert.deepEqual((await s.top("survival", "S", 10)).map((e) => [e.ownerId, e.score]), [["b", 7], ["a", 5]]);
    });

    it("add cộng dồn, có thể âm; chỉ điểm dương có tên trên bảng", async () => {
      const s = await make();
      await s.add("arena", "S", "a", 16, 1);
      await s.add("arena", "S", "a", -20, 2); // tổng -4
      await s.add("arena", "S", "b", 10, 3);
      await s.add("arena", "S", "c", 0, 4); // không ghi gì
      assert.deepEqual((await s.top("arena", "S", 10)).map((e) => e.ownerId), ["b"]);
      assert.equal(await s.count("arena", "S"), 1);
      assert.equal(await s.rankOf("arena", "S", "a"), null);
      assert.equal(await s.rankOf("arena", "S", "c"), null);
      await s.add("arena", "S", "a", 30, 5); // tổng 26
      assert.deepEqual(await s.rankOf("arena", "S", "a"), { rank: 1, score: 26 });
      assert.deepEqual(await s.rankOf("arena", "S", "b"), { rank: 2, score: 10 });
    });

    it("hạng: điểm cao trước, bằng điểm thì đạt sớm trước; tách theo mùa và chế độ", async () => {
      const s = await make();
      for (const [o, score, t] of [["c", 8, 30], ["a", 9, 50], ["d", 8, 40], ["b", 8, 10]] as const) await s.best("survival", "S", o, score, t);
      await s.best("survival", "S2", "x", 99, 1);
      await s.best("arena", "S", "y", 99, 1);
      assert.deepEqual((await s.top("survival", "S", 10)).map((e) => e.ownerId), ["a", "b", "c", "d"]);
      assert.deepEqual((await s.top("survival", "S", 2)).map((e) => e.ownerId), ["a", "b"]);
      for (const [o, rank] of [["a", 1], ["b", 2], ["c", 3], ["d", 4]] as const) assert.equal((await s.rankOf("survival", "S", o))?.rank, rank, o);
      assert.equal(await s.count("survival", "S"), 4);
      assert.equal(await s.count("survival", "S2"), 1);
      assert.equal(await s.count("arena", "S"), 1);
      assert.equal(await s.count("survival", "khong-co"), 0);
    });

    it("ghi song song vẫn cộng đủ", async () => {
      const s = await make();
      await Promise.all(Array.from({ length: 8 }, (_, i) => s.add("arena", "S", "a", 5, i + 1)));
      assert.equal((await s.rankOf("arena", "S", "a"))?.score, 40);
    });
  });
}
contract("điểm mùa trong bộ nhớ", async () => new MemorySeasonStore());
contract("điểm mùa trong Postgres (PGlite)", async () => {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzleSeasonStore(db as unknown as Db);
});

describe("ghi điểm mùa khi trận kết thúc", () => {
  it("recordSeason chọn đúng mùa theo giờ và không ném lỗi khi kho hỏng", async () => {
    const s = new MemorySeasonStore();
    await recordSeason(s, { mode: "survival", ownerId: "a", now: NOW, best: 4 });
    await recordSeason(s, { mode: "arena", ownerId: "a", now: NOW, add: 12 });
    assert.deepEqual(await s.rankOf("survival", "2026-11-02", "a"), { rank: 1, score: 4 });
    assert.deepEqual(await s.rankOf("arena", "2026-11-02", "a"), { rank: 1, score: 12 });
    const broken = { best: async () => { throw new Error("hỏng"); }, add: async () => { throw new Error("hỏng"); } } as unknown as SeasonStore;
    await recordSeason(broken, { mode: "arena", ownerId: "a", now: NOW, add: 1 }); // không ném
    await recordSeason(undefined, { mode: "arena", ownerId: "a", now: NOW, add: 1 });
  });

  it("Quần Hùng: chỉ người đi đánh nhận điểm mùa, người phòng thủ thì không", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const arena = new MemoryArenaStore();
    const seasons = new MemorySeasonStore();
    const base = { arena, profiles, leaderboard: new MemoryLeaderboardStore(), now: NOW };
    await arenaView("g_b", "view", { ...base, seed: 1 });
    const view = await arenaView("g_a", "view", { ...base, seed: 2 });
    const real = view.offers.findIndex((o) => !o.bot);
    assert.ok(real >= 0);
    const deps = { store, profiles, arena, leaderboard: base.leaderboard, seasons, now: NOW, seed: 6, newId: () => "m_a1" };
    const r = await createBattleFor("g_a", parseNewBattle({ arena: real })!, deps);
    assert.ok(r.ok);
    const rec = (await store.get(r.id))!;
    const battle = structuredClone(rec.match.battle);
    battle.sides[1].fighters.forEach((f) => (f.hp = 0));
    battle.winner = 0;
    await store.save({ ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } }, rec.match.seq);
    const end = await getBattle(r.id, "g_a", { store, profiles, arena, leaderboard: base.leaderboard, seasons, now: NOW + 1000 });
    assert.ok(end.ok && end.outcome?.arena);
    assert.equal(end.outcome.arena.delta, 16);
    assert.deepEqual(await seasons.rankOf("arena", "2026-11-02", "g_a"), { rank: 1, score: 16 });
    assert.equal(await seasons.rankOf("arena", "2026-11-02", "g_b"), null); // bị đánh: Elo -8 nhưng không vào điểm mùa
    assert.equal(await seasons.count("arena", "2026-11-02"), 1);
  });

  it("Trấn Ải: số đợt đã vượt của lượt chơi vào điểm mùa, giữ điểm cao nhất", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const seasons = new MemorySeasonStore();
    const input = { mode: "3v3", element: "kim", profession: "ySu", companions: ["haVan", "maiThanh"], difficulty: "easy", survival: true, reserveCompanions: ["leThach", "toKim"] };
    const run = async (id: string, owner: string, waves: number) => {
      const created = await createBattleFor(owner, parseNewBattle(input)!, { store, profiles, now: NOW, seed: 34, newId: () => id });
      assert.ok(created.ok);
      let seq = (await store.get(id))!.match.seq;
      for (let w = 0; w < waves; w++) {
        const rec = (await store.get(id))!;
        const battle = structuredClone(rec.match.battle);
        battle.sides[1].fighters.forEach((f) => (f.hp = 0));
        battle.winner = 0;
        assert.ok(await store.save({ ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } }, rec.match.seq));
        seq = rec.match.seq + 1;
        if (w < waves - 1) {
          const next = await actBattle(id, owner, { seq, action: { type: "nextWave", activeIds: ["dinhBoLinh", "haVan", "maiThanh"] } }, { store, profiles, seasons, now: NOW + 10 });
          assert.ok(next.ok, JSON.stringify(next));
          seq = (await store.get(id))!.match.seq;
        }
      }
      const rest = await getBattle(id, owner, { store, profiles, seasons, now: NOW + 20 });
      assert.ok(rest.ok);
      const end = await actBattle(id, owner, { seq: (await store.get(id))!.match.seq, action: { type: "endRun" } }, { store, profiles, seasons, now: NOW + 30 });
      assert.ok(end.ok && end.outcome?.survival, JSON.stringify(end));
      return end.outcome.survival.cleared;
    };
    assert.equal(await run("m_s1", "g_s", 2), 2);
    assert.deepEqual(await seasons.rankOf("survival", "2026-11-02", "g_s"), { rank: 1, score: 2 });
    assert.equal(await run("m_s2", "g_s", 1), 1); // lượt kém hơn không hạ điểm mùa
    assert.deepEqual(await seasons.rankOf("survival", "2026-11-02", "g_s"), { rank: 1, score: 2 });
    assert.equal((await loadProfile(profiles, "g_s")).profile.survival.best, 2);
  });
});

describe("thưởng hạng mùa Trấn Ải và Quần Hùng", () => {
  const deps = (seasons: SeasonStore): RankRewardDeps => ({
    sources: [seasonSource("survival", seasons), seasonSource("arena", seasons)],
    claims: new MemoryRankRewardStore(),
    profiles: new MemoryProfileStore(),
    now: NOW,
    isSignedIn: async () => true,
  });

  it("mùa trước khép lại thì có thưởng theo hạng; mùa đang chạy thì không", async () => {
    const s = new MemorySeasonStore();
    await s.best("survival", PREV, "a", 12, 1);
    await s.best("survival", PREV, "b", 9, 2);
    await s.best("survival", "2026-11-02", "a", 20, 3); // mùa hiện tại: chưa khép
    await s.add("arena", PREV, "b", 40, 4);
    const d = deps(s);
    assert.deepEqual((await pendingRankRewards(d, "a")).items, [{ mode: "survival", period: PREV, rank: 1, participants: 2, tier: "top1", gold: 500 }]);
    assert.deepEqual((await pendingRankRewards(d, "b")).items.map((i) => [i.mode, i.rank, i.gold]), [["survival", 2, 300], ["arena", 1, 600]]);
    assert.deepEqual(await claimRankReward(d, "a", "survival", "2026-11-02"), { ok: false, error: "notClaimable" });
    assert.deepEqual(await claimRankReward(d, "a", "arena", PREV), { ok: false, error: "notClaimable" }); // a không có điểm mùa Quần Hùng
  });

  it("nhận đúng một lần, vàng vào hồ sơ; người điểm âm hoặc bằng 0 không có thưởng", async () => {
    const s = new MemorySeasonStore();
    await s.add("arena", PREV, "a", 25, 1);
    await s.add("arena", PREV, "b", -10, 2);
    const d = deps(s);
    assert.deepEqual(await claimRankReward(d, "a", "arena", PREV), { ok: true, gold: 600, tier: "top1", rank: 1, participants: 1 });
    assert.equal((await loadProfile(d.profiles, "a")).profile.gold - (await loadProfile(new MemoryProfileStore(), "x")).profile.gold, 600);
    assert.deepEqual(await claimRankReward(d, "a", "arena", PREV), { ok: false, error: "alreadyClaimed" });
    assert.deepEqual(await claimRankReward(d, "b", "arena", PREV), { ok: false, error: "notClaimable" });
  });

  it("bảng mùa gửi cho client: top, hạng của mình, tên khách rút gọn", async () => {
    const s = new MemorySeasonStore();
    await s.best("survival", "2026-11-02", "g_abcdef", 7, 1);
    await s.best("survival", "2026-11-02", "g_me", 5, 2);
    const v = await seasonBoardView(s, "survival", "2026-11-02", "g_me");
    assert.equal(v.season, "2026-11-02");
    assert.deepEqual(v.top.map((r) => [r.rank, r.name, r.mine, r.score]), [[1, "Khách cdef", false, 7], [2, "Khách g_me", true, 5]]);
    assert.deepEqual(v.mine, { rank: 2, score: 5 });
  });
});
