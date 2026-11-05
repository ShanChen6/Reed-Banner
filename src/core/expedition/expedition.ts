// Viễn Chinh: hai đạo quân hành quân trên sa bàn tới thành đích. Mỗi ngày một đạo tiến một ô (gặp đồn thì đánh),
// đạo còn lại nghỉ hồi máu; địch tăng viện theo ngày; đạo kia đứng kề ô bị đánh thì giáp công (địch yếu máu).
// Thuần và tất định theo seed. Luật và số liệu: docs/02-game-modes/expedition/01-vien-chinh-gdd.md.

import type { Difficulty } from "../ai";
import { FOOD_START, type BattleState, type FighterConfig, type SideConfig } from "../battle";
import type { SpawnWeights } from "../board";
import { BOSS_HP, HOME_TERRAIN } from "../campaign";
import { GEAR_SETS, GEAR_SLOTS, type GearItem, type Tier } from "../gear";
import {
  MAIN_ID,
  MAX_LEVEL,
  leveledFoe,
  ownsCompanion,
  profileTeam,
  receiveDrop,
  type Profile,
} from "../progress";
import { createRng, type Rng } from "../rng";
import { SHOP_COMPANIONS, STARTER_COMPANIONS, isReleasedCompanion } from "../roster";
import {
  EXPEDITION_MAPS,
  EXPEDITION_WATCHTOWER_SIGHT,
  expeditionEdgeDays,
  expeditionEdgeKey,
  expeditionEdgeKind,
  expeditionHops,
  expeditionNeighbors,
  expeditionNode,
  isExpeditionCombatNode,
  isExpeditionMapId,
  type ExpeditionMap,
  type ExpeditionMapId,
  type ExpeditionNode,
  type ExpeditionNodeKind,
} from "./maps";
import type { ExpeditionObjective } from "./objective";
import { expeditionScenarioOf, EXPEDITION_ENDING_NAME, type ExpeditionEnding, type ExpeditionScenario } from "./scenario";
import {
  EXPEDITION_ARMY_SIZE,
  EXPEDITION_LOG_SIZE,
  clampExpeditionFood,
  isExpeditionTier,
  type ArmyIndex,
  type ExpeditionArmy,
  type ExpeditionBattleMode,
  type ExpeditionBattleRef,
  type ExpeditionResult,
  type ExpeditionRun,
  type ExpeditionState,
  type ExpeditionTier,
} from "./state";

// ——— Số liệu (điểm xuất phát do Claude đặt 04/11/2026, chỉnh bằng `pnpm exec tsx scripts/expedition-sim.ts`) ———

/** Đạo nghỉ trong ngày: mọi người (kể cả người gục) hồi chừng này phần máu tối đa. */
export const EXPEDITION_REST_HEAL = 0.15;
/** Đạo nghỉ trong ngày: thêm chừng này lương. */
export const EXPEDITION_REST_FOOD = 10;
/** Làng, lần đầu ghé: cả đạo (kể cả người gục) hồi chừng này phần máu tối đa, thêm lương. */
export const EXPEDITION_VILLAGE_HEAL = 0.35;
export const EXPEDITION_VILLAGE_FOOD = 20;
/** Kho lương chiếm được: cả hai đạo còn đánh được thêm chừng này lương. */
export const EXPEDITION_GRANARY_FOOD = 20;
/** Địch tăng viện: sức mạnh nhân thêm chừng này cho mỗi ngày đã qua. */
export const EXPEDITION_REINFORCE_PER_DAY = 0.05;
/** Máu của địch nhân thêm hệ số này (trận trên sa bàn ngắn hơn trận thường, như Trấn Ải). */
export const EXPEDITION_FOE_HP = 0.8;
/** Giáp công: máu tối đa của địch nhân với hệ số này. */
export const EXPEDITION_PINCER_HP = 0.75;

export interface ExpeditionTierInfo {
  readonly name: string;
  /** Cấp gợi ý; đối thủ quanh mức này, sâu hơn thì cao hơn. */
  readonly level: number;
  /** Hệ số sức mạnh (công và máu) của địch ở ngày 1. */
  readonly power: number;
  /** AI khó hơn mức gốc của ô bao nhiêu nấc. */
  readonly aiSteps: number;
  readonly firstGold: number;
  readonly repeatGold: number;
  /** Phẩm món thưởng lần đầu thắng bậc này. */
  readonly gearTier: Tier;
}

export const EXPEDITION_TIER_INFO: Readonly<Record<ExpeditionTier, ExpeditionTierInfo>> = {
  1: { name: "Bậc I", level: 10, power: 0.8, aiSteps: 0, firstGold: 300, repeatGold: 80, gearTier: 3 },
  2: { name: "Bậc II", level: 18, power: 0.88, aiSteps: 1, firstGold: 600, repeatGold: 160, gearTier: 4 },
  3: { name: "Bậc III", level: 26, power: 0.96, aiSteps: 2, firstGold: 1000, repeatGold: 300, gearTier: 5 },
};


const DIFFICULTY_LADDER: readonly Difficulty[] = ["easy", "normal", "hard", "boss", "nightmare"];
const BASE_DIFFICULTY: Readonly<Record<ExpeditionNodeKind, Difficulty>> = {
  camp: "easy",
  village: "easy",
  outpost: "easy",
  watchtower: "easy",
  granary: "easy",
  fort: "normal",
  citadel: "hard",
  bridge: "normal",
  shoal: "easy",
};
const FOE_COUNT: Readonly<Record<ExpeditionNodeKind, number>> = {
  camp: 0,
  village: 0,
  outpost: 2,
  watchtower: 2,
  granary: 2,
  fort: 3,
  citadel: 3,
  bridge: 3,
  shoal: 0,
};

export const expeditionMapOf = (run: Pick<ExpeditionRun, "map">): ExpeditionMap => EXPEDITION_MAPS[run.map];


/** Bậc được phép mở: Bậc I luôn mở, bậc sau mở khi đã thắng bậc trước của cùng sa bàn. */
export function expeditionTierUnlocked(state: ExpeditionState, map: ExpeditionMapId, tier: ExpeditionTier): boolean {
  return (state.cleared[map] ?? 0) >= tier - 1;
}

// ——— Đối thủ ———

const FOE_POOL: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
].filter((f) => isReleasedCompanion(f.id));

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function expeditionDifficulty(kind: ExpeditionNodeKind, tier: ExpeditionTier): Difficulty {
  const base = DIFFICULTY_LADDER.indexOf(BASE_DIFFICULTY[kind]);
  return DIFFICULTY_LADDER[Math.min(DIFFICULTY_LADDER.length - 1, base + EXPEDITION_TIER_INFO[tier].aiSteps)]!;
}

