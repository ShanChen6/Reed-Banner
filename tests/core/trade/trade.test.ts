import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { findBestSwap, skAct, type SkAction } from "../../../src/core/su-lo";
import {
  TRADE_EDGES,
  TRADE_ITEMS,
  TRADE_NODE_IDS,
  TRADE_PASSES_PER_DAY,
  TRADE_START_MONEY,
  MARKET_FIXED,
  advanceRow,
  assortment,
  buyGoods,
  buyPrice,
  depart,
  edgeKey,
  encounterBoard,
  hops,
  initialRow,
  isSpecialtyHere,
  legMs,
  marketSeason,
  nextSlotAt,
  normalSpeed,
  passesPerDay,
  presenceAt,
  stockTarget,
  legsMeet,
  loseCargo,
  newTradePlayer,
  parseBundle,
  quote,
  resolveEncounter,
  sellGoods,
  sellPrice,
  settle,
  tradeEdge,
  tradeSlot,
  upgrade,
  type TradePlayer,
} from "../../../src/core/trade";

const T0 = Date.UTC(2026, 10, 23, 1, 0, 0); // thứ Hai 23/11/2026, 8 giờ sáng giờ VN
const MIN = 60_000;

describe("Hành Thương Ký: bản đồ", () => {
  it("13 điểm nối liền nhau, cạnh không trùng và đi được hai chiều", () => {
    assert.equal(TRADE_NODE_IDS.length, 13);
    assert.ok(TRADE_NODE_IDS.includes("cuaDaiAc"));
    const keys = TRADE_EDGES.map((e) => edgeKey(e.a, e.b));
    assert.equal(new Set(keys).size, keys.length);
    for (const n of TRADE_NODE_IDS) assert.ok(hops("hoaLu", n) >= 0, `${n} không tới được`);
    const e = TRADE_EDGES[0]!;
    assert.equal(tradeEdge(e.a, e.b), tradeEdge(e.b, e.a));
  });
});

