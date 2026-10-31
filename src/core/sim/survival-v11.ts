import { playAiTurn } from "../ai";
import { elementMultiplier, type Element } from "../battle/elements";
import {
  beginWave,
  createBattle,
  FOOD_MAX,
  type BattleState,
  type Profession,
} from "../battle";
import {
  autoProgress,
  type Profile,
} from "../progress";
import {
  applySurvivalLeaderBuild,
  createSurvivalRoster,
  downedFightersAfterWave,
  newSurvivalRun,
  planBreak,
  proposeSurvivalLeaderBuild,
  proposeSurvivalLineup,
  readSurvivalFighterState,
  survivalActiveSideConfig,
  survivalWave,
  type SurvivalRun,
} from "../survival";
import { DEFAULT_MAX_TURNS } from "./sim";
import { pickRevive, simulateSurvival } from "./survival";
import { simProfile } from "./profile";

export const SURVIVAL_V11_RESERVE_RATES = [0, 0.05, 0.1, 0.15, 0.2] as const;

export type SurvivalRotationPolicy =
  | "forced-only"
  | "under-30"
  | "downed-first"
  | "highest-hp"
  | "recovery-rotation"
  | "element-counter"
  | "profession-fit"
  | "boss-prep";

export type SurvivalLeaderPolicy =
  | "fixed"
  | "low-hp-defense"
  | "healer"
  | "defense"
  | "attack"
  | "element-counter"
  | "adaptive";

export interface SurvivalV11Options {
  readonly reserveHealRate: number;
  readonly rotation: SurvivalRotationPolicy;
  readonly leader: SurvivalLeaderPolicy;
  readonly includeReserves?: boolean;
  readonly maxWaves?: number;
}

export interface SurvivalV11Result {
  readonly cleared: number;
  readonly turns: readonly number[];
  readonly food: number;
  readonly downedAtEnd: number;
  readonly autoRevives: number;
  readonly paidRevives: number;
  readonly rotations: number;
  readonly rosterHpRatioMean: number;
  readonly activeHpRatioMean: number;
  readonly reserveHpRatioMean: number;
}

const ACTIVE = ["dinhBoLinh", "haVan", "maiThanh"] as const;
const RESERVE = ["leThach", "phungPhong"] as const;
const PROFESSIONS: readonly Profession[] = [
  "tuongSi",
  "phapSu",
  "binhLinh",
  "ySu",
  "muuSi",
  "quanSu",
  "xaThu",
  "satThu",
];
const ELEMENTS: readonly Element[] = [
  "kim",
  "moc",
  "thuy",
  "hoa",
  "tho",
  "loi",
  "phong",
];

function profileWithFive(level: number): Profile {
  const base = simProfile(level);
  const companions = { ...base.companions };
  for (const id of RESERVE)
    companions[id] = autoProgress(level, null);
  return { ...base, companions };
}

function setReserveHp(run: SurvivalRun, rates: ReadonlyMap<string, number>, before: SurvivalRun): SurvivalRun {
  const entries = { ...run.roster.entries };
  for (const id of run.roster.reserveIds) {
    const entry = entries[id];
    const old = before.roster.entries[id];
    if (!entry || !old || entry.location.kind !== "reserve")
      throw new Error(`Invalid reserve state for ${id}`);
    // Active-at-wave-start fighters already received the active recovery; newly revived fighters
    // keep the revive amount rather than receiving an additional reserve recovery.
    if (old.location.kind === "active" || (old.downedAtWave !== null && entry.downedAtWave === null))
      continue;
    const rate = rates.get(id);
    if (rate === undefined) continue;
    const previousHp =
      old.location.kind === "reserve" ? old.location.runtime.hp : undefined;
    if (previousHp === undefined)
      throw new Error(`Missing previous reserve runtime for ${id}`);
    entries[id] = {
      ...entry,
      location: {
        kind: "reserve",
        runtime: {
          ...entry.location.runtime,
          hp: previousHp === 0
            ? 0
            : Math.min(
                entry.snapshot.config.maxHp,
                previousHp +
                  Math.round(entry.snapshot.config.maxHp * rate),
              ),
        },
      },
    };
  }
  return { ...run, roster: { ...run.roster, entries } };
}

