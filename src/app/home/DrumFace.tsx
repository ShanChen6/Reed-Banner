// Mặt trống đồng lớn làm nền phần mở đầu trang giới thiệu: sao 14 cánh ở tâm, các vành răng cưa, chấm tròn,
// vòng tròn tiếp tuyến và vành chim lạc bay ngược chiều kim đồng hồ như trống Ngọc Lũ. Hình tĩnh, chỉ xoay rất chậm
// bằng transform (.drum-spin trong globals.css) nên trình duyệt vẽ một lần rồi để card đồ họa xoay.

import { starPoints } from "../game/art/tiles";

const C = 200;
const at = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};

/** Vòng tròn tiếp tuyến: 24 vòng nhỏ có chấm giữa, nối nhau bằng hai đường tiếp tuyến. */
const LINKED = Array.from({ length: 24 }, (_, i) => at(131, i * 15));
/** Vành chấm tròn. */
const DOTS = Array.from({ length: 60 }, (_, i) => at(151, i * 6));
/** Chim lạc nhỏ trên vành ngoài, mỏ hướng theo chiều bay. */
const BIRDS = Array.from({ length: 8 }, (_, i) => i * 45);
/** Họa tiết lông chim giữa các cánh sao. */
const CHEVRONS = Array.from({ length: 14 }, (_, i) => i * (360 / 14) + 360 / 28);

export default function DrumFace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden focusable="false">
      <g fill="none" stroke="var(--gold)" strokeLinejoin="round">
        <circle cx={C} cy={C} r={198} strokeWidth={2} />
        <polygon points={starPoints(C, C, 196, 188, 90)} strokeWidth={1} />
        <circle cx={C} cy={C} r={185} strokeWidth={1.5} />
        <circle cx={C} cy={C} r={158} strokeWidth={1.5} />
        <circle cx={C} cy={C} r={144} strokeWidth={1.2} />
        {LINKED.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={8} strokeWidth={1.1} />
        ))}
        <circle cx={C} cy={C} r={139} strokeWidth={0.8} />
        <circle cx={C} cy={C} r={123} strokeWidth={0.8} />
        <circle cx={C} cy={C} r={118} strokeWidth={1.2} />
        <polygon points={starPoints(C, C, 116, 108, 72)} strokeWidth={1} />
        <circle cx={C} cy={C} r={104} strokeWidth={1.5} />
        <polygon points={starPoints(C, C, 100, 26, 14)} strokeWidth={1.6} />
        {CHEVRONS.map((deg) => (
          <g key={deg} transform={`rotate(${deg} ${C} ${C})`}>
            <path d={`M${C - 9} ${C - 62} L${C} ${C - 74} L${C + 9} ${C - 62} M${C - 7} ${C - 50} L${C} ${C - 59} L${C + 7} ${C - 50}`} strokeWidth={1} />
          </g>
        ))}
        <circle cx={C} cy={C} r={20} strokeWidth={1.5} />
      </g>
      <g fill="var(--gold)">
        {LINKED.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.2} />
        ))}
        {DOTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2} />
        ))}
        {BIRDS.map((deg) => (
          <g key={deg} transform={`rotate(${deg} ${C} ${C}) translate(${C} ${C - 171}) scale(-1 1)`}>
            {/* Chim nhỏ quay đầu sang phải trong hệ tọa độ riêng; lật để bay ngược chiều kim đồng hồ. */}
            <path d="M-22 1 C-14 -2 4 -3 10 -2 C14 -6 16 -9 19 -9 L32 -12 L20 -6 C17 -1 12 3 4 4 C-6 5 -16 4 -22 1 Z" />
            <path d="M-4 -1 L-14 -12 L-18 -11 L-10 -1 Z M2 -1 L-4 -13 L-8 -12 L-3 -1 Z" />
            <path d="M-22 1 L-30 -4 L-32 0 L-30 4 Z" />
          </g>
        ))}
        <circle cx={C} cy={C} r={9} />
      </g>
    </svg>
  );
}
