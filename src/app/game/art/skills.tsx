// Biểu tượng kỹ năng vẽ bằng SVG: huy hiệu vuông màu theo nguyên tố (nhân vật chính) hoặc theo nghề
// (nhân vật kèm), hình giữa nói kỹ năng làm gì, dấu nhỏ ở góc nói thêm tác dụng phụ (tăng, giảm, cả đội…).
// Tuyệt chiêu ô 4 có vòng tia vàng như ô đặc biệt bản mạnh.

import type { Element, GameProfession, Profession, SkillDef } from "@/core";
import { ELEMENT_COLOR } from "./icons";
import { INK, starPoints } from "./tiles";

const LIGHT = "#fff7e6";
const BRONZE = "#e2b13c";
const fill = { fill: LIGHT, stroke: INK, strokeWidth: 1.8, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const line = { fill: "none", stroke: LIGHT, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const inkLine = { fill: "none", stroke: INK, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Màu huy hiệu chiêu nghề, tối hơn màu nguyên tố để hai loại không lẫn nhau. */
/** Nền huy hiệu kỹ năng hệ Kim tối hơn màu nguyên tố để hình sáng vẫn nổi. */
const SKILL_ELEMENT_BG: Partial<Record<Element, string>> = { kim: "#6c737d" };

export const PROFESSION_COLOR: Record<GameProfession, string> = {
  xaThu: "#476b47",
  satThu: "#554266",
  tuongSi: "#8f2d22",
  phapSu: "#6a3f8f",
  binhLinh: "#6b4a2b",
  ySu: "#2f7a5a",
  muuSi: "#7a6326",
  quanSu: "#2f4a6b",
};

// Các hình gốc trong khung 48×48, vẽ quanh tâm (24, 24) và nằm gọn trong vùng 8–40.
const G = {
  sword: (
    <g transform="rotate(45 24 24)">
      <path d="M24 6 L27.5 11 V30 H20.5 V11 Z" {...fill} />
      <rect x={16} y={30} width={16} height={4} rx={2} fill={BRONZE} stroke={INK} strokeWidth={1.5} />
      <path d="M22 34 H26 V40 H22 Z" fill="#6b4226" stroke={INK} strokeWidth={1.5} />
    </g>
  ),
  slash: (
    <g>
      <path d="M10 36 Q22 26 38 10 Q28 26 14 39 Z" {...fill} />
      <path d="M14 22 L18 18 M28 36 L32 32" {...line} strokeWidth={2} />
    </g>
  ),
  shield: <path d="M24 8 L37 12.5 V22 C37 30 31.5 36 24 40 C16.5 36 11 30 11 22 V12.5 Z" {...fill} />,
  heart: <path d="M24 39 C11 30 8.5 21 12.5 15.5 C16.5 10.5 21.5 12 24 16.5 C26.5 12 31.5 10.5 35.5 15.5 C39.5 21 37 30 24 39 Z" {...fill} />,
  leaf: (
    <g>
      <path d="M10 38 C9.5 22 19 11 38 10 C38 27 28 38 10 38 Z" {...fill} />
      <path d="M10 38 L30 18 M18 30 H25 M22 26 V19" {...inkLine} />
    </g>
  ),
  tree: (
    <g>
      <path d="M22 40 V28 L16 22 M26 40 V26 L32 20" {...inkLine} strokeWidth={2.4} />
      <path d="M24 7 C33 7 38 13 37 19 C40 23 36 29 30 27 C28 31 20 31 18 27 C12 29 8 23 11 19 C10 13 15 7 24 7 Z" {...fill} />
      <path d="M17 40 H31" {...inkLine} strokeWidth={2.4} />
    </g>
  ),
  sprout: (
    <g>
      <path d="M24 40 V22" {...inkLine} strokeWidth={2.4} />
      <path d="M24 24 C16 24 11 19 11 12 C19 12 24 16 24 24 Z" {...fill} />
      <path d="M24 28 C31 28 37 24 37 16 C29 16 24 20 24 28 Z" {...fill} />
      <path d="M15 40 H33" {...inkLine} strokeWidth={2.4} />
    </g>
  ),
  bamboo: (
    <g>
      <rect x={14} y={8} width={7} height={32} rx={2} {...fill} />
      <rect x={27} y={12} width={7} height={28} rx={2} {...fill} />
      <path d="M14 18 H21 M14 29 H21 M27 21 H34 M27 31 H34" {...inkLine} />
      <path d="M21 16 C25 14 26 10 30 9 M34 18 C37 16 39 14 40 11" {...inkLine} />
    </g>
  ),
  flame: (
    <path d="M24 7 C27 14 35 17 35 27 A11 11 0 0 1 13 27 C13 21 16 17 18.5 15 C19 19 20.5 21 22.5 21 C20.5 16 21.5 11 24 7 Z" {...fill} />
  ),
  drop: (
    <g>
      <path d="M24 7 C29.5 15.5 34 20.5 34 27 A10 10 0 0 1 14 27 C14 20.5 18.5 15.5 24 7 Z" {...fill} />
      <path d="M19 27 A5 5 0 0 0 24 32" {...inkLine} />
    </g>
  ),
  wave: (
    <g>
      <path d="M7 31 C11 21 19 17 25 20 C21 22 21 27 26 27 C31 27 33 21 41 22 V39 H7 Z" {...fill} />
      <path d="M11 34 Q16 31 21 34 T31 34 T41 34" {...inkLine} />
    </g>
  ),
  mountain: (
    <g>
      <path d="M5 38 L18 14 L25 24 L30 17 L43 38 Z" {...fill} />
      <path d="M15 19 L18 14 L21 19" {...inkLine} />
    </g>
  ),
  bolt: <path d="M27 6 L13 26 H22 L19 42 L35 20 H26 Z" {...fill} />,
  cloud: (
    <path d="M12 22 C8 22 8 15 13 15 C13 10 20 8 23 12 C25 8 33 8 33 14 C38 13 40 20 35 22 Z" {...fill} />
  ),
  swirl: (
    <g>
      <path d="M8 18 H28 A5 5 0 1 0 23 13" {...line} />
      <path d="M8 25 H34 A5 5 0 1 1 29 30" {...line} />
      <path d="M8 32 H20" {...line} />
    </g>
  ),
  burst: <polygon points={starPoints(24, 24, 15, 7, 8)} {...fill} />,
  orb: (
    <g>
      <circle cx={24} cy={24} r={11} {...fill} />
      <circle cx={24} cy={24} r={5.5} fill="none" stroke={INK} strokeWidth={1.5} strokeDasharray="2 2" />
      <path d="M24 6 V10 M24 38 V42 M6 24 H10 M38 24 H42 M11 11 L14 14 M37 37 L34 34 M37 11 L34 14 M11 37 L14 34" {...line} strokeWidth={2} />
    </g>
  ),
  seal: (
    <g>
      <rect x={14} y={8} width={20} height={8} rx={2} {...fill} />
      <path d="M20 16 V22 M28 16 V22" {...inkLine} strokeWidth={2} />
      <rect x={10} y={22} width={28} height={17} rx={2} {...fill} />
      <path d="M16 27 H32 M16 33 H32 M24 27 V33" stroke="#c0392b" strokeWidth={2} strokeLinecap="round" />
    </g>
  ),
  flag: (
    <g>
      <path d="M14 8 V41" {...inkLine} strokeWidth={2.6} />
      <path d="M14 9 L37 15 L14 24 Z" {...fill} />
      <path d="M19 14 L25 15.5" {...inkLine} />
    </g>
  ),
  tower: (
    <g>
      <path d="M11 40 V18 H15 V14 H19 V18 H22 V14 H26 V18 H29 V14 H33 V18 H37 V40 Z" {...fill} />
      <path d="M20 40 V31 A4 4 0 0 1 28 31 V40" fill={INK} />
    </g>
  ),
  gourd: (
    <g>
      <path d="M24 6 V10" {...inkLine} strokeWidth={2.2} />
      <circle cx={24} cy={15} r={5.5} {...fill} />
      <circle cx={24} cy={30} r={10} {...fill} />
      <path d="M17 22 H31" stroke={INK} strokeWidth={2} />
    </g>
  ),
  coins: (
    <g>
      <ellipse cx={24} cy={34} rx={13} ry={5} {...fill} />
      <ellipse cx={24} cy={28} rx={13} ry={5} {...fill} />
      <ellipse cx={24} cy={22} rx={13} ry={5} {...fill} />
      <circle cx={24} cy={14} r={7} {...fill} />
      <rect x={21.5} y={11.5} width={5} height={5} fill={INK} />
    </g>
  ),
  mute: (
    <g>
      <path d="M9 12 H39 V31 H22 L14 38 V31 H9 Z" {...fill} />
      <path d="M17 17 L31 26 M31 17 L17 26" stroke="#c0392b" strokeWidth={3} strokeLinecap="round" />
    </g>
  ),
  sack: (
    <g>
      <path d="M17 13 L14 9 H34 L31 13 C38 18 40 26 38 33 C36 39 12 39 10 33 C8 26 10 18 17 13 Z" {...fill} />
      <path d="M17 13 H31" {...inkLine} strokeWidth={2} />
      <path d="M20 22 L24 30 L28 22" {...inkLine} />
    </g>
  ),
  mask: (
    <g>
      <path d="M9 14 C17 10 31 10 39 14 C39 28 33 38 24 39 C15 38 9 28 9 14 Z" {...fill} />
      <path d="M14 20 Q17 17 21 20 Q17 23 14 20 Z M27 20 Q31 17 34 20 Q31 23 27 20 Z" fill={INK} />
      <path d="M18 31 Q24 27 30 31" {...inkLine} />
    </g>
  ),
  scroll: (
    <g>
      <rect x={13} y={10} width={22} height={28} {...fill} />
      <rect x={10} y={7} width={28} height={5} rx={2.5} fill={BRONZE} stroke={INK} strokeWidth={1.5} />
      <rect x={10} y={36} width={28} height={5} rx={2.5} fill={BRONZE} stroke={INK} strokeWidth={1.5} />
      <path d="M19 17 V31 M24 17 V31 M29 17 V25" {...inkLine} />
    </g>
  ),
  tornScroll: (
    <g>
      <path d="M13 10 H35 V22 L31 25 L35 28 V38 H13 V28 L17 25 L13 22 Z" {...fill} />
      <path d="M17 25 L31 25" stroke="#c0392b" strokeWidth={2.4} strokeLinecap="round" strokeDasharray="3 2.5" />
      <path d="M19 15 V20 M24 15 V20 M24 30 V34 M29 30 V34" {...inkLine} />
    </g>
  ),
  formation: (
    <g>
      <path d="M24 9 L39 24 L24 39 L9 24 Z" fill="none" stroke={LIGHT} strokeWidth={2} strokeDasharray="3 3" />
      {[
        [24, 9],
        [39, 24],
        [24, 39],
        [9, 24],
        [24, 24],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={4.5} {...fill} />
      ))}
    </g>
  ),
  anvil: (
    <g>
      <path d="M8 20 H36 C36 24 33 26 30 26 V31 H35 V36 H13 V31 H18 V26 C13 26 9 24 8 20 Z" {...fill} />
      <path d="M30 6 L40 16 M35 11 L28 18" stroke={LIGHT} strokeWidth={3} strokeLinecap="round" />
      <path d="M24 13 L22 9 M20 15 L16 12" stroke={BRONZE} strokeWidth={2} strokeLinecap="round" />
    </g>
  ),
  focus: (
    <g>
      <path d="M6 24 Q24 8 42 24 Q24 40 6 24 Z" {...fill} />
      <circle cx={24} cy={24} r={6.5} fill={INK} />
      <circle cx={26} cy={22} r={2} fill={LIGHT} />
    </g>
  ),
  lineCut: (
    <g>
      <path d="M8 40 L40 8" stroke={LIGHT} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M8 40 L40 8" stroke={INK} strokeWidth={1} strokeLinecap="round" />
      <path d="M12 18 L20 26 M28 22 L36 30" stroke={LIGHT} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </g>
  ),
  horse: (
    <path d="M14 40 C14 32 16 26 19 22 L14 18 L18 15 L22 17 C25 11 29 8 34 8 L33 13 C37 16 40 21 39 25 L34 26 L30 22 C29 28 32 34 33 40 Z" {...fill} />
  ),
  armor: (
    <g>
      <path d="M14 10 L20 8 Q24 12 28 8 L34 10 L38 18 L34 20 V39 H14 V20 L10 18 Z" {...fill} />
      <path d="M17 24 H31 M17 29 H31 M17 34 H31" {...inkLine} />
      <path d="M20 24 V29 M26 24 V29 M23 29 V34 M29 29 V34 M17 29 V34" {...inkLine} strokeWidth={1} />
    </g>
  ),
  moon: (
    <g>
      <path d="M29 7 A12 12 0 1 0 38 26 A10 10 0 1 1 29 7 Z" {...fill} />
      <path d="M8 34 Q13 31 18 34 T28 34 T38 34 M12 40 Q17 37 22 40 T32 40" {...line} strokeWidth={2.2} />
    </g>
  ),
  arrow: (
    <g>
      <path d="M8 40 L34 14" stroke={LIGHT} strokeWidth={3} strokeLinecap="round" />
      <path d="M40 8 L28 12 L36 20 Z" {...fill} />
      <path d="M8 40 L8 33 M8 40 L15 40 M12 36 L12 30 M12 36 L18 36" stroke={LIGHT} strokeWidth={2} strokeLinecap="round" />
    </g>
  ),
  stakes: (
    <g>
      <path d="M11 40 L14 12 L17 40 M21 40 L24 8 L27 40 M31 40 L34 14 L37 40" {...fill} />
    </g>
  ),
  tent: (
    <g>
      <path d="M6 38 L24 12 L42 38 Z" {...fill} />
      <path d="M24 12 V38 M24 38 L19 30" {...inkLine} />
      <path d="M24 12 V7 L30 9 L24 11" {...inkLine} />
    </g>
  ),
  citadel: (
    <g>
      <path d="M7 40 V24 H12 V20 H17 V24 H20 V14 L24 9 L28 14 V24 H31 V20 H36 V24 H41 V40 Z" {...fill} />
      <path d="M21 40 V32 A3 3 0 0 1 27 32 V40" fill={INK} />
    </g>
  ),
  bird: (
    <g>
      <path d="M6 22 C14 22 18 26 21 30 L26 19 C29 13 34 11 39 12 L36 15 C37 18 35 22 31 24 L28 31 C33 33 38 37 40 41 C33 38 26 37 21 37 C15 34 10 29 6 22 Z" {...fill} />
      <circle cx={34} cy={15.5} r={1.4} fill={INK} />
      <path d="M12 26 L18 30 M15 23 L20 27" {...inkLine} />
    </g>
  ),
  grain: (
    <g>
      <path d="M24 40 V14 M18 40 L23 22 M30 40 L25 22" {...inkLine} strokeWidth={2.4} />
      {[10, 16, 22].map((y) => (
        <g key={y}>
          <ellipse cx={20} cy={y + 2} rx={3} ry={4.5} transform={`rotate(-30 20 ${y + 2})`} {...fill} strokeWidth={1.4} />
          <ellipse cx={28} cy={y + 2} rx={3} ry={4.5} transform={`rotate(30 28 ${y + 2})`} {...fill} strokeWidth={1.4} />
        </g>
      ))}
      <path d="M17 31 Q24 35 31 31" stroke={BRONZE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  ),
  rockShield: (
    <g>
      <path d="M24 8 L37 12.5 V22 C37 30 31.5 36 24 40 C16.5 36 11 30 11 22 V12.5 Z" {...fill} />
      <path d="M11 20 L18 18 L22 23 L30 20 L37 23 M18 18 L17 12 M22 23 L24 31 M30 20 L31 13" {...inkLine} />
    </g>
  ),
  crack: (
    <g>
      <path d="M5 38 L18 14 L22 20 L20 26 L25 30 L22 38 Z" {...fill} />
      <path d="M26 38 L29 31 L25 26 L28 20 L30 17 L43 38 Z" {...fill} />
      <path d="M8 42 H40" {...inkLine} strokeWidth={2} />
    </g>
  ),
  quake: (
    <g>
      <path d="M6 30 L13 30 L16 22 L20 36 L24 18 L28 34 L32 24 L35 30 H42" {...line} />
      <path d="M8 40 H40" {...line} strokeWidth={2} />
      <path d="M14 12 L17 16 M24 9 V14 M34 12 L31 16" {...line} strokeWidth={2} />
    </g>
  ),
  pillar: (
    <g>
      <rect x={17} y={6} width={14} height={36} rx={3} fill={LIGHT} opacity={0.3} />
      <path d="M26 6 L18 22 H25 L21 42 L31 20 H24 Z" {...fill} />
    </g>
  ),
  net: (
    <g>
      <path d="M8 10 Q24 4 40 10 L36 40 Q24 44 12 40 Z" fill="none" stroke={LIGHT} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M16 8 L14 41 M24 6.5 V43 M32 8 L34 41 M9.5 20 Q24 16 38.5 20 M11 30 Q24 26 37 30" stroke={LIGHT} strokeWidth={1.8} fill="none" />
      <path d="M27 14 L21 25 H26 L23 34 L30 22 H25 Z" fill={BRONZE} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  ),
  storm: (
    <g>
      <path d="M10 18 C6 18 6 11 11 11 C11 6 18 4 21 8 C23 4 31 4 31 10 C36 9 39 16 34 18 Z" {...fill} />
      <path d="M14 21 L10 30 H14 L12 38 L19 27 H15 Z M27 21 L23 31 H27 L25 41 L33 28 H29 Z" fill={BRONZE} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M38 21 L36 27" stroke={LIGHT} strokeWidth={2} strokeLinecap="round" />
    </g>
  ),
  whirl: (
    <g>
      <rect x={20} y={20} width={8} height={8} rx={2} {...fill} />
      <rect x={7} y={7} width={7} height={7} rx={2} fill={LIGHT} opacity={0.45} />
      <rect x={34} y={34} width={7} height={7} rx={2} fill={LIGHT} opacity={0.45} />
      <path d="M24 9 A15 15 0 0 1 39 24 M24 39 A15 15 0 0 1 9 24" {...line} strokeWidth={2.4} />
      <path d="M35 19 L39 24 L43 19 M13 29 L9 24 L5 29" {...line} strokeWidth={2.2} />
    </g>
  ),
  crescent: (
    <g>
      <path d="M8 34 C14 18 26 10 42 10 C30 14 20 22 16 38 Z" {...fill} />
      <path d="M22 40 C26 32 32 28 40 26" {...line} strokeWidth={2} />
    </g>
  ),
  tornado: (
    <g>
      <path d="M8 10 H40 M11 17 H36 M15 24 H32 M18 31 H28 M21 38 H25" {...line} />
    </g>
  ),
  spiral: (
    <g>
      <path d="M24 24 m0 -3 a3 3 0 1 1 -3 3 a6 6 0 0 1 6 -6 a9 9 0 0 1 9 9 a12 12 0 0 1 -12 12 a15 15 0 0 1 -15 -15 a17 17 0 0 1 17 -17" {...line} />
    </g>
  ),
  wing: (
    <g>
      <path d="M8 36 C10 22 20 10 40 8 C38 14 34 16 30 17 C34 18 36 20 36 22 C32 23 28 23 26 23 C29 25 30 27 29 29 C22 30 15 32 8 36 Z" {...fill} />
      <path d="M12 33 L28 17 M16 31 L30 22" {...inkLine} />
    </g>
  ),
  drum: (
    <g>
      <ellipse cx={24} cy={16} rx={14} ry={6} {...fill} />
      <path d="M10 16 V30 C10 37 38 37 38 30 V16" {...fill} />
      <polygon points={starPoints(24, 16, 5, 2, 8)} fill={BRONZE} stroke={INK} strokeWidth={1} />
      <path d="M14 26 V32 M20 28 V34 M28 28 V34 M34 26 V32" {...inkLine} />
    </g>
  ),
} as const;

type GlyphName = keyof typeof G;

/** Dấu nhỏ góc dưới phải: tác dụng phụ. */
type Badge = "up" | "down" | "team" | "heart" | "shield" | "aoe" | "reflect" | "energy" | "cleanse" | "fire" | "ice";

const BADGE: Record<Badge, { bg: string; glyph: React.ReactNode }> = {
  up: { bg: "#2f8f4a", glyph: <path d="M0 4 V-4 M-3.5 -0.5 L0 -4 L3.5 -0.5" {...line} strokeWidth={2} /> },
  down: { bg: "#b4321f", glyph: <path d="M0 -4 V4 M-3.5 0.5 L0 4 L3.5 0.5" {...line} strokeWidth={2} /> },
  team: {
    bg: "#d4a24c",
    glyph: (
      <g fill={INK}>
        <circle cx={0} cy={-2.5} r={1.8} />
        <circle cx={-3.2} cy={2.5} r={1.8} />
        <circle cx={3.2} cy={2.5} r={1.8} />
      </g>
    ),
  },
  aoe: {
    bg: "#b4321f",
    glyph: (
      <g fill={LIGHT}>
        <circle cx={0} cy={-2.5} r={1.8} />
        <circle cx={-3.2} cy={2.5} r={1.8} />
        <circle cx={3.2} cy={2.5} r={1.8} />
      </g>
    ),
  },
  heart: { bg: "#d6243e", glyph: <path d="M0 4 C-5 0.5 -5 -3.5 -2.5 -3.8 C-1.2 -4 -0.3 -3 0 -2 C0.3 -3 1.2 -4 2.5 -3.8 C5 -3.5 5 0.5 0 4 Z" fill={LIGHT} /> },
  shield: { bg: "#2f7fc1", glyph: <path d="M0 -4.5 L4 -3 V0 C4 2.5 2 4 0 5 C-2 4 -4 2.5 -4 0 V-3 Z" fill={LIGHT} /> },
  reflect: { bg: "#7a5a2b", glyph: <path d="M-3.5 2 A3.5 3.5 0 1 1 3 1.5 M3 1.5 L3.5 -1.5 M3 1.5 L0.3 0.6" {...line} strokeWidth={1.8} /> },
  energy: { bg: "#2f6fb0", glyph: <path d="M1 -5 L-3 1 H0 L-1 5 L3 -1 H0 Z" fill={LIGHT} /> },
  cleanse: {
    bg: "#2e9e90",
    glyph: <path d="M0 -4.5 L1.2 -1.2 L4.5 0 L1.2 1.2 L0 4.5 L-1.2 1.2 L-4.5 0 L-1.2 -1.2 Z" fill={LIGHT} />,
  },
  fire: { bg: "#d9502a", glyph: <path d="M0 -4.5 C1.5 -2 3.5 -1 3.5 1.5 A3.5 3.5 0 0 1 -3.5 1.5 C-3.5 -0.5 -1.5 -1.5 0 -4.5 Z" fill={LIGHT} /> },
  ice: { bg: "#5aa8d8", glyph: <path d="M0 -4.5 V4.5 M-3.9 -2.25 L3.9 2.25 M-3.9 2.25 L3.9 -2.25" {...line} strokeWidth={1.6} /> },
};

interface IconSpec {
  readonly glyph: GlyphName;
  readonly badge?: Badge;
  /** Vẽ hình gốc ba lần nhỏ lại: đòn đánh cả đội đối thủ. */
  readonly triple?: boolean;
}

/** Hình của từng kỹ năng theo mã trong src/core/battle/skills.ts. */
const SKILL_ICON: Readonly<Record<string, IconSpec>> = {
  // Tướng sĩ
  tramKich: { glyph: "sword" },
  hieuLenh: { glyph: "flag", badge: "up" },
  phaTran: { glyph: "slash", badge: "down" },
  // Binh lính
  thuThanh: { glyph: "tower", badge: "shield" },
  phanKich: { glyph: "shield", badge: "reflect" },
  tuongKhien: { glyph: "shield", badge: "team" },
  // Pháp sư
  phepCong: { glyph: "orb" },
  nguHanhAn: { glyph: "seal" },
  phepLan: { glyph: "orb", badge: "aoe" },
  // Y sư
  linhDuoc: { glyph: "gourd", badge: "cleanse" },
  duongSinh: { glyph: "sprout", badge: "team" },
  teDo: { glyph: "heart", badge: "team" },
  // Mưu sĩ
  muaChuoc: { glyph: "coins", badge: "energy" },
  lyGian: { glyph: "mute" },
  catQuanLuong: { glyph: "sack", badge: "down" },
  // Quân sư
  nghiBinh: { glyph: "mask", badge: "down" },
  phaKe: { glyph: "tornScroll", badge: "aoe" },
  bayTran: { glyph: "formation", badge: "up" },
  // Mộc
  lucDiepPhong: { glyph: "leaf", triple: true },
  linhMocHoiSinh: { glyph: "sprout", badge: "heart" },
  thanhMocHoPhap: { glyph: "leaf", badge: "heart" },
  cuongVuThienDiep: { glyph: "leaf", badge: "aoe" },
  coThuTranThien: { glyph: "tree" },
  thanhTrucBaoPhu: { glyph: "bamboo", badge: "cleanse" },
  // Kim
  luyenKimThanhKiem: { glyph: "anvil" },
  kimYNgungThan: { glyph: "focus", badge: "up" },
  doanKimNhatTuyen: { glyph: "lineCut", badge: "down" },
  thietKyTungHoanh: { glyph: "horse", badge: "aoe" },
  kimAnPhaThien: { glyph: "seal" },
  giapDongHoThe: { glyph: "armor", badge: "up" },
  // Thủy
  thuyNguyetTuLinh: { glyph: "moon" },
  thanhLuuTayTran: { glyph: "drop", badge: "cleanse" },
  hanBangTien: { glyph: "arrow", badge: "ice" },
  bachDangTrieuDang: { glyph: "stakes", badge: "aoe" },
  thuyKiepVanTrung: { glyph: "wave", badge: "ice" },
  linhThuyHoMenh: { glyph: "drop", badge: "team" },
  // Hỏa
  phongHoaThieuDoanh: { glyph: "tent", badge: "fire" },
  noHoaThieuThan: { glyph: "flame", badge: "up" },
  xichDiemTien: { glyph: "arrow", badge: "fire" },
  hoaThieuLienTrai: { glyph: "tent", triple: true, badge: "fire" },
  lietDiemPhanThanh: { glyph: "citadel", badge: "fire" },
  ducHoaTrungSinh: { glyph: "bird", badge: "heart" },
  // Thổ
  hauThoTichLuong: { glyph: "grain" },
  thachGiap: { glyph: "rockShield" },
  sonBangDiaLiet: { glyph: "crack", badge: "shield" },
  diaChanTamQuan: { glyph: "quake", badge: "aoe" },
  thaiSonApDinh: { glyph: "mountain", badge: "shield" },
  kienThanhBatDong: { glyph: "tower", badge: "team" },
  // Lôi
  loiTruGiangThe: { glyph: "pillar" },
  tinhDienHoThan: { glyph: "shield", badge: "energy" },
  loiTienXuyenVan: { glyph: "bolt", badge: "energy" },
  loiVongThienLa: { glyph: "net", badge: "aoe" },
  cuuTieuLoiPhat: { glyph: "storm" },
  loiDinhHieuLenh: { glyph: "drum", badge: "up" },
  // Phong
  phongQuyenTanVan: { glyph: "whirl" },
  thanhPhongTuKhi: { glyph: "swirl", badge: "up" },
  phongNhanLietKhong: { glyph: "crescent" },
  cuongPhongQuetTran: { glyph: "tornado", badge: "aoe" },
  baoTapCanKhon: { glyph: "spiral" },
  phongHanhVanLy: { glyph: "wing", badge: "team" },
};

/** Kỹ năng không có trong bảng (thêm mới mà chưa vẽ) dùng hình theo kiểu mục tiêu. */
function fallbackSpec(def: SkillDef): IconSpec {
  if (def.steps.some(s => s.type === "heal")) return { glyph: "heart" };
  if (def.steps.some(s => s.type === "energy")) return { glyph: "bolt", badge: "energy" };
  if (def.steps.some(s => s.type === "dispel")) return { glyph: "tornScroll", badge: "cleanse" };
  if (def.steps.some(s => s.type === "whirl")) return { glyph: "swirl" };
  if (def.steps.some(s => s.type === "effect" && s.effect === "silence")) return { glyph: "mute" };
  if (def.steps.some(s => s.type === "effect" && s.effect === "shield")) return { glyph: "shield" };
  switch (def.target) {
    case "enemy":
      return { glyph: "burst" };
    case "allEnemies":
      return { glyph: "burst", badge: "aoe" };
    case "team":
      return { glyph: "shield", badge: "team" };
    default:
      return { glyph: "orb", badge: "up" };
  }
}

/** Kỹ năng có ảnh vẽ tay ở public/art/skills/<mã>.webp: 7 hệ × 6 ô của nhân vật chính và chiêu nghề đã có hình. */
const SKILL_ART = new Set([
  "luyenKimThanhKiem", "kimYNgungThan", "doanKimNhatTuyen", "thietKyTungHoanh", "kimAnPhaThien", "giapDongHoThe",
  "lucDiepPhong", "linhMocHoiSinh", "thanhMocHoPhap", "cuongVuThienDiep", "coThuTranThien", "thanhTrucBaoPhu",
  "thuyNguyetTuLinh", "thanhLuuTayTran", "hanBangTien", "bachDangTrieuDang", "thuyKiepVanTrung", "linhThuyHoMenh",
  "phongHoaThieuDoanh", "noHoaThieuThan", "xichDiemTien", "hoaThieuLienTrai", "lietDiemPhanThanh", "ducHoaTrungSinh",
  "hauThoTichLuong", "thachGiap", "sonBangDiaLiet", "diaChanTamQuan", "thaiSonApDinh", "kienThanhBatDong",
  "loiTruGiangThe", "tinhDienHoThan", "loiTienXuyenVan", "loiVongThienLa", "cuuTieuLoiPhat", "loiDinhHieuLenh",
  "phongQuyenTanVan", "thanhPhongTuKhi", "phongNhanLietKhong", "cuongPhongQuetTran", "baoTapCanKhon", "phongHanhVanLy",
  // Chiêu nghề Shan vẽ (04/11/2026), đủ 8 nghề.
  "role_tramKich", "role_phaTran", "role_doatMenh", "role_phepLan", "role_nguHanhAn", "role_thienDiaCong",
  "role_thuThanh", "role_tuongKhien", "role_phanKich", "role_linhDuoc", "role_duongSinh", "role_teDo",
  "role_muaChuoc", "role_lyGian", "role_catQuanLuong", "role_nghiBinh", "role_hieuLenh", "role_phaKe",
  "role_xaThu_dinhDiem", "role_xaThu_phaGiap", "role_xaThu_tapKich", "role_satThu_thuaHu", "role_satThu_doatKhi", "role_satThu_truyMenh",
  // Tuyệt chiêu ô 4 của Đinh Bộ Lĩnh, mỗi hệ một hình (Shan vẽ 04/11/2026): Tướng sĩ, Pháp sư, Binh lính, Y sư, Mưu sĩ, Quân sư, Xạ thủ, Sát thủ.
  "dbl_tuongSi_kim", "dbl_tuongSi_moc", "dbl_tuongSi_thuy", "dbl_tuongSi_hoa", "dbl_tuongSi_tho", "dbl_tuongSi_loi", "dbl_tuongSi_phong",
  "dbl_phapSu_kim", "dbl_phapSu_moc", "dbl_phapSu_thuy", "dbl_phapSu_hoa", "dbl_phapSu_tho", "dbl_phapSu_loi", "dbl_phapSu_phong",
  "dbl_binhLinh_kim", "dbl_binhLinh_moc", "dbl_binhLinh_thuy", "dbl_binhLinh_hoa", "dbl_binhLinh_tho", "dbl_binhLinh_loi", "dbl_binhLinh_phong",
  "dbl_ySu_kim", "dbl_ySu_moc", "dbl_ySu_thuy", "dbl_ySu_hoa", "dbl_ySu_tho", "dbl_ySu_loi", "dbl_ySu_phong",
  "dbl_muuSi_kim", "dbl_muuSi_moc", "dbl_muuSi_thuy", "dbl_muuSi_hoa", "dbl_muuSi_tho", "dbl_muuSi_loi", "dbl_muuSi_phong",
  "dbl_quanSu_kim", "dbl_quanSu_moc", "dbl_quanSu_thuy", "dbl_quanSu_hoa", "dbl_quanSu_tho", "dbl_quanSu_loi", "dbl_quanSu_phong",
  "dbl_xaThu_kim", "dbl_xaThu_moc", "dbl_xaThu_thuy", "dbl_xaThu_hoa", "dbl_xaThu_tho", "dbl_xaThu_loi", "dbl_xaThu_phong",
  "dbl_satThu_kim", "dbl_satThu_moc", "dbl_satThu_thuy", "dbl_satThu_hoa", "dbl_satThu_tho", "dbl_satThu_loi", "dbl_satThu_phong",
]);

/**
 * Chiêu ô 4 của tướng kèm / tướng lịch sử / sứ quân dùng lại ảnh chiêu hệ cũ của Đinh Bộ Lĩnh (Shan duyệt 04/11/2026),
 * ghép theo hệ và tác dụng. Mỗi ảnh chỉ gán một lần.
 */
export const REUSED_SKILL_ART: Readonly<Record<string, string>> = {
  sieuLoaiPhaGiap: "kimAnPhaThien", // Lý Khuê
  rb069_ultimate: "doanKimNhatTuyen", // Bạch Phong Đao
  kimQuaThietMa: "thietKyTungHoanh", // Trần Cương
  thietBichDongThanh: "giapDongHoThe", // Cao Kiên
  hoiHoSinhKhi: "coThuTranThien", // Kiều Thuận
  hoaLuThaoDuoc: "thanhTrucBaoPhu", // Trịnh Tú
  trucLamPhaTran: "thanhMocHoPhap", // Lâm Tùng
  kinhCucTrienThan: "cuongVuThienDiep", // Đàm Thảo
  boHaiTranGiang: "thuyKiepVanTrung", // Trần Lãm
  namVietVuongAn: "bachDangTrieuDang", // Đinh Liễn
  rb064_lieuDiepToaGiang: "hanBangTien", // Lam Giang Phi Diệp
  camLoHoiXuan: "linhThuyHoMenh", // Mai Thanh
  bachHoXuatSon: "lietDiemPhanThanh", // Phạm Bạch Hổ
  dinhQuocHoaKy: "hoaThieuLienTrai", // Nguyễn Bặc
  rb065_xichLuanLietTran: "xichDiemTien", // Xích Diệm Luân
  danHoaHoiNguyen: "ducHoaTrungSinh", // Hồng Đan
  doDongKienTam: "thaiSonApDinh", // Đỗ Cảnh Thạc
  ngoaiGiapHoQuan: "kienThanhBatDong", // Đinh Điền
  sonHaTranKich: "sonBangDiaLiet", // Kha Sơn
  diaMachBungPhat: "diaChanTamQuan", // Doãn Nham
  phongChauLoiKich: "cuuTieuLoiPhat", // Kiều Công Hãn
  thapDaoLoiBinh: "loiDinhHieuLenh", // Lê Hoàn
  rb067_loiChamTuocKhi: "loiTienXuyenVan", // Lôi Minh Xạ
  loiTranKinhHon: "loiVongThienLa", // Mạc Vân
  duongLamPhongKhoi: "baoTapCanKhon", // Ngô Nhật Khánh
  vp_vanDuThienLy: "phongHanhVanLy", // Vũ Phong
  truyPhongDoatMenh: "phongNhanLietKhong", // Hứa Lăng
  rb068_phongLangNhieuTran: "cuongPhongQuetTran", // Tật Phong Lăng
};

/** Tuyệt chiêu ô 4 của Đinh Bộ Lĩnh (`dbl_<nghề>_<hệ>`) dùng lại ảnh tuyệt chiêu hệ cũ của chính ông. */
const DBL_ULTIMATE_ART: Readonly<Record<Element, string>> = {
  kim: "kimAnPhaThien",
  moc: "coThuTranThien",
  thuy: "thuyKiepVanTrung",
  hoa: "lietDiemPhanThanh",
  tho: "thaiSonApDinh",
  loi: "cuuTieuLoiPhat",
  phong: "baoTapCanKhon",
};

/**
 * Ảnh vẽ tay cho một kỹ năng (mã file trong public/art/skills/) và có cần huy hiệu nghề ở góc không.
 * - Mã gốc trong SKILL_ART: ảnh của chính nó.
 * - `element_<mã>` (ô 2/6 hệ của mọi nhân vật chơi được): bỏ tiền tố, dùng ảnh hệ cũ.
 * - `dbl_<nghề>_<hệ>`: cả 8 nghề đều có ảnh riêng; dự phòng (mã mới chưa vẽ) là ảnh tuyệt chiêu hệ cũ + huy hiệu nghề.
 */
export function skillArt(def: Pick<SkillDef, "id" | "element" | "profession">): { file: string; badge?: Profession } | undefined {
  if (SKILL_ART.has(def.id)) return { file: def.id };
  const reused = REUSED_SKILL_ART[def.id];
  if (reused) return { file: reused };
  if (def.id.startsWith("element_")) {
    const file = def.id.slice("element_".length);
    return SKILL_ART.has(file) ? { file } : undefined;
  }
  // Chiêu nghề bản cũ của tùy tướng AI (cùng tên, mã không tiền tố) dùng chung ảnh với bản role_.
  if (def.profession && SKILL_ART.has(`role_${def.id}`)) return { file: `role_${def.id}` };
  if (def.id.startsWith("dbl_") && def.element && def.profession) return { file: DBL_ULTIMATE_ART[def.element], badge: def.profession };
  return undefined;
}

/** Ô kỹ năng có ảnh vẽ tay: nền sơn mài thẫm viền màu hệ, tuyệt chiêu viền vàng có hào quang. */
function SkillArtIcon({ def, art, className }: { def: SkillDef; art: { file: string; badge?: Profession }; className: string }) {
  const edge = def.element ? ELEMENT_COLOR[def.element] : def.profession ? PROFESSION_COLOR[def.profession] : "#b98a3e";
  const ultimate = def.ultimate === true;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <rect x={1.5} y={1.5} width={45} height={45} rx={9} fill="#17120d" stroke={ultimate ? "#ffe08a" : edge} strokeWidth={2.4} />
      <rect x={4} y={4} width={40} height={40} rx={7} fill={edge} opacity={0.18} />
      {ultimate && <polygon points={starPoints(24, 24, 22, 17, 16)} fill="#ffe08a" opacity={0.3} />}
      <image href={`/art/skills/${art.file}.webp`} x={4} y={4} width={40} height={40} />
      {art.badge && (
        <g>
          <circle cx={38} cy={38} r={8} fill="#17120d" stroke="#ffe08a" strokeWidth={1.2} />
          <image href={`/art/professions/${art.badge}.webp`} x={31.5} y={31.5} width={13} height={13} />
        </g>
      )}
    </svg>
  );
}

export function SkillIcon({ def, className = "size-8" }: { def: SkillDef; className?: string }) {
  const art = skillArt(def);
  if (art) return <SkillArtIcon def={def} art={art} className={className} />;
  const spec = SKILL_ICON[def.id] ?? (def.id.startsWith("role_") ? SKILL_ICON[def.id.slice(5)] : undefined) ?? fallbackSpec(def);
  const bg = def.element ? (SKILL_ELEMENT_BG[def.element] ?? ELEMENT_COLOR[def.element]) : def.profession ? PROFESSION_COLOR[def.profession] : "#5a4a3a";
  const ultimate = def.ultimate === true;
  const glyph = G[spec.glyph];
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <rect x={1.5} y={1.5} width={45} height={45} rx={9} fill={bg} stroke={INK} strokeWidth={2} />
      <path d="M7 4 H41 A6 6 0 0 1 44 7 V16 Q24 11 4 16 V7 A6 6 0 0 1 7 4 Z" fill="#fff" opacity={0.12} />
      {ultimate && (
        <g>
          <polygon points={starPoints(24, 24, 22, 17, 16)} fill="#ffe08a" opacity={0.55} />
          <rect x={4} y={4} width={40} height={40} rx={7} fill="none" stroke="#ffe08a" strokeWidth={1.5} />
        </g>
      )}
      {spec.triple ? (
        <g>
          <g transform="translate(2 1) scale(0.5)">{glyph}</g>
          <g transform="translate(22 5) scale(0.5)">{glyph}</g>
          <g transform="translate(10 21) scale(0.5)">{glyph}</g>
        </g>
      ) : (
        glyph
      )}
      {spec.badge && (
        <g transform="translate(38.5 38.5)">
          <circle r={7.5} fill={BADGE[spec.badge].bg} stroke={INK} strokeWidth={1.5} />
          {BADGE[spec.badge].glyph}
        </g>
      )}
    </svg>
  );
}
