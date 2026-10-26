// Frozen AI baseline from uncommitted skill reform; do not use in production.
// AI Tianwu, xem docs/01-gameplay/ai.md.
// Ngang bằng thông tin: AI chỉ nhận AiView (không có luồng ngẫu nhiên của bàn cờ),
// chỉ mô phỏng phần biết chắc, và dùng luồng ngẫu nhiên riêng (aiRng).

import {
  areaCells,
  findValidMoves,
  pickKind,
  autoWhirl,
  whirlCells,
  type Board,
  type Pos,
  type Move,
  type Whirl,
  type TileKind,
} from "../../src/core/board";
import {
  act,
  canFreeWhirl,
  cascadeMultiplier,
  defenseMultiplier,
  elementMultiplier,
  fighterSkill,
  hasEffect,
  isAlive,
  MORALE_DAMAGE,
  moraleOf,
  needsCell,
  otherSide,
  PASSIVE,
  POSITIVE_EFFECTS,
  NEGATIVE_EFFECTS,
  pickTarget,
  selectableActors,
  SKILL_BOARD_ENERGY,
  SKILL_BOARD_SWORD,
  type BattleAction,
  type BattleEvent,
  type BattleState,
  type Fighter,
  type SkillDef,
  type SkillStep,
  type StepRecipient,
} from "../../src/core/battle";
import { createRng, type Rng } from "../../src/core/rng";
import { simulateFrom, simulateKnown, type KnownOutcome } from "../../src/core/ai/simulate";

export type Difficulty = "easy" | "normal" | "hard" | "boss" | "nightmare";

/** Những gì AI được nhìn thấy: đúng phần người chơi thấy, không có luồng ô rơi. */
export type AiView = Omit<BattleState, "boardRng">;

export function toView(state: BattleState): AiView {
  const view: Partial<BattleState> = { ...state };
  delete view.boardRng;
  return view as AiView;
}

/** Mặc định tạm cho độ ngẫu nhiên từng mức (docs còn TODO). */
export const NOISE: Record<Difficulty, number> = { easy: 0.6, normal: 0.3, hard: 0.1, boss: 0.05, nightmare: 0 };
const SAMPLE_TOP = 10;
const SAMPLES = 16;
const EXPECTED_FACTOR = 0.3;

interface Context {
  readonly view: AiView;
  readonly me: Fighter;
  readonly target: Fighter | undefined;
}

function context(view: AiView): Context {
  const own = view.sides[view.turn.side];
  const foe = view.sides[otherSide(view.turn.side)];
  const t = pickTarget(foe, view.turn.actor);
  return { view, me: own.fighters[view.turn.actor]!, target: t === null ? undefined : foe.fighters[t] };
}

/** Giá trị (quy ra điểm sát thương) của một ô mỗi loại với người hành động hiện tại. */
function tileValue(ctx: Context, kind: TileKind): number {
  const { view, me } = ctx;
  const own = view.sides[view.turn.side];
  const unit = me.atk * 0.05;
  switch (kind) {
    case "kiem":
      return swordDamage(ctx);
    case "amDuong":
      return (me.skills?.length ?? 0) > 0 && me.energy < 100 ? 10 * unit : unit;
    case "banhChung":
      return 4 * unit * (own.food < 30 ? 3 : own.food < 70 ? 1 : 0.3);
    case "tim":
      return Math.min(me.maxHp - me.hp, me.maxHp * 0.03) * 0.8;
    case "trong": {
      const leader = own.fighters[own.leader]!;
      return isAlive(leader) && own.passiveTurns === 0 ? 8 * unit * 0.6 : 0;
    }
    case "vang":
    case "sach":
      return unit;
  }
}

function swordDamage({ view, me, target }: Context): number {
  if (!target) return 0;
  const morale = MORALE_DAMAGE[moraleOf(view.sides[view.turn.side].food)];
  return me.atk * morale * elementMultiplier(me.element, target.element) * defenseMultiplier(target.def);
}

