// Quyền quét Trial: chỉ lập và lưu receipt. Task này không tạo sự kiện thưởng và không đổi ví đá.
import { TRIAL_SWEEP_MAX_TIER, trialSweepTierOf, type TrialProgress, type TrialSweepTier } from "../progress/dualTowerState";
import { vnDay } from "../progress/quests";

/** Balance table only; settlement remains a separate task and must be server-authoritative. */
export const TRIAL_SWEEP_STONES_BY_TIER: Readonly<Record<TrialSweepTier, number>> = Object.freeze({
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
});

/** Invalid or ineligible tiers emit zero; callers must never accept a client amount. */
export function trialSweepStoneAmount(tier: number): number {
  if (!Number.isInteger(tier) || tier < 1 || tier > TRIAL_SWEEP_MAX_TIER) return 0;
  return TRIAL_SWEEP_STONES_BY_TIER[tier as TrialSweepTier];
}

/** Date key authoritative dạng YYYY-MM-DD, đổi lúc 00:00 tại Việt Nam. */
export const trialDateKey = (now: number): string => vnDay(now);

/** Epoch của 00:00 Việt Nam kế tiếp; Việt Nam không dùng DST. */
export function nextTrialSweepResetAt(now: number): number {
  const day = trialDateKey(now);
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year!, month! - 1, date! + 1) - 7 * 60 * 60 * 1_000;
}

/** 0 = chưa đủ điều kiện; tầng 1-20 mỗi 5 tầng một bậc, tầng 21-50 mỗi 10 tầng một bậc (tối đa 7). */
export const trialSweepTier = trialSweepTierOf;

export type TrialSweepStateResult =
  | {
      readonly ok: true;
      readonly claimed: boolean;
      readonly dateKey: string;
      readonly tier: TrialSweepTier;
      readonly claimedAt: number;
      readonly next: TrialProgress;
    }
  | { readonly ok: false; readonly error: "invalid_time" | "no_cleared_floors" };

/**
 * One-step state claim. `now` phải đến từ server; client không cung cấp date/tier.
 * Gọi lặp cùng ngày là no-op, không tích quyền từ ngày bỏ lỡ và không sinh thưởng.
 */
export function planTrialSweepState(progress: TrialProgress, now: number): TrialSweepStateResult {
  if (!Number.isSafeInteger(now) || now < 0 || Number.isNaN(new Date(now).valueOf()))
    return { ok: false, error: "invalid_time" };
  const tier = trialSweepTier(progress.cleared);
  if (tier === 0) return { ok: false, error: "no_cleared_floors" };
  const dateKey = trialDateKey(now);
  // Không mở lại ngày cũ nếu request/server instance có đồng hồ stale; date key ISO so sánh từ điển được.
  if (progress.lastSweep && progress.lastSweep.dateKey >= dateKey)
    return {
      ok: true,
      claimed: false,
      dateKey: progress.lastSweep.dateKey,
      tier: progress.lastSweep.tier,
      claimedAt: progress.lastSweep.claimedAt,
      next: progress,
    };
  return {
    ok: true,
    claimed: true,
    dateKey,
    tier,
    claimedAt: now,
    next: { ...progress, lastSweep: { dateKey, tier, claimedAt: now } },
  };
}
