// Hợp đồng tầng và thưởng cho Song Tháp. Chỉ định nghĩa kiểu, dựng tầng xác định, kế hoạch thưởng
// (sự kiện đá, chưa cộng vào hồ sơ) và kiểm tra trận. Không chứa nội dung 20 tầng hay số liệu thưởng.
// Xem docs/dual-tower/00-02-rules.md §3-4. Trận dùng lại battle engine nguyên vẹn.
import type { Difficulty } from "../ai";
import type { FighterConfig } from "../battle";
import { STANDARD_WEIGHTS, type SpawnWeights } from "../board";
import {
  leveledFoe,
  MAX_LEVEL,
  TRIAL_FLOORS,
  type DestinyProgress,
  type TowerMode,
  type TrialProgress,
} from "../progress";
import { createRng, type Rng } from "../rng";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";
import { validateFloorRules, type FloorRules, type RuleIssue } from "./floorRules";

/** Đổi khi thuật toán sinh tầng đổi, để tầng đã lưu/so khớp không âm thầm lệch. */
export const FLOOR_RNG_VERSION = 1;

export type StoneMode = TowerMode;

// ——— Định nghĩa và dựng tầng ———

export interface FloorEnemySpec {
  readonly level: number;
  /** Hệ số nhân máu và công của đối thủ. */
  readonly power: number;
  readonly count: 1 | 2 | 3;
  readonly difficulty: Difficulty;
  readonly weights?: SpawnWeights;
}

export interface FloorDefinition {
  readonly mode: StoneMode;
  readonly floor: number;
  readonly rules: FloorRules;
  readonly enemy: FloorEnemySpec;
}

export interface ResolvedFloor {
  readonly mode: StoneMode;
  /** Trial: "trial"; Destiny: id chu kỳ. Cùng (mode, scopeId, floor) luôn ra cùng tầng. */
  readonly scopeId: string;
  readonly floor: number;
  readonly rules: FloorRules;
  readonly difficulty: Difficulty;
  readonly weights: SpawnWeights;
  readonly foes: readonly FighterConfig[];
  readonly rngVersion: number;
  /** Dấu vân tay nội dung tầng; lưu cùng trận để phát hiện lệch. */
  readonly fingerprint: string;
}

export type EnemyBuilder = (
  spec: FloorEnemySpec,
  rng: Rng,
  def: FloorDefinition,
) => FighterConfig[];

const FOE_POOL: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
];

/** FNV-1a 32 bit: ổn định giữa các máy, không phụ thuộc Math.random. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export const floorSeed = (mode: StoneMode, scopeId: string, floor: number) =>
  hashString(`${FLOOR_RNG_VERSION}|${mode}|${scopeId}|${floor}`);

/** Bộ dựng đối thủ mặc định: rút không trùng từ kho tướng, nâng cấp và nhân hệ số sức mạnh. */
export const poolEnemyBuilder: EnemyBuilder = (spec, rng) => {
  const pool = [...FOE_POOL];
  const level = Math.max(1, Math.min(MAX_LEVEL, spec.level));
  return Array.from({ length: spec.count }, () => {
    const base = leveledFoe(pool.splice(rng.int(0, pool.length - 1), 1)[0]!, level);
    return {
      ...base,
      maxHp: Math.round(base.maxHp * spec.power),
      atk: Math.round(base.atk * spec.power),
    };
  });
};

export type FloorError =
  | { readonly code: "invalid_floor"; readonly max: number }
  | { readonly code: "invalid_scope" }
  | { readonly code: "invalid_enemy" }
  | { readonly code: "invalid_rules"; readonly issues: readonly RuleIssue[] };

export type ResolveFloorResult =
  | { readonly ok: true; readonly floor: ResolvedFloor }
  | { readonly ok: false; readonly error: FloorError };

const MAX_FLOOR: Record<StoneMode, number> = { trial: TRIAL_FLOORS, destiny: 1000 };
const ID_RE = /^[A-Za-z0-9_-]{1,32}$/;

