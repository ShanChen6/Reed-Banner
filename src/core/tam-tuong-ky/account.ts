// Tầm Tướng Ký trên tài khoản (LT-04): phiếu, lượt chơi Thường, gợi ý theo ngày, sổ khám phá, chống gửi trùng.
// Thuần: server truyền `now` (ms) và `day` (khóa ngày giờ Việt Nam) vào; file này không đọc đồng hồ, không import progress.
// Luật: docs/02-game-modes/tam-tuong-ky/design-freeze.md (A-5, A-6, A-12, P-8, P-9, P-10, P-23).

import { combineNormal, initialDiscovery, chargesCombine, type Catalog, type DiscoveryState, type InvalidReason } from "./engine";
import { hintFor, type Hint, type HintLevel } from "./hints";
import { recipeKey } from "./graph";
import type { NodeId, RecipeId } from "./types";
import type { TtkRankedWeek } from "./ranked";

export const TTK_START_TICKETS = 3;
export const TTK_MAX_TICKETS = 10;
export const TTK_COMBINES_PER_SESSION = 15;
export const TTK_HINTS_PER_DAY = 2;
/** Lượt dở hết hạn sau 24 giờ (P-9). */
export const TTK_SESSION_MS = 24 * 60 * 60 * 1000;
/** Số phản hồi giữ lại để gửi lại cùng `requestId` không trừ hai lần. */
export const TTK_RECEIPTS_KEEP = 16;
/** Số cặp ghép sai giữ lại để cảnh báo khi người chơi đặt lại đúng cặp đó (Shan, 04/11/2026). */
export const TTK_TRIED_KEEP = 400;

export interface TtkSession {
  readonly id: string;
  readonly combinesLeft: number;
  readonly startedAt: number;
}

/** Phản hồi của một thao tác, lưu lại theo `requestId`. Chỉ dữ liệu JSON. */
export type TtkResponse =
  | { readonly kind: "session"; readonly sessionId: string; readonly charged: boolean }
  | {
      readonly kind: "combine";
      readonly status: "created" | "alreadyKnown" | "noRecipe" | "invalid";
      readonly nodeId?: NodeId;
      readonly recipeId?: RecipeId;
      readonly isCharacter?: boolean;
      readonly nodeAlreadyKnown?: boolean;
      readonly reason?: InvalidReason;
      readonly charged: boolean;
    }
  | { readonly kind: "hint"; readonly hint: Hint | null }
  | {
      readonly kind: "rankedCombine";
      readonly status: "created" | "noRecipe" | "invalid";
      readonly nodeId?: NodeId;
      readonly recipeId?: RecipeId;
      readonly isCharacter?: boolean;
      readonly recipeAlreadyKnown?: boolean;
      readonly reason?: InvalidReason;
      /** Điểm cộng thêm (tướng đề cử ghép ra lần đầu trong tuần). */
      readonly points: number;
    }
  | { readonly kind: "buy"; readonly bought: number; readonly units: number };

export interface TtkReceipt {
  readonly requestId: string;
  readonly response: TtkResponse;
}

export interface TtkAccount {
  readonly version: 1;
  readonly discovery: DiscoveryState;
  readonly tickets: number;
  readonly session: TtkSession | null;
  readonly hints: { readonly day: string; readonly used: number };
  readonly receipts: readonly TtkReceipt[];
  /** Túi nguyên tố tự chọn của chế độ Hạng (P-11): đơn vị, không reset. */
  readonly units: number;
  /** Tuần Hạng gần nhất đã vào; tuần mới thay thế (P-14). */
  readonly ranked: TtkRankedWeek | null;
  /**
   * Cặp đã ghép mà không ra gì (khóa `a>b`), chung cho Thường và Hạng. Chỉ để màn chơi cảnh báo trước khi ghép lại;
   * lần ghép lại vẫn trừ như thường. Cặp nào về sau có công thức (gói mới) thì bỏ khỏi danh sách.
   */
  readonly triedPairs?: readonly string[];
}

export function newTtkAccount(catalog: Catalog): TtkAccount {
  return {
    version: 1,
    discovery: initialDiscovery(catalog),
    tickets: TTK_START_TICKETS,
    session: null,
    hints: { day: "", used: 0 },
    receipts: [],
    units: 0,
    ranked: null,
  };
}

const isInt = (x: unknown, min: number, max: number): x is number => Number.isInteger(x) && (x as number) >= min && (x as number) <= max;
const strings = (x: unknown): string[] => (Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : []);