export function expeditionFoeLevel(node: ExpeditionNode, tier: ExpeditionTier): number {
  return Math.max(1, Math.min(MAX_LEVEL, EXPEDITION_TIER_INFO[tier].level + node.depth - 3));
}

/** Hệ số sức mạnh của địch vào ngày `day`. */
export function expeditionPower(tier: ExpeditionTier, day: number): number {
  return EXPEDITION_TIER_INFO[tier].power * (1 + EXPEDITION_REINFORCE_PER_DAY * Math.max(0, day - 1));
}

function pickFoes(rng: Rng, element: string, count: number): FighterConfig[] {
  const out: FighterConfig[] = [];
  for (let i = 0; i < count; i++) {
    const left = FOE_POOL.filter((f) => !out.some((o) => o.id === f.id));
    const local = left.filter((f) => f.element === element);
    const pool = local.length > 0 && rng.next() < 0.5 ? local : left;
    out.push(pool[rng.int(0, pool.length - 1)]!);
  }
  return out;
}

export interface ExpeditionEncounter {
  readonly node: string;
  readonly kind: ExpeditionNodeKind;
  readonly level: number;
  readonly difficulty: Difficulty;
  readonly power: number;
  readonly pincer: boolean;
  readonly foes: readonly FighterConfig[];
  /** Máu lúc vào trận theo tỉ lệ (đánh dở thì thấp hơn 1). */
  readonly hpRatio: readonly number[];
  readonly weights: SpawnWeights;
  /** Trận riêng của kịch bản (truy binh, phản công, phá cổng); không có là trận chiếm ô. */
  readonly mode?: ExpeditionBattleMode;
  /** Mục tiêu riêng (giữ cầu, hộ tống, phá cổng); không có là hạ hết đối thủ. */
  readonly objective?: ExpeditionObjective;
  /** Truy binh: ô đạo định tới. */
  readonly to?: string;
}

/** Id của cổng thành (công trình) trong trận phá cổng. */
export const EXPEDITION_GATE_ID = "congThanh";

function rollFoes(
  run: ExpeditionRun,
  key: string,
  node: ExpeditionNode,
  count: number,
  power: number,
  pincer: boolean,
  bossFirst: boolean,
): FighterConfig[] {
  const map = expeditionMapOf(run);
  const rng = createRng((run.seed ^ hash(`${run.map}|${key}`)) >>> 0);
  const level = expeditionFoeLevel(node, run.tier);
  const hpScale = power * EXPEDITION_FOE_HP * (pincer ? EXPEDITION_PINCER_HP : 1);
  return pickFoes(rng, map.element, count).map((base, i) => {
    const f = leveledFoe(base, level);
    const boss = bossFirst && i === 0;
    return {
      ...f,
      maxHp: Math.max(1, Math.round(f.maxHp * hpScale * (boss ? BOSS_HP : 1))),
      atk: Math.max(1, Math.round(f.atk * power)),
    };
  });
}

/** Cổng thành: công trình không ra tay, bền bằng tướng giữ thành × hệ số, giáp dày gấp đôi lính giữ. */
function gateFighter(boss: FighterConfig, guards: readonly FighterConfig[], gate: NonNullable<ExpeditionScenario["gate"]>, element: FighterConfig["element"]): FighterConfig {
  const guardDef = guards.reduce((sum, g) => sum + g.def, 0) / Math.max(1, guards.length);
  return {
    id: EXPEDITION_GATE_ID,
    name: "Cổng thành",
    element,
    profession: boss.profession,
    maxHp: Math.max(1, Math.round(boss.maxHp * gate.hpScale)),
    atk: 1,
    def: Math.max(1, Math.round(guardDef * gate.defScale)),
    skills: [],
    ...(boss.level ? { level: boss.level } : {}),
    structure: true,
  };
}

const savedHp = (run: ExpeditionRun, nodeId: string, count: number) =>
  Array.from({ length: count }, (_, i) => Math.max(0, Math.min(1, run.nodes[nodeId]?.foeHp?.[i] ?? 1)));

/**
 * Đối thủ của một ô có trận nếu đạo `army` đánh vào hôm nay (từ ô đạo đang đứng). Danh sách địch chỉ phụ thuộc seed và
 * ô; cấp theo độ sâu, sức mạnh theo ngày, máu giảm khi giáp công. Sa bàn có kịch bản: cầu là trận giữ cầu, thành đích
 * mạnh thêm theo thuyền viện và có phase phá cổng (trừ khi vào bằng cửa nước).
 */
export function expeditionEncounter(run: ExpeditionRun, nodeId: string, army: ArmyIndex): ExpeditionEncounter | null {
  const map = expeditionMapOf(run);
  const node = expeditionNode(map, nodeId);
  if (!node || !isExpeditionCombatNode(node.kind)) return null;
  const scenario = expeditionScenarioOf(run);
  let power = expeditionPower(run.tier, run.day) * expeditionFoePower(run);
  const hold = scenario?.hold?.nodes.includes(nodeId) ? scenario.hold : undefined;
  if (hold) power *= hold.power;
  if (scenario?.reinforcements && node.kind === "citadel") power *= 1 + scenario.reinforcements.power * (run.arrivals ?? 0);
  const pincer = expeditionPincer(run, nodeId, army);
  const foes = rollFoes(run, nodeId, node, FOE_COUNT[node.kind], power, pincer, node.kind === "citadel");
  const base = {
    node: nodeId,
    kind: node.kind,
    level: expeditionFoeLevel(node, run.tier),
    difficulty: expeditionDifficulty(node.kind, run.tier),
    power,
    pincer,
    weights: HOME_TERRAIN[map.element],
  };
  const hpRatio = savedHp(run, nodeId, foes.length);
  if (hold) return { ...base, foes, hpRatio, objective: { type: "hold", turns: hold.turns } };
  const from = run.armies[army].at;
  const gateRule = scenario?.gate;
  if (gateRule && node.kind === "citadel" && !run.nodes[nodeId]?.gateDown && from !== gateRule.skipFrom) {
    const gate = gateFighter(foes[0]!, foes.slice(1), gateRule, map.element);
    return { ...base, mode: "gate", foes: [gate, ...foes.slice(1)], hpRatio, objective: { type: "gate", fighter: 0 } };
  }
  return { ...base, foes, hpRatio };
}

