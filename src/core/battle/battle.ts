// Luồng trận đấu: lượt, người hành động, kỹ năng, áp kết quả bàn cờ lên hai phe.
// Xem docs/design/02-tran-dau.md, 03-tai-nguyen-cong-thuc.md, 04-hieu-ung.md, 06-nhan-vat-ky-nang.md.
// Hàm thuần: nhận trạng thái cũ, trả trạng thái mới; thời gian do bên gọi truyền vào.

import {
  STANDARD_WEIGHTS,
  areaCells,
  destroyCells,
  generateBoard,
  inBounds,
  indexOf,
  autoWhirl,
  isValidWhirl,
  randomCells,
  swap,
  transformCells,
  validateWeights,
  whirlBoard,
  whirlCells,
  type Board,
  type CascadeStep,
  type MoveResult,
  type Pos,
  type SpawnWeights,
  type Whirl,
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
import {
  MARK,
  PASSIVE,
  fighterSkill,
  getSkill,
  markAudience,
  needsCell,
  whirlStep,
  type SkillDef,
  type StepRecipient,
} from "./skills";
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

export type DamageSource =
  | "sword"
  | "skill"
  | "burn"
  | "reflect"
  | "starvation";

export interface FighterRef {
  readonly side: SideIndex;
  readonly fighter: number;
}

export type BattleEvent =
  | {
      readonly type: "turnStart";
      readonly side: SideIndex;
      readonly actor: number;
      readonly extra: boolean;
    }
  | { readonly type: "upkeep"; readonly side: SideIndex; readonly food: number }
  | {
      readonly type: "spirit";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly spirit: number;
    }
  | { readonly type: "frozenSkip"; readonly side: SideIndex }
  | {
      readonly type: "swap";
      readonly from: Pos;
      readonly to: Pos;
      readonly steps: readonly CascadeStep[];
    }
  | {
      readonly type: "skill";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly skill: string;
    }
  /** Lốc xoáy (kỹ năng hoặc lần xoay miễn phí của bị động Phong). */
  | {
      readonly type: "whirl";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly whirl: Whirl;
      readonly free: boolean;
    }
  /**
   * Bàn cờ đổi do kỹ năng: phá, biến hoặc xoay ô, kèm cascade.
   * before: bàn ngay trước bước xóa đầu tiên (sau khi xoay hoặc biến ô), để giao diện dựng hoạt ảnh.
   */
  | {
      readonly type: "board";
      readonly steps: readonly CascadeStep[];
      readonly transformed: readonly Pos[];
      readonly before: Board;
    }
  /** Bàn hết nước đi và được xáo lại; board là bàn sau khi xáo. */
  | { readonly type: "shuffle"; readonly board: Board }
  | {
      readonly type: "damage";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly amount: number;
      /** Phần bị Khiên hấp thụ, không trừ máu. */
      readonly absorbed: number;
      readonly source: DamageSource;
    }
  | {
      readonly type: "heal";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly amount: number;
    }
  | {
      readonly type: "energy";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly amount: number;
    }
  | { readonly type: "food"; readonly side: SideIndex; readonly amount: number }
  | { readonly type: "rage"; readonly side: SideIndex; readonly amount: number }
  | { readonly type: "passive"; readonly side: SideIndex }
  | {
      readonly type: "effect";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly effect: EffectKind;
    }
  | {
      readonly type: "effectEnd";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly effect: EffectKind;
    }
  | { readonly type: "ko"; readonly side: SideIndex; readonly fighter: number }
  /** Sinh tồn: đợt đối thủ mới vào sân. */
  | { readonly type: "wave"; readonly wave: number }
  /** Sinh tồn: người đã gục đứng dậy giữa hai đợt. */
  | {
      readonly type: "revive";
      readonly side: SideIndex;
      readonly fighter: number;
      readonly hp: number;
    }
  /** Chỉ phát khi audit:true; tách mất do Tinh thần, hồi dư và không cộng dồn. */
  | { readonly type: "sustain"; readonly side: SideIndex; readonly fighter: number; readonly kind: "heal" | "shield";
      readonly raw: number; readonly spiritLost: number; readonly effective: number; readonly overflow: number; readonly nonStackLost: number; readonly converted: number }
  | { readonly type: "auditTurn"; readonly side: SideIndex; readonly number: number; readonly living: readonly number[]; readonly food: number }
  | { readonly type: "timeout"; readonly side: SideIndex }
  | { readonly type: "end"; readonly winner: SideIndex };

export type BattleAction =
  | { readonly type: "selectActor"; readonly fighter: number }
  | {
      readonly type: "skill";
      readonly skill: string;
      readonly target?: number;
      /** Ô người chơi chạm, cho kỹ năng phá vùng. */
      readonly cell?: Pos;
      /** Tâm và số nấc, cho kỹ năng lốc xoáy (hệ Phong). */
      readonly whirl?: Whirl;
    }
  /** Xoay lốc xoáy miễn phí khi bị động Phong đang có hiệu lực, làm trước kỹ năng và đổi ô. */
  | { readonly type: "whirl"; readonly whirl: Whirl }
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
  | "noTimer"
  | "noFreeWhirl";

export type ActResult =
  | {
      readonly ok: true;
      readonly state: BattleState;
      readonly events: readonly BattleEvent[];
    }
  | { readonly ok: false; readonly error: BattleError };

export interface BattleConfig {
  readonly experimentalSpirit?: R.SpiritExperiment;
  readonly audit?: boolean;
  readonly sides: readonly [SideConfig, SideConfig];
  readonly seed: number;
  readonly weights?: SpawnWeights;
  /** Tắt được ở chế độ Luyện tập và trang /demo. */
  readonly timer?: boolean;
  readonly firstSide?: SideIndex;
  readonly now?: number;
}

const AI_SEED_SALT = 0x9e3779b9;

function buildSide(s: SideConfig, solo: boolean): Side {
  if (s.fighters.length === 0)
    throw new RangeError("Mỗi phe cần ít nhất một nhân vật");
  if (s.leader < 0 || s.leader >= s.fighters.length)
    throw new RangeError("Thủ lĩnh không hợp lệ");
  if (s.hpRatio && !(s.hpRatio[s.leader]! > 0))
    throw new RangeError("Thủ lĩnh phải còn máu");
  for (const f of s.fighters) {
    for (const id of f.skills ?? [])
      if (!getSkill(id)) throw new RangeError(`Kỹ năng không tồn tại: ${id}`);
  }
  return {
    fighters: s.fighters.map((f, i) => {
      const maxHp = solo ? Math.round(f.maxHp * R.SOLO_HP_MULTIPLIER) : f.maxHp;
      const ratio = Math.max(0, Math.min(1, s.hpRatio?.[i] ?? 1));
      // Còn chút máu thì không làm tròn thành 0 (đã ngã).
      const hp = ratio > 0 ? Math.max(1, Math.round(maxHp * ratio)) : 0;
      return {
        ...f,
        maxHp,
        hp,
        energy: 0,
        spirit: R.SPIRIT_MAX,
        effects: [],
      };
    }),
    leader: s.leader,
    food: s.food ?? R.FOOD_START,
    rage: 0,
    passiveTurns: 0,
    freeWhirls: 0,
    gold: 0,
    books: 0,
  };
}

export function createBattle(config: BattleConfig): {
  state: BattleState;
  events: BattleEvent[];
} {
  const weights = config.weights ?? STANDARD_WEIGHTS;
  validateWeights(weights);
  const rng = createRng(config.seed);
  const board = generateBoard(rng, weights);
  const solo = config.sides.every((s) => s.fighters.length === 1);
  const sides = config.sides.map((s) => buildSide(s, solo)) as [Side, Side];
  const first = config.firstSide ?? 0;
  const state: BattleState = {
    sides,
    ...(config.experimentalSpirit ? { experimentalSpirit: config.experimentalSpirit } : {}),
    ...(config.audit ? { audit: true } : {}),
    board,
    boardRng: rng.state(),
    aiRng: (config.seed ^ AI_SEED_SALT) >>> 0,
    weights,
    timer: config.timer ?? true,
    turn: {
      side: first,
      actor: 0,
      lastActor: null,
      acted: [],
      extra: false,
      skillUsed: false,
      whirlUsed: false,
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

export interface WaveConfig {
  /** Số thứ tự đợt mới. */
  readonly wave: number;
  /** Đội đối thủ của đợt, thay toàn bộ phe 1. */
  readonly foes: SideConfig;
  /** Người còn sống của phe 0 hồi thêm chừng này phần máu tối đa. */
  readonly heal: number;
  /** Lương phe 0 khi vào đợt (đã cộng hồi phục và trừ phí hồi sinh). */
  readonly food: number;
  /** Vị trí phe 0 đứng dậy, với `reviveHp` phần máu tối đa và 0 năng lượng. */
  readonly revive: readonly number[];
  readonly reviveHp: number;
}

/**
 * Sinh tồn: phe 0 vừa thắng một đợt thì đợt kế vào sân trên cùng bàn cờ. Phe 0 giữ năng lượng và Nộ, hồi máu
 * cố định, xóa hiệu ứng, tinh thần và đếm lượt bắt đầu lại; phe 0 đi trước.
 */
export function beginWave(
  prev: BattleState,
  config: WaveConfig,
  now = 0,
): { state: BattleState; events: BattleEvent[] } {
  if (prev.winner !== 0)
    throw new RangeError("Chỉ sang đợt mới khi phe 0 vừa thắng");
  const state = structuredClone(prev);
  const ctx = new Ctx(state, now);
  const own = state.sides[0];
  ctx.emit({ type: "wave", wave: config.wave });
  own.fighters.forEach((f, i) => {
    f.effects = [];
    f.spirit = R.SPIRIT_MAX;
    if (isAlive(f)) {
      f.hp = Math.min(f.maxHp, f.hp + Math.round(f.maxHp * config.heal));
    } else if (config.revive.includes(i)) {
      f.hp = Math.max(1, Math.round(f.maxHp * config.reviveHp));
      f.energy = 0;
      ctx.emit({ type: "revive", side: 0, fighter: i, hp: f.hp });
    }
  });
  own.food = Math.max(0, Math.min(R.FOOD_MAX, config.food));
  own.passiveTurns = 0;
  own.freeWhirls = 0;
  state.sides[1] = buildSide(config.foes, false);
  state.lastActors = [state.lastActors[0], null];
  state.turn = { ...state.turn, number: 0 };
  state.winner = null;
  ctx.beginSideTurn(0);
  return { state, events: ctx.events };
}

export function act(
  prev: BattleState,
  action: BattleAction,
  now = 0,
): ActResult {
  if (prev.winner !== null) return { ok: false, error: "battleOver" };
  const state = structuredClone(prev);
  const ctx = new Ctx(state, now);
  const turn = state.turn;
  const late = turn.deadline !== null && now > turn.deadline + R.GRACE_MS;

  switch (action.type) {
    case "selectActor": {
      if (!selectableActors(state).includes(action.fighter))
        return { ok: false, error: "invalidActor" };
      if (turn.skillUsed) return { ok: false, error: "skillUsed" };
      turn.actor = action.fighter;
      return { ok: true, state, events: [] };
    }
    case "skill": {
      if (late) return { ok: false, error: "tooLate" };
      const actor = state.sides[turn.side].fighters[turn.actor]!;
      const def = fighterSkill(actor, action.skill);
      if (!def) return { ok: false, error: "invalidSkill" };
      if (turn.skillUsed) return { ok: false, error: "skillUsed" };
      if (hasEffect(actor.effects, "silence"))
        return { ok: false, error: "silenced" };
      if (actor.energy < def.cost)
        return { ok: false, error: "notEnoughEnergy" };
      const targets = skillTargets(state, def, action.target);
      if (!targets) return { ok: false, error: "invalidTarget" };
      if (
        needsCell(def) &&
        !(action.cell && inBounds(state.board, action.cell))
      ) {
        return { ok: false, error: "invalidTarget" };
      }
      const whirl = whirlStep(def);
      if (whirl && !(action.whirl && isValidWhirl(state.board, action.whirl, whirl.turns)))
        return { ok: false, error: "invalidTarget" };
      ctx.useSkill(def, targets, action.cell, action.whirl);
      return { ok: true, state, events: ctx.events };
    }
    case "whirl": {
      if (late) return { ok: false, error: "tooLate" };
      if (!canFreeWhirl(state)) return { ok: false, error: "noFreeWhirl" };
      if (!isValidWhirl(state.board, action.whirl, PASSIVE.phongFreeWhirlTurns))
        return { ok: false, error: "invalidTarget" };
      ctx.freeWhirl(action.whirl);
      return { ok: true, state, events: ctx.events };
    }
    case "swap": {
      if (late) return { ok: false, error: "tooLate" };
      const outcome = ctx.withBoardRng((rng) =>
        swap(state.board, action.from, action.to, rng, state.weights),
      );
      if (!outcome.valid) return { ok: false, error: "invalidMove" };
      state.board = outcome.board;
      ctx.emit({
        type: "swap",
        from: action.from,
        to: action.to,
        steps: outcome.steps,
      });
      outcome.steps.forEach((step, i) => {
        if (state.winner === null) ctx.applyStep(step, i);
      });
      if (outcome.shuffled) ctx.emit({ type: "shuffle", board: outcome.board });
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

/** Phe đang đánh còn lần xoay miễn phí của bị động Phong (trước kỹ năng và đổi ô). */
export function canFreeWhirl(state: BattleState): boolean {
  const own = state.sides[state.turn.side];
  return (
    state.winner === null &&
    !state.turn.skillUsed &&
    !state.turn.whirlUsed &&
    own.freeWhirls > 0 &&
    passiveOn(own, own.fighters[own.leader]!, "phong")
  );
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
export function nextActor(
  side: Side,
  after: number | null,
  lastActor: number | null,
): number | null {
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
  return (
    state.sides[0].fighters.length === 1 && state.sides[1].fighters.length === 1
  );
}

/** Người đang Khiêu khích của phe: còn sống, không bị Đóng băng. Chỉ có ở 3vs3. */
function taunter(state: BattleState, side: Side): number | null {
  if (isDuel(state)) return null;
  const i = side.fighters.findIndex(
    (f) => canAct(f) && hasEffect(f.effects, "taunt"),
  );
  return i < 0 ? null : i;
}

/** Đối thủ đối diện; đã gục thì đối thủ còn sống gần nhất (hòa thì vị trí nhỏ hơn). Không xét Khiêu khích. */
export function pickTarget(foe: Side, position: number): number | null {
  const alive = aliveIndices(foe);
  if (alive.length === 0) return null;
  return alive.reduce((best, i) =>
    Math.abs(i - position) < Math.abs(best - position) ? i : best,
  );
}

/** Mục tiêu đơn của phe đang đánh: Khiêu khích ghi đè, rồi tới đối diện/gần nhất. */
function singleTarget(state: BattleState, position: number): number | null {
  const foe = state.sides[otherSide(state.turn.side)];
  return taunter(state, foe) ?? pickTarget(foe, position);
}

function skillTargets(
  state: BattleState,
  def: SkillDef,
  chosen: number | undefined,
): FighterRef[] | null {
  const own = state.turn.side;
  const foeIdx = otherSide(own);
  const foe = state.sides[foeIdx];
  const refs = (side: SideIndex, list: number[]) =>
    list.map((fighter) => ({ side, fighter }));
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
      if (i === null || !foe.fighters[i] || !isAlive(foe.fighters[i]))
        return null;
      if (forced !== null && i !== forced) return null;
      return [{ side: foeIdx, fighter: i }];
    }
  }
}

function hpRatio(f: Fighter): number {
  return f.hp / f.maxHp;
}

/** Bị động của thủ lĩnh `f` đang có hiệu lực, đúng nguyên tố. */
export function passiveOn(
  side: Side,
  f: Fighter,
  element: Fighter["element"],
): boolean {
  return (
    side.passiveTurns > 0 &&
    side.fighters[side.leader] === f &&
    f.element === element &&
    isAlive(f)
  );
}

/** Gộp hai tỉ lệ xuyên giáp: phần DEF còn lại nhân với nhau. */
function combinePierce(a: number, b: number): number {
  return 1 - (1 - a) * (1 - b);
}

export function effectiveAtk(f: Fighter, experiment?: R.SpiritExperiment): number {
  return (
    f.atk *
    statModifier(f.effects, "atkUp", "atkDown") *
    R.spiritStatMultiplier(f.spirit, experiment)
  );
}

/** DEF sau hiệu ứng; Binh lính +5% mỗi bậc sĩ khí trên mức bình thường. */
export function effectiveDef(side: Side, f: Fighter, experiment?: R.SpiritExperiment): number {
  const tiers = R.moraleOf(side.food) === "eager" ? 1 : 0;
  const bonus =
    f.profession === "binhLinh" ? R.BINH_LINH_DEF_PER_TIER * tiers : 0;
  const passive = passiveOn(side, f, "hoa") ? PASSIVE.hoaDefDown : 0;
  return Math.max(
    0,
    f.def *
      (statModifier(f.effects, "defUp", "defDown") + bonus - passive) *
      R.spiritStatMultiplier(f.spirit, experiment),
  );
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
      whirlUsed: false,
      deadline: null,
      number: s.turn.number + 1,
    };

    if (own.passiveTurns > 0) own.passiveTurns--;

    const hasBinhLinh = own.fighters.some(
      (f) => isAlive(f) && f.profession === "binhLinh",
    );
    own.food = Math.max(
      0,
      own.food - (hasBinhLinh ? R.FOOD_UPKEEP_BINH_LINH : R.FOOD_UPKEEP),
    );
    this.emit({ type: "upkeep", side, food: own.food });

    if (Math.ceil(s.turn.number / 2) >= R.SPIRIT_DECAY_START_TURN) {
      own.fighters.forEach((f, i) => {
        if (!isAlive(f) || f.spirit === 0) return;
        const next = Math.max(0, f.spirit - R.SPIRIT_EXPERIMENTS[s.experimentalSpirit ?? "A"].decay);
        if (next === f.spirit) return;
        f.spirit = next;
        this.emit({ type: "spirit", side, fighter: i, spirit: f.spirit });
      });
    }

    if (s.audit) this.emit({ type: "auditTurn", side, number: s.turn.number, living: aliveIndices(own), food: own.food });
    own.fighters.forEach((f, i) => {
      if (own.food === 0 && isAlive(f)) {
        this.damage(
          { side, fighter: i },
          Math.max(1, Math.round(f.maxHp * R.STARVATION_HP_RATIO)),
          "starvation",
        );
      }
      const burn = findEffect(f.effects, "burn");
      if (burn && isAlive(f))
        this.damage({ side, fighter: i }, burn.value, "burn");
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
    const actor = nextActor(
      s.sides[s.turn.side],
      s.turn.actor,
      s.turn.lastActor,
    );
    if (actor === null) {
      this.endSideTurn();
      return;
    }
    s.turn.extra = true;
    s.turn.skillUsed = false;
    s.turn.whirlUsed = false;
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
        if (isAlive(f) && !s.turn.acted.includes(i))
          this.gainEnergy({ side, fighter: i }, R.ENERGY_IDLE_ALLY);
      });
    }
    own.fighters.forEach((f, i) => {
      for (const effect of tickDurations(f.effects))
        this.emit({ type: "effectEnd", side, fighter: i, effect });
    });
    this.beginSideTurn(otherSide(side));
  }

  private startAction(extra: boolean): void {
    const s = this.state;
    s.turn.deadline = s.timer ? this.now + R.TURN_MS : null;
    this.emit({
      type: "turnStart",
      side: s.turn.side,
      actor: s.turn.actor,
      extra,
    });
  }

  freeWhirl(whirl: Whirl): void {
    const s = this.state;
    s.turn.whirlUsed = true;
    s.sides[s.turn.side].freeWhirls--;
    this.applyWhirl(whirl, true);
  }

  private applyWhirl(whirl: Whirl, free: boolean): void {
    const s = this.state;
    this.emit({
      type: "whirl",
      side: s.turn.side,
      fighter: s.turn.actor,
      whirl,
      free,
    });
    const before = whirlCells(s.board, whirl);
    this.applyBoardChange(
      this.withBoardRng((rng) => whirlBoard(s.board, whirl, rng, s.weights)),
      [],
      before,
    );
  }

  useSkill(
    def: SkillDef,
    targets: readonly FighterRef[],
    cell?: Pos,
    whirl?: Whirl,
  ): void {
    const s = this.state;
    const self: FighterRef = { side: s.turn.side, fighter: s.turn.actor };
    const caster = this.fighter(self);
    caster.energy -= def.cost;
    s.turn.skillUsed = true;
    if (def.cost > 0 && s.timer) s.turn.deadline = this.now + R.TURN_MS;
    this.emit({
      type: "skill",
      side: self.side,
      fighter: self.fighter,
      skill: def.id,
    });

    const ownSide = s.sides[self.side];
    const morale = R.MORALE_DAMAGE[R.moraleOf(ownSide.food)];
    const spread = def.target === "allEnemies" && isDuel(s) ? 1.5 : 1;
    const kim = passiveOn(ownSide, caster, "kim");
    const hoa = passiveOn(ownSide, caster, "hoa") ? 1 + PASSIVE.hoaDamage : 1;
    const thuy = passiveOn(ownSide, caster, "thuy");

    for (const step of def.steps) {
      const recipients = (to: StepRecipient): FighterRef[] => {
        if (to === "self") return [self];
        if (to === "targets") return [...targets];
        const side = to === "team" ? self.side : otherSide(self.side);
        return aliveIndices(s.sides[side]).map((fighter) => ({
          side,
          fighter,
        }));
      };
      switch (step.type) {
        case "damage":
          for (const t of targets) {
            const target = this.fighter(t);
            if (!isAlive(target)) continue;
            const pierce = combinePierce(
              step.pierce ?? 0,
              kim ? PASSIVE.kimPierce : 0,
            );
            const amount = Math.round(
              step.atk *
                (step.execute && target.hp / target.maxHp <= step.execute.threshold ? step.execute.multiplier : 1) *
                effectiveAtk(caster, s.experimentalSpirit) *
                morale *
                spread *
                hoa *
                elementMultiplier(caster.element, target.element) *
                R.defenseMultiplier(
                  effectiveDef(s.sides[t.side], target, s.experimentalSpirit),
                  pierce,
                ),
            );
            const dealt = this.damage(
              t,
              amount,
              "skill",
              self,
              step.pierceShield || kim,
            );
            if (step.lifesteal && dealt > 0)
              this.heal(self, Math.round(dealt * step.lifesteal));
            if (
              thuy &&
              isAlive(target) &&
              this.roll(PASSIVE.thuyFreezeChance)
            ) {
              this.applyEffect(t, { kind: "freeze", value: 0, turns: 1 });
            }
          }
          break;
        case "destroy": {
          const area = step.area;
          const before = s.board;
          const result = this.withBoardRng((rng) => {
            const cells =
              "random" in area
                ? randomCells(s.board, area.random, rng)
                : areaCells(s.board, cell!, area);
            return destroyCells(s.board, cells, rng, s.weights);
          });
          this.applyBoardChange(result, [], before);
          break;
        }
        case "whirl": {
          // Bước tự xoay chọn theo bàn lúc tới bước; không có lần xoay tạo bộ ghép thì bỏ qua.
          const chosen = step.auto ? autoWhirl(s.board, step.turns) : whirl!;
          if (chosen) this.applyWhirl(chosen, false);
          break;
        }
        case "transform": {
          const result = this.withBoardRng((rng) =>
            transformCells(s.board, step.kind, step.count, rng, s.weights),
          );
          const cells = [...s.board.cells];
          for (const pos of result.transformed)
            cells[indexOf(s.board, pos)] = { kind: step.kind };
          this.applyBoardChange(result, result.transformed, {
            ...s.board,
            cells,
          });
          break;
        }
        case "effect":
          for (const r of recipients(step.to)) {
            const f = this.fighter(r);
            if (!isAlive(f)) continue;
            if (step.effect === "taunt" && isDuel(s)) continue;
            if (step.chance !== undefined && !this.roll(step.chance)) continue;
            const value = step.ofMaxHp
              ? Math.round(f.maxHp * step.value)
              : step.ofAtk
                ? Math.max(1, Math.round(caster.atk * step.value))
                : step.value;
            this.applyEffect(r, {
              kind: step.effect,
              value,
              turns: step.turns,
            });
          }
          break;
        case "heal":
          for (const r of recipients(step.to))
            this.heal(r, Math.round(this.fighter(r).maxHp * step.ratio));
          break;
        case "cleanse":
          for (const r of recipients(step.to)) this.strip(r, NEGATIVE_EFFECTS);
          break;
        case "dispel":
          for (const r of targets) this.strip(r, POSITIVE_EFFECTS);
          break;
        case "energy":
          for (const r of recipients(step.to)) this.gainEnergy(r, step.amount);
          break;
        case "enemyFood": {
          const foeIdx = otherSide(self.side);
          const foe = s.sides[foeIdx];
          const before = foe.food;
          foe.food = Math.max(0, Math.min(R.FOOD_MAX, foe.food + step.amount));
          if (foe.food !== before)
            this.emit({
              type: "food",
              side: foeIdx,
              amount: foe.food - before,
            });
          break;
        }
        case "mark":
          this.applyMark(
            self,
            targets,
            step.enhanced,
            step.guaranteed ?? false,
          );
          break;
      }
      if (s.winner !== null) return;
    }
  }

  /** Thu hoạch ô bị kỹ năng phá như một nước đi, nhưng không cho lượt thêm. */
  private applyBoardChange(
    result: MoveResult,
    transformed: readonly Pos[],
    before: Board,
  ): void {
    const s = this.state;
    s.board = result.board;
    this.emit({ type: "board", steps: result.steps, transformed, before });
    result.steps.forEach((step, i) => {
      if (s.winner === null) this.applyStep(step, i, true);
    });
    if (result.shuffled) this.emit({ type: "shuffle", board: result.board });
  }

  private applyMark(
    self: FighterRef,
    targets: readonly FighterRef[],
    enhanced: boolean,
    guaranteed: boolean,
  ): void {
    const caster = this.fighter(self);
    const audience = markAudience(caster.element, enhanced);
    const recipients =
      audience === "self"
        ? [self]
        : audience === "team"
          ? aliveIndices(this.state.sides[self.side]).map((fighter) => ({
              side: self.side,
              fighter,
            }))
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
          const hit = guaranteed || enhanced || this.roll(MARK.freezeChance);
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
          this.applyEffect(r, {
            kind: "shield",
            value: Math.round(f.maxHp * MARK.shieldMaxHp),
            turns: null,
          });
          break;
        case "loi":
          if (enhanced)
            this.applyEffect(r, { kind: "silence", value: 0, turns: 1 });
          else this.gainEnergy(r, -MARK.energyDrain);
          break;
        case "phong":
          if (enhanced) this.strip(r, POSITIVE_EFFECTS);
          else
            this.applyEffect(r, {
              kind: "atkDown",
              value: MARK.atkDown,
              turns: 1,
            });
          break;
      }
    }
  }

  /** Tung xác suất bằng luồng ngẫu nhiên của bàn cờ (AI không biết trước). */
  private roll(chance: number): boolean {
    return this.withBoardRng((rng) => rng.next() < chance);
  }

  private applyEffect(ref: FighterRef, effect: Effect, alreadyScaled = false): void {
    if (effect.kind === "shield") {
      const raw = effect.value;
      const value = alreadyScaled ? raw : Math.round(raw * R.spiritHealMultiplier(this.fighter(ref).spirit, this.state.experimentalSpirit));
      const prior = findEffect(this.fighter(ref).effects, "shield")?.value ?? 0;
      const effective = Math.max(0, value - prior);
      if (this.state.audit) this.emit({ type: "sustain", ...ref, kind: "shield", raw, spiritLost: raw - value, effective, overflow: 0, nonStackLost: value - effective, converted: alreadyScaled ? value : 0 });
      if (value <= 0) return;
      effect = { ...effect, value };
    }
    if (addEffect(this.fighter(ref).effects, effect))
      this.emit({ type: "effect", ...ref, effect: effect.kind });
  }

  private strip(ref: FighterRef, kinds: readonly EffectKind[]): void {
    for (const effect of removeEffects(this.fighter(ref).effects, kinds))
      this.emit({ type: "effectEnd", ...ref, effect });
  }

  /** fromSkill: bàn cờ đổi do kỹ năng hoặc xoay miễn phí, thu hoạch giảm theo SKILL_BOARD_*. */
  applyStep(step: CascadeStep, index: number, fromSkill = false): void {
    const s = this.state;
    const sideIdx = s.turn.side;
    const foeIdx = otherSide(sideIdx);
    const own = s.sides[sideIdx];
    const foe = s.sides[foeIdx];
    const self: FighterRef = { side: sideIdx, fighter: s.turn.actor };
    const actor = this.fighter(self);
    const h = step.harvest;
    const count = (kind: string, grade: string) =>
      step.activations.filter(
        (a) => a.tile.kind === kind && a.tile.special === grade,
      ).length;

    // Lương
    const food =
      h.banhChung * R.FOOD_PER_TILE +
      count("banhChung", "weak") * R.GIO_BANH_FOOD;
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
    if (passiveOn(own, own.fighters[own.leader]!, "loi"))
      energy += h.amDuong * PASSIVE.loiEnergyPerTile;
    if (fromSkill) energy *= R.SKILL_BOARD_ENERGY;
    if (energy > 0) this.gainEnergy(self, Math.round(energy));

    // Hồi máu; Y sư: hồi vượt máu tối đa thành Khiên tạm thời.
    if (h.tim > 0) {
      const ySu = actor.profession === "ySu";
      const amount = Math.round(
        actor.maxHp * R.HEAL_PER_TILE_RATIO * h.tim * (ySu ? R.HEAL_Y_SU : 1),
      );
      this.heal(self, amount, ySu);
    }
    for (let k = 0; k < count("tim", "weak"); k++) {
      const alive = aliveIndices(own);
      const lowest = alive.reduce((a, b) =>
        hpRatio(own.fighters[b]!) < hpRatio(own.fighters[a]!) ? b : a,
      );
      this.heal(
        { side: sideIdx, fighter: lowest },
        Math.round(own.fighters[lowest]!.maxHp * R.HEAL_TIM_BAC_RATIO),
      );
    }
    for (let k = 0; k < count("tim", "strong"); k++) {
      for (const i of aliveIndices(own)) {
        this.heal(
          { side: sideIdx, fighter: i },
          Math.round(own.fighters[i]!.maxHp * R.HEAL_TIM_VANG_RATIO),
        );
      }
    }

    // Nộ; Trống đồng thêm Công+ cho cả đội.
    const rage =
      h.trong * R.RAGE_PER_DRUM +
      count("trong", "weak") * R.TRONG_DA_RAGE +
      count("trong", "strong") * R.TRONG_DONG_RAGE;
    if (rage > 0) this.addRage(sideIdx, rage);
    if (count("trong", "strong") > 0) {
      for (const i of aliveIndices(own)) {
        this.applyEffect(
          { side: sideIdx, fighter: i },
          {
            kind: "atkUp",
            value: R.TRONG_DONG_ATK,
            turns: R.TRONG_DONG_TURNS,
          },
        );
      }
    }

    // Đánh thường bằng kiếm
    const weak = count("kiem", "weak");
    const strong = count("kiem", "strong");
    const units =
      (h.kiem - weak - strong + R.SWORD_WEAK * weak + R.SWORD_STRONG * strong) *
      (fromSkill ? R.SKILL_BOARD_SWORD : 1);
    const target = singleTarget(s, s.turn.actor);
    if (units > 0 && target !== null) {
      const t = foe.fighters[target]!;
      const bigSword = step.matches.some(
        (m) => m.kind === "kiem" && m.cells.length >= 4,
      );
      const prof =
        actor.profession === "tuongSi" && bigSword ? R.TUONG_SI_BONUS : 1;
      const hoa = passiveOn(own, actor, "hoa") ? 1 + PASSIVE.hoaDamage : 1;
      const pierce = passiveOn(own, actor, "kim") ? PASSIVE.kimPierce : 0;
      const amount = Math.round(
        effectiveAtk(actor, s.experimentalSpirit) *
          units *
          R.MORALE_DAMAGE[morale] *
          elementMultiplier(actor.element, t.element) *
          R.cascadeMultiplier(index) *
          prof *
          hoa *
          R.defenseMultiplier(effectiveDef(foe, t, s.experimentalSpirit), pierce),
      );
      this.damage({ side: foeIdx, fighter: target }, amount, "sword", self);
      if (s.winner !== null) return;
    }

    // Nội tại nghề nhắm vào đối thủ
    const victim = singleTarget(s, s.turn.actor);
    if (victim !== null) {
      const ref = { side: foeIdx, fighter: victim };
      if (actor.profession === "muuSi" && h.vang > 0)
        this.gainEnergy(ref, -h.vang * R.MUU_SI_DRAIN_PER_TILE);
      if (actor.profession === "quanSu" && h.sach > 0) {
        const effects = foe.fighters[victim]!.effects;
        const current = findEffect(effects, "atkDown")?.value ?? 0;
        const value = Math.min(
          R.QUAN_SU_MAX,
          current + h.sach * R.QUAN_SU_PER_TILE,
        );
        removeEffects(effects, ["atkDown"]);
        this.applyEffect(ref, {
          kind: "atkDown",
          value,
          turns: R.QUAN_SU_TURNS,
        });
      }
    }

    own.gold += h.vang;
    own.books += h.sach;
  }

  private gainEnergy(ref: FighterRef, amount: number): void {
    const f = this.fighter(ref);
    const before = f.energy;
    f.energy = Math.min(R.ENERGY_MAX, Math.max(0, f.energy + amount));
    if (f.energy !== before)
      this.emit({ type: "energy", ...ref, amount: f.energy - before });
  }

  private heal(ref: FighterRef, amount: number, convertOverflow = false): void {
    const f = this.fighter(ref);
    if (!isAlive(f)) return;
    const scaled = Math.round(amount * R.spiritHealMultiplier(f.spirit, this.state.experimentalSpirit));
    const actual = Math.min(f.maxHp - f.hp, scaled);
    const overflow = scaled - actual;
    f.hp += actual;
    if (this.state.audit) this.emit({ type: "sustain", ...ref, kind: "heal", raw: amount, spiritLost: amount - scaled, effective: actual, overflow, nonStackLost: 0, converted: convertOverflow ? overflow : 0 });
    if (actual > 0) this.emit({ type: "heal", ...ref, amount: actual });
    // Hồi dư đã chịu Tinh thần của người nhận; không nhân lần thứ hai khi chuyển thành Khiên.
    if (convertOverflow && overflow > 0) this.applyEffect(ref, { kind: "shield", value: overflow, turns: R.Y_SU_SHIELD_TURNS }, true);
  }

  private addRage(side: SideIndex, amount: number): void {
    const own = this.state.sides[side];
    const leader = own.fighters[own.leader]!;
    if (!isAlive(leader) || own.passiveTurns > 0) return;
    own.rage = Math.min(R.RAGE_MAX, own.rage + amount);
    this.emit({ type: "rage", side, amount });
    if (own.rage >= R.RAGE_MAX) {
      own.rage = 0;
      // +1 vì lượt đang diễn ra không tính; bị động có hiệu lực 3 lượt tiếp theo của phe.
      own.passiveTurns = R.PASSIVE_TURNS + 1;
      this.emit({ type: "passive", side });
      this.triggerPassive(side);
    }
  }

  private triggerPassive(side: SideIndex): void {
    const s = this.state;
    const own = s.sides[side];
    const leaderRef: FighterRef = { side, fighter: own.leader };
    const leader = this.fighter(leaderRef);
    // Hiệu ứng chạy hoặc hết hạn theo lượt của phe: kích hoạt trong lượt của phe mình thì lượt này
    // chưa tính, nên cộng thêm 1 để đủ 3 lượt.
    const ownTurn = s.turn.side === side;
    const turns = R.PASSIVE_TURNS + (ownTurn ? 1 : 0);
    const foeIdx = otherSide(side);
    switch (leader.element) {
      case "moc":
        for (const i of aliveIndices(own)) {
          const f = own.fighters[i]!;
          this.applyEffect(
            { side, fighter: i },
            {
              kind: "regen",
              value: Math.round(f.maxHp * PASSIVE.mocTeamRegen),
              turns,
            },
          );
        }
        break;
      case "thuy": {
        const t = pickTarget(s.sides[foeIdx], own.leader);
        // Kích hoạt trong lượt đối thủ thì Đóng băng phải qua hết lượt đó mới có tác dụng.
        if (t !== null)
          this.applyEffect(
            { side: foeIdx, fighter: t },
            { kind: "freeze", value: 0, turns: ownTurn ? 1 : 2 },
          );
        break;
      }
      case "tho":
        this.applyEffect(leaderRef, {
          kind: "shield",
          value: Math.round(leader.maxHp * PASSIVE.thoShield),
          turns: null,
        });
        this.applyEffect(leaderRef, {
          kind: "reflect",
          value: PASSIVE.thoReflect,
          turns,
        });
        break;
      case "loi":
        for (const i of aliveIndices(s.sides[foeIdx]))
          this.gainEnergy({ side: foeIdx, fighter: i }, -PASSIVE.loiDrain);
        break;
      case "phong":
        // Xoay miễn phí: xem canFreeWhirl.
        own.freeWhirls = PASSIVE.phongFreeWhirls;
        break;
      // Kim, Hỏa: hiệu lực khi passiveTurns > 0, xem passiveOn.
      default:
        break;
    }
  }

  /** Khiên hấp thụ trước; Phản đòn trả lại một phần cho kẻ tấn công (không phản tiếp). */
  /** Trả về lượng sát thương gây ra (gồm phần Khiên hấp thụ). */
  private damage(
    ref: FighterRef,
    amount: number,
    source: DamageSource,
    attacker?: FighterRef,
    ignoreShield = false,
  ): number {
    const s = this.state;
    const own = s.sides[ref.side];
    const f = this.fighter(ref);
    if (!isAlive(f) || amount <= 0) return 0;

    let absorbed = 0;
    const shield = ignoreShield ? undefined : findEffect(f.effects, "shield");
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
        return lost + absorbed;
      }
    }

    const reflect = findEffect(f.effects, "reflect");
    if (reflect && attacker && source !== "reflect") {
      this.damage(attacker, Math.round(amount * reflect.value), "reflect");
    }
    return lost + absorbed;
  }
}
