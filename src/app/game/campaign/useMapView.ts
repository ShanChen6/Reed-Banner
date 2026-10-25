"use client";

// Phóng, kéo và điều khiển bàn phím cho bản đồ SVG (tách từ bản đồ 24 điểm cũ): khung nhìn là một viewBox con
// của khung W × H. Một ngón kéo khi đã phóng, hai ngón phóng quanh trung điểm; vừa kéo thì không tính là bấm.

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export const MAX_ZOOM = 3;

export interface MapView {
  readonly x: number;
  readonly y: number;
  readonly s: number;
}

export function clampView(v: MapView, w: number, h: number): MapView {
  const s = Math.min(MAX_ZOOM, Math.max(1, v.s));
  return {
    s,
    x: Math.min(w - w / s, Math.max(0, v.x)),
    y: Math.min(h - h / s, Math.max(0, v.y)),
  };
}

/** Khung nhìn ôm các điểm (cộng lề), không phóng quá `maxScale`; không có điểm thì xem toàn cảnh. */
export function fitView(
  points: readonly (readonly [number, number])[],
  w: number,
  h: number,
  pad: number,
  maxScale: number,
): MapView {
  if (points.length === 0) return { x: 0, y: 0, s: 1 };
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs) - pad;
  const x1 = Math.max(...xs) + pad;
  const y0 = Math.min(...ys) - pad;
  const y1 = Math.max(...ys) + pad;
  const s = Math.max(1, Math.min(maxScale, w / (x1 - x0), h / (y1 - y0)));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return clampView({ s, x: cx - w / s / 2, y: cy - h / s / 2 }, w, h);
}

export function useMapView(w: number, h: number) {
  const [view, setView] = useState<MapView>({ x: 0, y: 0, s: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ moved: boolean; pinch?: number }>({ moved: false });

  const clamp = (v: MapView) => clampView(v, w, h);
  const zoomAt = (v: MapView, factor: number, cx: number, cy: number) => {
    const s = Math.min(MAX_ZOOM, Math.max(1, v.s * factor));
    const k = v.s / s;
    return clamp({ s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
  };

  /** Đổi tọa độ màn hình sang tọa độ bản đồ đang hiển thị. */
  const toMap = (clientX: number, clientY: number): [number, number] => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return [w / 2, h / 2];
    return [
      view.x + ((clientX - rect.left) / rect.width) * (w / view.s),
      view.y + ((clientY - rect.top) / rect.height) * (h / view.s),
    ];
  };

  const zoomBy = (factor: number) =>
    setView((v) => zoomAt(v, factor, v.x + w / v.s / 2, v.y + h / v.s / 2));
  const panBy = (dx: number, dy: number) =>
    setView((v) => clamp({ ...v, x: v.x + dx / v.s, y: v.y + dy / v.s }));
  const reset = () => setView({ x: 0, y: 0, s: 1 });

  /** Điểm đang ngoài khung nhìn (chọn bằng bàn phím) thì kéo khung tới đó. */
  const reveal = (x: number, y: number) =>
    setView((v) => {
      const vw = w / v.s;
      const vh = h / v.s;
      const m = 40;
      if (x > v.x + m && x < v.x + vw - m && y > v.y + m && y < v.y + vh - m)
        return v;
      return clamp({ ...v, x: x - vw / 2, y: y - vh / 2 });
    });

  const svgProps = {
    ref: svgRef,
    viewBox: `${view.x.toFixed(1)} ${view.y.toFixed(1)} ${(w / view.s).toFixed(1)} ${(h / view.s).toFixed(1)}`,
    style: { touchAction: view.s > 1 ? "none" : "pan-y" } as const,
    onPointerDown: (e: PointerEvent<SVGSVGElement>) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 1) drag.current = { moved: false };
    },
    onPointerMove: (e: PointerEvent<SVGSVGElement>) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const list = [...pointers.current.values()];
      if (list.length === 2) {
        const d = Math.hypot(list[0]!.x - list[1]!.x, list[0]!.y - list[1]!.y);
        const last = drag.current.pinch;
        drag.current = { moved: true, pinch: d };
        if (last && d > 0) {
          const [cx, cy] = toMap(
            (list[0]!.x + list[1]!.x) / 2,
            (list[0]!.y + list[1]!.y) / 2,
          );
          setView((v) => zoomAt(v, d / last, cx, cy));
        }
        return;
      }
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (!drag.current.moved && Math.hypot(dx, dy) < 2) return;
      if (view.s === 1) return;
      drag.current = { moved: true };
      setView((v) =>
        clamp({
          ...v,
          x: v.x - (dx / rect.width) * (w / v.s),
          y: v.y - (dy / rect.height) * (h / v.s),
        }),
      );
    },
    onPointerUp: (e: PointerEvent<SVGSVGElement>) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2 && drag.current.pinch !== undefined)
        drag.current = { moved: true };
    },
    onPointerCancel: (e: PointerEvent<SVGSVGElement>) => {
      pointers.current.delete(e.pointerId);
    },
    onClickCapture: (e: { stopPropagation: () => void }) => {
      // Vừa kéo hoặc phóng bằng hai ngón thì không tính là bấm điểm.
      if (drag.current.moved) {
        e.stopPropagation();
        drag.current = { moved: false };
      }
    },
    onKeyDown: (e: KeyboardEvent<SVGSVGElement>) => {
      const step = 80;
      const keys: Record<string, () => void> = {
        ArrowLeft: () => panBy(-step, 0),
        ArrowRight: () => panBy(step, 0),
        ArrowUp: () => panBy(0, -step),
        ArrowDown: () => panBy(0, step),
        "+": () => zoomBy(1.5),
        "=": () => zoomBy(1.5),
        "-": () => zoomBy(1 / 1.5),
        "0": reset,
      };
      const run = keys[e.key];
      if (run) {
        e.preventDefault();
        run();
      }
    },
  };

  return { view, setView, zoomBy, reset, reveal, svgProps };
}
