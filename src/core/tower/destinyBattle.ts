import {
  ELEMENTS,
  PROFESSIONS,
  RAGE_MAX,
  ENERGY_MAX,
  createBattle,
  type BattleState,
  type BattleConfig,
  type Element,
  type Profession,
  type SideConfig,
} from "../battle";
import { EMPTY_LOADOUT, equip, withGear, type Loadout } from "../gear";
import { MAIN_ID, buildMain, type DestinyRun } from "../progress";
import { clampTowerFood } from "../progress/towerState";
import { LINEUP_SIZE, validateLineup, type FloorRules, type LineupError } from "./floorRules";
import {
  applyDestinyBoonStats,
  destinyAppliedEnergyBonus,
  destinyAppliedRageBonus,
} from "./destinyBoons";

export interface DestinyLeaderBuild {
  readonly element: Element;
  readonly profession: Profession;
}

export interface DestinyBattleInput {
  readonly activeIds: readonly string[];
  readonly leaderBuild: DestinyLeaderBuild;
  readonly rules: FloorRules;
  readonly foes: SideConfig;
  readonly seed: number;
  readonly now?: number;
  readonly timer?: boolean;
  readonly firstSide?: 0 | 1;
  readonly weights?: BattleConfig["weights"];
}

export type DestinyBattleError =
  | "invalid_run"
  | "invalid_phase"
  | "invalid_team_size"
  | "leader_must_be_first"
  | "duplicate_fighter"
  | "fighter_not_in_roster"
  | "fighter_downed"
  | "invalid_leader_build"
  | "rules_violation"
  | "foes_must_be_three";

export type DestinyBattleResult =
  | { readonly ok: true; readonly run: DestinyRun; readonly state: ReturnType<typeof createBattle>["state"]; readonly events: ReturnType<typeof createBattle>["events"] }
  | { readonly ok: false; readonly error: DestinyBattleError; readonly fighterId?: string; readonly ruleErrors?: readonly LineupError[] };

function snapshotLoadout(run: DestinyRun): Loadout | null {
  const main = run.fighters?.[MAIN_ID];
  if (!main) return null;
  let loadout: Loadout = EMPTY_LOADOUT;
  for (const item of main.equipment) {
    const result = equip(loadout, item);
    if (!result.ok) return null;
    loadout = result.loadout;
  }
  return loadout;
}

/** Dựng trận Destiny hoàn toàn từ snapshot authoritative; không đọc lại Profile và không sửa run. */
export function createDestinyFloorBattle(run: DestinyRun, input: DestinyBattleInput): DestinyBattleResult {
  if (run.stateVersion !== 1 || !run.fighters || !run.active) return { ok: false, error: "invalid_run" };
  if ((run.phase ?? "prepare") !== "prepare") return { ok: false, error: "invalid_phase" };
  if (input.activeIds.length !== LINEUP_SIZE) return { ok: false, error: "invalid_team_size" };
  if (input.activeIds[0] !== MAIN_ID) return { ok: false, error: "leader_must_be_first" };
  if (new Set(input.activeIds).size !== input.activeIds.length) return { ok: false, error: "duplicate_fighter" };
  if (!(ELEMENTS as readonly unknown[]).includes(input.leaderBuild.element) ||
      !(PROFESSIONS as readonly unknown[]).includes(input.leaderBuild.profession))
    return { ok: false, error: "invalid_leader_build" };
  if (input.foes.fighters.length !== LINEUP_SIZE) return { ok: false, error: "foes_must_be_three" };

  for (const id of input.activeIds) {
    if (!run.roster.includes(id) || !run.fighters[id]) return { ok: false, error: "fighter_not_in_roster", fighterId: id };
    const fighter = run.fighters[id]!;
    if (fighter.downed || fighter.hp <= 0) return { ok: false, error: "fighter_downed", fighterId: id };
  }

  const main = run.fighters[MAIN_ID]!;
  const loadout = snapshotLoadout(run);
  if (!main.mainProgress || !loadout) return { ok: false, error: "invalid_run" };
  const equippedConfigs = input.activeIds.map((id) => id === MAIN_ID
    ? withGear(buildMain(main.mainProgress!, input.leaderBuild.element, input.leaderBuild.profession), loadout)
    : structuredClone(run.fighters![id]!.config));
  const configs = applyDestinyBoonStats(run, equippedConfigs);
  const legality = validateLineup(input.rules, configs.map(({ id, element, profession }) => ({ id, element, profession })));
  if (!legality.ok) return { ok: false, error: "rules_violation", ruleErrors: legality.errors };

  const hpRatio = input.activeIds.map((id) => {
    const fighter = run.fighters![id]!;
    return fighter.hp / fighter.config.maxHp;
  });
  const created = createBattle({
    sides: [{ fighters: configs, leader: 0, food: run.food, hpRatio }, input.foes],
    seed: input.seed,
    ...(input.now === undefined ? {} : { now: input.now }),
    ...(input.timer === undefined ? {} : { timer: input.timer }),
    ...(input.firstSide === undefined ? {} : { firstSide: input.firstSide }),
    ...(input.weights === undefined ? {} : { weights: input.weights }),
  });
  input.activeIds.forEach((id, index) => {
    created.state.sides[0].fighters[index]!.energy = Math.min(
      ENERGY_MAX,
      run.fighters![id]!.energy + destinyAppliedEnergyBonus(run, id),
    );
  });
  created.state.sides[0].rage = Math.min(
    RAGE_MAX,
    Math.max(0, run.rage ?? 0) + destinyAppliedRageBonus(run),
  );
  return { ok: true, run: { ...run, phase: "battle" }, ...created };
}

