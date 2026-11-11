import { ENERGY_MAX, RAGE_MAX, type Element, type FighterConfig } from "../battle";
import { MAX_WEIGHT, MIN_WEIGHT, type SpawnWeights, type TileKind } from "../board";
import {
  DESTINY_BOON_IDS,
  DESTINY_BOON_STATE_RULES,
  type DestinyBoon,
  type DestinyBoonStack,
  type DestinyFighterSnapshot,
  type DestinyRun,
} from "../progress";
import { createRng } from "../rng";
import { DESTINY_FOOD_MAX } from "./destinyRun";
import { hashString } from "./floorContract";

export type DestinyBoonGroup = "offensive" | "defensive" | "vitality" | "logistics" | "tactical";
export type DestinyBoonRarity = "common" | "rare" | "epic";
export type DestinyBoonCondition =
  | "same_element_as_leader"
  | "has_equipment"
  | "is_leader"
  | "same_profession_as_leader"
  | "wounded";
export type DestinyBoonStat = "atk" | "def" | "maxHp";

/** Tướng vào trận dưới ngưỡng này (so với máu tối đa gốc) thì tính là bị thương cho Phúc Tử chiến. */
export const DESTINY_WOUNDED_RATIO = 0.5;
/** Địa lợi chuyển chừng này điểm tỉ lệ sinh ô (mỗi cộng dồn) từ ô vàng và sách sang ô hợp hệ thủ lĩnh. */
export const DESTINY_TERRAIN_SHIFT = 2;

type DestinyBoonEffect =
  | { readonly kind: "stat"; readonly stats: readonly DestinyBoonStat[]; readonly ratio: number; readonly condition?: DestinyBoonCondition }
  | { readonly kind: "energy"; readonly amount: number }
  | { readonly kind: "rage"; readonly amount: number }
  /** Cộng lương ngay lúc chọn; cộng dồn chỉ đếm số lần đã chọn. */
  | { readonly kind: "food"; readonly amount: number }
  /** Hồi máu sau mỗi tầng thắng cho tướng còn sống: dự bị (reserve) hoặc ba người vừa ra trận (active). */
  | { readonly kind: "floorHeal"; readonly target: "reserve" | "active"; readonly ratio: number }
  | { readonly kind: "terrain" };

export interface DestinyBoonDefinition {
  readonly id: DestinyBoon;
  readonly group: DestinyBoonGroup;
  readonly rarity: DestinyBoonRarity;
  readonly maxStacks: number;
  readonly effectVersion: number;
  readonly effect: DestinyBoonEffect;
  /** Version luật đầu tiên có Phúc này; run version thấp hơn không được offer. */
  readonly introducedIn: number;
  /** Chỉ offer ở phần thưởng của tầng này trở lên. */
  readonly minFloor?: number;
}

const boon = (
  id: DestinyBoon,
  group: DestinyBoonGroup,
  rarity: DestinyBoonRarity,
  effect: DestinyBoonEffect,
  extra: { readonly introducedIn?: number; readonly minFloor?: number } = {},
): DestinyBoonDefinition => ({
  id, group, rarity, ...DESTINY_BOON_STATE_RULES[id], effect,
  introducedIn: extra.introducedIn ?? 1,
  ...(extra.minFloor === undefined ? {} : { minFloor: extra.minFloor }),
});

const V2 = { introducedIn: 2 } as const;

