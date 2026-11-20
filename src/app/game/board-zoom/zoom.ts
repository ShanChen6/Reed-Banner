// Mức thu phóng riêng của bàn cờ (khác thu phóng cả trang của trình duyệt): hệ số nhân kích thước ô, 60–160 %,
// mỗi nấc 10 %. Mỗi loại bàn nhớ mức riêng trên trình duyệt vì cỡ ô gốc của chúng khác nhau.

export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 1.6;
export const ZOOM_STEP = 0.1;
export const ZOOM_DEFAULT = 1;

/** Các bàn có thu phóng: trận match-3 (mọi chế độ đánh), Khai Lộ, Sử Lộ, Do Thám. */
export type BoardZoomId = "battle" | "khai-lo" | "su-lo" | "do-tham";

export const zoomStorageKey = (id: BoardZoomId) => `colau.boardZoom.${id}.v1`;

/** Kẹp vào [ZOOM_MIN, ZOOM_MAX] và làm tròn về nấc 10 % gần nhất; giá trị hỏng về mặc định. */
export function clampZoom(z: number): number {
  if (!Number.isFinite(z)) return ZOOM_DEFAULT;
  const stepped = Math.round(z / ZOOM_STEP) * ZOOM_STEP;
  return Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, stepped)) * 100) / 100;
}

/** Lên (+1) hoặc xuống (−1) một nấc. */
export const stepZoom = (z: number, dir: 1 | -1) => clampZoom(z + dir * ZOOM_STEP);

/** Đọc giá trị đã lưu; không có hoặc hỏng thì về mặc định. */
export function parseZoom(raw: string | null): number {
  if (raw === null || raw.trim() === "") return ZOOM_DEFAULT;
  return clampZoom(Number(raw));
}

/** Nhãn phần trăm, ví dụ 1.2 → "120%". */
export const zoomLabel = (z: number) => `${Math.round(z * 100)}%`;
