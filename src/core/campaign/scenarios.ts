import type { BattleEvent, BattleState, SideIndex } from "../battle";
import { isAlive } from "../battle";
import type { SpawnWeights } from "../board";
import {
  STORY_NODES,
  isCombatStoryNode,
  type CampaignMissionId,
  type RaidTargetId,
} from "./storyNodes";

export type CampaignScenarioObjective =
  | { readonly type: "defeatEnemies" }
  | {
      readonly type: "surviveTurns";
      readonly playerTurns: number;
      readonly bossFighterId: string;
    }
  | {
      readonly type: "breakSiege";
      readonly stage: "breach" | "assault";
      readonly phaseIndex: number;
      readonly phaseCount: number;
    }
  | {
      readonly type: "bossPhases";
      readonly bossTarget: RaidTargetId;
      readonly phaseIndex: number;
      readonly phaseCount: number;
    };

export interface CampaignScenarioPhase {
  readonly id: string;
  readonly encounterKey: string;
  readonly objective: CampaignScenarioObjective;
  /** Board generation remains owned and validated by the Battle Engine. */
  readonly weights?: SpawnWeights;
}

export interface CampaignScenarioPlan {
  readonly nodeId: CampaignMissionId;
  readonly phases: readonly CampaignScenarioPhase[];
  readonly seedPolicy: "server";
  readonly structuralShield: "unsupported";
}

export interface CampaignScenarioTag {
  readonly nodeId: CampaignMissionId;
  readonly scenarioId: string;
  readonly phaseIndex: number;
}

export type CampaignScenarioStatus =
  | "pending"
  | "advance"
  | "succeeded"
  | "failed";

export interface CampaignScenarioVerdict {
  readonly nodeId: CampaignMissionId;
  readonly scenarioId: string;
  readonly phaseIndex: number;
  readonly status: CampaignScenarioStatus;
  readonly combatWinner: SideIndex | null;
  /** Completed player turns; extra actions do not increment this value. */
  readonly playerTurns: number;
  readonly playerHp: number;
  readonly enemyHp: number;
  readonly playerFood: number;
  readonly enemyFood: number;
}

export type CampaignScenarioSettlement =
  | { readonly ok: true; readonly verdict: CampaignScenarioVerdict }
  | {
      readonly ok: false;
      readonly error:
        | "undefinedObjective"
        | "invalidPhase"
        | "missingBoss"
        | "inconsistentWinner"
        | "inconsistentEndEvent";
    };

const SURVIVE_TURNS: Readonly<Partial<Record<CampaignMissionId, number>>> = {
  M03: 4,
  M04: 6,
  M22: 5,
};

const DEFENSE_BOSS: Readonly<Partial<Record<CampaignMissionId, string>>> = {
  M03: "hoa-lu-raider-chief",
  M04: "ngo-951-field-commander",
  M22: "disbanded-force-leader",
};

function phase(
  nodeId: CampaignMissionId,
  encounterKey: string,
  objective: CampaignScenarioObjective,
  index = 0,
): CampaignScenarioPhase {
  return {
    id: `${nodeId}-phase-${index + 1}`,
    encounterKey,
    objective,
  };
}

function planForNode(
  node: (typeof STORY_NODES)[number],
): CampaignScenarioPlan | null {
  if (!isCombatStoryNode(node)) return null;
  if (node.type === "defense") {
    const playerTurns = SURVIVE_TURNS[node.id];
    const bossFighterId = DEFENSE_BOSS[node.id];
    if (!playerTurns || !bossFighterId) return null;
    return {
      nodeId: node.id,
      phases: [
        phase(node.id, node.scenario.encounterKey, {
          type: "surviveTurns",
          playerTurns,
          bossFighterId,
        }),
      ],
      seedPolicy: "server",
      structuralShield: "unsupported",
    };
  }
  if (node.type === "siege") {
    return {
      nodeId: node.id,
      phases: [
        phase(
          node.id,
          `${node.scenario.encounterKey}-breach`,
          {
            type: "breakSiege",
            stage: "breach",
            phaseIndex: 0,
            phaseCount: 2,
          },
          0,
        ),
        phase(
          node.id,
          `${node.scenario.encounterKey}-assault`,
          {
            type: "breakSiege",
            stage: "assault",
            phaseIndex: 1,
            phaseCount: 2,
          },
          1,
        ),
      ],
      seedPolicy: "server",
      structuralShield: "unsupported",
    };
  }
  if (node.type === "boss") {
    return {
      nodeId: node.id,
      phases: [
        phase(node.id, node.scenario.encounterKey, {
          type: "bossPhases",
          bossTarget: node.scenario.bossTarget,
          phaseIndex: 0,
          phaseCount: 1,
        }),
      ],
      seedPolicy: "server",
      structuralShield: "unsupported",
    };
  }
  return {
    nodeId: node.id,
    phases: [
      phase(node.id, node.scenario.encounterKey, {
        type: "defeatEnemies",
      }),
    ],
    seedPolicy: "server",
    structuralShield: "unsupported",
  };
}

