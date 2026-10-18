import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOARD_COLS,
  BOARD_ROWS,
  STANDARD_WEIGHTS,
  createRng,
  findMatches,
  formatBoard,
  generateBoard,
  hasValidMove,
  parseBoard,
  pickKind,
  shuffleBoard,
  validateWeights,
} from "../../../src/core";

describe("generateBoard", () => {
  it("bàn 12×8, không có bộ ghép sẵn, có nước đi", () => {
    for (let seed = 0; seed < 200; seed++) {
      const board = generateBoard(createRng(seed), STANDARD_WEIGHTS);
      assert.equal(board.cols, BOARD_COLS);
      assert.equal(board.rows, BOARD_ROWS);
      assert.ok(board.cells.every((t) => t && !t.special));
      assert.equal(findMatches(board).length, 0, `seed ${seed}`);
      assert.ok(hasValidMove(board), `seed ${seed}`);
    }
  });

  it("cùng seed cho cùng bàn", () => {
    const a = formatBoard(generateBoard(createRng(2026), STANDARD_WEIGHTS));
    const b = formatBoard(generateBoard(createRng(2026), STANDARD_WEIGHTS));
    assert.equal(a, b);
    assert.notEqual(a, formatBoard(generateBoard(createRng(2027), STANDARD_WEIGHTS)));
  });
});

describe("tỉ lệ sinh ô", () => {
  it("bảng chuẩn hợp lệ", () => {
    assert.doesNotThrow(() => validateWeights(STANDARD_WEIGHTS));
  });

  it("từ chối loại dưới 8% hoặc trên 35%, hoặc tổng khác 100", () => {
    assert.throws(() => validateWeights({ ...STANDARD_WEIGHTS, kiem: 7, amDuong: 27 }), RangeError);
    assert.throws(() => validateWeights({ ...STANDARD_WEIGHTS, kiem: 36, amDuong: 8, banhChung: 5 }), RangeError);
    assert.throws(() => validateWeights({ ...STANDARD_WEIGHTS, kiem: 20 }), RangeError);
  });

  it("pickKind bám sát trọng số", () => {
    const rng = createRng(1);
    const n = 100_000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      const k = pickKind(rng, STANDARD_WEIGHTS);
      counts[k] = (counts[k] ?? 0) + 1;
    }
    for (const [kind, weight] of Object.entries(STANDARD_WEIGHTS)) {
      assert.ok(Math.abs((counts[kind] ?? 0) / n - weight / 100) < 0.01, kind);
    }
  });
});

describe("shuffleBoard", () => {
  it("giữ nguyên ô đặc biệt và số ô mỗi loại, cho bàn có nước đi", () => {
    const board = parseBoard(`
      KABTKABT
      ABTKABTK
      1TKABTKA
      TKABTKAb
    `);
    const result = shuffleBoard(board, createRng(5), STANDARD_WEIGHTS);
    assert.deepEqual(result.cells[16], { kind: "kiem", special: "strong" });
    assert.deepEqual(result.cells[31], { kind: "banhChung", special: "weak" });
    assert.equal(findMatches(result).length, 0);
    assert.ok(hasValidMove(result));
    const count = (b: typeof board) => b.cells.map((t) => t!.kind).sort().join();
    assert.equal(count(result), count(board));
  });
});
