import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_SIX,
  campaignBattleScenario,
  campaignCopyErrors,
  campaignEncounter,
  campaignEventByNode,
  campaignNodeUnlocked,
  completeCampaignNode,
  missionCopy,
  newProfile,
  parseCampaign,
  storyNodeById,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { parseNewBattle } from "../../src/server/battles";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";

const OWNER = "g_hoalu";
const ids = (n: number) =>
  Array.from(
    { length: n },
    (_, i) => `M${String(i + 1).padStart(2, "0")}` as CampaignMissionId,
  );

function complete(list: readonly CampaignMissionId[]): CampaignProgressV2 {
  let next = newProfile().campaign;
  for (const id of list) {
    const r = completeCampaignNode(next, id);
    assert.ok(r.ok, id);
    next = r.campaign;
  }
  return parseCampaign(next);
}

async function setup(list: readonly CampaignMissionId[]) {
  const profiles = new MemoryProfileStore();
  const seed = newProfile();
  assert.ok(
    await profiles.put(OWNER, { ...seed, campaign: complete(list) }, 0),
  );
  return { profiles, seed };
}

describe("M23 Kiến thiết kinh đô Hoa Lư", () => {
  it("là sự kiện chọn ưu tiên, không trận, có ghi chú trích đoạn", () => {
    const node = storyNodeById("M23")!;
    assert.equal(node.title, "Kiến thiết kinh đô Hoa Lư");
    assert.equal(campaignBattleScenario("M23"), undefined);
    assert.equal(campaignEncounter("M23"), undefined);
    const event = campaignEventByNode("M23")!;
    assert.deepEqual(event.choices.map((c) => c.id).sort(), [
      "army",
      "law",
      "livelihood",
    ]);
    assert.ok(CHAPTER_SIX.playable.includes("M23"));
    assert.deepEqual(campaignCopyErrors(), []);
    const copy = missionCopy("M23")!;
    // Hoa Lư là trung tâm chính quyền nhà Đinh: câu có sử chép kèm nguồn.
    assert.ok(
      copy.intro.some(
        (b) =>
          b.basis === "recorded" &&
          /Hoa Lư/.test(b.text) &&
          b.refs?.includes("E10"),
      ),
    );
    // Giải thích đây là trích đoạn xây dựng quốc gia, không đổi lịch sử hay kinh tế.
    assert.ok(
      copy.intro.some(
        (b) =>
          b.basis === "reconstructed" &&
          /trích đoạn xây dựng quốc gia/.test(b.text),
      ),
    );
    // Mỗi ưu tiên có một câu kết quả bằng chữ.
    for (const choice of copy.choices) {
      assert.ok(
        choice.beats.some((b) => /^Kết quả:/.test(b.text)),
        choice.id,
      );
    }
    const notes = (copy.sourceNotes ?? [])
      .flatMap((n) => n.beats)
      .map((b) => b.text)
      .join(" ");
    assert.match(notes, /dựng hoặc tu bổ về sau/);
  });

  it("server: hoàn thành không có trận, không thêm tài nguyên, mở M24 một lần", async () => {
    const early = await setup(ids(21));
    assert.deepEqual(
      await completeCampaignEvent(
        early.profiles,
        OWNER,
        { eventId: "evt_m23_early", nodeId: "M23", choice: "army" },
        1,
      ),
      { ok: false, error: "locked" },
    );

    const { profiles, seed } = await setup(ids(22));
    const before = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(campaignNodeUnlocked(before.campaign, "M24"), false);
    assert.equal(
      parseNewBattle({
        campaignMission: "M23",
        element: "hoa",
        profession: "tuongSi",
        companions: ["haVan", "maiThanh"],
      }),
      null,
    );

    const res = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m23_first", nodeId: "M23", choice: "law" },
      2,
    );
    assert.ok(res.ok);
    assert.equal(res.outcome.firstClear, true);
    assert.equal(res.outcome.rewardGold, 50);
    const after = res.profile;
    assert.ok(after.campaign.completed.includes("M23"));
    assert.equal(after.campaign.storyChoices.M23, "law");
    assert.equal(campaignNodeUnlocked(after.campaign, "M24"), true);
    // Chỉ cộng vàng nhiệm vụ: không đá, không đồ, không kinh nghiệm, không lương.
    assert.equal(after.stones, seed.stones);
    assert.deepEqual(after.bag, before.bag);
    assert.deepEqual(after.main, before.main);
    assert.equal(after.campaign.supply, before.campaign.supply);
    assert.equal(after.gold, before.gold + res.outcome.rewardGold);

    const again = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m23_retry", nodeId: "M23", choice: "law" },
      3,
    );
    assert.ok(again.ok);
    assert.equal(again.outcome.rewardGold, 0);
    assert.equal(again.profile.gold, after.gold);
    assert.deepEqual(
      await completeCampaignEvent(
        profiles,
        OWNER,
        { eventId: "evt_m23_other", nodeId: "M23", choice: "army" },
        4,
      ),
      { ok: false, error: "invalidChoice" },
    );
  });
});
