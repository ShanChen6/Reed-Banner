// Quần Hùng online (PvP) trên server: hàng đợi ghép trận theo Elo, trận có thẩm quyền, chạy bù lượt hết giờ và AI tiếp quản
// kiểu "tính lười" (không có tiến trình nền: mỗi lần ai đó hỏi thì trận được chạy bù tới hiện tại), tính điểm hạng sau trận.
// Luật ở @/core/pvp và docs/02-game-modes/future/quan-hung-pvp-truc-tiep.md. Bản đầu chỉ có 1vs1 (Đinh Bộ Lĩnh); 3vs3 là bước sau.
// `now` và `seed` luôn do chỗ gọi truyền vào, nên test chạy được mà không đụng giờ hệ thống.

import {
  PVP_ELO_START,
  PVP_TEAM_MIN_HEROES,
  PVP_FORGIVE_PER_DAY,
  PVP_GOLD_DAILY_CAP,
  PVP_GOLD_PER_OPPONENT,
  pvpBanMs,
  pvpGoldBase,
  vnWeek,
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
  pvpLogAppend,
  PROFESSIONS,
  ELEMENTS,
  type Element,
  type Profession,
  pvpSettle,
  pvpTakeover,
  pvpTimeout,
  vnDay,
  TURN_MS,
  type BattleAction,
  type BattleEvent,
  type PvpFormat,
  type PvpPlayerResult,
  type PvpDraft,
  type PvpState,
} from "@/core";
import { loadProfile, updateProfile, type ProfileStore } from "./profiles";
import { recordSeason, type SeasonStore } from "./seasons";
import { heroesOf, type PvpRoomRecord } from "./pvpRooms";
import { buildDraft, pickTeamGroup } from "./pvpTeam";

/** Bản đầu chỉ mở 1vs1. */
export const PVP_FORMATS: readonly PvpFormat[] = ["duel", "team"];

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
  /** Tuần (giờ Việt Nam) của `breakCount`. */
  readonly breakWeek: string;
  /** Số trận bị tính phá trận trong tuần `breakWeek`. */
  readonly breakCount: number;
  /** Bị hạn chế ghép trận tới mốc này (ms); 0 là không. */
  readonly banUntil: number;
  readonly updatedAt: number;
}

/** Kết quả một người sau trận, kèm vàng đã nhận và hậu quả phá trận. */
export interface PvpSettled extends PvpPlayerResult {
  readonly gold: number;
  /** Bị cảnh cáo phá trận (lần đầu trong tuần). */
  readonly warned: boolean;
  /** Bị hạn chế ghép trận tới mốc này (ms), null nếu không. */
  readonly banUntil: number | null;
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
  readonly results: readonly PvpSettled[] | null;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly settledAt: number | null;
}

/** active: cấm chọn; prep: chuẩn bị đội hình và trang bị; done: đã dựng trận. */
export type PvpDraftStatus = "active" | "prep" | "done" | "abandoned";

