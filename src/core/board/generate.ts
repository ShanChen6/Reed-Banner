// Sinh bàn khởi đầu, sinh ô rơi và xáo bàn, xem docs/01-gameplay/ban-co.md mục 4.

import type { Rng } from "../rng";
import { BOARD_COLS, BOARD_ROWS, createBoard, indexOf, posOf, type Board, type Pos } from "./grid";
import { hasMatchAt, hasValidMove, findMatches } from "./match";
import { TILE_KINDS, validateWeights, type SpawnWeights, type Tile, type TileKind } from "./tiles";

const MAX_ATTEMPTS = 1000;

export function pickKind(rng: Rng, weights: SpawnWeights, allowed: readonly TileKind[] = TILE_KINDS): TileKind {
  let total = 0;
  for (const kind of allowed) total += weights[kind];
  let roll = rng.next() * total;
  for (const kind of allowed) {
    roll -= weights[kind];
    if (roll < 0) return kind;
  }
  return allowed[allowed.length - 1]!;
}

/** Đặt một ô thường vào pos sao cho không tạo bộ 3 với các ô đã có. */
function placeWithoutMatch(cells: (Tile | null)[], board: Board, pos: Pos, rng: Rng, weights: SpawnWeights): void {
  const idx = indexOf(board, pos);
  const allowed = TILE_KINDS.filter((kind) => {
    cells[idx] = { kind };
    return !hasMatchAt({ ...board, cells }, pos);
  });
  cells[idx] = { kind: pickKind(rng, weights, allowed.length > 0 ? allowed : TILE_KINDS) };
}

/** Bàn khởi đầu: không có bộ ghép sẵn và có ít nhất một nước đi hợp lệ. */
export function generateBoard(
  rng: Rng,
  weights: SpawnWeights,
  cols: number = BOARD_COLS,
  rows: number = BOARD_ROWS,
): Board {
  validateWeights(weights);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const cells: (Tile | null)[] = new Array(cols * rows).fill(null);
    const board = createBoard(cols, rows, cells);
    for (let i = 0; i < cells.length; i++) placeWithoutMatch(cells, board, posOf(board, i), rng, weights);
    const result = createBoard(cols, rows, cells);
    if (hasValidMove(result)) return result;
  }
  throw new Error("Không sinh được bàn có nước đi hợp lệ");
}

/** Lấp mọi ô trống bằng ô thường ngẫu nhiên thuần theo trọng số; được phép tạo cascade. */
export function refill(board: Board, rng: Rng, weights: SpawnWeights): { board: Board; spawned: Pos[] } {
  const cells = [...board.cells];
  const spawned: Pos[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) continue;
    cells[i] = { kind: pickKind(rng, weights) };
    spawned.push(posOf(board, i));
  }
  return { board: { ...board, cells }, spawned };
}

/**
 * Xáo các ô thường, giữ nguyên ô đặc biệt. Bàn sau khi xáo có nước đi hợp lệ và không có bộ ghép sẵn.
 * Nếu hoán vị mãi không đạt, sinh lại các ô thường (vẫn giữ ô đặc biệt).
 */
export function shuffleBoard(board: Board, rng: Rng, weights: SpawnWeights): Board {
  const normal: number[] = [];
  board.cells.forEach((tile, i) => {
    if (tile && !tile.special) normal.push(i);
  });
  const kinds = normal.map((i) => board.cells[i]!);

  for (let attempt = 0; attempt < 100; attempt++) {
    for (let i = kinds.length - 1; i > 0; i--) {
      const j = rng.int(0, i);
      [kinds[i], kinds[j]] = [kinds[j]!, kinds[i]!];
    }
    const cells = [...board.cells];
    normal.forEach((idx, k) => (cells[idx] = kinds[k]!));
    const result = { ...board, cells };
    if (findMatches(result).length === 0 && hasValidMove(result)) return result;
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const cells = [...board.cells];
    for (const idx of normal) cells[idx] = null;
    for (const idx of normal) placeWithoutMatch(cells, board, posOf(board, idx), rng, weights);
    const result = { ...board, cells };
    if (findMatches(result).length === 0 && hasValidMove(result)) return result;
  }
  throw new Error("Không xáo được bàn có nước đi hợp lệ");
}
