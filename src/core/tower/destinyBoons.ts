import { ENERGY_MAX, RAGE_MAX, type FighterConfig } from "../battle";
import {
  DESTINY_BOON_IDS,
  DESTINY_BOON_STATE_RULES,
  type DestinyBoon,
  type DestinyBoonStack,
  type DestinyRun,
} from "../progress";
import { createRng } from "../rng";
import { hashString } from "./floorContract";

export type DestinyBoonGroup = "offensive" | "defensive" | "vitality" | "logistics" | "tactical";
export type DestinyBoonRarity = "common" | "rare";
export type DestinyBoonCondition = "same_element_as_leader" | "has_equipment";

type DestinyBoonEffect =
  | { readonly kind: "stat"; readonly stat: "atk" | "def" | "maxHp"; readonly ratio: number; readonly condition?: DestinyBoonCondition }
  | { readonly kind: "energy"; readonly amount: number }
  | { readonly kind: "rage"; readonly amount: number };

export interface DestinyBoonDefinition {
  readonly id: DestinyBoon;
  readonly group: DestinyBoonGroup;
  readonly rarity: DestinyBoonRarity;
  readonly maxStacks: number;
  readonly effectVersion: number;
  readonly effect: DestinyBoonEffect;
}

const boon = (
  id: DestinyBoon,
  group: DestinyBoonGroup,
  rarity: DestinyBoonRarity,
  effect: DestinyBoonEffect,
): DestinyBoonDefinition => ({ id, group, rarity, ...DESTINY_BOON_STATE_RULES[id], effect });

/** MVP 7 Phúc; chỉ dùng stat/runtime đã được battle core hỗ trợ. */
export const DESTINY_BOON_CATALOG: Readonly<Record<DestinyBoon, DestinyBoonDefinition>> = {
  atk: boon("atk", "offensive", "common", { kind: "stat", stat: "atk", ratio: 0.1 }),
  def: boon("def", "defensive", "common", { kind: "stat", stat: "def", ratio: 0.15 }),
  hp: boon("hp", "vitality", "common", { kind: "stat", stat: "maxHp", ratio: 0.1 }),
  elementalEdge: boon("elementalEdge", "offensive", "rare", {
    kind: "stat", stat: "atk", ratio: 0.08, condition: "same_element_as_leader",
  }),
  armoredFormation: boon("armoredFormation", "defensive", "rare", {
    kind: "stat", stat: "def", ratio: 0.08, condition: "has_equipment",
  }),
  supplyCache: boon("supplyCache", "logistics", "common", { kind: "energy", amount: 10 }),
  battleDrum: boon("battleDrum", "tactical", "rare", { kind: "rage", amount: 10 }),
};

export const destinyBoonStacks = (run: DestinyRun, id: DestinyBoon): number =>
  run.boons?.find((entry) => entry.id === id)?.stacks ?? 0;

const conditionMatches = (
  run: DestinyRun,
  config: FighterConfig,
  leaderElement: FighterConfig["element"],
  condition?: DestinyBoonCondition,
) => condition === undefined ||
  (condition === "same_element_as_leader" && config.element === leaderElement) ||
  (condition === "has_equipment" && (run.fighters?.[config.id]?.equipment.length ?? 0) > 0);

/** Gear/element đã dựng xong trước; tất cả % Phúc cộng với nhau rồi nhân đúng một lần. */
export function applyDestinyBoonStats(run: DestinyRun, configs: readonly FighterConfig[]): FighterConfig[] {
  const leaderElement = configs[0]?.element;
  if (!leaderElement) return [...configs];
  return configs.map((config) => {
    const ratios = { atk: 0, def: 0, maxHp: 0 };
    for (const entry of run.boons ?? []) {
      const definition = DESTINY_BOON_CATALOG[entry.id];
      if (definition.effect.kind !== "stat" ||
          !conditionMatches(run, config, leaderElement, definition.effect.condition)) continue;
      ratios[definition.effect.stat] += definition.effect.ratio * entry.stacks;
    }
    return {
      ...config,
      atk: Math.round(config.atk * (1 + ratios.atk)),
      def: Math.round(config.def * (1 + ratios.def)),
      maxHp: Math.round(config.maxHp * (1 + ratios.maxHp)),
    };
  });
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
  const pool = DESTINY_BOON_IDS.filter((id) =>
    destinyBoonStacks(run, id) < DESTINY_BOON_CATALOG[id].maxStacks);
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
  return {
    ok: true,
    changed: true,
    run: {
      ...added.run,
      rewardedFloor: input.floor,
      floor: input.floor + 1,
      phase: "prepare",
      offer: null,
    },
  };
}
