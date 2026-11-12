// LT-02: engine ghép thuần Tầm Tướng Ký (Design Freeze mục 4 và test contract mục 7.1,
// docs/02-game-modes/tam-tuong-ky/design-freeze.md).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { ELEMENTS } from "../../../src/core/battle";
import {
  PACK_1,
  SLICE_PACK,
  buildCatalog,
  chargesCombine,
  combineNormal,
  combineRanked,
  discoveredCharacters,
  hintFor,
  initialDiscovery,
  initialRanked,
  makeableRecipes,
  replayNormal,
  type DiscoveryState,
  type RankedState,
} from "../../../src/core/tam-tuong-ky";

const catalog = buildCatalog(SLICE_PACK);
const fresh = () => initialDiscovery(catalog);

/** Ghép mọi công thức ghép được cho tới khi không còn gì mới (BFS theo tầng). */
function discoverAll(start: DiscoveryState = fresh()): DiscoveryState {
  let s = start;
  for (let more = true; more; ) {
    more = false;
    for (const r of makeableRecipes(catalog, s)) {
      s = combineNormal(catalog, s, r.first, r.second).next;
      more = true;
    }
  }
  return s;
}

const hasDuplicates = (xs: readonly string[]) => new Set(xs).size !== xs.length;

describe("chế độ Thường", () => {
  it("sổ mới có đúng 7 starter khớp ELEMENTS", () => {
    assert.deepEqual(fresh().discoveredNodeIds, ELEMENTS.map((e) => `elt.${e}`));
    assert.deepEqual(fresh().discoveredRecipeIds, []);
  });

  it("thứ tự ô quyết định kết quả: Mộc+Thủy ≠ Thủy+Mộc (Gói 1)", () => {
    const pack1 = buildCatalog(PACK_1);
    const a = combineNormal(pack1, initialDiscovery(pack1), "elt.moc", "elt.thuy");
    const b = combineNormal(pack1, initialDiscovery(pack1), "elt.thuy", "elt.moc");
    assert.equal(a.status === "created" && a.nodeId, "mat.reed");
    assert.equal(b.status === "created" && b.nodeId, "mat.herbs");
  });

  it("cặp không có công thức (Hỏa+Hỏa) là noRecipe, state giữ nguyên tham chiếu", () => {
    const s = fresh();
    const out = combineNormal(catalog, s, "elt.hoa", "elt.hoa");
    assert.equal(out.status, "noRecipe");
    assert.equal(out.next, s);
  });

  it("A+A có công thức thì ra kết quả", () => {
    const out = combineNormal(catalog, fresh(), "elt.moc", "elt.moc");
    assert.equal(out.status === "created" && out.nodeId, "mat.bamboo");
  });

  it("A+A không có công thức thì noRecipe", () => {
    assert.equal(combineNormal(catalog, fresh(), "elt.loi", "elt.loi").status, "noRecipe");
  });

  it("ghép lại công thức đã biết: alreadyKnown, không đổi state, không trừ lượt", () => {
    const s = combineNormal(catalog, fresh(), "elt.moc", "elt.thuy").next;
    const again = combineNormal(catalog, s, "elt.moc", "elt.thuy");
    assert.equal(again.status, "alreadyKnown");
    assert.equal(again.next, s);
    assert.equal(chargesCombine(again), false);
  });

  it("chỉ created và noRecipe bị trừ lần ghép", () => {
    const s = fresh();
    assert.equal(chargesCombine(combineNormal(catalog, s, "elt.moc", "elt.thuy")), true);
    assert.equal(chargesCombine(combineNormal(catalog, s, "elt.loi", "elt.loi")), true);
    assert.equal(chargesCombine(combineNormal(catalog, s, "elt.kim", "elt.xyz")), false);
  });

  it("node chưa mở: invalid/lockedInput, state giữ nguyên tham chiếu", () => {
    const s = fresh();
    const out = combineNormal(catalog, s, "mat.bamboo", "mat.cloth");
    assert.deepEqual([out.status, out.status === "invalid" && out.reason], ["invalid", "lockedInput"]);
    assert.equal(out.next, s);
  });

  it("ID không có trong catalog: invalid/unknownInput", () => {
    const s = fresh();
    const out = combineNormal(catalog, s, "elt.kim", "elt.xyz");
    assert.deepEqual([out.status, out.status === "invalid" && out.reason], ["invalid", "unknownInput"]);
    assert.equal(out.next, s);
  });

  it("tướng đã mở không làm nguyên liệu", () => {
    const all = discoverAll();
    assert.ok(all.discoveredNodeIds.includes("hero.dinhNgoc"));
    const out = combineNormal(catalog, all, "hero.dinhNgoc", "elt.kim");
    assert.deepEqual([out.status, out.status === "invalid" && out.reason], ["invalid", "lockedInput"]);
    assert.equal(out.next, all);
  });

  it("ghép thành công không tiêu nguyên liệu", () => {
    const out = combineNormal(catalog, fresh(), "elt.kim", "elt.hoa");
    assert.ok(out.next.discoveredNodeIds.includes("elt.kim") && out.next.discoveredNodeIds.includes("elt.hoa"));
  });

  it("deterministic: cùng state, cùng cặp, 100 lần ra cùng kết quả", () => {
    const s = fresh();
    const first = JSON.stringify(combineNormal(catalog, s, "elt.moc", "elt.phong"));
    for (let i = 0; i < 100; i++) assert.equal(JSON.stringify(combineNormal(catalog, s, "elt.moc", "elt.phong")), first);
  });

  it("chuỗi thao tác bất kỳ không làm sổ có ID trùng", () => {
    const ids = catalog.pack.nodes.map((n) => n.id).concat(["elt.xyz"]);
    let s = fresh();
    let seed = 7;
    for (let i = 0; i < 2000; i++) {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      const a = ids[seed % ids.length]!;
      const b = ids[(seed >> 8) % ids.length]!;
      s = combineNormal(catalog, s, a, b).next;
      if (i % 50 === 0) s = discoverAll(s);
    }
    assert.equal(hasDuplicates(s.discoveredNodeIds), false);
    assert.equal(hasDuplicates(s.discoveredRecipeIds), false);
  });

  it("từ starter khám phá được cả ba tướng và mọi node", () => {
    const all = discoverAll();
    assert.deepEqual([...discoveredCharacters(catalog, all)].sort(), ["hero.dinhNgoc", "hero.leHoan", "hero.nguyenBac"]);
    assert.equal(all.discoveredNodeIds.length, catalog.pack.nodes.length);
    assert.equal(all.discoveredRecipeIds.length, catalog.pack.recipes.length);
  });

  it("ghép ra tướng: created, isCharacter", () => {
    const before = discoverAll();
    const s: DiscoveryState = {
      ...before,
      discoveredNodeIds: before.discoveredNodeIds.filter((id) => id !== "hero.dinhNgoc"),
      discoveredRecipeIds: before.discoveredRecipeIds.filter((id) => id !== "r.dinhNgoc"),
    };
    const out = combineNormal(catalog, s, "role.hybrid", "know.guardRoad");
    assert.equal(out.status, "created");
    assert.ok(out.status === "created" && out.isCharacter && !out.nodeAlreadyKnown);
  });

  it("node đã có qua công thức khác: created nhưng nodeAlreadyKnown, không ghi node trùng", () => {
    const pack = { ...SLICE_PACK, recipes: [...SLICE_PACK.recipes, { id: "r.alt", first: "elt.tho", second: "elt.moc", result: "mat.reed", reason: "test" }] };
    const cat = buildCatalog(pack);
    const s = combineNormal(cat, initialDiscovery(cat), "elt.moc", "elt.thuy").next;
    const out = combineNormal(cat, s, "elt.tho", "elt.moc");
    assert.ok(out.status === "created" && out.nodeAlreadyKnown);
    assert.equal(out.next.discoveredNodeIds.filter((id) => id === "mat.reed").length, 1);
  });

  it("phát lại cùng chuỗi thao tác ra cùng sổ; serialize JSON rồi đọc lại vẫn ghép tiếp được", () => {
    const moves = [["elt.moc", "elt.moc"], ["elt.moc", "elt.phong"], ["mat.bamboo", "mat.cloth"], ["elt.loi", "elt.loi"]] as const;
    const a = replayNormal(catalog, moves);
    const b = replayNormal(catalog, moves);
    assert.deepEqual(a, b);
    const restored = JSON.parse(JSON.stringify(a)) as DiscoveryState;
    assert.deepEqual(combineNormal(catalog, restored, "mat.bamboo", "elt.kim"), combineNormal(catalog, a, "mat.bamboo", "elt.kim"));
  });

  it("engine và hint không dùng RNG, thời gian, mạng; không import roster, hồ sơ, battle", () => {
    for (const f of ["engine.ts", "hints.ts", "graph.ts", "types.ts"]) {
      const src = readFileSync(`src/core/tam-tuong-ky/${f}`, "utf8");
      assert.doesNotMatch(src, /Math\.random|Date\.now|new Date|fetch\(/, f);
      assert.doesNotMatch(src, /from "\.\.\/(roster|progress|campaign|board|match|gear)/, f);
      // Chỉ được import kiểu (Element, Profession) từ battle, không import code chạy.
      assert.doesNotMatch(src, /^import (?!type ).*from "\.\.\/battle"/m, f);
    }
  });
});

describe("chế độ Hạng", () => {
  /** `units`: đơn vị nguyên tố tự chọn trong túi; `stock`: node trung gian trong kho tuần. */
  const start = (units: number, stock: Record<string, number> = {}): RankedState => initialRanked(units, stock);

  it("thiếu đơn vị nguyên tố: invalid/lockedInput, túi và sổ giữ nguyên", () => {
    const s = start(1);
    const d = fresh();
    const out = combineRanked(catalog, s, d, "elt.loi", "elt.loi");
    assert.deepEqual([out.status, out.status === "invalid" && out.reason], ["invalid", "lockedInput"]);
    assert.equal(out.next, s);
    assert.equal(out.nextDiscovery, d);
  });

  it("thiếu node trung gian trong kho: invalid/lockedInput", () => {
    const out = combineRanked(catalog, start(5, { "mat.cloud": 1 }), fresh(), "mat.cloud", "mat.mountain");
    assert.deepEqual([out.status, out.status === "invalid" && out.reason], ["invalid", "lockedInput"]);
  });

  it("ghép hai nguyên tố tiêu 2 đơn vị túi (hệ nào cũng được) và cộng 1 kết quả vào kho", () => {
    const out = combineRanked(catalog, start(3), fresh(), "elt.loi", "elt.phong");
    assert.equal(out.status, "created");
    assert.equal(out.next.units, 1);
    assert.equal(out.next.unitsSpent, 2);
    assert.deepEqual(out.next.stock, { "mat.storm": 1 });
  });

  it("A+A trung gian tiêu 2 đơn vị cùng loại trong kho", () => {
    const pack1 = buildCatalog(PACK_1);
    const out = combineRanked(pack1, start(0, { "mat.rampart": 2 }), initialDiscovery(pack1), "mat.rampart", "mat.rampart");
    assert.equal(out.status, "created");
    assert.deepEqual(out.next.stock, { "mat.fortress": 1 });
    assert.equal(combineRanked(pack1, start(0, { "mat.rampart": 1 }), initialDiscovery(pack1), "mat.rampart", "mat.rampart").status, "invalid");
  });

  it("ghép sai vẫn mất nguyên liệu, không hoàn lại, sổ không đổi", () => {
    const d = fresh();
    const out = combineRanked(catalog, start(4), d, "elt.hoa", "elt.hoa");
    assert.equal(out.status, "noRecipe");
    assert.equal(out.next.units, 2);
    assert.equal(out.next.unitsSpent, 2);
    assert.equal(out.nextDiscovery, d);
  });

  it("công thức mới ở Hạng ghi vào sổ khám phá; công thức đã biết thì sổ giữ nguyên", () => {
    const d = fresh();
    const first = combineRanked(catalog, start(4), d, "elt.kim", "elt.hoa");
    assert.ok(first.status === "created" && !first.recipeAlreadyKnown);
    assert.ok(first.nextDiscovery.discoveredNodeIds.includes("mat.forgedIron"));
    const second = combineRanked(catalog, first.next, first.nextDiscovery, "elt.kim", "elt.hoa");
    assert.ok(second.status === "created" && second.recipeAlreadyKnown);
    assert.equal(second.nextDiscovery, first.nextDiscovery);
    assert.equal(second.next.stock["mat.forgedIron"], 2);
  });

  it("tướng không vào kho; ghép ra lần hai không tính thêm", () => {
    const stock = { "role.hybrid": 2, "know.guardRoad": 2 };
    const one = combineRanked(catalog, start(0, stock), fresh(), "role.hybrid", "know.guardRoad");
    assert.ok(one.status === "created" && one.isCharacter && !one.heroAlreadyCreated);
    assert.deepEqual(one.next.stock, { "role.hybrid": 1, "know.guardRoad": 1 });
    assert.deepEqual(one.next.heroesCreated, ["hero.dinhNgoc"]);
    const two = combineRanked(catalog, one.next, one.nextDiscovery, "role.hybrid", "know.guardRoad");
    assert.ok(two.status === "created" && two.heroAlreadyCreated);
    assert.deepEqual(two.next.heroesCreated, ["hero.dinhNgoc"]);
    assert.deepEqual(two.next.stock, {});
  });

  it("tướng không làm nguyên liệu ở Hạng", () => {
    const out = combineRanked(catalog, start(5, { "hero.dinhNgoc": 1 }), fresh(), "hero.dinhNgoc", "elt.kim");
    assert.deepEqual([out.status, out.status === "invalid" && out.reason], ["invalid", "lockedInput"]);
  });

  it("ghép đủ Đinh Ngọc tiêu đúng 10 đơn vị và 9 lần ghép", () => {
    const plan: readonly (readonly [string, string])[] = [
      ["elt.thuy", "elt.phong"], ["elt.tho", "elt.phong"], ["mat.cloud", "mat.mountain"],
      ["elt.tho", "elt.tho"], ["mat.rampart", "elt.phong"],
      ["elt.thuy", "elt.thuy"], ["elt.moc", "mat.dew"], ["mat.road", "mat.gourd"],
      ["role.hybrid", "know.guardRoad"],
    ];
    let s = start(10);
    let d = fresh();
    for (const [a, b] of plan) {
      const out = combineRanked(catalog, s, d, a, b);
      assert.equal(out.status, "created", `${a}+${b}`);
      s = out.next;
      d = out.nextDiscovery;
    }
    assert.equal(plan.length, 9);
    assert.equal(s.units, 0);
    assert.equal(s.unitsSpent, 10);
    assert.deepEqual(s.stock, {});
    assert.deepEqual(s.heroesCreated, ["hero.dinhNgoc"]);
  });
});

describe("gợi ý", () => {
  it("mức 1 chỉ lộ nhóm, mức 2 lộ một nguyên liệu, không lộ đủ công thức", () => {
    const s = fresh();
    const h1 = hintFor(catalog, s, 1);
    const h2 = hintFor(catalog, s, 2);
    assert.ok(h1 && h1.level === 1 && !("ingredientId" in h1));
    assert.ok(h2 && h2.level === 2);
    assert.deepEqual(Object.keys(h2).sort(), ["hintGroup", "ingredientId", "level"]);
  });

  it("gợi ý luôn chỉ tới công thức ghép được ngay và chưa tìm", () => {
    let s = fresh();
    for (let i = 0; i < catalog.pack.recipes.length; i++) {
      const h = hintFor(catalog, s, 2);
      if (!h || h.level !== 2) break;
      const target = makeableRecipes(catalog, s).find((r) => r.first === h.ingredientId || r.second === h.ingredientId);
      assert.ok(target, `gợi ý ${h.ingredientId} không ứng với công thức ghép được`);
      s = combineNormal(catalog, s, target.first, target.second).next;
    }
    assert.equal(hintFor(catalog, discoverAll(), 1), null);
  });

  it("gợi ý deterministic và không đổi state", () => {
    const s = fresh();
    const snapshot = JSON.stringify(s);
    assert.deepEqual(hintFor(catalog, s, 2), hintFor(catalog, s, 2));
    assert.equal(JSON.stringify(s), snapshot);
  });
});
