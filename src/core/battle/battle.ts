// Luồng trận đấu: lượt, người hành động, kỹ năng, áp kết quả bàn cờ lên hai phe.
// Xem docs/design/02-tran-dau.md, 03-tai-nguyen-cong-thuc.md, 04-hieu-ung.md, 06-nhan-vat-ky-nang.md.
// Hàm thuần: nhận trạng thái cũ, trả trạng thái mới; thời gian do bên gọi truyền vào.

import {
  STANDARD_WEIGHTS,
  generateBoard,
  swap,
  validateWeights,
  type CascadeStep,
  type Pos,
  type SpawnWeights,
} from "../board";
import { createRng, type Rng } from "../rng";
import {
  NEGATIVE_EFFECTS,
  POSITIVE_EFFECTS,
  addEffect,
  findEffect,
  hasEffect,
  removeEffects,
  statModifier,
  tickDurations,
  type Effect,
  type EffectKind,
} from "./effects";
import { elementMultiplier } from "./elements";
import * as R from "./rules";
import { MARK, getSkill, markAudience, type SkillDef } from "./skills";
import {
  canAct,
  isAlive,
  otherSide,
  type BattleState,
  type Fighter,
  type Side,
  type SideConfig,
  type SideIndex,
} from "./state";

export type DamageSource = "sword" | "skill" | "burn" | "reflect" | "starvation";

export interface FighterRef {
  readonly side: SideIndex;
  readonly fighter: number;
}

export type BattleEvent =
  | { readonly type: "turnStart"; readonly side: SideIndex; readonly actor: number; readonly extra: boolean }
  | { readonly type: "upkeep"; readonly side: SideIndex; readonly food: number }
  | { readonly type: "frozenSkip"; readonly side: SideIndex }
  | { readonly type: "swap"; readonly from: Pos; readonly to: Pos; readonly steps: readonly CascadeStep[] }
  | { readonly type: "skill"; readonly side: SideIndex; readonly fighter: number; readonly skill: string }
  | { readonly type: "shuffle" }
  | {
      readonly type: "damage";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly amount: number;
      /** Phần bị Khiên hấp thụ, không trừ máu. */
      readonly absorbed: number;
      readonly source: DamageSource;
    }
  | { readonly type: "heal"; readonly side: SideIndex; readonly fighter: number; readonly amount: number }
  | { readonly type: "energy"; readonly side: SideIndex; readonly fighter: number; readonly amount: number }
  | { readonly type: "food"; readonly side: SideIndex; readonly amount: number }
  | { readonly type: "rage"; readonly side: SideIndex; readonly amount: number }
  | { readonly type: "passive"; readonly side: SideIndex }
  | { readonly type: "effect"; readonly side: SideIndex; readonly fighter: number; readonly effect: EffectKind }
  | { readonly type: "effectEnd"; readonly side: SideIndex; readonly fighter: number; readonly effect: EffectKind }
  | { readonly type: "ko"; readonly side: SideIndex; readonly fighter: number }
  | { readonly type: "timeout"; readonly side: SideIndex }
  | { readonly type: "end"; readonly winner: SideIndex };

export type BattleAction =
  | { readonly type: "selectActor"; readonly fighter: number }
  | { readonly type: "skill"; readonly skill: string; readonly target?: number }
  | { readonly type: "swap"; readonly from: Pos; readonly to: Pos }
  | { readonly type: "timeout" };

export type BattleError =
  | "battleOver"
  | "invalidActor"
  | "invalidMove"
  | "invalidSkill"
  | "invalidTarget"
  | "skillUsed"
  | "silenced"
  | "notEnoughEnergy"
  | "tooLate"
  | "tooEarly"
  | "noTimer";

export type ActResult =
  | { readonly ok: true; readonly state: BattleState; readonly events: readonly BattleEvent[] }
  | { readonly ok: false; readonly error: BattleError };

export interface BattleConfig {
  readonly sides: readonly [SideConfig, SideConfig];
  readonly seed: number;
  readonly weights?: SpawnWeights;
  /** Tắt được ở chế độ Luyện tập và trang /demo. */
  readonly timer?: boolean;
  readonly firstSide?: SideIndex;
  readonly now?: number;
}

