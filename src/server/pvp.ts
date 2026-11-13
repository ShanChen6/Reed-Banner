// Quần Hùng online (PvP) trên server: hàng đợi ghép trận theo Elo, trận có thẩm quyền, chạy bù lượt hết giờ và AI tiếp quản
// kiểu "tính lười" (không có tiến trình nền: mỗi lần ai đó hỏi thì trận được chạy bù tới hiện tại), tính điểm hạng sau trận.
// Luật ở @/core/pvp và docs/02-game-modes/future/quan-hung-pvp-truc-tiep.md. Bản đầu chỉ có 1vs1 (Đinh Bộ Lĩnh); 3vs3 là bước sau.
// `now` và `seed` luôn do chỗ gọi truyền vào, nên test chạy được mà không đụng giờ hệ thống.

import {
  PVP_ELO_START,
  PVP_FORGIVE_PER_DAY,
  createPvpMatch,
  createRng,
  profileTeam,
  pvpActorOwner,
  pvpAdvanceAi,
  pvpAct,
  pvpClock,
  pvpFirstSide,
  pvpHasHumans,
  pvpHeartbeat,
  pvpSettle,
  pvpTakeover,
  pvpTimeout,
  vnDay,
  TURN_MS,
  type BattleAction,
  type BattleEvent,
  type PvpFormat,
  type PvpPlayerResult,
  type PvpState,
} from "@/core";
import { loadProfile, type ProfileStore } from "./profiles";

/** Bản đầu chỉ mở 1vs1. */
export const PVP_FORMATS: readonly PvpFormat[] = ["duel"];

/** Người đứng hàng đợi im lặng quá bấy nhiêu thì bị bỏ qua khi ghép (đã đóng trang). */
export const PVP_QUEUE_STALE_MS = 30_000;
/** Khoảng điểm cho phép ghép lúc mới vào hàng đợi, rồi nới dần theo thời gian chờ. */
export const PVP_MATCH_WINDOW = 100;
export const PVP_MATCH_WINDOW_STEP = 50;
export const PVP_MATCH_WINDOW_EVERY_MS = 5_000;
/** Chờ quá bấy nhiêu thì ghép với bất kỳ ai cùng thể thức. */
export const PVP_MATCH_ANY_AFTER_MS = 60_000;

export type PvpMatchStatus = "active" | "finished" | "abandoned";

export interface PvpRatingRow {
  readonly ownerId: string;
  readonly format: PvpFormat;
  readonly rating: number;
  readonly wins: number;
  readonly losses: number;
  /** Ngày (giờ Việt Nam) của bộ đếm `forgiveUsed`. */
  readonly forgiveDay: string;
  readonly forgiveUsed: number;
  readonly updatedAt: number;
}

export interface PvpQueueRow {
  readonly ownerId: string;
  readonly format: PvpFormat;
  readonly rating: number;
  readonly enqueuedAt: number;
  readonly lastSeen: number;
  readonly matchId: string | null;
}

export interface PvpMatchRecord {
  readonly id: string;
  readonly format: PvpFormat;
  readonly state: PvpState;
  /** Tăng sau mỗi lần ghi; ghi kèm điều kiện seq để hai request cùng lúc không ghi đè nhau. */
  readonly seq: number;
  readonly status: PvpMatchStatus;
  readonly owners: readonly string[];
  readonly results: readonly PvpPlayerResult[] | null;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly settledAt: number | null;
}

export interface PvpResultInput {
  readonly delta: number;
  readonly won: boolean;
  /** Có được tính thắng thua vào thành tích hay không (người phá trận và người bị AI thay thì không). */
  readonly counted: boolean;
  /** Số lượt mất kết nối đã được tha, trừ vào số lần tha hôm nay. */
  readonly forgiven: number;
  readonly day: string;
  readonly now: number;
}

