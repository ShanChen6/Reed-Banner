// Mô phỏng trận của Campaign V2 (nhiệm vụ có encounter) và Đánh trùm: đội người chơi dựng theo tiến trình tự
// dựng ở một cấp, đấu đúng đội và luật server dùng. AI Thường đánh thay người chơi. Chiến dịch 13 màn cũ và
// `--stage` đã gỡ ở CAMP-08.04. Xem docs/design/09-che-do-choi.md mục 2.

import { createBattle, type FighterConfig, type SideIndex } from "../battle";
import { playAiTurn } from "../ai";
import { findValidMoves } from "../board";
import { presetLoadout, withGear, type Tier } from "../gear";
import {
  raidRecommended,
  raidSetup,
  raidUnlockMission,
  type RaidTier,
  type WarlordEncounter,
} from "../campaign";
import { ELEMENTS, type Element } from "../battle";
import type { Difficulty } from "../ai";
import {
  CAMPAIGN_RECRUITS,
  campaignBattleAdvice,
  campaignBattleScenario,
  campaignEncounter,
  campaignEncounterFoes,
  campaignScenarioByNode,
  campaignScenarioTag,
  campaignTerrain,
  completedPlayerTurns,
  settleCampaignScenario,
  storyNodeById,
  type CampaignMissionId,
} from "../campaign";
import {
  autoProgress,
  battleRewards,
  buildCompanion,
  buildMain,
  CAMPAIGN_FOOD_START,
  DEFAULT_TEAM,
  MAX_LEVEL,
  newProfile,
} from "../progress";
import { companionById } from "../roster";
import { DEFAULT_MAX_TURNS, type Matchup } from "./sim";

/**
 * Đội kèm của người chơi: "default" là đội khởi đầu (Hà Vân, Mai Thanh); "heroes" là 2 tướng lịch sử đã mở
 * gần nhất trước trận (chưa đủ 2 thì bù bằng đội khởi đầu).
 */
export type StageTeam = "default" | "heroes";

export interface StageSimOptions {
  /** Cấp của cả đội người chơi; bỏ trống là cấp gợi ý. */
  readonly level?: number;
  /** Nguyên tố của Đinh Bộ Lĩnh; bỏ trống thì xoay vòng 7 hệ theo trận để không lệch theo một hệ. */
  readonly element?: Element;
  readonly team?: StageTeam;
  readonly food?: number;
}

function companionAt(id: string, level: number): FighterConfig {
  return buildCompanion(companionById(id)!, autoProgress(level, null));
}

/** 2 tướng lịch sử mở muộn nhất trong các nhiệm vụ `before`, bù bằng đội khởi đầu. */
function heroTeam(before: ReadonlySet<string>): string[] {
  const heroes = CAMPAIGN_RECRUITS.filter((r) => before.has(r.milestone)).map(
    (r) => r.id as string,
  );
  return [
    ...heroes.slice(-2),
    ...DEFAULT_TEAM.filter((id) => !heroes.includes(id)),
  ].slice(0, 2);
}

/** Các nhiệm vụ là tiền đề (trực tiếp hay gián tiếp) của `nodeId`, không gồm chính nó. */
function prereqClosure(nodeId: CampaignMissionId): Set<string> {
  const before = new Set<string>();
  const visit = (id: CampaignMissionId) => {
    for (const p of storyNodeById(id)?.prereqs ?? [])
      if (!before.has(p)) {
        before.add(p);
        visit(p);
      }
  };
  visit(nodeId);
  return before;
}

/** Đánh trùm: đội kèm khi vừa qua nhiệm vụ mốc mở sứ quân này (tính cả tướng mở ở chính mốc đó). */
export function raidTeamIds(boss: WarlordEncounter, team: StageTeam): string[] {
  if (team === "default") return [...DEFAULT_TEAM];
  const gate = raidUnlockMission(boss.id);
  if (!gate) return [...DEFAULT_TEAM];
  return heroTeam(new Set([...prereqClosure(gate), gate]));
}

