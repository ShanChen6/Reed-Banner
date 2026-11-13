// Sinh tồn (lộ trình 5.3): một trận 3vs3 không dừng trên cùng bàn cờ, đối thủ kéo đến theo đợt mạnh dần.
// Giữa hai đợt: người còn sống hồi máu, thêm lương, hồi sinh tối đa 1 người. Điểm là số đợt đã vượt qua.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/02-game-modes/README.md mục 4.

import type { Difficulty } from "../ai";
import {
  ENERGY_MAX,
  FOOD_MAX,
  type BattleState,
  type Fighter,
  type FighterConfig,
  type SideConfig,
  type Element,
  type Profession,
  type WaveConfig,
} from "../battle";
import { BOSS_HP, WARLORD_ENCOUNTERS, warlordLeader } from "../campaign";
import {
  type GearItem,
} from "../gear";
import {
  leveledFoe,
  loadoutOf,
  MAIN_ID,
  MAX_LEVEL,
  ownsCompanion,
  progressOf,
  type CharacterProgress,
  type Profile,
  profileTeam,
} from "../progress";
import { createRng, type Rng } from "../rng";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";
import {
  validHpRatio,
} from "./serialize";

/** Người còn sống hồi chừng này phần máu tối đa giữa hai đợt. */
export const SURVIVAL_HEAL = 0.2;
/** Dự bị còn sống hồi phần máu tối đa này sau mỗi đợt thắng. */
export const SURVIVAL_RESERVE_HEAL = 0.1;
/** Lương cộng thêm giữa hai đợt. */
export const SURVIVAL_FOOD = 25;
/** Người gục tự đứng dậy sau chừng này đợt, tính cả đợt bị gục (gục ở đợt 3 thì nghỉ đợt 4, vào lại đợt 5). */
export const SURVIVAL_REVIVE_WAVES = 2;
/** Lương để hồi sinh ngay ở lần nghỉ giữa đợt. */
export const SURVIVAL_REVIVE_FOOD = 40;
/** Máu khi hồi sinh, theo phần máu tối đa; năng lượng về 0. */
export const SURVIVAL_REVIVE_HP = 0.3;
/** Cứ chừng này đợt có một đợt trùm: một sứ quân dẫn hai tùy tướng, máu ×BOSS_HP. */
export const SURVIVAL_BOSS_EVERY = 5;
/** Đợt 1–2 có 2 đối thủ, từ đợt 3 có 3. */
export const SURVIVAL_SMALL_WAVES = 2;
/** Đối thủ tăng 1 cấp sau chừng này đợt (tối đa 30). */
export const SURVIVAL_WAVES_PER_LEVEL = 4;
/** Sức mạnh đối thủ (nhân vào máu và công): đợt 1 là START, mỗi đợt sau cộng STEP. */
export const SURVIVAL_POWER_START = 0.45;
export const SURVIVAL_POWER_STEP = 0.05;
/** Máu đối thủ nhân thêm hệ số này để mỗi đợt ngắn (mục tiêu 6–10 lượt mỗi bên). */
export const SURVIVAL_FOE_HP = 0.6;
/** Vàng thưởng cho mỗi đợt đã vượt qua khi lượt chơi kết thúc. */
export const SURVIVAL_WAVE_GOLD = 10;

/** Lượt chơi sinh tồn, lưu trong trận. `seed` chỉ nằm trên server. */
export interface SurvivalRun {
  /** Version của snapshot roster được ghi trong lượt chơi. */
  readonly stateVersion: 2;
  readonly seed: number;
  /** Cấp nhân vật chính lúc bắt đầu; đối thủ tính cấp từ đây. */
  readonly baseLevel: number;
  /** Đợt đang đánh (hoặc vừa thắng, khi đang nghỉ). */
  readonly wave: number;
  /** Legacy active-slot projection; roster.entries[id].downedAtWave is the authoritative ID-based state. */
  readonly downed: readonly (number | null)[];
  /** Snapshot fighter identity/config của toàn bộ roster; battle vẫn giữ runtime của active. */
  readonly roster: SurvivalRoster;
  /** Wave cuối đã settle để mở wave kế. */
  readonly settledThroughWave: number;
  /** Lượt chơi đã kết thúc (thua, dừng lại, hoặc bỏ dở quá 24 giờ). */
  readonly done: boolean;
}

export type SurvivalFighterId = string;
export type SurvivalActiveSlot = 0 | 1 | 2;

export interface SurvivalGearSnapshot {
  readonly items: readonly GearItem[];
  readonly characterId: SurvivalFighterId;
}

