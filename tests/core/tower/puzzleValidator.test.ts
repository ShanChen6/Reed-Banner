import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeFeasibility,
  analyzeTrialFloor,
  newProfile,
  parseTrialFloorSpec,
  profileCandidates,
  replayPath,
  searchPuzzle,
  trialFloorId,
  resolveFloor,
  toFloorDefinition,
  trialEnemyBuilder,
  profileTeam,
  type FloorRules,
  type LineupMember,
  type Profile,
  type PuzzleSetup,
  type TrialFloorSpec,
} from "../../../src/core";

const m = (id: string, element: string, profession: string) =>
  ({ id, element, profession }) as LineupMember;
const HA = m("haVan", "hoa", "phapSu");
const MAI = m("maiThanh", "thuy", "ySu");
const LE = m("leThach", "tho", "binhLinh");
const TO = m("toKim", "kim", "muuSi");

const profile = (): Profile => {
  const p = newProfile();
  return { ...p, main: { ...p.main, level: 20 } };
};

const spec = (over: Record<string, unknown> = {}): TrialFloorSpec => {
  const r = parseTrialFloorSpec({
    schema: 1,
    id: trialFloorId(1),
    floor: 1,
    contentVersion: 1,
    narrative: { title: "Tầng 1", intro: "x" },
    difficulty: "easy",
    rules: {},
    enemy: { foeIds: ["haVan"], level: 1, power: 0.05 },
    board: { publicSeed: 4242 },
    serverSalt: 1,
    turnLimit: 6,
    win: { kind: "defeatAll" },
    firstClearStones: 1,
    unlock: { requiresFloor: null },
    ...over,
  });
  assert.ok(r.ok, JSON.stringify(r));
  return (r as { spec: TrialFloorSpec }).spec;
};

