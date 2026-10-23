import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyStoneAward,
  isDualTowerV1,
  newProfile,
  parseProfile,
  planTrialSettle,
  STONES_MAX,
  stoneKeys,
  type StoneRewardEvent,
} from "../../src/core";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import { awardStones, trialPlanner } from "../../src/server/stones";

const ev = (key: string, amount = 5): StoneRewardEvent => ({
  kind: "stone",
  mode: "trial",
  source: "trial_first_clear",
  amount,
  key,
});
describe("ví đá: lõi", () => {
  it("người chơi cũ: không có trường đá → 0, sổ rỗng", () => {
    const old: Record<string, unknown> = { ...newProfile() };
    delete old.stones;
    delete old.dualTower;
    const p = parseProfile(old);
    assert.equal(p.stones, 0);
    const r = applyStoneAward(p, []);
    assert.ok(r.ok && r.granted === 0 && r.profile.stones === 0);
  });

  it("cộng lần đầu; sự kiện lặp bị bỏ qua; hồ sơ gốc không đổi", () => {
    const p = newProfile();
    const before = structuredClone(p);
    const a = applyStoneAward(p, [ev("k1", 5)]);
    assert.ok(a.ok);
    if (!a.ok) return;
    assert.equal(a.profile.stones, 5);
    assert.deepEqual(p, before);
    const b = applyStoneAward(a.profile, [ev("k1", 5)]);
    assert.ok(b.ok && b.granted === 0 && b.profile.stones === 5 && b.appliedKeys.length === 0);
    const c = applyStoneAward(a.profile, [ev("k1", 5), ev("k2", 3)]);
    assert.ok(c.ok && c.granted === 3 && c.profile.stones === 8);
  });

  it("từ chối sự kiện âm/không nguyên/0/thiếu khóa/trùng trong lô; không ghi gì", () => {
    const p = newProfile();
    for (const bad of [-1, 0, 1.5, NaN, Infinity, "5"])
      assert.deepEqual(applyStoneAward(p, [ev("k", bad as number)]), { ok: false, error: "invalid_event" });
    assert.deepEqual(applyStoneAward(p, [ev("")]), { ok: false, error: "invalid_event" });
    assert.deepEqual(applyStoneAward(p, [ev("a"), ev("a")]), { ok: false, error: "duplicate_in_batch" });
  });

  it("tràn: không cộng một phần", () => {
    const p = { ...newProfile(), stones: STONES_MAX - 2 };
    assert.deepEqual(applyStoneAward(p, [ev("a", 2), ev("b", 1)]), { ok: false, error: "overflow" });
    const ok = applyStoneAward(p, [ev("a", 2)]);
    assert.ok(ok.ok && ok.profile.stones === STONES_MAX);
  });

  it("schema Song Tháp mới hơn: từ chối, không ghi đè", () => {
    const p = { ...newProfile(), dualTower: { schema: 9 } };
    assert.deepEqual(applyStoneAward(p, [ev("a")]), { ok: false, error: "unsupported_schema" });
  });

  it("sổ khóa giữ qua roundtrip hồ sơ và có giới hạn", () => {
    let p = newProfile();
    for (let i = 0; i < 520; i++) {
      const r = applyStoneAward(p, [ev(`k${i}`, 1)]);
      assert.ok(r.ok);
      if (r.ok) p = r.profile;
    }
    assert.equal(p.stones, 520);
    const back = parseProfile(JSON.parse(JSON.stringify(p)));
    assert.deepEqual(back.dualTower, p.dualTower);
    assert.ok(isDualTowerV1(back.dualTower) && back.dualTower.stoneLedger.length === 500);
  });

  it("không có đường tiêu đá: số dư chỉ tăng", () => {
    let p = newProfile();
    let last = 0;
    for (let i = 0; i < 5; i++) {
      const r = applyStoneAward(p, [ev(`k${i % 3}`, i + 1)]);
      assert.ok(r.ok);
      if (r.ok) p = r.profile;
      assert.ok(p.stones >= last);
      last = p.stones;
    }
  });
});

describe("ví đá: server", () => {
  const OWNER = "u1";
  const firstClear = () => trialPlanner((trial) =>
    planTrialSettle(trial, { floor: 1, won: true, firstClearStones: 4 }));

  it("cộng đá và tiến trình trong cùng một lần ghi", async () => {
    const store = new MemoryProfileStore();
    assert.deepEqual(await awardStones(store, OWNER, firstClear(), 0), { ok: true, stones: 4, granted: 4 });
    const { profile, version } = await loadProfile(store, OWNER);
    assert.equal(version, 1);
    assert.equal(profile.stones, 4);
    assert.ok(isDualTowerV1(profile.dualTower) && profile.dualTower.trial.cleared === 1);
  });

  it("duplicate và two-tab chỉ cấp đá một lần", async () => {
    for (let i = 0; i < 5; i++) {
      const store = new MemoryProfileStore();
      const [a, b] = await Promise.all([
        awardStones(store, OWNER, firstClear(), 0),
        awardStones(store, OWNER, firstClear(), 0),
      ]);
      assert.ok(a.ok && b.ok);
      assert.equal(a.ok && b.ok ? a.granted + b.granted : -1, 4);
      assert.equal((await loadProfile(store, OWNER)).profile.stones, 4);
      assert.deepEqual(await awardStones(store, OWNER, firstClear(), 0), { ok: true, stones: 4, granted: 0 });
    }
  });

  it("kế hoạch lỗi hoặc conflict không đổi hồ sơ", async () => {
    const store = new MemoryProfileStore();
    const snap = structuredClone(await loadProfile(store, OWNER));
    const bad = trialPlanner((trial) => planTrialSettle(trial, { floor: 2, won: true, firstClearStones: 4 }));
    assert.deepEqual(await awardStones(store, OWNER, bad, 0), { ok: false, error: "invalid_floor" });
    const failing: ProfileStore = { get: (id) => store.get(id), put: async () => false };
    assert.deepEqual(await awardStones(failing, OWNER, firstClear(), 0), { ok: false, error: "conflict" });
    assert.deepEqual(await loadProfile(store, OWNER), snap);
  });

  it("không đụng tower.best/tower.run của Legacy", async () => {
    const store = new MemoryProfileStore();
    const profile = { ...newProfile(), tower: { best: 12, run: null } };
    assert.ok(await store.put(OWNER, profile, 0));
    await awardStones(store, OWNER, firstClear(), 0);
    assert.deepEqual((await loadProfile(store, OWNER)).profile.tower, { best: 12, run: null });
    assert.equal(stoneKeys.trialFirst(1), "trial:first:1");
  });
});
