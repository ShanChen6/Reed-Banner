// Máy đánh cờ vây: phần MCTS của engine Shanverse (src/features/games/go/engine.ts, commit bf8666b), bỏ nhánh mạng KataGo.
// Đồng hồ `now` truyền từ ngoài (src/core không đọc giờ hệ thống); không truyền thì chỉ giới hạn theo số ván thử.

import { KOMI, PASS, WHITE, isOver, scoreArea, type Color, type Mode, type Position } from "./logic";
import { createRng, estimateDead, search, type SearchLimits } from "./mcts";

export type Level = "easy" | "medium" | "hard";

/** Thời gian nghĩ theo độ khó; bàn lớn được nghĩ lâu hơn. */
export function limitsFor(level: Level, size: number, mode: Mode): SearchLimits {
  const scale = size === 9 ? 1 : size === 13 ? 1.5 : 2;
  if (mode === "capture") {
    if (level === "easy") return { playouts: 250, ms: 600 };
    if (level === "medium") return { playouts: 3000, ms: 1200 * scale };
    return { playouts: 25000, ms: 2500 * scale };
  }
  if (level === "easy") return { playouts: 600, ms: 800 };
  if (level === "medium") return { playouts: 5000, ms: 1800 * scale };
  return { playouts: 30000, ms: 3500 * scale };
}

export interface AiMove {
  /** Điểm đặt quân, hoặc PASS. */
  readonly move: number;
  /** Máy xin thua khi thế cờ đã hết hy vọng. */
  readonly resign: boolean;
  readonly winrate: number;
}

/** Bên `color` có đang dẫn điểm không, sau khi bỏ quân chết. */
function isAhead(pos: Position, color: Color, dead: number[]): boolean {
  const score = scoreArea(pos.board, pos.size, dead, KOMI);
  return color === WHITE ? score.white > score.black : score.black > score.white;
}

/** `maxMs`: trần thời gian nghĩ (server đặt để mỗi request đấu sứ quân không kéo quá lâu); không truyền thì theo limitsFor. */
export function chooseMove(pos: Position, level: Level, seed: number, now?: () => number, maxMs?: number): AiMove {
  if (isOver(pos)) return { move: PASS, resign: false, winrate: 0.5 };
  const rng = createRng(seed);
  const me = pos.toPlay;
  // Người chơi vừa bỏ lượt: máy đang dẫn thì bỏ lượt theo để đếm điểm.
  if (pos.mode === "full" && pos.passes === 1 && pos.moveNumber > 10) {
    const dead = estimateDead(pos, rng, 120);
    if (isAhead(pos, me, dead)) return { move: PASS, resign: false, winrate: 0.9 };
  }
  const base = limitsFor(level, pos.size, pos.mode);
  const limits = maxMs !== undefined && base.ms !== undefined ? { ...base, ms: Math.min(base.ms, maxMs) } : base;
  const result = now ? search(pos, limits, rng, now) : search(pos, { playouts: limits.playouts }, rng, () => 0);
  const area = pos.size * pos.size;
  const resign = pos.mode === "full" && result.winrate < 0.04 && result.playouts >= 2000 && pos.moveNumber > area / 2;
  return { move: result.move, resign, winrate: result.winrate };
}

/** Đoán quân chết khi hai bên cùng bỏ lượt (để đếm điểm). Cùng seed cho cùng kết quả. */
export function guessDead(pos: Position, seed: number): number[] {
  return estimateDead(pos, createRng(seed), pos.size === 19 ? 120 : 200);
}
