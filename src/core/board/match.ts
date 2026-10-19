// Tìm bộ ghép và nước đi hợp lệ, xem docs/design/01-ban-co.md mục 2.

import { indexOf, inBounds, isAdjacent, posOf, swapCells, tileAt, type Board, type Pos } from "./grid";
import { sameKind, type SpecialGrade, type TileKind } from "./tiles";

export type Direction = "row" | "col";

/** line3, line4: thẳng 3–4 ô. lt: chữ L/T (bản yếu). line5: thẳng từ 5 ô (bản mạnh). */
export type MatchShape = "line3" | "line4" | "lt" | "line5";

export interface Run {
  readonly direction: Direction;
  readonly cells: readonly Pos[];
}

export interface MatchGroup {
  readonly kind: TileKind;
  readonly shape: MatchShape;
  /** Các ô của bộ ghép, không trùng, theo thứ tự chỉ số trên bàn. */
  readonly cells: readonly Pos[];
  readonly runs: readonly Run[];
}

export interface Move {
  readonly from: Pos;
  readonly to: Pos;
}

export function findRuns(board: Board): Run[] {
  const runs: Run[] = [];
  const scan = (direction: Direction) => {
    const outer = direction === "row" ? board.rows : board.cols;
    const inner = direction === "row" ? board.cols : board.rows;
    for (let o = 0; o < outer; o++) {
      let start = 0;
      for (let i = 1; i <= inner; i++) {
        const at = (k: number): Pos => (direction === "row" ? { row: o, col: k } : { row: k, col: o });
        if (i < inner && sameKind(tileAt(board, at(i)), tileAt(board, at(start)))) continue;
        if (i - start >= 3 && tileAt(board, at(start))) {
          const cells: Pos[] = [];
          for (let k = start; k < i; k++) cells.push(at(k));
          runs.push({ direction, cells });
        }
        start = i;
      }
    }
  };
  scan("row");
  scan("col");
  return runs;
}

/** Gộp các dãy chung ô thành bộ ghép và phân loại hình dạng. */
export function findMatches(board: Board): MatchGroup[] {
  const runs = findRuns(board);
  const parent = runs.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) i = parent[i] = parent[parent[i]!]!;
    return i;
  };
  const owner = new Map<number, number>();
  runs.forEach((run, r) => {
    for (const pos of run.cells) {
      const idx = indexOf(board, pos);
      const other = owner.get(idx);
      if (other === undefined) owner.set(idx, r);
      else parent[find(r)] = find(other);
    }
  });

  const byRoot = new Map<number, Run[]>();
  runs.forEach((run, r) => {
    const root = find(r);
    byRoot.set(root, [...(byRoot.get(root) ?? []), run]);
  });

  const groups: MatchGroup[] = [];
  for (const groupRuns of byRoot.values()) {
    const indices = new Set<number>();
    for (const run of groupRuns) for (const pos of run.cells) indices.add(indexOf(board, pos));
    const cells = [...indices].sort((a, b) => a - b).map((i) => posOf(board, i));
    const first = groupRuns[0]!.cells[0]!;
    groups.push({ kind: tileAt(board, first)!.kind, shape: classify(groupRuns), cells, runs: groupRuns });
  }
  return groups.sort((a, b) => indexOf(board, a.cells[0]!) - indexOf(board, b.cells[0]!));
}

function classify(runs: readonly Run[]): MatchShape {
  const longest = Math.max(...runs.map((r) => r.cells.length));
  if (longest >= 5) return "line5";
  const both = runs.some((r) => r.direction === "row") && runs.some((r) => r.direction === "col");
  if (both) return "lt";
  return longest === 4 ? "line4" : "line3";
}

export function specialGradeFor(shape: MatchShape): SpecialGrade | undefined {
  if (shape === "line5") return "strong";
  if (shape === "lt") return "weak";
  return undefined;
}

export function grantsExtraTurn(group: MatchGroup): boolean {
  return group.cells.length >= 4;
}

/** Hướng chính của bộ ghép: hướng của dãy dài nhất. */
export function mainDirection(group: MatchGroup): Direction {
  let best = group.runs[0]!;
  for (const run of group.runs) if (run.cells.length > best.cells.length) best = run;
  return best.direction;
}

/** Ô nơi ô đặc biệt xuất hiện khi bộ ghép do cascade: góc chữ L/T, hoặc ô giữa dãy dài nhất. */
export function cascadeSpawnPos(group: MatchGroup): Pos {
  if (group.shape === "lt") {
    const rowCells = new Set(
      group.runs.filter((r) => r.direction === "row").flatMap((r) => r.cells.map((p) => `${p.row},${p.col}`)),
    );
    for (const run of group.runs) {
      if (run.direction !== "col") continue;
      const corner = run.cells.find((p) => rowCells.has(`${p.row},${p.col}`));
      if (corner) return corner;
    }
  }
  let best = group.runs[0]!;
  for (const run of group.runs) if (run.cells.length > best.cells.length) best = run;
  return best.cells[Math.floor(best.cells.length / 2)]!;
}

/** Ô tại pos có nằm trong một dãy từ 3 ô cùng loại không. */
export function hasMatchAt(board: Board, pos: Pos): boolean {
  const tile = tileAt(board, pos);
  if (!tile) return false;
  const count = (dr: number, dc: number) => {
    let n = 0;
    let p = { row: pos.row + dr, col: pos.col + dc };
    while (inBounds(board, p) && sameKind(tileAt(board, p), tile)) {
      n++;
      p = { row: p.row + dr, col: p.col + dc };
    }
    return n;
  };
  return count(0, -1) + count(0, 1) >= 2 || count(-1, 0) + count(1, 0) >= 2;
}

export function isValidMove(board: Board, from: Pos, to: Pos): boolean {
  if (!inBounds(board, from) || !inBounds(board, to) || !isAdjacent(from, to)) return false;
  const a = tileAt(board, from);
  const b = tileAt(board, to);
  if (!a || !b || a.kind === b.kind) return false;
  const swapped = swapCells(board, from, to);
  return hasMatchAt(swapped, from) || hasMatchAt(swapped, to);
}

function* candidateMoves(board: Board): Generator<Move> {
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      const from = { row, col };
      for (const to of [
        { row, col: col + 1 },
        { row: row + 1, col },
      ]) {
        if (isValidMove(board, from, to)) yield { from, to };
      }
    }
  }
}

export function findValidMoves(board: Board): Move[] {
  return [...candidateMoves(board)];
}

export function hasValidMove(board: Board): boolean {
  return !candidateMoves(board).next().done;
}
