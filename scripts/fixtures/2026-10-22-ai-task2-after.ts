// Frozen task2 AI after recipient fix; only import paths adjusted.
import { CHASE_PASSIVES, type ChasePassiveDef } from "../../src/core/battle/chase";
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
  comboMultiplier,
  comboOpportunityValue,
  comboSkillCost,
  comboReady,
  COMBO_PASSIVES,
  canFreeWhirl,
  cascadeMultiplier,
  defenseMultiplier,
  elementMultiplier,
  effectiveAtk,
  effectiveDef,
  spiritHealMultiplier,
  passiveOn,
  nextActor,
  findEffect,
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
  const forced = view.sides.every(s => s.fighters.length === 1) ? -1 : foe.fighters.findIndex(f => isAlive(f) && !hasEffect(f.effects, "freeze") && hasEffect(f.effects, "taunt"));
  const t = forced >= 0 ? forced : pickTarget(foe, view.turn.actor);
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
      return Math.min(me.maxHp - me.hp, Math.round(me.maxHp * 0.03 * (me.profession === "ySu" ? 1.5 : 1) * spiritHealMultiplier(me.spirit, view.experimentalSpirit))) * 0.8;
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
  const own = view.sides[view.turn.side];
  const foe = view.sides[otherSide(view.turn.side)];
  return comboMultiplier(view,{side:view.turn.side,fighter:view.turn.actor},"damage",{side:otherSide(view.turn.side),fighter:foe.fighters.indexOf(target)}) * effectiveAtk(me, view.experimentalSpirit) * morale * (passiveOn(own, me, "hoa") ? 1 + PASSIVE.hoaDamage : 1) * elementMultiplier(me.element, target.element) * defenseMultiplier(effectiveDef(foe, target, view.experimentalSpirit), passiveOn(own, me, "kim") ? PASSIVE.kimPierce : 0);
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
          const ownSide = view.sides[view.turn.side];
          const pierce = 1 - (1 - (step.pierce ?? 0)) * (1 - (passiveOn(ownSide, ctx.me, "kim") ? PASSIVE.kimPierce : 0));
          const defense = defenseMultiplier(effectiveDef(foe, t, view.experimentalSpirit), pierce);
          const baseRaw = Math.round(step.atk * (step.execute && t.hp / t.maxHp <= step.execute.threshold ? step.execute.multiplier : 1) * (def.target === "allEnemies" && view.sides.every(s => s.fighters.length === 1) ? 1.5 : 1) * effectiveAtk(ctx.me, view.experimentalSpirit) * MORALE_DAMAGE[moraleOf(ownSide.food)] * (passiveOn(ownSide, ctx.me, "hoa") ? 1 + PASSIVE.hoaDamage : 1) * elementMultiplier(ctx.me.element, t.element) * defense);
          const raw = Math.round(baseRaw * comboMultiplier(view,{side:view.turn.side,fighter:view.turn.actor},"damage",{side:otherSide(view.turn.side),fighter:foe.fighters.indexOf(t)}));
          const shield = step.pierceShield || passiveOn(ownSide, ctx.me, "kim") ? 0 : findEffect(t.effects, "shield")?.value ?? 0;
          const dealt = Math.min(t.hp + shield, raw);
          score += dealt;
          if (raw >= t.hp + shield) score += ctx.me.atk * 10; // Cùng thưởng kết liễu như khi chấm nước đổi ô.
          if (step.lifesteal) score += Math.min(ctx.me.maxHp - ctx.me.hp, Math.round(Math.round(dealt * step.lifesteal) * spiritHealMultiplier(ctx.me.spirit, view.experimentalSpirit)));
        }
        break;
      }
      case "heal":
        for (const r of list(step.to)) score += Math.min(r.maxHp - r.hp, Math.round(Math.round(Math.round(r.maxHp * step.ratio) * comboMultiplier(view,{side:view.turn.side,fighter:view.turn.actor},"sustain")) * spiritHealMultiplier(r.spirit, view.experimentalSpirit)));
        break;
      case "effect": {
        for (const r of list(step.to)) {
          const existing = findEffect(r.effects, step.effect);
          if (existing && existing.value >= step.value && (existing.turns === null || (existing.turns ?? 0) >= (step.turns ?? 0)) && step.effect !== "shield" && step.effect !== "regen" && step.effect !== "burn") continue;
          const friendly = own.fighters.includes(r);
          const harmful = NEGATIVE_EFFECTS.includes(step.effect);
          const sign = (friendly && harmful) || (!friendly && POSITIVE_EFFECTS.includes(step.effect)) ? -1 : 1;
          let worth = ctx.me.atk * 0.8;
          if (step.effect === "atkUp" || step.effect === "atkDown") worth = effectiveAtk(r, view.experimentalSpirit) * 3 * (Math.max(0, step.value - (existing?.value ?? 0)) * (step.turns ?? 1) + (existing?.value ?? 0) * Math.max(0, (step.turns ?? 0) - (existing?.turns ?? 0))) * 0.9;
          if (step.effect === "defUp" || step.effect === "defDown") {
            const changed = r.def * (step.effect === "defUp" ? 1 + step.value : 1 - step.value);
            worth = Math.abs(defenseMultiplier(r.def) - defenseMultiplier(changed)) * ctx.me.atk * 3 * (step.turns ?? 1);
          }
          if (step.effect === "burn") worth = (step.ofAtk ? ctx.me.atk * step.value : step.value) * (step.turns ?? 1);
          if (step.effect === "freeze" && hasEffect(r.effects, "freezeImmune")) worth = 0;
          if (step.effect === "shield") worth = Math.max(0, Math.round(Math.round((step.ofMaxHp ? Math.round(r.maxHp * step.value) : step.ofAtk ? Math.round(ctx.me.atk * step.value) : step.value) * comboMultiplier(view,{side:view.turn.side,fighter:view.turn.actor},"sustain")) * spiritHealMultiplier(r.spirit, view.experimentalSpirit)) - (existing?.value ?? 0)) * SHIELD_WORTH;
          if (step.effect === "regen") worth = Math.min(r.maxHp - r.hp, Math.max(0, Math.round(Math.round(r.maxHp * step.value) * spiritHealMultiplier(r.spirit, view.experimentalSpirit)) * (step.turns ?? 1) - Math.round((existing?.value ?? 0) * spiritHealMultiplier(r.spirit, view.experimentalSpirit)) * (existing?.turns ?? 0))) * 0.7;
          if (step.effect === "taunt") worth = own.fighters.filter(f => isAlive(f) && f !== r).length ? ctx.me.atk * (r.hp / r.maxHp) : 0;
          if (step.effect === "silence") {
            const enemySide = view.sides[otherSide(view.turn.side)];
            const minimum = Math.min(Infinity, ...(r.skills ?? []).map(id => fighterSkill(r,id)?.cost ?? Infinity));
            let last = view.lastActors[otherSide(view.turn.side)];
            let actions = 0;
            for (let i = 0; i < (step.turns ?? 1); i++) {
              const next = nextActor(enemySide, last, last);
              if (next === null) break;
              if (enemySide.fighters[next] === r) actions++;
              last = next;
            }
            worth = hasEffect(r.effects, "freeze") || minimum === Infinity ? 0 : effectiveAtk(r, view.experimentalSpirit) * (r.energy >= minimum ? 2 : r.energy / Math.max(1,minimum)) * actions;
          }
          if (step.effect === "reflect") {
            const directed = own.fighters.filter(isAlive).length === 1 || hasEffect(r.effects, "taunt") || def.steps.some(s => s.type === "effect" && s.effect === "taunt");
            const incoming = enemies.reduce((sum,e) => sum + effectiveAtk(e, view.experimentalSpirit), 0) * (step.turns ?? 1) * (directed ? 1 : 1 / Math.max(1,own.fighters.filter(isAlive).length));
            worth = Math.min(r.hp + (findEffect(r.effects,"shield")?.value ?? 0), incoming) * Math.max(0,step.value - (existing?.value ?? 0));
          }
          score += sign * worth * (step.chance ?? 1);
        }
        break;
      }
      case "cleanse":
        for (const r of list(step.to)) score += r.effects.some(e => NEGATIVE_EFFECTS.includes(e.kind)) ? ctx.me.atk : 0;
        break;
      case "dispel":
        for (const r of hit) score += r.effects.filter(e => POSITIVE_EFFECTS.includes(e.kind)).reduce((sum, e) => sum + (e.kind === "shield" ? e.value * SHIELD_WORTH : ctx.me.atk * 2), 0) + comboOpportunityValue(view,{side:otherSide(view.turn.side),fighter:foe.fighters.indexOf(r)});
        break;
      case "energy":
        for (const r of list(step.to)) {
          score += (step.amount < 0 ? Math.min(r.energy, -step.amount + ((()=>{const ready=comboReady(view,{side:view.turn.side,fighter:view.turn.actor});return ready&&COMBO_PASSIVES[ready.passive].payoff==="drain"&&ready.target?.side===otherSide(view.turn.side)&&ready.target.fighter===foe.fighters.indexOf(r)?COMBO_PASSIVES[ready.passive].value:0;})())) : Math.min(100 - r.energy + (r === ctx.me ? def.cost : 0), step.amount)) * ctx.me.atk * 0.05;
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
  if (score > 0) score += comboSetupValue(view,def,hit,list);
  if (score <= 0) return null;
  const target = def.target === "enemy" ? lowestEnemy : def.target === "ally" ? lowestAlly : undefined;
  return { score, ...(target === undefined ? {} : { target }), ...(whirl ? { whirl } : {}), ...(cell ? { cell } : {}) };
}

