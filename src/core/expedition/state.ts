// Viễn Chinh: kiểu trạng thái lưu trong hồ sơ và bộ đọc. Không import module nặng (progress, campaign) để hồ sơ
// đọc được mà không tạo vòng import.

import type { FighterConfig } from "../battle";
import type { GearItem } from "../gear";
import { EXPEDITION_MAPS, expeditionNode, isExpeditionMapId, type ExpeditionMap, type ExpeditionMapId } from "./maps";

const MAIN = "dinhBoLinh";
export const EXPEDITION_ARMY_SIZE = 3;
export const EXPEDITION_FOOD_MIN = 20;
export const EXPEDITION_FOOD_MAX = 100;

export const clampExpeditionFood = (food: number) =>
  Math.max(EXPEDITION_FOOD_MIN, Math.min(EXPEDITION_FOOD_MAX, Math.round(food)));

export type ExpeditionTier = 1 | 2 | 3;
export const EXPEDITION_TIERS: readonly ExpeditionTier[] = [1, 2, 3];
export const isExpeditionTier = (x: unknown): x is ExpeditionTier => x === 1 || x === 2 || x === 3;

// ——— Trạng thái ———

export type ArmyIndex = 0 | 1;

export interface ExpeditionFighter {
  /** Chỉ số chụp lúc xuất quân (đã gồm trang bị); không đọc lại hồ sơ trong lúc viễn chinh. */
  readonly config: FighterConfig;
  /** Máu hiện tại (0 là gục). */
  readonly hp: number;
}

export interface ExpeditionArmy {
  /** Đúng 3 id; đạo Chính có Đinh Bộ Lĩnh ở vị trí đầu. Người đầu là thống lĩnh. */
  readonly ids: readonly string[];
  readonly at: string;
  readonly food: number;
  readonly fighters: Readonly<Record<string, ExpeditionFighter>>;
}

export interface ExpeditionNodeState {
  /** Đã chiếm (ô có trận) hoặc đã ghé (làng). */
  readonly cleared?: boolean;
  /** Đánh dở: máu còn lại của từng địch theo tỉ lệ (0 là đã gục); lần đánh sau vào trận với máu này. */
  readonly foeHp?: readonly number[];
}

export type ExpeditionPhase = "march" | "battle" | "won" | "lost";

export interface ExpeditionBattleRef {
  readonly army: ArmyIndex;
  readonly node: string;
  readonly matchId: string;
  readonly pincer: boolean;
}

export interface ExpeditionRun {
  readonly version: 1;
  readonly id: string;
  readonly map: ExpeditionMapId;
  readonly tier: ExpeditionTier;
  /** Seed sinh đối thủ của từng ô; đối thủ vốn được báo trước nên không cần giấu. */
  readonly seed: number;
  /** Ngày hiện tại, bắt đầu từ 1. Mỗi hành động (tiến quân, đóng quân) tốn một ngày. */
  readonly day: number;
  readonly armies: readonly [ExpeditionArmy, ExpeditionArmy];
  readonly nodes: Readonly<Record<string, ExpeditionNodeState>>;
  readonly phase: ExpeditionPhase;
  readonly battle: ExpeditionBattleRef | null;
  /** Lý do kết thúc khi `phase` là "lost". */
  readonly endReason?: "timeout" | "abandoned";
  /** Số trận đã thua trong lượt này (sao thứ ba cần 0). */
  readonly defeats?: number;
  /** Thưởng kết thúc đã cộng (chống cộng hai lần). */
  readonly rewarded: boolean;
  /** Thưởng đã cộng, để màn kết thúc hiển thị lại. */
  readonly result?: ExpeditionResult;
}

export interface ExpeditionResult {
  readonly won: boolean;
  readonly days: number;
  readonly stars: number;
  readonly firstClear: boolean;
  readonly gold: number;
  readonly item: GearItem | null;
  readonly soldFor: number;
}

export interface ExpeditionState {
  /** Bậc cao nhất đã thắng của từng sa bàn (0 là chưa). */
  readonly cleared: Readonly<Partial<Record<ExpeditionMapId, number>>>;
  /** Sao tốt nhất theo `${map}:${tier}`: số 0–3. */
  readonly stars: Readonly<Record<string, number>>;
  readonly run: ExpeditionRun | null;
}

export const NEW_EXPEDITION: ExpeditionState = { cleared: {}, stars: {}, run: null };

// ——— Đọc từ hồ sơ đã lưu ———

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const finite = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

