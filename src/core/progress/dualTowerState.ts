// Song Tháp (Trial / Destiny) lưu trong hồ sơ, tách hẳn khỏi Legacy `profile.tower` (best/run).
// Chỉ định danh và parse/serialize; luật tầng, thưởng và UI nằm ở task sau.
// Xem docs/dual-tower/00-03-migration-plan.md.

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

export interface DestinyRun {
  /** Roster khóa đầu run (tối đa DESTINY_ROSTER_MAX), thủ lĩnh ở đầu. */
  readonly roster: readonly string[];
  /** Tầng sắp đánh, từ 1. */
  readonly floor: number;
  /** Máu theo tỉ lệ, theo id roster; 0 là đã ngã. */
  readonly hp: Readonly<Record<string, number>>;
  readonly food: number;
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
}

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
  return {
    roster: [...(roster as string[])],
    floor: uint(raw.floor),
    hp,
    food: Math.max(0, Math.round(raw.food as number)),
    active: raw.active === true,
  };
}

function parseDestiny(raw: unknown): DestinyProgress {
  if (!isObj(raw)) return NEW_DESTINY;
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