export interface SkillChoice {
  readonly id: string; readonly cost: number; readonly score: number; readonly ratio: number;
  readonly action?: BattleAction; readonly reason: string;
}

/** Chẩn đoán dùng cùng phép chấm/chọn với AI thực, không tiêu thụ RNG. */
export function inspectSkillChoices(view: AiView): SkillChoice[] {
  const me = view.sides[view.turn.side].fighters[view.turn.actor]!;
  const options = (me.skills ?? []).map(id => {
    const base = fighterSkill(me,id)!;
    const def = { ...base, cost: comboSkillCost(me,base) };
    const scored = scoreSkill(view,def);
    const score = scored?.score ?? 0;
    const ratio = score / Math.max(1,(def.cost + TURN_SLOT_ENERGY)*me.atk*0.02);
    const cell = scored?.cell ?? (needsCell(def)?{row:Math.floor(view.board.rows/2),col:Math.floor(view.board.cols/2)}:undefined);
    const action: BattleAction = {type:"skill",skill:id,target:scored?.target,cell,whirl:scored?.whirl};
    return {id,cost:def.cost,score,ratio,action,reason:""};
  });
  const bestRatio = Math.max(0,...options.map(o=>o.ratio));
  let best: typeof options[number] | undefined;
  for (const o of options) {
    if(view.turn.skillUsed) o.reason="slotUsed";
    else if(hasEffect(me.effects,"silence")) o.reason="silenced";
    else if(o.score<=0) o.reason="noValue";
    else if(o.cost>me.energy) o.reason="energy";
    else if(o.ratio<bestRatio*SAVE_FOR_BETTER) o.reason="saving";
    else if(o.ratio<=1) o.reason="belowThreshold";
    else if(!best||o.ratio>best.ratio) best=o;
  }
  for(const o of options) if(!o.reason) o.reason=o===best?"chosen":`dominated:${best?.id ?? "none"}`;
  return options;
}
export function chooseSkill(view: AiView): BattleAction | null {
  return inspectSkillChoices(view).find(o=>o.reason==="chosen")?.action ?? null;
}