export interface SurvivalFighterSnapshot {
  readonly kind: "main" | "companion";
  /** Config đã dựng theo progression/gear tại thời điểm bắt đầu run. */
  readonly config: FighterConfig;
  /** Requested next Survival build; effective stats/config are applied in a later transition step. */
  readonly leaderBuildChoice?: {
    readonly profession: Profession;
    readonly element: Element;
  };
  /** Exact health fraction synchronized from runtime; avoids cumulative rounding across build swaps. */
  readonly leaderHpRatio?: number;
  readonly leaderHpProjection?: { readonly hp: number; readonly maxHp: number };
  readonly equipment:
    | { readonly kind: "snapshot"; readonly value: SurvivalGearSnapshot }
    | { readonly kind: "legacyEmbedded" };
  /** Main build input để sau này đổi nghề/hệ mà không đọc/sửa Profile. */
  readonly mainBuild?: {
    readonly kind: "snapshot";
    readonly progress: CharacterProgress;
    readonly baseProfession: Profession;
    readonly baseElement: Element;
  };
}

export interface SurvivalRosterEntry {
  readonly id: SurvivalFighterId;
  readonly snapshot: SurvivalFighterSnapshot;
  readonly downedAtWave: number | null;
  /** Most recent wave this fighter was revived into; optional for older V2 snapshots. */
  readonly revivedAtWave?: number | null;
  readonly location:
    | { readonly kind: "active"; readonly slot: SurvivalActiveSlot }
    | {
        readonly kind: "reserve";
        readonly runtime: { readonly hp: number; readonly energy: number };
      };
}

/** Identity-based fighter state; config-derived values are exposed, not stored a second time. */
export interface SurvivalFighterState {
  readonly id: SurvivalFighterId;
  readonly hp: number;
  readonly maxHp: number;
  readonly energy: number;
  readonly element: Element;
  readonly profession: Profession;
  readonly atk: number;
  readonly def: number;
  readonly skills: readonly string[];
  readonly skillLevels: Readonly<Record<string, number>>;
  readonly equipment: SurvivalFighterSnapshot["equipment"];
  readonly downedAtWave: number | null;
  readonly location: SurvivalRosterEntry["location"]["kind"];
}

export type SurvivalFighterStateError =
  | "unknownFighter"
  | "rosterBattleMismatch"
  | "invalidHp"
  | "invalidEnergy"
  | "fighterDowned";

export type SurvivalFighterStateResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: SurvivalFighterStateError };

export interface SurvivalStatePair {
  readonly run: SurvivalRun;
  readonly battle: BattleState;
}

export interface SurvivalFighterRuntimePatch {
  readonly hp?: number;
  readonly energy?: number;
}

export interface SurvivalRoster {
  readonly activeIds: readonly [
    SurvivalFighterId,
    SurvivalFighterId,
    SurvivalFighterId,
  ];
  readonly reserveIds: readonly SurvivalFighterId[];
  /** Immutable initial roster order, used as a slot-independent revive tie-break. */
  readonly orderIds: readonly SurvivalFighterId[];
  readonly entries: Readonly<Record<SurvivalFighterId, SurvivalRosterEntry>>;
}

export interface SurvivalDownedFighter {
  readonly id: SurvivalFighterId;
  readonly name: string;
  readonly downedAtWave: number;
  readonly location: SurvivalRosterEntry["location"]["kind"];
}

export type StoredSurvivalRunResult =
  | { readonly ok: true; readonly run: SurvivalRun; readonly migrated: boolean }
  | { readonly ok: false; readonly error: "invalidSurvivalState" };

export type SurvivalRosterError =
  | "invalidActiveLineup"
  | "invalidReserveLineup"
  | "duplicateFighter"
  | "notOwned";

export type SurvivalRosterResult =
  | { readonly ok: true; readonly roster: SurvivalRoster }
  | { readonly ok: false; readonly error: SurvivalRosterError };

export type SurvivalRotationError =
  | "invalidState"
  | "notBreak"
  | "finished"
  | "invalidPayload"
  | "invalidRoster"
  | "invalidLineup"
  | "mainMustLead"
  | "duplicateFighter"
  | "unknownFighter"
  | "fighterDowned"
  | SurvivalFighterStateError;

export type SurvivalRotationResult =
  | { readonly ok: true; readonly value: SurvivalStatePair }
  | { readonly ok: false; readonly error: SurvivalRotationError };