/** fromSkill: bàn cờ đổi do kỹ năng hoặc xoay miễn phí, thu hoạch giảm như trong battle.ts. */
function scoreOutcome(ctx: Context, o: KnownOutcome, fromSkill = false): number {
  let score = 0;
  for (const [kind, n] of Object.entries(o.harvest) as [TileKind, number][]) {
    if (kind === "kiem") continue;
    score += n * (fromSkill && kind === "amDuong" ? tileValue(ctx, kind) * SKILL_BOARD_ENERGY : tileValue(ctx, kind));
  }
  const perSword = swordDamage(ctx) * (fromSkill ? SKILL_BOARD_SWORD : 1);
  const dmg = o.swordsByStep.reduce((sum, n, i) => sum + n * cascadeMultiplier(i) * perSword, 0);
  score += dmg;
  if (ctx.target && dmg >= ctx.target.hp) score += ctx.me.atk * 10;
  if (o.extraTurn && !fromSkill) score += ctx.me.atk * 3;
  score += o.specialsCreated * ctx.me.atk * 2;
  return score;
}

function expectedNewTiles(ctx: Context, unknown: number): number {
  const w = ctx.view.weights;
  let avg = 0;
  for (const kind of Object.keys(w) as TileKind[]) avg += (w[kind] / 100) * tileValue(ctx, kind);
  return unknown * avg * EXPECTED_FACTOR;
}

/** Lấp ô trống bằng luồng ngẫu nhiên của AI rồi chấm phần cascade thêm. */
function sampledBonus(ctx: Context, board: Board, rng: Rng): number {
  let total = 0;
  for (let k = 0; k < SAMPLES; k++) {
    const cells = board.cells.map((c) => c ?? { kind: pickKind(rng, ctx.view.weights) });
    total += scoreOutcome(ctx, simulateFrom({ ...board, cells }, []));
  }
  return total / SAMPLES;
}

export function chooseMove(view: AiView, difficulty: Difficulty, rng: Rng): Move {
  const ctx = context(view);
  const moves = findValidMoves(view.board);
  if (moves.length === 0) throw new Error("Bàn không có nước đi");
  let scored = moves.map((move) => {
    const o = simulateKnown(view.board, move.from, move.to);
    let score = scoreOutcome(ctx, o);
    if (difficulty === "hard" || difficulty === "boss" || difficulty === "nightmare") {
      score += expectedNewTiles(ctx, o.unknownCells);
    }
    return { move, o, score };
  });
  if (difficulty === "boss" || difficulty === "nightmare") {
    scored.sort((a, b) => b.score - a.score);
    scored = scored.map((s, i) =>
      i < SAMPLE_TOP ? { ...s, score: scoreOutcome(ctx, s.o) + sampledBonus(ctx, s.o.board, rng) } : s,
    );
  }
  const noise = NOISE[difficulty];
  let best = scored[0]!;
  let bestScore = -Infinity;
  for (const s of scored) {
    const noisy = noise > 0 ? s.score * (1 + noise * (rng.next() * 2 - 1)) + noise * ctx.me.atk * rng.next() : s.score;
    if (noisy > bestScore) {
      bestScore = noisy;
      best = s;
    }
  }
  return best.move;
}

/** Giá trị mỗi ô bị phá hoặc biến, tính theo ATK. */
const CELL_VALUE = 0.3;
/** Chỉ dùng kỹ năng đáng ít nhất tỉ lệ này so với kỹ năng đáng nhất của bộ; còn lại thì để dành năng lượng. */
const SAVE_FOR_BETTER = 0.8;
/**
 * Mỗi lượt chỉ dùng được 1 kỹ năng, nên lượt dùng cũng là một khoản chi: cộng thêm chừng này năng lượng vào
 * giá khi so độ đáng. Không có nó AI chỉ so điểm trên năng lượng và gần như không bao giờ để dành cho kỹ năng 100.
 */
/** Phần lượng khiên tính như máu thật khi chấm kỹ năng. */
const SHIELD_WORTH = 0.6;
const TURN_SLOT_ENERGY = 40;

function areaSize(board: Board, area: Extract<SkillStep, { type: "destroy" }>["area"]): number {
  if ("random" in area) return area.random;
  return areaCells(board, { row: Math.floor(board.rows / 2), col: Math.floor(board.cols / 2) }, area).length;
}

