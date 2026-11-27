import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BOT_CHARACTERS, PERSONALITIES, type PersonalityId } from "../../../src/core/ai";
import {
  TRADE_BOT_CAPACITY,
  TRADE_BOT_PURSE,
  TRADE_EDGES,
  TRADE_STYLES,
  botAccepts,
  botLegById,
  botLegsOn,
  botOffer,
  cargoWeight,
  edgeKey,
  legMs,
  legsMeet,
  referencePrice,
  type BotLeg,
  type TradeItemId,
} from "../../../src/core/trade";

const T0 = Date.UTC(2026, 10, 23, 1, 0, 0);
const DAY = 24 * 3_600_000;
const SEASON = "2026-W48";

const allLegs = (from: number, to: number) => TRADE_EDGES.flatMap((e) => botLegsOn(SEASON, edgeKey(e.a, e.b), from, to));

describe("thương đoàn máy Hành Thương Ký", () => {
  it("lịch tất định theo mùa, chặng nằm trong khoảng hỏi, mã chặng dựng lại được", () => {
    const e = TRADE_EDGES[0]!;
    const a = botLegsOn(SEASON, edgeKey(e.a, e.b), T0, T0 + DAY);
    assert.deepEqual(a, botLegsOn(SEASON, edgeKey(e.a, e.b), T0, T0 + DAY));
    assert.notDeepEqual(a, botLegsOn("2026-W49", edgeKey(e.a, e.b), T0, T0 + DAY));
    for (const l of a) {
      assert.equal(edgeKey(l.from, l.to), edgeKey(e.a, e.b));
      assert.ok(l.departAt <= T0 + DAY && l.arriveAt >= T0);
      assert.deepEqual(botLegById(SEASON, l.legId), l);
      assert.ok(l.ownerId.startsWith("bot:"));
    }
    assert.equal(botLegById(SEASON, "bot-khongCo-1"), null);
  });

  it("đủ đông: chặng người chơi đi bất kỳ lúc nào cũng thường gặp ít nhất một thương đoàn máy", () => {
    let met = 0;
    let total = 0;
    for (const e of TRADE_EDGES) {
      for (let t = T0; t < T0 + DAY; t += 37 * 60_000) {
        const leg = { from: e.a, to: e.b, departAt: t, arriveAt: t + legMs(e, 1) };
        total++;
        if (botLegsOn(SEASON, edgeKey(e.a, e.b), leg.departAt, leg.arriveAt).some((b) => legsMeet(leg, b))) met++;
      }
    }
    assert.ok(met / total > 0.25, `chỉ gặp ${met}/${total}`);
    assert.ok(met / total < 0.9, `gặp quá dày ${met}/${total}`);
  });

  it("khoang đoàn máy không quá sức chở, mỗi người dẫn đoàn là một nhân vật máy", () => {
    for (const l of allLegs(T0, T0 + DAY)) {
      assert.ok(cargoWeight(l.cargo) <= TRADE_BOT_CAPACITY, `${l.legId} ${cargoWeight(l.cargo)}`);
      assert.ok(BOT_CHARACTERS.includes(l.character));
    }
  });

  it("lời ngỏ đoàn máy: bán món đắt nhất lấy kim tiền, giá theo chợ nơi tới nhân hệ số tính cách", () => {
    const leg = allLegs(T0, T0 + DAY).find((l) => Object.keys(l.cargo).length > 0)!;
    const o = botOffer(SEASON, leg, leg.arriveAt)!;
    const [item, n] = Object.entries(o.give.items)[0]! as [TradeItemId, number];
    assert.ok(n > 0 && n <= (leg.cargo[item] ?? 0));
    assert.equal(o.want.money, Math.round(referencePrice(SEASON, leg.to, item, leg.arriveAt) * n * TRADE_STYLES[leg.character.personality].markup));
    assert.deepEqual(o.want.items, {});
  });

  it("trả lời lời ngỏ theo tính cách: mưu phá khó ép giá hơn hộ chủ; xin hàng đoàn không có hoặc quá túi tiền thì chê", () => {
    const base = allLegs(T0, T0 + DAY).find((l) => Object.keys(l.cargo).length > 0)!;
    const as = (p: PersonalityId): BotLeg => ({ ...base, character: BOT_CHARACTERS.find((c) => c.personality === p)! });
    const [item, have] = Object.entries(base.cargo)[0]! as [TradeItemId, number];
    const ref = referencePrice(SEASON, base.to, item, base.arriveAt);
    const want = { items: { [item]: 1 }, money: 0 };
    // Trả đúng giá chợ: hộ chủ (0,92) nhận, mưu phá (1,12) chê.
    const fair = { items: {}, money: ref };
    assert.equal(botAccepts(SEASON, as("hoChu"), fair, want, base.arriveAt), true);
    assert.equal(botAccepts(SEASON, as("muuPha"), fair, want, base.arriveAt), false);
    assert.equal(botAccepts(SEASON, as("muuPha"), { items: {}, money: Math.ceil(ref * 1.2) }, want, base.arriveAt), true);
    assert.equal(botAccepts(SEASON, as("thuThanh"), fair, { items: { [item]: have + 1 }, money: 0 }, base.arriveAt), false);
    assert.equal(botAccepts(SEASON, as("thuThanh"), { items: {}, money: TRADE_BOT_PURSE * 2 }, { items: {}, money: TRADE_BOT_PURSE + 1 }, base.arriveAt), false);
    // Bán hàng cho đoàn máy: tính như chợ thu mua (90%), nên đòi đúng giá chợ thì thủ thành chê.
    assert.equal(botAccepts(SEASON, as("thuThanh"), { items: { [item]: 10 }, money: 0 }, { items: {}, money: ref * 10 }, base.arriveAt), false);
    assert.equal(botAccepts(SEASON, as("thuThanh"), { items: { [item]: 10 }, money: 0 }, { items: {}, money: Math.floor(ref * 10 * 0.85) }, base.arriveAt), true);
    for (const id of Object.keys(PERSONALITIES) as PersonalityId[]) assert.ok(TRADE_STYLES[id]);
  });
});
