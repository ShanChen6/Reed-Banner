// Máy trạng thái của một ván. `transition` bất biến: lệnh sai trả `ok: false`, state, điểm, thanh Bỏ Lệnh và RNG không đổi.

import { createRng } from "../rng";
import { nextPiece } from "./generator";
import { checkPlacement, completedLines, idx } from "./rules";
import { RULESETS, SCHEMA_VERSION } from "./rulesets";
import type { BoardPiece, Cell, Command, Piece, PuzzleEvent, PuzzleState, Ruleset, Transition } from "./types";

function rulesFor(state: PuzzleState): Ruleset | null {
  const r = RULESETS.find((x) => x.id === state.rulesetId);
  return r && r.version === state.rulesVersion ? r : null;
}

/** Ván mới từ seed (số nguyên 32 bit không dấu). Quân đầu tiên luôn là quân thường hoặc Quân Lệnh. */
export function createPuzzle(rules: Ruleset, seed: number): PuzzleState {
  const rng = createRng(seed);
  const hand = nextPiece(rng, rules, 0, null, false);
  return {
    schemaVersion: SCHEMA_VERSION,
    rulesetId: rules.id,
    rulesVersion: rules.version,
    seed: seed >>> 0,
    width: rules.width,
    height: rules.height,
    cells: Array.from({ length: rules.width * rules.height }, (): Cell => ({ covered: false, piece: null })),
    hand,
    discardHeat: 0,
    score: 0,
    placed: 0,
    discarded: 0,
    linesCleared: 0,
    coveredCount: 0,
    phase: "playing",
    turn: 0,
    rngState: rng.state(),
  };
}

export function transition(state: PuzzleState, command: Command): Transition {
  if (state.phase !== "playing") return { ok: false, reason: "finished" };
  const rules = rulesFor(state);
  if (!rules) return { ok: false, reason: "invalidCommand" };
  if (command.kind === "discard") return discard(state, rules);
  if (command.kind === "place") return place(state, rules, command.row, command.col);
  return { ok: false, reason: "invalidCommand" };
}

function spawn(state: PuzzleState, rules: Ruleset, cells: readonly Cell[], used: Piece, turn: number) {
  const rng = createRng(state.rngState);
  const hand = nextPiece(rng, rules, turn, used, cells.some((c) => c.piece !== null));
  return { hand, rngState: rng.state() };
}

function discard(state: PuzzleState, rules: Ruleset): Transition {
  const events: PuzzleEvent[] = [];
  const turn = state.turn + 1;
  if (state.discardHeat >= rules.maxHeat) {
    events.push({ type: "discarded", piece: state.hand, heat: state.discardHeat }, { type: "lost", reason: "heat" });
    return { ok: true, state: { ...state, discarded: state.discarded + 1, turn, phase: "lost" }, events };
  }
  const heat = state.discardHeat + 1;
  const next = spawn(state, rules, state.cells, state.hand, turn);
  events.push({ type: "discarded", piece: state.hand, heat }, { type: "heat", heat }, { type: "spawned", piece: next.hand });
  return { ok: true, state: { ...state, discardHeat: heat, discarded: state.discarded + 1, turn, ...next }, events };
}

function place(state: PuzzleState, rules: Ruleset, row: number, col: number): Transition {
  const piece = state.hand;
  const check = checkPlacement(state, piece, row, col);
  if (!check.ok) return { ok: false, reason: check.reason };

  const { width, height } = state;
  const at = idx(width, row, col);
  const cells = state.cells.slice();
  const events: PuzzleEvent[] = [];
  let score = state.score;
  let covered = state.coveredCount;
  let linesCleared = state.linesCleared;
  let heat = state.discardHeat;
  const turn = state.turn + 1;

  if (piece.kind === "eraser") {
    const gone = cells[at]!.piece!;
    cells[at] = { covered: cells[at]!.covered, piece: null };
    events.push({ type: "erased", row, col, piece: gone });
    heat = Math.max(0, heat - 1);
  } else {
    const onBoard: BoardPiece = piece;
    if (!cells[at]!.covered) {
      covered += 1;
      events.push({ type: "covered", row, col });
    }
    // Điểm cộng thêm tính trên quân kề *trước khi* đặt; Quân Lệnh không tạo điểm khớp hoàn hảo.
    let perfect = 0;
    if (piece.kind === "normal") {
      for (const n of [row > 0 ? at - width : -1, row < height - 1 ? at + width : -1, col > 0 ? at - 1 : -1, col < width - 1 ? at + 1 : -1]) {
        const nb = n >= 0 ? cells[n]!.piece : null;
        if (nb && nb.kind === "normal" && nb.profession === piece.profession && nb.element === piece.element) perfect += 1;
      }
    }
    cells[at] = { covered: true, piece: onBoard };
    events.push({ type: "placed", row, col, piece: onBoard });
    score += rules.score.place + perfect * rules.score.perfectNeighbor;
    heat = Math.max(0, heat - 1);

    // Hàng và cột kín cùng lượt: xóa hợp các ô một lần, mỗi đường tính điểm một lần, vệt khai thông giữ nguyên.
    const lines = completedLines(cells, width, height);
    if (lines.length > 0) {
      const clear = new Set<number>();
      for (const l of lines) {
        events.push({ type: "lineCleared", axis: l.axis, index: l.index });
        for (let k = 0; k < (l.axis === "row" ? width : height); k++) clear.add(l.axis === "row" ? idx(width, l.index, k) : idx(width, k, l.index));
      }
      for (const i of clear) cells[i] = { covered: cells[i]!.covered, piece: null };
      score += lines.length * rules.score.line;
      linesCleared += lines.length;
      heat = 0;
    }
  }

  if (heat !== state.discardHeat) events.push({ type: "heat", heat });
  const base: PuzzleState = {
    ...state,
    cells,
    score,
    coveredCount: covered,
    linesCleared,
    discardHeat: heat,
    placed: state.placed + 1,
    turn,
  };
  // Thắng được xét ngay sau khi đặt và dọn hàng, trước khi sinh quân mới (không tiêu RNG).
  if (covered === width * height) {
    events.push({ type: "won" });
    return { ok: true, state: { ...base, score: score + rules.score.win, phase: "won" }, events };
  }
  const next = spawn(state, rules, cells, piece, turn);
  events.push({ type: "spawned", piece: next.hand });
  return { ok: true, state: { ...base, ...next }, events };
}

/** Chạy lại một dãy lệnh từ seed; dừng và trả `null` ở lệnh đầu tiên bị từ chối. Dùng cho kiểm thử và xác minh. */
export function replay(rules: Ruleset, seed: number, commands: readonly Command[]): PuzzleState | null {
  let state = createPuzzle(rules, seed);
  for (const c of commands) {
    const t = transition(state, c);
    if (!t.ok) return null;
    state = t.state;
  }
  return state;
}