export function createBattle(config: BattleConfig): { state: BattleState; events: BattleEvent[] } {
  const weights = config.weights ?? STANDARD_WEIGHTS;
  validateWeights(weights);
  const rng = createRng(config.seed);
  const board = generateBoard(rng, weights);
  const sides = config.sides.map((s): Side => {
    if (s.fighters.length === 0) throw new RangeError("Mỗi phe cần ít nhất một nhân vật");
    if (s.leader < 0 || s.leader >= s.fighters.length) throw new RangeError("Thủ lĩnh không hợp lệ");
    for (const f of s.fighters) {
      for (const id of f.skills ?? []) if (!getSkill(id)) throw new RangeError(`Kỹ năng không tồn tại: ${id}`);
    }
    return {
      fighters: s.fighters.map((f) => ({ ...f, hp: f.maxHp, energy: 0, effects: [] })),
      leader: s.leader,
      food: s.food ?? R.FOOD_START,
      rage: 0,
      passiveTurns: 0,
      gold: 0,
      books: 0,
    };
  }) as [Side, Side];
  const first = config.firstSide ?? 0;
  const state: BattleState = {
    sides,
    board,
    boardRng: rng.state(),
    weights,
    timer: config.timer ?? true,
    turn: {
      side: first,
      actor: 0,
      lastActor: null,
      acted: [],
      extra: false,
      skillUsed: false,
      deadline: null,
      number: 0,
    },
    lastActors: [null, null],
    winner: null,
  };
  const ctx = new Ctx(state, config.now ?? 0);
  ctx.beginSideTurn(first);
  return { state, events: ctx.events };
}

export function act(prev: BattleState, action: BattleAction, now = 0): ActResult {
  if (prev.winner !== null) return { ok: false, error: "battleOver" };
  const state = structuredClone(prev);
  const ctx = new Ctx(state, now);
  const turn = state.turn;
  const late = turn.deadline !== null && now > turn.deadline + R.GRACE_MS;

  switch (action.type) {
    case "selectActor": {
      if (!selectableActors(state).includes(action.fighter)) return { ok: false, error: "invalidActor" };
      if (turn.skillUsed) return { ok: false, error: "skillUsed" };
      turn.actor = action.fighter;
      return { ok: true, state, events: [] };
    }
    case "skill": {
      if (late) return { ok: false, error: "tooLate" };
      const actor = state.sides[turn.side].fighters[turn.actor]!;
      const def = getSkill(action.skill);
      if (!def || !(actor.skills ?? []).includes(action.skill)) return { ok: false, error: "invalidSkill" };
      if (turn.skillUsed) return { ok: false, error: "skillUsed" };
      if (hasEffect(actor.effects, "silence")) return { ok: false, error: "silenced" };
      if (actor.energy < def.cost) return { ok: false, error: "notEnoughEnergy" };
      const targets = skillTargets(state, def, action.target);
      if (!targets) return { ok: false, error: "invalidTarget" };
      ctx.useSkill(def, targets);
      return { ok: true, state, events: ctx.events };
    }
    case "swap": {
      if (late) return { ok: false, error: "tooLate" };
      const outcome = ctx.withBoardRng((rng) => swap(state.board, action.from, action.to, rng, state.weights));
      if (!outcome.valid) return { ok: false, error: "invalidMove" };
      state.board = outcome.board;
      ctx.emit({ type: "swap", from: action.from, to: action.to, steps: outcome.steps });
      outcome.steps.forEach((step, i) => {
        if (state.winner === null) ctx.applyStep(step, i);
      });
      if (outcome.shuffled) ctx.emit({ type: "shuffle" });
      if (state.winner !== null) return { ok: true, state, events: ctx.events };

      turn.acted.push(turn.actor);
      turn.lastActor = turn.actor;
      state.lastActors[turn.side] = turn.actor;
      if (outcome.extraTurn) ctx.beginExtraTurn();
      else ctx.endSideTurn();
      return { ok: true, state, events: ctx.events };
    }
    case "timeout": {
      if (turn.deadline === null) return { ok: false, error: "noTimer" };
      if (now <= turn.deadline) return { ok: false, error: "tooEarly" };
      ctx.emit({ type: "timeout", side: turn.side });
      ctx.endSideTurn();
      return { ok: true, state, events: ctx.events };
    }
  }
}

