import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PASS, newGame, play, type Position } from "../../src/core/co-vay";
import { CUE_IDS, GO_CUES } from "../../src/app/game/audio/cues";
import { goMoveSounds } from "../../src/app/game/vay-thanh-ky/sounds";

/** Chơi lần lượt các điểm (hàng * 9 + cột) trên bàn 9×9. */
function after(points: readonly number[], mode: "full" | "capture" = "full"): Position {
  let pos = newGame(9, mode);
  for (const p of points) {
    const r = play(pos, p);
    assert.ok(r.legal, `nước ${p}`);
    pos = r.position;
  }
  return pos;
}
const at = (r: number, c: number) => r * 9 + c;

describe("âm thanh Vây Thành Kỳ", () => {
  it("đặt quân, bỏ lượt, nước không hợp lệ", () => {
    assert.deepEqual(goMoveSounds(newGame(9, "full"), at(4, 4)), ["go.place"]);
    assert.deepEqual(goMoveSounds(newGame(9, "full"), PASS), ["go.pass"]);
    assert.deepEqual(goMoveSounds(after([at(4, 4)]), at(4, 4)), []);
  });

  it("atari rồi bắt quân", () => {
    // Đen vây quân Trắng ở (4,4): ba mặt trước, mặt thứ tư bắt.
    const pos = after([at(3, 4), at(4, 4), at(4, 3), at(0, 0), at(4, 5)]);
    // Trắng đi một nước xa; Đen đặt (5,4) là bắt.
    const before = play(pos, at(0, 8)).position;
    assert.deepEqual(goMoveSounds(before, at(5, 4)), ["go.place", "go.capture_small"]);
    // Nước Đen thứ ba quanh quân Trắng làm nó còn một khí.
    const two = after([at(3, 4), at(4, 4), at(4, 3), at(0, 0)]);
    assert.deepEqual(goMoveSounds(two, at(4, 5)), ["go.place", "go.atari"]);
  });

  it("mọi cue đã khai báo và có trong manifest", () => {
    const manifest = JSON.parse(readFileSync("public/audio/manifest.json", "utf8")) as { sfx: Record<string, unknown> };
    for (const id of GO_CUES) {
      assert.ok((CUE_IDS as readonly string[]).includes(id));
      assert.ok(manifest.sfx[id], id);
    }
  });
});
