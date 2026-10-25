import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_FOOD_START,
  NEW_CAMPAIGN,
  beginCampaignNode,
  campaignNodeUnlocked,
  chapterCompleted,
  completeCampaignNode,
  newProfile,
  parseCampaign,
  recordCampaignRewardReceipt,
  resetCampaignProgressForDev,
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

describe("CampaignProgressV2", () => {
  it("completes a story event without a battle win and opens its successor", () => {
    assert.ok(campaignNodeUnlocked(NEW_CAMPAIGN, "M01"));
    assert.ok(!campaignNodeUnlocked(NEW_CAMPAIGN, "M02"));
    const begun = beginCampaignNode(NEW_CAMPAIGN, "M01");
    assert.deepEqual(begun.inProgress, ["M01"]);
    const result = completeCampaignNode(begun, "M01", {
      choice: "listen",
      flags: ["introViewed", "choiceSubmitted"],
    });
    assert.ok(result.ok);
    assert.deepEqual(result.campaign.completed, ["M01"]);
    assert.deepEqual(result.campaign.inProgress, []);
    assert.equal(result.campaign.storyChoices.M01, "listen");
    assert.ok(campaignNodeUnlocked(result.campaign, "M02"));
    assert.deepEqual(result.campaign.bestBattleTurns, {});
    const receipt = recordCampaignRewardReceipt(
      result.campaign,
      "node:M01",
    );
    assert.equal(receipt.recorded, true);
    const duplicate = recordCampaignRewardReceipt(
      receipt.campaign,
      "node:M01",
    );
    assert.equal(duplicate.recorded, false);
    assert.equal(duplicate.campaign, receipt.campaign);
    assert.equal(
      recordCampaignRewardReceipt(receipt.campaign, "node:M99").recorded,
      false,
    );
  });

  it("uses the prerequisite DAG and chapter gates, including parallel routes", () => {
    let campaign = complete(NEW_CAMPAIGN, [
      "M01",
      "M02",
      "M03",
      "M04",
      "M05",
      "M06",
      "M07",
      "M08",
      "M09",
      "M10",
      "M11",
      "M12",
    ]);
    assert.ok(chapterCompleted(campaign, 3));
    assert.ok(campaignNodeUnlocked(campaign, "M13"));
    assert.ok(campaignNodeUnlocked(campaign, "M17"));
    assert.ok(!campaignNodeUnlocked(campaign, "M21"));

    campaign = complete(campaign, ["M13", "M14", "M15", "M16"]);
    assert.ok(!campaignNodeUnlocked(campaign, "M21"));
    campaign = complete(campaign, ["M17", "M18", "M19", "M20"]);
    assert.ok(campaignNodeUnlocked(campaign, "M21"));
  });

  it("sanitizes malformed IDs, choices, flags, turns and reward receipts", () => {
    const parsed = parseCampaign({
      version: 2,
      completed: ["M03", "M01", "bad", "M02", "M01"],
      inProgress: ["M03", "M04", "M99", "M04"],
      storyChoices: { M01: "listen", M02: "forged", M99: "listen" },
      storyFlags: {
        M01: ["introViewed", "forged", "introViewed"],
        M99: ["outroViewed"],
      },
      regionalOutcomes: {
        hoaLu: "defended",
        boHai: "unified",
        forged: "secured",
      },
      bestBattleTurns: { M01: 2, M03: 18, M04: -1, M99: 3 },
      supply: 999,
      rewardReceipts: [
        "node:M01",
        "node:M99",
        "chapter:1",
        "chapter:7",
        "hero:dinhLien",
        "hero:forged",
        "node:M01",
      ],
      unlockedHeroes: ["dinhLien", "forged", "dinhLien"],
      legacy: {
        cleared: ["coLau", "forged"],
        raids: { boHai: 2, forged: 3, doDong: 9 },
        bestTurns: { coLau: 12, forged: 3 },
      },
    });
    assert.deepEqual(parsed.completed, ["M01", "M02", "M03"]);
    assert.deepEqual(parsed.inProgress, ["M04"]);
    assert.deepEqual(parsed.storyChoices, { M01: "listen" });
    assert.deepEqual(parsed.storyFlags, { M01: ["introViewed"] });
    assert.deepEqual(parsed.regionalOutcomes, { hoaLu: "defended" });
    assert.deepEqual(parsed.bestBattleTurns, { M03: 18 });
    assert.equal(parsed.supply, 100);
    assert.deepEqual(parsed.rewardReceipts, [
      "node:M01",
      "chapter:1",
      "hero:dinhLien",
    ]);
    assert.deepEqual(parsed.unlockedHeroes, ["dinhLien"]);
    // Màn cũ bị bỏ (CAMP-08.04); bậc Đánh trùm hợp lệ chuyển sang id sứ quân, bậc sai bị bỏ.
    assert.ok(!("legacy" in parsed));
    assert.deepEqual(parsed.raids, { tranLam: 2 });
  });

  it("resets development Campaign idempotently and preserves shared profile data", () => {
    const source = newProfile();
    const progressed = complete(source.campaign, ["M01", "M02"]);
    const profile = {
      ...source,
      gold: 999,
      stones: 17,
      campaign: {
        ...progressed,
        supply: 91,
        rewardReceipts: ["node:M01" as const],
        raids: { tranLam: 2 },
      },
    };
    const denied = resetCampaignProgressForDev(profile, "production");
    assert.deepEqual(denied, {
      ok: false,
      error: "campaignResetForbidden",
    });
    assert.deepEqual(resetCampaignProgressForDev(profile, "staging"), denied);
    const first = resetCampaignProgressForDev(profile, "development");
    assert.ok(first.ok);
    assert.deepEqual(first.profile.campaign.completed, []);
    assert.equal(first.profile.campaign.supply, CAMPAIGN_FOOD_START);
    assert.deepEqual(first.profile.campaign.raids, { tranLam: 2 });
    assert.equal(first.profile.gold, profile.gold);
    assert.equal(first.profile.stones, profile.stones);
    assert.equal(first.profile.bag, profile.bag);
    assert.equal(first.profile.dualTower, profile.dualTower);
    assert.equal(first.profile.survival, profile.survival);
    assert.equal(first.profile.quests, profile.quests);
    const second = resetCampaignProgressForDev(first.profile, "test");
    assert.ok(second.ok);
    assert.deepEqual(second.profile, first.profile);
  });

  it("starts clean from legacy Campaign data without converting old stage IDs", () => {
    const parsed = parseCampaign({
      cleared: ["coLau", "boHai"],
      food: 88,
      raids: { boHai: 2, bad: 1 },
      bestTurns: { coLau: 12 },
    });
    assert.equal(parsed.version, 2);
    assert.deepEqual(parsed.completed, []);
    assert.equal(parsed.supply, CAMPAIGN_FOOD_START);
    assert.ok(!("legacy" in parsed));
    assert.deepEqual(parsed.raids, { tranLam: 2 });
  });
});
