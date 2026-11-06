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
import { isHero, isWarlord } from "@/core/roster/roster";
import type { Profession } from "@/core/battle";

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

/** Lọc theo từ khóa (không dấu) và nhóm. */
export function filterNodes(nodes: readonly CatalogNode[], query: string, group: string | null): readonly CatalogNode[] {
  const q = foldVi(query);
  return nodes.filter((n) => (group === null || n.hintGroup === group) && (q === "" || foldVi(n.nameVi).includes(q)));
}

/** Nhóm có trong danh sách, theo thứ tự xuất hiện. */
export function groupsOf(nodes: readonly CatalogNode[]): readonly { id: string; name: string }[] {
  const seen: string[] = [];
  for (const n of nodes) if (n.hintGroup && !seen.includes(n.hintGroup)) seen.push(n.hintGroup);
  return seen.map((id) => ({ id, name: HINT_GROUP_NAMES[id] ?? id }));
}

/** Yếu tố đã khám phá, không phải tướng, theo thứ tự sổ (starter đứng đầu). */
export function discoveredNodes(catalog: Catalog, state: DiscoveryState): readonly CatalogNode[] {
  return state.discoveredNodeIds.map((id) => catalog.nodes.get(id)).filter((n): n is CatalogNode => !!n && n.kind !== "character");
}

/** Vạn Vật Lục chế độ Thường: yếu tố đã khám phá, khớp từ khóa và nhóm. */
export function libraryNodes(catalog: Catalog, state: DiscoveryState, query: string, group: string | null): readonly CatalogNode[] {
  return filterNodes(discoveredNodes(catalog, state), query, group);
}

export function libraryGroups(catalog: Catalog, state: DiscoveryState): readonly { id: string; name: string }[] {
  return groupsOf(discoveredNodes(catalog, state));
}

