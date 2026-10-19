// Hiệu ứng trên bàn cờ khi ô đặc biệt được kích hoạt, xem docs/design/01-ban-co.md mục 3.
// Hiệu ứng ngoài bàn cờ (hồi máu, nộ, năng lượng, lương) do lớp trận đấu đọc từ Activation.

import type { Rng } from "../rng";
import { inBounds, posOf, type Board, type Pos } from "./grid";
import type { Direction } from "./match";
import type { Tile, TileKind } from "./tiles";

export interface Activation {
  readonly pos: Pos;
  readonly tile: Tile;
  /** Hướng của bộ ghép kích hoạt ô; ô bị nổ dây chuyền dùng "row". */
  readonly direction: Direction;
}

export interface SpecialEffect {
  /** Ô bị xóa (được thu hoạch). */
  readonly clear: readonly Pos[];
  /** Số ô cần biến thành loại kind; chọn ô sau khi đã biết hết ô bị xóa. */
  readonly transform?: { readonly kind: TileKind; readonly count: number };
}

function cross(board: Board, center: Pos, radius: number): Pos[] {
  const out: Pos[] = [center];
  for (let d = 1; d <= radius; d++) {
    for (const p of [
      { row: center.row - d, col: center.col },
      { row: center.row + d, col: center.col },
      { row: center.row, col: center.col - d },
      { row: center.row, col: center.col + d },
    ]) {
      if (inBounds(board, p)) out.push(p);
    }
  }
  return out;
}

function square(board: Board, center: Pos, radius: number): Pos[] {
  const out: Pos[] = [];
  for (let row = center.row - radius; row <= center.row + radius; row++) {
    for (let col = center.col - radius; col <= center.col + radius; col++) {
      if (inBounds(board, { row, col })) out.push({ row, col });
    }
  }
  return out;
}

function line(board: Board, center: Pos, direction: Direction, halfLength = Infinity): Pos[] {
  const out: Pos[] = [];
  const length = direction === "row" ? board.cols : board.rows;
  const at = center[direction === "row" ? "col" : "row"];
  for (let k = Math.max(0, at - halfLength); k <= Math.min(length - 1, at + halfLength); k++) {
    out.push(direction === "row" ? { row: center.row, col: k } : { row: k, col: center.col });
  }
  return out;
}

/** Loại của một ô ngẫu nhiên chưa bị xóa trên bàn. */
function randomKind(board: Board, cleared: ReadonlySet<number>, rng: Rng): TileKind | undefined {
  const pool: TileKind[] = [];
  board.cells.forEach((tile, i) => {
    if (tile && !cleared.has(i)) pool.push(tile.kind);
  });
  return pool.length > 0 ? pool[rng.int(0, pool.length - 1)] : undefined;
}

function sameKindCells(board: Board, kind: TileKind, cleared: ReadonlySet<number>): Pos[] {
  const out: Pos[] = [];
  board.cells.forEach((tile, i) => {
    if (tile?.kind === kind && !cleared.has(i)) out.push(posOf(board, i));
  });
  return out;
}

function pickRandom<T>(items: T[], count: number, rng: Rng): T[] {
  const pool = [...items];
  const out: T[] = [];
  while (out.length < count && pool.length > 0) out.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]!);
  return out;
}

export function specialEffect(
  board: Board,
  activation: Activation,
  cleared: ReadonlySet<number>,
  rng: Rng,
): SpecialEffect {
  const { pos, tile, direction } = activation;
  const strong = tile.special === "strong";
  switch (tile.kind) {
    case "kiem":
      return { clear: strong ? square(board, pos, 1) : cross(board, pos, 1) };
    case "amDuong":
      return { clear: strong ? line(board, pos, direction) : line(board, pos, "row", 2) };
    case "banhChung":
      return { clear: [], transform: { kind: "banhChung", count: strong ? 4 : 2 } };
    case "vang": {
      const kind = randomKind(board, cleared, rng);
      if (!kind) return { clear: [] };
      const cells = sameKindCells(board, kind, cleared);
      return { clear: strong ? cells : pickRandom(cells, 6, rng) };
    }
    case "sach":
      return { clear: strong ? [...line(board, pos, "row"), ...line(board, pos, "col")] : cross(board, pos, 2) };
    case "tim":
    case "trong":
      return { clear: [] };
  }
}

/** Chọn ô để biến đổi: ô thường, chưa bị xóa, chưa phải loại đích, không phải chỗ sắp sinh ô đặc biệt. */
export function pickTransformTargets(
  board: Board,
  kind: TileKind,
  count: number,
  excluded: ReadonlySet<number>,
  rng: Rng,
): Pos[] {
  const pool: Pos[] = [];
  board.cells.forEach((tile, i) => {
    if (tile && !tile.special && tile.kind !== kind && !excluded.has(i)) pool.push(posOf(board, i));
  });
  return pickRandom(pool, count, rng);
}

