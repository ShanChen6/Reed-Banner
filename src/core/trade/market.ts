// Giá, kho chung và hàng bày của Hành Thương Ký (GDD mục 4). Mỗi ngày 12 khung giá, đổi vào giờ chẵn giờ Việt Nam. Kho chung
// cho mọi người, chạy theo lượng mua bán: người mua thì kho giảm, người bán thì hàng vào kho; mỗi khung chợ chỉ tự sinh
// hoặc tiêu thụ một ít. Giá trong một khung cố định, tính từ lượng tồn lúc mở khung: kho thiếu thì giá lên, kho ứ thì xuống.
// Hàm thuần: khung giá và hạt giống mùa do server đưa vào.

import { HOUR_MS, VN_UTC_OFFSET_MS } from "../vnTime";
import { createRng } from "../rng";
import { TRADE_ITEMS, tradeItem, type TradeItem, type TradeItemId, type TradeTier } from "./goods";
import { hops, tradeNode, TRADE_NODE_IDS, type TradeNodeId } from "./map";

export const TRADE_SLOT_MS = 2 * HOUR_MS;
/** Giá thu mua khi người chơi bán = 90% giá bán ra cùng khung, nên mua rồi bán ngay tại chỗ luôn lỗ. */
export const TRADE_SELL_RATIO = 0.9;

/**
 * Hệ số tăng tốc khi thử (Shan 27/11/2026): `speed` 10 thì khung giá đổi mỗi 12 phút, đường đi ngắn 10 lần, lộ phiếu
 * nhân 10. Chạy thật để 1. Server đọc từ TRADE_SPEED.
 */
export const normalSpeed = (speed: number | undefined): number => (speed !== undefined && Number.isFinite(speed) && speed >= 1 ? Math.min(120, Math.floor(speed)) : 1);

/** Khung giá tuyệt đối (đếm từ 0 giờ VN 01/01/1970), đổi mỗi 2 giờ (chia `speed` khi thử). */
export function tradeSlot(now: number, speed = 1): number {
  return Math.floor((now + VN_UTC_OFFSET_MS) / (TRADE_SLOT_MS / normalSpeed(speed)));
}

/** Thời điểm mở khung giá kế tiếp. */
export function nextSlotAt(now: number, speed = 1): number {
  const len = TRADE_SLOT_MS / normalSpeed(speed);
  return (tradeSlot(now, speed) + 1) * len - VN_UTC_OFFSET_MS;
}

/** Khóa kho của mùa: chạy thử dùng kho riêng, để khi về tốc độ thật kho không kẹt ở số khung lớn hơn. */
export const marketSeason = (season: string, speed = 1): string => (normalSpeed(speed) === 1 ? season : `${season}~x${normalSpeed(speed)}`);