/** Đọc dữ liệu lưu (đã qua JSON). Hỏng hoặc thiếu thì null: chỗ dùng tạo tài khoản mới. Không cần catalog. */
export function parseTtkAccount(raw: unknown): TtkAccount | null {
  const a = raw as Partial<TtkAccount> | null;
  if (!a || typeof a !== "object" || a.version !== 1) return null;
  const d = a.discovery as Partial<DiscoveryState> | undefined;
  if (!d || typeof d.packId !== "string" || !Number.isInteger(d.contentVersion)) return null;
  const s = a.session as Partial<TtkSession> | null | undefined;
  const session =
    s && typeof s.id === "string" && isInt(s.combinesLeft, 0, TTK_COMBINES_PER_SESSION) && Number.isFinite(s.startedAt)
      ? { id: s.id, combinesLeft: s.combinesLeft, startedAt: s.startedAt as number }
      : null;
  const h = a.hints as Partial<TtkAccount["hints"]> | undefined;
  return {
    version: 1,
    discovery: {
      schemaVersion: Number.isInteger(d.schemaVersion) ? (d.schemaVersion as number) : 1,
      packId: d.packId,
      contentVersion: d.contentVersion as number,
      discoveredNodeIds: [...new Set(strings(d.discoveredNodeIds))],
      discoveredRecipeIds: [...new Set(strings(d.discoveredRecipeIds))],
    },
    tickets: isInt(a.tickets, 0, TTK_MAX_TICKETS) ? a.tickets : 0,
    session,
    hints: { day: typeof h?.day === "string" ? h.day : "", used: isInt(h?.used, 0, TTK_HINTS_PER_DAY) ? h.used : 0 },
    receipts: Array.isArray(a.receipts)
      ? (a.receipts as unknown[])
          .filter((r): r is TtkReceipt => !!r && typeof (r as TtkReceipt).requestId === "string" && typeof (r as TtkReceipt).response === "object")
          .slice(-TTK_RECEIPTS_KEEP)
      : [],
    units: isInt(a.units, 0, 1_000_000) ? a.units : 0,
    ranked: parseRankedWeek(a.ranked),
    ...(Array.isArray(a.triedPairs) ? { triedPairs: [...new Set(strings(a.triedPairs).filter((k) => /^[^>]+>[^>]+$/.test(k)))].slice(-TTK_TRIED_KEEP) } : {}),
  };
}

/** Ghi một cặp ghép sai (đưa lên cuối nếu đã có), giữ tối đa `TTK_TRIED_KEEP` cặp gần nhất. */
export function withTriedPair(account: TtkAccount, first: NodeId, second: NodeId): TtkAccount {
  const key = recipeKey(first, second);
  return { ...account, triedPairs: [...(account.triedPairs ?? []).filter((k) => k !== key), key].slice(-TTK_TRIED_KEEP) };
}

/** Cặp đã thử mà catalog đang chạy vẫn không có công thức: màn chơi cảnh báo khi đặt lại cặp này. */
export function triedPairsOf(catalog: Catalog, account: TtkAccount): readonly string[] {
  return (account.triedPairs ?? []).filter((k) => !catalog.byKey.has(k));
}

const counts = (x: unknown): Record<string, number> =>
  x && typeof x === "object"
    ? Object.fromEntries(Object.entries(x as Record<string, unknown>).filter(([, v]) => isInt(v, 1, 1_000_000)) as [string, number][])
    : {};

function parseRankedWeek(raw: unknown): TtkRankedWeek | null {
  const w = raw as Partial<TtkRankedWeek> | null;
  if (!w || typeof w !== "object" || typeof w.week !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(w.week)) return null;
  return {
    week: w.week,
    stock: counts(w.stock),
    heroesCreated: [...new Set(strings(w.heroesCreated))],
    unitsSpent: isInt(w.unitsSpent, 0, 1_000_000) ? w.unitsSpent : 0,
    points: isInt(w.points, 0, 1_000_000) ? w.points : 0,
    shopBought: isInt(w.shopBought, 0, 100) ? w.shopBought : 0,
  };
}

/**
 * Khớp sổ với catalog đang chạy (test contract 7.5): bỏ ID không còn trong catalog, luôn có đủ starter, cập nhật
 * `contentVersion`. Tướng đã mở không mất khi catalog thêm nội dung.
 */
export function normalizeTtkAccount(
  account: TtkAccount,
  catalog: Catalog,
  /** ID còn giữ trong sổ dù catalog đang chạy không có (gói đã viết nhưng đang tắt). Mặc định: chỉ ID của catalog. */
  known?: { readonly nodes: ReadonlySet<string>; readonly recipes: ReadonlySet<string> },
): TtkAccount {
  const keepNode = (id: string) => catalog.nodes.has(id) || (known?.nodes.has(id) ?? false);
  const recipeIds = new Set(catalog.pack.recipes.map((r) => r.id));
  const keepRecipe = (id: string) => recipeIds.has(id) || (known?.recipes.has(id) ?? false);
  const nodes = account.discovery.discoveredNodeIds.filter(keepNode);
  const discovery: DiscoveryState = {
    ...account.discovery,
    packId: catalog.pack.id,
    contentVersion: catalog.pack.contentVersion,
    discoveredNodeIds: [...catalog.starters, ...nodes.filter((id) => !catalog.starters.includes(id))],
    discoveredRecipeIds: account.discovery.discoveredRecipeIds.filter(keepRecipe),
  };
  return { ...account, discovery };
}

/** Lượt còn dùng được lúc `now`. */
export function activeSession(account: TtkAccount, now: number): TtkSession | null {
  const s = account.session;
  return s && s.combinesLeft > 0 && now - s.startedAt < TTK_SESSION_MS ? s : null;
}

