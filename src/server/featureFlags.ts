import { PACK_2, PACK_3 } from "@/core/tam-tuong-ky/catalog";

export const FEATURE_DISABLED_ERROR = "featureDisabled" as const;

export interface TowerFeatureFlags {
  readonly trial: boolean;
  readonly destiny: boolean;
}

/** Chỉ chuỗi `true` mới bật; thiếu, rỗng hoặc giá trị lạ đều fail-closed. */
export function towerFeatureFlags(env: Readonly<Record<string, string | undefined>> = process.env): TowerFeatureFlags {
  return {
    trial: env.TRIAL_ENABLED === "true",
    destiny: env.DESTINY_ENABLED === "true",
  };
}

export const trialEnabled = (deps: { readonly trialEnabled?: boolean }): boolean =>
  deps.trialEnabled !== false;

export const destinyEnabled = (deps: { readonly destinyEnabled?: boolean }): boolean =>
  deps.destinyEnabled !== false;

/** Trận Đồ xếp hạng và thưởng. Chỉ chuỗi `true` mới bật; thiếu, rỗng hoặc giá trị lạ đều fail-closed (mặc định tắt). */
export function formationRankedEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env.FORMATION_RANKED_ENABLED === "true";
}

/**
 * Cờ Tầm Tướng Ký: `true` không phân biệt hoa thường, bỏ khoảng trắng và xuống dòng ở hai đầu (giá trị dán vào bảng
 * biến môi trường hay CLI hay dính `\n`). Giá trị khác (`1`, `yes`, rỗng) vẫn là tắt.
 */
function ttkFlag(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

/**
 * Tầm Tướng Ký: **một biến duy nhất** `TAM_TUONG_KY_ENABLED` mở chế độ Thường, Hạng tuần và mọi gói đã duyệt
 * (`status: "published"` trong code). Gói mới chỉ ra mắt khi Shan duyệt và code đổi sang `published`, không cần biến riêng.
 */
export function tamTuongKyEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return ttkFlag(env.TAM_TUONG_KY_ENABLED);
}

/** Hạng tuần đi cùng cờ chế độ. */
export function tamTuongKyRankedEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return tamTuongKyEnabled(env);
}

/** Gói 2 (8 sứ quân còn lại + Đinh Bộ Lĩnh): bật cùng chế độ khi gói đã duyệt. */
export function tamTuongKyPack2Enabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return tamTuongKyEnabled(env) && PACK_2.status === "published";
}

/** Gói 3 (56 tướng thường): bật cùng chế độ khi gói đã duyệt; cần Gói 2 (dùng yếu tố của Gói 2). */
export function tamTuongKyPack3Enabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return tamTuongKyPack2Enabled(env) && PACK_3.status === "published";
}

/** Các biến cũ, nay không còn tác dụng (gộp vào `TAM_TUONG_KY_ENABLED`). */
const TTK_OBSOLETE_VARS = ["TAM_TUONG_KY_RANKED_ENABLED", "TAM_TUONG_KY_PACK2_ENABLED", "TAM_TUONG_KY_PACK3_ENABLED"] as const;

/**
 * Trạng thái cờ cho /api/health (không có giá trị bí mật). `invalid`: biến có đặt nhưng giá trị không phải `true`.
 * `obsolete`: biến cũ còn đặt trong môi trường; không ảnh hưởng gì, có thể xóa.
 */
export function tamTuongKyFlagStatus(env: Readonly<Record<string, string | undefined>> = process.env) {
  const set = (v: string | undefined) => v !== undefined && v.trim() !== "";
  const enabled = tamTuongKyEnabled(env);
  return {
    enabled,
    ranked: tamTuongKyRankedEnabled(env),
    pack2: tamTuongKyPack2Enabled(env),
    pack3: tamTuongKyPack3Enabled(env),
    invalid: set(env.TAM_TUONG_KY_ENABLED) && !enabled ? ["TAM_TUONG_KY_ENABLED"] : [],
    obsolete: TTK_OBSOLETE_VARS.filter((k) => set(env[k])),
  };
}

/** Viễn Chinh. Chỉ chuỗi `true` mới bật; mặc định tắt, thẻ Home giữ ở hàng “Đang dựng”. */
export function expeditionFlag(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env.EXPEDITION_ENABLED === "true";
}

export const expeditionEnabled = (deps: { readonly expeditionEnabled?: boolean }): boolean =>
  deps.expeditionEnabled === true;

/** Quần Hùng online (PvP). Chỉ chuỗi `true` mới bật; thiếu, rỗng hoặc giá trị lạ đều fail-closed (mặc định tắt). */
export function pvpEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env.PVP_ENABLED === "true";
}
