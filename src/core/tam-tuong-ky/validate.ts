// Validator catalog Tầm Tướng Ký: test contract mục 7.2 của Design Freeze
// (docs/02-game-modes/future/14-tam-tuong-ky-design-freeze.md).

import { ELEMENTS } from "../battle";
import { computeMetrics, findCycles, recipeKey } from "./graph";
import type { CatalogDeps, CatalogIssue, CatalogNode, HeroTier, Pack } from "./types";

/** Số lần ghép tối thiểu của mỗi tướng theo bậc (P-5, Shan chốt 03/11/2026): cố định, không phải khung. */
export const TIER_COMBINES: Readonly<Record<HeroTier, number>> = {
  thuong: 7,
  dacBiet: 9,
  lichSu: 12,
};

export function validatePack(pack: Pack, deps: CatalogDeps): readonly CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const error = (code: CatalogIssue["code"], message: string, ref?: string) =>
    issues.push({ severity: "error", code, message, ref });
  const warn = (code: CatalogIssue["code"], message: string, ref?: string) =>
    issues.push({ severity: "warning", code, message, ref });

  // ID duy nhất.
  const nodes = new Map<string, CatalogNode>();
  for (const n of pack.nodes) {
    if (nodes.has(n.id)) error("duplicateId", `Node trùng ID ${n.id}`, n.id);
    nodes.set(n.id, n);
  }
  const recipeIds = new Set<string>();
  for (const r of pack.recipes) {
    if (recipeIds.has(r.id)) error("duplicateId", `Công thức trùng ID ${r.id}`, r.id);
    recipeIds.add(r.id);
  }

  // Starter khớp đúng 7 hệ.
  const starters = pack.nodes.filter((n) => n.kind === "element");
  const starterElements = starters.map((n) => n.element).sort();
  if (starters.length !== ELEMENTS.length || [...ELEMENTS].sort().join() !== starterElements.join())
    error("starterMismatch", `Starter phải là đúng 7 hệ ${ELEMENTS.join(", ")}`);

  // Tham chiếu, khóa, cặp gương, kết quả không hợp lệ, tướng làm nguyên liệu.
  const byKey = new Map<string, string>();
  for (const r of pack.recipes) {
    for (const id of [r.first, r.second, r.result])
      if (!nodes.has(id)) error("missingReference", `${r.id} trỏ tới node không có: ${id}`, r.id);
    const key = recipeKey(r.first, r.second);
    if (byKey.has(key)) error("duplicateKey", `${r.id} trùng khóa ${key} với ${byKey.get(key)}`, r.id);
    byKey.set(key, r.id);
    if (r.result === r.first || r.result === r.second) error("selfResult", `${r.id} ra chính nguyên liệu`, r.id);
    if (nodes.get(r.result)?.kind === "element") error("starterResult", `${r.id} ra starter ${r.result}`, r.id);
    for (const id of [r.first, r.second])
      if (nodes.get(id)?.kind === "character") error("heroAsInput", `${r.id} dùng tướng ${id} làm nguyên liệu`, r.id);
  }
  for (const r of pack.recipes) {
    if (r.first === r.second) continue;
    const mirrorId = byKey.get(recipeKey(r.second, r.first));
    const mirror = pack.recipes.find((x) => x.id === mirrorId);
    if (mirror && mirror.result === r.result && r.id < mirror.id)
      error("mirrorSameResult", `${r.id} và ${mirror.id} là cặp gương nhưng cùng ra ${r.result}`, r.id);
  }

  // Vòng phụ thuộc và khả năng đạt được.
  for (const cycle of findCycles(pack.recipes)) error("cycle", `Vòng phụ thuộc: ${cycle.join(" → ")}`, cycle[0]);
  const metrics = computeMetrics(pack);
  for (const n of pack.nodes)
    if (!metrics.has(n.id)) error("unreachable", `Không ghép được ${n.id} từ 7 starter`, n.id);

  // Tướng.
  const heroes = pack.nodes.filter((n) => n.kind === "character");
  const seenCharacter = new Map<string, string>();
  for (const h of heroes) {
    const finals = pack.recipes.filter((r) => r.result === h.id);
    if (finals.length !== 1) error("heroRecipeCount", `${h.id} có ${finals.length} công thức cuối, cần đúng 1`, h.id);
    if (!h.characterId || !h.tier) {
      error("unknownCharacter", `${h.id} thiếu characterId hoặc tier`, h.id);
      continue;
    }
    if (seenCharacter.has(h.characterId))
      error("duplicateCharacter", `${h.id} và ${seenCharacter.get(h.characterId)} cùng ${h.characterId}`, h.id);
    seenCharacter.set(h.characterId, h.id);
    const info = deps.character(h.characterId);
    if (!info) {
      error("unknownCharacter", `Không có ${h.characterId} trong roster`, h.id);
      continue;
    }
    if (info.tier !== h.tier) error("tierMismatch", `${h.id} khai bậc ${h.tier}, roster là ${info.tier}`, h.id);
    if (deps.hasPortrait && !deps.hasPortrait(h.characterId))
      warn("missingPortrait", `${h.characterId} chưa có chân dung, dùng ảnh thay thế`, h.id);
    if (h.tier === "lichSu") {
      const ids = h.historySourceIds ?? [];
      if (ids.length === 0 || ids.some((id) => !deps.hasHistorySource(id)))
        error("missingHistorySource", `${h.id} là tướng lịch sử nhưng thiếu mã nguồn hợp lệ`, h.id);
    }
    const m = metrics.get(h.id);
    if (m && m.minCombines !== TIER_COMBINES[h.tier])
      error("tierCombines", `${h.id} cần ${m.minCombines} lần ghép, bậc ${h.tier} phải đúng ${TIER_COMBINES[h.tier]}`, h.id);
    for (const r of finals) {
      const [a, b] = [nodes.get(r.first), nodes.get(r.second)];
      const isOwnElement = (n?: CatalogNode) => n?.kind === "element" && n.element === info.element;
      const isOwnProfession = (n?: CatalogNode) => n?.kind === "knowledge" && n.professionHint === info.profession;
      if ((isOwnElement(a) && isOwnProfession(b)) || (isOwnElement(b) && isOwnProfession(a)))
        warn("elementPlusProfession", `${r.id} là “hệ + nghề” của ${h.id}`, r.id);
    }
  }

  // Thành tựu bộ: ID duy nhất, từ 2 tướng của pack trở lên, vàng không âm (P-20).
  const setIds = new Set<string>();
  for (const set of pack.achievementSets ?? []) {
    const heroIds = new Set(set.heroIds);
    if (setIds.has(set.id) || heroIds.size < 2 || heroIds.size !== set.heroIds.length || !Number.isInteger(set.gold) || set.gold < 0 ||
        set.heroIds.some((id) => nodes.get(id)?.kind !== "character"))
      error("badAchievementSet", `Thành tựu ${set.id} không hợp lệ: cần ID riêng, ≥ 2 tướng khác nhau của pack, vàng ≥ 0`, set.id);
    setIds.add(set.id);
  }

  // Mọi starter có ích.
  const used = new Set(pack.recipes.flatMap((r) => [r.first, r.second]));
  for (const s of starters) if (!used.has(s.id)) warn("unusedStarter", `Starter ${s.id} không có công thức nào`, s.id);

  return issues;
}

export function catalogErrors(pack: Pack, deps: CatalogDeps): readonly CatalogIssue[] {
  return validatePack(pack, deps).filter((i) => i.severity === "error");
}
