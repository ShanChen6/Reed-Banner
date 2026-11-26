// Âm thanh của Tam Quân Kỳ: chọn tiếng cho một nước đi theo loại nước và quân đi, hàm thuần để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.9.

import { inCheck, type Color, type Move, type Position, type Result } from "@/core/tam-quan-ky";
import type { TQK_CUES } from "../audio/cues";

type TqkCue = (typeof TQK_CUES)[number];

/**
 * Tiếng cho nước `move` đi từ thế `from`, xét theo thứ tự:
 * ăn quân (đánh chiếm, bắn, Thiên mã lao vào vùng phòng không) → lên chung một quân khác → Chiến thuyền đi → Thiên mã bay →
 * một chồng có quân đang được chở đi → nước đi thường.
 */
export function moveCue(from: Position, move: Move): Exclude<TqkCue, "tqk.select" | "tqk.check" | "tqk.checked" | "tqk.hero" | "tqk.illegal"> {
  if (move.kind === "capture" || move.kind === "fire" || move.kind === "strike") return "tqk.capture";
  if (move.kind === "join") return "tqk.carry";
  const stack = from.board[move.from];
  if (!stack) return "tqk.move";
  const piece = move.unit === "stack" ? stack.carrier : stack.riders[move.unit];
  if (piece?.type === "n") return "tqk.boat";
  if (piece?.type === "f") return "tqk.fly";
  if (move.unit === "stack" && stack.riders.length > 0) return "tqk.carry";
  return "tqk.move";
}

/** Số quân anh hùng của mỗi phe (kể cả quân đang được chở). */
function heroes(pos: Position): Record<Color, number> {
  const n: Record<Color, number> = { r: 0, b: 0 };
  for (const stack of pos.board) {
    if (!stack) continue;
    for (const p of [stack.carrier, ...stack.riders]) if (p.hero) n[p.color]++;
  }
  return n;
}

/** Khoảng cách giữa các tiếng nối tiếp của một nước (tiếng đi quân, rồi chiếu tướng, rồi phong anh hùng). */
export const FOLLOW_GAP_MS = 280;

/**
 * Mọi tiếng của nước `move` từ thế `from` tới `next`, phát lần lượt: tiếng đi quân; chiếu tướng (`me` là phe của người chơi trên máy
 * này: bên mình bị chiếu là `tqk.checked`, mình chiếu hoặc hai người chơi chung máy là `tqk.check`); phe nào có thêm quân anh hùng
 * là `tqk.hero`. Ván vừa ngã ngũ thì không báo chiếu.
 */
export function moveSounds(from: Position, next: Position, move: Move, me: Color | null): TqkCue[] {
  const out: TqkCue[] = [moveCue(from, move)];
  if (!next.result && inCheck(next, next.toMove)) out.push(me !== null && next.toMove === me ? "tqk.checked" : "tqk.check");
  const before = heroes(from);
  const after = heroes(next);
  if (after.r > before.r || after.b > before.b) out.push("tqk.hero");
  return out;
}

/** Phát lần lượt các tiếng của một nước, cách nhau `FOLLOW_GAP_MS`. */
export function playInTurn(cues: readonly TqkCue[], play: (id: TqkCue) => void): void {
  cues.forEach((id, i) => (i === 0 ? play(id) : window.setTimeout(() => play(id), FOLLOW_GAP_MS * i)));
}

/** Tiếng hết ván: hòa là `tqk.draw`; hai người chơi chung máy (`me` null) hoặc phe mình thắng là `tqk.win`, còn lại `tqk.lose`. */
export function resultCue(result: Result, me: Color | null): TqkCue {
  if (result.winner === null) return "tqk.draw";
  return me === null || result.winner === me ? "tqk.win" : "tqk.lose";
}

/** Tiếng hết ván vào sau tiếng nước cuối một nhịp, để nghe rõ nước kết thúc ván. */
export const RESULT_DELAY_MS = 700;

/** Đồng hồ: còn chừng này giây cuối thì mỗi giây một tiếng `tqk.clock`. */
export const CLOCK_WARN_SECONDS = 10;

/** Đồng hồ vừa qua mốc một giây trong `CLOCK_WARN_SECONDS` giây cuối (chưa về 0). */
export function clockTickDue(prevMs: number, nextMs: number): boolean {
  const before = Math.ceil(prevMs / 1000);
  const after = Math.ceil(nextMs / 1000);
  return after < before && after > 0 && after <= CLOCK_WARN_SECONDS;
}