export interface PvpDraftRecord {
  readonly id: string;
  readonly state: PvpDraft;
  readonly seq: number;
  readonly status: PvpDraftStatus;
  /** Trận được dựng khi cấm chọn xong. */
  readonly matchId: string | null;
  readonly owners: readonly string[];
  readonly createdAt: number;
  readonly updatedAt: number;
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
  claimGroup(owners: readonly string[], matchId: string): Promise<boolean>;
  createMatch(record: PvpMatchRecord): Promise<void>;
  getMatch(id: string): Promise<PvpMatchRecord | null>;
  saveMatch(record: PvpMatchRecord, expectedSeq: number): Promise<boolean>;
  createDraft(record: PvpDraftRecord): Promise<void>;
  getDraft(id: string): Promise<PvpDraftRecord | null>;
  saveDraft(record: PvpDraftRecord, expectedSeq: number): Promise<boolean>;
  /** Đặt `settledAt` và kết quả đúng một lần; true chỉ cho lần gọi đầu tiên. */
  claimSettle(id: string, results: readonly PvpPlayerResult[], now: number): Promise<boolean>;
  /** Ghi đè kết quả đã tính xong (kèm vàng và hậu quả); chỉ người thắng `claimSettle` gọi. */
  finalizeResults(id: string, results: readonly PvpSettled[]): Promise<void>;
  /** Vàng PvP đã nhận trong ngày `day`. */
  goldToday(ownerId: string, day: string): Promise<number>;
  addGold(ownerId: string, day: string, amount: number): Promise<void>;
  /** Số trận đã bắt đầu giữa hai người trong ngày (cùng một con số cho cả hai chiều). */
  pairMatches(ownerId: string, opponentId: string, day: string): Promise<number>;
  recordPair(a: string, b: string, day: string): Promise<void>;
  /** Ghi một lần phá trận trong tuần `week` (tuần mới thì đếm lại từ 1) và trả số lần trong tuần. */
  recordBreak(ownerId: string, format: PvpFormat, week: string, now: number): Promise<number>;
  setBan(ownerId: string, format: PvpFormat, until: number, now: number): Promise<void>;
  /** Phòng mời bằng mã. */
  createRoom(room: PvpRoomRecord): Promise<boolean>;
  getRoom(code: string): Promise<PvpRoomRecord | null>;
  saveRoom(room: PvpRoomRecord, expectedSeq: number): Promise<boolean>;
  /** Phòng đang ở của người này, null nếu không ở phòng nào. */
  roomCodeOf(ownerId: string): Promise<string | null>;
  /** Đặt người vào phòng; false khi người này đã ở một phòng khác. */
  setMember(ownerId: string, code: string): Promise<boolean>;
  clearMember(ownerId: string, code: string): Promise<void>;
  /** Gắn trận đang chơi vào hàng của người này để `pvpOverview` mở lại trận (như khi được ghép trong hàng đợi). */
  attachMatch(ownerId: string, format: PvpFormat, matchId: string, now: number): Promise<void>;
}

const defaultRating = (ownerId: string, format: PvpFormat, now = 0): PvpRatingRow => ({
  ownerId,
  format,
  rating: PVP_ELO_START,
  wins: 0,
  losses: 0,
  forgiveDay: "",
  forgiveUsed: 0,
  breakWeek: "",
  breakCount: 0,
  banUntil: 0,
  updatedAt: now,
});

export class MemoryPvpStore implements PvpStore {
  private readonly ratings = new Map<string, PvpRatingRow>();
  private readonly queue = new Map<string, PvpQueueRow>();
  private readonly matches = new Map<string, PvpMatchRecord>();
  private readonly drafts = new Map<string, PvpDraftRecord>();
  private readonly gold = new Map<string, number>();
  private readonly pairs = new Map<string, number>();
  private readonly rooms = new Map<string, PvpRoomRecord>();
  private readonly members = new Map<string, string>();

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