export interface SurvivalLeaderBuildChoice {
  readonly profession: Profession;
  readonly element: Element;
}

export type SurvivalLeaderBuildError =
  | "invalidState"
  | "notBreak"
  | "finished"
  | "invalidPayload"
  | "invalidProfession"
  | "invalidElement"
  | "invalidLeader"
  | "buildUnavailable";

export type SurvivalLeaderBuildResult =
  | {
      readonly ok: true;
      readonly run: SurvivalRun;
      readonly choice: SurvivalLeaderBuildChoice;
    }
  | { readonly ok: false; readonly error: SurvivalLeaderBuildError };

export type SurvivalLeaderBuildApplyResult =
  | { readonly ok: true; readonly value: SurvivalStatePair }
  | { readonly ok: false; readonly error: SurvivalLeaderBuildError | SurvivalFighterStateError };

export interface SurvivalWave {
  readonly wave: number;
  readonly level: number;
  readonly boss: boolean;
  readonly difficulty: Difficulty;
  readonly foes: FighterConfig[];
}

export const isBossWave = (wave: number) => wave % SURVIVAL_BOSS_EVERY === 0;

export const survivalPower = (wave: number) =>
  SURVIVAL_POWER_START + SURVIVAL_POWER_STEP * (wave - 1);

/** Độ khó AI theo đợt. */
export function survivalDifficulty(wave: number): Difficulty {
  if (wave <= 2) return "easy";
  if (wave <= 6) return "normal";
  if (wave <= 12) return "hard";
  if (wave <= 20) return "boss";
  return "nightmare";
}

const FOE_POOL: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
];

const waveSeed = (seed: number, wave: number) =>
  (seed ^ Math.imul(wave, 0x85ebca6b)) >>> 0;

function pickDistinct<T>(rng: Rng, items: readonly T[], n: number): T[] {
  const pool = [...items];
  return Array.from(
    { length: n },
    () => pool.splice(rng.int(0, pool.length - 1), 1)[0]!,
  );
}

function scaled(f: FighterConfig, k: number): FighterConfig {
  return {
    ...f,
    maxHp: Math.round(f.maxHp * k * SURVIVAL_FOE_HP),
    atk: Math.round(f.atk * k),
  };
}

function equipmentSnapshot(
  profile: Profile,
  characterId: string,
): SurvivalGearSnapshot {
  const loadout = loadoutOf(profile, characterId);
  const items = [...Object.values(loadout.weapons), ...Object.values(loadout.slots)]
    .filter((item): item is GearItem => item !== undefined);
  return { characterId, items: structuredClone(items) };
}

/** Snapshot roster cho Survival; activeIds phải chứa main ở slot 0 và hai companion. */
export function createSurvivalRoster(
  profile: Profile,
  activeIds: readonly string[],
  reserveIds: readonly string[] = [],
): SurvivalRosterResult {
  if (
    activeIds.length !== 3 ||
    activeIds.some((id) => typeof id !== "string" || id.length === 0) ||
    activeIds[0] !== MAIN_ID ||
    activeIds[1] === MAIN_ID ||
    activeIds[2] === MAIN_ID
  )
    return { ok: false, error: "invalidActiveLineup" };
  if (
    reserveIds.length > 2 ||
    reserveIds.some((id) => typeof id !== "string" || id.length === 0)
  )
    return { ok: false, error: "invalidReserveLineup" };

  const allIds = [...activeIds, ...reserveIds];
  if (new Set(allIds).size !== allIds.length)
    return { ok: false, error: "duplicateFighter" };
  if (!activeIds.slice(1).every((id) => ownsCompanion(profile, id)) ||
      !reserveIds.every((id) => ownsCompanion(profile, id)))
    return { ok: false, error: "notOwned" };

  const configs = profileTeam(profile, [...activeIds.slice(1), ...reserveIds]);
  if (configs.length !== allIds.length)
    return { ok: false, error: "notOwned" };
  const byId = new Map(configs.map((config) => [config.id, config]));
  const entries: Record<string, SurvivalRosterEntry> = {};

  allIds.forEach((id, index) => {
    const config = byId.get(id);
    if (!config) return;
    const isMain = id === MAIN_ID;
    const snapshot: SurvivalFighterSnapshot = {
      kind: isMain ? "main" : "companion",
      config: structuredClone(config),
      ...(isMain
        ? {
            leaderBuildChoice: {
              profession: profile.profession,
              element: profile.element,
            },
            leaderHpRatio: 1,
            leaderHpProjection: { hp: config.maxHp, maxHp: config.maxHp },
          }
        : {}),
      equipment: {
        kind: "snapshot",
        value: equipmentSnapshot(profile, id),
      },
      ...(isMain
        ? {
            mainBuild: {
              kind: "snapshot" as const,
              progress: structuredClone(progressOf(profile, MAIN_ID)),
              baseProfession: profile.profession,
              baseElement: profile.element,
            },
          }
        : {}),
    };
    entries[id] = {
      id,
      snapshot,
      downedAtWave: null,
      revivedAtWave: null,
      location:
        index < 3
          ? { kind: "active", slot: index as SurvivalActiveSlot }
          : {
              kind: "reserve",
              runtime: { hp: config.maxHp, energy: 0 },
            },
    };
  });

  return {
    ok: true,
    roster: {
      activeIds: [activeIds[0]!, activeIds[1]!, activeIds[2]!],
      reserveIds: [...reserveIds],
      orderIds: [...allIds],
      entries,
    },
  };
}

