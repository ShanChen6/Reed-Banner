// Thưởng vàng theo hạng cuối kỳ cho các chế độ có bảng xếp hạng theo kỳ: Nhật Lệnh (theo ngày) và Tháp Thiên Mệnh
// (theo chu kỳ 7 ngày). Mỗi chế độ là một "nguồn" cho biết kỳ nào đã khép và hạng của người chơi; sổ nhận chung chặn
// nhận hai lần. Chỉ tài khoản đã đăng nhập nhận được (như xếp hạng Trận Đồ). Trận Đồ có sổ riêng ở ./formation.
// Mức vàng ở @/core (progress/rankRewards), điểm xuất phát chờ Shan duyệt.

import {
  RANK_REWARD_MODES,
  rankRewardGold,
  vnDay,
  type RankRewardMode,
  type RewardTier,
} from "@/core";
import type { DailyStore } from "./daily";
import { activeDestinyCycle, destinyCycleById } from "./destinyCycle";
import type { DestinyLeaderboardStore } from "./destinyLeaderboard";
import { updateProfile, type ProfileStore } from "./profiles";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Chỉ cho nhận thưởng của vài kỳ gần nhất, để danh sách chờ nhận không dài vô hạn. */
export const CLAIM_WINDOW_PERIODS = 7;

export interface RankRewardClaim {
  readonly mode: RankRewardMode;
  readonly period: string;
  readonly ownerId: string;
  readonly rank: number;
  readonly gold: number;
  readonly claimedAt: number;
}

export interface RankRewardStore {
  /** Ghi một lần nhận; false khi (mode, period, owner) đã có (nhận trùng hoặc song song). */
  claim(c: RankRewardClaim): Promise<boolean>;
  /** Hoàn tác `claim` khi cộng vàng vào hồ sơ thất bại. */
  release(mode: RankRewardMode, period: string, ownerId: string): Promise<void>;
  /** Các kỳ (trong danh sách đưa vào) mà người này đã nhận. */
  claimed(ownerId: string, mode: RankRewardMode, periods: readonly string[]): Promise<ReadonlySet<string>>;
}

export class MemoryRankRewardStore implements RankRewardStore {
  private readonly rows = new Map<string, RankRewardClaim>();
  private readonly key = (mode: string, period: string, ownerId: string) => `${mode}|${period}|${ownerId}`;

  async claim(c: RankRewardClaim): Promise<boolean> {
    const k = this.key(c.mode, c.period, c.ownerId);
    if (this.rows.has(k)) return false;
    this.rows.set(k, { ...c });
    return true;
  }

  async release(mode: RankRewardMode, period: string, ownerId: string): Promise<void> {
    this.rows.delete(this.key(mode, period, ownerId));
  }

  async claimed(ownerId: string, mode: RankRewardMode, periods: readonly string[]): Promise<ReadonlySet<string>> {
    return new Set(periods.filter((p) => this.rows.has(this.key(mode, p, ownerId))));
  }
}

/** Một chế độ có bảng theo kỳ. */
export interface RankRewardSource {
  readonly mode: RankRewardMode;
  /** Các kỳ đã khép lại gần nhất, mới nhất trước. */
  closedPeriods(now: number, count: number): string[];
  /** Hạng và số người có tên trên bảng của kỳ; null khi người này không có tên trên bảng. */
  standing(period: string, ownerId: string): Promise<{ rank: number; participants: number } | null>;
}

export function dailySource(daily: DailyStore): RankRewardSource {
  return {
    mode: "daily",
    closedPeriods: (now, count) => Array.from({ length: count }, (_, i) => vnDay(now - (i + 1) * DAY_MS)),
    async standing(period, ownerId) {
      const [rank, participants] = await Promise.all([daily.rankOf(period, ownerId), daily.countFinished(period)]);
      return rank === null ? null : { rank, participants };
    },
  };
}

export function destinySource(board: DestinyLeaderboardStore): RankRewardSource {
  return {
    mode: "destiny",
    closedPeriods(now, count) {
      const out: string[] = [];
      for (let i = 1; i <= count; i++) {
        const active = activeDestinyCycle(now - i * 7 * DAY_MS);
        if (active.ok) out.push(active.cycle.cycleId);
      }
      // Chu kỳ chỉ khép khi đã qua giờ kết thúc; loại chu kỳ đang chạy nếu lọt vào danh sách.
      return out.filter((id) => (destinyCycleById(id)?.endAt ?? Infinity) <= now);
    },
    async standing(period, ownerId) {
      const [mine, participants] = await Promise.all([board.rankOf(period, ownerId), board.count(period)]);
      return mine ? { rank: mine.rank, participants } : null;
    },
  };
}

