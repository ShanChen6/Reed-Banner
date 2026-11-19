// Âm thanh của Sử Lộ: ánh xạ thuần từ sự kiện của engine (`SlEvent`) sang cue và chọn nhạc theo pha, để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.6. Chưa có tệp riêng nên manifest trỏ cue `sulo.*`
// về tệp sẵn có của Trận Đồ và trận đánh; có tệp riêng thì chỉ sửa manifest.
//
// Trận trùm match-3 dùng tiếng ghép ô của trận đánh (`battle/sounds.ts` → `frameCue`) theo từng khung hoạt ảnh.

import type { SlAction, SlState } from "@/core/su-lo";
import { SULO_CUES, type CueId, type MusicId } from "../audio/cues";

/**
 * Cue cho một nước đi hợp lệ. `before` và `after` là trạng thái trước và sau; sự kiện chỉ tính khi engine ghi sự kiện mới
 * (nước đi trong trận trùm giữ nguyên sự kiện cũ cho tới khi trận ngã ngũ).
 */
export function cuesForAction(before: SlState, after: SlState, action: SlAction): CueId[] {
  const out: CueId[] = [];
  if (action.type === "roll") out.push("sulo.roll");
  if (action.type === "move") out.push("sulo.move");
  const e = after.event;
  if (e === before.event) return out;
  switch (e.kind) {
    case "noMove":
      out.push("sulo.nomove");
      break;
    case "correct":
      out.push("sulo.correct");
      break;
    case "wrong":
      out.push("sulo.wrong");
      break;
    case "trapDisarmed":
      out.push("sulo.disarm");
      break;
    case "trapSprung":
      out.push("sulo.trap");
      break;
    case "luck":
      out.push("sulo.luck");
      break;
    case "gateOpen":
      out.push("sulo.gate");
      break;
    case "stele":
      out.push("sulo.stele");
      break;
    case "aid":
      out.push("sulo.aid");
      break;
    case "bossWon":
      out.push("sulo.bosswon");
      break;
    case "bossLost":
      out.push("sulo.bosslost");
      break;
    case "won":
      out.push("sulo.won");
      break;
    case "start":
      // Vào trận trùm (nhạc cũng đổi, xem `musicFor`) hoặc Quân sư hiến kế giữa trận.
      if (before.phase !== "skirmish" && after.phase === "skirmish") out.push("sulo.boss");
      else if (after.question?.forCounsel) out.push("sulo.counsel");
      break;
    default:
      break;
  }
  return out;
}

/** Nhạc nền: mê cung (cả màn chuẩn bị) hay trận trùm trấn cổng (kể cả lúc trả lời câu Quân sư hiến kế giữa trận). */
export function musicFor(game: SlState | null): MusicId {
  return game?.skirmish ? "sulo_boss" : "sulo_maze";
}

/** Cue cần tải sẵn khi vào Sử Lộ: tiếng mê cung và tiếng ghép ô của trận trùm. */
export const SULO_PRELOAD: readonly CueId[] = [...SULO_CUES, "battle.swap", "battle.invalid", "battle.match3", "battle.match4", "battle.match5"];