export function resolveFloor(
  def: FloorDefinition,
  scopeId: string,
  build: EnemyBuilder = poolEnemyBuilder,
): ResolveFloorResult {
  if (!Number.isInteger(def.floor) || def.floor < 1 || def.floor > MAX_FLOOR[def.mode])
    return { ok: false, error: { code: "invalid_floor", max: MAX_FLOOR[def.mode] } };
  if (typeof scopeId !== "string" || !/^[A-Za-z0-9_-]{1,32}$|^\d{4}-\d{2}-\d{2}$/.test(scopeId))
    return { ok: false, error: { code: "invalid_scope" } };
  const e = def.enemy;
  if (
    !e ||
    !Number.isInteger(e.level) ||
    e.level < 1 ||
    !(e.power > 0) ||
    !Number.isFinite(e.power) ||
    ![1, 2, 3].includes(e.count)
  )
    return { ok: false, error: { code: "invalid_enemy" } };
  const issues = validateFloorRules(def.rules);
  if (issues.length > 0)
    return { ok: false, error: { code: "invalid_rules", issues } };

  const foes = build(e, createRng(floorSeed(def.mode, scopeId, def.floor)), def);
  const resolved = {
    mode: def.mode,
    scopeId,
    floor: def.floor,
    rules: structuredClone(def.rules),
    difficulty: e.difficulty,
    weights: e.weights ?? STANDARD_WEIGHTS,
    foes,
    rngVersion: FLOOR_RNG_VERSION,
  };
  return {
    ok: true,
    floor: {
      ...resolved,
      fingerprint: hashString(
        JSON.stringify([
          resolved.mode,
          scopeId,
          def.floor,
          def.rules,
          e.difficulty,
          foes.map((f) => [f.id, f.maxHp, f.atk, f.def, f.element, f.profession]),
          FLOOR_RNG_VERSION,
        ]),
      ).toString(16),
    },
  };
}

/** Bảng tầng Trial phải đủ 20 tầng liên tục, mỗi tầng dựng được. */
export function validateTrialFloorSet(defs: readonly FloorDefinition[]): readonly string[] {
  const problems: string[] = [];
  if (defs.length !== TRIAL_FLOORS) problems.push(`Cần ${TRIAL_FLOORS} tầng, có ${defs.length}`);
  defs.forEach((d, i) => {
    if (d.mode !== "trial") problems.push(`Tầng ${i + 1}: sai mode`);
    if (d.floor !== i + 1) problems.push(`Tầng ${i + 1}: số tầng ${d.floor} không liên tục`);
    const r = resolveFloor(d, "trial");
    if (!r.ok) problems.push(`Tầng ${i + 1}: ${r.error.code}`);
  });
  return problems;
}

// ——— Thưởng: đá tài khoản (sự kiện) tách khỏi reward nội bộ của run ———

export type StoneSource =
  | "trial_first_clear"
  | "trial_sweep"
  | "destiny_milestone"
  | "destiny_cycle";

/** Sự kiện thưởng đá. Chưa cộng vào hồ sơ; nơi áp dụng cộng nguyên tử cùng khóa idempotent. */
export interface StoneRewardEvent {
  readonly kind: "stone";
  readonly mode: StoneMode;
  readonly source: StoneSource;
  /** Số nguyên dương. */
  readonly amount: number;
  /** Khóa idempotent duy nhất cho khoản thưởng. */
  readonly key: string;
}

/** Reward nội bộ Destiny: chỉ ảnh hưởng run, không bao giờ có đá/vàng/EXP/trang bị. */
export type RunReward =
  | { readonly kind: "heal" }
  | { readonly kind: "food" }
  | { readonly kind: "boon"; readonly boon: "atk" | "def" | "hp" };

export const stoneKeys = {
  trialFirst: (floor: number) => `trial:first:${floor}`,
  trialSweep: (day: string) => `trial:sweep:${day}`,
  destinyMilestone: (cycleId: string, milestoneId: string) =>
    `destiny:${cycleId}:milestone:${milestoneId}`,
  destinyCycle: (cycleId: string) => `destiny:${cycleId}:cycle`,
} as const;

const validAmount = (n: unknown): n is number =>
  Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 1_000_000;

export type SettleError =
  | "invalid_floor"
  | "invalid_amount"
  | "invalid_day"
  | "invalid_cycle"
  | "cycle_mismatch"
  | "invalid_milestone";

export interface SettlePlan<P> {
  readonly ok: true;
  readonly next: P;
  readonly events: readonly StoneRewardEvent[];
}
export type SettleResult<P> =
  | SettlePlan<P>
  | { readonly ok: false; readonly error: SettleError };

const bad = (error: SettleError) => ({ ok: false, error }) as const;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Trial: kết thúc một trận tầng. Thắng thì mở tầng kế (cleared) và, nếu chưa nhận, sinh đúng một
 * sự kiện đá lần đầu. Thua/đánh lại không thưởng. Chạy lại với `next` cho cùng kết quả mà không có sự kiện.
 */
