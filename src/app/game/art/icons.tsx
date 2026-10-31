// Biểu tượng nguyên tố và biểu tượng giao diện nhỏ cho màn chơi, vẽ bằng SVG.

import { useId } from "react";
import type { Element, Profession } from "@/core";
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

/** Biểu tượng nguyên tố: ảnh vẽ tay ở public/art/elements/<hệ>.webp. */
export function ElementIcon({ element, className = "size-4" }: { element: Element | "tongHop"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <image href={`/art/elements/${element}.webp`} width={24} height={24} />
    </svg>
  );
}

export const PROFESSION_COLOR: Record<Profession, string> = {
  xaThu: "#476b47",
  satThu: "#554266",
  tuongSi: "#9b2c1f",
  phapSu: "#6b3fa0",
  binhLinh: "#6b4a2b",
  ySu: "#2f7a5a",
  muuSi: "#a8801f",
  quanSu: "#2f5f8a",
};

/** Biểu tượng nghề: ảnh vẽ tay ở public/art/professions/<nghề>.webp; "tongHop" là biểu tượng gộp mọi nghề. */
export function ProfessionIcon({ profession, className = "size-4" }: { profession: Profession | "tongHop"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <image href={`/art/professions/${profession}.webp`} width={24} height={24} />
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
    <svg viewBox="7 7 50 50" className={className} aria-hidden focusable="false">
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
