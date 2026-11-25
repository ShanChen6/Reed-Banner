import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BLUE, RED, newGame, type Move, type Piece, type Position, type Stack } from "../../src/core/tam-quan-ky";
import { CUE_IDS, TQK_CUES } from "../../src/app/game/audio/cues";
import { moveCue } from "../../src/app/game/tam-quan-ky/sounds";

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
});
