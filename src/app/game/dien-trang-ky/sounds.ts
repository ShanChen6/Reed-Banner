// Âm thanh của Điền Trang Ký, hàm thuần để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.12.

import type { DtkEvent } from "@/core/dien-trang-ky";
import type { CueId } from "../audio/cues";

export type DtkCue = Extract<CueId, `dtk.${string}`>;

/**
 * Tiếng cho một sự kiện trong nhật ký, phát đúng lúc màn diễn tới sự kiện đó (usePlayback). `roll` phát khi xúc xắc bắt đầu lăn,
 * `move` phát ở từng ô quân nhảy qua; hai việc đó do usePlayback tự gọi. Việc chưa có tệp riêng (giam, thiên tai, kết ván...) im.
 */
export function eventCue(e: DtkEvent): DtkCue | null {
  switch (e.k) {
    case "roll":
      return "dtk.roll";
    case "move":
      return "dtk.move";
    case "salary":
      return "dtk.salary";
    case "buy":
    case "buyout":
      return "dtk.buy";
    case "build":
    case "freeBuild":
      return "dtk.build";
    case "rent":
    case "pay":
      return "dtk.rent";
    case "gain":
      return "dtk.gain";
    default:
      return null;
  }
}
