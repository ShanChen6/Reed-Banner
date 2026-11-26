import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { NodeId } from "../../src/core/tam-tuong-ky";
import { slotFilled } from "../../src/app/game/tam-tuong-ky/sounds";

const a = "kim" as NodeId;
const b = "moc" as NodeId;

describe("âm thanh Tầm Tướng Ký", () => {
  it("đặt nguyên liệu mới vào ô thì có tiếng; gỡ, dọn ô và đổi chỗ thì im", () => {
    assert.equal(slotFilled([null, null], [a, null]), true);
    assert.equal(slotFilled([a, null], [a, b]), true);
    assert.equal(slotFilled([null, null], [a, b]), true);
    assert.equal(slotFilled([a, b], [a, null]), false);
    assert.equal(slotFilled([a, b], [null, null]), false);
    assert.equal(slotFilled([a, b], [b, a]), false);
    assert.equal(slotFilled([a, null], [a, null]), false);
  });
});
