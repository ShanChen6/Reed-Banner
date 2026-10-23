import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import {
  SURVIVAL_V11_RESERVE_RATES,
  simulateSurvivalV11,
  simulateSurvivalV11Baseline,
  type SurvivalLeaderPolicy,
  type SurvivalRotationPolicy,
} from "../src/core/sim/survival-v11";

const { values } = parseArgs({
  args: process.argv.slice(2).filter((arg) => arg !== "--"),
  options: {
    seeds: { type: "string", default: "200" },
    seed: { type: "string", default: "1" },
    maxWaves: { type: "string", default: "60" },
    output: { type: "string", default: "/tmp/survival-v11-balance.json" },
    levels: { type: "string", default: "5,10,20,30" },
    category: { type: "string" },
    variant: { type: "string" },
  },
});

const seedCount = Number(values.seeds);
const firstSeed = Number(values.seed);
const maxWaves = Number(values.maxWaves);
const levels = values.levels.split(",").map(Number);
const categories = [
  ...new Set(values.category?.split(",") ?? ["legacy", "reserve", "rotation", "leader"]),
];
if (
  !Number.isInteger(seedCount) ||
  seedCount < 1 ||
  !Number.isInteger(firstSeed) ||
  !Number.isInteger(maxWaves) ||
  maxWaves < 1 ||
  levels.length === 0 ||
  levels.some((level) => !Number.isInteger(level) || level < 1 || level > 30)
) {
  throw new RangeError("Invalid seeds, levels, or maxWaves argument");
}
if (categories.some((category) => !["legacy", "reserve", "rotation", "leader"].includes(category)))
  throw new RangeError("category must be legacy, reserve, rotation, or leader");
if (values.variant && categories.length !== 1)
  throw new RangeError("--variant requires exactly one --category");

const rotations: readonly SurvivalRotationPolicy[] = [
  "forced-only",
  "under-30",
  "downed-first",
  "highest-hp",
  "recovery-rotation",
  "element-counter",
  "profession-fit",
  "boss-prep",
];
const leaders: readonly SurvivalLeaderPolicy[] = [
  "fixed",
  "low-hp-defense",
  "healer",
  "defense",
  "attack",
  "element-counter",
  "adaptive",
];
const variantCounts: Record<string, number> = {
  legacy: 1,
  reserve: SURVIVAL_V11_RESERVE_RATES.length,
  rotation: rotations.length,
  leader: leaders.length,
};
const selectedCount = categories.reduce((count, category) => {
  const variants = category === "legacy"
    ? ["no-reserve"]
    : category === "reserve"
      ? SURVIVAL_V11_RESERVE_RATES.map((rate) => `${Math.round(rate * 100)}%`)
      : category === "rotation"
        ? rotations
        : leaders;
  if (values.variant && categories.length === 1 && !variants.some((candidate) => candidate === values.variant))
    throw new RangeError(`Unknown variant ${values.variant} for ${category}`);
  return count + (values.variant && categories.length === 1 ? 1 : variantCounts[category]!);
}, 0);

type Sample = {
  readonly level: number;
  readonly seed: number;
  readonly category: "legacy" | "reserve" | "rotation" | "leader";
  readonly variant: string;
  readonly result: ReturnType<typeof simulateSurvivalV11>;
};
const samples: Sample[] = [];
let completed = 0;
const expected = levels.length * seedCount * selectedCount;

async function save(status: "running" | "complete"): Promise<void> {
  const output = {
    generatedAt: new Date().toISOString(),
    status,
    parameters: {
      seedCount,
      firstSeed,
      maxWaves,
      levels,
      categories,
      variant: values.variant ?? null,
    },
    seedRule: "(firstSeed + i * 104729) >>> 0; identical seed per level across variants",
    sampleCount: samples.length,
    expectedSampleCount: expected,
    samples,
  };
  await writeFile(values.output, `${JSON.stringify(output)}\n`, "utf8");
}

async function main(): Promise<void> {
  for (const level of levels) {
    for (let i = 0; i < seedCount; i++) {
      const seed = (firstSeed + i * 104729) >>> 0;
      if (categories.includes("legacy")) {
        const legacy = simulateSurvivalV11(level, seed, {
          reserveHealRate: 0,
          rotation: "forced-only",
          leader: "fixed",
          includeReserves: false,
          maxWaves,
        });
        const legacyReference = simulateSurvivalV11Baseline(level, seed, maxWaves);
        if (
          legacy.cleared !== legacyReference.cleared ||
          legacy.turns.length !== legacyReference.turns.length ||
          legacy.turns.some(
            (turns, index) => turns !== legacyReference.turns[index],
          )
        ) {
          throw new Error(
            `Instrumented legacy baseline diverged at level ${level}, seed ${seed}`,
          );
        }
        samples.push({
          level,
          seed,
          category: "legacy",
          variant: "no-reserve",
          result: legacy,
        });
        completed++;
      }

      const reserveRates = SURVIVAL_V11_RESERVE_RATES.filter(
        (candidate) =>
          !values.variant ||
          categories.length !== 1 ||
          `${Math.round(candidate * 100)}%` === values.variant,
      );
      if (categories.includes("reserve")) {
        for (const rate of reserveRates) {
          const result = simulateSurvivalV11(level, seed, {
            reserveHealRate: rate,
            rotation: "recovery-rotation",
            leader: "fixed",
            maxWaves,
          });
          samples.push({
            level,
            seed,
            category: "reserve",
            variant: `${Math.round(rate * 100)}%`,
            result,
          });
          completed++;
        }
      }

      const rotationVariants = rotations.filter(
        (candidate) =>
          !values.variant ||
          categories.length !== 1 ||
          candidate === values.variant,
      );
      if (categories.includes("rotation")) {
        for (const rotation of rotationVariants) {
          const result = simulateSurvivalV11(level, seed, {
            reserveHealRate: 0.1,
            rotation,
            leader: "fixed",
            maxWaves,
          });
          samples.push({
            level,
            seed,
            category: "rotation",
            variant: rotation,
            result,
          });
          completed++;
        }
      }

      const leaderVariants = leaders.filter(
        (candidate) =>
          !values.variant ||
          categories.length !== 1 ||
          candidate === values.variant,
      );
      if (categories.includes("leader")) {
        for (const leader of leaderVariants) {
          const result = simulateSurvivalV11(level, seed, {
            reserveHealRate: 0.1,
            rotation: "forced-only",
            leader,
            maxWaves,
          });
          samples.push({
            level,
            seed,
            category: "leader",
            variant: leader,
            result,
          });
          completed++;
        }
      }
      if (completed % 250 === 0 || completed === expected)
        console.error(`Completed ${completed}/${expected} simulations`);
      if ((i + 1) % 5 === 0 || completed === expected)
        await save(completed === expected ? "complete" : "running");
    }
  }

  await save("complete");
  console.log(`Wrote ${samples.length} samples to ${values.output}`);
}

void main();
