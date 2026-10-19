import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findMatches, findValidMoves, isValidMove, parseBoard } from "../../../src/core";

describe("findMatches", () => {
  it("không có bộ ghép", () => {
    assert.deepEqual(findMatches(parseBoard("KAB\nAKB\nBBA")), []);
  });

  it("thẳng 3 và thẳng 4", () => {
    const groups = findMatches(parseBoard(`
      KKKA
      ABAB
      TTTT
    `));
    assert.deepEqual(
      groups.map((g) => [g.kind, g.shape, g.cells.length]),
      [
        ["kiem", "line3", 3],
        ["tim", "line4", 4],
      ],
    );
  });

  it("chữ L và chữ T là bản yếu, góc là ô chung", () => {
    const [l] = findMatches(parseBoard(`
      KAB
      KBA
      KKK
    `));
    assert.equal(l?.shape, "lt");
    assert.equal(l?.cells.length, 5);

    const [t] = findMatches(parseBoard(`
      KKK
      AKB
      BKA
    `));
    assert.equal(t?.shape, "lt");
  });

  it("thẳng 5 là bản mạnh, kể cả khi có nhánh", () => {
    const [g] = findMatches(parseBoard(`
      AAKAA
      KKKKK
      BAKAB
    `));
    assert.equal(g?.shape, "line5");
    assert.equal(g?.cells.length, 7);
  });

  it("hai dãy song song cùng loại là hai bộ ghép riêng", () => {
    const groups = findMatches(parseBoard(`
      KKK
      KKK
      ABA
    `));
    assert.equal(groups.length, 2);
  });
});

describe("nước đi", () => {
  const board = parseBoard(`
    KAKB
    AKBT
  `);

  it("đổi tạo bộ ghép là hợp lệ", () => {
    assert.equal(isValidMove(board, { row: 0, col: 1 }, { row: 1, col: 1 }), true);
  });

  it("đổi không tạo bộ ghép là không hợp lệ", () => {
    assert.equal(isValidMove(board, { row: 0, col: 2 }, { row: 0, col: 3 }), false);
  });

  it("không cho đổi ô không kề, ô cùng loại hoặc ra ngoài bàn", () => {
    assert.equal(isValidMove(board, { row: 0, col: 0 }, { row: 1, col: 1 }), false);
    assert.equal(isValidMove(board, { row: 0, col: 3 }, { row: 0, col: 4 }), false);
    assert.equal(isValidMove(parseBoard("KKAK"), { row: 0, col: 0 }, { row: 0, col: 1 }), false);
  });

  it("findValidMoves liệt kê đúng các nước", () => {
    const moves = findValidMoves(board).map((m) => `${m.from.row}${m.from.col}-${m.to.row}${m.to.col}`);
    assert.deepEqual(moves, ["01-11"]);
  });
});
