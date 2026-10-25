import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACHIEVEMENTS,
  CHAPTER_SIX,
  STORY_NODES,
  achievementProgress,
  campaignCompleted,
  campaignBattleScenario,
  campaignCopyErrors,
  campaignEncounter,
  campaignEventByNode,
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

const OWNER = "g_dangquang";
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

describe("M24 Đại Lễ Đăng Quang năm 968", () => {
  it("là sự kiện kết: 968 có nguồn, 970 và 971 chỉ là ghi chú", () => {
    const node = storyNodeById("M24")!;
    assert.equal(node.title, "Đại Lễ Đăng Quang năm 968");
    assert.equal(campaignBattleScenario("M24"), undefined);
    assert.equal(campaignEncounter("M24"), undefined);
    assert.deepEqual(
      campaignEventByNode("M24")!
        .choices.map((c) => c.id)
        .sort(),
      ["armyView", "dinhLienView", "hoaLuView"],
    );
    assert.deepEqual([...CHAPTER_SIX.playable], ["M21", "M22", "M23", "M24"]);
    assert.deepEqual(campaignCopyErrors(), []);
    const copy = missionCopy("M24")!;
    const story = [
      ...(copy.cinematic ?? []),
      ...copy.intro,
      ...copy.choices.flatMap((c) => c.beats),
      ...copy.outro,
    ];
    const first = copy.intro[0]!;
    assert.equal(first.basis, "recorded");
    assert.ok(first.refs?.includes("E10"));
    assert.match(first.text, /968/);
    assert.match(first.text, /Đại Cồ Việt/);
    assert.match(first.text, /Hoa Lư/);
    // Thái Bình (970) và đặt quan chức (971) không nằm trong cảnh 968.
    for (const b of story) {
      assert.doesNotMatch(b.text, /Thái Bình|970|971|phong chức/, b.text);
    }
    const notes = (copy.sourceNotes ?? []).flatMap((n) => n.beats);
    assert.ok(notes.some((b) => /970/.test(b.text) && b.refs?.includes("E11")));
    assert.ok(notes.some((b) => /971/.test(b.text) && b.basis !== "recorded"));
  });

  it("server: 24/24 node, lưu kết thúc, thưởng một lần; xem lại không thưởng", async () => {
    const early = await setup(ids(22));
    assert.deepEqual(
      await completeCampaignEvent(
        early.profiles,
        OWNER,
        { eventId: "evt_m24_early", nodeId: "M24", choice: "armyView" },
        1,
      ),
      { ok: false, error: "locked" },
    );

    const { profiles, seed } = await setup(ids(23));
    const before = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(campaignCompleted(before.campaign), false);
    assert.equal(
      parseNewBattle({
        campaignMission: "M24",
        element: "hoa",
        profession: "tuongSi",
        companions: ["haVan", "maiThanh"],
      }),
      null,
    );

    const res = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m24_first", nodeId: "M24", choice: "dinhLienView" },
      2,
    );
    assert.ok(res.ok);
    assert.equal(res.outcome.firstClear, true);
    assert.equal(res.outcome.campaignCompleted, true);
    const after = res.profile;
    // 24/24 node; kết thúc lưu trên hồ sơ và đọc lại được sau khi tải.
    assert.equal(after.campaign.completed.length, STORY_NODES.length);
    assert.equal(STORY_NODES.length, 24);
    assert.ok(
      STORY_NODES.every((n) => after.campaign.completed.includes(n.id)),
    );
    const reloaded = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(campaignCompleted(reloaded.campaign), true);
    assert.equal(reloaded.campaign.regionalOutcomes.unification, "unified");
    assert.ok(reloaded.campaign.rewardReceipts.includes("node:M24"));
    assert.ok(reloaded.campaign.rewardReceipts.includes("chapter:6"));
    assert.ok(reloaded.campaign.unlockedHeroes.includes("leHoan"));
    // Không đá, không đồ.
    assert.equal(after.stones, seed.stones);
    assert.deepEqual(after.bag, before.bag);
    const gained = after.gold - before.gold;
    assert.ok(gained >= 300);

    // Thành tựu kết chiến dịch: đạt khi xong M24, nhận một lần qua quests.
    const def = ACHIEVEMENTS.find((a) => a.id === "a.campaign")!;
    assert.equal(achievementProgress(before, def).done, false);
    assert.equal(achievementProgress(after, def).done, true);

    // Xem lại: server trả kết quả, không cộng gì; đổi lựa chọn bị từ chối.
    const replay = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m24_replay", nodeId: "M24", choice: "dinhLienView" },
      3,
    );
    assert.ok(replay.ok);
    assert.equal(replay.outcome.firstClear, false);
    assert.equal(replay.outcome.rewardGold, 0);
    assert.equal(replay.outcome.campaignCompleted, true);
    assert.equal(replay.profile.gold, after.gold);
    assert.deepEqual(
      replay.profile.campaign.rewardReceipts,
      after.campaign.rewardReceipts,
    );
    assert.deepEqual(
      await completeCampaignEvent(
        profiles,
        OWNER,
        { eventId: "evt_m24_other", nodeId: "M24", choice: "armyView" },
        4,
      ),
      { ok: false, error: "invalidChoice" },
    );
  });

  it("campaignCompleted dựa vào M24, không đếm số trận thắng", () => {
    const most = complete(ids(23));
    assert.equal(most.completed.length, 23);
    assert.equal(campaignCompleted(most), false);
    // Hồ sơ sửa tay có M24 nhưng thiếu node trước thì parser bỏ M24.
    const forged = parseCampaign({
      ...most,
      completed: [...ids(10), "M24"],
    } as CampaignProgressV2);
    assert.equal(campaignCompleted(forged), false);
  });
});
