// Thương đoàn của các sứ quân, tướng lịch sử và nhân vật đặc biệt ở Hành Thương Ký (Shan chốt 27/11/2026): đoàn máy là
// người chơi thật trong mùa, có kim tiền, khoang hàng, lộ phiếu như mọi người, mua bán qua kho chung nên làm giá và tồn
// kho đổi thật, lên bảng Công trạng với tên nhân vật (sứ quân ghi "Sứ quân <tên>"), nhưng thưởng mùa chỉ chia cho người
// thật. Server cho đoàn máy đi lười mỗi khi có người mở chế độ; số đoàn máy giảm dần khi đông người. Hàm thuần.

import { BOT_CHARACTERS, type BotCharacter, type PersonalityId } from "../ai";
import { createRng } from "../rng";
import { companionById, WARLORD_COMPANIONS } from "../roster";
import { DAY_MS, vnDay, vnDayStart } from "../vnTime";
import { cargoWeight, TREASURE_PER_SLOT, tradeItem, type TradeItemId } from "./goods";
import { neighbors, tradeEdge, type TradeNodeId } from "./map";
import { hashSeed, stockCap, TRADE_SELL_RATIO, type MarketQuote } from "./market";
import type { Bundle } from "./offers";
import { capacityOf, legMs, passesLeft, TRADE_LEVELS, TRADE_MAX_LEVEL, tradeScore, type TradePlayer } from "./player";

/** Mã đoàn máy trong kho: `bot:<id nhân vật>`. */
export const TRADE_BOT_PREFIX = "bot:";
export const isTradeBot = (ownerId: string): boolean => ownerId.startsWith(TRADE_BOT_PREFIX);
export const tradeBotOwner = (c: Pick<BotCharacter, "id">) => `${TRADE_BOT_PREFIX}${c.id}`;
export const tradeBotCharacter = (ownerId: string): BotCharacter | undefined =>
  isTradeBot(ownerId) ? BOT_CHARACTERS.find((c) => c.id === ownerId.slice(TRADE_BOT_PREFIX.length)) : undefined;

/** Mã của mọi thương đoàn máy (để bỏ qua khi chia thưởng mùa). */
export const TRADE_BOT_OWNERS: readonly string[] = BOT_CHARACTERS.map(tradeBotOwner);

/** Tên hiện cho người chơi và trên bảng: sứ quân ghi "Sứ quân <tên>", còn lại là tên nhân vật (Shan 27/11/2026). */
export function tradeBotName(ownerId: string): string | null {
  const c = tradeBotCharacter(ownerId);
  if (!c) return null;
  const name = companionById(c.id)?.name ?? c.id;
  return WARLORD_COMPANIONS.some((w) => w.fighter.id === c.id) ? `Sứ quân ${name}` : name;
}

/** Đệm dân số: vắng người thì đủ 20 đoàn; cứ thêm 5 người thật đang chơi thì bớt một đoàn, ít nhất 6 đoàn. */
export const TRADE_BOT_MAX = BOT_CHARACTERS.length;
export const TRADE_BOT_MIN = 6;
export const TRADE_BOT_PER_HUMANS = 5;
export const tradeBotCount = (humans: number) => Math.max(TRADE_BOT_MIN, TRADE_BOT_MAX - Math.floor(Math.max(0, humans) / TRADE_BOT_PER_HUMANS));