/** `count` trận Đánh trùm bậc `tier`, đúng luật sân nhà server dùng. Phe 0 là người chơi, phe đi trước luân phiên. */
export function raidMatchups(
  boss: WarlordEncounter,
  tier: RaidTier,
  count: number,
  seed = 1,
  options: StageSimOptions = {},
): { readonly matchups: Matchup[]; readonly difficulty: Difficulty } {
  const level = options.level ?? raidRecommended(boss, tier);
  const setup = raidSetup(boss, tier);
  const mates =
    boss.mode === "3v3"
      ? raidTeamIds(boss, options.team ?? "heroes").map((id) =>
          companionAt(id, level),
        )
      : [];
  const matchups = Array.from({ length: count }, (_, i) => ({
    sides: [
      {
        fighters: [
          buildMain(
            autoProgress(level, null),
            options.element ?? ELEMENTS[i % ELEMENTS.length]!,
            "tuongSi",
          ),
          ...mates,
        ],
        leader: 0,
        food: options.food ?? CAMPAIGN_FOOD_START,
      },
      { fighters: setup.foes, leader: 0, food: setup.foeFood },
    ] as const,
    seed: (seed + i * 7919) >>> 0,
    firstSide: (i % 2) as SideIndex,
    weights: setup.weights,
  }));
  return { matchups, difficulty: setup.difficulty };
}

/**
 * Campaign V2: đội kèm người chơi ở một nhiệm vụ. "default" là đội khởi đầu; "heroes" là 2 tướng lịch sử có mốc
 * chiêu mộ là tiền đề (trực tiếp hay gián tiếp) của nhiệm vụ, lấy 2 người mở muộn nhất.
 */
export function missionTeamIds(
  nodeId: CampaignMissionId,
  team: StageTeam,
): string[] {
  if (team === "default") return [...DEFAULT_TEAM];
  return heroTeam(prereqClosure(nodeId));
}

/**
 * `count` trận của một nhiệm vụ Campaign V2 có encounter, đúng tham số server dùng: đối thủ ở cấp encounter, độ
 * khó của scenario, địa hình và lương đối thủ. Người chơi mang lương gợi ý của màn chuẩn bị trận. Phe 0 là người
 * chơi; Đinh Bộ Lĩnh Tướng sĩ, hệ xoay vòng 7 hệ nếu không chỉ định.
 */
export function missionMatchups(
  nodeId: CampaignMissionId,
  count: number,
  seed = 1,
  options: StageSimOptions = {},
): { readonly matchups: Matchup[]; readonly difficulty: Difficulty } {
  const encounter = campaignEncounter(nodeId);
  const scenario = campaignBattleScenario(nodeId);
  const foes = campaignEncounterFoes(nodeId);
  if (!encounter || !scenario || !foes)
    throw new Error(`${nodeId}: chưa có encounter`);
  const level = options.level ?? encounter.recommendedLevel;
  const mates =
    scenario.mode === "3v3"
      ? missionTeamIds(nodeId, options.team ?? "heroes").map((id) =>
          companionAt(id, level),
        )
      : [];
  const food =
    options.food ??
    campaignBattleAdvice(newProfile(), nodeId)?.suggestedFood ??
    CAMPAIGN_FOOD_START;
  const weights = campaignTerrain(nodeId)?.weights;
  const matchups = Array.from({ length: count }, (_, i) => ({
    sides: [
      {
        fighters: [
          buildMain(
            autoProgress(level, null),
            options.element ?? ELEMENTS[i % ELEMENTS.length]!,
            "tuongSi",
          ),
          ...mates,
        ],
        leader: 0,
        food,
      },
      {
        fighters: foes,
        leader: 0,
        ...(encounter.foeFood !== undefined ? { food: encounter.foeFood } : {}),
      },
    ] as const,
    seed: (seed + i * 7919) >>> 0,
    firstSide: (i % 2) as SideIndex,
    ...(weights ? { weights } : {}),
  }));
  return { matchups, difficulty: scenario.difficulty };
}

