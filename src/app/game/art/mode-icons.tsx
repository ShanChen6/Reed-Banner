// Biểu tượng riêng cho từng chế độ chơi (trang chủ): ảnh vẽ ở public/art/modes/, chế độ chưa có ảnh vẽ bằng SVG.
// Cùng khung 64×64, nền ngọc viền vàng, nét mực INK như bộ ô để đứng cạnh nhau không lệch tay.

import { INK } from "./tiles";

/** Trùng slug đường dẫn của chế độ (`SCENE_SLUG`), để trang chủ dựng link thẳng từ đây. */
export type ModeIconKind =
  | "practice" | "play" | "campaign" | "trial" | "destiny" | "survival" | "daily" | "arena"
  | "formation" | "clear-path" | "scout" | "maze" | "tam-tuong-ky" | "expedition";

const GOLD = "#e0b25a";
const GOLD_DK = "#a5772f";
const RED = "#b8392b";
const CREAM = "#f2e3b8";
const WOOD = "#8a5a2b";
const JADE = "#5e9a6e";
const SKY = "#4f7fb0";
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
  // Trận Đồ: bàn trận ô vuông, hai lá cờ hai phe và mũi tên tiến quân.
  formation: (
    <>
      <rect x={6} y={8} width={52} height={48} rx={4} fill={CREAM} {...s} />
      <path d="M6 24 H58 M6 40 H58 M23.3 8 V56 M40.6 8 V56" stroke={GOLD_DK} strokeWidth={1.6} />
      <path d="M14 50 V36" stroke={WOOD} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M14 36 L24 39 L14 42 Z" fill={RED} {...s} strokeWidth={1.4} />
      <path d="M50 28 V14" stroke={WOOD} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M50 14 L40 17 L50 20 Z" fill={SKY} {...s} strokeWidth={1.4} />
      <path d="M22 46 Q32 44 36 32" fill="none" stroke={RED} strokeWidth={3} strokeLinecap="round" strokeDasharray="0.1 5.5" />
      <path d="M36 32 L33 37 M36 32 L39.5 36" stroke={RED} strokeWidth={2.6} strokeLinecap="round" />
    </>
  ),
  // Khai Lộ: khối quân cùng hệ vỡ ra, mở một lối sáng xuyên bàn.
  "clear-path": (
    <>
      {[[6, 8, RED], [22, 8, JADE], [38, 8, GOLD], [6, 24, SKY], [38, 24, JADE], [6, 40, GOLD], [22, 40, RED], [38, 40, SKY]].map(([x, y, c]) => (
        <rect key={`${x}-${y}`} x={x as number} y={y as number} width={14} height={14} rx={3} fill={c as string} {...s} strokeWidth={1.6} />
      ))}
      <rect x={22} y={24} width={14} height={14} rx={3} fill="#fff6d8" stroke={GOLD} strokeWidth={1.6} strokeDasharray="3 2" />
      <path d="M4 31 H60" stroke="#fff6d8" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M53 26 L60 31 L53 36" fill="none" stroke={GOLD} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 18 V21 M29 41 V44 M17 31 H20" stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  // Do Thám: ô đất đã dò, ô cắm cờ đánh dấu bẫy, ô còn dấu hỏi.
  scout: (
    <>
      <rect x={6} y={6} width={24} height={24} rx={3} fill="#b9a98a" {...s} />
      <rect x={34} y={6} width={24} height={24} rx={3} fill="#7d6a4c" {...s} />
      <rect x={6} y={34} width={24} height={24} rx={3} fill="#7d6a4c" {...s} />
      <rect x={34} y={34} width={24} height={24} rx={3} fill="#b9a98a" {...s} />
      <text x={18} y={25} textAnchor="middle" fontSize={17} fontWeight={800} fill={SKY} fontFamily="serif">2</text>
      <path d="M44 27 V11" stroke={WOOD} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M44 11 L54 14.5 L44 18 Z" fill={RED} {...s} strokeWidth={1.4} />
      <path d="M39 27 H50" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
      <text x={18} y={53} textAnchor="middle" fontSize={17} fontWeight={800} fill={CREAM} fontFamily="serif">?</text>
      <circle cx={46} cy={46} r={6} fill={INK} />
      <path d="M46 36 V40 M46 52 V56 M36 46 H40 M52 46 H56" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <circle cx={44} cy={44} r={1.6} fill={CREAM} />
    </>
  ),
  // Sử Lộ: cuộn sử mở ra, đường đi chấm chấm tới lá cờ, xúc xắc ở góc.
  maze: (
    <>
      <path d="M10 12 H50 V52 H10 Z" fill={CREAM} {...s} />
      <path d="M6 12 A4 4 0 0 1 14 12 V52 A4 4 0 0 1 6 52 Z M46 12 A4 4 0 0 1 54 12 V52 A4 4 0 0 1 46 52 Z" fill={GOLD_DK} {...s} />
      <path d="M18 44 Q22 30 30 34 T42 20" fill="none" stroke={RED} strokeWidth={2.6} strokeLinecap="round" strokeDasharray="0.1 5" />
      <circle cx={18} cy={44} r={2.6} fill={RED} {...s} strokeWidth={1.2} />
      <path d="M42 22 V12" stroke={WOOD} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M42 12 L49 14.5 L42 17 Z" fill={RED} {...s} strokeWidth={1.2} />
      <rect x={40} y={40} width={18} height={18} rx={4} fill="#fbf4e2" {...s} transform="rotate(-12 49 49)" />
      <circle cx={45} cy={46} r={1.8} fill={INK} />
      <circle cx={49} cy={49} r={1.8} fill={RED} />
      <circle cx={53} cy={52} r={1.8} fill={INK} />
    </>
  ),
  // Tầm Tướng Ký: hai phiếu nguyên liệu hợp lại thành mũ trụ tướng.
  "tam-tuong-ky": (
    <>
      <rect x={4} y={34} width={18} height={24} rx={3} fill={CREAM} {...s} transform="rotate(-14 13 46)" />
      <rect x={42} y={34} width={18} height={24} rx={3} fill={CREAM} {...s} transform="rotate(14 51 46)" />
      <path d="M10 44 H16 M48 44 H54" stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M18 34 Q18 12 32 10 Q46 12 46 34 Z" fill={GOLD} {...s} />
      <path d="M14 34 H50 L46 40 H18 Z" fill={GOLD_DK} {...s} />
      <path d="M32 10 V4" stroke={RED} strokeWidth={3} strokeLinecap="round" />
      <path d="M26 22 H38 M32 16 V28" stroke={RED} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M22 50 L28 46 M42 50 L36 46" stroke={GOLD} strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  // Viễn Chinh: sa bàn núi sông, mũi tên hành quân hai đạo tới thành địch.
  expedition: (
    <>
      <path d="M4 50 L16 18 L46 12 L60 44 L36 56 Z" fill="#d9c79c" {...s} />
      <path d="M12 46 Q24 38 22 28 Q20 20 30 16" fill="none" stroke={SKY} strokeWidth={3.2} strokeLinecap="round" />
      <path d="M34 36 L40 26 L46 36 Z M40 38 L45 30 L50 38 Z" fill={JADE} {...s} strokeWidth={1.4} />
      <path d="M48 16 H56 V24 H48 Z" fill={RED} {...s} strokeWidth={1.4} />
      <path d="M48 16 V13 H50 V16 M52 16 V13 H54 V16" stroke={INK} strokeWidth={1.4} />
      <path d="M14 52 Q24 48 30 42 Q38 34 46 26" fill="none" stroke={RED} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="4 3" />
      <path d="M46 26 L40 27 M46 26 L45 32" stroke={RED} strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
};

/**
 * Chế độ đã có ảnh vẽ (public/art/modes/<slug>.webp, 256 px, tấm bảng ngọc viền vàng theo
 * docs/06-art/prompts/icon-che-do.md); chế độ chưa có ảnh dùng bản SVG bên dưới.
 */
const MODE_ART: ReadonlySet<ModeIconKind> = new Set(["practice", "play", "campaign", "trial", "arena"]);

/** Biểu tượng chế độ: ảnh vẽ nếu đã có, nếu chưa thì SVG khung vuông bo góc nền ngọc viền vàng. */
export function ModeIcon({ kind, className }: { kind: ModeIconKind; className?: string }) {
  if (MODE_ART.has(kind))
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/art/modes/${kind}.webp`} alt="" aria-hidden className={className} loading="lazy" decoding="async" />;
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden focusable="false">
      <rect x={1.5} y={1.5} width={77} height={77} rx={12} fill="#4a7a67" stroke={GOLD} strokeWidth={2.4} />
      <rect x={5} y={5} width={70} height={70} rx={9} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={1} />
      <g transform="translate(8 8)">{GLYPH[kind]}</g>
    </svg>
  );
}
