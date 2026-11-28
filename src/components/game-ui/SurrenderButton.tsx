"use client";
// Nút Đầu hàng dùng chung cho mọi chế độ chơi: bấm thì mở hộp thoại xác nhận (nói rõ hậu quả theo luật
// chế độ), chỉ khi chọn "Đầu hàng" trong hộp thoại mới gọi `onConfirm`. Esc, bấm nền hoặc "Chơi tiếp" thì đóng.

import { useEffect, useId, useRef, useState } from "react";
import { Button, FlagIcon, type ButtonSize } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface SurrenderButtonProps {
  /** Hậu quả khi đầu hàng theo luật chế độ, ví dụ "Trận này tính là thua." */
  readonly consequence: string;
  /** Gọi sau khi người chơi xác nhận; có thể là hàm async (nút khóa tới khi xong). */
  readonly onConfirm: () => void | Promise<void>;
  readonly disabled?: boolean;
  readonly size?: ButtonSize;
  readonly className?: string;
  /** Chữ trên nút, mặc định "Đầu hàng". */
  readonly label?: string;
}

export function SurrenderButton({ consequence, onConfirm, disabled, size = "sm", className, label = "Đầu hàng" }: SurrenderButtonProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size={size}
        disabled={disabled || busy}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn("gap-1.5", className)}
      >
        <FlagIcon />
        {label}
      </Button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && !busy && setOpen(false)}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-[var(--frame-gold)] bg-[var(--wood)] p-0 text-[var(--on-wood)] backdrop:bg-black/60"
      >
        {open && (
          <div className="flex flex-col gap-3 p-5">
            <h2 id={`${id}-title`} className="ui-title-on-wood flex items-center gap-2 font-serif text-lg font-bold">
              <FlagIcon className="size-5" />
              Đầu hàng?
            </h2>
            <p id={`${id}-desc`} className="text-sm leading-relaxed text-on-wood-soft">{consequence}</p>
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <Button variant="secondary" autoFocus disabled={busy} onClick={() => setOpen(false)}>Chơi tiếp</Button>
              <Button variant="danger" disabled={busy} onClick={() => void confirm()}>
                {busy ? "Đang rút quân…" : label}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