  async claimGroup(owners: readonly string[], matchId: string): Promise<boolean> {
    const rows = owners.map((o) => this.queue.get(o));
    if (rows.some((r) => !r || r.matchId !== null)) return false;
    for (const r of rows) this.queue.set(r!.ownerId, { ...r!, matchId });
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

  async createDraft(r: PvpDraftRecord): Promise<void> {
    this.drafts.set(r.id, structuredClone(r));
  }

  async getDraft(id: string): Promise<PvpDraftRecord | null> {
    const r = this.drafts.get(id);
    return r ? structuredClone(r) : null;
  }

  async saveDraft(r: PvpDraftRecord, expectedSeq: number): Promise<boolean> {
    const cur = this.drafts.get(r.id);
    if (!cur || cur.seq !== expectedSeq) return false;
    this.drafts.set(r.id, structuredClone(r));
    return true;
  }

  async claimSettle(id: string, results: readonly PvpPlayerResult[], now: number): Promise<boolean> {
    const cur = this.matches.get(id);
    if (!cur || cur.settledAt !== null) return false;
    this.matches.set(id, { ...cur, settledAt: now, results: structuredClone(results.map((r) => ({ ...r, gold: 0, warned: false, banUntil: null }))) });
    return true;
  }

  async finalizeResults(id: string, results: readonly PvpSettled[]): Promise<void> {
    const cur = this.matches.get(id);
    if (cur) this.matches.set(id, { ...cur, results: structuredClone([...results]) });
  }

  async goldToday(ownerId: string, day: string): Promise<number> {
    return this.gold.get(`${ownerId}|${day}`) ?? 0;
  }

  async addGold(ownerId: string, day: string, amount: number): Promise<void> {
    this.gold.set(`${ownerId}|${day}`, (this.gold.get(`${ownerId}|${day}`) ?? 0) + amount);
  }

  async pairMatches(ownerId: string, opponentId: string, day: string): Promise<number> {
    return this.pairs.get(`${day}|${ownerId}|${opponentId}`) ?? 0;
  }

  async recordPair(a: string, b: string, day: string): Promise<void> {
    for (const [x, y] of [[a, b], [b, a]] as const) this.pairs.set(`${day}|${x}|${y}`, (this.pairs.get(`${day}|${x}|${y}`) ?? 0) + 1);
  }

  async recordBreak(ownerId: string, format: PvpFormat, week: string, now: number): Promise<number> {
    const cur = this.ratings.get(`${ownerId}|${format}`) ?? defaultRating(ownerId, format);
    const count = (cur.breakWeek === week ? cur.breakCount : 0) + 1;
    this.ratings.set(`${ownerId}|${format}`, { ...cur, breakWeek: week, breakCount: count, updatedAt: now });
    return count;
  }

  async setBan(ownerId: string, format: PvpFormat, until: number, now: number): Promise<void> {
    const cur = this.ratings.get(`${ownerId}|${format}`) ?? defaultRating(ownerId, format);
    this.ratings.set(`${ownerId}|${format}`, { ...cur, banUntil: until, updatedAt: now });
  }

  async createRoom(room: PvpRoomRecord): Promise<boolean> {
    if (this.rooms.has(room.code)) return false;
    this.rooms.set(room.code, structuredClone(room));
    return true;
  }

  async getRoom(code: string): Promise<PvpRoomRecord | null> {
    const r = this.rooms.get(code);
    return r ? structuredClone(r) : null;
  }

  async saveRoom(room: PvpRoomRecord, expectedSeq: number): Promise<boolean> {
    const cur = this.rooms.get(room.code);
    if (!cur || cur.seq !== expectedSeq) return false;
    this.rooms.set(room.code, structuredClone(room));
    return true;
  }

  async roomCodeOf(ownerId: string): Promise<string | null> {
    return this.members.get(ownerId) ?? null;
  }

  async setMember(ownerId: string, code: string): Promise<boolean> {
    const cur = this.members.get(ownerId);
    if (cur && cur !== code) return false;
    this.members.set(ownerId, code);
    return true;
  }

  async clearMember(ownerId: string, code: string): Promise<void> {
    if (this.members.get(ownerId) === code) this.members.delete(ownerId);
  }

  async attachMatch(ownerId: string, format: PvpFormat, matchId: string, now: number): Promise<void> {
    this.queue.set(ownerId, { ownerId, format, rating: 0, enqueuedAt: now, lastSeen: now, matchId });
  }
}

export interface PvpDeps {
  readonly pvp: PvpStore;
  readonly profiles: ProfileStore;
  /** Điểm mùa theo tuần của Đấu người; bỏ trống (test) thì không ghi. */
  readonly seasons?: SeasonStore;
  readonly now: number;
  /** Hạt giống cho trận mới và id trận. */
  readonly seed: number;
  readonly newId: () => string;
  /** Tên hiển thị của tài khoản (trận 3vs3 hiện tên người chơi); bỏ trống thì không có tên. */
  readonly nameOf?: (ownerId: string) => Promise<string>;
}

// ---------------------------------------------------------------------------------------------------------------------
// Hàng đợi và ghép trận
// ---------------------------------------------------------------------------------------------------------------------

/** Khoảng điểm cho phép ghép sau `waitedMs` chờ; về vô hạn sau `PVP_MATCH_ANY_AFTER_MS`. */
export function pvpMatchWindow(waitedMs: number): number {
  if (waitedMs >= PVP_MATCH_ANY_AFTER_MS) return Number.POSITIVE_INFINITY;
  return PVP_MATCH_WINDOW + Math.floor(Math.max(0, waitedMs) / PVP_MATCH_WINDOW_EVERY_MS) * PVP_MATCH_WINDOW_STEP;
}

export type PvpQueueError = "badFormat" | "inMatch" | "banned" | "badBuild" | "needHeroes";

/** Nghề và hệ Đinh Bộ Lĩnh mang vào trận 1vs1. */
export interface PvpBuild {
  readonly element: Element;
  readonly profession: Profession;
}

/** Vào hàng đợi. Đang có trận dở thì không vào được (hết hạn tự đóng khi trận chạy bù tới lúc xong). */
export async function pvpEnqueue(
  ownerId: string,
  format: PvpFormat,
  deps: PvpDeps,
  build?: { readonly element?: unknown; readonly profession?: unknown },
): Promise<{ ok: true } | { ok: false; error: PvpQueueError; until?: number }> {
  if (!PVP_FORMATS.includes(format)) return { ok: false, error: "badFormat" };
  // Chọn nghề và hệ trước khi vào hàng đợi: lưu vào hồ sơ như Giao Tranh, trận dựng theo hồ sơ lúc ghép được.
  if (build && (build.element !== undefined || build.profession !== undefined)) {
    const el = build.element;
    const pr = build.profession;
    if (!ELEMENTS.includes(el as Element) || !PROFESSIONS.includes(pr as Profession)) return { ok: false, error: "badBuild" };
    await updateProfile(deps.profiles, ownerId, (p) => ({ ok: true, profile: { ...p, element: el as Element, profession: pr as Profession } }), deps.now);
  }
  // 3vs3: cần từ PVP_TEAM_MIN_HEROES tướng (kể cả Đinh Bộ Lĩnh) để luôn còn tướng chọn dù bị cấm 6 lượt.
  if (format === "team" && (await heroesOf(ownerId, deps)).length < PVP_TEAM_MIN_HEROES) return { ok: false, error: "needHeroes" };
  const own = await deps.pvp.rating(ownerId, format);
  if (own.banUntil > deps.now) return { ok: false, error: "banned", until: own.banUntil };
  const cur = await deps.pvp.queueOf(ownerId);
  if (cur?.matchId) {
    const m = await deps.pvp.getMatch(cur.matchId);
    if (m && m.status === "active") return { ok: false, error: "inMatch" };
    if (!m && ["active", "prep"].includes((await deps.pvp.getDraft(cur.matchId))?.status ?? "")) return { ok: false, error: "inMatch" };
  }
  const { rating } = own;
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
  if (me.format === "team") return tryTeamMatch(me, deps);
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
  const won = await deps.pvp.claimGroup([first.ownerId, second.ownerId], record.id);
  if (won) await deps.pvp.recordPair(first.ownerId, second.ownerId, vnDay(deps.now));
  if (!won) {
    // Người kia vừa bị ghép hoặc rời đi: bỏ trận dư này, không ảnh hưởng ai.
    await deps.pvp.saveMatch({ ...record, status: "abandoned", seq: 2 }, 1);
    return null;
  }
  return record.id;
}

/** Ghép 3vs3: gom nhóm trong hàng chờ, chờ lâu thì máy điền chỗ trống. */
async function tryTeamMatch(me: PvpQueueRow, deps: PvpDeps): Promise<string | null> {
  const others = (await deps.pvp.waiting("team", deps.now - PVP_QUEUE_STALE_MS)).filter((r) => r.ownerId !== me.ownerId);
  const group = pickTeamGroup(me, others, deps.now, pvpMatchWindow);
  if (!group) return null;
  const record = await buildDraft(group, deps);
  await deps.pvp.createDraft(record);
  if (!(await deps.pvp.claimGroup(record.owners, record.id))) {
    // Có người vừa bị ghép chỗ khác hoặc rời hàng đợi: bỏ phiên dư, không ảnh hưởng ai.
    await deps.pvp.saveDraft({ ...record, status: "abandoned", seq: 2 }, 1);
    return null;
  }
  return record.id;
}

export interface PvpOverview {
  readonly ratings: { readonly duel: { readonly rating: number; readonly wins: number; readonly losses: number }; readonly team: { readonly rating: number; readonly wins: number; readonly losses: number } };
  readonly queue: { readonly format: PvpFormat; readonly waitedMs: number } | null;
  /** Trận đang chơi (hoặc vừa ghép); null khi không có. */
  readonly matchId: string | null;
  /** Phiên cấm chọn 3vs3 đang chờ người chơi; null khi không có. */
  readonly draftId: string | null;
  /** Số lần còn được tha mất kết nối hôm nay (thể thức 1vs1). */
  readonly forgiveLeft: number;
  /** Nghề và hệ Đinh Bộ Lĩnh trong hồ sơ, sẽ mang vào trận kế tiếp. */
  readonly build: PvpBuild;
  /** Vàng PvP còn nhận được hôm nay (trần mỗi ngày trừ số đã nhận); số trận không giới hạn. */
  readonly goldLeft: number;
  /** Số tướng đang có (kể cả Đinh Bộ Lĩnh) và số tướng tối thiểu để vào 3vs3 xếp hạng. */
  readonly heroCount: { readonly have: number; readonly need: number };
  /** Mã phòng mời đang ở (3vs3 giao hữu), null nếu không ở phòng nào. */
  readonly room: string | null;
  /** Số lần bị tính phá trận trong tuần này. */
  readonly breakCount: number;
  /** Bị hạn chế ghép trận tới mốc này (ms), null nếu không. */
  readonly banUntil: number | null;
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
  let draftId: string | null = null;
  if (q?.matchId) {
    const m = await deps.pvp.getMatch(q.matchId);
    if (m) {
      if (m.status === "active") matchId = m.id;
    } else {
      // Mã trong hàng đợi là phiên cấm chọn: đang cấm chọn thì vào lại màn đó, xong thì sang trận đã dựng.
      const dr = await deps.pvp.getDraft(q.matchId);
      if (dr?.status === "active" || dr?.status === "prep") draftId = dr.id;
      else if (dr?.status === "done" && dr.matchId) {
        const built = await deps.pvp.getMatch(dr.matchId);
        if (built?.status === "active" && built.owners.includes(ownerId)) matchId = built.id;
        else if (built && !built.owners.includes(ownerId)) await deps.pvp.dequeue(ownerId);
      }
    }
  }
  const r = await deps.pvp.rating(ownerId, "duel");
  const rt = await deps.pvp.rating(ownerId, "team");
  const day = vnDay(deps.now);
  const gold = await deps.pvp.goldToday(ownerId, day);
  const { profile } = await loadProfile(deps.profiles, ownerId);
  // Rời phòng khi trận của phòng đã xong hoặc phòng đã đóng, để vào phòng khác được.
  let room = await deps.pvp.roomCodeOf(ownerId);
  if (room) {
    const rr = await deps.pvp.getRoom(room);
    const over = !rr || rr.status === "closed" || (rr.status === "started" && (!rr.matchId || (await deps.pvp.getMatch(rr.matchId))?.status !== "active"));
    if (over) {
      await deps.pvp.clearMember(ownerId, room);
      room = null;
    }
  }
  return {
    build: { element: profile.element, profession: profile.profession },
    heroCount: { have: (await heroesOf(ownerId, deps)).length, need: PVP_TEAM_MIN_HEROES },
    room,
    goldLeft: Math.max(0, PVP_GOLD_DAILY_CAP - gold),
    breakCount: r.breakWeek === vnWeek(deps.now) ? r.breakCount : 0,
    banUntil: r.banUntil > deps.now ? r.banUntil : null,
    ratings: { duel: { rating: r.rating, wins: r.wins, losses: r.losses }, team: { rating: rt.rating, wins: rt.wins, losses: rt.losses } },
    queue: q && q.matchId === null ? { format: q.format, waitedMs: deps.now - q.enqueuedAt } : null,
    matchId,
    draftId,
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
  /** Giao hữu (phòng mời bằng mã): không đổi điểm, không có vàng. */
  readonly friendly: boolean;
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
  readonly seats: readonly { readonly side: 0 | 1; readonly position: number; readonly mine: boolean; readonly ai: boolean; readonly name: string | null }[];
  readonly clock: { readonly side: 0 | 1; readonly actor: number; readonly mine: boolean; readonly deadline: number | null; readonly remainingMs: number | null };
  readonly battle: Omit<PvpState["battle"], "boardRng" | "aiRng">;
  /** Diễn biến gần nhất (tối đa 80 mục), mã tăng dần để client bỏ mục đã đọc. */
  readonly log: PvpState["log"];
  readonly winner: 0 | 1 | null;
  /** Kết quả điểm sau trận, chỉ của chính người hỏi. */
  readonly result: PvpSettled | null;
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
    friendly: rec.state.friendly === true,
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
      row.map((p, position) => ({ side: side as 0 | 1, position, mine: p === owner, ai: p === null, name: rec.state.names?.[side as 0 | 1][position] ?? null })),
    ),
    clock: { side: clock.side, actor: clock.actor, mine: clock.player === owner, deadline: clock.deadline, remainingMs: clock.remainingMs },
    battle,
    log: rec.state.log,
    winner: rec.state.battle.winner,
    result: rec.results?.find((r) => r.player === owner) ?? null,
  };
}

