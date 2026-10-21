// Hình ô cờ vẽ bằng SVG, phong cách fantasy theo logo: viền đồng mạ vàng, nền ngọc sáng giữa tối mép, vật phẩm đổ bóng kim loại.
// Mỗi loại ô có nền một màu riêng (khác cả độ sáng lẫn sắc độ) và hình riêng, để đọc được bàn cờ cả khi khó phân biệt màu.
// Dải màu dùng chung nằm trong <TileDefs /> (gắn một lần ở layout gốc), nên mỗi ô chỉ tham chiếu url(#...), không lặp defs.
// Không dùng filter (blur, bóng đổ) để cả bàn 96 ô vẫn vẽ nhẹ trên điện thoại.

import type { SpecialGrade, TileKind } from "@/core";

export const INK = "#2b1d14";
const PAPER = "#f6ecd4";

/** Màu nền ô, cũng dùng cho thanh tỉ lệ ô và chú thích. */
export const TILE_COLOR: Record<TileKind, string> = {
  kiem: "#c0392b",
  amDuong: "#5b4a9e",
  banhChung: "#a7cf74",
  tim: "#f3b3c3",
  vang: "#5e3b1f",
  sach: "#2f5f9f",
  trong: "#1f7a6d",
};

/** Nền ngọc của từng ô: tâm sáng, giữa là màu chính, mép tối. */
const TILE_GEM: Record<TileKind, readonly [string, string, string]> = {
  kiem: ["#f07a5c", "#c0392b", "#5c120b"],
  amDuong: ["#9d88e6", "#5b4a9e", "#211648"],
  banhChung: ["#e2f5b8", "#a7cf74", "#4d7d2b"],
  tim: ["#fff0f3", "#f3b3c3", "#b65874"],
  vang: ["#9a6a3a", "#5e3b1f", "#24130a"],
  sach: ["#74a6ea", "#2f5f9f", "#0f2850"],
  trong: ["#52c7b2", "#1f7a6d", "#073a33"],
};

