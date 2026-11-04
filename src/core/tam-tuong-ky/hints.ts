// Gợi ý chế độ Thường (Design Freeze A-12, P-8; nhắm tướng theo L5-5, Shan duyệt 04/11/2026): chọn công thức ghép được
// ngay nằm trên đường tới tướng chưa tìm gần xong nhất. Mức 1 lộ nhóm của kết quả, mức 2 lộ một nguyên liệu; không bao
// giờ lộ đủ công thức hay thứ tự ô. Deterministic. Số lượt (2 mỗi ngày) và chặn ở chế độ Hạng do server giữ.
// Dấu “còn công thức chưa tìm” (L5-4) cũng ở đây.

import type { Catalog, DiscoveryState } from "./engine";
import { computeMetrics } from "./graph";
import type { NodeId, Recipe } from "./types";

export type HintLevel = 1 | 2;

export type Hint =
  | { readonly level: 1; readonly hintGroup: string }
  | { readonly level: 2; readonly hintGroup: string; readonly ingredientId: NodeId };

/** Công thức chưa tìm mà hai nguyên liệu đã có trong sổ. */
export function makeableRecipes(catalog: Catalog, state: DiscoveryState): readonly Recipe[] {
  const known = new Set(state.discoveredNodeIds);
  const found = new Set(state.discoveredRecipeIds);
  return catalog.pack.recipes.filter((r) => !found.has(r.id) && known.has(r.first) && known.has(r.second));
}

/** Yếu tố đã mở còn là nguyên liệu của ít nhất một công thức chưa tìm (dấu trong Vạn Vật Lục; không nói cặp nào). */
export function openIngredients(catalog: Catalog, state: DiscoveryState): ReadonlySet<NodeId> {
  const known = new Set(state.discoveredNodeIds);
  const found = new Set(state.discoveredRecipeIds);
  const out = new Set<NodeId>();
  for (const r of catalog.pack.recipes) {
    if (found.has(r.id)) continue;
    for (const id of [r.first, r.second]) if (known.has(id)) out.add(id);
  }
  return out;
}

/** Cây công thức rẻ nhất (theo số lần ghép) dẫn tới `nodeId`, theo thứ tự ghép được. */
function treeOf(catalog: Catalog, nodeId: NodeId, metrics: ReturnType<typeof computeMetrics>): readonly Recipe[] {
  const best = new Map<NodeId, Recipe>();
  for (const r of catalog.pack.recipes) {
    const cost = (x: Recipe) => (metrics.get(x.first)?.minCombines ?? Infinity) + (metrics.get(x.second)?.minCombines ?? Infinity);
    const cur = best.get(r.result);
    if (!cur || cost(r) < cost(cur) || (cost(r) === cost(cur) && r.id < cur.id)) best.set(r.result, r);
  }
  const out: Recipe[] = [];
  const seen = new Set<NodeId>();
  const visit = (id: NodeId) => {
    const r = best.get(id);
    if (!r || seen.has(id)) return;
    seen.add(id);
    visit(r.first);
    visit(r.second);
    out.push(r);
  };
  visit(nodeId);
  return out;
}

/** Công thức gợi ý: trên cây của tướng chưa tìm còn ít bước nhất; không có thì công thức nông nhất ghép được ngay. */
export function hintTarget(catalog: Catalog, state: DiscoveryState): Recipe | null {
  const metrics = computeMetrics(catalog.pack);
  const known = new Set(state.discoveredNodeIds);
  const found = new Set(state.discoveredRecipeIds);
  const makeable = (r: Recipe) => !found.has(r.id) && !known.has(r.result) && known.has(r.first) && known.has(r.second);
  const heroes = catalog.pack.nodes.filter((n) => n.kind === "character" && !known.has(n.id)).map((n) => n.id);
  const candidates = heroes
    .map((h) => {
      const tree = treeOf(catalog, h, metrics);
      return { h, left: tree.filter((r) => !known.has(r.result)).length, next: tree.find(makeable) };
    })
    .filter((c) => c.next)
    .sort((x, y) => x.left - y.left || x.h.localeCompare(y.h));
  if (candidates[0]?.next) return candidates[0].next;
  return (
    [...makeableRecipes(catalog, state)].sort(
      (x, y) => (metrics.get(x.result)?.minCombines ?? Infinity) - (metrics.get(y.result)?.minCombines ?? Infinity) || x.id.localeCompare(y.id),
    )[0] ?? null
  );
}

export function hintFor(catalog: Catalog, state: DiscoveryState, level: HintLevel): Hint | null {
  const target = hintTarget(catalog, state);
  if (!target) return null;
  const hintGroup = catalog.nodes.get(target.result)?.hintGroup ?? "khac";
  if (level === 1) return { level: 1, hintGroup };
  // Lộ nguyên liệu khó đoán hơn trong hai (nguyên tố dễ đoán hơn node trung gian), không nói ô nào.
  const ingredientId = catalog.nodes.get(target.second)?.kind === "element" ? target.first : target.second;
  return { level: 2, hintGroup, ingredientId };
}