/**
 * Tính điểm hạng, vàng và hậu quả phá trận khi trận vừa xong; chỉ một request thắng quyền `claimSettle`.
 * Vàng chỉ cho người được tính điểm, giảm theo số AI trong trận, có trần mỗi ngày và chỉ ở `PVP_GOLD_PER_OPPONENT` trận
 * đầu mỗi ngày với cùng một đối thủ. Phá trận lần đầu trong tuần là cảnh cáo, từ lần hai bị hạn chế ghép trận.
 */
async function settleIfOver(rec: PvpMatchRecord, deps: PvpDeps): Promise<PvpMatchRecord> {
  if (rec.state.battle.winner === null || rec.settledAt !== null) return rec;
  // Giao hữu: chỉ đánh dấu đã xong, không điểm hạng, không vàng, không bảng mùa.
  if (rec.state.friendly === true) {
    await deps.pvp.claimSettle(rec.id, [], deps.now);
    return (await deps.pvp.getMatch(rec.id)) ?? rec;
  }
  const ratings: Record<string, number> = {};
  for (const p of rec.owners) ratings[p] = (await deps.pvp.rating(p, rec.format)).rating;
  const base = pvpSettle(rec.state, ratings);
  if (!(await deps.pvp.claimSettle(rec.id, base, deps.now))) return (await deps.pvp.getMatch(rec.id)) ?? rec;
  const day = vnDay(deps.now);
  const week = vnWeek(deps.now);
  const aiCount = rec.state.seats.flat().filter((p) => p === null).length;
  const results: PvpSettled[] = [];
  for (const r of base) {
    await deps.pvp.applyResult(r.player, rec.format, { delta: r.delta, won: r.won, counted: r.counted, forgiven: r.disconnects, day, now: deps.now });
    // Điểm mùa = tổng Elo đổi trong tuần của các trận được tính; chỉ người có tổng dương lên bảng.
    if (r.counted && r.delta !== 0) await recordSeason(deps.seasons, { mode: "pvp", ownerId: r.player, now: deps.now, add: r.delta });
    let gold = 0;
    if (r.counted) {
      // Giới hạn vàng theo cùng một đối thủ chỉ áp dụng ở 1vs1.
      const opponent = rec.format === "duel" ? rec.owners.find((o) => o !== r.player) : undefined;
      const meetings = opponent ? await deps.pvp.pairMatches(r.player, opponent, day) : 0;
      if (meetings <= PVP_GOLD_PER_OPPONENT) {
        const left = Math.max(0, PVP_GOLD_DAILY_CAP - (await deps.pvp.goldToday(r.player, day)));
        gold = Math.min(pvpGoldBase(r.won, aiCount), left);
      }
      if (gold > 0) {
        const paid = await updateProfile(deps.profiles, r.player, (p) => ({ ok: true, profile: { ...p, gold: p.gold + gold } }), deps.now);
        if (paid.ok) await deps.pvp.addGold(r.player, day, gold);
        else gold = 0;
      }
    }
    let warned = false;
    let banUntil: number | null = null;
    if (r.breaker) {
      const count = await deps.pvp.recordBreak(r.player, rec.format, week, deps.now);
      const ms = pvpBanMs(count);
      if (ms > 0) {
        banUntil = deps.now + ms;
        await deps.pvp.setBan(r.player, rec.format, banUntil, deps.now);
      } else warned = true;
    }
    results.push({ ...r, gold, warned, banUntil });
  }
  await deps.pvp.finalizeResults(rec.id, results);
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
      state = pvpLogAppend(caught.state, caught.events);
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
        state = pvpLogAppend(r.state, r.events);
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
