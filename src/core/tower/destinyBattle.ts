import {
  ELEMENTS,
  PROFESSIONS,
  RAGE_MAX,
  createBattle,
  type BattleConfig,
  type Element,
  type Profession,
  type SideConfig,
} from "../battle";
import { EMPTY_LOADOUT, equip, withGear, type Loadout } from "../gear";
import { MAIN_ID, buildMain, type DestinyRun } from "../progress";
import { LINEUP_SIZE, validateLineup, type FloorRules, type LineupError } from "./floorRules";

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
  | { readonly ok: true; readonly state: ReturnType<typeof createBattle>["state"]; readonly events: ReturnType<typeof createBattle>["events"] }
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
  const configs = input.activeIds.map((id) => id === MAIN_ID
    ? withGear(buildMain(main.mainProgress!, input.leaderBuild.element, input.leaderBuild.profession), loadout)
    : structuredClone(run.fighters![id]!.config));
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
    created.state.sides[0].fighters[index]!.energy = run.fighters![id]!.energy;
  });
  created.state.sides[0].rage = Math.min(RAGE_MAX, Math.max(0, run.rage ?? 0));
  return { ok: true, ...created };
}
