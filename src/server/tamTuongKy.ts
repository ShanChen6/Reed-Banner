// Tầm Tướng Ký chế độ Thường trên server (LT-04). Server giữ phiếu, lượt, gợi ý theo ngày và sổ khám phá trong hồ sơ
// tài khoản; client chỉ gửi ý định (mở lượt, ghép hai yếu tố, xin gợi ý) kèm `requestId`. Ghi qua `updateProfile`
// (điều kiện version, thử lại khi hai request cùng lúc). Luật thuần ở @/core/tam-tuong-ky/account.
// Thiết kế: docs/02-game-modes/future/17-tam-tuong-ky-lt04-server.md.

import { seasonKey, vnDay } from "@/core";
import {
  KNOWN_NODE_IDS,
  KNOWN_RECIPE_IDS,
  activePack,
  activeSession,
  triedPairsOf,
  buildCatalog,
  combineInSession,
  discoveredCharacters,
  hintsLeft,
  newTtkAccount,
  normalizeTtkAccount,
  openSession,
  spendHint,
  TTK_COMBINES_PER_SESSION,
  TTK_HINTS_PER_DAY,
  TTK_MAX_TICKETS,
  TTK_SESSION_MS,
  buyBundle,
  combineInRanked,
  enterRankedWeek,
  featuredFor,
  pointsOfSeasonScore,
  rankedSeasonScore,
  TTK_HERO_POINTS,
  TTK_SHOP_MAX_PER_WEEK,
  TTK_SHOP_PRICE,
  type DiscoveryState,
  type TtkAccount,
  type TtkError,
  type TtkResponse,
  type TtkResult,
} from "@/core/tam-tuong-ky";
import { loadProfile, updateProfile, type ProfileStore } from "./profiles";
import { recordSeason, type SeasonStore } from "./seasons";

/** Sổ dựng sẵn theo các gói đã duyệt: Gói 1, Gói 1 + 2, Gói 1 + 2 + 3. */
const CATALOG_1 = buildCatalog(activePack(false));
const CATALOG_1_2 = buildCatalog(activePack(true));
const CATALOG_1_2_3 = buildCatalog(activePack(true, true));
const catalogOf = (deps: { readonly pack2?: boolean; readonly pack3?: boolean }) =>
  deps.pack2 && deps.pack3 ? CATALOG_1_2_3 : deps.pack2 ? CATALOG_1_2 : CATALOG_1;

export interface TamTuongKyDeps {
  readonly profiles: ProfileStore;
  readonly now: number;
  readonly enabled: boolean;
  readonly isSignedIn: (ownerId: string) => Promise<boolean>;
  /** Chế độ Hạng tuần (đi cùng `TAM_TUONG_KY_ENABLED`). */
  readonly rankedEnabled?: boolean;
  /** Gói 2 (đã duyệt, đi cùng cờ chế độ): sổ gộp Gói 1 + Gói 2. */
  readonly pack2?: boolean;
  /** Gói 3 (khi đã duyệt, cần Gói 2): sổ ba gói. */
  readonly pack3?: boolean;
  readonly seasons?: SeasonStore;
}

/** Những gì client cần để vẽ màn: không có gì bí mật (catalog nằm trong bundle). */
export interface TtkView {
  readonly packId: string;
  readonly tickets: number;
  readonly maxTickets: number;
  readonly session: { readonly combinesLeft: number; readonly combinesPerSession: number; readonly expiresAt: number } | null;
  readonly hintsLeft: number;
  readonly hintsPerDay: number;
  readonly discovery: DiscoveryState;
  readonly heroesFound: number;
  /** Cặp đã thử mà không ra gì (khóa `a>b`): màn chơi cảnh báo khi đặt lại, không nói công thức sai. */
  readonly triedPairs: readonly string[];
}

export type TtkServiceError = TtkError | "featureDisabled" | "loginRequired" | "conflict" | "noGold" | "shopLimit";

export type TtkServiceResult =
  | { readonly ok: true; readonly view: TtkView; readonly response?: TtkResponse }
  | { readonly ok: false; readonly error: TtkServiceError; readonly view?: TtkView };

export function ttkHttpStatus(error: TtkServiceError): number {
  switch (error) {
    case "featureDisabled":
      return 403;
    case "loginRequired":
      return 401;
    case "badRequest":
      return 400;
    case "noTicket":
    case "noSession":
    case "noHint":
    case "conflict":
    case "noGold":
    case "shopLimit":
      return 409;
  }
}

