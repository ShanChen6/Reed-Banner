import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FloorRules } from "../../src/core/tower/floorRules";
import { createTrialRegistry, serializeTrialFloor } from "../../src/core/tower/trialFloors";
import { analyzeFeasibility, profileCandidates } from "../../src/core/tower/puzzleValidator";
import { STARTER_COMPANIONS } from "../../src/core/roster/roster";
import { TRIAL_DESIGN_REASON, TRIAL_FLOOR_DATA } from "../../src/server/trialContent";
import { evaluateTrialContent, trialTestProfile } from "../../src/server/trialContentReport";

/** Số luật đơn trong một bộ luật: mỗi hệ/nghề bị cấm hoặc bắt buộc là một luật, mỗi giới hạn "khác nhau" là một luật. */
function ruleCount(rules: FloorRules): number {
  return (
    (rules.bannedElements?.length ?? 0) +
    (rules.bannedProfessions?.length ?? 0) +
    Object.keys(rules.minElements ?? {}).length +
    Object.keys(rules.minProfessions ?? {}).length +
    (rules.maxSameElement === undefined ? 0 : 1) +
    (rules.maxSameProfession === undefined ? 0 : 1)
  );
}

describe("nội dung 50 tầng Trial", () => {
  it("đủ 50 tầng liên tục, parse được và snapshot idempotent", () => {
    const registry = createTrialRegistry(TRIAL_FLOOR_DATA, { requireComplete: true });
    assert.ok(registry.ok);
    assert.equal(TRIAL_DESIGN_REASON.length, 50);
    if (!registry.ok) return;
    const again = createTrialRegistry(JSON.parse(registry.registry.snapshot()), { requireComplete: true });
    assert.ok(again.ok);
    if (again.ok) assert.equal(again.registry.snapshot(), registry.registry.snapshot());
    assert.equal(new Set(registry.registry.all().map(serializeTrialFloor)).size, 50);
  });

  it("đúng các nhóm thiết kế và mọi trận giữ 3v3/defeatAll", () => {
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
      } else if (spec.floor <= 20) {
        assert.equal(keys.length, 2);
        assert.ok(spec.difficulty === "boss" || spec.difficulty === "nightmare");
      } else {
        // Chặng III một luật, chặng IV hai luật, chặng V ba luật; ải trùm ở cuối mỗi nửa chặng cao.
        assert.equal(ruleCount(spec.rules), spec.floor <= 30 ? 1 : spec.floor <= 40 ? 2 : 3, `tầng ${spec.floor}`);
        if (spec.floor % 10 === 0) assert.ok(spec.difficulty === "boss" || spec.difficulty === "nightmare", `tầng ${spec.floor}`);
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
    assert.equal(results.length, 50);
    for (const result of results) {
      assert.ok(result.sampleTeams > 0, `tầng ${result.floor}: không có đội mẫu`);
      // Đội mẫu chỉ có tướng khởi đầu, không trang bị. Tầng 1-30 giữ ngưỡng 10/12; tầng 31-49 nới còn 8/12 vì
      // người chơi tới đó đã có trang bị và tướng cửa hàng; đỉnh tháp là tầng khó nhất nên chỉ cần 6/12.
      const need = result.floor <= 30 ? 10 : result.floor < 50 ? 8 : 6;
      assert.ok(result.wins >= need, `tầng ${result.floor}: ${result.wins}/12, cần ${need}/12`);
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
    const representative = TRIAL_FLOOR_DATA.at(-1)!;
    assert.deepEqual(
      evaluateTrialContent([representative]),
      evaluateTrialContent(structuredClone([representative])),
      "simulator tầng cuối deterministic",
    );
  });

  it("tầng cân bằng lại tăng contentVersion để không đối chiếu sai trận cũ", () => {
    // Tầng 16, 19 cân bằng lại ở V1; tầng 20 thêm lần hai và tầng 24, 38, 40, 50 một lần khi Nộ riêng từng tướng áp dụng cho Trial (14/11/2026).
    for (const floor of [16, 19, 24, 38, 40, 50])
      assert.equal(TRIAL_FLOOR_DATA[floor - 1]!.contentVersion, 2);
    assert.equal(TRIAL_FLOOR_DATA[19]!.contentVersion, 3);
  });
});
