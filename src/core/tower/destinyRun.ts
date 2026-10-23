// Khởi tạo run Destiny: snapshot roster một lần, không đọc lại Profile trong lúc chạy.
import { loadoutOf, MAIN_ID, ownsCompanion, profileTeam, progressOf, type Profile } from "../progress";
import type { GearItem } from "../gear";
import {
  DESTINY_ROSTER_MAX,
  type DestinyFighterSnapshot,
  type DestinyRun,
} from "../progress/dualTowerState";
import { analyzeFeasibility } from "./puzzleValidator";
import type { FloorRules, LineupMember } from "./floorRules";

export const DESTINY_CYCLE_DAYS = 7;
export const DESTINY_STARTING_FOOD = 60;
export const DESTINY_ROSTER_MIN = 3;

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
  if (!Number.isSafeInteger(now) || now < 0 || Number.isNaN(new Date(now).valueOf())) return null;
  const local = new Date(now + 7 * 60 * 60 * 1_000);
  const day = local.getUTCDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - mondayOffset));
  return monday.toISOString().slice(0, 10);
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
  if (!Array.isArray(rosterIds) || rosterIds.length < DESTINY_ROSTER_MIN || rosterIds.length > DESTINY_ROSTER_MAX)
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
      roster: [...rosterIds],
      fighters,
      floor: 1,
      hp: Object.fromEntries(rosterIds.map((id) => [id, 1])),
      food: DESTINY_STARTING_FOOD,
      rage: 0,
      boons: [],
      phase: "prepare",
      active: true,
    },
  };
}
