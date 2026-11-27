// Thương đoàn máy ở Hành Thương Ký (Shan chốt 27/11/2026): khi vắng người, đoàn của các sứ quân, tướng lịch sử và nhân vật
// đặc biệt đi các chặng theo lịch tính sẵn từ hạt giống mùa (không cần tiến trình nền). Gặp đoàn người chơi thì ngỏ lời bán
// một phần hàng theo giá chợ nơi tới, hoặc trả lời ngay lời ngỏ của người chơi theo tính cách. Thương đoàn máy luôn ghi
// rõ là máy, không có kim tiền trên bảng mùa, không đụng kho chung. Hàm thuần.

import { BOT_CHARACTERS, type BotCharacter, type PersonalityId } from "../ai";
import { createRng } from "../rng";
import { cargoWeight, TRADE_ITEMS, tradeItem, type TradeItemId } from "./goods";
import { edgeKey, TRADE_EDGES, type TradeNodeId } from "./map";
import { hashSeed, normalSpeed, regionFactor, TRADE_SELL_RATIO, TRADE_SLOT_MS, trendFactor, tradeSlot } from "./market";
import type { Bundle } from "./offers";
import { legMs, type Cargo } from "./player";

/** Mã đoàn máy trong lời ngỏ và danh sách đoàn đã gặp: `bot:<id nhân vật>`. */
export const TRADE_BOT_PREFIX = "bot:";
export const isTradeBot = (ownerId: string): boolean => ownerId.startsWith(TRADE_BOT_PREFIX);

/** Mỗi khung lịch (bằng một phiên giá) mỗi đoàn máy đi tối đa một chặng, xác suất này. */
export const TRADE_BOT_ACTIVE = 0.85;
/** Khoang đoàn máy: như đoàn người cấp 2. */
export const TRADE_BOT_CAPACITY = 150;

/** Cách buôn theo tính cách: giá bán ra (nhân giá chợ), mức chịu khi người chơi ngỏ (giá trị nhận / giá trị đưa), hàng chở. */
interface TradeStyle {
  readonly markup: number;
  readonly accept: number;
  /** Tỉ lệ chở kỳ trân (còn lại thường dụng, thượng phẩm). */
  readonly treasure: number;
  /** Phần khoang đem bán cho người gặp. */
  readonly sellShare: number;
}

export const TRADE_STYLES: Readonly<Record<PersonalityId, TradeStyle>> = {
  manhCong: { markup: 1.0, accept: 0.95, treasure: 0.15, sellShare: 0.5 },
  thuThanh: { markup: 1.0, accept: 1.0, treasure: 0.05, sellShare: 0.3 },
  muuPha: { markup: 1.15, accept: 1.12, treasure: 0.15, sellShare: 0.3 },
  tichLuc: { markup: 1.1, accept: 0.92, treasure: 0.1, sellShare: 0.2 },
  lieuLinh: { markup: 0.9, accept: 1.05, treasure: 0.5, sellShare: 0.6 },
  laoLuyen: { markup: 1.03, accept: 1.0, treasure: 0.15, sellShare: 0.35 },
  hoChu: { markup: 0.95, accept: 0.92, treasure: 0.05, sellShare: 0.4 },
  tuyCo: { markup: 1.05, accept: 1.0, treasure: 0.2, sellShare: 0.4 },
};

/** Lời mô tả cách buôn, hiện cho người chơi. */
export const TRADE_STYLE_NOTE: Readonly<Record<PersonalityId, string>> = {
  manhCong: "buôn nhanh, bán gọn theo giá chợ",
  thuThanh: "đổi sòng phẳng, chở hàng thường",
  muuPha: "mặc cả gắt, bán đắt, khó ép giá",
  tichLuc: "gom hàng, bán ít, dễ thu mua",
  lieuLinh: "chở kỳ trân, bán rẻ cho nhanh",
  laoLuyen: "tính kỹ, đổi đúng giá",
  hoChu: "hào phóng, bán rẻ cho người đi đường",
  tuyCo: "giá theo thời, nhỉnh hơn chợ một chút",
};

export interface BotLeg {
  readonly ownerId: string;
  readonly character: BotCharacter;
  readonly legId: string;
  readonly from: TradeNodeId;
  readonly to: TradeNodeId;
  readonly departAt: number;
  readonly arriveAt: number;
  readonly cargo: Cargo;
}

/** Hàng chở của một đoàn máy trên một chặng: vài món hợp nơi đi (rẻ ở đó), tỉ lệ kỳ trân theo tính cách. */
function botCargo(seed: number, style: TradeStyle, from: TradeNodeId): Cargo {
  const rng = createRng(seed);
  const cheap = [...TRADE_ITEMS].sort((a, b) => regionFactor(a, from) - regionFactor(b, from));
  const pick = (treasure: boolean) => {
    const pool = cheap.filter((i) => (i.tier === "treasure") === treasure).slice(0, 8);
    return pool[rng.int(0, pool.length - 1)]!;
  };
  const cargo: Partial<Record<TradeItemId, number>> = {};
  const kinds = rng.int(2, 3);
  for (let k = 0; k < kinds; k++) {
    const it = pick(rng.next() < style.treasure);
    const room = TRADE_BOT_CAPACITY - cargoWeight(cargo);
    const cap = it.tier === "treasure" ? room * 5 : room;
    const n = Math.floor(cap * (0.25 + rng.next() * 0.25));
    if (n > 0) cargo[it.id] = (cargo[it.id] ?? 0) + n;
  }
  return cargo;
}

