"use client";

// Nút bật/tắt toàn màn hình ở thanh header, chỉ hiện ở các chế độ chơi (FULLSCREEN_SCENES), không tự bật. Toàn màn
// hình áp cho cả trang nên đổi phân cảnh vẫn giữ; đang toàn màn hình mà sang màn khác thì nút vẫn hiện để thoát.
// Trình duyệt không cho (iPhone Safari chỉ cho video toàn màn hình) thì ẩn nút; ở đó "Thêm vào màn hình chính" là
// cách duy nhất bỏ được thanh địa chỉ.

import { useCallback, useSyncExternalStore } from "react";
import { FULLSCREEN_SCENES, type Scene } from "../scene";

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

const isFullscreen = () => document.fullscreenElement !== null;
const isSupported = () => document.fullscreenEnabled === true && typeof document.documentElement.requestFullscreen === "function";
const noop = () => () => {};

export default function FullscreenToggle({ scene }: { scene: Scene }) {
  // Server render coi như không hỗ trợ, chỉ biết sau khi chạy ở trình duyệt.
  const supported = useSyncExternalStore(noop, isSupported, () => false);
  const active = useSyncExternalStore(subscribe, isFullscreen, () => false);

  const toggle = useCallback(() => {
    // Trình duyệt từ chối (chính sách trang, iframe thiếu allowfullscreen) thì thôi, nút giữ nguyên trạng thái.
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
  }, []);

  if (!supported || (!active && !FULLSCREEN_SCENES.has(scene))) return null;
  const label = active ? "Thoát toàn màn hình" : "Toàn màn hình";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="game-header-btn game-header-chip flex size-10 shrink-0 items-center justify-center rounded-md pointer-coarse:size-11"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5 text-[var(--frame-gold)]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {active ? (
          <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        ) : (
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        )}
      </svg>
    </button>
  );
}
