// Mùa theo tuần của Trấn Ải và Quần Hùng (Shan, 01/11/2026): bảng xếp hạng mùa đổi vào thứ Hai 0 giờ giờ Việt Nam, điểm
// mùa bắt đầu lại từ 0; thưởng vàng theo hạng cuối mùa. Bảng "mọi thời đại" cũ vẫn giữ để xem.
//   Trấn Ải:  điểm mùa = số đợt cao nhất đã vượt trong một lượt chơi của tuần.
//   Quần Hùng: điểm mùa = tổng điểm đấu trường đã nhận được từ các trận mình đi đánh trong tuần (không tính phòng thủ);
//              chỉ người có tổng dương mới có tên trên bảng. Điểm Elo gốc không reset.

import { vnWeek } from "./quests";

export type SeasonMode = "survival" | "arena";

export const SEASON_MODES: readonly SeasonMode[] = ["survival", "arena"];

export const isSeasonMode = (v: unknown): v is SeasonMode => typeof v === "string" && (SEASON_MODES as readonly string[]).includes(v);

/** Khóa mùa: ngày thứ Hai đầu tuần (giờ Việt Nam), cùng khóa với Đại trận và chu kỳ Thiên Mệnh. */
export const seasonKey = vnWeek;

/** Khóa mùa hợp lệ: ngày YYYY-MM-DD có thật và là thứ Hai. */
export function isSeasonKey(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const t = Date.parse(`${v}T00:00:00.000Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === v && new Date(t).getUTCDay() === 1;
}
