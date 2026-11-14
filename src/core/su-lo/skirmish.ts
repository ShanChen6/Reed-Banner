// Ô giao tranh Sử Lộ: match-3 một chiều, người chơi đổi ô để hạ Thành lực của boss, boss không đánh lại.
// Luật ở docs/02-game-modes/su-lo/gdd.md mục 5. Dùng lõi bàn cờ (src/core/board), không dùng battle.
// Mọi người chơi như nhau: không lấy cấp, chỉ số hay kỹ năng từ hồ sơ (Shan chốt 14/11/2026).

import { createRng } from "../rng";
import {
  BOARD_COLS,
  destroyCells,
  findValidMoves,
  generateBoard,
  STANDARD_WEIGHTS,
  swap,
  type Board,
  type Harvest,
  type MoveResult,
  type Pos,
} from "../board";

/** Sát thương mỗi ô bị phá: kiếm đánh mạnh, mọi ô khác góp một ít. Điểm xuất phát, cân bằng bằng test mô phỏng. */
export const SK_DAMAGE = { kiem: 12, other: 3 } as const;
export const SK_MORALE_NEED = 10;
export const SK_MORALE_MULT = 1.5;
export const SK_COUNSEL_NEED = 9;
export const SK_COUNSEL_RATIO = 0.15;
export const SK_ENERGY_PER_TILE = 10;
export const SK_ENERGY_MAX = 100;
export const SK_FOOD_MOVES_MAX = 3;

export type SkPhase = "play" | "won" | "lost";

export interface SkState {
  readonly board: Board;
  readonly maxHp: number;
  readonly hp: number;
  readonly movesLeft: number;
  /** Sĩ khí (trống, tim); đủ SK_MORALE_NEED thì nước kế ×1.5. */
  readonly morale: number;
  readonly moraleArmed: boolean;
  /** Mưu (sách); đủ SK_COUNSEL_NEED thì mở câu Quân sư hiến kế. */
  readonly counsel: number;
  readonly counselPending: boolean;
  /** Năng lượng Kế sách (âm dương). */
  readonly energy: number;
  readonly foodMoves: number;
  readonly gold: number;
  readonly phase: SkPhase;
  readonly rng: number;
  /** Sát thương nước vừa rồi, để hiện số bay. */
  readonly lastDamage: number;
}

export function newSkirmish(seed: number, maxHp: number, hp: number, moves: number): SkState {
  const rng = createRng(seed);
  const board = generateBoard(rng, STANDARD_WEIGHTS);
  return {
    board,
    maxHp,
    hp: Math.max(1, Math.min(maxHp, hp)),
    movesLeft: moves,
    morale: 0,
    moraleArmed: false,
    counsel: 0,
    counselPending: false,
    energy: 0,
    foodMoves: 0,
    gold: 0,
    phase: "play",
    rng: rng.state(),
    lastDamage: 0,
  };
}

export function harvestDamage(h: Harvest): number {
  let total = 0;
  for (const [kind, count] of Object.entries(h)) total += count * (kind === "kiem" ? SK_DAMAGE.kiem : SK_DAMAGE.other);
  return total;
}

/** Pha của boss theo Thành lực còn lại: 0 (100–67%), 1 (67–34%), 2 (dưới 34%). */
export function skPhaseIndex(s: Pick<SkState, "hp" | "maxHp">): 0 | 1 | 2 {
  const r = s.hp / s.maxHp;
  return r > 2 / 3 ? 0 : r > 1 / 3 ? 1 : 2;
}

