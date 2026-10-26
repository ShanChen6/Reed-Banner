import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  completeCampaignNode,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import RouteSummary from "../../src/app/game/campaign/RouteSummary";

const ids = (from: number, to: number) =>
  Array.from(
    { length: to - from + 1 },
    (_, i) => `M${String(from + i).padStart(2, "0")}` as CampaignMissionId,
  );

function complete(list: readonly CampaignMissionId[]): CampaignProgressV2 {
  let next = newProfile().campaign;
  for (const id of list) {
    const r = completeCampaignNode(next, id);
    assert.ok(r.ok, id);
    next = r.campaign;
  }
  return next;
}

const board = (campaign: CampaignProgressV2, chapter = 4) =>
  renderToStaticMarkup(
    createElement(RouteSummary, { campaign, chapter, onPick: () => {} }),
  );

describe("Bảng hai tuyến dưới bản đồ", () => {
  it("hiện cả tuyến tây và tuyến đông, Đỗ Động khóa khi còn thiếu", () => {
    const html = board(complete([...ids(1, 12), ...ids(13, 16)]));
    assert.match(html, /Tuyến tây/);
    assert.match(html, /Tuyến đông/);
    assert.match(html, /4\/4 vùng/);
    assert.match(html, /0\/4 vùng/);
    assert.match(html, /Còn thiếu/);
    assert.doesNotMatch(html, /M\d\d/);
  });

  it("Đỗ Động mở khi xong cả hai tuyến", () => {
    const html = board(complete(ids(1, 20)), 5);
    assert.match(html, /Đỗ Động đã mở/);
  });
});