function viewOf(deps: TamTuongKyDeps, account: TtkAccount): TtkView {
  const catalog = catalogOf(deps);
  const now = deps.now;
  const session = activeSession(account, now);
  return {
    packId: catalog.pack.id,
    tickets: account.tickets,
    maxTickets: TTK_MAX_TICKETS,
    session: session ? { combinesLeft: session.combinesLeft, combinesPerSession: TTK_COMBINES_PER_SESSION, expiresAt: session.startedAt + TTK_SESSION_MS } : null,
    hintsLeft: hintsLeft(account, vnDay(now)),
    hintsPerDay: TTK_HINTS_PER_DAY,
    discovery: account.discovery,
    heroesFound: discoveredCharacters(catalog, account.discovery).length,
    triedPairs: triedPairsOf(catalog, account),
  };
}

/** Tài khoản Tầm Tướng Ký trong hồ sơ, khớp catalog đang chạy; chưa có thì tạo mới (3 phiếu). */
const accountOf = (deps: TamTuongKyDeps, p: { readonly tamTuongKy?: TtkAccount }) => {
  const catalog = catalogOf(deps);
  // Giữ mọi ID của mọi gói đã viết: tắt Gói 2 không làm mất khám phá Gói 2 trong sổ.
  return normalizeTtkAccount(p.tamTuongKy ?? newTtkAccount(catalog), catalog, { nodes: KNOWN_NODE_IDS, recipes: KNOWN_RECIPE_IDS });
};

async function gate(deps: TamTuongKyDeps, ownerId: string | null): Promise<TtkServiceError | null> {
  if (!deps.enabled) return "featureDisabled";
  if (!ownerId || !(await deps.isSignedIn(ownerId))) return "loginRequired";
  return null;
}

/** Trạng thái hiện tại. Không ghi gì (tài khoản mới chỉ được lưu ở thao tác đầu tiên). */
export async function getTamTuongKy(deps: TamTuongKyDeps, ownerId: string | null): Promise<TtkServiceResult> {
  const blocked = await gate(deps, ownerId);
  if (blocked) return { ok: false, error: blocked };
  const { profile } = await loadProfile(deps.profiles, ownerId!);
  return { ok: true, view: viewOf(deps, accountOf(deps, profile)) };
}

async function act(deps: TamTuongKyDeps, ownerId: string | null, step: (account: TtkAccount) => TtkResult): Promise<TtkServiceResult> {
  const blocked = await gate(deps, ownerId);
  if (blocked) return { ok: false, error: blocked };
  let response: TtkResponse | undefined;
  let lastAccount: TtkAccount | null = null;
  const r = await updateProfile<TtkError>(
    deps.profiles,
    ownerId!,
    (p) => {
      const account = accountOf(deps, p);
      lastAccount = account;
      const out = step(account);
      if (!out.ok) return out;
      response = out.response;
      return { ok: true, profile: { ...p, tamTuongKy: out.account } };
    },
    deps.now,
  );
  if (!r.ok) return { ok: false, error: r.error, view: lastAccount ? viewOf(deps, lastAccount) : undefined };
  return { ok: true, view: viewOf(deps, r.stored.profile.tamTuongKy!), response };
}

export const openTamTuongKySession = (deps: TamTuongKyDeps, ownerId: string | null, requestId: unknown) =>
  act(deps, ownerId, (a) => openSession(a, requestId, deps.now));

export const combineTamTuongKy = (deps: TamTuongKyDeps, ownerId: string | null, requestId: unknown, first: unknown, second: unknown) =>
  act(deps, ownerId, (a) => combineInSession(catalogOf(deps), a, requestId, first, second, deps.now));

export const hintTamTuongKy = (deps: TamTuongKyDeps, ownerId: string | null, requestId: unknown, level: unknown) =>
  act(deps, ownerId, (a) => spendHint(catalogOf(deps), a, requestId, level, vnDay(deps.now)));

// ——— Chế độ Hạng tuần (LT-06) ———

/** Ô đề cử: chỉ lời dẫn và điểm cho tới khi ghép ra (A-23). Không có tên, chân dung, nghề hay hệ. */
export interface TtkFeaturedSlot {
  readonly slot: number;
  readonly clue: string;
  readonly points: number;
  /** Có khi đã ghép ra trong tuần này. */
  readonly found: { readonly nodeId: string; readonly characterId: string; readonly name: string } | null;
}

