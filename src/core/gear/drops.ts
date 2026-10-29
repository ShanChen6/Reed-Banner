// Rơi đồ sau trận và phí ghép. Server gọi các hàm này; số liệu là điểm xuất phát.
// Xem docs/04-equipment/trang-bi.md mục 5–6.

import type { Difficulty } from "../ai";
import { PROFESSIONS } from "../battle/rules";
import { ELEMENTS } from "../battle/elements";
import type { Rng } from "../rng";
import { GEAR_SETS, GEAR_SLOTS, MAX_TIER, TIERS, type GearItem, type Tier } from "./gear";

/** Phí vàng mỗi lần ghép, theo bậc nguyên liệu. Để thấp, chỉ là một khoản nhỏ (Shan chốt 19/10/2026). */
export const MERGE_GOLD: Readonly<Record<Exclude<Tier, typeof MAX_TIER>, number>> = { 1: 10, 2: 20, 3: 40, 4: 80 };

export function mergeCost(tier: Tier): number {
  return tier >= MAX_TIER ? 0 : MERGE_GOLD[tier as Exclude<Tier, typeof MAX_TIER>];
}

/** Tỉ trọng phẩm Trắng → Cam của món rơi, theo độ khó trận. Mỗi hàng cộng lại 100. */
export const DROP_TIER_WEIGHTS: Readonly<Record<Difficulty, readonly [number, number, number, number, number]>> = {
  easy: [70, 25, 5, 0, 0],
  normal: [55, 30, 12, 3, 0],
  hard: [35, 35, 20, 8, 2],
  boss: [15, 30, 30, 18, 7],
  nightmare: [5, 20, 35, 27, 13],
};

/** Thắng chắc chắn rơi 1 món; thua có tỉ lệ này rơi 1 món, phẩm tối đa Lục. */
export const LOSS_DROP_CHANCE = 0.3;

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[rng.int(0, items.length - 1)]!;
}

function rollTier(rng: Rng, weights: readonly number[]): Tier {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]!;
    if (r < 0) return TIERS[i]!;
  }
  return TIERS[0];
}

/** Món rơi sau trận, hoặc null khi thua và không trúng. Ô, nguyên tố, bộ và nghề (vũ khí) chia đều. */
export function rollDrop(rng: Rng, difficulty: Difficulty, won: boolean, id: string): GearItem | null {
  if (!won && rng.next() >= LOSS_DROP_CHANCE) return null;
  const weights = won ? DROP_TIER_WEIGHTS[difficulty] : DROP_TIER_WEIGHTS[difficulty].map((w, i) => (i < 2 ? w : 0));
  const tier = rollTier(rng, weights.some((w) => w > 0) ? weights : [1]);
  const slot = pick(rng, GEAR_SLOTS);
  const item: GearItem = { id, slot, element: pick(rng, ELEMENTS), tier, set: pick(rng, GEAR_SETS).id };
  return slot === "vuKhi" ? { ...item, profession: pick(rng, PROFESSIONS) } : item;
}
