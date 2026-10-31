// Biểu tượng riêng cho từng chế độ chơi (trang chủ), vẽ bằng SVG, không dùng lại hình ô cờ.
// Cùng khung 64×64, nền ngọc viền vàng, nét mực INK như bộ ô để đứng cạnh nhau không lệch tay.

import { INK } from "./tiles";

export type ModeIconKind = "practice" | "play" | "campaign" | "trial" | "destiny" | "survival" | "daily" | "arena";

const GOLD = "#e0b25a";
const GOLD_DK = "#a5772f";
const RED = "#b8392b";
const CREAM = "#f2e3b8";
const WOOD = "#8a5a2b";
const s = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" } as const;

const GLYPH: Record<ModeIconKind, React.ReactNode> = {
  // Thao Luyện: bia tập bắn có mũi tên cắm giữa.
  practice: (
    <>
      <circle cx={30} cy={34} r={19} fill={CREAM} {...s} />
      <circle cx={30} cy={34} r={13} fill={RED} {...s} />
      <circle cx={30} cy={34} r={7} fill={CREAM} {...s} />
      <circle cx={30} cy={34} r={2.6} fill={RED} {...s} strokeWidth={1.2} />
      <path d="M30 34 L54 10" stroke={WOOD} strokeWidth={3.2} strokeLinecap="round" />
      <path d="M54 10 L47 11 M54 10 L53 17" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <path d="M50 14 L57 7 M53.5 17.5 L59 12" stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  // Giao Tranh: hai kiếm bắt chéo.
  play: (
    <>
      <path d="M12 10 L40 38 L36 42 L8 14 Z" fill="#c9ced6" {...s} />
      <path d="M52 10 L24 38 L28 42 L56 14 Z" fill="#dfe3e8" {...s} />
      <path d="M36 34 L44 42 M28 34 L20 42" stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
      <path d="M42 40 L50 48 M22 40 L14 48" stroke={WOOD} strokeWidth={4.5} strokeLinecap="round" />
      <circle cx={52} cy={52} r={3} fill={GOLD} {...s} strokeWidth={1.4} />
      <circle cx={12} cy={52} r={3} fill={GOLD} {...s} strokeWidth={1.4} />
    </>
  ),
  // Bình Loạn: cờ lệnh sứ quân cắm trên cán, đuôi nheo.
  campaign: (
    <>
      <path d="M17 8 V57" stroke={WOOD} strokeWidth={4} strokeLinecap="round" />
      <path d="M17 11 H51 L44 21 L51 31 H17 Z" fill={RED} {...s} />
      <path d="M22 16 H40 M22 26 H40" stroke={GOLD} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={17} cy={7} r={3.4} fill={GOLD} {...s} strokeWidth={1.6} />
      <path d="M10 57 H26" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  // Tháp Thí Luyện: tháp ba tầng mái cong.
  trial: (
    <>
      <path d="M10 56 H54" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d="M22 50 H42 V56 H22 Z" fill={GOLD_DK} {...s} />
      <path d="M20 38 H44 V50 H20 Z" fill={CREAM} {...s} />
      <path d="M14 38 Q32 34 50 38 L46 33 H18 Z" fill={RED} {...s} />
      <path d="M23 26 H41 V33 H23 Z" fill={CREAM} {...s} />
      <path d="M17 26 Q32 22 47 26 L43 21 H21 Z" fill={RED} {...s} />
      <path d="M26 14 H38 V21 H26 Z" fill={CREAM} {...s} />
      <path d="M20 14 Q32 10 44 14 L36 8 H28 Z" fill={RED} {...s} />
      <path d="M32 8 V3" stroke={GOLD} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M28 46 H36 M28 30 H36" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
    </>
  ),
  // Tháp Thiên Mệnh: đồ hình âm dương trong vòng bát quái.
  destiny: (
    <>
      <circle cx={32} cy={32} r={26} fill="#24304a" {...s} />
      <path d="M32 6 V11 M32 53 V58 M6 32 H11 M53 32 H58 M13.6 13.6 L17.2 17.2 M46.8 46.8 L50.4 50.4 M13.6 50.4 L17.2 46.8 M46.8 17.2 L50.4 13.6" stroke={GOLD} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={32} cy={32} r={15} fill={CREAM} {...s} />
      <path d="M32 17 A15 15 0 0 1 32 47 A7.5 7.5 0 0 1 32 32 A7.5 7.5 0 0 0 32 17 Z" fill={INK} />
      <circle cx={32} cy={24.5} r={2.6} fill={CREAM} />
      <circle cx={32} cy={39.5} r={2.6} fill={INK} />
      <circle cx={32} cy={32} r={15} fill="none" {...s} />
    </>
  ),
  // Trấn Ải: cổng thành có lỗ châu mai.
  survival: (
    <>
      <path d="M6 56 V24 H14 V18 H20 V24 H26 V18 H32 V24 H38 V18 H44 V24 H50 V18 H56 V24 H58 V56 Z" fill="#b9a98a" {...s} />
      <path d="M22 56 V38 A10 10 0 0 1 42 38 V56 Z" fill="#3b2a1c" {...s} />
      <path d="M32 28 V56 M22 42 H42" stroke={GOLD_DK} strokeWidth={1.8} />
      <path d="M12 32 V36 M52 32 V36" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M32 18 V6 L44 10 L32 14" fill={RED} {...s} strokeWidth={1.6} />
    </>
  ),
  // Nhật Lệnh: mặt trời toả tia trên lệnh bài.
  daily: (
    <>
      <path d="M32 3 V10 M32 54 V61 M3 32 H10 M54 32 H61 M11.5 11.5 L16.5 16.5 M47.5 47.5 L52.5 52.5 M11.5 52.5 L16.5 47.5 M47.5 16.5 L52.5 11.5" stroke={GOLD} strokeWidth={3.2} strokeLinecap="round" />
      <circle cx={32} cy={32} r={16} fill={GOLD} {...s} />
      <circle cx={32} cy={32} r={10} fill="#f4cf7a" stroke={GOLD_DK} strokeWidth={1.6} />
      <path d="M32 26 V38 M26 32 H38" stroke={RED} strokeWidth={2.6} strokeLinecap="round" />
    </>
  ),
  // Quần Hùng: cúp xếp hạng hai quai.
  arena: (
    <>
      <path d="M18 8 H46 V22 A14 14 0 0 1 18 22 Z" fill={GOLD} {...s} />
      <path d="M18 12 H9 Q9 26 20 28 M46 12 H55 Q55 26 44 28" fill="none" {...s} strokeWidth={3} />
      <path d="M28 36 H36 V46 H28 Z" fill={GOLD_DK} {...s} />
      <path d="M20 46 H44 V56 H20 Z" fill={WOOD} {...s} />
      <path d="M32 13 L34.3 19 L40.5 19.4 L35.7 23.4 L37.3 29.5 L32 26 L26.7 29.5 L28.3 23.4 L23.5 19.4 L29.7 19 Z" fill={RED} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M26 51 H38" stroke={GOLD} strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
};

/** Biểu tượng chế độ: khung vuông bo góc, nền ngọc viền vàng, hình vẽ ở giữa. */
export function ModeIcon({ kind, className }: { kind: ModeIconKind; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden focusable="false">
      <rect x={1.5} y={1.5} width={77} height={77} rx={12} fill="#4a7a67" stroke={GOLD} strokeWidth={2.4} />
      <rect x={5} y={5} width={70} height={70} rx={9} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={1} />
      <g transform="translate(8 8)">{GLYPH[kind]}</g>
    </svg>
  );
}
