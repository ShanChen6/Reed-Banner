import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { RANK_REWARD_GOLD, RANK_REWARD_MODES, rankRewardGold, rewardTier } from "../../src/core";
import { MemoryDailyStore } from "../../src/server/daily";
import { DrizzleDailyStore } from "../../src/server/db/daily";
import { DrizzleDestinyLeaderboardStore } from "../../src/server/db/destinyLeaderboard";
import { DrizzleRankRewardStore } from "../../src/server/db/rankRewards";
import type { Db } from "../../src/server/db/store";
import { MemoryDestinyLeaderboardStore, type DestinyLeaderboardStore } from "../../src/server/destinyLeaderboard";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import {
  MemoryRankRewardStore,
  claimRankReward,
  dailySource,
  destinySource,
  pendingRankRewards,
  type RankRewardDeps,
  type RankRewardStore,
} from "../../src/server/rankRewards";

const DAY = 24 * 3600_000;
const VN = (iso: string) => Date.parse(iso) - 7 * 3600_000; // giờ Việt Nam → mốc UTC
const NOW = VN("2026-11-04T12:00:00Z"); // thứ Tư 12 giờ trưa giờ Việt Nam
const YESTERDAY = "2026-11-03";
const score = (s: number) => ({ won: true, turns: 30, permille: 500, score: s });
const GOLD0 = 0;

async function dailyWith(day: string, scores: Record<string, number>, store = new MemoryDailyStore()) {
  let t = 1;
  for (const [owner, s] of Object.entries(scores)) {
    await store.start(day, owner, `m_${owner}`, t++);
    await store.finish(day, owner, score(s), t++);
  }
  return store;
}

function deps(over: Partial<RankRewardDeps> & Pick<RankRewardDeps, "sources">): RankRewardDeps {
  return {
    claims: new MemoryRankRewardStore(),
    profiles: new MemoryProfileStore(),
    now: NOW,
    isSignedIn: async () => true,
    ...over,
  };
}

const goldOf = async (d: RankRewardDeps, id: string) => (await loadProfile(d.profiles, id)).profile.gold;

describe("bảng thưởng hạng chung", () => {
  it("mọi chế độ có bảng vàng giảm dần theo bậc thưởng", () => {
    for (const mode of RANK_REWARD_MODES) {
      const g = RANK_REWARD_GOLD[mode];
      assert.ok(g.top1 > g.top3 && g.top3 > g.top10 && g.top10 > g.half && g.half > g.win && g.win > 0, mode);
    }
    assert.ok(RANK_REWARD_GOLD.destiny.top1 > RANK_REWARD_GOLD.daily.top1);
  });

  it("bảng ít người vẫn có thưởng: một mình là hạng nhất", () => {
    assert.deepEqual(rankRewardGold("daily", 1, 1), { tier: "top1", gold: 100 });
    assert.deepEqual(rankRewardGold("destiny", 2, 2), { tier: "top3", gold: 500 });
    assert.equal(rankRewardGold("daily", 3, 2), null);
    assert.equal(rewardTier(0, 5), null);
  });
});

