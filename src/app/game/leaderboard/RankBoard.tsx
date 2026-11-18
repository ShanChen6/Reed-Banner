"use client";

// Bảng xếp hạng kiểu bục vinh danh (Shan 18/11/2026, theo mẫu Đấu Trường Ngày): ba hạng đầu đứng trên bục (hạng 1 ở
// giữa, cao nhất), từ hạng 4 là các dòng có huy hiệu số và ảnh đại diện, thanh "hạng của bạn" dính đáy khung khi cuộn.
// Dải bậc hạng (Đồng → Huyền Thoại) dùng cho chế độ có điểm hạng lâu dài như Quần Hùng.

import { Children, useState, type ReactNode } from "react";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface RankEntry {
  readonly rank: number;
  readonly name: string;
  readonly mine?: boolean;
  /** Số chính bên phải (điểm, tầng…). */
  readonly score: ReactNode;
  /** Dòng phụ dưới tên. */
  readonly detail?: ReactNode;
}

const MEDAL = {
  1: { ring: "#e9c25a", deep: "#8a6214", label: "Hạng nhất" },
  2: { ring: "#c9d2dc", deep: "#5d6a78", label: "Hạng nhì" },
  3: { ring: "#d58c55", deep: "#7a3f1a", label: "Hạng ba" },
} as const;

const AVATAR_TONES = ["#8f2d22", "#2f5a7a", "#3f6b3a", "#6a4a8a", "#7a5a2a", "#2f6b6b", "#8a3a5a"];

/** Ảnh đại diện: chữ cái đầu tên trên nền màu theo tên; viền vàng, bạc, đồng cho ba hạng đầu. */
export function RankAvatar({ name, rank, size = "md" }: { name: string; rank: number; size?: "sm" | "md" | "lg" }) {
  const letter = (name.trim()[0] ?? "?").toUpperCase();
  const tone = AVATAR_TONES[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % AVATAR_TONES.length]!;
  const medal = rank <= 3 ? MEDAL[rank as 1 | 2 | 3] : null;
  const box = size === "lg" ? "size-20 text-3xl" : size === "md" ? "size-14 text-xl" : "size-10 text-base";
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full font-black text-white shadow-md", box)}
      style={{
        background: `radial-gradient(circle at 35% 30%, ${tone}, #1b1411 120%)`,
        boxShadow: `0 0 0 3px ${medal?.ring ?? "var(--color-frame-line)"}, 0 0 0 5px ${medal?.deep ?? "transparent"}`,
      }}
    >
      {letter}
    </span>
  );
}

/** Huy hiệu số hạng: ba hạng đầu là huy chương có dải lụa, còn lại là số nghiêng. */
export function RankMedal({ rank, className }: { rank: number; className?: string }) {
  const medal = rank <= 3 ? MEDAL[rank as 1 | 2 | 3] : null;
  if (!medal) return <span className={cn("w-10 shrink-0 text-center text-2xl font-black italic tabular-nums text-on-wood-soft", className)}>{rank}</span>;
  return (
    <svg viewBox="0 0 40 44" className={cn("h-11 w-10 shrink-0", className)} role="img" aria-label={medal.label}>
      <path d="M10 0h8l4 14-6 4zM30 0h-8l-4 14 6 4z" fill={rank === 1 ? "#b03a2e" : rank === 2 ? "#2f5a8a" : "#3f6b3a"} />
      <circle cx="20" cy="27" r="14" fill={medal.ring} stroke={medal.deep} strokeWidth="2.5" />
      <circle cx="20" cy="27" r="10" fill="none" stroke={medal.deep} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
      <text x="20" y="32.5" textAnchor="middle" fontSize="15" fontWeight="900" fill={medal.deep}>{rank}</text>
    </svg>
  );
}