/** Lấy FighterConfig active từ snapshot theo thứ tự slot; không dựng lại từ Profile. */
export function survivalActiveConfigs(
  roster: SurvivalRoster,
): readonly [FighterConfig, FighterConfig, FighterConfig] {
  const [a, b, c] = roster.activeIds.map((id) => roster.entries[id]!.snapshot.config);
  return [structuredClone(a!), structuredClone(b!), structuredClone(c!)];
}

/** Projects only the three active snapshots into the existing 3v3 battle contract. */
export function survivalActiveSideConfig(
  roster: SurvivalRoster,
): SurvivalFighterStateResult<SideConfig> {
  if (
    roster.activeIds.length !== 3 ||
    roster.activeIds[0] !== MAIN_ID ||
    roster.reserveIds.length > 2
  )
    return { ok: false, error: "rosterBattleMismatch" };
  const fighters: FighterConfig[] = [];
  for (let slot = 0; slot < roster.activeIds.length; slot++) {
    const id = roster.activeIds[slot]!;
    const entry = roster.entries[id];
    if (
      !entry ||
      entry.id !== id ||
      entry.location.kind !== "active" ||
      entry.location.slot !== slot ||
      roster.reserveIds.includes(id)
    )
      return { ok: false, error: "rosterBattleMismatch" };
    fighters.push(structuredClone(entry.snapshot.config));
  }
  return { ok: true, value: { fighters, leader: 0 } };
}

/** Rescales a fighter's canonical HP fraction once, without reviving or rounding upward across previews. */
export function rescaleSurvivalHp(
  hp: number,
  oldMaxHp: number,
  newMaxHp: number,
  normalizedRatio = hp / oldMaxHp,
): number {
  if (
    !Number.isInteger(hp) ||
    hp < 0 ||
    !Number.isInteger(oldMaxHp) ||
    oldMaxHp < 1 ||
    hp > oldMaxHp ||
    !Number.isInteger(newMaxHp) ||
    newMaxHp < 1 ||
    !validHpRatio(normalizedRatio)
  )
    throw new RangeError("Trạng thái máu Trấn Ải không hợp lệ");
  if (hp === 0) return 0;
  return Math.max(1, Math.min(newMaxHp, Math.round(normalizedRatio * newMaxHp)));
}

function activeFighter(
  roster: SurvivalRoster,
  battle: BattleState,
  id: SurvivalFighterId,
): Fighter | undefined {
  const slot = roster.activeIds.indexOf(id);
  if (slot < 0) return undefined;
  const entry = roster.entries[id];
  if (
    !entry ||
    entry.location.kind !== "active" ||
    entry.location.slot !== slot
  )
    return undefined;
  const fighter = battle.sides[0].fighters[slot];
  return fighter?.id === id ? fighter : undefined;
}