/**
 * Lần xoay lốc xoáy tốt nhất theo phần biết chắc (ô đã có trên bàn), cho kỹ năng Phong và lần
 * xoay miễn phí của bị động. Luôn trả về một lần xoay hợp lệ, kể cả khi không tạo bộ ghép nào.
 */
export function bestWhirl(view: AiView, maxTurns: number): { whirl: Whirl; score: number } {
  const ctx = context(view);
  let best: { whirl: Whirl; score: number } | null = null;
  for (let row = 1; row <= view.board.rows - 2; row++) {
    for (let col = 1; col <= view.board.cols - 2; col++) {
      for (let t = 1; t <= maxTurns; t++) {
        for (const turns of [t, -t]) {
          const whirl = { center: { row, col }, turns };
          const score = scoreOutcome(ctx, simulateFrom(whirlCells(view.board, whirl), []), true);
          if (!best || score > best.score) best = { whirl, score };
        }
      }
    }
  }
  return best!;
}

/** Chấm sơ bộ một kỹ năng; null nếu không dùng được hoặc vô ích. */
export function scoreSkill(view: AiView, def: SkillDef): { score: number; target?: number; whirl?: Whirl; cell?: Pos } | null {
  const side = def.target === "enemy" ? otherSide(view.turn.side) : view.turn.side;
  const forced = def.target === "enemy" && view.sides[0].fighters.length > 1
    ? view.sides[side].fighters.findIndex(f => isAlive(f) && !hasEffect(f.effects, "freeze") && hasEffect(f.effects, "taunt")) : -1;
  const candidates = forced >= 0 ? [forced] : def.target === "enemy" || def.target === "ally"
    ? view.sides[side].fighters.flatMap((f, i) => isAlive(f) ? [i] : []) : [undefined];
  let best: ReturnType<typeof scoreSkillTarget> = null;
  for (const target of candidates) {
    const scored = scoreSkillTarget(view, def, target);
    if (scored && (!best || scored.score > best.score)) best = scored;
  }
  return best;
}

