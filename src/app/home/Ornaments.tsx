// Hoa văn trang trí trang giới thiệu theo phong cách logo: đồng mạ vàng và sao trống đồng.
// Dùng dải màu chung url(#tile-gilt), url(#tile-gold) của <TileDefs /> ở layout gốc.

import { useId } from "react";
import { INK, starPoints } from "../game/art/tiles";

/** Đường phân cách tiêu đề: hai vạch vàng nhạt dần, hình thoi và huy hiệu sao 14 cánh ở giữa. */
export function OrnateDivider({ className }: { className?: string }) {
  const id = `divider-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <svg viewBox="0 0 240 24" className={className} aria-hidden focusable="false">
      <defs>
        {/* Vạch ngang có khung bao cao 0 nên dải màu phải tính theo tọa độ khung vẽ. */}
        {[
          ["l", 4, 96],
          ["r", 236, 144],
        ].map(([side, x1, x2]) => (
          <linearGradient key={side} id={`${id}-${side}`} gradientUnits="userSpaceOnUse" x1={x1} x2={x2} y1={0} y2={0}>
            <stop offset="0" stopColor="#d4a24c" stopOpacity={0} />
            <stop offset="1" stopColor="#f3d48a" />
          </linearGradient>
        ))}
      </defs>
      <path d="M4 12 H96" stroke={`url(#${id}-l)`} strokeWidth={1.5} />
      <path d="M236 12 H144" stroke={`url(#${id}-r)`} strokeWidth={1.5} />
      {[100, 140].map((x) => (
        <rect key={x} x={x - 3.5} y={8.5} width={7} height={7} transform={`rotate(45 ${x} 12)`} fill="url(#tile-gold)" stroke={INK} strokeWidth={0.8} />
      ))}
      <circle cx={120} cy={12} r={11} fill="url(#tile-gilt)" stroke={INK} strokeWidth={1} />
      <polygon points={starPoints(120, 12, 8.5, 3, 14)} fill="#fff4c4" stroke={INK} strokeWidth={0.6} />
      <circle cx={120} cy={12} r={2} fill="#c0392b" />
    </svg>
  );
}

/** Góc khung mạ vàng: vạch góc vuông, hai chấm và huy hiệu sao. Đặt ở góc trên trái; xoay để dùng cho góc khác. */
export function GiltCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <path d="M4 44 V14 A10 10 0 0 1 14 4 H44" fill="none" stroke="url(#tile-gilt)" strokeWidth={3} strokeLinecap="round" />
      <path d="M10 40 V18 A8 8 0 0 1 18 10 H40" fill="none" stroke="#d4a24c" strokeOpacity={0.5} strokeWidth={1} />
      <circle cx={13} cy={13} r={8} fill="url(#tile-gilt)" stroke={INK} strokeWidth={1} />
      <polygon points={starPoints(13, 13, 6, 2.2, 14)} fill="#fff4c4" />
      <circle cx={13} cy={13} r={1.6} fill="#c0392b" />
      <circle cx={4} cy={34} r={1.8} fill="#f3d48a" />
      <circle cx={34} cy={4} r={1.8} fill="#f3d48a" />
    </svg>
  );
}

/** Bốn góc mạ vàng cho một khung `relative`. */
export function GiltCorners({ size = "size-9" }: { size?: string }) {
  return (
    <>
      <GiltCorner className={`pointer-events-none absolute z-10 -left-3 -top-3 ${size}`} />
      <GiltCorner className={`pointer-events-none absolute z-10 -right-3 -top-3 rotate-90 ${size}`} />
      <GiltCorner className={`pointer-events-none absolute z-10 -bottom-3 -right-3 rotate-180 ${size}`} />
      <GiltCorner className={`pointer-events-none absolute z-10 -bottom-3 -left-3 -rotate-90 ${size}`} />
    </>
  );
}

/** Đốm lửa vàng bay lên chậm rãi; vị trí cố định để server và client giống nhau. */
const EMBERS = [
  [6, 13, 0],
  [14, 17, 6],
  [22, 11, 3],
  [31, 15, 9],
  [38, 19, 1],
  [47, 12, 7],
  [55, 16, 4],
  [63, 14, 10],
  [71, 18, 2],
  [79, 12, 8],
  [86, 15, 5],
  [93, 17, 11],
] as const;

export function Embers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {EMBERS.map(([left, dur, delay], i) => (
        <span
          key={i}
          className="ember"
          style={{ left: `${left}%`, animationDuration: `${dur}s`, animationDelay: `-${delay}s`, "--sway": `${i % 2 ? 24 : -24}px` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
