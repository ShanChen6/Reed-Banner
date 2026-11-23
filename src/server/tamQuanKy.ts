// Tam Quân Kỳ trên server (Shan chốt 23/11/2026, "Server làm trọng tài"): mọi nước đi của ván có thưởng và ván online đều qua đây,
// server kiểm luật và đồng hồ (src/core/tam-quan-ky/match.ts) rồi mới lưu. Luật ở docs/02-game-modes/tam-quan-ky/gdd.md.
// - Đấu sứ quân có thưởng: máy tính nước ngay trong request của người chơi. Thắng được vàng theo độ khó, tối đa
//   TQK_REWARDS_PER_DAY ván có thưởng mỗi ngày (giờ Việt Nam). Không có đi lại.
// - Online 1vs1: chủ phòng tạo mã (cầm Đỏ), người kia vào bằng mã (cầm Xanh). Bắt buộc có đồng hồ; hết giờ xử khi có request tới.
//   Giao hữu, không có vàng (tránh hai tài khoản đánh dàn xếp lấy vàng).
// Mọi lần ghi kèm điều kiện seq như các kho khác: hai request cùng lúc thì một bên báo `conflict` để trình duyệt hỏi lại.

import {
  RED,
  BLUE,
  newTqkMatch,
  tqkMachine,
  tqkPlay,
  tqkPosition,
  tqkResign,
  tqkSettle,
  tqkTimeLeft,
  TQK_ONLINE_CLOCKS,
  type Color,
  type Level,
  type Move,
  type Position,
  type Result,
  type TqkMatch,
  type TqkMatchMode,
} from "@/core/tam-quan-ky";
import { vnDay } from "@/core/vnTime";
import { creditBoardGame } from "./boardQuests";
import { updateProfile, type ProfileStore } from "./profiles";

export type TqkStatus = "waiting" | "playing" | "ended";

export interface TqkRecord {
  readonly id: string;
  /** Người tạo ván (đấu sứ quân: người chơi; online: chủ phòng). */
  readonly ownerId: string;
  /** Mã phòng online; null khi đấu sứ quân. */
  readonly code: string | null;
  readonly red: string | null;
  readonly blue: string | null;
  readonly redName: string;
  readonly blueName: string;
  readonly status: TqkStatus;
  readonly match: TqkMatch;
  readonly seq: number;
  /** Vàng đã cộng khi thắng sứ quân; null là chưa xét (hoặc không có thưởng). */
  readonly reward: number | null;
  /** Ngày (giờ VN) của ván có thưởng, để đếm giới hạn mỗi ngày. */
  readonly rewardDay: string | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface TqkStore {
  create(r: TqkRecord): Promise<boolean>;
  get(id: string): Promise<TqkRecord | null>;
  /** Phòng online đang chờ người vào theo mã. */
  findWaiting(code: string): Promise<TqkRecord | null>;
  /** Ghi khi seq đang lưu đúng bằng `expectedSeq`. */
  save(r: TqkRecord, expectedSeq: number): Promise<boolean>;
  /** Số ván đã nhận vàng (vàng > 0) của người chơi trong ngày. */
  rewardsOn(ownerId: string, day: string): Promise<number>;
}

export class MemoryTqkStore implements TqkStore {
  private readonly rows = new Map<string, TqkRecord>();

  async create(r: TqkRecord): Promise<boolean> {
    if (this.rows.has(r.id)) return false;
    this.rows.set(r.id, structuredClone(r));
    return true;
  }

  async get(id: string): Promise<TqkRecord | null> {
    const r = this.rows.get(id);
    return r ? structuredClone(r) : null;
  }

  async findWaiting(code: string): Promise<TqkRecord | null> {
    for (const r of this.rows.values()) if (r.code === code && r.status === "waiting") return structuredClone(r);
    return null;
  }

  async save(r: TqkRecord, expectedSeq: number): Promise<boolean> {
    const cur = this.rows.get(r.id);
    if (!cur || cur.seq !== expectedSeq) return false;
    this.rows.set(r.id, structuredClone(r));
    return true;
  }

