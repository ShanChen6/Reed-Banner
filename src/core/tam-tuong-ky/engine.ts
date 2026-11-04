// Engine ghép thuần của Tầm Tướng Ký (LT-02): chế độ Thường (sổ khám phá, không tiêu nguyên liệu) và chế độ Hạng
// (kho đơn vị, mỗi lần ghép tiêu nguyên liệu kể cả ghép sai). Luật: Design Freeze mục 4
// (docs/02-game-modes/future/14-tam-tuong-ky-design-freeze.md).
// Không RNG, không thời gian, không mạng; không đụng roster, hồ sơ, vàng. State bất biến: thao tác không đổi gì
// thì trả về đúng tham chiếu state cũ.

import { recipeKey, starterIds } from "./graph";
import type { CatalogNode, NodeId, Pack, Recipe, RecipeId } from "./types";

export const DISCOVERY_SCHEMA_VERSION = 1;

/** Chỉ mục tra cứu dựng một lần từ pack. */
export interface Catalog {
  readonly pack: Pack;
  readonly nodes: ReadonlyMap<NodeId, CatalogNode>;
  readonly byKey: ReadonlyMap<string, Recipe>;
  readonly starters: readonly NodeId[];
}

export function buildCatalog(pack: Pack): Catalog {
  return {
    pack,
    nodes: new Map(pack.nodes.map((n) => [n.id, n])),
    byKey: new Map(pack.recipes.map((r) => [recipeKey(r.first, r.second), r])),
    starters: starterIds(pack),
  };
}

/** Sổ khám phá của tài khoản: dùng chung cho Tướng Lục, thành tựu và chế độ Thường. */
export interface DiscoveryState {
  readonly schemaVersion: number;
  readonly packId: string;
  readonly contentVersion: number;
  /** Theo thứ tự khám phá. */
  readonly discoveredNodeIds: readonly NodeId[];
  readonly discoveredRecipeIds: readonly RecipeId[];
}

export function initialDiscovery(catalog: Catalog): DiscoveryState {
  return {
    schemaVersion: DISCOVERY_SCHEMA_VERSION,
    packId: catalog.pack.id,
    contentVersion: catalog.pack.contentVersion,
    discoveredNodeIds: catalog.starters,
    discoveredRecipeIds: [],
  };
}

export type InvalidReason = "unknownInput" | "lockedInput";

export type NormalOutcome =
  | {
      readonly status: "created";
      readonly recipeId: RecipeId;
      readonly nodeId: NodeId;
      /** Node đã có qua công thức khác: không báo khám phá mới. */
      readonly nodeAlreadyKnown: boolean;
      readonly isCharacter: boolean;
      readonly next: DiscoveryState;
    }
  | { readonly status: "alreadyKnown"; readonly recipeId: RecipeId; readonly nodeId: NodeId; readonly next: DiscoveryState }
  | { readonly status: "noRecipe"; readonly next: DiscoveryState }
  | { readonly status: "invalid"; readonly reason: InvalidReason; readonly next: DiscoveryState };

/** Lần ghép có bị trừ khỏi lượt chơi Thường không (P-9): chỉ `created` và `noRecipe`. */
export function chargesCombine(outcome: { readonly status: string }): boolean {
  return outcome.status === "created" || outcome.status === "noRecipe";
}

function record(state: DiscoveryState, recipe: Recipe): { next: DiscoveryState; nodeAlreadyKnown: boolean } {
  const nodeAlreadyKnown = state.discoveredNodeIds.includes(recipe.result);
  return {
    nodeAlreadyKnown,
    next: {
      ...state,
      discoveredRecipeIds: [...state.discoveredRecipeIds, recipe.id],
      discoveredNodeIds: nodeAlreadyKnown ? state.discoveredNodeIds : [...state.discoveredNodeIds, recipe.result],
    },
  };
}

/** Ghép ở chế độ Thường: ô trước `first`, ô sau `second`. */
export function combineNormal(catalog: Catalog, state: DiscoveryState, first: NodeId, second: NodeId): NormalOutcome {
  const a = catalog.nodes.get(first);
  const b = catalog.nodes.get(second);
  if (!a || !b) return { status: "invalid", reason: "unknownInput", next: state };
  const usable = (n: CatalogNode) => n.kind !== "character" && state.discoveredNodeIds.includes(n.id);
  if (!usable(a) || !usable(b)) return { status: "invalid", reason: "lockedInput", next: state };
  const recipe = catalog.byKey.get(recipeKey(first, second));
  if (!recipe) return { status: "noRecipe", next: state };
  if (state.discoveredRecipeIds.includes(recipe.id))
    return { status: "alreadyKnown", recipeId: recipe.id, nodeId: recipe.result, next: state };
  const { next, nodeAlreadyKnown } = record(state, recipe);
  return {
    status: "created",
    recipeId: recipe.id,
    nodeId: recipe.result,
    nodeAlreadyKnown,
    isCharacter: catalog.nodes.get(recipe.result)?.kind === "character",
    next,
  };
}