/** Hồ sơ người chơi giả lập cho một lượt nhiệm vụ (CAMP-09.02). */
export interface MissionSimOptions extends StageSimOptions {
  /** Cấp lệch so với cấp gợi ý của từng phase (bỏ qua khi có `level`). */
  readonly levelOffset?: number;
  /** Mặc đủ 9 món phẩm này (không bộ) cho cả đội người chơi; bỏ trống là không đồ. */
  readonly gearTier?: Tier;
  readonly maxTurns?: number;
}

export type MissionSimOutcome = "succeeded" | "wiped" | "stalled";

export interface MissionPhaseResult {
  readonly phaseIndex: number;
  readonly status: "advance" | "succeeded" | "failed" | "stalled";
  /** Lượt trọn của người chơi trong phase (cách server đếm, `completedPlayerTurns`). */
  readonly playerTurns: number;
  readonly foodStart: number;
  readonly foodEnd: number;
  /** Lương mua thêm trước phase để đủ lương gợi ý. */
  readonly foodBought: number;
  /** Phase dừng vì trùm xuống ngưỡng máu (không phải hạ hết đối thủ). */
  readonly bossThreshold: boolean;
  readonly bossHpEnd: number | null;
  readonly shuffles: number;
  readonly hadValidMove: boolean;
  readonly playerHpEnd: number;
  /** Thưởng trận thường server cộng cho trận này (battleRewards), không gồm thưởng lần đầu. */
  readonly rewardGold: number;
  readonly rewardXp: number;
}

export interface MissionRunResult {
  readonly nodeId: CampaignMissionId;
  readonly outcome: MissionSimOutcome;
  readonly phases: readonly MissionPhaseResult[];
}

/** Cấp người chơi ở phase `phaseIndex` theo hồ sơ giả lập. */
function missionLevel(
  nodeId: CampaignMissionId,
  phaseIndex: number,
  options: MissionSimOptions,
): number {
  if (options.level !== undefined) return options.level;
  const rec = campaignEncounter(nodeId, phaseIndex)!.recommendedLevel;
  return Math.max(1, Math.min(MAX_LEVEL, rec + (options.levelOffset ?? 0)));
}

/**
 * Một lượt đi hết nhiệm vụ có trận, đúng cách server chốt (settleCampaignScenario sau mỗi lượt): phòng thủ thắng
 * khi đủ lượt, trùm nhiều phase qua phase khi xuống ngưỡng máu và mang máu sang phase sau, công thành mang lương
 * sang phase sau (thiếu thì mua thêm tới mức lương gợi ý). Thua một phase thì dừng lượt (server giữ phase đã qua,
 * người chơi đánh lại phase đó). AI Thường đánh thay người chơi; phe đi trước theo `run` như seed & 1 của server.
 */