describe("thưởng hạng Nhật Lệnh", () => {
  it("liệt kê kỳ đã khép, đúng hạng và vàng; kỳ đang chạy không có", async () => {
    const daily = await dailyWith(YESTERDAY, { a: 900, b: 800, c: 700 });
    await dailyWith("2026-11-04", { a: 999 }, daily); // hôm nay chưa khép
    const d = deps({ sources: [dailySource(daily)] });
    const { canClaim, items } = await pendingRankRewards(d, "b");
    assert.equal(canClaim, true);
    assert.deepEqual(items, [{ mode: "daily", period: YESTERDAY, rank: 2, participants: 3, tier: "top3", gold: 70 }]);
    assert.deepEqual((await pendingRankRewards(d, "a")).items.map((i) => [i.rank, i.gold]), [[1, 100]]);
    assert.deepEqual((await pendingRankRewards(d, "khong-choi")).items, []);
  });

  it("nhận đúng một lần và cộng đúng vàng vào hồ sơ", async () => {
    const d = deps({ sources: [dailySource(await dailyWith(YESTERDAY, { a: 900, b: 800 }))] });
    const r = await claimRankReward(d, "a", "daily", YESTERDAY);
    assert.deepEqual(r, { ok: true, gold: 100, tier: "top1", rank: 1, participants: 2 });
    assert.equal((await goldOf(d, "a")) - GOLD0 - (await goldOf(deps({ sources: [] }), "x")), 100);
    assert.deepEqual(await claimRankReward(d, "a", "daily", YESTERDAY), { ok: false, error: "alreadyClaimed" });
    assert.deepEqual((await pendingRankRewards(d, "a")).items, []);
    assert.equal(await goldOf(d, "a"), 100);
  });

  it("nhận song song chỉ cộng vàng một lần", async () => {
    const d = deps({ sources: [dailySource(await dailyWith(YESTERDAY, { a: 900 }))] });
    const rs = await Promise.all(Array.from({ length: 6 }, () => claimRankReward(d, "a", "daily", YESTERDAY)));
    assert.equal(rs.filter((r) => r.ok).length, 1);
    assert.equal(await goldOf(d, "a"), 100);
  });

  it("từ chối: kỳ đang chạy, kỳ tương lai, kỳ quá cũ, người không tham gia, dữ liệu rác", async () => {
    const daily = await dailyWith(YESTERDAY, { a: 900 });
    await dailyWith("2026-11-04", { a: 900 }, daily);
    await dailyWith("2026-10-20", { a: 900 }, daily);
    const d = deps({ sources: [dailySource(daily)] });
    for (const p of ["2026-11-04", "2026-11-05", "2026-10-20", "hôm qua"]) assert.deepEqual(await claimRankReward(d, "a", "daily", p), { ok: false, error: "notClaimable" }, p);
    assert.deepEqual(await claimRankReward(d, "khong-choi", "daily", YESTERDAY), { ok: false, error: "notClaimable" });
    assert.deepEqual(await claimRankReward(d, "a", "daily", 5), { ok: false, error: "badRequest" });
    for (const mode of ["la", null, 5]) assert.deepEqual(await claimRankReward(d, "a", mode, YESTERDAY), { ok: false, error: "unknownMode" });
  });

  it("khách không xem danh sách và không nhận được", async () => {
    const d = deps({ sources: [dailySource(await dailyWith(YESTERDAY, { khach: 900 }))], isSignedIn: async () => false });
    assert.deepEqual(await pendingRankRewards(d, "khach"), { canClaim: false, items: [] });
    assert.deepEqual(await pendingRankRewards(d, null), { canClaim: false, items: [] });
    assert.deepEqual(await claimRankReward(d, "khach", "daily", YESTERDAY), { ok: false, error: "loginRequired" });
  });

  it("cộng vàng hỏng thì hoàn sổ để thử lại được", async () => {
    const good = deps({ sources: [dailySource(await dailyWith(YESTERDAY, { a: 900 }))] });
    const broken: ProfileStore = { get: good.profiles.get.bind(good.profiles), put: async () => false };
    assert.deepEqual(await claimRankReward({ ...good, profiles: broken }, "a", "daily", YESTERDAY), { ok: false, error: "conflict" });
    assert.equal((await claimRankReward(good, "a", "daily", YESTERDAY)).ok, true);
  });
});

describe("thưởng hạng Tháp Thiên Mệnh", () => {
  const CYCLE = "2026-10-26"; // thứ Hai; chu kỳ này khép lúc 0 giờ thứ Hai 02/11
  const submit = (store: DestinyLeaderboardStore, owner: string, floor: number, turns: number) =>
    store.submit({ eventId: `e_${owner}_${floor}`, cycleId: CYCLE, ownerId: owner, clearedFloor: floor, totalTurns: turns, completedAt: 100 });

  it("chu kỳ khép lại thì có thưởng theo hạng; chu kỳ đang chạy thì không", async () => {
    const board = new MemoryDestinyLeaderboardStore();
    await submit(board, "a", 10, 80);
    await submit(board, "b", 8, 70);
    await board.submit({ eventId: "e_now", cycleId: "2026-11-02", ownerId: "a", clearedFloor: 3, totalTurns: 10, completedAt: 1 });
    const d = deps({ sources: [destinySource(board)] });
    assert.deepEqual((await pendingRankRewards(d, "a")).items, [{ mode: "destiny", period: CYCLE, rank: 1, participants: 2, tier: "top1", gold: 800 }]);
    assert.deepEqual((await pendingRankRewards(d, "b")).items.map((i) => [i.rank, i.gold]), [[2, 500]]);
    assert.deepEqual(await claimRankReward(d, "a", "destiny", "2026-11-02"), { ok: false, error: "notClaimable" });
    const r = await claimRankReward(d, "b", "destiny", CYCLE);
    assert.deepEqual(r, { ok: true, gold: 500, tier: "top3", rank: 2, participants: 2 });
    assert.deepEqual(await claimRankReward(d, "b", "destiny", CYCLE), { ok: false, error: "alreadyClaimed" });
  });

  it("kỳ của hai chế độ độc lập với nhau", async () => {
    const board = new MemoryDestinyLeaderboardStore();
    await submit(board, "a", 5, 40);
    const daily = await dailyWith(YESTERDAY, { a: 500 });
    const d = deps({ sources: [dailySource(daily), destinySource(board)] });
    assert.equal((await pendingRankRewards(d, "a")).items.length, 2);
    await claimRankReward(d, "a", "daily", YESTERDAY);
    assert.deepEqual((await pendingRankRewards(d, "a")).items.map((i) => i.mode), ["destiny"]);
  });
});

