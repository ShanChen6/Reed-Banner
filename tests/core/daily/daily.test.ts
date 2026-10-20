import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBattle,
  DAILY_LEVEL,
  dailyKey,
  dailyScore,
  dailySetup,
  MAIN_ID,
  type BattleState,
} from "../../../src/core";

function ended(winner: 0 | 1, turns: number, hpRatio: number): BattleState {
  const d = dailySetup(1);
  const { state } = createBattle({
    sides: [
      { fighters: d.team, leader: 0 },
      { fighters: d.foes, leader: 0 },
    ],
    seed: 1,
  });
  const s = structuredClone(state);
  const loser = s.sides[winner === 0 ? 1 : 0];
  loser.fighters.forEach((f) => (f.hp = 0));
  s.sides[winner].fighters.forEach(
    (f) => (f.hp = Math.round(f.maxHp * hpRatio)),
  );
  s.winner = winner;
  s.turn.number = turns;
  return s;
}

describe("thử thách hằng ngày", () => {
  it("ngày đổi lúc 0 giờ giờ Việt Nam", () => {
    assert.equal(dailyKey(Date.UTC(2026, 9, 20, 16, 59)), "2026-10-20");
    assert.equal(dailyKey(Date.UTC(2026, 9, 20, 17, 0)), "2026-10-21");
  });

  it("cùng seed cùng đề: Đinh Bộ Lĩnh và 2 nhân vật kèm gặp một sứ quân và 2 tùy tướng", () => {
    const a = dailySetup(123);
    assert.deepEqual(a, dailySetup(123));
    assert.notDeepEqual(a, dailySetup(124));
    assert.equal(a.team.length, 3);
    assert.equal(a.team[0]!.id, MAIN_ID);
    assert.equal(a.foes.length, 3);
    const ids = [...a.team, ...a.foes].map((f) => f.id);
    assert.equal(new Set(ids).size, 6);
    assert.ok(DAILY_LEVEL > 1);
  });

  it("điểm: thắng luôn trên thua, ít lượt hơn rồi nhiều máu hơn đứng trên", () => {
    const fast = dailyScore(ended(0, 20, 0.3));
    const slow = dailyScore(ended(0, 30, 0.9));
    const healthy = dailyScore(ended(0, 20, 0.6));
    const lost = dailyScore(ended(1, 10, 1));
    assert.ok(fast.won && !lost.won);
    assert.ok(fast.score > slow.score);
    assert.ok(healthy.score > fast.score);
    assert.ok(slow.score > lost.score);
    assert.equal(fast.turns, 20);
    assert.equal(lost.permille, 1000 - 1000);
  });
});
