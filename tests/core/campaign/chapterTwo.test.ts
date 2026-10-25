import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_TWO,
  campaignCopyErrors,
  campaignEncounter,
  campaignEventByNode,
  campaignFocusChapter,
  chapterStatus,
  completeCampaignNode,
  isCombatStoryNode,
  missionCopy,
  newProfile,
  raidBossById,
  warlordUnlockMission,
  raidUnlocked,
  storyNodeById,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../../src/core";

function complete(
  campaign: CampaignProgressV2,
  ids: readonly CampaignMissionId[],
): CampaignProgressV2 {
  let next = campaign;
  for (const id of ids) {
    const r = completeCampaignNode(next, id);
    assert.ok(r.ok, id);
    next = r.campaign;
  }
  return next;
}

describe("Chương II: Bố Hải là liên minh, không phải chinh phục", () => {
  it("lời dẫn hợp lệ: lựa chọn khớp allowlist, thoại hư cấu, sử chép có nguồn, không có chữ chinh phục", () => {
    assert.deepEqual(campaignCopyErrors(), []);
  });

  it("M05 và M06 không có trận, không có encounter; M06 là hội kiến kết minh", () => {
    for (const id of ["M05", "M06"] as const) {
      const node = storyNodeById(id)!;
      assert.equal(isCombatStoryNode(node), false, id);
      assert.equal(campaignEncounter(id), undefined, id);
      assert.equal(campaignEventByNode(id)!.outcome, "allianced");
    }
    assert.equal(storyNodeById("M06")!.type, "diplomacy");
  });

  it("M05 nói rõ tuyến đường do game dựng và năm bắt đầu còn tranh luận", () => {
    const m05 = missionCopy("M05")!;
    assert.ok(m05.intro.some((b) => b.basis === "reconstructed"));
    assert.ok(
      m05.intro.some((b) => b.basis === "disputed" && b.refs?.includes("U02")),
    );
    for (const c of m05.choices)
      assert.ok(
        c.beats.some((b) => b.basis === "reconstructed"),
        c.id,
      );
  });

  it("M06 kết bằng nhận nuôi và giao cầm quân có nguồn Toàn thư; ghi chú nguồn có trích sử và truyền thuyết địa phương", () => {
    const m06 = missionCopy("M06")!;
    const recorded = m06.outro.find((b) => b.basis === "recorded")!;
    assert.match(recorded.text, /giao cho cầm quân/);
    assert.deepEqual([...recorded.refs!], ["E08", "S01"]);
    const notes = m06.sourceNotes!;
    assert.ok(notes.some((n) => /Toàn thư/.test(n.title)));
    assert.ok(notes.some((n) => n.beats.some((b) => b.basis === "legend")));
    assert.ok(notes.some((n) => n.beats.some((b) => b.basis === "disputed")));
    // Không có điều kiện thắng đấu tay đôi trong lời kể chính.
    for (const b of [
      ...m06.intro,
      ...m06.outro,
      ...m06.choices.flatMap((c) => c.beats),
    ])
      assert.doesNotMatch(b.text, /thắng|đánh bại|thử tài/i);
  });

  it("Chương II mở sau Chương I; đủ bốn nhiệm vụ có nội dung, mở lần lượt", () => {
    const fresh = newProfile().campaign;
    assert.ok(
      chapterStatus(fresh, CHAPTER_TWO).every((m) => m.status === "locked"),
    );
    const after = complete(fresh, ["M01", "M02", "M03", "M04"]);
    assert.deepEqual(
      chapterStatus(after, CHAPTER_TWO).map((m) => m.status),
      ["open", "locked", "locked", "locked"],
    );
    assert.equal(campaignFocusChapter(after), CHAPTER_TWO);
    const met = complete(after, ["M05", "M06"]);
    assert.deepEqual(
      chapterStatus(met, CHAPTER_TWO).map((m) => m.status),
      ["completed", "completed", "open", "locked"],
    );
  });
});

describe("Đánh trùm: Trần Lãm không bị dựng thành sứ quân bị chinh phạt", () => {
  const base = newProfile().campaign;
  it("Trần Lãm là đồng minh nên không có trận Đánh trùm; M08 chỉ mở bán ông ở cửa hàng", () => {
    assert.equal(warlordUnlockMission("tranLam"), "M08");
    assert.equal(raidBossById("tranLam"), undefined);
    const story = complete(base, [
      "M01",
      "M02",
      "M03",
      "M04",
      "M05",
      "M06",
      "M07",
    ]);
    const m08 = complete(story, ["M08"]);
    assert.ok(m08.completed.includes("M08"));
    assert.equal(raidUnlocked(m08, "tranLam", 1), false);
    assert.equal(raidUnlocked(m08, "boHai", 1), false);
  });
});
