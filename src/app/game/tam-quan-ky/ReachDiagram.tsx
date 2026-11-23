// Hình tầm đi của một quân Tam Quân Kỳ cho thẻ Hướng dẫn: quân đứng giữa lưới 9×9, chấm là chỗ đi tới khi đường trống,
// vòng đỏ là chỗ ăn hoặc bắn được, ô xanh nhạt là vùng cấm bay quân ấy tạo ra. Số liệu đọc thẳng từ luật (pieceSpec) nên
// sửa luật thì hình tự đổi. Vẽ quân thường, chưa thành anh hùng.

import { pieceSpec, type PieceType } from "@/core/tam-quan-ky";
import { pieceArt } from "./parts";
import { PIECE_NAME } from "./pieces";

const N = 9;
const C = 4;
const ORTHOGONAL = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
const DIAGONAL = [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const;

/** Vùng cấm bay: Nỏ thủ và Chiến thuyền một vòng quanh mình, Hỏa tiễn hai ô thẳng và một ô chéo (khớp airDefence). */
function inAirDefence(type: PieceType, df: number, dr: number): boolean {
  if (type === "s") return Math.abs(df) + Math.abs(dr) <= 2;
  if (type === "g" || type === "n") return Math.max(Math.abs(df), Math.abs(dr)) <= 1;
  return false;
}

export function ReachDiagram({ type, className = "size-24" }: { type: PieceType; className?: string }) {
  const spec = pieceSpec(type);
  const walk = new Set<string>();
  const hit = new Set<string>();
  for (const diagonal of [false, true]) {
    const move = diagonal ? Math.min(spec.diagonal, spec.move) : spec.move;
    const capture = diagonal ? Math.min(spec.diagonal, spec.capture) : spec.capture;
    for (const [df, dr] of diagonal ? DIAGONAL : ORTHOGONAL) {
      for (let k = 1; k <= C; k++) {
        const key = `${C + df * k},${C + dr * k}`;
        if (k <= move) walk.add(key);
        if (k <= capture) hit.add(key);
      }
    }
  }
  const cells = Array.from({ length: N * N }, (_, i) => [i % N, Math.floor(i / N)] as const);
  return (
    <svg viewBox={`-0.9 -0.9 ${N + 0.8} ${N + 0.8}`} className={className} role="img" aria-label={`Tầm đi của ${PIECE_NAME[type]}`}>
      <rect x={-0.9} y={-0.9} width={N + 0.8} height={N + 0.8} rx={0.5} fill="var(--wood-inset, #2a1d12)" />
      {cells.map(([x, y]) =>
        inAirDefence(type, x - C, y - C) && !(x === C && y === C) ? (
          <rect key={`z${x},${y}`} x={x - 0.5} y={y - 0.5} width={1} height={1} fill="var(--tqk-blue)" opacity={0.75} />
        ) : null,
      )}
      <g stroke="var(--frame-line, #6b5236)" strokeWidth={0.05}>
        {Array.from({ length: N }, (_, i) => (
          <g key={i}>
            <line x1={0} y1={i} x2={N - 1} y2={i} />
            <line x1={i} y1={0} x2={i} y2={N - 1} />
          </g>
        ))}
      </g>
      {cells.map(([x, y]) => {
        const key = `${x},${y}`;
        return (
          <g key={key}>
            {walk.has(key) && <circle cx={x} cy={y} r={0.22} fill="var(--jade)" />}
            {hit.has(key) && <circle cx={x} cy={y} r={0.38} fill="none" stroke="var(--lacquer-hi)" strokeWidth={0.1} />}
          </g>
        );
      })}
      {/* Chủ tướng đi bao xa cũng được: mũi tên chỉ đường đi tiếp ra mép. */}
      {spec.move > C &&
        ORTHOGONAL.map(([df, dr]) => (
          <path
            key={`${df},${dr}`}
            d={`M ${C + df * 4.3 - dr * 0.25} ${C + dr * 4.3 - df * 0.25} L ${C + df * 4.65} ${C + dr * 4.65} L ${C + df * 4.3 + dr * 0.25} ${C + dr * 4.3 + df * 0.25}`}
            fill="none"
            stroke="var(--jade)"
            strokeWidth={0.12}
          />
        ))}
      <image href={pieceArt(type)} x={C - 0.6} y={C - 0.6} width={1.2} height={1.2} />
    </svg>
  );
}
