import type { BattleEvent, BattleState, SideIndex } from "../battle";
import { isAlive } from "../battle";
import { STANDARD_WEIGHTS, validateWeights, type SpawnWeights } from "../board";
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
      readonly stage: CampaignSiegeStage;
      readonly phaseIndex: number;
      readonly phaseCount: number;
      /** Chỉ phase `escort`: số lượt người chơi phải giữ đoàn lương (hoặc hạ hết toán chặn đường). */
      readonly playerTurns?: number;
    }
  | {
      readonly type: "bossPhases";
      readonly bossTarget: RaidTargetId;
      readonly phaseIndex: number;
      readonly phaseCount: number;
      /**
       * Phase trùm chưa phải cuối: qua phase khi máu trùm còn bằng hoặc dưới tỉ lệ này (trùm vẫn đứng). Máu còn
       * lại mang sang phase sau, không hồi lại.
       */
      readonly hpThreshold?: number;
    };

export type CampaignSiegeStage = "breach" | "escort" | "assault";

/** Tên hiển thị của từng phase công thành. */
export const SIEGE_STAGE_NAME: Readonly<Record<CampaignSiegeStage, string>> = {
  breach: "Phá lũy",
  escort: "Giữ đoàn lương",
  assault: "Đối đầu quân",
};

