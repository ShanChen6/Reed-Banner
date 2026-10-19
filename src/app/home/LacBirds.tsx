// Đàn chim lạc bay vòng quanh phần mở đầu trang giới thiệu, nối đuôi nhau như vành chim trên mặt trống đồng.
// Dáng chim vẽ mới bằng SVG: mỏ dài, cổ cong, mào lông, hai cánh giơ cao xòe ra sau, đuôi dài; mảng vàng phẳng
// với chấm tròn và vạch khắc như hoa văn trống đồng.

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

const NEAR_WING = feathers(72, 104, 44, arc([40, 6], [104, 30], 8, 8), 2.2, 4.6);
const FAR_WING = feathers(64, 94, 44, arc([30, 14], [90, 30], 7, 6), 2, 4);
const TAIL = feathers(44, 46, 50, [[2, 38], [0, 46], [2, 54], [6, 61], [14, 67]], 2, 3.6);
const CREST = feathers(128, 132, 24, [[112, 6], [118, 4], [124, 4]], 1.4, 2.4);
const BODY_DOTS = [50, 58, 66, 74, 82, 90, 98, 106];

/** Một con chim lạc quay đầu sang phải, khung 180×72. Cánh đập bằng CSS (.lac-wing trong globals.css). */
function LacBird({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 180 72" className={className} style={style} aria-hidden focusable="false">
      <g fill="var(--gold)">
        <g className="lac-wing lac-wing-far" opacity={0.5}>
          <path d={FAR_WING} />
        </g>
        <path d={TAIL} />
        {/* Thân, cổ cong, mào, đầu, mỏ dài. */}
        <path d="M40 50 C56 44 90 42 112 43 C118 44 120 49 114 51 C92 56 60 57 40 50 Z" />
        <path d="M108 44 C120 42 128 38 132 30 L140 33 C135 44 126 50 114 51 Z" />
        <path d={CREST} />
        <circle cx={137} cy={28} r={6.5} />
        <path d="M142 25 L179 15 L143 29.5 Z" />
        {/* Chân thu về sau. */}
        <path d="M94 53 L78 62 M100 53 L84 63" stroke="var(--gold)" strokeWidth={2} strokeLinecap="round" />
        {/* Cánh gần: chùm lông dài và mảng lông che ở gốc cánh. */}
        <g className="lac-wing">
          <path d={NEAR_WING} />
          <path d="M66 46 L108 46 C104 38 100 33 94 30 C82 27 70 25 58 22 C60 32 62 40 66 46 Z" />
          <path d="M64 30 C74 32 84 33 96 35 M68 38 C78 39 90 40 102 41" fill="none" stroke="var(--bg)" strokeWidth={1.4} strokeLinecap="round" />
        </g>
      </g>
      {/* Chấm tròn dọc thân, mắt hai vòng. */}
      <g fill="var(--bg)">
        {BODY_DOTS.map((cx) => (
          <circle key={cx} cx={cx} cy={50 - (cx - 50) * 0.05} r={1.6} />
        ))}
        <circle cx={137} cy={28} r={3.4} />
      </g>
      <circle cx={137} cy={28} r={1.6} fill="var(--gold)" />
    </svg>
  );
}

/** Bảy con cùng một vòng bay, cách đều nhau; cỡ và nhịp cánh hơi khác để đàn chim không đều tăm tắp. */
const LAP = 56;
const FLOCK = [
  { size: "w-28 md:w-40", flap: 0.9 },
  { size: "w-24 md:w-32", flap: 0.8 },
  { size: "w-28 md:w-36", flap: 0.85 },
  { size: "w-20 md:w-28", flap: 0.75 },
  { size: "w-28 md:w-40", flap: 0.95 },
  { size: "w-24 md:w-32", flap: 0.8 },
  { size: "w-20 md:w-28", flap: 0.7 },
].map((b, i, all) => ({ ...b, delay: -(LAP * i) / all.length }));

export default function LacBirds() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOCK.map((b, i) => (
        <div
          key={i}
          className="lac-fly absolute left-0 opacity-75"
          style={{ top: `${6 + i * 13}%`, animationDuration: `${LAP}s`, animationDelay: `${b.delay}s` }}
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
