// Vây Thành Kỳ (cờ vây nguyên tố) đấu người bằng mã phòng: server làm trọng tài như Tam Quân Kỳ (src/server/tamQuanKy.ts).
// Mọi nước đi qua src/core/co-vay/match.ts để kiểm luật và đồng hồ rồi mới lưu. Giao hữu, không có vàng.
// - Chủ phòng cầm Đen (đi trước), chọn cỡ bàn, luật (đếm điểm hay bắt quân trước), đồng hồ và nguyên tố của mình.
// - Người vào bằng mã cầm Trắng, chọn nguyên tố; trùng hệ chủ phòng thì server đổi sang hệ khác để hai bên phân biệt được.
// Mọi lần ghi kèm điều kiện seq: hai request cùng lúc thì một bên báo `conflict`.

import { ELEMENTS, type Element } from "@/core/battle/elements";
import {
  BLACK,
  GO_ONLINE_CLOCKS,
  WHITE,
  goPlay,
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
  type Mode,
} from "@/core/co-vay";

export type GoStatus = "waiting" | "playing" | "ended";

export interface GoRecord {
  readonly id: string;
  readonly ownerId: string;
  /** Mã phòng, chỉ tìm được khi còn chờ người vào. */
  readonly code: string;
  readonly black: string;
  readonly white: string | null;
  readonly blackName: string;
  readonly whiteName: string;
  readonly status: GoStatus;
  readonly match: GoMatch;
  readonly seq: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface GoStore {
  create(r: GoRecord): Promise<boolean>;
  get(id: string): Promise<GoRecord | null>;
  findWaiting(code: string): Promise<GoRecord | null>;
  /** Ghi khi seq đang lưu đúng bằng `expectedSeq`. */
  save(r: GoRecord, expectedSeq: number): Promise<boolean>;
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
}

/** Phòng chờ quá lâu thì mã hết hạn. */
export const GO_ROOM_TTL_MS = 30 * 60_000;

export interface GoDeps {
  readonly store: GoStore;
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
  readonly serverNow: number;
}

export type GoApiResult = { readonly ok: true; readonly view: GoView } | { readonly ok: false; readonly error: GoError };

function sideOf(r: GoRecord, owner: string): Color | null {
  if (r.black === owner) return BLACK;
  if (r.white === owner) return WHITE;
  return null;
}

function view(r: GoRecord, you: Color, now: number): GoView {
  const m = r.match;
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
    serverNow: now,
  };
}

async function commit(prev: GoRecord, match: GoMatch, deps: GoDeps): Promise<GoRecord | null> {
  const record: GoRecord = { ...prev, match, status: match.result ? "ended" : prev.status, seq: prev.seq + 1, updatedAt: deps.now };
  return (await deps.store.save(record, prev.seq)) ? record : null;
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
  const latest = saved ?? (await deps.store.get(record.id));
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
  const saved = await commit(record, r.match, deps);
  return saved ? { ok: true, view: view(saved, side, deps.now) } : { ok: false, error: "conflict" };
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
  return saved ? { ok: true, view: view(saved, side, deps.now) } : { ok: false, error: "conflict" };
}