/** Reads config plus the sole authoritative runtime source for this fighter ID. */
export function readSurvivalFighterState(
  run: SurvivalRun,
  battle: BattleState,
  id: SurvivalFighterId,
): SurvivalFighterStateResult<SurvivalFighterState> {
  const entry = run.roster.entries[id];
  if (!entry || entry.id !== id)
    return { ok: false, error: "unknownFighter" };
  const config = entry.snapshot.config;
  let hp: number;
  let energy: number;
  if (entry.location.kind === "active") {
    const fighter = activeFighter(run.roster, battle, id);
    if (!fighter) return { ok: false, error: "rosterBattleMismatch" };
    hp = fighter.hp;
    energy = fighter.energy;
  } else {
    hp = entry.location.runtime.hp;
    energy = entry.location.runtime.energy;
  }
  if (
    !Number.isInteger(config.maxHp) ||
    config.maxHp < 1 ||
    !Number.isInteger(hp) ||
    hp < 0 ||
    hp > config.maxHp
  )
    return { ok: false, error: "invalidHp" };
  if (!Number.isInteger(energy) || energy < 0 || energy > ENERGY_MAX)
    return { ok: false, error: "invalidEnergy" };
  return {
    ok: true,
    value: {
      id,
      hp,
      maxHp: config.maxHp,
      energy,
      element: config.element,
      profession: config.profession,
      atk: config.atk,
      def: config.def,
      skills: structuredClone(config.skills ?? []),
      skillLevels: structuredClone(config.skillLevels ?? {}),
      equipment: structuredClone(entry.snapshot.equipment),
      downedAtWave: entry.downedAtWave,
      location: entry.location.kind,
    },
  };
}

/** Updates only runtime values; setting HP above zero never revives a downed fighter. */
export function updateSurvivalFighterRuntime(
  run: SurvivalRun,
  battle: BattleState,
  id: SurvivalFighterId,
  patch: SurvivalFighterRuntimePatch,
  wave: number,
): SurvivalFighterStateResult<SurvivalStatePair> {
  const current = readSurvivalFighterState(run, battle, id);
  if (!current.ok) return current;
  const nextHp = patch.hp ?? current.value.hp;
  const nextEnergy = patch.energy ?? current.value.energy;
  if (!Number.isInteger(nextHp) || nextHp < 0 || nextHp > current.value.maxHp)
    return { ok: false, error: "invalidHp" };
  if (!Number.isInteger(nextEnergy) || nextEnergy < 0 || nextEnergy > ENERGY_MAX)
    return { ok: false, error: "invalidEnergy" };
  if (current.value.hp === 0 && nextHp > 0)
    return { ok: false, error: "fighterDowned" };

  const entry = run.roster.entries[id]!;
  const downedAtWave =
    nextHp === 0 ? (entry.downedAtWave ?? wave) : entry.downedAtWave;
  const nextEntry: SurvivalRosterEntry = {
    ...entry,
    downedAtWave,
    ...(id === MAIN_ID
      ? {
          snapshot: {
            ...entry.snapshot,
            leaderHpRatio: nextHp / current.value.maxHp,
            leaderHpProjection: {
              hp: nextHp,
              maxHp: current.value.maxHp,
            },
          },
        }
      : {}),
    ...(entry.location.kind === "reserve"
      ? {
          location: {
            kind: "reserve" as const,
            runtime: { hp: nextHp, energy: nextEnergy },
          },
        }
      : {}),
  };
  const nextRoster: SurvivalRoster = {
    ...run.roster,
    entries: { ...run.roster.entries, [id]: nextEntry },
  };
  const downed = [...run.downed];
  const activeSlot = run.roster.activeIds.indexOf(id);
  if (activeSlot >= 0) downed[activeSlot] = downedAtWave;
  const nextRun = { ...run, roster: nextRoster, downed };
  if (activeSlot < 0) return { ok: true, value: { run: nextRun, battle } };

  const nextBattle = structuredClone(battle);
  const fighter = nextBattle.sides[0].fighters[activeSlot]!;
  fighter.hp = nextHp;
  fighter.energy = nextEnergy;
  return {
    ok: true,
    value: { run: nextRun, battle: nextBattle },
  };
}

/** Persists active knockouts by fighter ID; BattleState remains authoritative for active runtime. */
export function syncSurvivalRosterState(
  run: SurvivalRun,
  battle: BattleState,
): SurvivalFighterStateResult<SurvivalRun> {
  if (battle.sides[0].fighters.length !== 3)
    return { ok: false, error: "rosterBattleMismatch" };
  let entries = run.roster.entries;
  const downed = [...run.downed];
  for (let slot = 0; slot < run.roster.activeIds.length; slot++) {
    const id = run.roster.activeIds[slot]!;
    const state = readSurvivalFighterState(run, battle, id);
    if (!state.ok) return state;
    const fighter = battle.sides[0].fighters[slot];
    const entry = entries[id];
    if (!fighter || fighter.id !== id || !entry)
      return { ok: false, error: "rosterBattleMismatch" };
    if (entry.location.kind !== "active" || entry.location.slot !== slot)
      return { ok: false, error: "rosterBattleMismatch" };
    const downedAtWave =
      fighter.hp > 0 ? null : (entry.downedAtWave ?? run.wave);
    const projection = entry.snapshot.leaderHpProjection;
    const hpMatchesProjection =
      projection?.hp === fighter.hp &&
      projection.maxHp === fighter.maxHp;
    const snapshot =
      id === MAIN_ID
        ? hpMatchesProjection
          ? entry.snapshot
          : {
              ...entry.snapshot,
              leaderHpRatio: fighter.hp / fighter.maxHp,
              leaderHpProjection: {
                hp: fighter.hp,
                maxHp: fighter.maxHp,
              },
            }
        : entry.snapshot;
    if (
      entry.downedAtWave !== downedAtWave ||
      snapshot !== entry.snapshot
    ) {
      entries = { ...entries, [id]: { ...entry, downedAtWave, snapshot } };
    }
    if (fighter.hp > 0) {
      downed[slot] = null;
      continue;
    }
    downed[slot] = downedAtWave;
  }
  return {
    ok: true,
    value: {
      ...run,
      downed,
      roster:
        entries === run.roster.entries
          ? run.roster
          : { ...run.roster, entries },
    },
  };
}

