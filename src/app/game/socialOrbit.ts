// Hình học và lời chú thích của phần quỹ đạo mạng xã hội (OrbitingSocials). Hàm thuần, có test.

import type { SocialPlatform } from "./footerLinks";

export interface OrbitRing {
  /** Bán kính quỹ đạo (px, trong khung 340×340). */
  readonly r: number;
  /** Số giây một vòng. */
  readonly t: number;
  /** Quay ngược chiều kim đồng hồ. */
  readonly reverse: boolean;
  /** Góc xuất phát (độ). */
  readonly a0: number;
  readonly count: number;
}

/**
 * Kích thước khung và tâm quỹ đạo. Mẫu gốc là 340×340 với tâm cách mép trên 212px; chú thích của game dùng chữ 13px (mẫu 11px) nên
 * hạ tâm xuống 236px và cao 380px để biểu tượng ở đỉnh vòng ngoài không chạm chú thích.
 */
export const ORBIT_WIDTH = 340;
export const ORBIT_HEIGHT = 380;
export const ORBIT_CENTER = { x: 170, y: 236 } as const;

/**
 * Chia n biểu tượng vào các vòng. Ít (≤4) thì một vòng; nhiều hơn thì hai vòng, vòng trong lấy nửa dưới, hai vòng quay
 * ngược chiều nhau như mẫu (vòng trong 62px/36s, vòng ngoài 112px/56s).
 */
export function splitRings(n: number): readonly OrbitRing[] {
  if (n <= 0) return [];
  if (n <= 4) return [{ r: 88, t: 44, reverse: false, a0: 20, count: n }];
  const inner = Math.floor(n / 2);
  return [
    { r: 62, t: 36, reverse: false, a0: 20, count: inner },
    { r: 112, t: 56, reverse: true, a0: 0, count: n - inner },
  ];
}

/** Góc (độ) của từng biểu tượng trên một vòng, chia đều từ `a0`. */
export function slotAngles(count: number, a0: number): readonly number[] {
  return Array.from({ length: count }, (_, k) => a0 + (k * 360) / count);
}

/** Đường cong từ tâm biểu tượng (x, y) tới tâm quỹ đạo, cong nhẹ như mẫu. */
export function linkPath(x: number, y: number): string {
  const { x: cx, y: cy } = ORBIT_CENTER;
  const mx = (x + cx) / 2 + (y - cy) * 0.18;
  const my = (y + cy) / 2 - (x - cx) * 0.18;
  return `M${x.toFixed(1)} ${y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${cx} ${cy}`;
}

/** Chú thích khi rê chuột/focus một nền tảng đã có địa chỉ. */
export const SOCIAL_BLURB: Readonly<Record<SocialPlatform, string>> = {
  Facebook: "Nhắn tin trực tiếp với tác giả",
  TikTok: "Xem video của tác giả",
  LinkedIn: "Kết nối nghề nghiệp",
  GitHub: "Xem mã nguồn và dự án",
  Instagram: "Hình ảnh và hậu trường",
  Discord: "Trò chuyện cùng cộng đồng",
  X: "Tin ngắn và cập nhật",
  YouTube: "Xem video dài của tác giả",
  Zalo: "Nhắn tin qua Zalo",
};
