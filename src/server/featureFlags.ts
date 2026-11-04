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

/** Tầm Tướng Ký (Design Freeze P-28). Mặc định tắt, thẻ Home giữ “sắp ra mắt”. */
export function tamTuongKyEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return ttkFlag(env.TAM_TUONG_KY_ENABLED);
}

/** Tầm Tướng Ký chế độ Hạng tuần (P-28). Cần cả cờ chế độ; chỉ chuỗi `true` mới bật. */
export function tamTuongKyRankedEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return tamTuongKyEnabled(env) && ttkFlag(env.TAM_TUONG_KY_RANKED_ENABLED);
}

/** Tầm Tướng Ký Gói 2 (8 sứ quân còn lại + Đinh Bộ Lĩnh) gộp vào cùng sổ. Cần cờ chế độ. */
export function tamTuongKyPack2Enabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return tamTuongKyEnabled(env) && ttkFlag(env.TAM_TUONG_KY_PACK2_ENABLED);
}

/**
 * Trạng thái cờ cho /api/health (không có giá trị bí mật). `rankedIgnored`: đã đặt biến Hạng nhưng cờ chế độ chưa bật,
 * nên Hạng vẫn tắt. `invalid`: biến có đặt nhưng giá trị không phải `true`.
 */
export function tamTuongKyFlagStatus(env: Readonly<Record<string, string | undefined>> = process.env) {
  const set = (v: string | undefined) => v !== undefined && v.trim() !== "";
  const enabled = tamTuongKyEnabled(env);
  return {
    enabled,
    ranked: tamTuongKyRankedEnabled(env),
    pack2: tamTuongKyPack2Enabled(env),
    invalid: [
      ...(set(env.TAM_TUONG_KY_ENABLED) && !enabled ? ["TAM_TUONG_KY_ENABLED"] : []),
      ...(set(env.TAM_TUONG_KY_RANKED_ENABLED) && !ttkFlag(env.TAM_TUONG_KY_RANKED_ENABLED) ? ["TAM_TUONG_KY_RANKED_ENABLED"] : []),
      ...(set(env.TAM_TUONG_KY_PACK2_ENABLED) && !ttkFlag(env.TAM_TUONG_KY_PACK2_ENABLED) ? ["TAM_TUONG_KY_PACK2_ENABLED"] : []),
    ],
    rankedIgnored: ttkFlag(env.TAM_TUONG_KY_RANKED_ENABLED) && !enabled,
    pack2Ignored: ttkFlag(env.TAM_TUONG_KY_PACK2_ENABLED) && !enabled,
  };
}
