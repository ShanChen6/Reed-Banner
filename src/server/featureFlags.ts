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