export interface AiTurnPolicy {
  readonly chooseSkill?: (view: AiView) => BattleAction | null;
  readonly chooseMove?: typeof chooseMove;
  readonly bestWhirl?: typeof bestWhirl;
}

/**
 * AI đánh trọn lượt của phe đang đến lượt (kể cả lượt thêm), dùng người hành động mặc định.
 * Trả về trạng thái sau lượt và toàn bộ sự kiện.
 */
export function playAiTurn(
  start: BattleState,
  difficulty: Difficulty,
  now = 0,
  policy: AiTurnPolicy = {},
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
      const free = (policy.bestWhirl ?? bestWhirl)(toView(state), PASSIVE.phongFreeWhirlTurns);
      if (free.score > 0) apply({ type: "whirl", whirl: free.whirl });
      if (state.winner !== null) break;
    }
    const skill = (policy.chooseSkill ?? chooseSkill)(toView(state));
    if (skill) apply(skill);
    if (state.winner !== null) break;
    const rng = createRng(state.aiRng);
    const move = (policy.chooseMove ?? chooseMove)(toView(state), difficulty, rng);
    state = { ...state, aiRng: rng.state() };
    if (!apply({ type: "swap", from: move.from, to: move.to })) throw new Error("AI chọn nước đi không hợp lệ");
  }
  return { state, events };
}

