import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { GEAR_SLOTS, PROFESSIONS, TIERS } from "../../src/core";
import { gearArtSrc, tierFrameSrc } from "../../src/app/game/art/gear";

test("bộ Cờ Lau có ảnh cho cả 9 ô và vũ khí của mọi nghề", () => {
  for (const slot of GEAR_SLOTS) {
    const professions = slot === "vuKhi" ? PROFESSIONS : [undefined];
    for (const profession of professions) {
      const src = gearArtSrc(slot, "coLau", profession);
      assert.ok(src, `${slot} ${profession ?? ""}`);
      assert.ok(existsSync(`public${src}`), src);
    }
  }
});

test("bộ chưa có ảnh và món không bộ giữ hình SVG", () => {
  assert.equal(gearArtSrc("dinhMao", "hoaLu"), undefined);
  assert.equal(gearArtSrc("dinhMao", undefined), undefined);
});

test("mỗi phẩm có ảnh khung", () => {
  for (const tier of TIERS) assert.ok(existsSync(`public${tierFrameSrc(tier)}`));
});