/** Truy binh đuổi đoàn dân: đạo `army` đang mang dân rời làng tới `to`. */
export function expeditionChaseEncounter(run: ExpeditionRun, army: ArmyIndex, to: string): ExpeditionEncounter | null {
  const refugees = expeditionScenarioOf(run)?.refugees;
  const map = expeditionMapOf(run);
  if (!refugees) return null;
  const village = expeditionNode(map, refugees.village)!;
  const power = expeditionPower(run.tier, run.day) * expeditionFoePower(run) * refugees.chasePower;
  return {
    node: village.id,
    kind: village.kind,
    level: expeditionFoeLevel(village, run.tier),
    difficulty: expeditionDifficulty("outpost", run.tier),
    power,
    pincer: false,
    foes: rollFoes(run, "chase", village, refugees.chaseFoes, power, false, false),
    hpRatio: Array(refugees.chaseFoes).fill(1),
    weights: HOME_TERRAIN[map.element],
    mode: "chase",
    to,
    objective: { type: "escort", turns: refugees.chaseTurns },
  };
}

/** Địch phản công kho lương đạo `army` đang giữ. */
export function expeditionCounterEncounter(run: ExpeditionRun, army: ArmyIndex): ExpeditionEncounter | null {
  const counter = expeditionScenarioOf(run)?.counter;
  const map = expeditionMapOf(run);
  if (!counter) return null;
  const node = expeditionNode(map, counter.node)!;
  const power = expeditionPower(run.tier, run.day) * expeditionFoePower(run) * counter.power;
  const pincer = expeditionPincer(run, node.id, army);
  return {
    node: node.id,
    kind: node.kind,
    level: expeditionFoeLevel(node, run.tier),
    difficulty: expeditionDifficulty("fort", run.tier),
    power,
    pincer,
    foes: rollFoes(run, "counter", node, counter.foes, power, pincer, false),
    hpRatio: Array(counter.foes).fill(1),
    weights: HOME_TERRAIN[map.element],
    mode: "counter",
    objective: { type: "hold", turns: counter.turns },
  };
}

/** Giáp công: đạo kia còn đánh được và đang đứng ở ô kề ô bị đánh. */
export function expeditionPincer(run: ExpeditionRun, nodeId: string, army: ArmyIndex): boolean {
  const other = run.armies[army === 0 ? 1 : 0];
  if (!armyCanFight(other)) return false;
  return expeditionNeighbors(expeditionMapOf(run), nodeId).includes(other.at);
}

const armyCanFight = (army: ExpeditionArmy) => army.ids.some((id) => (army.fighters[id]?.hp ?? 0) > 0);

// ——— Xuất quân ———

export interface ExpeditionStartInput {
  readonly map: ExpeditionMapId;
  readonly tier: ExpeditionTier;
  /** Hai nhân vật kèm đi cùng Đinh Bộ Lĩnh ở đạo Chính. */
  readonly main: readonly string[];
  /** Ba nhân vật kèm của Biệt đạo; người đầu là thống lĩnh. */
  readonly second: readonly string[];
}

export type ExpeditionStartError =
  | "badMap"
  | "tierLocked"
  | "badArmy"
  | "duplicate"
  | "notOwned"
  | "runActive";

export function parseExpeditionStart(raw: unknown): ExpeditionStartInput | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const ids = (x: unknown, n: number) =>
    Array.isArray(x) && x.length === n && x.every((id) => typeof id === "string" && id.length > 0 && id.length < 64);
  if (!isExpeditionMapId(v.map) || !isExpeditionTier(v.tier) || !ids(v.main, 2) || !ids(v.second, 3)) return null;
  return { map: v.map, tier: v.tier, main: v.main as string[], second: v.second as string[] };
}

export function expeditionActive(state: ExpeditionState | undefined): boolean {
  const phase = state?.run?.phase;
  return phase === "march" || phase === "battle";
}

/** Dựng lượt viễn chinh mới: chụp chỉ số 6 người (đã gồm trang bị) và đặt hai đạo ở hai trại. */
export function createExpeditionRun(
  profile: Profile,
  state: ExpeditionState,
  input: ExpeditionStartInput,
  id: string,
  seed: number,
): { ok: true; run: ExpeditionRun } | { ok: false; error: ExpeditionStartError } {
  if (expeditionActive(state)) return { ok: false, error: "runActive" };
  const map = EXPEDITION_MAPS[input.map];
  if (!map) return { ok: false, error: "badMap" };
  if (!expeditionTierUnlocked(state, input.map, input.tier)) return { ok: false, error: "tierLocked" };
  const companions = [...input.main, ...input.second];
  if (input.main.length !== EXPEDITION_ARMY_SIZE - 1 || input.second.length !== EXPEDITION_ARMY_SIZE)
    return { ok: false, error: "badArmy" };
  if (companions.includes(MAIN_ID) || new Set(companions).size !== companions.length)
    return { ok: false, error: "duplicate" };
  if (companions.some((c) => !ownsCompanion(profile, c) || !isReleasedCompanion(c)))
    return { ok: false, error: "notOwned" };
  const configs = profileTeam(profile, companions);
  if (configs.length !== companions.length + 1) return { ok: false, error: "notOwned" };
  const byId = new Map(configs.map((c) => [c.id, c]));
  const army = (ids: readonly string[], at: string): ExpeditionArmy => ({
    ids: [...ids],
    at,
    food: FOOD_START,
    fighters: Object.fromEntries(ids.map((fid) => {
      const config = structuredClone(byId.get(fid)!);
      return [fid, { config, hp: config.maxHp }];
    })),
  });
  const scenario = EXPEDITION_SCENARIOS_OF(input.map);
  return {
    ok: true,
    run: {
      version: 1,
      id,
      map: input.map,
      tier: input.tier,
      seed: seed >>> 0,
      day: 1,
      armies: [army([MAIN_ID, ...input.main], map.camps[0]), army(input.second, map.camps[1])],
      nodes: Object.fromEntries(map.camps.map((c) => [c, { cleared: true }])),
      phase: "march",
      battle: null,
      rewarded: false,
      ...(scenario?.broken ? { broken: pickBroken(scenario.broken, seed >>> 0, input.map) } : {}),
    },
  };
}

const EXPEDITION_SCENARIOS_OF = (map: ExpeditionMapId) => expeditionScenarioOf({ map });

/** Đường bị phá của lượt: `brokenCount` đường trong danh sách có thể phá, chọn theo seed. */
function pickBroken(rule: NonNullable<ExpeditionScenario["broken"]>, seed: number, map: ExpeditionMapId): string[] {
  const rng = createRng((seed ^ hash(`${map}|broken`)) >>> 0);
  const pool = rule.edges.map(([a, b]) => expeditionEdgeKey(a, b));
  const out: string[] = [];
  while (out.length < Math.min(rule.count, pool.length)) {
    const left = pool.filter((k) => !out.includes(k));
    out.push(left[rng.int(0, left.length - 1)]!);
  }
  return out.sort();
}

