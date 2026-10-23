import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isDualTowerV1,
  newProfile,
  NEW_DUAL_TOWER,
  newTowerRun,
  parseDualTower,
  parseProfile,
  parseStones,
  parseTowerMode,
  towerModeOrLegacy,
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
        trial: { cleared: 3, claimedFloors: [1, 2, 3], lastSweepDay: "2026-10-23" },
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

  it("legacy: hồ sơ cũ không có trường mới, tower.best/run giữ nguyên", () => {
    const p = newProfile();
    const run = { ...newTowerRun({ ...p, main: { ...p.main, level: 10 } }, 9), floor: 3 };
    const old: Record<string, unknown> = { ...p, tower: { best: 12, run } };
    delete old.stones;
    delete old.dualTower;
    const back = parseProfile(old);
    assert.equal(back.tower.best, 12);
    assert.deepEqual(back.tower.run, run);
    assert.equal(back.stones, 0);
    assert.deepEqual(back.dualTower, NEW_DUAL_TOWER);
  });

  it("cô lập: tower.best không mở Trial, dualTower không đụng tower", () => {
    const p = newProfile();
    const back = parseProfile({
      ...p,
      tower: { best: 30, run: null },
      dualTower: { schema: 1, trial: { cleared: 2 } },
    });
    assert.equal(back.tower.best, 30);
    assert.equal(parseProfile({ ...p, tower: { best: 30, run: null } }).dualTower.schema, 1);
    const fresh = parseProfile({ ...p, tower: { best: 30, run: null } });
    assert.ok(isDualTowerV1(fresh.dualTower));
    if (isDualTowerV1(fresh.dualTower)) assert.equal(fresh.dualTower.trial.cleared, 0);
    assert.equal(back.tower.run, null);
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
    const s = parseDualTower({
      schema: 1,
      trial: { cleared: 99, claimedFloors: [3, 3, 1, 0, 21, "a"], lastSweepDay: "hôm nay" },
      destiny: {
        cycleId: "bad",
        cycleBest: -2,
        run: { roster: Array.from({ length: 9 }, (_, i) => `c${i}`), floor: 1, food: 1 },
        claimedMilestones: ["a", "a", 1],
      },
    });
    assert.ok(isDualTowerV1(s));
    if (isDualTowerV1(s)) {
      assert.equal(s.trial.cleared, TRIAL_FLOORS);
      assert.deepEqual(s.trial.claimedFloors, [1, 3]);
      assert.equal(s.trial.lastSweepDay, null);
      assert.equal(s.destiny.cycleId, null);
      assert.equal(s.destiny.cycleBest, 0);
      assert.equal(s.destiny.run, null);
      assert.deepEqual(s.destiny.claimedMilestones, ["a"]);
    }
  });

  it("schema mới hơn được giữ nguyên qua parseProfile (idempotent)", () => {
    const future = { schema: 2, trial: { x: 1 }, extra: [1] };
    const back = parseProfile({ ...newProfile(), dualTower: future });
    assert.deepEqual(back.dualTower, future);
    assert.deepEqual(parseProfile(roundtrip(back)).dualTower, future);
  });

  it("mode: hỗ trợ, không hỗ trợ và fallback", () => {
    for (const m of ["legacy", "trial", "destiny"]) assert.equal(parseTowerMode(m), m);
    for (const bad of ["survival", "", null, undefined, 1, "TRIAL"]) {
      assert.equal(parseTowerMode(bad), null);
      assert.equal(towerModeOrLegacy(bad), "legacy");
    }
    assert.equal(towerModeOrLegacy("destiny"), "destiny");
  });
});
