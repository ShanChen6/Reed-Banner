// Đội hình Trấn Ải giữa hai đợt: kiểm đề xuất đổi tướng ra trận và đổi nghề/hệ Đinh Bộ Lĩnh lúc nghỉ, rồi áp vào lượt chơi.
// Tách từ survival.ts ngày 12/11/2026, không đổi logic.

import {
  ELEMENTS,
  isLeaderProfession,
  type BattleState,
  type Fighter,
  type FighterConfig,
  type Element,
  type Profession,
  SPIRIT_MAX,
} from "../battle";

import {
  EMPTY_LOADOUT,
  equip,
  withGear,
} from "../gear";
import {
  buildMain,
  MAIN_ID,
} from "../progress";

import {
  isRecord,
  validWaveNumber,
} from "./serialize";
import {
  readSurvivalFighterState,
  rescaleSurvivalHp,
  syncSurvivalRosterState,
  type SurvivalActiveSlot,
  type SurvivalFighterId,
  type SurvivalFighterState,
  type SurvivalLeaderBuildApplyResult,
  type SurvivalLeaderBuildChoice,
  type SurvivalLeaderBuildResult,
  type SurvivalRoster,
  type SurvivalRosterEntry,
  type SurvivalRotationResult,
  type SurvivalRun,
} from "./survival";

/**
 * Previews a BREAK lineup without mutating the source run or battle.
 * The main stays in slot 0. A downed companion may remain in-place only when no living reserve remains.
 */
