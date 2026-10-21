// Hình ô cờ vẽ bằng SVG, phong cách bàn ngọc: mọi ô chung một nền ngọc xanh thẫm viền vàng mảnh, vật phẩm to, bóng, đủ màu.
// Loại ô nhận ra nhờ màu và dáng của chính vật phẩm (kiếm thép tua đỏ, âm dương lam, bánh chưng xanh, tim đỏ, nén vàng,
// sách bìa lam, trống đỏ), không nhờ màu nền, nên nền tối làm vật phẩm nổi lên rõ ở cỡ ~40 px trên điện thoại.
// Chỉ ô đặc biệt mới có hào quang (bản yếu) hoặc lửa (bản mạnh), kèm khung mạ vàng.
// Dải màu dùng chung nằm trong <TileDefs /> (gắn một lần ở layout gốc), nên mỗi ô chỉ tham chiếu url(#...), không lặp defs.
// Không dùng filter (blur, bóng đổ) để cả bàn 96 ô vẫn vẽ nhẹ trên điện thoại.

import type { SpecialGrade, TileKind } from "@/core";

export const INK = "#2b1d14";
const PAPER = "#f6ecd4";

/** Màu chủ đạo của vật phẩm từng ô, dùng cho thanh tỉ lệ ô và chú thích. */
export const TILE_COLOR: Record<TileKind, string> = {
  kiem: "#b9c6d2",
  amDuong: "#6c5bd0",
  banhChung: "#3f9a3c",
  tim: "#e2364f",
  vang: "#f2c14e",
  sach: "#2f6fd0",
  trong: "#c2452a",
};

