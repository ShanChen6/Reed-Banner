// Gói 2: 8 sứ quân còn lại + Đinh Bộ Lĩnh, gộp chung sổ với Gói 1 (docs/02-game-modes/future/21-tam-tuong-ky-pack-2.md).
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  CORE_CATALOG_DEPS,
  KNOWN_NODE_IDS,
  KNOWN_RECIPE_IDS,
  PACK_1,
  PACK_1_2,
  PACK_2,
  TIER_COMBINES,
  activePack,
  buildCatalog,
  catalogForPack,
  computeMetrics,
  featuredFor,
  newTtkAccount,
  normalizeTtkAccount,
  rosterCharacter,
  validatePack,
} from "../../../src/core/tam-tuong-ky";
import { portraitUrl } from "../../../src/app/game/art/portrait-data";

const heroes2 = PACK_1_2.nodes.filter((n) => n.kind === "character" && n.pack === "pack-2");
const deps = { ...CORE_CATALOG_DEPS, hasPortrait: (id: string) => { const u = portraitUrl(id); return u !== null && existsSync(path.join("public", u)); } };

describe("Gói 2", () => {
  it("8 sứ quân còn lại + Đinh Bộ Lĩnh (đặc biệt)", () => {
    assert.deepEqual(heroes2.map((h) => h.characterId).sort(), ["dinhBoLinh", "kieuCongHan", "kieuThuan", "luDuong", "lyKhue", "ngoXuongXi", "nguyenKhoan", "nguyenSieu", "nguyenThuTiep"]);
    assert.equal(heroes2.filter((h) => h.tier === "lichSu").length, 8);
    assert.equal(rosterCharacter("dinhBoLinh")?.tier, "dacBiet");
  });

  it("sổ gộp hợp lệ: không lỗi, không cảnh báo; 21 tướng", () => {
    assert.deepEqual(validatePack(PACK_1_2, deps), []);
    assert.equal(PACK_1_2.nodes.filter((n) => n.kind === "character").length, 21);
  });

  it("số lần ghép đúng bậc: lịch sử 12, đặc biệt 9", () => {
    const m = computeMetrics(PACK_1_2);
    for (const h of heroes2) assert.equal(m.get(h.id)?.minCombines, TIER_COMBINES[h.tier!], h.id);
  });

  it("Gói 2 không đổi nghĩa ID nào của Gói 1, không làm thay đổi số lần ghép của Gói 1", () => {
    const ids1 = new Set(PACK_1.nodes.map((n) => n.id));
    for (const n of PACK_2.nodes) assert.ok(!ids1.has(n.id), n.id);
    const m1 = computeMetrics(PACK_1);
    const m12 = computeMetrics(PACK_1_2);
    for (const n of PACK_1.nodes) assert.deepEqual(m12.get(n.id), m1.get(n.id), n.id);
  });

  it("không ngõ cụt, công thức cuối 21 tướng khác nhau", () => {
    const used = new Set(PACK_1_2.recipes.flatMap((r) => [r.first, r.second]));
    assert.deepEqual(PACK_1_2.nodes.filter((n) => n.kind !== "character" && !used.has(n.id)).map((n) => n.id), []);
    const finals = PACK_1_2.recipes.filter((r) => r.result.startsWith("hero."));
    assert.equal(new Set(finals.map((r) => `${r.first}>${r.second}`)).size, 21);
  });

  it("lời dẫn không chứa tên tướng nào trong sổ gộp", () => {
    const fold = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
    const all = PACK_1_2.nodes.filter((n) => n.kind === "character");
    for (const h of heroes2) for (const o of all) assert.doesNotMatch(fold(h.clue!.text), new RegExp(fold(o.nameVi)), `${h.id} lộ ${o.nameVi}`);
  });

  it("Gói 2 đã duyệt: 8 thành tựu (3 500 vàng) vào danh sách; trang Nhiệm vụ chỉ hiện khi cờ Gói 2 bật", async () => {
    assert.equal(PACK_2.status, "published");
    const { ACHIEVEMENTS } = await import("../../../src/core");
    const pack2 = ACHIEVEMENTS.filter((a) => a.id.startsWith("ttk.pack-2."));
    assert.equal(pack2.length, 8);
    assert.equal(pack2.reduce((s, a) => s + a.gold, 0), 3500);
    const { isTamTuongKyPack2Achievement } = await import("../../../src/app/game/quests/QuestsScreen");
    assert.ok(pack2.every((a) => isTamTuongKyPack2Achievement(a.id)));
    assert.equal(isTamTuongKyPack2Achievement("ttk.pack-1.all"), false);
  });
});

describe("gộp sổ và cờ Gói 2", () => {
  it("cờ chọn sổ; client chọn đúng sổ theo packId", () => {
    assert.equal(activePack(false), PACK_1);
    assert.equal(activePack(true), PACK_1_2);
    assert.equal(catalogForPack("pack-1-2").pack, PACK_1_2);
    assert.equal(catalogForPack("lạ").pack, PACK_1);
  });

  it("tắt Gói 2 không làm mất khám phá Gói 2 trong sổ", () => {
    const base = newTtkAccount(buildCatalog(PACK_1_2));
    const withPack2 = { ...base, discovery: { ...base.discovery, discoveredNodeIds: [...base.discovery.discoveredNodeIds, "hero.lyKhue", "mat.grain"], discoveredRecipeIds: ["r.lyKhue", "r.grain"] } };
    const off = normalizeTtkAccount(withPack2, buildCatalog(PACK_1), { nodes: KNOWN_NODE_IDS, recipes: KNOWN_RECIPE_IDS });
    assert.ok(off.discovery.discoveredNodeIds.includes("hero.lyKhue"));
    assert.ok(off.discovery.discoveredRecipeIds.includes("r.grain"));
    const strict = normalizeTtkAccount({ ...withPack2, discovery: { ...withPack2.discovery, discoveredNodeIds: [...withPack2.discovery.discoveredNodeIds, "mat.khongCo"] } }, buildCatalog(PACK_1), { nodes: KNOWN_NODE_IDS, recipes: KNOWN_RECIPE_IDS });
    assert.equal(strict.discovery.discoveredNodeIds.includes("mat.khongCo"), false);
  });

  it("Hạng xoay vòng qua 21 tướng: tuần nào cũng có tướng đặc biệt, có tướng Gói 2", () => {
    let sawPack2 = false;
    for (let w = 0; w < 21; w++) {
      const week = new Date(Date.UTC(2026, 0, 5 + 7 * w)).toISOString().slice(0, 10);
      const list = featuredFor(PACK_1_2, week);
      assert.equal(new Set(list).size, 7);
      assert.ok(list.some((id) => PACK_1_2.nodes.find((n) => n.id === id)!.tier === "dacBiet"), week);
      if (list.some((id) => heroes2.some((h) => h.id === id))) sawPack2 = true;
    }
    assert.ok(sawPack2);
  });
});
