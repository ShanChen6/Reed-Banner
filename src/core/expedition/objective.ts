// Viễn Chinh: mục tiêu riêng của trận (giữ cầu, hộ tống, phá cổng). Trận chạm mục tiêu thì phe người chơi thắng luôn
// dù đối thủ còn người. Tách riêng, chỉ phụ thuộc engine trận, để lớp Match và mô phỏng dùng chung không import vòng.
// Luật: docs/02-game-modes/expedition/03-cua-bien-thiet-ke.md mục 5.

import { isAlive, type BattleState } from "../battle";

export type ExpeditionObjective =
  /** Giữ cầu (hay giữ Chợ khi bị phản công): còn người đứng sau `turns` lượt của người chơi. */
  | { readonly type: "hold"; readonly turns: number }
  /** Hộ tống đoàn dân trước truy binh: như giữ cầu, khác tên. */
  | { readonly type: "escort"; readonly turns: number }
  /** Phá cổng: công trình ở vị trí `fighter` của phe địch sụp. */
  | { readonly type: "gate"; readonly fighter: number };

/**
 * Số lượt người chơi đã đánh xong. `turn.number` đếm lượt từng phe từ 1 và người chơi luôn đi trước, nên cứ hai lượt
 * phe là một lượt của người chơi (cùng cách đếm với Bình Loạn V2).
 */
export function expeditionPlayerTurns(battle: Pick<BattleState, "turn">): number {
  return Math.max(0, Math.floor((battle.turn.number - 1) / 2));
}

/** Trận chưa có người thắng nhưng phe người chơi (0) đã đạt mục tiêu. */
export function expeditionObjectiveMet(objective: ExpeditionObjective | undefined, battle: BattleState): boolean {
  if (!objective || battle.winner !== null) return false;
  if (objective.type === "gate") {
    const gate = battle.sides[1].fighters[objective.fighter];
    return !!gate && !isAlive(gate);
  }
  return expeditionPlayerTurns(battle) >= objective.turns && battle.sides[0].fighters.some(isAlive);
}
