"use client";

// Bảng trượt đáy (quy tắc điện thoại 21/11/2026): hướng dẫn chế độ, chọn tướng, nguyên liệu, đạo cụ trong danh sách
// dài. Dùng <dialog> gốc để có khóa tiêu điểm và Esc. Điện thoại: trượt lên từ đáy, cao tối đa 85% màn; từ 640px là
// hộp giữa màn. Bấm nền, Esc hoặc nút đóng thì gọi `onClose`.

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface BottomSheetProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly children: ReactNode;
  /** Phần dính trên đầu thân bảng (bộ lọc), không cuộn theo nội dung. */
  readonly toolbar?: ReactNode;
  /** Phần dính dưới đáy bảng (nút xác nhận). */
  readonly footer?: ReactNode;
  readonly className?: string;
}

export function BottomSheet({ open, onClose, title, children, toolbar, footer, className }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby={`${id}-title`}
      className={cn("ui-sheet", className)}
    >
      {open && (
        <div className="flex max-h-[inherit] flex-col">
          <div className="flex items-center gap-3 border-b border-frame-line-soft px-4 pt-3 pb-2.5">
            <span aria-hidden className="ui-sheet-handle" />
            <h2 id={`${id}-title`} className="ui-title-on-wood min-w-0 flex-1 text-title">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Đóng"
              className="flex size-11 shrink-0 items-center justify-center rounded-md text-on-wood-soft hover:text-title-on-wood">
              <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
          {toolbar && <div className="border-b border-frame-line-soft px-4 py-2.5">{toolbar}</div>}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">{children}</div>
          {footer && <div className="border-t border-frame-line-soft px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