export type SurvivalRecoveryError =
  | "noBreak"
  | "alreadySettled"
  | SurvivalFighterStateError;

export type SurvivalRecoveryResult =
  | { readonly ok: true; readonly value: SurvivalStatePair }
  | { readonly ok: false; readonly error: SurvivalRecoveryError };

/** Applies one break's recovery using the roster roles and fighter IDs from the completed wave. */
export function recoverSurvivalRoster(
  run: SurvivalRun,
  battle: BattleState,
): SurvivalRecoveryResult {
  if (!survivalBreak(run, battle))
    return { ok: false, error: "noBreak" };
  if (run.settledThroughWave >= run.wave)
    return { ok: false, error: "alreadySettled" };

  const synced = syncSurvivalRosterState(run, battle);
  if (!synced.ok) return synced;
  const nextBattle = structuredClone(battle);
  let entries = synced.value.roster.entries;

  for (const id of synced.value.roster.activeIds) {
    const state = readSurvivalFighterState(synced.value, battle, id);
    if (!state.ok) return state;
    if (state.value.hp === 0) continue;
    const slot = synced.value.roster.activeIds.indexOf(id);
    const fighter = nextBattle.sides[0].fighters[slot]!;
    fighter.hp = Math.min(
      fighter.maxHp,
      fighter.hp + Math.round(fighter.maxHp * SURVIVAL_HEAL),
    );
  }

  for (const id of synced.value.roster.reserveIds) {
    const state = readSurvivalFighterState(synced.value, battle, id);
    if (!state.ok) return state;
    if (state.value.hp === 0) continue;
    const entry = entries[id]!;
    if (entry.location.kind !== "reserve")
      return { ok: false, error: "rosterBattleMismatch" };
    entries = {
      ...entries,
      [id]: {
        ...entry,
        location: {
          kind: "reserve",
          runtime: {
            hp: Math.min(
              state.value.maxHp,
              state.value.hp +
                Math.round(state.value.maxHp * SURVIVAL_RESERVE_HEAL),
            ),
            energy: state.value.energy,
          },
        },
      },
    };
  }

  const mainEntry = entries[MAIN_ID];
  const mainFighter = nextBattle.sides[0].fighters[0];
  if (mainEntry && mainFighter) {
    entries = {
      ...entries,
      [MAIN_ID]: {
        ...mainEntry,
        snapshot: {
          ...mainEntry.snapshot,
          leaderHpRatio: mainFighter.hp / mainFighter.maxHp,
          leaderHpProjection: {
            hp: mainFighter.hp,
            maxHp: mainFighter.maxHp,
          },
        },
      },
    };
  }

  return {
    ok: true,
    value: {
      battle: nextBattle,
      run: {
        ...synced.value,
        settledThroughWave: run.wave,
        roster: { ...synced.value.roster, entries },
      },
    },
  };
}

export function newSurvivalRun(
  profile: Profile,
  seed: number,
  roster?: SurvivalRoster,
): SurvivalRun {
  const initialized =
    roster ??
    (() => {
      const result = createSurvivalRoster(profile, [MAIN_ID, ...profile.team]);
      if (!result.ok)
        throw new RangeError(`Không tạo được đội Trấn Ải: ${result.error}`);
      return result.roster;
    })();
  return {
    stateVersion: 2,
    seed: seed >>> 0,
    baseLevel: profile.main.level,
    wave: 1,
    downed: [null, null, null],
    roster: initialized,
    settledThroughWave: 0,
    done: false,
  };
}

