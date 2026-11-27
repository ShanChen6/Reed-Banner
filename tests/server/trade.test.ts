import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { TRADE_BOT_MAX, TRADE_BOT_OWNERS, TRADE_MASTER_ID, TRADE_ITEM_IDS, TRADE_NODE_IDS, TRADE_START_MONEY, initialMarket, marketKey, neighbors, newTradePlayer, tradeBotName, tradeSlot, type TradeItemId, type TradeNodeId } from "../../src/core/trade";
import { seasonSource } from "../../src/server/rankRewards";
import { DrizzleTradeStore } from "../../src/server/db/trade";
import type { Db } from "../../src/server/db/store";
import { MemorySeasonStore } from "../../src/server/seasons";
import {
  MemoryTradeStore,
  tradeBoard,
  tradeBuy,
  tradeDepart,
  tradeGet,
  tradeOffer,
  tradeRespond,
  tradeSeason,
  tradeSell,
  tradeWithdraw,
  type TradeDeps,
  type TradeServiceResult,
  type TradeStore,
  type TradeView,
} from "../../src/server/trade";

const T0 = Date.UTC(2026, 10, 23, 1, 0, 0);
const MIN = 60_000;

async function makeDb(): Promise<TradeStore> {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzleTradeStore(db as unknown as Db);
}

const stores: readonly [string, () => Promise<TradeStore>][] = [
  ["bộ nhớ", async () => new MemoryTradeStore()],
  ["Postgres (PGlite, cùng migration với Neon)", makeDb],
];

/** Mọi người xuất phát ở điểm đầu (random 0) và không bao giờ gặp nạn (random gần 1). */
function harness(store: TradeStore) {
  let now = T0;
  let n = 0;
  const seasons = new MemorySeasonStore();
  const deps = (): TradeDeps => ({
    store,
    seasons,
    now,
    newId: () => `id${++n}`,
    random: () => 0.999,
    nameOf: async (id) => `Người ${id}`,
    bots: false,
  });
  return {
    seasons,
    deps,
    at: (t: number) => {
      now = t;
    },
    get now() {
      return now;
    },
  };
}

/** Một món thường dụng chợ đang bày cố định, đủ hàng, ở điểm đoàn hàng đứng. */
function goodAt(v: TradeView): TradeItemId {
  const q = v.markets[v.player.node].find((m) => !m.rare && !m.rotating && m.stock >= 50 && m.buy <= 100);
  assert.ok(q, "chợ phải có món thường dụng");
  return q.item;
}

function view<T extends object>(r: TradeServiceResult<T>): TradeView {
  assert.ok(r.ok, r.ok ? "" : `lỗi ${r.error}`);
  return r.view;
}

