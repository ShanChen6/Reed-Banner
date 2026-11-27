// Điền Trang Ký trên server (Shan chốt 27/11/2026): server làm trọng tài, mọi lệnh qua src/core/dien-trang-ky để kiểm luật,
// xúc xắc xác định theo seed lưu trong ván. Hai cách chơi:
// - Đấu sứ quân: một người với 1–3 sứ quân máy; máy đi ngay trong request của người chơi.
// - Phòng mã: chủ phòng mở phòng 2–4 ghế, người khác vào bằng mã, chủ phòng thêm sứ quân máy vào ghế trống rồi khai cuộc.
//   Mỗi quyết định có ROOM_TURN_MS; quá giờ thì máy đi thay một bước, quá giờ AWAY_AFTER lần liền thì máy đi thay luôn
//   tới khi người đó ra lệnh lại.
// Thưởng (Shan chốt): vàng theo thứ hạng trong ván, không có xếp hạng mùa. Mỗi tài khoản tối đa DTK_REWARDS_PER_DAY ván có
// vàng mỗi ngày (giờ Việt Nam). Ván cùng máy chạy ở trình duyệt, không có thưởng.
// Mọi lần ghi kèm điều kiện seq: hai request cùng lúc thì một bên báo `conflict`.

import { ELEMENTS, type Element } from "@/core/battle/elements";
import { WARLORD_ENCOUNTERS } from "@/core/campaign/warlords";
import {
  DTK_GOLD,
  DTK_REWARDS_PER_DAY,
  LORD_STYLE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  act,
  aliveSeats,
  chooseAction,
  concludeByAssets,
  newDtk,
  resign,
  type DtkAction,
  type DtkState,
  freeColor,
  isDtkColor,
  type DtkColor,
} from "@/core/dien-trang-ky";
import { vnDay } from "@/core/vnTime";
import { updateProfile, type ProfileStore } from "./profiles";

export type DtkStatus = "waiting" | "playing" | "ended";
export type DtkKind = "ai" | "room";

export interface DtkSeatInfo {
  /** Tài khoản người ngồi; null là máy. */
  readonly account: string | null;
  readonly name: string;
  readonly element: Element;
  /** Id sứ quân khi máy ngồi. */
  readonly bot: string | null;
  /** Màu nhà; mỗi phòng mỗi màu một ghế. Phòng lưu trước khi có màu thì thiếu. */
  readonly color?: DtkColor;
}

export interface DtkRecord {
  readonly id: string;
  readonly ownerId: string;
  /** Mã phòng, chỉ tìm được khi còn chờ; "" khi đấu sứ quân. */
  readonly code: string;
  readonly kind: DtkKind;
  readonly status: DtkStatus;
  readonly seats: readonly DtkSeatInfo[];
  readonly state: DtkState | null;
  readonly seq: number;
  /** Lúc quyết định hiện tại bắt đầu (đếm giờ phòng mã). */
  readonly turnStartedAt: number;
  /** Số lần quá giờ liền của từng ghế. */
  readonly idle: readonly number[];
  /** Vàng đã cộng theo tài khoản khi xong ván; null là chưa xét. */
  readonly rewards: Readonly<Record<string, number>> | null;
  readonly rewardDay: string | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface DtkStore {
  create(r: DtkRecord): Promise<boolean>;
  get(id: string): Promise<DtkRecord | null>;
  findWaiting(code: string): Promise<DtkRecord | null>;
  save(r: DtkRecord, expectedSeq: number): Promise<boolean>;
  /** Số ván có vàng (> 0) của tài khoản trong ngày. */
  rewardsOn(ownerId: string, day: string): Promise<number>;
  /** Ghi vàng từng tài khoản của một ván (để đếm giới hạn ngày). */
  addRewards(matchId: string, day: string, rewards: Readonly<Record<string, number>>): Promise<void>;
}

export class MemoryDtkStore implements DtkStore {
  private readonly rows = new Map<string, DtkRecord>();
  private readonly paid: { matchId: string; ownerId: string; day: string; gold: number }[] = [];

