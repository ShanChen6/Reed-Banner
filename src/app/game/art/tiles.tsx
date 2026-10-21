// Hình ô cờ vẽ bằng SVG, phong cách đồng chạm bản rút gọn: khung đồng mảnh, nền sơn mài một màu, vật phẩm đúc đồng to và đậm.
// Mỗi loại ô có nền một màu riêng (khác cả độ sáng lẫn sắc độ) và hình riêng, để đọc được bàn cờ ở cỡ ~40 px và cả khi khó phân biệt màu.
// Nền không vẽ hoa văn: chi tiết nhỏ nhòe thành vệt ở cỡ điện thoại. Chỉ ô đặc biệt mới có hào quang (bản yếu) hoặc lửa (bản mạnh).
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

/** Nền sơn mài của từng ô: tâm sáng, giữa là màu chính, mép tối. */
const TILE_GEM: Record<TileKind, readonly [string, string, string]> = {
  kiem: ["#e8664a", "#c0392b", "#6a160d"],
  amDuong: ["#8f7bdb", "#5b4a9e", "#261a52"],
  banhChung: ["#d9f0a8", "#a7cf74", "#557f30"],
  tim: ["#ffe6ec", "#f3b3c3", "#bd627d"],
  vang: ["#8a5d33", "#5e3b1f", "#28150b"],
  sach: ["#6497de", "#2f5f9f", "#122c56"],
  trong: ["#46b8a4", "#1f7a6d", "#093f37"],
};

const url = (id: string) => `url(#tile-${id})`;
const stroke = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/** Dải màu dùng chung của mọi ô. Gắn một lần cho cả trang; svg ẩn bằng kích thước 0 (display:none làm hỏng dải màu). */
export function TileDefs() {
  return (
    <svg width={0} height={0} aria-hidden focusable="false" style={{ position: "absolute", overflow: "hidden" }}>
      <defs>
        {(Object.keys(TILE_GEM) as TileKind[]).map((k) => (
          <radialGradient key={k} id={`tile-gem-${k}`} cx="50%" cy="45%" r="64%">
            <stop offset="0" stopColor={TILE_GEM[k][0]} />
            <stop offset="0.6" stopColor={TILE_GEM[k][1]} />
            <stop offset="1" stopColor={TILE_GEM[k][2]} />
          </radialGradient>
        ))}
        {/* Đồng mạ vàng như chữ logo: sáng ở trên, sẫm ở giữa, ánh lại ở dưới. Dùng cho khung ô đặc biệt và trang trí trang. */}
        <linearGradient id="tile-gilt" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#fff4c4" />
          <stop offset="0.3" stopColor="#e7b85a" />
          <stop offset="0.62" stopColor="#8a5a1c" />
          <stop offset="0.85" stopColor="#d9a74e" />
          <stop offset="1" stopColor="#f6dc93" />
        </linearGradient>
        {/* Đồng cổ của khung ô thường: tối và trầm hơn mạ vàng, để vật phẩm nổi lên trên. */}
        <linearGradient id="tile-cast" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#d9ad66" />
          <stop offset="0.45" stopColor="#8f6128" />
          <stop offset="0.8" stopColor="#5a3a14" />
          <stop offset="1" stopColor="#b58440" />
        </linearGradient>
        <linearGradient id="tile-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2b3" />
          <stop offset="0.45" stopColor="#f2c14e" />
          <stop offset="1" stopColor="#a8701e" />
        </linearGradient>
        {/* Lưỡi kiếm đồng: mép sáng, sống sẫm (dải vẽ theo bề ngang lưỡi trước khi xoay). */}
        <linearGradient id="tile-blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff0b8" />
          <stop offset="0.45" stopColor="#e2b259" />
          <stop offset="0.55" stopColor="#a8742c" />
          <stop offset="1" stopColor="#6e4515" />
        </linearGradient>
        {/* Gỉ đồng xanh trong rãnh chạm, như mẫu kiếm đồng. */}
        <linearGradient id="tile-patina" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fc4a2" />
          <stop offset="1" stopColor="#3b6b53" />
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
        <radialGradient id="tile-bronze" cx="42%" cy="36%" r="66%">
          <stop offset="0" stopColor="#fbe2a0" />
          <stop offset="0.55" stopColor="#c48a36" />
          <stop offset="1" stopColor="#6e4515" />
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
      </defs>
    </svg>
  );
}

