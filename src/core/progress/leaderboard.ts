// Bảng xếp hạng (lộ trình 4.6): điểm của từng bảng tính thẳng từ hồ sơ, server ghi lại sau mỗi lần cộng thưởng.
// Điểm cao hơn đứng trên; bằng điểm thì ai đạt trước đứng trên. Xem docs/design/09-che-do-choi.md mục 2.3.

import {
  isCampaignMissionId,
  isCombatStoryNode,
  storyNodeById,
  type CampaignMissionId,
} from "../campaign/storyNodes";
import type { Profile } from "./profile";

/**
 * Bảng: chiến dịch (số nhiệm vụ V2 đã hoàn thành, rồi tổng lượt của các nhiệm vụ có trận), từng nhiệm vụ có trận
 * (ít lượt nhất), sinh tồn, đấu trường (điểm đấu trường; server ghi từ kho đấu trường, không tính từ hồ sơ).
 * Bảng `stage:<id>` của chiến dịch 13 màn cũ không còn được ghi hay đọc (CAMP-08.04); dòng cũ trong kho để nguyên.
 */
export type BoardId =
  | "campaign"
  | "survival"
  | "arena"
  | `mission:${CampaignMissionId}`;

/** Nhiệm vụ có trận đã hoàn thành mà chưa có số lượt ghi nhận tính như chừng này lượt, tới khi thắng lại. */
export const UNKNOWN_STAGE_TURNS = 200;
/** Mỗi nhiệm vụ đã hoàn thành đáng giá hơn mọi chênh lệch tổng lượt. */
const STAGE_WEIGHT = 100_000;

const combatMission = (id: string) => {
  const node = storyNodeById(id);
  return !!node && isCombatStoryNode(node);
};

export interface BoardScore {
  readonly board: BoardId;
  readonly score: number;
}

/**
 * Tổng lượt ít nhất của các nhiệm vụ có trận đã hoàn thành. Sự kiện, chuẩn bị và ngoại giao không có lượt nên
 * không cộng gì: hoàn thành cốt truyện chỉ tính ở số nhiệm vụ, không bị coi là một trận.
 */
export function campaignTurns(p: Profile): number {
  return p.campaign.completed
    .filter(combatMission)
    .reduce(
      (a, id) => a + (p.campaign.bestBattleTurns[id] ?? UNKNOWN_STAGE_TURNS),
      0,
    );
}

/** Điểm của hồ sơ trên mọi bảng có tham gia. */
export function boardScores(p: Profile): BoardScore[] {
  const out: BoardScore[] = [];
  const n = p.campaign.completed.length;
  if (n > 0)
    out.push({
      board: "campaign",
      score: n * STAGE_WEIGHT - Math.min(STAGE_WEIGHT - 1, campaignTurns(p)),
    });
  for (const [id, turns] of Object.entries(p.campaign.bestBattleTurns))
    if (isCampaignMissionId(id) && combatMission(id) && turns)
      out.push({ board: `mission:${id}`, score: -turns });
  if (p.survival.best > 0)
    out.push({ board: "survival", score: p.survival.best });
  return out;
}

/** Đọc lại điểm thành số người chơi hiểu được. */
export function describeScore(
  board: BoardId,
  score: number,
): { main: number; turns?: number } {
  if (board === "campaign") {
    const stages = Math.ceil(score / STAGE_WEIGHT);
    return { main: stages, turns: stages * STAGE_WEIGHT - score };
  }
  if (board.startsWith("mission:")) return { main: -score };
  return { main: score };
}

export function isBoardId(x: unknown): x is BoardId {
  return (
    x === "campaign" ||
    x === "survival" ||
    x === "arena" ||
    (typeof x === "string" &&
      x.startsWith("mission:") &&
      combatMission(x.slice("mission:".length)))
  );
}
