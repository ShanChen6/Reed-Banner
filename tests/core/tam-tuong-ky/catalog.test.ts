// LT-01: catalog slice và validator Tầm Tướng Ký (Design Freeze mục 7.2,
// docs/02-game-modes/tam-tuong-ky/design-freeze.md).
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { ELEMENTS } from "../../../src/core/battle";
import {
  CORE_CATALOG_DEPS,
  PACK_1,
  SLICE_PACK,
  TIER_COMBINES,
  computeMetrics,
  findCycles,
  recipeKey,
  validatePack,
  type CatalogDeps,
  type CatalogNode,
  type IssueCode,
  type Pack,
  type Recipe,
} from "../../../src/core/tam-tuong-ky";
import { portraitUrl } from "../../../src/app/game/art/portrait-data";

const DEPS: CatalogDeps = {
  ...CORE_CATALOG_DEPS,
  hasPortrait: (id) => {
    const url = portraitUrl(id);
    return url !== null && existsSync(path.join("public", url));
  },
};

const codes = (pack: Pack, severity?: "error" | "warning"): IssueCode[] =>
  validatePack(pack, DEPS)
    .filter((i) => !severity || i.severity === severity)
    .map((i) => i.code);

const withRecipes = (recipes: readonly Recipe[], base: Pack = SLICE_PACK): Pack => ({ ...base, recipes });
const withNodes = (nodes: readonly CatalogNode[], base: Pack = SLICE_PACK): Pack => ({ ...base, nodes });
const recipe = (id: string, first: string, second: string, result: string): Recipe => ({
  id,
  first,
  second,
  result,
  reason: "test",
});
const replaceRecipe = (id: string, patch: Partial<Recipe>) =>
  SLICE_PACK.recipes.map((r) => (r.id === id ? { ...r, ...patch } : r));
const node = (id: string) => SLICE_PACK.nodes.find((n) => n.id === id)!;

describe("slice-1", () => {
  it("hợp lệ: không lỗi, không cảnh báo", () => {
    assert.deepEqual(validatePack(SLICE_PACK, DEPS), []);
  });

  it("starter là đúng 7 hệ của ELEMENTS", () => {
    const starters = SLICE_PACK.nodes.filter((n) => n.kind === "element");
    assert.deepEqual(starters.map((n) => n.element), [...ELEMENTS]);
  });

  it("số lần ghép đúng theo bậc: thường 7, đặc biệt 9, lịch sử 12", () => {
    assert.deepEqual(TIER_COMBINES, { thuong: 7, dacBiet: 9, lichSu: 12 });
    const m = computeMetrics(SLICE_PACK);
    assert.deepEqual(m.get("hero.dinhNgoc"), { minCombines: 9, starterCost: 10 });
    assert.deepEqual(m.get("hero.leHoan"), { minCombines: 12, starterCost: 13 });
    assert.deepEqual(m.get("hero.nguyenBac"), { minCombines: 12, starterCost: 13 });
  });

  it("mọi node ghép được từ starter", () => {
    const m = computeMetrics(SLICE_PACK);
    for (const n of SLICE_PACK.nodes) assert.ok(m.has(n.id), n.id);
  });

  it("Gói 1 có cặp gương ra hai kết quả khác nhau; slice có công thức A+A", () => {
    const key = (a: string, b: string) => PACK_1.recipes.find((r) => recipeKey(r.first, r.second) === recipeKey(a, b));
    assert.equal(key("elt.moc", "elt.thuy")?.result, "mat.reed");
    assert.equal(key("elt.thuy", "elt.moc")?.result, "mat.herbs");
    assert.equal(key("elt.kim", "elt.tho")?.result, "mat.blackBronze");
    assert.equal(key("elt.tho", "elt.kim")?.result, "mat.jadeStone");
    assert.ok(SLICE_PACK.recipes.some((r) => r.first === r.second));
  });

  it("công thức cuối = một node vai trò khớp nghề/hệ roster (đặc biệt: dung hợp) + dấu danh tính", () => {
    for (const h of PACK_1.nodes.filter((n) => n.kind === "character")) {
      const final = PACK_1.recipes.find((r) => r.result === h.id)!;
      const inputs = [final.first, final.second].map((id) => PACK_1.nodes.find((n) => n.id === id)!);
      assert.equal(inputs.filter((n) => n.role).length, 1, h.id);
      assert.ok(h.anchors && h.anchors.length > 0, h.id);
    }
  });

  it("có node trung gian dùng chung giữa các nhánh tướng", () => {
    const uses = (id: string) => SLICE_PACK.recipes.filter((r) => r.first === id || r.second === id).length;
    assert.ok(uses("mat.commandFlag") >= 2);
    assert.ok(uses("mat.rampart") >= 2);
    assert.ok(uses("mat.bamboo") >= 3);
  });

  it("bậc tướng khớp roster, tướng lịch sử có mã nguồn có thật", () => {
    for (const h of SLICE_PACK.nodes.filter((n) => n.kind === "character")) {
      assert.equal(CORE_CATALOG_DEPS.character(h.characterId!)?.tier, h.tier, h.id);
      if (h.tier === "lichSu") assert.ok(h.historySourceIds?.every(CORE_CATALOG_DEPS.hasHistorySource), h.id);
    }
  });

  it("là bản draft, chưa phát hành", () => {
    assert.equal(SLICE_PACK.status, "draft");
  });

  it("module catalog không import roster ghi, battle engine hay profile", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const dir = "src/core/tam-tuong-ky";
    for (const f of readdirSync(dir)) {
      const src = readFileSync(path.join(dir, f), "utf8");
      assert.doesNotMatch(src, /from "\.\.\/(progress|board|match|gear|campaign\/(?!history))/, f);
      assert.doesNotMatch(src, /addCompanion|grantCompanion/, f);
    }
  });
});

