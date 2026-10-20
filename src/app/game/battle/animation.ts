import { swapCells, whirlCells, whirlRing, type BattleEvent, type Board, type CascadeStep, type Pos } from "@/core";

/**
 * Hoạt ảnh bàn cờ, dựng hoàn toàn từ sự kiện core trả về (core không biết gì về hoạt ảnh).
 * Mỗi khung là một bàn cờ tĩnh kèm hoạt ảnh của vài ô; dx/dy tính bằng số ô, là chỗ ô xuất phát
 * so với vị trí của nó trên bàn của khung.
 */
export type CellAnimKind = "move" | "fall" | "clear" | "blast" | "pop" | "bounce";

export interface CellAnim {
  readonly kind: CellAnimKind;
  readonly dx: number;
  readonly dy: number;
}

export interface Frame {
  readonly board: Board;
  readonly anims: Readonly<Record<number, CellAnim>>;
  readonly ms: number;
  /** Bậc chuỗi cascade (2 trở lên) để hiện nhãn "Chuỗi ×N". */
  readonly chain?: number;
}

const SWAP_MS = 170;
const WHIRL_MS = 260;
const CLEAR_MS = 260;
const POP_MS = 180;
const SHUFFLE_MS = 360;
const BOUNCE_MS = 300;

const idx = (board: Board, p: Pos) => p.row * board.cols + p.col;

/** Đổi ô không hợp lệ: hai ô lao về phía nhau rồi bật lại chỗ cũ. */
export function bounceFrames(board: Board, from: Pos, to: Pos): Frame[] {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  return [
    {
      board,
      anims: {
        [idx(board, from)]: { kind: "bounce", dx, dy },
        [idx(board, to)]: { kind: "bounce", dx: -dx || 0, dy: -dy || 0 },
      },
      ms: BOUNCE_MS,
    },
  ];
}

/** Ô rơi sau khi xóa, theo đúng cách applyGravity của core dồn ô xuống đáy cột. */
function fallAnims(step: CascadeStep): Record<number, CellAnim> {
  const before = step.boardAfterClear;
  const { rows, cols } = before;
  const anims: Record<number, CellAnim> = {};
  for (let col = 0; col < cols; col++) {
    let target = rows - 1;
    for (let row = rows - 1; row >= 0; row--) {
      if (!before.cells[row * cols + col]) continue;
      if (row !== target) anims[target * cols + col] = { kind: "fall", dx: 0, dy: row - target };
      target--;
    }
    // Ô mới sinh lấp phần trống phía trên, rơi từ ngoài mép bàn vào.
    const spawned = target + 1;
    for (let row = 0; row < spawned; row++) anims[row * cols + col] = { kind: "fall", dx: 0, dy: -spawned };
  }
  return anims;
}

function fallMs(anims: Readonly<Record<number, CellAnim>>): number {
  const far = Math.max(0, ...Object.values(anims).map((a) => Math.abs(a.dy)));
  return Math.min(460, 200 + 35 * far);
}

/** Xóa, (ô đặc biệt mới hiện ra), rồi rơi cho từng bước cascade; pre là bàn trước bước đầu. */
function cascadeFrames(pre: Board, steps: readonly CascadeStep[]): Frame[] {
  const frames: Frame[] = [];
  let board = pre;
  steps.forEach((step, i) => {
    const clear: Record<number, CellAnim> = {};
    for (const p of step.cleared) clear[idx(board, p)] = { kind: "clear", dx: 0, dy: 0 };
    for (const a of step.activations) clear[idx(board, a.pos)] = { kind: "blast", dx: 0, dy: 0 };
    frames.push({ board, anims: clear, ms: CLEAR_MS, ...(i > 0 ? { chain: i + 1 } : {}) });

    const pop: Record<number, CellAnim> = {};
    for (const c of step.created) pop[idx(board, c.pos)] = { kind: "pop", dx: 0, dy: 0 };
    for (const t of step.transformed) pop[idx(board, t.pos)] = { kind: "pop", dx: 0, dy: 0 };
    if (Object.keys(pop).length > 0) frames.push({ board: step.boardAfterClear, anims: pop, ms: POP_MS });

    const fall = fallAnims(step);
    frames.push({ board: step.boardAfter, anims: fall, ms: fallMs(fall) });
    board = step.boardAfter;
  });
  return frames;
}

/**
 * Dựng toàn bộ khung cho chuỗi sự kiện của một lần act hoặc một lượt AI.
 * start là bàn trước khi hành động; các sự kiện không đổi bàn cờ được bỏ qua.
 */
export function eventFrames(start: Board, events: readonly BattleEvent[]): Frame[] {
  const frames: Frame[] = [];
  let board = start;
  for (const e of events) {
    switch (e.type) {
      case "swap": {
        const swapped = swapCells(board, e.from, e.to);
        const dx = e.to.col - e.from.col;
        const dy = e.to.row - e.from.row;
        frames.push({
          board: swapped,
          anims: {
            [idx(board, e.to)]: { kind: "move", dx: -dx || 0, dy: -dy || 0 },
            [idx(board, e.from)]: { kind: "move", dx, dy },
          },
          ms: SWAP_MS,
        });
        frames.push(...cascadeFrames(swapped, e.steps));
        board = e.steps.at(-1)?.boardAfter ?? swapped;
        break;
      }
      case "whirl": {
        const turned = whirlCells(board, e.whirl);
        const ring = whirlRing(e.whirl.center);
        const anims: Record<number, CellAnim> = {};
        ring.forEach((p, k) => {
          const from = ring[(((k - e.whirl.turns) % 8) + 8) % 8]!;
          anims[idx(board, p)] = { kind: "move", dx: from.col - p.col, dy: from.row - p.row };
        });
        frames.push({ board: turned, anims, ms: WHIRL_MS });
        board = turned;
        break;
      }
      case "board": {
        if (e.transformed.length > 0) {
          const anims: Record<number, CellAnim> = {};
          for (const p of e.transformed) anims[idx(e.before, p)] = { kind: "pop", dx: 0, dy: 0 };
          frames.push({ board: e.before, anims, ms: POP_MS + 80 });
        }
        frames.push(...cascadeFrames(e.before, e.steps));
        board = e.steps.at(-1)?.boardAfter ?? e.before;
        break;
      }
      case "shuffle": {
        const anims: Record<number, CellAnim> = {};
        e.board.cells.forEach((_, i) => (anims[i] = { kind: "pop", dx: 0, dy: 0 }));
        frames.push({ board: e.board, anims, ms: SHUFFLE_MS });
        board = e.board;
        break;
      }
      default:
        break;
    }
  }
  return frames;
}
