import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  STANDARD_WEIGHTS,
  createRng,
  destroyCells,
  findMatches,
  generateBoard,
  parseBoard,
  randomCells,
  squareArea,
  tileAt,
  transformCells,
} from "../../../src/core";

const key = (p: { row: number; col: number }) => `${p.row},${p.col}`;

describe("vùng phá ô", () => {
  const board = generateBoard(createRng(1), STANDARD_WEIGHTS);

  it("vùng lẻ lấy ô chạm làm tâm, tràn bàn thì dịch vào trong", () => {
    assert.deepEqual(squareArea(board, { row: 3, col: 3 }, 3).map(key)[0], "2,2");
    assert.deepEqual(squareArea(board, { row: 0, col: 0 }, 3).map(key), ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2"]);
  });

  it("vùng chẵn lấy ô chạm làm góc trên trái", () => {
    assert.deepEqual(squareArea(board, { row: 2, col: 5 }, 2).map(key), ["2,5", "2,6", "3,5", "3,6"]);
    assert.deepEqual(squareArea(board, { row: 7, col: 11 }, 4).map(key)[0], "4,8");
  });

  it("ô ngẫu nhiên không trùng", () => {
    const cells = randomCells(board, 8, createRng(3)).map(key);
    assert.equal(new Set(cells).size, 8);
  });
});

describe("phá ô và biến ô", () => {
  const b = parseBoard(`
    ABTSV
    TSVAB
    KkABV
    VTBSA
  `);

  it("ô bị phá được thu hoạch, ô đặc biệt bị phá thì kích hoạt, không cho lượt thêm", () => {
    const result = destroyCells(b, [{ row: 2, col: 1 }], createRng(1), STANDARD_WEIGHTS);
    const [step] = result.steps;
    assert.equal(step?.activations.length, 1);
    assert.deepEqual(step?.cleared.map(key), ["1,1", "2,0", "2,1", "2,2", "3,1"]);
    assert.equal(result.extraTurn, false);
    assert.equal(result.harvest.kiem >= 2, true);
  });

  it("biến ô chỉ đổi ô thường, rồi cascade", () => {
    const start = generateBoard(createRng(4), STANDARD_WEIGHTS);
    const result = transformCells(start, "tim", 3, createRng(4), STANDARD_WEIGHTS);
    assert.equal(result.transformed.length, 3);
    assert.equal(result.extraTurn, false);
    if (result.steps.length === 0) {
      for (const p of result.transformed) assert.deepEqual(tileAt(result.board, p), { kind: "tim" });
    }
    assert.equal(findMatches(result.board).length, 0);
  });
});
