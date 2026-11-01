// Thang thưởng dạng bậc thang: người chơi thấy mình đang đứng bậc nào và vàng ở từng bậc.

import { REWARD_GOLD, REWARD_TIERS, rewardTier, type RewardTier } from "@/core/binh-phap";

/** Nhãn ngắn cho thang (nhãn đầy đủ ở bảng thưởng). */
const SHORT: Record<RewardTier, string> = { top1: "Nhất", top3: "Top 3", top10: "Top 10", half: "Nửa đầu", win: "Có tên" };

const HEIGHT: Record<RewardTier, string> = { top1: "h-16", top3: "h-14", top10: "h-12", half: "h-10", win: "h-8" };

export default function RewardLadder({ level, rank, winners }: { level: string; rank: number | null; winners: number }) {
  const gold = REWARD_GOLD[level];
  if (!gold) return null;
  const mine = rank !== null && winners > 0 ? rewardTier(rank, winners) : null;
  return (
    <ol aria-label="Thang thưởng theo hạng" className="flex items-end gap-1">
      {REWARD_TIERS.map((t) => {
        const on = t.tier === mine;
        return (
          <li key={t.tier} className={`flex min-w-0 flex-1 flex-col items-center justify-end rounded-t border px-0.5 text-center ${HEIGHT[t.tier]} ${on ? "border-[#E8C477] bg-[#C9A25A]/35 shadow-[0_0_10px_rgb(232_196_119/0.5)]" : "border-[#8F6A32]/50 bg-black/25"}`}>
            <span aria-label={t.label} className="truncate text-[11px] leading-tight text-[var(--atlas-muted)]">{SHORT[t.tier]}</span>
            <b className={`text-xs tabular-nums ${on ? "text-[#FFE9B0]" : ""}`}>{gold[t.tier]}</b>
            {on && <span className="sr-only"> (bậc của bạn)</span>}
          </li>
        );
      })}
    </ol>
  );
}
