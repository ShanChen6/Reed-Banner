import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BLUE, RED, legalMoves, newGame, parseSquare, play, type Position } from "../../src/core/tam-quan-ky";
import { BO_LINH_LINES, lineAfterMove, pickLine } from "../../src/app/game/tam-quan-ky/lines";

/** Thế cờ chỉ có các quân cho trước, ví dụ { c1: "C", k12: "c" }. */
function board(pieces: Record<string, string>, toMove = RED): Position {
  const grid: string[][] = Array.from({ length: 12 }, () => new Array<string>(11).fill(""));
  for (const [name, text] of Object.entries(pieces)) {
    const s = parseSquare(name);
    grid[11 - Math.floor(s / 11)]![s % 11] = text;
  }
  const rows = grid.map((row) => {
    let out = "";
    let empty = 0;
    for (const cell of row) {
      if (!cell) {
        empty++;
        continue;
      }
      if (empty) out += empty;
      empty = 0;
      out += cell;
    }
    return out + (empty ? empty : "");
  });
  const pos = newGame(rows.join("/"));
  pos.toMove = toMove;
  return pos;
}

describe("Thoại Đinh Bộ Lĩnh ở Tam Quân Kỳ", () => {
  it("nước đi thường thì im lặng", () => {
    const start = newGame();
    const next = play(start, legalMoves(start)[0]!);
    assert.equal(lineAfterMove(start, next), null);
  });

  it("Đỏ chiếu tướng thì hô chiếu, có thêm anh hùng vẫn ưu tiên câu chiếu", () => {
    const pos = board({ c1: "C", k12: "c", k10: "I" });
    const move = legalMoves(pos).find((m) => m.from === parseSquare("k10") && m.to === parseSquare("k11"))!;
    assert.equal(lineAfterMove(pos, play(pos, move)), "check");
  });

  it("Xanh chiếu tướng Đỏ thì Bộ Lĩnh dặn che chủ tướng", () => {
    const pos = board({ e1: "C", k12: "c", e3: "i" }, BLUE);
    const move = legalMoves(pos).find((m) => m.from === parseSquare("e3") && m.to === parseSquare("e2"))!;
    assert.equal(lineAfterMove(pos, play(pos, move)), "checked");
  });

  it("câu chọn theo số thứ tự, vòng lại khi hết, câu nào cũng kết bằng dấu câu", () => {
    for (const [kind, list] of Object.entries(BO_LINH_LINES)) {
      assert.ok(list.length > 0, kind);
      assert.equal(pickLine(kind as keyof typeof BO_LINH_LINES, list.length), list[0]);
      for (const line of list) assert.match(line, /[.!?]$/, line);
    }
  });
});
