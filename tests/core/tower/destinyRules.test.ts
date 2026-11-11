import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeFeasibility,
  DESTINY_CYCLE_FLOORS,
  DESTINY_RULE_DATA_VERSION,
  DESTINY_V2_FIRST_CYCLE,
  destinyEnemyPower,
  destinyFloorCount,
  destinyFloorTier,
  destinyRulesVersionForCycle,
  generateDestinyCycleRules,
  newProfile,
  profileTeam,
  type DestinyRuleFallbackEvent,
  type FloorRules,
  type LineupMember,
} from "../../../src/core";

const SECRET = "server-only-secret-for-tests";

function roster(): readonly LineupMember[] {
  const profile = newProfile();
  return profileTeam(profile, Object.keys(profile.companions)).slice(1).map(({ id, element, profession }) => ({ id, element, profession }));
}

describe("luật Destiny theo cycle seed", () => {
  it("cùng cycle/secret/roster cho cùng snapshot idempotent đủ 10 tầng", () => {
    const a = generateDestinyCycleRules("2026-10-19", SECRET, roster());
    const b = generateDestinyCycleRules("2026-10-19", SECRET, roster());
    assert.ok(a.ok && b.ok);
    if (!a.ok || !b.ok) return;
    assert.deepEqual(a.snapshot, b.snapshot);
    assert.equal(a.snapshot.dataVersion, 1);
    assert.equal(a.snapshot.floors.length, destinyFloorCount(1));
    assert.deepEqual(a.snapshot.floors.map((floor) => floor.tier), [1, 1, 1, 2, 2, 2, 3, 3, 3, 4]);
    assert.ok(a.snapshot.floors.every((floor) => analyzeFeasibility(floor.rules, roster()).status === "feasible"));
  });

  it("chu kỳ từ 16/11/2026 dùng luật V2: 20 tầng, bốn nhóm 5 tầng, không lặp luật trong nhóm", () => {
    assert.equal(destinyRulesVersionForCycle("2026-11-09"), 1);
    assert.equal(destinyRulesVersionForCycle(DESTINY_V2_FIRST_CYCLE), 2);
    assert.equal(DESTINY_RULE_DATA_VERSION, 2);
    assert.equal(DESTINY_CYCLE_FLOORS, destinyFloorCount(2));
    for (const cycleId of ["2026-11-16", "2026-11-23", "2026-11-30", "2026-12-07"]) {
      const a = generateDestinyCycleRules(cycleId, SECRET, roster());
      assert.ok(a.ok);
      if (!a.ok) return;
      const b = generateDestinyCycleRules(cycleId, SECRET, roster());
      assert.ok(b.ok);
      if (b.ok) assert.deepEqual(a.snapshot, b.snapshot);
      assert.equal(a.snapshot.dataVersion, 2);
      assert.equal(a.snapshot.floors.length, 20);
      assert.deepEqual(a.snapshot.floors.map((floor) => floor.tier),
        [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4]);
      assert.ok(a.snapshot.floors.every((floor) => analyzeFeasibility(floor.rules, roster()).status === "feasible"));
      for (const tier of [1, 2, 3, 4]) {
        const inTier: string[] = a.snapshot.floors.filter((floor) => floor.tier === tier)
          .map((floor) => JSON.stringify(floor.rules));
        assert.equal(new Set(inTier).size, inTier.length, `nhóm ${tier} của ${cycleId} lặp luật`);
      }
    }
  });

  it("sức địch V2 dốc vừa: 0,74 ở tầng 1 và 1,12 ở tầng 20; V1 giữ nguyên", () => {
    assert.equal(Number(destinyEnemyPower(1, 2).toFixed(2)), 0.74);
    assert.equal(Number(destinyEnemyPower(20, 2).toFixed(2)), 1.12);
    assert.equal(Number(destinyEnemyPower(10, 1).toFixed(2)), 1.02);
    assert.deepEqual([5, 6, 10, 11, 15, 16, 20].map((floor) => destinyFloorTier(floor, 2)), [1, 2, 2, 3, 3, 4, 4]);
    assert.deepEqual([3, 4, 9, 10].map((floor) => destinyFloorTier(floor, 1)), [1, 2, 3, 4]);
  });

  it("cycle khác tạo variation nhưng không lộ secret trong snapshot", () => {
    const a = generateDestinyCycleRules("2026-10-19", SECRET, roster());
    const b = generateDestinyCycleRules("2026-10-26", SECRET, roster());
    assert.ok(a.ok && b.ok);
    if (!a.ok || !b.ok) return;
    assert.notDeepEqual(a.snapshot.floors.map((floor) => floor.fingerprint), b.snapshot.floors.map((floor) => floor.fingerprint));
    assert.ok(!JSON.stringify(a.snapshot).includes(SECRET));
  });

  it("candidate vô nghiệm/sai schema bị bỏ; fallback hợp lệ và ghi log có cấu trúc", () => {
    const events: DestinyRuleFallbackEvent[] = [];
    const impossible: FloorRules = { minElements: { hoa: 2 } };
    const invalid = { bannedElements: ["khong-co"] } as unknown as FloorRules;
    const pools = { 1: [impossible, invalid], 2: [impossible], 3: [invalid], 4: [] } as const;
    const noFireRoster: LineupMember[] = [
      { id: "a", element: "tho", profession: "binhLinh" },
      { id: "b", element: "thuy", profession: "ySu" },
    ];
    const result = generateDestinyCycleRules("2026-10-19", SECRET, noFireRoster, {
      pools,
      onFallback: (event) => events.push(event),
    });
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.equal(events.length, 10);
    assert.ok(result.snapshot.floors.every((floor) => Object.keys(floor.rules).length === 0));
    assert.ok(events.every((event, index) => event.floor === index + 1 && event.kind === "destiny_rule_fallback"));
  });

  it("snapshot đóng băng; input pool sửa sau đó không đổi cycle đang chạy", () => {
    const mutable: FloorRules = { bannedElements: ["kim"] };
    const pools = { 1: [mutable], 2: [mutable], 3: [mutable], 4: [mutable] };
    const result = generateDestinyCycleRules("2026-10-19", SECRET, roster(), { pools });
    assert.ok(result.ok);
    if (!result.ok) return;
    const before = JSON.stringify(result.snapshot);
    (mutable as { bannedElements: string[] }).bannedElements.push("hoa");
    assert.equal(JSON.stringify(result.snapshot), before);
    assert.equal(Object.isFrozen(result.snapshot), true);
    assert.equal(Object.isFrozen(result.snapshot.floors), true);
    assert.equal(Object.isFrozen(result.snapshot.floors[0]?.rules), true);
  });

  it("từ chối cycle, secret và roster không hợp lệ", () => {
    assert.deepEqual(generateDestinyCycleRules("2026-10-20", SECRET, roster()), { ok: false, error: "invalid_cycle" });
    assert.deepEqual(generateDestinyCycleRules("2026-10-19", "short", roster()), { ok: false, error: "invalid_secret" });
    assert.deepEqual(generateDestinyCycleRules("2026-10-19", SECRET, [roster()[0]!]), { ok: false, error: "invalid_roster" });
  });
});
