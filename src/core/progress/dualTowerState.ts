// Song Tháp (Trial / Destiny) lưu trong hồ sơ, tách hẳn khỏi Legacy `profile.tower` (best/run).
// Chỉ định danh và parse/serialize; luật tầng, thưởng và UI nằm ở task sau.
// Xem docs/dual-tower/00-03-migration-plan.md.

import { ELEMENTS, ENERGY_MAX, PROFESSIONS, type FighterConfig } from "../battle";
import { GEAR_SLOTS, TIERS, type GearItem } from "../gear";
import type { CharacterProgress } from "./progress";

export const TOWER_MODES = ["legacy", "trial", "destiny"] as const;
export type TowerMode = (typeof TOWER_MODES)[number];
export const DEFAULT_TOWER_MODE: TowerMode = "legacy";

/** Mode lạ/thiếu → null (để nơi gọi từ chối). */
export function parseTowerMode(raw: unknown): TowerMode | null {
  return (TOWER_MODES as readonly unknown[]).includes(raw)
    ? (raw as TowerMode)
    : null;
}

/** Mode lạ/thiếu → Legacy, giữ hành vi cũ của các request không mang mode. */
export const towerModeOrLegacy = (raw: unknown): TowerMode =>
  parseTowerMode(raw) ?? DEFAULT_TOWER_MODE;

export const TRIAL_FLOORS = 20;
/** Giới hạn thử nghiệm của roster khóa trong một run Destiny. */
export const DESTINY_ROSTER_MAX = 8;
export const DUAL_TOWER_SCHEMA = 1;
/** Trần an toàn của đá tài khoản. */
export const STONES_MAX = Number.MAX_SAFE_INTEGER;

/** Ngày theo giờ Việt Nam, dạng YYYY-MM-DD. */
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const validDay = (x: unknown): x is string => {
  if (typeof x !== "string" || !DAY_RE.test(x)) return false;
  const d = new Date(`${x}T00:00:00.000Z`);
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === x;
};

/** Trận Trial đang mở của người chơi; chỉ để tìm lại trận sau khi tải lại và chặn mở hai trận. */
export interface TrialActive {
  readonly matchId: string;
  readonly floor: number;
}

/** Kỷ lục vĩnh viễn của một tầng Trial: số lần thắng và số lượt ít nhất (nhỏ hơn là tốt hơn). */
export interface TrialFloorRecord {
  readonly floor: number;
  readonly clears: number;
  readonly bestTurns: number;
}

export type TrialSweepTier = 1 | 2 | 3 | 4;

/** Receipt authoritative của lần quét gần nhất; tier được chụp từ `cleared` tại lúc claim. */
export interface TrialSweepClaim {
  readonly dateKey: string;
  readonly tier: TrialSweepTier;
  /** Epoch milliseconds do server ghi. 0 chỉ dành cho dữ liệu legacy nâng từ `lastSweepDay`. */
  readonly claimedAt: number;
}

export interface TrialProgress {
  /** Tầng Trial cao nhất đã qua (0..TRIAL_FLOORS). */
  readonly cleared: number;
  /** Kỷ lục theo tầng, tăng dần theo tầng; không có khi chưa thắng tầng nào. Không bao giờ giảm/xóa. */
  readonly records?: readonly TrialFloorRecord[];
  /** Chỉ có khi đang có trận; dữ liệu cũ không có trường này. */
  readonly active?: TrialActive;
  /** Tầng đã nhận đá lần đầu, tăng dần, không trùng. */
  readonly claimedFloors: readonly number[];
  /** Chỉ giữ receipt gần nhất: bỏ ngày không tích lượt. */
  readonly lastSweep: TrialSweepClaim | null;
}

