import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { newProfile, type FloorRules } from "../../src/core";
import {
  companionOptions,
  describeRules,
  firstClearText,
  foeInfo,
  formatDateKey,
  isBossFloor,
  leaderChoices,
  nextSweepTierHint,
  lineupErrorText,
  stageIndexOf,
  suggestCompanions,
  trialStages,
  unclaimedStones,
  navigateIndex,
  previewLineup,
  sweepButtonState,
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

  it("nút quét: eligible, claimed, no floor và delayed response", () => {
    const sweep = {
      eligible: true,
      tier: 2,
      amount: 2,
      claimedToday: false,
      nextAt: 0,
      lastClaim: null,
      history: [],
    };
    assert.deepEqual(sweepButtonState(sweep, false), { disabled: false, text: "Quét nhận 2 đá" });
    assert.deepEqual(sweepButtonState(sweep, true), { disabled: true, text: "Đang quét…" });
    assert.deepEqual(sweepButtonState({ ...sweep, claimedToday: true }, false), { disabled: true, text: "Đã nhận hôm nay" });
    assert.deepEqual(sweepButtonState({ ...sweep, eligible: false, tier: 0, amount: 0 }, false), {
      disabled: true,
      text: "Cần vượt ít nhất tầng 1",
    });
  });

  it("chia 50 tầng thành 5 chặng, đếm tầng đã qua và đá lần đầu còn lại", () => {
    const cleared = 23;
    const floors = Array.from({ length: 50 }, (_, i) => ({
      floor: { floor: i + 1, firstClearStones: 2, difficulty: (i + 1) % 10 === 0 ? "boss" : "normal" },
      state: i + 1 <= cleared ? "cleared" : i + 1 === cleared + 1 ? "open" : "locked",
      firstClearClaimed: i + 1 <= cleared,
      record: null,
    })) as unknown as TrialFloorEntry[];
    const stages = trialStages(floors);
    assert.deepEqual(stages.map((s) => [s.roman, s.from, s.to, s.cleared, s.state]), [
      ["I", 1, 10, 10, "cleared"],
      ["II", 11, 20, 10, "cleared"],
      ["III", 21, 30, 3, "open"],
      ["IV", 31, 40, 0, "locked"],
      ["V", 41, 50, 0, "locked"],
    ]);
    assert.deepEqual([1, 10, 11, 50].map(stageIndexOf), [0, 0, 1, 4]);
    assert.equal(unclaimedStones(stages[2]!.floors), 14);
    assert.deepEqual(stages[2]!.floors.filter(isBossFloor).map((f) => f.floor.floor), [30]);
    assert.deepEqual(trialStages([]), []);
  });

  it("gợi ý bậc quét kế tiếp, ngày dễ đọc và thẻ đối thủ", () => {
    assert.equal(nextSweepTierHint(0, 50), "Qua tầng 1 để quét được 1 đá mỗi ngày");
    assert.equal(nextSweepTierHint(23, 50), "Qua tầng 31 để quét được 6 đá mỗi ngày");
    assert.equal(nextSweepTierHint(41, 50), null);
    assert.equal(nextSweepTierHint(50, 50), null);
    assert.equal(formatDateKey("2026-11-10"), "10/11/2026");
    assert.equal(formatDateKey("lạ"), "lạ");
    assert.deepEqual(foeInfo("haVan"), { id: "haVan", name: "Hà Vân", element: "hoa", profession: "phapSu" });
    assert.deepEqual(foeInfo("khongCo"), { id: "khongCo", name: "khongCo", element: null, profession: null });
  });

  it("đủ 2 tướng thì khóa tạm các tướng còn lại mà không lặp lý do", () => {
    const picked = profile.team.slice(0, 2);
    const rest = companionOptions(profile, free, picked).filter((o) => !o.selected);
    assert.ok(rest.length > 0 && rest.every((o) => o.disabled && o.reason === null));
  });

  it("gợi ý đội hợp luật: giữ đội đang chọn khi được, thay tướng bị cấm khi không", () => {
    const team = profile.team.slice(0, 2);
    assert.deepEqual(suggestCompanions(profile, free, team), team);
    const banFire: FloorRules = { bannedElements: ["hoa"] };
    const picked = suggestCompanions(profile, banFire, ["haVan", "leThach"]);
    assert.equal(picked.length, 2);
    assert.ok(picked.includes("leThach") && !picked.includes("haVan"));
    assert.ok(leaderChoices(profile, banFire, picked).length > 0);
    // Chưa chọn ai vẫn gợi ý được một cặp hợp luật.
    assert.equal(suggestCompanions(profile, { minProfessions: { ySu: 1, binhLinh: 1 } }, []).length, 2);
  });

  it("lỗi đội hình hiện tên hệ/nghề tiếng Việt, không lộ mã", () => {
    const r = previewLineup(profile, { bannedElements: ["hoa"] }, ["haVan", "leThach"], { element: "moc", profession: "tuongSi" });
    assert.equal(r.status, "invalid");
    if (r.status === "invalid") assert.deepEqual(r.errors.map(lineupErrorText), ["Hệ Hỏa bị cấm ở tầng này"]);
  });
});
