// LT-05: Gói 1 (10 tướng lịch sử + 2 tướng đặc biệt). Báo cáo: docs/02-game-modes/future/18-tam-tuong-ky-lt05-pack-1.md.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  ACTIVE_PACK,
  CORE_CATALOG_DEPS,
  PACK_1,
  SLICE_PACK,
  TIER_COMBINES,
  buildCatalog,
  combineNormal,
  computeMetrics,
  initialDiscovery,
  makeableRecipes,
  newTtkAccount,
  normalizeTtkAccount,
  recipeKey,
  validatePack,
  type DiscoveryState,
} from "../../../src/core/tam-tuong-ky";
import { ttkAchievements } from "../../../src/core/progress/achievements";
import { portraitUrl } from "../../../src/app/game/art/portrait-data";

const APPROVED_12 = ["nguyenBac", "dinhDien", "luuCo", "trinhTu", "leHoan", "dinhLien", "phamBachHo", "doCanhThac", "tranLam", "ngoNhatKhanh", "dinhNgoc", "vuPhong"];
const heroes = PACK_1.nodes.filter((n) => n.kind === "character");

describe("Gói 1", () => {
  it("là gói đang chạy, còn draft", () => {
    assert.equal(ACTIVE_PACK, PACK_1);
    assert.equal(PACK_1.status, "draft");
  });

  it("đúng 12 tướng Shan duyệt: 10 lịch sử, 2 đặc biệt", () => {
    assert.deepEqual(heroes.map((h) => h.characterId).sort(), [...APPROVED_12].sort());
    assert.equal(heroes.filter((h) => h.tier === "lichSu").length, 10);
    assert.deepEqual(heroes.filter((h) => h.tier === "dacBiet").map((h) => h.characterId).sort(), ["dinhNgoc", "vuPhong"]);
  });

  it("validator sạch: không lỗi, không cảnh báo (kể cả chân dung có file thật)", () => {
    const deps = { ...CORE_CATALOG_DEPS, hasPortrait: (id: string) => { const u = portraitUrl(id); return u !== null && existsSync(path.join("public", u)); } };
    assert.deepEqual(validatePack(PACK_1, deps), []);
  });

  it("số lần ghép đúng bậc: lịch sử 12, đặc biệt 9", () => {
    const m = computeMetrics(PACK_1);
    for (const h of heroes) assert.equal(m.get(h.id)?.minCombines, TIER_COMBINES[h.tier!], h.id);
  });

  it("không có ngõ cụt: mọi yếu tố không phải tướng đều là nguyên liệu của ít nhất một công thức", () => {
    const used = new Set(PACK_1.recipes.flatMap((r) => [r.first, r.second]));
    assert.deepEqual(PACK_1.nodes.filter((n) => n.kind !== "character" && !used.has(n.id)).map((n) => n.id), []);
  });

  it("công thức cuối của 12 tướng khác nhau, kể cả ba quân sư cùng cờ lệnh + thẻ tre trong art", () => {
    const finals = heroes.map((h) => PACK_1.recipes.find((r) => r.result === h.id)!);
    assert.equal(new Set(finals.map((r) => recipeKey(r.first, r.second))).size, 12);
    const inputs = (id: string) => { const r = finals.find((x) => x.result === id)!; return [r.first, r.second].sort().join(); };
    assert.equal(new Set(["hero.leHoan", "hero.tranLam", "hero.ngoNhatKhanh"].map(inputs)).size, 3);
  });

  it("giữ nguyên mọi node và công thức của slice-1", () => {
    const nodes = new Set(PACK_1.nodes.map((n) => n.id));
    const recipes = new Map(PACK_1.recipes.map((r) => [r.id, r]));
    for (const n of SLICE_PACK.nodes) assert.ok(nodes.has(n.id), n.id);
    for (const r of SLICE_PACK.recipes) assert.deepEqual(recipes.get(r.id), r);
  });

  it("sổ của slice-1 chuyển sang Gói 1 không mất tướng hay công thức", () => {
    const slice = buildCatalog(SLICE_PACK);
    let d: DiscoveryState = initialDiscovery(slice);
    for (let more = true; more; ) {
      more = false;
      for (const r of makeableRecipes(slice, d)) {
        d = combineNormal(slice, d, r.first, r.second).next;
        more = true;
      }
    }
    const moved = normalizeTtkAccount({ ...newTtkAccount(slice), discovery: d }, buildCatalog(PACK_1));
    assert.equal(moved.discovery.packId, "pack-1");
    assert.deepEqual([...moved.discovery.discoveredNodeIds].sort(), [...d.discoveredNodeIds].sort());
    assert.deepEqual(moved.discovery.discoveredRecipeIds, d.discoveredRecipeIds);
  });

  it("thành tựu bộ theo P-21: 9 bộ, tổng 3 200 vàng; bộ hệ đúng hệ của roster", () => {
    const defs = ttkAchievements(PACK_1);
    assert.equal(defs.length, 9);
    assert.equal(defs.reduce((s, d) => s + d.gold, 0), 3200);
    for (const set of PACK_1.achievementSets!.filter((x) => ["hoa", "tho", "kim", "thuy", "phong"].some((e) => x.id.endsWith(`.${e}`)))) {
      const element = set.id.split(".").at(-1);
      for (const id of set.heroIds) assert.equal(CORE_CATALOG_DEPS.character(id.slice(5))?.element, element, id);
    }
  });

  it("tướng lịch sử có nguồn: tướng theo Đinh Bộ Lĩnh S04, sứ quân S01 + S05", () => {
    const warlords = ["phamBachHo", "doCanhThac", "tranLam", "ngoNhatKhanh"];
    for (const h of heroes.filter((x) => x.tier === "lichSu"))
      assert.deepEqual(h.historySourceIds, warlords.includes(h.characterId!) ? ["S01", "S05"] : ["S04"], h.id);
  });
});
