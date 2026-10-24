import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import {
  completeCampaignNode,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { POST } from "../../src/app/api/campaign/events/route";
import {
  completeCampaignEvent,
  parseCampaignEventInput,
} from "../../src/server/campaignEvents";
import {
  loadProfile,
  MemoryProfileStore,
} from "../../src/server/profiles";

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

async function seedThroughM04(store: MemoryProfileStore, ownerId: string) {
  const profile = newProfile();
  const campaign = complete(profile.campaign, ["M01", "M02", "M03", "M04"]);
  assert.ok(await store.put(ownerId, { ...profile, campaign }, 0));
  return { ...profile, campaign };
}

describe("server-authoritative Campaign events", () => {
  it("completes M05 through a meeting without BattleState or combat rewards", async () => {
    const store = new MemoryProfileStore();
    const before = await seedThroughM04(store, "owner-a");
    const result = await completeCampaignEvent(
      store,
      "owner-a",
      { eventId: "evt_m05_0001", nodeId: "M05", choice: "riverRoute" },
      2,
    );
    assert.ok(result.ok);
    assert.equal(result.outcome.historicalOutcome, "allianced");
    assert.equal(result.outcome.firstClear, true);
    assert.equal(result.outcome.rewardGold, 75);
    assert.ok(!("battle" in result.outcome));
    assert.ok(result.profile.campaign.completed.includes("M05"));
    assert.equal(result.profile.campaign.storyChoices.M05, "riverRoute");
    assert.equal(result.profile.campaign.regionalOutcomes.boHai, "allied");
    assert.deepEqual(result.profile.campaign.rewardReceipts, ["node:M05"]);
    assert.equal(result.profile.gold, before.gold + 75);
    assert.equal(result.profile.stones, before.stones);
    assert.deepEqual(result.profile.bag, before.bag);
    assert.deepEqual(result.profile.quests, before.quests);
    assert.deepEqual(result.profile.campaign.unlockedHeroes, []);
  });

  it("settles concurrent retry/double click exactly once", async () => {
    const store = new MemoryProfileStore();
    await seedThroughM04(store, "owner-a");
    const input = {
      eventId: "evt_double_click",
      nodeId: "M05" as const,
      choice: "landRoute",
    };
    const results = await Promise.all([
      completeCampaignEvent(store, "owner-a", input, 2),
      completeCampaignEvent(store, "owner-a", input, 2),
    ]);
    assert.ok(results.every((result) => result.ok));
    assert.equal(
      results.filter((result) => result.ok && result.outcome.firstClear).length,
      1,
    );
    assert.equal(
      results.reduce(
        (sum, result) => sum + (result.ok ? result.outcome.rewardGold : 0),
        0,
      ),
      75,
    );
    const saved = (await loadProfile(store, "owner-a")).profile;
    assert.equal(saved.gold, 75);
    assert.deepEqual(saved.campaign.rewardReceipts, ["node:M05"]);
  });

  it("grants a chapter recruit once without combat loot", async () => {
    const store = new MemoryProfileStore();
    const base = newProfile();
    const campaign = complete(base.campaign, [
      "M01",
      "M02",
      "M03",
      "M04",
      "M05",
      "M06",
      "M07",
    ]);
    assert.ok(await store.put("owner-a", { ...base, campaign }, 0));
    const result = await completeCampaignEvent(
      store,
      "owner-a",
      { eventId: "evt_m08_milestone", nodeId: "M08", choice: "silentMemorial" },
      2,
    );
    assert.ok(result.ok);
    assert.equal(result.outcome.rewardGold, 300);
    assert.ok(result.profile.companions.nguyenBac);
    assert.deepEqual(result.profile.campaign.rewardReceipts.slice(-3), [
      "node:M08",
      "chapter:2",
      "hero:nguyenBac",
    ]);
    assert.deepEqual(result.profile.bag, base.bag);
    assert.deepEqual(result.profile.quests, base.quests);
    assert.equal(result.profile.stones, base.stones);
  });

  it("rejects invalid, locked, combat and cross-owner requests", async () => {
    const store = new MemoryProfileStore();
    await seedThroughM04(store, "owner-a");
    const invalid = await completeCampaignEvent(
      store,
      "owner-a",
      { eventId: "evt_invalid_01", nodeId: "M05", choice: "forgeHistory" },
      2,
    );
    assert.deepEqual(invalid, { ok: false, error: "invalidChoice" });
    const combat = await completeCampaignEvent(
      store,
      "owner-a",
      { eventId: "evt_combat_01", nodeId: "M03", choice: "reassurePeople" },
      2,
    );
    assert.deepEqual(combat, { ok: false, error: "notEvent" });
    const other = await completeCampaignEvent(
      store,
      "owner-b",
      { eventId: "evt_other_001", nodeId: "M05", choice: "riverRoute" },
      2,
    );
    assert.deepEqual(other, { ok: false, error: "locked" });
    assert.equal((await loadProfile(store, "owner-a")).profile.gold, 0);
    assert.equal((await loadProfile(store, "owner-b")).profile.gold, 0);
  });

  it("validates request shape and requires an authenticated route owner", async () => {
    assert.deepEqual(
      parseCampaignEventInput({
        eventId: "evt_valid_001",
        nodeId: "M05",
        choice: "riverRoute",
      }),
      { eventId: "evt_valid_001", nodeId: "M05", choice: "riverRoute" },
    );
    assert.equal(
      parseCampaignEventInput({
        eventId: "x",
        nodeId: "M99",
        choice: "riverRoute",
      }),
      null,
    );
    const response = await POST(
      new NextRequest("http://localhost/api/campaign/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId: "evt_valid_001",
          nodeId: "M05",
          choice: "riverRoute",
        }),
      }),
    );
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "unauthorized" });
  });
});