describe("Hành Thương Ký: chợ", () => {
  it("giá như nhau với mọi người trong một khung, mua rồi bán ngay tại chỗ luôn lỗ", () => {
    const slot = tradeSlot(T0);
    for (const node of TRADE_NODE_IDS)
      for (const it of TRADE_ITEMS) {
        const row = initialRow(it.id, node, slot);
        assert.equal(buyPrice("s", node, it.id, slot, row.slotStock), buyPrice("s", node, it.id, slot, row.slotStock));
        assert.ok(sellPrice("s", node, it.id, slot, row.slotStock) < buyPrice("s", node, it.id, slot, row.slotStock));
      }
  });

  it("đặc sản rẻ ở quê nhà, đắt hơn ở nơi khác; nhãn Đặc sản và Hiếm không chồng nhau", () => {
    const slot = tradeSlot(T0);
    const silkHome = quote("s", "teGiang", "silk", initialRow("silk", "teGiang", slot));
    assert.equal(silkHome.specialty, true);
    assert.equal(silkHome.rare, false);
    const away = TRADE_NODE_IDS.find((n) => n !== "teGiang" && presenceAt("s", n, slot).has("silk"))!;
    const silkAway = quote("s", away, "silk", initialRow("silk", away, slot));
    assert.equal(silkAway.specialty, false);
    assert.ok(silkAway.sell > silkHome.buy, "chở lụa đi xa phải có lãi");
  });

  it("món nào cũng có tranh ở public/art/trade/goods", () => {
    for (const it of TRADE_ITEMS) assert.ok(existsSync(`public/art/trade/goods/${it.id}.webp`), it.id);
  });

  it("40 món, mỗi chợ khoảng 20 món mỗi phiên, 2 đặc sản luôn bày, 1–2 món Hiếm không phải đặc sản", () => {
    assert.equal(TRADE_ITEMS.length, 40);
    const s0 = tradeSlot(T0);
    for (const node of TRADE_NODE_IDS) {
      const a = assortment(node);
      assert.equal(a.fixed.length, MARKET_FIXED);
      for (let slot = s0; slot < s0 + 24; slot++) {
        const shown = presenceAt("s", node, slot);
        assert.ok(shown.size >= 17 && shown.size <= 26, `${node} bày ${shown.size} món`);
        const tags = [...shown].map(([id, how]) => ({ id, how, home: isSpecialtyHere(id, node) }));
        assert.equal(tags.filter((t) => t.home).length, 2, node);
        assert.ok(tags.filter((t) => t.home).every((t) => t.how === "fixed"));
        const rare = tags.filter((t) => t.how === "rare");
        assert.ok(rare.length >= 1 && rare.length <= 2);
        assert.ok(rare.every((t) => !t.home && TRADE_ITEMS.find((i) => i.id === t.id)!.tier !== "treasure"));
        assert.deepEqual([...presenceAt("s", node, slot)], [...shown], "ai cũng thấy chợ bày như nhau");
      }
    }
  });

  it("món chợ không bày có mức tồn 0; kho đặc sản đủ cho nhiều đoàn", () => {
    const slot = tradeSlot(T0);
    for (const node of TRADE_NODE_IDS) {
      for (const id of assortment(node).absent) assert.equal(initialRow(id, node, slot).stock, 0);
      for (const it of TRADE_ITEMS.filter((i) => i.homes.includes(node))) assert.ok(stockTarget(it.id, node) * (it.tier === "treasure" ? 1 / 5 : 1) >= 30, it.id);
    }
  });

  it("kho thiếu thì khung sau giá lên; chợ tự hồi về mức bình thường", () => {
    const slot = tradeSlot(T0);
    const row = initialRow("rice", "dangChau", slot);
    const drained = advanceRow("s", "dangChau", "rice", { ...row, stock: 20 }, slot + 1);
    assert.ok(drained.slotStock > 20 && drained.slotStock < row.stock, "chợ chỉ tự sinh một phần mỗi khung");
    assert.ok(buyPrice("s", "dangChau", "rice", slot + 1, drained.slotStock) > buyPrice("s", "dangChau", "rice", slot + 1, row.stock));
    assert.equal(quote("s", "dangChau", "rice", drained).stock, drained.stock);
  });

  it("chạy thử nhanh: khung giá, đường đi và lộ phiếu theo tốc độ; kho riêng", () => {
    assert.equal(tradeSlot(T0, 1), tradeSlot(T0));
    assert.ok(tradeSlot(T0, 10) >= tradeSlot(T0) * 10);
    assert.equal(nextSlotAt(T0, 10) - T0 <= 12 * MIN, true);
    assert.equal(normalSpeed(0), 1);
    assert.equal(normalSpeed(500), 120);
    assert.equal(marketSeason("2026-11-23", 1), "2026-11-23");
    assert.notEqual(marketSeason("2026-11-23", 10), "2026-11-23");
    assert.equal(passesPerDay(10), TRADE_PASSES_PER_DAY * 10);
    const p = fresh();
    const next = TRADE_EDGES.find((e) => e.a === p.node || e.b === p.node)!;
    const to = next.a === p.node ? next.b : next.a;
    const slow = depart(p, to, T0, "a", 0.99, 1);
    const fast = depart(p, to, T0, "a", 0.99, 1, 10);
    assert.ok(slow.ok && fast.ok);
    assert.equal(fast.player.leg!.arriveAt - T0, legMs(tradeEdge(p.node, to)!, 1, 10));
    assert.ok(fast.player.leg!.arriveAt - T0 < slow.player.leg!.arriveAt - T0);
  });
});

function fresh(): TradePlayer {
  return newTradePlayer("2026-11-23", 0, T0);
}

