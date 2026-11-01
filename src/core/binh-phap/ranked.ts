// Trận Đồ có xếp hạng và thưởng: kỳ, hạng, bậc thưởng. Thuần túy, không đụng DB hay giờ hệ thống.
// Thiết kế ở docs/02-game-modes/future/02-binh-phap-gdd.md mục 12. Mức thưởng là điểm xuất phát chờ Shan duyệt.

import { rewardTier, type RewardTier } from "../progress/rankRewards";
import { vnDay, vnWeek } from "../progress/quests";
import type { PuzzleState } from "./types";

export type RankedCadence = "day" | "week";

/** Các bậc có xếp hạng và nhịp đổi kỳ (giờ Việt Nam). Hướng dẫn không có trong danh sách này. */
export const RANKED_LEVELS: readonly { readonly id: string; readonly cadence: RankedCadence }[] = [
  { id: "thuong", cadence: "day" },
  { id: "kho", cadence: "day" },
  { id: "dai-tran", cadence: "week" },
];

export const rankedLevel = (id: string) => RANKED_LEVELS.find((l) => l.id === id);

/** Khóa kỳ của một bậc: ngày YYYY-MM-DD (đổi lúc 0 giờ) hoặc thứ Hai đầu tuần. So sánh chuỗi cho đúng thứ tự thời gian. */
export function periodKey(levelId: string, now: number): string | null {
  const level = rankedLevel(levelId);
  if (!level) return null;
  return level.cadence === "day" ? vnDay(now) : vnWeek(now);
}

/** Kỳ đã khép lại khi khóa của nó nhỏ hơn khóa kỳ hiện tại. */
export function periodClosed(levelId: string, period: string, now: number): boolean {
  const current = periodKey(levelId, now);
  return current !== null && period < current;
}

/** Một ván nhiều hơn số lệnh này (đặt hoặc bỏ) bị xử thua, chặn vòng lặp đặt đi đặt lại vô hạn. */
export const MAX_RANKED_TURNS = 600;

export interface RankedResult {
  readonly score: number;
  readonly turns: number;
  readonly finishedAt: number;
}

/** Âm khi `a` đứng trên `b`: điểm cao hơn, rồi ít nước hơn, rồi nộp sớm hơn. */
export function compareResults(a: RankedResult, b: RankedResult): number {
  return b.score - a.score || a.turns - b.turns || a.finishedAt - b.finishedAt;
}

export { REWARD_TIERS, rewardTier, type RewardTier } from "../progress/rankRewards";

/** Vàng theo bậc thưởng, chia theo mức độ chơi. Điểm xuất phát chờ Shan duyệt. */
export const REWARD_GOLD: Readonly<Record<string, Readonly<Record<RewardTier, number>>>> = {
  thuong: { top1: 150, top3: 100, top10: 60, half: 30, win: 20 },
  kho: { top1: 300, top3: 200, top10: 120, half: 60, win: 40 },
  "dai-tran": { top1: 1000, top3: 600, top10: 350, half: 150, win: 80 },
};

export function rewardGold(levelId: string, rank: number, winners: number): { tier: RewardTier; gold: number } | null {
  const table = REWARD_GOLD[levelId];
  const tier = rewardTier(rank, winners);
  return table && tier ? { tier, gold: table[tier] } : null;
}

/** Bản ván gửi cho client: không có seed và trạng thái RNG, để không đoán trước được các quân sau. */
export type PublicPuzzle = Omit<PuzzleState, "seed" | "rngState">;

export function publicPuzzle(state: PuzzleState): PublicPuzzle {
  const { seed: _seed, rngState: _rngState, ...rest } = state;
  void _seed;
  void _rngState;
  return rest;
}
