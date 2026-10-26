import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  NEW_CAMPAIGN,
  type CampaignMissionId,
  type CampaignProgressV2,
  type ChapterMissionStatus,
} from "../../src/core";
import { MissionRewardCard } from "../../src/app/game/campaign/AtlasShell";

const card = (
  mission: CampaignMissionId,
  status: ChapterMissionStatus,
  campaign: CampaignProgressV2 = NEW_CAMPAIGN,
) =>
  renderToStaticMarkup(
    createElement(MissionRewardCard, { campaign, mission, status }),
  );

describe("Thẻ phần thưởng nhiệm vụ", () => {
  it("M14 hiện 150 vàng lần đầu, thưởng chương, không bịa vật phẩm", () => {
    const html = card("M14", "open");
    assert.match(html, /Vàng lần đầu/);
    assert.match(html, /150 vàng/);
    assert.match(html, /250 vàng/);
    for (const fake of ["Ngọc", "Vật phẩm", "Hộp", "EXP:"])
      assert.doesNotMatch(html, new RegExp(fake));
    assert.doesNotMatch(html, /đã nhận/);
  });

  it("nhiệm vụ đã xong ghi đã nhận, xem lại không phát lại", () => {
    const html = card("M14", "completed", {
      ...NEW_CAMPAIGN,
      rewardReceipts: ["node:M14"],
    });
    assert.match(html, /đã nhận/);
    assert.match(html, /Xem lại không nhận lại thưởng lần đầu/);
  });

  it("nhiệm vụ chưa mở không phát thưởng", () => {
    const html = card("M24", "locked");
    assert.match(html, /chưa phát thưởng/);
    assert.doesNotMatch(html, /vàng/);
  });

  it("nhiệm vụ chốt chương ghi tướng gia nhập", () => {
    assert.match(card("M04", "open"), /Tướng gia nhập/);
  });
});
