// Mô phỏng cân bằng: cho AI đấu AI nhiều trận và tổng hợp số liệu.
// Thuần, tất định theo seed; script trong scripts/ chỉ gọi vào đây và in kết quả.

import { playAiTurn, type Difficulty } from "../ai";
import {
  createBattle,
  type BattleEvent,
  type SideConfig,
  type SideIndex,
} from "../battle";
import type { SpawnWeights } from "../board";

export interface Matchup {
  readonly sides: readonly [SideConfig, SideConfig];
  readonly seed: number;
  readonly firstSide: SideIndex;
  /** Tỉ lệ ô riêng (luật màn chiến dịch); bỏ trống là tỉ lệ chuẩn. */
  readonly weights?: SpawnWeights;
}

export interface BattleResult {
  /** null khi chạm giới hạn lượt (hòa). */
  readonly winner: SideIndex | null;
  readonly firstSide: SideIndex;
  /** Tổng số lượt của cả trận, hai phe cộng lại. */
  readonly turns: number;
  /** Id nhân vật của mỗi phe. */
  readonly fighters: readonly [readonly string[], readonly string[]];
  /** Tỉ lệ máu còn lại của phe thắng (0–1). */
  readonly winnerHpRatio: number | null;
  readonly skillUses: Readonly<Record<string, number>>;
  readonly passives: number;
  /** Tỉ lệ máu cuối trận của phe 0 theo vị trí và lương còn lại (leo tháp mang sang tầng sau). */
  readonly side0Hp: readonly number[];
  readonly side0Food: number;
}

export interface SimOptions {
  readonly difficulty?: readonly [Difficulty, Difficulty];
  /** Giới hạn tổng số lượt; quá thì tính hòa. */
  readonly maxTurns?: number;
}

export const DEFAULT_MAX_TURNS = 400;

export function runBattle(m: Matchup, options: SimOptions = {}): BattleResult {
  const difficulty = options.difficulty ?? ["normal", "normal"];
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  let { state } = createBattle({
    sides: [m.sides[0], m.sides[1]],
    seed: m.seed,
    timer: false,
    firstSide: m.firstSide,
    ...(m.weights ? { weights: m.weights } : {}),
  });
  const skillUses: Record<string, number> = {};
  let passives = 0;
  const count = (events: readonly BattleEvent[]) => {
    for (const e of events) {
      if (e.type === "skill")
        skillUses[e.skill] = (skillUses[e.skill] ?? 0) + 1;
      else if (e.type === "passive") passives++;
    }
  };
  while (state.winner === null && state.turn.number <= maxTurns) {
    const r = playAiTurn(state, difficulty[state.turn.side]);
    count(r.events);
    state = r.state;
  }
  const winner = state.winner;
  let winnerHpRatio: number | null = null;
  if (winner !== null) {
    const fs = state.sides[winner].fighters;
    winnerHpRatio =
      fs.reduce((a, f) => a + f.hp, 0) / fs.reduce((a, f) => a + f.maxHp, 0);
  }
  return {
    winner,
    firstSide: m.firstSide,
    turns: Math.min(state.turn.number, maxTurns),
    fighters: [
      m.sides[0].fighters.map((f) => f.id),
      m.sides[1].fighters.map((f) => f.id),
    ],
    winnerHpRatio,
    skillUses,
    passives,
    side0Hp: state.sides[0].fighters.map((f) => f.hp / f.maxHp),
    side0Food: state.sides[0].food,
  };
}

/** Thời gian ước tính cho một lượt (giây), dùng để quy số lượt ra phút. Điểm xuất phát. */
export const SECONDS_PER_TURN = 15;

export interface FighterStat {
  readonly id: string;
  readonly battles: number;
  readonly wins: number;
  readonly winRate: number;
}

export interface Summary {
  readonly battles: number;
  readonly draws: number;
  readonly side0WinRate: number;
  readonly firstSideWinRate: number;
  readonly turnsPerSide: {
    readonly mean: number;
    readonly p10: number;
    readonly median: number;
    readonly p90: number;
  };
  /** Phút ước tính theo SECONDS_PER_TURN. */
  readonly minutes: {
    readonly mean: number;
    readonly p10: number;
    readonly p90: number;
  };
  readonly winnerHpRatio: number;
  readonly passivesPerBattle: number;
  readonly fighters: readonly FighterStat[];
  /** Số lần dùng mỗi kỹ năng trên mỗi trận. */
  readonly skillsPerBattle: Readonly<Record<string, number>>;
}

function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!;
}

const mean = (xs: readonly number[]) =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;

export function summarize(results: readonly BattleResult[]): Summary {
  const n = results.length;
  const decided = results.filter((r) => r.winner !== null);
  const perSide = results.map((r) => r.turns / 2).sort((a, b) => a - b);
  const toMin = (t: number) => (t * 2 * SECONDS_PER_TURN) / 60;
  const fighters = new Map<string, { battles: number; wins: number }>();
  const skills: Record<string, number> = {};
  for (const r of results) {
    r.fighters.forEach((ids, side) => {
      for (const id of new Set(ids)) {
        const s = fighters.get(id) ?? { battles: 0, wins: 0 };
        s.battles++;
        if (r.winner === side) s.wins++;
        fighters.set(id, s);
      }
    });
    for (const [id, c] of Object.entries(r.skillUses))
      skills[id] = (skills[id] ?? 0) + c;
  }
  return {
    battles: n,
    draws: n - decided.length,
    side0WinRate:
      decided.length === 0
        ? 0
        : decided.filter((r) => r.winner === 0).length / decided.length,
    firstSideWinRate:
      decided.length === 0
        ? 0
        : decided.filter((r) => r.winner === r.firstSide).length /
          decided.length,
    turnsPerSide: {
      mean: mean(perSide),
      p10: quantile(perSide, 0.1),
      median: quantile(perSide, 0.5),
      p90: quantile(perSide, 0.9),
    },
    minutes: {
      mean: toMin(mean(perSide)),
      p10: toMin(quantile(perSide, 0.1)),
      p90: toMin(quantile(perSide, 0.9)),
    },
    winnerHpRatio: mean(decided.map((r) => r.winnerHpRatio ?? 0)),
    passivesPerBattle:
      n === 0 ? 0 : results.reduce((a, r) => a + r.passives, 0) / n,
    fighters: [...fighters.entries()]
      .map(([id, s]) => ({
        id,
        ...s,
        winRate: s.battles === 0 ? 0 : s.wins / s.battles,
      }))
      .sort((a, b) => b.winRate - a.winRate),
    skillsPerBattle: Object.fromEntries(
      Object.entries(skills)
        .sort((a, b) => b[1] - a[1])
        .map(([id, c]) => [id, n === 0 ? 0 : c / n]),
    ),
  };
}