function stateFor(run: SurvivalRun, battle: BattleState, id: string) {
  const result = readSurvivalFighterState(run, battle, id);
  if (!result.ok) throw new Error(`Unable to read ${id}: ${result.error}`);
  return result.value;
}

function lineupFor(
  run: SurvivalRun,
  battle: BattleState,
  policy: SurvivalRotationPolicy,
): string[] {
  const active = [...run.roster.activeIds];
  const available = run.roster.orderIds
    .filter((id) => id !== active[0])
    .map((id) => stateFor(run, battle, id))
    .filter((fighter) => fighter.hp > 0);
  const reserveIds = new Set(run.roster.reserveIds);
  const foes = survivalWave(run, run.wave).foes;
  const hpRatio = (id: string) => {
    const fighter = stateFor(run, battle, id);
    return fighter.hp / fighter.maxHp;
  };
  const score = (id: string) => {
    const fighter = stateFor(run, battle, id);
    const ratio = fighter.hp / fighter.maxHp;
    if (policy === "element-counter") {
      const counter = foes.reduce(
        (sum, foe) => sum + elementMultiplier(fighter.element, foe.element),
        0,
      ) / foes.length;
      return counter + ratio * 0.2;
    }
    if (policy === "profession-fit") {
      const partyMean = active.slice(0, 3).reduce((sum, fighterId) => sum + hpRatio(fighterId), 0) / 3;
      const professionBonus =
        partyMean < 0.55 && fighter.profession === "ySu" ? 0.5 :
        partyMean < 0.75 && fighter.profession === "binhLinh" ? 0.2 : 0;
      return ratio + professionBonus;
    }
    return ratio;
  };
  const normalize = (candidates: readonly string[]): string[] => {
    if (available.length < 2) {
      const pair = [active[1]!, active[2]!];
      const livingReserves = run.roster.reserveIds
        .filter((id) => hpRatio(id) > 0)
        .sort((a, b) => score(b) - score(a));
      for (let slot = 0; slot < pair.length; slot++) {
        if (hpRatio(pair[slot]!) > 0) continue;
        const replacement = livingReserves.find((id) => !pair.includes(id));
        if (replacement) pair[slot] = replacement;
      }
      return [active[0]!, pair[0]!, pair[1]!];
    }
    const pair: (string | undefined)[] = [undefined, undefined];
    const append = (id: string) => {
      if (hpRatio(id) <= 0 || pair.includes(id)) return;
      const slot = pair.indexOf(undefined);
      if (slot >= 0) pair[slot] = id;
    };
    candidates.forEach(append);
    available.map((fighter) => fighter.id)
      .sort((a, b) => score(b) - score(a))
      .forEach(append);
    if (pair.some((id) => id === undefined))
      throw new Error("Unable to complete active lineup");
    return [active[0]!, pair[0]!, pair[1]!];
  };

  if (policy === "boss-prep" && survivalWave(run, run.wave).boss) {
    const selected = available
      .map((fighter) => ({
        id: fighter.id,
        score:
          fighter.hp / fighter.maxHp +
          foes.reduce(
            (sum, foe) => sum + elementMultiplier(fighter.element, foe.element),
            0,
          ) / foes.length * 0.2,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((fighter) => fighter.id);
    return normalize(selected);
  }

  if (policy === "highest-hp" || policy === "element-counter" || policy === "profession-fit") {
    const selected = available
      .sort((a, b) => score(b.id) - score(a.id))
      .slice(0, 2)
      .map((fighter) => fighter.id);
    return normalize(selected);
  }

  const pair = [active[1]!, active[2]!];
  const livingReserve = [...reserveIds].filter((id) => hpRatio(id) > 0);
  for (let slot = 0; slot < pair.length; slot++) {
    const id = pair[slot]!;
    if (hpRatio(id) === 0) {
      const replacement = livingReserve
        .filter((candidate) => !pair.includes(candidate))
        .sort((a, b) => hpRatio(b) - hpRatio(a))[0];
      if (replacement) pair[slot] = replacement;
    }
  }
  if (policy === "under-30" || policy === "recovery-rotation" ||
      (policy === "boss-prep" && survivalWave(run, run.wave).boss)) {
    const replaceThreshold = policy === "recovery-rotation" ? 0.9 : 0.3;
    for (let slot = 0; slot < pair.length; slot++) {
      const id = pair[slot]!;
      if (hpRatio(id) >= replaceThreshold) continue;
      const replacement = livingReserve
        .filter((candidate) => !pair.includes(candidate))
        .sort((a, b) => hpRatio(b) - hpRatio(a))[0];
      if (replacement && hpRatio(replacement) > hpRatio(id))
        pair[slot] = replacement;
    }
  }
  return normalize(pair);
}

function leaderChoice(
  run: SurvivalRun,
  battle: BattleState,
  policy: SurvivalLeaderPolicy,
): { profession: Profession; element: Element } {
  const entry = run.roster.entries.dinhBoLinh!;
  const old = entry.snapshot.leaderBuildChoice ?? {
    profession: entry.snapshot.config.profession,
    element: entry.snapshot.config.element,
  };
  const leader = battle.sides[0].fighters[0]!;
  const ratio = leader.hp / leader.maxHp;
  const nextWave = survivalWave(run, run.wave);
  let profession = old.profession;
  if (policy === "low-hp-defense" && ratio < 0.45) profession = "binhLinh";
  if (policy === "healer") profession = "ySu";
  if (policy === "defense") profession = "binhLinh";
  if (policy === "attack") profession = "tuongSi";
  if (policy === "adaptive")
    profession = ratio < 0.55 ? "ySu" : nextWave.boss ? "binhLinh" : "tuongSi";

  let element = old.element;
  if (policy === "element-counter" || policy === "adaptive") {
    element = ELEMENTS.map((candidate) => ({
        candidate,
        score: nextWave.foes.reduce(
          (sum, foe) => sum + elementMultiplier(candidate, foe.element),
          0,
        ),
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          Number(b.candidate === old.element) -
            Number(a.candidate === old.element) ||
          ELEMENTS.indexOf(a.candidate) - ELEMENTS.indexOf(b.candidate),
      )[0]!.candidate;
  }
  if (!PROFESSIONS.includes(profession) || !ELEMENTS.includes(element))
    throw new Error("Simulation produced an invalid leader build");
  return { profession, element };
}

function average(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function simulateSurvivalV11(
  level: number,
  seed: number,
  options: SurvivalV11Options,
): SurvivalV11Result {
  if (options.reserveHealRate < 0 || options.reserveHealRate > 0.2)
    throw new RangeError("reserveHealRate must be between 0 and 0.2");
  const maxWaves = options.maxWaves ?? 60;
  const includeReserves = options.includeReserves ?? true;
  const profile = includeReserves ? profileWithFive(level) : simProfile(level);
  const reserveIds = includeReserves ? RESERVE : [];
  const rosterResult = createSurvivalRoster(profile, ACTIVE, reserveIds);
  if (!rosterResult.ok) throw new Error(`Unable to create roster: ${rosterResult.error}`);
  let run = newSurvivalRun(profile, seed, rosterResult.roster);
  const firstWave = survivalWave(run, 1);
  const activeSide = survivalActiveSideConfig(run.roster);
  if (!activeSide.ok) throw new Error(activeSide.error);
  let { state } = createBattle({
    sides: [activeSide.value, { fighters: firstWave.foes, leader: 0 }],
    seed,
    timer: false,
    firstSide: 0,
  });
  const turns: number[] = [];
  const rosterHpSamples: number[] = [];
  const activeHpSamples: number[] = [];
  const reserveHpSamples: number[] = [];
  let autoRevives = 0;
  let paidRevives = 0;
  let rotations = 0;
  let difficulty = firstWave.difficulty;
  let food = state.sides[0].food;

  for (;;) {
    while (state.winner === null && state.turn.number <= DEFAULT_MAX_TURNS)
      state = playAiTurn(state, state.turn.side === 0 ? "normal" : difficulty).state;
    turns.push(state.turn.number);
    food = state.sides[0].food;

    const rosterStates = run.roster.orderIds.map((id) => stateFor(run, state, id));
    rosterHpSamples.push(average(rosterStates.map((fighter) => fighter.hp / fighter.maxHp)));
    activeHpSamples.push(average(run.roster.activeIds.map((id) => {
      const fighter = stateFor(run, state, id);
      return fighter.hp / fighter.maxHp;
    })));
    reserveHpSamples.push(average(run.roster.reserveIds.map((id) => {
      const fighter = stateFor(run, state, id);
      return fighter.hp / fighter.maxHp;
    })));

    if (state.winner !== 0 || run.wave >= maxWaves) {
      const downed = downedFightersAfterWave(run, state);
      return {
        cleared: state.winner === 0 ? run.wave : run.wave - 1,
        turns,
        food,
        downedAtEnd: downed.length,
        autoRevives,
        paidRevives,
        rotations,
        rosterHpRatioMean: average(rosterHpSamples),
        activeHpRatioMean: average(activeHpSamples),
        reserveHpRatioMean: average(reserveHpSamples),
      };
    }

    const paidReviveId = pickRevive(run, state);
    const breakPlan = planBreak(run, state, paidReviveId);
    if (!breakPlan.ok) throw new Error(`Break failed: ${breakPlan.error}`);

    const reserveRates = new Map(reserveIds.map((id) => [id, options.reserveHealRate]));
    let nextRun = setReserveHp(breakPlan.run, reserveRates, run);
    const revived = nextRun.roster.orderIds.filter((id) =>
      nextRun.roster.entries[id]?.revivedAtWave === nextRun.wave,
    );
    for (const id of revived) {
      if (id === paidReviveId) paidRevives++;
      else autoRevives++;
    }

    const desiredLineup = lineupFor(nextRun, breakPlan.battle, options.rotation);
    if (desiredLineup.some((id, slot) => id !== nextRun.roster.activeIds[slot]))
      rotations++;
    const rotation = proposeSurvivalLineup(nextRun, breakPlan.battle, desiredLineup);
    if (!rotation.ok) throw new Error(`Rotation failed (${options.rotation}): ${rotation.error}`);
    nextRun = rotation.value.run;
    let nextBattle = rotation.value.battle;

    const originalLeader = nextRun.roster.entries.dinhBoLinh!.snapshot.config;
    const choice = leaderChoice(nextRun, nextBattle, options.leader);
    const proposal = proposeSurvivalLeaderBuild(nextRun, nextBattle, choice);
    if (!proposal.ok) throw new Error(`Leader proposal failed: ${proposal.error}`);
    const applied = applySurvivalLeaderBuild(proposal.run, nextBattle);
    if (!applied.ok) throw new Error(`Leader build failed: ${applied.error}`);
    nextRun = applied.value.run;
    nextBattle = applied.value.battle;
    const lineupChanged = desiredLineup.some(
      (id, slot) => id !== run.roster.activeIds[slot],
    );
    const buildChanged =
      originalLeader.profession !== choice.profession ||
      originalLeader.element !== choice.element;

    const nextWave = survivalWave(nextRun, nextRun.wave);
    difficulty = nextWave.difficulty;
    const waveConfig = {
      ...breakPlan.config,
      ...(lineupChanged || buildChanged
        ? { playerFighters: nextBattle.sides[0].fighters }
        : {}),
    };
    state = beginWave(nextBattle, waveConfig).state;
    run = nextRun;
    food = Math.min(FOOD_MAX, state.sides[0].food);
  }
}

export function simulateSurvivalV11Baseline(
  level: number,
  seed: number,
  maxWaves = 60,
) {
  // Legacy baseline deliberately has no reserve and uses the unchanged production transition.
  return simulateSurvival(level, seed, maxWaves);
}
