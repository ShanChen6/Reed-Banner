// Khởi tạo run Destiny: snapshot roster một lần, không đọc lại Profile trong lúc chạy.
import { loadoutOf, MAIN_ID, ownsCompanion, profileTeam, progressOf, type Profile } from "../progress";
import type { GearItem } from "../gear";
import {
  type DestinyFighterSnapshot,
  type DestinyRun,
} from "../progress/dualTowerState";
import { destinyRulesVersionForCycle } from "./destinyRules";
import { analyzeFeasibility } from "./puzzleValidator";
import { VN_UTC_OFFSET_MS, vnWeek } from "../vnTime";
import type { FloorRules, LineupMember } from "./floorRules";

export const DESTINY_CYCLE_DAYS = 7;
export const DESTINY_STARTING_FOOD = 60;
/** Lương mang sang giữa các tầng luôn nằm trong khoảng này. */
export const DESTINY_FOOD_MIN = 20;
export const DESTINY_FOOD_MAX = 100;
export const DESTINY_ROSTER_MIN = 3;

export const clampDestinyFood = (food: number) =>
  Math.max(DESTINY_FOOD_MIN, Math.min(DESTINY_FOOD_MAX, Math.round(food)));

/** Cấp trung bình (làm tròn, tối thiểu 1) của một nhóm tướng; đội hình khóa tính cả Đinh Bộ Lĩnh. */
export const destinyAverageLevel = (levels: readonly number[]): number =>
  levels.length === 0 ? 1 : Math.max(1, Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length));

/**
 * Cấp đối thủ của lượt leo. Luật hiện hành (`foeLevelVersion` 2): cấp trung bình của mọi tướng trong đội hình khóa,
 * để một hai tướng cấp cao không kéo đối thủ vượt xa phần còn lại của đội. Run cũ: cấp cao nhất.
 */
export function destinyFoeLevel(run: Pick<DestinyRun, "fighters" | "foeLevelVersion">): number {
  const levels = Object.values(run.fighters ?? {}).map(({ level }) => level);
  return run.foeLevelVersion === 2 ? destinyAverageLevel(levels) : Math.max(1, ...levels);
}

/**
 * Đưa run cũ sang cách tính cấp đối thủ hiện hành. Run đang dở trận giữ nguyên, vì trận đã dựng theo cấp cũ
 * và kết quả được đối chiếu với đúng đối thủ đó.
 */
export const withCurrentFoeLevel = (run: DestinyRun): DestinyRun =>
  run.foeLevelVersion === 2 || run.phase === "battle" ? run : { ...run, foeLevelVersion: 2 };

export type DestinyRunCreateError =
  | "invalid_time"
  | "invalid_roster_size"
  | "leader_must_be_first"
  | "duplicate_fighter"
  | "not_owned"
  | "invalid_rules"
  | "no_legal_lineup";

export type DestinyRunCreateResult =
  | { readonly ok: true; readonly run: DestinyRun }
  | { readonly ok: false; readonly error: DestinyRunCreateError; readonly floorIndex?: number; readonly fighterId?: string };

/** Monday 00:00 Việt Nam của chu kỳ chứa `now`, dạng YYYY-MM-DD. */
export function destinyCycleId(now: number): string | null {
  if (!Number.isSafeInteger(now) || now < 0 || Number.isNaN(new Date(now + VN_UTC_OFFSET_MS).valueOf())) return null;
  return vnWeek(now);
}

function equippedItems(profile: Profile, id: string): readonly GearItem[] {
  const loadout = loadoutOf(profile, id);
  return structuredClone(
    [...Object.values(loadout.weapons), ...Object.values(loadout.slots)]
      .filter((item): item is GearItem => item !== undefined),
  );
}

/**
 * Dựng run mới cho chu kỳ hiện tại. `cycleRules` là snapshot luật tầng đã được server chọn;
 * mọi tầng phải có ít nhất một đội 3 người từ roster khóa (leader được đổi build).
 */
export function createDestinyRun(
  profile: Profile,
  now: number,
  rosterIds: readonly string[],
  cycleRules: readonly FloorRules[],
): DestinyRunCreateResult {
  const cycleId = destinyCycleId(now);
  if (!cycleId) return { ok: false, error: "invalid_time" };
  if (!Array.isArray(rosterIds) || rosterIds.length < DESTINY_ROSTER_MIN)
    return { ok: false, error: "invalid_roster_size" };
  if (rosterIds[0] !== MAIN_ID) return { ok: false, error: "leader_must_be_first" };
  if (new Set(rosterIds).size !== rosterIds.length) return { ok: false, error: "duplicate_fighter" };
  for (const id of rosterIds.slice(1))
    if (!ownsCompanion(profile, id)) return { ok: false, error: "not_owned", fighterId: id };

  const configs = profileTeam(profile, rosterIds.slice(1));
  if (configs.length !== rosterIds.length || configs.some((config, index) => config.id !== rosterIds[index]))
    return { ok: false, error: "not_owned" };
  const candidates: LineupMember[] = configs.slice(1).map(({ id, element, profession }) => ({ id, element, profession }));
  for (let floorIndex = 0; floorIndex < cycleRules.length; floorIndex++) {
    const report = analyzeFeasibility(cycleRules[floorIndex]!, candidates, { maxSamples: 1 });
    if (report.status === "rules_invalid") return { ok: false, error: "invalid_rules", floorIndex };
    if (report.status === "no_lineup") return { ok: false, error: "no_legal_lineup", floorIndex };
  }

  const fighters: Record<string, DestinyFighterSnapshot> = {};
  configs.forEach((config) => {
    const id = config.id;
    fighters[id] = {
      id,
      kind: id === MAIN_ID ? "main" : "companion",
      level: progressOf(profile, id).level,
      config: structuredClone(config),
      equipment: equippedItems(profile, id),
      hp: config.maxHp,
      energy: 0,
      downed: false,
      ...(id === MAIN_ID ? { mainProgress: structuredClone(progressOf(profile, id)) } : {}),
    };
  });
  return {
    ok: true,
    run: {
      stateVersion: 1,
      cycleId,
      rulesVersion: destinyRulesVersionForCycle(cycleId),
      foeLevelVersion: 2,
      roster: [...rosterIds],
      fighters,
      floor: 1,
      hp: Object.fromEntries(rosterIds.map((id) => [id, 1])),
      food: DESTINY_STARTING_FOOD,
      rage: 0,
      rages: Object.fromEntries(rosterIds.map((id) => [id, 0])),
      totalTurns: 0,
      boons: [],
      phase: "prepare",
      settledFloor: 0,
      rewardedFloor: 0,
      offer: null,
      active: true,
    },
  };
}