/** Kho tuần chế độ Hạng: số đơn vị mỗi node trung gian (P-14, chỉ sống trong tuần). */
export type Stock = Readonly<Record<NodeId, number>>;

export interface RankedState {
  /** Đơn vị nguyên tố tự chọn (P-11, Shan chốt L5-2): mỗi đơn vị dùng làm nguyên tố hệ nào cũng được. */
  readonly units: number;
  readonly stock: Stock;
  /** Tướng đã ghép ra trong tuần, theo thứ tự; mỗi tướng một lần (điểm tính ở lớp tài khoản). */
  readonly heroesCreated: readonly NodeId[];
  /** Số đơn vị nguyên tố đã tiêu trong tuần (phân hạng khi bằng điểm, P-18). */
  readonly unitsSpent: number;
}

export function initialRanked(units: number, stock: Stock = {}): RankedState {
  return { units, stock, heroesCreated: [], unitsSpent: 0 };
}

export type RankedOutcome =
  | {
      readonly status: "created";
      readonly recipeId: RecipeId;
      readonly nodeId: NodeId;
      readonly recipeAlreadyKnown: boolean;
      readonly isCharacter: boolean;
      /** Tướng này đã ghép ra trong tuần trước đó (không tính điểm lần nữa). */
      readonly heroAlreadyCreated: boolean;
      readonly next: RankedState;
      readonly nextDiscovery: DiscoveryState;
    }
  | { readonly status: "noRecipe"; readonly next: RankedState; readonly nextDiscovery: DiscoveryState }
  | {
      readonly status: "invalid";
      readonly reason: InvalidReason;
      readonly next: RankedState;
      readonly nextDiscovery: DiscoveryState;
    };

/**
 * Ghép ở chế độ Hạng. Nguyên tố lấy từ `units` (tự chọn hệ), node trung gian lấy từ kho tuần; tiêu 1 đơn vị mỗi
 * nguyên liệu (`A+A` tiêu 2), cả khi `noRecipe` (A-8, không hoàn lại). Thành công thì cộng 1 đơn vị kết quả vào kho,
 * trừ tướng (không vào kho). Công thức và node mới cũng ghi vào sổ khám phá (P-15).
 */
export function combineRanked(
  catalog: Catalog,
  state: RankedState,
  discovery: DiscoveryState,
  first: NodeId,
  second: NodeId,
): RankedOutcome {
  const a = catalog.nodes.get(first);
  const b = catalog.nodes.get(second);
  if (!a || !b) return { status: "invalid", reason: "unknownInput", next: state, nextDiscovery: discovery };
  if (a.kind === "character" || b.kind === "character") return { status: "invalid", reason: "lockedInput", next: state, nextDiscovery: discovery };
  const starters = [a, b].filter((n) => n.kind === "element").length;
  const need: Record<NodeId, number> = {};
  for (const n of [a, b]) if (n.kind !== "element") need[n.id] = (need[n.id] ?? 0) + 1;
  if (state.units < starters || Object.entries(need).some(([id, c]) => (state.stock[id] ?? 0) < c))
    return { status: "invalid", reason: "lockedInput", next: state, nextDiscovery: discovery };
  const stock: Record<NodeId, number> = { ...state.stock };
  for (const [id, c] of Object.entries(need)) {
    const left = stock[id]! - c;
    if (left > 0) stock[id] = left;
    else delete stock[id];
  }
  const spent: RankedState = { ...state, units: state.units - starters, unitsSpent: state.unitsSpent + starters, stock };
  const recipe = catalog.byKey.get(recipeKey(first, second));
  if (!recipe) return { status: "noRecipe", next: spent, nextDiscovery: discovery };
  const isCharacter = catalog.nodes.get(recipe.result)?.kind === "character";
  const heroAlreadyCreated = isCharacter && state.heroesCreated.includes(recipe.result);
  const next: RankedState = {
    ...spent,
    stock: isCharacter ? stock : { ...stock, [recipe.result]: (stock[recipe.result] ?? 0) + 1 },
    heroesCreated: isCharacter && !heroAlreadyCreated ? [...state.heroesCreated, recipe.result] : state.heroesCreated,
  };
  const recipeAlreadyKnown = discovery.discoveredRecipeIds.includes(recipe.id);
  const nextDiscovery = recipeAlreadyKnown ? discovery : record(discovery, recipe).next;
  return { status: "created", recipeId: recipe.id, nodeId: recipe.result, recipeAlreadyKnown, isCharacter, heroAlreadyCreated, next, nextDiscovery };
}

/** Phát lại chuỗi thao tác Thường; dùng cho test và kiểm save. */
export function replayNormal(
  catalog: Catalog,
  moves: readonly (readonly [NodeId, NodeId])[],
  start: DiscoveryState = initialDiscovery(catalog),
): DiscoveryState {
  return moves.reduce((s, [a, b]) => combineNormal(catalog, s, a, b).next, start);
}

/** Tướng đã khám phá theo thứ tự sổ. */
export function discoveredCharacters(catalog: Catalog, state: DiscoveryState): readonly NodeId[] {
  return state.discoveredNodeIds.filter((id) => catalog.nodes.get(id)?.kind === "character");
}