/** Những người phe đang đánh được chọn làm người hành động. */
export function selectableActors(state: BattleState): number[] {
  const { side, lastActor } = state.turn;
  const ready = readyIndices(state.sides[side]);
  if (ready.length <= 1) return ready;
  return ready.filter((i) => i !== lastActor);
}

function aliveIndices(side: Side): number[] {
  return side.fighters.flatMap((f, i) => (isAlive(f) ? [i] : []));
}

function readyIndices(side: Side): number[] {
  return side.fighters.flatMap((f, i) => (canAct(f) ? [i] : []));
}

/** Người kế tiếp sau `after` theo thứ tự vị trí, bỏ qua người đã gục, bị Đóng băng và người vừa ra tay. */
function nextActor(side: Side, after: number | null, lastActor: number | null): number | null {
  const n = side.fighters.length;
  const ready = readyIndices(side);
  if (ready.length === 0) return null;
  const start = after === null ? 0 : after + 1;
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n;
    if (ready.includes(i) && (ready.length <= 1 || i !== lastActor)) return i;
  }
  return ready[0]!;
}

function isDuel(state: BattleState): boolean {
  return state.sides[0].fighters.length === 1 && state.sides[1].fighters.length === 1;
}

/** Người đang Khiêu khích của phe: còn sống, không bị Đóng băng. Chỉ có ở 3vs3. */
function taunter(state: BattleState, side: Side): number | null {
  if (isDuel(state)) return null;
  const i = side.fighters.findIndex((f) => canAct(f) && hasEffect(f.effects, "taunt"));
  return i < 0 ? null : i;
}

/** Đối thủ đối diện; đã gục thì đối thủ còn sống gần nhất (hòa thì vị trí nhỏ hơn). Không xét Khiêu khích. */
export function pickTarget(foe: Side, position: number): number | null {
  const alive = aliveIndices(foe);
  if (alive.length === 0) return null;
  return alive.reduce((best, i) => (Math.abs(i - position) < Math.abs(best - position) ? i : best));
}

/** Mục tiêu đơn của phe đang đánh: Khiêu khích ghi đè, rồi tới đối diện/gần nhất. */
function singleTarget(state: BattleState, position: number): number | null {
  const foe = state.sides[otherSide(state.turn.side)];
  return taunter(state, foe) ?? pickTarget(foe, position);
}

function skillTargets(state: BattleState, def: SkillDef, chosen: number | undefined): FighterRef[] | null {
  const own = state.turn.side;
  const foeIdx = otherSide(own);
  const foe = state.sides[foeIdx];
  const refs = (side: SideIndex, list: number[]) => list.map((fighter) => ({ side, fighter }));
  switch (def.target) {
    case "self":
      return [{ side: own, fighter: state.turn.actor }];
    case "team":
      return refs(own, aliveIndices(state.sides[own]));
    case "allEnemies":
      return refs(foeIdx, aliveIndices(foe));
    case "ally": {
      const i = chosen ?? state.turn.actor;
      const ally = state.sides[own].fighters[i];
      return ally && isAlive(ally) ? [{ side: own, fighter: i }] : null;
    }
    case "enemy": {
      const forced = taunter(state, foe);
      const i = chosen ?? forced ?? singleTarget(state, state.turn.actor);
      if (i === null || !foe.fighters[i] || !isAlive(foe.fighters[i])) return null;
      if (forced !== null && i !== forced) return null;
      return [{ side: foeIdx, fighter: i }];
    }
  }
}

function hpRatio(f: Fighter): number {
  return f.hp / f.maxHp;
}

function effectiveAtk(f: Fighter): number {
  return f.atk * statModifier(f.effects, "atkUp", "atkDown");
}

/** DEF sau hiệu ứng; Binh lính +5% mỗi bậc sĩ khí trên mức bình thường. */
function effectiveDef(side: Side, f: Fighter): number {
  const tiers = R.moraleOf(side.food) === "eager" ? 1 : 0;
  const bonus = f.profession === "binhLinh" ? R.BINH_LINH_DEF_PER_TIER * tiers : 0;
  return f.def * (statModifier(f.effects, "defUp", "defDown") + bonus);
}

