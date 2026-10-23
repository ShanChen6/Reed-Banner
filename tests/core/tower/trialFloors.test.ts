import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createTrialRegistry,
  parseTrialFloorSpec,
  resolveFloor,
  serializeTrialFloor,
  toFloorDefinition,
  toPublicTrialFloor,
  trialEnemyBuilder,
  trialFloorId,
  validateFloorRules,
} from "../../../src/core";

const fixture = (floor: number, over: Record<string, unknown> = {}) => ({
  schema: 1,
  id: trialFloorId(floor),
  floor,
  contentVersion: 1,
  narrative: { title: `Tầng ${floor}`, intro: "Thử thách mở đầu." },
  difficulty: "normal",
  rules: { bannedElements: ["kim"], maxSameProfession: 2 },
  enemy: { foeIds: ["haVan", "maiThanh"], level: 5, power: 0.5 },
  board: { publicSeed: 1234 + floor },
  serverSalt: 99,
  turnLimit: 20,
  win: { kind: "defeatAll" },
  firstClearStones: 3,
  unlock: { requiresFloor: floor === 1 ? null : floor - 1 },
  ...over,
});

const codes = (raw: unknown) => {
  const r = parseTrialFloorSpec(raw);
  return r.ok ? [] : r.issues.map((i) => i.code);
};

describe("schema tầng Trial", () => {
  it("parse hợp lệ, bất biến (đóng băng) và không sửa dữ liệu gốc", () => {
    const raw = fixture(1);
    const before = structuredClone(raw);
    const r = parseTrialFloorSpec(raw);
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.deepEqual(raw, before);
    assert.ok(Object.isFrozen(r.spec) && Object.isFrozen(r.spec.enemy) && Object.isFrozen(r.spec.rules));
    assert.equal(r.spec.id, "trial.f01");
  });

  it("luật tầng serialize/parse roundtrip và idempotent", () => {
    const r = parseTrialFloorSpec(fixture(2));
    assert.ok(r.ok);
    if (!r.ok) return;
    const json = serializeTrialFloor(r.spec);
    const again = parseTrialFloorSpec(JSON.parse(json));
    assert.ok(again.ok);
    if (again.ok) assert.equal(serializeTrialFloor(again.spec), json);
    assert.deepEqual(JSON.parse(JSON.stringify(r.spec.rules)), r.spec.rules);
    assert.deepEqual(validateFloorRules(r.spec.rules), []);
  });

  it("thiếu rules thì coi là rỗng", () => {
    const raw: Record<string, unknown> = fixture(1);
    delete raw.rules;
    const r = parseTrialFloorSpec(raw);
    assert.ok(r.ok && Object.keys(r.spec.rules).length === 0);
  });

  it("tầng sai bị từ chối đúng mã", () => {
    assert.deepEqual(codes(null), ["not_object"]);
    assert.ok(codes({ ...fixture(1), schema: 2 }).includes("bad_schema"));
    assert.ok(codes(fixture(1, { floor: 0 })).includes("bad_floor"));
    assert.ok(codes(fixture(1, { floor: 21, id: "trial.f21" })).includes("bad_floor"));
    assert.ok(codes(fixture(1, { id: "trial.f02" })).includes("bad_id"));
    assert.ok(codes(fixture(1, { extra: 1 })).includes("unknown_key"));
    assert.ok(codes(fixture(1, { contentVersion: 0 })).includes("bad_version"));
    assert.ok(codes(fixture(1, { narrative: { title: "", intro: "x" } })).includes("bad_text"));
    assert.ok(codes(fixture(1, { difficulty: "dễ" })).includes("bad_difficulty"));
    assert.ok(codes(fixture(1, { enemy: { foeIds: [], level: 5, power: 1 } })).includes("bad_enemy"));
    assert.ok(codes(fixture(1, { enemy: { foeIds: ["haVan", "haVan"], level: 5, power: 1 } })).includes("bad_enemy"));
    assert.ok(codes(fixture(1, { enemy: { foeIds: ["khongCo"], level: 5, power: 1 } })).includes("unknown_foe"));
    assert.ok(codes(fixture(1, { enemy: { foeIds: ["haVan"], level: 5, power: 0 } })).includes("bad_enemy"));
    assert.ok(codes(fixture(1, { board: { publicSeed: -1 } })).includes("bad_board"));
    assert.ok(codes(fixture(1, { board: { publicSeed: 1, weights: { kiem: 100 } } })).includes("bad_board"));
    assert.ok(codes(fixture(1, { turnLimit: 0 })).includes("bad_number"));
    assert.ok(codes(fixture(1, { firstClearStones: -1 })).includes("bad_number"));
    assert.ok(codes(fixture(1, { firstClearStones: 1.5 })).includes("bad_number"));
    assert.ok(codes(fixture(1, { win: { kind: "xx" } })).includes("bad_win"));
    assert.ok(codes(fixture(1, { win: { kind: "surviveTurns", turns: 30 } })).includes("inconsistent"));
    assert.ok(codes(fixture(3, { unlock: { requiresFloor: null } })).includes("bad_unlock"));
    assert.ok(codes(fixture(1, { unlock: { requiresFloor: 1 } })).includes("bad_unlock"));
  });

  it("luật mâu thuẫn/bất khả thi bị báo kèm chi tiết", () => {
    const r = parseTrialFloorSpec(fixture(1, { rules: { bannedElements: ["hoa"], minElements: { hoa: 1 } } }));
    assert.ok(!r.ok);
    if (!r.ok) {
      const bad = r.issues.find((i) => i.code === "bad_rules");
      assert.ok(bad?.ruleIssues?.some((i) => i.code === "banned_and_required"));
    }
  });

  it("điều kiện thắng surviveTurns hợp lệ", () => {
    assert.deepEqual(codes(fixture(1, { win: { kind: "surviveTurns", turns: 10 } })), []);
    assert.deepEqual(codes(fixture(1, { win: { kind: "defeatLeader" } })), []);
  });
});