/** 7 Phúc MVP và 8 Phúc của luật V2; chỉ dùng stat/runtime đã được battle core hỗ trợ. */
export const DESTINY_BOON_CATALOG: Readonly<Record<DestinyBoon, DestinyBoonDefinition>> = {
  atk: boon("atk", "offensive", "common", { kind: "stat", stats: ["atk"], ratio: 0.1 }),
  def: boon("def", "defensive", "common", { kind: "stat", stats: ["def"], ratio: 0.15 }),
  hp: boon("hp", "vitality", "common", { kind: "stat", stats: ["maxHp"], ratio: 0.1 }),
  elementalEdge: boon("elementalEdge", "offensive", "rare", {
    kind: "stat", stats: ["atk"], ratio: 0.08, condition: "same_element_as_leader",
  }),
  armoredFormation: boon("armoredFormation", "defensive", "rare", {
    kind: "stat", stats: ["def"], ratio: 0.08, condition: "has_equipment",
  }),
  supplyCache: boon("supplyCache", "logistics", "common", { kind: "energy", amount: 10 }),
  battleDrum: boon("battleDrum", "tactical", "rare", { kind: "rage", amount: 10 }),
  granary: boon("granary", "logistics", "common", { kind: "food", amount: 15 }, V2),
  vanguard: boon("vanguard", "offensive", "common", {
    kind: "stat", stats: ["atk"], ratio: 0.08, condition: "is_leader",
  }, V2),
  professionUnity: boon("professionUnity", "defensive", "rare", {
    kind: "stat", stats: ["def"], ratio: 0.08, condition: "same_profession_as_leader",
  }, V2),
  lastStand: boon("lastStand", "offensive", "rare", {
    kind: "stat", stats: ["atk"], ratio: 0.12, condition: "wounded",
  }, V2),
  rearGuard: boon("rearGuard", "vitality", "common", { kind: "floorHeal", target: "reserve", ratio: 0.05 }, V2),
  terrain: boon("terrain", "tactical", "rare", { kind: "terrain" }, V2),
  recuperate: boon("recuperate", "vitality", "rare", { kind: "floorHeal", target: "active", ratio: 0.04 }, V2),
  mandate: boon("mandate", "tactical", "epic", {
    kind: "stat", stats: ["atk", "def", "maxHp"], ratio: 0.05,
  }, { introducedIn: 2, minFloor: 11 }),
};

export const destinyBoonStacks = (run: DestinyRun, id: DestinyBoon): number =>
  run.boons?.find((entry) => entry.id === id)?.stacks ?? 0;

function conditionMatches(
  run: DestinyRun,
  config: FighterConfig,
  leader: FighterConfig,
  condition?: DestinyBoonCondition,
): boolean {
  switch (condition) {
    case undefined: return true;
    case "same_element_as_leader": return config.element === leader.element;
    case "has_equipment": return (run.fighters?.[config.id]?.equipment.length ?? 0) > 0;
    case "is_leader": return config.id === leader.id;
    case "same_profession_as_leader": return config.profession === leader.profession;
    case "wounded": {
      const fighter = run.fighters?.[config.id];
      return !!fighter && fighter.hp < fighter.config.maxHp * DESTINY_WOUNDED_RATIO;
    }
  }
}

/** Gear/element đã dựng xong trước; tất cả % Phúc cộng với nhau rồi nhân đúng một lần. */
export function applyDestinyBoonStats(run: DestinyRun, configs: readonly FighterConfig[]): FighterConfig[] {
  const leader = configs[0];
  if (!leader) return [...configs];
  return configs.map((config) => {
    const ratios = { atk: 0, def: 0, maxHp: 0 };
    for (const entry of run.boons ?? []) {
      const definition = DESTINY_BOON_CATALOG[entry.id];
      if (definition.effect.kind !== "stat" ||
          !conditionMatches(run, config, leader, definition.effect.condition)) continue;
      for (const stat of definition.effect.stats) ratios[stat] += definition.effect.ratio * entry.stacks;
    }
    return {
      ...config,
      atk: Math.round(config.atk * (1 + ratios.atk)),
      def: Math.round(config.def * (1 + ratios.def)),
      maxHp: Math.round(config.maxHp * (1 + ratios.maxHp)),
    };
  });
}

/** Ô hợp hệ thủ lĩnh cho Phúc Địa lợi. */
const TERRAIN_TILE: Readonly<Record<Element, TileKind>> = {
  kim: "kiem", moc: "tim", thuy: "amDuong", hoa: "kiem", tho: "banhChung", loi: "amDuong", phong: "trong",
};