export interface PvpStore {
  /** Điểm của người chơi; chưa có thì trả hàng mặc định (chưa lưu). */
  rating(ownerId: string, format: PvpFormat): Promise<PvpRatingRow>;
  applyResult(ownerId: string, format: PvpFormat, input: PvpResultInput): Promise<void>;
  /** Vào hàng đợi; vào lại thì làm mới và bỏ dấu đã ghép của lần trước. */
  enqueue(row: PvpQueueRow): Promise<void>;
  dequeue(ownerId: string): Promise<void>;
  queueOf(ownerId: string): Promise<PvpQueueRow | null>;
  touch(ownerId: string, now: number): Promise<void>;
  /** Người đang chờ (chưa ghép) còn tín hiệu sau `since`, ai chờ lâu hơn trước. */
  waiting(format: PvpFormat, since: number): Promise<PvpQueueRow[]>;
  /** Đặt `matchId` cho hai người nếu cả hai còn đang chờ; false khi một người đã bị ghép hoặc rời hàng đợi. */
  claimPair(a: string, b: string, matchId: string): Promise<boolean>;
  createMatch(record: PvpMatchRecord): Promise<void>;
  getMatch(id: string): Promise<PvpMatchRecord | null>;
  saveMatch(record: PvpMatchRecord, expectedSeq: number): Promise<boolean>;
  /** Đặt `settledAt` và kết quả đúng một lần; true chỉ cho lần gọi đầu tiên. */
  claimSettle(id: string, results: readonly PvpPlayerResult[], now: number): Promise<boolean>;
}

const defaultRating = (ownerId: string, format: PvpFormat, now = 0): PvpRatingRow => ({
  ownerId,
  format,
  rating: PVP_ELO_START,
  wins: 0,
  losses: 0,
  forgiveDay: "",
  forgiveUsed: 0,
  updatedAt: now,
});

export class MemoryPvpStore implements PvpStore {
  private readonly ratings = new Map<string, PvpRatingRow>();
  private readonly queue = new Map<string, PvpQueueRow>();
  private readonly matches = new Map<string, PvpMatchRecord>();

  async rating(ownerId: string, format: PvpFormat): Promise<PvpRatingRow> {
    return structuredClone(this.ratings.get(`${ownerId}|${format}`) ?? defaultRating(ownerId, format));
  }

  async applyResult(ownerId: string, format: PvpFormat, i: PvpResultInput): Promise<void> {
    const cur = this.ratings.get(`${ownerId}|${format}`) ?? defaultRating(ownerId, format);
    const sameDay = cur.forgiveDay === i.day;
    this.ratings.set(`${ownerId}|${format}`, {
      ...cur,
      rating: Math.max(0, cur.rating + i.delta),
      wins: cur.wins + (i.counted && i.won ? 1 : 0),
      losses: cur.losses + (i.counted && !i.won ? 1 : 0),
      forgiveDay: i.day,
      forgiveUsed: (sameDay ? cur.forgiveUsed : 0) + i.forgiven,
      updatedAt: i.now,
    });
  }

  async enqueue(row: PvpQueueRow): Promise<void> {
    this.queue.set(row.ownerId, { ...row, matchId: null });
  }

  async dequeue(ownerId: string): Promise<void> {
    this.queue.delete(ownerId);
  }

  async queueOf(ownerId: string): Promise<PvpQueueRow | null> {
    const r = this.queue.get(ownerId);
    return r ? { ...r } : null;
  }

  async touch(ownerId: string, now: number): Promise<void> {
    const r = this.queue.get(ownerId);
    if (r) this.queue.set(ownerId, { ...r, lastSeen: now });
  }

  async waiting(format: PvpFormat, since: number): Promise<PvpQueueRow[]> {
    return [...this.queue.values()]
      .filter((r) => r.format === format && r.matchId === null && r.lastSeen >= since)
      .sort((a, b) => a.enqueuedAt - b.enqueuedAt || a.ownerId.localeCompare(b.ownerId))
      .map((r) => ({ ...r }));
  }

  async claimPair(a: string, b: string, matchId: string): Promise<boolean> {
    const ra = this.queue.get(a);
    const rb = this.queue.get(b);
    if (!ra || !rb || ra.matchId !== null || rb.matchId !== null) return false;
    this.queue.set(a, { ...ra, matchId });
    this.queue.set(b, { ...rb, matchId });
    return true;
  }

  async createMatch(record: PvpMatchRecord): Promise<void> {
    if (this.matches.has(record.id)) throw new Error(`Trận PvP đã tồn tại: ${record.id}`);
    this.matches.set(record.id, structuredClone(record));
  }

  async getMatch(id: string): Promise<PvpMatchRecord | null> {
    const r = this.matches.get(id);
    return r ? structuredClone(r) : null;
  }

