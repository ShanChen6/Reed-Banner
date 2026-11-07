import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CAMPAIGN_MISSION_IDS, newProfile, type Profile } from "../../src/core";
import { heroPlan } from "../../src/app/game/heroContext";

const withCampaign = (over: Partial<Profile["campaign"]>): Profile => {
  const p = newProfile();
  return { ...p, campaign: { ...p.campaign, ...over } };
};

describe("nút chính ở hero Chiến trường theo ngữ cảnh người chơi", () => {
  it("người mới chưa chơi chiến dịch: Bắt đầu chiến dịch, phụ là Thao Luyện", () => {
    const plan = heroPlan(newProfile(), false);
    assert.equal(plan.primary.scene, "CAMPAIGN");
    assert.equal(plan.primary.label, "Bắt đầu chiến dịch");
    assert.equal(plan.secondary?.scene, "PRACTICE");
    assert.match(plan.hint ?? "", /chương I/);
  });

  it("chiến dịch đang dở: Tiếp tục Bình Loạn kèm chương và số nhiệm vụ, phụ là Giao Tranh", () => {
    const plan = heroPlan(withCampaign({ completed: [CAMPAIGN_MISSION_IDS[0]!] }), false);
    assert.equal(plan.primary.scene, "CAMPAIGN");
    assert.equal(plan.primary.label, "Tiếp tục Bình Loạn");
    assert.equal(plan.secondary?.scene, "PLAYING");
    assert.match(plan.hint ?? "", /^Chương \d+: .+ · \d+\/\d+ nhiệm vụ$/);
  });

  it("nhiệm vụ đang dở (chưa xong cái nào) cũng tính là đã bắt đầu", () => {
    const plan = heroPlan(withCampaign({ inProgress: [CAMPAIGN_MISSION_IDS[0]!] }), false);
    assert.equal(plan.primary.label, "Tiếp tục Bình Loạn");
  });

  it("chiến dịch đã xong mọi nhiệm vụ: Vào trận (Giao Tranh), phụ là Quần Hùng", () => {
    const plan = heroPlan(withCampaign({ completed: [...CAMPAIGN_MISSION_IDS] }), false);
    assert.equal(plan.primary.scene, "PLAYING");
    assert.equal(plan.primary.label, "Vào trận");
    assert.equal(plan.secondary?.scene, "ARENA");
  });

  it("có trận Giao Tranh dở thì ưu tiên Tiếp tục trận dở với tham số resume, kể cả khi mới chơi", () => {
    for (const profile of [newProfile(), withCampaign({ completed: [CAMPAIGN_MISSION_IDS[0]!] }), withCampaign({ completed: [...CAMPAIGN_MISSION_IDS] }), null]) {
      const plan = heroPlan(profile, true);
      assert.equal(plan.primary.label, "Tiếp tục trận dở");
      assert.equal(plan.primary.scene, "PLAYING");
      assert.deepEqual(plan.primary.params, { resume: "1" });
    }
  });

  it("trận dở: nút phụ là việc chiến dịch tiếp theo, hoặc Vào trận mới khi chiến dịch xong hay không có hồ sơ", () => {
    assert.equal(heroPlan(newProfile(), true).secondary?.label, "Bắt đầu chiến dịch");
    assert.equal(heroPlan(withCampaign({ completed: [CAMPAIGN_MISSION_IDS[0]!] }), true).secondary?.label, "Tiếp tục Bình Loạn");
    assert.equal(heroPlan(withCampaign({ completed: [...CAMPAIGN_MISSION_IDS] }), true).secondary?.label, "Vào trận mới");
    assert.equal(heroPlan(null, true).secondary?.label, "Vào trận mới");
  });

  it("không tải được hồ sơ: quay về nút Vào trận như cũ, không đoán ngữ cảnh", () => {
    const plan = heroPlan(null, false);
    assert.equal(plan.primary.label, "Vào trận");
    assert.equal(plan.primary.scene, "PLAYING");
    assert.equal(plan.secondary, undefined);
    assert.equal(plan.hint, undefined);
  });
});
