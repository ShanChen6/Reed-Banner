// Biểu tượng trang bị vẽ bằng SVG: hình món đồ theo ô (vũ khí theo nghề), chi tiết nhấn màu theo nguyên tố,
// khung theo phẩm. Khung khác nhau cả về hình chứ không chỉ về màu, để đọc được phẩm khi khó phân biệt màu.

import type { Element, GearSlot, Profession, Tier } from "@/core";
import { ELEMENT_COLOR } from "./icons";
import { INK, starPoints } from "./tiles";

const PAPER = "#f6ecd4";
const BRONZE = "#d4a24c";
const WOOD = "#8a5a2b";
const STEEL = "#d5d8dc";
const ink = { stroke: INK, strokeWidth: 1.8, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const thin = { fill: "none", stroke: INK, strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Màu khung theo phẩm, khớp TIER_CLASS ở labels.ts. */
export const TIER_FRAME: Record<Tier, string> = {
  1: "#d6d3d1",
  2: "#4ade80",
  3: "#38bdf8",
  4: "#c084fc",
  5: "#fb923c",
};

/** Hình món đồ trong khung 48×48, `a` là màu nguyên tố. */
const SLOT_ART: Record<Exclude<GearSlot, "vuKhi">, (a: string) => React.ReactNode> = {
  // Đính mão: mũ trụ có chóp và tua.
  dinhMao: (a) => (
    <g>
      <path d="M11 30 C11 18 17 12 24 12 C31 12 37 18 37 30 Z" fill={STEEL} {...ink} />
      <path d="M8 30 H40 V34 H8 Z" fill={BRONZE} {...ink} />
      <path d="M24 12 V6" {...ink} strokeWidth={2.4} />
      <path d="M24 6 C20 6 18 9 17 12 M24 6 C28 6 30 9 31 12" stroke={a} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M17 18 Q24 15 31 18 M15 24 H33" {...thin} />
      <path d="M12 34 V40 M36 34 V40" stroke={a} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  ),
  // Y phục: áo giao lĩnh cổ chéo, đai lưng màu nguyên tố.
  yPhuc: (a) => (
    <g>
      <path d="M17 8 L24 13 L31 8 L41 14 L38 22 L34 20 V41 H14 V20 L10 22 L7 14 Z" fill="#3a4f6b" {...ink} />
      <path d="M17 8 L30 30 M31 8 L24 18" stroke={PAPER} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M14 30 H34" stroke={a} strokeWidth={3.5} />
      <path d="M14 30 H34" {...thin} strokeWidth={1} />
    </g>
  ),
  // Hộ thủ: cặp bao tay da có đinh đồng.
  hoThu: (a) => (
    <g>
      {[13, 27].map((x) => (
        <g key={x}>
          <path d={`M${x} 10 H${x + 9} L${x + 10} 38 H${x - 1} Z`} fill={WOOD} {...ink} />
          <path d={`M${x} 17 H${x + 9} M${x - 0.5} 31 H${x + 9.5}`} stroke={a} strokeWidth={2.4} />
          <circle cx={x + 4.5} cy={24} r={1.8} fill={BRONZE} stroke={INK} strokeWidth={1} />
        </g>
      ))}
    </g>
  ),
  // Bảo ngoa: giày cổ cao mũi cong.
  baoNgoa: (a) => (
    <g>
      <path d="M15 8 H27 V28 C33 28 39 30 41 35 L40 40 H10 V8 Z" fill="#5e3b1f" {...ink} />
      <path d="M10 40 H40" {...ink} strokeWidth={2.6} />
      <path d="M10 14 H27" stroke={a} strokeWidth={3} />
      <path d="M41 35 Q43 33 42 30" {...thin} strokeWidth={1.8} />
      <path d="M16 22 H23 M16 27 H23" {...thin} stroke={PAPER} />
    </g>
  ),
  // Giới chỉ: nhẫn đồng gắn đá màu nguyên tố.
  gioiChi: (a) => (
    <g>
      <circle cx={24} cy={29} r={11} fill="none" stroke={INK} strokeWidth={6.5} />
      <circle cx={24} cy={29} r={11} fill="none" stroke={BRONZE} strokeWidth={3.8} />
      <path d="M18 14 L24 7 L30 14 L24 21 Z" fill={a} {...ink} />
      <path d="M21 14 L24 10.5 L27 14" stroke="#fff" strokeWidth={1.2} fill="none" opacity={0.7} />
    </g>
  ),
  // Hạng liên: chuỗi hạt có mặt hình chim Lạc.
  hangLien: (a) => (
    <g>
      <path d="M9 9 C9 24 15 31 24 31 C33 31 39 24 39 9" fill="none" stroke={INK} strokeWidth={1.4} />
      {[
        [9.5, 12],
        [10.5, 18],
        [13, 23.5],
        [17, 28],
        [38.5, 12],
        [37.5, 18],
        [35, 23.5],
        [31, 28],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill={BRONZE} stroke={INK} strokeWidth={1} />
      ))}
      <circle cx={24} cy={35} r={7} fill={a} {...ink} />
      <path d="M19.5 36 C21.5 35.5 22.5 33.5 24 32.5 C25.5 31.5 27.5 32 28.5 33 L26.5 34 C26 36.5 24 38 21 37.5 Z" fill={PAPER} />
    </g>
  ),
  // Hộ phù: lá bùa giấy có dấu triện và tua.
  hoPhu: (a) => (
    <g>
      <path d="M15 7 H33 V35 L24 40 L15 35 Z" fill="#e9d29a" {...ink} />
      <rect x={18.5} y={11} width={11} height={11} fill="none" stroke="#c0392b" strokeWidth={1.8} />
      <path d="M21 14 H27 M24 14 V20 M21 20 H27" stroke="#c0392b" strokeWidth={1.4} strokeLinecap="round" />
      <path d="M19 27 H29 M19 31 H29" {...thin} />
      <path d="M24 40 V44 M22 44 L24 41 L26 44" stroke={a} strokeWidth={2} strokeLinecap="round" fill="none" />
    </g>
  ),
  // Ngọc bội: ngọc tròn có lỗ, buộc dây tết.
  ngocBoi: (a) => (
    <g>
      <path d="M24 5 V13" stroke="#c0392b" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M21 9 L24 12 L27 9" stroke="#c0392b" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <circle cx={24} cy={27} r={13} fill={a} {...ink} />
      <circle cx={24} cy={27} r={9} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.5} strokeDasharray="2 2.4" />
      <circle cx={24} cy={27} r={4} fill={PAPER} {...ink} strokeWidth={1.5} />
      <path d="M15 21 A10 10 0 0 1 21 16" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} />
      <path d="M24 40 V44 M21.5 44 L24 41 L26.5 44" stroke="#c0392b" strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </g>
  ),
};

