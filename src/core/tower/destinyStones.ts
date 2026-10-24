import type { DestinyMilestone } from "./floorContract";

/** Chính sách thưởng đá Destiny V1; đổi version/id nếu cân bằng các mốc đã phát hành. */
export const DESTINY_STONE_POLICY_VERSION = 1;

export const DESTINY_STONE_MILESTONES: readonly DestinyMilestone[] = [
  { id: "floor-3-v1", floor: 3, stones: 3 },
  { id: "floor-5-v1", floor: 5, stones: 5 },
  { id: "floor-10-v1", floor: 10, stones: 10 },
];

/** Thưởng tham gia theo thành tích, cố ý nén chênh lệch và không phụ thuộc hạng BXH. */
export function destinyCycleStoneReward(bestFloor: number): number {
  if (!Number.isInteger(bestFloor) || bestFloor < 1) return 0;
  if (bestFloor < 3) return 1;
  if (bestFloor < 5) return 2;
  if (bestFloor < 10) return 3;
  return 5;
}
