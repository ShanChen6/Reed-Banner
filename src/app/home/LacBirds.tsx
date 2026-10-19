// Đàn chim lạc bay ngang phần mở đầu trang giới thiệu. Dáng chim theo lối khắc trên mặt trống đồng:
// mỏ dài, mào lông, đuôi dài vút; vẽ mới hoàn toàn bằng SVG.

const INK = "#2b1d14";

/** Một con chim lạc quay đầu sang phải, khung 120×60. Cánh đập bằng CSS (.lac-wing trong globals.css). */
function LacBird({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const feather = { fill: "none", stroke: "var(--gold)", strokeLinecap: "round" } as const;
  const ink = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden focusable="false">
      {/* Đuôi: ba lông dài vút ra sau. */}
      <path d="M34 39 C22 34 12 36 2 42" {...feather} strokeWidth={3.5} />
      <path d="M34 41 C23 42 13 47 5 56" {...feather} strokeWidth={3.5} />
      <path d="M36 43 C29 47 24 53 21 59" {...feather} strokeWidth={2.8} />
      {/* Cánh xa, mờ hơn để có chiều sâu. */}
      <g className="lac-wing lac-wing-far">
        <path d="M50 33 C53 18 63 8 78 3 C73 13 70 23 69 33 Z" fill="var(--gold)" opacity={0.55} stroke={INK} strokeWidth={1} />
      </g>
      {/* Thân, đầu, mỏ dài. */}
      <path d="M30 40 C42 29 66 26 84 29 C92 31 93 39 85 42 C67 47 45 47 30 40 Z" fill="var(--gold)" {...ink} />
      <circle cx={90} cy={30} r={6} fill="var(--gold)" {...ink} />
      <path d="M95 27.5 L119 35 L95 33 Z" fill="var(--gold)" {...ink} strokeWidth={1.2} />
      <circle cx={91.5} cy={29} r={1.5} fill={INK} />
      {/* Mào lông. */}
      <path d="M87 25 C83 16 77 11 69 8" {...feather} strokeWidth={3} />
      <path d="M90 24 C89 16 85 10 79 5" {...feather} strokeWidth={2.5} />
      {/* Vạch khắc dọc thân. */}
      <path d="M40 39 H78 M48 35.5 h4 M57 34 h4 M66 33.5 h4" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
      {/* Cánh gần. */}
      <g className="lac-wing">
        <path d="M38 35 C42 16 54 4 74 0 C67 11 63 22 61 35 Z" fill="var(--gold)" {...ink} />
        <path d="M45 33 C48 23 54 15 62 9 M51 34 C53 26 58 18 65 12 M56 34 C57 27 60 20 66 15" fill="none" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Mỗi con một độ cao, cỡ, tốc độ và độ trễ riêng để đàn chim không bay đều tăm tắp. */
const FLOCK = [
  { top: "1%", size: "w-28 md:w-36", duration: 24, delay: 0, flap: 0.9, opacity: 0.95 },
  { top: "8%", size: "w-16 md:w-20", duration: 30, delay: -9, flap: 0.75, opacity: 0.6 },
  { top: "44%", size: "w-20 md:w-24", duration: 34, delay: -20, flap: 0.8, opacity: 0.5 },
  { top: "84%", size: "w-24 md:w-28", duration: 27, delay: -14, flap: 0.85, opacity: 0.75 },
  { top: "90%", size: "w-12 md:w-16", duration: 38, delay: -4, flap: 0.65, opacity: 0.45 },
];

export default function LacBirds() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOCK.map((b, i) => (
        <div
          key={i}
          className="lac-fly absolute left-0"
          style={{ top: b.top, opacity: b.opacity, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
        >
          <LacBird className={`lac-bob ${b.size}`} style={{ "--flap": `${b.flap}s` } as React.CSSProperties} />
        </div>
      ))}
    </div>
  );
}