export function planTrialSettle(
  progress: TrialProgress,
  input: { floor: number; won: boolean; firstClearStones: number },
): SettleResult<TrialProgress> {
  if (!Number.isInteger(input.floor) || input.floor < 1 || input.floor > TRIAL_FLOORS)
    return bad("invalid_floor");
  if (!validAmount(input.firstClearStones)) return bad("invalid_amount");
  if (input.floor > progress.cleared + 1) return bad("invalid_floor");
  if (!input.won) return { ok: true, next: progress, events: [] };
  const claimed = progress.claimedFloors.includes(input.floor);
  if (claimed && progress.cleared >= input.floor)
    return { ok: true, next: progress, events: [] };
  const next: TrialProgress = {
    ...progress,
    cleared: Math.max(progress.cleared, input.floor),
    claimedFloors: claimed
      ? progress.claimedFloors
      : [...progress.claimedFloors, input.floor].sort((a, b) => a - b),
  };
  const events: StoneRewardEvent[] =
    !claimed && input.firstClearStones > 0
      ? [
          {
            kind: "stone",
            mode: "trial",
            source: "trial_first_clear",
            amount: input.firstClearStones,
            key: stoneKeys.trialFirst(input.floor),
          },
        ]
      : [];
  return { ok: true, next, events };
}

export interface DestinyMilestone {
  readonly id: string;
  /** Tầng cần đạt trong chu kỳ. */
  readonly floor: number;
  readonly stones: number;
}

/** Destiny: thắng tầng `floor` trong chu kỳ; phát mọi mốc đạt tới mà chưa nhận. */
export function planDestinyFloorClear(
  progress: DestinyProgress,
  input: { cycleId: string; floor: number; milestones: readonly DestinyMilestone[] },
): SettleResult<DestinyProgress> {
  if (!DAY_RE.test(input.cycleId)) return bad("invalid_cycle");
  if (progress.cycleId !== input.cycleId) return bad("cycle_mismatch");
  if (!Number.isInteger(input.floor) || input.floor < 1) return bad("invalid_floor");
  const ids = new Set<string>();
  for (const m of input.milestones) {
    if (!ID_RE.test(m.id) || ids.has(m.id) || !Number.isInteger(m.floor) || m.floor < 1)
      return bad("invalid_milestone");
    if (!validAmount(m.stones)) return bad("invalid_amount");
    ids.add(m.id);
  }
  const due = input.milestones.filter(
    (m) => m.floor <= input.floor && !progress.claimedMilestones.includes(m.id),
  );
  return {
    ok: true,
    next: {
      ...progress,
      cycleBest: Math.max(progress.cycleBest, input.floor),
      claimedMilestones: [...progress.claimedMilestones, ...due.map((m) => m.id)],
    },
    events: due
      .filter((m) => m.stones > 0)
      .map((m) => ({
        kind: "stone" as const,
        mode: "destiny" as const,
        source: "destiny_milestone" as const,
        amount: m.stones,
        key: stoneKeys.destinyMilestone(input.cycleId, m.id),
      })),
  };
}

/** Destiny: kết thúc chu kỳ, thưởng theo `cycleBest` một lần. */
export function planDestinyCycleEnd(
  progress: DestinyProgress,
  input: { cycleId: string; stonesForBest: (cycleBest: number) => number },
): SettleResult<DestinyProgress> {
  if (!DAY_RE.test(input.cycleId)) return bad("invalid_cycle");
  if (progress.cycleId !== input.cycleId) return bad("cycle_mismatch");
  if (progress.cycleRewardClaimed) return { ok: true, next: progress, events: [] };
  const amount = input.stonesForBest(progress.cycleBest);
  if (!validAmount(amount)) return bad("invalid_amount");
  return {
    ok: true,
    next: { ...progress, cycleRewardClaimed: true },
    events:
      amount > 0
        ? [
            {
              kind: "stone",
              mode: "destiny",
              source: "destiny_cycle",
              amount,
              key: stoneKeys.destinyCycle(input.cycleId),
            },
          ]
        : [],
  };
}

// ——— Vòng đời theo mode ———

export const TRIAL_PHASES = ["idle", "prep", "in_battle", "settled"] as const;
export const DESTINY_PHASES = [
  "no_run",
  "prep",
  "in_battle",
  "reward",
  "ended",
] as const;
export type TrialPhase = (typeof TRIAL_PHASES)[number];
export type DestinyPhase = (typeof DESTINY_PHASES)[number];

const TRIAL_NEXT: Record<TrialPhase, readonly TrialPhase[]> = {
  idle: ["prep"],
  prep: ["in_battle", "idle"],
  in_battle: ["settled"],
  settled: ["idle"],
};
const DESTINY_NEXT: Record<DestinyPhase, readonly DestinyPhase[]> = {
  no_run: ["prep"],
  prep: ["in_battle", "ended"],
  in_battle: ["reward", "ended"],
  reward: ["prep", "ended"],
  ended: [],
};

