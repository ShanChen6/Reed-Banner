import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBattle,
  playAiTurn,
  STARTER_COMPANIONS,
  mainCharacter,
  type BattleState,
  type Board,
  type CascadeStep,
} from "../../src/core";
import { bounceFrames, eventFrames } from "../../src/app/demo/animation";

const byId = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id)!;

function battle(seed: number): BattleState {
  return createBattle({
    sides: [
      { fighters: [mainCharacter("phong"), byId("haVan"), byId("maiThanh")], leader: 0 },
      { fighters: [byId("leThach"), byId("toKim"), byId("phungPhong")], leader: 0 },
    ],
    seed,
    timer: false,
  }).state;
}

/** Ô rơi phải xuất phát từ đúng ô cùng loại trên bàn sau khi xóa, ô mới thì từ ngoài mép trên. */
function checkFall(step: CascadeStep, anims: Readonly<Record<number, { dx: number; dy: number }>>) {
  const { rows, cols } = step.boardAfter;
  for (let i = 0; i < rows * cols; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const dy = anims[i]?.dy ?? 0;
    const origin = row + dy;
    if (origin < 0) continue;
    assert.deepEqual(step.boardAfterClear.cells[origin * cols + col], step.boardAfter.cells[i]);
  }
}

describe("hoạt ảnh trang /demo", () => {
  it("khung cuối của mỗi lượt khớp bàn cờ thật, kể cả trượt, kỹ năng và xáo bàn", () => {
    let s = battle(7);
    let checked = 0;
    for (let turn = 0; turn < 60 && s.winner === null; turn++) {
      const r = playAiTurn(s, "hard");
      const frames = eventFrames(s.board, r.events);
      if (frames.length > 0) {
        assert.deepEqual(frames.at(-1)!.board, r.state.board as Board);
        checked++;
      }
      s = r.state;
    }
    assert.ok(checked > 20);
  });

  it("ô rơi lấy đúng ô phía trên", () => {
    let s = battle(11);
    let steps = 0;
    for (let turn = 0; turn < 30 && s.winner === null; turn++) {
      const r = playAiTurn(s, "normal");
      const frames = eventFrames(s.board, r.events);
      const all = r.events.flatMap((e) => (e.type === "swap" || e.type === "board" ? e.steps : []));
      for (const step of all) {
        const frame = frames.find((f) => f.board === step.boardAfter)!;
        checkFall(step, frame.anims);
        steps++;
      }
      s = r.state;
    }
    assert.ok(steps > 0);
  });

  it("đổi ô sai: hai ô bật về phía nhau, bàn không đổi", () => {
    const s = battle(1);
    const [frame] = bounceFrames(s.board, { row: 0, col: 0 }, { row: 0, col: 1 });
    assert.equal(frame!.board, s.board);
    assert.deepEqual(frame!.anims[0], { kind: "bounce", dx: 1, dy: 0 });
    assert.deepEqual(frame!.anims[1], { kind: "bounce", dx: -1, dy: 0 });
  });
});
