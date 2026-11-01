// Luật đặt quân thuần: không đổi state, không ngẫu nhiên, không đọc giờ.

import type { BoardPiece, Cell, NormalPiece, Piece, PlacementCheck, PuzzleState } from "./types";

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

/** Số ô chơi được (không phải chướng ngại). */
export function playableCount(cells: readonly Cell[]): number {
  return cells.reduce((n, c) => (c.blocked ? n : n + 1), 0);
}

/** Đường (hàng/cột) ngắn hơn mức này không tính là "kín": tránh dọn miễn phí ở chỗ chỉ còn 1–2 ô trống. */
export const MIN_LINE_CELLS = 3;

export function boardIsEmpty(cells: readonly Cell[]): boolean {
  return cells.every((c) => c.piece === null);
}

/** Hai quân thường khớp khi cùng nghề hoặc cùng hệ. */
export function typesMatch(a: NormalPiece, b: NormalPiece): boolean {
  return a.profession === b.profession || a.element === b.element;
}
/** Khớp cả nghề lẫn hệ (dùng cho điểm cộng thêm). */
export function typesMatchBoth(a: NormalPiece, b: NormalPiece): boolean {
  return a.profession === b.profession && a.element === b.element;
}

/** Quân mới khớp một quân kề khi cùng nghề hoặc cùng hệ; Quân Lệnh và quân dung hợp khớp tất cả. */
export function matches(piece: Piece, neighbor: BoardPiece): boolean {
  if (piece.kind !== "normal" || neighbor.kind !== "normal") return true;
  return typesMatch(piece, neighbor);
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
  if (target.blocked) return { ok: false, reason: "blocked", blockers: [] };
  if (piece.kind === "eraser") {
    return target.piece ? { ok: true } : { ok: false, reason: "empty", blockers: [] };
  }
  if (target.piece) return { ok: false, reason: "occupied", blockers: [] };
  if (piece.kind === "wild") return { ok: true };
  // Quân thường và quân dung hợp cùng luật: sát một quân, khớp từng quân kề (quân dung hợp khớp tất cả).
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
    let free = 0;
    for (let c = 0; c < width && full; c++) {
      const cell = cells[idx(width, r, c)]!;
      if (cell.blocked) continue;
      free += 1;
      full = cell.piece !== null;
    }
    if (full && free >= MIN_LINE_CELLS) out.push({ axis: "row", index: r });
  }
  for (let c = 0; c < width; c++) {
    let full = true;
    let free = 0;
    for (let r = 0; r < height && full; r++) {
      const cell = cells[idx(width, r, c)]!;
      if (cell.blocked) continue;
      free += 1;
      full = cell.piece !== null;
    }
    if (full && free >= MIN_LINE_CELLS) out.push({ axis: "col", index: c });
  }
  return out;
}
