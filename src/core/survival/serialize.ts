// Đọc lượt chơi Trấn Ải đã lưu (hồ sơ, trận đang dở) và kiểm từng trường; dữ liệu sai dạng thì trả null thay vì ném lỗi.
// Tách từ survival.ts ngày 12/11/2026, không đổi logic.

import {
  ENERGY_MAX,
  ELEMENTS,
  isLeaderProfession,
  normalizeProfession,
  type BattleState,
  type Fighter,
  type FighterConfig,
  type Element,
  type Profession,
} from "../battle";

import {
  MAIN_ID,
} from "../progress";
import type {
  StoredSurvivalRunResult,
  SurvivalActiveSlot,
  SurvivalFighterSnapshot,
  SurvivalGearSnapshot,
  SurvivalRosterEntry,
} from "./survival";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validWaveNumber(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 1;
}

export function validHpRatio(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

export function parseFighterConfig(value: unknown): FighterConfig | null {
  if (isRecord(value)) value = {...value,profession:normalizeProfession(value.profession)};
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    typeof value.name !== "string" ||
    !ELEMENTS.includes(value.element as Element) ||
    !normalizeProfession(value.profession) ||
    !Number.isInteger(value.maxHp) ||
    (value.maxHp as number) < 1 ||
    !Number.isInteger(value.atk) ||
    !Number.isInteger(value.def)
  )
    return null;
  if (
    value.skills !== undefined &&
    (!Array.isArray(value.skills) ||
      !value.skills.every((skill) => typeof skill === "string"))
  )
    return null;
  if (
    value.skillLevels !== undefined &&
    (!isRecord(value.skillLevels) ||
      !Object.values(value.skillLevels).every(
        (level) => Number.isInteger(level) && (level as number) >= 1,
      ))
  )
    return null;
  return structuredClone(value) as unknown as FighterConfig;
}

export function parseDowned(value: unknown, wave: number): (number | null)[] | null {
  if (!Array.isArray(value) || value.length !== 3) return null;
  if (
    !value.every(
      (downed) =>
        downed === null ||
        (validWaveNumber(downed) && downed <= wave),
    )
  )
    return null;
  return [...value] as (number | null)[];
}

export function legacyFighterConfig(fighter: Fighter): FighterConfig | null {
  return parseFighterConfig({
    id: fighter.id,
    name: fighter.name,
    element: fighter.element,
    profession: fighter.profession,
    maxHp: fighter.maxHp,
    atk: fighter.atk,
    def: fighter.def,
    ...(fighter.comboPassive ? { comboPassive: fighter.comboPassive } : {}),
    ...(fighter.skills ? { skills: fighter.skills } : {}),
    ...(fighter.skillLevels ? { skillLevels: fighter.skillLevels } : {}),
    ...(fighter.chasePassives ? { chasePassives: fighter.chasePassives } : {}),
  });
}

export function parseEquipmentSnapshot(
  value: unknown,
): SurvivalFighterSnapshot["equipment"] | null {
  if (!isRecord(value)) return null;
  if (value.kind === "legacyEmbedded")
    return { kind: "legacyEmbedded" };
  if (
    value.kind !== "snapshot" ||
    !isRecord(value.value) ||
    typeof value.value.characterId !== "string" ||
    !Array.isArray(value.value.items) ||
    !value.value.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.slot === "string" &&
        typeof item.element === "string" &&
        Number.isInteger(item.tier) &&
        typeof item.set === "string" &&
        (item.profession === undefined ||
          typeof item.profession === "string"),
    )
  )
    return null;
  return {
    kind: "snapshot",
    value: structuredClone(value.value) as unknown as SurvivalGearSnapshot,
  };
}

export function sameFighterConfig(a: FighterConfig, b: FighterConfig): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.element === b.element &&
    a.profession === b.profession &&
    a.maxHp === b.maxHp &&
    a.atk === b.atk &&
    a.def === b.def &&
    a.comboPassive === b.comboPassive &&
    JSON.stringify(a.skills ?? []) === JSON.stringify(b.skills ?? []) &&
    JSON.stringify(a.skillLevels ?? {}) === JSON.stringify(b.skillLevels ?? {}) &&
    JSON.stringify(a.chasePassives ?? []) ===
      JSON.stringify(b.chasePassives ?? [])
  );
}