function parseArmy(raw: unknown, map: ExpeditionMap): ExpeditionArmy | null {
  if (!isObj(raw) || !Array.isArray(raw.ids) || raw.ids.length !== EXPEDITION_ARMY_SIZE) return null;
  if (typeof raw.at !== "string" || !expeditionNode(map, raw.at) || !finite(raw.food) || !isObj(raw.fighters)) return null;
  const fighters: Record<string, ExpeditionFighter> = {};
  for (const id of raw.ids) {
    if (typeof id !== "string") return null;
    const f = raw.fighters[id];
    if (!isObj(f) || !isObj(f.config) || !finite(f.hp) || !finite((f.config as { maxHp?: unknown }).maxHp)) return null;
    const config = f.config as unknown as FighterConfig;
    if (config.id !== id) return null;
    fighters[id] = { config, hp: Math.max(0, Math.min(config.maxHp, Math.round(f.hp))) };
  }
  return { ids: [...raw.ids] as string[], at: raw.at, food: clampExpeditionFood(raw.food), fighters };
}

function parseRun(raw: unknown): ExpeditionRun | null {
  if (!isObj(raw) || raw.version !== 1 || typeof raw.id !== "string" || !isExpeditionMapId(raw.map) || !isExpeditionTier(raw.tier))
    return null;
  const map = EXPEDITION_MAPS[raw.map];
  if (!Number.isInteger(raw.seed) || !Number.isInteger(raw.day) || (raw.day as number) < 1) return null;
  if (!Array.isArray(raw.armies) || raw.armies.length !== 2) return null;
  const a0 = parseArmy(raw.armies[0], map);
  const a1 = parseArmy(raw.armies[1], map);
  if (!a0 || !a1 || a0.ids[0] !== MAIN) return null;
  const phases: readonly ExpeditionPhase[] = ["march", "battle", "won", "lost"];
  if (!phases.includes(raw.phase as ExpeditionPhase)) return null;
  const nodes: Record<string, ExpeditionNodeState> = {};
  if (isObj(raw.nodes))
    for (const [id, n] of Object.entries(raw.nodes)) {
      if (!expeditionNode(map, id) || !isObj(n)) continue;
      nodes[id] = {
        ...(n.cleared === true ? { cleared: true } : {}),
        ...(Array.isArray(n.foeHp) && n.foeHp.every(finite) ? { foeHp: (n.foeHp as number[]).map((x) => Math.max(0, Math.min(1, x))) } : {}),
      };
    }
  let battle: ExpeditionBattleRef | null = null;
  if (isObj(raw.battle)) {
    const b = raw.battle;
    if ((b.army === 0 || b.army === 1) && typeof b.node === "string" && typeof b.matchId === "string")
      battle = { army: b.army, node: b.node, matchId: b.matchId, pincer: b.pincer === true };
  }
  const phase = raw.phase as ExpeditionPhase;
  if (phase === "battle" && !battle) return null;
  const reasons = ["timeout", "abandoned"] as const;
  return {
    version: 1,
    id: raw.id,
    map: raw.map,
    tier: raw.tier,
    seed: (raw.seed as number) >>> 0,
    day: raw.day as number,
    armies: [a0, a1],
    nodes,
    phase,
    battle,
    ...(reasons.includes(raw.endReason as (typeof reasons)[number]) ? { endReason: raw.endReason as (typeof reasons)[number] } : {}),
    ...(Number.isInteger(raw.defeats) && (raw.defeats as number) > 0 ? { defeats: raw.defeats as number } : {}),
    rewarded: raw.rewarded === true,
    ...(isObj(raw.result) ? { result: raw.result as unknown as ExpeditionResult } : {}),
  };
}

/** Đọc trạng thái Viễn Chinh đã lưu; null khi chưa vào chế độ lần nào hoặc dữ liệu hỏng hẳn. */
export function parseExpedition(raw: unknown): ExpeditionState | null {
  if (!isObj(raw)) return null;
  const cleared: Partial<Record<ExpeditionMapId, number>> = {};
  if (isObj(raw.cleared))
    for (const [k, v] of Object.entries(raw.cleared))
      if (isExpeditionMapId(k) && Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 3) cleared[k] = v as number;
  const stars: Record<string, number> = {};
  if (isObj(raw.stars))
    for (const [k, v] of Object.entries(raw.stars)) {
      const [m, t] = k.split(":");
      if (isExpeditionMapId(m) && isExpeditionTier(Number(t)) && Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 3)
        stars[k] = v as number;
    }
  return { cleared, stars, run: parseRun(raw.run) };
}
