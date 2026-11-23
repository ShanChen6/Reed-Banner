"use client";

// Bàn cờ Vây Thành Kỳ (SVG): đất quanh quân đổi nền theo nguyên tố của bên đó, quân là quả cầu nguyên tố.
// Chuột: bấm là đặt quân. Cảm ứng: chạm một lần xem trước, chạm lần nữa mới đặt. Bàn phím: mũi tên, Enter đặt, P bỏ lượt.

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Element } from "@/core";
import { BLACK, WHITE, columnLabel, starPoints, type Color } from "@/core/co-vay";
import { THEME } from "./theme";

/** Ảnh hưởng của quân theo khoảng cách Manhattan 0..3: đất tô màu khi một bên trội hẳn. */
const REACH = [8, 4, 2, 1] as const;

/** Bên làm chủ mỗi giao điểm theo ảnh hưởng của quân còn sống (BLACK, WHITE hoặc 0). */
export function influence(board: Int8Array, size: number, dead: ReadonlySet<number>): Int8Array {
  const sum = new Float32Array(size * size);
  for (let p = 0; p < board.length; p++) {
    const c = board[p];
    if (!c || dead.has(p)) continue;
    const sign = c === BLACK ? 1 : -1;
    const px = p % size;
    const py = (p - px) / size;
    for (let dy = -3; dy <= 3; dy++) {
      const y = py + dy;
      if (y < 0 || y >= size) continue;
      for (let dx = -3; dx <= 3; dx++) {
        const d = Math.abs(dx) + Math.abs(dy);
        const x = px + dx;
        if (d > 3 || x < 0 || x >= size) continue;
        sum[y * size + x]! += sign * REACH[d]!;
      }
    }
  }
  const owner = new Int8Array(size * size);
  for (let p = 0; p < owner.length; p++) owner[p] = sum[p]! >= 2 ? BLACK : sum[p]! <= -2 ? WHITE : 0;
  return owner;
}

/** Quả cầu nguyên tố. `r` theo đơn vị bàn. */
export function Orb({ element, cx, cy, r, gradientId, opacity = 1 }: { element: Element; cx: number; cy: number; r: number; gradientId: string; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <circle cx={cx + r * 0.08} cy={cy + r * 0.14} r={r} fill="#000" opacity={0.28} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gradientId})`} stroke={THEME[element].dark} strokeWidth={r * 0.07} />
      <image href={`/art/elements/${element}.webp`} x={cx - r * 0.68} y={cy - r * 0.68} width={r * 1.36} height={r * 1.36} />
      <ellipse cx={cx - r * 0.32} cy={cy - r * 0.42} rx={r * 0.34} ry={r * 0.2} fill="#fff" opacity={0.45} transform={`rotate(-28 ${cx - r * 0.32} ${cy - r * 0.42})`} />
    </g>
  );
}

/** Quả cầu nhỏ dùng ngoài bàn (khung người chơi, nút chọn hệ). */
export function OrbIcon({ element, className = "size-6" }: { element: Element; className?: string }) {
  const id = `vtk-orb-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 2 2" className={className} aria-hidden focusable="false">
      <OrbGradient id={id} element={element} />
      <Orb element={element} cx={0.95} cy={0.92} r={0.82} gradientId={id} />
    </svg>
  );
}

function OrbGradient({ id, element }: { id: string; element: Element }) {
  const t = THEME[element];
  return (
    <defs>
      <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor={t.light} />
        <stop offset="0.45" stopColor={t.base} />
        <stop offset="1" stopColor={t.dark} />
      </radialGradient>
    </defs>
  );
}

export interface BoardProps {
  readonly size: number;
  readonly board: Int8Array;
  readonly elements: Readonly<Record<Color, Element>>;
  /** Bên đặt quân khi bấm (để vẽ quân xem trước). */
  readonly toPlay: Color;
  readonly lastMove: number | null;
  readonly interactive: boolean;
  readonly onPlay: (point: number) => void;
  readonly onPass?: () => void;
  /** Đếm điểm: quân chết và chủ đất theo luật; bấm quân để đổi sống/chết. */
  readonly dead?: readonly number[];
  readonly owner?: Int8Array | null;
  readonly onToggleDead?: (point: number) => void;
  readonly label: string;
}

