import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyProfileAction,
  BAG_LIMIT,
  loadoutOf,
  newProfile,
  parseProfile,
  parseProfileAction,
  profileTeam,
  receiveDrop,
  SELL_GOLD,
  SHOP_GEAR_PRICE,
  wearerOf,
  type GearItem,
  type Profile,
  type ProfileAction,
} from "../../../src/core";

function run(p: Profile, ...actions: ProfileAction[]): Profile {
  for (const a of actions) {
    const r = applyProfileAction(p, a);
    assert.ok(r.ok, r.ok ? "" : `${a.type}: ${r.error}`);
    p = r.profile;
  }
  return p;
}

const drop = (extra: Partial<GearItem> = {}): GearItem => ({ id: "", slot: "dinhMao", element: "kim", tier: 1, set: "coLau", ...extra });

describe("túi đồ và ô trang bị", () => {
  it("món rơi vào túi với id của hồ sơ; túi đầy thì bán ngay", () => {
    const a = receiveDrop(newProfile(), drop());
    assert.equal(a.item?.id, "g1");
    assert.equal(a.profile.nextItemId, 2);
    const full = { ...newProfile(), bag: Array.from({ length: BAG_LIMIT }, (_, i) => drop({ id: `x${i}` })) };
    const b = receiveDrop(full, drop({ tier: 3 }));
    assert.equal(b.item, null);
    assert.equal(b.profile.gold, SELL_GOLD[3]);
  });

  it("mặc đồ cộng chỉ số vào trận; mỗi món chỉ một người mặc", () => {
    let p = receiveDrop(newProfile(), drop({ slot: "gioiChi" })).profile;
    const before = profileTeam(p, p.team);
    p = run(p, { type: "equip", character: "dinhBoLinh", item: "g1" });
    assert.ok(profileTeam(p, p.team)[0]!.atk > before[0]!.atk);
    p = run(p, { type: "equip", character: "haVan", item: "g1" });
    assert.equal(wearerOf(p, "g1"), "haVan");
    assert.equal(loadoutOf(p, "dinhBoLinh").slots.gioiChi, undefined);
    p = run(p, { type: "unequip", character: "haVan", item: "g1" });
    assert.equal(wearerOf(p, "g1"), null);
    assert.deepEqual(applyProfileAction(p, { type: "equip", character: "vuLoi", item: "g1" }), { ok: false, error: "notOwned" });
    assert.deepEqual(applyProfileAction(p, { type: "equip", character: "haVan", item: "g9" }), { ok: false, error: "invalidItem" });
  });

  it("vũ khí: nhân vật kèm chỉ mặc đúng nghề; nhân vật chính giữ riêng theo nghề", () => {
    let p = receiveDrop(newProfile(), drop({ slot: "vuKhi", profession: "ySu" })).profile;
    assert.deepEqual(applyProfileAction(p, { type: "equip", character: "haVan", item: "g1" }), { ok: false, error: "wrongProfession" });
    p = run(p, { type: "equip", character: "dinhBoLinh", item: "g1" });
    assert.equal(loadoutOf(p, "dinhBoLinh").weapons.ySu?.id, "g1");
    const asTuongSi = profileTeam(p)[0]!;
    const asYSu = profileTeam({ ...p, profession: "ySu" })[0]!;
    assert.ok(asYSu.atk > profileTeam({ ...newProfile(), profession: "ySu" })[0]!.atk);
    assert.equal(asTuongSi.atk, profileTeam(newProfile())[0]!.atk);
  });

  it("ghép 3 món cùng loại, trả phí, món đang mặc bị tháo; bán món lấy vàng", () => {
    let p: Profile = { ...newProfile(), gold: 100 };
    for (const set of ["hoaLu", "coLau", "coLau"]) p = receiveDrop(p, drop({ set })).profile;
    p = receiveDrop(p, drop({ element: "moc" })).profile;
    p = run(p, { type: "equip", character: "dinhBoLinh", item: "g2" });
    assert.deepEqual(applyProfileAction(p, { type: "merge", items: ["g1", "g2", "g4"], main: 0 }), { ok: false, error: "elementMismatch" });
    p = run(p, { type: "merge", items: ["g1", "g2", "g3"], main: 0 });
    assert.equal(p.gold, 90);
    assert.deepEqual(
      p.bag.map((it) => [it.id, it.tier, it.set]),
      [
        ["g4", 1, "coLau"],
        ["g5", 2, "hoaLu"],
      ],
    );
    assert.equal(loadoutOf(p, "dinhBoLinh").slots.dinhMao, undefined);
    p = run(p, { type: "sell", item: "g5" });
    assert.equal(p.gold, 90 + SELL_GOLD[2]);
  });

  it("cửa hàng trang bị: chọn ô, hệ, bộ; vũ khí phải ghi nghề", () => {
    const price = SHOP_GEAR_PRICE[3]!;
    const rich = { ...newProfile(), gold: price };
    const order = { type: "buyGear", slot: "hoPhu", element: "tho", set: "hoaLu", tier: 3 } as const;
    assert.deepEqual(applyProfileAction(newProfile(), order), { ok: false, error: "notEnoughGold" });
    assert.deepEqual(applyProfileAction(rich, { ...order, tier: 5 }), { ok: false, error: "invalidItem" });
    assert.deepEqual(applyProfileAction(rich, { ...order, slot: "vuKhi" }), { ok: false, error: "invalidItem" });
    assert.deepEqual(applyProfileAction(rich, { ...order, profession: "ySu" }), { ok: false, error: "invalidItem" });
    const p = run(rich, order);
    assert.equal(p.gold, 0);
    assert.deepEqual(p.bag, [{ id: "g1", slot: "hoPhu", element: "tho", tier: 3, set: "hoaLu" }]);
    assert.deepEqual(parseProfileAction({ ...order, extra: 1 }), order);
    assert.equal(parseProfileAction({ type: "merge", items: ["a", "b"], main: 0 }), null);
  });

  it("lưu rồi đọc lại giữ túi đồ; dữ liệu hỏng bị bỏ", () => {
    let p = receiveDrop(receiveDrop(newProfile(), drop()).profile, drop({ slot: "vuKhi", profession: "phapSu" })).profile;
    p = run(p, { type: "equip", character: "haVan", item: "g2" });
    assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(p))), p);
    const broken = parseProfile({
      ...p,
      bag: [...p.bag, { id: "g7", slot: "vuKhi", element: "kim", tier: 1, set: "coLau" }, { id: "g8", slot: "mu" }],
      loadouts: { haVan: { weapons: { phapSu: "g2", ySu: "g99" }, slots: 3 } },
      nextItemId: 1,
    });
    assert.deepEqual(broken.bag.map((it) => it.id), ["g1", "g2"]);
    assert.deepEqual(broken.loadouts, { haVan: { weapons: { phapSu: "g2" }, slots: {} } });
    assert.equal(broken.nextItemId, 3);
    assert.deepEqual(parseProfile({ ...newProfile(), bag: undefined, loadouts: undefined, nextItemId: undefined }), newProfile());
  });
});