  async rewardsOn(ownerId: string, day: string): Promise<number> {
    let n = 0;
    for (const r of this.rows.values()) if (r.ownerId === ownerId && r.rewardDay === day && (r.reward ?? 0) > 0) n++;
    return n;
  }
}

/** Vàng khi thắng sứ quân theo độ khó. */
export const TQK_GOLD: Readonly<Record<Level, number>> = { easy: 20, medium: 40, hard: 80 };
/** Số ván thắng có vàng mỗi ngày; thắng thêm vẫn ghi nhận nhưng không có vàng. */
export const TQK_REWARDS_PER_DAY = 3;
/** Phòng online chờ quá lâu thì mã hết hạn. */
export const TQK_ROOM_TTL_MS = 30 * 60_000;

export interface TqkDeps {
  readonly store: TqkStore;
  readonly profiles: ProfileStore;
  readonly now: number;
  readonly newId: () => string;
  readonly newCode: () => string;
  readonly nameOf: (ownerId: string) => Promise<string>;
  /** Máy chọn nước (server truyền engine thật, test truyền bản nhanh). */
  readonly think: (pos: Position, level: Level) => Move | null;
}

export type TqkError =
  | "notFound"
  | "notMember"
  | "badRequest"
  | "ownRoom"
  | "started"
  | "conflict"
  | "ended"
  | "notYourTurn"
  | "illegal"
  | "waiting";

export interface TqkView {
  readonly id: string;
  readonly mode: TqkMatchMode;
  readonly status: TqkStatus;
  readonly code: string | null;
  /** Phe của người xem. */
  readonly you: Color;
  readonly names: Readonly<Record<Color, string>>;
  readonly rival: string;
  readonly level: Level | null;
  readonly clockMs: number;
  readonly moves: readonly Move[];
  /** Thời gian còn lại tại `serverNow`. */
  readonly timeLeft: Readonly<Record<Color, number>>;
  readonly result: Result | null;
  readonly seq: number;
  /** Vàng nhận được ở ván này (null: không có thưởng hoặc chưa xong). */
  readonly reward: number | null;
  /** Thắng sứ quân nhưng đã đủ số ván có thưởng hôm nay. */
  readonly rewardCapped: boolean;
  /** Vàng hiện có sau khi cộng thưởng (để header cập nhật); chỉ có ở request cộng thưởng. */
  readonly gold?: number;
  readonly serverNow: number;
}

export type TqkResult = { readonly ok: true; readonly view: TqkView } | { readonly ok: false; readonly error: TqkError };

const LEVELS: readonly Level[] = ["easy", "medium", "hard"];

function sideOf(r: TqkRecord, owner: string): Color | null {
  if (r.red === owner) return RED;
  if (r.blue === owner) return BLUE;
  return null;
}

function view(r: TqkRecord, you: Color, now: number, gold?: number): TqkView {
  const pos = tqkPosition(r.match);
  const won = r.match.mode === "ai" && pos.result?.winner === r.match.human;
  return {
    id: r.id,
    mode: r.match.mode,
    status: r.status,
    code: r.status === "waiting" ? r.code : null,
    you,
    names: { r: r.redName, b: r.blueName },
    rival: r.match.rival,
    level: r.match.level,
    clockMs: r.match.clockMs,
    moves: r.match.moves,
    timeLeft: tqkTimeLeft(r.match, pos, now),
    result: pos.result,
    seq: r.seq,
    reward: r.reward && r.reward > 0 ? r.reward : null,
    rewardCapped: won && r.reward === 0,
    ...(gold === undefined ? {} : { gold }),
    serverNow: now,
  };
}

/**
 * Ghi ván mới (đổi trạng thái khi đã có kết quả, xét thưởng thắng sứ quân) rồi cộng vàng nếu có. Trả về false khi request khác
 * đã ghi trước.
 */
async function commit(prev: TqkRecord, match: TqkMatch, deps: TqkDeps): Promise<{ record: TqkRecord; gold?: number } | null> {
  const result = tqkPosition(match).result;
  let reward = prev.reward;
  let rewardDay = prev.rewardDay;
  if (result && match.mode === "ai" && reward === null) {
    const day = vnDay(deps.now);
    const won = result.winner === match.human && match.level !== null;
    const full = won && (await deps.store.rewardsOn(prev.ownerId, day)) >= TQK_REWARDS_PER_DAY;
    reward = won && !full ? TQK_GOLD[match.level!] : 0;
    rewardDay = day;
  }
  const record: TqkRecord = { ...prev, match, status: result ? "ended" : prev.status, reward, rewardDay, seq: prev.seq + 1, updatedAt: deps.now };
  if (!(await deps.store.save(record, prev.seq))) return null;
  // Ván vừa xong (ván chưa ai vào rồi hủy phòng không đi qua đây): cộng nhiệm vụ ngày đánh cờ cho người chơi thật.
  if (result && prev.status !== "ended") await creditBoardGame(deps.profiles, [prev.red, prev.blue], match.moves.length, deps.now);
  const gold = reward ?? 0;
  if (gold > 0 && prev.reward === null) {
    const paid = await updateProfile(deps.profiles, prev.ownerId, (p) => ({ ok: true, profile: { ...p, gold: p.gold + gold } }), deps.now);
    if (paid.ok) return { record, gold: paid.stored.profile.gold };
  }
  return { record };
}

/** Máy đi khi tới lượt máy (đấu sứ quân). */
function machineReply(match: TqkMatch, deps: TqkDeps): TqkMatch {
  const machine = tqkMachine(match);
  if (!machine || match.level === null) return match;
  const pos = tqkPosition(match);
  if (pos.result || pos.toMove !== machine) return match;
  const move = deps.think(pos, match.level);
  if (!move) return match;
  const r = tqkPlay(match, machine, move, deps.now);
  return r.ok ? r.match : match;
}

async function load(owner: string, id: unknown, deps: TqkDeps): Promise<{ record: TqkRecord; side: Color } | TqkError> {
  if (typeof id !== "string" || id.length === 0 || id.length > 64) return "badRequest";
  const record = await deps.store.get(id);
  if (!record) return "notFound";
  const side = sideOf(record, owner);
  return side ? { record, side } : "notMember";
}

/** Bắt đầu ván đấu sứ quân có thưởng. Người chơi cầm Xanh thì máy (Đỏ) đi trước ngay. */
export async function tqkStartAi(owner: string, opts: { level: unknown; rival: unknown; human: unknown }, deps: TqkDeps): Promise<TqkResult> {
  const level = LEVELS.find((l) => l === opts.level);
  const human = opts.human === BLUE ? BLUE : opts.human === RED ? RED : null;
  if (!level || !human || typeof opts.rival !== "string" || opts.rival.length > 64) return { ok: false, error: "badRequest" };
  const name = await deps.nameOf(owner);
  let match = newTqkMatch({ mode: "ai", level, rival: opts.rival, human, clockMs: 0, startedAt: deps.now });
  match = machineReply(match, deps);
  const record: TqkRecord = {
    id: deps.newId(),
    ownerId: owner,
    code: null,
    red: human === RED ? owner : null,
    blue: human === BLUE ? owner : null,
    redName: human === RED ? name : "",
    blueName: human === BLUE ? name : "",
    status: "playing",
    match,
    seq: 0,
    reward: null,
    rewardDay: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  if (!(await deps.store.create(record))) return { ok: false, error: "conflict" };
  return { ok: true, view: view(record, human, deps.now) };
}

/** Mở phòng online: chủ phòng cầm Đỏ, chờ người vào bằng mã. */
export async function tqkHost(owner: string, opts: { clock: unknown; rival: unknown }, deps: TqkDeps): Promise<TqkResult> {
  const clock = TQK_ONLINE_CLOCKS.find((c) => c === opts.clock);
  if (!clock || typeof opts.rival !== "string" || opts.rival.length > 64) return { ok: false, error: "badRequest" };
  const name = await deps.nameOf(owner);
  for (let i = 0; i < 5; i++) {
    const code = deps.newCode();
    if (await deps.store.findWaiting(code)) continue;
    const record: TqkRecord = {
      id: deps.newId(),
      ownerId: owner,
      code,
      red: owner,
      blue: null,
      redName: name,
      blueName: "",
      status: "waiting",
      match: newTqkMatch({ mode: "online", level: null, rival: opts.rival, human: RED, clockMs: clock * 60_000, startedAt: null }),
      seq: 0,
      reward: null,
      rewardDay: null,
      createdAt: deps.now,
      updatedAt: deps.now,
    };
    if (await deps.store.create(record)) return { ok: true, view: view(record, RED, deps.now) };
  }
  return { ok: false, error: "conflict" };
}

/** Vào phòng online bằng mã: cầm Xanh, đồng hồ Đỏ bắt đầu chạy. */
export async function tqkJoin(owner: string, code: string, deps: TqkDeps): Promise<TqkResult> {
  const room = await deps.store.findWaiting(code);
  if (!room || deps.now - room.createdAt > TQK_ROOM_TTL_MS) return { ok: false, error: "notFound" };
  if (room.red === owner) return { ok: false, error: "ownRoom" };
  const record: TqkRecord = {
    ...room,
    blue: owner,
    blueName: await deps.nameOf(owner),
    status: "playing",
    match: { ...room.match, turnStartedAt: deps.now },
    seq: room.seq + 1,
    updatedAt: deps.now,
  };
  if (!(await deps.store.save(record, room.seq))) return { ok: false, error: "started" };
  return { ok: true, view: view(record, BLUE, deps.now) };
}

/** Xem ván; xử hết giờ nếu bên tới lượt đã cạn đồng hồ. */
export async function tqkGet(owner: string, id: unknown, deps: TqkDeps): Promise<TqkResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, side } = got;
  if (record.status !== "playing") return { ok: true, view: view(record, side, deps.now) };
  const settled = tqkSettle(record.match, deps.now);
  if (settled === record.match) return { ok: true, view: view(record, side, deps.now) };
  const saved = await commit(record, settled, deps);
  if (!saved) {
    const again = await deps.store.get(record.id);
    return again ? { ok: true, view: view(again, side, deps.now) } : { ok: false, error: "notFound" };
  }
  return { ok: true, view: view(saved.record, side, deps.now, saved.gold) };
}

