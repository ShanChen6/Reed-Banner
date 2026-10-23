import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDualTowerV1,
  newProfile,
  NEW_TRIAL,
  nextTrialSweepResetAt,
  parseDualTower,
  planTrialSweepState,
  STONES_MAX,
  TRIAL_SWEEP_STONES_BY_TIER,
  trialDateKey,
  trialSweepStoneAmount,
  trialSweepTier,
} from "../../src/core";
import { loadProfile, MemoryProfileStore, type ProfileStore } from "../../src/server/profiles";
import { claimTrialSweepState, settleTrialSweep } from "../../src/server/trialSweep";

const beforeMidnight = Date.UTC(2026, 9, 23, 16, 59, 59, 999); // 23:59:59.999 VN
const midnight = Date.UTC(2026, 9, 23, 17, 0, 0, 0); // 00:00 VN ngày 24

async function seeded(cleared: number, tower = { best: 0, run: null }) {
  const store = new MemoryProfileStore();
  const p = newProfile();
  assert.ok(isDualTowerV1(p.dualTower));
  await store.put("u1", {
    ...p,
    tower,
    dualTower: { ...p.dualTower, trial: { ...p.dualTower.trial, cleared } },
  }, 0);
  return store;
}

describe("trạng thái quét Trial hằng ngày", () => {
  it("date key dùng Asia/Ho_Chi_Minh và đổi chính xác 23:59 → 00:00", () => {
    assert.equal(trialDateKey(beforeMidnight), "2026-10-23");
    assert.equal(trialDateKey(midnight), "2026-10-24");
    assert.equal(trialDateKey(Date.UTC(2026, 0, 1, 16, 59)), "2026-01-01");
    assert.equal(trialDateKey(Date.UTC(2026, 0, 1, 17, 0)), "2026-01-02");
    assert.equal(nextTrialSweepResetAt(beforeMidnight), midnight);
    assert.equal(nextTrialSweepResetAt(midnight), Date.UTC(2026, 9, 24, 17, 0));
  });

  it("tier lấy từ highestCleared, zero floors không đủ điều kiện", () => {
    assert.deepEqual([0, 1, 5, 6, 10, 11, 15, 16, 20].map(trialSweepTier), [0, 1, 1, 2, 2, 3, 3, 4, 4]);
    assert.deepEqual(planTrialSweepState(NEW_TRIAL, midnight), { ok: false, error: "no_cleared_floors" });
    assert.deepEqual(planTrialSweepState({ ...NEW_TRIAL, cleared: 1 }, Number.MAX_SAFE_INTEGER), { ok: false, error: "invalid_time" });
  });

  it("bảng đá quét theo tier có cap 4, invalid bằng 0 và tra cứu idempotent", () => {
    assert.deepEqual(TRIAL_SWEEP_STONES_BY_TIER, { 1: 1, 2: 2, 3: 3, 4: 4 });
    assert.deepEqual([-1, 0, 1, 2, 3, 4, 5, 1.5, Number.NaN].map(trialSweepStoneAmount), [0, 0, 1, 2, 3, 4, 0, 0, 0]);
    assert.equal(trialSweepStoneAmount(4), trialSweepStoneAmount(4));
    assert.equal(Object.isFrozen(TRIAL_SWEEP_STONES_BY_TIER), true);
  });

  it("claim một bước lưu date/tier/claimedAt nhưng không phát đá", async () => {
    const store = await seeded(7, { best: 12, run: null });
    const result = await claimTrialSweepState(store, "u1", beforeMidnight);
    assert.deepEqual(result, { ok: true, claimed: true, dateKey: "2026-10-23", tier: 2, claimedAt: beforeMidnight });
    const { profile } = await loadProfile(store, "u1");
    assert.equal(profile.stones, 0);
    assert.deepEqual(profile.tower, { best: 12, run: null });
    assert.ok(isDualTowerV1(profile.dualTower));
    if (isDualTowerV1(profile.dualTower)) {
      assert.deepEqual(profile.dualTower.trial.lastSweep, { dateKey: "2026-10-23", tier: 2, claimedAt: beforeMidnight });
      assert.deepEqual(profile.dualTower.stoneLedger, []);
    }
  });

  it("same-day duplicate và stale client không đổi tier/claimedAt; ngày mới claim lại được", async () => {
    const store = await seeded(4);
    const first = await claimTrialSweepState(store, "u1", beforeMidnight);
    const duplicate = await claimTrialSweepState(store, "u1", beforeMidnight - 60_000);
    assert.ok(first.ok && first.claimed);
    assert.deepEqual(duplicate, { ok: true, claimed: false, dateKey: "2026-10-23", tier: 1, claimedAt: beforeMidnight });
    const next = await claimTrialSweepState(store, "u1", midnight);
    assert.deepEqual(next, { ok: true, claimed: true, dateKey: "2026-10-24", tier: 1, claimedAt: midnight });
    const staleAfterRollover = await claimTrialSweepState(store, "u1", beforeMidnight);
    assert.deepEqual(staleAfterRollover, { ok: true, claimed: false, dateKey: "2026-10-24", tier: 1, claimedAt: midnight });
  });

  it("hai claim đồng thời cùng player/date chỉ một claim thắng", async () => {
    for (let i = 0; i < 5; i++) {
      const store = await seeded(20);
      const [a, b] = await Promise.all([
        claimTrialSweepState(store, "u1", midnight),
        claimTrialSweepState(store, "u1", midnight),
      ]);
      assert.ok(a.ok && b.ok);
      assert.equal(Number(a.ok && a.claimed) + Number(b.ok && b.claimed), 1);
      assert.equal((await loadProfile(store, "u1")).profile.stones, 0);
    }
  });

  it("zero floors, schema mới và conflict không ghi receipt", async () => {
    const empty = await seeded(0);
    assert.deepEqual(await claimTrialSweepState(empty, "u1", midnight), { ok: false, error: "no_cleared_floors" });
    const future = new MemoryProfileStore();
    await future.put("u1", { ...newProfile(), dualTower: { schema: 99 } }, 0);
    assert.deepEqual(await claimTrialSweepState(future, "u1", midnight), { ok: false, error: "unsupported_schema" });
    const source = await seeded(1);
    const failing: ProfileStore = { get: (id) => source.get(id), put: async () => false };
    assert.deepEqual(await claimTrialSweepState(failing, "u1", midnight), { ok: false, error: "conflict" });
    const profile = (await loadProfile(source, "u1")).profile;
    assert.ok(isDualTowerV1(profile.dualTower) && profile.dualTower.trial.lastSweep === null);
  });

  it("parser nâng lastSweepDay legacy, lọc receipt hỏng và idempotent", () => {
    const legacy = parseDualTower({ schema: 1, trial: { cleared: 7, lastSweepDay: "2026-10-23" } });
    assert.ok(isDualTowerV1(legacy));
    if (isDualTowerV1(legacy)) assert.deepEqual(legacy.trial.lastSweep, { dateKey: "2026-10-23", tier: 2, claimedAt: 0 });
    assert.deepEqual(parseDualTower(JSON.parse(JSON.stringify(legacy))), legacy);
    const bad = parseDualTower({ schema: 1, trial: { cleared: 7, lastSweep: { dateKey: "2026-02-30", tier: 9, claimedAt: -1 } } });
    assert.ok(isDualTowerV1(bad) && bad.trial.lastSweep === null);
  });
});