/** Vũ khí riêng theo nghề (docs/06-art/art-bible.md mục 2.4). */
const WEAPON_ART: Record<Profession, (a: string) => React.ReactNode> = {
  // Tướng sĩ: đao lưỡi cong.
  tuongSi: (a) => (
    <g transform="rotate(40 24 24)">
      <path d="M21 4 C29 8 30 20 27 30 H21 Z" fill={STEEL} {...ink} />
      <path d="M23.5 8 C26 13 26.5 20 25 27" {...thin} stroke="#9aa0a6" />
      <path d="M16 30 H32 V33.5 H16 Z" fill={BRONZE} {...ink} strokeWidth={1.5} />
      <path d="M21.5 33.5 H26.5 V42 H21.5 Z" fill={WOOD} {...ink} strokeWidth={1.5} />
      <path d="M21.5 36 H26.5 M21.5 39 H26.5" stroke={a} strokeWidth={1.6} />
    </g>
  ),
  // Pháp sư: pháp trượng đầu vòng ôm ngọc.
  phapSu: (a) => (
    <g>
      <path d="M24 20 V44" stroke={WOOD} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M24 20 V44" {...thin} strokeWidth={1} />
      <circle cx={24} cy={12} r={8.5} fill="none" stroke={INK} strokeWidth={4.5} />
      <circle cx={24} cy={12} r={8.5} fill="none" stroke={BRONZE} strokeWidth={2.5} />
      <circle cx={24} cy={12} r={4.5} fill={a} {...ink} strokeWidth={1.4} />
      <path d="M19 24 Q24 27 29 24" stroke={a} strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  ),
  // Binh lính: giáo dài có tua.
  binhLinh: (a) => (
    <g transform="rotate(35 24 24)">
      <path d="M24 16 V46" stroke={WOOD} strokeWidth={3} strokeLinecap="round" />
      <path d="M24 2 L28.5 12 L24 16 L19.5 12 Z" fill={STEEL} {...ink} />
      <path d="M24 5 V13" {...thin} stroke="#9aa0a6" />
      <path d="M24 17 C20 19 19 22 19 25 M24 17 C28 19 29 22 29 25 M24 17 V25" stroke={a} strokeWidth={2} strokeLinecap="round" fill="none" />
    </g>
  ),
  // Y sư: hồ lô thuốc buộc dây.
  ySu: (a) => (
    <g>
      <path d="M22 5 H26 V10 H22 Z" fill={WOOD} {...ink} strokeWidth={1.4} />
      <circle cx={24} cy={16} r={6.5} fill="#d9a441" {...ink} />
      <circle cx={24} cy={31} r={11} fill="#d9a441" {...ink} />
      <path d="M17 23 Q24 26 31 23" stroke={a} strokeWidth={2.6} fill="none" />
      <path d="M31 23 Q36 27 33 33" stroke={a} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M18 30 A7 7 0 0 1 22 24.5" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.6} />
    </g>
  ),
  // Mưu sĩ: quạt xếp.
  muuSi: (a) => (
    <g>
      <path d="M24 40 L8 20 A22 22 0 0 1 40 20 Z" fill={PAPER} {...ink} />
      <path d="M24 40 L13 15 M24 40 L18.5 12 M24 40 L24 11 M24 40 L29.5 12 M24 40 L35 15" {...thin} stroke="#a88a4f" />
      <path d="M10.5 22.5 A19 19 0 0 1 37.5 22.5" fill="none" stroke={a} strokeWidth={3} />
      <circle cx={24} cy={40} r={2.2} fill={BRONZE} stroke={INK} strokeWidth={1.2} />
    </g>
  ),
  // Quân sư: cờ lệnh cắm cạnh bó thẻ tre.
  quanSu: (a) => (
    <g>
      <g transform="rotate(-10 18 30)">
        <rect x={10} y={20} width={14} height={20} rx={1} fill="#d9bf86" {...ink} strokeWidth={1.5} />
        <path d="M13.5 20 V40 M17 20 V40 M20.5 20 V40" {...thin} stroke="#a88a4f" strokeWidth={1} />
        <path d="M10 26 H24" stroke="#c0392b" strokeWidth={2} />
      </g>
      <path d="M32 6 V42" stroke={WOOD} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M32 7 L44 10 V22 L32 19 Z" fill={a} {...ink} strokeWidth={1.5} />
      <path d="M36 12 L40 13 M36 16 L40 17" stroke={PAPER} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  ),
};

