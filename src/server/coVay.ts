// Vây Thành Kỳ (cờ vây nguyên tố) do server làm trọng tài như Tam Quân Kỳ (src/server/tamQuanKy.ts). Mọi nước đi qua
// src/core/co-vay/match.ts để kiểm luật và đồng hồ rồi mới lưu.
// - Đấu sứ quân có thưởng (Shan chọn 23/11/2026): máy tính nước ngay trong request của người chơi. Thắng được vàng theo độ khó,
//   tối đa GO_REWARDS_PER_DAY ván có vàng mỗi ngày (giờ Việt Nam), cùng mức với Tam Quân Kỳ. Không đồng hồ, không đi lại.
// - Đấu người bằng mã phòng: giao hữu, không có vàng.
// Ván xong đủ dài thì cộng nhiệm vụ ngày đánh cờ (src/server/boardQuests.ts).
// - Chủ phòng cầm Đen (đi trước), chọn cỡ bàn, luật (đếm điểm hay bắt quân trước), đồng hồ và nguyên tố của mình.
// - Người vào bằng mã cầm Trắng, chọn nguyên tố; trùng hệ chủ phòng thì server đổi sang hệ khác để hai bên phân biệt được.
// Mọi lần ghi kèm điều kiện seq: hai request cùng lúc thì một bên báo `conflict`.

import { ELEMENTS, type Element } from "@/core/battle/elements";
import { vnDay } from "@/core/vnTime";
import {
  BLACK,
  PASS,
  GO_ONLINE_CLOCKS,
  WHITE,
  goPlay,
  goPosition,
  goResign,
  goSettle,
  goTimeLeft,
  isBoardSize,
  isElement,
  newGoMatch,
  type BoardSize,
  type Color,
  type GoMatch,
  type GoResult,
  type Level,
  type Mode,
  type Position,
} from "@/core/co-vay";
import { creditBoardGame } from "./boardQuests";
import { updateProfile, type ProfileStore } from "./profiles";

export type GoStatus = "waiting" | "playing" | "ended";

/** Ván đấu sứ quân: độ khó, sứ quân (id trong danh sách 12 sứ quân) và bên người chơi cầm. */
export interface GoAi {
  readonly level: Level;
  readonly rival: string;
  readonly human: Color;
}

export interface GoRecord {
  readonly id: string;
  readonly ownerId: string;
  /** Mã phòng, chỉ tìm được khi còn chờ người vào; "" khi đấu sứ quân. */
  readonly code: string;
  /** Tài khoản cầm Đen; "" khi máy cầm Đen. */
  readonly black: string;
  readonly white: string | null;
  readonly blackName: string;
  readonly whiteName: string;
  readonly status: GoStatus;
  readonly match: GoMatch;
  readonly seq: number;
  /** Đấu sứ quân; null khi đấu người. */
  readonly ai: GoAi | null;
  /** Vàng đã cộng khi thắng sứ quân; null là chưa xét (hoặc không có thưởng). */
  readonly reward: number | null;
  /** Ngày (giờ VN) của ván có thưởng, để đếm giới hạn mỗi ngày. */
  readonly rewardDay: string | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface GoStore {
  create(r: GoRecord): Promise<boolean>;
  get(id: string): Promise<GoRecord | null>;
  findWaiting(code: string): Promise<GoRecord | null>;
  /** Ghi khi seq đang lưu đúng bằng `expectedSeq`. */
  save(r: GoRecord, expectedSeq: number): Promise<boolean>;
  /** Số ván đã nhận vàng (vàng > 0) của người chơi trong ngày. */
  rewardsOn(ownerId: string, day: string): Promise<number>;
}

export class MemoryGoStore implements GoStore {
  private readonly rows = new Map<string, GoRecord>();

  async create(r: GoRecord): Promise<boolean> {
    if (this.rows.has(r.id)) return false;
    this.rows.set(r.id, structuredClone(r));
    return true;
  }

  async get(id: string): Promise<GoRecord | null> {
    const r = this.rows.get(id);
    return r ? structuredClone(r) : null;
  }

  async findWaiting(code: string): Promise<GoRecord | null> {
    for (const r of this.rows.values()) if (r.code === code && r.status === "waiting") return structuredClone(r);
    return null;
  }

