// Âm thanh của Do Thám: so trạng thái trước và sau một nước đi (engine không phát sự kiện) rồi chọn cue, để test không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.7. Chưa có tệp riêng nên manifest trỏ cue `dotham.*`
// về tệp sẵn có; đạo cụ nguyên tố dùng luôn tiếng kỹ năng theo hệ của trận đánh (`battle.skill.<hệ>`).

import { openedOf, type DtAction, type DtState } from "@/core/do-tham";
import { DOTHAM_CUES, type CueId, type MusicId } from "../audio/cues";

export interface CuePlay {
  readonly id: CueId;
  readonly rate?: number;
}

/** Mở từ ngần này ô trở lên trong một nước là "lan ra" (gặp ô số 0). */
export const CASCADE_MIN = 4;

/** Lệnh bị từ chối (mở nhanh sai số cờ, đạo cụ chưa dùng được...). */
export const REJECT: CuePlay = { id: "dotham.reject" };

/**
 * Cue cho một nước đi hợp lệ, theo thứ tự nghe tự nhiên: đạo cụ, mở hoặc cắm cờ, khiên đỡ, rồi kết thúc ván.
 * Thua là tiếng sập bẫy rồi tiếng thua; thắng chỉ có tiếng thắng (tiếng mở ô cuối bị nuốt).
 */
export function cuesForAction(before: DtState, after: DtState, action: DtAction): CuePlay[] {
  const out: CuePlay[] = [];
  if (action.type === "item") out.push({ id: `battle.skill.${action.element}` });
  if (after.phase === "lost" && before.phase !== "lost") return [...out, { id: "dotham.trap" }, { id: "dotham.lose" }];
  if (after.phase === "won" && before.phase !== "won") return [...out, { id: "dotham.win" }];
  if (before.shield === "active" && after.shield === "spent") out.push({ id: "dotham.shield" });
  const opened = openedOf(after) - openedOf(before);
  if (opened >= CASCADE_MIN) out.push({ id: "dotham.cascade" });
  else if (opened > 0 && action.type !== "item") out.push({ id: "dotham.open" });
  if (action.type === "flag") {
    // Gỡ cờ: cùng tiếng, trầm hơn.
    const placed = after.cells[action.index] === "flag";
    out.push(placed ? { id: "dotham.flag" } : { id: "dotham.flag", rate: 0.85 });
  }
  return out;
}

/** Nhạc nền của màn: một bài, cả lúc chuẩn bị lẫn lúc dò. */
export const DOTHAM_MUSIC: MusicId = "dotham";

/** Cue cần tải sẵn khi vào Do Thám. */
export const DOTHAM_PRELOAD: readonly CueId[] = [
  ...DOTHAM_CUES,
  "battle.skill.kim",
  "battle.skill.moc",
  "battle.skill.thuy",
  "battle.skill.hoa",
  "battle.skill.tho",
  "battle.skill.loi",
  "battle.skill.phong",
];