  async saveMatch(record: PvpMatchRecord, expectedSeq: number): Promise<boolean> {
    const cur = this.matches.get(record.id);
    if (!cur || cur.seq !== expectedSeq) return false;
    this.matches.set(record.id, structuredClone({ ...record, settledAt: cur.settledAt, results: cur.results }));
    return true;
  }

  async claimSettle(id: string, results: readonly PvpPlayerResult[], now: number): Promise<boolean> {
    const cur = this.matches.get(id);
    if (!cur || cur.settledAt !== null) return false;
    this.matches.set(id, { ...cur, settledAt: now, results: structuredClone([...results]) });
    return true;
  }
}

export interface PvpDeps {
  readonly pvp: PvpStore;
  readonly profiles: ProfileStore;
  readonly now: number;
  /** Hạt giống cho trận mới và id trận. */
  readonly seed: number;
  readonly newId: () => string;
}

// ---------------------------------------------------------------------------------------------------------------------
// Hàng đợi và ghép trận
// ---------------------------------------------------------------------------------------------------------------------

/** Khoảng điểm cho phép ghép sau `waitedMs` chờ; về vô hạn sau `PVP_MATCH_ANY_AFTER_MS`. */
export function pvpMatchWindow(waitedMs: number): number {
  if (waitedMs >= PVP_MATCH_ANY_AFTER_MS) return Number.POSITIVE_INFINITY;
  return PVP_MATCH_WINDOW + Math.floor(Math.max(0, waitedMs) / PVP_MATCH_WINDOW_EVERY_MS) * PVP_MATCH_WINDOW_STEP;
}

export type PvpQueueError = "badFormat" | "inMatch";

/** Vào hàng đợi. Đang có trận dở thì không vào được (hết hạn tự đóng khi trận chạy bù tới lúc xong). */
export async function pvpEnqueue(
  ownerId: string,
  format: PvpFormat,
  deps: PvpDeps,
): Promise<{ ok: true } | { ok: false; error: PvpQueueError }> {
  if (!PVP_FORMATS.includes(format)) return { ok: false, error: "badFormat" };
  const cur = await deps.pvp.queueOf(ownerId);
  if (cur?.matchId) {
    const m = await deps.pvp.getMatch(cur.matchId);
    if (m && m.status === "active") return { ok: false, error: "inMatch" };
  }
  const { rating } = await deps.pvp.rating(ownerId, format);
  await deps.pvp.enqueue({ ownerId, format, rating, enqueuedAt: deps.now, lastSeen: deps.now, matchId: null });
  return { ok: true };
}

export async function pvpLeaveQueue(ownerId: string, deps: PvpDeps): Promise<void> {
  const cur = await deps.pvp.queueOf(ownerId);
  if (cur && cur.matchId === null) await deps.pvp.dequeue(ownerId);
}

/** Dựng trận 1vs1 từ hồ sơ của hai người: Đinh Bộ Lĩnh theo nghề, hệ, cấp và trang bị hiện có. */
async function buildDuel(a: PvpQueueRow, b: PvpQueueRow, deps: PvpDeps): Promise<PvpMatchRecord> {
  const [pa, pb] = await Promise.all([loadProfile(deps.profiles, a.ownerId), loadProfile(deps.profiles, b.ownerId)]);
  const [ra, rb] = await Promise.all([deps.pvp.rating(a.ownerId, "duel"), deps.pvp.rating(b.ownerId, "duel")]);
  const day = vnDay(deps.now);
  const forgiveLeft = (r: PvpRatingRow) => (r.forgiveDay === day ? Math.max(0, PVP_FORGIVE_PER_DAY - r.forgiveUsed) : PVP_FORGIVE_PER_DAY);
  const firstSide = pvpFirstSide([a.rating, b.rating], createRng(deps.seed));
  const { state } = createPvpMatch({
    sides: [
      { fighters: [profileTeam(pa.profile)[0]!], players: [a.ownerId], captain: 0 },
      { fighters: [profileTeam(pb.profile)[0]!], players: [b.ownerId], captain: 0 },
    ],
    seed: deps.seed,
    firstSide,
    now: deps.now,
    forgiveLeft: { [a.ownerId]: forgiveLeft(ra), [b.ownerId]: forgiveLeft(rb) },
  });
  return {
    id: deps.newId(),
    format: "duel",
    state,
    seq: 1,
    status: "active",
    owners: [a.ownerId, b.ownerId],
    results: null,
    createdAt: deps.now,
    updatedAt: deps.now,
    settledAt: null,
  };
}

