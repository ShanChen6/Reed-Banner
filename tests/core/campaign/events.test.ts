import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_EVENTS,
  campaignEventByNode,
  campaignOutcomeForNode,
  isCombatStoryNode,
  storyNodeById,
} from "../../../src/core";

describe("Campaign non-combat event registry", () => {
  it("contains only non-combat nodes and no BattleState/foe payload", () => {
    assert.equal(CAMPAIGN_EVENTS.length, 14);
    for (const event of CAMPAIGN_EVENTS) {
      const node = storyNodeById(event.nodeId)!;
      assert.ok(!isCombatStoryNode(node), event.nodeId);
      assert.ok(!("battle" in event), event.nodeId);
      assert.ok(!("foes" in event), event.nodeId);
      assert.equal(event.phases.at(-1), "completion");
      assert.ok(event.choices.length > 0, event.nodeId);
      assert.equal(
        new Set(event.choices.map((choice) => choice.id)).size,
        event.choices.length,
      );
    }
  });

  it("models M05 as a Bố Hải audience with fixed alliance outcome", () => {
    const event = campaignEventByNode("M05")!;
    assert.equal(event.kind, "meeting");
    assert.deepEqual(event.phases, [
      "meeting",
      "dialogue",
      "decision",
      "completion",
    ]);
    assert.ok(event.participants.includes("tranLam"));
    assert.equal(event.outcome, "allianced");
    assert.notEqual(
      event.choices[0]!.narrationKey,
      event.choices[1]!.narrationKey,
    );
  });

  it("keeps outcomes aligned with each historical resolution", () => {
    assert.equal(campaignOutcomeForNode("M06"), "allianced");
    assert.equal(campaignOutcomeForNode("M11"), "submitted");
    assert.equal(campaignOutcomeForNode("M14"), "dispersed");
    assert.equal(campaignOutcomeForNode("M21"), "defeated");
  });
});
