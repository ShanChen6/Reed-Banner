import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activeBonuses,
  EMPTY_LOADOUT,
  equip,
  equippedItems,
  GEAR_SLOTS,
  gearElementMultiplier,
  gearStats,
  itemStat,
  mainCharacter,
  mergeItems,
  SLOT_STAT,
  unequip,
  withGear,
  type Element,
  type GearItem,
  type GearSlot,
  type Loadout,
  type Tier,
} from "../../../src/core";

function item(slot: GearSlot, over: Partial<GearItem> = {}): GearItem {
  return {
    id: over.id ?? slot,
    slot,
    element: "kim",
    tier: 1,
    set: "coLau",
    ...(slot === "vuKhi" ? { profession: "tuongSi" as const } : {}),
    ...over,
  };
}

function fullLoadout(over: (slot: GearSlot, i: number) => Partial<GearItem> = () => ({})): Loadout {
  let l = EMPTY_LOADOUT;
  GEAR_SLOTS.forEach((slot, i) => {
    const r = equip(l, item(slot, over(slot, i)));
    assert.ok(r.ok);
    l = r.loadout;
  });
  return l;
}

describe("chín ô trang bị", () => {
  it("mỗi chỉ số chính có đúng 3 ô", () => {
    const count = { atk: 0, maxHp: 0, def: 0 };
    for (const s of GEAR_SLOTS) count[SLOT_STAT[s]]++;
    assert.deepEqual(count, { atk: 3, maxHp: 3, def: 3 });
  });
});

describe("hệ số chỉ số", () => {
  it("theo nguyên tố trang bị so với nhân vật", () => {
    assert.equal(gearElementMultiplier("kim", "kim"), 1.5);
    assert.equal(gearElementMultiplier("kim", "thuy"), 1.25); // Kim sinh Thủy
    assert.equal(gearElementMultiplier("phong", "hoa"), 1.25); // Phong sinh Hỏa
    assert.equal(gearElementMultiplier("kim", "moc"), 0.75); // Kim khắc Mộc
    assert.equal(gearElementMultiplier("moc", "kim"), 1); // nhân vật khắc trang bị: bình thường
    assert.equal(gearElementMultiplier("loi", "thuy"), 0.75);
    const loi: Element[] = ["kim", "moc", "thuy", "hoa", "tho", "loi", "phong"];
    assert.deepEqual(new Set(loi.map((e) => gearElementMultiplier("loi", e))), new Set([1.5, 1, 0.75]));
  });

  it("phẩm nhân trước rồi nhân nguyên tố, làm tròn", () => {
    assert.equal(itemStat(item("vuKhi", { tier: 1 }), "hoa"), 3);
    assert.equal(itemStat(item("vuKhi", { tier: 5 }), "kim"), 14); // 3 × 3 × 1.5 = 13.5
    assert.equal(itemStat(item("dinhMao", { tier: 4 }), "thuy"), 83); // 30 × 2.2 × 1.25 = 82.5
    assert.equal(itemStat(item("yPhuc", { tier: 3 }), "moc"), 3); // 2 × 1.7 × 0.75 = 2.55
  });
});

describe("mặc đồ", () => {
  it("vũ khí giữ riêng theo nghề, đổi nghề thì đổi vũ khí", () => {
    let l = EMPTY_LOADOUT;
    for (const w of [item("vuKhi", { id: "kiem" }), item("vuKhi", { id: "truong", profession: "phapSu" })]) {
      const r = equip(l, w);
      assert.ok(r.ok);
      l = r.loadout;
    }
    assert.deepEqual(equippedItems(l, "tuongSi").map((i) => i.id), ["kiem"]);
    assert.deepEqual(equippedItems(l, "phapSu").map((i) => i.id), ["truong"]);
    assert.deepEqual(equippedItems(l, "ySu"), []);
  });

  it("chặn vũ khí không nghề, đồ thường mang nghề, vũ khí sai nghề của nhân vật kèm", () => {
    assert.deepEqual(equip(EMPTY_LOADOUT, { ...item("vuKhi"), profession: undefined }), { ok: false, error: "weaponNeedsProfession" });
    assert.deepEqual(equip(EMPTY_LOADOUT, item("dinhMao", { profession: "ySu" })), { ok: false, error: "notWeapon" });
    assert.deepEqual(equip(EMPTY_LOADOUT, item("vuKhi"), "ySu"), { ok: false, error: "wrongProfession" });
  });

  it("thay món cũ cùng ô, bỏ món theo id", () => {
    const l = fullLoadout();
    const r = equip(l, item("dinhMao", { id: "mu2" }));
    assert.ok(r.ok);
    assert.equal(r.loadout.slots.dinhMao?.id, "mu2");
    const empty = unequip(r.loadout, ["mu2", "vuKhi"]);
    assert.equal(empty.slots.dinhMao, undefined);
    assert.equal(equippedItems(empty, "tuongSi").length, 7);
  });
});

