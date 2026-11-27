import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planPages, type FitBox } from "../../src/components/game-ui/fitPagesPlan";

/** Khối lẻ cao `h`, xếp liền nhau cách `gap`. */
function column(heights: number[], gap = 10): FitBox[] {
  let y = 0;
  return heights.map((h) => {
    const box = { top: y, bottom: y + h, groupTop: y, headPad: 0, tailPad: 0, first: true };
    y += h + gap;
    return box;
  });
}

describe("chia trang FitPages", () => {
  it("vừa một trang thì không chia", () => {
    assert.deepEqual(planPages(column([100, 100, 100]), 400), [0]);
  });

  it("chia tham lam theo chiều cao trang", () => {
    // 0–100, 110–210, 220–320, 330–430: trang 300 chứa hai khối đầu.
    assert.deepEqual(planPages(column([100, 100, 100, 100]), 300), [0, 2]);
  });

  it("khối cao hơn một trang đứng riêng một trang", () => {
    assert.deepEqual(planPages(column([50, 500, 50]), 300), [0, 1, 2]);
  });

  it("trang mở giữa nhóm tính lại tiêu đề nhóm", () => {
    // Nhóm từ 0, tiêu đề 40px, mỗi dòng 30px cách 10px, đệm đáy 10px.
    const boxes: FitBox[] = [0, 1, 2, 3, 4].map((i) => ({
      top: 40 + i * 40,
      bottom: 70 + i * 40,
      groupTop: 0,
      headPad: 40,
      tailPad: 10,
      first: i === 0,
    }));
    // Trang 160: dòng 0..2 (đáy 150 + 10). Trang sau mở ở dòng 3: từ 160 - 40 = 120, dòng 4 đáy 230 + 10 - 120 = 120.
    assert.deepEqual(planPages(boxes, 160), [0, 3]);
  });

  it("không có khối thì một trang rỗng", () => {
    assert.deepEqual(planPages([], 300), [0]);
  });
});
