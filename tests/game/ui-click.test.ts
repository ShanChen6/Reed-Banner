import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clickCue } from "../../src/app/game/audio/uiClick";

const t = (label: string, extra: { sfx?: string; inBoard?: boolean } = {}) => ({ sfx: extra.sfx ?? null, inBoard: extra.inBoard ?? false, label });

describe("tiếng bấm giao diện", () => {
  it("nút thường gõ ui.click, nút về/đóng gõ ui.back", () => {
    assert.equal(clickCue(t("Điểm danh")), "ui.click");
    assert.equal(clickCue(t("Về Chiến Trường")), "ui.back");
    assert.equal(clickCue(t("Quay lại bản đồ")), "ui.back");
    assert.equal(clickCue(t("Đóng")), "ui.back");
    assert.equal(clickCue(t("Vềnh")), "ui.click");
  });

  it("bàn cờ im, trừ khi ghi rõ data-sfx", () => {
    assert.equal(clickCue(t("Ô 3, 4", { inBoard: true })), null);
    assert.equal(clickCue(t("Ô 3, 4", { inBoard: true, sfx: "click" })), "ui.click");
    assert.equal(clickCue(t("Điểm danh", { sfx: "none" })), null);
    assert.equal(clickCue(t("Tiếp", { sfx: "back" })), "ui.back");
  });
});
