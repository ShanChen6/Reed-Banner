// Hình ô cờ vẽ bằng SVG, phong cách khắc gỗ: nét mực đậm, mảng màu phẳng.
// Mỗi loại ô có nền một màu riêng (khác cả độ sáng lẫn sắc độ) và hình riêng, để đọc được bàn cờ cả khi khó phân biệt màu.

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

const stroke = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/** Hình vẽ của từng loại ô trong khung 64×64, không có nền. */
export const TILE_GLYPH: Record<TileKind, React.ReactNode> = {
  kiem: (
    <g transform="rotate(45 32 32)">
      <path d="M32 6 L37.5 13 V40 H26.5 V13 Z" fill="#ece9e1" {...stroke} />
      <path d="M32 13 V37" stroke="#9aa0a6" strokeWidth={2} strokeLinecap="round" />
      <rect x={19} y={40} width={26} height={5.5} rx={2.5} fill="#e2b13c" {...stroke} />
      <rect x={28.5} y={45.5} width={7} height={9} fill="#6b4226" {...stroke} />
      <circle cx={32} cy={57.5} r={3.5} fill="#e2b13c" {...stroke} />
    </g>
  ),
  amDuong: (
    <g>
      <circle cx={32} cy={32} r={20} fill={PAPER} />
      <path d="M32 12 A20 20 0 0 1 32 52 A10 10 0 0 1 32 32 A10 10 0 0 0 32 12 Z" fill={INK} />
      <circle cx={32} cy={22} r={3.5} fill={INK} />
      <circle cx={32} cy={42} r={3.5} fill={PAPER} />
      <circle cx={32} cy={32} r={20} fill="none" {...stroke} />
    </g>
  ),
  banhChung: (
    <g>
      <rect x={14} y={14} width={36} height={36} rx={4} fill="#3f7d3a" {...stroke} />
      <path d="M17 17 L30 30 M47 17 L34 30 M17 47 L30 34 M47 47 L34 34" stroke="#6fae4f" strokeWidth={2} />
      <path d="M26 14 V50 M38 14 V50 M14 26 H50 M14 38 H50" stroke="#efe0b0" strokeWidth={2.5} />
      <rect x={14} y={14} width={36} height={36} rx={4} fill="none" {...stroke} />
    </g>
  ),
  tim: (
    <g>
      <path
        d="M32 52 C13 40 10 27 16 20 C22 13 29 15 32 21 C35 15 42 13 48 20 C54 27 51 40 32 52 Z"
        fill="#d6243e"
        {...stroke}
      />
      <ellipse cx={22.5} cy={25} rx={4} ry={2.5} transform="rotate(-35 22.5 25)" fill="#fff" opacity={0.75} />
    </g>
  ),
  vang: (
    <g>
      <path d="M10 34 Q12 48 32 49 Q52 48 54 34 Q44 40 32 40 Q20 40 10 34 Z" fill="#f5c542" {...stroke} />
      <ellipse cx={32} cy={33} rx={11} ry={8} fill="#f8d76a" {...stroke} />
      <path d="M27 30 Q30 27 34 28" stroke="#fff6cf" strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d="M17 41 Q24 44 30 44" stroke="#c9952a" strokeWidth={2} strokeLinecap="round" fill="none" />
    </g>
  ),
  sach: (
    <g>
      <rect x={15} y={12} width={34} height={40} rx={2} fill="#c8553d" {...stroke} />
      <path d="M21 12 V52" stroke={INK} strokeWidth={2} />
      <path d="M15 19 H21 M15 28 H21 M15 37 H21 M15 46 H21" stroke="#efe0b0" strokeWidth={2} />
      <rect x={29} y={17} width={11} height={24} fill={PAPER} {...stroke} strokeWidth={2} />
      <path d="M32.5 22 V36 M36.5 22 V30" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </g>
  ),
  trong: (
    <g>
      <circle cx={32} cy={32} r={22} fill="#c9933f" {...stroke} />
      <circle cx={32} cy={32} r={17.5} fill="none" stroke="#8a5a22" strokeWidth={2} strokeDasharray="2.5 2.5" />
      <circle cx={32} cy={32} r={13} fill="none" stroke="#8a5a22" strokeWidth={1.5} />
      <polygon points={starPoints(32, 32, 11, 4.5, 10)} fill="#f3d08a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={32} cy={32} r={2.5} fill={INK} />
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

/** Bản yếu (từ chữ L/T): khung vuông bằng đồng, bốn góc có đinh tán. */
function WeakFrame() {
  return (
    <g>
      <rect x={5} y={5} width={54} height={54} rx={7} fill="none" stroke="#f0d9a8" strokeWidth={3} />
      <rect x={5} y={5} width={54} height={54} rx={7} fill="none" stroke={INK} strokeWidth={1} />
      {[
        [7, 7],
        [57, 7],
        [7, 57],
        [57, 57],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x! - 3.5} y={y! - 3.5} width={7} height={7} transform={`rotate(45 ${x} ${y})`} fill="#e9c27a" stroke={INK} strokeWidth={1.2} />
      ))}
    </g>
  );
}

/** Bản mạnh (từ thẳng 5): vòng tròn vàng tỏa tia như mặt trời giữa mặt trống đồng. */
function StrongHalo() {
  return (
    <g>
      <polygon points={starPoints(32, 32, 31, 24, 16)} fill="#ffe08a" opacity={0.9} />
      <circle cx={32} cy={32} r={25} fill="none" stroke="#fff3c2" strokeWidth={2.5} />
      <circle cx={32} cy={32} r={25} fill="none" stroke={INK} strokeWidth={1} />
    </g>
  );
}

export function TileArt({ kind, special, className }: { kind: TileKind; special?: SpecialGrade; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <rect x={1.5} y={1.5} width={61} height={61} rx={11} fill={TILE_COLOR[kind]} stroke={INK} strokeWidth={2} />
      <path d="M8 4 H56 A7 7 0 0 1 60 8 V22 Q32 15 4 22 V8 A7 7 0 0 1 8 4 Z" fill="#fff" opacity={0.12} />
      {special === "strong" && <StrongHalo />}
      <g transform={special ? "translate(32 32) scale(0.86) translate(-32 -32)" : undefined}>{TILE_GLYPH[kind]}</g>
      {special === "weak" && <WeakFrame />}
    </svg>
  );
}
