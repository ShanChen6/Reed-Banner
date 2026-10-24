import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTrialRegistry, serializeTrialFloor } from "../../src/core/tower/trialFloors";
import { analyzeFeasibility, profileCandidates } from "../../src/core/tower/puzzleValidator";
import { STARTER_COMPANIONS } from "../../src/core/roster/roster";
import { TRIAL_DESIGN_REASON, TRIAL_FLOOR_DATA } from "../../src/server/trialContent";
import { evaluateTrialContent, trialTestProfile } from "../../src/server/trialContentReport";

describe("nội dung 20 tầng Trial V1", () => {
  it("đủ 20 tầng liên tục, parse được và snapshot idempotent", () => {
    const registry = createTrialRegistry(TRIAL_FLOOR_DATA, { requireComplete: true });
    assert.ok(registry.ok);
    assert.equal(TRIAL_DESIGN_REASON.length, 20);
    if (!registry.ok) return;
    const again = createTrialRegistry(JSON.parse(registry.registry.snapshot()), { requireComplete: true });
    assert.ok(again.ok);
    if (again.ok) assert.equal(again.registry.snapshot(), registry.registry.snapshot());
    assert.equal(new Set(registry.registry.all().map(serializeTrialFloor)).size, 20);
  });

  it("đúng bốn nhóm thiết kế và mọi trận giữ 3v3/defeatAll", () => {
    for (const spec of TRIAL_FLOOR_DATA) {
      assert.equal(spec.enemy.foeIds.length, 3);
      assert.equal(spec.win.kind, "defeatAll");
      const keys = Object.keys(spec.rules);
      if (spec.floor <= 5) {
        assert.equal(keys.length, 1);
        assert.ok(keys[0] === "bannedElements" || keys[0] === "bannedProfessions");
      } else if (spec.floor <= 10) {
        assert.ok(keys.some((key) => key.startsWith("min") || key.startsWith("max")));
      } else if (spec.floor <= 15) {
        assert.deepEqual(spec.rules, {});
        assert.ok(spec.board.weights);
        assert.ok(spec.turnLimit <= 28);
      } else {
        assert.equal(keys.length, 2);
        assert.ok(spec.difficulty === "boss" || spec.difficulty === "nightmare");
      }
    }
  });

  it("không tầng nào khóa roster khởi đầu hoặc bắt buộc tướng hiếm", () => {
    for (const spec of TRIAL_FLOOR_DATA) {
      const profile = trialTestProfile(spec.enemy.level);
      assert.deepEqual(Object.keys(profile.companions).sort(), STARTER_COMPANIONS.map((c) => c.id).sort());
      const report = analyzeFeasibility(spec.rules, profileCandidates(profile));
      assert.equal(report.status, "feasible", `tầng ${spec.floor}`);
      assert.ok(report.lineupsValid > 0, `tầng ${spec.floor}`);
    }
  });

  it("simulator có sample thắng xác nhận cho từng tầng", () => {
    const results = evaluateTrialContent(TRIAL_FLOOR_DATA);
    assert.equal(results.length, 20);
    for (const result of results) {
      assert.ok(result.sampleTeams > 0, `tầng ${result.floor}: không có đội mẫu`);
      assert.ok(result.wins >= 10, `tầng ${result.floor}: tỷ lệ chuẩn dưới 10/12`);
      assert.ok(result.sampleTurns !== null, `tầng ${result.floor}: thiếu số lượt`);
    }
  });

  it("QA deterministic và mỗi tầng có ít nhất một cặp starter tối thiểu hợp luật", () => {
    for (const spec of TRIAL_FLOOR_DATA) {
      const profile = trialTestProfile(spec.enemy.level);
      const ids = Object.keys(profile.companions);
      let legalPairs = 0;
      for (let a = 0; a < ids.length; a++) {
        for (let b = a + 1; b < ids.length; b++) {
          const minimal = {
            ...profile,
            companions: { [ids[a]!]: profile.companions[ids[a]!]!, [ids[b]!]: profile.companions[ids[b]!]! },
          };
          if (analyzeFeasibility(spec.rules, profileCandidates(minimal), { maxSamples: 1 }).status === "feasible")
            legalPairs++;
        }
      }
      assert.ok(legalPairs > 0, `tầng ${spec.floor}: starter pair`);
    }
    const representative = TRIAL_FLOOR_DATA[19]!;
    assert.deepEqual(
      evaluateTrialContent([representative]),
      evaluateTrialContent(structuredClone([representative])),
      "simulator tầng cuối deterministic",
    );
  });

  it("tầng cân bằng lại tăng contentVersion để không đối chiếu sai trận cũ", () => {
    for (const floor of [16, 19, 20])
      assert.equal(TRIAL_FLOOR_DATA[floor - 1]!.contentVersion, 2);
  });
});
