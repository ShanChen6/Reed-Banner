// Âm thanh của Điền Trang Ký, hàm thuần để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.12.

import { OMENS, type DtkEvent } from "@/core/dien-trang-ky";
import type { CueId } from "../audio/cues";

export type DtkCue = Extract<CueId, `dtk.${string}`>;

/**
 * Tiếng cho một sự kiện trong nhật ký, phát đúng lúc màn diễn tới sự kiện đó (usePlayback). `roll` phát khi xúc xắc bắt đầu lăn,
 * `move` phát ở từng ô quân nhảy qua; hai việc đó do usePlayback tự gọi. Rút quẻ chỉ kêu `dtk.omen` khi là quẻ thiên tai (quẻ khác
 * đã có tiếng của việc theo sau: được tiền, mất tiền, bị giam...). Kết ván chưa có tệp riêng nên im.
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
      return "dtk.rent";
    case "pay":
      return "dtk.pay";
    case "gain":
      return "dtk.gain";
    case "sell":
      return "dtk.sell";
    case "jailed":
      return "dtk.jailed";
    case "freed":
      return "dtk.freed";
    case "blessing":
    case "blessUsed":
    case "festival":
      return "dtk.blessing";
    case "omen":
      return OMENS.find((o) => o.id === e.omen)?.effect.k === "disaster" ? "dtk.omen" : null;
    case "disaster":
      return e.how === "quake" ? "dtk.quake" : "dtk.storm";
    case "monopoly":
      return "dtk.monopoly";
    case "out":
      return "dtk.out";
    default:
      return null;
  }
}