/** Thử ghép `ownerId` với người đang chờ gần điểm nhất trong khoảng cho phép. Trả id trận nếu ghép được. */
async function tryMatch(me: PvpQueueRow, deps: PvpDeps): Promise<string | null> {
  const others = (await deps.pvp.waiting(me.format, deps.now - PVP_QUEUE_STALE_MS)).filter((r) => r.ownerId !== me.ownerId);
  const mine = pvpMatchWindow(deps.now - me.enqueuedAt);
  let best: PvpQueueRow | null = null;
  for (const o of others) {
    const window = Math.max(mine, pvpMatchWindow(deps.now - o.enqueuedAt));
    const gap = Math.abs(o.rating - me.rating);
    if (gap > window) continue;
    if (best === null || gap < Math.abs(best.rating - me.rating)) best = o;
  }
  if (!best) return null;
  // Ai vào hàng đợi trước làm phe đầu để thứ tự dựng ổn định.
  const [first, second] = me.enqueuedAt <= best.enqueuedAt ? [me, best] : [best, me];
  const record = await buildDuel(first, second, deps);
  await deps.pvp.createMatch(record);
  const won = await deps.pvp.claimPair(first.ownerId, second.ownerId, record.id);
  if (!won) {
    // Người kia vừa bị ghép hoặc rời đi: bỏ trận dư này, không ảnh hưởng ai.
    await deps.pvp.saveMatch({ ...record, status: "abandoned", seq: 2 }, 1);
    return null;
  }
  return record.id;
}

export interface PvpOverview {
  readonly ratings: { readonly duel: { readonly rating: number; readonly wins: number; readonly losses: number } };
  readonly queue: { readonly format: PvpFormat; readonly waitedMs: number } | null;
  /** Trận đang chơi (hoặc vừa ghép); null khi không có. */
  readonly matchId: string | null;
  /** Số lần còn được tha mất kết nối hôm nay (thể thức 1vs1). */
  readonly forgiveLeft: number;
  readonly serverNow: number;
}

