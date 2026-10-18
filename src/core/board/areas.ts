// Vùng phá ô của kỹ năng, xem docs/design/12-ky-nang-nhan-vat-chinh.md mục 1.2.

import type { Rng } from "../rng";
import { posOf, type Board, type Pos } from "./grid";

/**
 * Vùng vuông size×size. Kích thước lẻ lấy ô chạm làm tâm, kích thước chẵn lấy ô chạm làm góc trên trái.
 * Vùng tràn ra ngoài bàn thì tự dịch vào trong.
 */
export function squareArea(board: Board, anchor: Pos, size: number): Pos[] {
  const offset = size % 2 === 1 ? Math.floor(size / 2) : 0;
  const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max - size));
  const top = clamp(anchor.row - offset, board.rows);
  const left = clamp(anchor.col - offset, board.cols);
  const out: Pos[] = [];
  for (let row = top; row < top + size; row++) {
    for (let col = left; col < left + size; col++) out.push({ row, col });
  }
  return out;
}

/** `count` ô ngẫu nhiên không trùng, chọn bằng luồng ngẫu nhiên của bàn cờ. */
export function randomCells(board: Board, count: number, rng: Rng): Pos[] {
  const pool = board.cells.map((_, i) => i);
  const out: Pos[] = [];
  while (out.length < count && pool.length > 0) out.push(posOf(board, pool.splice(rng.int(0, pool.length - 1), 1)[0]!));
  return out;
}
