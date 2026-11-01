// Quân và chướng ngại vẽ trên sa bàn Trận Đồ: con cờ chân dung tròn kèm hai huy hiệu, quân đặc biệt, bốn kiểu chướng ngại.

import type { BoardPiece, Piece } from "@/core/binh-phap";
import { FUSION_CHARACTERS } from "@/core/binh-phap";
import { companionById } from "@/core/roster/roster";
import { ElementIcon, ELEMENT_COLOR, ProfessionIcon } from "../art/icons";
import { Portrait } from "../art/portraits";
import { ELEMENT_NAME, PROFESSION_NAME } from "../battle/labels";

export const nameOf = (id: string) => FUSION_CHARACTERS.find((f) => f.characterId === id)?.name ?? companionById(id)?.name ?? "Tướng";

export function pieceLabel(p: Piece): string {
  if (p.kind === "wild") return "Quân Lệnh";
  if (p.kind === "eraser") return "Thu Hồi";
  if (p.kind === "fusion") return `${nameOf(p.characterId)}, dung hợp mọi nghề và mọi hệ`;
  return `${nameOf(p.characterId)}, ${PROFESSION_NAME[p.profession]}, hệ ${ELEMENT_NAME[p.element]}`;
}

/** Huy hiệu tròn nhỏ (nghề hoặc hệ) ở đáy con cờ; kích thước theo ô nhưng không nhỏ hơn 11px để còn đọc được. */
const BADGE = "absolute bottom-[3%] flex aspect-square w-[27%] min-w-[11px] items-center justify-center rounded-full border border-[#E4CC99]/70";

/**
 * Quân trên sa bàn: chân dung tròn như một con cờ đặt lên bản đồ. Huy hiệu nghề (đáy phải, nền tối) và hệ (đáy trái, nền
 * theo màu hệ) đủ cả hai nhưng nhỏ vừa đủ. Tên nghề và hệ vẫn có ở nhãn truy cập của ô và ở khung "Quân đang cầm".
 */
export function PieceFace({ piece, large = false }: { piece: Piece | BoardPiece; large?: boolean }) {
  if (piece.kind === "wild") return <span className="fm-token block size-full"><Glyph kind="wild" /></span>;
  if (piece.kind === "eraser") return <span className="fm-token block size-full"><Glyph kind="eraser" /></span>;
  const badge = large ? `${BADGE} w-[24%]` : BADGE;
  if (piece.kind === "fusion") {
    // Dung hợp (đủ 8 nghề, 7 hệ): một huy hiệu sao đỏ ở giữa đáy thay cho hai huy hiệu.
    return (
      <span className="fm-token relative block size-full p-[6%]">
        <Portrait id={piece.characterId} element="kim" profession="tuongSi" className="size-full" />
        <span className={`${badge} left-1/2 -translate-x-1/2 border-[#E8C477] bg-[#8F241D] text-[#FFE9B0]`} aria-hidden>
          <svg viewBox="0 0 24 24" className="size-[70%]" fill="currentColor"><path d="M12 2.5l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 16.3 6.4 19.6l1.5-6.3L3 9.1l6.4-.6z" /></svg>
        </span>
      </span>
    );
  }
  return (
    <span className="fm-token relative block size-full p-[6%]">
      <Portrait id={piece.characterId} element={piece.element} profession={piece.profession} className="size-full" />
      <span className={`${badge} left-[3%]`} style={{ background: ELEMENT_COLOR[piece.element] }} aria-hidden>
        <ElementIcon element={piece.element} className="size-[78%]" />
      </span>
      <span className={`${badge} right-[3%] bg-[#2B1F15] text-[#E4CC99]`} aria-hidden>
        <ProfessionIcon profession={piece.profession} className="size-[76%]" />
      </span>
    </span>
  );
}

/** Bốn kiểu chướng ngại (núi, rừng, đầm lầy, thành lũy): chỉ khác hình, cùng luật không đặt quân được. */
export const OBSTACLE_KINDS = ["nui", "rung", "damLay", "thanhLuy"] as const;
export type ObstacleKind = (typeof OBSTACLE_KINDS)[number];

/** Kiểu chướng ngại của một ô: theo vị trí, như nhau với mọi người chơi cùng bàn. */
export const obstacleKind = (cellIndex: number): ObstacleKind => OBSTACLE_KINDS[(Math.imul(cellIndex + 1, 2654435761) >>> 7) % OBSTACLE_KINDS.length]!;

