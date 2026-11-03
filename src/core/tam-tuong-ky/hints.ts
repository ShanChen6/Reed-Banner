// Gợi ý chế độ Thường (Design Freeze A-12, P-8): mức 1 lộ một nhóm, mức 2 lộ một nguyên liệu, không bao giờ lộ đủ
// công thức hay thứ tự ô. Chọn deterministic: công thức chưa tìm ghép được ngay, ít lần ghép nhất, rồi theo ID.
// Số lượt (2 mỗi ngày) và chặn ở chế độ Hạng do server giữ (LT-04).

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

export function hintFor(catalog: Catalog, state: DiscoveryState, level: HintLevel): Hint | null {
  const metrics = computeMetrics(catalog.pack);
  const target = [...makeableRecipes(catalog, state)].sort(
    (x, y) =>
      (metrics.get(x.result)?.minCombines ?? Infinity) - (metrics.get(y.result)?.minCombines ?? Infinity) ||
      x.id.localeCompare(y.id),
  )[0];
  if (!target) return null;
  const hintGroup = catalog.nodes.get(target.result)?.hintGroup ?? "khac";
  if (level === 1) return { level: 1, hintGroup };
  // Lộ nguyên liệu ít phổ biến hơn trong hai (starter dễ đoán hơn node trung gian), không nói ô nào.
  const ingredientId = catalog.nodes.get(target.second)?.kind === "element" ? target.first : target.second;
  return { level: 2, hintGroup, ingredientId };
}
