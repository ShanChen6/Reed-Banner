import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OMENS, type DtkEvent } from "../../src/core/dien-trang-ky";
import { eventCue } from "../../src/app/game/dien-trang-ky/sounds";

const ev = (body: Record<string, unknown>): DtkEvent => ({ n: 1, seat: 0, ...body }) as unknown as DtkEvent;

describe("Điền Trang Ký: tiếng theo sự kiện", () => {
  it("đổ xúc xắc, đi quân, nhận lương", () => {
    assert.equal(eventCue(ev({ k: "roll", dice: [2, 3] })), "dtk.roll");
    assert.equal(eventCue(ev({ k: "move", from: 0, to: 5 })), "dtk.move");
    assert.equal(eventCue(ev({ k: "salary", amount: 200 })), "dtk.salary");
  });

  it("mua và mua lại đất cùng một tiếng, xây và xây miễn phí cùng một tiếng", () => {
    assert.equal(eventCue(ev({ k: "buy", tile: 1, level: 0, cost: 60 })), "dtk.buy");
    assert.equal(eventCue(ev({ k: "buyout", tile: 1, from: 1, cost: 120 })), "dtk.buy");
    assert.equal(eventCue(ev({ k: "build", tile: 1, level: 2, cost: 60 })), "dtk.build");
    assert.equal(eventCue(ev({ k: "freeBuild", tile: 1, level: 2 })), "dtk.build");
  });

  it("mất tiền là tiếng nộp tô, được tiền là tiếng nhận", () => {
    assert.equal(eventCue(ev({ k: "rent", tile: 1, owner: 1, amount: 30 })), "dtk.rent");
    assert.equal(eventCue(ev({ k: "pay", amount: 50, reason: "tribute" })), "dtk.pay");
    assert.equal(eventCue(ev({ k: "sell", tile: 1, amount: 30 })), "dtk.sell");
    assert.equal(eventCue(ev({ k: "gain", amount: 50, reason: "omen" })), "dtk.gain");
  });

  it("giam, ra ngục, phúc lành, gom dãy, phá sản", () => {
    assert.equal(eventCue(ev({ k: "jailed" })), "dtk.jailed");
    assert.equal(eventCue(ev({ k: "freed", how: "bail" })), "dtk.freed");
    assert.equal(eventCue(ev({ k: "blessing" })), "dtk.blessing");
    assert.equal(eventCue(ev({ k: "festival", tile: 3 })), "dtk.blessing");
    assert.equal(eventCue(ev({ k: "monopoly", how: "scenic" })), "dtk.monopoly");
    assert.equal(eventCue(ev({ k: "out", by: null })), "dtk.out");
  });

  it("quẻ chỉ kêu điềm báo khi là quẻ thiên tai; thiên tai theo loại", () => {
    const disaster = OMENS.find((o) => o.effect.k === "disaster")!;
    const good = OMENS.find((o) => o.effect.k === "gain")!;
    assert.equal(eventCue(ev({ k: "omen", omen: disaster.id })), "dtk.omen");
    assert.equal(eventCue(ev({ k: "omen", omen: good.id })), null);
    assert.equal(eventCue(ev({ k: "disaster", how: "quake", tile: 1, level: 1, ruin: 0 })), "dtk.quake");
    assert.equal(eventCue(ev({ k: "disaster", how: "storm", tile: 1, level: 1, ruin: 2 })), "dtk.storm");
  });

  it("việc chưa có tệp riêng thì im", () => {
    for (const k of ["end", "noDisaster", "extra", "jailStay"]) assert.equal(eventCue(ev({ k })), null, k);
  });
});
