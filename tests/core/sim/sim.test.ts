import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMatchups, mainCharacter, runBattle, STARTER_COMPANIONS, summarize } from "../../../src/core";

describe("đội hình khởi đầu", () => {
  it("có 5 nhân vật kèm, mỗi người một nghề khác Tướng sĩ, kèm chiêu nấc 1–2 và tuyệt chiêu nấc 3", () => {
    const professions = STARTER_COMPANIONS.map((c) => c.profession);
    assert.equal(new Set(professions).size, 5);
    assert.ok(!professions.includes("tuongSi"));
    for (const c of STARTER_COMPANIONS) assert.equal(c.skills?.length, 4);
  });

  it("nhân vật chính mang 6 kỹ năng chủ động hệ Mộc", () => {
    const main = mainCharacter();
    assert.equal(main.element, "moc");
    assert.equal(main.skills?.length, 6);
  });
});

describe("mô phỏng cân bằng", () => {
  it("sinh cặp đấu đúng sĩ số và luân phiên phe đi trước", () => {
    const three = buildMatchups("3v3", 4);
    for (const m of three) {
      assert.equal(m.sides[0].fighters.length, 3);
      assert.equal(m.sides[1].fighters.length, 3);
    }
    assert.deepEqual(three.map((m) => m.firstSide), [0, 1, 0, 1]);
    const one = buildMatchups("1v1", 30);
    for (const m of one) assert.notEqual(m.sides[0].fighters[0]!.id, m.sides[1].fighters[0]!.id);
  });

  it("cùng seed cho cùng kết quả, và tổng hợp nhất quán", () => {
    const ms = buildMatchups("1v1", 3, 9);
    const a = ms.map((m) => runBattle(m, { maxTurns: 40 }));
    const b = ms.map((m) => runBattle(m, { maxTurns: 40 }));
    assert.deepEqual(a, b);
    const s = summarize(a);
    assert.equal(s.battles, 3);
    assert.ok(s.draws >= 0 && s.draws <= 3);
    for (const r of a) assert.ok(r.turns <= 40);
    assert.ok(s.fighters.every((f) => f.wins <= f.battles));
  });
});