// ——— Hành quân ———

export type ExpeditionMarchError =
  | "notMarching"
  | "badArmy"
  | "notAdjacent"
  | "armyDown"
  /** Đường đã biết là bị phá. */
  | "roadBroken"
  /** Cửa nước đang lên (đã biết lịch con nước). */
  | "highTide"
  /** Giặc đang phản công kho lương: đạo đứng ở đó phải đánh trước. */
  | "counterPending";

/** Lý do một đạo đứng yên mất ngày: chọn trúng đường bị phá hay cửa nước đang lên mà chưa biết. */
export type ExpeditionBlock = "broken" | "tide";

export type ExpeditionMarchResult =
  | { readonly ok: true; readonly kind: "moved"; readonly run: ExpeditionRun }
  | { readonly ok: true; readonly kind: "blocked"; readonly reason: ExpeditionBlock; readonly run: ExpeditionRun }
  | { readonly ok: true; readonly kind: "battle"; readonly encounter: ExpeditionEncounter }
  | { readonly ok: false; readonly error: ExpeditionMarchError };

function withArmy(run: ExpeditionRun, index: ArmyIndex, army: ExpeditionArmy): ExpeditionRun {
  const armies: [ExpeditionArmy, ExpeditionArmy] = [run.armies[0], run.armies[1]];
  armies[index] = army;
  return { ...run, armies };
}

/** Hồi máu cả đạo; người gục cũng được chữa (đứng dậy với phần máu hồi). */
function healArmy(army: ExpeditionArmy, ratio: number, food: number): ExpeditionArmy {
  const fighters = Object.fromEntries(Object.entries(army.fighters).map(([id, f]) => [
    id,
    { ...f, hp: Math.min(f.config.maxHp, f.hp + Math.round(f.config.maxHp * ratio)) },
  ]));
  return { ...army, fighters, food: clampExpeditionFood(army.food + food) };
}

/** Thêm một dòng nhật ký (giữ vài dòng gần nhất). */
function logLine(run: ExpeditionRun, line: string): ExpeditionRun {
  return { ...run, log: [...(run.log ?? []), `Ngày ${run.day}: ${line}`].slice(-EXPEDITION_LOG_SIZE) };
}

export const EXPEDITION_ARMY_NAME: Readonly<Record<ArmyIndex, string>> = { 0: "Đạo Chính", 1: "Biệt đạo" };

/** Cuối ngày của sa bàn có kịch bản: thuyền viện tới thành đích, giặc phản công kho lương. */
function scenarioDayEnd(run: ExpeditionRun, scenario: ExpeditionScenario): ExpeditionRun {
  let next = run;
  const map = expeditionMapOf(run);
  const reinforcements = scenario.reinforcements;
  if (reinforcements && !next.reinforcementsCut && reinforcements.days.includes(next.day)) {
    // Thuyền viện cập bến: thành đích mạnh thêm, quân đang đánh dở được bổ sung đủ (cổng đã sụp thì vẫn sụp).
    const citadel = next.nodes[map.citadel];
    next = {
      ...next,
      arrivals: (next.arrivals ?? 0) + 1,
      nodes: { ...next.nodes, [map.citadel]: citadel?.gateDown ? { gateDown: true } : {} },
    };
    next = logLine(next, `${reinforcements.label} vào ${expeditionNode(map, map.citadel)!.name}, giặc mạnh thêm.`);
  }
  const market = next.market;
  const counter = scenario.counter;
  if (counter && market?.status === "pending" && next.day >= market.taken + counter.afterDays) {
    const name = expeditionNode(map, counter.node)!.name;
    if (next.armies.some((a) => a.at === counter.node && armyCanFight(a))) {
      next = logLine({ ...next, market: { ...market, status: "due" } }, `giặc phản công ${name}, phải giữ chợ.`);
    } else {
      next = {
        ...next,
        market: { ...market, status: "lost" },
        nodes: { ...next.nodes, [counter.node]: { foeHp: Array(FOE_COUNT.granary).fill(counter.retakenHp) } },
      };
      next = logLine(next, `không ai giữ, giặc chiếm lại ${name}.`);
    }
  }
  return next;
}

/** Một ngày trôi qua: đạo nghỉ hồi máu; quá hạn mà chưa thắng thì thua. */
function endDay(run: ExpeditionRun, resting: readonly ArmyIndex[]): ExpeditionRun {
  let next = run;
  for (const i of resting) next = withArmy(next, i, healArmy(next.armies[i], EXPEDITION_REST_HEAL, EXPEDITION_REST_FOOD));
  const scenario = expeditionScenarioOf(next);
  if (scenario) next = scenarioDayEnd(next, scenario);
  next = { ...next, day: next.day + 1 };
  if (next.phase === "march" && next.day > expeditionMapOf(next).days)
    return { ...next, phase: "lost", endReason: "timeout" };
  return next;
}

/** `days` ngày trôi qua (vượt nước mất 2 ngày); dừng ngay khi lượt đã thua vì hết ngày. */
function endDays(run: ExpeditionRun, resting: readonly ArmyIndex[], days: number): ExpeditionRun {
  let next = run;
  for (let d = 0; d < days && next.phase === "march"; d++) next = endDay(next, resting);
  return next;
}

function visitVillage(army: ExpeditionArmy): ExpeditionArmy {
  return healArmy(army, EXPEDITION_VILLAGE_HEAL, EXPEDITION_VILLAGE_FOOD);
}

/** Đạo vào ô `to` (đã đi hoặc đã thắng trận): ghé làng lần đầu, nhận và đưa đoàn dân, ghi ô đã chiếm. */
function arrive(run: ExpeditionRun, index: ArmyIndex, to: string): ExpeditionRun {
  const map = expeditionMapOf(run);
  const node = expeditionNode(map, to)!;
  let next = run;
  let army = { ...next.armies[index], at: to };
  if (node.kind === "village" && !next.nodes[to]?.cleared) {
    army = visitVillage(army);
    next = { ...next, nodes: { ...next.nodes, [to]: { cleared: true } } };
  }
  next = withArmy(next, index, army);
  const scenario = expeditionScenarioOf(next);
  if (!scenario) return next;
  const name = EXPEDITION_ARMY_NAME[index];
  const refugees = scenario.refugees;
  const noun = expeditionRefugeeNoun(scenario);
  if (refugees && to === refugees.village && next.refugees === undefined)
    next = logLine({ ...next, refugees: index }, `${name} nhận ${noun} ${node.name}.`);
  const home = to === refugees?.home || (to === scenario.counter?.node && next.market?.status === "held");
  if (refugees && next.refugees === index && home)
    next = scenario.tide
      ? logLine({ ...next, refugees: "saved", tideKnown: true }, `${name} đưa ${noun} về ${node.name}; dân chài báo lịch con nước.`)
      : logLine({ ...next, refugees: "saved" }, `${name} đưa ${noun} về ${node.name}.`);
  if (to === scenario.tide?.revealedBy && !next.tideKnown) next = { ...next, tideKnown: true };
  return next;
}

