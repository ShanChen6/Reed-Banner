import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_FIVE,
  CHAPTER_FOUR,
  campaignFactionTally,
  campaignMissionsRemaining,
  campaignMusterReady,
  campaignNodeUnlocked,
  campaignRouteStatus,
  chapterStatus,
  chapterUnlocked,
  completeCampaignNode,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";

const THROUGH_M11: readonly CampaignMissionId[] = [
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
];

function complete(
  campaign: CampaignProgressV2,
  ids: readonly CampaignMissionId[],
): CampaignProgressV2 {
  let next = campaign;
  for (const id of ids) {
    const r = completeCampaignNode(next, id);
    assert.ok(r.ok, id);
    next = r.campaign;
  }
  return next;
}

describe("Hội quân Hoa Lư và hai tuyến sau Chương III", () => {
  it("trước khi server ghi M12: chưa hội quân, Chương IV/V khóa, không gửi được M13", async () => {
    const profiles = new MemoryProfileStore();
    const owner = "g_muster_early";
    const seed = newProfile();
    const campaign = complete(seed.campaign, THROUGH_M11);
    assert.ok(await profiles.put(owner, { ...seed, campaign }, 0));
    const stored = (await loadProfile(profiles, owner)).profile.campaign;
    assert.equal(campaignMusterReady(stored), false);
    assert.equal(chapterUnlocked(stored, 4), false);
    assert.equal(chapterUnlocked(stored, 5), false);
    for (const id of ["M13", "M14", "M17", "M18"] as const)
      assert.equal(campaignNodeUnlocked(stored, id), false, id);
    const early = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m13_early", nodeId: "M13", choice: "publicTerms" },
      1,
    );
    assert.deepEqual(early, { ok: false, error: "locked" });
    assert.ok(
      chapterStatus(stored, CHAPTER_FOUR).every((m) => m.status === "locked"),
    );
  });

  it("M12 thành công: mở hai tuyến cùng lúc, nút sau vẫn khóa; thưởng chương và Đinh Điền không nhận hai lần", async () => {
    const profiles = new MemoryProfileStore();
    const owner = "g_muster";
    const seed = newProfile();
    const campaign = complete(seed.campaign, THROUGH_M11);
    assert.ok(await profiles.put(owner, { ...seed, campaign }, 0));

    const m12 = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m12_muster", nodeId: "M12", choice: "showStrength" },
      2,
    );
    assert.ok(m12.ok);
    assert.equal(m12.outcome.rewardGold, 150 + 250);
    const c = m12.profile.campaign;
    assert.equal(campaignMusterReady(c), true);
    assert.equal(chapterUnlocked(c, 4), true);
    assert.equal(chapterUnlocked(c, 5), true);
    assert.equal(campaignNodeUnlocked(c, "M13"), true);
    assert.equal(campaignNodeUnlocked(c, "M17"), true);
    for (const id of ["M14", "M15", "M16", "M18", "M19", "M20", "M21"] as const)
      assert.equal(campaignNodeUnlocked(c, id), false, id);
    assert.deepEqual(
      campaignRouteStatus(c).map((r) => [r.route.id, r.open, r.next]),
      [
        ["west", true, "M13"],
        ["east", true, "M17"],
      ],
    );
    // M17 mở theo server và đã có nội dung trận (CAMP-05.03).
    assert.equal(chapterStatus(c, CHAPTER_FIVE)[0]!.status, "open");

    const retry = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m12_retry", nodeId: "M12", choice: "showStrength" },
      3,
    );
    assert.ok(retry.ok);
    assert.equal(retry.outcome.rewardGold, 0);
    const stored = (await loadProfile(profiles, owner)).profile;
    assert.equal(stored.gold, seed.gold + 150 + 250);
    assert.equal(
      stored.campaign.rewardReceipts.filter((r) => r === "chapter:3").length,
      1,
    );
    assert.equal(
      stored.campaign.rewardReceipts.filter((r) => r === "hero:dinhDien")
        .length,
      1,
    );

    assert.deepEqual(campaignFactionTally(stored.campaign), {
      allied: 1,
      submitted: 2,
      dispersed: 0,
      defeated: 0,
      unresolved: 9,
    });
    assert.equal(campaignMissionsRemaining(stored.campaign).length, 12);
    assert.equal(campaignMissionsRemaining(stored.campaign)[0], "M13");
  });
});
