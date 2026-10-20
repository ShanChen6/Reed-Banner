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

export const PROFESSION_COLOR: Record<Profession, string> = {
  tuongSi: "#9b2c1f",
  phapSu: "#6b3fa0",
  binhLinh: "#6b4a2b",
  ySu: "#2f7a5a",
  muuSi: "#a8801f",
  quanSu: "#2f5f8a",
};

/** Hình nghề trong khung 24×24, màu sáng để đặt trên nền màu nghề. */
const PROFESSION_GLYPH: Record<Profession, React.ReactNode> = {
  // Tướng sĩ: thanh kiếm dựng đứng có đốc.
  tuongSi: (
    <g>
      <path d="M12 3 L14 6 V15 H10 V6 Z" fill={GLYPH} />
      <path d="M12 6 V14" stroke={PROFESSION_COLOR.tuongSi} strokeWidth={1} />
      <path d="M7 15.5 H17" {...line} />
      <path d="M12 16 V20.5" {...line} strokeWidth={2.4} />
    </g>
  ),
  // Pháp sư: ấn thái cực.
  phapSu: (
    <g>
      <circle cx={12} cy={12} r={7} fill="none" stroke={GLYPH} strokeWidth={1.6} />
      <path d="M12 5 A3.5 3.5 0 0 1 12 12 A3.5 3.5 0 0 0 12 19 A7 7 0 0 1 12 5 Z" fill={GLYPH} />
      <circle cx={12} cy={8.5} r={1.1} fill={PROFESSION_COLOR.phapSu} />
      <circle cx={12} cy={15.5} r={1.1} fill={GLYPH} />
    </g>
  ),
  // Binh lính: khiên tròn trước ngọn giáo.
  binhLinh: (
    <g>
      <path d="M5 19 L18.5 5.5" {...line} />
      <path d="M18.5 5.5 L19.5 3.5 L17.5 4.5" fill={GLYPH} stroke={GLYPH} strokeWidth={1.4} strokeLinejoin="round" />
      <circle cx={11} cy={13} r={5.5} fill={GLYPH} />
      <circle cx={11} cy={13} r={3} fill="none" stroke={PROFESSION_COLOR.binhLinh} strokeWidth={1.2} />
      <circle cx={11} cy={13} r={1} fill={PROFESSION_COLOR.binhLinh} />
    </g>
  ),
  // Y sư: bầu hồ lô đựng thuốc.
  ySu: (
    <g>
      <path d="M12 6.5 C10 6.5 9.5 8 9.5 9 C9.5 10.3 10.5 10.6 10.5 11 C7.5 11.8 6.5 14 6.5 15.8 A5.5 5.5 0 0 0 17.5 15.8 C17.5 14 16.5 11.8 13.5 11 C13.5 10.6 14.5 10.3 14.5 9 C14.5 8 14 6.5 12 6.5 Z" fill={GLYPH} />
      <path d="M12 6.5 V4 M12 4 C13.5 3 15.5 3.5 16 5" {...line} strokeWidth={1.4} />
      <path d="M12 13.5 V18 M9.75 15.75 H14.25" stroke={PROFESSION_COLOR.ySu} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  ),
  // Mưu sĩ: quạt giấy xòe.
  muuSi: (
    <g>
      <path d="M12 19 L4 9.5 A11 11 0 0 1 20 9.5 Z" fill={GLYPH} />
      <path d="M12 19 L7.5 7 M12 19 L12 5.8 M12 19 L16.5 7" stroke={PROFESSION_COLOR.muuSi} strokeWidth={1} />
      <circle cx={12} cy={19} r={1.4} fill={GLYPH} stroke={PROFESSION_COLOR.muuSi} strokeWidth={0.8} />
    </g>
  ),
  // Quân sư: thẻ tre buộc dây.
  quanSu: (
    <g>
      <rect x={5} y={5.5} width={14} height={13} rx={1.5} fill={GLYPH} />
      <path d="M8.5 5.5 V18.5 M12 5.5 V18.5 M15.5 5.5 V18.5" stroke={PROFESSION_COLOR.quanSu} strokeWidth={0.9} />
      <path d="M4 10 H20 M4 14 H20" stroke={PROFESSION_COLOR.quanSu} strokeWidth={1.3} />
    </g>
  ),
};

/** Huy hiệu nghề: khiên bát giác màu nghề, để phân biệt với huy hiệu tròn của nguyên tố. */
export function ProfessionIcon({ profession, className = "size-4" }: { profession: Profession; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path d="M7.2 0.6 H16.8 L23.4 7.2 V16.8 L16.8 23.4 H7.2 L0.6 16.8 V7.2 Z" fill={PROFESSION_COLOR[profession]} />
      {PROFESSION_GLYPH[profession]}
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
