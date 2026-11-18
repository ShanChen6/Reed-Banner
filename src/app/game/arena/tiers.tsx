"use client";

// Bậc hạng dùng chung cho Quần Hùng (bóng ma) và Đấu người: màu khiên từng bậc, thưởng hiện trên dải bậc và câu báo
// sau khi nhận. Mốc, vàng và phẩm món ở `ARENA_TIERS` (@/core).

import { ARENA_TIERS, type GearItem } from "@/core";
import { TIER_CLASS, TIER_COLOR_NAME, gearText } from "../battle/labels";
import type { Tier, TierReward } from "../leaderboard/RankBoard";

const TIER_COLOR: Record<string, string> = {
  dong: "#b87333",
  bac: "#c0c7d0",
  vang: "#e0b84a",
  bachKim: "#6fd0c8",
  kimCuong: "#6fa8ff",
  huyenThoai: "#c070ff",
};

export const TIERS: readonly Tier[] = ARENA_TIERS.map((t) => ({ name: t.name, min: t.min, color: TIER_COLOR[t.id] ?? "#b87333" }));

/** Thưởng từng bậc trên dải: vàng, món theo màu phẩm, đã nhận chưa (`claimed(id)`). */
export function tierRewards(claimed: (tierId: string) => boolean): TierReward[] {
  return ARENA_TIERS.map((t) => ({
    gold: t.gold,
    claimed: claimed(t.id),
    extra: <span className={TIER_CLASS[t.gear]}>+ món {TIER_COLOR_NAME[t.gear]}</span>,
  }));
}

/** Câu báo sau khi nhận thưởng một bậc. */
export function tierClaimNote(c: { readonly tier: string; readonly gold: number; readonly item: GearItem | null; readonly soldFor: number }): string {
  const name = ARENA_TIERS.find((t) => t.id === c.tier)?.name ?? "";
  return (
    `Đã nhận ${c.gold} vàng thưởng bậc ${name}` +
    (c.item ? ` và ${gearText(c.item)} (đã vào túi đồ).` : c.soldFor > 0 ? `; túi đồ đầy nên món thưởng được bán ngay, thêm ${c.soldFor} vàng.` : ".")
  );
}

export const tierErrorNote = (error?: string) =>
  error === "claimed" ? "Bậc này đã nhận thưởng." : "Chưa đủ điểm hạng để nhận bậc này.";
