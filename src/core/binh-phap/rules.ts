// Luật đặt quân thuần: không đổi state, không ngẫu nhiên, không đọc giờ.

import type { BoardPiece, Cell, Piece, PlacementCheck, PuzzleState } from "./types";

export const idx = (width: number, row: number, col: number): number => row * width + col;

/** Chỉ số các ô kề 4 hướng (trên, dưới, trái, phải) nằm trong bàn; không tính đường chéo. */
export function neighbors4(width: number, height: number, row: number, col: number): number[] {
  const out: number[] = [];
  if (row > 0) out.push(idx(width, row - 1, col));
  if (row < height - 1) out.push(idx(width, row + 1, col));
  if (col > 0) out.push(idx(width, row, col - 1));
  if (col < width - 1) out.push(idx(width, row, col + 1));
  return out;
}

export function boardIsEmpty(cells: readonly Cell[]): boolean {
  return cells.every((c) => c.piece === null);
}

/** Quân mới khớp một quân kề khi cùng nghề hoặc cùng hệ; Quân Lệnh khớp tất cả. */
export function matches(piece: Piece, neighbor: BoardPiece): boolean {
  if (piece.kind !== "normal" || neighbor.kind === "wild") return true;
  return piece.profession === neighbor.profession || piece.element === neighbor.element;
}

/**
 * Kiểm tra đặt `piece` vào ô (row, col). Thứ tự lý do ổn định: ngoài bàn, ô bị chiếm/ô trống, không kề quân,
 * rồi mới tới sai nghề và hệ (kèm các ô kề cản trở).
 */
export function checkPlacement(state: PuzzleState, piece: Piece, row: number, col: number): PlacementCheck {
  const { width, height, cells } = state;
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || col < 0 || row >= height || col >= width) {
    return { ok: false, reason: "outOfBounds", blockers: [] };
  }
  const target = cells[idx(width, row, col)]!;
  if (piece.kind === "eraser") {
    return target.piece ? { ok: true } : { ok: false, reason: "empty", blockers: [] };
  }
  if (target.piece) return { ok: false, reason: "occupied", blockers: [] };
  if (piece.kind === "wild") return { ok: true };
  if (boardIsEmpty(cells)) return { ok: true };
  const occupied = neighbors4(width, height, row, col).filter((n) => cells[n]!.piece !== null);
  if (occupied.length === 0) return { ok: false, reason: "notAdjacent", blockers: [] };
  const blockers = occupied.filter((n) => !matches(piece, cells[n]!.piece!));
  return blockers.length === 0 ? { ok: true } : { ok: false, reason: "mismatch", blockers };
}

/** Mọi ô đặt được cho quân đang cầm, theo thứ tự hàng rồi cột. */
export function legalPlacements(state: PuzzleState, piece: Piece = state.hand): number[] {
  if (state.phase !== "playing") return [];
  const out: number[] = [];
  for (let row = 0; row < state.height; row++) {
    for (let col = 0; col < state.width; col++) {
      if (checkPlacement(state, piece, row, col).ok) out.push(idx(state.width, row, col));
    }
  }
  return out;
}

/** Hàng và cột đã kín quân, theo thứ tự hàng trước cột, chỉ số tăng dần. */
export function completedLines(cells: readonly Cell[], width: number, height: number): { axis: "row" | "col"; index: number }[] {
  const out: { axis: "row" | "col"; index: number }[] = [];
  for (let r = 0; r < height; r++) {
    let full = true;
    for (let c = 0; c < width && full; c++) full = cells[idx(width, r, c)]!.piece !== null;
    if (full) out.push({ axis: "row", index: r });
  }
  for (let c = 0; c < width; c++) {
    let full = true;
    for (let r = 0; r < height && full; r++) full = cells[idx(width, r, c)]!.piece !== null;
    if (full) out.push({ axis: "col", index: c });
  }
  return out;
}
