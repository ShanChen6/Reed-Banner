// Mô phỏng sinh tồn: AI Thường đánh thay người chơi qua các đợt trên cùng một trận, tự quyết hồi sinh bằng lương.
// Dùng để cân đường cong sức mạnh của đợt, xem docs/design/09-che-do-choi.md mục 4.

import { playAiTurn } from "../ai";
import { beginWave, createBattle, FOOD_MAX } from "../battle";
import {
  autoReviveFighterId,
  downedFightersAfterWave,
  newSurvivalRun,
  planBreak,
  SURVIVAL_FOOD,
  SURVIVAL_REVIVE_FOOD,
  survivalActiveSideConfig,
  survivalWave,
  type SurvivalRun,
} from "../survival";
import type { BattleState } from "../battle";
import { DEFAULT_MAX_TURNS } from "./sim";
import { simProfile } from "./tower";

/** Lương còn lại sau khi trả phí hồi sinh phải từ mức này, để không đói ngay đợt sau. */
const SIM_REVIVE_FOOD_LEFT = 30;

/** Cách AI quyết hồi sinh: có người gục và còn đủ lương thì trả, người gục sớm nhất trước. */
export function pickRevive(
  run: SurvivalRun,
  battle: BattleState,
): string | undefined {
  const food = Math.min(FOOD_MAX, battle.sides[0].food + SURVIVAL_FOOD);
  if (food - SURVIVAL_REVIVE_FOOD < SIM_REVIVE_FOOD_LEFT) return undefined;
  const downed = downedFightersAfterWave(run, battle);
  // Đã có người tự đứng dậy lần nghỉ này thì không trả lương.
  if (autoReviveFighterId(run.wave, downed) !== null) return undefined;
  return downed[0]?.id;
}

export interface SurvivalSimResult {
  /** Số đợt đã vượt qua trước khi gục hết (hoặc chạm `maxWaves`). */
  readonly cleared: number;
  /** Tổng số lượt (hai phe cộng lại) của từng đợt đã đánh. */
  readonly turns: readonly number[];
}

/** Một lượt chơi từ đợt 1 tới khi phe người chơi gục hết. */
export function simulateSurvival(
  level: number,
  seed: number,
  maxWaves = 60,
): SurvivalSimResult {
  const profile = simProfile(level);
  let run = newSurvivalRun(profile, seed);
  const first = survivalWave(run, 1);
  const activeSide = survivalActiveSideConfig(run.roster);
  if (!activeSide.ok) throw new Error(activeSide.error);
  let difficulty = first.difficulty;
  let { state } = createBattle({
    sides: [
      activeSide.value,
      { fighters: first.foes, leader: 0 },
    ],
    seed,
    timer: false,
    firstSide: 0,
  });
  const turns: number[] = [];
  for (;;) {
    while (state.winner === null && state.turn.number <= DEFAULT_MAX_TURNS) {
      const side = state.turn.side;
      state = playAiTurn(state, side === 0 ? "normal" : difficulty).state;
    }
    turns.push(state.turn.number);
    if (state.winner !== 0 || run.wave >= maxWaves)
      return {
        cleared: state.winner === 0 ? run.wave : run.wave - 1,
        turns,
      };
    const plan = planBreak(run, state, pickRevive(run, state));
    if (!plan.ok) throw new Error(plan.error);
    run = plan.run;
    difficulty = plan.wave.difficulty;
    state = beginWave(plan.battle, plan.config).state;
  }
}
