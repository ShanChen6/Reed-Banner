import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  STANDARD_WEIGHTS,
  createRng,
  findMatches,
  findValidMoves,
  formatBoard,
  generateBoard,
  hasValidMove,
  parseBoard,
  resolveBoard,
  swap,
  tileAt,
  type MoveResult,
  type Pos,
  type SwapOutcome,
} from "../../../src/core";

const W = STANDARD_WEIGHTS;
const key = (p: Pos) => `${p.row},${p.col}`;

function valid(outcome: SwapOutcome): MoveResult {
  assert.ok(outcome.valid, "nước đi phải hợp lệ");
  return outcome;
}

describe("swap", () => {
  const board = parseBoard(`
    ABTSV
    TSVAB
    KKAKB
    VTBSA
  `);

  it("nước không tạo bộ ghép bị từ chối, bàn giữ nguyên", () => {
    assert.deepEqual(swap(board, { row: 0, col: 0 }, { row: 0, col: 1 }, createRng(1), W), { valid: false });
  });

  it("ghép 3 thu hoạch 3 ô, không tạo ô đặc biệt", () => {
    const result = valid(swap(board, { row: 2, col: 3 }, { row: 2, col: 2 }, createRng(1), W));
    const [step] = result.steps;
    assert.equal(step?.matches[0]?.shape, "line3");
    assert.equal(step?.harvest.kiem, 3);
    assert.deepEqual(step?.created, []);
    assert.deepEqual(step?.cleared.map(key), ["2,0", "2,1", "2,2"]);
  });

  it("không có cascade thì ghép 3 không cho lượt thêm", () => {
    for (let seed = 0; seed < 50; seed++) {
      const result = valid(swap(board, { row: 2, col: 3 }, { row: 2, col: 2 }, createRng(seed), W));
      if (result.steps.length === 1) {
        assert.equal(result.extraTurn, false);
        return;
      }
    }
    assert.fail("không tìm được seed không có cascade");
  });

  it("ghép 4 cho lượt thêm, không tạo ô đặc biệt", () => {
    const b = parseBoard(`
      ABTSV
      TSKAB
      KKAKB
      VTBSA
    `);
    const result = valid(swap(b, { row: 1, col: 2 }, { row: 2, col: 2 }, createRng(1), W));
    assert.equal(result.extraTurn, true);
    const [step] = result.steps;
    assert.ok(step?.matches.some((m) => m.shape === "line4"));
  });

  it("chữ L tạo bản yếu tại ô người chơi vừa kéo tới", () => {
    const b = parseBoard(`
      KABTSV
      KBTSVA
      AKKTBS
      KTSVAB
      VSABTK
    `);
    const result = valid(swap(b, { row: 3, col: 0 }, { row: 2, col: 0 }, createRng(1), W));
    const [step] = result.steps;
    assert.equal(step?.matches[0]?.shape, "lt");
    assert.deepEqual(step?.created, [{ pos: { row: 2, col: 0 }, tile: { kind: "kiem", special: "weak" } }]);
    assert.deepEqual(tileAt(step!.boardAfterClear, { row: 2, col: 0 }), { kind: "kiem", special: "weak" });
    assert.equal(result.extraTurn, true);
  });

  it("thẳng 5 tạo bản mạnh tại ô người chơi vừa kéo tới", () => {
    const b = parseBoard(`
      ABTSV
      BTKVA
      KKAKK
      TSBAT
    `);
    const result = valid(swap(b, { row: 1, col: 2 }, { row: 2, col: 2 }, createRng(1), W));
    assert.deepEqual(result.steps[0]?.created, [{ pos: { row: 2, col: 2 }, tile: { kind: "kiem", special: "strong" } }]);
  });

  it("cùng seed cho cùng kết quả", () => {
    const start = generateBoard(createRng(77), W);
    const move = findValidMoves(start)[0]!;
    const a = valid(swap(start, move.from, move.to, createRng(9), W));
    const b = valid(swap(start, move.from, move.to, createRng(9), W));
    assert.equal(formatBoard(a.board), formatBoard(b.board));
    assert.deepEqual(a.harvest, b.harvest);
  });
});

describe("resolveBoard", () => {
  it("ô đặc biệt do cascade xuất hiện ở ô giữa dãy", () => {
    const b = parseBoard(`
      ABTSV
      BTAVA
      KKKKK
      TSBAT
    `);
    const result = resolveBoard(b, createRng(1), W);
    assert.deepEqual(result.steps[0]?.created[0]?.pos, { row: 2, col: 2 });
  });

  it("kiếm đồng nổ chữ thập nhỏ, ô bị nổ được thu hoạch", () => {
    const b = parseBoard(`
      ABTSV
      BTAVA
      KkKBS
      TSBAT
      SVTBA
    `);
    const [step] = resolveBoard(b, createRng(1), W).steps;
    assert.equal(step?.activations.length, 1);
    assert.deepEqual(step?.cleared.map(key), ["1,1", "2,0", "2,1", "2,2", "3,1"]);
    assert.equal(step?.harvest.kiem, 3);
    assert.equal(step?.harvest.tim, 1);
    assert.equal(step?.harvest.sach, 1);
  });

  it("nổ dây chuyền: kiếm lửa nổ trúng thẻ tre", () => {
    const b = parseBoard(`
      ABTSV
      BTsVA
      K1KBS
      TSBAT
      SVTBA
    `);
    const [step] = resolveBoard(b, createRng(1), W).steps;
    assert.deepEqual(
      step?.activations.map((a) => [a.tile.kind, a.tile.special]),
      [
        ["kiem", "strong"],
        ["sach", "weak"],
      ],
    );
    const cleared = new Set(step?.cleared.map(key));
    for (const p of ["1,3", "1,4", "0,2", "3,2"]) assert.ok(cleared.has(p), p);
  });

  it("âm dương thái cực xóa theo hướng bộ ghép", () => {
    const b = parseBoard(`
      KBTSV
      BATVK
      T2SKB
      SAVBT
      VKBTS
    `);
    const [step] = resolveBoard(b, createRng(1), W).steps;
    assert.deepEqual(step?.cleared.map(key), ["0,1", "1,1", "2,1", "3,1", "4,1"]);
  });

  it("mâm cỗ biến 4 ô thường thành bánh chưng", () => {
    const b = parseBoard(`
      AKTSV
      KTAVA
      B3BKS
      TSKAT
      SVTKA
    `);
    const [step] = resolveBoard(b, createRng(3), W).steps;
    assert.equal(step?.transformed.length, 4);
    const cleared = new Set(step?.cleared.map(key));
    for (const { pos, kind } of step!.transformed) {
      assert.equal(kind, "banhChung");
      assert.ok(!cleared.has(key(pos)));
      assert.deepEqual(tileAt(step!.boardAfterClear, pos), { kind: "banhChung" });
    }
  });

  it("bàn sau khi xử lý ổn định và còn nước đi", () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRng(seed);
      let board = generateBoard(rng, W);
      for (let turn = 0; turn < 20; turn++) {
        const move = findValidMoves(board)[0]!;
        const result = valid(swap(board, move.from, move.to, rng, W));
        board = result.board;
        if (result.steps.length < 100) assert.equal(findMatches(board).length, 0);
        assert.ok(hasValidMove(board));
        assert.ok(board.cells.every((t) => t !== null));
      }
    }
  });
});