export function simulateMission(
  nodeId: CampaignMissionId,
  run: number,
  seed = 1,
  options: MissionSimOptions = {},
): MissionRunResult {
  const scenario = campaignBattleScenario(nodeId);
  const plan = campaignScenarioByNode(nodeId);
  if (!scenario || !plan) throw new Error(`${nodeId}: không phải nhiệm vụ có trận`);
  const element = options.element ?? ELEMENTS[run % ELEMENTS.length]!;
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  const phases: MissionPhaseResult[] = [];
  let supply: number | undefined = options.food;
  let bossHp: number | undefined;
  for (let p = 0; p < plan.phases.length; p++) {
    const phase = plan.phases[p]!;
    const level = missionLevel(nodeId, p, options);
    const mates =
      scenario.mode === "3v3"
        ? missionTeamIds(nodeId, options.team ?? "heroes").map((id) =>
            companionAt(id, level),
          )
        : [];
    let fighters: FighterConfig[] = [
      buildMain(autoProgress(level, null), element, "tuongSi"),
      ...mates,
    ];
    if (options.gearTier)
      fighters = fighters.map((f) =>
        withGear(f, presetLoadout(f.element, f.profession, options.gearTier!, null)),
      );
    const suggested =
      campaignBattleAdvice(newProfile(), nodeId, p)?.suggestedFood ??
      CAMPAIGN_FOOD_START;
    const carried = supply ?? suggested;
    const foodStart = Math.max(carried, options.food ?? suggested);
    const encounter = campaignEncounter(nodeId, p)!;
    const foes = campaignEncounterFoes(nodeId, p)!;
    const tag = campaignScenarioTag(nodeId, p)!;
    const bossPhase = phase.objective.type === "bossPhases";
    let { state, events } = createBattle({
      sides: [
        { fighters, leader: 0, food: foodStart },
        {
          fighters: foes,
          leader: 0,
          ...(encounter.foeFood !== undefined ? { food: encounter.foeFood } : {}),
          ...(bossPhase && bossHp !== undefined
            ? { hpRatio: foes.map((_, i) => (i === 0 ? bossHp! : 1)) }
            : {}),
        },
      ],
      seed: (seed + run * 7919 + p * 104729) >>> 0,
      timer: false,
      firstSide: ((run + p) % 2) as SideIndex,
      ...(phase.weights ? { weights: phase.weights } : {}),
    });
    const hadValidMove = findValidMoves(state.board).length > 0;
    let shuffles = events.filter((e) => e.type === "shuffle").length;
    let status: MissionPhaseResult["status"] = "stalled";
    while (state.turn.number <= maxTurns) {
      const verdict = settleCampaignScenario(tag, state, events);
      if (!verdict.ok) throw new Error(`${nodeId}#${p}: ${verdict.error}`);
      if (verdict.verdict.status !== "pending") {
        status = verdict.verdict.status;
        break;
      }
      if (state.winner !== null) break;
      const r = playAiTurn(
        state,
        state.turn.side === 0 ? "normal" : scenario.difficulty,
      );
      state = r.state;
      events = r.events;
      shuffles += events.filter((e) => e.type === "shuffle").length;
    }
    const boss = bossPhase
      ? state.sides[1].fighters.find(
          (f) =>
            phase.objective.type === "bossPhases" &&
            f.id === phase.objective.bossTarget,
        )
      : undefined;
    const bossHpEnd = boss ? Math.max(0, boss.hp) / boss.maxHp : null;
    const own = state.sides[0].fighters;
    const rewards = battleRewards(
      state,
      0,
      status === "advance" || status === "succeeded",
    );
    phases.push({
      phaseIndex: p,
      status,
      playerTurns: completedPlayerTurns(state),
      foodStart,
      foodEnd: state.sides[0].food,
      foodBought: foodStart - carried,
      bossThreshold:
        status !== "failed" && status !== "stalled" && !!boss && boss.hp > 0,
      bossHpEnd,
      shuffles,
      hadValidMove,
      playerHpEnd:
        own.reduce((a, f) => a + Math.max(0, f.hp), 0) /
        own.reduce((a, f) => a + f.maxHp, 0),
      rewardGold: rewards.gold,
      rewardXp: rewards.xp.reduce((a, x) => a + x, 0),
    });
    if (status === "failed" || status === "stalled")
      return { nodeId, outcome: status === "failed" ? "wiped" : "stalled", phases };
    supply = state.sides[0].food;
    // Server ghi máu trùm làm tròn lên 2 chữ số, tối thiểu 0.01.
    bossHp =
      boss && boss.hp > 0
        ? Math.max(0.01, Math.ceil((boss.hp / boss.maxHp) * 100) / 100)
        : undefined;
  }
  return { nodeId, outcome: "succeeded", phases };
}