  async save(r: GoRecord, expectedSeq: number): Promise<boolean> {
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

/** Vàng khi thắng sứ quân theo độ khó (cùng mức Tam Quân Kỳ). */
export const GO_GOLD: Readonly<Record<Level, number>> = { easy: 20, medium: 40, hard: 80 };
/** Số ván thắng có vàng mỗi ngày; thắng thêm vẫn ghi nhận nhưng không có vàng. */
export const GO_REWARDS_PER_DAY = 3;
const LEVELS: readonly Level[] = ["easy", "medium", "hard"];

/** Phòng chờ quá lâu thì mã hết hạn. */
export const GO_ROOM_TTL_MS = 30 * 60_000;

/** Nước máy chọn: điểm hoặc PASS, hoặc xin thua. */
export interface GoThought {
  readonly move: number;
  readonly resign: boolean;
}

export interface GoDeps {
  readonly store: GoStore;
  readonly profiles: ProfileStore;
  /** Máy chọn nước (server truyền engine thật, test truyền bản nhanh). */
  readonly think: (pos: Position, level: Level) => GoThought;
  readonly now: number;
  readonly newId: () => string;
  readonly newCode: () => string;
  readonly nameOf: (ownerId: string) => Promise<string>;
}

export type GoError = "notFound" | "notMember" | "badRequest" | "ownRoom" | "started" | "conflict" | "ended" | "notYourTurn" | "illegal" | "waiting";

export interface GoView {
  readonly id: string;
  readonly status: GoStatus;
  readonly code: string | null;
  /** Bên của người xem. */
  readonly you: Color;
  readonly names: Readonly<Record<Color, string>>;
  readonly size: BoardSize;
  readonly mode: Mode;
  readonly elements: Readonly<Record<Color, Element>>;
  readonly clockMs: number;
  readonly moves: readonly number[];
  /** Thời gian còn lại tại `serverNow`. */
  readonly timeLeft: Readonly<Record<Color, number>>;
  readonly result: GoResult | null;
  readonly seq: number;
  /** Đấu sứ quân: độ khó và sứ quân; null khi đấu người. */
  readonly ai: GoAi | null;
  /** Vàng nhận được ở ván này (null: không có thưởng hoặc chưa xong). */
  readonly reward: number | null;
  /** Thắng sứ quân nhưng đã đủ số ván có thưởng hôm nay. */
  readonly rewardCapped: boolean;
  /** Vàng hiện có sau khi cộng thưởng (để header cập nhật); chỉ có ở request cộng thưởng. */
  readonly gold?: number;
  readonly serverNow: number;
}

export type GoApiResult = { readonly ok: true; readonly view: GoView } | { readonly ok: false; readonly error: GoError };

function sideOf(r: GoRecord, owner: string): Color | null {
  if (!owner) return null;
  if (r.black === owner) return BLACK;
  if (r.white === owner) return WHITE;
  return null;
}

function view(r: GoRecord, you: Color, now: number, gold?: number): GoView {
  const m = r.match;
  const won = !!r.ai && m.result?.winner === r.ai.human;
  return {
    id: r.id,
    status: r.status,
    code: r.status === "waiting" ? r.code : null,
    you,
    names: { [BLACK]: r.blackName, [WHITE]: r.whiteName } as Record<Color, string>,
    size: m.size,
    mode: m.mode,
    elements: m.elements,
    clockMs: m.clockMs,
    moves: m.moves,
    timeLeft: goTimeLeft(m, now),
    result: m.result,
    seq: r.seq,
    ai: r.ai,
    reward: r.reward && r.reward > 0 ? r.reward : null,
    rewardCapped: won && r.reward === 0,
    ...(gold === undefined ? {} : { gold }),
    serverNow: now,
  };
}

/**
 * Ghi ván mới (đổi trạng thái khi đã có kết quả, xét thưởng thắng sứ quân, cộng nhiệm vụ đánh cờ) rồi cộng vàng nếu có.
 * Trả về null khi request khác đã ghi trước.
 */
async function commit(prev: GoRecord, match: GoMatch, deps: GoDeps): Promise<{ record: GoRecord; gold?: number } | null> {
  const result = match.result;
  let reward = prev.reward;
  let rewardDay = prev.rewardDay;
  if (result && prev.ai && reward === null) {
    const day = vnDay(deps.now);
    const won = result.winner === prev.ai.human;
    const full = won && (await deps.store.rewardsOn(prev.ownerId, day)) >= GO_REWARDS_PER_DAY;
    reward = won && !full ? GO_GOLD[prev.ai.level] : 0;
    rewardDay = day;
  }
  const record: GoRecord = { ...prev, match, status: result ? "ended" : prev.status, reward, rewardDay, seq: prev.seq + 1, updatedAt: deps.now };
  if (!(await deps.store.save(record, prev.seq))) return null;
  if (result && prev.status !== "ended") await creditBoardGame(deps.profiles, [prev.black, prev.white], match.moves.length, deps.now);
  const gold = reward ?? 0;
  if (gold > 0 && prev.reward === null) {
    const paid = await updateProfile(deps.profiles, prev.ownerId, (p) => ({ ok: true, profile: { ...p, gold: p.gold + gold } }), deps.now);
    if (paid.ok) return { record, gold: paid.stored.profile.gold };
  }
  return { record };
}

/** Máy đi khi tới lượt máy (đấu sứ quân). Máy xin thua thì ván kết thúc ngay. */
function machineReply(match: GoMatch, ai: GoAi | null, deps: GoDeps): GoMatch {
  if (!ai || match.result) return match;
  const machine = ai.human === BLACK ? WHITE : BLACK;
  if ((match.moves.length % 2 === 0 ? BLACK : WHITE) !== machine) return match;
  const thought = deps.think(goPosition(match), ai.level);
  if (thought.resign) {
    const r = goResign(match, machine, deps.now);
    return r.ok ? r.match : match;
  }
  const r = goPlay(match, machine, thought.move, deps.now);
  if (r.ok) return r.match;
  // Phòng hờ máy trả nước không hợp lệ: bỏ lượt thay vì treo ván.
  const pass = goPlay(match, machine, PASS, deps.now);
  return pass.ok ? pass.match : match;
}

async function load(owner: string, id: unknown, deps: GoDeps): Promise<{ record: GoRecord; side: Color } | GoError> {
  if (typeof id !== "string" || id.length === 0 || id.length > 64) return "badRequest";
  const record = await deps.store.get(id);
  if (!record) return "notFound";
  const side = sideOf(record, owner);
  return side ? { record, side } : "notMember";
}

/** Mở phòng: chủ phòng cầm Đen, chờ người vào bằng mã. */
export async function goHost(owner: string, opts: { size: unknown; mode: unknown; clock: unknown; element: unknown }, deps: GoDeps): Promise<GoApiResult> {
  const clock = GO_ONLINE_CLOCKS.find((c) => c === opts.clock);
  const mode = opts.mode === "full" || opts.mode === "capture" ? opts.mode : null;
  if (!clock || !mode || !isBoardSize(opts.size) || !isElement(opts.element)) return { ok: false, error: "badRequest" };
  const size = opts.size;
  const element = opts.element;
  const name = await deps.nameOf(owner);
  for (let i = 0; i < 5; i++) {
    const code = deps.newCode();
    if (await deps.store.findWaiting(code)) continue;
    const other = ELEMENTS.find((e) => e !== element)!;
    const record: GoRecord = {
      id: deps.newId(),
      ownerId: owner,
      code,
      black: owner,
      white: null,
      blackName: name,
      whiteName: "",
      status: "waiting",
      match: newGoMatch({ size, mode, elements: { [BLACK]: element, [WHITE]: other } as Record<Color, Element>, clockMs: clock * 60_000, startedAt: null }),
      seq: 0,
      ai: null,
      reward: null,
      rewardDay: null,
      createdAt: deps.now,
      updatedAt: deps.now,
    };
    if (await deps.store.create(record)) return { ok: true, view: view(record, BLACK, deps.now) };
  }
  return { ok: false, error: "conflict" };
}

/** Vào phòng bằng mã: cầm Trắng, đồng hồ Đen bắt đầu chạy. */
export async function goJoin(owner: string, code: string, opts: { element: unknown }, deps: GoDeps): Promise<GoApiResult> {
  if (!isElement(opts.element)) return { ok: false, error: "badRequest" };
  const room = await deps.store.findWaiting(code);
  if (!room || deps.now - room.createdAt > GO_ROOM_TTL_MS) return { ok: false, error: "notFound" };
  if (room.black === owner) return { ok: false, error: "ownRoom" };
  const host = room.match.elements[BLACK];
  const element = opts.element === host ? ELEMENTS.find((e) => e !== host)! : opts.element;
  const record: GoRecord = {
    ...room,
    white: owner,
    whiteName: await deps.nameOf(owner),
    status: "playing",
    match: { ...room.match, elements: { [BLACK]: host, [WHITE]: element } as Record<Color, Element>, turnStartedAt: deps.now },
    seq: room.seq + 1,
    updatedAt: deps.now,
  };
  if (!(await deps.store.save(record, room.seq))) return { ok: false, error: "started" };
  return { ok: true, view: view(record, WHITE, deps.now) };
}

/** Xem ván; xử hết giờ nếu bên tới lượt đã cạn đồng hồ. */
export async function goGet(owner: string, id: unknown, deps: GoDeps): Promise<GoApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, side } = got;
  if (record.status !== "playing") return { ok: true, view: view(record, side, deps.now) };
  const settled = goSettle(record.match, deps.now);
  if (settled === record.match) return { ok: true, view: view(record, side, deps.now) };
  const saved = await commit(record, settled, deps);
  if (saved) return { ok: true, view: view(saved.record, side, deps.now, saved.gold) };
  const latest = await deps.store.get(record.id);
  return latest ? { ok: true, view: view(latest, side, deps.now) } : { ok: false, error: "notFound" };
}

/** Một nước của người chơi: điểm trên bàn hoặc PASS. */
export async function goMove(owner: string, id: unknown, point: number, deps: GoDeps): Promise<GoApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, side } = got;
  if (record.status === "waiting") return { ok: false, error: "waiting" };
  const r = goPlay(record.match, side, point, deps.now);
  if (!r.ok) {
    if (r.error === "ended" && record.status === "playing") await goGet(owner, id, deps);
    return { ok: false, error: r.error };
  }
  const saved = await commit(record, machineReply(r.match, record.ai, deps), deps);
  return saved ? { ok: true, view: view(saved.record, side, deps.now, saved.gold) } : { ok: false, error: "conflict" };
}