export interface TtkRankedView {
  /** Sổ đang chạy (`pack-1` hoặc `pack-1-2`): client chọn catalog theo mã này. */
  readonly packId: string;
  readonly week: string;
  readonly units: number;
  readonly stock: Readonly<Record<string, number>>;
  readonly unitsSpent: number;
  readonly points: number;
  readonly featured: readonly TtkFeaturedSlot[];
  readonly shop: { readonly price: number; readonly bought: number; readonly max: number };
  readonly gold: number;
  readonly discovery: DiscoveryState;
  readonly triedPairs: readonly string[];
  readonly board: { readonly top: readonly { readonly rank: number; readonly name: string; readonly points: number; readonly mine: boolean }[]; readonly mine: { readonly rank: number; readonly points: number } | null };
}

export type TtkRankedResult =
  | { readonly ok: true; readonly view: TtkRankedView; readonly response?: TtkResponse }
  | { readonly ok: false; readonly error: TtkServiceError; readonly view?: TtkRankedView };

async function rankedView(deps: TamTuongKyDeps, account: TtkAccount, gold: number, ownerId: string): Promise<TtkRankedView> {
  const catalog = catalogOf(deps);
  const week = seasonKey(deps.now);
  const w = account.ranked?.week === week ? account.ranked : null;
  const featured = featuredFor(catalog.pack, week).map((id, slot): TtkFeaturedSlot => {
    const node = catalog.nodes.get(id)!;
    const found = w?.heroesCreated.includes(id) ? { nodeId: id, characterId: node.characterId!, name: node.nameVi } : null;
    return { slot, clue: node.clue?.text ?? "", points: TTK_HERO_POINTS[node.tier ?? "thuong"], found };
  });
  let board: TtkRankedView["board"] = { top: [], mine: null };
  if (deps.seasons) {
    const [top, mine] = await Promise.all([deps.seasons.top("tamTuongKy", week, 10), deps.seasons.rankOf("tamTuongKy", week, ownerId)]);
    board = {
      top: top.map((e, i) => ({ rank: i + 1, name: e.name ?? `Khách ${e.ownerId.slice(-4)}`, points: pointsOfSeasonScore(e.score), mine: e.ownerId === ownerId })),
      mine: mine ? { rank: mine.rank, points: pointsOfSeasonScore(mine.score) } : null,
    };
  }
  return {
    packId: catalog.pack.id,
    week,
    units: account.units,
    stock: w?.stock ?? {},
    unitsSpent: w?.unitsSpent ?? 0,
    points: w?.points ?? 0,
    featured,
    shop: { price: TTK_SHOP_PRICE, bought: w?.shopBought ?? 0, max: TTK_SHOP_MAX_PER_WEEK },
    gold,
    discovery: account.discovery,
    triedPairs: triedPairsOf(catalog, account),
    board,
  };
}

async function rankedGate(deps: TamTuongKyDeps, ownerId: string | null): Promise<TtkServiceError | null> {
  const blocked = await gate(deps, ownerId);
  if (blocked) return blocked;
  return deps.rankedEnabled ? null : "featureDisabled";
}

/** Trạng thái tuần Hạng. Vào tuần mới lần đầu thì ghi cấp nền 3 bó (P-12). */
export async function getTamTuongKyRanked(deps: TamTuongKyDeps, ownerId: string | null): Promise<TtkRankedResult> {
  const blocked = await rankedGate(deps, ownerId);
  if (blocked) return { ok: false, error: blocked };
  const week = seasonKey(deps.now);
  const r = await updateProfile<never>(
    deps.profiles,
    ownerId!,
    (p) => {
      const cur = accountOf(deps, p);
      const next = enterRankedWeek(cur, week);
      return { ok: true, profile: next === cur && p.tamTuongKy ? p : { ...p, tamTuongKy: next } };
    },
    deps.now,
  );
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, view: await rankedView(deps, r.stored.profile.tamTuongKy!, r.stored.profile.gold, ownerId!) };
}