/** Vạn Vật Lục chế độ Hạng: 7 nguyên tố (lấy từ túi) và yếu tố đang có trong kho tuần, theo thứ tự catalog. */
export function rankedNodes(catalog: Catalog, stock: Readonly<Record<NodeId, number>>): readonly CatalogNode[] {
  return catalog.pack.nodes.filter((n) => n.kind === "element" || (stock[n.id] ?? 0) > 0);
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

/** Kết quả hiện ở thẻ dưới hai ô sau một lần ghép (mục 7.5). `seq` tăng mỗi lần để chạy lại hiệu ứng. */
export interface AltarResult {
  readonly seq: number;
  /** Hai yếu tố vừa ghép, theo thứ tự ô trước, ô sau. */
  readonly from: readonly [NodeId, NodeId];
  readonly kind: "new" | "known" | "hero" | "miss";
  readonly nodeId?: NodeId;
  /** Chế độ Hạng: điểm khi ra tướng đề cử. */
  readonly points?: number;
}

/** Đổi kết quả ghép sang thẻ kết quả; ghép không hợp lệ thì không hiện thẻ (ô thông báo đã nói lý do). */
export function altarResult(outcome: CombineSummary, seq: number, from: readonly [NodeId, NodeId], points?: number): AltarResult | null {
  const base = { seq, from, ...(points ? { points } : {}) };
  switch (outcome.status) {
    case "created":
      if (outcome.isCharacter) return { ...base, kind: "hero", nodeId: outcome.nodeId };
      return { ...base, kind: outcome.nodeAlreadyKnown ? "known" : "new", nodeId: outcome.nodeId };
    case "alreadyKnown":
      return { ...base, kind: "known", nodeId: outcome.nodeId };
    case "noRecipe":
      return { ...base, kind: "miss" };
    case "invalid":
      return null;
  }
}

/**
 * Sổ công thức của một yếu tố, chỉ từ những công thức người chơi **đã tự ghép ra** (không lộ công thức chưa tìm).
 * `open`: yếu tố còn là nguyên liệu của công thức chưa tìm (cùng dấu chấm vàng ở Vạn Vật Lục, không nói cặp nào).
 */
export interface RecipeBook {
  readonly madeFrom: readonly (readonly [NodeId, NodeId])[];
  readonly usedIn: readonly { readonly first: NodeId; readonly second: NodeId; readonly result: NodeId }[];
  readonly open: boolean;
}

export function recipeBook(catalog: Catalog, state: DiscoveryState, id: NodeId): RecipeBook {
  const found = new Set(state.discoveredRecipeIds);
  const known = catalog.pack.recipes.filter((r) => found.has(r.id));
  const open = catalog.pack.recipes.some((r) => !found.has(r.id) && (r.first === id || r.second === id));
  return {
    madeFrom: known.filter((r) => r.result === id).map((r) => [r.first, r.second] as const),
    usedIn: known.filter((r) => r.first === id || r.second === id).map((r) => ({ first: r.first, second: r.second, result: r.result })),
    open,
  };
}

/** Một dòng lịch sử ghép (5 dòng gần nhất): bấm để đặt lại đúng cặp vào hai ô. `result` null khi không ra gì. */
export interface HistoryEntry {
  readonly first: NodeId;
  readonly second: NodeId;
  readonly result: NodeId | null;
  readonly text: string;
}

export function hintText(hint: Hint | null): string {
  if (!hint) return "Không còn công thức nào ghép được ngay từ những gì đã có.";
  const group = HINT_GROUP_NAMES[hint.hintGroup] ?? hint.hintGroup;
  return hint.level === 1 ? `Gợi ý: còn công thức ra một thứ thuộc nhóm ${group}.` : `Gợi ý: thử dùng một yếu tố trong công thức nhóm ${group}.`;
}

export const TIER_NAME: Readonly<Record<HeroTier, string>> = { thuong: "Tướng thường", dacBiet: "Tướng đặc biệt", lichSu: "Tướng lịch sử" };

/**
 * Nhóm Tướng Lục (mục 7.2 tài liệu giao diện): gom tướng theo quan hệ, chỉ để hiển thị. Gói phát hành (`pack`) giữ
 * nguyên trong code và thành tựu. Tên nhóm không lộ tướng chưa tìm vì nhóm nào cũng có từ 2 người.
 */
export type LedgerGroupId = "hoaLu" | "suQuan" | "kyNhan" | `nghe.${Profession}`;

export interface LedgerGroupInfo {
  readonly id: LedgerGroupId;
  readonly name: string;
  /** Một dòng giới thiệu mối liên hệ: chữ của trò chơi, không phải trích sử. */
  readonly intro: string;
}

const PROFESSION_GROUPS: readonly [Profession, string][] = [
  ["tuongSi", "Tướng sĩ"],
  ["binhLinh", "Binh lính"],
  ["ySu", "Y sư"],
  ["muuSi", "Mưu sĩ"],
  ["quanSu", "Quân sư"],
  ["phapSu", "Pháp sư"],
  ["xaThu", "Xạ thủ"],
  ["satThu", "Sát thủ"],
];

/** Thứ tự nhóm trong Tướng Lục. */
export const LEDGER_GROUPS: readonly LedgerGroupInfo[] = [
  { id: "hoaLu", name: "Cờ lau Hoa Lư", intro: "Những người theo cờ lau từ buổi đầu ở Hoa Lư." },
  { id: "suQuan", name: "Thập nhị sứ quân", intro: "Mười hai sứ quân, mỗi người giữ một vùng đất riêng." },
  { id: "kyNhan", name: "Kỳ nhân", intro: "Hai người lạ đi khắp các làng, không đứng về phe nào." },
  ...PROFESSION_GROUPS.map(([p, name]): LedgerGroupInfo => ({ id: `nghe.${p}`, name, intro: `Bảy ${name.toLowerCase()}, mỗi người mang một hệ.` })),
];

/** Nhóm của một tướng: Đinh Bộ Lĩnh và tướng theo ông vào Cờ lau Hoa Lư, sứ quân, kỳ nhân, còn lại theo nghề. */
export function ledgerGroup(characterId: string): LedgerGroupId {
  if (characterId === "dinhBoLinh" || isHero(characterId)) return "hoaLu";
  if (isWarlord(characterId)) return "suQuan";
  const info = rosterCharacter(characterId);
  if (info?.tier === "dacBiet") return "kyNhan";
  return `nghe.${info?.profession ?? "tuongSi"}`;
}

export interface LedgerGroupView extends LedgerGroupInfo {
  readonly entries: readonly LedgerEntry[];
  readonly found: number;
}

/** Nhóm có tướng trong sổ đang chạy, theo thứ tự `LEDGER_GROUPS`. */
export function ledgerGroups(entries: readonly LedgerEntry[]): readonly LedgerGroupView[] {
  return LEDGER_GROUPS.map((g) => {
    const list = entries.filter((e) => e.group === g.id);
    return { ...g, entries: list, found: list.filter((e) => e.found).length };
  }).filter((g) => g.entries.length > 0);
}

/** Tầng trên của bộ lọc Tướng Lục: ba nhóm danh tướng và một mục gộp "Tướng thường" (tầng dưới là 8 nghề). */
export type LedgerSectionId = "hoaLu" | "suQuan" | "kyNhan" | "thuong";

export interface LedgerSection {
  readonly id: LedgerSectionId;
  readonly name: string;
  readonly found: number;
  readonly total: number;
  /** Chỉ "Tướng thường": các nhóm nghề có trong sổ. */
  readonly groups: readonly LedgerGroupView[];
}

/** Nhãn ngắn cho hàng chip tầng trên (tên đầy đủ của nhóm hiện ở dòng giới thiệu). */
const SECTION_NAME: Readonly<Record<LedgerSectionId, string>> = { hoaLu: "Hoa Lư", suQuan: "Sứ quân", kyNhan: "Kỳ nhân", thuong: "Tướng thường" };

export const sectionOf = (group: LedgerGroupId): LedgerSectionId => (group.startsWith("nghe.") ? "thuong" : (group as LedgerSectionId));

/** Gom nhóm thành tầng trên, giữ thứ tự; bỏ mục không có tướng. Thêm nghề hay nhóm mới không thêm hàng chip. */
export function ledgerSections(groups: readonly LedgerGroupView[]): readonly LedgerSection[] {
  const out: LedgerSection[] = [];
  for (const g of groups) {
    const id = sectionOf(g.id);
    const prev = out.find((x) => x.id === id);
    if (prev) out[out.indexOf(prev)] = { ...prev, found: prev.found + g.found, total: prev.total + g.entries.length, groups: [...prev.groups, g] };
    else out.push({ id, name: SECTION_NAME[id], found: g.found, total: g.entries.length, groups: [g] });
  }
  return out;
}

/** Nhóm mở mặc định: nhóm đầu tiên chưa tìm đủ (đủ cả thì nhóm đầu). */
export function defaultLedgerGroup(groups: readonly LedgerGroupView[]): LedgerGroupId | null {
  return (groups.find((g) => g.found < g.entries.length) ?? groups[0])?.id ?? null;
}

export type LedgerEntry =
  | { readonly found: true; readonly nodeId: NodeId; readonly pack: string; readonly group: LedgerGroupId; readonly characterId: string; readonly name: string; readonly tier: HeroTier; readonly info: CharacterInfo; readonly symbols: readonly string[] }
  | { readonly found: false; readonly nodeId: NodeId; readonly pack: string; readonly group: LedgerGroupId; readonly tier: HeroTier };

/**
 * Thẻ Tướng Lục cho đủ số tướng của pack (A-15). Tướng chưa tìm chỉ lộ bậc (P-24), không có tên hay characterId.
 * Dấu tích là nguyên liệu danh tính của công thức cuối (tước hiệu, địa danh, chiêu, lore); chưa có tiểu sử.
 */
export function ledger(catalog: Catalog, state: DiscoveryState): readonly LedgerEntry[] {
  return catalog.pack.nodes
    .filter((n) => n.kind === "character")
    .map((n): LedgerEntry => {
      const tier = n.tier ?? "thuong";
      const pack = n.pack ?? catalog.pack.id;
      const info = n.characterId ? rosterCharacter(n.characterId) : undefined;
      const group = ledgerGroup(n.characterId ?? "");
      if (!state.discoveredNodeIds.includes(n.id) || !info || !n.characterId) return { found: false, nodeId: n.id, pack, group, tier };
      const final = catalog.pack.recipes.find((r) => r.result === n.id);
      // Dấu danh tính: nguyên liệu cuối không phải node vai trò (nghề/hệ đã hiện riêng). Không lấy từ art.
      const symbols = final ? [final.first, final.second].filter((id) => !catalog.nodes.get(id)?.role).map((id) => nameOf(catalog, id)) : [];
      return { found: true, nodeId: n.id, pack, group, characterId: n.characterId, name: n.nameVi, tier, info, symbols };
    });
}

/** Mẹo cho người mới (sổ chỉ có 7 nguyên tố): một công thức có thật, dễ hiểu. */
export function tutorialTip(state: DiscoveryState): string | null {
  return state.discoveredRecipeIds.length === 0 ? "Mẹo: chọn Mộc vào ô trước và Mộc vào ô sau, rồi bấm Hợp Nguyên." : null;
}
