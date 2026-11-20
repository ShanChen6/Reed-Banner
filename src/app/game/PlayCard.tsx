"use client";

// Thẻ bọc vùng chơi (sân đấu, bàn cờ, bảng bên). Ở màn có thẻ, nút toàn màn hình nổi ở góc dưới phải (cùng chỗ nút
// toàn màn hình của cả trang, nút đó ẩn đi) đưa riêng thẻ ra toàn màn hình: thanh đầu trang, chân trang và phần còn lại
// của màn ẩn đi. Bấm lại hoặc Esc để về. Trình duyệt không cho toàn màn hình một phần tử (iPhone Safari) thì thẻ phủ
// kín cửa sổ thay thế. Nút là con của thẻ (position: fixed) nên vẫn hiện khi thẻ đang toàn màn hình.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/cn";

function subscribeFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

/** Số thẻ đang có nút; FullscreenToggle ẩn nút chung khi số này > 0. */
let activeCards = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Có thẻ vùng chơi đang hiện nút toàn màn hình hay không (server: không). */
export function usePlayCardActive(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => activeCards > 0,
    () => false,
  );
}

export function PlayCard({
  label = "Vùng chơi",
  active = true,
  className,
  children,
}: {
  label?: string;
  /** false: thẻ đang ẩn (chưa vào trận), không có nút, nút chung của trang hiện lại. */
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const native = useSyncExternalStore(
    subscribeFullscreen,
    () => ref.current !== null && document.fullscreenElement === ref.current,
    () => false,
  );
  /** Phủ kín cửa sổ khi không có toàn màn hình thật. */
  const [overlay, setOverlay] = useState(false);
  const expanded = native || overlay;

  useEffect(() => {
    if (!active) return;
    activeCards += 1;
    emit();
    return () => {
      activeCards -= 1;
      emit();
    };
  }, [active]);

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

  const action = expanded ? "Thoát toàn màn hình" : "Toàn màn hình";
  return (
    <section ref={ref} aria-label={label} data-expanded={expanded || undefined} className={cn("play-card", overlay && "play-card--overlay", className)}>
      {children}
      {active && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={expanded}
          aria-label={action}
          title={action}
          className="fullscreen-fab game-header-btn game-header-chip fixed z-40 flex size-11 items-center justify-center rounded-full opacity-85 shadow-[0_4px_12px_rgb(0_0_0/0.5)] hover:opacity-100 focus-visible:opacity-100"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-[var(--frame-gold)]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            {expanded ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
          </svg>
        </button>
      )}
    </section>
  );
}