describe("Hành Thương Ký: đoàn hàng", () => {
  it("bắt đầu như nhau, mua bán theo vốn và sức chở", () => {
    const p = fresh();
    assert.equal(p.money, TRADE_START_MONEY);
    assert.deepEqual(buyGoods(p, "rice", 5, 20, 3, T0), { ok: false, error: "noStock" });
    assert.deepEqual(buyGoods(p, "rice", 101, 1, 999, T0), { ok: false, error: "overCapacity" });
    assert.deepEqual(buyGoods(p, "ivory", 20, 800, 999, T0), { ok: false, error: "noMoney" });
    const r = buyGoods(p, "rice", 10, 20, 999, T0);
    assert.ok(r.ok);
    assert.equal(r.player.money, TRADE_START_MONEY - 200);
    const s = sellGoods(r.player, "rice", 10, 18, 5, T0);
    assert.deepEqual(s, { ok: false, error: "marketFull" });
  });

  it("5 lộ phiếu một ngày, không tích sang hôm sau", () => {
    let p = fresh();
    let now = T0;
    for (let i = 0; i < TRADE_PASSES_PER_DAY; i++) {
      const to = TRADE_EDGES.find((e) => e.a === p.node || e.b === p.node)!;
      const next = to.a === p.node ? to.b : to.a;
      const r = depart(p, next, now, `leg${i}`, 0.99, 1);
      assert.ok(r.ok, `chặng ${i}`);
      p = r.player;
      now = p.leg!.arriveAt;
      p = settle(p, now);
    }
    const back = depart(p, p.leg!.from, now, "x", 0.99, 1);
    assert.deepEqual(back, { ok: false, error: "noPasses" });
    const tomorrow = now + 24 * 60 * MIN;
    const r = depart(p, p.leg!.from, tomorrow, "y", 0.99, 1);
    assert.ok(r.ok);
  });

  it("đang đi thì không mua bán, tới nơi mới mở chợ; nâng cấp làm nhanh hơn", () => {
    const p = fresh();
    const to = TRADE_EDGES.find((e) => e.a === p.node || e.b === p.node)!;
    const next = to.a === p.node ? to.b : to.a;
    const r = depart(p, next, T0, "l1", 0.99, 1);
    assert.ok(r.ok);
    assert.deepEqual(buyGoods(r.player, "rice", 1, 20, 99, T0 + MIN), { ok: false, error: "traveling" });
    assert.equal(settle(r.player, r.player.leg!.arriveAt).node, next);
    const up = upgrade(p, T0);
    assert.ok(up.ok);
    const fast = depart(up.player, next, T0, "l2", 0.99, 1);
    assert.ok(fast.ok);
    assert.ok(fast.player.leg!.arriveAt - T0 < r.player.leg!.arriveAt - T0);
  });

  it("gặp nạn: nộp mãi lộ mất 10%, đánh thắng giữ trọn hàng, bỏ dở thì mất 30% (kỳ trân mất trước)", () => {
    const loaded: TradePlayer = { ...fresh(), cargo: { rice: 50, pearl: 2 } };
    const to = TRADE_EDGES.find((e) => e.a === loaded.node || e.b === loaded.node)!;
    const next = to.a === loaded.node ? to.b : to.a;
    const r = depart(loaded, next, T0, "l1", 0, 4242);
    assert.ok(r.ok && r.player.leg!.encounter);
    const arrived = settle(r.player, r.player.leg!.arriveAt);
    assert.ok(arrived.encounter);
    assert.deepEqual(buyGoods(arrived, "rice", 1, 1, 9, r.player.leg!.arriveAt), { ok: false, error: "encounterPending" });

    const toll = resolveEncounter(arrived, "toll", [], arrived.leg!.arriveAt);
    assert.ok(toll.ok && toll.outcome === "toll");
    assert.equal(toll.player.cargo.pearl, 1, "kỳ trân mất trước");

    let s = encounterBoard(arrived.encounter);
    const actions: SkAction[] = [];
    while (s.phase === "play") {
      const best = findBestSwap(s)!;
      const a: SkAction = { type: "swap", from: best.from, to: best.to };
      const step = skAct(s, a);
      assert.ok(step.ok);
      actions.push(a);
      s = step.state;
    }
    const won = resolveEncounter(arrived, "fight", actions, arrived.leg!.arriveAt);
    assert.ok(won.ok && won.outcome === "won");
    assert.deepEqual(won.player.cargo, arrived.cargo);

    const quit = resolveEncounter(arrived, "fight", [], arrived.leg!.arriveAt);
    assert.ok(quit.ok && quit.outcome === "lost");
    assert.ok(!quit.player.cargo.pearl);
    assert.deepEqual(resolveEncounter(arrived, "fight", [{ type: "swap", from: { row: 0, col: 0 }, to: { row: 5, col: 5 } }], arrived.leg!.arriveAt), { ok: false, error: "badActions" });
  });

  it("mất hàng theo giá trị, không mất đoàn", () => {
    assert.deepEqual(loseCargo({}, 0.3), { cargo: {}, lost: {} });
    const r = loseCargo({ rice: 10 }, 0.3);
    assert.equal(r.cargo.rice, 7);
  });
});

describe("Hành Thương Ký: giao thương giữa đường", () => {
  it("cùng chặng (chiều nào cũng được) và trùng ít nhất 5 phút mới gặp", () => {
    const a = { from: "hoaLu" as const, to: "boHai" as const, departAt: T0, arriveAt: T0 + 20 * MIN };
    assert.ok(legsMeet(a, { from: "boHai", to: "hoaLu", departAt: T0 + 10 * MIN, arriveAt: T0 + 30 * MIN }));
    assert.ok(!legsMeet(a, { from: "boHai", to: "hoaLu", departAt: T0 + 16 * MIN, arriveAt: T0 + 36 * MIN }));
    assert.ok(!legsMeet(a, { from: "hoaLu", to: "cuaDaiAc", departAt: T0, arriveAt: T0 + 20 * MIN }));
  });

  it("đọc gói hàng gửi lên, loại món lạ và số âm", () => {
    assert.deepEqual(parseBundle({ items: { rice: 3 }, money: 10 }), { items: { rice: 3 }, money: 10 });
    assert.equal(parseBundle({ items: { gold: 1 } }), null);
    assert.equal(parseBundle({ money: -1 }), null);
  });
});