export type DestinyRunPhase = "prepare" | "battle" | "reward" | "done";
export const DESTINY_BOON_IDS = [
  "atk",
  "def",
  "hp",
  "elementalEdge",
  "armoredFormation",
  "supplyCache",
  "battleDrum",
] as const;
export type DestinyBoon = (typeof DESTINY_BOON_IDS)[number];
export interface DestinyBoonStack {
  readonly id: DestinyBoon;
  readonly stacks: number;
  readonly effectVersion: number;
}

export type DestinyRewardOffer =
  | { readonly kind: "targeted_heal" }
  | { readonly kind: "field_medic" }
  | { readonly kind: "rescue" }
  | { readonly kind: "boon"; readonly boonId: DestinyBoon };

/** Ràng buộc lưu trữ; catalog hiệu ứng đầy đủ nằm ở tower/destinyBoons.ts. */
export const DESTINY_BOON_STATE_RULES: Readonly<Record<DestinyBoon, {
  readonly maxStacks: number;
  readonly effectVersion: number;
}>> = {
  atk: { maxStacks: 3, effectVersion: 1 },
  def: { maxStacks: 3, effectVersion: 1 },
  hp: { maxStacks: 3, effectVersion: 1 },
  elementalEdge: { maxStacks: 2, effectVersion: 1 },
  armoredFormation: { maxStacks: 2, effectVersion: 1 },
  supplyCache: { maxStacks: 2, effectVersion: 1 },
  battleDrum: { maxStacks: 2, effectVersion: 1 },
};

export interface DestinyFighterSnapshot {
  readonly id: string;
  readonly kind: "main" | "companion";
  readonly level: number;
  readonly config: FighterConfig;
  readonly equipment: readonly GearItem[];
  readonly hp: number;
  readonly energy: number;
  readonly downed: boolean;
  /** Tiến trình kỹ năng của Đinh Bộ Lĩnh, khóa theo run để server dựng lại build miễn phí. */
  readonly mainProgress?: CharacterProgress;
}

export interface DestinyRun {
  /** Thiếu ở run prototype cũ; run mới luôn là 1. */
  readonly stateVersion?: 1;
  readonly cycleId?: string;
  /** Version catalog luật dùng để tái dựng cycle; run cũ có thể chưa có. */
  readonly rulesVersion?: number;
  /** Roster khóa đầu run (tối đa DESTINY_ROSTER_MAX), thủ lĩnh ở đầu. */
  readonly roster: readonly string[];
  /** Snapshot bất biến và runtime theo fighter ID. */
  readonly fighters?: Readonly<Record<string, DestinyFighterSnapshot>>;
  /** Tầng sắp đánh, từ 1. */
  readonly floor: number;
  /** Máu theo tỉ lệ, theo id roster; 0 là đã ngã. */
  readonly hp: Readonly<Record<string, number>>;
  readonly food: number;
  /** Nộ khí xuyên tầng; thiếu ở dữ liệu cũ được hiểu là 0. */
  readonly rage?: number;
  /** Tổng lượt các tầng đã đánh trong run, dùng tie-break BXH cycle. */
  readonly totalTurns?: number;
  readonly boons?: readonly DestinyBoonStack[];
  readonly phase?: DestinyRunPhase;
  /** Tầng đã đồng bộ kết quả battle vào runtime; receipt chống settle lặp sau reload. */
  readonly settledFloor?: number;
  /** Tầng đã nhận reward nội bộ; dùng cùng floor trong payload để retry an toàn. */
  readonly rewardedFloor?: number;
  /** Trận Destiny đang mở; chỉ có ở phase battle. */
  readonly matchId?: string;
  /** Ba lựa chọn authoritative của tầng vừa thắng; null ngoài phase reward. */
  readonly offer?: readonly DestinyRewardOffer[] | null;
  readonly active: boolean;
}

export interface DestinyProgress {
  /** Chu kỳ hiện tại (ngày thứ Hai VN, YYYY-MM-DD); null khi chưa tham gia. */
  readonly cycleId: string | null;
  /** Tầng cao nhất trong chu kỳ này; reset khi sang chu kỳ, không là best vĩnh viễn. */
  readonly cycleBest: number;
  readonly run: DestinyRun | null;
  readonly claimedMilestones: readonly string[];
  readonly cycleRewardClaimed: boolean;
  /** Thành tích các cycle đã đóng, mới nhất ở cuối. */
  readonly history?: readonly DestinyCycleHistory[];
}

