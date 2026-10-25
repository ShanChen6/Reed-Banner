import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  HISTORY_CLAIMS,
  HISTORY_SOURCES,
  STORY_NODES,
  completeCampaignNode,
  historyCodexErrors,
  isCombatStoryNode,
  missionHistory,
  newProfile,
  parseCampaign,
  warlordCodex,
  type CampaignMissionId,
  type CampaignProgressV2,
  type HistoricalBasis,
} from "../../src/core";
import WarlordCodex, {
  MissionSources,
} from "../../src/app/game/campaign/HistoricalCodex";

const ids = (n: number) =>
  Array.from(
    { length: n },
    (_, i) => `M${String(i + 1).padStart(2, "0")}` as CampaignMissionId,
  );

function complete(list: readonly CampaignMissionId[]): CampaignProgressV2 {
  let next = newProfile().campaign;
  for (const id of list) {
    const r = completeCampaignNode(next, id);
    assert.ok(r.ok, id);
    next = r.campaign;
  }
  return parseCampaign(next);
}

/** Các năm ledger đã ghi; tóm tắt không được thêm mốc nào khác. */
const LEDGER_YEARS = new Set([
  "939",
  "944",
  "950",
  "951",
  "965",
  "966",
  "967",
  "968",
  "970",
]);

describe("Sử ký trong game", () => {
  it("mọi nhiệm vụ recorded/disputed/legend có ghi chú, nguồn khi cần", () => {
    assert.deepEqual(historyCodexErrors(), []);
    for (const node of STORY_NODES) {
      const basis: readonly HistoricalBasis[] = node.historicalBasis;
      const h = missionHistory(node.id);
      if (
        basis.some(
          (b) => b === "recorded" || b === "disputed" || b === "legend",
        )
      )
        assert.ok(
          h.claims.length + h.unresolved.length + h.warlords.length > 0,
          node.id,
        );
      if (basis.includes("recorded")) assert.ok(h.sources.length > 0, node.id);
      if (basis.includes("legend"))
        assert.ok(
          h.claims.some((c) => c.basis.includes("legend")),
          node.id,
        );
      // Phần game dựng luôn có, trận nói rõ là cơ chế.
      assert.ok(h.fiction.length >= 2, node.id);
      if (isCombatStoryNode(node)) assert.match(h.fiction[0]!, /match-3/);
    }
  });

  it("không có ngày tháng hay trích dẫn giả trong tóm tắt", () => {
    const texts = HISTORY_CLAIMS.flatMap((c) => [c.summary, c.caveat]);
    for (const t of texts) {
      for (const y of t.match(/\b\d{3,4}\b/g) ?? [])
        assert.ok(LEDGER_YEARS.has(y), `${y} trong "${t}"`);
      assert.doesNotMatch(t, /“|”|ngày \d|tháng \d/, t);
    }
    for (const s of HISTORY_SOURCES) assert.match(s.url, /^https:\/\//);
  });

  it("panel Sử liệu tách nguồn khỏi lời thoại và mở liên kết ngoài an toàn", () => {
    const html = renderToStaticMarkup(
      createElement(MissionSources, { nodeId: "M04" }),
    );
    assert.match(html, /Sử liệu/);
    assert.match(html, /không phải lời nhân vật/);
    assert.match(html, /Phần do game dựng/);
    const links = html.match(/<a [^>]*>/g) ?? [];
    assert.ok(links.length > 0);
    for (const a of links) {
      assert.match(a, /target="_blank"/);
      assert.match(a, /rel="noopener noreferrer external"/);
    }
    assert.match(html, /mở trang ngoài trong thẻ mới/);
  });

  it("Sứ quân ký mở dần theo tiến độ, không lộ tên hay kết cục chưa tới", () => {
    const fresh = warlordCodex(newProfile().campaign);
    assert.equal(fresh.length, 12);
    assert.ok(fresh.every((e) => e.stage === "unknown"));
    const freshHtml = renderToStaticMarkup(
      createElement(WarlordCodex, { campaign: newProfile().campaign }),
    );
    assert.doesNotMatch(freshHtml, /Trần Lãm|Đỗ Cảnh Thạc/);
    assert.match(freshHtml, /0\/12 hồ sơ đã mở/);

    // Tới M06: Trần Lãm đã gặp nhưng chưa có kết cục.
    const met = complete(ids(5));
    const tl = warlordCodex(met).find((e) => e.record.faction === "tranLam")!;
    assert.equal(tl.stage, "met");
    const metHtml = renderToStaticMarkup(
      createElement(WarlordCodex, { campaign: met }),
    );
    assert.match(metHtml, /Trần Lãm/);
    assert.match(metHtml, /chưa có kết cục/);
    assert.doesNotMatch(metHtml, /Phạm Bạch Hổ/);

    // Qua M06: kết cục liên minh hiện.
    const resolved = complete(ids(6));
    assert.equal(
      warlordCodex(resolved).find((e) => e.record.faction === "tranLam")!.stage,
      "resolved",
    );
    const all = warlordCodex(complete(ids(21)));
    assert.ok(all.every((e) => e.stage === "resolved"));
  });
});