describe("registry tầng Trial", () => {
  const set = (n: number) => Array.from({ length: n }, (_, i) => fixture(i + 1));

  it("snapshot xác định; chỉ đọc", () => {
    const a = createTrialRegistry(set(3));
    const b = createTrialRegistry(set(3));
    assert.ok(a.ok && b.ok);
    if (!a.ok || !b.ok) return;
    assert.equal(a.registry.snapshot(), b.registry.snapshot());
    assert.equal(a.registry.size, 3);
    assert.equal(a.registry.get(2)?.id, "trial.f02");
    assert.equal(a.registry.get(9), undefined);
    assert.throws(() => {
      (a.registry.all() as unknown as unknown[]).push(1);
    });
    assert.throws(() => {
      (a.registry.get(1) as { floor: number }).floor = 7;
    });
    const other = createTrialRegistry([fixture(1, { contentVersion: 2 }), ...set(3).slice(1)]);
    assert.ok(other.ok && other.registry.snapshot() !== a.registry.snapshot());
  });

  it("từ chối: tầng hỏng, trùng id, thiếu liên tục, chưa đủ 20", () => {
    const bad = createTrialRegistry([fixture(1), fixture(2, { turnLimit: 0 })]);
    assert.ok(!bad.ok && bad.error.code === "invalid_floor" && bad.error.index === 1);
    const dup = createTrialRegistry([fixture(1), fixture(1)]);
    assert.ok(!dup.ok && dup.error.code === "duplicate_id");
    const gap = createTrialRegistry([fixture(1), fixture(3)]);
    assert.ok(!gap.ok && gap.error.code === "non_contiguous");
    const part = createTrialRegistry(set(5), { requireComplete: true });
    assert.ok(!part.ok && part.error.code === "incomplete");
    assert.ok(createTrialRegistry(set(20), { requireComplete: true }).ok);
  });

  it("bản công khai không lộ dữ liệu server-only", () => {
    const r = createTrialRegistry([fixture(1, { board: { publicSeed: 5, weights: { kiem: 18, amDuong: 16, banhChung: 15, tim: 15, vang: 11, sach: 11, trong: 14 } }, serverSalt: 777 })]);
    assert.ok(r.ok);
    if (!r.ok) return;
    const pub = r.registry.publicView(1)!;
    const text = JSON.stringify(pub);
    for (const secret of ["serverSalt", "777", "power", "weights", "level", "enemy"])
      assert.ok(!text.includes(secret), secret);
    assert.equal(pub.publicSeed, 5);
    assert.deepEqual(pub.foeIds, ["haVan", "maiThanh"]);
    assert.deepEqual(toPublicTrialFloor(r.registry.get(1)!), pub);
  });

  it("nối hợp đồng T01.04: dựng tầng xác định đúng foeIds", () => {
    const r = createTrialRegistry(set(1));
    assert.ok(r.ok);
    if (!r.ok) return;
    const spec = r.registry.get(1)!;
    const a = resolveFloor(toFloorDefinition(spec), "trial", trialEnemyBuilder(spec));
    const b = resolveFloor(toFloorDefinition(spec), "trial", trialEnemyBuilder(spec));
    assert.ok(a.ok && b.ok);
    if (a.ok && b.ok) {
      assert.deepEqual(a.floor, b.floor);
      assert.deepEqual(a.floor.foes.map((f) => f.id), ["haVan", "maiThanh"]);
    }
  });
});