export function proposeSurvivalLineup(
  run: SurvivalRun,
  battle: BattleState,
  payload: unknown,
): SurvivalRotationResult {
  if (
    !isRecord(run) ||
    run.stateVersion !== 2 ||
    typeof run.done !== "boolean" ||
    !validWaveNumber(run.wave) ||
    !Number.isInteger(run.settledThroughWave) ||
    run.settledThroughWave < 0 ||
    run.settledThroughWave > run.wave ||
    !Array.isArray(run.downed) ||
    run.downed.length !== 3 ||
    !isRecord(run.roster) ||
    !isRecord(run.roster.entries) ||
    !isRecord(battle) ||
    !Array.isArray(battle.sides) ||
    battle.sides.length !== 2 ||
    !Array.isArray(battle.sides[0]?.fighters) ||
    !Array.isArray(battle.sides[1]?.fighters) ||
    ![null, 0, 1].includes(battle.winner) ||
    battle.sides[0]?.leader !== 0 ||
    ![null, 0, 1].includes(battle.winner)
  )
    return { ok: false, error: "invalidState" };

  if (run.done || battle.winner === 1)
    return { ok: false, error: "finished" };
  if (battle.winner !== 0)
    return { ok: false, error: "notBreak" };

  if (
    !Array.isArray(run.roster.activeIds) ||
    !Array.isArray(run.roster.reserveIds) ||
    !Array.isArray(run.roster.orderIds) ||
    !isRecord(run.roster.entries) ||
    run.downed.some(
      (downed) =>
        downed !== null && (!validWaveNumber(downed) || downed > run.wave),
    )
  )
    return { ok: false, error: "invalidRoster" };

  if (!Array.isArray(payload))
    return { ok: false, error: "invalidPayload" };
  const activeIds: SurvivalFighterId[] = [];
  for (const id of payload) {
    if (typeof id !== "string" || id.length === 0)
      return { ok: false, error: "invalidPayload" };
    activeIds.push(id);
  }

  if (
    run.roster.activeIds.length !== 3 ||
    run.roster.reserveIds.length > 2 ||
    run.roster.orderIds.length < 3 ||
    run.roster.orderIds.length > 5 ||
    battle.sides[0].fighters.length !== 3 ||
    [...run.roster.activeIds, ...run.roster.reserveIds].some(
      (id) => typeof id !== "string" || id.length === 0,
    ) ||
    run.roster.orderIds.some(
      (id) => typeof id !== "string" || id.length === 0,
    ) ||
    new Set(run.roster.orderIds).size !== run.roster.orderIds.length ||
    new Set([...run.roster.activeIds, ...run.roster.reserveIds]).size !==
      run.roster.orderIds.length ||
    [...run.roster.activeIds, ...run.roster.reserveIds].some(
      (id) => !run.roster.orderIds.includes(id),
    ) ||
    Object.keys(run.roster.entries).length !== run.roster.orderIds.length
  )
    return { ok: false, error: "invalidRoster" };
  if (run.roster.activeIds[0] !== MAIN_ID)
    return { ok: false, error: "invalidRoster" };
  for (const [slot, id] of run.roster.activeIds.entries()) {
    const entry = run.roster.entries[id];
    if (
      !isRecord(entry) ||
      entry.id !== id ||
      !isRecord(entry.snapshot) ||
      !isRecord(entry.snapshot.config) ||
      entry.snapshot.config.id !== id ||
      entry.snapshot.kind !== (id === MAIN_ID ? "main" : "companion") ||
      !isRecord(entry.location) ||
      entry.location.kind !== "active" ||
      entry.location.slot !== slot
    )
      return { ok: false, error: "invalidRoster" };
  }
  for (const id of run.roster.reserveIds) {
    const entry = run.roster.entries[id];
    if (
      !isRecord(entry) ||
      entry.id !== id ||
      !isRecord(entry.snapshot) ||
      !isRecord(entry.snapshot.config) ||
      entry.snapshot.config.id !== id ||
      entry.snapshot.kind !== "companion" ||
      !isRecord(entry.location) ||
      entry.location.kind !== "reserve" ||
      !isRecord(entry.location.runtime)
    )
      return { ok: false, error: "invalidRoster" };
  }
  for (const id of run.roster.orderIds) {
    const entry = run.roster.entries[id]!;
    if (
      entry.downedAtWave !== null &&
      (!validWaveNumber(entry.downedAtWave) ||
        entry.downedAtWave > run.wave)
    )
      return { ok: false, error: "invalidRoster" };
  }
  if (run.settledThroughWave >= run.wave)
    return { ok: false, error: "invalidState" };
  if (activeIds.length !== 3)
    return { ok: false, error: "invalidLineup" };
  if (activeIds[0] !== MAIN_ID)
    return { ok: false, error: "mainMustLead" };
  if (new Set(activeIds).size !== activeIds.length)
    return { ok: false, error: "duplicateFighter" };
  if (
    activeIds.some(
      (id) =>
        !run.roster.orderIds.includes(id) ||
        !run.roster.entries[id] ||
        run.roster.entries[id]!.snapshot.config.id !== id,
    )
  )
    return { ok: false, error: "unknownFighter" };

  const synced = syncSurvivalRosterState(run, battle);
  if (!synced.ok) return { ok: false, error: synced.error };
  const states = new Map<SurvivalFighterId, SurvivalFighterState>();
  for (const id of synced.value.roster.orderIds) {
    const state = readSurvivalFighterState(synced.value, battle, id);
    if (!state.ok) return state;
    states.set(id, state.value);
  }
  const reserveIds = synced.value.roster.orderIds.filter(
    (id) => !activeIds.includes(id),
  );
  const livingReserveRemains = reserveIds.some((id) => states.get(id)!.hp > 0);
  if (
    activeIds.slice(1).some((id, index) => {
      if (states.get(id)!.hp > 0) return false;
      const currentSlot = run.roster.activeIds.indexOf(id);
      return (
        currentSlot !== index + 1 ||
        livingReserveRemains ||
        synced.value.roster.entries[id]!.location.kind !== "active"
      );
    })
  )
    return { ok: false, error: "fighterDowned" };

  const entries: Record<SurvivalFighterId, SurvivalRosterEntry> = {
    ...synced.value.roster.entries,
  };
  activeIds.forEach((id, slot) => {
    const entry = entries[id]!;
    entries[id] = {
      ...entry,
      location: { kind: "active", slot: slot as SurvivalActiveSlot },
    };
  });
  for (const id of reserveIds) {
    const entry = entries[id]!;
    const state = states.get(id)!;
    entries[id] = {
      ...entry,
      location: {
        kind: "reserve",
        runtime: { hp: state.hp, energy: state.energy },
      },
    };
  }

  const fighters: Fighter[] = activeIds.map((id) => {
    const entry = entries[id]!;
    const previous = battle.sides[0].fighters.find(
      (fighter) => fighter.id === id,
    );
    const state = states.get(id)!;
    return {
      ...(previous ? structuredClone(previous) : {}),
      ...structuredClone(entry.snapshot.config),
      hp: state.hp,
      energy: state.energy,
      spirit: previous?.spirit ?? SPIRIT_MAX,
      effects: previous ? structuredClone(previous.effects) : [],
    };
  });
  const nextBattle: BattleState = {
    ...structuredClone(battle),
    sides: [
      { ...structuredClone(battle.sides[0]), fighters },
      structuredClone(battle.sides[1]),
    ],
  };
  const nextRoster: SurvivalRoster = {
    ...synced.value.roster,
    activeIds: [activeIds[0]!, activeIds[1]!, activeIds[2]!],
    reserveIds,
    entries,
  };
  return {
    ok: true,
    value: {
      run: {
        ...synced.value,
        roster: nextRoster,
        downed: activeIds.map((id) => entries[id]!.downedAtWave),
      },
      battle: nextBattle,
    },
  };
}