describe("khả thi tĩnh của luật", () => {
  it("luật mâu thuẫn → rules_invalid, không duyệt đội", () => {
    const r = analyzeFeasibility({ bannedElements: ["hoa"], minElements: { hoa: 1 } }, [HA, MAI, LE]);
    assert.equal(r.status, "rules_invalid");
    assert.ok(r.ruleIssues.length > 0);
    assert.equal(r.lineupsExamined, 0);
  });

  it("cấm Hỏa: tướng Hỏa bị đánh dấu và không xuất hiện trong đội mẫu", () => {
    const r = analyzeFeasibility({ bannedElements: ["hoa"] }, [HA, MAI, LE]);
    assert.equal(r.status, "feasible");
    assert.deepEqual(r.companionsBanned, ["haVan"]);
    for (const s of r.samples) assert.ok(s.members.every((x) => x.element !== "hoa"));
  });

  it("cấm Pháp sư: build thủ lĩnh Pháp sư không nằm trong đội hợp lệ", () => {
    const r = analyzeFeasibility({ bannedProfessions: ["phapSu"] }, [HA, MAI, LE]);
    assert.equal(r.status, "feasible");
    assert.deepEqual(r.companionsBanned, ["haVan"]);
    assert.ok(r.samples.every((s) => s.members.every((x) => x.profession !== "phapSu")));
  });

  it("bắt buộc Binh lính: thủ lĩnh đổi nghề để thỏa khi tướng kèm không có", () => {
    const r = analyzeFeasibility({ minProfessions: { binhLinh: 1 } }, [HA, MAI]);
    assert.equal(r.status, "feasible");
    assert.ok(r.samples.every((s) => s.members[0]!.profession === "binhLinh"));
  });

  it("ba nghề khác nhau: thủ lĩnh phải chọn nghề chưa dùng", () => {
    const r = analyzeFeasibility({ maxSameProfession: 1 }, [HA, MAI]);
    assert.equal(r.status, "feasible");
    for (const s of r.samples)
      assert.equal(new Set(s.members.map((x) => x.profession)).size, 3);
  });

  it("không có đội: cả hai tướng đều bị cấm → no_lineup, nêu luật chặn", () => {
    const r = analyzeFeasibility({ bannedElements: ["hoa", "thuy"] }, [HA, MAI]);
    assert.equal(r.status, "no_lineup");
    assert.equal(r.lineupsValid, 0);
    assert.ok((r.blockedBy.banned_element ?? 0) > 0);
    assert.equal(r.truncated, false);
  });

  it("tổ hợp bất khả thi do roster: cần 2 Hỏa nhưng roster chỉ có 1 tướng Hỏa", () => {
    // Thủ lĩnh đổi sang Hỏa được, nên 2 Hỏa vẫn khả thi; cần 3 Hỏa mới bất khả thi vì roster chỉ 1 Hỏa.
    assert.equal(analyzeFeasibility({ minElements: { hoa: 2 } }, [HA, MAI]).status, "feasible");
    const r = analyzeFeasibility({ minElements: { hoa: 3 } }, [HA, MAI]);
    assert.equal(r.status, "no_lineup");
    assert.ok((r.blockedBy.min_element ?? 0) > 0);
  });

  it("roster thiếu (dưới 2 tướng kèm) → no_lineup, không ném lỗi", () => {
    const r = analyzeFeasibility({}, [HA]);
    assert.equal(r.status, "no_lineup");
    assert.equal(r.lineupsExamined, 0);
  });

  it("bỏ qua tướng trùng id và thủ lĩnh; tất định, không đổi đầu vào", () => {
    const input = [HA, HA, MAI, m("dinhBoLinh", "moc", "tuongSi")];
    const before = structuredClone(input);
    const rules: FloorRules = { maxSameProfession: 1 };
    const a = analyzeFeasibility(rules, input);
    assert.equal(a.companionsConsidered, 2);
    assert.deepEqual(input, before);
    assert.deepEqual(analyzeFeasibility(rules, input), a);
  });

  it("chạm giới hạn duyệt: truncated và không khẳng định no_lineup bừa", () => {
    const r = analyzeFeasibility({}, [HA, MAI, LE, TO], { maxExamined: 1 });
    assert.equal(r.truncated, true);
    assert.equal(r.lineupsExamined, 1);
  });
});

const setupFor = (over: Partial<PuzzleSetup> = {}, power = 0.05): PuzzleSetup => {
  const p = profile();
  const s = spec({ enemy: { foeIds: ["haVan"], level: 1, power } });
  const f = resolveFloor(toFloorDefinition(s), "trial", trialEnemyBuilder(s));
  assert.ok(f.ok);
  if (!f.ok) throw new Error("resolve");
  return {
    sides: [{ fighters: profileTeam(p, ["haVan", "maiThanh"]), leader: 0 }, { fighters: f.floor.foes, leader: 0 }],
    seed: 4242,
    difficulty: "easy",
    win: { kind: "defeatAll" },
    turnLimit: 6,
    weights: f.floor.weights,
    ...over,
  };
};