describe("validator: lỗi", () => {
  it("duplicateKey: hai công thức cùng khóa có thứ tự", () => {
    const pack = withRecipes([...SLICE_PACK.recipes, recipe("r.dup", "elt.moc", "elt.thuy", "mat.herbs")]);
    assert.ok(codes(pack, "error").includes("duplicateKey"));
  });

  it("đảo thứ tự không phải trùng khóa", () => {
    assert.notEqual(recipeKey("elt.loi", "elt.moc"), recipeKey("elt.moc", "elt.loi"));
  });

  it("mirrorSameResult: A>B và B>A cùng kết quả", () => {
    const pack = withRecipes([...SLICE_PACK.recipes, recipe("r.mirror", "elt.thuy", "elt.moc", "mat.reed")]);
    assert.ok(codes(pack, "error").includes("mirrorSameResult"));
  });

  it("duplicateId: node hoặc công thức trùng ID", () => {
    assert.ok(codes(withNodes([...SLICE_PACK.nodes, node("mat.reed")]), "error").includes("duplicateId"));
    assert.ok(codes(withRecipes([...SLICE_PACK.recipes, SLICE_PACK.recipes[0]!]), "error").includes("duplicateId"));
  });

  it("missingReference: công thức trỏ tới node không có", () => {
    const pack = withRecipes([...SLICE_PACK.recipes, recipe("r.ghost", "elt.kim", "mat.ghost", "mat.reed")]);
    assert.ok(codes(pack, "error").includes("missingReference"));
  });

  it("selfResult và starterResult", () => {
    assert.ok(codes(withRecipes(replaceRecipe("r.reed", { result: "elt.moc" })), "error").includes("selfResult"));
    assert.ok(codes(withRecipes(replaceRecipe("r.rampart", { result: "elt.kim" })), "error").includes("starterResult"));
  });

  it("unreachable: node không ghép được từ starter", () => {
    const pack = withNodes([...SLICE_PACK.nodes, { id: "mat.orphan", kind: "material", nameVi: "Mồ côi" }]);
    assert.ok(codes(pack, "error").includes("unreachable"));
  });

  it("cycle: vòng phụ thuộc giữa node trung gian", () => {
    const pack = withRecipes([...SLICE_PACK.recipes, recipe("r.loop", "mat.weapon", "elt.tho", "mat.forgedIron")]);
    assert.ok(codes(pack, "error").includes("cycle"));
    assert.equal(findCycles(SLICE_PACK.recipes).length, 0);
  });

  it("heroAsInput: tướng làm nguyên liệu", () => {
    const pack = withRecipes([...SLICE_PACK.recipes, recipe("r.hero", "hero.dinhNgoc", "elt.kim", "mat.rampart")]);
    assert.ok(codes(pack, "error").includes("heroAsInput"));
  });

  it("heroRecipeCount: tướng có 0 hoặc 2 công thức cuối", () => {
    const none = withRecipes(SLICE_PACK.recipes.filter((r) => r.id !== "r.dinhNgoc"));
    assert.ok(codes(none, "error").includes("heroRecipeCount"));
    const two = withRecipes([...SLICE_PACK.recipes, recipe("r.dinhNgoc2", "mat.road", "mat.jadeSword", "hero.dinhNgoc")]);
    assert.ok(codes(two, "error").includes("heroRecipeCount"));
  });

  it("unknownCharacter và duplicateCharacter", () => {
    const unknown = withNodes(SLICE_PACK.nodes.map((n) => (n.id === "hero.dinhNgoc" ? { ...n, characterId: "khongCo" } : n)));
    assert.ok(codes(unknown, "error").includes("unknownCharacter"));
    const dup = withNodes(SLICE_PACK.nodes.map((n) => (n.id === "hero.leHoan" ? { ...n, characterId: "nguyenBac" } : n)));
    assert.ok(codes(dup, "error").includes("duplicateCharacter"));
  });

  it("tierMismatch: bậc khai báo khác roster", () => {
    const pack = withNodes(SLICE_PACK.nodes.map((n) => (n.id === "hero.dinhNgoc" ? { ...n, tier: "thuong" as const } : n)));
    assert.ok(codes(pack, "error").includes("tierMismatch"));
  });

  it("tierCombines: tướng ít hoặc nhiều lần ghép hơn số của bậc", () => {
    // Lê Hoàn rút xuống 5 lần ghép.
    const short = withRecipes(replaceRecipe("r.leHoan", { first: "mat.storm", second: "mat.commandFlag" }));
    assert.ok(codes(short, "error").includes("tierCombines"));
    // Nguyễn Bặc lên 13 lần ghép: Cờ lau cần thêm một bước.
    const long = withRecipes(
      [...replaceRecipe("r.nguyenBac", { second: "know.reedBanner2" }), recipe("r.rb2", "know.reedBanner", "elt.kim", "know.reedBanner2")],
      withNodes([...SLICE_PACK.nodes, { id: "know.reedBanner2", kind: "knowledge", nameVi: "Cờ lau 2" }]),
    );
    assert.ok(codes(long, "error").includes("tierCombines"));
  });

  it("roleMismatch: công thức cuối không có node vai trò, hoặc vai trò sai nghề/hệ roster", () => {
    const noRole = withRecipes(replaceRecipe("r.leHoan", { first: "know.warManual" }));
    assert.ok(codes(noRole, "error").includes("roleMismatch"));
    const wrong = withNodes(SLICE_PACK.nodes.map((n) => (n.id === "role.quanSuLoi" ? { ...n, role: { profession: "quanSu" as const, element: "thuy" as const } } : n)));
    assert.ok(codes(wrong, "error").includes("roleMismatch"));
    const specialAsNormal = withNodes(SLICE_PACK.nodes.map((n) => (n.id === "role.hybrid" ? { ...n, role: { profession: "tuongSi" as const, element: "kim" as const } } : n)));
    assert.ok(codes(specialAsNormal, "error").includes("roleMismatch"));
  });

  it("missingAnchor, missingClue, clueSpoils", () => {
    const strip = withNodes(SLICE_PACK.nodes.map((n) => (n.id === "hero.leHoan" ? { ...n, anchors: [], clue: undefined } : n)));
    assert.ok(codes(strip, "error").includes("missingAnchor"));
    assert.ok(codes(strip, "error").includes("missingClue"));
    const spoil = withNodes(SLICE_PACK.nodes.map((n) => (n.id === "hero.leHoan" ? { ...n, clue: { kind: "text" as const, text: "Đây là LE HOAN đấy." } } : n)));
    assert.ok(codes(spoil, "error").includes("clueSpoils"));
  });

  it("lời dẫn Gói 1 không chứa tên tướng nào trong gói", () => {
    const fold = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
    const heroes = PACK_1.nodes.filter((n) => n.kind === "character");
    for (const h of heroes) for (const other of heroes) assert.doesNotMatch(fold(h.clue!.text), new RegExp(fold(other.nameVi)), `${h.id} lộ ${other.nameVi}`);
  });

  it("missingHistorySource: tướng lịch sử không có mã nguồn hợp lệ", () => {
    for (const ids of [[], ["S99"]]) {
      const pack = withNodes(SLICE_PACK.nodes.map((n) => (n.id === "hero.leHoan" ? { ...n, historySourceIds: ids } : n)));
      assert.ok(codes(pack, "error").includes("missingHistorySource"));
    }
  });

  it("starterMismatch: thiếu một hệ", () => {
    const pack = withNodes(SLICE_PACK.nodes.filter((n) => n.id !== "elt.loi"));
    assert.ok(codes(pack, "error").includes("starterMismatch"));
  });
});

describe("validator: cảnh báo", () => {
  it("elementPlusProfession: công thức cuối là hệ + tri thức nghề của tướng", () => {
    const nodes = SLICE_PACK.nodes.map((n) => (n.id === "know.tenCircuits" ? { ...n, professionHint: "quanSu" as const } : n));
    const pack = withRecipes(replaceRecipe("r.leHoan", { first: "know.tenCircuits", second: "elt.loi" }), withNodes(nodes));
    assert.ok(codes(pack, "warning").includes("elementPlusProfession"));
  });

  it("unusedStarter: một hệ không có công thức", () => {
    const pack = withRecipes(SLICE_PACK.recipes.filter((r) => r.first !== "elt.loi" && r.second !== "elt.loi"));
    assert.ok(codes(pack, "warning").includes("unusedStarter"));
  });

  it("missingPortrait: chân dung thiếu chỉ là cảnh báo", () => {
    const deps: CatalogDeps = { ...DEPS, hasPortrait: (id) => id !== "dinhNgoc" };
    const issues = validatePack(SLICE_PACK, deps);
    assert.deepEqual(issues.map((i) => [i.severity, i.code]), [["warning", "missingPortrait"]]);
  });
});
