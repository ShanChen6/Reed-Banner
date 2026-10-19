import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  createBattle,
  mainSkills,
  parseBoard,
  SKILL_BOARD_ENERGY,
  SKILL_BOARD_SWORD,
  type BattleState,
  type FighterConfig,
  type SideConfig,
} from "../../../src/core";

function fighter(id: string, extra: Partial<FighterConfig> = {}): FighterConfig {
  return { id, name: id, element: "hoa", profession: "phapSu", maxHp: 1000, atk: 100, def: 0, ...extra };
}

const solo = (f: FighterConfig): SideConfig => ({ fighters: [f], leader: 0 });

// Góc trái trên: 5 kiếm và 4 âm dương xen kẽ, không có bộ ghép nào. Phần còn lại lặp BTVS theo đường chéo.
function board() {
  const rows = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 12 }, (_, c) => (r < 3 && c < 3 ? ((r + c) % 2 === 0 ? "K" : "A") : "BTVS"[(r + c) % 4])).join(""),
  );
  return parseBoard(rows.join("\n"));
}

function setup(): BattleState {
  const hero = fighter("dbl", { profession: "tuongSi", skills: mainSkills("hoa").map((d) => d.id) });
  const { state } = createBattle({ sides: [solo(hero), solo(fighter("b"))], seed: 1, timer: false });
  const s = structuredClone(state);
  s.board = board();
  s.sides[0].fighters[0]!.energy = 50;
  return s;
}

describe("thu hoạch khi kỹ năng đổi bàn cờ", () => {
  it("ô bị phá ra sát thương kiếm và năng lượng giảm theo hệ số", () => {
    const r = act(setup(), { type: "skill", skill: "phongHoaThieuDoanh", cell: { row: 0, col: 0 } });
    assert.ok(r.ok);
    const sword = r.events.find((e) => e.type === "damage" && e.source === "sword");
    assert.ok(sword && sword.type === "damage");
    assert.equal(sword.amount, Math.round(5 * 100 * SKILL_BOARD_SWORD));
    const energy = r.events.find((e) => e.type === "energy" && e.side === 0);
    assert.ok(energy && energy.type === "energy");
    assert.equal(energy.amount, Math.round(4 * 10 * SKILL_BOARD_ENERGY));
  });
});
