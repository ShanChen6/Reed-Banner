"use client";

// Thẻ bọc vùng chơi (sân đấu, bàn cờ, bảng bên) có nút mở toàn màn hình, như nút toàn màn hình của cả trang nhưng chỉ
// đưa riêng thẻ này ra toàn màn hình: thanh đầu trang, chân trang và phần còn lại của màn ẩn đi. Thoát bằng nút "Thu
// nhỏ" hoặc Esc. Trình duyệt không cho toàn màn hình một phần tử (iPhone Safari) thì thẻ phủ kín cửa sổ thay thế.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/cn";

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

export function PlayCard({
  label = "Vùng chơi",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const native = useSyncExternalStore(
    subscribe,
    () => ref.current !== null && document.fullscreenElement === ref.current,
    () => false,
  );
  /** Phủ kín cửa sổ khi không có toàn màn hình thật. */
  const [overlay, setOverlay] = useState(false);
  const expanded = native || overlay;

  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlay(false);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [overlay]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (native) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    if (overlay) {
      setOverlay(false);
      return;
    }
    if (document.fullscreenEnabled && typeof el.requestFullscreen === "function") {
      void el.requestFullscreen({ navigationUI: "hide" }).catch(() => setOverlay(true));
    } else {
      setOverlay(true);
    }
  }, [native, overlay]);

  const action = expanded ? "Thu nhỏ" : "Toàn màn hình";
  return (
    <section ref={ref} aria-label={label} data-expanded={expanded || undefined} className={cn("play-card", overlay && "play-card--overlay", className)}>
      <div className="play-card-bar">
        <span className="play-card-title">{label}</span>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={expanded}
          aria-label={`${action} vùng chơi`}
          title={`${action} vùng chơi`}
          className="game-header-btn game-header-chip flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-[var(--frame-gold)]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            {expanded ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
          </svg>
          {action}
        </button>
      </div>
      {children}
    </section>
  );
}
