import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyProfileAction,
  gearStats,
  MAIN_ID,
  newProfile,
  presetLoadout,
  receiveDrop,
  type GearItem,
} from "../../src/core";
import { activeBonusText, gearComparison } from "../../src/app/game/battle/GearPanel";

describe("nội dung so sánh trang bị", () => {
  it("nêu rõ bộ/cộng hưởng và thay đổi chỉ số khi thay món", () => {
    const bonuses = gearStats(presetLoadout("moc", "tuongSi", 3, "coLau"), "moc", "tuongSi").bonuses;
    assert.ok(bonuses.some((b) => activeBonusText(b).startsWith("Bộ Cờ Lau 6:")));
    assert.ok(bonuses.some((b) => activeBonusText(b).startsWith("Cộng hưởng Mộc 9:")));

    const weak: GearItem = { id: "", slot: "gioiChi", element: "moc", tier: 1, set: "coLau" };
    const strong: GearItem = { ...weak, tier: 3, set: "hoaLu" };
    let profile = receiveDrop(newProfile(), weak).profile;
    profile = receiveDrop(profile, strong).profile;
    const equipped = applyProfileAction(profile, { type: "equip", character: MAIN_ID, item: "g1" });
    assert.ok(equipped.ok);
    assert.match(gearComparison(equipped.profile, MAIN_ID, equipped.profile.bag[1]!)!, /ATK \+\d+/);
    assert.equal(
      gearComparison(newProfile(), "haVan", {
        id: "wrong",
        slot: "vuKhi",
        element: "moc",
        tier: 1,
        set: "coLau",
        profession: "ySu",
      }),
      null,
    );
  });
});