/** Small preparation credit, only for a reachable useful event and a living eligible teammate. */
function comboSetupValue(view:AiView,def:SkillDef,hit:readonly Fighter[],recipients:(to:StepRecipient)=>readonly Fighter[]):number {
 const side=view.turn.side,own=view.sides[side],caster=own.fighters[view.turn.actor]!;
 // Prepared opportunities and immediate chase are evaluated separately.
 const kinds=new Set<string>();
 for(const step of def.steps){
  if(step.type==='damage'&&hit.some(f=>f.hp>0))kinds.add('skillDamage');
  if(step.type==='effect'&&step.effect==='defDown'&&hit.some(f=>(findEffect(f.effects,'defDown')?.value??0)<step.value))kinds.add('armorBroken');
  if(step.type==='effect'&&(step.effect==='freeze'||step.effect==='silence')&&hit.some(f=>!hasEffect(f.effects,step.effect)&&!(step.effect==='freeze'&&hasEffect(f.effects,'freezeImmune'))))kinds.add('controlled');
  if(step.type==='dispel'&&hit.some(f=>f.comboReady||f.effects.some(e=>POSITIVE_EFFECTS.includes(e.kind))))kinds.add('dispelled');
  if(step.type==='heal'&&recipients(step.to).some(f=>isAlive(f)&&f.hp<f.maxHp&&Math.round(Math.round(f.maxHp*step.ratio)*spiritHealMultiplier(f.spirit,view.experimentalSpirit))>0))kinds.add('healed');
 }
 const preparation=caster.comboReady?0:own.fighters.reduce((sum,f,i)=>{if(i===view.turn.actor||!isAlive(f)||!f.comboPassive||f.comboReady||hasEffect(f.effects,'silence')||hasEffect(f.effects,'freeze')||f.comboOpenedAt===view.comboState?.sideTurns[side])return sum;const p=COMBO_PASSIVES[f.comboPassive];return sum+(p.triggers.some(k=>kinds.has(k))?Math.min(f.atk*.3,caster.atk*.3):0);},0);
 // Visible first-hop estimate only. No future-board reads or attempt to price the whole chain.
 const chase=own.fighters.reduce((sum,f,i)=>{
   if(!isAlive(f)||hasEffect(f.effects,'silence')||hasEffect(f.effects,'freeze'))return sum;
   return sum+(f.chasePassives??[]).reduce((value,id)=>{
     const p:ChasePassiveDef=CHASE_PASSIVES[id];
     if((p.alliesOnly&&i===view.turn.actor)||!p.triggers.some(k=>kinds.has(k)))return value;
     if(p.effect==='damage')return value+f.atk*p.value*.5;
     if(p.effect==='heal')return value+Math.max(0,...own.fighters.filter(isAlive).map(x=>Math.min(x.maxHp-x.hp,Math.round(x.maxHp*p.value*spiritHealMultiplier(x.spirit,view.experimentalSpirit)))))*.5;
     if(p.effect==='shield')return value+Math.max(0,...own.fighters.filter(isAlive).map(x=>Math.max(0,Math.round(x.maxHp*p.value*spiritHealMultiplier(x.spirit,view.experimentalSpirit))-(findEffect(x.effects,'shield')?.value??0))))*.25;
     return value+Math.min(f.atk*.1,p.value);
   },0);
 },0);
 return preparation+chase;
}
