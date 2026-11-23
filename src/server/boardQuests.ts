// Nhiệm vụ ngày "Đánh xong một ván Tam Quân Kỳ hoặc Vây Thành Kỳ" (d.board, Shan chọn 23/11/2026). Chỉ ván do server làm
// trọng tài mới tính (đấu sứ quân có thưởng, đấu người bằng mã phòng); ván ở trình duyệt không kiểm được nên không tính.

import { BOARD_GAME_MIN_MOVES, recordBoardGame } from "@/core";
import { updateProfile, type ProfileStore } from "./profiles";

/** Ván đủ dài để tính nhiệm vụ: mỗi bên đi ít nhất BOARD_GAME_MIN_MOVES nước (đầu hàng ngay từ đầu không tính). */
export const boardGameCounts = (totalMoves: number): boolean => Math.floor(totalMoves / 2) >= BOARD_GAME_MIN_MOVES;

/** Cộng nhiệm vụ đánh cờ cho từng người chơi thật của ván vừa xong. Lỗi ghi hồ sơ không làm hỏng nước đi. */
export async function creditBoardGame(profiles: ProfileStore, players: readonly (string | null)[], totalMoves: number, now: number): Promise<void> {
  if (!boardGameCounts(totalMoves)) return;
  for (const id of new Set(players.filter((p): p is string => !!p)))
    await updateProfile(profiles, id, (p) => ({ ok: true, profile: { ...p, quests: recordBoardGame(p.quests, now) } }), now).catch(() => undefined);
}