const OBSTACLE_LABEL: Record<ObstacleKind, string> = { nui: "núi", rung: "rừng", damLay: "đầm lầy", thanhLuy: "thành lũy" };
export const obstacleLabel = (k: ObstacleKind) => OBSTACLE_LABEL[k];

/**
 * Chướng ngại vẽ bằng SVG (ảnh giữ chỗ, sẽ thay bằng icon vẽ tay), nền ô riêng không lấy ảnh bản đồ. Mỗi kiểu có nét riêng:
 * núi (đỉnh nhọn có tuyết), rừng (cụm cây tán tròn), đầm lầy (mặt nước gợn và cỏ lau), thành lũy (tường có lỗ châu mai và cổng).
 */
export function Obstacle({ kind }: { kind: ObstacleKind }) {
  const common = "fm-obstacle block size-full p-[10%] drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]";
  return (
    <svg viewBox="0 0 48 48" className={common} aria-hidden focusable="false">
      {kind === "nui" && (
        <>
          <path d="M3 39 L15 15 L22 26 L30 8 L45 39 Z" fill="#4c4033" stroke="#120d09" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M30 8 L36 22 L31 19 L27 25 Z" fill="#d8cdb6" />
          <path d="M15 15 L19 23 L16 21 L12 27 Z" fill="#d8cdb6" opacity={0.85} />
          <path d="M3 39 H45" stroke="#120d09" strokeWidth={1.6} />
        </>
      )}
      {kind === "rung" && (
        <>
          <path d="M8 40 H40" stroke="#120d09" strokeWidth={1.6} strokeLinecap="round" />
          {[[14, 27, 8], [26, 22, 10], [35, 29, 7]].map(([x, y, r]) => (
            <g key={x}>
              <rect x={x! - 1.2} y={y! + r! - 2} width={2.4} height={40 - y! - r! + 2} fill="#2e2118" />
              <circle cx={x} cy={y} r={r} fill="#3f6b3a" stroke="#120d09" strokeWidth={1.4} />
              <circle cx={x! - r! / 3} cy={y! - r! / 3} r={r! / 3} fill="#6a9a5c" opacity={0.7} />
            </g>
          ))}
        </>
      )}
      {kind === "damLay" && (
        <>
          <ellipse cx={24} cy={31} rx={19} ry={9} fill="#2f5a62" stroke="#120d09" strokeWidth={1.6} />
          <path d="M11 30 q4 -3 8 0 M24 34 q4 -3 8 0 M17 27 q3 -2 6 0" fill="none" stroke="#9fd0d0" strokeWidth={1.3} strokeLinecap="round" />
          {[[34, 24], [38, 27], [10, 25]].map(([x, y]) => (
            <g key={x} stroke="#5a4a22" strokeWidth={1.4} strokeLinecap="round" fill="none">
              <path d={`M${x} ${y! + 6} V${y! - 7}`} />
              <ellipse cx={x} cy={y! - 8} rx={1.6} ry={3.4} fill="#7a5f2c" />
            </g>
          ))}
        </>
      )}
      {kind === "thanhLuy" && (
        <>
          <path d="M5 41 V19 h5 v-4 h5 v4 h4 v-4 h5 v4 h4 v-4 h5 v4 h5 v22 Z" fill="#6a5d4b" stroke="#120d09" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M19 41 V29 a5 5 0 0 1 10 0 V41 Z" fill="#1d1510" stroke="#120d09" strokeWidth={1.4} />
          <path d="M9 24 H15 M34 24 H40 M9 31 H15 M34 31 H40" stroke="#120d09" strokeWidth={1.1} opacity={0.6} />
        </>
      )}
    </svg>
  );
}

export function Glyph({ kind }: { kind: "wild" | "eraser" }) {
  return (
    <svg viewBox="0 0 48 48" className="size-full p-1" aria-hidden focusable="false" fill="none" stroke="#8F241D" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      {kind === "wild" ? (
        <>
          <circle cx={24} cy={24} r={16} fill="#C9A25A" stroke="#2B1F15" />
          <circle cx={24} cy={24} r={10} stroke="#2B1F15" />
          <path d="M24 12 V36 M12 24 H36" />
        </>
      ) : (
        <>
          <path d="M14 30 L28 12 L38 20 L26 36 H16 Z" fill="#E4CC99" stroke="#2B1F15" />
          <path d="M20 30 L32 16" />
          <path d="M10 40 H38" stroke="#2B1F15" />
        </>
      )}
    </svg>
  );
}
