// Âm thanh của Tầm Tướng Ký, hàm thuần để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.11.

import type { CueId } from "../audio/cues";
import type { CombineSummary, Slots } from "./altar";

/**
 * Tiếng khi ô Đài Hợp Nguyên đổi do người chơi thao tác: có nguyên liệu mới vào ô (chọn từ kho, dùng thẻ, chọn lại cặp đã thử)
 * là `ttk.slot`; gỡ nguyên liệu hoặc đổi chỗ hai ô là `ttk.unslot`; không đổi gì thì im. Dọn ô sau khi ghép không qua hàm này.
 */
export function slotCue(prev: Slots, next: Slots): Extract<CueId, "ttk.slot" | "ttk.unslot"> | null {
  if (next[0] !== null && next[1] !== null && next[0] !== next[1] && next[0] === prev[1] && next[1] === prev[0]) return "ttk.unslot";
  if (next.some((id, i) => id !== null && id !== prev[i])) return "ttk.slot";
  if (next.some((id, i) => id === null && prev[i] !== null)) return "ttk.unslot";
  return null;
}

/**
 * Tiếng cho kết quả ghép do server trả: không có công thức là `ttk.miss`; ra yếu tố đã biết (hoặc thêm một cách ra yếu tố đã biết)
 * là `ttk.known`; lệnh không hợp lệ là `ttk.reject`. Khám phá mới và ra tướng chưa có tệp riêng nên trả null (im).
 */
export function combineCue(outcome: Pick<CombineSummary, "status" | "isCharacter" | "nodeAlreadyKnown">): Extract<CueId, "ttk.miss" | "ttk.known" | "ttk.reject"> | null {
  switch (outcome.status) {
    case "noRecipe":
      return "ttk.miss";
    case "alreadyKnown":
      return "ttk.known";
    case "invalid":
      return "ttk.reject";
    case "created":
      return !outcome.isCharacter && outcome.nodeAlreadyKnown ? "ttk.known" : null;
  }
}