export function Board({ size, board, elements, toPlay, lastMove, interactive, onPlay, onPass, dead = [], owner, onToggleDead, label }: BoardProps) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const deadSet = useMemo(() => new Set(dead), [dead]);
  const stars = useMemo(() => starPoints(size), [size]);
  const ground = useMemo(() => owner ?? influence(board, size, deadSet), [owner, board, size, deadSet]);
  const area = size * size;

  // Thế cờ đổi thì bỏ quân xem trước.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- xóa quân xem trước khi bàn đổi
    setPending(null);
    setHover(null);
  }, [board]);

  const pointAt = (clientX: number, clientY: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const unit = rect.width / (size + 1);
    const x = Math.round((clientX - rect.left) / unit - 1);
    const y = Math.round((clientY - rect.top) / unit - 1);
    if (x < 0 || y < 0 || x >= size || y >= size) return null;
    return y * size + x;
  };

  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    const point = pointAt(event.clientX, event.clientY);
    if (point === null) return;
    if (onToggleDead) {
      if (board[point] !== 0) onToggleDead(point);
      return;
    }
    if (!interactive) return;
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      if (pending === point) {
        setPending(null);
        onPlay(point);
      } else setPending(point);
      return;
    }
    onPlay(point);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const move = (dx: number, dy: number) => {
      event.preventDefault();
      const current = cursor ?? Math.floor(area / 2);
      const x = Math.min(size - 1, Math.max(0, (current % size) + dx));
      const y = Math.min(size - 1, Math.max(0, Math.floor(current / size) + dy));
      setCursor(y * size + x);
    };
    if (event.key === "ArrowLeft") move(-1, 0);
    else if (event.key === "ArrowRight") move(1, 0);
    else if (event.key === "ArrowUp") move(0, -1);
    else if (event.key === "ArrowDown") move(0, 1);
    else if ((event.key === "Enter" || event.key === " ") && cursor !== null) {
      event.preventDefault();
      if (onToggleDead) onToggleDead(cursor);
      else if (interactive) onPlay(cursor);
    } else if ((event.key === "p" || event.key === "P") && onPass && interactive) {
      event.preventDefault();
      onPass();
    }
  };

  const coord = (p: number) => ({ cx: (p % size) + 1, cy: Math.floor(p / size) + 1 });
  const ghost = pending ?? (interactive && !onToggleDead ? hover : null);
  const r = 0.46;
  const blur = size >= 19 ? 0.22 : size >= 13 ? 0.26 : 0.3;
  const grid = (c: Color) => THEME[elements[c]].lightGrid;
  const gradient = (c: Color) => `${uid}-g${c}`;
  const sides = [BLACK, WHITE] as const;

  return (
    <div className="mx-auto w-full max-w-[min(100%,44rem)]" style={{ ["--vtk-frame" as string]: "#5b3a1e" }}>
      <div
        role="application"
        tabIndex={0}
        aria-label={label}
        onKeyDown={onKeyDown}
        onBlur={() => setCursor(null)}
        className="rounded-card border-4 border-[var(--vtk-frame)] bg-[var(--vtk-frame)] p-1 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-frame-gold"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size + 1} ${size + 1}`}
          className={`block h-auto w-full touch-manipulation select-none ${interactive || onToggleDead ? "cursor-pointer" : "cursor-default"}`}
          onPointerMove={(e) => e.pointerType === "mouse" && setHover(pointAt(e.clientX, e.clientY))}
          onPointerLeave={() => setHover(null)}
          onPointerUp={onPointerUp}
          aria-hidden="true"
          data-testid="vtk-board"
        >
          <defs>
            {sides.map((c) => (
              <pattern key={c} id={`${uid}-p${c}`} width={2} height={2} patternUnits="userSpaceOnUse" x={0.5} y={0.5}>
                {THEME[elements[c]].ground}
              </pattern>
            ))}
            <filter id={`${uid}-blur`} x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
            {sides.map((c) => (
              <mask key={c} id={`${uid}-m${c}`} maskUnits="userSpaceOnUse" x={0} y={0} width={size + 1} height={size + 1}>
                <g filter={`url(#${uid}-blur)`} fill="#fff">
                  {Array.from(ground, (who, p) => (who === c ? <rect key={p} x={coord(p).cx - 0.55} y={coord(p).cy - 0.55} width={1.1} height={1.1} /> : null))}
                </g>
              </mask>
            ))}
            {sides.map((c) => (
              <radialGradient key={c} id={gradient(c)} cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stopColor={THEME[elements[c]].light} />
                <stop offset="0.45" stopColor={THEME[elements[c]].base} />
                <stop offset="1" stopColor={THEME[elements[c]].dark} />
              </radialGradient>
            ))}
          </defs>

          {/* Đất trung lập: nền đất nâu như sa bàn. */}
          <rect x={0} y={0} width={size + 1} height={size + 1} fill="#8a6a45" />
          <rect x={0.5} y={0.5} width={size} height={size} fill="#a07d52" />
          {sides.map((c) => (
            <rect key={c} x={0.5} y={0.5} width={size} height={size} fill={`url(#${uid}-p${c})`} mask={`url(#${uid}-m${c})`} data-ground={elements[c]} />
          ))}

          {Array.from({ length: size }, (_, i) => (
            <g key={i} stroke="#2b1a0e" strokeOpacity={0.7} strokeWidth={0.035}>
              <line x1={1} y1={i + 1} x2={size} y2={i + 1} />
              <line x1={i + 1} y1={1} x2={i + 1} y2={size} />
            </g>
          ))}
          {/* Trên nền tối (Hỏa, Lôi), kẻ lại lưới sáng trong vùng đất ấy. */}
          {sides.map((c) =>
            grid(c) ? (
              <g key={c} mask={`url(#${uid}-m${c})`} stroke="#f5deb3" strokeOpacity={0.35} strokeWidth={0.035}>
                {Array.from({ length: size }, (_, i) => (
                  <g key={i}>
                    <line x1={1} y1={i + 1} x2={size} y2={i + 1} />
                    <line x1={i + 1} y1={1} x2={i + 1} y2={size} />
                  </g>
                ))}
              </g>
            ) : null,
          )}
          {stars.map((p) => (
            <circle key={p} {...coord(p)} r={size >= 13 ? 0.1 : 0.09} fill="#2b1a0e" opacity={0.75} />
          ))}
          {Array.from({ length: size }, (_, i) => (
            <g key={`c${i}`} fill="#f3e2c0" fontSize={0.34} fontFamily="ui-sans-serif, system-ui" textAnchor="middle" dominantBaseline="central" opacity={0.85}>
              <text x={i + 1} y={0.24}>{columnLabel(i)}</text>
              <text x={i + 1} y={size + 0.76}>{columnLabel(i)}</text>
              <text x={0.24} y={i + 1}>{size - i}</text>
              <text x={size + 0.76} y={i + 1}>{size - i}</text>
            </g>
          ))}

          {Array.from(board, (stone, p) => {
            if (stone === 0) return null;
            const c = stone as Color;
            const { cx, cy } = coord(p);
            const isDead = deadSet.has(p);
            return (
              <g key={p} data-stone={elements[c]}>
                <Orb element={elements[c]} cx={cx} cy={cy} r={r} gradientId={gradient(c)} opacity={isDead ? 0.4 : 1} />
                {isDead && (
                  <path d={`M${cx - 0.2} ${cy - 0.2} L${cx + 0.2} ${cy + 0.2} M${cx + 0.2} ${cy - 0.2} L${cx - 0.2} ${cy + 0.2}`} stroke="#fef3c7" strokeWidth={0.09} strokeLinecap="round" />
                )}
              </g>
            );
          })}
          {lastMove !== null && lastMove >= 0 && board[lastMove] !== 0 && !onToggleDead && (
            <circle {...coord(lastMove)} r={0.56} fill="none" stroke="#fde68a" strokeWidth={0.06} strokeDasharray="0.18 0.1" />
          )}
          {ghost !== null && board[ghost] === 0 && (
            <Orb element={elements[toPlay]} {...coord(ghost)} r={r} gradientId={gradient(toPlay)} opacity={pending !== null ? 0.7 : 0.45} />
          )}
          {cursor !== null && (
            <rect x={coord(cursor).cx - 0.5} y={coord(cursor).cy - 0.5} width={1} height={1} rx={0.12} fill="none" stroke="#fde68a" strokeWidth={0.07} />
          )}
        </svg>
      </div>
      {pending !== null && <p className="mt-2 text-center text-caption text-on-wood-soft">Chạm lần nữa để đặt quân.</p>}
    </div>
  );
}
