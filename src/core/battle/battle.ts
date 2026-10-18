// Luồng trận đấu: lượt, người hành động, áp kết quả bàn cờ lên hai phe.
// Xem docs/design/02-tran-dau.md và docs/design/03-tai-nguyen-cong-thuc.md.
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
import { createRng } from "../rng";
import { elementMultiplier } from "./elements";
import * as R from "./rules";
import { isAlive, otherSide, type BattleState, type Fighter, type Side, type SideConfig, type SideIndex } from "./state";

export type BattleEvent =
  | { readonly type: "turnStart"; readonly side: SideIndex; readonly actor: number; readonly extra: boolean }
  | { readonly type: "upkeep"; readonly side: SideIndex; readonly food: number }
  | { readonly type: "swap"; readonly from: Pos; readonly to: Pos; readonly steps: readonly CascadeStep[] }
  | { readonly type: "shuffle" }
  | {
      readonly type: "damage";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly amount: number;
      readonly source: "sword" | "starvation";
    }
  | { readonly type: "heal"; readonly side: SideIndex; readonly fighter: number; readonly amount: number }
  | { readonly type: "energy"; readonly side: SideIndex; readonly fighter: number; readonly amount: number }
  | { readonly type: "food"; readonly side: SideIndex; readonly amount: number }
  | { readonly type: "rage"; readonly side: SideIndex; readonly amount: number }
  | { readonly type: "passive"; readonly side: SideIndex }
  | { readonly type: "ko"; readonly side: SideIndex; readonly fighter: number }
  | { readonly type: "timeout"; readonly side: SideIndex }
  | { readonly type: "end"; readonly winner: SideIndex };

export type BattleAction =
  | { readonly type: "selectActor"; readonly fighter: number }
  | { readonly type: "swap"; readonly from: Pos; readonly to: Pos }
  | { readonly type: "timeout" };