/** Chặng của một đoàn máy trong một khung lịch, null khi khung đó đoàn nghỉ. */
function botLegAt(season: string, c: BotCharacter, window: number, speed: number): BotLeg | null {
  const seed = hashSeed("tradeBot", season, c.id, window);
  const rng = createRng(seed);
  if (rng.next() >= TRADE_BOT_ACTIVE) return null;
  const edge = TRADE_EDGES[rng.int(0, TRADE_EDGES.length - 1)]!;
  const [from, to] = rng.next() < 0.5 ? [edge.a, edge.b] : [edge.b, edge.a];
  const len = TRADE_SLOT_MS / normalSpeed(speed);
  const ms = legMs(edge, 1, speed);
  const start = window * len + Math.floor(rng.next() * Math.max(1, len - ms));
  return {
    ownerId: `${TRADE_BOT_PREFIX}${c.id}`,
    character: c,
    legId: `bot-${c.id}-${window}`,
    from,
    to,
    departAt: start,
    arriveAt: start + ms,
    cargo: botCargo(seed ^ 0x9e3779b9, TRADE_STYLES[c.personality], from),
  };
}

/** Chặng của các đoàn máy trên cạnh `edge`, chồng lên khoảng giờ [from, to] (cùng ý nghĩa với kho `legsOn`). */
export function botLegsOn(season: string, edge: string, from: number, to: number, speed = 1): BotLeg[] {
  const len = TRADE_SLOT_MS / normalSpeed(speed);
  const out: BotLeg[] = [];
  for (let w = Math.floor(from / len) - 1; w <= Math.floor(to / len); w++) {
    for (const c of BOT_CHARACTERS) {
      const leg = botLegAt(season, c, w, speed);
      if (leg && edgeKey(leg.from, leg.to) === edge && leg.departAt <= to && leg.arriveAt >= from) out.push(leg);
    }
  }
  return out;
}

/** Một chặng máy theo mã (để kiểm lời ngỏ gửi lên); null khi mã sai. */
export function botLegById(season: string, legId: string, speed = 1): BotLeg | null {
  const m = /^bot-([A-Za-z]+)-(-?\d+)$/.exec(legId);
  const c = m ? BOT_CHARACTERS.find((x) => x.id === m[1]) : undefined;
  if (!m || !c) return null;
  const leg = botLegAt(season, c, Number(m[2]), speed);
  return leg && leg.legId === legId ? leg : null;
}

/** Giá tham chiếu một món ở nơi tới trong khung hiện tại: giá gốc × hệ số vùng × xu hướng (không tính sức ép kho). */
export function referencePrice(season: string, node: TradeNodeId, item: TradeItemId, now: number, speed = 1): number {
  const it = tradeItem(item);
  return Math.max(1, Math.round(it.base * regionFactor(it, node) * trendFactor(season, node, item, tradeSlot(now, speed))));
}

/** Giá trị một gói theo giá tham chiếu; `goodsRatio` nhân phần hàng (đoàn máy thu hàng như chợ thu mua, 90%). */
export function bundleValue(season: string, node: TradeNodeId, b: Bundle, now: number, speed = 1, goodsRatio = 1): number {
  return b.money + goodsRatio * Object.entries(b.items).reduce((sum, [id, n]) => sum + referencePrice(season, node, id as TradeItemId, now, speed) * (n ?? 0), 0);
}

/**
 * Lời ngỏ đoàn máy đưa ra khi gặp: bán một phần món đắt nhất trong khoang lấy kim tiền, giá theo chợ nơi tới nhân hệ số
 * tính cách. Null khi khoang trống.
 */
export function botOffer(season: string, leg: BotLeg, now: number, speed = 1): { give: Bundle; want: Bundle } | null {
  const style = TRADE_STYLES[leg.character.personality];
  const items = (Object.entries(leg.cargo) as [TradeItemId, number][]).filter(([, n]) => n > 0);
  if (items.length === 0) return null;
  const [item, have] = items.sort((a, b) => referencePrice(season, leg.to, b[0], now, speed) - referencePrice(season, leg.to, a[0], now, speed))[0]!;
  const n = Math.max(1, Math.floor(have * style.sellShare));
  const price = Math.round(referencePrice(season, leg.to, item, now, speed) * n * style.markup);
  return { give: { items: { [item]: n }, money: 0 }, want: { items: {}, money: price } };
}

/**
 * Đoàn máy trả lời lời ngỏ của người chơi: chỉ nhận khi có đủ hàng được xin và giá trị nhận về (theo giá chợ nơi tới) ít
 * nhất bằng mức chịu của tính cách nhân giá trị phải đưa; hàng người chơi đưa tính như chợ thu mua (90%). Đoàn máy mang theo tối đa `TRADE_BOT_PURSE` kim tiền.
 */
export const TRADE_BOT_PURSE = 20_000;
export function botAccepts(season: string, leg: BotLeg, give: Bundle, want: Bundle, now: number, speed = 1): boolean {
  if (want.money > TRADE_BOT_PURSE) return false;
  for (const [id, n] of Object.entries(want.items)) if ((leg.cargo[id as TradeItemId] ?? 0) < (n ?? 0)) return false;
  const style = TRADE_STYLES[leg.character.personality];
  const got = bundleValue(season, leg.to, give, now, speed, TRADE_SELL_RATIO);
  const paid = bundleValue(season, leg.to, want, now, speed);
  return paid === 0 ? got > 0 : got >= paid * style.accept;
}