describe("thưởng bộ và cộng hưởng", () => {
  it("mốc 6 và 9 món, mốc 9 cộng thêm vào mốc 6", () => {
    const five = fullLoadout((_, i) => (i < 5 ? {} : { set: "hoaLu", element: "tho" }));
    assert.deepEqual(activeBonuses(equippedItems(five, "tuongSi")), []);

    const six = fullLoadout((_, i) => (i < 6 ? {} : { set: "hoaLu", element: "tho" }));
    assert.deepEqual(
      activeBonuses(equippedItems(six, "tuongSi")).map((b) => `${b.kind}:${b.id}:${b.level}`),
      ["set:coLau:6", "resonance:kim:6"],
    );

    const nine = gearStats(fullLoadout(), "kim", "tuongSi");
    assert.equal(nine.bonuses.length, 4);
    assert.ok(Math.abs(nine.percent.atk - 0.18) < 1e-9); // Cờ Lau 4% + 4%, Kim 5% + 5%
    assert.ok(Math.abs(nine.percent.maxHp - 0.06) < 1e-9);
  });

  it("bộ và nguyên tố đếm riêng: khác bộ vẫn được cộng hưởng", () => {
    const l = fullLoadout((_, i) => ({ set: i % 2 ? "coLau" : "dongCo" }));
    const b = activeBonuses(equippedItems(l, "tuongSi"));
    assert.deepEqual(b.map((x) => `${x.kind}:${x.id}:${x.level}`), ["resonance:kim:6", "resonance:kim:9"]);
  });

  it("thiếu vũ khí của nghề hiện tại thì còn 8 món, mất mốc 9", () => {
    const b = gearStats(fullLoadout(), "kim", "phapSu").bonuses;
    assert.deepEqual(b.map((x) => x.level), [6, 6]);
  });
});

describe("chỉ số vào trận", () => {
  it("(gốc + cộng phẳng) × (1 + tỉ lệ), tính lại khi đổi nguyên tố", () => {
    const l = fullLoadout();
    const kim = withGear(mainCharacter("kim"), l);
    // Tướng sĩ 500/55/10; 3 ô mỗi chỉ số, Trắng cùng hệ ×1.5: ATK 3×5, máu 3×45, DEF 3×3.
    assert.equal(kim.atk, Math.round((55 + 15) * 1.18));
    assert.equal(kim.maxHp, Math.round((500 + 135) * 1.06));
    assert.equal(kim.def, Math.round(10 + 9));

    const moc = withGear(mainCharacter("moc"), l); // Kim khắc Mộc: ×0.75
    assert.equal(moc.atk, Math.round((55 + 3 * Math.round(2.25)) * 1.18));
    assert.ok(moc.atk < kim.atk);
    assert.deepEqual(withGear(mainCharacter("kim"), EMPTY_LOADOUT), mainCharacter("kim"));
  });
});

describe("ghép nâng bậc", () => {
  const three = (over: Partial<GearItem>[] = [{}, {}, {}]) =>
    over.map((o, i) => item("hoThu", { id: `g${i}`, ...o }));

  it("3 món cùng bậc, cùng hệ, cùng ô thành 1 món bậc kế, lấy bộ của món chính", () => {
    const r = mergeItems(three([{}, { set: "dongCo" }, { set: "hoaLu" }]), 1, "moi");
    assert.deepEqual(r, { ok: true, item: { id: "moi", slot: "hoThu", element: "kim", tier: 2, set: "dongCo" } });
  });

  it("từ chối khi không hợp lệ", () => {
    assert.deepEqual(mergeItems(three().slice(0, 2), 0, "x"), { ok: false, error: "needThree" });
    assert.deepEqual(mergeItems(three([{}, {}, { id: "g0" }]), 0, "x"), { ok: false, error: "duplicate" });
    assert.deepEqual(mergeItems(three([{}, {}, { tier: 2 }]), 0, "x"), { ok: false, error: "tierMismatch" });
    assert.deepEqual(mergeItems(three([{}, {}, { element: "moc" }]), 0, "x"), { ok: false, error: "elementMismatch" });
    assert.deepEqual(mergeItems(three([{}, {}, { slot: "gioiChi" }]), 0, "x"), { ok: false, error: "slotMismatch" });
    assert.deepEqual(mergeItems(three([{ tier: 5 }, { tier: 5 }, { tier: 5 }]), 0, "x"), { ok: false, error: "maxTier" });
    const weapons = [0, 1, 2].map((i) => item("vuKhi", { id: `w${i}`, profession: i === 2 ? "phapSu" : "tuongSi" }));
    assert.deepEqual(mergeItems(weapons, 0, "x"), { ok: false, error: "professionMismatch" });
  });

  it("Trắng lên Cam qua 4 lần ghép", () => {
    let tier: Tier = 1;
    while (tier < 5) {
      const r = mergeItems(three([{ tier }, { tier }, { tier }]), 0, "x");
      assert.ok(r.ok);
      tier = r.item.tier;
    }
    assert.equal(tier, 5);
  });
});
