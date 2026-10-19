// AI Tianwu, xem docs/design/10-ai.md.
// Ngang bằng thông tin: AI chỉ nhận AiView (không có luồng ngẫu nhiên của bàn cờ),
// chỉ mô phỏng phần biết chắc, và dùng luồng ngẫu nhiên riêng (aiRng).

import {
  areaCells,
  findValidMoves,
  pickKind,
  slideCells,
  type Board,
  type Move,
  type Slide,
  type TileKind,
} from "../board";
import {
  act,
  canFreeSlide,
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
} from "../battle";
import { createRng, type Rng } from "../rng";
import { simulateFrom, simulateKnown, type KnownOutcome } from "./simulate";

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

/** fromSkill: bàn cờ đổi do kỹ năng hoặc trượt miễn phí, thu hoạch giảm như trong battle.ts. */
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
 * Lần trượt hàng/cột tốt nhất theo phần biết chắc (ô đã có trên bàn), cho kỹ năng Phong và lần
 * trượt miễn phí của bị động. Luôn trả về một lần trượt hợp lệ, kể cả khi không tạo bộ ghép nào.
 */
export function bestSlide(
  view: AiView,
  maxDistance: number,
  only: { readonly axis?: "row"; readonly exact?: boolean } = {},
): { slide: Slide; score: number } {
  const ctx = context(view);
  const offsets = only.exact
    ? [maxDistance, -maxDistance]
    : Array.from({ length: maxDistance }, (_, i) => [i + 1, -(i + 1)]).flat();
  let best: { slide: Slide; score: number } | null = null;
  for (const axis of only.axis ? [only.axis] : (["row", "col"] as const)) {
    const lines = axis === "row" ? view.board.rows : view.board.cols;
    for (let index = 0; index < lines; index++) {
      for (const offset of offsets) {
        const slide = { axis, index, offset };
        const score = scoreOutcome(ctx, simulateFrom(slideCells(view.board, slide), []), true);
        if (!best || score > best.score) best = { slide, score };
      }
    }
  }
  return best!;
}

/** Chấm sơ bộ một kỹ năng; null nếu không dùng được hoặc vô ích. */
function scoreSkill(view: AiView, def: SkillDef): { score: number; target?: number; slide?: Slide } | null {
  const ctx = context(view);
  const own = view.sides[view.turn.side];
  const foe = view.sides[otherSide(view.turn.side)];
  const enemies = foe.fighters.filter(isAlive);
  const lowestEnemy = foe.fighters.reduce<number | undefined>(
    (best, f, i) => (isAlive(f) && (best === undefined || f.hp < foe.fighters[best]!.hp) ? i : best),
    undefined,
  );
  const lowestAlly = own.fighters.reduce<number | undefined>(
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
  let slide: Slide | undefined;
  for (const step of def.steps) {
    switch (step.type) {
      case "slide": {
        const best = bestSlide(view, step.distance, step);
        score += best.score;
        slide = best.slide;
        break;
      }
      case "damage": {
        for (const t of hit) {
          const defense = defenseMultiplier(t.def, step.pierce ?? 0);
          score += Math.min(t.hp, step.atk * ctx.me.atk * elementMultiplier(ctx.me.element, t.element) * defense);
        }
        break;
      }
      case "heal":
        for (const r of list(step.to)) score += Math.min(r.maxHp - r.hp, r.maxHp * step.ratio);
        break;
      case "effect": {
        for (const r of list(step.to)) {
          if (hasEffect(r.effects, step.effect)) continue;
          // Khiên là máu ảo nên chấm theo lượng chặn được (giảm vì có thể chưa bị đánh hết); hiệu ứng khác giá phẳng.
          const worth =
            step.effect === "shield"
              ? (step.ofMaxHp ? r.maxHp * step.value : step.ofAtk ? ctx.me.atk * step.value : step.value) * SHIELD_WORTH
              : ctx.me.atk * 0.8;
          score += worth * (step.chance ?? 1);
        }
        break;
      }
      case "cleanse":
        for (const r of list(step.to)) score += r.effects.length > 0 ? ctx.me.atk : 0;
        break;
      case "dispel":
        for (const r of enemies) score += r.effects.length * ctx.me.atk * 0.5;
        break;
      case "energy":
        for (const r of list(step.to)) {
          score += (step.amount < 0 ? Math.min(r.energy, -step.amount) : Math.min(100 - r.energy, step.amount)) * ctx.me.atk * 0.03;
        }
        break;
      case "enemyFood":
        score += ctx.me.atk;
        break;
      case "destroy":
        score += ctx.me.atk * CELL_VALUE * areaSize(view.board, step.area);
        break;
      case "transform":
        score += ctx.me.atk * CELL_VALUE * step.count;
        break;
      case "mark":
        score += ctx.me.atk * 0.3;
        break;
    }
  }
  if (score <= 0) return null;
  const target = def.target === "enemy" ? lowestEnemy : def.target === "ally" ? lowestAlly : undefined;
  return { score, ...(target === undefined ? {} : { target }), ...(slide ? { slide } : {}) };
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
    const cell = needsCell(def) ? { row: Math.floor(view.board.rows / 2), col: Math.floor(view.board.cols / 2) } : undefined;
    best = { action: { type: "skill", skill: id, target: scored.target, cell, slide: scored.slide }, ratio };
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
    if (canFreeSlide(state)) {
      const free = bestSlide(toView(state), PASSIVE.phongFreeSlide);
      if (free.score > 0) apply({ type: "slide", slide: free.slide });
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