/** Một nước đi của người chơi; đấu sứ quân thì máy đáp luôn trong cùng request. */
export async function tqkMove(owner: string, id: unknown, move: Move, deps: TqkDeps): Promise<TqkResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, side } = got;
  if (record.status === "waiting") return { ok: false, error: "waiting" };
  const r = tqkPlay(record.match, side, move, deps.now);
  if (!r.ok) {
    // Hết giờ trước khi kịp đi: ghi kết quả rồi báo ván đã xong.
    if (r.error === "ended" && record.status === "playing") await tqkGet(owner, id, deps);
    return { ok: false, error: r.error };
  }
  const saved = await commit(record, machineReply(r.match, deps), deps);
  if (!saved) return { ok: false, error: "conflict" };
  return { ok: true, view: view(saved.record, side, deps.now, saved.gold) };
}

/** Đầu hàng. Chủ phòng đầu hàng khi chưa ai vào thì là hủy phòng. */
export async function tqkResignMatch(owner: string, id: unknown, deps: TqkDeps): Promise<TqkResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, side } = got;
  if (record.status === "ended") return { ok: false, error: "ended" };
  if (record.status === "waiting") {
    const closed: TqkRecord = { ...record, status: "ended", seq: record.seq + 1, updatedAt: deps.now };
    if (!(await deps.store.save(closed, record.seq))) return { ok: false, error: "conflict" };
    return { ok: true, view: view(closed, side, deps.now) };
  }
  const r = tqkResign(record.match, side, deps.now);
  if (!r.ok) return { ok: false, error: r.error };
  const saved = await commit(record, r.match, deps);
  if (!saved) return { ok: false, error: "conflict" };
  return { ok: true, view: view(saved.record, side, deps.now, saved.gold) };
}
