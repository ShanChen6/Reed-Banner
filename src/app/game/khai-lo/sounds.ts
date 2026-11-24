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

/** Tiếng tim vào sau tiếng hết màn (dọn sạch hoặc qua màn dài 1,5 s) để không chồng. */
export const HEART_DELAY_MS = 1200;

/** Cấp tốc: còn chừng này giây cuối thì mỗi giây một tiếng `khailo.tick`. */
export const TICK_FROM_SECONDS = 5;

/** Tim đổi sau một màn: được cộng thì tiếng tim như gốc, bị trừ thì phát chậm hơn cho trầm. */
const HEART_LOSS_RATE = 0.85;

/** Tốc độ phát tiếng xóa: khối 2 quân là 1, mỗi quân thêm +0,02, trần 1,25 (khối càng to tiếng càng cao). */
export const removeRate = (cells: number): number => Math.min(1.25, 1 + Math.max(0, cells - 2) * 0.02);

/**
 * Cue cho một lô sự kiện. Mỗi id chỉ một lần trong một lô.
 * Hết màn: dọn sạch bàn là `khailo.clear`, còn sót quân là `khailo.leveldone`; hết ván (`over`: thiếu tim, hết giờ, đầu hàng) chỉ phát
 * `khailo.over`, không kèm tiếng hết màn hay tim.
 */
export function cuesForEvents(events: readonly KlEvent[]): CuePlay[] {
  const out: CuePlay[] = [];
  const add = (c: CuePlay) => {
    if (!out.some((o) => o.id === c.id)) out.push(c);
  };
  const over = events.some((e) => e.type === "over");
  for (const e of events) {
    const n = e.type === "removed" ? e.cells.length : e.type === "toolUsed" ? e.removed.length : 0;
    if (n > 0) {
      add(n >= BIG_GROUP ? { id: "khailo.big" } : { id: "khailo.remove", rate: removeRate(n) });
      add({ id: "khailo.fall", delayMs: FALL_DELAY_MS });
    }
    if (e.type === "toolCharged") add({ id: "khailo.charged", delayMs: FALL_DELAY_MS * 2 });
    if (over) continue;
    if (e.type === "levelDone" || e.type === "levelPassed")
      add({ id: (e.type === "levelDone" ? e.summary.cleared : e.cleared) ? "khailo.clear" : "khailo.leveldone" });
    if (e.type === "levelDone" && e.summary.hearts !== 0)
      add({ id: "khailo.heart", delayMs: HEART_DELAY_MS, ...(e.summary.hearts > 0 ? { rate: HEART_LOSS_RATE } : {}) });
  }
  if (over) add({ id: "khailo.over" });
  return out;
}

/** Cấp tốc: đồng hồ vừa qua mốc một giây trong `TICK_FROM_SECONDS` giây cuối (chưa về 0) thì gõ một tiếng. */
export function tickDue(prevMs: number, nextMs: number): boolean {
  const before = Math.ceil(prevMs / 1000);
  const after = Math.ceil(nextMs / 1000);
  return after < before && after > 0 && after <= TICK_FROM_SECONDS;
}

/** Lệnh bị từ chối: tiếng gõ đục `khailo.reject`; bấm ngoài bàn hoặc lúc ván không chạy thì im. */
export const rejectCue = (reason: KlReason): CueId | null =>
  reason === "notPlaying" || reason === "outOfBounds" ? null : "khailo.reject";
