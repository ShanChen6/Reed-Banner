// Âm thanh của Khai Lộ: ánh xạ thuần từ sự kiện của engine (`KlEvent`) sang cue, để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.8.

import type { KlEvent } from "@/core/khai-lo";
import type { CueId } from "../audio/cues";

export interface CuePlay {
  readonly id: CueId;
  readonly rate?: number;
}

/** Khối từ chừng này quân trở lên nổ to (`khailo.big`) thay cho tiếng xóa thường. */
export const BIG_GROUP = 8;

/** Tốc độ phát tiếng xóa: khối 2 quân là 1, mỗi quân thêm +0,02, trần 1,25 (khối càng to tiếng càng cao). */
export const removeRate = (cells: number): number => Math.min(1.25, 1 + Math.max(0, cells - 2) * 0.02);

/** Cue cho một lô sự kiện: xóa khối hoặc đạo cụ phá quân. Mỗi id chỉ một lần trong một lô. */
export function cuesForEvents(events: readonly KlEvent[]): CuePlay[] {
  const out: CuePlay[] = [];
  const add = (c: CuePlay) => {
    if (!out.some((o) => o.id === c.id)) out.push(c);
  };
  for (const e of events) {
    const n = e.type === "removed" ? e.cells.length : e.type === "toolUsed" ? e.removed.length : 0;
    if (n === 0) continue;
    add(n >= BIG_GROUP ? { id: "khailo.big" } : { id: "khailo.remove", rate: removeRate(n) });
  }
  return out;
}
