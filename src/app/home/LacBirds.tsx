// Đàn chim lạc bay vòng quanh mặt trống đồng ở phần mở đầu trang giới thiệu, nối đuôi nhau như vành chim trên trống.
// Dáng chim giữ nét trống đồng (mỏ dài, cổ cong, mào lông tròn đầu, cánh giơ cao, chấm tròn dọc thân) nhưng vẽ theo
// phong cách fantasy của logo và tranh nền hero: lông mạ vàng, lớp lông trong đỏ lửa, đuôi kéo dải lụa đỏ và vệt sáng,
// quầng sáng mờ sau lưng.
// Quầng sáng là dải màu, không dùng filter, để bảy con chim cùng đập cánh vẫn nhẹ.

type Point = readonly [number, number];

/**
 * Một chùm lông: gốc rải đều từ `from` tới `to` trên đường y = `baseY`, ngọn ở `tips`; lông thon ở gốc (`w0`),
 * nở ở ngọn (`w1`) và tròn đầu.
 */
function feathers(from: number, to: number, baseY: number, tips: readonly Point[], w0: number, w1: number): string {
  return tips
    .map(([tx, ty], i) => {
      const bx = from + ((to - from) * i) / (tips.length - 1);
      const len = Math.hypot(tx - bx, ty - baseY);
      const nx = -(ty - baseY) / len;
      const ny = (tx - bx) / len;
      const p = (x: number, y: number, w: number, side: 1 | -1) =>
        `${(x + (side * nx * w) / 2).toFixed(1)} ${(y + (side * ny * w) / 2).toFixed(1)}`;
      return `M${p(bx, baseY, w0, 1)} L${p(tx, ty, w1, 1)} A${w1 / 2} ${w1 / 2} 0 0 0 ${p(tx, ty, w1, -1)} L${p(bx, baseY, w0, -1)} Z`;
    })
    .join(" ");
}

/** Ngọn lông nằm trên một cung võng nhẹ từ `a` tới `b`. */
function arc(a: Point, b: Point, n: number, bulge: number): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - bulge * Math.sin(Math.PI * t)] as const;
  });
}

const NEAR_WING = feathers(80, 116, 46, arc([42, 3], [116, 30], 9, 10), 2.4, 5.4);
const NEAR_WING_INNER = feathers(84, 114, 46, arc([60, 14], [112, 34], 7, 6), 2, 4.4);
const FAR_WING = feathers(70, 102, 46, arc([30, 11], [98, 30], 8, 7), 2, 4.2);
const TAIL = feathers(48, 52, 54, [[8, 36], [3, 46], [4, 57], [10, 67], [20, 75]], 2, 4);
const CREST_TIPS = [[118, 6], [125, 2], [133, 1.5], [141, 4]] as const;
const CREST = feathers(139, 144, 23, CREST_TIPS, 1.4, 3);
const BODY_DOTS = [56, 64, 72, 80, 88, 96, 104, 112];