describe("settlement đá quét Trial", () => {
  it("đủ bốn tier thì nhận đúng 1/2/3/4 đá từ progress server", async () => {
    for (const [cleared, amount] of [[1, 1], [6, 2], [11, 3], [16, 4]] as const) {
      const store = await seeded(cleared, { best: 99, run: null });
      const result = await settleTrialSweep(store, "u1", midnight);
      assert.ok(result.ok);
      if (!result.ok) continue;
      assert.equal(result.granted, amount);
      assert.equal(result.stones, amount);
      const { profile } = await loadProfile(store, "u1");
      assert.equal(profile.gold, 0);
      assert.deepEqual(profile.bag, []);
      assert.equal(profile.main.xp, 0);
      assert.deepEqual(profile.tower, { best: 99, run: null });
      assert.ok(isDualTowerV1(profile.dualTower));
      if (isDualTowerV1(profile.dualTower)) {
        assert.deepEqual(profile.dualTower.stoneLedger, ["trial:sweep:2026-10-24"]);
        assert.equal(profile.dualTower.trial.lastSweep?.tier, trialSweepTier(cleared));
      }
    }
  });

  it("request trùng và hai tab chỉ cấp một lần", async () => {
    const store = await seeded(20);
    const [a, b] = await Promise.all([
      settleTrialSweep(store, "u1", midnight),
      settleTrialSweep(store, "u1", midnight),
    ]);
    assert.ok(a.ok && b.ok);
    if (!a.ok || !b.ok) return;
    assert.equal(a.granted + b.granted, 4);
    assert.deepEqual(await settleTrialSweep(store, "u1", midnight), {
      ok: true,
      granted: 0,
      stones: 4,
      dateKey: "2026-10-24",
      tier: 4,
      claimedAt: midnight,
    });
  });

  it("receipt state-only cũ chưa có ledger được bù đúng một lần", async () => {
    const store = await seeded(7);
    assert.ok((await claimTrialSweepState(store, "u1", midnight)).ok);
    const first = await settleTrialSweep(store, "u1", midnight);
    const retry = await settleTrialSweep(store, "u1", midnight);
    assert.ok(first.ok && first.granted === 2);
    assert.ok(retry.ok && retry.granted === 0 && retry.stones === 2);
  });

  it("rollback khi overflow hoặc conflict; owner khác và legacy chưa mở tầng không nhận", async () => {
    const overflowStore = await seeded(1);
    const current = await loadProfile(overflowStore, "u1");
    await overflowStore.put("u1", { ...current.profile, stones: STONES_MAX }, current.version);
    const before = await loadProfile(overflowStore, "u1");
    assert.deepEqual(await settleTrialSweep(overflowStore, "u1", midnight), { ok: false, error: "overflow" });
    assert.deepEqual(await loadProfile(overflowStore, "u1"), before);

    const source = await seeded(1);
    const failing: ProfileStore = { get: (id) => source.get(id), put: async () => false };
    const conflictBefore = await loadProfile(source, "u1");
    assert.deepEqual(await settleTrialSweep(failing, "u1", midnight), { ok: false, error: "conflict" });
    assert.deepEqual(await loadProfile(source, "u1"), conflictBefore);
    assert.deepEqual(await settleTrialSweep(source, "another-owner", midnight), { ok: false, error: "no_cleared_floors" });

    const legacy = new MemoryProfileStore();
    const raw = { ...newProfile(), tower: { best: 20, run: null } } as Record<string, unknown>;
    delete raw.stones;
    delete raw.dualTower;
    await legacy.put("legacy", raw as unknown as ReturnType<typeof newProfile>, 0);
    assert.deepEqual(await settleTrialSweep(legacy, "legacy", midnight), { ok: false, error: "no_cleared_floors" });
    assert.deepEqual((await loadProfile(legacy, "legacy")).profile.tower, { best: 20, run: null });
  });

  it("replay count không tăng entitlement và qua ngày mới mới cấp tiếp", async () => {
    const store = await seeded(5);
    const saved = await loadProfile(store, "u1");
    assert.ok(isDualTowerV1(saved.profile.dualTower));
    if (!isDualTowerV1(saved.profile.dualTower)) return;
    await store.put("u1", {
      ...saved.profile,
      dualTower: {
        ...saved.profile.dualTower,
        trial: { ...saved.profile.dualTower.trial, records: [{ floor: 5, clears: 999, bestTurns: 1 }] },
      },
    }, saved.version);
    const first = await settleTrialSweep(store, "u1", beforeMidnight);
    const next = await settleTrialSweep(store, "u1", midnight);
    assert.ok(first.ok && first.granted === 1 && first.tier === 1);
    assert.ok(next.ok && next.granted === 1 && next.tier === 1 && next.stones === 2);
  });
});