class Ctx {
  readonly events: BattleEvent[] = [];
  constructor(
    private readonly state: BattleState,
    private readonly now: number,
  ) {}

  emit(event: BattleEvent): void {
    this.events.push(event);
  }

  /** Dùng luồng ngẫu nhiên của bàn cờ rồi lưu lại trạng thái của nó. */
  withBoardRng<T>(fn: (rng: Rng) => T): T {
    const rng = createRng(this.state.boardRng);
    const result = fn(rng);
    this.state.boardRng = rng.state();
    return result;
  }

  private fighter(ref: FighterRef): Fighter {
    return this.state.sides[ref.side].fighters[ref.fighter]!;
  }

  beginSideTurn(side: SideIndex): void {
    const s = this.state;
    const own = s.sides[side];
    const last = s.lastActors[side];
    s.turn = {
      side,
      actor: 0,
      lastActor: last,
      acted: [],
      extra: false,
      skillUsed: false,
      deadline: null,
      number: s.turn.number + 1,
    };

    if (own.passiveTurns > 0) own.passiveTurns--;

    const hasBinhLinh = own.fighters.some((f) => isAlive(f) && f.profession === "binhLinh");
    own.food = Math.max(0, own.food - (hasBinhLinh ? R.FOOD_UPKEEP_BINH_LINH : R.FOOD_UPKEEP));
    this.emit({ type: "upkeep", side, food: own.food });

    own.fighters.forEach((f, i) => {
      if (own.food === 0 && isAlive(f)) {
        this.damage({ side, fighter: i }, Math.max(1, Math.round(f.maxHp * R.STARVATION_HP_RATIO)), "starvation");
      }
      const burn = findEffect(f.effects, "burn");
      if (burn && isAlive(f)) this.damage({ side, fighter: i }, burn.value, "burn");
      const regen = findEffect(f.effects, "regen");
      if (regen) this.heal({ side, fighter: i }, regen.value);
    });
    if (s.winner !== null) return;

    const actor = nextActor(own, last, last);
    if (actor === null) {
      // Cả phe bị Đóng băng (1vs1: nhân vật duy nhất mất lượt).
      this.emit({ type: "frozenSkip", side });
      this.endSideTurn();
      return;
    }
    s.turn.actor = actor;
    this.startAction(false);
  }

  beginExtraTurn(): void {
    const s = this.state;
    const actor = nextActor(s.sides[s.turn.side], s.turn.actor, s.turn.lastActor);
    if (actor === null) {
      this.endSideTurn();
      return;
    }
    s.turn.extra = true;
    s.turn.skillUsed = false;
    s.turn.actor = actor;
    this.startAction(true);
  }

  endSideTurn(): void {
    const s = this.state;
    const side = s.turn.side;
    const own = s.sides[side];
    // Tĩnh tâm: chỉ 3vs3, đồng đội không ra tay trong lượt này của phe.
    if (own.fighters.length > 1) {
      own.fighters.forEach((f, i) => {
        if (isAlive(f) && !s.turn.acted.includes(i)) this.gainEnergy({ side, fighter: i }, R.ENERGY_IDLE_ALLY);
      });
    }
    own.fighters.forEach((f, i) => {
      for (const effect of tickDurations(f.effects)) this.emit({ type: "effectEnd", side, fighter: i, effect });
    });
    this.beginSideTurn(otherSide(side));
  }

  private startAction(extra: boolean): void {
    const s = this.state;
    s.turn.deadline = s.timer ? this.now + R.TURN_MS : null;
    this.emit({ type: "turnStart", side: s.turn.side, actor: s.turn.actor, extra });
  }

