// Logic thuần của màn Tầm Tướng Ký (LT-03): chọn ô, tìm kiếm, lời thông báo, thẻ Tướng Lục. Tách khỏi component để test.
// Luật ở src/core/tam-tuong-ky; giao diện ở docs/05-ui-ux/screens/tam-tuong-ky.md.

import {
  HINT_GROUP_NAMES,
  rosterCharacter,
  type Catalog,
  type CatalogNode,
  type CharacterInfo,
  type DiscoveryState,
  type Hint,
  type HeroTier,
  type InvalidReason,
  type NodeId,
} from "@/core/tam-tuong-ky";

/** Hai ô có thứ tự: `[ô trước, ô sau]`. */
export type Slots = readonly [NodeId | null, NodeId | null];
export const EMPTY_SLOTS: Slots = [null, null];

/** Bấm một yếu tố: điền vào ô trống đầu tiên; đủ hai ô thì thay ô sau. Cho chọn cùng yếu tố hai lần (A+A). */
export function pickInto(slots: Slots, id: NodeId): Slots {
  if (slots[0] === null) return [id, slots[1]];
  if (slots[1] === null) return [slots[0], id];
  return [slots[0], id];
}

export const clearSlot = (slots: Slots, index: 0 | 1): Slots => (index === 0 ? [null, slots[1]] : [slots[0], null]);
export const swapSlots = (slots: Slots): Slots => [slots[1], slots[0]];

/** Bỏ dấu tiếng Việt để tìm “thap dao” ra “Thập đạo”. */
export function foldVi(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
}

/** Yếu tố trong Vạn Vật Lục: đã khám phá, không phải tướng, khớp từ khóa và nhóm. Starter luôn đứng đầu. */
export function libraryNodes(catalog: Catalog, state: DiscoveryState, query: string, group: string | null): readonly CatalogNode[] {
  const q = foldVi(query);
  return state.discoveredNodeIds
    .map((id) => catalog.nodes.get(id))
    .filter((n): n is CatalogNode => !!n && n.kind !== "character")
    .filter((n) => (group === null || n.hintGroup === group) && (q === "" || foldVi(n.nameVi).includes(q)));
}

/** Nhóm có trong Vạn Vật Lục hiện tại, theo thứ tự xuất hiện. */
export function libraryGroups(catalog: Catalog, state: DiscoveryState): readonly { id: string; name: string }[] {
  const seen: string[] = [];
  for (const n of libraryNodes(catalog, state, "", null)) if (n.hintGroup && !seen.includes(n.hintGroup)) seen.push(n.hintGroup);
  return seen.map((id) => ({ id, name: HINT_GROUP_NAMES[id] ?? id }));
}

export const nameOf = (catalog: Catalog, id: NodeId) => catalog.nodes.get(id)?.nameVi ?? id;

export type Tone = "discovery" | "hero" | "repeat" | "miss" | "invalid";

export interface Notice {
  readonly tone: Tone;
  readonly text: string;
}

/** Kết quả một lần ghép, từ engine (`NormalOutcome`) hoặc từ phản hồi server. */
export interface CombineSummary {
  readonly status: "created" | "alreadyKnown" | "noRecipe" | "invalid";
  readonly nodeId?: NodeId;
  readonly isCharacter?: boolean;
  readonly nodeAlreadyKnown?: boolean;
  readonly reason?: InvalidReason;
}

/** Lời thông báo sau một lần ghép (đọc qua aria-live). Không bao giờ nói tên tướng chưa ghép ra. */
export function noticeFor(catalog: Catalog, outcome: CombineSummary): Notice {
  switch (outcome.status) {
    case "created": {
      const name = nameOf(catalog, outcome.nodeId ?? "");
      if (outcome.isCharacter) return { tone: "hero", text: `Tìm thấy chân dung ${name}. Đã ghi vào Tướng Lục.` };
      if (outcome.nodeAlreadyKnown) return { tone: "repeat", text: `Thêm một cách ra ${name}.` };
      return { tone: "discovery", text: `Khám phá mới: ${name}.` };
    }
    case "alreadyKnown":
      return { tone: "repeat", text: `Đã biết: ra ${nameOf(catalog, outcome.nodeId ?? "")}. Không trừ lần ghép.` };
    case "noRecipe":
      return { tone: "miss", text: "Chưa tìm được mối liên hệ." };
    case "invalid":
      return {
        tone: "invalid",
        text: outcome.reason === "unknownInput" ? "Yếu tố không có trong sổ." : "Chỉ ghép được yếu tố đã khám phá, không ghép tướng.",
      };
  }
}

export function hintText(hint: Hint | null): string {
  if (!hint) return "Không còn công thức nào ghép được ngay từ những gì đã có.";
  const group = HINT_GROUP_NAMES[hint.hintGroup] ?? hint.hintGroup;
  return hint.level === 1 ? `Gợi ý: còn công thức ra một thứ thuộc nhóm ${group}.` : `Gợi ý: thử dùng một yếu tố trong công thức nhóm ${group}.`;
}

export const TIER_NAME: Readonly<Record<HeroTier, string>> = { thuong: "Tướng thường", dacBiet: "Tướng đặc biệt", lichSu: "Tướng lịch sử" };

export type LedgerEntry =
  | { readonly found: true; readonly nodeId: NodeId; readonly characterId: string; readonly name: string; readonly tier: HeroTier; readonly info: CharacterInfo; readonly symbols: readonly string[] }
  | { readonly found: false; readonly nodeId: NodeId; readonly tier: HeroTier };

/**
 * Thẻ Tướng Lục cho đủ số tướng của pack (A-15). Tướng chưa tìm chỉ lộ bậc (P-24), không có tên hay characterId.
 * Dấu tích là nguyên liệu danh tính của công thức cuối (tước hiệu, địa danh, chiêu, lore); chưa có tiểu sử.
 */
export function ledger(catalog: Catalog, state: DiscoveryState): readonly LedgerEntry[] {
  return catalog.pack.nodes
    .filter((n) => n.kind === "character")
    .map((n): LedgerEntry => {
      const tier = n.tier ?? "thuong";
      const info = n.characterId ? rosterCharacter(n.characterId) : undefined;
      if (!state.discoveredNodeIds.includes(n.id) || !info || !n.characterId) return { found: false, nodeId: n.id, tier };
      const final = catalog.pack.recipes.find((r) => r.result === n.id);
      // Dấu danh tính: nguyên liệu cuối không phải node vai trò (nghề/hệ đã hiện riêng). Không lấy từ art.
      const symbols = final ? [final.first, final.second].filter((id) => !catalog.nodes.get(id)?.role).map((id) => nameOf(catalog, id)) : [];
      return { found: true, nodeId: n.id, characterId: n.characterId, name: n.nameVi, tier, info, symbols };
    });
}

/** Mẹo cho người mới (sổ chỉ có 7 nguyên tố): một công thức có thật, dễ hiểu. */
export function tutorialTip(state: DiscoveryState): string | null {
  return state.discoveredRecipeIds.length === 0 ? "Mẹo: chọn Mộc vào ô trước và Mộc vào ô sau, rồi bấm Hợp Nguyên." : null;
}
