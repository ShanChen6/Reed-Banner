// Bảng xếp hạng (lộ trình 4.6): điểm của từng bảng tính thẳng từ hồ sơ, server ghi lại sau mỗi lần cộng thưởng.
// Điểm cao hơn đứng trên; bằng điểm thì ai đạt trước đứng trên. Xem docs/design/09-che-do-choi.md mục 2.3.

import type { Profile } from "./profile";

/** Bảng: chiến dịch (số màn rồi tổng lượt), từng màn (ít lượt nhất), tháp, sinh tồn. */
export type BoardId = "campaign" | "tower" | "survival" | `stage:${string}`;

/** Màn đã qua từ trước khi có bảng xếp hạng (chưa ghi số lượt) tính như chừng này lượt, tới khi thắng lại. */
export const UNKNOWN_STAGE_TURNS = 200;
/** Mỗi màn đã qua đáng giá hơn mọi chênh lệch tổng lượt. */
const STAGE_WEIGHT = 100_000;

export interface BoardScore {
  readonly board: BoardId;
  readonly score: number;
}

/** Tổng lượt ít nhất của các màn đã qua. */
export function campaignTurns(p: Profile): number {
  return p.campaign.cleared.reduce(
    (a, id) => a + (p.campaign.bestTurns[id] ?? UNKNOWN_STAGE_TURNS),
    0,
  );
}

/** Điểm của hồ sơ trên mọi bảng có tham gia. */
export function boardScores(p: Profile): BoardScore[] {
  const out: BoardScore[] = [];
  const n = p.campaign.cleared.length;
  if (n > 0)
    out.push({
      board: "campaign",
      score: n * STAGE_WEIGHT - Math.min(STAGE_WEIGHT - 1, campaignTurns(p)),
    });
  for (const [id, turns] of Object.entries(p.campaign.bestTurns))
    out.push({ board: `stage:${id}`, score: -turns });
  if (p.tower.best > 0) out.push({ board: "tower", score: p.tower.best });
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
  if (board.startsWith("stage:")) return { main: -score };
  return { main: score };
}

export function isBoardId(x: unknown): x is BoardId {
  return (
    x === "campaign" ||
    x === "tower" ||
    x === "survival" ||
    (typeof x === "string" && /^stage:[A-Za-z0-9]{1,40}$/.test(x))
  );
}
