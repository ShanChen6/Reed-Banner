// Mô phỏng phần biết chắc của một nước đi, xem docs/design/10-ai.md.
// Không lấp ô mới và bỏ qua hiệu ứng ngẫu nhiên của ô đặc biệt: AI không được biết luồng ô rơi.

import {
  applyGravity,
  emptyHarvest,
  findMatches,
  indexOf,
  inBounds,
  mainDirection,
  specialGradeFor,
  swapCells,
  type Board,
  type Harvest,
  type MatchGroup,
  type Pos,
} from "../board";

export interface KnownOutcome {
  readonly harvest: Harvest;
  /** Ô kiếm thường / bản yếu / bản mạnh được kích hoạt, theo từng bước để tính hệ số cascade. */
  readonly swordsByStep: readonly number[];
  readonly steps: number;
  readonly extraTurn: boolean;
  readonly specialsCreated: number;
  /** Số ô trống sau mô phỏng, tức số ô mới sẽ rơi xuống (chưa biết loại). */
  readonly unknownCells: number;
  readonly board: Board;
}

const MAX_KNOWN_STEPS = 20;

/** Ô bị xóa thêm do ô đặc biệt, chỉ với hiệu ứng không ngẫu nhiên. */
function deterministicBlast(board: Board, pos: Pos, kind: string, strong: boolean, dir: "row" | "col"): Pos[] {
  const out: Pos[] = [];
  const add = (row: number, col: number) => {
    if (inBounds(board, { row, col })) out.push({ row, col });
  };
  if (kind === "kiem") {
    if (strong) for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) add(pos.row + r, pos.col + c);
    else for (const [r, c] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]] as const) add(pos.row + r, pos.col + c);
  } else if (kind === "amDuong") {
    if (strong && dir === "col") for (let r = 0; r < board.rows; r++) add(r, pos.col);
    else if (strong) for (let c = 0; c < board.cols; c++) add(pos.row, c);
    else for (let c = -2; c <= 2; c++) add(pos.row, pos.col + c);
  } else if (kind === "sach") {
    if (strong) {
      for (let r = 0; r < board.rows; r++) add(r, pos.col);
      for (let c = 0; c < board.cols; c++) add(pos.row, c);
    } else {
      for (let d = -2; d <= 2; d++) {
        add(pos.row + d, pos.col);
        add(pos.row, pos.col + d);
      }
    }
  }
  return out;
}

export function simulateKnown(start: Board, from: Pos, to: Pos): KnownOutcome {
  return simulateFrom(swapCells(start, from, to), [to, from]);
}

/** Chạy cascade biết chắc từ một bàn; moved là ô vừa kéo (nơi sinh ô đặc biệt ở bước đầu). */
export function simulateFrom(initial: Board, moved: readonly Pos[]): KnownOutcome {
  let board = initial;
  const harvest = emptyHarvest();
  const swordsByStep: number[] = [];
  let extraTurn = false;
  let specialsCreated = 0;
  let steps = 0;

  for (; steps < MAX_KNOWN_STEPS; steps++) {
    const matches: MatchGroup[] = findMatches(board);
    if (matches.length === 0) break;
    const cleared = new Set<number>();
    const queue: { pos: Pos; dir: "row" | "col" }[] = [];
    const clear = (pos: Pos, dir: "row" | "col") => {
      const idx = indexOf(board, pos);
      if (cleared.has(idx)) return;
      cleared.add(idx);
      if (board.cells[idx]?.special) queue.push({ pos, dir });
    };
    for (const g of matches) {
      if (g.cells.length >= 4) extraTurn = true;
      for (const p of g.cells) clear(p, mainDirection(g));
    }
    let swords = 0;
    while (queue.length > 0) {
      const { pos, dir } = queue.shift()!;
      const tile = board.cells[indexOf(board, pos)]!;
      if (tile.kind === "kiem") swords += tile.special === "strong" ? 1 : 0.5;
      for (const p of deterministicBlast(board, pos, tile.kind, tile.special === "strong", dir)) clear(p, "row");
    }
    const cells = [...board.cells];
    for (const idx of cleared) {
      const t = cells[idx];
      if (t) {
        harvest[t.kind]++;
        if (t.kind === "kiem") swords++;
      }
      cells[idx] = null;
    }
    for (const g of matches) {
      const grade = specialGradeFor(g.shape);
      if (!grade) continue;
      specialsCreated++;
      const spot = steps === 0 ? moved.find((p) => g.cells.some((c) => c.row === p.row && c.col === p.col)) : undefined;
      const pos = spot ?? g.cells[Math.floor(g.cells.length / 2)]!;
      cells[indexOf(board, pos)] = { kind: g.kind, special: grade };
    }
    swordsByStep.push(swords);
    board = applyGravity({ ...board, cells });
  }

  return {
    harvest,
    swordsByStep,
    steps,
    extraTurn,
    specialsCreated,
    unknownCells: board.cells.filter((c) => c === null).length,
    board,
  };
}
