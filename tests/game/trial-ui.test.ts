import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { newProfile, type FloorRules } from "../../src/core";
import {
  companionOptions,
  describeRules,
  firstClearText,
  leaderChoices,
  navigateIndex,
  previewLineup,
  toggleCompanion,
  type TrialFloorEntry,
} from "../../src/app/game/trial/trial-ui";

const profile = newProfile();
const free: FloorRules = {};

describe("UI Tháp Thí Luyện", () => {
  it("hiện luật cấm/bắt buộc/giới hạn thành các dòng riêng", () => {
    const lines = describeRules({ bannedElements: ["kim"], minProfessions: { tuongSi: 1 }, maxSameElement: 1 });
    assert.deepEqual(lines.map((line) => line.kind), ["ban", "need", "limit"]);
    assert.ok(lines.every((line) => line.text.length > 0));
  });

  it("khóa tướng sai luật và toggle không thể thêm tướng bị khóa", () => {
    const options = companionOptions(profile, { bannedElements: ["hoa"] }, []);
    const banned = options.find((option) => option.element === "hoa");
    assert.ok(banned?.disabled);
    assert.match(banned.reason ?? "", /bị cấm/);
    assert.deepEqual(toggleCompanion([], banned), []);
  });

  it("đủ đúng 3 active gồm Đinh Bộ Lĩnh và có build thủ lĩnh hợp luật", () => {
    const companions = profile.team.slice(0, 2);
    const choices = leaderChoices(profile, free, companions);
    assert.ok(choices.length > 0);
    assert.deepEqual(previewLineup(profile, free, companions, choices[0]!), { status: "valid" });
    assert.deepEqual(previewLineup(profile, free, companions.slice(0, 1), choices[0]!), { status: "incomplete", missing: 1 });
  });

  it("navigator bàn phím chặn ở biên và di chuyển theo lưới", () => {
    assert.equal(navigateIndex(0, "ArrowLeft", 20, 5), 0);
    assert.equal(navigateIndex(0, "ArrowDown", 20, 5), 5);
    assert.equal(navigateIndex(19, "ArrowRight", 20, 5), 19);
    assert.equal(navigateIndex(7, "Home", 20, 5), 0);
    assert.equal(navigateIndex(7, "End", 20, 5), 19);
  });

  it("chỉ ghi đã nhận đá khi overview do server xác nhận", () => {
    const entry = (claimed: boolean) => ({
      firstClearClaimed: claimed,
      floor: { firstClearStones: 5 },
    }) as TrialFloorEntry;
    assert.match(firstClearText(entry(false)), /Lần đầu qua/);
    assert.doesNotMatch(firstClearText(entry(false)), /Đã nhận/);
    assert.match(firstClearText(entry(true)), /Đã nhận 5/);
  });
});