export interface DestinyCycleHistory {
  readonly cycleId: string;
  readonly bestFloor: number;
  readonly clearedFloor: number;
  readonly closedAt: number;
  readonly phaseAtClose: DestinyRunPhase | "none";
  readonly pendingRewardDropped: boolean;
  readonly cycleRewardClaimed: boolean;
}

export const DESTINY_HISTORY_MAX = 52;

export interface DualTowerV1 {
  readonly schema: typeof DUAL_TOWER_SCHEMA;
  readonly trial: TrialProgress;
  readonly destiny: DestinyProgress;
  /** Khóa các khoản thưởng đá đã cộng (mới nhất ở cuối, giới hạn STONE_LEDGER_MAX). */
  readonly stoneLedger: readonly string[];
}

export const STONE_LEDGER_MAX = 500;
/** Định danh ổn định của vật liệu; dữ liệu cũ/mới dùng chung, không đổi tên. */
export const ENHANCEMENT_STONE_ID = "enhancementStone";

/** Schema mới hơn bản code này hiểu: giữ nguyên, không ghi đè. */
export type DualTowerFuture = Readonly<Record<string, unknown>> & {
  readonly schema: number;
};

export type DualTowerState = DualTowerV1 | DualTowerFuture;

export const isDualTowerV1 = (s: DualTowerState): s is DualTowerV1 =>
  s.schema === DUAL_TOWER_SCHEMA;

export const NEW_TRIAL: TrialProgress = {
  cleared: 0,
  claimedFloors: [],
  lastSweep: null,
};

export const NEW_DESTINY: DestinyProgress = {
  cycleId: null,
  cycleBest: 0,
  run: null,
  claimedMilestones: [],
  cycleRewardClaimed: false,
  history: [],
};

export const NEW_DUAL_TOWER: DualTowerV1 = {
  schema: DUAL_TOWER_SCHEMA,
  trial: NEW_TRIAL,
  destiny: NEW_DESTINY,
  stoneLedger: [],
};

const isNum = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x);
const isObj = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const uint = (x: unknown) => (Number.isInteger(x) && (x as number) > 0 ? (x as number) : 0);

/** Đá: số nguyên không âm; âm/NaN/không nguyên/không phải số → 0. */
export function parseStones(raw: unknown): number {
  return Number.isInteger(raw) && (raw as number) > 0
    ? Math.min(raw as number, STONES_MAX)
    : 0;
}

