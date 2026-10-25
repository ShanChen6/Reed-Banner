import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_FIVE,
  campaignBattleScenario,
  campaignRouteSummary,
  raidBossById,
  raidUnlocked,
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

const BEFORE: readonly CampaignMissionId[] = [
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
  "M17",
  "M18",
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

async function setup(owner: string, ids = BEFORE) {
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

describe("M19 Tế Giang: vùng theo về, không có trận trùm", () => {
  it("là sự kiện disputed, không có trận; có nguồn, mức chắc chắn và không kể Lữ Đường đầu hàng trong trận", () => {
    const node = storyNodeById("M19")!;
    assert.equal(node.type, "diplomacy");
    assert.ok(node.historicalBasis.includes("disputed"));
    assert.equal(campaignBattleScenario("M19"), undefined);
    assert.equal(
      parseNewBattle({
        campaignMission: "M19",
        element: "tho",
        profession: "tuongSi",
        companions: ["haVan", "maiThanh"],
      }),
      null,
    );
    assert.equal(
      campaignEventByNode("M19")!.faction?.settlement,
      "regionalAccession",
    );
    assert.deepEqual(campaignCopyErrors(), []);
    const copy = missionCopy("M19")!;
    const story = [
      ...(copy.cinematic ?? []),
      ...copy.intro,
      ...copy.outro,
      ...copy.choices.flatMap((c) => c.beats),
    ];
    const text = story.map((b) => b.text).join(" ");
    assert.doesNotMatch(text, /đầu hàng|\b9\d\d\b/);
    // Không có thoại nào của Lữ Đường.
    assert.ok(story.every((b) => b.speaker !== "Lữ Đường"));
    const notes = (copy.sourceNotes ?? []).map((n) => n.title);
    assert.ok(notes.includes("Mức chắc chắn"));
    assert.ok(
      story.some((b) => b.basis === "disputed" && b.refs?.includes("S07")),
    );
  });

  it("hoàn thành bằng sự kiện: ghi Lữ Đường quy phục (vùng theo về) một lần, mở M20 và thách đấu giả định", async () => {
    const owner = "g_tegiang";
    const { profiles, seed } = await setup(owner);
    const before = (await loadProfile(profiles, owner)).profile.campaign;
    assert.equal(campaignNodeUnlocked(before, "M19"), true);
    assert.equal(chapterStatus(before, CHAPTER_FIVE)[2]!.status, "open");
    assert.equal(raidUnlocked(before, "luDuong", 1), false);

    const first = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m19", nodeId: "M19", choice: "anonymousEnvoy" },
      1,
    );
    assert.ok(first.ok);
    assert.equal(first.outcome.rewardGold, 150);
    assert.deepEqual(first.outcome.faction, {
      id: "luDuong",
      status: "submitted",
      resolutionMethod: "regionalAccession",
      recorded: true,
    });
    const c = first.profile.campaign;
    assert.deepEqual(campaignFactionView(c.factions, "luDuong"), {
      faction: "luDuong",
      resolved: true,
      status: "submitted",
      resolutionMethod: "regionalAccession",
      confidence: "mediumLow",
      mission: "M19",
    });
    assert.equal(c.bestBattleTurns.M19, undefined);
    assert.equal(campaignNodeUnlocked(c, "M20"), true);
    // Lữ Đường theo về trong cốt truyện, không là trùm Đánh trùm.
    assert.equal(raidBossById("luDuong"), undefined);
    assert.equal(raidUnlocked(c, "luDuong", 1), false);
    assert.equal(
      campaignRouteSummary(c, "east").regions[2]!.state,
      "completed",
    );

    const again = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m19_again", nodeId: "M19", choice: "anonymousEnvoy" },
      2,
    );
    assert.ok(again.ok);
    assert.equal(again.outcome.rewardGold, 0);
    assert.equal(again.outcome.faction?.recorded, false);
    const end = (await loadProfile(profiles, owner)).profile;
    assert.equal(end.gold, seed.gold + 150);
    assert.equal(end.stones, seed.stones);
    assert.equal(
      end.campaign.rewardReceipts.filter((r) => r === "node:M19").length,
      1,
    );
  });

  it("chưa xong M18 thì M19 khóa", async () => {
    const owner = "g_tegiang_early";
    const { profiles } = await setup(owner, BEFORE.slice(0, -1));
    const r = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m19_early", nodeId: "M19", choice: "leHoanObserves" },
      1,
    );
    assert.deepEqual(r, { ok: false, error: "locked" });
  });
});
