// Âm thanh của Khai Lộ: ánh xạ thuần từ sự kiện của engine (`KlEvent`) sang cue, để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.8.

import type { KlEvent, KlReason } from "@/core/khai-lo";
import type { CueId } from "../audio/cues";

export interface CuePlay {
  readonly id: CueId;
  readonly rate?: number;
  /** Phát trễ so với lúc nhận sự kiện (ms); thiếu là phát ngay. */
  readonly delayMs?: number;
}

/** Khối từ chừng này quân trở lên nổ to (`khailo.big`) thay cho tiếng xóa thường. */
export const BIG_GROUP = 8;

/** Quân rơi và cột dồn chạy 0,24 s (globals.css, `.kl-cell` transition): tiếng rơi vào giữa chừng, lúc quân sắp chạm đáy. */
export const FALL_DELAY_MS = 150;

/** Tim đổi sau một màn: được cộng thì tiếng tim như gốc, bị trừ thì phát chậm hơn cho trầm. */
const HEART_LOSS_RATE = 0.85;

/** Tốc độ phát tiếng xóa: khối 2 quân là 1, mỗi quân thêm +0,02, trần 1,25 (khối càng to tiếng càng cao). */
export const removeRate = (cells: number): number => Math.min(1.25, 1 + Math.max(0, cells - 2) * 0.02);

/** Cue cho một lô sự kiện. Mỗi id chỉ một lần trong một lô. */
export function cuesForEvents(events: readonly KlEvent[]): CuePlay[] {
  const out: CuePlay[] = [];
  const add = (c: CuePlay) => {
    if (!out.some((o) => o.id === c.id)) out.push(c);
  };
  for (const e of events) {
    const n = e.type === "removed" ? e.cells.length : e.type === "toolUsed" ? e.removed.length : 0;
    if (n > 0) {
      add(n >= BIG_GROUP ? { id: "khailo.big" } : { id: "khailo.remove", rate: removeRate(n) });
      add({ id: "khailo.fall", delayMs: FALL_DELAY_MS });
    }
    if (e.type === "toolCharged") add({ id: "khailo.charged", delayMs: FALL_DELAY_MS * 2 });
    if (e.type === "levelDone" && e.summary.hearts !== 0)
      add({ id: "khailo.heart", ...(e.summary.hearts > 0 ? { rate: HEART_LOSS_RATE } : {}) });
  }
  return out;
}

/** Lệnh bị từ chối: tiếng gõ đục `khailo.reject`; bấm ngoài bàn hoặc lúc ván không chạy thì im. */
export const rejectCue = (reason: KlReason): CueId | null =>
  reason === "notPlaying" || reason === "outOfBounds" ? null : "khailo.reject";
