// Tiến độ chiến dịch lưu trong hồ sơ: màn đã qua và lương mang sang trận sau. Dữ liệu màn ở src/core/campaign.
// Xem docs/design/09-che-do-choi.md mục 2.

/** Lương vào trận chiến dịch luôn trong khoảng này (không bao giờ vào trận khi hết lương). */
export const CAMPAIGN_FOOD_MIN = 20;
export const CAMPAIGN_FOOD_MAX = 100;
export const CAMPAIGN_FOOD_START = 60;
/** Doanh trại: vàng cho mỗi điểm lương. Điểm xuất phát. */
export const FOOD_PRICE = 3;

export interface CampaignState {
  /** Id các màn đã qua, theo thứ tự qua màn. */
  readonly cleared: readonly string[];
  /** Lương mang vào trận chiến dịch kế tiếp. */
  readonly food: number;
}

export const NEW_CAMPAIGN: CampaignState = {
  cleared: [],
  food: CAMPAIGN_FOOD_START,
};

export const clampCampaignFood = (food: number) =>
  Math.max(CAMPAIGN_FOOD_MIN, Math.min(CAMPAIGN_FOOD_MAX, Math.round(food)));

export function parseCampaign(raw: unknown): CampaignState {
  const c = raw as Partial<CampaignState> | null;
  if (!c || typeof c !== "object") return NEW_CAMPAIGN;
  const cleared = Array.isArray(c.cleared)
    ? [...new Set(c.cleared.filter((x): x is string => typeof x === "string"))]
    : [];
  const food =
    typeof c.food === "number" && Number.isFinite(c.food)
      ? clampCampaignFood(c.food)
      : CAMPAIGN_FOOD_START;
  return { cleared, food };
}
