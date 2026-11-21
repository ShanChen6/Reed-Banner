"use client";
// Hộp kết quả cuối ván dùng chung (Shan 21/11/2026): thắng, thua, hết màn hiện thành hộp thoại giữa màn thay vì chèn khối
// dưới bàn làm bố cục bị đẩy xuống và trang dài thêm. Dùng <dialog> mở bằng showModal nên nằm trên lớp trên cùng, kể cả
// khi vùng chơi đang phóng to toàn màn hình. Có `onDismiss` thì Esc, bấm nền hoặc nút "Xem lại bàn" đóng hộp để xem bàn;
// không có thì người chơi phải chọn một hành động (ví dụ "Sang màn").

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { FrameCorners } from "./FrameCorners";

export type ResultTone = "win" | "lose" | "neutral";

const KICKER: Record<ResultTone, string> = { win: "Thắng trận", lose: "Thất thủ", neutral: "Kết quả" };

export interface ResultModalProps {
  readonly open: boolean;
  readonly title: ReactNode;
  /** Màu dải trang trí và dòng nhỏ trên tiêu đề. */
  readonly tone?: ResultTone;
  /** Dòng nhỏ trên tiêu đề, mặc định theo `tone`. */
  readonly kicker?: string;
  /** Nút hành động (nút chính đặt `autoFocus`). */
  readonly actions: ReactNode;
  /** Có thì cho đóng hộp để xem lại bàn (Esc, bấm nền, nút "Xem lại bàn"). */
  readonly onDismiss?: () => void;
  readonly dismissLabel?: string;
  /** "md" cho nội dung có ảnh (bản đồ, danh sách); mặc định "sm". */
  readonly size?: "sm" | "md";
  readonly className?: string;
  readonly children?: ReactNode;
}

export function ResultModal({ open, title, tone = "neutral", kicker, actions, onDismiss, dismissLabel = "Xem lại bàn", size = "sm", className, children }: ResultModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      data-tone={tone}
      aria-labelledby={`${id}-title`}
      // Esc: đóng khi được phép xem lại bàn, còn không thì giữ hộp mở.
      onCancel={(e) => {
        e.preventDefault();
        onDismiss?.();
      }}
      onClick={(e) => e.target === e.currentTarget && onDismiss?.()}
      className={cn(
        "ui-result-modal m-auto max-h-[calc(100dvh-2rem)] overflow-visible bg-transparent p-0 text-on-wood backdrop:bg-black/65 backdrop:backdrop-blur-[2px]",
        size === "md" ? "w-[min(34rem,calc(100vw-2rem))]" : "w-[min(26rem,calc(100vw-2rem))]",
      )}
    >
      {open && (
        <section role="status" className={cn("ui-frame ui-frame--raised relative flex max-h-[calc(100dvh-2rem)] flex-col items-center gap-3 overflow-y-auto px-5 pt-6 pb-5 text-center sm:px-7", className)}>
          <FrameCorners size="size-6" />
          <p className="ui-result-modal__kicker flex items-center gap-2 text-kicker font-semibold tracking-[0.25em] uppercase">
            <span aria-hidden>◆</span>
            {kicker ?? KICKER[tone]}
            <span aria-hidden>◆</span>
          </p>
          <h2 id={`${id}-title`} className="ui-title-on-wood font-serif text-2xl font-bold sm:text-3xl">
            {title}
          </h2>
          {children && <div className="flex w-full flex-col items-center gap-3 text-[15px]">{children}</div>}
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            {actions}
            {onDismiss && (
              <Button variant="secondary" size="lg" onClick={onDismiss}>
                {dismissLabel}
              </Button>
            )}
          </div>
        </section>
      )}
    </dialog>
  );
}
