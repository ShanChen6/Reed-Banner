"use client";

// Thu phóng riêng bàn cờ, dùng chung cho mọi màn có bàn (trận match-3, Khai Lộ, Sử Lộ, Do Thám). Khác thu phóng cả
// trang của trình duyệt: chỉ ô cờ to/nhỏ, phần còn lại của màn giữ nguyên.
// - Nút −/+ (mỗi nấc 10 %), bấm số phần trăm để về 100 %.
// - Ctrl/⌘ + cuộn chuột, hoặc chụm hai ngón trên bàn di chuột, khi con trỏ đang ở trên bàn.
// - Điện thoại: chụm/mở hai ngón trên bàn; hai ngón kéo để dời khi bàn to hơn khung. Một ngón vẫn là vuốt đổi ô.
// Bàn đọc hệ số qua biến CSS --board-zoom do <BoardZoomViewport> đặt; mức chọn nhớ theo từng loại bàn (localStorage).

import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { clampZoom, parseZoom, stepZoom, ZOOM_DEFAULT, ZOOM_MAX, ZOOM_MIN, zoomLabel, zoomStorageKey, type BoardZoomId } from "./zoom";

const EVENT = "colau:board-zoom";

function read(id: BoardZoomId): number {
  try {
    return parseZoom(window.localStorage.getItem(zoomStorageKey(id)));
  } catch {
    return ZOOM_DEFAULT;
  }
}

function write(id: BoardZoomId, z: number) {
  try {
    if (z === ZOOM_DEFAULT) window.localStorage.removeItem(zoomStorageKey(id));
    else window.localStorage.setItem(zoomStorageKey(id), String(z));
  } catch {
    // Trình duyệt chặn lưu (chế độ riêng tư): vẫn đổi trong phiên qua sự kiện bên dưới nhưng không nhớ.
    memory.set(id, z);
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Dự phòng khi không ghi được localStorage. */
const memory = new Map<BoardZoomId, number>();

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Mức thu phóng của một loại bàn và hàm đổi; server dựng ở 100 %. */
export function useBoardZoom(id: BoardZoomId) {
  const zoom = useSyncExternalStore(
    subscribe,
    () => memory.get(id) ?? read(id),
    () => ZOOM_DEFAULT,
  );
  const setZoom = useCallback((z: number | ((prev: number) => number)) => {
    const prev = memory.get(id) ?? read(id);
    write(id, clampZoom(typeof z === "function" ? z(prev) : z));
  }, [id]);
  return { zoom, setZoom };
}

/** Hàng nút − 100 % + đặt trên bàn. */
export function BoardZoomControls({ id, className = "" }: { id: BoardZoomId; className?: string }) {
  const { zoom, setZoom } = useBoardZoom(id);
  const btn =
    "game-header-btn game-header-chip flex size-9 items-center justify-center rounded-lg text-lg font-bold leading-none disabled:pointer-events-none disabled:opacity-40";
  return (
    <div role="group" aria-label="Thu phóng bàn cờ" className={`flex items-center gap-1 ${className}`}>
      <button type="button" className={btn} aria-label="Thu nhỏ bàn cờ" title="Thu nhỏ bàn cờ" disabled={zoom <= ZOOM_MIN} onClick={() => setZoom((z) => stepZoom(z, -1))}>
        −
      </button>
      <button
        type="button"
        className="game-header-btn game-header-chip h-9 min-w-14 rounded-lg px-1.5 text-sm font-bold tabular-nums"
        aria-label={`Cỡ bàn cờ ${zoomLabel(zoom)}, bấm để về 100%`}
        title="Về cỡ gốc"
        onClick={() => setZoom(ZOOM_DEFAULT)}
      >
        {zoomLabel(zoom)}
      </button>
      <button type="button" className={btn} aria-label="Phóng to bàn cờ" title="Phóng to bàn cờ" disabled={zoom >= ZOOM_MAX} onClick={() => setZoom((z) => stepZoom(z, 1))}>
        +
      </button>
    </div>
  );
}

type Pinch = { dist: number; zoom: number; mx: number; my: number };

const touchDist = (t: TouchList) => Math.hypot(t[0]!.clientX - t[1]!.clientX, t[0]!.clientY - t[1]!.clientY);
const touchMid = (t: TouchList) => ({ x: (t[0]!.clientX + t[1]!.clientX) / 2, y: (t[0]!.clientY + t[1]!.clientY) / 2 });

/**
 * Khung cuộn quanh bàn: đặt --board-zoom, cuộn được khi bàn to hơn khung, bắt Ctrl + cuộn và chụm hai ngón.
 * Đang chụm thì chặn lần nhấc ngón (pointerup) để bàn không hiểu nhầm là vuốt đổi ô.
 */
export function BoardZoomViewport({ id, className = "", children }: { id: BoardZoomId; className?: string; children: ReactNode }) {
  const { zoom, setZoom } = useBoardZoom(id);
  const ref = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pinch: Pinch | null = null;
    let swallow = false;
    let wheelAcc = 0;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      // Bàn di chuột gửi nhiều sự kiện nhỏ, chuột gửi nấc lớn: cộng dồn đến ~60 px mới đổi một nấc.
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) < 60 && Math.abs(e.deltaY) < 60) return;
      const dir = wheelAcc < 0 ? 1 : -1;
      wheelAcc = 0;
      setZoom((z) => stepZoom(z, dir));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      const m = touchMid(e.touches);
      pinch = { dist: touchDist(e.touches), zoom: zoomRef.current, mx: m.x, my: m.y };
      swallow = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const z = clampZoom(pinch.zoom * (touchDist(e.touches) / Math.max(1, pinch.dist)));
      if (z !== zoomRef.current) setZoom(z);
      const m = touchMid(e.touches);
      el.scrollLeft -= m.x - pinch.mx;
      el.scrollTop -= m.y - pinch.my;
      pinch.mx = m.x;
      pinch.my = m.y;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch = null;
      if (e.touches.length === 0) swallow = false;
    };
    // Sự kiện con trỏ đến trước sự kiện chạm, nên lúc nhấc ngón cuối cùng `swallow` vẫn bật.
    const onPointerUp = (e: PointerEvent) => {
      if (swallow && e.pointerType === "touch") e.stopPropagation();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    el.addEventListener("pointerup", onPointerUp, true);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("pointerup", onPointerUp, true);
    };
  }, [setZoom]);

  return (
    <div
      ref={ref}
      data-board-zoom={zoom}
      className={`max-w-full overflow-auto overscroll-contain [touch-action:pan-x_pan-y] ${className}`}
      style={{ "--board-zoom": zoom } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
