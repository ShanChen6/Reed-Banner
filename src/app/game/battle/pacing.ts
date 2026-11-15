/** Tốc độ hoạt ảnh người chơi chọn: hệ số nhân thời gian mỗi bước hoạt ảnh và nhịp chuyển lượt. Mặc định Vừa. */
export type AnimSpeed = "fast" | "normal" | "slow";
export const ANIM_SPEED_FACTOR: Record<AnimSpeed, number> = { fast: 1, normal: 1.6, slow: 2.3 };
export const ANIM_SPEED_NAME: Record<AnimSpeed, string> = { fast: "Nhanh", normal: "Vừa", slow: "Chậm" };
export const ANIM_SPEED_KEY = "reed-banner:battle:anim-speed:v1";
export const parseAnimSpeed = (v: string | null): AnimSpeed => (v === "fast" || v === "slow" || v === "normal" ? v : "normal");

/** Nhịp chuyển phe chỉ dành cho lớp trình diễn; không tham gia timer hay battle engine. */
export const COMBAT_PACING = {
  turnPauseMs: 300,
  enemyTurnBannerMs: 700,
  playerTurnBannerMs: 600,
} as const;
