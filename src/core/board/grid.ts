import type { Tile } from "./tiles";

// Hàng 0 ở trên cùng; ô rơi về phía hàng có chỉ số lớn hơn.
export const BOARD_COLS = 12;
export const BOARD_ROWS = 8;

export interface Pos {
  readonly row: number;
  readonly col: number;
}

/** Bàn cờ bất biến; mỗi thao tác trả về bàn mới. */
export interface Board {
  readonly cols: number;
  readonly rows: number;
  /** Lưu theo hàng; null là ô trống đang chờ lấp. */
  readonly cells: readonly (Tile | null)[];
}

export function createBoard(cols: number, rows: number, cells: readonly (Tile | null)[]): Board {
  if (cells.length !== cols * rows) throw new RangeError(`Cần ${cols * rows} ô, nhận ${cells.length}`);
  return { cols, rows, cells: [...cells] };
}

export function inBounds(board: Board, { row, col }: Pos): boolean {
  return row >= 0 && row < board.rows && col >= 0 && col < board.cols;
}

export function indexOf(board: Board, { row, col }: Pos): number {
  return row * board.cols + col;
}

export function posOf(board: Board, index: number): Pos {
  return { row: Math.floor(index / board.cols), col: index % board.cols };
}

export function tileAt(board: Board, pos: Pos): Tile | null {
  if (!inBounds(board, pos)) return null;
  return board.cells[indexOf(board, pos)] ?? null;
}

export function isAdjacent(a: Pos, b: Pos): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

export function swapCells(board: Board, a: Pos, b: Pos): Board {
  const cells = [...board.cells];
  const ia = indexOf(board, a);
  const ib = indexOf(board, b);
  [cells[ia], cells[ib]] = [cells[ib] ?? null, cells[ia] ?? null];
  return { ...board, cells };
}

/** Ô còn lại rơi thẳng xuống trong từng cột, giữ thứ tự; ô trống dồn lên đỉnh. */
export function applyGravity(board: Board): Board {
  const cells: (Tile | null)[] = new Array(board.cells.length).fill(null);
  for (let col = 0; col < board.cols; col++) {
    let target = board.rows - 1;
    for (let row = board.rows - 1; row >= 0; row--) {
      const tile = board.cells[row * board.cols + col];
      if (tile) {
        cells[target * board.cols + col] = tile;
        target--;
      }
    }
  }
  return { ...board, cells };
}
