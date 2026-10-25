import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { STORY_NODES, missionCopy, type StoryBeat } from "../../src/core";
import {
  MAIN_SPEAKER,
  dialogueLines,
  backdropUrl,
  markViewed,
  missionBackdrop,
  speakerLook,
  speakerSide,
  stageSpeakers,
} from "../../src/app/game/campaign/dialogue";

const narr = (text: string): StoryBeat => ({ text, basis: "reconstructed" });
const say = (speaker: string, text: string): StoryBeat => ({
  speaker,
  text,
  basis: "fictional",
});

describe("Trình phát thoại Chiến dịch", () => {
  it("mỗi câu một khóa missionId:section:index, giữ đúng thứ tự đoạn", () => {
    const lines = dialogueLines("M01", [
      { section: "cinematic", beats: [narr("a")], cinematic: true },
      { section: "intro", beats: [narr("b"), say(MAIN_SPEAKER, "c")] },
    ]);
    assert.deepEqual(
      lines.map((l) => l.key),
      ["M01:cinematic:0", "M01:intro:0", "M01:intro:1"],
    );
    assert.equal(lines[0]!.cinematic, true);
    assert.equal(lines[2]!.beat.text, "c");
  });

  it("đọc lời kể có sẵn của mọi nhiệm vụ, khóa không trùng", () => {
    for (const node of STORY_NODES) {
      const copy = missionCopy(node.id);
      if (!copy) continue;
      const lines = dialogueLines(node.id, [
        { section: "cinematic", beats: copy.cinematic ?? [] },
        { section: "intro", beats: copy.intro },
        { section: "outro", beats: copy.outro },
        ...copy.choices.map((c) => ({
          section: `choice:${c.id}`,
          beats: c.beats,
        })),
      ]);
      assert.equal(new Set(lines.map((l) => l.key)).size, lines.length);
      assert.ok(lines.length > 0, node.id);
    }
  });

  it("mọi nhiệm vụ có lời dẫn, kết thúc và lời đáp để phát, không có chỗ trống", () => {
    for (const node of STORY_NODES) {
      const copy = missionCopy(node.id);
      assert.ok(copy, node.id);
      assert.ok(copy.intro.length > 0, `${node.id} intro`);
      assert.ok(copy.outro.length > 0, `${node.id} outro`);
      for (const c of copy.choices)
        assert.ok(c.beats.length > 0, `${node.id} ${c.id}`);
    }
  });

  it("chân dung theo tên, kể cả sứ quân gọi theo tước hiệu", () => {
    assert.equal(speakerLook("Trần Minh Công")?.id, "tranLam");
    assert.equal(speakerLook("Phạm Phòng Át")?.id, "phamBachHo");
    assert.equal(speakerLook("Nguyễn Bặc")?.id, "nguyenBac");
    assert.equal(speakerLook("Một người lính già"), null);
  });

  it("phía Hoa Lư đứng trái, Đinh Bộ Lĩnh luôn có mặt khi có thoại", () => {
    assert.equal(speakerSide("Đinh Điền"), "left");
    assert.equal(speakerSide("Trần Minh Công"), "right");
    const lines = dialogueLines("M06", [
      {
        section: "intro",
        beats: [narr("x"), say("Trần Minh Công", "y"), say("Lê Hoàn", "z")],
      },
    ]);
    assert.deepEqual(stageSpeakers(lines, 0), {
      left: MAIN_SPEAKER,
      right: null,
    });
    assert.deepEqual(stageSpeakers(lines, 1), {
      left: MAIN_SPEAKER,
      right: "Trần Minh Công",
    });
    assert.deepEqual(stageSpeakers(lines, 2), {
      left: "Lê Hoàn",
      right: "Trần Minh Công",
    });
    assert.deepEqual(
      stageSpeakers(
        dialogueLines("M01", [{ section: "i", beats: [narr("x")] }]),
        0,
      ),
      { left: null, right: null },
    );
  });

  it("chỉ nhớ câu xa nhất đã đọc", () => {
    const a = markViewed({}, "M01:intro", 3);
    assert.deepEqual(a, { "M01:intro": 3 });
    assert.equal(markViewed(a, "M01:intro", 1), a);
    assert.deepEqual(markViewed(a, "M01:intro", 5), { "M01:intro": 5 });
  });

  it("mọi nhiệm vụ có ảnh nền thoại tồn tại trong public/", () => {
    for (const node of STORY_NODES) {
      const url = backdropUrl(missionBackdrop(node.id));
      assert.ok(existsSync(`public${url}`), `${node.id} ${url}`);
    }
    assert.equal(missionBackdrop("M06"), "bohaikhau");
    assert.equal(missionBackdrop("M24"), "dangquang");
  });
});