for (const [name, make] of stores) {
  describe(`Hành Thương Ký trên server (${name})`, () => {
    it("mở mùa với vốn như nhau, xem được giá mọi chợ, không lộ kim tiền người khác", async () => {
      const h = harness(await make());
      const v = view(await tradeGet("a", h.deps()));
      assert.equal(v.player.money, TRADE_START_MONEY);
      assert.equal(Object.keys(v.markets).length, 13);
      assert.ok(v.markets[v.player.node].length > 0);
      assert.ok(!JSON.stringify(v.met).includes("money"));
      for (const q of v.markets[v.player.node].filter((m) => m.rare)) assert.ok(q.stock >= 10, "món Hiếm mở mùa phải có hàng");
    });

    it("kho chung: người này mua thì người sau thấy tồn giảm; bán thì hàng vào kho; lãi lên bảng mùa", async () => {
      const h = harness(await make());
      const a = view(await tradeGet("a", h.deps()));
      const node = a.player.node;
      const rice = goodAt(a);
      const before = a.markets[node].find((q) => q.item === rice)!;
      view(await tradeBuy("a", rice, 30, h.deps()));
      const b = view(await tradeGet("b", h.deps()));
      assert.equal(b.player.node, node);
      assert.equal(b.markets[node].find((q) => q.item === rice)!.stock, before.stock - 30);
      view(await tradeSell("a", rice, 30, h.deps()));
      const c = view(await tradeGet("b", h.deps()));
      assert.equal(c.markets[node].find((q) => q.item === rice)!.stock, before.stock);
      // Mua rồi bán tại chỗ thì lỗ: không có tên trên bảng.
      const board = await tradeBoard("a", h.seasons, h.now);
      assert.equal(board.mine, null);
      const over = await tradeBuy("a", rice, 100_000, h.deps());
      assert.ok(!over.ok);
      // Món chợ không bày phiên này thì không mua bán được.
      const absent = TRADE_ITEM_IDS.find((id) => !c.markets[node].some((q) => q.item === id))!;
      assert.deepEqual(await tradeBuy("a", absent, 1, h.deps()), { ok: false, error: "notSold" });
    });

    it("chạy thử nhanh dùng kho riêng, đường đi ngắn hơn, lộ phiếu nhiều hơn", async () => {
      const h = harness(await make());
      const fast = () => ({ ...h.deps(), speed: 10 });
      const v = view(await tradeGet("a", fast()));
      assert.equal(v.speed, 10);
      assert.equal(v.player.passesLeft, 50);
      assert.ok(v.nextSlotAt - T0 <= 12 * MIN);
      const good = goodAt(v);
      view(await tradeBuy("a", good, 20, fast()));
      const real = view(await tradeGet("b", h.deps()));
      const fastAgain = view(await tradeGet("b", fast()));
      const stockOf = (x: TradeView) => x.markets[v.player.node].find((q) => q.item === good)?.stock;
      assert.equal(stockOf(fastAgain), stockOf(v)! - 20);
      assert.notEqual(stockOf(real), stockOf(fastAgain), "kho thật không bị kho chạy thử đụng tới");
      const to = neighbors(v.player.node)[0]!;
      const gone = view(await tradeDepart("a", to, fast()));
      assert.ok(gone.player.leg!.arriveAt - T0 <= 9 * MIN);
    });

    it("hai đoàn cùng chặng gặp nhau, xem khoang, ngỏ lời rồi đồng ý; mỗi chuyến một lần", async () => {
      const h = harness(await make());
      const rice = goodAt(view(await tradeGet("a", h.deps())));
      view(await tradeGet("b", h.deps()));
      view(await tradeBuy("a", rice, 10, h.deps()));
      const start = view(await tradeGet("a", h.deps())).player.node;
      const to: TradeNodeId = neighbors(start)[0]!;
      view(await tradeDepart("a", to, h.deps()));
      h.at(T0 + 2 * MIN);
      view(await tradeDepart("b", to, h.deps()));
      h.at(T0 + 120 * MIN);
      const a = view(await tradeGet("a", h.deps()));
      assert.equal(a.player.node, to);
      assert.equal(a.met.length, 1);
      assert.deepEqual(a.met[0]!.cargo, {});
      const bView = view(await tradeGet("b", h.deps()));
      assert.deepEqual(bView.met[0]!.cargo, { [rice]: 10 });

      // a đưa 10 gạo, xin 500 kim tiền.
      view(await tradeOffer("a", { to: "b", legId: a.met[0]!.legId, give: { items: { [rice]: 10 } }, want: { money: 500 } }, h.deps()));
      const locked = view(await tradeGet("a", h.deps()));
      assert.deepEqual(locked.player.cargo, {}, "hàng đưa ra bị khóa");
      assert.equal(locked.player.canOffer, false);
      const again = await tradeOffer("a", { to: "b", legId: a.met[0]!.legId, give: { money: 1 }, want: {} }, h.deps());
      assert.ok(!again.ok);

      const b = view(await tradeGet("b", h.deps()));
      assert.equal(b.offers.length, 1);
      assert.equal(b.offers[0]!.mine, false);
      const moneyB = b.player.money;
      const done = view(await tradeRespond("b", b.offers[0]!.id, true, h.deps()));
      assert.deepEqual(done.player.cargo, { [rice]: 10 });
      assert.equal(done.player.money, moneyB - 500);
      assert.equal(done.offers.length, 0);
      assert.equal(done.player.canOffer, false, "mỗi chuyến chỉ một giao dịch");
      const a2 = view(await tradeGet("a", h.deps()));
      assert.equal(a2.player.money, locked.player.money + 500);
    });

    it("lời ngỏ tự hủy khi một bên xuất hành tiếp, hàng khóa trả về", async () => {
      const h = harness(await make());
      const salt = goodAt(view(await tradeGet("a", h.deps())));
      view(await tradeGet("b", h.deps()));
      view(await tradeBuy("a", salt, 5, h.deps()));
      const start = view(await tradeGet("a", h.deps())).player.node;
      const to = neighbors(start)[0]!;
      view(await tradeDepart("a", to, h.deps()));
      view(await tradeDepart("b", to, h.deps()));
      h.at(T0 + 120 * MIN);
      const a = view(await tradeGet("a", h.deps()));
      view(await tradeOffer("a", { to: "b", legId: a.met[0]!.legId, give: { items: { [salt]: 5 } }, want: {} }, h.deps()));
      const b = view(await tradeGet("b", h.deps()));
      view(await tradeDepart("b", start, h.deps()));
      const back = view(await tradeGet("a", h.deps()));
      assert.deepEqual(back.player.cargo, { [salt]: 5 });
      assert.equal(back.offers.length, 0);
      const late = await tradeRespond("b", b.offers[0]!.id, true, h.deps());
      assert.deepEqual(late, { ok: false, error: "offerGone" });
    });

    it("rút lời ngỏ thì được ngỏ lại", async () => {
      const h = harness(await make());
      view(await tradeGet("a", h.deps()));
      view(await tradeGet("b", h.deps()));
      const to = neighbors(view(await tradeGet("a", h.deps())).player.node)[0]!;
      view(await tradeDepart("a", to, h.deps()));
      view(await tradeDepart("b", to, h.deps()));
      h.at(T0 + 120 * MIN);
      const a = view(await tradeGet("a", h.deps()));
      const offered = view(await tradeOffer("a", { to: "b", legId: a.met[0]!.legId, give: { money: 100 }, want: {} }, h.deps()));
      assert.equal(offered.player.money, TRADE_START_MONEY - 100);
      const withdrawn = view(await tradeWithdraw("a", offered.offers[0]!.id, h.deps()));
      assert.equal(withdrawn.player.money, TRADE_START_MONEY);
      assert.equal(withdrawn.player.canOffer, true);
      assert.deepEqual(await tradeWithdraw("b", offered.offers[0]!.id, h.deps()), { ok: false, error: "offerGone" });
    });
  });
}