const url = (id: string) => `url(#tile-${id})`;
const stroke = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/** Dải màu dùng chung của mọi ô. Gắn một lần cho cả trang; svg ẩn bằng kích thước 0 (display:none làm hỏng dải màu). */
export function TileDefs() {
  return (
    <svg width={0} height={0} aria-hidden focusable="false" style={{ position: "absolute", overflow: "hidden" }}>
      <defs>
        {(Object.keys(TILE_GEM) as TileKind[]).map((k) => (
          <radialGradient key={k} id={`tile-gem-${k}`} cx="50%" cy="42%" r="62%">
            <stop offset="0" stopColor={TILE_GEM[k][0]} />
            <stop offset="0.55" stopColor={TILE_GEM[k][1]} />
            <stop offset="1" stopColor={TILE_GEM[k][2]} />
          </radialGradient>
        ))}
        {/* Đồng mạ vàng như chữ logo: sáng ở trên, sẫm ở giữa, ánh lại ở dưới. */}
        <linearGradient id="tile-gilt" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#fff4c4" />
          <stop offset="0.3" stopColor="#e7b85a" />
          <stop offset="0.62" stopColor="#8a5a1c" />
          <stop offset="0.85" stopColor="#d9a74e" />
          <stop offset="1" stopColor="#f6dc93" />
        </linearGradient>
        <linearGradient id="tile-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2b3" />
          <stop offset="0.45" stopColor="#f2c14e" />
          <stop offset="1" stopColor="#a8701e" />
        </linearGradient>
        <linearGradient id="tile-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.48" stopColor="#dfe6ec" />
          <stop offset="0.52" stopColor="#97a6b3" />
          <stop offset="1" stopColor="#5f6e7b" />
        </linearGradient>
        <linearGradient id="tile-ruby" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ff7a8a" />
          <stop offset="0.5" stopColor="#d81f3f" />
          <stop offset="1" stopColor="#7a0a20" />
        </linearGradient>
        <linearGradient id="tile-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fbf55" />
          <stop offset="0.55" stopColor="#2f7a33" />
          <stop offset="1" stopColor="#164a1e" />
        </linearGradient>
        <linearGradient id="tile-leather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0704f" />
          <stop offset="0.6" stopColor="#a43a26" />
          <stop offset="1" stopColor="#5e1c12" />
        </linearGradient>
        <radialGradient id="tile-bronze" cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#f8d98a" />
          <stop offset="0.6" stopColor="#c48a36" />
          <stop offset="1" stopColor="#6e4515" />
        </radialGradient>
        <radialGradient id="tile-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset="0.45" stopColor="#ffe08a" stopOpacity={0.95} />
          <stop offset="1" stopColor="#f2a93b" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="tile-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.4} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Ánh sao bốn cánh trên vật kim loại. */
function Glint({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  const s = r * 0.22;
  return <path d={`M${x} ${y - r} L${x + s} ${y - s} L${x + r} ${y} L${x + s} ${y + s} L${x} ${y + r} L${x - s} ${y + s} L${x - r} ${y} L${x - s} ${y - s} Z`} fill="#fff" />;
}

/** Hình vẽ của từng loại ô trong khung 64×64, không có nền. */
export const TILE_GLYPH: Record<TileKind, React.ReactNode> = {
  kiem: (
    <g transform="rotate(45 32 32)">
      {/* Lưỡi thép, đốc đồng uốn như cánh chim, tua đỏ cờ lau ở chuôi. */}
      <path d="M32 4 L38 12 V40 H26 V12 Z" fill={url("steel")} {...stroke} />
      <path d="M32 11 V38" stroke="#7b8894" strokeWidth={1.4} strokeLinecap="round" />
      <path d="M17 39 Q24 43 32 41 Q40 43 47 39 L45 46 Q38 44 32 46 Q26 44 19 46 Z" fill={url("gold")} {...stroke} />
      <rect x={28.5} y={45.5} width={7} height={8.5} rx={1.5} fill="#6b2e1c" {...stroke} />
      <circle cx={32} cy={57} r={3.6} fill={url("gold")} {...stroke} />
      <path d="M32 60.5 Q30.5 62 29.5 63.5 M32 60.5 Q33.5 62 34.5 63.5" stroke="#e23b2c" strokeWidth={2.2} strokeLinecap="round" />
      <Glint x={30} y={16} r={4.5} />
    </g>
  ),
  amDuong: (
    <g>
      <circle cx={32} cy={32} r={21.5} fill="none" stroke={url("gilt")} strokeWidth={3} />
      <circle cx={32} cy={32} r={19} fill={PAPER} />
      <path d="M32 13 A19 19 0 0 1 32 51 A9.5 9.5 0 0 1 32 32 A9.5 9.5 0 0 0 32 13 Z" fill="#1d1640" />
      <circle cx={32} cy={22.5} r={3.4} fill="#1d1640" />
      <circle cx={32} cy={41.5} r={3.4} fill="#f3d27a" />
      <circle cx={32} cy={32} r={23} fill="none" stroke={INK} strokeWidth={1.2} />
      <circle cx={32} cy={32} r={19} fill="none" stroke={INK} strokeWidth={1.4} />
      {/* Bốn chấm tròn như hoa văn trống đồng trên vòng vàng. */}
      {[0, 90, 180, 270].map((a) => (
        <circle key={a} cx={32} cy={10.5} r={1.6} fill="#fff6d0" transform={`rotate(${a + 45} 32 32)`} />
      ))}
    </g>
  ),
  banhChung: (
    <g>
      <rect x={13} y={13} width={38} height={38} rx={5} fill={url("leaf")} {...stroke} />
      <path d="M16 16 L29 29 M48 16 L35 29 M16 48 L29 35 M48 48 L35 35" stroke="#8fd16a" strokeWidth={1.6} opacity={0.8} />
      <path d="M25.5 13 V51 M38.5 13 V51 M13 25.5 H51 M13 38.5 H51" stroke="#f4e3b0" strokeWidth={2.6} />
      <path d="M25.5 13 V51 M38.5 13 V51 M13 25.5 H51 M13 38.5 H51" stroke="#b08a4c" strokeWidth={0.8} strokeDasharray="2 3" />
      <rect x={13} y={13} width={38} height={38} rx={5} fill="none" {...stroke} />
      <path d="M17 18 Q24 15 31 16" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.45} fill="none" />
    </g>
  ),
  tim: (
    <g>
      <path d="M32 53 C12 40 9 26 15.5 19 C22 12 29 14.5 32 20.5 C35 14.5 42 12 48.5 19 C55 26 52 40 32 53 Z" fill={url("ruby")} {...stroke} />
      {/* Mặt cắt của viên hồng ngọc. */}
      <path d="M32 20.5 L32 49 M15.5 25 L32 33 L48.5 25 M22 16 L25 30 M42 16 L39 30" stroke="#ffb3be" strokeWidth={1} opacity={0.55} fill="none" />
      <path d="M18.5 22 Q21 17 26 17.5" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.8} fill="none" />
      <Glint x={43} y={22} r={4} />
    </g>
  ),
  vang: (
    <g>
      <path d="M9 33 Q11 49 32 50 Q53 49 55 33 Q44 40 32 40 Q20 40 9 33 Z" fill={url("gold")} {...stroke} />
      <ellipse cx={32} cy={32} rx={11.5} ry={8.5} fill={url("gold")} {...stroke} />
      <path d="M26 29 Q30 26 35 27" stroke="#fffbe6" strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d="M15 41 Q23 45 31 45" stroke="#a8701e" strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Glint x={47} y={21} r={5} />
      <Glint x={17} y={26} r={3} />
    </g>
  ),
  sach: (
    <g>
      <path d="M17 13 H47 A2 2 0 0 1 49 15 V51 A2 2 0 0 1 47 53 H17 Z" fill="#f4e6c4" {...stroke} />
      <rect x={14} y={11} width={33} height={40} rx={2.5} fill={url("leather")} {...stroke} />
      <path d="M20 11 V51" stroke={INK} strokeWidth={1.6} />
      <path d="M14 18 H20 M14 26 H20 M14 36 H20 M14 44 H20" stroke="#f0d49a" strokeWidth={1.8} />
      {/* Nhãn sách viền vàng, góc bọc đồng. */}
      <rect x={26} y={17} width={14} height={22} rx={1.5} fill={PAPER} stroke={url("gilt")} strokeWidth={2} />
      <path d="M30 22 V34 M34 22 V30 M37 24 V32" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M41 11 H47 V17 Z M41 51 H47 V45 Z" fill={url("gold")} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  ),
  trong: (
    <g>
      <circle cx={32} cy={32} r={23} fill={url("bronze")} {...stroke} />
      <circle cx={32} cy={32} r={19.5} fill="none" stroke="#7a4b16" strokeWidth={1.4} />
      {/* Vành răng cưa và vành chấm tròn của mặt trống, sao 14 cánh ở tâm. */}
      <polygon points={starPoints(32, 32, 19.5, 16.5, 28)} fill="none" stroke="#7a4b16" strokeWidth={1.1} strokeLinejoin="round" />
      <circle cx={32} cy={32} r={14.5} fill="none" stroke="#8a5a22" strokeWidth={1} strokeDasharray="1.2 2.4" strokeLinecap="round" />
      <polygon points={starPoints(32, 32, 12.5, 4.6, 14)} fill="#fff1b8" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <circle cx={32} cy={32} r={3} fill="#c2410c" stroke={INK} strokeWidth={1} />
      <path d="M17 22 Q22 15 30 13.5" stroke="#fff6d6" strokeWidth={2} strokeLinecap="round" opacity={0.6} fill="none" />
    </g>
  ),
};

/** Ngôi sao nhiều cánh như mặt trống đồng, `n` cánh. */
export function starPoints(cx: number, cy: number, outer: number, inner: number, n: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const CORNERS = [
  [8, 8],
  [56, 8],
  [8, 56],
  [56, 56],
] as const;

/** Bản yếu (từ chữ L/T): khung đồng mạ vàng, bốn góc gắn đinh hình thoi. */
function WeakFrame() {
  return (
    <g>
      <rect x={5} y={5} width={54} height={54} rx={8} fill="none" stroke={url("gilt")} strokeWidth={3.5} />
      <rect x={5} y={5} width={54} height={54} rx={8} fill="none" stroke={INK} strokeWidth={0.8} />
      {CORNERS.map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`rotate(45 ${x} ${y})`}>
          <rect x={x - 4} y={y - 4} width={8} height={8} fill={url("gold")} stroke={INK} strokeWidth={1.1} />
          <rect x={x - 1.5} y={y - 1.5} width={3} height={3} fill="#c0392b" />
        </g>
      ))}
    </g>
  );
}