function parseTrial(raw: unknown): TrialProgress {
  if (!isObj(raw)) return NEW_TRIAL;
  const claimed = Array.isArray(raw.claimedFloors)
    ? [
        ...new Set(
          raw.claimedFloors.filter(
            (f): f is number =>
              Number.isInteger(f) && f >= 1 && f <= TRIAL_FLOORS,
          ),
        ),
      ].sort((a, b) => a - b)
    : [];
  const a = raw.active;
  const active =
    isObj(a) &&
    typeof a.matchId === "string" &&
    a.matchId.length > 0 &&
    a.matchId.length <= 64 &&
    Number.isInteger(a.floor) &&
    (a.floor as number) >= 1 &&
    (a.floor as number) <= TRIAL_FLOORS
      ? { matchId: a.matchId, floor: a.floor as number }
      : undefined;
  const byFloor = new Map<number, TrialFloorRecord>();
  if (Array.isArray(raw.records)) {
    for (const r of raw.records) {
      if (!isObj(r)) continue;
      const floor = uint(r.floor);
      const clears = uint(r.clears);
      const bestTurns = uint(r.bestTurns);
      if (floor < 1 || floor > TRIAL_FLOORS || clears < 1 || bestTurns < 1) continue;
      const prev = byFloor.get(floor);
      byFloor.set(floor, {
        floor,
        clears: Math.max(clears, prev?.clears ?? 0),
        bestTurns: Math.min(bestTurns, prev?.bestTurns ?? Infinity),
      });
    }
  }
  const records = [...byFloor.values()].sort((a, b) => a.floor - b.floor);
  const cleared = Math.min(uint(raw.cleared), TRIAL_FLOORS);
  const sweep = raw.lastSweep;
  const parsedSweep =
    isObj(sweep) &&
    validDay(sweep.dateKey) &&
    Number.isInteger(sweep.tier) &&
    (sweep.tier as number) >= 1 &&
    (sweep.tier as number) <= 4 &&
    Number.isSafeInteger(sweep.claimedAt) &&
    (sweep.claimedAt as number) >= 0
      ? { dateKey: sweep.dateKey, tier: sweep.tier as TrialSweepTier, claimedAt: sweep.claimedAt as number }
      : validDay(raw.lastSweepDay) && cleared > 0
        ? { dateKey: raw.lastSweepDay, tier: Math.min(4, Math.ceil(cleared / 5)) as TrialSweepTier, claimedAt: 0 }
        : null;
  return {
    cleared,
    ...(records.length ? { records } : {}),
    ...(active ? { active } : {}),
    claimedFloors: claimed,
    lastSweep: parsedSweep,
  };
}

