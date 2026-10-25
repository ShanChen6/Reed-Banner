import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDualTowerV1,
  newProfile,
  NEW_DUAL_TOWER,
  parseDualTower,
  parseProfile,
  parseStones,
  parseTowerMode,
  TRIAL_FLOORS,
} from "../../../src/core";

const roundtrip = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

describe("song tháp: dữ liệu", () => {
  it("hồ sơ mới: 0 đá, dualTower rỗng", () => {
    const p = newProfile();
    assert.equal(p.stones, 0);
    assert.deepEqual(p.dualTower, NEW_DUAL_TOWER);
  });

  it("roundtrip giữ stones/trial/destiny", () => {
    const p = newProfile();
    const withData = {
      ...p,
      stones: 7,
      dualTower: {
        schema: 1 as const,
        trial: { cleared: 3, claimedFloors: [1, 2, 3], lastSweep: { dateKey: "2026-10-23", tier: 1 as const, claimedAt: 1_761_235_140_000 } },
        destiny: {
          cycleId: "2026-10-19",
          cycleBest: 4,
          run: {
            roster: ["dinhBoLinh", "haVan"],
            floor: 5,
            hp: { dinhBoLinh: 0.5, haVan: 1 },
            food: 40,
            active: false,
          },
          claimedMilestones: ["m1"],
          cycleRewardClaimed: false,
        },
        stoneLedger: ["trial:first:1"],
      },
    };
    const back = parseProfile(roundtrip(withData));
    assert.equal(back.stones, 7);
    assert.deepEqual(back.dualTower, withData.dualTower);
    assert.deepEqual(parseProfile(roundtrip(back)), back);
  });

  it("hồ sơ cũ: không có trường mới thì song tháp rỗng, bỏ dữ liệu leo tháp cũ", () => {
    const p = newProfile();
    const old: Record<string, unknown> = { ...p, tower: { best: 12, run: null } };
    delete old.stones;
    delete old.dualTower;
    const back = parseProfile(old);
    assert.equal("tower" in back, false);
    assert.equal(back.stones, 0);
    assert.deepEqual(back.dualTower, NEW_DUAL_TOWER);
  });

  it("leo tháp cũ không mở Trial, không làm mất dữ liệu song tháp", () => {
    const p = newProfile();
    const fresh = parseProfile({ ...p, tower: { best: 30, run: null } });
    assert.ok(isDualTowerV1(fresh.dualTower));
    if (isDualTowerV1(fresh.dualTower)) assert.equal(fresh.dualTower.trial.cleared, 0);
    const kept = parseProfile({
      ...p,
      tower: { best: 30, run: null },
      dualTower: { schema: 1, trial: { cleared: 2 } },
    });
    assert.ok(isDualTowerV1(kept.dualTower));
    if (isDualTowerV1(kept.dualTower)) assert.equal(kept.dualTower.trial.cleared, 2);
  });

  it("stones: âm/NaN/không nguyên/chuỗi → 0; trần an toàn", () => {
    for (const bad of [-1, NaN, Infinity, 1.5, "5", null, undefined, {}])
      assert.equal(parseStones(bad), 0);
    assert.equal(parseStones(12), 12);
    assert.equal(parseStones(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  });

  it("dualTower hỏng: làm sạch, không ném lỗi", () => {
    for (const bad of [null, 5, "x", [], { schema: "?" }])
      assert.deepEqual(parseDualTower(bad), NEW_DUAL_TOWER);
    const roster = Array.from({ length: 9 }, (_, i) => `c${i}`);
    const s = parseDualTower({
      schema: 1,
      trial: { cleared: 99, claimedFloors: [3, 3, 1, 0, 21, "a"], lastSweepDay: "hôm nay" },
      destiny: {
        cycleId: "bad",
        cycleBest: -2,
        run: { roster, floor: 1, food: 1 },
        claimedMilestones: ["a", "a", 1],
      },
    });
    assert.ok(isDualTowerV1(s));
    if (isDualTowerV1(s)) {
      assert.equal(s.trial.cleared, TRIAL_FLOORS);
      assert.deepEqual(s.trial.claimedFloors, [1, 3]);
      assert.equal(s.trial.lastSweep, null);
      assert.equal(s.destiny.cycleId, null);
      assert.equal(s.destiny.cycleBest, 0);
      assert.deepEqual(s.destiny.run, {
        roster,
        floor: 1,
        hp: Object.fromEntries(roster.map((id) => [id, 1])),
        food: 1,
        active: false,
      });
      assert.deepEqual(s.destiny.claimedMilestones, ["a"]);
    }

    const duplicate = parseDualTower({
      schema: 1,
      destiny: { run: { roster: ["c0", "c0", "c1"], floor: 1, food: 1 } },
    });
    assert.ok(isDualTowerV1(duplicate));
    if (isDualTowerV1(duplicate)) assert.equal(duplicate.destiny.run, null);
  });

  it("schema mới hơn được giữ nguyên qua parseProfile (idempotent)", () => {
    const future = { schema: 2, trial: { x: 1 }, extra: [1] };
    const back = parseProfile({ ...newProfile(), dualTower: future });
    assert.deepEqual(back.dualTower, future);
    assert.deepEqual(parseProfile(roundtrip(back)).dualTower, future);
  });

  it("mode: chỉ Trial và Destiny", () => {
    for (const m of ["trial", "destiny"]) assert.equal(parseTowerMode(m), m);
    for (const bad of ["legacy", "survival", "", null, undefined, 1, "TRIAL"])
      assert.equal(parseTowerMode(bad), null);
  });
});
