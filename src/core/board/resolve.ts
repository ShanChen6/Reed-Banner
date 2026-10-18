// Xử lý một nước đổi ô: ghép, kích hoạt ô đặc biệt, rơi, sinh ô, cascade, xáo bàn.
// Xem docs/design/01-ban-co.md mục 2–4.

import type { Rng } from "../rng";
import { applyGravity, indexOf, posOf, swapCells, type Board, type Pos } from "./grid";
import { refill, shuffleBoard } from "./generate";
import {
  cascadeSpawnPos,
  findMatches,
  grantsExtraTurn,
  hasValidMove,
  isValidMove,
  mainDirection,
  specialGradeFor,
  type MatchGroup,
} from "./match";
import { pickTransformTargets, specialEffect, type Activation } from "./specials";
import { TILE_KINDS, type SpawnWeights, type Tile, type TileKind } from "./tiles";

export const MAX_CASCADE_STEPS = 100;

export type Harvest = Record<TileKind, number>;

export function emptyHarvest(): Harvest {
  return Object.fromEntries(TILE_KINDS.map((k) => [k, 0])) as Harvest;
}

export interface CascadeStep {
  readonly matches: readonly MatchGroup[];
  /** Ô đặc biệt được kích hoạt trong bước này, theo thứ tự nổ dây chuyền. */
  readonly activations: readonly Activation[];
  /** Ô bị xóa (gồm cả ô đặc biệt), đã được thu hoạch. */
  readonly cleared: readonly Pos[];
  readonly harvest: Harvest;
  readonly created: readonly { readonly pos: Pos; readonly tile: Tile }[];
  readonly transformed: readonly { readonly pos: Pos; readonly kind: TileKind }[];
  /** Bàn ngay sau khi xóa và sinh ô đặc biệt, trước khi rơi. */
  readonly boardAfterClear: Board;
  /** Bàn sau khi rơi và sinh ô mới. */
  readonly boardAfter: Board;
  readonly spawned: readonly Pos[];
}

export interface MoveResult {
  readonly board: Board;
  readonly steps: readonly CascadeStep[];
  readonly harvest: Harvest;
  /** Mỗi nước đi được tối đa 1 lượt thêm. */
  readonly extraTurn: boolean;
  /** Bàn hết nước đi sau khi xử lý và đã được xáo lại. */
  readonly shuffled: boolean;
}

export type SwapOutcome = { readonly valid: false } | ({ readonly valid: true } & MoveResult);

/** Kéo hai ô kề nhau. Không tạo bộ ghép thì ô bật về chỗ cũ, không tính lượt. */
export function swap(board: Board, from: Pos, to: Pos, rng: Rng, weights: SpawnWeights): SwapOutcome {
  if (!isValidMove(board, from, to)) return { valid: false };
  return { valid: true, ...resolveBoard(swapCells(board, from, to), rng, weights, [to, from]) };
}

/**
 * Chạy cascade tới khi bàn ổn định hoặc đủ MAX_CASCADE_STEPS bước, rồi xáo nếu hết nước đi.
 * moved: các ô người chơi vừa kéo, ưu tiên theo thứ tự; ô đặc biệt của bước đầu xuất hiện tại đó.
 */
export function resolveBoard(board: Board, rng: Rng, weights: SpawnWeights, moved: readonly Pos[] = []): MoveResult {
  const steps: CascadeStep[] = [];
  const total = emptyHarvest();
  let extraTurn = false;
  let current = board;

  for (let i = 0; i < MAX_CASCADE_STEPS; i++) {
    const matches = findMatches(current);
    if (matches.length === 0) break;
    const step = resolveStep(current, matches, rng, weights, i === 0 ? moved : []);
    steps.push(step);
    for (const kind of TILE_KINDS) total[kind] += step.harvest[kind];
    if (matches.some(grantsExtraTurn)) extraTurn = true;
    current = step.boardAfter;
  }

  const shuffled = !hasValidMove(current);
  if (shuffled) current = shuffleBoard(current, rng, weights);
  return { board: current, steps, harvest: total, extraTurn, shuffled };
}

function resolveStep(
  board: Board,
  matches: readonly MatchGroup[],
  rng: Rng,
  weights: SpawnWeights,
  moved: readonly Pos[],
): CascadeStep {
  const cleared = new Set<number>();
  const queue: Activation[] = [];
  const activated = new Set<number>();

  const clear = (pos: Pos, direction: Activation["direction"]) => {
    const idx = indexOf(board, pos);
    if (cleared.has(idx)) return;
    cleared.add(idx);
    const tile = board.cells[idx];
    if (tile?.special && !activated.has(idx)) {
      activated.add(idx);
      queue.push({ pos, tile, direction });
    }
  };

  for (const group of matches) {
    const direction = mainDirection(group);
    for (const pos of group.cells) clear(pos, direction);
  }

  const activations: Activation[] = [];
  const transforms: { kind: TileKind; count: number }[] = [];
  while (queue.length > 0) {
    const activation = queue.shift()!;
    activations.push(activation);
    const effect = specialEffect(board, activation, cleared, rng);
    for (const pos of effect.clear) clear(pos, "row");
    if (effect.transform) transforms.push(effect.transform);
  }

  const created: { pos: Pos; tile: Tile }[] = [];
  const createdAt = new Set<number>();
  for (const group of matches) {
    const special = specialGradeFor(group.shape);
    if (!special) continue;
    const inGroup = (p: Pos) => group.cells.some((c) => c.row === p.row && c.col === p.col);
    const pos = moved.find(inGroup) ?? cascadeSpawnPos(group);
    const idx = indexOf(board, pos);
    if (createdAt.has(idx)) continue;
    createdAt.add(idx);
    created.push({ pos, tile: { kind: group.kind, special } });
  }

  const harvest = emptyHarvest();
  const cells = [...board.cells];
  for (const idx of cleared) {
    const tile = cells[idx];
    if (tile) harvest[tile.kind]++;
    cells[idx] = null;
  }
  for (const { pos, tile } of created) cells[indexOf(board, pos)] = tile;

  const transformed: { pos: Pos; kind: TileKind }[] = [];
  const afterClear: Board = { ...board, cells };
  const excluded = new Set([...cleared, ...createdAt]);
  for (const { kind, count } of transforms) {
    for (const pos of pickTransformTargets(afterClear, kind, count, excluded, rng)) {
      const idx = indexOf(board, pos);
      cells[idx] = { kind };
      excluded.add(idx);
      transformed.push({ pos, kind });
    }
  }

  const boardAfterClear: Board = { ...board, cells: [...cells] };
  const filled = refill(applyGravity(boardAfterClear), rng, weights);
  return {
    matches,
    activations,
    cleared: [...cleared].sort((a, b) => a - b).map((i) => posOf(board, i)),
    harvest,
    created,
    transformed,
    boardAfterClear,
    boardAfter: filled.board,
    spawned: filled.spawned,
  };
}
