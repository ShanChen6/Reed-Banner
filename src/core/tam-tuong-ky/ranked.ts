// Chế độ Hạng tuần của Tầm Tướng Ký (LT-06), phần thuần. Luật: Design Freeze A-7, A-8, A-9, A-10, A-23, P-11…P-19
// (docs/02-game-modes/future/14-tam-tuong-ky-design-freeze.md). Server truyền khóa tuần (`week`, thứ Hai giờ Việt Nam) và
// vàng hiện có; file này không đọc đồng hồ, không import progress.

import { combineRanked, initialRanked, type Catalog, type RankedState, type Stock } from "./engine";
import { replayReceipt, withReceipt, validRequestId, type TtkAccount, type TtkResponse, type TtkResult } from "./account";
import type { HeroTier, NodeId, Pack } from "./types";

/** Một bó = 7 đơn vị nguyên tố tự chọn (P-11). */
export const TTK_BUNDLE_UNITS = 7;
/** Cấp nền khi vào chế độ Hạng lần đầu mỗi tuần (P-12). */
export const TTK_BASE_BUNDLES = 3;
/** Cửa hàng (P-13): giá một bó và số bó tối đa mỗi tuần. */
export const TTK_SHOP_PRICE = 300;
export const TTK_SHOP_MAX_PER_WEEK = 2;
/** Số tướng đề cử mỗi tuần (P-17, Shan chốt L5-3). */
export const TTK_FEATURED_PER_WEEK = 7;
/** Điểm mỗi tướng đề cử, tính một lần (P-18). */
export const TTK_HERO_POINTS: Readonly<Record<HeroTier, number>> = { thuong: 100, dacBiet: 200, lichSu: 300 };

/** Bó thưởng theo bậc hạng ở các chế độ theo tuần (P-11). Bậc giống `RewardTier` của thưởng hạng. */
export type TtkRewardTier = "top1" | "top3" | "top10" | "half" | "win";
export const TTK_RANK_BUNDLES: Readonly<Record<TtkRewardTier, number>> = { top1: 5, top3: 4, top10: 3, half: 2, win: 1 };

export interface TtkRankedWeek {
  readonly week: string;
  readonly stock: Stock;
  readonly heroesCreated: readonly NodeId[];
  readonly unitsSpent: number;
  readonly points: number;
  readonly shopBought: number;
}

const WEEK0 = Date.UTC(2026, 0, 5); // thứ Hai
const WEEK_MS = 7 * 24 * 3600 * 1000;

/** Số thứ tự tuần từ khóa `YYYY-MM-DD` (thứ Hai). */
export function weekIndex(week: string): number {
  const [y, m, d] = week.split("-").map(Number);
  return Math.floor((Date.UTC(y!, m! - 1, d!) - WEEK0) / WEEK_MS);
}

/** Thứ tự xoay vòng cố định: tướng đặc biệt rải đều giữa tướng lịch sử để tuần nào cũng có ít nhất một (P-16). */
export function rotationOrder(pack: Pack): readonly NodeId[] {
  const heroes = pack.nodes.filter((n) => n.kind === "character");
  const special = heroes.filter((h) => h.tier === "dacBiet").map((h) => h.id);
  const rest = heroes.filter((h) => h.tier !== "dacBiet").map((h) => h.id);
  if (special.length === 0) return rest;
  const gap = Math.ceil(rest.length / special.length);
  const out: NodeId[] = [];
  rest.forEach((h, i) => {
    if (i % gap === 0 && special[i / gap]) out.push(special[i / gap]!);
    out.push(h);
  });
  special.slice(Math.ceil(rest.length / gap)).forEach((h) => out.push(h));
  return out;
}

/**
 * Danh sách đề cử của tuần: giống nhau cho mọi người, xoay vòng đều. Tuần nào cửa sổ xoay vòng không có tướng đặc biệt
 * (gói nhiều tướng thường, ít tướng đặc biệt) thì ô cuối thay bằng một tướng đặc biệt, lần lượt theo tuần (P-16).
 * Với gói đã đủ tướng đặc biệt trong mỗi cửa sổ (Gói 1, Gói 1 + 2), danh sách không đổi.
 */
export function featuredFor(pack: Pack, week: string, count = TTK_FEATURED_PER_WEEK): readonly NodeId[] {
  const order = rotationOrder(pack);
  const n = Math.min(count, order.length);
  const index = weekIndex(week);
  const start = (((index * n) % order.length) + order.length) % order.length;
  const list = Array.from({ length: n }, (_, i) => order[(start + i) % order.length]!);
  const special = pack.nodes.filter((x) => x.kind === "character" && x.tier === "dacBiet").map((x) => x.id);
  if (special.length === 0 || list.some((id) => special.includes(id))) return list;
  list[n - 1] = special[((index % special.length) + special.length) % special.length]!;
  return list;
}