function scoreSkillTarget(view: AiView, def: SkillDef, selected?: number): { score: number; target?: number; whirl?: Whirl; cell?: Pos } | null {
  const ctx = context(view);
  const own = view.sides[view.turn.side];
  const foe = view.sides[otherSide(view.turn.side)];
  const enemies = foe.fighters.filter(isAlive);
  const lowestEnemy = selected ?? foe.fighters.reduce<number | undefined>(
    (best, f, i) => (isAlive(f) && (best === undefined || f.hp < foe.fighters[best]!.hp) ? i : best),
    undefined,
  );
  const lowestAlly = selected ?? own.fighters.reduce<number | undefined>(
    (best, f, i) =>
      isAlive(f) && (best === undefined || f.hp / f.maxHp < own.fighters[best]!.hp / own.fighters[best]!.maxHp) ? i : best,
    undefined,
  );
  const recipients =
    def.target === "team" ? own.fighters.filter(isAlive) : def.target === "ally" ? [own.fighters[lowestAlly ?? 0]!] : [ctx.me];
  const hostile = def.target === "enemy" || def.target === "allEnemies";
  const hit = def.target === "allEnemies" ? enemies : lowestEnemy === undefined ? [] : [foe.fighters[lowestEnemy]!];
  const list = (to: StepRecipient): Fighter[] =>
    to === "self" ? [ctx.me] : to === "team" ? own.fighters.filter(isAlive) : to === "enemies" ? enemies : hostile ? hit : recipients;

  let score = 0;
  let whirl: Whirl | undefined;
  let cell: Pos | undefined;
  for (const step of def.steps) {
    switch (step.type) {
      case "whirl": {
        if (step.auto) {
          // Bước tự xoay: chấm đúng lần xoay core sẽ chọn.
          const auto = autoWhirl(view.board, step.turns);
          if (auto) score += scoreOutcome(ctx, simulateFrom(whirlCells(view.board, auto), []), true);
        } else {
          const best = bestWhirl(view, step.turns);
          score += best.score;
          whirl = best.whirl;
        }
        break;
      }
      case "damage": {
        for (const t of hit) {
          const defense = defenseMultiplier(t.def, step.pierce ?? 0);
          score += Math.min(t.hp, step.atk * (step.execute && t.hp / t.maxHp <= step.execute.threshold ? step.execute.multiplier : 1) * (def.target === "allEnemies" && foe.fighters.length === 1 ? 1.5 : 1) * ctx.me.atk * elementMultiplier(ctx.me.element, t.element) * defense);
        }
        break;
      }
      case "heal":
        for (const r of list(step.to)) score += Math.min(r.maxHp - r.hp, r.maxHp * step.ratio);
        break;
      case "effect": {
        for (const r of list(step.to)) {
          if (hasEffect(r.effects, step.effect)) continue;
          const friendly = own.fighters.includes(r);
          const harmful = NEGATIVE_EFFECTS.includes(step.effect);
          const sign = (friendly && harmful) || (!friendly && POSITIVE_EFFECTS.includes(step.effect)) ? -1 : 1;
          let worth = ctx.me.atk * 0.8;
          if (step.effect === "atkUp" || step.effect === "atkDown") worth = r.atk * 3 * step.value * (step.turns ?? 1) * 0.9;
          if (step.effect === "defUp" || step.effect === "defDown") {
            const changed = r.def * (step.effect === "defUp" ? 1 + step.value : 1 - step.value);
            worth = Math.abs(defenseMultiplier(r.def) - defenseMultiplier(changed)) * ctx.me.atk * 3 * (step.turns ?? 1);
          }
          if (step.effect === "burn") worth = (step.ofAtk ? ctx.me.atk * step.value : step.value) * (step.turns ?? 1);
          if (step.effect === "freeze" && hasEffect(r.effects, "freezeImmune")) worth = 0;
          if (step.effect === "shield") worth = (step.ofMaxHp ? r.maxHp * step.value : step.ofAtk ? ctx.me.atk * step.value : step.value) * SHIELD_WORTH;
          if (step.effect === "regen") worth = Math.min(r.maxHp - r.hp, r.maxHp * step.value * (step.turns ?? 1)) * 0.7;
          if (step.effect === "taunt") worth = own.fighters.filter(f => isAlive(f) && f !== r).length ? ctx.me.atk * (r.hp / r.maxHp) : 0;
          if (step.effect === "silence") worth = (r.skills?.length ?? 0) ? ctx.me.atk * (0.3 + r.energy / 50) : 0;
          score += sign * worth * (step.chance ?? 1);
        }
        break;
      }
      case "cleanse":
        for (const r of list(step.to)) score += r.effects.some(e => NEGATIVE_EFFECTS.includes(e.kind)) ? ctx.me.atk : 0;
        break;
      case "dispel":
        for (const r of hit) score += r.effects.filter(e => POSITIVE_EFFECTS.includes(e.kind)).reduce((sum, e) => sum + (e.kind === "shield" ? e.value * SHIELD_WORTH : ctx.me.atk * 2), 0);
        break;
      case "energy":
        for (const r of list(step.to)) {
          score += (step.amount < 0 ? Math.min(r.energy, -step.amount) : Math.min(100 - r.energy, step.amount)) * ctx.me.atk * 0.05;
        }
        break;
      case "enemyFood":
        score += Math.min(foe.food, Math.abs(step.amount)) * ctx.me.atk * 0.06;
        break;
      case "destroy": {
        if ("random" in step.area) {
          // Kỳ vọng từ bàn nhìn thấy, không đọc vị trí sẽ rút bằng boardRng.
          const perTile = view.board.cells.reduce((sum, t) => sum + (t ? tileValue(ctx, t.kind) * (t.kind === "kiem" ? SKILL_BOARD_SWORD : t.kind === "amDuong" ? SKILL_BOARD_ENERGY : 1) : 0), 0) / view.board.cells.length;
          score += perTile * areaSize(view.board, step.area);
        } else {
          // Chấm nhanh mọi vùng, mô phỏng cascade cho 6 vùng triển vọng khác nhau.
          const regions = new Map<string, { center: Pos; cells: Pos[]; score: number }>();
          for (let row = 0; row < view.board.rows; row++) for (let col = 0; col < view.board.cols; col++) {
            const center = { row, col };
            const cells = areaCells(view.board, center, step.area);
            const key = cells.map(p => p.row * view.board.cols + p.col).join(",");
            if (regions.has(key)) continue;
            const value = cells.reduce((sum, p) => {
              const t = view.board.cells[p.row * view.board.cols + p.col];
              return sum + (t ? tileValue(ctx, t.kind) * (t.kind === "kiem" ? SKILL_BOARD_SWORD : t.kind === "amDuong" ? SKILL_BOARD_ENERGY : 1) : 0);
            }, 0);
            regions.set(key, { center, cells, score: value });
          }
          let best = -Infinity;
          for (const region of [...regions.values()].sort((a, b) => b.score - a.score).slice(0, 6)) {
            const value = scoreOutcome(ctx, simulateFrom(view.board, [], region.cells), true);
            if (value > best) { best = value; cell = region.center; }
          }
          score += Math.max(0, best);
        }
        break;
      }
      case "transform":
        score += ctx.me.atk * CELL_VALUE * step.count * (step.kind === "kiem" ? SKILL_BOARD_SWORD : step.kind === "amDuong" ? SKILL_BOARD_ENERGY : 1);
        break;
      case "mark":
        score += ctx.me.atk * 0.3;
        break;
    }
  }
  if (score <= 0) return null;
  const target = def.target === "enemy" ? lowestEnemy : def.target === "ally" ? lowestAlly : undefined;
  return { score, ...(target === undefined ? {} : { target }), ...(whirl ? { whirl } : {}), ...(cell ? { cell } : {}) };
}

