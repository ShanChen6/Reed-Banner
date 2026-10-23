import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canTransitionDestiny,
  canTransitionTrial,
  FLOOR_RNG_VERSION,
  makeTowerMatchTag,
  NEW_DESTINY,
  NEW_TRIAL,
  planDestinyCycleEnd,
  planDestinyFloorClear,
  planTrialSettle,
  planTrialSweep,
  resolveFloor,
  stoneKeys,
  validateTowerMatch,
  validateTrialFloorSet,
  type DestinyMilestone,
  type FloorDefinition,
  type ResolvedFloor,
} from "../../../src/core";

const def = (over: Partial<FloorDefinition> = {}): FloorDefinition => ({
  mode: "trial",
  floor: 3,
  rules: { bannedElements: ["kim"] },
  enemy: { level: 5, power: 0.5, count: 3, difficulty: "normal" },
  ...over,
});
const floorOf = (d: FloorDefinition, scope = "trial"): ResolvedFloor => {
  const r = resolveFloor(d, scope);
  assert.ok(r.ok);
  return (r as { floor: ResolvedFloor }).floor;
};

describe("hợp đồng tầng", () => {
  it("dựng tầng xác định; scope/tầng/phiên bản khác thì khác", () => {
    const a = floorOf(def());
    assert.deepEqual(a, floorOf(def()));
    assert.equal(a.rngVersion, FLOOR_RNG_VERSION);
    assert.equal(a.foes.length, 3);
    assert.notEqual(a.fingerprint, floorOf(def({ floor: 4 })).fingerprint);
    const d1 = floorOf(def({ mode: "destiny" }), "2026-10-19");
    const d2 = floorOf(def({ mode: "destiny" }), "2026-10-26");
    assert.notEqual(d1.fingerprint, d2.fingerprint);
    assert.deepEqual(d1, floorOf(def({ mode: "destiny" }), "2026-10-19"));
  });

  it("từ chối tầng/scope/đối thủ/luật sai", () => {
    const code = (d: FloorDefinition, s = "trial") => {
      const r = resolveFloor(d, s);
      return r.ok ? null : r.error.code;
    };
    assert.equal(code(def({ floor: 0 })), "invalid_floor");
    assert.equal(code(def({ floor: 21 })), "invalid_floor");
    assert.equal(code(def(), "bad scope!"), "invalid_scope");
    assert.equal(code(def({ enemy: { level: 5, power: 0, count: 3, difficulty: "easy" } })), "invalid_enemy");
    assert.equal(code(def({ enemy: { level: 5, power: 1, count: 4 as 3, difficulty: "easy" } })), "invalid_enemy");
    assert.equal(code(def({ rules: { minElements: { hoa: 2, kim: 2 } } })), "invalid_rules");
  });

  it("bộ tầng Trial: phải đủ 20 tầng liên tục", () => {
    const full = Array.from({ length: 20 }, (_, i) => def({ floor: i + 1 }));
    assert.deepEqual(validateTrialFloorSet(full), []);
    assert.ok(validateTrialFloorSet(full.slice(0, 19)).length > 0);
    assert.ok(validateTrialFloorSet([...full.slice(0, 5), ...full.slice(6)]).length > 0);
  });
});

