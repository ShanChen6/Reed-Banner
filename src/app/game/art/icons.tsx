// Biểu tượng nguyên tố và biểu tượng giao diện nhỏ cho màn chơi, vẽ bằng SVG.

import { useId } from "react";
import type { Element } from "@/core";
import { INK, TILE_GLYPH } from "./tiles";

export const ELEMENT_COLOR: Record<Element, string> = {
  kim: "#9ea4ad",
  moc: "#4f9a4a",
  thuy: "#2f7fc1",
  hoa: "#d9502a",
  tho: "#a5772f",
  loi: "#7d55c7",
  phong: "#2e9e90",
};

const GLYPH = "#fff7e6";
const line = { fill: "none", stroke: GLYPH, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Hình nguyên tố trong khung 24×24, màu sáng để đặt trên nền màu nguyên tố. */
const ELEMENT_GLYPH: Record<Element, React.ReactNode> = {
  // Kim: thỏi kim loại cắt mặt.
  kim: (
    <g>
      <path d="M12 4.5 L18.5 10 L12 19.5 L5.5 10 Z" fill={GLYPH} />
      <path d="M5.5 10 H18.5 M9 10 L12 19.5 L15 10 M9 10 L12 4.5 L15 10" fill="none" stroke={ELEMENT_COLOR.kim} strokeWidth={1.1} strokeLinejoin="round" />
    </g>
  ),
  // Mộc: lá cây có gân.
  moc: (
    <g>
      <path d="M5.5 18.5 C5 10 10.5 5 19 5 C19 13 14 18.5 5.5 18.5 Z" fill={GLYPH} />
      <path d="M5.5 18.5 L15.5 8.5" stroke={ELEMENT_COLOR.moc} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  ),
  // Thủy: giọt nước.
  thuy: (
    <g>
      <path d="M12 3.5 C15.5 9 18 12 18 15 A6 6 0 0 1 6 15 C6 12 8.5 9 12 3.5 Z" fill={GLYPH} />
      <path d="M9 15 A3 3 0 0 0 12 18" stroke={ELEMENT_COLOR.thuy} strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </g>
  ),
  // Hỏa: ngọn lửa hai tầng.
  hoa: (
    <g>
      <path d="M12 3 C14 8 18.5 10 18.5 15 A6.5 6.5 0 0 1 5.5 15 C5.5 12 7.5 9.5 9 8 C9.5 10.5 10.5 11.5 11.5 11.5 C10.5 8.5 10.8 5.5 12 3 Z" fill={GLYPH} />
      <path d="M12 12.5 C13.5 14.5 15 15.5 15 17 A3 3 0 0 1 9 17 C9 15.5 10.5 14.5 12 12.5 Z" fill={ELEMENT_COLOR.hoa} />
    </g>
  ),
  // Thổ: núi đôi.
  tho: (
    <g>
      <path d="M2.5 19 L9.5 7.5 L13 12.5 L16 8.5 L21.5 19 Z" fill={GLYPH} />
      <path d="M8 10 L9.5 7.5 L11 10" stroke={ELEMENT_COLOR.tho} strokeWidth={1.2} strokeLinejoin="round" fill="none" />
    </g>
  ),
  // Lôi: tia sét.
  loi: <path d="M13.5 2.5 L5.5 13.5 H11 L9.5 21.5 L18.5 9.5 H13 Z" fill={GLYPH} />,
  // Phong: ba luồng gió cuộn.
  phong: (
    <g>
      <path d="M3.5 9 H14 A3 3 0 1 0 11 6" {...line} />
      <path d="M3.5 13 H18 A3 3 0 1 1 15 16" {...line} />
      <path d="M3.5 17 H10" {...line} />
    </g>
  ),
};

/** Huy hiệu tròn của nguyên tố. */
export function ElementIcon({ element, className = "size-4" }: { element: Element; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <circle cx={12} cy={12} r={11.5} fill={ELEMENT_COLOR[element]} />
      {ELEMENT_GLYPH[element]}
    </svg>
  );
}

/** Cờ lau: lá cờ đuôi nheo buộc bông lau, dấu hiệu thủ lĩnh. */
export function LeaderFlag({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path d="M6 5 L19 8.5 L6 13 Z" fill="#c0392b" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M6 3.5 V22" stroke="#8a5a2b" strokeWidth={2} strokeLinecap="round" />
      <path d="M6 4 C4.5 2.5 3 2.5 2 3 M6 4 C5.5 2 6.5 1 8 1 M6 4 C7 2.5 9 2.5 10 3.5" stroke="#c9b37e" strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Lương thực: bánh chưng nhỏ, cùng hình với ô bánh chưng. */
export function FoodIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="10 10 44 44" className={className} aria-hidden focusable="false">
      {TILE_GLYPH.banhChung}
    </svg>
  );
}

/** Khiên đỡ đòn, dùng cạnh số sát thương bị chặn. */
export function ShieldIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path d="M12 2.5 L20 5.5 V11 C20 16 16.5 19.5 12 21.5 C7.5 19.5 4 16 4 11 V5.5 Z" fill="#38bdf8" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M12 5.5 V18.5 M7 10 H17" stroke="#e0f2fe" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/** Họa tiết mây góc khung, đặt ở góc trên trái; xoay để dùng cho các góc khác. */
export function CloudCorner({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden focusable="false">
      <path d="M2 30 V8 A6 6 0 0 1 8 2 H30" fill="none" stroke="var(--gold)" strokeWidth={2.5} strokeLinecap="round" />
      <path
        d="M7 22 C4 22 4 17 7.5 17 C6.5 13 11 11 13 14 C14 10 19 10 19.5 14 M7 22 H16"
        fill="none"
        stroke="var(--gold)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={8} cy={8} r={2.2} fill="var(--gold)" />
    </svg>
  );
}

/** Dải hoa văn trống đồng: hàng răng cưa xen chấm tròn, lặp theo chiều ngang không bị kéo méo. */
export function DongSonBand({ className }: { className?: string }) {
  const id = `dongson-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <svg className={className} height={10} aria-hidden focusable="false">
      <defs>
        <pattern id={id} width={12} height={10} patternUnits="userSpaceOnUse">
          <path d="M0 1 H12 M0 9 H12" stroke="var(--gold)" strokeWidth={1} />
          <path d="M0 8 L4 2.5 L8 8" fill="none" stroke="var(--gold)" strokeWidth={1} />
          <circle cx={10} cy={5} r={1.2} fill="var(--gold)" />
        </pattern>
      </defs>
      <rect width="100%" height={10} fill={`url(#${id})`} />
    </svg>
  );
}
