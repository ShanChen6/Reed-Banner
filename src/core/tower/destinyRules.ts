// Luật Destiny theo chu kỳ: xác định từ cycle + secret server, nhưng snapshot chỉ lộ luật công khai.
import { createRng, type Rng } from "../rng";
import { hashString } from "./floorContract";
import { analyzeFeasibility } from "./puzzleValidator";
import { validateFloorRules, type FloorRules, type LineupMember } from "./floorRules";

/** Version luật mới nhất. V1: 10 tầng (Song Tháp V1.0). V2: 20 tầng, pool luật rộng hơn. */
export const DESTINY_RULE_DATA_VERSION = 2;
export type DestinyRulesVersion = 1 | 2;
/** Chu kỳ (thứ Hai giờ Việt Nam) đầu tiên dùng luật V2; chu kỳ trước đó giữ V1 để run đang chạy không đổi luật. */
export const DESTINY_V2_FIRST_CYCLE = "2026-11-16";
/** Số tầng của version mới nhất; code theo run phải dùng `destinyFloorCount(version)`. */
export const DESTINY_CYCLE_FLOORS = 20;

export const isDestinyRulesVersion = (value: unknown): value is DestinyRulesVersion =>
  value === 1 || value === 2;

/** Version luật của một chu kỳ, chỉ phụ thuộc id chu kỳ nên mọi máy chủ tính ra như nhau. */
export const destinyRulesVersionForCycle = (cycleId: string): DestinyRulesVersion =>
  cycleId >= DESTINY_V2_FIRST_CYCLE ? 2 : 1;

/** Run lưu version lúc tạo; run cũ thiếu trường này là V1. */
export const destinyRunRulesVersion = (run: { readonly rulesVersion?: number }): DestinyRulesVersion =>
  isDestinyRulesVersion(run.rulesVersion) ? run.rulesVersion : 1;

export const destinyFloorCount = (version: DestinyRulesVersion = DESTINY_RULE_DATA_VERSION): number =>
  version >= 2 ? 20 : 10;

/** Hệ số sức địch theo tầng. V2 dốc vừa: 0,74 ở tầng 1, 1,12 ở tầng 20. */
export const destinyEnemyPower = (floor: number, version: DestinyRulesVersion = DESTINY_RULE_DATA_VERSION): number =>
  version >= 2 ? 0.72 + 0.02 * floor : 0.72 + 0.03 * floor;

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
  /** Bỏ trống là version của chu kỳ (`destinyRulesVersionForCycle`). */
  readonly version?: DestinyRulesVersion;
  /** Chỉ dành cho test/content iteration; production dùng pool versioned bên dưới. */
  readonly pools?: Readonly<Record<DestinyFloorTier, readonly FloorRules[]>>;
  readonly onFallback?: (event: DestinyRuleFallbackEvent) => void;
}

export type DestinyRuleGenerationResult =
  | { readonly ok: true; readonly snapshot: DestinyCycleRuleSnapshot }
  | { readonly ok: false; readonly error: "invalid_cycle" | "invalid_secret" | "invalid_roster" | "fallback_impossible"; readonly floor?: number };

