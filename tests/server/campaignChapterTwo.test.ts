import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_TWO,
  chapterStatus,
  completeCampaignNode,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { parseNewBattle } from "../../src/server/battles";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";

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

const OWNER = "g_chapter2";

describe("Chương II trên server: M05 → M06 không có trận", () => {
  it("không tạo được trận cho M05/M06", () => {
    for (const campaignMission of ["M05", "M06"])
      assert.equal(
        parseNewBattle({
          campaignMission,
          element: "moc",
          profession: "tuongSi",
          companions: [],
        }),
        null,
      );
  });

  it("hội kiến hoàn thành M06 bằng lời đáp, tăng tiến độ chương, thưởng đúng một lần, không đụng trận/đá/túi", async () => {
    const profiles = new MemoryProfileStore();
    const seed = newProfile();
    const campaign = complete(seed.campaign, ["M01", "M02", "M03", "M04"]);
    assert.ok(await profiles.put(OWNER, { ...seed, campaign }, 0));

    const locked = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m06_early", nodeId: "M06", choice: "keepWord" },
      1,
    );
    assert.deepEqual(locked, { ok: false, error: "locked" });

    const m05 = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m05_trip", nodeId: "M05", choice: "landRoute" },
      2,
    );
    assert.ok(m05.ok);
    const m06 = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m06_meet", nodeId: "M06", choice: "keepWord" },
      3,
    );
    assert.ok(m06.ok);
    assert.equal(m06.outcome.historicalOutcome, "allianced");
    assert.equal(m06.outcome.rewardGold, 150);
    assert.equal(m06.profile.campaign.regionalOutcomes.boHai, "allied");
    assert.deepEqual(
      chapterStatus(m06.profile.campaign, CHAPTER_TWO)
        .filter((m) => m.status === "completed")
        .map((m) => m.id),
      ["M05", "M06"],
    );

    const retry = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m06_retry", nodeId: "M06", choice: "keepWord" },
      4,
    );
    assert.ok(retry.ok);
    assert.equal(retry.outcome.firstClear, false);
    assert.equal(retry.outcome.rewardGold, 0);
    const other = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m06_other", nodeId: "M06", choice: "unify" },
      5,
    );
    assert.deepEqual(other, { ok: false, error: "invalidChoice" });

    const stored = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(stored.gold, seed.gold + 75 + 150);
    assert.equal(stored.stones, seed.stones);
    assert.deepEqual(stored.bag, seed.bag);
    assert.deepEqual(stored.quests, seed.quests);
    assert.equal(stored.main.xp, seed.main.xp);
    assert.deepEqual(stored.campaign.inProgress, []);
  });
});