/** Điểm bảng mùa: điểm tướng trước, bằng điểm thì ít nguyên tố tiêu hơn xếp trên (P-18). */
export function rankedSeasonScore(week: TtkRankedWeek): number {
  return week.points * 1000 + Math.max(0, 999 - week.unitsSpent);
}

/** Điểm tướng từ điểm bảng mùa. */
export const pointsOfSeasonScore = (score: number) => Math.floor(score / 1000);

/** Vào tuần: tuần mới thì bỏ kho tuần cũ (nguyên tố dư giữ trong túi) và cộng cấp nền một lần. */
export function enterRankedWeek(account: TtkAccount, week: string): TtkAccount {
  if (account.ranked?.week === week) return account;
  return {
    ...account,
    units: account.units + TTK_BASE_BUNDLES * TTK_BUNDLE_UNITS,
    ranked: { week, stock: {}, heroesCreated: [], unitsSpent: 0, points: 0, shopBought: 0 },
  };
}

const stateOf = (account: TtkAccount, week: TtkRankedWeek): RankedState => ({
  ...initialRanked(account.units, week.stock),
  heroesCreated: week.heroesCreated,
  unitsSpent: week.unitsSpent,
});

/** Ghép chế độ Hạng. Không gợi ý, không tốn phiếu; ghép sai vẫn mất nguyên liệu. */
export function combineInRanked(
  catalog: Catalog,
  account: TtkAccount,
  requestId: unknown,
  first: unknown,
  second: unknown,
  week: string,
): TtkResult {
  if (!validRequestId(requestId) || typeof first !== "string" || typeof second !== "string") return { ok: false, error: "badRequest" };
  const again = replayReceipt(account, requestId);
  if (again) return again;
  const entered = enterRankedWeek(account, week);
  const w = entered.ranked!;
  const out = combineRanked(catalog, stateOf(entered, w), entered.discovery, first, second);
  const featured = featuredFor(catalog.pack, week);
  let gained = 0;
  if (out.status === "created" && out.isCharacter && !out.heroAlreadyCreated && featured.includes(out.nodeId)) {
    gained = TTK_HERO_POINTS[catalog.nodes.get(out.nodeId)?.tier ?? "thuong"];
  }
  const next: TtkAccount = {
    ...entered,
    units: out.next.units,
    discovery: out.nextDiscovery,
    ranked: { ...w, stock: out.next.stock, heroesCreated: out.next.heroesCreated, unitsSpent: out.next.unitsSpent, points: w.points + gained },
  };
  const response =
    out.status === "created"
      ? ({ kind: "rankedCombine", status: "created", nodeId: out.nodeId, recipeId: out.recipeId, isCharacter: out.isCharacter, recipeAlreadyKnown: out.recipeAlreadyKnown, points: gained } as const)
      : out.status === "invalid"
        ? ({ kind: "rankedCombine", status: "invalid", reason: out.reason, points: 0 } as const)
        : ({ kind: "rankedCombine", status: "noRecipe", points: 0 } as const);
  return { ok: true, account: withReceipt(next, requestId, response), response, replayed: false };
}

export type BuyResult =
  | { readonly ok: true; readonly account: TtkAccount; readonly response: TtkResponse; readonly replayed: boolean; readonly goldSpent: number }
  | { readonly ok: false; readonly error: "badRequest" | "noGold" | "shopLimit" };

/** Mua một bó ở cửa hàng (A-19, P-13): 300 vàng, tối đa 2 bó mỗi tuần. Vàng trừ ở hồ sơ (server). */
export function buyBundle(account: TtkAccount, requestId: unknown, gold: number, week: string): BuyResult {
  if (!validRequestId(requestId)) return { ok: false, error: "badRequest" };
  const again = replayReceipt(account, requestId);
  if (again?.ok) return { ok: true, account: again.account, response: again.response, replayed: true, goldSpent: 0 };
  const entered = enterRankedWeek(account, week);
  const w = entered.ranked!;
  if (w.shopBought >= TTK_SHOP_MAX_PER_WEEK) return { ok: false, error: "shopLimit" };
  if (gold < TTK_SHOP_PRICE) return { ok: false, error: "noGold" };
  const response = { kind: "buy", bought: w.shopBought + 1, units: TTK_BUNDLE_UNITS } as const;
  const next: TtkAccount = { ...entered, units: entered.units + TTK_BUNDLE_UNITS, ranked: { ...w, shopBought: w.shopBought + 1 } };
  return { ok: true, account: withReceipt(next, requestId, response), response, replayed: false, goldSpent: TTK_SHOP_PRICE };
}

/** Cộng bó thưởng hạng vào túi (P-11). */
export function grantBundles(account: TtkAccount, bundles: number): TtkAccount {
  return { ...account, units: account.units + Math.max(0, bundles) * TTK_BUNDLE_UNITS };
}
