import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RULESETS, createPuzzle, transition, legalPlacements, type PuzzleState } from "../../src/core/binh-phap";
import { tutorialText } from "../../src/app/game/formation/Hud";
import { OBSTACLE_KINDS, obstacleKind } from "../../src/app/game/formation/pieces";
import { formatRemaining } from "../../src/app/game/formation/time";

describe("đếm ngược kỳ", () => {
  it("định dạng phút, giờ, ngày; hết giờ thì báo đang đổi kỳ", () => {
    const M = 60_000;
    assert.equal(formatRemaining(0), "đang đổi kỳ");
    assert.equal(formatRemaining(-5), "đang đổi kỳ");
    assert.equal(formatRemaining(Number.NaN), "đang đổi kỳ");
    assert.equal(formatRemaining(30_000), "dưới 1 phút");
    assert.equal(formatRemaining(1 * M), "1 phút");
    assert.equal(formatRemaining(59 * M), "59 phút");
    assert.equal(formatRemaining(60 * M), "1 giờ 0 phút");
    assert.equal(formatRemaining(5 * 60 * M + 12 * M), "5 giờ 12 phút");
    assert.equal(formatRemaining(24 * 60 * M), "1 ngày 0 giờ");
    assert.equal(formatRemaining(2 * 24 * 60 * M + 3 * 60 * M + 40 * M), "2 ngày 3 giờ");
  });
});

describe("kiểu chướng ngại", () => {
  it("đủ bốn kiểu, ổn định theo vị trí và phân tán đều", () => {
    const counts = new Map<string, number>();
    for (let i = 0; i < 400; i++) {
      assert.equal(obstacleKind(i), obstacleKind(i));
      counts.set(obstacleKind(i), (counts.get(obstacleKind(i)) ?? 0) + 1);
    }
    assert.deepEqual([...counts.keys()].sort(), [...OBSTACLE_KINDS].sort());
    for (const n of counts.values()) assert.ok(n >= 60 && n <= 140, `phân bố lệch: ${n}`);
  });
});

describe("hướng dẫn từng bước", () => {
  const base = createPuzzle(RULESETS[0]!, 3);
  const at = (patch: Partial<PuzzleState>): PuzzleState => ({ ...base, ...patch });

  it("bước 1 khi chưa đặt quân nào, rồi bước 2, nhắc Bỏ Lệnh khi hết nước, nhắc dọn hàng", () => {
    assert.match(tutorialText(base, false)!, /Bước 1/);
    assert.match(tutorialText(at({ placed: 1 }), false)!, /Bước 2/);
    assert.match(tutorialText(at({ placed: 2 }), true)!, /Bỏ Lệnh/);
    assert.match(tutorialText(at({ placed: 8, linesCleared: 1 }), false)!, /dọn sạch/);
  });

  it("hết lời nhắc khi đã quen, và không nhắc khi ván đã xong", () => {
    assert.equal(tutorialText(at({ placed: 20, linesCleared: 5 }), false), null);
    assert.equal(tutorialText(at({ phase: "won" }), false), null);
    assert.equal(tutorialText(at({ phase: "lost" }), true), null);
  });

  it("chơi thật 3x3: mọi bước đều trả lời hợp lệ (không ném lỗi)", () => {
    let s = createPuzzle(RULESETS[0]!, 11);
    for (let i = 0; i < 40 && s.phase === "playing"; i++) {
      const legal = legalPlacements(s);
      void tutorialText(s, legal.length === 0);
      const t = transition(s, legal.length ? { kind: "place", row: Math.floor(legal[0]! / s.width), col: legal[0]! % s.width } : { kind: "discard" });
      assert.ok(t.ok);
      s = t.state;
    }
  });
});