export interface CampaignScenarioPhase {
  readonly id: string;
  /** Tên phase hiển thị khi nhiệm vụ có nhiều phase. */
  readonly label?: string;
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
  /**
   * Lương phe người chơi lúc server tạo trận (CAMP-08.03). Lúc chốt, hồ sơ chỉ cộng phần chênh của trận này vào lương
   * hiện có, để hai trận mở song song hay mua lương giữa chừng không ghi đè lẫn nhau.
   */
  readonly startFood?: number;
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

/**
 * Thứ tự phase của từng node công thành; mặc định phá lũy rồi đối đầu quân. M20 (CAMP-06.02, Shan chọn gộp
 * nhánh tiếp viện vào M20): phá lũy → giữ đoàn lương N lượt (tình tiết phục vụ gameplay) → đối đầu quân.
 * Mỗi phase là một trận riêng; không thêm nhiệm vụ, không đổi thưởng.
 */
const SIEGE_STAGES: Readonly<
  Partial<
    Record<
      CampaignMissionId,
      readonly (
        | Exclude<CampaignSiegeStage, "escort">
        | { readonly stage: "escort"; readonly playerTurns: number }
      )[]
    >
  >
> = {
  M20: ["breach", { stage: "escort", playerTurns: 5 }, "assault"],
};

/**
 * Trùm nhiều phase. M21 Đỗ Động (CAMP-06.03): mở đường vây (trận công thành), rồi hai phase trùm. Phase trùm
 * đầu kết thúc khi máu Đỗ Cảnh Thạc xuống tới ngưỡng; phase cuối trùm vào trận với đúng máu còn lại. Đỗ Động
 * là cao trào do game chọn, không phải trận cuối trong sử (W12, U07).
 */
const BOSS_PHASES: Readonly<
  Partial<
    Record<
      CampaignMissionId,
      {
        readonly road: string;
        readonly stages: readonly {
          readonly label: string;
          readonly hpThreshold?: number;
        }[];
      }
    >
  >
> = {
  M21: {
    road: "Mở đường vây",
    stages: [
      { label: "Phá tuyến ngoài", hpThreshold: 0.5 },
      { label: "Trận quyết" },
    ],
  },
};

const SURVIVE_TURNS: Readonly<Partial<Record<CampaignMissionId, number>>> = {
  M03: 4,
  M04: 6,
};

const DEFENSE_BOSS: Readonly<Partial<Record<CampaignMissionId, string>>> = {
  M03: "hoa-lu-raider-chief",
  M04: "ngo-951-field-commander",
};

/**
 * Cửa sông ven biển (M07): nhiều âm dương, ít bánh chưng, cùng tỉ lệ bàn sông nước của màn Bố Hải cũ và sân
 * nhà Thủy. Đây là cách game dựng địa hình cửa biển, không phải mô tả một trận có sử chép.
 */
export const ESTUARY_WEIGHTS: SpawnWeights = {
  ...STANDARD_WEIGHTS,
  banhChung: 9,
  amDuong: 22,
};

/**
 * Đất khô Phong Châu (M15): nhiều kiếm và bánh chưng, ít âm dương. Đánh nhanh, lương dễ bổ sung; game dựng
 * địa hình để tương phản với đầm Hồi Hồ, không phải sơ đồ trận có sử chép.
 */
export const DRY_GROUND_WEIGHTS: SpawnWeights = {
  ...STANDARD_WEIGHTS,
  kiem: 21,
  amDuong: 12,
  banhChung: 18,
  sach: 9,
};

/**
 * Đầm lầy Hồi Hồ (M16): nhiều âm dương, ít kiếm và bánh chưng, nên trận chậm và lương khó bổ sung. Luật bàn cờ
 * là của game (`fictional`); sử không chép chi tiết đầm, thành hay trận ở Hồi Hồ.
 */
export const WETLAND_WEIGHTS: SpawnWeights = {
  ...STANDARD_WEIGHTS,
  kiem: 15,
  amDuong: 24,
  banhChung: 9,
  trong: 15,
};

/**
 * Đường lương căng (M18): ít bánh chưng nhất luật cho phép, phần dôi chia đều cho các ô khác. Cùng với kho lương
 * đầy của đối thủ, đây là cách game dựng sức ép hậu cần trước một lực lượng đông; không phải mô tả có sử chép.
 */
export const SCARCE_SUPPLY_WEIGHTS: SpawnWeights = {
  ...STANDARD_WEIGHTS,
  amDuong: 18,
  banhChung: 8,
  tim: 16,
  vang: 12,
  sach: 12,
  trong: 16,
};

export type CampaignTerrainId =
  | "estuary"
  | "dryGround"
  | "wetland"
  | "scarceSupply";

export interface CampaignTerrain {
  readonly id: CampaignTerrainId;
  readonly name: string;
  /** Một câu mô tả tỉ lệ ô; luôn là luật game, không phải mô tả sử. */
  readonly summary: string;
  readonly weights: SpawnWeights;
}

export const CAMPAIGN_TERRAINS: Readonly<
  Record<CampaignTerrainId, CampaignTerrain>
> = {
  estuary: {
    id: "estuary",
    name: "Bàn cờ cửa sông",
    summary: "nhiều âm dương, ít bánh chưng",
    weights: ESTUARY_WEIGHTS,
  },
  dryGround: {
    id: "dryGround",
    name: "Bàn cờ đất khô",
    summary: "nhiều kiếm và bánh chưng, ít âm dương",
    weights: DRY_GROUND_WEIGHTS,
  },
  wetland: {
    id: "wetland",
    name: "Bàn cờ đầm lầy",
    summary: "nhiều âm dương, ít kiếm và bánh chưng",
    weights: WETLAND_WEIGHTS,
  },
  scarceSupply: {
    id: "scarceSupply",
    name: "Bàn cờ đường lương căng",
    summary: "ít bánh chưng nhất, lương khó bổ sung",
    weights: SCARCE_SUPPLY_WEIGHTS,
  },
};

const PHASE_TERRAIN: Readonly<
  Partial<Record<CampaignMissionId, CampaignTerrainId>>
> = {
  M07: "estuary",
  M15: "dryGround",
  M16: "wetland",
  M18: "scarceSupply",
};

for (const terrain of Object.values(CAMPAIGN_TERRAINS))
  validateWeights(terrain.weights);

/** Địa hình bàn cờ của nhiệm vụ, hoặc undefined khi dùng bàn chuẩn. */
export function campaignTerrain(nodeId: string): CampaignTerrain | undefined {
  const id = PHASE_TERRAIN[nodeId as CampaignMissionId];
  return id ? CAMPAIGN_TERRAINS[id] : undefined;
}

function phase(
  nodeId: CampaignMissionId,
  encounterKey: string,
  objective: CampaignScenarioObjective,
  index = 0,
): CampaignScenarioPhase {
  const weights = campaignTerrain(nodeId)?.weights;
  return {
    id: `${nodeId}-phase-${index + 1}`,
    encounterKey,
    objective,
    ...(weights ? { weights } : {}),
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
    const stages = SIEGE_STAGES[node.id] ?? ["breach", "assault"];
    return {
      nodeId: node.id,
      phases: stages.map((item, index) => {
        const stage = typeof item === "string" ? item : item.stage;
        return {
          ...phase(
            node.id,
            `${node.scenario.encounterKey}-${stage}`,
            {
              type: "breakSiege",
              stage,
              phaseIndex: index,
              phaseCount: stages.length,
              ...(typeof item === "string"
                ? {}
                : { playerTurns: item.playerTurns }),
            },
            index,
          ),
          label: SIEGE_STAGE_NAME[stage],
        };
      }),
      seedPolicy: "server",
      structuralShield: "unsupported",
    };
  }
  if (node.type === "boss" && BOSS_PHASES[node.id]) {
    const config = BOSS_PHASES[node.id]!;
    const count = config.stages.length + 1;
    const key = node.scenario.encounterKey;
    return {
      nodeId: node.id,
      phases: [
        {
          ...phase(
            node.id,
            `${key}-road`,
            {
              type: "breakSiege",
              stage: "breach",
              phaseIndex: 0,
              phaseCount: count,
            },
            0,
          ),
          label: config.road,
        },
        ...config.stages.map((stage, i) => ({
          ...phase(
            node.id,
            `${key}-boss-${i + 1}`,
            {
              type: "bossPhases" as const,
              bossTarget: node.scenario.bossTarget,
              phaseIndex: i + 1,
              phaseCount: count,
              ...(stage.hpThreshold !== undefined
                ? { hpThreshold: stage.hpThreshold }
                : {}),
            },
            i + 1,
          ),
          label: stage.label,
        })),
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

/** Các phase công thành của nhiệm vụ theo thứ tự; rỗng với nhiệm vụ không phải công thành. */
export function campaignSiegeStages(nodeId: string): CampaignSiegeStage[] {
  return (campaignScenarioByNode(nodeId)?.phases ?? []).flatMap((p) =>
    p.objective.type === "breakSiege" ? [p.objective.stage] : [],
  );
}

/** Tên từng phase của nhiệm vụ nhiều phase, theo thứ tự; rỗng với nhiệm vụ một trận. */
export function campaignPhaseLabels(nodeId: string): string[] {
  const phases = campaignScenarioByNode(nodeId)?.phases ?? [];
  return phases.length > 1 ? phases.map((p, i) => p.label ?? `Phase ${i + 1}`) : [];
}

/** Số phase (trận) của nhiệm vụ; 1 với nhiệm vụ một trận, 0 khi không phải nhiệm vụ có trận. */
export function campaignPhaseCount(nodeId: string): number {
  return campaignScenarioByNode(nodeId)?.phases.length ?? 0;
}

/**
 * Số lượt phải cầm cự của phase: `surviveTurns` (phòng thủ) hoặc phase giữ đoàn lương của công thành;
 * undefined với mục tiêu phải hạ hết đối thủ.
 */
export function campaignPhaseTurns(
  nodeId: string,
  phaseIndex = 0,
): number | undefined {
  const objective = campaignScenarioByNode(nodeId)?.phases[phaseIndex]?.objective;
  if (objective?.type === "surviveTurns") return objective.playerTurns;
  if (objective?.type === "breakSiege" && objective.stage === "escort")
    return objective.playerTurns;
  return undefined;
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
    else if (
      objective.hpThreshold !== undefined &&
      isAlive(boss) &&
      boss.hp <= boss.maxHp * objective.hpThreshold
    )
      // Trùm xuống tới ngưỡng: qua phase, trận này dừng ở đây; trận sau trùm giữ máu còn lại.
      status = completedStatus(objective.phaseIndex, objective.phaseCount);
  } else if (
    objective.type === "breakSiege" &&
    objective.stage === "escort" &&
    battle.winner !== 0
  ) {
    // Giữ đoàn lương: đủ lượt mà phe ta còn người là qua phase; hạ hết toán chặn đường cũng qua (nhánh dưới).
    if (turns >= objective.playerTurns! && playerHp > 0)
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
    if (item.objective.type === "bossPhases" && item.objective.phaseCount > 1) {
      const threshold = item.objective.hpThreshold;
      const last = index === plan.phases.length - 1;
      return item.objective.phaseIndex === index &&
        item.objective.phaseCount === plan.phases.length &&
        (last
          ? threshold === undefined
          : threshold !== undefined && threshold > 0 && threshold < 1)
        ? []
        : [`${plan.nodeId}: invalid boss phase`];
    }
    if (item.objective.type === "breakSiege") {
      const escortOk =
        item.objective.stage === "escort"
          ? Number.isSafeInteger(item.objective.playerTurns) &&
            item.objective.playerTurns! > 0
          : item.objective.playerTurns === undefined;
      return item.objective.phaseIndex === index &&
        item.objective.phaseCount === plan.phases.length &&
        escortOk &&
        (index > 0 || item.objective.stage === "breach") &&
        (index < plan.phases.length - 1 || item.objective.stage === "assault")
        ? []
        : [`${plan.nodeId}: invalid siege phase`];
    }
    return [];
  });
});
if (SCENARIO_ERRORS.length > 0)
  throw new Error(`Invalid Campaign scenarios: ${SCENARIO_ERRORS.join("; ")}`);
