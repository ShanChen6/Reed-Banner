// Trận PvP có thẩm quyền: một trận BattleState hai phe, mỗi tướng thuộc về một người chơi (hoặc AI điền). Lớp này lo
// phần "ai được làm gì": chỉ chủ tướng đang hành động mới đi nước, chỉ đội trưởng mới đổi người hành động, hết giờ thì mất
// lượt và đổi sang đối thủ, bỏ lượt liên tục là phá trận. Luật ở docs/02-game-modes/future/quan-hung-pvp-truc-tiep.md.
// Thuần như `src/core/match`: không đọc giờ hệ thống, `now` do server truyền vào, mọi ngẫu nhiên đi qua seed.

import { chooseMove, chooseSkill, bestWhirl, toView, type AiView, type Difficulty } from "../ai";
import {
  act,
  canFreeWhirl,
  createBattle,
  PASSIVE,
  type BattleAction,
  type BattleError,
  type BattleEvent,
  type BattleState,
  type FighterConfig,
  type SideIndex,
} from "../battle";
import { createRng, type Rng } from "../rng";
import { PVP_ELO_START, pvpAiFactor, pvpEloDelta, pvpSideRating } from "./elo";

/** Bỏ lượt liên tiếp bấy nhiêu lần của chính một người thì bị coi là phá trận (đề xuất, chờ đo). */
export const PVP_BREAKER_STREAK = 3;

export type PvpFormat = "duel" | "team";

/** Người ngồi ở một tướng: id tài khoản, hoặc null là AI điền chỗ trống. */
export type PvpPlayerId = string | null;

export interface PvpSideSpec {
  /** Theo vị trí 1, 2, 3. 1vs1 chỉ có một người. */
  readonly fighters: readonly FighterConfig[];
  /** Người điều khiển từng tướng, cùng thứ tự vị trí; null là AI. */
  readonly players: readonly PvpPlayerId[];
  /** Vị trí của đội trưởng, người duy nhất được đổi người hành động. Phải là người thật. */
  readonly captain: number;
  /** Vị trí của thủ lĩnh (giữ thanh Nộ), mặc định vị trí 1. */
  readonly leader?: number;
}

export interface PvpConfig {
  readonly sides: readonly [PvpSideSpec, PvpSideSpec];
  readonly seed: number;
  readonly firstSide?: SideIndex;
  readonly now?: number;
  /** Mức AI cho các tướng AI điền chỗ. */
  readonly aiDifficulty?: Difficulty;
}

export interface PvpPlayerStat {
  readonly side: SideIndex;
  readonly position: number;
  /** Số lần hết giờ trong trận. */
  readonly timeouts: number;
  /** Số lần hết giờ liên tiếp của chính người này (đặt lại khi người này đi một nước). */
  readonly streak: number;
  /** Số nước đi của người này. */
  readonly moves: number;
  /** Bị coi là phá trận trong trận này. */
  readonly breaker: boolean;
}

export interface PvpState {
  readonly version: 1;
  readonly format: PvpFormat;
  readonly battle: BattleState;
  /** Theo phe rồi theo vị trí: id người chơi hoặc null (AI). */
  readonly seats: readonly [readonly PvpPlayerId[], readonly PvpPlayerId[]];
  readonly captains: readonly [number, number];
  readonly players: Readonly<Record<string, PvpPlayerStat>>;
  readonly aiDifficulty: Difficulty;
}

export type PvpError =
  | BattleError
  | "unknownPlayer"
  | "notYourTurn"
  | "notCaptain"
  | "cannotTimeout";

export type PvpResult =
  | { readonly ok: true; readonly state: PvpState; readonly events: readonly BattleEvent[] }
  | { readonly ok: false; readonly error: PvpError };

export type PvpTimeoutResult =
  | {
      readonly ok: true;
      readonly state: PvpState;
      readonly events: readonly BattleEvent[];
      /** Người bị mất lượt; null nếu là tướng AI. */
      readonly player: string | null;
      /** Lần hết giờ này làm người đó thành phá trận. */
      readonly becameBreaker: boolean;
    }
  | { readonly ok: false; readonly error: BattleError };

function validate(config: PvpConfig): PvpFormat {
  const [a, b] = config.sides;
  const sizes = [a.fighters.length, b.fighters.length];
  const format: PvpFormat = sizes[0] === 1 && sizes[1] === 1 ? "duel" : "team";
  if (format === "team" && !(sizes[0] === 3 && sizes[1] === 3)) throw new RangeError("PvP chỉ có 1vs1 hoặc 3vs3");
  const seen = new Set<string>();
  for (const spec of config.sides) {
    if (spec.players.length !== spec.fighters.length) throw new RangeError("Mỗi tướng phải có một người điều khiển (hoặc AI)");
    if (!Number.isInteger(spec.captain) || spec.captain < 0 || spec.captain >= spec.fighters.length) throw new RangeError("Đội trưởng không hợp lệ");
    if (spec.players[spec.captain] === null) throw new RangeError("Đội trưởng phải là người thật");
    for (const p of spec.players) {
      if (p === null) continue;
      if (seen.has(p)) throw new RangeError(`Người chơi ${p} ngồi hai chỗ`);
      seen.add(p);
    }
  }
  const humans = config.sides.flatMap((s) => s.players.filter((p) => p !== null));
  if (humans.length === 0) throw new RangeError("Trận PvP cần ít nhất một người thật");
  return format;
}

