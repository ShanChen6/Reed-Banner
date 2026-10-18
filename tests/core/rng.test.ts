import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRng } from "../../src/core/rng";

describe("createRng", () => {
  it("cùng seed cho cùng dãy số", () => {
    const a = createRng(12345);
    const b = createRng(12345);
    for (let i = 0; i < 100; i++) assert.equal(a.next(), b.next());
  });

  it("khác seed cho dãy khác", () => {
    const a = createRng(1);
    const b = createRng(2);
    assert.notEqual(a.next(), b.next());
  });

  it("next() nằm trong [0, 1)", () => {
    const rng = createRng(42);
    for (let i = 0; i < 10_000; i++) {
      const x = rng.next();
      assert.ok(x >= 0 && x < 1);
    }
  });

  it("int() gồm cả hai đầu và không ra ngoài khoảng", () => {
    const rng = createRng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 10_000; i++) {
      const x = rng.int(0, 6);
      assert.ok(Number.isInteger(x) && x >= 0 && x <= 6);
      seen.add(x);
    }
    assert.equal(seen.size, 7);
  });

  it("int() từ chối khoảng không hợp lệ", () => {
    const rng = createRng(0);
    assert.throws(() => rng.int(5, 1), RangeError);
    assert.throws(() => rng.int(0.5, 2), RangeError);
  });

  it("khôi phục từ state() tiếp tục đúng dãy", () => {
    const a = createRng(99);
    a.next();
    a.next();
    const b = createRng(a.state());
    for (let i = 0; i < 20; i++) assert.equal(a.next(), b.next());
  });
});
