"use client";

// Vùng chơi (sân đấu, bàn cờ, bảng bên) có nút "Phóng to màn chơi" ở góc dưới phải. Trang thường không bọc khung;
// bấm nút là đưa riêng vùng chơi ra toàn màn hình trong một khung toàn cảnh riêng; thanh đầu trang, chân trang và
// phần còn lại của màn ẩn đi. Bấm lại hoặc Esc để về. Khác nút toàn màn hình cả trang web (FullscreenToggle, góc dưới phải cửa sổ); hai nút dùng song song.
// Trình duyệt không cho toàn màn hình một phần tử (iPhone Safari) thì thẻ phủ kín cửa sổ thay thế.
// Khi phóng to, thanh đầu trang ẩn đi nên tên chế độ hiện trên bảng tên đồng đè lên mép trên khung (Shan 20/11/2026,
// cùng kiểu bảng tên ở thanh đầu trang).

import { useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { FrameCorners } from "@/components/game-ui/FrameCorners";
import { cn } from "@/lib/cn";
import { SCENE_TITLE } from "./scene";
import { SceneContext } from "./SceneContext";

function subscribeFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

export function PlayCard({
  label = "Vùng chơi",
  active = true,
  className,
  children,
}: {
  label?: string;
  /** false: thẻ đang ẩn (chưa vào trận), không hiện nút. */
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const scene = useContext(SceneContext)?.currentScene;
  const title = scene ? SCENE_TITLE[scene] : null;
  const native = useSyncExternalStore(
    subscribeFullscreen,
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

  const action = expanded ? "Thu nhỏ màn chơi" : "Phóng to màn chơi";
  return (
    <section ref={ref} aria-label={label} data-expanded={expanded || undefined} className={cn("play-card", overlay && "play-card--overlay", className)}>
      {/* Trang thường không có khung; khi phóng to, lớp trong thành khung toàn cảnh (viền, góc hoa văn), lớp ngoài thành nền tối có lề. */}
      <div className="play-card-body">
        {expanded && <FrameCorners size="size-8 sm:size-10" cornerClass="play-card-corner" />}
        {expanded && title && (
          <p aria-hidden className="play-card-title game-header-title truncate px-3 pt-[0.12em] text-center font-serif text-caption leading-[1.9] font-bold tracking-[0.12em] uppercase sm:px-5 sm:text-base sm:tracking-[0.2em]">
            {title}
          </p>
        )}
        {children}
      </div>
      {active && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={expanded}
          aria-label={action}
          title={action}
          className="play-card-toggle game-header-btn game-header-chip flex size-10 items-center justify-center rounded-full shadow-[0_4px_12px_rgb(0_0_0/0.5)]"
        >
          {/* Mũi tên chéo (khác bốn góc của nút toàn màn hình cả trang) để phân biệt hai nút. */}
          <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-[var(--frame-gold)]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            {expanded ? <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /> : <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />}
          </svg>
        </button>
      )}
    </section>
  );
}