/** Dựng trận PvP. Đồng hồ luôn bật. */
export function createPvpMatch(config: PvpConfig): { state: PvpState; events: BattleEvent[] } {
  const format = validate(config);
  const [a, b] = config.sides;
  const { state: battle, events } = createBattle({
    sides: [
      { fighters: a.fighters, leader: a.leader ?? 0 },
      { fighters: b.fighters, leader: b.leader ?? 0 },
    ],
    seed: config.seed,
    timer: true,
    ...(config.firstSide !== undefined ? { firstSide: config.firstSide } : {}),
    ...(config.now !== undefined ? { now: config.now } : {}),
  });
  const players: Record<string, PvpPlayerStat> = {};
  config.sides.forEach((spec, side) => {
    spec.players.forEach((p, position) => {
      if (p !== null) players[p] = { side: side as SideIndex, position, timeouts: 0, streak: 0, moves: 0, breaker: false };
    });
  });
  return {
    state: {
      version: 1,
      format,
      battle,
      seats: [[...a.players], [...b.players]],
      captains: [a.captain, b.captain],
      players,
      aiDifficulty: config.aiDifficulty ?? "hard",
    },
    events,
  };
}

/** Phe đi trước: phe điểm trung bình thấp hơn; hòa điểm thì bốc theo `rng`. */
export function pvpFirstSide(avg: readonly [number, number], rng: Rng): SideIndex {
  if (avg[0] === avg[1]) return rng.int(0, 1) as SideIndex;
  return avg[0] < avg[1] ? 0 : 1;
}

/** Chủ của tướng đang hành động; null là AI hoặc trận đã xong. */
export function pvpActorOwner(state: PvpState): PvpPlayerId {
  const { side, actor } = state.battle.turn;
  return state.seats[side][actor] ?? null;
}

export const pvpIsOver = (state: PvpState): boolean => state.battle.winner !== null;

/** Thông tin đồng hồ để hiện cho mọi người: ai đang đến lượt và còn bao lâu. */
export function pvpClock(state: PvpState, now: number): { player: PvpPlayerId; side: SideIndex; actor: number; deadline: number | null; remainingMs: number | null } {
  const { turn } = state.battle;
  return {
    player: pvpActorOwner(state),
    side: turn.side,
    actor: turn.actor,
    deadline: turn.deadline,
    remainingMs: turn.deadline === null ? null : Math.max(0, turn.deadline - now),
  };
}

function withStat(state: PvpState, player: string, patch: Partial<PvpPlayerStat>): PvpState {
  const cur = state.players[player];
  if (!cur) return state;
  return { ...state, players: { ...state.players, [player]: { ...cur, ...patch } } };
}

/**
 * Một người chơi ra tay. Chỉ chủ của tướng đang hành động được đánh (đổi ô, kỹ năng, xoay lốc); chỉ đội trưởng của phe
 * đang đánh được đổi người hành động. Hết giờ đi qua `pvpTimeout`, không đi qua đây.
 */
export function pvpAct(state: PvpState, player: string, action: BattleAction, now: number): PvpResult {
  const stat = state.players[player];
  if (!stat) return { ok: false, error: "unknownPlayer" };
  if (state.battle.winner !== null) return { ok: false, error: "battleOver" };
  if (action.type === "timeout") return { ok: false, error: "cannotTimeout" };
  const { turn } = state.battle;
  if (action.type === "selectActor") {
    if (stat.side !== turn.side || state.captains[turn.side] !== stat.position) return { ok: false, error: "notCaptain" };
  } else if (pvpActorOwner(state) !== player) {
    return { ok: false, error: "notYourTurn" };
  }
  const r = act(state.battle, action, now);
  if (!r.ok) return { ok: false, error: r.error };
  let next: PvpState = { ...state, battle: r.state };
  if (action.type === "swap") next = withStat(next, player, { streak: 0, moves: stat.moves + 1 });
  return { ok: true, state: next, events: r.events };
}

/**
 * Hết giờ lượt hiện tại: người đang hành động mất lượt và quyền đi chuyển sang đối thủ. Bỏ lượt liên tiếp
 * `PVP_BREAKER_STREAK` lần thì bị coi là phá trận. Tướng AI hết giờ không bị tính.
 */
export function pvpTimeout(state: PvpState, now: number): PvpTimeoutResult {
  const owner = pvpActorOwner(state);
  const r = act(state.battle, { type: "timeout" }, now);
  if (!r.ok) return { ok: false, error: r.error };
  let next: PvpState = { ...state, battle: r.state };
  let becameBreaker = false;
  if (owner !== null) {
    const stat = state.players[owner] as PvpPlayerStat;
    const streak = stat.streak + 1;
    becameBreaker = !stat.breaker && streak >= PVP_BREAKER_STREAK;
    next = withStat(next, owner, { timeouts: stat.timeouts + 1, streak, breaker: stat.breaker || becameBreaker });
  }
  return { ok: true, state: next, events: r.events, player: owner, becameBreaker };
}