/** Các đoàn máy chạy trong mùa: thứ tự xáo theo mùa, lấy `count` đoàn đầu (đông người thì đoàn cuối danh sách nghỉ trước). */
export function activeTradeBots(season: string, humans: number): BotCharacter[] {
  const rng = createRng(hashSeed("tradeBots", season));
  const order = [...BOT_CHARACTERS];
  for (let i = order.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  // Đại thương gia luôn chạy, không bị đệm dân số cho nghỉ.
  const picked = order.filter((c) => c.id !== TRADE_MASTER_ID).slice(0, tradeBotCount(humans) - 1);
  const master = BOT_CHARACTERS.find((c) => c.id === TRADE_MASTER_ID);
  return master ? [master, ...picked] : order.slice(0, tradeBotCount(humans));
}

/**
 * Đại thương gia (Shan 27/11/2026: "một máy cực kỳ thông minh trong việc buôn bán"): Sứ quân Trần Lãm, chủ cửa biển Bố Hải.
 * Không chịu trần tài, luôn chạy, nâng cấp đoàn hàng khi dư vốn, chở nhiều món cùng lúc và tính trước hai chặng theo lãi
 * mỗi phút. Vẫn đúng luật như mọi người: cùng bảng giá, cùng kho chung, cùng lộ phiếu, không nhìn trước giá khung sau.
 */
export const TRADE_MASTER_ID = "tranLam";
export const isTradeMaster = (c: Pick<BotCharacter, "id">) => c.id === TRADE_MASTER_ID;

/**
 * Trần tài: lãi mùa của đoàn máy không vượt quá mức này (xê dịch theo nhân vật) nhân số ngày đã qua của mùa (tính cả hôm nay). Chạm trần thì
 * đoàn máy chỉ bán hàng đang chở, không xuất hành chuyến mới, để máy là mốc để vượt chứ không chiếm hết bảng.
 */
export const TRADE_BOT_DAILY_CAP = 3_000;

/** Lối buôn theo tính cách. */
interface TradeStyle {
  /** Phần kim tiền dám bỏ ra mỗi chuyến. */
  readonly spend: number;
  /** Chọn ngẫu nhiên trong bấy nhiêu phương án lãi nhất (1 là luôn chọn phương án tốt nhất). */
  readonly pick: number;
  /** Lãi tối thiểu trên vốn mới chịu chở hàng. */
  readonly minMargin: number;
  /** Hệ số ưu tiên kỳ trân. */
  readonly treasure: number;
  /** Hệ số ưu tiên chở tới nơi đang thiếu (món Hiếm ở nơi tới). */
  readonly rare: number;
  /** Giá bán cho người gặp giữa đường, nhân giá chợ nơi tới. */
  readonly markup: number;
  /** Mức chịu khi người chơi ngỏ: giá trị nhận về / giá trị phải đưa. */
  readonly accept: number;
  /** Phần hàng đem bán cho người gặp. */
  readonly sellShare: number;
}

export const TRADE_STYLES: Readonly<Record<PersonalityId, TradeStyle>> = {
  manhCong: { spend: 0.9, pick: 1, minMargin: 0.03, treasure: 1, rare: 1, markup: 1.0, accept: 0.95, sellShare: 0.5 },
  thuThanh: { spend: 0.5, pick: 2, minMargin: 0.08, treasure: 0.6, rare: 1, markup: 1.0, accept: 1.0, sellShare: 0.3 },
  muuPha: { spend: 0.7, pick: 2, minMargin: 0.06, treasure: 1, rare: 1.6, markup: 1.15, accept: 1.12, sellShare: 0.3 },
  tichLuc: { spend: 0.6, pick: 2, minMargin: 0.12, treasure: 1, rare: 1, markup: 1.1, accept: 0.92, sellShare: 0.2 },
  lieuLinh: { spend: 1.0, pick: 3, minMargin: 0.02, treasure: 1.8, rare: 1, markup: 0.9, accept: 1.05, sellShare: 0.6 },
  laoLuyen: { spend: 0.75, pick: 1, minMargin: 0.06, treasure: 1, rare: 1.2, markup: 1.03, accept: 1.0, sellShare: 0.35 },
  hoChu: { spend: 0.6, pick: 2, minMargin: 0.05, treasure: 0.8, rare: 1, markup: 0.95, accept: 0.92, sellShare: 0.4 },
  tuyCo: { spend: 0.7, pick: 3, minMargin: 0.05, treasure: 1.2, rare: 1.2, markup: 1.05, accept: 1.0, sellShare: 0.4 },
};

/** Lời mô tả lối buôn, hiện cho người chơi khi gặp. */
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

/** Số ngày của mùa đã qua (tính cả hôm nay), mùa bắt đầu ngày `season` (thứ Hai, giờ VN). */
function seasonDays(season: string, now: number): number {
  const days = Math.round((vnDayStart(vnDay(now)) - vnDayStart(season)) / DAY_MS) + 1;
  return Number.isFinite(days) ? Math.max(1, days) : 1;
}

/** Trần lãi mỗi ngày riêng từng đoàn (60–120% mức chung, cố định theo nhân vật), để bảng không thành một hàng máy bằng điểm. */
export const tradeBotDailyCap = (c: Pick<BotCharacter, "id">) => Math.round(TRADE_BOT_DAILY_CAP * (0.6 + 0.6 * createRng(hashSeed("tradeBotCap", c.id)).next()));

/** Lãi mùa còn được phép tới hết hôm nay. */
const capLeftOf = (p: TradePlayer, c: Pick<BotCharacter, "id">, now: number) => tradeBotDailyCap(c) * seasonDays(p.season, now) - tradeScore(p);

export const tradeBotCapped = (p: TradePlayer, c: Pick<BotCharacter, "id">, now: number) => !isTradeMaster(c) && capLeftOf(p, c, now) <= 0;

/** Một chuyến đoàn máy định đi: nâng cấp đoàn (nếu có), mua các món ở đây (rỗng là đi không) rồi xuất hành tới `to`. */
export interface BotPlan {
  readonly to: TradeNodeId;
  readonly buys: readonly { readonly item: TradeItemId; readonly amount: number }[];
  readonly upgrade?: boolean;
}

/**
 * Chọn chuyến kế cho đoàn máy đang đứng ở chợ, đã bán hết hàng: xét mọi món chợ này bày và mọi điểm kề, lãi = giá thu mua
 * nơi tới trừ giá bán ra ở đây (giá khung hiện tại, ai cũng xem được); chọn theo lối buôn. Null khi hết lộ phiếu hay chạm
 * trần tài. Không có phương án lãi thì đi không sang một điểm kề để đổi chợ.
 */
export function planTradeBot(
  p: TradePlayer,
  character: BotCharacter,
  markets: Readonly<Record<TradeNodeId, readonly MarketQuote[]>>,
  now: number,
  speed: number,
  seed: number,
): BotPlan | null {
  if (passesLeft(p, now, speed) <= 0 || tradeBotCapped(p, character, now)) return null;
  if (isTradeMaster(character)) return planMaster(p, markets, now, speed);
  const style = TRADE_STYLES[character.personality];
  const rng = createRng(seed);
  const room = capacityOf(p) - cargoWeight(p.cargo);
  const budget = Math.floor(p.money * style.spend);
  // Không chở quá phần lãi còn được phép trong trần tài của mùa tới hôm nay.
  const capLeft = capLeftOf(p, character, now);
  const options: { plan: BotPlan; score: number }[] = [];
  for (const here of markets[p.node] ?? []) {
    if (here.stock <= 0 || here.buy <= 0) continue;
    const it = tradeItem(here.item);
    const fit = it.tier === "treasure" ? room * TREASURE_PER_SLOT : room;
    const amount = Math.min(here.stock, Math.floor(budget / here.buy), fit);
    if (amount <= 0) continue;
    for (const to of neighbors(p.node)) {
      const there = markets[to]?.find((q) => q.item === here.item);
      if (!there || there.full) continue;
      const margin = (there.sell - here.buy) / here.buy;
      if (margin < style.minMargin) continue;
      const sellRoom = stockCap(here.item, to) - there.stock;
      if (sellRoom <= 0) continue;
      const n = Math.min(amount, sellRoom, Math.max(1, Math.floor(capLeft / (there.sell - here.buy))));
      const weight = (it.tier === "treasure" ? style.treasure : 1) * (there.rare ? style.rare : 1);
      options.push({ plan: { to, buys: [{ item: here.item, amount: n }] }, score: margin * here.buy * n * weight });
    }
  }
  options.sort((a, b) => b.score - a.score);
  if (options.length > 0) return options[rng.int(0, Math.min(style.pick, options.length) - 1)]!.plan;
  const ns = neighbors(p.node);
  return ns.length > 0 ? { to: ns[rng.int(0, ns.length - 1)]!, buys: [] } : null;
}

type Markets = Readonly<Record<TradeNodeId, readonly MarketQuote[]>>;

/** Xếp hàng chở từ `from` tới `to` để lãi nhất: món lãi nhất trên mỗi ô khoang trước, tới khi hết vốn hay hết khoang. */
function fillCargo(markets: Markets, from: TradeNodeId, to: TradeNodeId, money: number, room: number): { buys: { item: TradeItemId; amount: number }[]; profit: number } {
  const options = (markets[from] ?? []).flatMap((here) => {
    const there = markets[to]?.find((q) => q.item === here.item);
    if (!there || there.full || here.stock <= 0 || there.sell <= here.buy) return [];
    const perSlot = tradeItem(here.item).tier === "treasure" ? TREASURE_PER_SLOT : 1;
    const sellRoom = Math.max(0, stockCap(here.item, to) - there.stock);
    return sellRoom > 0 ? [{ here, sellRoom, unit: there.sell - here.buy, perSlot, slotGain: (there.sell - here.buy) * perSlot }] : [];
  });
  options.sort((a, b) => b.slotGain - a.slotGain);
  const buys: { item: TradeItemId; amount: number }[] = [];
  let left = money;
  let slots = room;
  let profit = 0;
  for (const o of options) {
    if (slots <= 0 || left <= 0) break;
    const n = Math.min(o.here.stock, o.sellRoom, Math.floor(left / o.here.buy), slots * o.perSlot);
    if (n <= 0) continue;
    buys.push({ item: o.here.item, amount: n });
    left -= n * o.here.buy;
    slots -= Math.ceil(n / o.perSlot);
    profit += n * o.unit;
  }
  return { buys, profit };
}

const legMinutesOf = (from: TradeNodeId, to: TradeNodeId, level: number, speed: number) => {
  const edge = tradeEdge(from, to);
  return edge ? legMs(edge, level, speed) / 60_000 : Infinity;
};

/** Đại thương gia: nâng cấp khi dư vốn, chọn điểm tới theo lãi mỗi phút của chuyến này cộng chuyến kế tốt nhất từ đó. */
function planMaster(p: TradePlayer, markets: Markets, now: number, speed: number): BotPlan {
  const next = TRADE_LEVELS[p.level];
  const upgrade = p.level < TRADE_MAX_LEVEL && next !== undefined && p.money >= next.cost * 3;
  const level = upgrade ? p.level + 1 : p.level;
  const money = upgrade ? p.money - next!.cost : p.money;
  const room = TRADE_LEVELS[level - 1]!.capacity - cargoWeight(p.cargo);
  const twoLegs = passesLeft(p, now, speed) >= 2;
  // Chuyến cuối của ngày cuối mùa thì đi không: hàng còn trong khoang lúc khép mùa không tính lãi.
  const lastLeg = seasonDays(p.season, now) >= 7 && !twoLegs;
  let best: { plan: BotPlan; rate: number } | null = null;
  for (const to of neighbors(p.node)) {
    const first = lastLeg ? { buys: [], profit: 0 } : fillCargo(markets, p.node, to, money, room);
    const t1 = legMinutesOf(p.node, to, level, speed);
    let follow = 0;
    let t2 = 0;
    if (twoLegs) {
      for (const after of neighbors(to)) {
        const second = fillCargo(markets, to, after, money + first.profit, TRADE_LEVELS[level - 1]!.capacity);
        const t = legMinutesOf(to, after, level, speed);
        if (second.profit / t > follow / Math.max(1, t2)) {
          follow = second.profit;
          t2 = t;
        }
      }
    }
    // Chuyến kế tính 80% vì giá khung sau có thể đổi.
    const rate = (first.profit + 0.8 * follow) / (t1 + t2);
    if (!best || rate > best.rate) best = { plan: { to, buys: first.buys, ...(upgrade ? { upgrade: true } : {}) }, rate };
  }
  return best?.plan ?? { to: neighbors(p.node)[0]!, buys: [] };
}

/** Giá tham chiếu một món ở một chợ theo bảng giá khung hiện tại; null khi chợ đó không bày. */
const priceAt = (markets: Readonly<Record<TradeNodeId, readonly MarketQuote[]>>, node: TradeNodeId, item: TradeItemId) =>
  markets[node]?.find((q) => q.item === item)?.buy ?? null;

/** Giá trị một gói theo giá chợ `node`; hàng chợ không bày tính theo giá gốc. `goodsRatio` nhân phần hàng. */
export function bundleValue(markets: Readonly<Record<TradeNodeId, readonly MarketQuote[]>>, node: TradeNodeId, b: Bundle, goodsRatio = 1): number {
  return b.money + goodsRatio * Object.entries(b.items).reduce((s, [id, n]) => s + (priceAt(markets, node, id as TradeItemId) ?? tradeItem(id as TradeItemId).base) * (n ?? 0), 0);
}

/**
 * Lời ngỏ đoàn máy đưa ra khi gặp: bán một phần món đắt nhất trong khoang lấy kim tiền, giá theo chợ nơi tới nhân hệ số
 * lối buôn. Null khi khoang trống.
 */
export function botOffer(bot: TradePlayer, character: BotCharacter, markets: Readonly<Record<TradeNodeId, readonly MarketQuote[]>>): { give: Bundle; want: Bundle } | null {
  const node = bot.leg?.to ?? bot.node;
  const style = TRADE_STYLES[character.personality];
  const value = (id: TradeItemId) => priceAt(markets, node, id) ?? tradeItem(id).base;
  const items = (Object.entries(bot.cargo) as [TradeItemId, number][]).filter(([, n]) => n > 0).sort((a, b) => value(b[0]) - value(a[0]));
  if (items.length === 0) return null;
  const [item, have] = items[0]!;
  const n = Math.max(1, Math.floor(have * style.sellShare));
  return { give: { items: { [item]: n }, money: 0 }, want: { items: {}, money: Math.round(value(item) * n * style.markup) } };
}

/**
 * Đoàn máy trả lời lời ngỏ của người chơi: chỉ nhận khi đoàn máy có đủ hàng và kim tiền bị xin, và giá trị nhận về (theo
 * giá chợ nơi tới, hàng người chơi đưa tính như chợ thu mua 90%) ít nhất bằng mức chịu của lối buôn nhân giá trị phải đưa.
 */
export function botAccepts(bot: TradePlayer, character: BotCharacter, markets: Readonly<Record<TradeNodeId, readonly MarketQuote[]>>, give: Bundle, want: Bundle): boolean {
  if (want.money > bot.money) return false;
  for (const [id, n] of Object.entries(want.items)) if ((bot.cargo[id as TradeItemId] ?? 0) < (n ?? 0)) return false;
  const node = bot.leg?.to ?? bot.node;
  const got = bundleValue(markets, node, give, TRADE_SELL_RATIO);
  const paid = bundleValue(markets, node, want);
  return paid === 0 ? got > 0 : got >= paid * TRADE_STYLES[character.personality].accept;
}
