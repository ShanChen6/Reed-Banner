import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activeBonuses,
  buildMatchups,
  createRng,
  DROP_TIER_WEIGHTS,
  equippedItems,
  mainCharacter,
  mergeCost,
  presetLoadout,
  rollDrop,
} from "../../../src/core";

describe("bảng rơi đồ", () => {
  it("mỗi độ khó cộng lại 100, khó hơn thì phẩm cao nhiều hơn", () => {
    const rows = Object.values(DROP_TIER_WEIGHTS);
    for (const r of rows) assert.equal(r.reduce((a, b) => a + b, 0), 100);
    const high = (r: readonly number[]) => r[2]! + r[3]! + r[4]!;
    for (let i = 1; i < rows.length; i++) assert.ok(high(rows[i]!) > high(rows[i - 1]!));
  });

  it("thắng luôn rơi 1 món, tất định theo seed; vũ khí có nghề", () => {
    for (let seed = 0; seed < 200; seed++) {
      const a = rollDrop(createRng(seed), "hard", true, "x");
      assert.ok(a);
      assert.deepEqual(a, rollDrop(createRng(seed), "hard", true, "x"));
      assert.equal(a.slot === "vuKhi", a.profession !== undefined);
    }
  });

  it("thua đôi khi rơi, phẩm tối đa Lục", () => {
    let drops = 0;
    for (let seed = 0; seed < 400; seed++) {
      const d = rollDrop(createRng(seed), "nightmare", false, "x");
      if (!d) continue;
      drops++;
      assert.ok(d.tier <= 2);
    }
    assert.ok(drops > 60 && drops < 180);
  });

  it("phí ghép thấp, tăng theo bậc, bậc Cam không ghép", () => {
    assert.deepEqual([1, 2, 3, 4, 5].map((t) => mergeCost(t as 1)), [10, 20, 40, 80, 0]);
  });
});

describe("bộ đồ mẫu", () => {
  it("đủ 9 món; có bộ thì đạt mốc 9, không bộ thì chỉ còn cộng hưởng", () => {
    const withSet = equippedItems(presetLoadout("kim", "tuongSi", 3, "hoaLu"), "tuongSi");
    assert.equal(withSet.length, 9);
    assert.deepEqual(activeBonuses(withSet).map((b) => `${b.kind}:${b.level}`), ["set:6", "set:9", "resonance:6", "resonance:9"]);
    const none = equippedItems(presetLoadout("kim", "tuongSi", 3, null), "tuongSi");
    assert.deepEqual(activeBonuses(none).map((b) => b.kind), ["resonance", "resonance"]);
  });

  it("mô phỏng mặc đồ cho cả hai phe", () => {
    const [m] = buildMatchups("3v3", 1, 1, "kim", { tier: 2, sets: ["coLau", null] });
    const main = m!.sides[0].fighters[0]!;
    assert.ok(main.atk > mainCharacter("kim").atk);
    for (const side of m!.sides) for (const f of side.fighters) assert.ok(f.def > 8);
  });
});
