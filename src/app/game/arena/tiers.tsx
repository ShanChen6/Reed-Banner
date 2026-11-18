"use client";

// Bậc hạng dùng chung cho Quần Hùng (bóng ma) và Đấu người: màu khiên từng bậc, thưởng hiện trên dải bậc và câu báo
// sau khi nhận. Mốc, vàng và phẩm món ở `ARENA_TIERS` (@/core).

import { ARENA_TIERS, FORMATION_TIERS, SURVIVAL_TIERS, type ArenaTier, type GearItem } from "@/core";
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

export const ladderOf = (list: readonly ArenaTier[]): readonly Tier[] =>
  list.map((t) => ({ name: t.name, min: t.min, color: TIER_COLOR[t.id] ?? "#b87333" }));

/** Dải bậc Quần Hùng và Đấu người (điểm hạng). */
export const TIERS = ladderOf(ARENA_TIERS);
/** Dải bậc Trấn Ải (kỷ lục số đợt). */
export const SURVIVAL_LADDER = ladderOf(SURVIVAL_TIERS);
/** Dải bậc Trận Đồ (số ván xếp hạng đã thắng). */
export const FORMATION_LADDER = ladderOf(FORMATION_TIERS);

/** Thưởng từng bậc trên dải: vàng, món theo màu phẩm, đã nhận chưa (`claimed(id)`). */
export function tierRewards(claimed: (tierId: string) => boolean, list: readonly ArenaTier[] = ARENA_TIERS): TierReward[] {
  return list.map((t) => ({
    gold: t.gold,
    claimed: claimed(t.id),
    extra: <span className={TIER_CLASS[t.gear]}>món {TIER_COLOR_NAME[t.gear]}</span>,
  }));
}

/** Câu báo sau khi nhận thưởng một bậc. */
export function tierClaimNote(c: { readonly tier: string; readonly gold: number; readonly item: GearItem | null; readonly soldFor: number }): string {
  const name = ARENA_TIERS.find((t) => t.id === c.tier)?.name ?? "";
  return (
    `Đã nhận ${c.gold} vàng thưởng bậc ${name}` +
    (c.item ? ` và ${gearText(c.item)} (đã vào kho đồ).` : c.soldFor > 0 ? `; kho đồ đầy nên món thưởng được bán ngay, thêm ${c.soldFor} vàng.` : ".")
  );
}

export const tierErrorNote = (error?: string, need = "điểm hạng") =>
  error === "claimed" ? "Bậc này đã nhận thưởng." : `Chưa đủ ${need} để nhận bậc này.`;
