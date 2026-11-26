// Âm thanh của Vây Thành Kỳ: chọn tiếng cho một nước cờ vây, hàm thuần để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.10.

import { PASS, play, singleLiberty, type Color, type Position } from "@/core/co-vay";
import type { GO_CUES } from "../audio/cues";

type GoCue = (typeof GO_CUES)[number];

/** Bắt từ chừng này quân trở lên trong một nước thì tiếng bắt lớn (`go.capture_big`). */
export const BIG_CAPTURE = 4;

/** Khoảng cách giữa các tiếng nối tiếp của một nước (đặt quân, rồi bắt quân, rồi báo atari). */
export const FOLLOW_GAP_MS = 220;

/** Số nhóm quân của `color` chỉ còn một khí. */
function groupsInAtari(pos: Position, color: Color): number {
  const seen = new Uint8Array(pos.board.length);
  let n = 0;
  for (let p = 0; p < pos.board.length; p++) {
    if (pos.board[p] !== color || seen[p]) continue;
    // Đánh dấu cả nhóm để không đếm lại.
    const stack = [p];
    seen[p] = 1;
    const size = pos.size;
    while (stack.length) {
      const q = stack.pop()!;
      const r = Math.floor(q / size);
      const c = q % size;
      for (const [rr, cc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as const) {
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const k = rr * size + cc;
        if (!seen[k] && pos.board[k] === color) {
          seen[k] = 1;
          stack.push(k);
        }
      }
    }
    if (singleLiberty(pos.board, size, p) >= 0) n++;
  }
  return n;
}

/**
 * Các tiếng của nước `move` từ thế `before`, phát lần lượt: bỏ lượt là `go.pass`; đặt quân là `go.place`, bắt quân thêm
 * `go.capture_small` hoặc (từ `BIG_CAPTURE` quân) `go.capture_big`; bên kia có thêm nhóm chỉ còn một khí thì `go.atari`.
 * Nước không hợp lệ trả mảng rỗng.
 */
export function goMoveSounds(before: Position, move: number): GoCue[] {
  if (move === PASS) return ["go.pass"];
  const { position: after, legal, captured } = play(before, move);
  if (!legal) return [];
  const out: GoCue[] = ["go.place"];
  if (captured > 0) out.push(captured >= BIG_CAPTURE ? "go.capture_big" : "go.capture_small");
  const foe = after.toPlay;
  if (!after.winner && groupsInAtari(after, foe) > groupsInAtari(before, foe)) out.push("go.atari");
  return out;
}

/** Phát lần lượt các tiếng của một nước, cách nhau `FOLLOW_GAP_MS`. */
export function playInTurn(cues: readonly GoCue[], playCue: (id: GoCue) => void): void {
  cues.forEach((id, i) => (i === 0 ? playCue(id) : window.setTimeout(() => playCue(id), FOLLOW_GAP_MS * i)));
}

/** Tiếng hết ván: hai người chơi chung máy (`me` null) hoặc phe mình thắng là `go.win`, còn lại `go.lose`. */
export const goResultCue = (winner: Color, me: Color | null): GoCue => (me === null || winner === me ? "go.win" : "go.lose");

/** Hết ván bằng đếm điểm: tiếng đếm điểm trước, tiếng thắng/thua sau chừng này. */
export const RESULT_AFTER_SCORE_MS = 1200;
