"use client";
// Hộp chọn giữa màn dùng chung: khung gỗ, tiêu đề, nội dung, nút "Xong". Dùng cho lựa chọn phụ được gom khỏi màn vừa một
// màn hình (Tháp Thí Luyện: đổi hệ, nghề thủ lĩnh; lọc tướng kèm). <dialog> mở bằng showModal: Esc, bấm nền hoặc "Xong"
// đều đóng; lựa chọn áp ngay khi bấm, không cần xác nhận.

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { FrameCorners } from "./FrameCorners";

export function FrameDialog({ open, title, onClose, children, className }: {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
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
      aria-labelledby={`${id}-title`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(44rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-on-wood backdrop:bg-black/65 backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <section className={cn("ui-frame ui-frame--raised relative flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-y-auto p-5 sm:p-6", className)}>
          <FrameCorners size="size-6" />
          <h2 id={`${id}-title`} className="ui-title-on-wood text-title">{title}</h2>
          {children}
          <Button className="min-h-11 self-end px-8" onClick={onClose}>
            Xong
          </Button>
        </section>
      )}
    </dialog>
  );
}
