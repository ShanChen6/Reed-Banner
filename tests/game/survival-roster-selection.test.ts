import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  newProfile,
  ownsCompanion,
  profileTeam,
} from "../../src/core";
import {
  survivalRosterPayload,
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
