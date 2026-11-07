import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CAMPAIGN_MISSION_IDS, newProfile } from "../../src/core";
import { startTarget } from "../../src/app/game/campaign/startMission";

const campaign = (over: Partial<ReturnType<typeof newProfile>["campaign"]>) => ({ ...newProfile().campaign, ...over });

describe("nhiệm vụ nên làm tiếp ở tab Bản đồ", () => {
  it("người mới: bắt đầu nhiệm vụ mở đầu tiên của Chương I", () => {
    const t = startTarget(campaign({}));
    assert.ok(t);
    assert.equal(t.kind, "start");
    assert.equal(t.id, "M01");
    assert.equal(t.chapter, 1);
    assert.ok(t.title.length > 0 && t.place.length > 0);
  });

  it("đã xong nhiệm vụ đầu: là nhiệm vụ kế tiếp (không còn là 'start')", () => {
    const t = startTarget(campaign({ completed: ["M01"] }));
    assert.ok(t);
    assert.equal(t.kind, "next");
    assert.notEqual(t.id, "M01");
  });

  it("có nhiệm vụ đang dở thì ưu tiên tiếp tục nó", () => {
    const t = startTarget(campaign({ completed: ["M01"], inProgress: ["M02"] }));
    assert.ok(t);
    assert.equal(t.kind, "resume");
    assert.equal(t.id, "M02");
  });

  it("đã xong mọi nhiệm vụ: không còn mục tiêu, thanh ẩn", () => {
    assert.equal(startTarget(campaign({ completed: [...CAMPAIGN_MISSION_IDS] })), null);
  });
});