for (const [name, make] of stores) {
  describe(`Hành Thương Ký đổi mã món (${name})`, () => {
    it("mã cũ trong khoang đọc sang mã mới; kho mùa đang chạy được bổ sung dòng thiếu, bỏ dòng mã cũ", async () => {
      const store = await make();
      const h = harness(store);
      const season = tradeSeason(h.now);
      const full = initialMarket(0, season);
      const node = TRADE_NODE_IDS[0]!;
      // Kho mùa cũ: một dòng mã cũ, thiếu hết các dòng còn lại.
      const [, sample] = [...full][0]!;
      await store.initMarket(season, new Map([[`${node}:hemp`, sample]]));
      const old = { ...newTradePlayer(season, 0, h.now), cargo: { hemp: 5, basketry: 2, rice: 1 } };
      await store.createPlayer(season, "a", old as never, h.now);
      const v = view(await tradeGet("a", h.deps()));
      assert.deepEqual(v.player.cargo, { indigoCloth: 5, conicalHat: 2, rice: 1 });
      const m = await store.market(season);
      for (const k of full.keys()) assert.ok(m.has(k), `thiếu dòng ${k}`);
      assert.ok(!JSON.stringify(v.markets).includes("hemp"));
      assert.ok(m.has(marketKey(node, "indigoCloth")));
    });
  });
}

