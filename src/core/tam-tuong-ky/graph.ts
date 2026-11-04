// Đồ thị công thức: khóa có thứ tự, khả năng đạt được từ starter, vòng phụ thuộc và thước đo độ khó.
// Design Freeze P-1, P-4, P-7.

import type { NodeId, Pack, Recipe } from "./types";

/** Khóa công thức theo thứ tự ô: `A>B` khác `B>A`. */
export function recipeKey(first: NodeId, second: NodeId): string {
  return `${first}>${second}`;
}

export function starterIds(pack: Pack): readonly NodeId[] {
  return pack.nodes.filter((n) => n.kind === "element").map((n) => n.id);
}

/**
 * Thước đo cho mỗi node đạt được: `minCombines` là số lần ghép ít nhất từ starter, mỗi nguyên liệu trung gian
 * tính riêng (như chế độ Hạng, nơi nguyên liệu bị tiêu); `starterCost` là số đơn vị nguyên tố tiêu hết.
 * Hai giá trị lấy min độc lập. Node không có trong kết quả là không đạt được.
 */
export interface NodeMetrics {
  readonly minCombines: number;
  readonly starterCost: number;
}

export function computeMetrics(pack: Pack): ReadonlyMap<NodeId, NodeMetrics> {
  const combines = new Map<NodeId, number>();
  const cost = new Map<NodeId, number>();
  for (const id of starterIds(pack)) {
    combines.set(id, 0);
    cost.set(id, 1);
  }
  // Bellman–Ford trên siêu đồ thị: lặp tới khi không còn cải thiện (số node nhỏ, không cần hàng đợi ưu tiên).
  for (let changed = true; changed; ) {
    changed = false;
    for (const r of pack.recipes) {
      const ca = combines.get(r.first);
      const cb = combines.get(r.second);
      if (ca === undefined || cb === undefined) continue;
      const c = 1 + ca + cb;
      const s = cost.get(r.first)! + cost.get(r.second)!;
      if (c < (combines.get(r.result) ?? Infinity)) {
        combines.set(r.result, c);
        changed = true;
      }
      if (s < (cost.get(r.result) ?? Infinity)) {
        cost.set(r.result, s);
        changed = true;
      }
    }
  }
  const out = new Map<NodeId, NodeMetrics>();
  for (const [id, c] of combines) out.set(id, { minCombines: c, starterCost: cost.get(id)! });
  return out;
}

/** Các vòng phụ thuộc nguyên liệu → kết quả; mỗi vòng là danh sách node theo thứ tự đi. */
export function findCycles(recipes: readonly Recipe[]): readonly NodeId[][] {
  const next = new Map<NodeId, Set<NodeId>>();
  for (const r of recipes) {
    for (const input of [r.first, r.second]) {
      if (!next.has(input)) next.set(input, new Set());
      next.get(input)!.add(r.result);
    }
  }
  const state = new Map<NodeId, "visiting" | "done">();
  const stack: NodeId[] = [];
  const cycles: NodeId[][] = [];
  const visit = (id: NodeId) => {
    state.set(id, "visiting");
    stack.push(id);
    for (const to of next.get(id) ?? []) {
      const s = state.get(to);
      if (s === "visiting") cycles.push(stack.slice(stack.indexOf(to)));
      else if (s === undefined) visit(to);
    }
    stack.pop();
    state.set(id, "done");
  };
  for (const id of [...next.keys()].sort()) if (!state.has(id)) visit(id);
  return cycles;
}