const POOLS_V1: Readonly<Record<DestinyFloorTier, readonly FloorRules[]>> = {
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

/** V2: mỗi nhóm khó dài 5 tầng nên mỗi pool có 8 luật, và một chu kỳ không lặp luật trong cùng nhóm. */
const POOLS_V2: Readonly<Record<DestinyFloorTier, readonly FloorRules[]>> = {
  1: [
    { bannedElements: ["kim"] }, { bannedElements: ["hoa"] },
    { bannedElements: ["thuy"] }, { bannedElements: ["tho"] },
    { bannedProfessions: ["phapSu"] }, { bannedProfessions: ["tuongSi"] },
    { bannedProfessions: ["binhLinh"] }, { bannedProfessions: ["ySu"] },
  ],
  2: [
    { minProfessions: { binhLinh: 1 } }, { minProfessions: { ySu: 1 } },
    { minProfessions: { phapSu: 1 } }, { minProfessions: { tuongSi: 1 } },
    { minElements: { moc: 1 } }, { minElements: { thuy: 1 } },
    { maxSameElement: 2 }, { maxSameProfession: 2 },
  ],
  3: [
    { maxSameElement: 1 }, { maxSameProfession: 1 },
    { bannedElements: ["kim"], minProfessions: { binhLinh: 1 } },
    { bannedProfessions: ["phapSu"], minElements: { moc: 1 } },
    { bannedElements: ["hoa"], minProfessions: { ySu: 1 } },
    { bannedProfessions: ["tuongSi"], minElements: { thuy: 1 } },
    { bannedElements: ["kim", "hoa"] },
    { bannedProfessions: ["binhLinh"], maxSameElement: 2 },
  ],
  4: [
    { maxSameElement: 1, maxSameProfession: 1 },
    { bannedElements: ["hoa"], minProfessions: { binhLinh: 1 }, maxSameProfession: 1 },
    { bannedProfessions: ["tuongSi"], minElements: { thuy: 1 }, maxSameElement: 1 },
    { bannedElements: ["kim"], minProfessions: { ySu: 1 }, maxSameElement: 1 },
    { bannedProfessions: ["phapSu"], minElements: { moc: 1 }, maxSameProfession: 1 },
    { bannedElements: ["kim", "hoa"], maxSameProfession: 1 },
    { bannedElements: ["thuy"], minProfessions: { tuongSi: 1 }, maxSameElement: 1 },
    { bannedProfessions: ["binhLinh"], maxSameElement: 1, maxSameProfession: 2 },
  ],
};

const POOLS: Readonly<Record<DestinyRulesVersion, Readonly<Record<DestinyFloorTier, readonly FloorRules[]>>>> = {
  1: POOLS_V1,
  2: POOLS_V2,
};

const CYCLE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** V1: tầng 1–3 / 4–6 / 7–9 / 10. V2: tầng 1–5 / 6–10 / 11–15 / 16–20. */
export function destinyFloorTier(
  floor: number,
  version: DestinyRulesVersion = DESTINY_RULE_DATA_VERSION,
): DestinyFloorTier {
  if (version >= 2) return floor <= 5 ? 1 : floor <= 10 ? 2 : floor <= 15 ? 3 : 4;
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

/**
 * Tạo snapshot đủ số tầng của version. Cùng cycle/secret/version/roster luôn cho cùng kết quả.
 * V2 không dùng lại một luật trong cùng nhóm khó chừng nào pool còn luật khả thi chưa dùng.
 */
export function generateDestinyCycleRules(
  cycleId: string,
  serverSecret: string,
  roster: readonly LineupMember[],
  options: DestinyRuleGeneratorOptions = {},
): DestinyRuleGenerationResult {
  if (!cycleIsMonday(cycleId)) return { ok: false, error: "invalid_cycle" };
  if (typeof serverSecret !== "string" || serverSecret.length < 16) return { ok: false, error: "invalid_secret" };
  if (!validRoster(roster)) return { ok: false, error: "invalid_roster" };
  const version = options.version ?? destinyRulesVersionForCycle(cycleId);
  const rng = createRng(hashString(`${version}|${cycleId}|${serverSecret}`));
  const pools = options.pools ?? POOLS[version];
  const floors: DestinyCycleRuleFloor[] = [];
  const usedByTier = new Map<DestinyFloorTier, Set<FloorRules>>();
  for (let floor = 1; floor <= destinyFloorCount(version); floor++) {
    const tier = destinyFloorTier(floor, version);
    const candidates = shuffled(pools[tier] ?? [], rng);
    const used = usedByTier.get(tier) ?? new Set<FloorRules>();
    usedByTier.set(tier, used);
    let rules = version >= 2
      ? candidates.find((candidate) => !used.has(candidate) && feasible(candidate, roster)) ??
        candidates.find((candidate) => feasible(candidate, roster))
      : candidates.find((candidate) => feasible(candidate, roster));
    if (rules) used.add(rules);
    if (!rules) {
      const fallback: FloorRules = {};
      if (!feasible(fallback, roster)) return { ok: false, error: "fallback_impossible", floor };
      options.onFallback?.({
        kind: "destiny_rule_fallback", cycleId, floor, tier,
        dataVersion: version, candidatesTried: candidates.length,
      });
      rules = fallback;
    }
    const snapshotRules = structuredClone(rules);
    floors.push({
      floor,
      tier,
      rules: snapshotRules,
      fingerprint: hashString(JSON.stringify([version, cycleId, floor, snapshotRules])).toString(16),
    });
  }
  return {
    ok: true,
    snapshot: deepFreeze({ cycleId, dataVersion: version, floors }),
  };
}
