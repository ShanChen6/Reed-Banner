import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_FOUR,
  campaignBattleScenario,
  campaignCopyErrors,
  campaignEventByNode,
  campaignFactionView,
  campaignNodeUnlocked,
  chapterStatus,
  completeCampaignNode,
  missionCopy,
  newProfile,
  storyNodeById,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { parseNewBattle } from "../../src/server/battles";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";

const THROUGH_M13: readonly CampaignMissionId[] = [
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
  "M13",
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

async function setup(owner: string, ids = THROUGH_M13) {
  const profiles = new MemoryProfileStore();
  const seed = newProfile();
  assert.ok(
    await profiles.put(
      owner,
      { ...seed, campaign: complete(seed.campaign, ids) },
      0,
    ),
  );
  return { profiles, seed };
}

describe("M14 Tam Đái: nút chuẩn bị, Nguyễn Khoan tan rã", () => {
  it("là sự kiện, không có trận; nội dung có nguồn và không khẳng định năm hay cái chết", () => {
    assert.equal(storyNodeById("M14")!.type, "preparation");
    assert.equal(campaignBattleScenario("M14"), undefined);
    assert.equal(
      parseNewBattle({
        campaignMission: "M14",
        element: "tho",
        profession: "tuongSi",
        companions: ["haVan", "maiThanh"],
      }),
      null,
    );
    assert.equal(campaignEventByNode("M14")!.outcome, "dispersed");
    assert.deepEqual(campaignCopyErrors(), []);
    const copy = missionCopy("M14")!;
    const text = [
      ...(copy.cinematic ?? []),
      ...copy.intro,
      ...copy.outro,
      ...copy.choices.flatMap((c) => c.beats),
    ]
      .map((b) => b.text)
      .join(" ");
    assert.match(text, /các nguồn ghi khác nhau/);
    assert.doesNotMatch(text, /\b9\d\d\b/);
    // Chỉ được nhắc tử trận trong câu phủ định của game.
    assert.match(text, /không nói ông tử trận hay bị bắt/);
    assert.doesNotMatch(
      text.replace("không nói ông tử trận hay bị bắt", ""),
      /tử trận|bị giết|vây đói|kho cạn/,
    );
  });

  it("mở sau M13; hoàn thành bằng sự kiện ghi tan rã với resolutionMethod đúng ledger, một lần", async () => {
    const owner = "g_tamdai";
    const { profiles, seed } = await setup(owner);
    const before = (await loadProfile(profiles, owner)).profile.campaign;
    assert.equal(campaignNodeUnlocked(before, "M14"), true);
    assert.equal(chapterStatus(before, CHAPTER_FOUR)[1]!.status, "open");
    assert.deepEqual(campaignFactionView(before.factions, "nguyenKhoan"), {
      faction: "nguyenKhoan",
      resolved: false,
    });

    const first = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m14", nodeId: "M14", choice: "protectCivilians" },
      1,
    );
    assert.ok(first.ok);
    assert.equal(first.outcome.historicalOutcome, "dispersed");
    assert.equal(first.outcome.rewardGold, 150);
    assert.deepEqual(first.outcome.faction, {
      id: "nguyenKhoan",
      status: "dispersed",
      resolutionMethod: "dispersal",
      recorded: true,
    });
    const c = first.profile.campaign;
    assert.deepEqual(campaignFactionView(c.factions, "nguyenKhoan"), {
      faction: "nguyenKhoan",
      resolved: true,
      status: "dispersed",
      resolutionMethod: "dispersal",
      confidence: "mediumLow",
      mission: "M14",
    });
    assert.equal(campaignNodeUnlocked(c, "M15"), true);
    assert.equal(c.bestBattleTurns.M14, undefined);

    const again = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m14_again", nodeId: "M14", choice: "protectCivilians" },
      2,
    );
    assert.ok(again.ok);
    assert.equal(again.outcome.rewardGold, 0);
    assert.equal(again.outcome.faction?.recorded, false);
    const changed = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m14_other", nodeId: "M14", choice: "collectWeapons" },
      3,
    );
    assert.deepEqual(changed, { ok: false, error: "invalidChoice" });
    const end = (await loadProfile(profiles, owner)).profile;
    assert.equal(end.gold, seed.gold + 150);
    assert.equal(
      end.campaign.rewardReceipts.filter((r) => r === "node:M14").length,
      1,
    );
    assert.equal(end.stones, seed.stones);
  });

  it("chưa xong M13 thì M14 khóa", async () => {
    const owner = "g_tamdai_early";
    const { profiles } = await setup(owner, THROUGH_M13.slice(0, -1));
    const r = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m14_early", nodeId: "M14", choice: "collectWeapons" },
      1,
    );
    assert.deepEqual(r, { ok: false, error: "locked" });
  });
});
