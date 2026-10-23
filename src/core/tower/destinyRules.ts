// Luật Destiny theo chu kỳ: xác định từ cycle + secret server, nhưng snapshot chỉ lộ luật công khai.
import { createRng, type Rng } from "../rng";
import { hashString } from "./floorContract";
import { analyzeFeasibility } from "./puzzleValidator";
import { validateFloorRules, type FloorRules, type LineupMember } from "./floorRules";

export const DESTINY_RULE_DATA_VERSION = 1;
export const DESTINY_CYCLE_FLOORS = 10;

export type DestinyFloorTier = 1 | 2 | 3 | 4;

export interface DestinyCycleRuleFloor {
  readonly floor: number;
  readonly tier: DestinyFloorTier;
  readonly rules: FloorRules;
  readonly fingerprint: string;
}

export interface DestinyCycleRuleSnapshot {
  readonly cycleId: string;
  readonly dataVersion: number;
  readonly floors: readonly DestinyCycleRuleFloor[];
}

export interface DestinyRuleFallbackEvent {
  readonly kind: "destiny_rule_fallback";
  readonly cycleId: string;
  readonly floor: number;
  readonly tier: DestinyFloorTier;
  readonly dataVersion: number;
  readonly candidatesTried: number;
}

export interface DestinyRuleGeneratorOptions {
  /** Chỉ dành cho test/content iteration; production dùng pool versioned bên dưới. */
  readonly pools?: Readonly<Record<DestinyFloorTier, readonly FloorRules[]>>;
  readonly onFallback?: (event: DestinyRuleFallbackEvent) => void;
}

export type DestinyRuleGenerationResult =
  | { readonly ok: true; readonly snapshot: DestinyCycleRuleSnapshot }
  | { readonly ok: false; readonly error: "invalid_cycle" | "invalid_secret" | "invalid_roster" | "fallback_impossible"; readonly floor?: number };

const POOLS: Readonly<Record<DestinyFloorTier, readonly FloorRules[]>> = {
  1: [
    { bannedElements: ["kim"] }, { bannedElements: ["hoa"] },
    { bannedProfessions: ["phapSu"] }, { bannedProfessions: ["tuongSi"] },
  ],
  2: [
    { minProfessions: { binhLinh: 1 } }, { minProfessions: { ySu: 1 } },
    { minElements: { moc: 1 } }, { minElements: { thuy: 1 } },
    { maxSameElement: 2 }, { maxSameProfession: 2 },
  ],
  3: [
    { maxSameElement: 1 }, { maxSameProfession: 1 },
    { bannedElements: ["kim"], minProfessions: { binhLinh: 1 } },
    { bannedProfessions: ["phapSu"], minElements: { moc: 1 } },
  ],
  4: [
    { maxSameElement: 1, maxSameProfession: 1 },
    { bannedElements: ["hoa"], minProfessions: { binhLinh: 1 }, maxSameProfession: 1 },
    { bannedProfessions: ["tuongSi"], minElements: { thuy: 1 }, maxSameElement: 1 },
  ],
};

const CYCLE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function destinyFloorTier(floor: number): DestinyFloorTier {
  return floor <= 3 ? 1 : floor <= 6 ? 2 : floor <= 9 ? 3 : 4;
}

function cycleIsMonday(cycleId: string): boolean {
  if (!CYCLE_RE.test(cycleId)) return false;
  const date = new Date(`${cycleId}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === cycleId && date.getUTCDay() === 1;
}

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function validRoster(roster: readonly LineupMember[]): boolean {
  return roster.length >= 2 && roster.every((member) =>
    !!member.id && member.id !== "dinhBoLinh") && new Set(roster.map((member) => member.id)).size === roster.length;
}

const feasible = (rules: FloorRules, roster: readonly LineupMember[]) =>
  validateFloorRules(rules).length === 0 && analyzeFeasibility(rules, roster, { maxSamples: 1 }).status === "feasible";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
}

/** Tạo snapshot 10 tầng. Cùng cycle/secret/version/roster luôn cho cùng kết quả. */
export function generateDestinyCycleRules(
  cycleId: string,
  serverSecret: string,
  roster: readonly LineupMember[],
  options: DestinyRuleGeneratorOptions = {},
): DestinyRuleGenerationResult {
  if (!cycleIsMonday(cycleId)) return { ok: false, error: "invalid_cycle" };
  if (typeof serverSecret !== "string" || serverSecret.length < 16) return { ok: false, error: "invalid_secret" };
  if (!validRoster(roster)) return { ok: false, error: "invalid_roster" };
  const rng = createRng(hashString(`${DESTINY_RULE_DATA_VERSION}|${cycleId}|${serverSecret}`));
  const pools = options.pools ?? POOLS;
  const floors: DestinyCycleRuleFloor[] = [];
  for (let floor = 1; floor <= DESTINY_CYCLE_FLOORS; floor++) {
    const tier = destinyFloorTier(floor);
    const candidates = shuffled(pools[tier] ?? [], rng);
    let rules = candidates.find((candidate) => feasible(candidate, roster));
    if (!rules) {
      const fallback: FloorRules = {};
      if (!feasible(fallback, roster)) return { ok: false, error: "fallback_impossible", floor };
      options.onFallback?.({
        kind: "destiny_rule_fallback", cycleId, floor, tier,
        dataVersion: DESTINY_RULE_DATA_VERSION, candidatesTried: candidates.length,
      });
      rules = fallback;
    }
    const snapshotRules = structuredClone(rules);
    floors.push({
      floor,
      tier,
      rules: snapshotRules,
      fingerprint: hashString(JSON.stringify([DESTINY_RULE_DATA_VERSION, cycleId, floor, snapshotRules])).toString(16),
    });
  }
  return {
    ok: true,
    snapshot: deepFreeze({ cycleId, dataVersion: DESTINY_RULE_DATA_VERSION, floors }),
  };
}