function applyResult(s: SkState, r: MoveResult, rngState: number, consumeMove: boolean): SkState {
  const h = r.harvest;
  let dmg = harvestDamage(h);
  let moraleArmed = s.moraleArmed;
  if (moraleArmed && dmg > 0) {
    dmg = Math.round(dmg * SK_MORALE_MULT);
    moraleArmed = false;
  }
  let morale = s.morale + h.trong + h.tim;
  if (!moraleArmed && morale >= SK_MORALE_NEED) {
    morale -= SK_MORALE_NEED;
    moraleArmed = true;
  }
  let counsel = s.counsel + h.sach;
  let counselPending = s.counselPending;
  if (!counselPending && counsel >= SK_COUNSEL_NEED) {
    counsel -= SK_COUNSEL_NEED;
    counselPending = true;
  }
  let foodMoves = s.foodMoves;
  let bonus = 0;
  if (h.banhChung >= 3 && foodMoves < SK_FOOD_MOVES_MAX) {
    foodMoves++;
    bonus = 1;
  }
  const hp = Math.max(0, s.hp - dmg);
  const movesLeft = s.movesLeft - (consumeMove && !r.extraTurn ? 1 : 0) + bonus;
  return {
    ...s,
    board: r.board,
    hp,
    movesLeft,
    morale,
    moraleArmed,
    counsel,
    counselPending,
    energy: Math.min(SK_ENERGY_MAX, s.energy + h.amDuong * SK_ENERGY_PER_TILE),
    foodMoves,
    gold: s.gold + h.vang,
    phase: hp <= 0 ? "won" : movesLeft <= 0 && !counselPending ? "lost" : "play",
    rng: rngState,
    lastDamage: dmg,
  };
}

export type SkAction =
  | { readonly type: "swap"; readonly from: Pos; readonly to: Pos }
  | { readonly type: "stratagem"; readonly row: number }
  | { readonly type: "counsel"; readonly correct: boolean };

export type SkReason = "over" | "invalidMove" | "counselPending" | "noEnergy" | "noCounsel" | "badRow";

export type SkResult = { readonly ok: true; readonly state: SkState } | { readonly ok: false; readonly reason: SkReason };

export function skAct(s: SkState, a: SkAction): SkResult {
  if (s.phase !== "play") return { ok: false, reason: "over" };
  if (a.type === "counsel") {
    if (!s.counselPending) return { ok: false, reason: "noCounsel" };
    const hp = a.correct ? Math.max(0, s.hp - Math.round(s.maxHp * SK_COUNSEL_RATIO)) : s.hp;
    return {
      ok: true,
      state: {
        ...s,
        hp,
        counselPending: false,
        lastDamage: s.hp - hp,
        phase: hp <= 0 ? "won" : s.movesLeft <= 0 ? "lost" : "play",
      },
    };
  }
  if (s.counselPending) return { ok: false, reason: "counselPending" };
  const rng = createRng(s.rng);
  if (a.type === "swap") {
    const r = swap(s.board, a.from, a.to, rng, STANDARD_WEIGHTS);
    if (!r.valid) return { ok: false, reason: "invalidMove" };
    return { ok: true, state: applyResult(s, r, rng.state(), true) };
  }
  if (s.energy < SK_ENERGY_MAX) return { ok: false, reason: "noEnergy" };
  if (!Number.isInteger(a.row) || a.row < 0 || a.row >= s.board.rows) return { ok: false, reason: "badRow" };
  const cells = Array.from({ length: s.board.cols ?? BOARD_COLS }, (_, col) => ({ row: a.row, col }));
  const r = destroyCells(s.board, cells, rng, STANDARD_WEIGHTS);
  // Kế sách không tốn nước.
  return { ok: true, state: { ...applyResult({ ...s, energy: 0 }, r, rng.state(), false) } };
}

/** Nước đổi ô gây nhiều sát thương nhất ngay lượt này (dùng cho mô phỏng cân số và gợi ý). */
export function findBestSwap(s: SkState): { from: Pos; to: Pos } | null {
  let best: { from: Pos; to: Pos } | null = null;
  let bestDmg = -1;
  for (const mv of findValidMoves(s.board)) {
    const r = swap(s.board, mv.from, mv.to, createRng(s.rng), STANDARD_WEIGHTS);
    if (!r.valid) continue;
    const d = harvestDamage(r.harvest);
    if (d > bestDmg) {
      bestDmg = d;
      best = { from: mv.from, to: mv.to };
    }
  }
  return best;
}