/** Ghép chế độ Hạng; tướng đề cử mới thì ghi điểm mùa (điểm + ít nguyên tố tiêu hơn). */
export async function combineTamTuongKyRanked(deps: TamTuongKyDeps, ownerId: string | null, requestId: unknown, first: unknown, second: unknown): Promise<TtkRankedResult> {
  const blocked = await rankedGate(deps, ownerId);
  if (blocked) return { ok: false, error: blocked };
  const week = seasonKey(deps.now);
  let response: TtkResponse | undefined;
  const r = await updateProfile<TtkError>(
    deps.profiles,
    ownerId!,
    (p) => {
      const out = combineInRanked(catalogOf(deps), accountOf(deps, p), requestId, first, second, week);
      if (!out.ok) return out;
      response = out.response;
      return { ok: true, profile: { ...p, tamTuongKy: out.account } };
    },
    deps.now,
  );
  if (!r.ok) return { ok: false, error: r.error };
  const account = r.stored.profile.tamTuongKy!;
  if (response?.kind === "rankedCombine" && response.points > 0 && account.ranked)
    await recordSeason(deps.seasons, { mode: "tamTuongKy", ownerId: ownerId!, now: deps.now, best: rankedSeasonScore(account.ranked) });
  return { ok: true, view: await rankedView(deps, account, r.stored.profile.gold, ownerId!), response };
}

/** Mua một bó ở cửa hàng: trừ vàng trong cùng lần ghi hồ sơ. */
export async function buyTamTuongKyBundle(deps: TamTuongKyDeps, ownerId: string | null, requestId: unknown): Promise<TtkRankedResult> {
  const blocked = await rankedGate(deps, ownerId);
  if (blocked) return { ok: false, error: blocked };
  const week = seasonKey(deps.now);
  let response: TtkResponse | undefined;
  const r = await updateProfile<"badRequest" | "noGold" | "shopLimit">(
    deps.profiles,
    ownerId!,
    (p) => {
      const out = buyBundle(accountOf(deps, p), requestId, p.gold, week);
      if (!out.ok) return out;
      response = out.response;
      return { ok: true, profile: { ...p, gold: p.gold - out.goldSpent, tamTuongKy: out.account } };
    },
    deps.now,
  );
  if (!r.ok) {
    const { profile } = await loadProfile(deps.profiles, ownerId!);
    return { ok: false, error: r.error, view: await rankedView(deps, accountOf(deps, profile), profile.gold, ownerId!) };
  }
  return { ok: true, view: await rankedView(deps, r.stored.profile.tamTuongKy!, r.stored.profile.gold, ownerId!), response };
}

// ——— Bảng tuần trên trang Xếp hạng ———

export interface TtkBoardRow {
  readonly rank: number;
  readonly name: string;
  readonly mine: boolean;
  readonly points: number;
  readonly unitsSpent: number;
}

export type TtkBoardResult =
  | { readonly ok: true; readonly week: string; readonly top: readonly TtkBoardRow[]; readonly mine: Omit<TtkBoardRow, "name" | "mine"> | null }
  | { readonly ok: false; readonly error: TtkServiceError };

/** Số nguyên tố đã tiêu từ điểm bảng mùa (`rankedSeasonScore`). */
const unitsOfSeasonScore = (score: number) => 999 - (score % 1000);

/** Bảng tuần Tầm Tướng Ký (top 50 và hạng của mình). `week`: khóa thứ Hai, mặc định tuần hiện tại. */
export async function tamTuongKyBoard(deps: TamTuongKyDeps, ownerId: string | null, week?: string): Promise<TtkBoardResult> {
  const blocked = await rankedGate(deps, ownerId);
  if (blocked) return { ok: false, error: blocked };
  if (!deps.seasons) return { ok: true, week: week ?? seasonKey(deps.now), top: [], mine: null };
  const key = week ?? seasonKey(deps.now);
  const [top, mine] = await Promise.all([deps.seasons.top("tamTuongKy", key, 50), deps.seasons.rankOf("tamTuongKy", key, ownerId!)]);
  return {
    ok: true,
    week: key,
    top: top.map((e, i) => ({ rank: i + 1, name: e.name ?? `Khách ${e.ownerId.slice(-4)}`, mine: e.ownerId === ownerId, points: pointsOfSeasonScore(e.score), unitsSpent: unitsOfSeasonScore(e.score) })),
    mine: mine ? { rank: mine.rank, points: pointsOfSeasonScore(mine.score), unitsSpent: unitsOfSeasonScore(mine.score) } : null,
  };
}
