// Sinh mê cung Sử Lộ theo seed: đồ thị ô trên lưới, có ngã rẽ, ngõ cụt, vòng lặp và lối tắt khóa.
// Luật ở docs/02-game-modes/su-lo/gdd.md mục 3–4. Logic thuần, mọi ngẫu nhiên qua src/core/rng.ts.

import { createRng, type Rng } from "../rng";
import type { SlDifficulty, SlEra } from "./questions";

export type SlLevel = "de" | "thuong" | "kho";
export const SL_LEVEL_ORDER: readonly SlLevel[] = ["de", "thuong", "kho"];

export type SlTrap = "phucBinh" | "cocNgam" | "nuocLu" | "lacLoi" | "thichKhach" | "dotCau";
export type SlLuck = "nguaChien" | "tramNgua" | "matThu" | "trinhSat" | "suQuan";

export type SlCell =
  | { readonly kind: "start" }
  | { readonly kind: "exit" }
  | { readonly kind: "boss" }
  | { readonly kind: "question"; readonly difficulty: SlDifficulty }
  | { readonly kind: "trap"; readonly trap: SlTrap; readonly hidden: boolean }
  | { readonly kind: "luck"; readonly luck: SlLuck }
  | { readonly kind: "stele" }
  | { readonly kind: "gate" };

export interface SlEdge {
  readonly a: number;
  readonly b: number;
  /** Lối tắt khóa: mở bằng Mật thư hoặc trả lời đúng câu Đỏ ở ô kề. */
  readonly locked: boolean;
}

export interface SlMaze {
  readonly cols: number;
  readonly rows: number;
  readonly cells: readonly SlCell[];
  readonly edges: readonly SlEdge[];
  readonly start: number;
  readonly exit: number;
  readonly boss: number;
  /** Quãng ngắn nhất từ xuất phát tới cổng, không tính lối tắt khóa. */
  readonly shortest: number;
}

export interface SlLevelConfig {
  readonly cols: number;
  readonly rows: number;
  /** Bán kính thấy loại ô quanh tướng; null là không có sương. */
  readonly fog: number | null;
  readonly traps: number;
  /** Tỉ lệ bẫy ẩn. */
  readonly hiddenRatio: number;
  readonly lucks: number;
  readonly steles: number;
  readonly gates: number;
  /** Số cạnh thêm để có vòng lặp; một nửa (làm tròn xuống) là lối tắt khóa. */
  readonly loops: number;
  /** Tỉ lệ ô Lục/Vàng/Đỏ. */
  readonly colors: readonly [number, number, number];
  /** Mốc lượt cho ★★. */
  readonly starTurns: number;
  /** Giây cho mỗi câu; null là không giới hạn. */
  readonly questionSeconds: number | null;
  /** Số nước của trận giao tranh. */
  readonly skirmishMoves: number;
  /** Thành lực boss trấn cổng. */
  readonly bossHp: number;
}

/** Điểm xuất phát, chờ chơi thử để chốt (GDD mục 7). */
export const SL_LEVELS: Readonly<Record<SlLevel, SlLevelConfig>> = {
  de: { cols: 7, rows: 5, fog: null, traps: 3, hiddenRatio: 0, lucks: 5, steles: 2, gates: 1, loops: 3, colors: [60, 30, 10], starTurns: 12, questionSeconds: null, skirmishMoves: 15, bossHp: 920 },
  thuong: { cols: 9, rows: 6, fog: 2, traps: 7, hiddenRatio: 0.5, lucks: 5, steles: 2, gates: 1, loops: 4, colors: [40, 40, 20], starTurns: 16, questionSeconds: 30, skirmishMoves: 12, bossHp: 880 },
  kho: { cols: 10, rows: 7, fog: 1, traps: 11, hiddenRatio: 0.67, lucks: 4, steles: 3, gates: 2, loops: 5, colors: [25, 45, 30], starTurns: 20, questionSeconds: 20, skirmishMoves: 10, bossHp: 820 },
};

export const SL_TRAPS: readonly SlTrap[] = ["phucBinh", "cocNgam", "nuocLu", "lacLoi", "thichKhach", "dotCau"];
export const SL_LUCKS: readonly SlLuck[] = ["nguaChien", "tramNgua", "matThu", "trinhSat", "suQuan"];

/** Bộ bẫy hợp giai đoạn (GDD mục 4.2): Cọc ngầm ở mê cung Ngô, Thích khách ở mê cung nhà Đinh. */
export const SL_ERA_TRAPS: Readonly<Record<SlEra, readonly SlTrap[]>> = {
  ngo: ["phucBinh", "cocNgam", "nuocLu", "lacLoi", "dotCau"],
  loanSuQuan: ["phucBinh", "nuocLu", "lacLoi", "dotCau"],
  dinh: ["phucBinh", "nuocLu", "lacLoi", "thichKhach", "dotCau"],
  tienLe: ["phucBinh", "nuocLu", "lacLoi", "dotCau"],
};

export const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** Kề nhau trên lưới (dùng khi sinh). */
function gridNeighbors(i: number, cols: number, rows: number): number[] {
  const x = i % cols;
  const y = Math.floor(i / cols);
  const out: number[] = [];
  if (y > 0) out.push(i - cols);
  if (x < cols - 1) out.push(i + 1);
  if (y < rows - 1) out.push(i + cols);
  if (x > 0) out.push(i - 1);
  return out;
}

function shuffle<T>(arr: T[], rng: Rng): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Danh sách kề theo cạnh; `open` lọc cạnh đi được. */
export function adjacency(maze: Pick<SlMaze, "cells" | "edges">, open: (e: SlEdge) => boolean = (e) => !e.locked): number[][] {
  const adj: number[][] = maze.cells.map(() => []);
  for (const e of maze.edges) {
    if (!open(e)) continue;
    adj[e.a]!.push(e.b);
    adj[e.b]!.push(e.a);
  }
  return adj;
}

