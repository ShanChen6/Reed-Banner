// Âm thanh của Tầm Tướng Ký, hàm thuần để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.11.

import type { Slots } from "./altar";

/**
 * Có nguyên liệu mới vừa được đặt vào ô Đài Hợp Nguyên (chọn từ kho, dùng thẻ gợi ý, chọn lại cặp cũ) thì phát `ttk.slot`.
 * Gỡ quân, dọn ô sau khi ghép và đổi chỗ hai ô thì im.
 */
export function slotFilled(prev: Slots, next: Slots): boolean {
  if (next[0] === prev[1] && next[1] === prev[0]) return false;
  return next.some((id, i) => id !== null && id !== prev[i]);
}