  async create(r: DtkRecord): Promise<boolean> {
    if (this.rows.has(r.id)) return false;
    this.rows.set(r.id, structuredClone(r));
    return true;
  }

  async get(id: string): Promise<DtkRecord | null> {
    const r = this.rows.get(id);
    return r ? structuredClone(r) : null;
  }

  async findWaiting(code: string): Promise<DtkRecord | null> {
    for (const r of this.rows.values()) if (r.code === code && r.status === "waiting") return structuredClone(r);
    return null;
  }

  async save(r: DtkRecord, expectedSeq: number): Promise<boolean> {
    const cur = this.rows.get(r.id);
    if (!cur || cur.seq !== expectedSeq) return false;
    this.rows.set(r.id, structuredClone(r));
    return true;
  }

  async rewardsOn(ownerId: string, day: string): Promise<number> {
    return this.paid.filter((p) => p.ownerId === ownerId && p.day === day && p.gold > 0).length;
  }

  async addRewards(matchId: string, day: string, rewards: Readonly<Record<string, number>>): Promise<void> {
    for (const [ownerId, gold] of Object.entries(rewards)) {
      if (!this.paid.some((p) => p.matchId === matchId && p.ownerId === ownerId)) this.paid.push({ matchId, ownerId, day, gold });
    }
  }
}

export const DTK_ROOM_TTL_MS = 30 * 60_000;
/** Thời gian mỗi quyết định ở phòng mã. */
export const DTK_TURN_MS = 30_000;
/** Quá giờ chừng này lần liền thì máy đi thay luôn. */
const AWAY_AFTER = 2;
/** Chốt an toàn số bước máy đi trong một request. */
const BOT_STEPS = 4000;

export const DTK_RIVALS = WARLORD_ENCOUNTERS.filter((w) => w.id in LORD_STYLE).map((w) => ({ id: w.id, name: w.foes[0]!.name, element: w.foes[0]!.element }));

export interface DtkDeps {
  readonly store: DtkStore;
  readonly profiles: ProfileStore;
  readonly now: number;
  readonly newId: () => string;
  readonly newCode: () => string;
  readonly newSeed: () => number;
  readonly nameOf: (ownerId: string) => Promise<string>;
}

export type DtkApiError = "notFound" | "notMember" | "badRequest" | "notHost" | "full" | "started" | "conflict" | "ended" | "notYourTurn" | "illegal" | "waiting" | "colorTaken";

export interface DtkView {
  readonly id: string;
  readonly kind: DtkKind;
  readonly status: DtkStatus;
  readonly code: string | null;
  readonly host: boolean;
  /** Ghế của người xem. */
  readonly you: number;
  readonly seats: readonly { readonly name: string; readonly element: Element; readonly bot: string | null; readonly human: boolean; readonly color: DtkColor }[];
  readonly state: DtkState | null;
  readonly seq: number;
  /** Phòng mã: thời gian còn lại của quyết định hiện tại tại `serverNow`; null khi không đếm giờ. */
  readonly turnLeftMs: number | null;
  /** Vàng người xem nhận ở ván này (null: chưa xong hoặc không có). */
  readonly reward: number | null;
  /** Đã đủ số ván có vàng hôm nay nên hạng này không có vàng. */
  readonly rewardCapped: boolean;
  readonly gold?: number;
  readonly serverNow: number;
}

export type DtkApiResult = { readonly ok: true; readonly view: DtkView } | { readonly ok: false; readonly error: DtkApiError };

const isElement = (v: unknown): v is Element => typeof v === "string" && (ELEMENTS as readonly string[]).includes(v);
const seatOf = (r: DtkRecord, owner: string): number => (owner ? r.seats.findIndex((s) => s.account === owner) : -1);
/** Ghế kèm màu: phòng cũ chưa lưu màu thì lấp màu trống. */
function seatsWithColor(seats: readonly DtkSeatInfo[]): DtkSeatInfo[] {
  const out: DtkSeatInfo[] = [];
  for (const s of seats) out.push({ ...s, color: s.color && !out.some((o) => o.color === s.color) ? s.color : freeColor([...out.map((o) => o.color), ...seats.map((x) => x.color)]) });
  return out;
}
const coreSeats = (seats: readonly DtkSeatInfo[]) => seatsWithColor(seats).map(({ name, element, bot, color }) => ({ name, element, bot, color }));

function view(r: DtkRecord, you: number, now: number, gold?: number): DtkView {
  const account = r.seats[you]?.account ?? "";
  const reward = r.rewards ? (r.rewards[account] ?? 0) : null;
  const rank = r.state?.ranking?.indexOf(you) ?? -1;
  const due = r.state ? (DTK_GOLD[r.seats.length]?.[rank] ?? 0) : 0;
  const timed = r.kind === "room" && r.status === "playing" && r.state !== null && r.seats[r.state.turn]?.account !== null;
  return {
    id: r.id,
    kind: r.kind,
    status: r.status,
    code: r.status === "waiting" ? r.code : null,
    host: r.ownerId === account,
    you,
    seats: seatsWithColor(r.seats).map((s) => ({ name: s.name, element: s.element, bot: s.bot, human: s.account !== null, color: s.color! })),
    state: r.state,
    seq: r.seq,
    turnLeftMs: timed ? Math.max(0, DTK_TURN_MS - (now - r.turnStartedAt)) : null,
    reward: reward && reward > 0 ? reward : null,
    rewardCapped: reward === 0 && due > 0,
    ...(gold === undefined ? {} : { gold }),
    serverNow: now,
  };
}

/** Ghế máy hoặc người đã vắng thì máy đi; dừng khi tới lượt người thật phải quyết. Hết người thật thì chốt ván. */
function runMachines(r: DtkRecord, state: DtkState, idle: readonly number[]): DtkState {
  let s = state;
  for (let i = 0; i < BOT_STEPS && s.phase.k !== "ended"; i++) {
    const humansLeft = aliveSeats(s).some((seat) => r.seats[seat]!.account !== null);
    if (!humansLeft) return concludeByAssets(s);
    const seat = s.turn;
    const info = r.seats[seat]!;
    if (info.account !== null && (idle[seat] ?? 0) < AWAY_AFTER) return s;
    const next = act(s, seat, chooseAction(s));
    if (!next.ok) return s;
    s = next.state;
  }
  return s.phase.k === "ended" ? s : concludeByAssets(s);
}

/** Ghi bản mới; xong ván thì chia vàng theo hạng (có giới hạn ngày) rồi cộng vào hồ sơ. */
async function commit(prev: DtkRecord, next: Omit<DtkRecord, "seq" | "updatedAt">, deps: DtkDeps, viewer: string): Promise<{ record: DtkRecord; gold?: number } | null> {
  let rewards = next.rewards;
  let rewardDay = next.rewardDay;
  const ended = next.state?.phase.k === "ended";
  if (ended && rewards === null && next.state) {
    const day = vnDay(deps.now);
    const table = DTK_GOLD[next.seats.length] ?? [];
    const out: Record<string, number> = {};
    for (const [seat, info] of next.seats.entries()) {
      if (!info.account) continue;
      const due = table[next.state.ranking!.indexOf(seat)] ?? 0;
      out[info.account] = due > 0 && (await deps.store.rewardsOn(info.account, day)) < DTK_REWARDS_PER_DAY ? due : 0;
    }
    rewards = out;
    rewardDay = day;
  }
  const record: DtkRecord = { ...next, status: ended ? "ended" : next.status, rewards, rewardDay, seq: prev.seq + 1, updatedAt: deps.now };
  if (!(await deps.store.save(record, prev.seq))) return null;
  if (!rewards || prev.rewards !== null) return { record };
  await deps.store.addRewards(record.id, rewardDay!, rewards);
  let gold: number | undefined;
  for (const [account, amount] of Object.entries(rewards)) {
    if (amount <= 0) continue;
    const paid = await updateProfile(deps.profiles, account, (p) => ({ ok: true, profile: { ...p, gold: p.gold + amount } }), deps.now);
    if (paid.ok && account === viewer) gold = paid.stored.profile.gold;
  }
  return { record, ...(gold === undefined ? {} : { gold }) };
}

async function load(owner: string, id: unknown, deps: DtkDeps): Promise<{ record: DtkRecord; seat: number } | DtkApiError> {
  if (typeof id !== "string" || id.length === 0 || id.length > 64) return "badRequest";
  const record = await deps.store.get(id);
  if (!record) return "notFound";
  const seat = seatOf(record, owner);
  return seat >= 0 ? { record, seat } : "notMember";
}

async function saved(owner: string, prev: DtkRecord, next: Omit<DtkRecord, "seq" | "updatedAt">, deps: DtkDeps): Promise<DtkApiResult> {
  const done = await commit(prev, next, deps, owner);
  if (!done) return { ok: false, error: "conflict" };
  return { ok: true, view: view(done.record, seatOf(done.record, owner), deps.now, done.gold) };
}

/** Ghế máy: giữ đúng hệ của sứ quân, lấy màu nhà còn trống. */
function botSeat(id: unknown, taken: readonly (DtkColor | undefined)[]): DtkSeatInfo | null {
  const rival = DTK_RIVALS.find((r) => r.id === id);
  if (!rival) return null;
  return { account: null, name: rival.name, element: rival.element, bot: rival.id, color: freeColor(taken) };
}

const optColor = (v: unknown): DtkColor | undefined | false => (v === undefined || v === null ? undefined : isDtkColor(v) ? v : false);

/** Đấu sứ quân: người chơi ngồi ghế đầu, 1–3 sứ quân máy. */
export async function dtkStartAi(owner: string, opts: { element: unknown; rivals: unknown; color?: unknown }, deps: DtkDeps): Promise<DtkApiResult> {
  const color = optColor(opts.color);
  if (!isElement(opts.element) || !Array.isArray(opts.rivals) || color === false) return { ok: false, error: "badRequest" };
  const ids = opts.rivals as unknown[];
  if (ids.length < MIN_PLAYERS - 1 || ids.length > MAX_PLAYERS - 1 || new Set(ids).size !== ids.length) return { ok: false, error: "badRequest" };
  const seats: DtkSeatInfo[] = [{ account: owner, name: await deps.nameOf(owner), element: opts.element, bot: null, color: freeColor([], color) }];
  for (const id of ids) {
    const s = botSeat(id, seats.map((x) => x.color));
    if (!s) return { ok: false, error: "badRequest" };
    seats.push(s);
  }
  const state = newDtk({ seats: coreSeats(seats), seed: deps.newSeed() });
  const record: DtkRecord = {
    id: deps.newId(),
    ownerId: owner,
    code: "",
    kind: "ai",
    status: "playing",
    seats,
    state,
    seq: 0,
    turnStartedAt: deps.now,
    idle: seats.map(() => 0),
    rewards: null,
    rewardDay: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  if (!(await deps.store.create(record))) return { ok: false, error: "conflict" };
  return { ok: true, view: view(record, 0, deps.now) };
}

/** Mở phòng mã: chủ phòng ngồi ghế đầu. */
export async function dtkHost(owner: string, opts: { element: unknown; color?: unknown }, deps: DtkDeps): Promise<DtkApiResult> {
  const color = optColor(opts.color);
  if (!isElement(opts.element) || color === false) return { ok: false, error: "badRequest" };
  const name = await deps.nameOf(owner);
  for (let i = 0; i < 5; i++) {
    const code = deps.newCode();
    if (await deps.store.findWaiting(code)) continue;
    const record: DtkRecord = {
      id: deps.newId(),
      ownerId: owner,
      code,
      kind: "room",
      status: "waiting",
      seats: [{ account: owner, name, element: opts.element, bot: null, color: freeColor([], color) }],
      state: null,
      seq: 0,
      turnStartedAt: deps.now,
      idle: [0],
      rewards: null,
      rewardDay: null,
      createdAt: deps.now,
      updatedAt: deps.now,
    };
    if (await deps.store.create(record)) return { ok: true, view: view(record, 0, deps.now) };
  }
  return { ok: false, error: "conflict" };
}

export async function dtkJoin(owner: string, code: string, opts: { element: unknown; color?: unknown }, deps: DtkDeps): Promise<DtkApiResult> {
  const color = optColor(opts.color);
  if (!isElement(opts.element) || color === false) return { ok: false, error: "badRequest" };
  const room = await deps.store.findWaiting(code);
  if (!room || deps.now - room.createdAt > DTK_ROOM_TTL_MS) return { ok: false, error: "notFound" };
  const mine = seatOf(room, owner);
  if (mine >= 0) return { ok: true, view: view(room, mine, deps.now) };
  if (room.seats.length >= MAX_PLAYERS) return { ok: false, error: "full" };
  const taken = seatsWithColor(room.seats).map((s) => s.color);
  if (color && taken.includes(color)) return { ok: false, error: "colorTaken" };
  const seat: DtkSeatInfo = { account: owner, name: await deps.nameOf(owner), element: opts.element, bot: null, color: freeColor(taken, color) };
  return saved(owner, room, { ...room, seats: [...room.seats, seat], idle: [...room.idle, 0] }, deps);
}

/** Chủ phòng thêm sứ quân máy vào ghế trống. */
export async function dtkAddBot(owner: string, id: unknown, rival: unknown, deps: DtkDeps): Promise<DtkApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record } = got;
  if (record.status !== "waiting") return { ok: false, error: "started" };
  if (record.ownerId !== owner) return { ok: false, error: "notHost" };
  if (record.seats.length >= MAX_PLAYERS) return { ok: false, error: "full" };
  if (record.seats.some((s) => s.bot === rival)) return { ok: false, error: "badRequest" };
  const seat = botSeat(rival, seatsWithColor(record.seats).map((s) => s.color));
  if (!seat) return { ok: false, error: "badRequest" };
  return saved(owner, record, { ...record, seats: [...record.seats, seat], idle: [...record.idle, 0] }, deps);
}