/** Records the main character's requested next-wave build without changing battle stats or Profile. */
export function proposeSurvivalLeaderBuild(
  run: SurvivalRun,
  battle: BattleState,
  payload: unknown,
): SurvivalLeaderBuildResult {
  if (
    !isRecord(run) ||
    run.stateVersion !== 2 ||
    typeof run.done !== "boolean" ||
    !validWaveNumber(run.wave) ||
    !isRecord(run.roster) ||
    !isRecord(run.roster.entries) ||
    !isRecord(battle) ||
    !Array.isArray(battle.sides) ||
    battle.sides.length !== 2 ||
    !Array.isArray(battle.sides[0]?.fighters) ||
    !Array.isArray(battle.sides[1]?.fighters) ||
    ![null, 0, 1].includes(battle.winner)
  )
    return { ok: false, error: "invalidState" };
  if (run.done || battle.winner === 1)
    return { ok: false, error: "finished" };
  if (battle.winner !== 0)
    return { ok: false, error: "notBreak" };
  if (!isRecord(payload))
    return { ok: false, error: "invalidPayload" };
  if (
    Object.keys(payload).some(
      (key) => key !== "profession" && key !== "element",
    )
  )
    return { ok: false, error: "invalidPayload" };

  const entry = run.roster.entries?.[MAIN_ID];
  const leader = battle.sides[0].fighters[0];
  if (
    !isRecord(entry) ||
    entry.id !== MAIN_ID ||
    !isRecord(entry.snapshot) ||
    entry.snapshot.kind !== "main" ||
    !isRecord(entry.snapshot.config) ||
    entry.snapshot.config.id !== MAIN_ID ||
    !isRecord(entry.location) ||
    entry.location.kind !== "active" ||
    entry.location.slot !== 0 ||
    !leader ||
    leader.id !== MAIN_ID ||
    !Number.isInteger(leader.maxHp) ||
    leader.maxHp < 1 ||
    battle.sides[0].leader !== 0
  )
    return { ok: false, error: "invalidLeader" };

  const currentChoice: SurvivalLeaderBuildChoice =
    entry.snapshot.leaderBuildChoice ?? {
      profession: entry.snapshot.config.profession,
      element: entry.snapshot.config.element,
    };
  if (
    payload.profession !== undefined &&
    !isLeaderProfession(payload.profession)
  )
    return { ok: false, error: "invalidProfession" };
  if (
    payload.element !== undefined &&
    !ELEMENTS.includes(payload.element as Element)
  )
    return { ok: false, error: "invalidElement" };

  const choice: SurvivalLeaderBuildChoice = {
    profession:
      payload.profession === undefined
        ? currentChoice.profession
        : (payload.profession as Profession),
    element:
      payload.element === undefined
        ? currentChoice.element
        : (payload.element as Element),
  };
  if (
    choice.profession === currentChoice.profession &&
    choice.element === currentChoice.element &&
    entry.snapshot.leaderBuildChoice !== undefined
  )
    return { ok: true, run, choice };
  const existingProjection = entry.snapshot.leaderHpProjection;
  const projectionMatches =
    existingProjection?.hp === leader.hp &&
    existingProjection.maxHp === leader.maxHp;

  return {
    ok: true,
    choice,
    run: {
      ...run,
      roster: {
        ...run.roster,
        entries: {
          ...run.roster.entries,
          [MAIN_ID]: {
            ...entry,
            snapshot: {
              ...entry.snapshot,
              leaderBuildChoice: choice,
              leaderHpRatio: projectionMatches
                ? (entry.snapshot.leaderHpRatio ??
                  leader.hp / leader.maxHp)
                : leader.hp / leader.maxHp,
              leaderHpProjection: {
                hp: leader.hp,
                maxHp: leader.maxHp,
              },
              },
          },
        },
      },
    },
  };
}

