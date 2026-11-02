// Âm thanh của Trận Đồ: ánh xạ thuần từ sự kiện của engine (`PuzzleEvent`) sang cue, để test được mà không cần AudioContext.
// Bảng cue: docs/05-ui-ux/campaign/audio-todo/02-architecture-and-assets.md mục 5.2.

import { neighbors4, typesMatchBoth, type PuzzleEvent, type PuzzleState } from "@/core/binh-phap";
import type { CueId, MusicId } from "../audio/cues";

export interface CuePlay {
  readonly id: CueId;
  readonly rate?: number;
}

/** Lệnh bị từ chối (đặt sai chỗ, sai nghề/hệ, ô bị chiếm hay chướng ngại). */
export const REJECT: CuePlay = { id: "formation.reject" };

/**
 * Đặt quân khớp cả nghề lẫn hệ với một quân kề (được điểm cộng): thêm một tiếng ngân ấm sau tiếng đặt.
 * `state` là trạng thái trước nước đi.
 */
export function isPerfectPlacement(state: PuzzleState, row: number, col: number): boolean {
  const piece = state.hand;
  if (piece.kind !== "normal") return false;
  return neighbors4(state.width, state.height, row, col).some((i) => {
    const n = state.cells[i]?.piece;
    return n?.kind === "normal" && typesMatchBoth(piece, n);
  });
}

/**
 * Cue cho một nước đi, theo thứ tự nghe tự nhiên: đặt quân, ô che tan, dọn đường, lửa, kết thúc.
 * `prevHeat` là mức lửa trước nước đi: lửa tăng thì bùng theo bậc mới, lửa giảm (đặt thành công hoặc dọn đường) thì tiếng lụi.
 * Mỗi loại sự kiện chỉ ra một cue dù có nhiều ô (nhiều ô khai thông cùng lúc là một tiếng tan sương); nhiều đường dọn cùng lúc
 * là một tiếng quét cao hơn chứ không phải nhiều tiếng chồng nhau.
 */
export function cuesForEvents(events: readonly PuzzleEvent[], prevHeat = 0): CuePlay[] {
  const out: CuePlay[] = [];
  const add = (c: CuePlay) => {
    if (!out.some((o) => o.id === c.id)) out.push(c);
  };
  let lines = 0;
  let heat: number | null = null;
  for (const e of events) {
    switch (e.type) {
      case "placed":
        add({ id: e.piece.kind === "wild" ? "formation.wild" : e.piece.kind === "fusion" ? "formation.fusion" : "formation.place" });
        break;
      case "erased":
        add({ id: "formation.eraser" });
        break;
      case "covered":
        add({ id: "formation.fogclear" });
        break;
      case "lineCleared":
        lines += 1;
        break;
      case "discarded":
        add({ id: "formation.discard" });
        break;
      case "heat":
        heat = e.heat;
        break;
      case "won":
        add({ id: "formation.win" });
        break;
      case "lost":
        add({ id: "formation.lose" });
        break;
      default:
        break;
    }
  }
  if (lines > 0) out.push({ id: "formation.line", rate: 1 + 0.07 * Math.min(4, lines - 1) });
  if (heat !== null && heat > prevHeat) out.push({ id: flameCue(heat) });
  else if (heat !== null && heat < prevHeat) out.push({ id: "formation.flamedown" });
  return out;
}

export function flameCue(heat: number): CueId {
  return heat >= 3 ? "formation.flame3" : heat === 2 ? "formation.flame2" : "formation.flame1";
}

/** Lớp căng thẳng của nhạc theo thanh Bỏ Lệnh: 0 → 0, tối đa → 1. */
export function tensionLayer(heat: number, maxHeat: number): number {
  if (maxHeat <= 0) return 0;
  return Math.min(1, Math.max(0, heat / maxHeat));
}

/** Nhạc nền theo màn: chọn bậc, đang chơi, kết quả. */
export function musicFor(state: PuzzleState | null): MusicId {
  if (!state) return "formation_menu";
  if (state.phase === "won") return "formation_result_win";
  if (state.phase === "lost") return "formation_result_lose";
  return "formation_play";
}

/** Cue cần tải sẵn khi vào Trận Đồ. */
export const FORMATION_PRELOAD: readonly CueId[] = [
  "formation.place",
  "formation.match",
  "formation.reject",
  "formation.fogclear",
  "formation.line",
  "formation.discard",
  "formation.flame1",
  "formation.flame2",
  "formation.flame3",
  "formation.flamedown",
  "formation.wild",
  "formation.rank",
  "formation.tick",
  "formation.eraser",
  "formation.fusion",
  "formation.win",
  "formation.lose",
];