function parseDestinyRun(raw: unknown): DestinyRun | null {
  if (!isObj(raw)) return null;
  const roster = raw.roster;
  if (
    !Array.isArray(roster) ||
    roster.length < 1 ||
    roster.length > DESTINY_ROSTER_MAX ||
    !roster.every((id) => typeof id === "string") ||
    new Set(roster).size !== roster.length ||
    uint(raw.floor) < 1 ||
    !isNum(raw.food)
  )
    return null;
  const hpRaw = isObj(raw.hp) ? raw.hp : {};
  const hp = Object.fromEntries(
    (roster as string[]).map((id) => {
      const h = hpRaw[id];
      return [id, isNum(h) ? Math.max(0, Math.min(1, h)) : 1];
    }),
  );
  const base: DestinyRun = {
    roster: [...(roster as string[])],
    floor: uint(raw.floor),
    hp,
    food: Math.max(0, Math.round(raw.food as number)),
    active: raw.active === true,
  };
  // Prototype cũ chỉ có roster/hp/food/active; giữ nguyên để không phá dữ liệu đã lưu.
  if (raw.stateVersion === undefined) return base;
  if (
    raw.stateVersion !== 1 ||
    !validDay(raw.cycleId) ||
    (raw.rulesVersion !== undefined && (!Number.isInteger(raw.rulesVersion) || (raw.rulesVersion as number) < 1)) ||
    !isObj(raw.fighters) ||
    !Array.isArray(raw.boons) ||
    !["prepare", "battle", "reward", "done"].includes(raw.phase as string) ||
    (raw.rage !== undefined && (!Number.isInteger(raw.rage) || (raw.rage as number) < 0 || (raw.rage as number) > 100)) ||
    (raw.totalTurns !== undefined && (!Number.isInteger(raw.totalTurns) || (raw.totalTurns as number) < 0)) ||
    (raw.settledFloor !== undefined &&
      (!Number.isInteger(raw.settledFloor) || (raw.settledFloor as number) < 0 || (raw.settledFloor as number) > uint(raw.floor))) ||
    (raw.rewardedFloor !== undefined &&
      (!Number.isInteger(raw.rewardedFloor) || (raw.rewardedFloor as number) < 0 || (raw.rewardedFloor as number) >= uint(raw.floor)))
  ) return null;
  const boonCounts = new Map<DestinyBoon, number>();
  for (const rawBoon of raw.boons) {
    const id = typeof rawBoon === "string"
      ? rawBoon
      : isObj(rawBoon) ? rawBoon.id : undefined;
    if (!(DESTINY_BOON_IDS as readonly unknown[]).includes(id)) return null;
    const boonId = id as DestinyBoon;
    const rule = DESTINY_BOON_STATE_RULES[boonId];
    const stacks = typeof rawBoon === "string" ? 1 : rawBoon.stacks;
    const effectVersion = typeof rawBoon === "string" ? rule.effectVersion : rawBoon.effectVersion;
    if (
      !Number.isInteger(stacks) || (stacks as number) < 1 ||
      !Number.isInteger(effectVersion) || effectVersion !== rule.effectVersion
    ) return null;
    boonCounts.set(boonId, (boonCounts.get(boonId) ?? 0) + stacks as number);
    if (boonCounts.get(boonId)! > rule.maxStacks) return null;
  }
  const boons: DestinyBoonStack[] = DESTINY_BOON_IDS.flatMap((id) => {
    const stacks = boonCounts.get(id);
    return stacks ? [{ id, stacks, effectVersion: DESTINY_BOON_STATE_RULES[id].effectVersion }] : [];
  });
  const offer = raw.offer === null || raw.offer === undefined
    ? null
    : Array.isArray(raw.offer) && raw.offer.length === 3
      ? raw.offer.flatMap((entry): DestinyRewardOffer[] => {
          if (!isObj(entry)) return [];
          if (entry.kind === "targeted_heal" || entry.kind === "field_medic" || entry.kind === "rescue")
            return [{ kind: entry.kind }];
          if (entry.kind === "boon" && (DESTINY_BOON_IDS as readonly unknown[]).includes(entry.boonId))
            return [{ kind: "boon", boonId: entry.boonId as DestinyBoon }];
          return [];
        })
      : [];
  if (raw.offer !== null && raw.offer !== undefined && (!offer || offer.length !== 3)) return null;
  const matchId = typeof raw.matchId === "string" && raw.matchId.length > 0 && raw.matchId.length <= 64
    ? raw.matchId
    : undefined;
  if (raw.matchId !== undefined && !matchId) return null;
  const fighters: Record<string, DestinyFighterSnapshot> = {};
  for (const id of roster as string[]) {
    const f = raw.fighters[id];
    const config = isObj(f) && isObj(f.config) ? f.config : null;
    if (
      !isObj(f) || f.id !== id ||
      f.kind !== (id === "dinhBoLinh" ? "main" : "companion") ||
      !Number.isInteger(f.level) || (f.level as number) < 1 ||
      !config || config.id !== id || typeof config.name !== "string" ||
      !(ELEMENTS as readonly unknown[]).includes(config.element) ||
      !(PROFESSIONS as readonly unknown[]).includes(config.profession) ||
      !Number.isInteger(config.maxHp) || (config.maxHp as number) < 1 ||
      !Number.isInteger(config.atk) || (config.atk as number) < 0 ||
      !Number.isInteger(config.def) || (config.def as number) < 0 ||
      !Array.isArray(f.equipment) || !f.equipment.every((gear) =>
        isObj(gear) && typeof gear.id === "string" &&
        (GEAR_SLOTS as readonly unknown[]).includes(gear.slot) &&
        (ELEMENTS as readonly unknown[]).includes(gear.element) &&
        (TIERS as readonly unknown[]).includes(gear.tier) && typeof gear.set === "string") ||
      !Number.isInteger(f.hp) || (f.hp as number) < 0 ||
      (f.hp as number) > (config.maxHp as number) ||
      !Number.isInteger(f.energy) || (f.energy as number) < 0 || (f.energy as number) > ENERGY_MAX ||
      typeof f.downed !== "boolean" || ((f.hp as number) === 0) !== f.downed
    ) return null;
    if (id === "dinhBoLinh") {
      const p = f.mainProgress;
      if (p !== undefined && (!isObj(p) || !Number.isInteger(p.level) || (p.level as number) < 1 ||
        !Number.isInteger(p.xp) || (p.xp as number) < 0 ||
        !Number.isInteger(p.skillPoints) || (p.skillPoints as number) < 0 ||
        !isObj(p.skillLevels) || !Array.isArray(p.branches) ||
        !p.branches.every((branch) => typeof branch === "string"))) return null;
    }
    fighters[id] = structuredClone(f) as unknown as DestinyFighterSnapshot;
  }
  if (Object.keys(raw.fighters).length !== roster.length) return null;
  return {
    ...base,
    stateVersion: 1,
    cycleId: raw.cycleId,
    ...(raw.rulesVersion === undefined ? {} : { rulesVersion: raw.rulesVersion as number }),
    fighters,
    boons,
    phase: raw.phase as DestinyRunPhase,
    rage: raw.rage === undefined ? 0 : raw.rage as number,
    totalTurns: raw.totalTurns === undefined ? 0 : raw.totalTurns as number,
    settledFloor: raw.settledFloor === undefined ? 0 : raw.settledFloor as number,
    rewardedFloor: raw.rewardedFloor === undefined ? 0 : raw.rewardedFloor as number,
    ...(matchId ? { matchId } : {}),
    offer,
  };
}

