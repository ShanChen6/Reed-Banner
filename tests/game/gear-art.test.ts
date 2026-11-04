import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { GEAR_SETS, GEAR_SLOTS, PROFESSIONS, TIERS } from "../../src/core";
import { emptySlotSrc, gearArtSrc, setEmblemSrc, tierFrameSrc } from "../../src/app/game/art/gear";

for (const [set, name] of [
  ["coLau", "Cờ Lau"],
  ["hoaLu", "Hoa Lư"],
  ["dongCo", "Đồng Cổ"],
] as const) {
  test(`bộ ${name} có ảnh cho cả 9 ô và vũ khí của mọi nghề`, () => {
    for (const slot of GEAR_SLOTS) {
      const professions = slot === "vuKhi" ? PROFESSIONS : [undefined];
      for (const profession of professions) {
        const src = gearArtSrc(slot, set, profession);
        assert.ok(src, `${slot} ${profession ?? ""}`);
        assert.ok(existsSync(`public${src}`), src);
      }
    }
  });
}

test("bộ lạ và món không bộ giữ hình SVG", () => {
  assert.equal(gearArtSrc("dinhMao", "khongCo"), undefined);
  assert.equal(gearArtSrc("dinhMao", undefined), undefined);
});

test("mỗi phẩm có ảnh khung", () => {
  for (const tier of TIERS) assert.ok(existsSync(`public${tierFrameSrc(tier)}`));
});

test("mỗi bộ có huy hiệu", () => {
  for (const set of GEAR_SETS) {
    const src = setEmblemSrc(set.id);
    assert.ok(src && existsSync(`public${src}`), set.id);
  }
  assert.equal(setEmblemSrc("khongCo"), undefined);
});

test("mỗi ô có bóng ô trống", () => {
  for (const slot of GEAR_SLOTS) assert.ok(existsSync(`public${emptySlotSrc(slot)}`), slot);
});