/** Bắt đầu ván đấu sứ quân có thưởng. Người chơi cầm Trắng thì máy (Đen) đi trước ngay. */
export async function goStartAi(
  owner: string,
  opts: { level: unknown; rival: unknown; human: unknown; size: unknown; mode: unknown; element: unknown; rivalElement: unknown },
  deps: GoDeps,
): Promise<GoApiResult> {
  const level = LEVELS.find((l) => l === opts.level);
  const human = opts.human === BLACK ? BLACK : opts.human === WHITE ? WHITE : null;
  const mode = opts.mode === "full" || opts.mode === "capture" ? opts.mode : null;
  if (!level || !human || !mode || !isBoardSize(opts.size) || !isElement(opts.element) || !isElement(opts.rivalElement)) return { ok: false, error: "badRequest" };
  if (typeof opts.rival !== "string" || opts.rival.length === 0 || opts.rival.length > 64) return { ok: false, error: "badRequest" };
  const machine = human === BLACK ? WHITE : BLACK;
  // Trùng hệ thì máy đổi sang hệ khác để hai bên phân biệt được, như khi vào phòng đấu người.
  const rivalElement = opts.rivalElement === opts.element ? ELEMENTS.find((e) => e !== opts.element)! : opts.rivalElement;
  const ai: GoAi = { level, rival: opts.rival, human };
  const name = await deps.nameOf(owner);
  let match = newGoMatch({ size: opts.size, mode, elements: { [human]: opts.element, [machine]: rivalElement } as Record<Color, Element>, clockMs: 0, startedAt: deps.now });
  match = machineReply(match, ai, deps);
  const record: GoRecord = {
    id: deps.newId(),
    ownerId: owner,
    code: "",
    black: human === BLACK ? owner : "",
    white: human === WHITE ? owner : null,
    blackName: human === BLACK ? name : "",
    whiteName: human === WHITE ? name : "",
    status: match.result ? "ended" : "playing",
    match,
    seq: 0,
    ai,
    reward: null,
    rewardDay: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  if (!(await deps.store.create(record))) return { ok: false, error: "conflict" };
  return { ok: true, view: view(record, human, deps.now) };
}

/** Đầu hàng. Chủ phòng đầu hàng khi chưa ai vào thì là hủy phòng. */
export async function goResignMatch(owner: string, id: unknown, deps: GoDeps): Promise<GoApiResult> {
  const got = await load(owner, id, deps);
  if (typeof got === "string") return { ok: false, error: got };
  const { record, side } = got;
  if (record.status === "ended") return { ok: false, error: "ended" };
  if (record.status === "waiting") {
    const closed: GoRecord = { ...record, status: "ended", seq: record.seq + 1, updatedAt: deps.now };
    if (!(await deps.store.save(closed, record.seq))) return { ok: false, error: "conflict" };
    return { ok: true, view: view(closed, side, deps.now) };
  }
  const r = goResign(record.match, side, deps.now);
  if (!r.ok) return { ok: false, error: r.error };
  const saved = await commit(record, r.match, deps);
  return saved ? { ok: true, view: view(saved.record, side, deps.now, saved.gold) } : { ok: false, error: "conflict" };
}
