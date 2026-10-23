import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeFeasibility,
  DESTINY_CYCLE_FLOORS,
  DESTINY_RULE_DATA_VERSION,
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
    assert.equal(a.snapshot.dataVersion, DESTINY_RULE_DATA_VERSION);
    assert.equal(a.snapshot.floors.length, DESTINY_CYCLE_FLOORS);
    assert.deepEqual(a.snapshot.floors.map((floor) => floor.tier), [1, 1, 1, 2, 2, 2, 3, 3, 3, 4]);
    assert.ok(a.snapshot.floors.every((floor) => analyzeFeasibility(floor.rules, roster()).status === "feasible"));
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