/** Bục ba hạng đầu: hạng 2 bên trái, hạng 1 ở giữa và cao nhất, hạng 3 bên phải. */
function Podium({ entries }: { entries: readonly RankEntry[] }) {
  const byRank = (r: number) => entries.find((e) => e.rank === r);
  const order = [2, 1, 3];
  const height = { 1: "h-20", 2: "h-14", 3: "h-10" } as const;
  return (
    <ol className="grid grid-cols-3 items-end gap-2 sm:gap-4" aria-label="Ba hạng đầu">
      {order.map((r) => {
        const e = byRank(r);
        const medal = MEDAL[r as 1 | 2 | 3];
        return (
          <li key={r} className={cn("flex min-w-0 flex-col items-center gap-1.5 text-center", !e && "opacity-40")}>
            {r === 1 && (
              <svg viewBox="0 0 32 18" className="h-5 w-9" aria-hidden>
                <path d="M2 16 4 4l7 6 5-9 5 9 7-6 2 12z" fill="#e9c25a" stroke="#8a6214" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            )}
            {e ? <RankAvatar name={e.name} rank={r} size={r === 1 ? "lg" : "md"} /> : <span className="size-14 rounded-full border-2 border-dashed border-frame-line" aria-hidden />}
            <p className={cn("w-full truncate font-bold", r === 1 ? "text-base text-title-on-wood" : "text-sm text-on-wood", e?.mine && "text-frame-gold")}>
              {e ? e.name : "Còn trống"}
              {e?.mine && <span className="sr-only"> (bạn)</span>}
            </p>
            {e && <p className="rounded-full bg-black/35 px-2.5 py-0.5 text-caption font-bold tabular-nums text-on-wood">{e.score}</p>}
            {e?.detail && <p className="text-caption text-on-wood-soft">{e.detail}</p>}
            <div
              className={cn("relative mt-1 grid w-full place-items-center rounded-t-lg border-x-2 border-t-2", height[r as 1 | 2 | 3])}
              style={{ background: `linear-gradient(180deg, ${medal.ring}cc, ${medal.deep}cc)`, borderColor: medal.ring }}
            >
              <span className="text-2xl font-black text-white drop-shadow" aria-label={medal.label}>{r}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Dòng từ hạng 4: huy hiệu số, ảnh đại diện, tên, điểm bên phải; dòng của mình sáng viền vàng. */
function RankLine({ e }: { e: RankEntry }) {
  return (
    <li className={cn(
      "flex items-center gap-3 rounded-lg border px-3 py-2",
      e.mine ? "border-frame-gold bg-frame-gold/15" : "border-frame-line-soft bg-wood-inset",
    )}>
      <RankMedal rank={e.rank} />
      <RankAvatar name={e.name} rank={e.rank} size="sm" />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-semibold", e.mine ? "text-frame-gold" : "text-on-wood")}>
          {e.name}
          {e.mine && " (bạn)"}
        </p>
        {e.detail && <p className="truncate text-caption text-on-wood-soft">{e.detail}</p>}
      </div>
      <span className="shrink-0 rounded-full bg-black/35 px-3 py-1 text-sm font-bold tabular-nums text-title-on-wood">{e.score}</span>
    </li>
  );
}

/**
 * Bảng xếp hạng đầy đủ: bục ba hạng đầu, các dòng sau (hiện `initial` dòng, còn lại mở bằng nút), thanh hạng của mình
 * dính đáy. `mine` null là chưa có tên trên bảng; `myExtra` gắn thêm vào thanh (ví dụ huy hiệu bậc hạng).
 */
export function RankBoard({
  entries,
  mine,
  myExtra,
  initial = 7,
}: {
  entries: readonly RankEntry[];
  mine?: { readonly rank: number | null; readonly score: ReactNode } | null;
  myExtra?: ReactNode;
  initial?: number;
}) {
  const rest = entries.filter((e) => e.rank > 3);
  const items = Children.toArray(rest.map((e) => <RankLine key={e.rank} e={e} />));
  const [all, setAll] = useState(false);
  const meEntry = entries.find((e) => e.mine);
  const myRank = mine?.rank ?? meEntry?.rank ?? null;
  const myScore = mine?.score ?? meEntry?.score ?? null;
  return (
    <div className="flex flex-col gap-3">
      <Podium entries={entries.filter((e) => e.rank <= 3)} />
      {items.length > 0 && <ol className="flex flex-col gap-1.5">{all ? items : items.slice(0, initial)}</ol>}
      {items.length > initial && (
        <button type="button" aria-expanded={all} onClick={() => setAll((v) => !v)}
          className={buttonVariants({ variant: "secondary", className: "w-full sm:w-auto sm:self-center" })}>
          {all ? "Thu gọn" : `Xem thêm ${items.length - initial} hạng`}
        </button>
      )}
      {(mine !== undefined || meEntry) && (
        <div role="status" className="sticky bottom-2 z-10 flex items-center gap-3 rounded-xl border-2 border-frame-gold bg-wood-lo/95 px-3 py-2 shadow-2xl backdrop-blur">
          {myRank !== null ? <RankMedal rank={myRank} /> : <span className="w-10 text-center text-xl font-black text-on-wood-soft">–</span>}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-title-on-wood">Bạn</p>
            <p className="text-caption text-on-wood-soft">{myRank !== null ? `Đứng thứ ${myRank}` : "Chưa có tên trên bảng"}</p>
          </div>
          {myExtra}
          {myScore !== null && <span className="shrink-0 rounded-full bg-black/35 px-3 py-1 text-sm font-bold tabular-nums text-title-on-wood">{myScore}</span>}
        </div>
      )}
    </div>
  );
}

export interface Tier {
  readonly name: string;
  /** Điểm tối thiểu để vào bậc. */
  readonly min: number;
  readonly color: string;
}

/** Khiên bậc hạng: màu theo bậc, số sao theo thứ bậc. */
export function TierBadge({ tier, index, size = "md", dim = false }: { tier: Tier; index: number; size?: "sm" | "md"; dim?: boolean }) {
  const box = size === "md" ? "h-12 w-11" : "h-8 w-7";
  return (
    <svg viewBox="0 0 44 50" className={cn(box, "shrink-0", dim && "opacity-45 grayscale")} role="img" aria-label={`Bậc ${tier.name}`}>
      <defs>
        <linearGradient id={`tier-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor={tier.color} />
          <stop offset="1" stopColor={tier.color} stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <path d="M22 2 40 9v15c0 12-8 20-18 24C12 44 4 36 4 24V9z" fill={`url(#tier-${index})`} stroke="#2b1d14" strokeWidth="2.5" />
      <path d="M22 8 34 13v11c0 8-5 14-12 17-7-3-12-9-12-17V13z" fill="none" stroke="#2b1d14" strokeWidth="1" opacity="0.5" />
      {Array.from({ length: Math.min(index + 1, 5) }, (_, i) => {
        const n = Math.min(index + 1, 5);
        const x = 22 + (i - (n - 1) / 2) * 6;
        return <path key={i} d={`M${x} 20l1.4 2.9 3.1.4-2.3 2.1.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.1 3.1-.4z`} fill="#fff8e0" stroke="#2b1d14" strokeWidth="0.6" />;
      })}
    </svg>
  );
}

/** Bậc đang đứng của một số điểm (bậc cuối có `min` nhỏ hơn hoặc bằng điểm). */
export function tierIndex(tiers: readonly Tier[], score: number): number {
  let at = 0;
  tiers.forEach((t, i) => {
    if (score >= t.min) at = i;
  });
  return at;
}

/** Thưởng một bậc trên dải bậc hạng: số vàng và trạng thái nhận. */
export interface TierReward {
  readonly gold: number;
  readonly claimed: boolean;
  /** Thưởng kèm ngoài vàng (ví dụ món trang bị), hiện dưới số vàng. */
  readonly extra?: ReactNode;
  /** Đã nhận vàng nhưng còn thiếu phần thưởng kèm: nhãn nút nhận bù. */
  readonly owed?: string;
}

/**
 * Dải bậc hạng cuộn ngang: bậc đang đứng sáng viền, kèm tiến độ tới bậc kế. Có `rewards` thì mỗi ô hiện vàng thưởng:
 * đủ điểm mà chưa nhận có nút Nhận, đã nhận có dấu tích, chưa tới thì mờ.
 */
export function TierLadder({ tiers, score, label, rewards, onClaim, onClaimOwed, busy = false }: {
  tiers: readonly Tier[];
  score: number;
  label: string;
  rewards?: readonly TierReward[];
  onClaim?: (index: number) => void;
  /** Nhận bù phần thưởng kèm còn thiếu của bậc đã nhận (`TierReward.owed`). */
  onClaimOwed?: (index: number) => void;
  busy?: boolean;
}) {
  const at = tierIndex(tiers, score);
  const next = tiers[at + 1];
  const from = tiers[at]!.min;
  const ratio = next ? Math.max(0, Math.min(1, (score - from) / (next.min - from))) : 1;
  return (
    <section aria-label={label} className="flex flex-col gap-2">
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {tiers.map((t, i) => (
          <li key={t.name} aria-current={i === at ? "step" : undefined}
            className={cn(
              "flex min-w-20 flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center",
              i === at ? "border-frame-gold bg-frame-gold/15" : "border-frame-line-soft bg-wood-inset",
            )}>
            <TierBadge tier={t} index={i} dim={i > at} />
            <span className={cn("text-caption font-bold", i <= at ? "text-title-on-wood" : "text-on-wood-soft")}>{t.name}</span>
            <span className="text-caption tabular-nums text-on-wood-soft">{t.min}+</span>
            {rewards?.[i] ? (
              rewards[i]!.claimed ? (
                <span className="text-caption font-bold text-jade">✓ Đã nhận {rewards[i]!.gold}</span>
              ) : i <= at ? (
                <button type="button" disabled={busy} onClick={() => onClaim?.(i)}
                  className={buttonVariants({ size: "sm", className: "min-h-9 px-2 text-caption pointer-coarse:min-h-11" })}>
                  Nhận {rewards[i]!.gold} vàng
                </button>
              ) : (
                <span className="text-caption text-on-wood-soft">{rewards[i]!.gold} vàng</span>
              )
            ) : (
              i < at && <span className="text-caption font-bold text-jade" aria-label="Đã đạt">✓</span>
            )}
            {rewards?.[i]?.extra && <span className="text-caption font-semibold">{rewards[i]!.extra}</span>}
            {rewards?.[i]?.claimed && rewards[i]!.owed && (
              <button type="button" disabled={busy} onClick={() => onClaimOwed?.(i)}
                className={buttonVariants({ size: "sm", className: "min-h-9 px-2 text-caption pointer-coarse:min-h-11" })}>
                {rewards[i]!.owed}
              </button>
            )}
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-2 text-caption text-on-wood-soft">
        <span className="shrink-0 font-semibold text-on-wood">{tiers[at]!.name}</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40" role="meter" aria-label="Tiến độ tới bậc kế" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)}>
          <div className="h-full bg-frame-gold" style={{ width: `${ratio * 100}%` }} />
        </div>
        <span className="shrink-0 tabular-nums">{next ? `${score}/${next.min} · ${next.name}` : `${score} · bậc cao nhất`}</span>
      </div>
    </section>
  );
}