describe("thương đoàn máy trên server", () => {
  /** Mọi đoàn (người và máy) xuất phát cùng một điểm, không gặp nạn; đoàn máy chạy khi "a" mở chế độ. */
  const setup = () => {
    const store = new MemoryTradeStore();
    const seasons = new MemorySeasonStore();
    let now = T0;
    let n = 0;
    const deps = (): TradeDeps => ({ store, seasons, now, newId: () => `id${++n}`, random: () => 0.999, nameOf: async (id) => `Người ${id}` });
    return { store, seasons, deps, at: (t: number) => void (now = t) };
  };

  /** "a" đi theo một đoàn máy chở hàng ra cùng cạnh, tới nơi thì gặp. */
  const meetBot = async () => {
    const h = setup();
    const v0 = view(await tradeGet("a", h.deps()));
    const season = tradeSeason(T0);
    const bots = await h.store.players(season, TRADE_BOT_OWNERS);
    // Đoàn thường (cấp 1 như "a"); đại thương gia đã nâng cấp nên đi nhanh hơn.
    const [owner, bot] = [...bots].find(([o, b]) => o !== `bot:${TRADE_MASTER_ID}` && b.leg && Object.keys(b.cargo).length > 0 && b.leg.from === v0.player.node)!;
    h.at(T0 + MIN);
    view(await tradeDepart("a", bot.leg!.to, h.deps()));
    h.at(bot.leg!.arriveAt + MIN + 1000);
    const v = view(await tradeGet("a", h.deps()));
    // Danh sách gặp giữ tối đa 5 đoàn: lấy đoàn nhân vật nào đã gặp và đang ngỏ bán.
    const met = v.met.find((m) => m.bot && v.offers.some((o) => o.id.startsWith("botoffer-") && o.fromName === m.name)) ?? v.met.find((m) => m.ownerId === owner);
    return { ...h, v, owner: met?.ownerId ?? owner, season };
  };

  it("đoàn máy là đoàn thật trong mùa: có hồ sơ, mua hàng qua kho chung nên tồn kho giảm thật", async () => {
    const h = setup();
    const v = view(await tradeGet("a", h.deps()));
    const season = tradeSeason(T0);
    const bots = await h.store.players(season, TRADE_BOT_OWNERS);
    assert.equal(bots.size, TRADE_BOT_MAX, "vắng người thì đủ đoàn máy");
    const loaded = [...bots.values()].filter((b) => Object.keys(b.cargo).length > 0);
    assert.ok(loaded.length > 0, "phải có đoàn máy chở hàng");
    assert.ok([...bots.values()].every((b) => b.leg !== null), "đoàn máy đã xuất hành");
    const init = initialMarket(tradeSlot(T0), season);
    const bought = new Map<string, number>();
    for (const b of loaded) for (const [item, count] of Object.entries(b.cargo) as [TradeItemId, number][]) bought.set(marketKey(b.leg!.from, item), (bought.get(marketKey(b.leg!.from, item)) ?? 0) + count);
    const rows = await h.store.market(season);
    for (const [key, count] of bought) assert.equal(rows.get(key)!.row.stock, init.get(key)!.stock - count, `kho ${key} phải giảm đúng số đoàn máy mua`);
    assert.equal(v.player.money, TRADE_START_MONEY);
  });

  it("gặp đoàn máy: tên là nhân vật, không ghi máy; đoàn máy ngỏ bán, đồng ý thì hàng và tiền đổi thật hai bên", async () => {
    const { v, deps, store, owner, season } = await meetBot();
    const bot = v.met.find((m) => m.ownerId === owner);
    assert.ok(bot, "phải gặp đoàn máy");
    assert.doesNotMatch(bot.name, /Máy/);
    assert.equal(bot.name, tradeBotName(owner));
    assert.ok(bot.bot!.personality && bot.bot!.note);
    const offer = v.offers.find((o) => o.id.startsWith("botoffer-") && o.fromName === bot.name);
    assert.ok(offer);
    const [item, count] = Object.entries(offer.give.items)[0]! as [TradeItemId, number];
    const before = (await store.getPlayer(season, owner))!.player;
    const done = view(await tradeRespond("a", offer.id, true, deps()));
    assert.equal(done.player.money, v.player.money - offer.want.money);
    assert.equal(done.player.cargo[item], count);
    assert.equal(done.player.canOffer, false);
    const after = (await store.getPlayer(season, owner))!.player;
    assert.equal(after.money, before.money + offer.want.money);
    assert.equal(after.cargo[item] ?? 0, (before.cargo[item] ?? 0) - count);
    assert.deepEqual(await tradeRespond("a", offer.id, true, deps()), { ok: false, error: "offerGone" });
  });

  it("từ chối lời ngỏ của máy thì không hiện lại; ngỏ ép giá thì máy chê, ngỏ hời thì máy nhận ngay", async () => {
    const { v, deps, owner } = await meetBot();
    const bot = v.met.find((m) => m.ownerId === owner)!;
    const offer = v.offers.find((o) => o.id.startsWith("botoffer-") && o.fromName === bot.name)!;
    const after = view(await tradeRespond("a", offer.id, false, deps()));
    assert.equal(after.offers.some((o) => o.id === offer.id), false);
    assert.equal(after.player.canOffer, true, "từ chối không mất lượt giao thương");
    const [item] = Object.entries(bot.cargo)[0]! as [TradeItemId, number];
    const low = await tradeOffer("a", { to: bot.ownerId, legId: bot.legId, give: { money: 1 }, want: { items: { [item]: 1 } } }, deps());
    assert.deepEqual(low, { ok: false, error: "botDeclined" });
    const rich = view(await tradeOffer("a", { to: bot.ownerId, legId: bot.legId, give: { money: 5000 }, want: { items: { [item]: 1 } } }, deps()));
    assert.equal(rich.player.money, v.player.money - 5000);
    assert.equal(rich.player.cargo[item], 1);
    assert.equal(rich.player.canOffer, false);
  });

  it("đoàn máy bán hàng ở nơi tới, lãi lên bảng mùa với tên nhân vật; thưởng mùa chỉ xếp hạng người thật", async () => {
    const h = setup();
    let t = T0;
    for (let i = 0; i < 40; i++, t += 20 * MIN) {
      h.at(t);
      await tradeGet("a", h.deps());
    }
    const board = await tradeBoard(null, h.seasons, t);
    assert.ok(board.top.length > 0, "đoàn máy có lãi phải lên bảng");
    for (const row of board.top) assert.ok(TRADE_BOT_OWNERS.some((o) => tradeBotName(o) === row.name), row.name);
    // Một người thật đứng sau các đoàn máy vẫn nhận thưởng hạng 1.
    const season = tradeSeason(T0);
    await h.seasons.add("trade", season, "human", 1, t);
    const source = seasonSource("trade", h.seasons, TRADE_BOT_OWNERS);
    assert.deepEqual(await source.standing(season, "human"), { rank: 1, participants: 1 });
    assert.equal(await source.standing(season, TRADE_BOT_OWNERS[0]!), null);
  });
});