/** Bản mạnh (từ thẳng 5): mặt trời tỏa tia giữa mặt trống đồng, vòng vàng mạ. */
function StrongHalo() {
  return (
    <g>
      <circle cx={32} cy={32} r={30} fill={url("sun")} />
      <polygon points={starPoints(32, 32, 31, 23, 14)} fill="#ffe08a" opacity={0.85} />
      <circle cx={32} cy={32} r={24.5} fill="none" stroke={url("gilt")} strokeWidth={3} />
      <circle cx={32} cy={32} r={24.5} fill="none" stroke={INK} strokeWidth={0.8} />
    </g>
  );
}

export function TileArt({ kind, special, className }: { kind: TileKind; special?: SpecialGrade; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      {/* Viền đồng mạ vàng ôm lấy mặt ngọc. */}
      <rect x={1.5} y={1.5} width={61} height={61} rx={12} fill={url("gilt")} stroke={INK} strokeWidth={1.5} />
      <rect x={4.5} y={4.5} width={55} height={55} rx={9.5} fill={url(`gem-${kind}`)} stroke={INK} strokeWidth={1} />
      {/* Vòng răng cưa mờ như vành trống đồng. */}
      <circle cx={32} cy={32} r={24} fill="none" stroke="#fff" strokeOpacity={0.13} strokeWidth={1.2} strokeDasharray="3 3" />
      <path d="M10 5.5 H54 A5 5 0 0 1 58.5 10 V22 Q32 14 5.5 22 V10 A5 5 0 0 1 10 5.5 Z" fill={url("gloss")} />
      {special === "strong" && <StrongHalo />}
      <g transform={special ? "translate(32 32) scale(0.84) translate(-32 -32)" : undefined}>{TILE_GLYPH[kind]}</g>
      {special === "weak" && <WeakFrame />}
    </svg>
  );
}