/**
 * Bàn cờ của tầng sau Phúc Địa lợi: chuyển tỉ lệ từ ô vàng và sách sang ô hợp hệ thủ lĩnh.
 * Luôn giữ tổng 100 và biên [MIN_WEIGHT, MAX_WEIGHT]; không đủ chỗ thì chuyển ít hơn.
 */
export function applyDestinyTerrain(run: DestinyRun, weights: SpawnWeights, leaderElement: Element): SpawnWeights {
  const stacks = destinyBoonStacks(run, "terrain");
  if (stacks === 0) return weights;
  const favored = TERRAIN_TILE[leaderElement];
  const next: Record<TileKind, number> = { ...weights };
  for (const donor of ["vang", "sach"] as const) {
    const amount = Math.min(
      DESTINY_TERRAIN_SHIFT * stacks / 2,
      next[donor] - MIN_WEIGHT,
      MAX_WEIGHT - next[favored],
    );
    if (amount <= 0) continue;
    next[donor] -= amount;
    next[favored] += amount;
  }
  return next;
}

/** Hồi máu sau tầng thắng (Hậu quân, Dưỡng sức). `activeIds` là ba người vừa ra trận; người đã gục không hồi. */
export function applyDestinyFloorHeal(
  run: DestinyRun,
  fighters: Readonly<Record<string, DestinyFighterSnapshot>>,
  activeIds: readonly string[],
): Record<string, DestinyFighterSnapshot> {
  const next = { ...fighters };
  for (const entry of run.boons ?? []) {
    const effect = DESTINY_BOON_CATALOG[entry.id].effect;
    if (effect.kind !== "floorHeal") continue;
    for (const id of run.roster) {
      const fighter = next[id];
      if (!fighter || fighter.downed || fighter.hp <= 0) continue;
      if ((effect.target === "active") !== activeIds.includes(id)) continue;
      const amount = Math.max(1, Math.round(fighter.config.maxHp * effect.ratio * entry.stacks));
      next[id] = { ...fighter, hp: Math.min(fighter.config.maxHp, fighter.hp + amount) };
    }
  }
  return next;
}

export function destinyStartingEnergyBonus(run: DestinyRun): number {
  const effect = DESTINY_BOON_CATALOG.supplyCache.effect;
  return effect.kind === "energy" ? effect.amount * destinyBoonStacks(run, "supplyCache") : 0;
}

export function destinyStartingRageBonus(run: DestinyRun): number {
  const effect = DESTINY_BOON_CATALOG.battleDrum.effect;
  return effect.kind === "rage" ? effect.amount * destinyBoonStacks(run, "battleDrum") : 0;
}

/** Phần bonus thực sự vào battle sau khi xét cap; settle phải trừ đúng giá trị này. */
export function destinyAppliedEnergyBonus(run: DestinyRun, fighterId: string): number {
  const energy = run.fighters?.[fighterId]?.energy ?? 0;
  return Math.max(0, Math.min(destinyStartingEnergyBonus(run), ENERGY_MAX - energy));
}

export function destinyAppliedRageBonus(run: DestinyRun): number {
  const rage = run.rage ?? 0;
  return Math.max(0, Math.min(destinyStartingRageBonus(run), RAGE_MAX - rage));
}

export type DestinyBoonChangeError = "unknown_boon" | "stack_cap" | "not_owned";
export type DestinyBoonChangeResult =
  | { readonly ok: true; readonly run: DestinyRun }
  | { readonly ok: false; readonly error: DestinyBoonChangeError };

export function addDestinyBoon(run: DestinyRun, id: DestinyBoon): DestinyBoonChangeResult {
  if (!(DESTINY_BOON_IDS as readonly unknown[]).includes(id)) return { ok: false, error: "unknown_boon" };
  const definition = DESTINY_BOON_CATALOG[id];
  const stacks = destinyBoonStacks(run, id);
  if (stacks >= definition.maxStacks) return { ok: false, error: "stack_cap" };
  const next: DestinyBoonStack = { id, stacks: stacks + 1, effectVersion: definition.effectVersion };
  return {
    ok: true,
    run: {
      ...run,
      boons: [...(run.boons ?? []).filter((entry) => entry.id !== id), next],
    },
  };
}

