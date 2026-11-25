// Âm thanh của Tam Quân Kỳ: chọn tiếng cho một nước đi theo loại nước và quân đi, hàm thuần để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.9.

import type { Move, Position } from "@/core/tam-quan-ky";
import type { TQK_CUES } from "../audio/cues";

type TqkCue = Exclude<(typeof TQK_CUES)[number], "tqk.select">;

/**
 * Tiếng cho nước `move` đi từ thế `from`, xét theo thứ tự:
 * ăn quân (đánh chiếm, bắn, Thiên mã lao vào vùng phòng không) → lên chung một quân khác → Chiến thuyền đi → Thiên mã bay →
 * một chồng có quân đang được chở đi → nước đi thường.
 */
export function moveCue(from: Position, move: Move): TqkCue {
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
