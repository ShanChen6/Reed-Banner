// Chép từ Shanverse (src/features/games/go/mcts.test.ts), xem nguồn ở src/core/co-vay/mcts.ts. Hai test cuối đổi từ engine.handle sang chooseMove.
import assert from "node:assert/strict";
import test from "node:test";

import { BLACK, PASS, WHITE, newGame, parsePoint, play, type Position } from "../../../src/core/co-vay/logic";
import { createRng, estimateDead, search } from "../../../src/core/co-vay/mcts";
import { chooseMove } from "../../../src/core/co-vay/ai";

function fromRows(rows: string[], toPlay: typeof BLACK | typeof WHITE, mode: "full" | "capture" = "full"): Position {
  const size = rows.length;
  const pos = newGame(size, mode);
  pos.board.fill(0);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    pos.board[y * size + x] = ch === "X" ? BLACK : ch === "O" ? WHITE : 0;
  }));
  pos.toPlay = toPlay;
  pos.moveNumber = 20;
  return pos;
}

test("the random generator is repeatable", () => {
  const a = createRng(42);
  const b = createRng(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test("capture mode: takes a stone that is in atari", () => {
  const pos = fromRows([
    ".........",
    ".........",
    "...XO....",
    "..XO.X...",
    "...X.....",
    ".........",
    ".........",
    ".........",
    ".........",
  ], BLACK, "capture");
  // The white stone at D6 has a single liberty left, at E6.
  const result = search(pos, { playouts: 1500 }, createRng(1), () => 0);
  const after = play(pos, result.move).position;
  assert.equal(after.winner, BLACK, `expected a capture, got ${result.move}`);
});

test("capture mode: escapes when its own stone is in atari", () => {
  const pos = fromRows([
    ".........",
    ".........",
    "...O.....",
    "..OXO....",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ], BLACK, "capture");
  const result = search(pos, { playouts: 3000 }, createRng(2), () => 0);
  assert.equal(result.move, parsePoint("D5", 9), "extends the stone out of atari");
});

test("full game: captures a group that is in atari", () => {
  const pos = fromRows([
    ".........",
    "..OOO....",
    "..XXXO...",
    "..OOO....",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ], WHITE);
  // The three black stones have one liberty left, at B7.
  const result = search(pos, { playouts: 3000 }, createRng(3), () => 0);
  const after = play(pos, result.move);
  assert.equal(after.captured, 3, `expected the capture, got ${result.move}`);
});

test("dead stones: lone stones inside the other side's area are dead", () => {
  const pos = fromRows([
    ".........",
    "..O......",
    ".........",
    "XXXXXXXXX",
    "OOOOOOOOO",
    ".........",
    "......X..",
    ".........",
    ".........",
  ], BLACK);
  const dead = estimateDead(pos, createRng(4), 200);
  assert.deepEqual(dead, [parsePoint("C8", 9), parsePoint("G3", 9)].sort((a, b) => a - b));
});

test("máy trả về nước hợp lệ và không xin thua ngay đầu ván", () => {
  const moves = ["E5", "C3", "G7"].map((n) => parsePoint(n, 9));
  let pos = newGame(9, "full");
  for (const m of moves) pos = play(pos, m).position;
  const response = chooseMove(pos, "easy", 5);
  assert.equal(response.resign, false);
  assert.equal(play(pos, response.move).legal, true);
});

test("máy bỏ lượt theo khi người chơi bỏ lượt mà máy đang dẫn", () => {
  const pos = fromRows([
    "...XO....",
    "...XO....",
    "...XO....",
    "...XO....",
    "...XO....",
    "...XO....",
    "...XO....",
    "...XO....",
    "...XO....",
  ], WHITE);
  pos.passes = 1;
  pos.moveNumber = 40;
  assert.equal(chooseMove(pos, "easy", 3).move, PASS);
});
