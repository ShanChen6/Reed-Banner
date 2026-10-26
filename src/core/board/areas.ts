// Vùng phá ô của kỹ năng, xem docs/03-characters/ky-nang/preset-ai-he-cu.md mục 1.2.

import type { Rng } from "../rng";
import { posOf, type Board, type Pos } from "./grid";

/** Hình vùng phá ô do người chơi chạm, xem bảng ký hiệu ở mục 1.2. */
export type AreaShape =
  /** Vuông size×size. */
  | { readonly square: number }
  /** Chữ nhật cols×rows quanh tâm (5×3). */
  | { readonly rect: readonly [cols: number, rows: number] }
  /** Chữ thập nhỏ (tâm + 4 ô kề) hoặc lớn (cả hàng + cả cột qua tâm). */
  | { readonly cross: "small" | "big" }
  /** Chữ X lớn: tâm + 2 ô mỗi hướng chéo. */
  | { readonly diagonal: 2 }
  /** Đoạn thẳng ngang `line` ô bắt đầu từ ô chạm. */
  | { readonly line: number }
  /** `columns` cột liền nhau bắt đầu từ cột chạm. */
  | { readonly columns: number };

/**
 * Hình chữ nhật cols×rows. Kích thước lẻ lấy ô chạm làm tâm, kích thước chẵn lấy ô chạm làm góc trên trái.
 * Vùng tràn ra ngoài bàn thì tự dịch vào trong.
 */
function rectArea(board: Board, anchor: Pos, cols: number, rows: number): Pos[] {
  const offset = (size: number) => (size % 2 === 1 ? Math.floor(size / 2) : 0);
  const clamp = (v: number, size: number, max: number) => Math.max(0, Math.min(v, max - size));
  const top = clamp(anchor.row - offset(rows), rows, board.rows);
  const left = clamp(anchor.col - offset(cols), cols, board.cols);
  const out: Pos[] = [];
  for (let row = top; row < top + rows; row++) {
    for (let col = left; col < left + cols; col++) out.push({ row, col });
  }
  return out;
}

/** Vùng vuông size×size, xem rectArea. */
export function squareArea(board: Board, anchor: Pos, size: number): Pos[] {
  return rectArea(board, anchor, size, size);
}

/** Các ô của một hình vùng quanh ô chạm, không trùng, không ra ngoài bàn. */
export function areaCells(board: Board, anchor: Pos, shape: AreaShape): Pos[] {
  if ("square" in shape) return squareArea(board, anchor, shape.square);
  if ("rect" in shape) return rectArea(board, anchor, shape.rect[0], shape.rect[1]);
  if ("line" in shape) return rectArea(board, { row: anchor.row, col: anchor.col }, shape.line, 1);
  if ("columns" in shape) {
    const left = Math.max(0, Math.min(anchor.col, board.cols - shape.columns));
    return rectArea(board, { row: 0, col: left }, shape.columns, board.rows);
  }
  const out: Pos[] = [];
  const seen = new Set<number>();
  const add = (row: number, col: number) => {
    if (row < 0 || col < 0 || row >= board.rows || col >= board.cols || seen.has(row * board.cols + col)) return;
    seen.add(row * board.cols + col);
    out.push({ row, col });
  };
  const { row, col } = anchor;
  if ("cross" in shape) {
    add(row, col);
    if (shape.cross === "small") for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) add(row + dr, col + dc);
    else {
      for (let c = 0; c < board.cols; c++) add(row, c);
      for (let r = 0; r < board.rows; r++) add(r, col);
    }
    return out;
  }
  add(row, col);
  for (let d = 1; d <= shape.diagonal; d++) {
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) add(row + dr * d, col + dc * d);
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