export function hintsLeft(account: TtkAccount, day: string): number {
  return TTK_HINTS_PER_DAY - (account.hints.day === day ? account.hints.used : 0);
}

export type TtkError = "noTicket" | "noSession" | "noHint" | "badRequest";

export type TtkResult =
  | { readonly ok: true; readonly account: TtkAccount; readonly response: TtkResponse; readonly replayed: boolean }
  | { readonly ok: false; readonly error: TtkError };

export function withReceipt(account: TtkAccount, requestId: string, response: TtkResponse): TtkAccount {
  return { ...account, receipts: [...account.receipts, { requestId, response }].slice(-TTK_RECEIPTS_KEEP) };
}

/** Cùng `requestId` đã xử lý thì trả lại đúng phản hồi cũ, không đổi gì (P-23). */
export function replayReceipt(account: TtkAccount, requestId: string): TtkResult | null {
  const r = account.receipts.find((x) => x.requestId === requestId);
  return r ? { ok: true, account, response: r.response, replayed: true } : null;
}

export const validRequestId = (id: unknown): id is string => typeof id === "string" && id.length >= 8 && id.length <= 64;

/** Mở lượt Thường: có lượt dở thì trả lượt đó, không trừ phiếu; không thì trừ 1 phiếu. */
export function openSession(account: TtkAccount, requestId: unknown, now: number): TtkResult {
  if (!validRequestId(requestId)) return { ok: false, error: "badRequest" };
  const again = replayReceipt(account, requestId);
  if (again) return again;
  const cur = activeSession(account, now);
  if (cur) {
    const response: TtkResponse = { kind: "session", sessionId: cur.id, charged: false };
    return { ok: true, account: withReceipt(account, requestId, response), response, replayed: false };
  }
  if (account.tickets < 1) return { ok: false, error: "noTicket" };
  const session: TtkSession = { id: requestId, combinesLeft: TTK_COMBINES_PER_SESSION, startedAt: now };
  const response: TtkResponse = { kind: "session", sessionId: session.id, charged: true };
  return { ok: true, account: withReceipt({ ...account, tickets: account.tickets - 1, session }, requestId, response), response, replayed: false };
}

/** Ghép chế độ Thường trong lượt đang mở. Chỉ `created` và `noRecipe` trừ lần ghép. */
export function combineInSession(catalog: Catalog, account: TtkAccount, requestId: unknown, first: unknown, second: unknown, now: number): TtkResult {
  if (!validRequestId(requestId) || typeof first !== "string" || typeof second !== "string") return { ok: false, error: "badRequest" };
  const again = replayReceipt(account, requestId);
  if (again) return again;
  const session = activeSession(account, now);
  if (!session) return { ok: false, error: "noSession" };
  const out = combineNormal(catalog, account.discovery, first, second);
  const charged = chargesCombine(out);
  const response: TtkResponse =
    out.status === "created"
      ? { kind: "combine", status: out.status, nodeId: out.nodeId, recipeId: out.recipeId, isCharacter: out.isCharacter, nodeAlreadyKnown: out.nodeAlreadyKnown, charged }
      : out.status === "alreadyKnown"
        ? { kind: "combine", status: out.status, nodeId: out.nodeId, recipeId: out.recipeId, charged }
        : out.status === "invalid"
          ? { kind: "combine", status: out.status, reason: out.reason, charged }
          : { kind: "combine", status: out.status, charged };
  const next: TtkAccount = {
    ...(out.status === "noRecipe" ? withTriedPair(account, first, second) : account),
    discovery: out.next,
    session: charged ? { ...session, combinesLeft: session.combinesLeft - 1 } : session,
  };
  return { ok: true, account: withReceipt(next, requestId, response), response, replayed: false };
}

/** Gợi ý (chỉ chế độ Thường): 2 lượt mỗi ngày, không cộng dồn; không còn gì để gợi ý thì không trừ lượt. */
export function spendHint(catalog: Catalog, account: TtkAccount, requestId: unknown, level: unknown, day: string): TtkResult {
  if (!validRequestId(requestId) || (level !== 1 && level !== 2)) return { ok: false, error: "badRequest" };
  const again = replayReceipt(account, requestId);
  if (again) return again;
  if (hintsLeft(account, day) <= 0) return { ok: false, error: "noHint" };
  const hint = hintFor(catalog, account.discovery, level as HintLevel);
  const used = (account.hints.day === day ? account.hints.used : 0) + (hint ? 1 : 0);
  const response: TtkResponse = { kind: "hint", hint };
  return { ok: true, account: withReceipt({ ...account, hints: { day, used } }, requestId, response), response, replayed: false };
}

/** Cộng phiếu từ thưởng chế độ khác (P-10), không vượt trần. */
export function grantTickets(account: TtkAccount, count: number): TtkAccount {
  return { ...account, tickets: Math.min(TTK_MAX_TICKETS, account.tickets + Math.max(0, count)) };
}
