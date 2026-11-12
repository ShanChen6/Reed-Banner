import type { DestinyMilestone } from "./floorContract";
import { DESTINY_RULE_DATA_VERSION, type DestinyRulesVersion } from "./destinyRules";

const MILESTONES_V1: readonly DestinyMilestone[] = [
  { id: "floor-3-v1", floor: 3, stones: 3 },
  { id: "floor-5-v1", floor: 5, stones: 5 },
  { id: "floor-10-v1", floor: 10, stones: 10 },
];

/** V2 giữ tổng 18 đá mỗi chu kỳ như V1, chia lại cho 20 tầng. */
const MILESTONES_V2: readonly DestinyMilestone[] = [
  { id: "floor-5-v2", floor: 5, stones: 3 },
  { id: "floor-10-v2", floor: 10, stones: 4 },
  { id: "floor-15-v2", floor: 15, stones: 5 },
  { id: "floor-20-v2", floor: 20, stones: 6 },
];

export const destinyStoneMilestones = (
  version: DestinyRulesVersion = DESTINY_RULE_DATA_VERSION,
): readonly DestinyMilestone[] => version >= 2 ? MILESTONES_V2 : MILESTONES_V1;

/** Thưởng tham gia theo thành tích, cố ý nén chênh lệch và không phụ thuộc hạng BXH. */
export function destinyCycleStoneReward(
  bestFloor: number,
  version: DestinyRulesVersion = DESTINY_RULE_DATA_VERSION,
): number {
  if (!Number.isInteger(bestFloor) || bestFloor < 1) return 0;
  if (version >= 2) return bestFloor < 5 ? 1 : bestFloor < 10 ? 2 : bestFloor < 15 ? 3 : bestFloor < 20 ? 4 : 5;
  if (bestFloor < 3) return 1;
  if (bestFloor < 5) return 2;
  if (bestFloor < 10) return 3;
  return 5;
}
