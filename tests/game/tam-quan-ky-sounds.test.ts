import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BLUE, RED, newGame, play, type Move, type Piece, type Position, type Stack } from "../../src/core/tam-quan-ky";
import { CUE_IDS, TQK_CUES } from "../../src/app/game/audio/cues";
import { moveCue, moveSounds } from "../../src/app/game/tam-quan-ky/sounds";

const piece = (type: Piece["type"]): Piece => ({ type, color: RED, hero: false });
/** Thế chỉ có một chồng ở ô 0, đủ để moveCue đọc quân đi. */
function at(stack: Stack): Position {
  const base = newGame();
  const board = base.board.map(() => null as Stack | null);
  board[0] = stack;
  return { ...base, board, toMove: RED };
}
const mv = (kind: Move["kind"], unit: Move["unit"] = "stack"): Move => ({ from: 0, to: 1, unit, kind });

describe("âm thanh Tam Quân Kỳ", () => {
  it("ăn quân ưu tiên nhất, rồi lên chung", () => {
    const boat = at({ carrier: piece("n"), riders: [] });
    for (const k of ["capture", "fire", "strike"] as const) assert.equal(moveCue(boat, mv(k)), "tqk.capture");
    assert.equal(moveCue(at({ carrier: piece("i"), riders: [] }), mv("join")), "tqk.carry");
  });

  it("theo quân đi: thuyền, Thiên mã, chồng chở quân, quân thường", () => {
    assert.equal(moveCue(at({ carrier: piece("n"), riders: [piece("i")] }), mv("move")), "tqk.boat");
    assert.equal(moveCue(at({ carrier: piece("f"), riders: [] }), mv("move")), "tqk.fly");
    assert.equal(moveCue(at({ carrier: piece("n"), riders: [piece("f")] }), mv("move", 0)), "tqk.fly");
    assert.equal(moveCue(at({ carrier: piece("h"), riders: [piece("i")] }), mv("move")), "tqk.carry");
    assert.equal(moveCue(at({ carrier: piece("h"), riders: [piece("i")] }), mv("move", 0)), "tqk.move");
    assert.equal(moveCue(at({ carrier: { ...piece("i"), color: BLUE }, riders: [] }), mv("move")), "tqk.move");
  });

  it("mọi cue đã khai báo và có trong manifest", () => {
    const manifest = JSON.parse(readFileSync("public/audio/manifest.json", "utf8")) as { sfx: Record<string, unknown> };
    for (const id of TQK_CUES) {
      assert.ok((CUE_IDS as readonly string[]).includes(id));
      assert.ok(manifest.sfx[id], id);
    }
  });

  it("chiếu tướng: bên mình bị chiếu là checked, mình chiếu hoặc chơi chung máy là check; có thêm anh hùng thì hero", () => {
    // Bốn nước đầu, nước thứ tư của Xanh chiếu tướng Đỏ (tìm bằng dò cây nước đi).
    const line: Move[] = [
      { from: 15, to: 12, unit: "stack", kind: "join" },
      { from: 114, to: 90, unit: "stack", kind: "join" },
      { from: 35, to: 79, unit: "stack", kind: "fire" },
      { from: 90, to: 46, unit: "stack", kind: "capture" },
    ];
    const before = line.slice(0, 3).reduce((p, m) => play(p, m), newGame());
    const last = line[3]!;
    const after = play(before, last);
    const red = moveSounds(before, after, last, RED);
    assert.equal(red[0], "tqk.capture");
    assert.ok(red.includes("tqk.checked"));
    assert.ok(moveSounds(before, after, last, BLUE).includes("tqk.check"));
    assert.ok(moveSounds(before, after, last, null).includes("tqk.check"));
    // Quân chiếu tướng được phong anh hùng.
    assert.ok(red.includes("tqk.hero"));
    // Nước mở đầu bình thường: chỉ một tiếng.
    assert.deepEqual(moveSounds(newGame(), play(newGame(), line[0]!), line[0]!, RED), ["tqk.carry"]);
  });

  it("phong anh hùng mà không chiếu", () => {
    const from = at({ carrier: piece("i"), riders: [] });
    const next = at({ carrier: { ...piece("i"), hero: true }, riders: [] });
    assert.deepEqual(moveSounds(from, next, mv("move"), RED), ["tqk.move", "tqk.hero"]);
  });
});