export const canTransitionTrial = (from: TrialPhase, to: TrialPhase) =>
  TRIAL_NEXT[from].includes(to);
export const canTransitionDestiny = (from: DestinyPhase, to: DestinyPhase) =>
  DESTINY_NEXT[from].includes(to);

// ——— Kiểm tra trận ———

/** Nhãn gắn với trận Song Tháp; server tự dựng, không nhận từ client. */
export interface TowerMatchTag {
  readonly mode: StoneMode;
  readonly scopeId: string;
  readonly floor: number;
  readonly fingerprint: string;
  readonly rngVersion: number;
  /** Id đội người chơi theo slot, thủ lĩnh đầu. */
  readonly lineupIds: readonly string[];
}

/** Danh tính riêng của trận Destiny; không dùng field `tower` legacy. */
export interface DestinyMatchTag {
  readonly cycleId: string;
  readonly floor: number;
  readonly fingerprint: string;
  readonly lineupIds: readonly string[];
}

export function makeDestinyMatchTag(
  floor: ResolvedFloor,
  lineupIds: readonly string[],
): DestinyMatchTag {
  return {
    cycleId: floor.scopeId,
    floor: floor.floor,
    fingerprint: floor.fingerprint,
    lineupIds: [...lineupIds],
  };
}

export function validateDestinyMatchTag(
  tag: DestinyMatchTag,
  expected: ResolvedFloor,
  battle: { readonly sides: readonly { readonly fighters: readonly { readonly id: string }[] }[] },
  roster: readonly string[],
): MatchTagError | null {
  if (expected.mode !== "destiny") return "mode_mismatch";
  if (tag.cycleId !== expected.scopeId) return "scope_mismatch";
  if (tag.floor !== expected.floor) return "floor_mismatch";
  if (tag.fingerprint !== expected.fingerprint) return "fingerprint_mismatch";
  if (
    battle.sides.length !== 2 ||
    tag.lineupIds.length !== 3 ||
    !sameIds(battle.sides[0]!.fighters.map(({ id }) => id), tag.lineupIds)
  ) return "lineup_mismatch";
  if (tag.lineupIds.some((id) => !roster.includes(id))) return "roster_mismatch";
  return null;
}

export type MatchTagError =
  | "mode_mismatch"
  | "scope_mismatch"
  | "floor_mismatch"
  | "fingerprint_mismatch"
  | "rng_version_mismatch"
  | "lineup_mismatch"
  | "foes_mismatch"
  | "roster_mismatch";

export function makeTowerMatchTag(
  floor: ResolvedFloor,
  lineupIds: readonly string[],
): TowerMatchTag {
  return {
    mode: floor.mode,
    scopeId: floor.scopeId,
    floor: floor.floor,
    fingerprint: floor.fingerprint,
    rngVersion: floor.rngVersion,
    lineupIds: [...lineupIds],
  };
}

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

/**
 * Trận có đúng là trận của tầng này? Chỉ so định danh, không so máu/năng lượng (đổi khi đánh).
 * Với Destiny, đội phải nằm trong roster khóa.
 */
export function validateTowerMatch(
  tag: TowerMatchTag,
  expected: ResolvedFloor,
  battle: { readonly sides: readonly { readonly fighters: readonly { readonly id: string }[] }[] },
  roster?: readonly string[],
): MatchTagError | null {
  if (tag.mode !== expected.mode) return "mode_mismatch";
  if (tag.scopeId !== expected.scopeId) return "scope_mismatch";
  if (tag.floor !== expected.floor) return "floor_mismatch";
  if (tag.rngVersion !== expected.rngVersion) return "rng_version_mismatch";
  if (tag.fingerprint !== expected.fingerprint) return "fingerprint_mismatch";
  if (
    battle.sides.length !== 2 ||
    !sameIds(battle.sides[0]!.fighters.map((f) => f.id), tag.lineupIds) ||
    tag.lineupIds.length !== 3
  )
    return "lineup_mismatch";
  if (
    !sameIds(
      battle.sides[1]!.fighters.map((f) => f.id),
      expected.foes.map((f) => f.id),
    )
  )
    return "foes_mismatch";
  if (
    expected.mode === "destiny" &&
    (!roster ||
      !tag.lineupIds.every((id) => roster.includes(id)))
  )
    return "roster_mismatch";
  return null;
}
