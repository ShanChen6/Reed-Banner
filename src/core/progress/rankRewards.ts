// Thưởng vàng theo hạng cuối kỳ, dùng chung cho các chế độ có bảng xếp hạng theo kỳ (Trận Đồ, Nhật Lệnh, Tháp Thiên
// Mệnh). Chỉ vàng; loại thưởng khác sẽ bàn sau (Shan, 01/11/2026). Mức vàng là điểm xuất phát chờ Shan duyệt.

export type RewardTier = "top1" | "top3" | "top10" | "half" | "win";

/**
 * Bậc thưởng theo hạng. Mỗi người nhận đúng một bậc, bậc cao nhất hạng của mình đạt tới. Không đòi số người tối
 * thiểu (Shan chốt 01/11/2026): bảng ít người vẫn có thưởng, kể cả một mình một bảng thì là hạng nhất.
 */
export const REWARD_TIERS: readonly { readonly tier: RewardTier; readonly maxRank: (participants: number) => number; readonly label: string }[] = [
  { tier: "top1", maxRank: () => 1, label: "Hạng nhất" },
  { tier: "top3", maxRank: () => 3, label: "Top 3" },
  { tier: "top10", maxRank: () => 10, label: "Top 10" },
  { tier: "half", maxRank: (n) => Math.ceil(n / 2), label: "Nửa trên" },
  { tier: "win", maxRank: (n) => n, label: "Có tên trên bảng" },
];

/** Bậc thưởng của người đứng hạng `rank` (từ 1) trong số `participants` người có tên trên bảng; null khi không hợp lệ. */
export function rewardTier(rank: number, participants: number): RewardTier | null {
  if (!Number.isInteger(rank) || !Number.isInteger(participants) || rank < 1 || participants < 1 || rank > participants) return null;
  for (const t of REWARD_TIERS) if (rank <= t.maxRank(participants)) return t.tier;
  return null;
}

/** Chế độ có thưởng hạng theo kỳ chạy qua sổ nhận chung (`rank_reward_claims`). Trận Đồ có sổ riêng. */
export type RankRewardMode = "daily" | "destiny";

export const RANK_REWARD_MODES: readonly RankRewardMode[] = ["daily", "destiny"];

export const RANK_REWARD_MODE_NAME: Readonly<Record<RankRewardMode, string>> = {
  daily: "Nhật Lệnh",
  destiny: "Tháp Thiên Mệnh",
};

/** Vàng theo bậc thưởng của từng chế độ chung sổ. Nhật Lệnh đã có 150/50 vàng cố định mỗi ván nên thưởng hạng nhỏ hơn. */
export const RANK_REWARD_GOLD: Readonly<Record<RankRewardMode, Readonly<Record<RewardTier, number>>>> = {
  daily: { top1: 100, top3: 70, top10: 50, half: 30, win: 10 },
  destiny: { top1: 800, top3: 500, top10: 300, half: 150, win: 60 },
};

export function rankRewardGold(mode: RankRewardMode, rank: number, participants: number): { tier: RewardTier; gold: number } | null {
  const tier = rewardTier(rank, participants);
  return tier ? { tier, gold: RANK_REWARD_GOLD[mode][tier] } : null;
}