/** Ô có trận còn địch. */
const hasFight = (run: ExpeditionRun, id: string) => {
  const node = expeditionNode(expeditionMapOf(run), id);
  return !!node && isExpeditionCombatNode(node.kind) && run.nodes[id]?.cleared !== true;
};

/** Cửa nước qua được hôm nay. */
export function expeditionTideOpen(run: Pick<ExpeditionRun, "map" | "day">): boolean {
  return !!expeditionScenarioOf(run)?.tide?.days.includes(run.day);
}

/**
 * Đạo `army` tiến sang ô kề `to`. Ô đã chiếm hay làng: đi ngay và hết ngày. Ô có địch: trả về trận phải đánh
 * (server tạo trận rồi gọi `beginExpeditionBattle`). Sa bàn có kịch bản: chọn trúng đường bị phá hay cửa nước đang lên
 * mà chưa biết thì đứng yên mất ngày; đạo mang dân rời làng khi đồn chặn chưa chiếm thì gặp truy binh; giặc phản công
 * kho lương thì đạo đứng đó đánh bằng cách "tiến" vào chính ô mình (`to` là ô đang đứng).
 */
export function marchExpedition(run: ExpeditionRun, army: ArmyIndex, to: string): ExpeditionMarchResult {
  if (run.phase !== "march") return { ok: false, error: "notMarching" };
  if (army !== 0 && army !== 1) return { ok: false, error: "badArmy" };
  const a = run.armies[army];
  const map = expeditionMapOf(run);
  const scenario = expeditionScenarioOf(run);
  if (scenario?.counter && run.market?.status === "due") {
    const counterNode = scenario.counter.node;
    const holder = run.armies.findIndex((x) => x.at === counterNode);
    if (army !== holder || to !== a.at) return { ok: false, error: "counterPending" };
    if (!armyCanFight(a)) return { ok: false, error: "armyDown" };
    const encounter = expeditionCounterEncounter(run, army);
    return encounter ? { ok: true, kind: "battle", encounter } : { ok: false, error: "counterPending" };
  }
  if (!armyCanFight(a)) return { ok: false, error: "armyDown" };
  const node = expeditionNode(map, to);
  if (!node || !expeditionNeighbors(map, a.at).includes(to)) return { ok: false, error: "notAdjacent" };
  const other: ArmyIndex = army === 0 ? 1 : 0;
  if (scenario) {
    const key = expeditionEdgeKey(a.at, to);
    if (run.knownBroken?.includes(key)) return { ok: false, error: "roadBroken" };
    if (run.broken?.includes(key)) {
      const found = logLine({ ...run, knownBroken: [...(run.knownBroken ?? []), key] }, `${EXPEDITION_ARMY_NAME[army]} gặp đường bị phá, mất ngày.`);
      return { ok: true, kind: "blocked", reason: "broken", run: endDays(found, [other], 1) };
    }
    if (expeditionEdgeKind(map, a.at, to) === "tide" && !expeditionTideOpen(run)) {
      if (run.tideKnown) return { ok: false, error: "highTide" };
      const found = logLine({ ...run, tideKnown: true }, `${EXPEDITION_ARMY_NAME[army]} gặp nước lên ở cửa nước, mất ngày.`);
      return { ok: true, kind: "blocked", reason: "tide", run: endDays(found, [other], 1) };
    }
    const r = scenario.refugees;
    if (r && run.refugees === army && a.at === r.village && !run.nodes[r.chaseUnless]?.cleared && !hasFight(run, to)) {
      const encounter = expeditionChaseEncounter(run, army, to);
      if (encounter) return { ok: true, kind: "battle", encounter };
    }
  }
  if (hasFight(run, to)) {
    const encounter = expeditionEncounter(run, to, army);
    return encounter ? { ok: true, kind: "battle", encounter } : { ok: false, error: "notAdjacent" };
  }
  return { ok: true, kind: "moved", run: endDays(arrive(run, army, to), [other], expeditionEdgeDays(map, a.at, to)) };
}

export type ExpeditionScoutError = "notMarching" | "badArmy" | "counterPending";

/** Tầm trinh sát (số bước). */
export const EXPEDITION_SCOUT_SIGHT = 2;

/**
 * Trinh sát (mọi sa bàn): đạo `army` đứng yên một ngày, vén sương mọi ô trong 2 bước và lộ đường bị phá có
 * hai đầu trong vùng đó. Đạo trinh sát không được nghỉ hồi sức; đạo kia nghỉ như thường.
 */
export function scoutExpedition(run: ExpeditionRun, army: ArmyIndex): { ok: true; run: ExpeditionRun } | { ok: false; error: ExpeditionScoutError } {
  if (run.phase !== "march") return { ok: false, error: "notMarching" };
  if (army !== 0 && army !== 1) return { ok: false, error: "badArmy" };
  if (run.market?.status === "due") return { ok: false, error: "counterPending" };
  const map = expeditionMapOf(run);
  const at = run.armies[army].at;
  const area = map.nodes.filter((n) => expeditionHops(map, at, n.id) <= EXPEDITION_SCOUT_SIGHT).map((n) => n.id);
  const found = (run.broken ?? []).filter((k) => {
    const [x, y] = k.split("~");
    return area.includes(x!) && area.includes(y!) && !run.knownBroken?.includes(k);
  });
  let next: ExpeditionRun = {
    ...run,
    scouted: [...new Set([...(run.scouted ?? []), ...area])],
    ...(found.length || run.knownBroken ? { knownBroken: [...(run.knownBroken ?? []), ...found] } : {}),
  };
  next = logLine(
    next,
    `${EXPEDITION_ARMY_NAME[army]} trinh sát quanh ${expeditionNode(map, at)!.name}${found.length ? `, phát hiện ${found.length} đường bị phá` : ""}.`,
  );
  return { ok: true, run: endDays(next, [army === 0 ? 1 : 0], 1) };
}

