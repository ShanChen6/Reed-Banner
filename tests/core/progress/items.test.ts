import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyProfileAction,
  ENHANCE_MAX,
  enhanceCost,
  itemStat,
  newProfile,
  parseProfile,
  parseProfileAction,
  progressOf,
  SHOP_ITEM_PRICE,
  XP_BOOK_XP,
  type GearItem,
  type Profile,
} from "../../../src/core";

const item: GearItem = { id: "g1", slot: "dinhMao", element: "moc", tier: 2, set: "coLau" };
const ok = (r: ReturnType<typeof applyProfileAction>): Profile => {
  assert.ok(r.ok, r.ok ? "" : r.error);
  return r.profile;
};

describe("cường hóa trang bị", () => {
  it("mỗi cấp +4% chỉ số riêng của món, tốn đá và vàng tăng dần, tối đa +5", () => {
    let p: Profile = { ...newProfile(), gold: 10_000, stones: 20, bag: [item], nextItemId: 2 };
    const base = itemStat(item, "moc");
    let spent = 0;
    for (let lv = 0; lv < ENHANCE_MAX; lv++) {
      const cost = enhanceCost({ tier: 2, enhance: lv })!;
      assert.deepEqual(cost, { stones: lv + 1, gold: 50 * (lv + 1) * 2 });
      spent += cost.stones;
      p = ok(applyProfileAction(p, { type: "enhance", item: "g1" }));
    }
    const done = p.bag[0]!;
    assert.equal(done.enhance, 5);
    assert.equal(p.stones, 20 - spent);
    // +5 là +20% chỉ số riêng của món (sai số do làm tròn).
    assert.ok(Math.abs(itemStat(done, "moc") / base - 1.2) < 0.05);
    assert.deepEqual(applyProfileAction(p, { type: "enhance", item: "g1" }), { ok: false, error: "maxEnhance" });
    // Lưu rồi đọc lại giữ cấp cường hóa.
    assert.equal(parseProfile(JSON.parse(JSON.stringify(p))).bag[0]!.enhance, 5);
  });

  it("thiếu đá thì báo lỗi, không trừ gì", () => {
    const p: Profile = { ...newProfile(), gold: 10_000, stones: 0, bag: [item], nextItemId: 2 };
    assert.deepEqual(applyProfileAction(p, { type: "enhance", item: "g1" }), { ok: false, error: "notEnoughStones" });
  });

  it("cấp cường hóa hỏng khi đọc lại thì bỏ món", () => {
    const p = parseProfile({ ...newProfile(), bag: [{ ...item, enhance: 9 }] });
    assert.equal(p.bag.length, 0);
  });
});

describe("vật phẩm Cửa Hàng", () => {
  it("mua Đá Cường Hóa và sách kinh nghiệm bằng vàng", () => {
    let p: Profile = { ...newProfile(), gold: 1000 };
    p = ok(applyProfileAction(p, { type: "buyItem", item: "stone", amount: 2 }));
    p = ok(applyProfileAction(p, { type: "buyItem", item: "xpBook", amount: 3 }));
    assert.equal(p.stones, 2);
    assert.equal(p.xpBooks, 3);
    assert.equal(p.gold, 1000 - 2 * SHOP_ITEM_PRICE.stone - 3 * SHOP_ITEM_PRICE.xpBook);
    assert.deepEqual(applyProfileAction(p, { type: "buyItem", item: "stone", amount: 999 }), { ok: false, error: "stackFull" });
    assert.equal(parseProfileAction({ type: "buyItem", item: "vang", amount: 1 }), null);
  });

  it("dùng sách cộng kinh nghiệm cho tướng đã có, hết sách thì bỏ trường", () => {
    let p: Profile = { ...newProfile(), xpBooks: 2 };
    const before = progressOf(p, "haVan").xp;
    p = ok(applyProfileAction(p, { type: "useXpBook", character: "haVan", amount: 2 }));
    assert.equal(progressOf(p, "haVan").xp, before + 2 * XP_BOOK_XP);
    assert.ok(progressOf(p, "haVan").level > 1);
    assert.equal(p.xpBooks, undefined);
    assert.deepEqual(applyProfileAction(p, { type: "useXpBook", character: "haVan", amount: 1 }), { ok: false, error: "noBooks" });
    assert.deepEqual(applyProfileAction({ ...p, xpBooks: 1 }, { type: "useXpBook", character: "leHoan", amount: 1 }), { ok: false, error: "notOwned" });
  });
});
