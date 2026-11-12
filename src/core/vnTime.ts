// Giờ Việt Nam (UTC+7, không đổi giờ mùa hè) cho mọi chế độ: ngày đổi lúc 0 giờ, tuần bắt đầu thứ Hai 0 giờ.
// Khóa ngày/tuần là chuỗi YYYY-MM-DD nên so sánh chuỗi đúng thứ tự thời gian.

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
export const VN_UTC_OFFSET_MS = 7 * HOUR_MS;

/** Khóa ngày dạng YYYY-MM-DD theo giờ Việt Nam. */
export function vnDay(now: number): string {
  return new Date(now + VN_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

/** Khóa tuần: ngày thứ Hai đầu tuần (giờ Việt Nam). */
export function vnWeek(now: number): string {
  const local = now + VN_UTC_OFFSET_MS;
  // getUTCDay: 0 là Chủ nhật; lùi về thứ Hai.
  const back = (new Date(local).getUTCDay() + 6) % 7;
  return new Date(local - back * DAY_MS).toISOString().slice(0, 10);
}

/** Thời điểm (ms UTC) của 0 giờ giờ Việt Nam ngày `key` (YYYY-MM-DD); NaN nếu khóa sai dạng. */
export function vnDayStart(key: string): number {
  return Date.parse(`${key}T00:00:00.000Z`) - VN_UTC_OFFSET_MS;
}
