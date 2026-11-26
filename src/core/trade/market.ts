// Giá và kho chung của Hành Thương Ký (GDD mục 4). Mỗi ngày 12 khung giá, đổi vào giờ chẵn giờ Việt Nam. Kho chung
// cho mọi người, chạy theo lượng mua bán: người mua thì kho giảm, người bán thì hàng vào kho; mỗi khung chợ chỉ tự sinh
// hoặc tiêu thụ một ít. Giá trong một khung cố định, tính từ lượng tồn lúc mở khung: kho thiếu thì giá lên, kho ứ thì xuống.
// Hàm thuần: khung giá và hạt giống mùa do server đưa vào.

import { HOUR_MS, VN_UTC_OFFSET_MS } from "../vnTime";
import { createRng } from "../rng";
import { TRADE_ITEMS, tradeItem, type TradeItem, type TradeItemId } from "./goods";
import { hops, tradeNode, TRADE_NODE_IDS, type TradeNodeId } from "./map";

export const TRADE_SLOT_MS = 2 * HOUR_MS;
/** Giá thu mua khi người chơi bán = 90% giá bán ra cùng khung, nên mua rồi bán ngay tại chỗ luôn lỗ. */
export const TRADE_SELL_RATIO = 0.9;

/** Khung giá tuyệt đối (đếm từ 0 giờ VN 01/01/1970), đổi mỗi 2 giờ. */
export function tradeSlot(now: number): number {
  return Math.floor((now + VN_UTC_OFFSET_MS) / TRADE_SLOT_MS);
}

/** Thời điểm mở khung giá kế tiếp. */
export function nextSlotAt(now: number): number {
  return (tradeSlot(now) + 1) * TRADE_SLOT_MS - VN_UTC_OFFSET_MS;
}

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

/** Biên dao động xu hướng theo nhóm hàng. */
export const TRADE_VOLATILITY = { common: 0.1, specialty: 0.25, treasure: 0.6 } as const;

/**
 * Xu hướng giá của một món ở một điểm trong một khung: nhiễu trơn nội suy giữa các mốc cách nhau 3 khung, trong
 * [1 − biên, 1 + biên]. Ai cũng tính ra cùng số vì chỉ phụ thuộc mùa, điểm, món và khung.
 */
export function trendFactor(season: string, node: TradeNodeId, item: TradeItemId, slot: number): number {
  const vol = TRADE_VOLATILITY[tradeItem(item).group];
  const t = slot / 3;
  const k = Math.floor(t);
  const f = t - k;
  const a = unit(season, node, item, k) * 2 - 1;
  const b = unit(season, node, item, k + 1) * 2 - 1;
  const s = f * f * (3 - 2 * f);
  return 1 + vol * (a + (b - a) * s);
}

/** Hệ số vùng: đặc sản rẻ ở quê nhà, hiếm và đắt dần theo số chặng tới quê nhà; phổ thông theo loại địa điểm. */
export function regionFactor(item: TradeItem, node: TradeNodeId): number {
  if (item.group === "specialty") {
    if (item.home === node) return 0.65;
    return Math.min(1.5, 1.1 + 0.1 * (hops(node, item.home!) - 1));
  }
  if (item.group === "treasure") return item.sources?.includes(node) ? 0.8 : 1;
  return item.byKind?.[tradeNode(node).kind] ?? 1;
}

/** Đặc sản ở nơi khác quê nhà gắn nhãn "Hiếm". */
export const isRareAt = (item: TradeItemId, node: TradeNodeId): boolean => {
  const it = tradeItem(item);
  return it.group === "specialty" && it.home !== node;
};

/** Mức tồn bình thường của chợ: giá tính theo tồn lúc mở khung so với mức này. */
export function stockTarget(item: TradeItemId, node: TradeNodeId): number {
  const it = tradeItem(item);
  if (it.group === "common") return 300;
  if (it.group === "specialty") return it.home === node ? 400 : 15;
  return it.sources?.includes(node) ? 6 : 2;
}

/** Chợ ứ quá mức này thì không thu mua món đó nữa (chờ khung sau tiêu bớt). */
export function stockCap(item: TradeItemId, node: TradeNodeId): number {
  return tradeItem(item).group === "treasure" ? 30 : stockTarget(item, node) * 3 + 60;
}

/** Sức ép từ lượng tồn lúc mở khung: thiếu hàng thì giá lên tới ×1.4, ứ hàng thì xuống tới ×0.7. */
export function pressureFactor(item: TradeItemId, node: TradeNodeId, slotStock: number): number {
  const ratio = slotStock / stockTarget(item, node);
  return Math.min(1.4, Math.max(0.7, 1 + 0.4 * (1 - ratio)));
}

/** Giá bán ra (người chơi mua) của một món ở một điểm trong khung, theo tồn lúc mở khung. */
export function buyPrice(season: string, node: TradeNodeId, item: TradeItemId, slot: number, slotStock: number): number {
  const it = tradeItem(item);
  return Math.max(1, Math.round(it.base * regionFactor(it, node) * trendFactor(season, node, item, slot) * pressureFactor(item, node, slotStock)));
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

export function initialRow(item: TradeItemId, node: TradeNodeId, slot: number): MarketRow {
  const stock = tradeItem(item).group === "treasure" ? (tradeItem(item).sources?.includes(node) ? 4 : 0) : stockTarget(item, node);
  return { stock, slot, slotStock: stock, prevSlotStock: stock };
}

/** Chợ tự sinh hoặc tiêu thụ trong một khung: dồn 8% về mức bình thường; kỳ trân hao 10% và thỉnh thoảng có thuyền mang tới. */
function drift(season: string, node: TradeNodeId, item: TradeItemId, slot: number, stock: number): number {
  const it = tradeItem(item);
  if (it.group === "treasure") {
    let s = Math.floor(stock * 0.9);
    if (it.sources?.includes(node)) {
      const rng = createRng(hashSeed(season, "arrive", node, item, slot));
      if (rng.next() < 0.35) s += rng.int(3, 6);
    }
    return Math.min(stockCap(item, node), s);
  }
  const target = stockTarget(item, node);
  const step = (target - stock) * 0.08;
  return Math.max(0, Math.round(stock + (step > 0 ? Math.ceil(step) : Math.floor(step))));
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
  readonly rare: boolean;
  /** Chợ ứ, không thu mua thêm trong khung này. */
  readonly full: boolean;
}

export function quote(season: string, node: TradeNodeId, item: TradeItemId, row: MarketRow): MarketQuote {
  const buy = buyPrice(season, node, item, row.slot, row.slotStock);
  const before = buyPrice(season, node, item, row.slot - 1, row.prevSlotStock);
  return {
    item,
    stock: row.stock,
    buy,
    sell: sellPrice(season, node, item, row.slot, row.slotStock),
    change: Math.round(((buy - before) / before) * 1000) / 10,
    rare: isRareAt(item, node),
    full: row.stock >= stockCap(item, node),
  };
}

/** Món một chợ bày bán: mọi món phổ thông, đặc sản và kỳ trân (kỳ trân hết hàng vẫn thu mua). */
export const MARKET_ITEMS: readonly TradeItemId[] = TRADE_ITEMS.map((i) => i.id);

export const marketKey = (node: TradeNodeId, item: TradeItemId) => `${node}:${item}`;

/** Mọi dòng kho của một mùa lúc mới mở. */
export function initialMarket(slot: number): Map<string, MarketRow> {
  const out = new Map<string, MarketRow>();
  for (const node of TRADE_NODE_IDS) for (const item of MARKET_ITEMS) out.set(marketKey(node, item), initialRow(item, node, slot));
  return out;
}