  useSkill(def: SkillDef, targets: readonly FighterRef[]): void {
    const s = this.state;
    const self: FighterRef = { side: s.turn.side, fighter: s.turn.actor };
    const caster = this.fighter(self);
    caster.energy -= def.cost;
    s.turn.skillUsed = true;
    if (def.cost > 0 && s.timer) s.turn.deadline = this.now + R.TURN_MS;
    this.emit({ type: "skill", side: self.side, fighter: self.fighter, skill: def.id });

    const morale = R.MORALE_DAMAGE[R.moraleOf(s.sides[self.side].food)];
    const spread = def.target === "allEnemies" && isDuel(s) ? 1.5 : 1;

    for (const step of def.steps) {
      const recipients = (to: "targets" | "self") => (to === "self" ? [self] : targets);
      switch (step.type) {
        case "damage":
          for (const t of targets) {
            const target = this.fighter(t);
            if (!isAlive(target)) continue;
            const amount = Math.round(
              step.atk *
                effectiveAtk(caster) *
                morale *
                spread *
                elementMultiplier(caster.element, target.element) *
                R.defenseMultiplier(effectiveDef(s.sides[t.side], target)),
            );
            this.damage(t, amount, "skill", self);
          }
          break;
        case "effect":
          for (const r of recipients(step.to)) {
            const f = this.fighter(r);
            if (!isAlive(f)) continue;
            if (step.effect === "taunt" && isDuel(s)) continue;
            const value = step.ofMaxHp ? Math.round(f.maxHp * step.value) : step.value;
            this.applyEffect(r, { kind: step.effect, value, turns: step.turns });
          }
          break;
        case "heal":
          for (const r of recipients(step.to)) this.heal(r, Math.round(this.fighter(r).maxHp * step.ratio));
          break;
        case "cleanse":
          for (const r of recipients(step.to)) this.strip(r, NEGATIVE_EFFECTS);
          break;
        case "dispel":
          for (const r of targets) this.strip(r, POSITIVE_EFFECTS);
          break;
        case "energy":
          for (const r of targets) this.gainEnergy(r, step.amount);
          break;
        case "enemyFood": {
          const foeIdx = otherSide(self.side);
          const foe = s.sides[foeIdx];
          const before = foe.food;
          foe.food = Math.max(0, Math.min(R.FOOD_MAX, foe.food + step.amount));
          if (foe.food !== before) this.emit({ type: "food", side: foeIdx, amount: foe.food - before });
          break;
        }
        case "mark":
          this.applyMark(self, targets, step.enhanced, step.guaranteed ?? false);
          break;
      }
      if (s.winner !== null) return;
    }
  }

  private applyMark(self: FighterRef, targets: readonly FighterRef[], enhanced: boolean, guaranteed: boolean): void {
    const caster = this.fighter(self);
    const audience = markAudience(caster.element, enhanced);
    const recipients =
      audience === "self"
        ? [self]
        : audience === "team"
          ? aliveIndices(this.state.sides[self.side]).map((fighter) => ({ side: self.side, fighter }))
          : targets.filter((t) => t.side !== self.side);

    for (const r of recipients) {
      const f = this.fighter(r);
      if (!isAlive(f)) continue;
      switch (caster.element) {
        case "hoa":
          this.applyEffect(r, {
            kind: "burn",
            value: Math.max(1, Math.round(caster.atk * MARK.burnAtk)),
            turns: enhanced ? MARK.burnTurnsEnhanced : MARK.burnTurns,
          });
          break;
        case "thuy": {
          const hit = guaranteed || enhanced || this.withBoardRng((rng) => rng.next() < MARK.freezeChance);
          if (hit) this.applyEffect(r, { kind: "freeze", value: 0, turns: 1 });
          break;
        }
        case "moc":
          this.applyEffect(r, {
            kind: "regen",
            value: Math.round(f.maxHp * MARK.regenMaxHp),
            turns: enhanced ? MARK.regenTurnsEnhanced : 1,
          });
          break;
        case "kim":
          this.applyEffect(r, {
            kind: "defDown",
            value: enhanced ? MARK.defDownEnhanced : MARK.defDown,
            turns: enhanced ? MARK.defDownTurnsEnhanced : 1,
          });
          break;
        case "tho":
          this.applyEffect(r, { kind: "shield", value: Math.round(f.maxHp * MARK.shieldMaxHp), turns: null });
          break;
        case "loi":
          if (enhanced) this.applyEffect(r, { kind: "silence", value: 0, turns: 1 });
          else this.gainEnergy(r, -MARK.energyDrain);
          break;
        case "phong":
          if (enhanced) this.strip(r, POSITIVE_EFFECTS);
          else this.applyEffect(r, { kind: "atkDown", value: MARK.atkDown, turns: 1 });
          break;
      }
    }
  }

