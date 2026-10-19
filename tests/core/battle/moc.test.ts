import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  createBattle,
  findValidMoves,
  mainSkills,
  type BattleState,
  type FighterConfig,
  type SideConfig,
} from "../../../src/core";

function fighter(id: string, extra: Partial<FighterConfig> = {}): FighterConfig {
  return { id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 100, def: 0, ...extra };
}

const MOC = mainSkills("moc").map((d) => d.id);
const hero = (extra: Partial<FighterConfig> = {}) => fighter("dbl", { element: "moc", skills: MOC, ...extra });
const solo = (f: FighterConfig): SideConfig => ({ fighters: [f], leader: 0 });

function setup(sides: [SideConfig, SideConfig], energy = 100): BattleState {
  const { state } = createBattle({ sides, seed: 1, timer: false });
  const s = structuredClone(state);
  for (const side of s.sides) for (const f of side.fighters) f.energy = energy;
  return s;
}

function ok(result: ReturnType<typeof act>) {
  assert.ok(result.ok, result.ok ? "" : result.error);
  return result;
}

const me = (s: BattleState) => s.sides[0].fighters[0]!;

describe("bộ kỹ năng hệ Mộc", () => {
  it("đủ 6 ô với chi phí theo khung chung", () => {
    assert.deepEqual(mainSkills("moc").map((d) => [d.slot, d.cost]), [[1, 35], [2, 30], [3, 40], [4, 60], [5, 100], [6, 50]]);
  });

  it("Lục Diệp Phong phá 5 ô ngẫu nhiên và thu hoạch chúng", () => {
    const s = setup([solo(hero()), solo(fighter("b"))]);
    const r = ok(act(s, { type: "skill", skill: "lucDiepPhong" }));
    const board = r.events.find((e) => e.type === "board");
    assert.ok(board && board.type === "board");
    assert.ok(board.steps[0]!.cleared.length >= 5);
    assert.equal(me(r.state).energy >= 65, true);
    assert.equal(r.state.turn.side, 0, "kỹ năng không kết thúc lượt");
    assert.equal(r.state.turn.extra, false);
  });

  it("Linh Mộc Hồi Sinh hồi 11% máu và biến 3 ô thành tim", () => {
    const s = setup([solo(hero()), solo(fighter("b"))]);
    me(s).hp = 500;
    const r = ok(act(s, { type: "skill", skill: "linhMocHoiSinh" }));
    assert.ok(me(r.state).hp >= 610);
    const board = r.events.find((e) => e.type === "board");
    assert.ok(board && board.type === "board" && board.transformed.length === 3);
  });

  it("Thanh Mộc Hộ Pháp cần chọn ô, gây 130% ATK và hồi 30% sát thương", () => {
    const s = setup([solo(hero()), solo(fighter("b", { element: "loi" }))]);
    me(s).hp = 500;
    assert.deepEqual(act(s, { type: "skill", skill: "thanhMocHoPhap" }), { ok: false, error: "invalidTarget" });
    assert.deepEqual(act(s, { type: "skill", skill: "thanhMocHoPhap", cell: { row: 9, col: 0 } }), {
      ok: false,
      error: "invalidTarget",
    });
    const r = ok(act(s, { type: "skill", skill: "thanhMocHoPhap", cell: { row: 0, col: 0 } }));
    const first = r.events.find((e) => e.type === "damage" && e.source === "skill");
    assert.deepEqual(first, { type: "damage", side: 1, fighter: 0, amount: 130, absorbed: 0, source: "skill" });
    assert.ok(r.events.some((e) => e.type === "heal" && e.side === 0 && e.amount === 39));
  });

  it("Thanh Trúc Bảo Phù: Hồi phục, Thanh tẩy, Thủ +15%", () => {
    const s = setup([solo(hero()), solo(fighter("b"))]);
    me(s).effects.push({ kind: "burn", value: 10, turns: 2 });
    const r = ok(act(s, { type: "skill", skill: "thanhTrucBaoPhu" }));
    assert.deepEqual(
      me(r.state).effects.map((e) => [e.kind, e.value, e.turns]),
      [
        ["regen", 120, 3],
        ["defUp", 0.15, 2],
      ],
    );
  });

  it("Cổ Thụ Trấn Thiên tốn 100 năng lượng", () => {
    const s = setup([solo(hero()), solo(fighter("b"))], 99);
    assert.deepEqual(act(s, { type: "skill", skill: "coThuTranThien", cell: { row: 0, col: 0 } }), {
      ok: false,
      error: "notEnoughEnergy",
    });
  });
});

describe("Sinh Sôi Bất Tận", () => {
  it("đầy nộ: cả đội Hồi phục 3% máu tối đa, hồi đủ 3 lần", () => {
    const team: SideConfig = { fighters: [hero(), fighter("k1"), fighter("k2")], leader: 0 };
    const { state } = createBattle({ sides: [team, { fighters: [fighter("e1", { atk: 1 }), fighter("e2", { atk: 1 }), fighter("e3", { atk: 1 })], leader: 0 }], seed: 2, timer: false });
    let s = structuredClone(state);
    for (const f of s.sides[0].fighters) f.hp = 100;
    s.sides[0].rage = 99;
    // Thủ lĩnh mất máu cũng tích nộ: tự gây sát thương qua Phản đòn của đối thủ là đủ.
    s.sides[1].fighters[0]!.effects.push({ kind: "reflect", value: 1, turns: 5 });
    s.sides[0].fighters[0]!.energy = 100;
    s.sides[0].fighters[0]!.hp = 1000;
    let r = ok(act(s, { type: "skill", skill: "thanhMocHoPhap", target: 0, cell: { row: 0, col: 0 } }));
    assert.ok(r.events.some((e) => e.type === "passive" && e.side === 0));
    s = r.state;
    assert.ok(s.sides[0].fighters.every((f) => f.effects.some((e) => e.kind === "regen" && e.value === 30 && e.turns === 4)));

    let ticks = 0;
    for (let i = 0; i < 12 && s.winner === null; i++) {
      r = ok(act(s, { type: "swap", ...findValidMoves(s.board)[0]! }));
      ticks += r.events.filter((e) => e.type === "heal" && e.side === 0 && e.fighter === 1 && e.amount === 30).length;
      s = r.state;
    }
    assert.equal(ticks, 3);
  });
});