export function parseMainBuild(
  value: unknown,
): SurvivalFighterSnapshot["mainBuild"] | null | undefined {
  if (value === undefined) return undefined;
  if (
    !isRecord(value) ||
    value.kind !== "snapshot" ||
    !isRecord(value.progress) ||
    !ELEMENTS.includes(value.baseElement as Element) ||
    !isLeaderProfession(value.baseProfession)
  )
    return null;
  return structuredClone(value) as unknown as NonNullable<
    SurvivalFighterSnapshot["mainBuild"]
  >;
}

export function parseLeaderBuildChoice(
  value: unknown,
): SurvivalFighterSnapshot["leaderBuildChoice"] | null | undefined {
  if (value === undefined) return undefined;
  if (
    !isRecord(value) ||
    !ELEMENTS.includes(value.element as Element) ||
    !isLeaderProfession(value.profession)
  )
    return null;
  return {
    profession: value.profession as Profession,
    element: value.element as Element,
  };
}

/** Validates stored V2 Survival data or upgrades the historical three-active payload without healing. */
export function deserializeSurvivalRun(
  value: unknown,
  battle: BattleState,
): StoredSurvivalRunResult {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.seed) ||
    typeof value.seed !== "number" ||
    value.seed < 0 ||
    value.seed > 0xffffffff ||
    !Number.isInteger(value.baseLevel) ||
    typeof value.baseLevel !== "number" ||
    value.baseLevel < 1 ||
    typeof value.done !== "boolean"
  )
    return { ok: false, error: "invalidSurvivalState" };

  if (!validWaveNumber(value.wave))
    return { ok: false, error: "invalidSurvivalState" };
  const wave = value.wave;
  const downed = parseDowned(value.downed, wave);
  if (!downed) return { ok: false, error: "invalidSurvivalState" };

  if (!("stateVersion" in value) && !("roster" in value)) {
    const fighters = battle.sides[0]?.fighters;
    if (!fighters || fighters.length !== 3 || fighters[0]?.id !== MAIN_ID)
      return { ok: false, error: "invalidSurvivalState" };
    const ids = fighters.map((fighter) => fighter.id);
    if (ids.some((id) => !id) || new Set(ids).size !== 3)
      return { ok: false, error: "invalidSurvivalState" };
    if (fighters.some((fighter, slot) => fighter.hp > 0 && downed[slot] !== null))
      return { ok: false, error: "invalidSurvivalState" };
    const entries: Record<string, SurvivalRosterEntry> = {};
    fighters.forEach((fighter, slot) => {
      const config = legacyFighterConfig(fighter);
      if (!config) return;
      const id = fighter.id;
      entries[id] = {
        id,
        snapshot: {
          kind: slot === 0 ? "main" : "companion",
          config,
          equipment: { kind: "legacyEmbedded" },
        },
        downedAtWave: downed[slot] ?? (fighter.hp === 0 ? wave : null),
        location: { kind: "active", slot: slot as SurvivalActiveSlot },
      };
    });
    if (Object.keys(entries).length !== 3)
      return { ok: false, error: "invalidSurvivalState" };
    const migratedDowned = fighters.map((fighter, slot) =>
      fighter.hp > 0
        ? (downed[slot] ?? null)
        : (downed[slot] ?? wave),
    );
    return {
      ok: true,
      migrated: true,
      run: {
        stateVersion: 2,
        seed: value.seed,
        baseLevel: value.baseLevel,
        wave,
        downed: migratedDowned,
        roster: {
          activeIds: [ids[0]!, ids[1]!, ids[2]!],
          reserveIds: [],
          orderIds: [...ids],
          entries,
        },
        settledThroughWave: wave - 1,
        done: value.done,
      },
    };
  }
  if (value.stateVersion !== 2 || !("roster" in value))
    return { ok: false, error: "invalidSurvivalState" };

  const roster = value.roster;
  if (
    !isRecord(roster) ||
    !Array.isArray(roster.activeIds) ||
    roster.activeIds.length !== 3 ||
    roster.activeIds[0] !== MAIN_ID ||
    !Array.isArray(roster.reserveIds) ||
    roster.reserveIds.length > 2 ||
    !isRecord(roster.entries) ||
    !Number.isInteger(value.settledThroughWave) ||
    typeof value.settledThroughWave !== "number" ||
    value.settledThroughWave < 0 ||
    value.settledThroughWave > wave
  )
    return { ok: false, error: "invalidSurvivalState" };

  const activeIds = roster.activeIds;
  const reserveIds = roster.reserveIds;
  const ids = [...activeIds, ...reserveIds];
  const orderIds =
    roster.orderIds === undefined
      ? ids
      : Array.isArray(roster.orderIds)
        ? roster.orderIds
        : null;
  if (
    ids.some((id) => typeof id !== "string" || id.length === 0) ||
    new Set(ids).size !== ids.length ||
    !orderIds ||
    orderIds.length !== ids.length ||
    orderIds.some((id) => typeof id !== "string" || !ids.includes(id)) ||
    new Set(orderIds).size !== orderIds.length ||
    Object.keys(roster.entries).length !== ids.length ||
    ids.some((id) => !Object.hasOwn(roster.entries!, id as string))
  )
    return { ok: false, error: "invalidSurvivalState" };

  const entries: Record<string, SurvivalRosterEntry> = {};
  for (const [slot, id] of activeIds.entries()) {
    const raw = roster.entries[id as string];
    if (
      !isRecord(raw) ||
      raw.id !== id ||
      raw.downedAtWave !== downed[slot] ||
      !isRecord(raw.snapshot) ||
      raw.snapshot.kind !== (slot === 0 ? "main" : "companion") ||
      !("equipment" in raw.snapshot)
    )
      return { ok: false, error: "invalidSurvivalState" };
    const config = parseFighterConfig(raw.snapshot.config);
    const equipment = parseEquipmentSnapshot(raw.snapshot.equipment);
    const fighter = battle.sides[0]?.fighters[slot];
    const battleConfig = fighter ? legacyFighterConfig(fighter) : null;
    const mainBuild = slot === 0 ? parseMainBuild(raw.snapshot.mainBuild) : undefined;
    const leaderBuildChoice =
      slot === 0
        ? parseLeaderBuildChoice(raw.snapshot.leaderBuildChoice)
        : undefined;
    const leaderHpRatio =
      slot === 0 && typeof raw.snapshot.leaderHpRatio === "number"
        ? raw.snapshot.leaderHpRatio
        : undefined;
    const rawLeaderHpProjection =
      slot === 0 ? raw.snapshot.leaderHpProjection : undefined;
    const leaderHpProjection =
      slot === 0 &&
      isRecord(rawLeaderHpProjection) &&
      typeof rawLeaderHpProjection.hp === "number" &&
      typeof rawLeaderHpProjection.maxHp === "number"
        ? {
            hp: rawLeaderHpProjection.hp,
            maxHp: rawLeaderHpProjection.maxHp,
          }
        : undefined;
    if (
      !config ||
      !equipment ||
      (equipment.kind === "snapshot" &&
        equipment.value.characterId !== id) ||
      (slot === 0 && raw.snapshot.mainBuild !== undefined && !mainBuild) ||
      (slot === 0 &&
        raw.snapshot.leaderBuildChoice !== undefined &&
        !leaderBuildChoice) ||
      (slot !== 0 && raw.snapshot.leaderBuildChoice !== undefined) ||
      (slot === 0 &&
        raw.snapshot.leaderHpRatio !== undefined &&
        !validHpRatio(raw.snapshot.leaderHpRatio)) ||
      (slot !== 0 && raw.snapshot.leaderHpRatio !== undefined) ||
      (slot === 0 &&
        rawLeaderHpProjection !== undefined &&
        (!isRecord(rawLeaderHpProjection) ||
          !Number.isInteger(rawLeaderHpProjection.hp) ||
          !Number.isInteger(rawLeaderHpProjection.maxHp) ||
          rawLeaderHpProjection.hp !== fighter?.hp ||
          rawLeaderHpProjection.maxHp !== fighter?.maxHp)) ||
      (slot !== 0 && raw.snapshot.leaderHpProjection !== undefined) ||
      (raw.revivedAtWave !== undefined &&
        raw.revivedAtWave !== null &&
        (!validWaveNumber(raw.revivedAtWave) ||
          raw.revivedAtWave > wave)) ||
      config.id !== id ||
      !battleConfig ||
      !sameFighterConfig(config, battleConfig) ||
      !fighter ||
      fighter.id !== id ||
      fighter.maxHp !== config.maxHp ||
      !Number.isInteger(fighter.hp) ||
      fighter.hp < 0 ||
      fighter.hp > config.maxHp ||
      !Number.isInteger(fighter.energy) ||
      fighter.energy < 0 ||
      fighter.energy > ENERGY_MAX ||
      (fighter.hp === 0) !== (raw.downedAtWave !== null) ||
      !isRecord(raw.location) ||
      raw.location.kind !== "active" ||
      raw.location.slot !== slot
    )
      return { ok: false, error: "invalidSurvivalState" };
    entries[id as string] = {
      id: id as string,
      snapshot: {
        kind: slot === 0 ? "main" : "companion",
        config,
        equipment,
        ...(mainBuild ? { mainBuild } : {}),
        ...(leaderBuildChoice ? { leaderBuildChoice } : {}),
        ...(leaderHpRatio !== undefined ? { leaderHpRatio } : {}),
        ...(leaderHpProjection ? { leaderHpProjection } : {}),
      },
      downedAtWave: raw.downedAtWave as number | null,
      revivedAtWave:
        raw.revivedAtWave === undefined
          ? null
          : (raw.revivedAtWave as number | null),
      location: { kind: "active", slot: slot as SurvivalActiveSlot },
    };
  }
  for (const id of reserveIds) {
    const raw = roster.entries[id as string];
    if (
      !isRecord(raw) ||
      raw.id !== id ||
      !("downedAtWave" in raw) ||
      (raw.downedAtWave !== null &&
        (!validWaveNumber(raw.downedAtWave) ||
          raw.downedAtWave > wave)) ||
      (raw.revivedAtWave !== undefined &&
        raw.revivedAtWave !== null &&
        (!validWaveNumber(raw.revivedAtWave) ||
          raw.revivedAtWave > wave)) ||
      !isRecord(raw.snapshot) ||
      raw.snapshot.kind !== "companion" ||
      !("equipment" in raw.snapshot) ||
      !isRecord(raw.location) ||
      raw.location.kind !== "reserve" ||
      !isRecord(raw.location.runtime)
    )
      return { ok: false, error: "invalidSurvivalState" };
    const config = parseFighterConfig(raw.snapshot.config);
    const equipment = parseEquipmentSnapshot(raw.snapshot.equipment);
    const hp = raw.location.runtime.hp;
    const energy = raw.location.runtime.energy;
    if (
      !config ||
      !equipment ||
      (equipment.kind === "snapshot" &&
        equipment.value.characterId !== id) ||
      config.id !== id ||
      !Number.isInteger(hp) ||
      typeof hp !== "number" ||
      hp < 0 ||
      hp > config.maxHp ||
      !Number.isInteger(energy) ||
      typeof energy !== "number" ||
      energy < 0 ||
      energy > ENERGY_MAX ||
      (hp === 0) !== (raw.downedAtWave !== null)
    )
      return { ok: false, error: "invalidSurvivalState" };
    entries[id as string] = {
      id: id as string,
      snapshot: { kind: "companion", config, equipment },
      downedAtWave: raw.downedAtWave as number | null,
      revivedAtWave:
        raw.revivedAtWave === undefined
          ? null
          : (raw.revivedAtWave as number | null),
      location: {
        kind: "reserve",
        runtime: { hp, energy },
      },
    };
  }

  return {
    ok: true,
    migrated: false,
    run: {
      stateVersion: 2,
      seed: value.seed,
      baseLevel: value.baseLevel,
      wave,
      downed,
      roster: {
        activeIds: [activeIds[0] as string, activeIds[1] as string, activeIds[2] as string],
        reserveIds: [...reserveIds] as string[],
        orderIds: [...orderIds] as string[],
        entries,
      },
      settledThroughWave: value.settledThroughWave,
      done: value.done,
    },
  };
}
