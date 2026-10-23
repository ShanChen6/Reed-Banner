import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyStoneAward,
  isDualTowerV1,
  newProfile,
  parseProfile,
  planDestinyCycleEnd,
  planTrialSettle,
  planTrialSweep,
  STONES_MAX,
  stoneKeys,
  type StoneRewardEvent,
} from "../../src/core";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import { awardStones, destinyPlanner, trialPlanner } from "../../src/server/stones";

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
  const sweep = (day: string) => trialPlanner((t) => planTrialSweep(t, { day, stones: 4 }));

  it("cộng đá lần đầu và ghi mốc trong cùng một lần ghi", async () => {
    const store = new MemoryProfileStore();
    const r = await awardStones(store, OWNER, sweep("2026-10-23"), 0);
    assert.deepEqual(r, { ok: true, stones: 4, granted: 4 });
    const { profile, version } = await loadProfile(store, OWNER);
    assert.equal(version, 1);
    assert.equal(profile.stones, 4);
    const d = profile.dualTower;
    assert.ok(d.schema === 1 && (d as { trial: { lastSweepDay: string } }).trial.lastSweepDay === "2026-10-23");
  });

  it("duplicate event: gọi lại không cộng thêm", async () => {
    const store = new MemoryProfileStore();
    await awardStones(store, OWNER, sweep("2026-10-23"), 0);
    const again = await awardStones(store, OWNER, sweep("2026-10-23"), 0);
    assert.deepEqual(again, { ok: true, stones: 4, granted: 0 });
    const next = await awardStones(store, OWNER, sweep("2026-10-24"), 0);
    assert.deepEqual(next, { ok: true, stones: 8, granted: 4 });
  });

  it("two-tab: hai claim đồng thời chỉ cộng một lần", async () => {
    for (let i = 0; i < 5; i++) {
      const store = new MemoryProfileStore();
      const [a, b] = await Promise.all([
        awardStones(store, OWNER, sweep("2026-10-23"), 0),
        awardStones(store, OWNER, sweep("2026-10-23"), 0),
      ]);
      assert.ok(a.ok && b.ok);
      assert.equal((await loadProfile(store, OWNER)).profile.stones, 4);
      assert.equal(a.ok && b.ok ? a.granted + b.granted : -1, 4);
    }
  });

  it("claim đồng thời khác khóa: không mất đá nào", async () => {
    const store = new MemoryProfileStore();
    const [a, b] = await Promise.all([
      awardStones(store, OWNER, sweep("2026-10-23"), 0),
      awardStones(
        store,
        OWNER,
        trialPlanner((t) => planTrialSettle(t, { floor: 1, won: true, firstClearStones: 6 })),
        0,
      ),
    ]);
    assert.ok(a.ok && b.ok);
    assert.equal((await loadProfile(store, OWNER)).profile.stones, 10);
  });

  it("rollback: kế hoạch lỗi hoặc ghi xung đột liên tục thì không đổi hồ sơ", async () => {
    const store = new MemoryProfileStore();
    await awardStones(store, OWNER, sweep("2026-10-23"), 0);
    const snap = structuredClone(await loadProfile(store, OWNER));
    const bad = await awardStones(store, OWNER, sweep("hôm nay"), 0);
    assert.deepEqual(bad, { ok: false, error: "invalid_day" });
    const wrongCycle = await awardStones(
      store,
      OWNER,
      destinyPlanner((d) => planDestinyCycleEnd(d, { cycleId: "2026-10-19", stonesForBest: () => 9 })),
      0,
    );
    assert.deepEqual(wrongCycle, { ok: false, error: "cycle_mismatch" });
    const failing: ProfileStore = { get: (o) => store.get(o), put: async () => false };
    assert.deepEqual(await awardStones(failing, OWNER, sweep("2026-10-30"), 0), { ok: false, error: "conflict" });
    assert.deepEqual(await loadProfile(store, OWNER), snap);
  });

  it("không đụng tower.best/tower.run của Legacy", async () => {
    const store = new MemoryProfileStore();
    const p = { ...newProfile(), tower: { best: 12, run: null } };
    assert.ok(await store.put(OWNER, p, 0));
    await awardStones(store, OWNER, sweep("2026-10-23"), 0);
    const back = (await loadProfile(store, OWNER)).profile;
    assert.deepEqual(back.tower, { best: 12, run: null });
    assert.ok(stoneKeys.trialSweep("2026-10-23"));
  });
});