/** Applies the final staged leader build once, preserving a canonical HP fraction and current energy. */
export function applySurvivalLeaderBuild(
  run: SurvivalRun,
  battle: BattleState,
): SurvivalLeaderBuildApplyResult {
  if (
    run.stateVersion !== 2 ||
    !Number.isInteger(run.wave) ||
    !run.roster.entries ||
    !battle.sides?.[0]?.fighters
  )
    return { ok: false, error: "invalidState" };
  if (run.done || battle.winner === 1)
    return { ok: false, error: "finished" };
  if (battle.winner !== 0)
    return { ok: false, error: "notBreak" };

  const entry = run.roster.entries[MAIN_ID];
  const fighter = battle.sides[0].fighters[0];
  const mainBuild = entry?.snapshot.mainBuild;
  if (
    entry?.id !== MAIN_ID ||
    entry.snapshot.kind !== "main" ||
    entry.location.kind !== "active" ||
    entry.location.slot !== 0 ||
    fighter?.id !== MAIN_ID ||
    battle.sides[0].leader !== 0
  )
    return { ok: false, error: "invalidLeader" };
  if (!mainBuild || mainBuild.kind !== "snapshot")
    return { ok: false, error: "buildUnavailable" };

  const choice = entry.snapshot.leaderBuildChoice ?? {
    profession: entry.snapshot.config.profession,
    element: entry.snapshot.config.element,
  };
  if (
    !isLeaderProfession(choice.profession) ||
    !ELEMENTS.includes(choice.element)
  )
    return { ok: false, error: "invalidPayload" };
  if (
    !Number.isInteger(fighter.maxHp) ||
    fighter.maxHp <= 0 ||
    !Number.isInteger(fighter.hp) ||
    fighter.hp < 0 ||
    fighter.hp > fighter.maxHp
  )
    return { ok: false, error: "invalidHp" };
  const projection = entry.snapshot.leaderHpProjection;
  const projectionMatches =
    projection?.hp === fighter.hp &&
    projection.maxHp === fighter.maxHp;
  const ratio = projectionMatches
    ? (entry.snapshot.leaderHpRatio ?? fighter.hp / fighter.maxHp)
    : fighter.hp / fighter.maxHp;
  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1)
    return { ok: false, error: "invalidState" };

  let loadout = EMPTY_LOADOUT;
  if (entry.snapshot.equipment.kind === "snapshot") {
    const equipment = entry.snapshot.equipment.value;
    if (
      equipment.characterId !== MAIN_ID ||
      new Set(equipment.items.map((item) => item.id)).size !==
        equipment.items.length
    )
      return { ok: false, error: "invalidLeader" };
    for (const item of equipment.items) {
      const equipped = equip(loadout, item);
      if (!equipped.ok) return { ok: false, error: "invalidLeader" };
      loadout = equipped.loadout;
    }
  }
  const rebuilt = withGear(
    buildMain(mainBuild.progress, choice.element, choice.profession),
    loadout,
  );
  const rebuiltSkillLevels = rebuilt.skillLevels ?? {};
  const matchesLoadout = (config: FighterConfig): boolean => {
    const skillsMatch =
      config.skills?.length === rebuilt.skills?.length &&
      (config.skills ?? []).every(
        (skill, index) => skill === rebuilt.skills?.[index],
      );
    const levels = config.skillLevels ?? {};
    const levelsMatch =
      Object.keys(levels).length === Object.keys(rebuiltSkillLevels).length &&
      Object.entries(rebuiltSkillLevels).every(
        ([skill, level]) => levels[skill] === level,
      );
    return skillsMatch && levelsMatch;
  };
  const currentConfig = entry.snapshot.config;
  if (
    currentConfig.profession === choice.profession &&
    currentConfig.element === choice.element &&
    matchesLoadout(currentConfig) &&
    matchesLoadout(fighter)
  )
    return { ok: true, value: { run, battle } };

  const nextConfig: FighterConfig = {
    ...entry.snapshot.config,
    profession: choice.profession,
    element: choice.element,
    maxHp: rebuilt.maxHp,
    atk: rebuilt.atk,
    def: rebuilt.def,
    skills: rebuilt.skills,
    skillLevels: rebuilt.skillLevels,
    ...(rebuilt.comboPassive
      ? { comboPassive: rebuilt.comboPassive }
      : {}),
    ...(rebuilt.chasePassives
      ? { chasePassives: rebuilt.chasePassives }
      : {}),
  };
  const nextHp = rescaleSurvivalHp(
    fighter.hp,
    fighter.maxHp,
    nextConfig.maxHp,
    ratio,
  );
  const nextFighter: Fighter = {
    ...structuredClone(fighter),
    ...nextConfig,
    hp: nextHp,
  };
  const nextBattle: BattleState = {
    ...structuredClone(battle),
    sides: [
      {
        ...structuredClone(battle.sides[0]),
        fighters: [
          nextFighter,
          ...structuredClone(battle.sides[0].fighters.slice(1)),
        ],
      },
      structuredClone(battle.sides[1]),
    ],
  };
  const nextEntry: SurvivalRosterEntry = {
    ...entry,
    snapshot: {
      ...entry.snapshot,
      config: nextConfig,
      leaderHpRatio: ratio,
      leaderHpProjection: { hp: nextHp, maxHp: nextConfig.maxHp },
    },
  };
  return {
    ok: true,
    value: {
      run: {
        ...run,
        roster: {
          ...run.roster,
          entries: { ...run.roster.entries, [MAIN_ID]: nextEntry },
        },
      },
      battle: nextBattle,
    },
  };
}
