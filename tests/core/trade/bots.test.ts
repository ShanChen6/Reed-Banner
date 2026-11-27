import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TRADE_BOT_DAILY_CAP,
  TRADE_BOT_MAX,
  TRADE_BOT_MIN,
  TRADE_BOT_OWNERS,
  TRADE_MASTER_ID,
  TRADE_NODE_IDS,
  TRADE_START_MONEY,
  TRADE_STYLES,
  activeTradeBots,
  botAccepts,
  botOffer,
  initialMarket,
  isTradeBot,
  isTradeMaster,
  marketKey,
  neighbors,
  newTradePlayer,
  planTradeBot,
  quote,
  tradeBotCapped,
  tradeBotDailyCap,
  tradeBotCount,
  tradeBotName,
  tradeSlot,
  type MarketQuote,
  type TradeNodeId,
  type TradePlayer,
} from "../../../src/core/trade";
import { MARKET_ITEMS } from "../../../src/core/trade/market";
import { BOT_CHARACTERS } from "../../../src/core/ai";

const SEASON = "2026-11-23";
const T0 = Date.UTC(2026, 10, 23, 1, 0, 0);
const DAY = 86_400_000;

/** Bảng giá mọi chợ lúc mở mùa (bày đủ món, để thử lối buôn). */
function markets(): Record<TradeNodeId, MarketQuote[]> {
  const rows = initialMarket(tradeSlot(T0), SEASON);
  const out = {} as Record<TradeNodeId, MarketQuote[]>;
  for (const node of TRADE_NODE_IDS) out[node] = MARKET_ITEMS.map((item) => quote(SEASON, node, item, rows.get(marketKey(node, item))!));
  return out;
}

const character = (personality: string) => BOT_CHARACTERS.find((c) => c.personality === personality)!;

describe("thương đoàn máy Hành Thương Ký", () => {
  it("đại thương gia: chở nhiều món vừa vốn và khoang, nâng cấp đoàn khi dư vốn", () => {
    const m = markets();
    const master = BOT_CHARACTERS.find(isTradeMaster)!;
    const p = newTradePlayer(SEASON, 0, T0);
    const plan = planTradeBot({ ...p, money: 4_000 }, master, m, T0, 1, 1)!;
    assert.ok(plan.buys.length > 0);
    const cost = plan.buys.reduce((s, b) => s + b.amount * m[p.node].find((q) => q.item === b.item)!.buy, 0);
    assert.ok(cost <= 4_000);
    assert.equal(plan.upgrade, undefined, "vốn chưa gấp ba giá nâng cấp thì chưa nâng");
    assert.equal(planTradeBot({ ...p, money: 100_000 }, master, m, T0, 1, 1)!.upgrade, true);
  });

  it("tên theo nhân vật: sứ quân ghi 'Sứ quân <tên>', không ghi máy; mã máy tách khỏi tài khoản", () => {
    assert.equal(tradeBotName("bot:tranLam"), "Sứ quân Trần Lãm");
    assert.equal(tradeBotName("bot:leHoan"), "Lê Hoàn");
    assert.equal(tradeBotName("acc-1"), null);
    for (const o of TRADE_BOT_OWNERS) {
      assert.ok(isTradeBot(o));
      assert.doesNotMatch(tradeBotName(o)!, /Máy/);
    }
  });

  it("đệm dân số: vắng người đủ 20 đoàn, đông người bớt dần, ít nhất 6; đoàn chạy cố định trong mùa", () => {
    assert.equal(tradeBotCount(0), TRADE_BOT_MAX);
    assert.equal(tradeBotCount(10), TRADE_BOT_MAX - 2);
    assert.equal(tradeBotCount(10_000), TRADE_BOT_MIN);
    assert.deepEqual(activeTradeBots(SEASON, 0), activeTradeBots(SEASON, 0));
    const few = activeTradeBots(SEASON, 40).map((c) => c.id);
    const all = activeTradeBots(SEASON, 0).map((c) => c.id);
    assert.deepEqual(few, all.slice(0, few.length), "đông người thì đoàn cuối danh sách nghỉ trước");
    assert.equal(few[0], TRADE_MASTER_ID, "đại thương gia luôn chạy");
  });

  it("chọn chuyến có lãi theo giá đang niêm yết, mua vừa vốn và khoang, đi sang điểm kề", () => {
    const m = markets();
    const p = newTradePlayer(SEASON, 0, T0);
    for (const c of BOT_CHARACTERS) {
      const plan = planTradeBot(p, c, m, T0, 1, 7);
      assert.ok(plan, c.id);
      assert.ok(neighbors(p.node).includes(plan.to));
      let cost = 0;
      for (const b of plan.buys) {
        const here = m[p.node].find((q) => q.item === b.item)!;
        const there = m[plan.to].find((q) => q.item === b.item)!;
        assert.ok(there.sell > here.buy, `${c.id} phải chở hàng có lãi`);
        cost += b.amount * here.buy;
      }
      assert.ok(cost <= p.money * (isTradeMaster(c) ? 1 : TRADE_STYLES[c.personality].spend));
    }
  });

  it("hết lộ phiếu hay chạm trần lãi theo ngày thì nghỉ", () => {
    const m = markets();
    const c = BOT_CHARACTERS.find((x) => !isTradeMaster(x))!;
    const p = newTradePlayer(SEASON, 0, T0);
    assert.equal(planTradeBot({ ...p, passesUsed: 5 }, c, m, T0, 1, 1), null);
    const cap = tradeBotDailyCap(c);
    assert.ok(cap >= TRADE_BOT_DAILY_CAP * 0.6 && cap <= TRADE_BOT_DAILY_CAP * 1.2);
    const rich: TradePlayer = { ...p, money: TRADE_START_MONEY + cap };
    assert.ok(tradeBotCapped(rich, c, T0));
    assert.equal(planTradeBot(rich, c, m, T0, 1, 1), null);
    assert.ok(!tradeBotCapped(rich, c, T0 + DAY), "sang ngày thứ hai thì trần nâng lên");
    const master = BOT_CHARACTERS.find(isTradeMaster)!;
    assert.ok(!tradeBotCapped({ ...rich, money: 1_000_000 }, master, T0), "đại thương gia không có trần");
  });

  it("lời ngỏ của đoàn máy bán món đắt nhất lấy kim tiền; trả lời theo lối buôn, không xin quá hàng hay túi tiền", () => {
    const m = markets();
    const node = TRADE_NODE_IDS[0]!;
    const item = m[node][0]!.item;
    const bot: TradePlayer = { ...newTradePlayer(SEASON, 0, T0), cargo: { [item]: 40 } };
    const offer = botOffer(bot, character("hoChu"), m)!;
    assert.deepEqual(Object.keys(offer.give.items), [item]);
    assert.ok(offer.want.money > 0);
    assert.equal(botOffer({ ...bot, cargo: {} }, character("hoChu"), m), null);
    const price = m[node][0]!.buy;
    const fair = { items: {}, money: Math.ceil(price * 10 * 0.96) };
    const want = { items: { [item]: 10 }, money: 0 };
    assert.ok(botAccepts(bot, character("hoChu"), m, fair, want), "hộ chủ dễ tính");
    assert.ok(!botAccepts(bot, character("muuPha"), m, fair, want), "mưu phá khó ép giá");
    assert.ok(!botAccepts(bot, character("hoChu"), m, fair, { items: { [item]: 41 }, money: 0 }), "không có đủ hàng");
    assert.ok(!botAccepts(bot, character("hoChu"), m, { items: { [item]: 1 }, money: 0 }, { items: {}, money: bot.money + 1 }), "quá túi tiền");
  });
});