/** Đối thủ của đợt `wave`: cùng seed luôn ra cùng đội. */
export function survivalWave(
  run: Pick<SurvivalRun, "seed" | "baseLevel">,
  wave: number,
): SurvivalWave {
  const rng = createRng(waveSeed(run.seed, wave));
  const level = Math.max(
    1,
    Math.min(
      MAX_LEVEL,
      run.baseLevel + Math.floor((wave - 1) / SURVIVAL_WAVES_PER_LEVEL),
    ),
  );
  const k = survivalPower(wave);
  const boss = isBossWave(wave);
  const count = boss ? 2 : wave <= SURVIVAL_SMALL_WAVES ? 2 : 3;
  const aides = pickDistinct(rng, FOE_POOL, count).map((f) =>
    scaled(leveledFoe(f, level), k),
  );
  const difficulty = survivalDifficulty(wave);
  if (!boss) return { wave, level, boss, difficulty, foes: aides };
  const warlord =
    WARLORD_ENCOUNTERS[rng.int(0, WARLORD_ENCOUNTERS.length - 1)]!;
  const leader = scaled(warlordLeader(warlord, level), k);
  return {
    wave,
    level,
    boss,
    difficulty,
    foes: [{ ...leader, maxHp: Math.round(leader.maxHp * BOSS_HP) }, ...aides],
  };
}

/** Báo trước đợt kế tiếp: chỉ tên, hệ, nghề, không lộ seed. */
export interface WavePreview {
  readonly wave: number;
  readonly boss: boolean;
  readonly level: number;
  readonly foes: readonly {
    readonly id: string;
    readonly name: string;
    readonly element: Element;
    readonly profession: Profession;
  }[];
}

export function wavePreview(
  run: Pick<SurvivalRun, "seed" | "baseLevel">,
  wave: number,
): WavePreview {
  const w = survivalWave(run, wave);
  return {
    wave,
    boss: w.boss,
    level: w.level,
    foes: w.foes.map(({ id, name, element, profession }) => ({
      id,
      name,
      element,
      profession,
    })),
  };
}

/** Đang nghỉ giữa hai đợt: phe người chơi vừa thắng đợt hiện tại và lượt chơi chưa kết thúc. */
export const survivalBreak = (run: SurvivalRun, battle: BattleState) =>
  !run.done && battle.winner === 0;

/** Số đợt đã vượt qua. */
export const survivalCleared = (run: SurvivalRun, battle: BattleState) =>
  battle.winner === 0 ? run.wave : run.wave - 1;

/** Người gục sau đợt vừa xong: ai mới gục thì ghi đợt hiện tại. */
export function downedAfterWave(
  run: Pick<SurvivalRun, "downed" | "wave">,
  battle: BattleState,
): (number | null)[] {
  return battle.sides[0].fighters.map((f, i) =>
    f.hp > 0 ? null : (run.downed[i] ?? run.wave),
  );
}

/** Downed candidates in stable roster order, including reserve fighters. */
export function downedFightersAfterWave(
  run: SurvivalRun,
  battle: BattleState,
): SurvivalDownedFighter[] {
  const activeHp = new Map(
    run.roster.activeIds.map((id, slot) => [
      id,
      battle.sides[0].fighters[slot]?.hp,
    ]),
  );
  return run.roster.orderIds.flatMap((id) => {
    const entry = run.roster.entries[id];
    if (!entry) return [];
    const hp =
      entry.location.kind === "active"
        ? activeHp.get(id)
        : entry.location.runtime.hp;
    if (hp !== 0) return [];
    const downedAtWave = entry.downedAtWave ?? run.wave;
    return [
      {
        id,
        name: entry.snapshot.config.name,
        downedAtWave,
        location: entry.location.kind,
      },
    ];
  });
}

export type SurvivalError =
  | "noBreak"
  | "invalidRevive"
  | "notEnoughFood"
  | "alreadySettled"
  | "invalidRoster";

export type BreakPlan =
  | {
      readonly ok: true;
      readonly run: SurvivalRun;
      readonly wave: SurvivalWave;
      readonly battle: BattleState;
      readonly config: WaveConfig;
    }
  | { readonly ok: false; readonly error: SurvivalError };

/**
 * Lần nghỉ giữa đợt: cộng lương, hồi sinh tối đa 1 người, dựng đợt kế. `paidRevive` là vị trí người chơi
 * trả SURVIVAL_REVIVE_FOOD lương để hồi sinh ngay; bỏ trống thì hồi sinh tự động người đã nghỉ đủ đợt.
 */