describe("thưởng Trial", () => {
  it("lần đầu một lần; đánh lại và settle lặp không thưởng", () => {
    const r1 = planTrialSettle(NEW_TRIAL, { floor: 1, won: true, firstClearStones: 5 });
    assert.ok(r1.ok);
    if (!r1.ok) return;
    assert.deepEqual(r1.events, [
      { kind: "stone", mode: "trial", source: "trial_first_clear", amount: 5, key: stoneKeys.trialFirst(1) },
    ]);
    assert.equal(r1.next.cleared, 1);
    const r2 = planTrialSettle(r1.next, { floor: 1, won: true, firstClearStones: 5 });
    assert.ok(r2.ok && r2.events.length === 0 && r2.next === r1.next);
  });

  it("thua không đổi gì; không nhảy tầng; số liệu sai bị từ chối", () => {
    const lose = planTrialSettle(NEW_TRIAL, { floor: 1, won: false, firstClearStones: 5 });
    assert.ok(lose.ok && lose.events.length === 0 && lose.next === NEW_TRIAL);
    assert.deepEqual(planTrialSettle(NEW_TRIAL, { floor: 2, won: true, firstClearStones: 5 }), { ok: false, error: "invalid_floor" });
    assert.deepEqual(planTrialSettle(NEW_TRIAL, { floor: 1, won: true, firstClearStones: -1 }), { ok: false, error: "invalid_amount" });
    assert.deepEqual(planTrialSettle(NEW_TRIAL, { floor: 1, won: true, firstClearStones: 1.5 }), { ok: false, error: "invalid_amount" });
  });

  it("quét một lần mỗi ngày VN, ngày mới quét lại được", () => {
    const s1 = planTrialSweep(NEW_TRIAL, { day: "2026-10-23", stones: 3 });
    assert.ok(s1.ok && s1.events[0]?.key === stoneKeys.trialSweep("2026-10-23"));
    if (!s1.ok) return;
    const again = planTrialSweep(s1.next, { day: "2026-10-23", stones: 3 });
    assert.ok(again.ok && again.events.length === 0);
    const next = planTrialSweep(s1.next, { day: "2026-10-24", stones: 3 });
    assert.ok(next.ok && next.events.length === 1);
    assert.deepEqual(planTrialSweep(NEW_TRIAL, { day: "hôm nay", stones: 3 }), { ok: false, error: "invalid_day" });
  });

  it("sự kiện chỉ chứa đá: không vàng/EXP/trang bị", () => {
    const r = planTrialSettle(NEW_TRIAL, { floor: 1, won: true, firstClearStones: 1 });
    assert.ok(r.ok);
    if (r.ok)
      assert.deepEqual(Object.keys(r.events[0]!).sort(), ["amount", "key", "kind", "mode", "source"]);
  });
});

describe("thưởng Destiny", () => {
  const cyc = "2026-10-19";
  const start = { ...NEW_DESTINY, cycleId: cyc };
  const ms: DestinyMilestone[] = [
    { id: "m3", floor: 3, stones: 2 },
    { id: "m6", floor: 6, stones: 4 },
  ];

  it("mốc phát một lần; cycleBest chỉ tăng; qua nhiều mốc một lúc", () => {
    const a = planDestinyFloorClear(start, { cycleId: cyc, floor: 3, milestones: ms });
    assert.ok(a.ok);
    if (!a.ok) return;
    assert.deepEqual(a.events.map((e) => e.key), [stoneKeys.destinyMilestone(cyc, "m3")]);
    assert.equal(a.next.cycleBest, 3);
    const b = planDestinyFloorClear(a.next, { cycleId: cyc, floor: 3, milestones: ms });
    assert.ok(b.ok && b.events.length === 0);
    const c = planDestinyFloorClear(start, { cycleId: cyc, floor: 7, milestones: ms });
    assert.ok(c.ok && c.events.length === 2 && c.next.cycleBest === 7);
    if (c.ok) {
      const d = planDestinyFloorClear(c.next, { cycleId: cyc, floor: 2, milestones: ms });
      assert.ok(d.ok && d.next.cycleBest === 7 && d.events.length === 0);
    }
  });

  it("từ chối: lệch chu kỳ, mốc trùng/hỏng", () => {
    assert.deepEqual(planDestinyFloorClear(start, { cycleId: "2026-10-26", floor: 1, milestones: ms }), { ok: false, error: "cycle_mismatch" });
    assert.deepEqual(planDestinyFloorClear(NEW_DESTINY, { cycleId: cyc, floor: 1, milestones: ms }), { ok: false, error: "cycle_mismatch" });
    assert.deepEqual(planDestinyFloorClear(start, { cycleId: cyc, floor: 1, milestones: [ms[0]!, ms[0]!] }), { ok: false, error: "invalid_milestone" });
    assert.deepEqual(planDestinyFloorClear(start, { cycleId: cyc, floor: 1, milestones: [{ id: "x", floor: 1, stones: -1 }] }), { ok: false, error: "invalid_amount" });
  });

  it("thưởng chu kỳ một lần theo cycleBest", () => {
    const p = { ...start, cycleBest: 6 };
    const a = planDestinyCycleEnd(p, { cycleId: cyc, stonesForBest: (n) => n * 2 });
    assert.ok(a.ok && a.events[0]?.amount === 12 && a.events[0].key === stoneKeys.destinyCycle(cyc));
    if (!a.ok) return;
    const b = planDestinyCycleEnd(a.next, { cycleId: cyc, stonesForBest: () => 99 });
    assert.ok(b.ok && b.events.length === 0);
    assert.deepEqual(planDestinyCycleEnd(p, { cycleId: cyc, stonesForBest: () => -1 }), { ok: false, error: "invalid_amount" });
  });
});

