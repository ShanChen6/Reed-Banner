import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_SCENARIOS,
  campaignScenarioByNode,
  campaignScenarioTag,
  completedPlayerTurns,
  createBattle,
  settleCampaignScenario,
  type BattleState,
  type FighterConfig,
} from "../../../src/core";

const fighter = (id: string): FighterConfig => ({
  id,
  name: id,
  element: "tho",
  profession: "binhLinh",
  maxHp: 100,
  atk: 20,
  def: 10,
  skills: [],
});

function battle(enemyId: string, seed = 7): BattleState {
  return createBattle({
    sides: [
      { fighters: [fighter("player")], leader: 0, food: 61 },
      { fighters: [fighter(enemyId)], leader: 0, food: 73 },
    ],
    seed,
    firstSide: 0,
    now: 1,
  }).state;
}

describe("Campaign battle scenario adapter", () => {
  it("defines every combat node and all four objective contracts", () => {
    assert.equal(CAMPAIGN_SCENARIOS.length, 10);
    assert.deepEqual(
      [...new Set(
        CAMPAIGN_SCENARIOS.flatMap((plan) =>
          plan.phases.map((item) => item.objective.type),
        ),
      )].sort(),
      ["bossPhases", "breakSiege", "defeatEnemies", "surviveTurns"],
    );
    assert.ok(
      CAMPAIGN_SCENARIOS.every(
        (plan) =>
          plan.seedPolicy === "server" &&
          plan.structuralShield === "unsupported",
      ),
    );
  });

  it("settles defense after completed player turns with a required boss", () => {
    const tag = campaignScenarioTag("M03")!;
    const state = battle("hoa-lu-raider-chief");
    state.turn.number = 9;
    assert.equal(completedPlayerTurns(state), 4);
    const result = settleCampaignScenario(tag, state);
    assert.ok(result.ok);
    assert.equal(result.verdict.status, "succeeded");
    assert.equal(result.verdict.combatWinner, null);
    assert.equal(result.verdict.playerFood, state.sides[0].food);

    const lost = structuredClone(state);
    lost.winner = 1;
    assert.deepEqual(
      settleCampaignScenario(tag, lost),
      {
        ok: true,
        verdict: { ...result.verdict, status: "failed", combatWinner: 1 },
      },
    );
    assert.deepEqual(
      settleCampaignScenario(tag, battle("wrong-boss")),
      { ok: false, error: "missingBoss" },
    );
  });

  it("splits siege into deterministic breach and assault phases", () => {
    const plan = campaignScenarioByNode("M20")!;
    assert.equal(plan.phases.length, 2);
    const state = battle("nguyenSieu");
    state.sides[1].fighters[0]!.hp = 0;
    state.winner = 0;
    const breach = settleCampaignScenario(campaignScenarioTag("M20", 0)!, state);
    const assault = settleCampaignScenario(campaignScenarioTag("M20", 1)!, state);
    assert.ok(breach.ok && assault.ok);
    assert.equal(breach.verdict.status, "advance");
    assert.equal(assault.verdict.status, "succeeded");
    assert.notEqual(plan.phases[0]!.encounterKey, plan.phases[1]!.encounterKey);
  });

  it("requires the named boss to be defeated before accepting a boss winner", () => {
    const tag = campaignScenarioTag("M15")!;
    const state = battle("kieuCongHan");
    state.winner = 0;
    assert.deepEqual(settleCampaignScenario(tag, state), {
      ok: false,
      error: "inconsistentWinner",
    });
    state.sides[1].fighters[0]!.hp = 0;
    const won = settleCampaignScenario(tag, state, [
      { type: "end", winner: 0 },
    ]);
    assert.ok(won.ok);
    assert.equal(won.verdict.status, "succeeded");
  });

  it("fails closed for missing objectives, wrong phases and winner events", () => {
    const state = battle("hoa-lu-raider-chief");
    assert.deepEqual(settleCampaignScenario(undefined, state), {
      ok: false,
      error: "undefinedObjective",
    });
    assert.deepEqual(
      settleCampaignScenario(
        { nodeId: "M03", scenarioId: "forged", phaseIndex: 0 },
        state,
      ),
      { ok: false, error: "invalidPhase" },
    );
    state.winner = 0;
    assert.deepEqual(
      settleCampaignScenario(campaignScenarioTag("M03")!, state, [
        { type: "end", winner: 1 },
      ]),
      { ok: false, error: "inconsistentEndEvent" },
    );
  });

  it("reads deterministic battle state without consuming either RNG stream", () => {
    const left = battle("hoa-lu-raider-chief", 123);
    const right = battle("hoa-lu-raider-chief", 123);
    left.turn.number = 9;
    right.turn.number = 9;
    const before = [left.boardRng, left.aiRng] as const;
    assert.deepEqual(
      settleCampaignScenario(campaignScenarioTag("M03")!, left),
      settleCampaignScenario(campaignScenarioTag("M03")!, right),
    );
    assert.deepEqual([left.boardRng, left.aiRng], before);
    assert.deepEqual(left.weights, right.weights);
  });
});
