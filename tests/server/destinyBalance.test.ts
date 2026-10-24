import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { simulateDestinyCycle, summarize } from "../../src/server/destinyBalanceReport";

describe("Destiny balance harness", () => {
  it("deterministic và giữ đá trong biên policy", () => {
    const a = simulateDestinyCycle("2026-10-19", 5, 10, "boon_first");
    const b = simulateDestinyCycle("2026-10-19", 5, 10, "boon_first");
    assert.deepEqual(a, b);
    assert.ok(a.floors >= 0 && a.floors <= 10);
    assert.ok(a.stones >= 0 && a.stones <= 23, "18 milestone + 5 cycle; không có đá reward giữa tầng");
  });

  it("summary mean/median/p90 ổn định", () => {
    assert.deepEqual(summarize([1, 2, 3, 10]), { mean: 4, median: 2, p90: 10 });
  });
});
