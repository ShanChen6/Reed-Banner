import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_SIX,
  campaignBattleScenario,
  campaignCopyErrors,
  campaignEncounter,
  campaignEventByNode,
  campaignNodeUnlocked,
  campaignScenarioByNode,
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

const OWNER = "g_giangson";
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

describe("M22 Giang Sơn Một Mối", () => {
  it("là sự kiện: không trận, không đối thủ, lời kể hợp lệ", () => {
    const node = storyNodeById("M22")!;
    assert.equal(node.type, "story");
    assert.equal(node.title, "Giang Sơn Một Mối");
    assert.equal(campaignBattleScenario("M22"), undefined);
    assert.equal(campaignScenarioByNode("M22"), undefined);
    assert.equal(campaignEncounter("M22"), undefined);
    assert.deepEqual(
      campaignEventByNode("M22")!.choices.map((c) => c.id),
      ["reviewDossiers", "hearTheRegions"],
    );
    assert.ok(CHAPTER_SIX.playable.includes("M22"));
    assert.deepEqual(campaignCopyErrors(), []);
    const copy = missionCopy("M22")!;
    const text = [...copy.intro, ...copy.outro].map((b) => b.text).join(" ");
    // Bám mốc thống nhất, tách kể chuyện và dẫn sử.
    assert.match(text, /967/);
    assert.match(text, /968/);
    assert.ok(copy.intro.some((b) => b.basis === "recorded" && b.refs?.length));
    assert.ok(copy.intro.some((b) => b.basis === "reconstructed"));
    assert.match(text, /không phải là cộng đủ mười hai trận thắng/);
  });

  it("server: chưa qua cổng thì khóa; hoàn thành trả sổ thế cục và mở M23 một lần", async () => {
    const early = await setup(ids(20));
    const locked = await completeCampaignEvent(
      early.profiles,
      OWNER,
      { eventId: "evt_m22_early", nodeId: "M22", choice: "reviewDossiers" },
      1,
    );
    assert.deepEqual(locked, { ok: false, error: "locked" });

    const { profiles, seed } = await setup(ids(21));
    const before = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(campaignNodeUnlocked(before.campaign, "M22"), true);
    assert.equal(campaignNodeUnlocked(before.campaign, "M23"), false);

    // Không tạo được trận cho M22 qua API trận.
    const battle = parseNewBattle({
      campaignMission: "M22",
      element: "hoa",
      profession: "tuongSi",
      companions: ["haVan", "maiThanh"],
    });
    assert.equal(battle, null);

    const res = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m22_first", nodeId: "M22", choice: "reviewDossiers" },
      2,
    );
    assert.ok(res.ok);
    assert.equal(res.outcome.firstClear, true);
    assert.equal(res.outcome.rewardGold, 150);
    assert.equal(res.outcome.faction, undefined);
    assert.deepEqual(res.outcome.worldLedger, {
      resolved: { alliance: 1, submission: 3, military: 6, uncertain: 2 },
      resolvedCount: 12,
    });
    const after = res.profile;
    assert.ok(after.campaign.completed.includes("M22"));
    assert.equal(after.campaign.bestBattleTurns.M22, undefined);
    assert.equal(campaignNodeUnlocked(after.campaign, "M23"), true);
    // Không phát đồ, đá hay kinh nghiệm như trận.
    assert.equal(after.stones, seed.stones);
    assert.deepEqual(after.bag, before.bag);
    assert.deepEqual(after.main, before.main);
    assert.equal(after.gold, before.gold + 150);

    const again = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m22_retry", nodeId: "M22", choice: "reviewDossiers" },
      3,
    );
    assert.ok(again.ok);
    assert.equal(again.outcome.firstClear, false);
    assert.equal(again.outcome.rewardGold, 0);
    assert.equal(again.profile.gold, after.gold);
    const other = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m22_other", nodeId: "M22", choice: "hearTheRegions" },
      4,
    );
    assert.deepEqual(other, { ok: false, error: "invalidChoice" });
  });
});