export type DestinyFloorSettleError =
  | "invalid_run"
  | "invalid_phase"
  | "battle_not_finished"
  | "invalid_active_team";

export type DestinyFloorSettleResult =
  | { readonly ok: true; readonly run: DestinyRun; readonly changed: boolean; readonly won: boolean }
  | { readonly ok: false; readonly error: DestinyFloorSettleError };

/**
 * Đồng bộ đúng một kết quả tầng vào run Destiny. Runtime được nối bằng fighter ID để
 * không phụ thuộc vị trí đội hình; reserve không xuất hiện trong battle không bị sửa.
 */
export function settleDestinyFloor(run: DestinyRun, battle: BattleState): DestinyFloorSettleResult {
  if (run.stateVersion !== 1 || !run.fighters)
    return { ok: false, error: "invalid_run" };
  if ((run.settledFloor ?? 0) >= run.floor) {
    const won = run.phase === "reward";
    return { ok: true, run, changed: false, won };
  }
  if (!run.active) return { ok: false, error: "invalid_run" };
  if ((run.phase ?? "prepare") !== "battle") return { ok: false, error: "invalid_phase" };
  if (battle.winner === null) return { ok: false, error: "battle_not_finished" };

  const active = battle.sides[0].fighters;
  if (
    active.length !== LINEUP_SIZE ||
    active[0]?.id !== MAIN_ID ||
    new Set(active.map(({ id }) => id)).size !== LINEUP_SIZE ||
    active.some(({ id }) => !run.roster.includes(id) || !run.fighters![id])
  ) return { ok: false, error: "invalid_active_team" };

  const fighters = { ...run.fighters };
  for (const current of active) {
    const previous = run.fighters[current.id]!;
    const hp = current.hp <= 0
      ? 0
      : Math.max(1, Math.min(previous.config.maxHp,
          Math.round(previous.config.maxHp * current.hp / Math.max(1, current.maxHp))));
    fighters[current.id] = {
      ...previous,
      hp,
      energy: Math.max(0, Math.min(
        ENERGY_MAX,
        Math.round(current.energy) - destinyAppliedEnergyBonus(run, current.id),
      )),
      downed: hp === 0,
    };
  }

  const allActiveDown = active.every(({ id }) => fighters[id]!.hp === 0);
  const won = battle.winner === 0 && !allActiveDown;
  return {
    ok: true,
    changed: true,
    won,
    run: {
      ...run,
      fighters,
      hp: Object.fromEntries(run.roster.map((id) => {
        const fighter = fighters[id]!;
        return [id, fighter.hp / fighter.config.maxHp];
      })),
      food: clampTowerFood(battle.sides[0].food),
      rage: Math.max(0, Math.min(
        RAGE_MAX,
        Math.round(battle.sides[0].rage) - destinyAppliedRageBonus(run),
      )),
      totalTurns: (run.totalTurns ?? 0) + Math.max(0, Math.round(battle.turn.number)),
      settledFloor: run.floor,
      phase: won ? "reward" : "done",
      active: won,
    },
  };
}