/** Cùng bộ kiểm tra cho sổ nhận trong bộ nhớ và Postgres. */
function ledger(name: string, make: () => Promise<RankRewardStore>) {
  describe(name, () => {
    it("ghi một lần, hoàn tác được, đọc theo danh sách kỳ", async () => {
      const s = await make();
      const c = { mode: "daily" as const, period: "2026-11-03", ownerId: "a", rank: 1, gold: 100, claimedAt: 5 };
      assert.equal(await s.claim(c), true);
      assert.equal(await s.claim({ ...c, gold: 999 }), false);
      assert.equal(await s.claim({ ...c, mode: "destiny" }), true); // chế độ khác thì khác sổ
      assert.deepEqual([...(await s.claimed("a", "daily", ["2026-11-03", "2026-11-02"]))], ["2026-11-03"]);
      assert.deepEqual([...(await s.claimed("b", "daily", ["2026-11-03"]))], []);
      assert.deepEqual([...(await s.claimed("a", "daily", []))], []);
      await s.release("daily", "2026-11-03", "a");
      assert.deepEqual([...(await s.claimed("a", "daily", ["2026-11-03"]))], []);
      assert.equal(await s.claim(c), true);
    });

    it("nhận song song chỉ một bên thành công", async () => {
      const s = await make();
      const rs = await Promise.all(Array.from({ length: 6 }, () => s.claim({ mode: "daily", period: "p", ownerId: "a", rank: 1, gold: 1, claimedAt: 1 })));
      assert.equal(rs.filter(Boolean).length, 1);
    });
  });
}
ledger("sổ nhận thưởng hạng trong bộ nhớ", async () => new MemoryRankRewardStore());
async function pg() {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return db as unknown as Db;
}
ledger("sổ nhận thưởng hạng trong Postgres (PGlite)", async () => new DrizzleRankRewardStore(await pg()));

describe("đếm người có tên trên bảng (Postgres khớp bộ nhớ)", () => {
  it("Nhật Lệnh: chỉ tính lượt đã xong trong ngày", async () => {
    const db = await pg();
    const stores = [new MemoryDailyStore(), new DrizzleDailyStore(db)];
    for (const s of stores) {
      await dailyWith(YESTERDAY, { a: 1, b: 2 }, s as MemoryDailyStore);
      await s.start(YESTERDAY, "dang-choi", "m_x", 9); // chưa xong
      await dailyWith("2026-11-02", { c: 3 }, s as MemoryDailyStore);
      assert.equal(await s.countFinished(YESTERDAY), 2);
      assert.equal(await s.countFinished("2026-11-02"), 1);
      assert.equal(await s.countFinished("2026-01-01"), 0);
    }
  });

  it("Thiên Mệnh: đếm theo chu kỳ", async () => {
    const db = await pg();
    for (const s of [new MemoryDestinyLeaderboardStore(), new DrizzleDestinyLeaderboardStore(db)]) {
      await s.submit({ eventId: "1", cycleId: "2026-10-26", ownerId: "a", clearedFloor: 3, totalTurns: 5, completedAt: 1 });
      await s.submit({ eventId: "2", cycleId: "2026-10-26", ownerId: "b", clearedFloor: 2, totalTurns: 5, completedAt: 1 });
      await s.submit({ eventId: "3", cycleId: "2026-11-02", ownerId: "a", clearedFloor: 1, totalTurns: 5, completedAt: 1 });
      assert.equal(await s.count("2026-10-26"), 2);
      assert.equal(await s.count("2026-11-02"), 1);
      assert.equal(await s.count("2026-09-07"), 0);
    }
  });
});

void DAY;