/** Đóng quân: cả hai đạo nghỉ một ngày. */
export function campExpedition(
  run: ExpeditionRun,
): { ok: true; run: ExpeditionRun } | { ok: false; error: "notMarching" | "counterPending" } {
  if (run.phase !== "march") return { ok: false, error: "notMarching" };
  if (run.market?.status === "due") return { ok: false, error: "counterPending" };
  return { ok: true, run: endDay(run, [0, 1]) };
}

/** Phe người chơi của trận: 3 người của đạo, máu và lương mang theo. */
export function expeditionArmySide(run: ExpeditionRun, army: ArmyIndex): SideConfig {
  const a = run.armies[army];
  const fighters = a.ids.map((id) => structuredClone(a.fighters[id]!.config));
  const hpRatio = a.ids.map((id) => {
    const f = a.fighters[id]!;
    return Math.max(0, Math.min(1, f.hp / f.config.maxHp));
  });
  return { fighters, leader: firstAlive(hpRatio), food: a.food, hpRatio };
}

/** Thủ lĩnh trong trận là người còn đứng đầu tiên (người đầu đạo gục thì người kế cầm quân). */
const firstAlive = (hp: readonly number[]) => Math.max(0, hp.findIndex((x) => x > 0));

export function expeditionFoeSide(encounter: ExpeditionEncounter): SideConfig {
  // Thủ lĩnh là người còn đứng đầu tiên, không phải cổng thành.
  const leader = encounter.hpRatio.findIndex((x, i) => x > 0 && !encounter.foes[i]?.structure);
  return {
    fighters: encounter.foes.map((f) => structuredClone(f)),
    leader: leader >= 0 ? leader : firstAlive(encounter.hpRatio),
    hpRatio: [...encounter.hpRatio],
  };
}

/** Ghi trận đang đánh vào lượt viễn chinh. */
export function beginExpeditionBattle(run: ExpeditionRun, ref: ExpeditionBattleRef): ExpeditionRun {
  return { ...run, phase: "battle", battle: ref };
}

/** Thẻ trận gắn vào Match để chốt đúng lượt viễn chinh. */
export interface ExpeditionMatchTag {
  readonly runId: string;
  readonly map: ExpeditionMapId;
  readonly tier: ExpeditionTier;
  readonly node: string;
  readonly army: ArmyIndex;
  readonly day: number;
  /** Mục tiêu riêng của trận; lớp Match cho phe người chơi thắng khi đạt. */
  readonly objective?: ExpeditionObjective;
}

/** Ghi trận của một cuộc chạm trán vào lượt (dùng chung server và mô phỏng). */
export function expeditionBattleRef(army: ArmyIndex, encounter: ExpeditionEncounter, matchId: string): ExpeditionBattleRef {
  return {
    army,
    node: encounter.node,
    matchId,
    pincer: encounter.pincer,
    ...(encounter.mode ? { mode: encounter.mode } : {}),
    ...(encounter.to ? { to: encounter.to } : {}),
    ...(encounter.objective ? { objective: encounter.objective } : {}),
  };
}

export function expeditionMatchTag(run: ExpeditionRun, army: ArmyIndex, encounter: ExpeditionEncounter): ExpeditionMatchTag {
  return {
    runId: run.id,
    map: run.map,
    tier: run.tier,
    node: encounter.node,
    army,
    day: run.day,
    ...(encounter.objective ? { objective: encounter.objective } : {}),
  };
}

export type ExpeditionSettleError = "notInBattle" | "staleMatch" | "battleNotFinished" | "badTeam";

/**
 * Chốt kết quả trận vào lượt viễn chinh. Thắng: chiếm ô (kho lương thêm lương, thành đích là thắng viễn chinh).
 * Thua: đạo rút về ô cũ, cả ba người gục (phải nghỉ để hồi), địch giữ nguyên thương vong cho lần đánh sau.
 * Trận nào cũng tốn một ngày, đạo kia nghỉ. Trận riêng của kịch bản (truy binh, phản công, phá cổng) chốt theo loại.
 */