/** Dải màu dùng chung của mọi con chim, theo hệ tọa độ khung 200×90 của từng con. */
function LacDefs() {
  return (
    <svg width={0} height={0} aria-hidden focusable="false" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="lac-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="80">
          <stop offset="0" stopColor="#fff6cc" />
          <stop offset="0.35" stopColor="#f2c55e" />
          <stop offset="0.7" stopColor="#b77a26" />
          <stop offset="1" stopColor="#f0cf82" />
        </linearGradient>
        <linearGradient id="lac-ember" gradientUnits="userSpaceOnUse" x1="60" y1="10" x2="120" y2="50">
          <stop offset="0" stopColor="#ffcf6b" />
          <stop offset="0.5" stopColor="#e2582b" />
          <stop offset="1" stopColor="#9b1f14" />
        </linearGradient>
        <linearGradient id="lac-trail" gradientUnits="userSpaceOnUse" x1="50" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd77a" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ffd77a" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="lac-ribbon" gradientUnits="userSpaceOnUse" x1="52" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#e0321f" stopOpacity={0.95} />
          <stop offset="0.6" stopColor="#a8141a" stopOpacity={0.6} />
          <stop offset="1" stopColor="#a8141a" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="lac-halo" gradientUnits="userSpaceOnUse" cx="100" cy="44" r="96" gradientTransform="translate(100 44) scale(1 0.45) translate(-100 -44)">
          <stop offset="0" stopColor="#ffcf6b" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#e2582b" stopOpacity={0.12} />
          <stop offset="1" stopColor="#e2582b" stopOpacity={0} />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Một con chim lạc quay đầu sang phải, khung 200×90. Cánh đập bằng CSS (.lac-wing trong globals.css). */
function LacBird({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 90" className={className} style={style} aria-hidden focusable="false">
      <ellipse cx={100} cy={44} rx={98} ry={44} fill="url(#lac-halo)" />
      {/* Hai dải lụa đỏ bay sau đuôi, vệt sáng kéo theo như vệt lửa. */}
      <path d="M50 52 C40 47 30 54 20 50 C12 47 6 51 0 48 L0 53 C7 56 12 52 20 56 C31 60 40 54 50 57 Z" fill="url(#lac-ribbon)" />
      <path d="M48 57 C38 62 30 72 20 72 C12 72 6 78 0 82 L1 86 C8 82 13 77 21 77 C32 77 40 66 50 60 Z" fill="url(#lac-ribbon)" opacity={0.8} />
      <path d="M50 56 C34 60 18 70 2 86 M50 54 C30 52 14 56 0 64 M52 50 C36 44 20 42 4 44" fill="none" stroke="url(#lac-trail)" strokeWidth={2.2} strokeLinecap="round" />
      <g className="lac-wing lac-wing-far" opacity={0.6}>
        <path d={FAR_WING} fill="url(#lac-ember)" />
      </g>
      <g fill="url(#lac-gold)">
        <path d={TAIL} />
        {/* Thân, cổ cong, mào, đầu, mỏ dài. */}
        <path d="M46 54 C62 46 98 44 122 45 C130 46 132 52 124 54 C100 60 64 60 46 54 Z" />
        <path d="M118 46 C130 44 138 39 142 30 L151 33 C146 46 136 52 124 54 Z" />
        <path d={CREST} />
        <circle cx={147} cy={28} r={7} />
        <path d="M152 25 L199 13 L153 31.5 Z" />
        {/* Chân thu về sau. */}
        <path d="M100 57 L84 67 M106 57 L90 68" stroke="url(#lac-gold)" strokeWidth={2} strokeLinecap="round" />
      </g>
      {/* Chấm tròn dọc thân, mắt hai vòng, mào có đầu đỏ. */}
      <g fill="#3a1a0c">
        {BODY_DOTS.map((cx) => (
          <circle key={cx} cx={cx} cy={53 - (cx - 56) * 0.05} r={1.6} />
        ))}
        <circle cx={147} cy={28} r={3.8} />
      </g>
      <circle cx={147} cy={28} r={1.8} fill="#ffe08a" />
      {CREST_TIPS.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={1.7} fill="#e2582b" />
      ))}
      {/* Cánh gần: lông ngoài mạ vàng, lông trong đỏ lửa, mảng che gốc cánh khắc vạch và chấm. */}
      <g className="lac-wing">
        <path d={NEAR_WING} fill="url(#lac-gold)" />
        <path d={NEAR_WING_INNER} fill="url(#lac-ember)" />
        <path d="M70 48 L118 48 C114 40 108 34 100 31 C86 28 74 26 60 22 C62 34 65 42 70 48 Z" fill="url(#lac-gold)" />
        <path d="M66 30 C78 32 88 33 100 35 M70 39 C82 40 94 41 106 42" fill="none" stroke="#3a1a0c" strokeWidth={1.2} strokeLinecap="round" />
        {[72, 80, 88, 96].map((cx) => (
          <circle key={cx} cx={cx} cy={36 + (cx - 72) * 0.05} r={1.3} fill="#3a1a0c" />
        ))}
      </g>
    </svg>
  );
}

/** Bảy con cùng một vòng bay, cách đều nhau; con xa nhỏ và mờ hơn, nhịp cánh hơi khác để đàn chim không đều tăm tắp. */
const LAP = 60;
const FLOCK = [
  { size: "w-36 md:w-60", flap: 0.9, opacity: 1 },
  { size: "w-24 md:w-32", flap: 0.75, opacity: 0.6 },
  { size: "w-32 md:w-48", flap: 0.85, opacity: 0.85 },
  { size: "w-20 md:w-28", flap: 0.7, opacity: 0.55 },
  { size: "w-36 md:w-52", flap: 0.95, opacity: 0.95 },
  { size: "w-24 md:w-36", flap: 0.8, opacity: 0.7 },
  { size: "w-20 md:w-28", flap: 0.7, opacity: 0.5 },
].map((b, i, all) => ({ ...b, delay: -(LAP * i) / all.length }));

export default function LacBirds() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <LacDefs />
      {FLOCK.map((b, i) => (
        <div
          key={i}
          className="lac-fly absolute left-0"
          style={{ top: `${6 + i * 13}%`, opacity: b.opacity, animationDuration: `${LAP}s`, animationDelay: `${b.delay}s` }}
        >
          <LacBird
            className={`lac-bob lac-upright ${b.size}`}
            style={{ "--flap": `${b.flap}s`, animationDuration: `3.2s, ${LAP}s`, animationDelay: `0s, ${b.delay}s` } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}
