import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { act, createBattle, parseBoard, type BattleState, type FighterConfig, type SideConfig } from "../../../src/core";

const fighter = (id: string, extra: Partial<FighterConfig> = {}): FighterConfig => ({ id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 20, def: 0, ...extra });
const trio = (p: string, elements: readonly FighterConfig["element"][] = ["moc", "hoa", "thuy"]): SideConfig => ({
  fighters: elements.map((element, i) => fighter(`${p}${i + 1}`, { element })),
  leader: 0,
});

const DRUMS = `
    ABTSVABTSVAB
    TSVABTSVABTS
    DDADBSVABTSV
    VTBSATBSATBS
    ABTSVABTSVAB
    TSVABTSVABTS
    VABTSVABTSVA
    BTSVABTSVABT
  `;

function start(perFighterRage: boolean): BattleState {
  const { state } = createBattle({ sides: [trio("a"), trio("b")], seed: 1, perFighterRage });
  return structuredClone({ ...state, board: parseBoard(DRUMS) });
}

describe("Nộ riêng từng tướng (Đấu người 3vs3)", () => {
  it("không bật thì vẫn là một Nộ chung của thủ lĩnh, không có mảng Nộ riêng", () => {
    const s = start(false);
    assert.equal(s.sides[0].rages, undefined);
    assert.equal(s.sides[0].passives, undefined);
  });

  it("bật thì mỗi tướng có Nộ riêng, bắt đầu từ 0", () => {
    const s = start(true);
    assert.deepEqual(s.sides[0].rages, [0, 0, 0]);
    assert.deepEqual(s.sides[1].passives, [0, 0, 0]);
  });

  it("ghép trống: Nộ vào tướng đang hành động, không vào thủ lĩnh; đầy thì chỉ tướng đó có bị động", () => {
    const s = start(true);
    const actor = s.turn.actor;
    s.sides[0].rages![actor] = 95;
    const r = act(s, { type: "swap", from: { row: 2, col: 3 }, to: { row: 2, col: 2 } });
    assert.ok(r.ok, r.ok ? "" : r.error);
    if (!r.ok) return;
    assert.ok(r.events.some((e) => e.type === "passive" && e.side === 0 && e.fighter === actor));
    assert.equal(r.state.sides[0].rages![actor], 0);
    assert.equal(r.state.sides[0].passives![actor], 4);
    assert.deepEqual(r.state.sides[0].passives!.filter((_, i) => i !== actor), [0, 0]);
    assert.equal(r.state.sides[0].rage, 0);
    assert.equal(r.state.sides[0].passiveTurns, 0);
  });

  it("Nộ riêng không dồn vào Nộ chung: tướng khác giữ nguyên Nộ", () => {
    const s = start(true);
    const actor = s.turn.actor;
    const r = act(s, { type: "swap", from: { row: 2, col: 3 }, to: { row: 2, col: 2 } });
    assert.ok(r.ok);
    if (!r.ok) return;
    const rages = r.state.sides[0].rages!;
    assert.ok(rages[actor]! > 0);
    assert.deepEqual(rages.filter((_, i) => i !== actor), [0, 0]);
  });
});
