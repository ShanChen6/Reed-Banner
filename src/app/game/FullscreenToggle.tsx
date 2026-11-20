"use client";

// Nút nổi bật/tắt toàn màn hình ở góc dưới bên phải, hiện ở mọi màn (FULLSCREEN_SCENES), không tự bật. Màn có thẻ
// vùng chơi (PlayCard) thì ẩn, nút của thẻ thay chỗ.
// Trên điện thoại, màn nào có thanh dính đáy (lớp .mobile-dock) thì nút nhích lên trên thanh đó (globals.css). Toàn màn
// hình áp cho cả trang nên đổi phân cảnh vẫn giữ; đang toàn màn hình mà sang màn khác thì nút vẫn hiện để thoát.
// Trình duyệt không cho (iPhone Safari chỉ cho video toàn màn hình) thì ẩn nút; ở đó "Thêm vào màn hình chính" là
// cách duy nhất bỏ được thanh địa chỉ.

import { useCallback, useSyncExternalStore } from "react";
import { usePlayCardActive } from "./PlayCard";
import { FULLSCREEN_SCENES, type Scene } from "./scene";

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

// Thẻ vùng chơi đang toàn màn hình thì nút của thẻ lo việc thoát, nút chung không tính.
const isFullscreen = () => document.fullscreenElement !== null && !document.fullscreenElement.classList.contains("play-card");
const isSupported = () => document.fullscreenEnabled === true && typeof document.documentElement.requestFullscreen === "function";
const noop = () => () => {};

export default function FullscreenToggle({ scene }: { scene: Scene }) {
  // Server render coi như không hỗ trợ, chỉ biết sau khi chạy ở trình duyệt.
  const supported = useSyncExternalStore(noop, isSupported, () => false);
  const active = useSyncExternalStore(subscribe, isFullscreen, () => false);
  // Màn có thẻ vùng chơi dùng nút của thẻ (cùng chỗ, đưa riêng vùng chơi ra toàn màn hình).
  const playCard = usePlayCardActive();

  const toggle = useCallback(() => {
    // Trình duyệt từ chối (chính sách trang, iframe thiếu allowfullscreen) thì thôi, nút giữ nguyên trạng thái.
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
  }, []);

  if (!supported || (!active && (playCard || !FULLSCREEN_SCENES.has(scene)))) return null;
  const label = active ? "Thoát toàn màn hình" : "Toàn màn hình";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="fullscreen-fab game-header-btn game-header-chip fixed z-40 flex size-11 items-center justify-center rounded-full opacity-85 shadow-[0_4px_12px_rgb(0_0_0/0.5)] hover:opacity-100 focus-visible:opacity-100"
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