/** Trạng thái hàng đợi của người chơi; mỗi lần hỏi là một lần ghi nhận tín hiệu và một lần thử ghép trận. */
export async function pvpOverview(ownerId: string, deps: PvpDeps): Promise<PvpOverview> {
  let q = await deps.pvp.queueOf(ownerId);
  if (q && q.matchId === null) {
    await deps.pvp.touch(ownerId, deps.now);
    q = { ...q, lastSeen: deps.now };
    const id = await tryMatch(q, deps);
    if (id) q = { ...q, matchId: id };
    else q = (await deps.pvp.queueOf(ownerId)) ?? q;
  }
  let matchId: string | null = null;
  if (q?.matchId) {
    const m = await deps.pvp.getMatch(q.matchId);
    if (m && m.status === "active") matchId = m.id;
  }
  const r = await deps.pvp.rating(ownerId, "duel");
  const day = vnDay(deps.now);
  return {
    ratings: { duel: { rating: r.rating, wins: r.wins, losses: r.losses } },
    queue: q && q.matchId === null ? { format: q.format, waitedMs: deps.now - q.enqueuedAt } : null,
    matchId,
    forgiveLeft: r.forgiveDay === day ? Math.max(0, PVP_FORGIVE_PER_DAY - r.forgiveUsed) : PVP_FORGIVE_PER_DAY,
    serverNow: deps.now,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Trận: chạy bù, nước đi, tính điểm
// ---------------------------------------------------------------------------------------------------------------------

const MAX_CATCH_UP = 400;

/**
 * Chạy bù trận tới `now`: AI đi thay tướng AI, lượt quá hạn của người thật bị mất (đánh giá tại đúng thời điểm hết hạn),
 * mất kết nối quá lâu thì AI tiếp quản. Không ai hỏi trong lúc đó cũng không sao vì kết quả chỉ phụ thuộc thời gian đã trôi.
 */
export function pvpCatchUp(start: PvpState, now: number): { state: PvpState; events: BattleEvent[]; abandoned: boolean } {
  let state = start;
  const events: BattleEvent[] = [];
  for (let guard = 0; guard < MAX_CATCH_UP && state.battle.winner === null; guard++) {
    // Hết người thật thì dừng ngay, không để hai AI đánh nhau mãi.
    if (!pvpHasHumans(state)) break;
    const owner = pvpActorOwner(state);
    if (owner === null) {
      const startOfTurn = (state.battle.turn.deadline ?? now) - TURN_MS;
      const adv = pvpAdvanceAi(state, Math.min(now, Math.max(0, startOfTurn)));
      events.push(...adv.events);
      state = adv.state;
      if (pvpActorOwner(state) === null && state.battle.winner === null) break; // không tiến thêm được
      continue;
    }
    const deadline = state.battle.turn.deadline;
    const overdue = deadline !== null && deadline < now;
    const t = overdue ? (deadline as number) + 1 : now;
    const taken = pvpTakeover(state, t);
    state = taken.state;
    if (taken.replaced.length > 0) continue;
    if (!overdue) break;
    const r = pvpTimeout(state, t);
    if (!r.ok) break;
    events.push(...r.events);
    state = r.state;
  }
  // Người thật im lặng quá lâu ở lượt người khác vẫn bị AI thay.
  if (state.battle.winner === null) state = pvpTakeover(state, now).state;
  return { state, events, abandoned: state.battle.winner === null && !pvpHasHumans(state) };
}

export interface PvpMatchView {
  readonly id: string;
  readonly format: PvpFormat;
  readonly status: PvpMatchStatus;
  readonly seq: number;
  readonly serverNow: number;
  readonly you: {
    readonly side: 0 | 1;
    readonly position: number;
    readonly captain: boolean;
    readonly left: boolean;
    readonly breaker: boolean;
    readonly streak: number;
    readonly forgiveLeft: number;
  };
  /** Chỗ ngồi: không lộ id tài khoản của người khác. */
  readonly seats: readonly { readonly side: 0 | 1; readonly position: number; readonly mine: boolean; readonly ai: boolean }[];
  readonly clock: { readonly side: 0 | 1; readonly actor: number; readonly mine: boolean; readonly deadline: number | null; readonly remainingMs: number | null };
  readonly battle: Omit<PvpState["battle"], "boardRng" | "aiRng">;
  readonly winner: 0 | 1 | null;
  /** Kết quả điểm sau trận, chỉ của chính người hỏi. */
  readonly result: PvpPlayerResult | null;
}

function viewOf(rec: PvpMatchRecord, owner: string, now: number): PvpMatchView {
  const { boardRng: _b, aiRng: _a, ...battle } = rec.state.battle;
  void _b;
  void _a;
  const you = rec.state.players[owner]!;
  const clock = pvpClock(rec.state, now);
  return {
    id: rec.id,
    format: rec.format,
    status: rec.status,
    seq: rec.seq,
    serverNow: now,
    you: {
      side: you.side,
      position: you.position,
      captain: rec.state.captains[you.side] === you.position,
      left: you.left,
      breaker: you.breaker,
      streak: you.streak,
      forgiveLeft: you.forgiveLeft,
    },
    seats: rec.state.seats.flatMap((row, side) =>
      row.map((p, position) => ({ side: side as 0 | 1, position, mine: p === owner, ai: p === null })),
    ),
    clock: { side: clock.side, actor: clock.actor, mine: clock.player === owner, deadline: clock.deadline, remainingMs: clock.remainingMs },
    battle,
    winner: rec.state.battle.winner,
    result: rec.results?.find((r) => r.player === owner) ?? null,
  };
}

/** Tính điểm hạng khi trận vừa xong; chỉ một request thắng quyền `claimSettle`. */
async function settleIfOver(rec: PvpMatchRecord, deps: PvpDeps): Promise<PvpMatchRecord> {
  if (rec.state.battle.winner === null || rec.settledAt !== null) return rec;
  const ratings: Record<string, number> = {};
  for (const p of rec.owners) ratings[p] = (await deps.pvp.rating(p, rec.format)).rating;
  const results = pvpSettle(rec.state, ratings);
  if (!(await deps.pvp.claimSettle(rec.id, results, deps.now))) return (await deps.pvp.getMatch(rec.id)) ?? rec;
  const day = vnDay(deps.now);
  for (const r of results) {
    await deps.pvp.applyResult(r.player, rec.format, { delta: r.delta, won: r.won, counted: r.counted, forgiven: r.disconnects, day, now: deps.now });
  }
  return (await deps.pvp.getMatch(rec.id)) ?? rec;
}

export type PvpMatchError = "notFound" | "left" | "conflict" | "badAction" | "notYourTurn" | "notCaptain" | "battleOver" | "rejected";

export type PvpMatchResult =
  | { readonly ok: true; readonly view: PvpMatchView; readonly events: readonly BattleEvent[] }
  | { readonly ok: false; readonly error: PvpMatchError; readonly detail?: string };

const MAX_SAVE_TRIES = 4;

/**
 * Đọc trận, chạy bù, ghi nhận tín hiệu của người hỏi, (nếu có) áp một nước đi, ghi lại kèm điều kiện seq. Hai request
 * cùng lúc thì bên sau đọc lại rồi thử tiếp.
 */
async function withMatch(
  id: string,
  owner: string,
  deps: PvpDeps,
  apply: ((state: PvpState) => { ok: true; state: PvpState; events: readonly BattleEvent[] } | { ok: false; error: PvpMatchError; detail?: string }) | null,
): Promise<PvpMatchResult> {
  for (let attempt = 0; attempt < MAX_SAVE_TRIES; attempt++) {
    const rec = await deps.pvp.getMatch(id);
    if (!rec || !rec.owners.includes(owner)) return { ok: false, error: "notFound" };
    let state = rec.state;
    const events: BattleEvent[] = [];
    let status = rec.status;
    if (status === "active") {
      const caught = pvpCatchUp(state, deps.now);
      state = caught.state;
      events.push(...caught.events);
      // Tín hiệu của người hỏi tính sau khi đã chạy bù, để lượt mất kết nối đã qua không bị che.
      const hb = pvpHeartbeat(state, owner, deps.now);
      if (hb.ok) state = hb.state;
      if (caught.abandoned) status = "abandoned";
      if (apply && state.battle.winner === null) {
        const r = apply(state);
        if (!r.ok) {
          // Vẫn lưu phần chạy bù rồi báo lỗi cho người gửi.
          await deps.pvp.saveMatch({ ...rec, state, status, seq: rec.seq + 1, updatedAt: deps.now }, rec.seq);
          return { ok: false, error: r.error, ...(r.detail ? { detail: r.detail } : {}) };
        }
        state = r.state;
        events.push(...r.events);
      } else if (apply) {
        return { ok: false, error: "battleOver" };
      }
      if (state.battle.winner !== null) status = "finished";
    }
    let next: PvpMatchRecord = { ...rec, state, status, seq: rec.seq + 1, updatedAt: deps.now };
    if (rec.status === "active" && !(await deps.pvp.saveMatch(next, rec.seq))) continue;
    if (rec.status !== "active") next = rec;
    if (next.status === "finished") next = await settleIfOver(next, deps);
    return { ok: true, view: viewOf(next, owner, deps.now), events };
  }
  return { ok: false, error: "conflict" };
}

/** Xem trận (cũng là lần chạy bù và tín hiệu còn sống). */
export function pvpGetMatch(id: string, owner: string, deps: PvpDeps): Promise<PvpMatchResult> {
  return withMatch(id, owner, deps, null);
}

/** Người chơi ra tay: đổi ô, kỹ năng, xoay lốc hoặc (đội trưởng) đổi người hành động. */
export function pvpPlay(id: string, owner: string, action: BattleAction, deps: PvpDeps): Promise<PvpMatchResult> {
  return withMatch(id, owner, deps, (state) => {
    const r = pvpAct(state, owner, action, deps.now);
    if (!r.ok) {
      const error: PvpMatchError =
        r.error === "notYourTurn" || r.error === "notCaptain" || r.error === "left" || r.error === "battleOver" ? r.error : "rejected";
      return { ok: false, error, detail: r.error };
    }
    return { ok: true, state: r.state, events: r.events };
  });
}

/** Chỉ tín hiệu còn sống, không nước đi (client gọi mỗi vài giây khi chờ đối thủ). */
export const pvpPing = pvpGetMatch;