export function settleExpeditionBattle(
  run: ExpeditionRun,
  tag: ExpeditionMatchTag,
  battle: BattleState,
): { ok: true; run: ExpeditionRun; won: boolean } | { ok: false; error: ExpeditionSettleError } {
  if (run.phase !== "battle" || !run.battle) return { ok: false, error: "notInBattle" };
  if (run.id !== tag.runId || run.battle.node !== tag.node || run.battle.army !== tag.army || run.day !== tag.day)
    return { ok: false, error: "staleMatch" };
  if (battle.winner === null) return { ok: false, error: "battleNotFinished" };
  const index = tag.army;
  const army = run.armies[index];
  const side = battle.sides[0].fighters;
  if (side.length !== army.ids.length || side.some((f, i) => f.id !== army.ids[i])) return { ok: false, error: "badTeam" };
  const won = battle.winner === 0;
  const mode = run.battle.mode;
  const fighters = { ...army.fighters };
  for (const f of side) {
    const prev = army.fighters[f.id]!;
    const hp = f.hp <= 0 ? 0 : Math.max(1, Math.min(prev.config.maxHp, Math.round(prev.config.maxHp * f.hp / Math.max(1, f.maxHp))));
    fighters[f.id] = { ...prev, hp: won ? hp : 0 };
  }
  const nodeId = tag.node;
  const map = expeditionMapOf(run);
  const node = expeditionNode(map, nodeId)!;
  const scenario = expeditionScenarioOf(run);
  const name = EXPEDITION_ARMY_NAME[index];
  const foeHp = battle.sides[1].fighters.map((f) => Math.max(0, Math.min(1, f.hp / Math.max(1, f.maxHp))));
  const to = mode === "chase" ? run.battle.to ?? army.at : nodeId;
  // Vượt nước để đánh thì mất 2 ngày dù thắng hay thua; trận tại chỗ (phản công, phá cổng) một ngày.
  const edgeDays = expeditionEdgeDays(map, army.at, to);
  const days = mode === "counter" || mode === "gate" || !Number.isFinite(edgeDays) ? 1 : edgeDays;
  let next: ExpeditionRun = withArmy(run, index, { ...army, fighters, food: clampExpeditionFood(battle.sides[0].food) });
  next = { ...next, phase: "march", battle: null };
  if (!won) next = { ...next, defeats: (next.defeats ?? 0) + 1 };
  // Thua khi đang mang dân: đoàn dân bị bắt.
  if (!won && next.refugees === index)
    next = logLine({ ...next, refugees: "lost" }, `${name} thua trận, ${expeditionRefugeeNoun(expeditionScenarioOf(next))} bị bắt lại.`);

  if (mode === "chase") {
    if (won) next = logLine(arrive(next, index, to), `${name} đánh lui truy binh.`);
  } else if (mode === "counter") {
    const market = next.market ?? { taken: next.day, status: "due" as const };
    if (won) {
      next = { ...next, market: { ...market, status: "held" } };
      for (const i of [0, 1] as const) {
        const a = next.armies[i];
        next = withArmy(next, i, { ...a, food: clampExpeditionFood(a.food + (scenario?.counter?.food ?? 0)) });
      }
      next = logLine(next, `${name} giữ được ${node.name}.`);
      // Đạo đang hộ tống đứng ngay ở kho vừa giữ: kho thành chỗ đưa người về.
      if (next.refugees === index && scenario?.refugees)
        next = logLine(
          { ...next, refugees: "saved", ...(scenario.tide ? { tideKnown: true } : {}) },
          `${name} đưa ${expeditionRefugeeNoun(scenario)} vào ${node.name}.`,
        );
    } else {
      // Rút về ô kề đã an toàn đầu tiên (luôn có: ô vừa đi qua để tới chợ).
      const back = expeditionNeighbors(map, nodeId).find((n) => !hasFight(next, n)) ?? army.at;
      next = withArmy(next, index, { ...next.armies[index], at: back });
      next = {
        ...next,
        market: { ...market, status: "lost" },
        nodes: { ...next.nodes, [nodeId]: { foeHp: Array(FOE_COUNT.granary).fill(scenario?.counter?.retakenHp ?? 1) } },
      };
      next = logLine(next, `${name} không giữ được ${node.name}, rút về ${expeditionNode(map, back)!.name}.`);
    }
  } else if (mode === "gate") {
    if (won) {
      // Cổng sụp: lính giữ còn lại mang máu sang trận đánh tướng giữ thành.
      next = { ...next, nodes: { ...next.nodes, [nodeId]: { gateDown: true, foeHp: [1, ...foeHp.slice(1)] } } };
      next = logLine(next, `${name} phá được cổng ${node.name}.`);
    } else next = { ...next, nodes: { ...next.nodes, [nodeId]: { foeHp } } };
  } else if (won) {
    next = withArmy(next, index, { ...next.armies[index], at: nodeId });
    next = { ...next, nodes: { ...next.nodes, [nodeId]: { cleared: true } } };
    if (node.kind === "granary" && !(nodeId === scenario?.counter?.node && next.market))
      for (const i of [0, 1] as const) {
        const a = next.armies[i];
        next = withArmy(next, i, { ...a, food: clampExpeditionFood(a.food + EXPEDITION_GRANARY_FOOD) });
      }
    if (scenario) {
      if (nodeId === scenario.counter?.node && !next.market) next = { ...next, market: { taken: next.day, status: "pending" } };
      if (scenario.hold?.nodes.includes(nodeId) && scenario.reinforcements && !next.reinforcementsCut)
        next = logLine({ ...next, reinforcementsCut: true }, `${name} giữ được ${node.name}, ${scenario.reinforcements.label} bị chặn.`);
      next = arrive(next, index, nodeId);
    }
  } else next = { ...next, nodes: { ...next.nodes, [nodeId]: { ...(node.kind === "citadel" && run.nodes[nodeId]?.gateDown ? { gateDown: true } : {}), foeHp } } };
  if (won && node.kind === "citadel" && mode !== "gate") return { ok: true, won, run: { ...next, phase: "won", day: next.day } };
  return { ok: true, won, run: endDays(next, [index === 0 ? 1 : 0], days) };
}

// ——— Sương mù ———

/**
 * Các ô đang thấy được: vị trí hai đạo và ô kề (ô đi được), ô đã chiếm hay đã đánh, và mọi ô trong tầm chòi canh đã
 * chiếm. Thành đích ngoài tầm nhìn chỉ hiện là đích đến, không báo trước địch. Luật: GDD Viễn Chinh mục 3.8.
 */
export function expeditionVisible(run: Pick<ExpeditionRun, "map" | "armies" | "nodes" | "scouted">): Set<string> {
  const map = expeditionMapOf(run);
  const seen = new Set<string>([...map.camps, ...(run.scouted ?? [])]);
  for (const a of run.armies) {
    seen.add(a.at);
    for (const n of expeditionNeighbors(map, a.at)) seen.add(n);
  }
  for (const [id, state] of Object.entries(run.nodes)) {
    if (!state.cleared && !state.foeHp) continue;
    seen.add(id);
    if (state.cleared && expeditionNode(map, id)?.kind === "watchtower")
      for (const n of map.nodes)
        if (expeditionHops(map, id, n.id) <= EXPEDITION_WATCHTOWER_SIGHT) seen.add(n.id);
  }
  return seen;
}

/** Rút khỏi viễn chinh (không có trận đang đánh). */
export function abandonExpedition(run: ExpeditionRun): ExpeditionRun {
  return { ...run, phase: "lost", endReason: "abandoned", battle: null };
}

// ——— Kết thúc và thưởng ———

/**
 * Kết thúc của sa bàn có kịch bản: chiếm thành đích (toàn thắng khi đã cắt viện và đưa dân về), hoặc chưa chiếm nhưng
 * đã cắt viện và đưa dân về (giữ dân). Sa bàn không kịch bản hay chưa kết thúc: undefined.
 */
export function expeditionEnding(run: ExpeditionRun): ExpeditionEnding | undefined {
  if (!expeditionScenarioOf(run)?.endingGold) return undefined;
  const side = run.refugees === "saved" && run.reinforcementsCut === true;
  if (run.phase === "won") return side ? "full" : "taken";
  if (run.phase === "lost" && side) return "refuge";
  return undefined;
}

/** Hệ số sức mạnh địch riêng của sa bàn ở bậc của lượt (khối `foePower`; không có là 1). */
export function expeditionFoePower(run: Pick<ExpeditionRun, "map" | "tier">): number {
  const f = expeditionScenarioOf(run)?.foePower;
  return f === undefined ? 1 : typeof f === "number" ? f : f[run.tier - 1]!;
}

/** Người được hộ tống trên sa bàn (đoàn dân, tù binh). */
export const expeditionRefugeeNoun = (scenario: ExpeditionScenario | undefined) => scenario?.refugees?.noun ?? "đoàn dân";

/**
 * Nhiệm vụ của sa bàn đã xong chưa: đã đưa người về (nếu có khối rút dân) và đã chặn viện binh (nếu có khối viện
 * binh). Sa bàn không có nhiệm vụ nào: undefined.
 */
