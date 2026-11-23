"use client";

// Bố cục màn cờ hai người (Tam Quân Kỳ, Vây Thành Kỳ): bàn cờ ở giữa, mỗi bên một cột thông tin như bàn cờ thật, người chơi
// bên trái, đối thủ bên phải (Shan 23/11/2026, theo ảnh bàn cờ vây Shan gửi). Bàn co theo chiều cao màn hình để không phải
// cuộn trong lúc chơi, cả ở trang thường và khi phóng to màn chơi. Màn hẹp (dưới lg) xếp dọc: thẻ đối thủ, bàn cờ, thẻ người
// chơi, rồi phần thêm của hai bên.

import type { CSSProperties, ReactNode } from "react";
import { OrnateFrame } from "@/components/game-ui";
import { cn } from "@/lib/cn";
import { usePlayCardExpanded } from "./PlayCard";

export function DuelLayout({
  aspect,
  leftCard,
  leftExtra,
  rightCard,
  rightExtra,
  below,
  className,
  children,
}: {
  /** Tỉ lệ rộng/cao của bàn cờ (kể cả viền), để tính bề ngang tối đa theo chiều cao màn. */
  aspect: number;
  /** Thẻ người chơi (bên trái, màn hẹp thì nằm ngay dưới bàn). */
  leftCard: ReactNode;
  /** Phần thêm bên trái: quân đang chọn, nút thao tác. */
  leftExtra?: ReactNode;
  /** Thẻ đối thủ (bên phải, màn hẹp thì nằm trên bàn). */
  rightCard: ReactNode;
  /** Phần thêm bên phải: nhật ký trận, ghi chú ván. */
  rightExtra?: ReactNode;
  /** Dưới bàn cờ (chọn cách đánh, dòng trạng thái). */
  below?: ReactNode;
  className?: string;
  /** Bàn cờ. */
  children: ReactNode;
}) {
  const expanded = usePlayCardExpanded();
  // Chừa chỗ cho thanh đầu trang (trang thường) hoặc bảng tên và viền khung (phóng to).
  const reserve = expanded ? "7.5rem" : "8.5rem";
  const style = { "--duel-board-max": `calc((100dvh - ${reserve}) * ${aspect})` } as CSSProperties;
  const body = (
    <div
      style={style}
      className={cn(
        "grid min-w-0 gap-3 [grid-template-areas:'rc'_'b'_'lc'_'le'_'re'] lg:items-start lg:gap-x-5",
        "lg:grid-cols-[minmax(14rem,19rem)_minmax(0,1fr)_minmax(14rem,19rem)] lg:grid-rows-[auto_1fr] lg:[grid-template-areas:'lc_b_rc'_'le_b_re']",
        className,
      )}
    >
      <div className="min-w-0 [grid-area:lc]">{leftCard}</div>
      <div className="flex min-w-0 flex-col gap-3 [grid-area:le] empty:hidden">{leftExtra}</div>
      <div className="flex min-w-0 flex-col items-center gap-3 [grid-area:b]">
        <div className="w-full max-w-[var(--duel-board-max)]">{children}</div>
        {below}
      </div>
      <div className="min-w-0 [grid-area:rc]">{rightCard}</div>
      <div className="flex min-w-0 flex-col gap-3 [grid-area:re] empty:hidden">{rightExtra}</div>
    </div>
  );
  // Phóng to thì khung toàn cảnh đã có viền, không lồng thêm khung.
  if (expanded) return body;
  return (
    <OrnateFrame aria-label="Vùng chơi" flush className="p-2 sm:p-4">
      {body}
    </OrnateFrame>
  );
}

/** Thẻ một bên: chân dung, tên, dòng phụ, đồng hồ. Viền sáng khi tới lượt; `accent` là màu phe (viền trái và nền nhạt). */
export function DuelSideCard({
  portrait,
  name,
  sub,
  clock,
  active,
  status,
  accent,
  children,
}: {
  portrait: ReactNode;
  name: ReactNode;
  sub?: ReactNode;
  /** Chữ đồng hồ (đã định dạng), không có thì ẩn. */
  clock?: string | null;
  active: boolean;
  /** Chữ nhỏ cạnh tên khi tới lượt: "tới lượt", "đang tính". */
  status?: ReactNode;
  accent: string;
  /** Dòng thêm dưới thẻ (bị chiếu, giữ Soái trướng…). */
  children?: ReactNode;
}) {
  return (
    <section
      style={{ "--side": accent } as CSSProperties}
      aria-current={active ? "step" : undefined}
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden rounded-[var(--radius-card,0.75rem)] border p-3 transition-colors",
        "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--side)_38%,transparent),color-mix(in_srgb,var(--side)_12%,transparent)_70%)]",
        active ? "border-frame-gold shadow-[0_0_0_1px_var(--frame-gold),0_0_18px_-4px_var(--frame-gold)]" : "border-frame-line",
      )}
    >
      <div className="flex items-center gap-3 lg:flex-col lg:items-stretch lg:text-center">
        <div className="shrink-0 lg:self-center">{portrait}</div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-lg font-bold text-title-on-wood">{name}</p>
          {sub && <p className="text-caption text-on-wood-soft">{sub}</p>}
          <p className={cn("min-h-5 text-caption font-semibold text-frame-gold", !active && "invisible")} aria-live="polite">
            {active ? status : " "}
          </p>
        </div>
        {clock != null && (
          <p className={cn("shrink-0 font-mono text-2xl tabular-nums lg:text-3xl", active ? "text-on-wood" : "text-on-wood-soft")}>{clock}</p>
        )}
      </div>
      {children}
    </section>
  );
}