/** Bước xoay lốc miễn phí của AI (nếu bị động Phong cho phép). Kỹ năng và đổi ô xử lý ở `pvpAdvanceAi`. Chỉ gọi khi chủ là AI. */
function aiSteps(battle: BattleState): BattleAction[] {
  const view: AiView = toView(battle);
  const steps: BattleAction[] = [];
  if (canFreeWhirl(battle)) {
    const free = bestWhirl(view, PASSIVE.phongFreeWhirlTurns);
    if (free.score > 0) steps.push({ type: "whirl", whirl: free.whirl });
  }
  return steps;
}

/**
 * Cho AI đánh thay cho mọi tướng AI đang đến lượt, cho tới khi người thật đến lượt hoặc trận xong. Mỗi tướng AI chỉ đánh
 * phần của mình (xoay lốc, kỹ năng, một nước đổi ô); lượt thêm chuyển sang tướng kế tiếp thì xét lại chủ.
 */
export function pvpAdvanceAi(start: PvpState, now: number): { state: PvpState; events: BattleEvent[] } {
  let state = start;
  const events: BattleEvent[] = [];
  for (let guard = 0; guard < 200 && state.battle.winner === null && pvpActorOwner(state) === null; guard++) {
    let battle = state.battle;
    const apply = (action: BattleAction): boolean => {
      const r = act(battle, action, now);
      if (!r.ok) return false;
      battle = r.state;
      events.push(...r.events);
      return true;
    };
    const turnNumber = battle.turn.number;
    const actor = battle.turn.actor;
    const side = battle.turn.side;
    for (const step of aiSteps(battle)) apply(step);
    if (battle.winner === null) {
      const skill = chooseSkill(toView(battle));
      if (skill) apply(skill);
    }
    if (battle.winner === null && battle.turn.side === side && battle.turn.number === turnNumber && battle.turn.actor === actor) {
      const rng = createRng(battle.aiRng);
      const move = chooseMove(toView(battle), state.aiDifficulty, rng);
      battle = { ...battle, aiRng: rng.state() };
      if (!apply({ type: "swap", from: move.from, to: move.to })) throw new Error("AI chọn nước đi không hợp lệ");
    }
    state = { ...state, battle };
  }
  return { state, events };
}

/** Góc nhìn của một người chơi: bỏ mọi luồng ngẫu nhiên, kèm chỗ ngồi của chính người đó. */
export function pvpViewFor(state: PvpState, player: string): {
  battle: Omit<BattleState, "boardRng" | "aiRng">;
  seats: PvpState["seats"];
  captains: PvpState["captains"];
  you: PvpPlayerStat | null;
} {
  const { boardRng: _b, aiRng: _a, ...battle } = state.battle;
  void _b;
  void _a;
  return { battle, seats: state.seats, captains: state.captains, you: state.players[player] ?? null };
}

export interface PvpPlayerResult {
  readonly player: string;
  readonly side: SideIndex;
  readonly won: boolean;
  readonly before: number;
  readonly after: number;
  readonly delta: number;
  /** Có được tính điểm hay không: người phá trận không được tính. */
  readonly counted: boolean;
  readonly breaker: boolean;
}

/**
 * Điểm hạng sau trận. `ratings` là điểm Elo hiện tại của từng người thật ở thể thức này (thiếu thì lấy điểm khởi đầu).
 * Kỳ vọng tính từ điểm trung bình hai phe (tướng AI không có điểm riêng), người phá trận không đổi điểm, trận có AI
 * được ít điểm hơn.
 */
export function pvpSettle(state: PvpState, ratings: Readonly<Record<string, number>>): PvpPlayerResult[] {
  const winner = state.battle.winner;
  if (winner === null) throw new RangeError("Trận chưa kết thúc");
  const rating = (p: string) => ratings[p] ?? PVP_ELO_START;
  const sideAvg = [0, 1].map((s) => pvpSideRating(state.seats[s as 0 | 1].flatMap((p) => (p === null ? [] : [rating(p)]))));
  const aiCount = state.seats.flat().filter((p) => p === null).length;
  pvpAiFactor(aiCount);
  const out: PvpPlayerResult[] = [];
  for (const side of [0, 1] as const) {
    for (const p of state.seats[side]) {
      if (p === null) continue;
      const stat = state.players[p] as PvpPlayerStat;
      const before = rating(p);
      const won = winner === side;
      const counted = !stat.breaker;
      const delta = counted ? pvpEloDelta({ won, own: sideAvg[side] as number, foe: sideAvg[1 - side] as number, aiCount }) : 0;
      out.push({ player: p, side, won, before, after: Math.max(0, before + delta), delta: Math.max(0, before + delta) - before, counted, breaker: stat.breaker });
    }
  }
  return out;
}