export interface RankRewardDeps {
  readonly sources: readonly RankRewardSource[];
  readonly claims: RankRewardStore;
  readonly profiles: ProfileStore;
  readonly now: number;
  readonly isSignedIn: (ownerId: string) => Promise<boolean>;
}

export type RankRewardError = "loginRequired" | "badRequest" | "unknownMode" | "notClaimable" | "alreadyClaimed" | "conflict";

export interface PendingRankReward {
  readonly mode: RankRewardMode;
  readonly period: string;
  readonly rank: number;
  readonly participants: number;
  readonly tier: RewardTier;
  readonly gold: number;
}

const isMode = (v: unknown): v is RankRewardMode => typeof v === "string" && (RANK_REWARD_MODES as readonly string[]).includes(v);

/** Thưởng hạng chờ nhận của người chơi (kỳ đã khép, chưa nhận). Khách thấy danh sách rỗng và `canClaim` false. */
export async function pendingRankRewards(deps: RankRewardDeps, ownerId: string | null): Promise<{ canClaim: boolean; items: PendingRankReward[] }> {
  if (ownerId === null || !(await deps.isSignedIn(ownerId))) return { canClaim: false, items: [] };
  const items: PendingRankReward[] = [];
  for (const source of deps.sources) {
    const periods = source.closedPeriods(deps.now, CLAIM_WINDOW_PERIODS);
    const claimed = await deps.claims.claimed(ownerId, source.mode, periods);
    for (const period of periods) {
      if (claimed.has(period)) continue;
      const st = await source.standing(period, ownerId);
      const reward = st ? rankRewardGold(source.mode, st.rank, st.participants) : null;
      if (st && reward) items.push({ mode: source.mode, period, rank: st.rank, participants: st.participants, ...reward });
    }
  }
  return { canClaim: true, items };
}

export type ClaimRankRewardResult =
  | { readonly ok: true; readonly gold: number; readonly tier: RewardTier; readonly rank: number; readonly participants: number }
  | { readonly ok: false; readonly error: RankRewardError };

/** Nhận thưởng một kỳ đã khép: ghi sổ trước (đúng một bên thắng khi gọi song song) rồi cộng vàng; cộng hỏng thì hoàn sổ. */
export async function claimRankReward(deps: RankRewardDeps, ownerId: string, mode: unknown, period: unknown): Promise<ClaimRankRewardResult> {
  if (!(await deps.isSignedIn(ownerId))) return { ok: false, error: "loginRequired" };
  if (!isMode(mode)) return { ok: false, error: "unknownMode" };
  if (typeof period !== "string") return { ok: false, error: "badRequest" };
  const source = deps.sources.find((s) => s.mode === mode);
  if (!source) return { ok: false, error: "unknownMode" };
  // Chỉ nhận được các kỳ đã khép trong khung gần đây (không đoán kỳ tương lai hay quá cũ).
  if (!source.closedPeriods(deps.now, CLAIM_WINDOW_PERIODS).includes(period)) return { ok: false, error: "notClaimable" };
  const st = await source.standing(period, ownerId);
  const reward = st ? rankRewardGold(mode, st.rank, st.participants) : null;
  if (!st || !reward) return { ok: false, error: "notClaimable" };
  const ok = await deps.claims.claim({ mode, period, ownerId, rank: st.rank, gold: reward.gold, claimedAt: deps.now });
  if (!ok) return { ok: false, error: "alreadyClaimed" };
  const updated = await updateProfile(deps.profiles, ownerId, (p) => ({ ok: true as const, profile: { ...p, gold: p.gold + reward.gold } }), deps.now);
  if (!updated.ok) {
    await deps.claims.release(mode, period, ownerId);
    console.error("Không cộng được thưởng hạng", mode, period, ownerId);
    return { ok: false, error: "conflict" };
  }
  return { ok: true, gold: reward.gold, tier: reward.tier, rank: st.rank, participants: st.participants };
}

export function rankRewardHttpStatus(error: RankRewardError): number {
  switch (error) {
    case "loginRequired":
      return 401;
    case "badRequest":
      return 400;
    case "unknownMode":
      return 404;
    default:
      return 409;
  }
}
