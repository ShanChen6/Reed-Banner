import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  newProfile,
  ownsCompanion,
  profileTeam,
} from "../../src/core";
import {
  EMPTY_SURVIVAL_SLOTS,
  cleanSurvivalSlots,
  suggestSurvivalSlots,
  survivalRosterPayload,
  survivalTargetSlot,
  toggleSurvivalSlot,
  validateSurvivalRosterSelection,
} from "../../src/app/game/survival/roster-selection";

describe("lựa chọn đội Sinh tồn", () => {
  const profile = newProfile();
  const ownedIds = Object.keys(profile.companions).filter((id) =>
    ownsCompanion(profile, id),
  );

  it("chỉ dựng danh sách fighter từ nhân vật đã sở hữu", () => {
    assert.equal(ownsCompanion(profile, "haVan"), true);
    assert.equal(ownsCompanion(profile, "tranCuong"), false);
    const choices = profileTeam(profile, ownedIds);
    assert.deepEqual(
      choices.slice(1).map((fighter) => fighter.id).sort(),
      ownedIds.sort(),
    );
  });

  it("chấp nhận hai active và không bắt buộc chọn reserve", () => {
    assert.equal(
      validateSurvivalRosterSelection(ownedIds, ["haVan", "maiThanh"], []),
      null,
    );
  });

  it("từ chối active thiếu, ID trùng, nhân vật chưa sở hữu và quá hai reserve", () => {
    assert.equal(
      validateSurvivalRosterSelection(ownedIds, ["haVan"], []),
      "activeCount",
    );
    assert.equal(
      validateSurvivalRosterSelection(ownedIds, ["haVan", "haVan"], []),
      "duplicateFighter",
    );
    assert.equal(
      validateSurvivalRosterSelection(ownedIds, ["haVan", "tranCuong"], []),
      "unownedFighter",
    );
    assert.equal(
      validateSurvivalRosterSelection(
        ownedIds,
        ["haVan", "maiThanh"],
        ["leThach", "toKim", "phungPhong"],
      ),
      "tooManyReserves",
    );
    assert.equal(
      validateSurvivalRosterSelection(
        ownedIds,
        ["haVan", "maiThanh"],
        ["leThach", "leThach"],
      ),
      "duplicateFighter",
    );
  });

  it("tạo payload theo thứ tự slot và loại bỏ ô reserve để trống", () => {
    assert.deepEqual(
      survivalRosterPayload(
        ["maiThanh", "haVan"],
        ["", "leThach"],
      ),
      {
        companions: ["maiThanh", "haVan"],
        reserveCompanions: ["leThach"],
      },
    );
  });
});

describe("ô chọn đội Trấn Ải", () => {
  it("bấm tướng lấp ô trống đầu tiên, phó tướng trước dự bị; bấm lại thì rút ra và chọn ô đó", () => {
    let r = toggleSurvivalSlot(EMPTY_SURVIVAL_SLOTS, "a", null);
    assert.deepEqual(r.slots, ["a", "", "", ""]);
    r = toggleSurvivalSlot(r.slots, "b", r.focus);
    r = toggleSurvivalSlot(r.slots, "c", r.focus);
    assert.deepEqual(r.slots, ["a", "b", "c", ""]);
    assert.equal(survivalTargetSlot(r.slots, r.focus), 3);
    r = toggleSurvivalSlot(r.slots, "b", r.focus);
    assert.deepEqual(r.slots, ["a", "", "c", ""]);
    assert.equal(r.focus, 1);
    r = toggleSurvivalSlot(r.slots, "d", r.focus);
    assert.deepEqual(r.slots, ["a", "d", "c", ""]);
  });

  it("đội đủ thì chỉ thay khi đã chọn ô", () => {
    const full = ["a", "b", "c", "d"] as const;
    assert.equal(survivalTargetSlot(full, null), null);
    assert.deepEqual(toggleSurvivalSlot(full, "e", null).slots, full);
    assert.deepEqual(toggleSurvivalSlot(full, "e", 2).slots, ["a", "b", "e", "d"]);
  });

  it("bản chọn đã nhớ bỏ tướng không còn và tướng trùng", () => {
    assert.deepEqual(cleanSurvivalSlots(["a", "x", "a", "b"], ["a", "b"]), ["a", "", "", "b"]);
    assert.equal(cleanSurvivalSlots(["a"], ["a"]), null);
    assert.equal(cleanSurvivalSlots("a", ["a"]), null);
  });

  it("tự chọn bốn tướng cấp cao nhất, bằng cấp thì chỉ số cao hơn", () => {
    assert.deepEqual(
      suggestSurvivalSlots([
        { id: "a", level: 3, power: 10 },
        { id: "b", level: 9, power: 1 },
        { id: "c", level: 3, power: 50 },
        { id: "d", level: 1, power: 99 },
        { id: "e", level: 5, power: 5 },
      ]),
      ["b", "e", "c", "a"],
    );
    assert.deepEqual(suggestSurvivalSlots([{ id: "a", level: 1, power: 1 }]), ["a", "", "", ""]);
  });
});