/** Ánh sao bốn cánh trên vật kim loại. */
function Glint({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  const s = r * 0.22;
  return <path d={`M${x} ${y - r} L${x + s} ${y - s} L${x + r} ${y} L${x + s} ${y + s} L${x} ${y + r} L${x - s} ${y + s} L${x - r} ${y} L${x - s} ${y - s} Z`} fill="#fff" />;
}

/** Hình vẽ của từng loại ô trong khung 64×64, không có nền. Vật phẩm chiếm gần trọn mặt ô để đọc được ở cỡ nhỏ. */
export const TILE_GLYPH: Record<TileKind, React.ReactNode> = {
  kiem: (
    <g transform="rotate(45 32 32)">
      {/* Kiếm đồng hình lá như mẫu: lưỡi đồng mép sáng, rãnh gỉ xanh, đốc cong, núm tròn khắc mặt trời. */}
      <path d="M32 2 C35.5 7 40 13 40 21 L38.5 39 H25.5 L24 21 C24 13 28.5 7 32 2 Z" fill={url("blade")} {...stroke} />
      <path d="M32 9 L35 21 L34 37 H30 L29 21 Z" fill={url("patina")} stroke="#5a3a14" strokeWidth={0.9} strokeLinejoin="round" />
      <path d="M32 10 V36" stroke="#f6dc93" strokeWidth={1.3} strokeLinecap="round" />
      <path d="M19 37 Q25 41 32 40 Q39 41 45 37 Q45.5 43.5 41 46 H23 Q18.5 43.5 19 37 Z" fill={url("bronze")} {...stroke} />
      <circle cx={32} cy={42.5} r={2.2} fill={url("patina")} stroke={INK} strokeWidth={1} />
      <rect x={28} y={46} width={8} height={8} rx={1.5} fill="#7a4b1c" {...stroke} />
      <path d="M28.5 49 H35.5 M28.5 51.5 H35.5" stroke="#d9ad66" strokeWidth={1.1} />
      <ellipse cx={32} cy={57.5} rx={7.5} ry={4.5} fill={url("bronze")} {...stroke} />
      <polygon points={starPoints(32, 57.5, 3.4, 1.4, 8)} fill="#fff1b8" />
      <path d="M27.5 12 Q28.5 8 31 5" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.85} fill="none" />
    </g>
  ),
  amDuong: (
    <g>
      {/* Vòng đồng dày gắn bốn đinh, lòng là âm dương đen trắng. */}
      <circle cx={32} cy={32} r={26} fill={url("bronze")} {...stroke} />
      {[0, 90, 180, 270].map((a) => (
        <circle key={a} cx={32} cy={8.5} r={2} fill="#fff1b8" stroke={INK} strokeWidth={0.9} transform={`rotate(${a + 45} 32 32)`} />
      ))}
      <circle cx={32} cy={32} r={20.5} fill={PAPER} stroke={INK} strokeWidth={1.6} />
      <path d="M32 11.5 A20.5 20.5 0 0 1 32 52.5 A10.25 10.25 0 0 1 32 32 A10.25 10.25 0 0 0 32 11.5 Z" fill="#1d1640" />
      <circle cx={32} cy={21.75} r={3.8} fill="#1d1640" />
      <circle cx={32} cy={42.25} r={3.8} fill="#f3d27a" />
      <path d="M14 22 Q19 12 29 9.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" opacity={0.6} fill="none" />
    </g>
  ),
  banhChung: (
    <g>
      {/* Bánh chưng lá xanh, lạt buộc màu đồng sáng. */}
      <rect x={9} y={9} width={46} height={46} rx={6} fill={url("leaf")} {...stroke} />
      <path d="M13 13 L27 27 M51 13 L37 27 M13 51 L27 37 M51 51 L37 37" stroke="#8fd16a" strokeWidth={1.8} opacity={0.75} />
      <path d="M24.5 9 V55 M39.5 9 V55 M9 24.5 H55 M9 39.5 H55" stroke={INK} strokeWidth={5.2} />
      <path d="M24.5 9 V55 M39.5 9 V55 M9 24.5 H55 M9 39.5 H55" stroke="#f0d28c" strokeWidth={3.2} />
      <rect x={9} y={9} width={46} height={46} rx={6} fill="none" {...stroke} />
      <path d="M13.5 15 Q21 11.5 29 12.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.5} fill="none" />
    </g>
  ),
  tim: (
    <g>
      {/* Trái tim men đỏ nạm trong viền đồng. */}
      <path d="M32 57 C9 43 4 26 11.5 16.5 C18.5 8 28 10.5 32 17.5 C36 10.5 45.5 8 52.5 16.5 C60 26 55 43 32 57 Z" fill={url("bronze")} {...stroke} />
      <path
        d="M32 57 C9 43 4 26 11.5 16.5 C18.5 8 28 10.5 32 17.5 C36 10.5 45.5 8 52.5 16.5 C60 26 55 43 32 57 Z"
        transform="translate(32 34) scale(0.76) translate(-32 -34)"
        fill={url("ruby")}
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M19 22 Q21.5 16.5 27 17" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" opacity={0.85} fill="none" />
      <Glint x={43} y={23} r={4} />
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
      {/* Sách bìa da, góc và khóa bọc đồng. */}
      <path d="M14 9 H51 A2.5 2.5 0 0 1 53.5 11.5 V54 A2.5 2.5 0 0 1 51 56.5 H14 Z" fill="#f4e6c4" {...stroke} />
      <path d="M50 12 V53" stroke="#c9b37e" strokeWidth={1.2} />
      <rect x={10} y={7} width={38} height={47} rx={3} fill={url("leather")} {...stroke} />
      <path d="M17 7 V54" stroke={INK} strokeWidth={1.8} />
      <path d="M10 15 H17 M10 24 H17 M10 37 H17 M10 46 H17" stroke="#f0d49a" strokeWidth={2.2} />
      <rect x={23} y={14} width={19} height={26} rx={2} fill={PAPER} stroke={url("cast")} strokeWidth={2.6} />
      <path d="M28 20 V34 M32.5 20 V30 M37 22 V32" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <path d="M40 7 H48 V15 Z M40 54 H48 V46 Z" fill={url("gold")} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
      <rect x={45} y={27} width={6} height={9} rx={1.5} fill={url("gold")} stroke={INK} strokeWidth={1.3} />
    </g>
  ),
  trong: (
    <g>
      {/* Mặt trống đồng: vành gỉ xanh, vành răng cưa, sao 14 cánh ở tâm. */}
      <circle cx={32} cy={32} r={27} fill={url("bronze")} {...stroke} />
      <circle cx={32} cy={32} r={21.5} fill="none" stroke={url("patina")} strokeWidth={4.5} />
      <circle cx={32} cy={32} r={24} fill="none" stroke="#6e4515" strokeWidth={1.1} />
      <circle cx={32} cy={32} r={19} fill="none" stroke="#6e4515" strokeWidth={1.1} />
      <polygon points={starPoints(32, 32, 16.5, 6, 14)} fill="#fff1b8" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <circle cx={32} cy={32} r={3.6} fill="#c2410c" stroke={INK} strokeWidth={1.1} />
      <path d="M13 21 Q19 11.5 29 9" stroke="#fff6d6" strokeWidth={2.2} strokeLinecap="round" opacity={0.65} fill="none" />
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

/** Bốn góc khung, mỗi góc một miếng đồng chạm hoa văn chữ 回 (vẽ ở góc trên trái rồi xoay). */
function CornerPlates({ fill }: { fill: string }) {
  return (
    <g>
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a} 32 32)`}>
          <path d="M2 14 V8 A6 6 0 0 1 8 2 H14 V7 H7 V14 Z" fill={fill} stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
          <path d="M9.5 12 V9.5 H12" fill="none" stroke={INK} strokeWidth={1.1} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

/** Lưỡi lửa bốc từ đáy ô, ba lớp lồng nhau thu về giữa đáy. */
const FLAME =
  "M5 60 C3 46 8 38 8 28 C13 33 14.5 37 16 40 C15 29 18 19 24 10 C24.5 20 27 25 29 28 C29 19 32 10 36 3 C37.5 13 40 19 42 25 C43 19 46 14 51 10 C49.5 21 52 29 53 34 C55 30 57 28 59 23 C60 36 61 47 59 60 Z";

/** Bản yếu (từ chữ L/T): hào quang vàng như mẫu kiếm đôi: hai dải sáng cuộn quanh vật phẩm, khung mạ vàng. */
function WeakAura() {
  return (
    <g>
      <circle cx={32} cy={32} r={26} fill={url("sun")} opacity={0.55} />
      <path d="M9 46 C11 22 36 6 55 15 M55 18 C53 42 28 58 9 49" fill="none" stroke="#ffb627" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
      <path d="M9 46 C11 22 36 6 55 15 M55 18 C53 42 28 58 9 49" fill="none" stroke="#fff6cf" strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

/** Tia lửa nhỏ quanh hào quang, vẽ đè lên vật phẩm. */
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

/** Bản mạnh (từ thẳng 5): giữ nền màu của loại ô, lửa bốc ba lớp như mẫu kiếm lửa, mặt trời tỏa tia sau vật phẩm. */
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
      {/* Khung đồng mảnh ôm mặt sơn mài; ô đặc biệt dùng đồng mạ vàng sáng hơn. */}
      <rect x={1.5} y={1.5} width={61} height={61} rx={10} fill={url(special ? "gilt" : "cast")} stroke={INK} strokeWidth={1.5} />
      <rect x={4.5} y={4.5} width={55} height={55} rx={7.5} fill={url(`gem-${kind}`)} stroke={INK} strokeWidth={1} />
      {special === "weak" && <WeakAura />}
      {special === "strong" && <StrongFire />}
      {/* Thu vật phẩm vào trong một chút để màu nền vẫn lộ ra đủ nhận loại ô khi nhìn lướt. */}
      <g transform={`translate(32 ${special ? 33 : 32}) scale(${special ? 0.78 : 0.88}) translate(-32 -32)`}>{TILE_GLYPH[kind]}</g>
      {special && <Sparks />}
      <CornerPlates fill={url(special ? "gold" : "cast")} />
    </svg>
  );
}
