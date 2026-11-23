// Tiếng bấm chung của giao diện: nút, liên kết, thẻ tab. Bàn cờ và sa bàn tự có tiếng riêng nên không phát thêm.

import type { CueId } from "./cues";

/** Thứ cần biết về phần tử được bấm, đọc từ DOM ở `UiClickSounds`. */
export interface ClickTarget {
  /** Giá trị `data-sfx` gần nhất: "none" tắt tiếng, "back" dùng tiếng quay lại, "click" ép tiếng bấm. */
  readonly sfx: string | null;
  /** Nằm trong bàn cờ (`role="grid"`/`"application"`), nơi màn chơi tự phát tiếng. */
  readonly inBoard: boolean;
  /** `aria-label`, `title` hoặc chữ trên nút. */
  readonly label: string;
}

const BACK_LABEL = /^\s*(về|quay lại|trở lại|trở về|đóng|thoát)(\s|$)/iu;

/** Tiếng phát khi bấm một nút; null là im. */
export function clickCue(t: ClickTarget): Extract<CueId, "ui.click" | "ui.back"> | null {
  if (t.sfx === "none") return null;
  if (t.sfx === "back") return "ui.back";
  if (t.sfx === "click") return "ui.click";
  if (t.inBoard) return null;
  return BACK_LABEL.test(t.label) ? "ui.back" : "ui.click";
}
