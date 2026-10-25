import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyCampaignFirstClear,
  CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD,
  CAMPAIGN_MISSION_IDS,
  isCombatStoryNode,
  newProfile,
  parseCampaign,
  simulateMission,
  STORY_NODES,
  type CampaignMissionId,
} from "../../../src/core";

// CAMP-09.02: mô phỏng nhiệm vụ có trận chốt đúng mục tiêu, tất định theo seed, và chơi lại không nhận lại thưởng.
const COMBAT = STORY_NODES.filter(isCombatStoryNode).map((n) => n.id);

describe("mô phỏng Campaign V2", () => {
  it("chỉ nhiệm vụ battle/defense/siege/boss có trận", () => {
    assert.deepEqual(COMBAT, ["M03", "M04", "M07", "M15", "M16", "M17", "M18", "M20", "M21"]);
    assert.throws(() => simulateMission("M01", 0));
  });

  it("cùng seed ra cùng kết quả; mỗi phase mở với ít nhất một nước đi, không trận nào chạm giới hạn lượt", () => {
    for (const id of COMBAT) {
      for (const run of [0, 1]) {
        const a = simulateMission(id, run, 5);
        assert.deepEqual(simulateMission(id, run, 5), a, id);
        assert.notEqual(a.outcome, "stalled", id);
        for (const p of a.phases) assert.ok(p.hadValidMove, `${id}#${p.phaseIndex}`);
      }
    }
  });

  it("phòng thủ thắng khi đủ lượt cầm cự; công thành và trùm nhiều phase đi đủ phase khi thắng", () => {
    const m03 = simulateMission("M03", 0, 1, { levelOffset: 3 });
    assert.equal(m03.outcome, "succeeded");
    assert.ok(m03.phases[0]!.playerTurns <= 4);
    for (const id of ["M20", "M21"] as const) {
      const r = simulateMission(id, 0, 1, { levelOffset: 4 });
      if (r.outcome === "succeeded") assert.equal(r.phases.length, 3, id);
    }
  });

  it("chơi lại nhiệm vụ đã qua không cộng lại vàng lần đầu hay vàng chương", () => {
    const upTo = (n: number) => ({
      ...newProfile(),
      campaign: parseCampaign({ version: 2, completed: CAMPAIGN_MISSION_IDS.slice(0, n) }),
    });
    const before = upTo(2);
    const first = applyCampaignFirstClear(before, { nodeId: "M03" as CampaignMissionId, source: "battle", turns: 4 });
    assert.ok(first.ok);
    assert.equal(first.reward.missionGold, 250);
    const again = applyCampaignFirstClear(first.profile, { nodeId: "M03", source: "battle", turns: 3 });
    assert.ok(again.ok);
    assert.equal(again.reward.totalGold, 0);
    assert.equal(again.profile.gold, first.profile.gold);
    // Lần nhanh hơn chỉ cập nhật kỷ lục lượt.
    assert.equal(again.profile.campaign.bestBattleTurns.M03, 3);
  });

  it("tổng vàng lần đầu của Campaign giữ trong khung đã duyệt, không có đá", () => {
    const missionGold = STORY_NODES.reduce((a, n) => a + n.rewards.firstClearGold, 0);
    assert.equal(CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD, 250);
    assert.ok(missionGold + 6 * CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD <= 8000, String(missionGold));
    for (const n of STORY_NODES) assert.deepEqual(Object.keys(n.rewards), ["firstClearGold"], n.id);
  });
});