export function chooseSkill(view: AiView): BattleAction | null {
  const me = view.sides[view.turn.side].fighters[view.turn.actor]!;
  if (view.turn.skillUsed || hasEffect(me.effects, "silence")) return null;
  const options = (me.skills ?? []).flatMap((id) => {
    const def = fighterSkill(me, id);
    const scored = def && scoreSkill(view, def);
    if (!def || !scored) return [];
    return [{ id, def, scored, ratio: scored.score / Math.max(1, (def.cost + TURN_SLOT_ENERGY) * me.atk * 0.02) }];
  });
  // Kỹ năng đáng hơn nhưng chưa đủ năng lượng thì để dành, không tiêu vào kỹ năng kém hơn.
  const bestRatio = Math.max(0, ...options.map((o) => o.ratio));
  let best: { action: BattleAction; ratio: number } | null = null;
  for (const { id, def, scored, ratio } of options) {
    if (def.cost > me.energy || ratio < bestRatio * SAVE_FOR_BETTER) continue;
    if (ratio <= 1 || (best && best.ratio >= ratio)) continue;
    const cell = scored.cell ?? (needsCell(def) ? { row: Math.floor(view.board.rows / 2), col: Math.floor(view.board.cols / 2) } : undefined);
    best = { action: { type: "skill", skill: id, target: scored.target, cell, whirl: scored.whirl }, ratio };
  }
  return best?.action ?? null;
}

/**
 * AI đánh trọn lượt của phe đang đến lượt (kể cả lượt thêm), dùng người hành động mặc định.
 * Trả về trạng thái sau lượt và toàn bộ sự kiện.
 */
export function playAiTurn(
  start: BattleState,
  difficulty: Difficulty,
  now = 0,
): { state: BattleState; events: BattleEvent[] } {
  let state = start;
  const side = state.turn.side;
  const number = state.turn.number;
  const events: BattleEvent[] = [];
  const apply = (action: BattleAction) => {
    const r = act(state, action, now);
    if (!r.ok) return false;
    state = r.state;
    events.push(...r.events);
    return true;
  };

  while (state.winner === null && state.turn.side === side && state.turn.number === number) {
    if (selectableActors(state).length === 0) break;
    if (canFreeWhirl(state)) {
      const free = bestWhirl(toView(state), PASSIVE.phongFreeWhirlTurns);
      if (free.score > 0) apply({ type: "whirl", whirl: free.whirl });
      if (state.winner !== null) break;
    }
    const skill = chooseSkill(toView(state));
    if (skill) apply(skill);
    if (state.winner !== null) break;
    const rng = createRng(state.aiRng);
    const move = chooseMove(toView(state), difficulty, rng);
    state = { ...state, aiRng: rng.state() };
    if (!apply({ type: "swap", from: move.from, to: move.to })) throw new Error("AI chọn nước đi không hợp lệ");
  }
  return { state, events };
}
