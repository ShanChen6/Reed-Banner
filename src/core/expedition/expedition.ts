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
  expeditionNeighbors,
  expeditionNode,
  isExpeditionCombatNode,
  isExpeditionMapId,
  type ExpeditionMap,
  type ExpeditionMapId,
  type ExpeditionNode,
  type ExpeditionNodeKind,
} from "./maps";
import {
  EXPEDITION_ARMY_SIZE,
  clampExpeditionFood,
  isExpeditionTier,
  type ArmyIndex,
  type ExpeditionArmy,
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
  granary: "easy",
  fort: "normal",
  citadel: "hard",
};
const FOE_COUNT: Readonly<Record<ExpeditionNodeKind, number>> = {
  camp: 0,
  village: 0,
  outpost: 2,
  granary: 2,
  fort: 3,
  citadel: 3,
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
}

/**
 * Đối thủ của một ô có trận nếu đạo `army` đánh vào hôm nay. Danh sách địch chỉ phụ thuộc seed và ô; cấp theo độ
 * sâu, sức mạnh theo ngày, máu giảm khi giáp công.
 */
export function expeditionEncounter(run: ExpeditionRun, nodeId: string, army: ArmyIndex): ExpeditionEncounter | null {
  const map = expeditionMapOf(run);
  const node = expeditionNode(map, nodeId);
  if (!node || !isExpeditionCombatNode(node.kind)) return null;
  const rng = createRng((run.seed ^ hash(`${run.map}|${nodeId}`)) >>> 0);
  const level = expeditionFoeLevel(node, run.tier);
  const power = expeditionPower(run.tier, run.day);
  const pincer = expeditionPincer(run, nodeId, army);
  const hpScale = power * EXPEDITION_FOE_HP * (pincer ? EXPEDITION_PINCER_HP : 1);
  const foes = pickFoes(rng, map.element, FOE_COUNT[node.kind]).map((base, i) => {
    const f = leveledFoe(base, level);
    const boss = node.kind === "citadel" && i === 0;
    return {
      ...f,
      maxHp: Math.max(1, Math.round(f.maxHp * hpScale * (boss ? BOSS_HP : 1))),
      atk: Math.max(1, Math.round(f.atk * power)),
    };
  });
  const saved = run.nodes[nodeId]?.foeHp;
  const hpRatio = foes.map((_, i) => Math.max(0, Math.min(1, saved?.[i] ?? 1)));
  return {
    node: nodeId,
    kind: node.kind,
    level,
    difficulty: expeditionDifficulty(node.kind, run.tier),
    power,
    pincer,
    foes,
    hpRatio,
    weights: HOME_TERRAIN[map.element],
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
    },
  };
}

// ——— Hành quân ———

export type ExpeditionMarchError = "notMarching" | "badArmy" | "notAdjacent" | "armyDown";

export type ExpeditionMarchResult =
  | { readonly ok: true; readonly kind: "moved"; readonly run: ExpeditionRun }
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

/** Một ngày trôi qua: đạo nghỉ hồi máu; quá hạn mà chưa thắng thì thua. */
function endDay(run: ExpeditionRun, resting: readonly ArmyIndex[]): ExpeditionRun {
  let next = run;
  for (const i of resting) next = withArmy(next, i, healArmy(next.armies[i], EXPEDITION_REST_HEAL, EXPEDITION_REST_FOOD));
  next = { ...next, day: next.day + 1 };
  if (next.phase === "march" && next.day > expeditionMapOf(next).days)
    return { ...next, phase: "lost", endReason: "timeout" };
  return next;
}

function visitVillage(army: ExpeditionArmy): ExpeditionArmy {
  return healArmy(army, EXPEDITION_VILLAGE_HEAL, EXPEDITION_VILLAGE_FOOD);
}

/**
 * Đạo `army` tiến sang ô kề `to`. Ô đã chiếm hay làng: đi ngay và hết ngày. Ô có địch: trả về trận phải đánh
 * (server tạo trận rồi gọi `beginExpeditionBattle`).
 */
export function marchExpedition(run: ExpeditionRun, army: ArmyIndex, to: string): ExpeditionMarchResult {
  if (run.phase !== "march") return { ok: false, error: "notMarching" };
  if (army !== 0 && army !== 1) return { ok: false, error: "badArmy" };
  const a = run.armies[army];
  if (!armyCanFight(a)) return { ok: false, error: "armyDown" };
  const map = expeditionMapOf(run);
  const node = expeditionNode(map, to);
  if (!node || !expeditionNeighbors(map, a.at).includes(to)) return { ok: false, error: "notAdjacent" };
  const cleared = run.nodes[to]?.cleared === true;
  if (!cleared && isExpeditionCombatNode(node.kind)) {
    const encounter = expeditionEncounter(run, to, army);
    return encounter ? { ok: true, kind: "battle", encounter } : { ok: false, error: "notAdjacent" };
  }
  let moved = { ...a, at: to };
  let next = run;
  if (node.kind === "village" && !cleared) {
    moved = visitVillage(moved);
    next = { ...next, nodes: { ...next.nodes, [to]: { cleared: true } } };
  }
  next = withArmy(next, army, moved);
  return { ok: true, kind: "moved", run: endDay(next, [army === 0 ? 1 : 0]) };
}