/** Băm FNV-1a 32 bit, để mọi hạt giống suy ra từ chuỗi (mùa, điểm, món). */
export function hashSeed(...parts: readonly (string | number)[]): number {
  let h = 0x811c9dc5;
  for (const ch of parts.join("|")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

const unit = (...parts: readonly (string | number)[]) => createRng(hashSeed(...parts)).next();

/** Biên dao động xu hướng theo phẩm cấp. */
export const TRADE_VOLATILITY = { common: 0.1, fine: 0.2, treasure: 0.4 } as const;

/**
 * Xu hướng giá của một món ở một điểm trong một khung: nhiễu trơn nội suy giữa các mốc cách nhau 3 khung, trong
 * [1 − biên, 1 + biên]. Ai cũng tính ra cùng số vì chỉ phụ thuộc mùa, điểm, món và khung.
 */
export function trendFactor(season: string, node: TradeNodeId, item: TradeItemId, slot: number): number {
  const vol = TRADE_VOLATILITY[tradeItem(item).tier];
  const t = slot / 3;
  const k = Math.floor(t);
  const f = t - k;
  const a = unit(season, node, item, k) * 2 - 1;
  const b = unit(season, node, item, k + 1) * 2 - 1;
  const s = f * f * (3 - 2 * f);
  return 1 + vol * (a + (b - a) * s);
}

// ── Chợ bày gì (Shan chốt 27/11/2026: mỗi chợ khoảng 20 món, 1–2 đặc sản, 1–2 món Hiếm) ──

/** Số món bày cố định mỗi chợ (gồm đặc sản). */
export const MARKET_FIXED = 16;
/** Số món theo phiên: mỗi khung mỗi món có nửa phần bày. */
export const MARKET_ROTATING = 8;
export const ROTATE_CHANCE = 0.5;
/** Món Hiếm nhân giá thêm chừng này, trên sức ép kho. */
export const RARE_MULT = 1.15;
/** Mức tồn so sánh của món Hiếm (chợ vốn không bày): tồn càng gần 0 giá càng cao. */
const RARE_REF = 60;

const nearestHome = (it: TradeItem, node: TradeNodeId) => Math.min(...it.homes.map((h) => hops(node, h)));

/** Món hợp chợ này tới đâu: đặc sản luôn bày, rồi hàng hợp loại đất, hàng của quê gần, hàng thường dụng. */
function fitScore(it: TradeItem, node: TradeNodeId): number {
  if (it.homes.includes(node)) return 100;
  let s = 0;
  if (it.kinds.includes(tradeNode(node).kind)) s += 3;
  if (it.homes.length > 0) {
    const h = nearestHome(it, node);
    s += h === 1 ? 2 : h === 2 ? 1 : 0;
  }
  if (it.tier === "common") s += 1;
  if (it.tier === "treasure") s -= 1;
  return s + unit("fit", node, it.id) * 0.9;
}

export interface Assortment {
  readonly fixed: readonly TradeItemId[];
  readonly rotating: readonly TradeItemId[];
  /** Món chợ không bày; mỗi phiên 1–2 món trong số này thành món Hiếm. */
  readonly absent: readonly TradeItemId[];
}

const assortmentCache = new Map<TradeNodeId, Assortment>();

/** Hàng của một chợ, cố định theo bản đồ (không đổi theo mùa). */
export function assortment(node: TradeNodeId): Assortment {
  const hit = assortmentCache.get(node);
  if (hit) return hit;
  const ranked = [...TRADE_ITEMS].sort((a, b) => fitScore(b, node) - fitScore(a, node)).map((i) => i.id);
  const out = {
    fixed: ranked.slice(0, MARKET_FIXED),
    rotating: ranked.slice(MARKET_FIXED, MARKET_FIXED + MARKET_ROTATING),
    absent: ranked.slice(MARKET_FIXED + MARKET_ROTATING),
  };
  assortmentCache.set(node, out);
  return out;
}

/** Cách một món có mặt ở chợ trong khung: bày cố định, bày theo phiên, hoặc là món Hiếm của phiên. */
export type Presence = "fixed" | "rotating" | "rare";

/** Món chợ bày trong khung `slot`; ai cũng thấy như nhau vì chỉ phụ thuộc mùa, điểm và khung. */
export function presenceAt(season: string, node: TradeNodeId, slot: number): ReadonlyMap<TradeItemId, Presence> {
  const a = assortment(node);
  const out = new Map<TradeItemId, Presence>();
  for (const id of a.fixed) out.set(id, "fixed");
  for (const id of a.rotating) if (unit(season, "rotate", node, id, slot) < ROTATE_CHANCE) out.set(id, "rotating");
  const pool = a.absent.filter((id) => tradeItem(id).tier !== "treasure");
  const n = unit(season, "rareCount", node, slot) < 0.5 ? 1 : 2;
  const picked = [...pool].sort((x, y) => unit(season, "rare", node, x, slot) - unit(season, "rare", node, y, slot)).slice(0, n);
  for (const id of picked) out.set(id, "rare");
  return out;
}

/** Hệ số vùng: đặc sản rẻ ở quê nhà, đắt dần theo số chặng tới quê; món không quê theo loại đất. */
export function regionFactor(it: TradeItem, node: TradeNodeId): number {
  if (it.homes.includes(node)) return it.tier === "treasure" ? 0.8 : 0.65;
  if (it.homes.length > 0) return Math.min(1.45, 1.05 + 0.1 * (nearestHome(it, node) - 1));
  return it.kinds.includes(tradeNode(node).kind) ? 0.9 : 1.15;
}

/** Món là đặc sản của điểm này (nhãn cố định; không bao giờ là món Hiếm ở chính quê nó). */
export const isSpecialtyHere = (item: TradeItemId, node: TradeNodeId): boolean => tradeItem(item).homes.includes(node);

/**
 * Lượng tồn bình thường theo phẩm cấp, cân cho máy chủ khoảng 1 000 người (Shan 27/11/2026). Ước: chừng 300 người vào
 * mỗi ngày, 5 lộ phiếu mỗi người, rải 12 chợ, giờ đông khoảng 15–25 đoàn ghé một chợ mỗi phiên, mỗi đoàn chở 100–200 ô.
 * Đặc sản đủ cho chừng 10 đoàn ôm đầy rồi mới cạn; kỳ trân ít nhưng một ô chở được 5 món nên vẫn đủ vài đoàn.
 */
export const STOCK_TARGET: Readonly<Record<TradeTier, { readonly home: number; readonly normal: number }>> = {
  common: { home: 1200, normal: 600 },
  fine: { home: 800, normal: 250 },
  treasure: { home: 150, normal: 40 },
};
/** Mỗi phiên kho dồn chừng này phần về mức bình thường (chợ tự sinh hoặc tiêu thụ). */
export const STOCK_DRIFT = 0.15;

/** Mức tồn bình thường của một món ở một chợ; món chợ không bày là 0 (hàng ai bán vào thì tiêu dần). */
export function stockTarget(item: TradeItemId, node: TradeNodeId): number {
  const it = tradeItem(item);
  if (it.homes.includes(node)) return STOCK_TARGET[it.tier].home;
  return assortment(node).absent.includes(item) ? 0 : STOCK_TARGET[it.tier].normal;
}

/** Chợ ứ quá mức này thì không thu mua món đó nữa (chờ khung sau tiêu bớt). */
export function stockCap(item: TradeItemId, node: TradeNodeId): number {
  const target = stockTarget(item, node);
  return tradeItem(item).tier === "treasure" ? Math.max(60, target * 3) : Math.max(150, target * 3);
}

/** Sức ép từ lượng tồn lúc mở khung: thiếu hàng thì giá lên tới ×1.4, ứ hàng thì xuống tới ×0.7. */
export function pressureFactor(item: TradeItemId, node: TradeNodeId, slotStock: number): number {
  const target = stockTarget(item, node);
  const ratio = slotStock / (target > 0 ? target : RARE_REF);
  return Math.min(1.4, Math.max(0.7, 1 + 0.4 * (1 - ratio)));
}

/** Giá bán ra (người chơi mua) của một món ở một điểm trong khung, theo tồn lúc mở khung. */
export function buyPrice(season: string, node: TradeNodeId, item: TradeItemId, slot: number, slotStock: number): number {
  const it = tradeItem(item);
  const rare = presenceAt(season, node, slot).get(item) === "rare" ? RARE_MULT : 1;
  return Math.max(1, Math.round(it.base * regionFactor(it, node) * trendFactor(season, node, item, slot) * pressureFactor(item, node, slotStock) * rare));
}

/** Giá thu mua (người chơi bán). */
export function sellPrice(season: string, node: TradeNodeId, item: TradeItemId, slot: number, slotStock: number): number {
  return Math.max(1, Math.floor(buyPrice(season, node, item, slot, slotStock) * TRADE_SELL_RATIO));
}

/** Một dòng kho: tồn hiện tại, khung đã tính tới, tồn lúc mở khung đó và khung trước (để hiện % đổi giá). */
export interface MarketRow {
  readonly stock: number;
  readonly slot: number;
  readonly slotStock: number;
  readonly prevSlotStock: number;
}

export function initialRow(item: TradeItemId, node: TradeNodeId, slot: number, season?: string): MarketRow {
  let stock = stockTarget(item, node);
  // Mở mùa đúng phiên món này là Hiếm thì hàng về luôn, không để kho 0.
  if (season !== undefined && presenceAt(season, node, slot).get(item) === "rare") stock += rareArrival(season, node, item, slot);
  return { stock, slot, slotStock: stock, prevSlotStock: stock };
}

const rareArrival = (season: string, node: TradeNodeId, item: TradeItemId, slot: number) => createRng(hashSeed(season, "arrive", node, item, slot)).int(10, 30);

/** Chợ tự sinh hoặc tiêu thụ trong một khung: dồn STOCK_DRIFT về mức bình thường; món Hiếm mỗi phiên có một ít hàng về. */
function drift(season: string, node: TradeNodeId, item: TradeItemId, slot: number, stock: number): number {
  const target = stockTarget(item, node);
  const step = (target - stock) * STOCK_DRIFT;
  let next = Math.max(0, Math.round(stock + (step > 0 ? Math.ceil(step) : Math.floor(step))));
  if (presenceAt(season, node, slot).get(item) === "rare" && next < RARE_REF / 2) next += rareArrival(season, node, item, slot);
  return next;
}

/** Không lặp quá một ngày khung khi chợ lâu không ai ghé: quá đó thì kho đã về gần mức bình thường. */
const MAX_DRIFT_STEPS = 12;

/** Đưa một dòng kho tới khung `slot`: chạy sinh/tiêu thụ từng khung đã qua, chụp tồn lúc mở khung. */
export function advanceRow(season: string, node: TradeNodeId, item: TradeItemId, row: MarketRow, slot: number): MarketRow {
  if (slot <= row.slot) return row;
  let stock = row.stock;
  let prev = row.slotStock;
  const start = Math.max(row.slot + 1, slot - MAX_DRIFT_STEPS + 1);
  for (let s = start; s <= slot; s++) {
    if (s === slot) prev = s - 1 > row.slot ? stock : row.slotStock;
    stock = drift(season, node, item, s, stock);
  }
  return { stock, slot, slotStock: stock, prevSlotStock: prev };
}

export interface MarketQuote {
  readonly item: TradeItemId;
  readonly stock: number;
  readonly buy: number;
  readonly sell: number;
  /** % đổi giá bán ra so với khung trước, làm tròn một chữ số. */
  readonly change: number;
  /** Đặc sản của nơi này (nhãn cố định). */
  readonly specialty: boolean;
  /** Món Hiếm của phiên: chợ đang thiếu, giá cao. */
  readonly rare: boolean;
  /** Món bày theo phiên (phiên sau có thể không còn). */
  readonly rotating: boolean;
  /** Chợ ứ, không thu mua thêm trong khung này. */
  readonly full: boolean;
}

export function quote(season: string, node: TradeNodeId, item: TradeItemId, row: MarketRow): MarketQuote {
  const presence = presenceAt(season, node, row.slot).get(item);
  const buy = buyPrice(season, node, item, row.slot, row.slotStock);
  const before = buyPrice(season, node, item, row.slot - 1, row.prevSlotStock);
  return {
    item,
    stock: row.stock,
    buy,
    sell: sellPrice(season, node, item, row.slot, row.slotStock),
    change: Math.round(((buy - before) / before) * 1000) / 10,
    specialty: isSpecialtyHere(item, node),
    rare: presence === "rare",
    rotating: presence === "rotating",
    full: row.stock >= stockCap(item, node),
  };
}

/** Mọi món đều có dòng kho ở mọi chợ (kể cả món chợ không bày, để hàng ai bán vào khi món đó là món Hiếm còn được ghi). */
export const MARKET_ITEMS: readonly TradeItemId[] = TRADE_ITEMS.map((i) => i.id);

export const marketKey = (node: TradeNodeId, item: TradeItemId) => `${node}:${item}`;

/** Mọi dòng kho của một mùa lúc mới mở. */
export function initialMarket(slot: number, season?: string): Map<string, MarketRow> {
  const out = new Map<string, MarketRow>();
  for (const node of TRADE_NODE_IDS) for (const item of MARKET_ITEMS) out.set(marketKey(node, item), initialRow(item, node, slot, season));
  return out;
}
