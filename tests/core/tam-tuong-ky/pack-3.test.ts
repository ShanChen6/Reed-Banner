// Gói 3: 56 tướng thường, 8 nghề × 7 hệ (docs/02-game-modes/tam-tuong-ky/goi-3.md).
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { ALL_COMPANIONS, EXPANSION_COMPANIONS, SPECIAL_COMPANIONS } from "../../../src/core/roster/roster";
import {
  CORE_CATALOG_DEPS,
  PACK_1,
  PACK_1_2,
  PACK_1_2_3,
  PACK_3,
  TIER_COMBINES,
  activePack,
  catalogForPack,
  computeMetrics,
  featuredFor,
  rotationOrder,
  rosterCharacter,
  validatePack,
  weekIndex,
  type Pack,
} from "../../../src/core/tam-tuong-ky";
import { portraitUrl } from "../../../src/app/game/art/portrait-data";

const heroes3 = PACK_1_2_3.nodes.filter((n) => n.kind === "character" && n.pack === "pack-3");
const deps = { ...CORE_CATALOG_DEPS, hasPortrait: (id: string) => { const u = portraitUrl(id); return u !== null && existsSync(path.join("public", u)); } };
const weekOf = (w: number) => new Date(Date.UTC(2026, 0, 5 + 7 * w)).toISOString().slice(0, 10);

/** Cách xoay vòng trước Gói 3 (không có bước thay ô cuối), để chứng minh gói cũ không đổi đề cử. */
function oldFeatured(pack: Pack, week: string): string[] {
  const order = rotationOrder(pack);
  const n = Math.min(7, order.length);
  const start = (((weekIndex(week) * n) % order.length) + order.length) % order.length;
  return Array.from({ length: n }, (_, i) => order[(start + i) % order.length]!);
}

describe("Gói 3", () => {
  it("đủ mọi tướng trong game: Gói 1 + 2 + 3 phủ hết roster (kể cả mở rộng, đặc biệt) và Đinh Bộ Lĩnh", () => {
    const all = new Set([...ALL_COMPANIONS, ...EXPANSION_COMPANIONS, ...SPECIAL_COMPANIONS].map((c) => c.id));
    all.add("dinhBoLinh");
    const inPack = new Set(PACK_1_2_3.nodes.filter((n) => n.kind === "character").map((n) => n.characterId));
    assert.deepEqual([...all].filter((id) => !inPack.has(id)), []);
    assert.equal(inPack.size, 77);
  });

  it("56 tướng thường, mỗi tổ hợp nghề × hệ đúng một người", () => {
    assert.equal(heroes3.length, 56);
    assert.ok(heroes3.every((h) => h.tier === "thuong"));
    const combos = new Set(heroes3.map((h) => { const i = rosterCharacter(h.characterId!)!; return `${i.profession}/${i.element}`; }));
    assert.equal(combos.size, 56);
  });

  it("sổ ba gói hợp lệ: không lỗi, không cảnh báo, không ngõ cụt", () => {
    assert.deepEqual(validatePack(PACK_1_2_3, deps), []);
    const used = new Set(PACK_1_2_3.recipes.flatMap((r) => [r.first, r.second]));
    assert.deepEqual(PACK_1_2_3.nodes.filter((n) => n.kind !== "character" && !used.has(n.id)).map((n) => n.id), []);
  });

  it("tướng thường đúng 7 lần ghép; Gói 3 không đổi độ khó yếu tố nào của Gói 1, Gói 2", () => {
    const m = computeMetrics(PACK_1_2_3);
    for (const h of heroes3) assert.equal(m.get(h.id)?.minCombines, TIER_COMBINES.thuong, h.id);
    const m12 = computeMetrics(PACK_1_2);
    for (const n of PACK_1_2.nodes) assert.deepEqual(m.get(n.id), m12.get(n.id), n.id);
  });

  it("lời dẫn và tên yếu tố Gói 3 không chứa tên tướng nào", () => {
    const fold = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
    const names = PACK_1_2_3.nodes.filter((n) => n.kind === "character").map((n) => fold(n.nameVi));
    const texts = [...heroes3.map((h) => h.clue!.text), ...PACK_3.nodes.filter((n) => n.kind !== "character").map((n) => n.nameVi)];
    for (const t of texts) for (const name of names) assert.doesNotMatch(fold(t), new RegExp(`\\b${name}\\b`), `${t} lộ ${name}`);
  });

  it("Gói 3 đã duyệt (published): 9 thành tựu bộ, tổng 3 500 vàng, có trong danh sách", async () => {
    assert.equal(PACK_3.status, "published");
    const { ACHIEVEMENTS } = await import("../../../src/core");
    const pack3 = ACHIEVEMENTS.filter((a) => a.id.startsWith("ttk.pack-3."));
    assert.equal(pack3.length, 9);
    assert.equal(pack3.reduce((s, a) => s + a.gold, 0), 3500);
    assert.equal(PACK_3.achievementSets!.length, 9);
    assert.ok(PACK_3.achievementSets!.slice(0, 8).every((s) => s.heroIds.length === 7));
  });
});

describe("cờ Gói 3 và xoay vòng", () => {
  it("Gói 3 cần Gói 2; client chọn đúng sổ", () => {
    assert.equal(activePack(false, true), PACK_1);
    assert.equal(activePack(true, true), PACK_1_2_3);
    assert.equal(catalogForPack("pack-1-2-3").pack, PACK_1_2_3);
  });

  it("đề cử của Gói 1 và Gói 1 + 2 không đổi so với trước (đang chạy)", () => {
    for (let w = 0; w < 120; w++) {
      assert.deepEqual(featuredFor(PACK_1, weekOf(w)), oldFeatured(PACK_1, weekOf(w)));
      assert.deepEqual(featuredFor(PACK_1_2, weekOf(w)), oldFeatured(PACK_1_2, weekOf(w)));
    }
  });

  it("sổ ba gói: tuần nào cũng 7 tướng khác nhau, có ít nhất một tướng đặc biệt", () => {
    const tier = (id: string) => PACK_1_2_3.nodes.find((n) => n.id === id)!.tier;
    for (let w = 0; w < 120; w++) {
      const list = featuredFor(PACK_1_2_3, weekOf(w));
      assert.equal(new Set(list).size, 7, weekOf(w));
      assert.ok(list.some((id) => tier(id) === "dacBiet"), weekOf(w));
    }
  });
});
