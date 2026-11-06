// Công Trạng (V2-06): thành tích theo mùa của người chơi ở mọi chế độ có xếp hạng, gom từ hai sổ thưởng đã có (sổ nhận
// thưởng hạng chung và ván Trận Đồ đã nhận). Chỉ đọc; khách không có công trạng. Mùa hiện tại do client đọc từ bảng
// xếp hạng từng chế độ.

import { RANK_REWARD_MODE_NAME } from "@/core";
import { RULESETS } from "@/core/binh-phap";
import type { FormationStore } from "./formation";
import type { RankRewardStore } from "./rankRewards";

export const HONORS_LIMIT = 60;

export interface HonorItem {
  /** `daily` | `destiny` | `survival` | `arena` | `tamTuongKy` | `formation:<bậc>`. */
  readonly source: string;
  readonly title: string;
  readonly period: string;
  readonly rank: number;
  /** Số người có tên trên bảng của kỳ; null khi sổ không lưu. */
  readonly participants: number | null;
  readonly gold: number;
  readonly claimedAt: number;
}

export interface HonorsDeps {
  readonly claims: RankRewardStore;
  readonly formation: FormationStore;
  readonly isSignedIn: (ownerId: string) => Promise<boolean>;
}

export async function honorsOf(deps: HonorsDeps, ownerId: string | null): Promise<{ signedIn: boolean; items: HonorItem[] }> {
  if (ownerId === null || !(await deps.isSignedIn(ownerId))) return { signedIn: false, items: [] };
  const [claims, entries] = await Promise.all([deps.claims.history(ownerId, HONORS_LIMIT), deps.formation.claimedBy(ownerId, HONORS_LIMIT)]);
  const fromClaims: HonorItem[] = claims.map((c) => ({
    source: c.mode,
    title: RANK_REWARD_MODE_NAME[c.mode],
    period: c.period,
    rank: c.rank,
    participants: null,
    gold: c.gold,
    claimedAt: c.claimedAt,
  }));
  const fromFormation = (
    await Promise.all(
      entries.map(async (e): Promise<HonorItem | null> => {
        const [rank, participants] = await Promise.all([deps.formation.rankOf(e), deps.formation.countWinners(e.level, e.period)]);
        return rank === null || e.claimedAt === null
          ? null
          : { source: `formation:${e.level}`, title: `Trận Đồ · ${RULESETS.find((r) => r.id === e.level)?.name ?? e.level}`, period: e.period, rank, participants, gold: e.rewardGold ?? 0, claimedAt: e.claimedAt };
      }),
    )
  ).filter((x): x is HonorItem => x !== null);
  return { signedIn: true, items: [...fromClaims, ...fromFormation].sort((a, b) => b.claimedAt - a.claimedAt).slice(0, HONORS_LIMIT) };
}