describe("tìm đường thắng có giới hạn", () => {
  it("tìm thấy đường thắng, đã phát lại xác nhận, tất định", () => {
    const setup = setupFor();
    const a = searchPuzzle(setup, { maxNodes: 3000 });
    assert.equal(a.status, "win_found");
    if (a.status !== "win_found") return;
    assert.equal(a.verified, true);
    assert.ok(a.path.length >= 1 && a.path.length <= setup.turnLimit);
    assert.equal(replayPath(setup, a.path), "won");
    assert.deepEqual(searchPuzzle(setup, { maxNodes: 3000 }), a);
  });

  it("đường đi bị sửa thì phát lại không còn thắng (không tin path từ ngoài)", () => {
    const setup = setupFor();
    const a = searchPuzzle(setup);
    assert.equal(a.status, "win_found");
    if (a.status !== "win_found") return;
    assert.notEqual(replayPath(setup, []), "won");
  });

  it("không thấy đường thắng: unresolved kèm coverage, không kết luận bất khả thi", () => {
    const setup = setupFor({ turnLimit: 2 }, 10);
    const r = searchPuzzle(setup, { maxNodes: 400, beamWidth: 4 });
    assert.equal(r.status, "unresolved");
    if (r.status !== "unresolved") return;
    assert.ok(r.coverage.nodes > 0 && r.coverage.nodes <= 400);
    assert.ok(["budget_exhausted", "beam_pruned", "explored_restricted_model"].includes(r.reason));
    assert.equal(r.coverage.actionModel, "actor×swap+heuristic-skill");
    assert.ok(!("path" in r));
  });

  it("ngân sách nhỏ → budget_exhausted", () => {
    const r = searchPuzzle(setupFor({ turnLimit: 4 }, 10), { maxNodes: 3 });
    assert.equal(r.status, "unresolved");
    if (r.status === "unresolved") {
      assert.equal(r.reason, "budget_exhausted");
      assert.equal(r.coverage.budgetExhausted, true);
    }
  });

  it("setup sai (turnLimit 0, surviveTurns vượt turnLimit) → invalid_setup", () => {
    for (const bad of [
      { turnLimit: 0 },
      { win: { kind: "surviveTurns", turns: 9 } as const, turnLimit: 3 },
    ]) {
      const r = searchPuzzle(setupFor(bad));
      assert.equal(r.status, "unresolved");
      if (r.status === "unresolved") assert.equal(r.reason, "invalid_setup");
    }
  });

  it("không sửa cấu hình đầu vào", () => {
    const setup = setupFor();
    const before = structuredClone(setup);
    searchPuzzle(setup, { maxNodes: 200 });
    assert.deepEqual(setup, before);
  });
});

describe("phân tích một tầng Trial", () => {
  it("tầng yếu: win_path_found, Profile không đổi, có disclaimer", () => {
    const p = profile();
    const before = structuredClone(p);
    const r = analyzeTrialFloor(spec(), p, { maxNodes: 3000 });
    assert.equal(r.status, "win_path_found");
    assert.ok(r.path && r.winningLineup);
    assert.match(r.disclaimer, /không chứng minh/);
    assert.deepEqual(p, before);
  });

  it("tầng quá mạnh trong ngân sách nhỏ: no_win_path_detected (không phải 'bất khả thi')", () => {
    const hard = spec({ enemy: { foeIds: ["haVan", "leThach", "toKim"], level: 30, power: 10 }, turnLimit: 2 });
    const r = analyzeTrialFloor(hard, profile(), { maxNodes: 200, beamWidth: 4, maxLineups: 1 });
    assert.equal(r.status, "no_win_path_detected");
    assert.equal(r.feasibility.status, "feasible");
    assert.equal(r.attempts.length, 1);
    assert.equal(r.path, undefined);
  });

  it("đội hợp lệ nhưng không có đội nào: no_lineup, không tìm đường", () => {
    const s = spec({ rules: { bannedElements: ["hoa", "thuy", "tho", "kim", "phong"] } });
    const r = analyzeTrialFloor(s, profile());
    assert.equal(r.status, "no_lineup");
    assert.equal(r.attempts.length, 0);
  });

  it("luật mâu thuẫn trong spec chưa parse → rules_invalid", () => {
    const bad = { ...spec(), rules: { bannedElements: ["hoa"], minElements: { hoa: 1 } } } as TrialFloorSpec;
    const r = analyzeTrialFloor(bad, profile());
    assert.equal(r.status, "rules_invalid");
  });

  it("profileCandidates: chỉ tướng đã sở hữu, đúng hệ/nghề", () => {
    const c = profileCandidates(profile());
    assert.deepEqual(c.map((x) => x.id).sort(), ["haVan", "leThach", "maiThanh", "phungPhong", "toKim"]);
    assert.deepEqual(c.find((x) => x.id === "haVan"), HA);
  });
});