export function planBreak(
  run: SurvivalRun,
  battle: BattleState,
  paidRevive?: SurvivalFighterId | number,
): BreakPlan {
  if (!survivalBreak(run, battle)) return { ok: false, error: "noBreak" };
  const recovery = recoverSurvivalRoster(run, battle);
  if (!recovery.ok) {
    return {
      ok: false,
      error:
        recovery.error === "noBreak" || recovery.error === "alreadySettled"
          ? recovery.error
          : "invalidRoster",
    };
  }
  const { battle: recoveredBattle } = recovery.value;
  const recoveredRun = recovery.value.run;
  const downed = downedAfterWave(recoveredRun, recoveredBattle);
  const downedFighters = downedFightersAfterWave(recoveredRun, recoveredBattle);
  let food = Math.min(FOOD_MAX, battle.sides[0].food + SURVIVAL_FOOD);
  const autoReviveId = autoReviveFighterId(run.wave, downedFighters);
  let reviveId: SurvivalFighterId | null = null;
  if (paidRevive !== undefined) {
    if (autoReviveId !== null)
      return { ok: false, error: "invalidRevive" };
    const selectedId =
      typeof paidRevive === "number"
        ? recoveredRun.roster.activeIds[paidRevive]
        : paidRevive;
    const selected = downedFighters.find((fighter) => fighter.id === selectedId);
    if (!selected)
      return { ok: false, error: "invalidRevive" };
    if (food < SURVIVAL_REVIVE_FOOD)
      return { ok: false, error: "notEnoughFood" };
    food -= SURVIVAL_REVIVE_FOOD;
    reviveId = selected.id;
  } else {
    reviveId = autoReviveId;
  }
  let revivedSlot: number | null = null;
  let entries = recoveredRun.roster.entries;
  if (reviveId !== null) {
    const entry = entries[reviveId]!;
    if (entry.location.kind === "active") {
      revivedSlot = entry.location.slot;
      downed[revivedSlot] = null;
    }
    entries = {
      ...entries,
      [reviveId]: {
        ...entry,
        downedAtWave: null,
        revivedAtWave: run.wave + 1,
        ...(entry.location.kind === "reserve"
          ? {
              location: {
                kind: "reserve" as const,
                runtime: {
                  hp: Math.max(
                    1,
                    Math.round(
                      entry.snapshot.config.maxHp * SURVIVAL_REVIVE_HP,
                    ),
                  ),
                  energy: 0,
                },
              },
            }
          : {}),
      },
    };
  }
  const wave = survivalWave(run, run.wave + 1);
  return {
    ok: true,
    run: {
      ...run,
      wave: wave.wave,
      downed,
      settledThroughWave: recoveredRun.settledThroughWave,
      roster: {
        ...recoveredRun.roster,
        entries,
      },
    },
    wave,
    battle: recoveredBattle,
    config: {
      wave: wave.wave,
      foes: { fighters: wave.foes, leader: 0 },
      heal: 0,
      food,
      revive: revivedSlot === null ? [] : [revivedSlot],
      reviveHp: SURVIVAL_REVIVE_HP,
    },
  };
}

/** Selects one eligible fighter by oldest downed wave, then stable roster order. */
export function autoReviveFighterId(
  cleared: number,
  downed: readonly SurvivalDownedFighter[],
): SurvivalFighterId | null {
  let pick: SurvivalDownedFighter | null = null;
  for (const fighter of downed) {
    if (
      cleared - fighter.downedAtWave <
      SURVIVAL_REVIVE_WAVES - 1
    )
      continue;
    if (
      pick === null ||
      fighter.downedAtWave < pick.downedAtWave
    )
      pick = fighter;
  }
  return pick?.id ?? null;
}

export interface SurvivalResult {
  readonly cleared: number;
  readonly best: number;
  readonly newBest: boolean;
  readonly gold: number;
}

/** Cộng kết quả lượt chơi sinh tồn vào hồ sơ: kỷ lục và vàng theo số đợt. */
export function applySurvivalResult(
  profile: Profile,
  cleared: number,
): { profile: Profile; result: SurvivalResult } {
  const newBest = cleared > profile.survival.best;
  const best = newBest ? cleared : profile.survival.best;
  const gold = SURVIVAL_WAVE_GOLD * cleared;
  return {
    profile: {
      ...profile,
      gold: profile.gold + gold,
      survival: { best },
    },
    result: { cleared, best, newBest, gold },
  };
}