export const CAMPAIGN_SCENARIOS: readonly CampaignScenarioPlan[] = STORY_NODES
  .map(planForNode)
  .filter((plan): plan is CampaignScenarioPlan => plan !== null);

export function campaignScenarioByNode(
  nodeId: string,
): CampaignScenarioPlan | undefined {
  return CAMPAIGN_SCENARIOS.find((plan) => plan.nodeId === nodeId);
}

export function campaignScenarioTag(
  nodeId: CampaignMissionId,
  phaseIndex = 0,
): CampaignScenarioTag | null {
  const plan = campaignScenarioByNode(nodeId);
  const selected = plan?.phases[phaseIndex];
  return selected
    ? { nodeId, scenarioId: selected.id, phaseIndex }
    : null;
}

/**
 * `turn.number` counts side turns from 1. Server matches immediately execute an
 * AI turn, so every two started side turns represent one completed player turn.
 */
export function completedPlayerTurns(battle: BattleState): number {
  return Math.max(0, Math.floor((battle.turn.number - 1) / 2));
}

const livingHp = (battle: BattleState, side: SideIndex) =>
  battle.sides[side].fighters.reduce(
    (total, fighter) => total + Math.max(0, fighter.hp),
    0,
  );

function completedStatus(
  phaseIndex: number,
  phaseCount: number,
): "advance" | "succeeded" {
  return phaseIndex + 1 < phaseCount ? "advance" : "succeeded";
}

/** Shared deterministic settlement entrypoint for every Campaign objective. */
export function settleCampaignScenario(
  tag: CampaignScenarioTag | undefined,
  battle: BattleState,
  events: readonly BattleEvent[] = [],
): CampaignScenarioSettlement {
  if (!tag) return { ok: false, error: "undefinedObjective" };
  const plan = campaignScenarioByNode(tag.nodeId);
  const selected = plan?.phases[tag.phaseIndex];
  if (!selected || selected.id !== tag.scenarioId)
    return { ok: false, error: "invalidPhase" };

  const endEvents = events.filter((event) => event.type === "end");
  if (
    endEvents.some(
      (event) => event.type === "end" && event.winner !== battle.winner,
    )
  )
    return { ok: false, error: "inconsistentEndEvent" };

  const playerHp = livingHp(battle, 0);
  const enemyHp = livingHp(battle, 1);
  const turns = completedPlayerTurns(battle);
  let status: CampaignScenarioStatus = "pending";
  const objective = selected.objective;

  if (battle.winner === 1) status = "failed";
  else if (objective.type === "surviveTurns") {
    if (!battle.sides[1].fighters.some((fighter) => fighter.id === objective.bossFighterId))
      return { ok: false, error: "missingBoss" };
    if (battle.winner === 0 || (turns >= objective.playerTurns && playerHp > 0))
      status = "succeeded";
  } else if (objective.type === "bossPhases") {
    const boss = battle.sides[1].fighters.find(
      (fighter) => fighter.id === objective.bossTarget,
    );
    if (!boss) return { ok: false, error: "missingBoss" };
    if (battle.winner === 0 && isAlive(boss))
      return { ok: false, error: "inconsistentWinner" };
    if (battle.winner === 0)
      status = completedStatus(objective.phaseIndex, objective.phaseCount);
  } else if (battle.winner === 0) {
    const phaseIndex =
      objective.type === "breakSiege" ? objective.phaseIndex : 0;
    const phaseCount =
      objective.type === "breakSiege" ? objective.phaseCount : 1;
    if (enemyHp > 0) return { ok: false, error: "inconsistentWinner" };
    status = completedStatus(phaseIndex, phaseCount);
  }

  return {
    ok: true,
    verdict: {
      nodeId: tag.nodeId,
      scenarioId: tag.scenarioId,
      phaseIndex: tag.phaseIndex,
      status,
      combatWinner: battle.winner,
      playerTurns: turns,
      playerHp,
      enemyHp,
      playerFood: battle.sides[0].food,
      enemyFood: battle.sides[1].food,
    },
  };
}

const SCENARIO_ERRORS = CAMPAIGN_SCENARIOS.flatMap((plan) => {
  if (plan.phases.length === 0) return [`${plan.nodeId}: missing phases`];
  const ids = plan.phases.map((item) => item.id);
  if (new Set(ids).size !== ids.length)
    return [`${plan.nodeId}: duplicate phase IDs`];
  return plan.phases.flatMap((item, index) => {
    if (item.objective.type === "breakSiege")
      return item.objective.phaseIndex === index &&
        item.objective.phaseCount === plan.phases.length
        ? []
        : [`${plan.nodeId}: invalid siege phase`];
    return [];
  });
});
if (SCENARIO_ERRORS.length > 0)
  throw new Error(`Invalid Campaign scenarios: ${SCENARIO_ERRORS.join("; ")}`);