export function expeditionMissionDone(run: ExpeditionRun): boolean | undefined {
  const scenario = expeditionScenarioOf(run);
  if (!scenario?.refugees && !scenario?.reinforcements) return undefined;
  return (!scenario.refugees || run.refugees === "saved") && (!scenario.reinforcements || run.reinforcementsCut === true);
}

/**
 * Sao: thắng; xong trong số ngày chuẩn; không thua trận nào. Sa bàn có kịch bản: toàn thắng 3 sao, chiếm trại 2 sao
 * (1 nếu quá ngày chuẩn), giữ dân 1 sao.
 */
export function expeditionStars(run: ExpeditionRun): number {
  const ending = expeditionEnding(run);
  if (ending === "full") return 3;
  if (ending === "refuge") return 1;
  if (ending === "taken") return run.day <= expeditionMapOf(run).parDays ? 2 : 1;
  if (run.phase !== "won") return 0;
  let stars = 1;
  if (run.day <= expeditionMapOf(run).parDays) stars++;
  if ((run.defeats ?? 0) === 0) stars++;
  return stars;
}

export function expeditionRewardItem(rng: Rng, run: ExpeditionRun, tierBonus = 0): GearItem {
  const map = expeditionMapOf(run);
  const slot = GEAR_SLOTS[rng.int(0, GEAR_SLOTS.length - 1)]!;
  const item: GearItem = {
    id: "",
    slot,
    element: map.element,
    tier: Math.min(5, EXPEDITION_TIER_INFO[run.tier].gearTier + tierBonus) as Tier,
    set: GEAR_SETS[rng.int(0, GEAR_SETS.length - 1)]!.id,
  };
  const leader = run.armies[0].fighters[MAIN_ID]?.config.profession;
  return slot === "vuKhi" && leader ? { ...item, profession: leader } : item;
}

/**
 * Cộng thưởng khi lượt viễn chinh kết thúc (thắng hoặc thua), đúng một lần. Thắng lần đầu bậc này: vàng lớn và một
 * món theo hệ chiến địa; thắng lại: vàng nhỏ. Thua: không thưởng thêm (vàng, kinh nghiệm từng trận đã nhận).
 */
export function applyExpeditionEnd(
  profile: Profile,
  state: ExpeditionState,
  rng: Rng,
): { profile: Profile; state: ExpeditionState } {
  const run = state.run;
  if (!run || run.rewarded || (run.phase !== "won" && run.phase !== "lost")) return { profile, state };
  const won = run.phase === "won";
  const stars = expeditionStars(run);
  const ending = expeditionEnding(run);
  const scenario = expeditionScenarioOf(run);
  if (!won && ending !== "refuge") {
    const result: ExpeditionResult = { won, days: run.day, stars: 0, firstClear: false, gold: 0, item: null, soldFor: 0 };
    return { profile, state: { ...state, run: { ...run, rewarded: true, result } } };
  }
  const info = EXPEDITION_TIER_INFO[run.tier];
  const key = `${run.map}:${run.tier}`;
  // Giữ dân (thắng phụ) chỉ có vàng thắng lại × hệ số: không tính qua bậc, không mở bậc sau, không có món, để không
  // lách được thành đích bằng cách làm xong nhiệm vụ rồi rút quân (Shan chốt 05/11/2026).
  const firstClear = won && (state.cleared[run.map] ?? 0) < run.tier;
  // Sa bàn thường: thắng mà xong nhiệm vụ thì vàng nhân missionGold.
  const mission = won && !scenario?.endingGold && !!scenario?.missionGold && expeditionMissionDone(run) === true;
  const mult = ending && scenario?.endingGold ? scenario.endingGold[ending] : mission ? scenario!.missionGold! : 1;
  const gold = Math.round((firstClear ? info.firstGold : info.repeatGold) * mult);
  let next: Profile = { ...profile, gold: profile.gold + gold };
  let item: GearItem | null = null;
  let soldFor = 0;
  if (firstClear && won) {
    const received = receiveDrop(next, expeditionRewardItem(rng, run));
    next = received.profile;
    item = received.item;
    soldFor = received.soldFor;
  }
  // Toàn thắng lần đầu ở bậc này: thêm một món phẩm cao hơn một nấc.
  let bonusItem: GearItem | null = null;
  if (ending === "full" && (state.stars[key] ?? 0) < 3) {
    const received = receiveDrop(next, expeditionRewardItem(rng, run, 1));
    next = received.profile;
    bonusItem = received.item;
    soldFor += received.soldFor;
  }
  const result: ExpeditionResult = {
    won,
    ...(ending ? { ending } : {}),
    ...(mission ? { mission: true } : {}),
    days: run.day,
    stars,
    firstClear,
    gold,
    item,
    ...(bonusItem ? { bonusItem } : {}),
    soldFor,
  };
  return {
    profile: next,
    state: {
      ...state,
      ...(won ? { bestDays: { ...state.bestDays, [key]: Math.min(state.bestDays?.[key] ?? Infinity, run.day) } } : {}),
      ...(won ? { cleared: { ...state.cleared, [run.map]: Math.max(state.cleared[run.map] ?? 0, run.tier) } } : {}),
      stars: { ...state.stars, [key]: Math.max(state.stars[key] ?? 0, stars) },
      run: { ...run, rewarded: true, result },
    },
  };
}

/** Tên kết thúc để hiển thị. */
export const expeditionEndingName = (ending: ExpeditionEnding) => EXPEDITION_ENDING_NAME[ending];

// ——— Giới hạn mỗi ngày (Shan chốt 04/11/2026: giới hạn như các chế độ khác) ———

/** Số lượt xuất quân mỗi ngày (giờ Việt Nam). Hết lượt thì chờ ngày mai; lượt đang đi dở vẫn đi tiếp được. */
export const EXPEDITION_RUNS_PER_DAY = 3;

/** Số lượt xuất quân còn lại trong ngày `day` (khóa `vnDay`). */
export function expeditionRunsLeft(state: ExpeditionState, day: string): number {
  return Math.max(0, EXPEDITION_RUNS_PER_DAY - (state.daily?.day === day ? state.daily.runs : 0));
}

/** Ghi thêm một lượt xuất quân hôm nay; null khi đã hết lượt. */
export function countExpeditionRun(state: ExpeditionState, day: string): ExpeditionState | null {
  if (expeditionRunsLeft(state, day) <= 0) return null;
  const runs = state.daily?.day === day ? state.daily.runs + 1 : 1;
  return { ...state, daily: { day, runs } };
}
