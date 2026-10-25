import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import {
  STORY_NODES,
  campaignEventByNode,
  completeCampaignNode,
  missionCopy,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { POST } from "../../src/app/api/campaign/events/route";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";

const THROUGH_M10: readonly CampaignMissionId[] = [
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
];

const SCENES = [
  { nodeId: "M11", choice: "retainForces", faction: "phamBachHo" },
  { nodeId: "M12", choice: "privateMeeting", faction: "ngoXuongXi" },
  { nodeId: "M13", choice: "publicTerms", faction: "ngoNhatKhanh" },
] as const;

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

describe("màn hội kiến: lựa chọn và kết quả", () => {
  it("thẻ lựa chọn trên màn hình đúng bằng allowlist của server ở mọi node ngoại giao", () => {
    for (const node of STORY_NODES.filter((n) => n.type === "diplomacy")) {
      const copy = missionCopy(node.id);
      if (!copy) continue;
      assert.deepEqual(
        copy.choices.map((c) => c.id),
        campaignEventByNode(node.id)!.choices.map((c) => c.id),
        node.id,
      );
    }
  });

  it("không gửi được choiceId ngoài danh sách, kể cả lựa chọn của node khác", async () => {
    const profiles = new MemoryProfileStore();
    const owner = "g_diplomacy_bad";
    const seed = newProfile();
    const campaign = complete(seed.campaign, THROUGH_M10);
    assert.ok(await profiles.put(owner, { ...seed, campaign }, 0));
    for (const { nodeId } of SCENES)
      for (const choice of ["hack", "keepWord", "showStrength-x", "M11"]) {
        const r = await completeCampaignEvent(
          profiles,
          owner,
          { eventId: `evt_bad_${nodeId}_${choice}`, nodeId, choice },
          1,
        );
        assert.deepEqual(r, { ok: false, error: "invalidChoice" }, choice);
      }
    const stored = (await loadProfile(profiles, owner)).profile;
    assert.equal(stored.gold, seed.gold);
    assert.deepEqual(stored.campaign.completed, campaign.completed);

    for (const body of [
      { eventId: "evt_route_bad1", nodeId: "M11", choice: "hack" },
      { eventId: "evt_route_bad2", nodeId: "M12", choice: "retainForces" },
    ]) {
      const res = await POST(
        new NextRequest("http://localhost/api/campaign/events", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      assert.equal(res.status, 422);
      assert.deepEqual(await res.json(), { error: "invalidChoice" });
    }
    const tooLong = await POST(
      new NextRequest("http://localhost/api/campaign/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId: "evt_route_bad3",
          nodeId: "M11",
          choice: "x".repeat(81),
        }),
      }),
    );
    assert.equal(tooLong.status, 400);
  });

  it("ba node: bấm liên tục hoặc gửi song song chỉ nhận kết quả một lần", async () => {
    const profiles = new MemoryProfileStore();
    const owner = "g_diplomacy_spam";
    const seed = newProfile();
    const campaign = complete(seed.campaign, THROUGH_M10);
    assert.ok(await profiles.put(owner, { ...seed, campaign }, 0));

    let gold = seed.gold;
    for (const { nodeId, choice, faction } of SCENES) {
      const results = await Promise.all(
        ["a", "a", "b"].map((k, i) =>
          completeCampaignEvent(
            profiles,
            owner,
            { eventId: `evt_${nodeId}_${k}`, nodeId, choice },
            10 + i,
          ),
        ),
      );
      const ok = results.filter((r) => r.ok);
      assert.ok(ok.length >= 1, nodeId);
      const firsts = ok.filter((r) => r.ok && r.outcome.firstClear);
      assert.equal(firsts.length, 1, `${nodeId}: first clear once`);
      const recorded = ok.filter((r) => r.ok && r.outcome.faction?.recorded);
      assert.equal(recorded.length, 1, `${nodeId}: faction once`);
      for (const r of results)
        if (!r.ok) assert.equal(r.error, "conflict", nodeId);
      const stored = (await loadProfile(profiles, owner)).profile;
      const first = firsts[0]!;
      assert.ok(first.ok);
      gold += first.outcome.rewardGold;
      assert.equal(stored.gold, gold, nodeId);
      assert.equal(stored.campaign.storyChoices[nodeId], choice);
      assert.equal(stored.campaign.factions[faction]?.mission, nodeId);

      // Tải lại rồi gửi lại: kết quả đã ghi, không cộng thêm; đổi lời đáp bị từ chối.
      const again = await completeCampaignEvent(
        profiles,
        owner,
        { eventId: `evt_${nodeId}_reload`, nodeId, choice },
        20,
      );
      assert.ok(again.ok);
      assert.equal(again.outcome.firstClear, false);
      assert.equal(again.outcome.rewardGold, 0);
      const other = campaignEventByNode(nodeId)!.choices.find(
        (c) => c.id !== choice,
      )!.id;
      const swap = await completeCampaignEvent(
        profiles,
        owner,
        { eventId: `evt_${nodeId}_swap`, nodeId, choice: other },
        21,
      );
      assert.deepEqual(swap, { ok: false, error: "invalidChoice" });
    }
    const stored = (await loadProfile(profiles, owner)).profile;
    assert.equal(stored.stones, seed.stones);
    assert.deepEqual(stored.quests, seed.quests);
  });
});