export function bfs(adj: readonly (readonly number[])[], from: number): number[] {
  const dist = adj.map(() => -1);
  dist[from] = 0;
  const queue = [from];
  for (let h = 0; h < queue.length; h++) {
    const u = queue[h]!;
    for (const v of adj[u]!) {
      if (dist[v] === -1) {
        dist[v] = dist[u]! + 1;
        queue.push(v);
      }
    }
  }
  return dist;
}

function pickWeighted(rng: Rng, weights: readonly number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng.next() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]!;
    if (r < 0) return i;
  }
  return weights.length - 1;
}

/**
 * Sinh mê cung: cây khung ngẫu nhiên (DFS) trên toàn lưới, thêm vài cạnh tạo vòng (một nửa khóa thành lối tắt).
 * Cổng là lá xa xuất phát nhất; ô kề duy nhất của cổng là boss trấn cổng. Cửa ải đặt trên đường chính trước boss.
 */
export function generateMaze(level: SlLevel, era: SlEra, seed: number): SlMaze {
  const cfg = SL_LEVELS[level];
  const rng = createRng(seed);
  const { cols, rows } = cfg;
  const n = cols * rows;
  const treeEdges: [number, number][] = [];
  const seen = new Array<boolean>(n).fill(false);
  const start = 0;
  const stack = [start];
  seen[start] = true;
  while (stack.length > 0) {
    const u = stack[stack.length - 1]!;
    const next = shuffle(gridNeighbors(u, cols, rows).filter((v) => !seen[v]), rng);
    if (next.length === 0) {
      stack.pop();
      continue;
    }
    const v = next[0]!;
    seen[v] = true;
    treeEdges.push([u, v]);
    stack.push(v);
  }

  const treeAdj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of treeEdges) {
    treeAdj[a]!.push(b);
    treeAdj[b]!.push(a);
  }
  const dist = bfs(treeAdj, start);
  // Cổng: lá xa nhất (ưu tiên khoảng cách, rồi chỉ số nhỏ để tất định).
  let exit = -1;
  for (let i = 0; i < n; i++) {
    if (i === start || treeAdj[i]!.length !== 1) continue;
    if (exit === -1 || dist[i]! > dist[exit]!) exit = i;
  }
  const boss = treeAdj[exit]![0]!;

  // Cạnh thêm: không chạm cổng và boss, để boss luôn là cửa duy nhất vào cổng.
  const used = new Set(treeEdges.map(([a, b]) => edgeKey(a, b)));
  const candidates: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (const j of gridNeighbors(i, cols, rows)) {
      if (j < i || used.has(edgeKey(i, j))) continue;
      if (i === exit || j === exit || i === boss || j === boss) continue;
      candidates.push([i, j]);
    }
  }
  shuffle(candidates, rng);
  const extra = candidates.slice(0, cfg.loops);
  const lockCount = Math.floor(extra.length / 2);
  const edges: SlEdge[] = [
    ...treeEdges.map(([a, b]) => ({ a, b, locked: false })),
    ...extra.map(([a, b], k) => ({ a, b, locked: k < lockCount })),
  ];

  const openAdj = adjacency({ cells: new Array(n).fill(null), edges });
  const fromStart = bfs(openAdj, start);
  const shortest = fromStart[exit]!;

  // Đường chính (theo cạnh mở) để đặt cửa ải.
  const path: number[] = [];
  for (let cur = boss; cur !== start; ) {
    path.push(cur);
    cur = openAdj[cur]!.find((v) => fromStart[v] === fromStart[cur]! - 1)!;
  }
  path.reverse(); // từ ô sau xuất phát tới boss
  const gates = new Set<number>();
  for (let k = 0; k < cfg.gates; k++) {
    const at = Math.floor(path.length * (0.55 + 0.25 * (cfg.gates === 1 ? 0.5 : k / (cfg.gates - 1))));
    const cell = path[Math.min(path.length - 2, Math.max(1, at))];
    if (cell !== undefined && cell !== boss) gates.add(cell);
  }

  const cells: SlCell[] = new Array(n);
  const free: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i === start) cells[i] = { kind: "start" };
    else if (i === exit) cells[i] = { kind: "exit" };
    else if (i === boss) cells[i] = { kind: "boss" };
    else if (gates.has(i)) cells[i] = { kind: "gate" };
    else free.push(i);
  }
  // Ô kề xuất phát luôn là ô câu hỏi thường để nước đầu không sa bẫy.
  const nearStart = new Set(openAdj[start]);
  const placeable = shuffle(free.filter((i) => !nearStart.has(i)), rng);
  const trapSet = SL_ERA_TRAPS[era];
  let k = 0;
  const hiddenCount = Math.round(cfg.traps * cfg.hiddenRatio);
  for (let t = 0; t < cfg.traps && k < placeable.length; t++, k++) {
    cells[placeable[k]!] = { kind: "trap", trap: trapSet[rng.int(0, trapSet.length - 1)]!, hidden: t < hiddenCount };
  }
  for (let t = 0; t < cfg.lucks && k < placeable.length; t++, k++) {
    cells[placeable[k]!] = { kind: "luck", luck: SL_LUCKS[t % SL_LUCKS.length]! };
  }
  for (let t = 0; t < cfg.steles && k < placeable.length; t++, k++) cells[placeable[k]!] = { kind: "stele" };
  for (const i of free) {
    if (cells[i] === undefined) cells[i] = { kind: "question", difficulty: (pickWeighted(rng, cfg.colors) + 1) as SlDifficulty };
  }
  return { cols, rows, cells, edges, start, exit, boss, shortest };
}
