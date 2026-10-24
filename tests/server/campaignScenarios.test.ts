import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  campaignScenarioTag,
  completeCampaignNode,
  newProfile,
  startMatch,
} from "../../src/core";
import {
  getBattle,
  settleCampaignScenarioMatch,
} from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const unit = (id: string) => ({
  id,
  name: id,
  element: "tho" as const,
  profession: "binhLinh" as const,
  maxHp: 100,
  atk: 20,
  def: 10,
  skills: [],
});

describe("server Campaign scenario settlement guard", () => {
  it("settles a V2 battle once across concurrent reloads", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const tag = campaignScenarioTag("M04")!;
    const started = startMatch({
      sides: [
        { fighters: [unit("dinhBoLinh")], leader: 0, food: 47 },
        { fighters: [unit("ngo-951-field-commander")], leader: 0 },
      ],
      difficulty: "hard",
      seed: 5,
      firstSide: 0,
      now: 1,
      campaignScenario: tag,
    });
    const battle = structuredClone(started.match.battle);
    battle.sides[1].fighters[0]!.hp = 0;
    battle.winner = 0;
    const match = { ...started.match, battle };
    const settlement = settleCampaignScenarioMatch(match, [
      { type: "end", winner: 0 },
    ]);
    assert.ok(settlement.ok);
    assert.equal(settlement.verdict.status, "succeeded");
    let profile = newProfile();
    for (const id of ["M01", "M02", "M03"] as const) {
      const completed = completeCampaignNode(profile.campaign, id);
      assert.ok(completed.ok);
      profile = { ...profile, campaign: completed.campaign };
    }
    assert.ok(await profiles.put("owner", profile, 0));
    await store.create({
      id: "m_scenario",
      ownerId: "owner",
      match,
      createdAt: 1,
      updatedAt: 1,
    });
    const deps = { store, profiles, now: 2 };
    const results = await Promise.all([
      getBattle("m_scenario", "owner", deps),
      getBattle("m_scenario", "owner", deps),
    ]);
    assert.equal(
      results.filter((result) => result.ok && result.outcome).length,
      1,
    );
    const saved = (await loadProfile(profiles, "owner")).profile;
    assert.ok(saved.campaign.completed.includes("M04"));
    assert.deepEqual(saved.campaign.rewardReceipts, [
      "node:M04",
      "chapter:1",
      "hero:dinhLien",
    ]);
    assert.deepEqual(saved.campaign.unlockedHeroes, ["dinhLien"]);
    assert.ok(saved.companions.dinhLien);
    assert.equal(saved.campaign.supply, match.battle.sides[0].food);
    assert.equal(saved.stones, profile.stones);
  });

  it("rejects a match with no Campaign objective at the guarded entrypoint", () => {
    const started = startMatch({
      sides: [
        { fighters: [unit("player")], leader: 0 },
        { fighters: [unit("enemy")], leader: 0 },
      ],
      difficulty: "normal",
      seed: 1,
      firstSide: 0,
      now: 1,
    });
    assert.deepEqual(settleCampaignScenarioMatch(started.match), {
      ok: false,
      error: "undefinedObjective",
    });
  });
});