/** Đóng quân: cả hai đạo nghỉ một ngày. */
export function campExpedition(run: ExpeditionRun): { ok: true; run: ExpeditionRun } | { ok: false; error: "notMarching" } {
  if (run.phase !== "march") return { ok: false, error: "notMarching" };
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
  return {
    fighters: encounter.foes.map((f) => structuredClone(f)),
    leader: firstAlive(encounter.hpRatio),
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
}

export type ExpeditionSettleError = "notInBattle" | "staleMatch" | "battleNotFinished" | "badTeam";

/**
 * Chốt kết quả trận vào lượt viễn chinh. Thắng: chiếm ô (kho lương thêm lương, thành đích là thắng viễn chinh).
 * Thua: đạo rút về ô cũ, cả ba người gục (phải nghỉ để hồi), địch giữ nguyên thương vong cho lần đánh sau.
 * Trận nào cũng tốn một ngày, đạo kia nghỉ.
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
  const fighters = { ...army.fighters };
  for (const f of side) {
    const prev = army.fighters[f.id]!;
    const hp = f.hp <= 0 ? 0 : Math.max(1, Math.min(prev.config.maxHp, Math.round(prev.config.maxHp * f.hp / Math.max(1, f.maxHp))));
    fighters[f.id] = { ...prev, hp: won ? hp : 0 };
  }
  const nodeId = tag.node;
  const node = expeditionNode(expeditionMapOf(run), nodeId)!;
  let next: ExpeditionRun = withArmy(run, index, {
    ...army,
    fighters,
    food: clampExpeditionFood(battle.sides[0].food),
    at: won ? nodeId : army.at,
  });
  if (won) {
    next = { ...next, nodes: { ...next.nodes, [nodeId]: { cleared: true } } };
    if (node.kind === "granary")
      for (const i of [0, 1] as const) {
        const a = next.armies[i];
        next = withArmy(next, i, { ...a, food: clampExpeditionFood(a.food + EXPEDITION_GRANARY_FOOD) });
      }
  } else {
    const foeHp = battle.sides[1].fighters.map((f) => Math.max(0, Math.min(1, f.hp / Math.max(1, f.maxHp))));
    next = { ...next, defeats: (next.defeats ?? 0) + 1, nodes: { ...next.nodes, [nodeId]: { foeHp } } };
  }
  next = { ...next, phase: "march", battle: null };
  if (won && node.kind === "citadel") return { ok: true, won, run: { ...next, phase: "won", day: next.day } };
  return { ok: true, won, run: endDay(next, [index === 0 ? 1 : 0]) };
}

/** Rút khỏi viễn chinh (không có trận đang đánh). */
export function abandonExpedition(run: ExpeditionRun): ExpeditionRun {
  return { ...run, phase: "lost", endReason: "abandoned", battle: null };
}

// ——— Kết thúc và thưởng ———

/** Sao: thắng; xong trong số ngày chuẩn; không thua trận nào. */
export function expeditionStars(run: ExpeditionRun): number {
  if (run.phase !== "won") return 0;
  let stars = 1;
  if (run.day <= expeditionMapOf(run).parDays) stars++;
  if ((run.defeats ?? 0) === 0) stars++;
  return stars;
}

export function expeditionRewardItem(rng: Rng, run: ExpeditionRun): GearItem {
  const map = expeditionMapOf(run);
  const slot = GEAR_SLOTS[rng.int(0, GEAR_SLOTS.length - 1)]!;
  const item: GearItem = {
    id: "",
    slot,
    element: map.element,
    tier: EXPEDITION_TIER_INFO[run.tier].gearTier,
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
  if (!won) {
    const result: ExpeditionResult = { won, days: run.day, stars: 0, firstClear: false, gold: 0, item: null, soldFor: 0 };
    return { profile, state: { ...state, run: { ...run, rewarded: true, result } } };
  }
  const info = EXPEDITION_TIER_INFO[run.tier];
  const firstClear = (state.cleared[run.map] ?? 0) < run.tier;
  const gold = firstClear ? info.firstGold : info.repeatGold;
  let next: Profile = { ...profile, gold: profile.gold + gold };
  let item: GearItem | null = null;
  let soldFor = 0;
  if (firstClear) {
    const received = receiveDrop(next, expeditionRewardItem(rng, run));
    next = received.profile;
    item = received.item;
    soldFor = received.soldFor;
  }
  const key = `${run.map}:${run.tier}`;
  const result: ExpeditionResult = { won, days: run.day, stars, firstClear, gold, item, soldFor };
  return {
    profile: next,
    state: {
      ...state,
      bestDays: { ...state.bestDays, [key]: Math.min(state.bestDays?.[key] ?? Infinity, run.day) },
      cleared: { ...state.cleared, [run.map]: Math.max(state.cleared[run.map] ?? 0, run.tier) },
      stars: { ...state.stars, [key]: Math.max(state.stars[key] ?? 0, stars) },
      run: { ...run, rewarded: true, result },
    },
  };
}

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
