// Tiếng chung của giao diện: bấm nút, liên kết, thẻ tab; mở/đóng hộp thoại; báo lỗi. Bàn cờ và sa bàn tự có tiếng riêng nên không phát tiếng bấm.

import type { CueId } from "./cues";

/** Thứ cần biết về phần tử được bấm, đọc từ DOM ở `UiSounds`. */
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

/** Hộp thoại đang mở: `<dialog open>` hoặc lớp phủ `role="dialog"`/`"alertdialog"`, `aria-modal`. */
export const DIALOG_SELECTOR = 'dialog[open], [role="dialog"], [role="alertdialog"], [aria-modal="true"]';

/**
 * Tiếng khi giao diện đổi: số hộp thoại tăng là `ui.open`, giảm là `ui.close`; có thông báo lỗi mới (`role="alert"`) là `ui.error`.
 * Lỗi ưu tiên hơn đóng/mở vì người chơi cần biết thao tác không thành.
 */
export function overlayCue(prevDialogs: number, nextDialogs: number, newAlert: boolean): Extract<CueId, "ui.open" | "ui.close" | "ui.error"> | null {
  if (newAlert) return "ui.error";
  if (nextDialogs > prevDialogs) return "ui.open";
  if (nextDialogs < prevDialogs) return "ui.close";
  return null;
}
