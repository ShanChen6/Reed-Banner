import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyCampaignFirstClear,
  completeCampaignNode,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../../src/core";

function complete(
  campaign: CampaignProgressV2,
  ids: readonly CampaignMissionId[],
): CampaignProgressV2 {
  let next = campaign;
  for (const id of ids) {
    const result = completeCampaignNode(next, id);
    assert.ok(result.ok, id);
    next = result.campaign;
  }
  return next;
}

describe("Campaign V2 first-clear rewards", () => {
  it("settles mission, chapter and recruit receipts in one profile transition", () => {
    const base = newProfile();
    const profile = {
      ...base,
      main: { ...base.main, level: 7, xp: 900, skillPoints: 6 },
      campaign: complete(base.campaign, ["M01", "M02", "M03"]),
    };
    const result = applyCampaignFirstClear(profile, {
      nodeId: "M04",
      source: "battle",
      turns: 6,
      supply: 47,
    });
    assert.ok(result.ok);
    assert.deepEqual(result.reward, {
      nodeId: "M04",
      firstClear: true,
      missionGold: 250,
      chapterGold: 250,
      totalGold: 500,
      supply: 47,
      unlockedHeroes: ["dinhLien"],
    });
    assert.deepEqual(result.profile.campaign.rewardReceipts, [
      "node:M04",
      "chapter:1",
      "hero:dinhLien",
    ]);
    assert.deepEqual(result.profile.campaign.unlockedHeroes, ["dinhLien"]);
    assert.equal(result.profile.companions.dinhLien?.level, 7);
    assert.equal(result.profile.companions.dinhLien?.skillPoints, 6);
    assert.equal(result.profile.stones, profile.stones);
  });

  it("is idempotent and preserves an existing hero instance", () => {
    const base = newProfile();
    const existing = { ...base.main, level: 9, xp: 1234, skillPoints: 2 };
    const profile = {
      ...base,
      companions: { ...base.companions, dinhLien: existing },
      campaign: complete(base.campaign, ["M01", "M02", "M03"]),
    };
    const first = applyCampaignFirstClear(profile, {
      nodeId: "M04",
      source: "battle",
      turns: 8,
      supply: 51,
    });
    assert.ok(first.ok);
    const replay = applyCampaignFirstClear(first.profile, {
      nodeId: "M04",
      source: "battle",
      turns: 7,
      supply: 49,
    });
    assert.ok(replay.ok);
    assert.equal(replay.reward.totalGold, 0);
    assert.deepEqual(replay.reward.unlockedHeroes, []);
    assert.deepEqual(replay.profile.companions.dinhLien, existing);
    assert.equal(replay.profile.campaign.bestBattleTurns.M04, 7);
    assert.equal(replay.profile.campaign.supply, 49);
  });

  it("rejects battle settlement for a story event", () => {
    const result = applyCampaignFirstClear(newProfile(), {
      nodeId: "M01",
      source: "battle",
    });
    assert.deepEqual(result, { ok: false, error: "wrongSource" });
  });
});
