import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addEffect, removeEffects, statModifier, tickDurations, type Effect } from "../../../src/core";

describe("hiệu ứng", () => {
  it("cùng loại thì làm mới: giữ giá trị mạnh hơn và thời lượng dài hơn", () => {
    const list: Effect[] = [];
    addEffect(list, { kind: "atkUp", value: 0.25, turns: 1 });
    addEffect(list, { kind: "atkUp", value: 0.1, turns: 3 });
    assert.deepEqual(list, [{ kind: "atkUp", value: 0.25, turns: 3 }]);
  });

  it("Đóng băng tối đa 2 lượt, tan thì miễn nhiễm 1 lượt", () => {
    const list: Effect[] = [];
    addEffect(list, { kind: "freeze", value: 0, turns: 5 });
    assert.equal(list[0]?.turns, 2);
    tickDurations(list);
    assert.deepEqual(tickDurations(list), ["freeze"]);
    assert.equal(addEffect(list, { kind: "freeze", value: 0, turns: 1 }), false);
    assert.deepEqual(tickDurations(list), ["freezeImmune"]);
    assert.equal(addEffect(list, { kind: "freeze", value: 0, turns: 1 }), true);
  });

  it("Khiêu khích tối đa 2 lượt; Khiên không hết hạn theo lượt", () => {
    const list: Effect[] = [];
    addEffect(list, { kind: "taunt", value: 0, turns: 4 });
    addEffect(list, { kind: "shield", value: 100, turns: null });
    assert.equal(list[0]?.turns, 2);
    tickDurations(list);
    tickDurations(list);
    assert.deepEqual(list, [{ kind: "shield", value: 100, turns: null }]);
  });

  it("Công/Thủ cộng trừ thành một hệ số", () => {
    const list: Effect[] = [
      { kind: "atkUp", value: 0.25, turns: 2 },
      { kind: "atkDown", value: 0.1, turns: 2 },
    ];
    assert.equal(statModifier(list, "atkUp", "atkDown"), 1.15);
    assert.equal(statModifier([], "defUp", "defDown"), 1);
  });

  it("removeEffects xóa đúng loại", () => {
    const list: Effect[] = [
      { kind: "burn", value: 5, turns: 1 },
      { kind: "shield", value: 5, turns: null },
    ];
    assert.deepEqual(removeEffects(list, ["burn", "silence"]), ["burn"]);
    assert.equal(list.length, 1);
  });
});