  private applyEffect(ref: FighterRef, effect: Effect): void {
    if (addEffect(this.fighter(ref).effects, effect)) this.emit({ type: "effect", ...ref, effect: effect.kind });
  }

  private strip(ref: FighterRef, kinds: readonly EffectKind[]): void {
    for (const effect of removeEffects(this.fighter(ref).effects, kinds)) this.emit({ type: "effectEnd", ...ref, effect });
  }

  applyStep(step: CascadeStep, index: number): void {
    const s = this.state;
    const sideIdx = s.turn.side;
    const foeIdx = otherSide(sideIdx);
    const own = s.sides[sideIdx];
    const foe = s.sides[foeIdx];
    const self: FighterRef = { side: sideIdx, fighter: s.turn.actor };
    const actor = this.fighter(self);
    const h = step.harvest;
    const count = (kind: string, grade: string) =>
      step.activations.filter((a) => a.tile.kind === kind && a.tile.special === grade).length;

    // Lương
    const food = h.banhChung * R.FOOD_PER_TILE + count("banhChung", "weak") * R.GIO_BANH_FOOD;
    if (food > 0) {
      const before = own.food;
      own.food = Math.min(R.FOOD_MAX, own.food + food);
      this.emit({ type: "food", side: sideIdx, amount: own.food - before });
    }
    const morale = R.moraleOf(own.food);

    // Năng lượng
    let energy = h.amDuong * R.ENERGY_PER_TILE;
    if (actor.profession === "phapSu") energy *= R.ENERGY_PHAP_SU;
    if (morale === "hungry" || morale === "starving") energy *= R.ENERGY_HUNGRY;
    energy += count("amDuong", "weak") * R.BUA_AM_DUONG_ENERGY;
    if (energy > 0) this.gainEnergy(self, Math.round(energy));

    // Hồi máu; Y sư: hồi vượt máu tối đa thành Khiên tạm thời.
    if (h.tim > 0) {
      const ySu = actor.profession === "ySu";
      const amount = Math.round(actor.maxHp * R.HEAL_PER_TILE_RATIO * h.tim * (ySu ? R.HEAL_Y_SU : 1));
      const overflow = amount - (actor.maxHp - actor.hp);
      this.heal(self, amount);
      if (ySu && overflow > 0) this.applyEffect(self, { kind: "shield", value: overflow, turns: R.Y_SU_SHIELD_TURNS });
    }
    for (let k = 0; k < count("tim", "weak"); k++) {
      const alive = aliveIndices(own);
      const lowest = alive.reduce((a, b) => (hpRatio(own.fighters[b]!) < hpRatio(own.fighters[a]!) ? b : a));
      this.heal({ side: sideIdx, fighter: lowest }, Math.round(own.fighters[lowest]!.maxHp * R.HEAL_TIM_BAC_RATIO));
    }
    for (let k = 0; k < count("tim", "strong"); k++) {
      for (const i of aliveIndices(own)) {
        this.heal({ side: sideIdx, fighter: i }, Math.round(own.fighters[i]!.maxHp * R.HEAL_TIM_VANG_RATIO));
      }
    }

    // Nộ; Trống đồng thêm Công+ cho cả đội.
    const rage =
      h.trong * R.RAGE_PER_DRUM + count("trong", "weak") * R.TRONG_DA_RAGE + count("trong", "strong") * R.TRONG_DONG_RAGE;
    if (rage > 0) this.addRage(sideIdx, rage);
    if (count("trong", "strong") > 0) {
      for (const i of aliveIndices(own)) {
        this.applyEffect({ side: sideIdx, fighter: i }, {
          kind: "atkUp",
          value: R.TRONG_DONG_ATK,
          turns: R.TRONG_DONG_TURNS,
        });
      }
    }

    // Đánh thường bằng kiếm
    const weak = count("kiem", "weak");
    const strong = count("kiem", "strong");
    const units = h.kiem - weak - strong + R.SWORD_WEAK * weak + R.SWORD_STRONG * strong;
    const target = singleTarget(s, s.turn.actor);
    if (units > 0 && target !== null) {
      const t = foe.fighters[target]!;
      const bigSword = step.matches.some((m) => m.kind === "kiem" && m.cells.length >= 4);
      const prof = actor.profession === "tuongSi" && bigSword ? R.TUONG_SI_BONUS : 1;
      const amount = Math.round(
        effectiveAtk(actor) *
          units *
          R.MORALE_DAMAGE[morale] *
          elementMultiplier(actor.element, t.element) *
          R.cascadeMultiplier(index) *
          prof *
          R.defenseMultiplier(effectiveDef(foe, t)),
      );
      this.damage({ side: foeIdx, fighter: target }, amount, "sword", self);
      if (s.winner !== null) return;
    }

    // Nội tại nghề nhắm vào đối thủ
    const victim = singleTarget(s, s.turn.actor);
    if (victim !== null) {
      const ref = { side: foeIdx, fighter: victim };
      if (actor.profession === "muuSi" && h.vang > 0) this.gainEnergy(ref, -h.vang * R.MUU_SI_DRAIN_PER_TILE);
      if (actor.profession === "quanSu" && h.sach > 0) {
        const effects = foe.fighters[victim]!.effects;
        const current = findEffect(effects, "atkDown")?.value ?? 0;
        const value = Math.min(R.QUAN_SU_MAX, current + h.sach * R.QUAN_SU_PER_TILE);
        removeEffects(effects, ["atkDown"]);
        this.applyEffect(ref, { kind: "atkDown", value, turns: R.QUAN_SU_TURNS });
      }
    }

    own.gold += h.vang;
    own.books += h.sach;
  }