/** Khung theo phẩm: Trắng viền trơn, Lục thêm chấm góc, Lam viền đôi, Tím thêm hoa văn răng cưa, Cam tỏa tia. */
function TierFrame({ tier }: { tier: Tier }) {
  const c = TIER_FRAME[tier];
  return (
    <g>
      <rect x={1.5} y={1.5} width={45} height={45} rx={8} fill="none" stroke={c} strokeWidth={2.5} />
      {tier >= 3 && <rect x={4.5} y={4.5} width={39} height={39} rx={6} fill="none" stroke={c} strokeWidth={1} />}
      {tier >= 2 &&
        [
          [5, 5],
          [43, 5],
          [5, 43],
          [43, 43],
        ].map(([x, y]) =>
          tier >= 4 ? (
            <rect key={`${x}-${y}`} x={x! - 3} y={y! - 3} width={6} height={6} transform={`rotate(45 ${x} ${y})`} fill={c} stroke={INK} strokeWidth={1} />
          ) : (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} fill={c} stroke={INK} strokeWidth={0.8} />
          ),
        )}
      {tier >= 4 && <path d="M14 45.5 L17 42.5 L20 45.5 L23 42.5 L26 45.5 L29 42.5 L32 45.5 L35 42.5" fill="none" stroke={c} strokeWidth={1} />}
    </g>
  );
}

/**
 * Biểu tượng một món trang bị. `profession` chỉ dùng cho vũ khí; thiếu thì vẽ đao của Tướng sĩ.
 * Không có `tier` thì không vẽ khung, dùng cho chú thích ô trống.
 */
export function GearIcon({
  slot,
  element,
  tier,
  profession,
  className = "size-10",
}: {
  slot: GearSlot;
  element: Element;
  tier?: Tier;
  profession?: Profession;
  className?: string;
}) {
  const accent = ELEMENT_COLOR[element];
  const art = slot === "vuKhi" ? WEAPON_ART[profession ?? "tuongSi"](accent) : SLOT_ART[slot](accent);
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <rect x={1.5} y={1.5} width={45} height={45} rx={8} fill="#2b211b" />
      {tier !== undefined && <rect x={1.5} y={1.5} width={45} height={45} rx={8} fill={TIER_FRAME[tier]} opacity={0.16} />}
      {tier === 5 && <polygon points={starPoints(24, 24, 22, 15, 16)} fill="#ffe08a" opacity={0.3} />}
      {art}
      {tier !== undefined && <TierFrame tier={tier} />}
    </svg>
  );
}