/** Chủ phòng mời một ghế ra (máy hoặc người), trừ ghế chủ phòng. Người trong phòng tự rời bằng `dtkResign`. */
export async function dtkRemoveSeat(owner: string, id: unknown, index: unknown, deps: DtkDeps): Promise<DtkApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record } = got;
  if (record.status !== "waiting") return { ok: false, error: "started" };
  if (record.ownerId !== owner) return { ok: false, error: "notHost" };
  if (typeof index !== "number" || !Number.isInteger(index) || index <= 0 || index >= record.seats.length) return { ok: false, error: "badRequest" };
  return saved(owner, record, { ...record, seats: record.seats.filter((_, i) => i !== index), idle: record.idle.filter((_, i) => i !== index) }, deps);
}

/** Người trong phòng chờ đổi màu nhà của mình; màu ghế khác đang giữ thì không lấy được. */
export async function dtkSetColor(owner: string, id: unknown, color: unknown, deps: DtkDeps): Promise<DtkApiResult> {
  if (!isDtkColor(color)) return { ok: false, error: "badRequest" };
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, seat } = got;
  if (record.status !== "waiting") return { ok: false, error: "started" };
  const seats = seatsWithColor(record.seats);
  if (seats.some((s, i) => i !== seat && s.color === color)) return { ok: false, error: "colorTaken" };
  return saved(owner, record, { ...record, seats: seats.map((s, i) => (i === seat ? { ...s, color } : s)) }, deps);
}