const url = (id: string) => `url(#tile-${id})`;
const stroke = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/** Dải màu dùng chung của mọi ô. Gắn một lần cho cả trang; svg ẩn bằng kích thước 0 (display:none làm hỏng dải màu). */
export function TileDefs() {
  return (
    <svg width={0} height={0} aria-hidden focusable="false" style={{ position: "absolute", overflow: "hidden" }}>
      <defs>
        {/* Nền ngọc chung: sáng nhẹ ở giữa, sẫm dần ra mép. */}
        <radialGradient id="tile-jade" cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#2f5242" />
          <stop offset="0.6" stopColor="#1c3328" />
          <stop offset="1" stopColor="#0f1d16" />
        </radialGradient>
        {/* Đồng mạ vàng như chữ logo: sáng ở trên, sẫm ở giữa, ánh lại ở dưới. Dùng cho khung ô đặc biệt và trang trí trang. */}
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
        {/* Lưỡi thép: mép sáng, sống sẫm (dải vẽ theo bề ngang lưỡi trước khi xoay). */}
        <linearGradient id="tile-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.48" stopColor="#dfe6ec" />
          <stop offset="0.52" stopColor="#97a6b3" />
          <stop offset="1" stopColor="#5f6e7b" />
        </linearGradient>
        <linearGradient id="tile-ruby" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ff8a96" />
          <stop offset="0.45" stopColor="#e0243f" />
          <stop offset="1" stopColor="#7a0a20" />
        </linearGradient>
        <linearGradient id="tile-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7ccf5c" />
          <stop offset="0.55" stopColor="#2f8a33" />
          <stop offset="1" stopColor="#14501d" />
        </linearGradient>
        {/* Bìa sách lam và vòng âm dương lam tím. */}
        <linearGradient id="tile-sapphire" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6aa6ff" />
          <stop offset="0.5" stopColor="#2552b8" />
          <stop offset="1" stopColor="#0f2463" />
        </linearGradient>
        <linearGradient id="tile-indigo" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#a99cff" />
          <stop offset="0.5" stopColor="#5a48c4" />
          <stop offset="1" stopColor="#261a6e" />
        </linearGradient>
        {/* Thân trống sơn đỏ, đậm hai bên như mặt cong. */}
        <linearGradient id="tile-lacquer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a1410" />
          <stop offset="0.35" stopColor="#e0503a" />
          <stop offset="0.6" stopColor="#c0321f" />
          <stop offset="1" stopColor="#5e0f0b" />
        </linearGradient>
        <radialGradient id="tile-skin" cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="1" stopColor="#d9bf8a" />
        </radialGradient>
        <radialGradient id="tile-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset="0.45" stopColor="#ffe08a" stopOpacity={0.95} />
          <stop offset="1" stopColor="#f2a93b" stopOpacity={0} />
        </radialGradient>
        {/* Lửa của ô bản mạnh: đỏ ở mép, cam rồi vàng trắng ở lõi (ba lớp lưỡi lửa lồng nhau). */}
        <linearGradient id="tile-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff8a1f" />
          <stop offset="1" stopColor="#c81e1e" />
        </linearGradient>
        <linearGradient id="tile-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Ánh sao bốn cánh trên vật bóng. */
function Glint({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  const s = r * 0.22;
  return <path d={`M${x} ${y - r} L${x + s} ${y - s} L${x + r} ${y} L${x + s} ${y + s} L${x} ${y + r} L${x - s} ${y + s} L${x - r} ${y} L${x - s} ${y - s} Z`} fill="#fff" />;
}

/** Hình vẽ của từng loại ô trong khung 64×64, không có nền. Vật phẩm chiếm gần trọn mặt ô để đọc được ở cỡ nhỏ. */
export const TILE_GLYPH: Record<TileKind, React.ReactNode> = {
  kiem: (
    <g transform="rotate(45 32 32)">
      {/* Kiếm thép, đốc vàng, chuôi quấn đỏ, tua đỏ ở núm. */}
      <path d="M32 3 L38 11 V38 H26 V11 Z" fill={url("steel")} {...stroke} />
      <path d="M32 10 V36" stroke="#7b8894" strokeWidth={1.4} strokeLinecap="round" />
      <path d="M18 37 Q25 41 32 39.5 Q39 41 46 37 L44 44.5 Q38 42.5 32 44.5 Q26 42.5 20 44.5 Z" fill={url("gold")} {...stroke} />
      <rect x={28.5} y={44} width={7} height={9.5} rx={1.5} fill="#8a1c14" {...stroke} />
      <path d="M28.5 47 H35.5 M28.5 50 H35.5" stroke="#f2c14e" strokeWidth={1} />
      <circle cx={32} cy={56.5} r={3.8} fill={url("gold")} {...stroke} />
      <path d="M32 60 C30 62.5 26 63 24 61.5 M32 60 C33 63 31.5 65 29 65.5" stroke="#e2231a" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <Glint x={30} y={15} r={4.5} />
    </g>
  ),
  amDuong: (
    <g>
      {/* Vòng men lam tím viền vàng, lòng âm dương. */}
      <circle cx={32} cy={32} r={26} fill={url("indigo")} {...stroke} />
      <circle cx={32} cy={32} r={21} fill={PAPER} stroke="#f2c14e" strokeWidth={1.8} />
      <path d="M32 11 A21 21 0 0 1 32 53 A10.5 10.5 0 0 1 32 32 A10.5 10.5 0 0 0 32 11 Z" fill="#1d1a5c" />
      <circle cx={32} cy={21.5} r={3.8} fill="#1d1a5c" />
      <circle cx={32} cy={42.5} r={3.8} fill={PAPER} />
      <circle cx={32} cy={32} r={21} fill="none" stroke={INK} strokeWidth={1.2} />
      <path d="M12 24 Q17 11 30 8.5" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.75} fill="none" />
    </g>
  ),
  banhChung: (
    <g>
      {/* Bánh chưng lá xanh bóng, lạt buộc màu kem. */}
      <rect x={9} y={9} width={46} height={46} rx={7} fill={url("leaf")} {...stroke} />
      <path d="M13 13 L27 27 M51 13 L37 27 M13 51 L27 37 M51 51 L37 37" stroke="#9be07a" strokeWidth={1.6} opacity={0.7} />
      <path d="M24.5 9 V55 M39.5 9 V55 M9 24.5 H55 M9 39.5 H55" stroke={INK} strokeWidth={5} />
      <path d="M24.5 9 V55 M39.5 9 V55 M9 24.5 H55 M9 39.5 H55" stroke="#f6e3b0" strokeWidth={3} />
      <rect x={9} y={9} width={46} height={46} rx={7} fill="none" {...stroke} />
      <path d="M12 12 H52 Q53 20 50 22 Q32 16 14 22 Q11 20 12 12 Z" fill={url("gloss")} />
    </g>
  ),
  tim: (
    <g>
      {/* Trái tim hồng ngọc, viền vàng mảnh, vệt bóng lớn. */}
      <path
        d="M32 56 C9 42 5 26 11.5 17 C18 8.5 28 10.5 32 18 C36 10.5 46 8.5 52.5 17 C59 26 55 42 32 56 Z"
        fill={url("ruby")}
        stroke="#f2c14e"
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M32 56 C9 42 5 26 11.5 17 C18 8.5 28 10.5 32 18 C36 10.5 46 8.5 52.5 17 C59 26 55 42 32 56 Z" fill="none" {...stroke} />
      <path d="M15.5 25 Q17 15.5 26 16.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.85} fill="none" />
      <Glint x={44} y={22} r={4.5} />
    </g>
  ),
  vang: (
    <g>
      {/* Nén vàng to, sáng nhất bàn cờ. */}
      <path d="M4 32 Q6 53 32 54 Q58 53 60 32 Q47 41 32 41 Q17 41 4 32 Z" fill={url("gold")} {...stroke} />
      <ellipse cx={32} cy={31} rx={14.5} ry={10.5} fill={url("gold")} {...stroke} />
      <path d="M24 27 Q29 23.5 36 24.5" stroke="#fffbe6" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d="M12 42 Q21 47.5 31 47.5" stroke="#a8701e" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Glint x={50} y={18} r={6} />
      <Glint x={13} y={24} r={3.5} />
    </g>
  ),
  sach: (
    <g>
      {/* Sách bìa lam, gáy và góc bọc vàng, giữa bìa có hoa sen vàng. */}
      <path d="M14 9 H51 A2.5 2.5 0 0 1 53.5 11.5 V54 A2.5 2.5 0 0 1 51 56.5 H14 Z" fill="#f4e6c4" {...stroke} />
      <path d="M50 12 V53" stroke="#c9b37e" strokeWidth={1.2} />
      <rect x={10} y={7} width={38} height={47} rx={3} fill={url("sapphire")} {...stroke} />
      <path d="M10 7 H17 V54 H10 Z" fill={url("gold")} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M10 15 H17 M10 24 H17 M10 37 H17 M10 46 H17" stroke="#8a5a1c" strokeWidth={1.4} />
      <path d="M41 7 H48 V14 Z M41 54 H48 V47 Z" fill={url("gold")} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      {/* Hoa sen: ba cánh trên một đường đế. */}
      <path d="M32.5 20 C29 25 29 30 32.5 33 C36 30 36 25 32.5 20 Z M32.5 33 C27 33 23 29.5 22.5 25.5 C27 25.5 30.5 28.5 32.5 33 Z M32.5 33 C38 33 42 29.5 42.5 25.5 C38 25.5 34.5 28.5 32.5 33 Z" fill={url("gold")} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
      <path d="M23 37 H42" stroke={url("gold")} strokeWidth={2} strokeLinecap="round" />
      <path d="M20 11 Q30 9.5 44 11" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" opacity={0.5} fill="none" />
    </g>
  ),
  trong: (
    <g>
      {/* Trống sơn đỏ nhìn chếch: mặt da có sao vàng, thân cong đai vàng, hàng đinh và khoen. */}
      <path d="M10 22 V44 Q10 56 32 56 Q54 56 54 44 V22 Z" fill={url("lacquer")} {...stroke} />
      <path d="M10 26 Q10 34 32 34 Q54 34 54 26 M10 45 Q12 53 32 53 Q52 53 54 45" fill="none" stroke="#f2c14e" strokeWidth={2.4} />
      {[16, 24, 32, 40, 48].map((x) => (
        <circle key={x} cx={x} cy={x === 32 ? 35.6 : 35.6 - Math.abs(x - 32) * 0.12} r={1.5} fill="#ffe08a" stroke={INK} strokeWidth={0.6} />
      ))}
      <circle cx={32} cy={44} r={3.6} fill="none" stroke="#f2c14e" strokeWidth={1.8} />
      <ellipse cx={32} cy={22} rx={22} ry={11} fill={url("skin")} {...stroke} />
      <polygon points={starPoints(32, 22, 8, 3, 12)} fill="#d9a74e" transform="translate(32 22) scale(1 0.5) translate(-32 -22)" />
      <path d="M14 30 V44" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.35} />
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

/** Lưỡi lửa bốc từ đáy ô, ba lớp lồng nhau thu về giữa đáy. */
const FLAME =
  "M5 60 C3 46 8 38 8 28 C13 33 14.5 37 16 40 C15 29 18 19 24 10 C24.5 20 27 25 29 28 C29 19 32 10 36 3 C37.5 13 40 19 42 25 C43 19 46 14 51 10 C49.5 21 52 29 53 34 C55 30 57 28 59 23 C60 36 61 47 59 60 Z";

/** Bản yếu (từ chữ L/T): hào quang vàng, hai dải sáng cuộn quanh vật phẩm. */
function WeakAura() {
  return (
    <g>
      <circle cx={32} cy={32} r={26} fill={url("sun")} opacity={0.55} />
      <path d="M9 46 C11 22 36 6 55 15 M55 18 C53 42 28 58 9 49" fill="none" stroke="#ffb627" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
      <path d="M9 46 C11 22 36 6 55 15 M55 18 C53 42 28 58 9 49" fill="none" stroke="#fff6cf" strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

/** Tia sáng nhỏ quanh ô đặc biệt, vẽ đè lên vật phẩm. */
function Sparks() {
  return (
    <g>
      <Glint x={53} y={11} r={4} />
      <Glint x={11} y={53} r={3.5} />
      <circle cx={50} cy={50} r={1.4} fill="#fff6cf" />
      <circle cx={14} cy={14} r={1.2} fill="#fff6cf" />
    </g>
  );
}

/** Bản mạnh (từ thẳng 5): lửa bốc ba lớp từ đáy ô, mặt trời tỏa tia sau vật phẩm. */
function StrongFire() {
  return (
    <g>
      <polygon points={starPoints(32, 30, 29, 19, 14)} fill="#ffcf5a" opacity={0.35} />
      <path d={FLAME} fill={url("flame")} />
      <path d={FLAME} fill="#ff9f1c" transform="translate(32 60) scale(0.74) translate(-32 -60)" />
      <path d={FLAME} fill="#ffe47a" transform="translate(32 60) scale(0.46) translate(-32 -60)" />
    </g>
  );
}

export function TileArt({ kind, special, className }: { kind: TileKind; special?: SpecialGrade; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      {/* Nền ngọc chung, viền vàng mảnh; ô đặc biệt viền mạ vàng dày hơn. */}
      <rect x={1} y={1} width={62} height={62} rx={8} fill={url("jade")} stroke={special ? url("gilt") : "#b98a3e"} strokeWidth={special ? 3.5 : 1.6} />
      <rect x={3.5} y={3.5} width={57} height={57} rx={6} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={1} />
      {special === "weak" && <WeakAura />}
      {special === "strong" && <StrongFire />}
      <g transform={`translate(32 ${special ? 33 : 32}) scale(${special ? 0.8 : 0.92}) translate(-32 -32)`}>{TILE_GLYPH[kind]}</g>
      {special && <Sparks />}
    </svg>
  );
}