describe("vòng đời", () => {
  it("Trial và Destiny có bảng chuyển pha riêng", () => {
    assert.ok(canTransitionTrial("idle", "prep"));
    assert.ok(!canTransitionTrial("idle", "in_battle"));
    assert.ok(canTransitionTrial("in_battle", "settled"));
    assert.ok(canTransitionDestiny("in_battle", "reward"));
    assert.ok(canTransitionDestiny("reward", "prep"));
    assert.ok(!canTransitionDestiny("ended", "prep"));
    assert.ok(!canTransitionDestiny("in_battle", "prep"));
  });
});

describe("kiểm tra trận", () => {
  const fl = floorOf(def({ mode: "destiny" }), "2026-10-19");
  const lineup = ["dinhBoLinh", "haVan", "maiThanh"];
  const battle = {
    sides: [
      { fighters: lineup.map((id) => ({ id })) },
      { fighters: fl.foes.map((f) => ({ id: f.id })) },
    ],
  };
  const tag = makeTowerMatchTag(fl, lineup);

  it("hợp lệ", () => {
    assert.equal(validateTowerMatch(tag, fl, battle, lineup), null);
  });

  it("từ chối từng loại lệch", () => {
    assert.equal(validateTowerMatch({ ...tag, mode: "trial" }, fl, battle, lineup), "mode_mismatch");
    assert.equal(validateTowerMatch({ ...tag, scopeId: "2026-10-26" }, fl, battle, lineup), "scope_mismatch");
    assert.equal(validateTowerMatch({ ...tag, floor: 4 }, fl, battle, lineup), "floor_mismatch");
    assert.equal(validateTowerMatch({ ...tag, rngVersion: 99 }, fl, battle, lineup), "rng_version_mismatch");
    assert.equal(validateTowerMatch({ ...tag, fingerprint: "x" }, fl, battle, lineup), "fingerprint_mismatch");
    const swapped = { sides: [{ fighters: [...lineup].reverse().map((id) => ({ id })) }, battle.sides[1]!] };
    assert.equal(validateTowerMatch(tag, fl, swapped, lineup), "lineup_mismatch");
    const foes = { sides: [battle.sides[0]!, { fighters: [{ id: "lạ" }] }] };
    assert.equal(validateTowerMatch(tag, fl, foes, lineup), "foes_mismatch");
    assert.equal(validateTowerMatch(tag, fl, battle, ["dinhBoLinh", "haVan"]), "roster_mismatch");
    assert.equal(validateTowerMatch(tag, fl, battle), "roster_mismatch");
  });

  it("Trial không cần roster", () => {
    const t = floorOf(def());
    const b = { sides: [battle.sides[0]!, { fighters: t.foes.map((f) => ({ id: f.id })) }] };
    assert.equal(validateTowerMatch(makeTowerMatchTag(t, lineup), t, b), null);
  });
});