function parseDestiny(raw: unknown): DestinyProgress {
  if (!isObj(raw)) return NEW_DESTINY;
  const history: DestinyCycleHistory[] = [];
  if (Array.isArray(raw.history)) {
    for (const entry of raw.history.slice(-DESTINY_HISTORY_MAX)) {
      if (!isObj(entry) || !validDay(entry.cycleId) ||
          !Number.isInteger(entry.bestFloor) || (entry.bestFloor as number) < 0 ||
          !Number.isInteger(entry.clearedFloor) || (entry.clearedFloor as number) < 0 ||
          !Number.isSafeInteger(entry.closedAt) || (entry.closedAt as number) < 0 ||
          !["prepare", "battle", "reward", "done", "none"].includes(entry.phaseAtClose as string)) continue;
      history.push({
        cycleId: entry.cycleId,
        bestFloor: entry.bestFloor as number,
        clearedFloor: entry.clearedFloor as number,
        closedAt: entry.closedAt as number,
        phaseAtClose: entry.phaseAtClose as DestinyCycleHistory["phaseAtClose"],
        pendingRewardDropped: entry.pendingRewardDropped === true,
        cycleRewardClaimed: entry.cycleRewardClaimed === true,
      });
    }
  }
  return {
    cycleId:
      typeof raw.cycleId === "string" && DAY_RE.test(raw.cycleId)
        ? raw.cycleId
        : null,
    cycleBest: uint(raw.cycleBest),
    run: parseDestinyRun(raw.run),
    claimedMilestones: Array.isArray(raw.claimedMilestones)
      ? [
          ...new Set(
            raw.claimedMilestones.filter(
              (m): m is string => typeof m === "string" && m.length > 0,
            ),
          ),
        ]
      : [],
    cycleRewardClaimed: raw.cycleRewardClaimed === true,
    ...(Array.isArray(raw.history) ? { history } : {}),
  };
}

/** Thiếu/hỏng → rỗng; schema mới hơn → giữ nguyên bản gốc. */
export function parseDualTower(raw: unknown): DualTowerState {
  if (!isObj(raw)) return NEW_DUAL_TOWER;
  if (isNum(raw.schema) && raw.schema > DUAL_TOWER_SCHEMA)
    return raw as DualTowerFuture;
  return {
    schema: DUAL_TOWER_SCHEMA,
    trial: parseTrial(raw.trial),
    destiny: parseDestiny(raw.destiny),
    stoneLedger: Array.isArray(raw.stoneLedger)
      ? [
          ...new Set(
            raw.stoneLedger.filter(
              (k): k is string => typeof k === "string" && k.length > 0 && k.length <= 100,
            ),
          ),
        ].slice(-STONE_LEDGER_MAX)
      : [],
  };
}