export async function dtkStart(owner: string, id: unknown, deps: DtkDeps): Promise<DtkApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record } = got;
  if (record.status !== "waiting") return { ok: false, error: "started" };
  if (record.ownerId !== owner) return { ok: false, error: "notHost" };
  if (record.seats.length < MIN_PLAYERS) return { ok: false, error: "waiting" };
  const state = newDtk({ seats: coreSeats(record.seats), seed: deps.newSeed() });
  const next = { ...record, status: "playing" as const, state, turnStartedAt: deps.now, idle: record.seats.map(() => 0) };
  return saved(owner, record, { ...next, state: runMachines(next, state, next.idle) }, deps);
}

/** Xem ván. Phòng mã: quyết định quá giờ thì máy đi thay. */
export async function dtkGet(owner: string, id: unknown, deps: DtkDeps): Promise<DtkApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, seat } = got;
  const s = record.state;
  if (record.kind !== "room" || record.status !== "playing" || !s || s.phase.k === "ended") return { ok: true, view: view(record, seat, deps.now) };
  const turnSeat = s.turn;
  if (record.seats[turnSeat]!.account === null || deps.now - record.turnStartedAt < DTK_TURN_MS) return { ok: true, view: view(record, seat, deps.now) };
  const idle = record.idle.map((n, i) => (i === turnSeat ? n + 1 : n));
  const step = act(s, turnSeat, chooseAction(s));
  const state = runMachines(record, step.ok ? step.state : s, idle);
  const r = await saved(owner, record, { ...record, state, idle, turnStartedAt: deps.now }, deps);
  if (r.ok || r.error !== "conflict") return r;
  const latest = await deps.store.get(record.id);
  return latest ? { ok: true, view: view(latest, seat, deps.now) } : { ok: false, error: "notFound" };
}

