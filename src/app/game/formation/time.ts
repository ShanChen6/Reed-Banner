// Đếm ngược kỳ xếp hạng.

/** "5 giờ 12 phút", "2 ngày 3 giờ", "dưới 1 phút". Không âm: hết giờ thì nói đang đổi kỳ. */
export function formatRemaining(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "đang đổi kỳ";
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "dưới 1 phút";
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ ${min % 60} phút`;
  const d = Math.floor(h / 24);
  return `${d} ngày ${h % 24} giờ`;
}
