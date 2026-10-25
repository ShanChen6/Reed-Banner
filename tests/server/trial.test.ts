import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createTrialRegistry,
  isDualTowerV1,
  trialFloorId,
  FOOD_UPKEEP,
} from "../../src/core";
import { getBattle } from "../../src/server/battles";
import { loadProfile, MemoryProfileStore, updateProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";
import { abandonTrialBattle, startTrialBattle, TRIAL_FOOD, trialBattleSeed } from "../../src/server/trial";

const T0 = 5_000_000;

const fixture = (floor: number, over: Record<string, unknown> = {}) => ({
  schema: 1,
  id: trialFloorId(floor),
  floor,
  contentVersion: 1,
  narrative: { title: `Tầng ${floor}`, intro: "Thử thách." },
  difficulty: "normal",
  rules: { bannedElements: ["kim"] },
  enemy: { foeIds: ["haVan", "maiThanh"], level: 5, power: 0.5 },
  board: { publicSeed: 1234 + floor },
  serverSalt: 99,
  turnLimit: 20,
  win: { kind: "defeatAll" },
  firstClearStones: 3,
  unlock: { requiresFloor: floor === 1 ? null : floor - 1 },
  ...over,
});

const reg = (raws: unknown[]) => {
  const r = createTrialRegistry(raws);
  assert.ok(r.ok);
  return r.ok ? r.registry : (undefined as never);
};

function setup() {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  let n = 0;
  const floors = reg([fixture(1), fixture(2), fixture(3, { win: { kind: "surviveTurns", turns: 5 } })]);
  const deps = { store, profiles, now: T0, seed: 1, newId: () => `m_${++n}`, floors };
  return { store, profiles, deps };
}

const input = (floor: number, over: Record<string, unknown> = {}) => ({
  floor,
  companions: ["haVan", "maiThanh"],
  leaderBuild: { element: "tho", profession: "muuSi" },
  ...over,
});

const dual = async (profiles: MemoryProfileStore) => {
  const { profile } = await loadProfile(profiles, "g_1");
  assert.ok(isDualTowerV1(profile.dualTower));
  return { profile, trial: isDualTowerV1(profile.dualTower) ? profile.dualTower.trial : (undefined as never) };
};

async function forceResult(store: MemoryMatchStore, id: string, winner: 0 | 1) {
  const rec = await store.get(id);
  assert.ok(rec);
  const battle = structuredClone(rec.match.battle);
  battle.winner = winner;
  const next = { ...rec.match, battle, seq: rec.match.seq + 1 };
  assert.ok(await store.save({ ...rec, match: next, updatedAt: T0 }, rec.match.seq));
}

describe("vòng đời trận Trial", () => {
  it("tạo trận: lương 60, máu đầy, đánh dấu trận mở, Profile ngoài dấu không đổi", async () => {
    const { deps, profiles } = setup();
    const before = (await loadProfile(profiles, "g_1")).profile;
    const r = await startTrialBattle("g_1", input(1), deps);
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.resumed, false);
    const rec = await deps.store.get(r.id);
    assert.ok(rec?.match.trial);
    assert.equal(rec.match.battle.sides[0].food, TRIAL_FOOD - FOOD_UPKEEP);
    for (const f of rec.match.battle.sides[0].fighters) assert.equal(f.hp, f.maxHp);
    const { profile, trial } = await dual(profiles);
    assert.deepEqual(trial.active, { matchId: r.id, floor: 1 });
    const restAfter = { ...profile, dualTower: null };
    const restBefore = { ...before, dualTower: null };
    assert.deepEqual(restAfter, restBefore);
  });

  it("tải lại: gọi lặp cùng tầng trả lại trận đang mở, tầng khác bị từ chối", async () => {
    const { deps } = setup();
    const a = await startTrialBattle("g_1", input(1), deps);
    const b = await startTrialBattle("g_1", input(1), deps);
    assert.ok(a.ok && b.ok);
    if (a.ok && b.ok) {
      assert.equal(b.id, a.id);
      assert.equal(b.resumed, true);
    }
    const c = await startTrialBattle("g_1", input(2), deps);
    assert.ok(!c.ok);
    if (!c.ok) assert.equal(c.error, "active_elsewhere");
  });

  it("cùng tầng cùng seed qua các lần thử lại", async () => {
    const { deps, store } = setup();
    const a = await startTrialBattle("g_1", input(1), deps);
    assert.ok(a.ok);
    if (!a.ok) return;
    await forceResult(store, a.id, 1);
    const b = await startTrialBattle("g_1", input(1), deps);
    assert.ok(b.ok);
    if (!b.ok) return;
    assert.notEqual(b.id, a.id);
    const ra = await store.get(a.id);
    const rb = await store.get(b.id);
    
    assert.equal(trialBattleSeed(deps.floors.get(1)!), trialBattleSeed(deps.floors.get(1)!));
    assert.deepEqual(ra?.match.battle.board, rb?.match.battle.board);
  });

  it("thua: gỡ dấu, không tăng cleared, không thưởng; thử lại được", async () => {
    const { deps, store, profiles } = setup();
    const a = await startTrialBattle("g_1", input(1), deps);
    assert.ok(a.ok);
    if (!a.ok) return;
    const before = (await loadProfile(profiles, "g_1")).profile;
    await forceResult(store, a.id, 1);
    const res = await getBattle(a.id, "g_1", deps);
    assert.ok(res.ok);
    const { profile, trial } = await dual(profiles);
    assert.equal(trial.active, undefined);
    assert.equal(trial.cleared, 0);
    assert.equal(profile.gold, before.gold);
    assert.equal(profile.stones, before.stones);
    const again = await startTrialBattle("g_1", input(1), deps);
    assert.ok(again.ok);
  });

  it("thắng: tăng cleared một lần, mở tầng kế, đá lần đầu +3, không vàng/EXP, chốt lặp không nhân đôi", async () => {
    const { deps, store, profiles } = setup();
    const a = await startTrialBattle("g_1", input(1), deps);
    assert.ok(a.ok);
    if (!a.ok) return;
    const before = (await loadProfile(profiles, "g_1")).profile;
    await forceResult(store, a.id, 0);
    await getBattle(a.id, "g_1", deps);
    await getBattle(a.id, "g_1", deps);
    const { profile, trial } = await dual(profiles);
    assert.equal(trial.cleared, 1);
    assert.equal(trial.active, undefined);
    assert.deepEqual(trial.claimedFloors, [1]);
    assert.equal(profile.stones, before.stones + 3);
    assert.equal(profile.gold, before.gold);
    assert.equal(profile.main.xp, before.main.xp);
    const next = await startTrialBattle("g_1", input(2), deps);
    assert.ok(next.ok);
  });

  it("từ chối: tầng khoá, không tồn tại, luật vi phạm, trùng ID, tướng chưa sở hữu, win chưa hỗ trợ", async () => {
    const { deps } = setup();
    const err = async (i: unknown) => {
      const r = await startTrialBattle("g_1", i, deps);
      return r.ok ? "ok" : r.error;
    };
    assert.equal(await err(input(2)), "floor_locked");
    assert.equal(await err(input(9)), "floor_not_found");
    assert.equal(await err(input(1, { leaderBuild: { element: "kim", profession: "binhLinh" } })), "lineup_invalid");
    assert.equal(await err(input(1, { companions: ["haVan", "haVan"] })), "lineup_invalid");
    assert.equal(await err(input(1, { companions: ["haVan", "khongCo"] })), "lineup_invalid");
    assert.equal(await err(input(3)), "win_unsupported");
    assert.equal(await err({ floor: "1" }), "bad_request");
  });

  it("hai tab: chỉ một trận được mở", async () => {
    const { deps } = setup();
    const [a, b] = await Promise.all([
      startTrialBattle("g_1", input(1), deps),
      startTrialBattle("g_1", input(1), { ...deps, newId: () => "m_other" }),
    ]);
    const oks = [a, b].filter((x) => x.ok);
    assert.ok(oks.length >= 1);
    const { trial } = await dual(deps.profiles);
    assert.ok(trial.active);
  });

  it("bỏ trận: gỡ dấu, không tính thắng; không trận mở thì no-op", async () => {
    const { deps } = setup();
    const none = await abandonTrialBattle("g_1", deps);
    assert.deepEqual(none, { ok: true, abandoned: false });
    const a = await startTrialBattle("g_1", input(1), deps);
    assert.ok(a.ok);
    const r = await abandonTrialBattle("g_1", deps);
    assert.deepEqual(r, { ok: true, abandoned: true });
    const { trial } = await dual(deps.profiles);
    assert.equal(trial.active, undefined);
    assert.equal(trial.cleared, 0);
  });

  it("dấu cũ treo (trận mất) bị thay thế khi bắt đầu lại", async () => {
    const { deps, profiles } = setup();
    await updateProfile(profiles, "g_1", (p) => {
      if (!isDualTowerV1(p.dualTower)) return { ok: false as const, error: "x" };
      return {
        ok: true as const,
        profile: {
          ...p,
          dualTower: { ...p.dualTower, trial: { ...p.dualTower.trial, active: { matchId: "ghost", floor: 1 } } },
        },
      };
    }, T0);
    const r = await startTrialBattle("g_1", input(1), deps);
    assert.ok(r.ok);
    if (r.ok) assert.equal(r.resumed, false);
  });
});