/** Đọc lệnh từ body; lệnh lạ trả null. */
export function parseDtkAction(v: unknown): DtkAction | null {
  if (!v || typeof v !== "object") return null;
  const a = v as Record<string, unknown>;
  const int = (x: unknown) => (typeof x === "number" && Number.isInteger(x) && x >= 0 && x < 64 ? x : null);
  switch (a.t) {
    case "roll":
    case "pay":
    case "buyout":
    case "bail":
    case "skip":
    case "bankrupt":
      return { t: a.t };
    case "buy":
    case "build": {
      const level = int(a.level);
      return level === null ? null : { t: a.t, level };
    }
    case "pick":
    case "sell": {
      const tile = int(a.tile);
      return tile === null ? null : { t: a.t, tile };
    }
    default:
      return null;
  }
}

export async function dtkAct(owner: string, id: unknown, action: DtkAction, deps: DtkDeps): Promise<DtkApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, seat } = got;
  if (record.status === "waiting" || !record.state) return { ok: false, error: "waiting" };
  if (record.status === "ended") return { ok: false, error: "ended" };
  const r = act(record.state, seat, action);
  if (!r.ok) return { ok: false, error: r.error };
  const idle = record.idle.map((n, i) => (i === seat ? 0 : n));
  return saved(owner, record, { ...record, state: runMachines(record, r.state, idle), idle, turnStartedAt: deps.now }, deps);
}

/**
 * Rời ván. Phòng chờ: chủ phòng rời là đóng phòng, người khác rời là trả ghế. Đang chơi: như phá sản, đất về trống,
 * hạng theo lúc rời.
 */
export async function dtkResign(owner: string, id: unknown, deps: DtkDeps): Promise<DtkApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, seat } = got;
  if (record.status === "ended") return { ok: false, error: "ended" };
  if (record.status === "waiting" || !record.state) {
    if (record.ownerId === owner) return saved(owner, record, { ...record, status: "ended" }, deps);
    const next = { ...record, seats: record.seats.filter((_, i) => i !== seat), idle: record.idle.filter((_, i) => i !== seat) };
    const done = await commit(record, next, deps, owner);
    if (!done) return { ok: false, error: "conflict" };
    // Người vừa rời không còn ghế: trả bản xem phòng đã đóng với họ.
    return { ok: true, view: { ...view(done.record, 0, deps.now), status: "ended", you: -1, host: false } };
  }
  const r = resign(record.state, seat);
  if (!r.ok) return { ok: false, error: r.error };
  return saved(owner, record, { ...record, state: runMachines(record, r.state, record.idle), turnStartedAt: deps.now }, deps);
}