export function removeDestinyBoon(run: DestinyRun, id: DestinyBoon): DestinyBoonChangeResult {
  if (!(DESTINY_BOON_IDS as readonly unknown[]).includes(id)) return { ok: false, error: "unknown_boon" };
  const stacks = destinyBoonStacks(run, id);
  if (stacks === 0) return { ok: false, error: "not_owned" };
  return {
    ok: true,
    run: {
      ...run,
      boons: stacks === 1
        ? (run.boons ?? []).filter((entry) => entry.id !== id)
        : (run.boons ?? []).map((entry) => entry.id === id ? { ...entry, stacks: stacks - 1 } : entry),
    },
  };
}

/** Offer ổn định theo cycle/floor và không chứa Phúc đã chạm cap. */
export function destinyBoonOffer(run: DestinyRun, count = 3): readonly DestinyBoon[] {
  if (!run.cycleId || !Number.isInteger(run.floor) || count < 1) return [];
  const version = run.rulesVersion ?? 1;
  const pool = DESTINY_BOON_IDS.filter((id) => {
    const definition = DESTINY_BOON_CATALOG[id];
    return definition.introducedIn <= version &&
      run.floor >= (definition.minFloor ?? 1) &&
      destinyBoonStacks(run, id) < definition.maxStacks &&
      // Kho lương đầy thì không offer Phúc cộng lương.
      !(definition.effect.kind === "food" && run.food >= DESTINY_FOOD_MAX);
  });
  const rng = createRng(hashString(`boon|${run.cycleId}|${run.floor}`));
  const result: DestinyBoon[] = [];
  while (pool.length > 0 && result.length < Math.floor(count))
    result.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]!);
  return result;
}

export interface DestinyBoonRewardInput {
  readonly floor: number;
  readonly boonId: DestinyBoon;
}

export type DestinyBoonRewardError =
  | DestinyBoonChangeError
  | "invalid_run"
  | "invalid_phase"
  | "wrong_floor"
  | "not_offered"
  | "leader_requires_rescue";

export type DestinyBoonRewardResult =
  | { readonly ok: true; readonly run: DestinyRun; readonly changed: boolean }
  | { readonly ok: false; readonly error: DestinyBoonRewardError };

export function applyDestinyBoonReward(
  run: DestinyRun,
  input: DestinyBoonRewardInput,
): DestinyBoonRewardResult {
  if (run.stateVersion !== 1 || !run.fighters) return { ok: false, error: "invalid_run" };
  if ((run.rewardedFloor ?? 0) === input.floor && run.floor === input.floor + 1)
    return { ok: true, run, changed: false };
  if (!run.active) return { ok: false, error: "invalid_run" };
  if (run.phase !== "reward" || run.settledFloor !== run.floor)
    return { ok: false, error: "invalid_phase" };
  if (!Number.isInteger(input.floor) || input.floor !== run.floor)
    return { ok: false, error: "wrong_floor" };
  const leader = run.fighters["dinhBoLinh"];
  if (leader?.downed || leader?.hp === 0)
    return { ok: false, error: "leader_requires_rescue" };
  if (!(DESTINY_BOON_IDS as readonly unknown[]).includes(input.boonId))
    return { ok: false, error: "unknown_boon" };
  if (!destinyBoonOffer(run).includes(input.boonId)) return { ok: false, error: "not_offered" };
  const added = addDestinyBoon(run, input.boonId);
  if (!added.ok) return added;
  const effect = DESTINY_BOON_CATALOG[input.boonId].effect;
  return {
    ok: true,
    changed: true,
    run: {
      ...added.run,
      ...(effect.kind === "food" ? { food: Math.min(DESTINY_FOOD_MAX, added.run.food + effect.amount) } : {}),
      rewardedFloor: input.floor,
      floor: input.floor + 1,
      phase: "prepare",
      offer: null,
    },
  };
}