export type BattleError = "battleOver" | "invalidActor" | "invalidMove" | "tooLate" | "tooEarly" | "noTimer";

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
    return {
      fighters: s.fighters.map((f) => ({ ...f, hp: f.maxHp, energy: 0 })),
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
    turn: { side: first, actor: 0, lastActor: null, acted: [], extra: false, deadline: null, number: 0 },
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

  switch (action.type) {
    case "selectActor": {
      if (!selectableActors(state).includes(action.fighter)) return { ok: false, error: "invalidActor" };
      turn.actor = action.fighter;
      return { ok: true, state, events: [] };
    }
    case "swap": {
      if (turn.deadline !== null && now > turn.deadline + R.GRACE_MS) return { ok: false, error: "tooLate" };
      const rng = createRng(state.boardRng);
      const outcome = swap(state.board, action.from, action.to, rng, state.weights);
      if (!outcome.valid) return { ok: false, error: "invalidMove" };
      state.board = outcome.board;
      state.boardRng = rng.state();
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
  const alive = aliveIndices(state.sides[side]);
  if (alive.length <= 1) return alive;
  return alive.filter((i) => i !== lastActor);
}

function aliveIndices(side: Side): number[] {
  return side.fighters.flatMap((f, i) => (isAlive(f) ? [i] : []));
}

/** Người kế tiếp sau `after` theo thứ tự vị trí, bỏ qua người đã gục và người vừa ra tay. */
function nextActor(side: Side, after: number | null, lastActor: number | null): number {
  const n = side.fighters.length;
  const alive = aliveIndices(side);
  const start = after === null ? 0 : after + 1;
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n;
    if (alive.includes(i) && (alive.length <= 1 || i !== lastActor)) return i;
  }
  return alive[0] ?? 0;
}

/** Đối thủ đối diện; đã gục thì đối thủ còn sống gần nhất (hòa thì vị trí nhỏ hơn). */
export function pickTarget(foe: Side, position: number): number | null {
  const alive = aliveIndices(foe);
  if (alive.length === 0) return null;
  return alive.reduce((best, i) => (Math.abs(i - position) < Math.abs(best - position) ? i : best));
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

  beginSideTurn(side: SideIndex): void {
    const s = this.state;
    const own = s.sides[side];
    const last = s.lastActors[side];
    s.turn = { side, actor: 0, lastActor: last, acted: [], extra: false, deadline: null, number: s.turn.number + 1 };

    if (own.passiveTurns > 0) own.passiveTurns--;

    const hasBinhLinh = own.fighters.some((f) => isAlive(f) && f.profession === "binhLinh");
    own.food = Math.max(0, own.food - (hasBinhLinh ? R.FOOD_UPKEEP_BINH_LINH : R.FOOD_UPKEEP));
    this.emit({ type: "upkeep", side, food: own.food });

    if (own.food === 0) {
      own.fighters.forEach((f, i) => {
        if (isAlive(f)) this.damage(side, i, Math.max(1, Math.round(f.maxHp * R.STARVATION_HP_RATIO)), "starvation");
      });
      if (s.winner !== null) return;
    }

    s.turn.actor = nextActor(own, last, last);
    this.startAction(false);
  }

  beginExtraTurn(): void {
    const s = this.state;
    s.turn.extra = true;
    s.turn.actor = nextActor(s.sides[s.turn.side], s.turn.actor, s.turn.lastActor);
    this.startAction(true);
  }

  endSideTurn(): void {
    const s = this.state;
    const side = s.turn.side;
    const own = s.sides[side];
    // Tĩnh tâm: chỉ 3vs3, đồng đội không ra tay trong lượt này của phe.
    if (own.fighters.length > 1) {
      own.fighters.forEach((f, i) => {
        if (isAlive(f) && !s.turn.acted.includes(i)) this.gainEnergy(side, i, R.ENERGY_IDLE_ALLY);
      });
    }
    this.beginSideTurn(otherSide(side));
  }

  private startAction(extra: boolean): void {
    const s = this.state;
    s.turn.deadline = s.timer ? this.now + R.TURN_MS : null;
    this.emit({ type: "turnStart", side: s.turn.side, actor: s.turn.actor, extra });
  }

  applyStep(step: CascadeStep, index: number): void {
    const s = this.state;
    const sideIdx = s.turn.side;
    const foeIdx = otherSide(sideIdx);
    const own = s.sides[sideIdx];
    const foe = s.sides[foeIdx];
    const actor = own.fighters[s.turn.actor]!;
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
    if (energy > 0) this.gainEnergy(sideIdx, s.turn.actor, Math.round(energy));

    // Hồi máu
    if (h.tim > 0) {
      const ratio = R.HEAL_PER_TILE_RATIO * h.tim * (actor.profession === "ySu" ? R.HEAL_Y_SU : 1);
      this.heal(sideIdx, s.turn.actor, Math.round(actor.maxHp * ratio));
    }
    for (let k = 0; k < count("tim", "weak"); k++) {
      const alive = aliveIndices(own);
      const lowest = alive.reduce((a, b) => (hpRatio(own.fighters[b]!) < hpRatio(own.fighters[a]!) ? b : a));
      this.heal(sideIdx, lowest, Math.round(own.fighters[lowest]!.maxHp * R.HEAL_TIM_BAC_RATIO));
    }
    for (let k = 0; k < count("tim", "strong"); k++) {
      for (const i of aliveIndices(own)) {
        this.heal(sideIdx, i, Math.round(own.fighters[i]!.maxHp * R.HEAL_TIM_VANG_RATIO));
      }
    }

    // Nộ
    const rage =
      h.trong * R.RAGE_PER_DRUM + count("trong", "weak") * R.TRONG_DA_RAGE + count("trong", "strong") * R.TRONG_DONG_RAGE;
    if (rage > 0) this.addRage(sideIdx, rage);

    // Đánh thường bằng kiếm
    const weak = count("kiem", "weak");
    const strong = count("kiem", "strong");
    const units = h.kiem - weak - strong + R.SWORD_WEAK * weak + R.SWORD_STRONG * strong;
    const target = pickTarget(foe, s.turn.actor);
    if (units > 0 && target !== null) {
      const t = foe.fighters[target]!;
      const bigSword = step.matches.some((m) => m.kind === "kiem" && m.cells.length >= 4);
      const prof = actor.profession === "tuongSi" && bigSword ? R.TUONG_SI_BONUS : 1;
      const amount = Math.round(
        actor.atk *
          units *
          R.MORALE_DAMAGE[morale] *
          elementMultiplier(actor.element, t.element) *
          R.cascadeMultiplier(index) *
          prof *
          R.defenseMultiplier(effectiveDef(foe, t)),
      );
      this.damage(foeIdx, target, amount, "sword");
    }

    // Mưu sĩ: ghép vàng trừ năng lượng đối thủ
    const drainTarget = pickTarget(foe, s.turn.actor);
    if (actor.profession === "muuSi" && h.vang > 0 && drainTarget !== null) {
      this.gainEnergy(foeIdx, drainTarget, -h.vang * R.MUU_SI_DRAIN_PER_TILE);
    }

    own.gold += h.vang;
    own.books += h.sach;
  }

  private gainEnergy(side: SideIndex, i: number, amount: number): void {
    const f = this.state.sides[side].fighters[i]!;
    const before = f.energy;
    f.energy = Math.min(R.ENERGY_MAX, Math.max(0, f.energy + amount));
    if (f.energy !== before) this.emit({ type: "energy", side, fighter: i, amount: f.energy - before });
  }

  private heal(side: SideIndex, i: number, amount: number): void {
    const f = this.state.sides[side].fighters[i]!;
    if (!isAlive(f)) return;
    const before = f.hp;
    f.hp = Math.min(f.maxHp, f.hp + amount);
    if (f.hp !== before) this.emit({ type: "heal", side, fighter: i, amount: f.hp - before });
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

  private damage(side: SideIndex, i: number, amount: number, source: "sword" | "starvation"): void {
    const s = this.state;
    const own = s.sides[side];
    const f = own.fighters[i]!;
    if (!isAlive(f) || amount <= 0) return;
    const lost = Math.min(f.hp, amount);
    f.hp -= lost;
    this.emit({ type: "damage", side, fighter: i, amount: lost, source });
    if (i === own.leader) {
      if (isAlive(f)) this.addRage(side, (lost / f.maxHp) * R.RAGE_PER_HP_RATIO);
    }
    if (!isAlive(f)) {
      this.emit({ type: "ko", side, fighter: i });
      if (aliveIndices(own).length === 0) {
        s.winner = otherSide(side);
        s.turn.deadline = null;
        this.emit({ type: "end", winner: s.winner });
      }
    }
  }
}

function hpRatio(f: Fighter): number {
  return f.hp / f.maxHp;
}

/** Binh lính: +5% DEF mỗi bậc sĩ khí trên mức bình thường. */
function effectiveDef(side: Side, f: Fighter): number {
  const tiers = R.moraleOf(side.food) === "eager" ? 1 : 0;
  const bonus = f.profession === "binhLinh" ? 1 + R.BINH_LINH_DEF_PER_TIER * tiers : 1;
  return f.def * bonus;
}
