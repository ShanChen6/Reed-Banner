// Đàn chim lạc bay ngang phần mở đầu trang giới thiệu. Dáng chim theo lối khắc nổi trên trống đồng Đông Sơn:
// thân dài, cổ cong, mỏ dài, mào và cánh đuôi dạng răng lược, chấm tròn dọc thân; vẽ mới bằng SVG.

/** Hàng răng lược: `n` răng rộng `w`, cách nhau `step`, nghiêng `slant` theo trục x, nối bằng một thanh ngang. */
function Comb({ x, n, step, w, top, bottom, slant, bar }: {
  x: number;
  n: number;
  step: number;
  w: number;
  top: number;
  bottom: number;
  slant: number;
  bar: [y: number, height: number];
}) {
  const teeth = Array.from({ length: n }, (_, i) => {
    const x0 = x + i * step;
    return `M${x0} ${bottom} L${x0 + slant} ${top} L${x0 + slant + w} ${top} L${x0 + w} ${bottom} Z`;
  });
  return (
    <>
      <path d={teeth.join(" ")} />
      <rect x={x} y={bar[0]} width={(n - 1) * step + w} height={bar[1]} />
    </>
  );
}

const BODY_DOTS = [32, 39, 46, 53, 60, 67, 74, 81, 88, 95].map((cx) => [cx, 33] as const);
const NECK_DOTS = [[106, 33], [112, 31], [117, 28], [121, 23]] as const;

/** Một con chim lạc quay đầu sang phải, khung 180×64. Cánh đập bằng CSS (.lac-wing trong globals.css). */
function LacBird({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const hole = "var(--bg)";
  return (
    <svg viewBox="0 0 180 64" className={className} style={style} aria-hidden focusable="false">
      <g fill="var(--gold)">
        {/* Đuôi. */}
        <Comb x={4} n={6} step={4} w={2.4} top={24} bottom={42} slant={-3} bar={[29, 8]} />
        {/* Thân, cổ cong, đầu, mỏ dài. */}
        <path d="M26 29 L100 28 C104 28 106 30 105 33 L100 37 L26 37 Z" />
        <path d="M98 29 C110 28 118 24 124 16 L132 19 C126 30 116 36 102 37 Z" />
        <circle cx={130} cy={14} r={6.5} />
        <path d="M135 11 C150 13 165 16 179 21 C165 19 150 17.5 135 17 Z" />
        {/* Mào. */}
        <Comb x={112} n={5} step={3.2} w={1.9} top={1} bottom={12} slant={-8} bar={[10, 3.5]} />
        {/* Chân thu về sau. */}
        <path d="M90 37 L84 47 L86.5 47 L93 37 Z M96 37 L90 47 L92.5 47 L99 37 Z" />
        {/* Cánh trên và cánh dưới. */}
        <g className="lac-wing lac-wing-up">
          <Comb x={52} n={9} step={4.2} w={2.6} top={2} bottom={29} slant={-10} bar={[24, 6]} />
        </g>
        <g className="lac-wing lac-wing-down">
          <Comb x={48} n={7} step={4.2} w={2.6} top={58} bottom={37} slant={-10} bar={[36, 5]} />
        </g>
      </g>
      {/* Chấm tròn dọc thân và cổ, mắt hai vòng. */}
      <g fill={hole}>
        {[...BODY_DOTS, ...NECK_DOTS].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={cx < 100 ? 1.5 : 1.3} />
        ))}
        <circle cx={130} cy={14} r={3.4} />
      </g>
      <circle cx={130} cy={14} r={1.6} fill="var(--gold)" />
    </svg>
  );
}

/** Mỗi con một độ cao, cỡ, tốc độ và độ trễ riêng để đàn chim không bay đều tăm tắp. */
const FLOCK = [
  { top: "4%", size: "w-36 md:w-48", duration: 24, delay: 0, flap: 0.9, opacity: 0.95 },
  { top: "8%", size: "w-20 md:w-28", duration: 30, delay: -9, flap: 0.75, opacity: 0.6 },
  { top: "44%", size: "w-24 md:w-32", duration: 34, delay: -20, flap: 0.8, opacity: 0.5 },
  { top: "84%", size: "w-28 md:w-40", duration: 27, delay: -14, flap: 0.85, opacity: 0.75 },
  { top: "90%", size: "w-16 md:w-20", duration: 38, delay: -4, flap: 0.65, opacity: 0.45 },
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