  private gainEnergy(ref: FighterRef, amount: number): void {
    const f = this.fighter(ref);
    const before = f.energy;
    f.energy = Math.min(R.ENERGY_MAX, Math.max(0, f.energy + amount));
    if (f.energy !== before) this.emit({ type: "energy", ...ref, amount: f.energy - before });
  }

  private heal(ref: FighterRef, amount: number): void {
    const f = this.fighter(ref);
    if (!isAlive(f)) return;
    const before = f.hp;
    f.hp = Math.min(f.maxHp, f.hp + amount);
    if (f.hp !== before) this.emit({ type: "heal", ...ref, amount: f.hp - before });
  }

  private addRage(side: SideIndex, amount: number): void {
    const own = this.state.sides[side];
    if (!isAlive(own.fighters[own.leader]!) || own.passiveTurns > 0) return;
    own.rage = Math.min(R.RAGE_MAX, own.rage + amount);
    this.emit({ type: "rage", side, amount });
    if (own.rage >= R.RAGE_MAX) {
      own.rage = 0;
      // +1 vì lượt đang diễn ra không tính; bị động có hiệu lực 3 lượt tiếp theo của phe.
      own.passiveTurns = R.PASSIVE_TURNS + 1;
      this.emit({ type: "passive", side });
    }
  }

  /** Khiên hấp thụ trước; Phản đòn trả lại một phần cho kẻ tấn công (không phản tiếp). */
  private damage(ref: FighterRef, amount: number, source: DamageSource, attacker?: FighterRef): void {
    const s = this.state;
    const own = s.sides[ref.side];
    const f = this.fighter(ref);
    if (!isAlive(f) || amount <= 0) return;

    let absorbed = 0;
    const shield = findEffect(f.effects, "shield");
    if (shield) {
      absorbed = Math.min(shield.value, amount);
      shield.value -= absorbed;
      if (shield.value <= 0) this.strip(ref, ["shield"]);
    }
    const lost = Math.min(f.hp, amount - absorbed);
    f.hp -= lost;
    this.emit({ type: "damage", ...ref, amount: lost, absorbed, source });

    if (ref.fighter === own.leader && isAlive(f) && lost > 0) {
      this.addRage(ref.side, (lost / f.maxHp) * R.RAGE_PER_HP_RATIO);
    }
    if (!isAlive(f)) {
      this.emit({ type: "ko", ...ref });
      if (aliveIndices(own).length === 0) {
        s.winner = otherSide(ref.side);
        s.turn.deadline = null;
        this.emit({ type: "end", winner: s.winner });
        return;
      }
    }

    const reflect = findEffect(f.effects, "reflect");
    if (reflect && attacker && source !== "reflect") {
      this.damage(attacker, Math.round(amount * reflect.value), "reflect");
    }
  }
}
