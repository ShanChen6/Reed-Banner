import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  autoWhirl,
  canFreeWhirl,
  createBattle,
  createRng,
  findMatches,
  generateBoard,
  isValidWhirl,
  mainSkills,
  PASSIVE,
  STANDARD_WEIGHTS,
  tileAt,
  whirlCells,
  whirlRing,
  type BattleState,
  type FighterConfig,
  type SideConfig,
} from "../../../src/core";

function fighter(id: string, extra: Partial<FighterConfig> = {}): FighterConfig {
  return { id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 100, def: 0, ...extra };
}

const hero = () => fighter("dbl", { element: "phong", skills: mainSkills("phong").map((d) => d.id) });
const solo = (f: FighterConfig): SideConfig => ({ fighters: [f], leader: 0 });

function setup(energy = 100): BattleState {
  const { state } = createBattle({ sides: [solo(hero()), solo(fighter("b", { element: "loi" }))], seed: 1, timer: false });
  const s = structuredClone(state);
  for (const side of s.sides) for (const f of side.fighters) f.energy = energy;
  return s;
}

function ok(result: ReturnType<typeof act>) {
  assert.ok(result.ok, result.ok ? "" : result.error);
  return result;
}

describe("lốc xoáy", () => {
  const board = generateBoard(createRng(1), STANDARD_WEIGHTS);
  const center = { row: 3, col: 5 };

  it("xoay 8 ô quanh tâm, tâm và ô ngoài đứng yên", () => {
    const cw = whirlCells(board, { center, turns: 1 });
    const ring = whirlRing(center);
    // Theo chiều kim đồng hồ: góc trên trái sang ô trên giữa, ô trái giữa lên góc trên trái.
    assert.deepEqual(tileAt(cw, ring[1]!), tileAt(board, ring[0]!));
    assert.deepEqual(tileAt(cw, ring[0]!), tileAt(board, ring[7]!));
    assert.deepEqual(tileAt(cw, center), tileAt(board, center));
    assert.deepEqual(tileAt(cw, { row: 3, col: 7 }), tileAt(board, { row: 3, col: 7 }));
    const back = whirlCells(cw, { center, turns: -1 });
    assert.deepEqual(back.cells, board.cells, "ngược chiều 1 nấc trả lại bàn cũ");
    const two = whirlCells(board, { center, turns: 2 });
    assert.deepEqual(tileAt(two, ring[2]!), tileAt(board, ring[0]!));
  });

  it("kiểm tra tâm và số nấc", () => {
    assert.ok(isValidWhirl(board, { center: { row: 1, col: 1 }, turns: -2 }, 2));
    assert.ok(isValidWhirl(board, { center: { row: 6, col: 10 }, turns: 1 }, 1));
    assert.ok(!isValidWhirl(board, { center: { row: 0, col: 4 }, turns: 1 }, 2), "tâm sát mép");
    assert.ok(!isValidWhirl(board, { center: { row: 3, col: 11 }, turns: 1 }, 2), "tâm sát mép");
    assert.ok(!isValidWhirl(board, { center, turns: 0 }, 2));
    assert.ok(!isValidWhirl(board, { center, turns: 2 }, 1));
  });

  it("tự xoay chọn lần xoay tạo bộ ghép", () => {
    const auto = autoWhirl(board, 2);
    assert.ok(auto, "bàn khởi đầu luôn có lần xoay tạo bộ ghép");
    assert.ok(isValidWhirl(board, auto, 2));
    assert.ok(findMatches(whirlCells(board, auto)).length > 0);
  });
});

describe("bộ kỹ năng hệ Phong", () => {
  it("đủ 6 ô", () => {
    assert.deepEqual(mainSkills("phong").map((d) => d.slot), [1, 2, 3, 4, 5, 6]);
  });

  it("Phong Quyển Tàn Vân cần chọn tâm, tối đa 2 nấc", () => {
    const s = setup();
    assert.deepEqual(act(s, { type: "skill", skill: "phongQuyenTanVan" }), { ok: false, error: "invalidTarget" });
    assert.deepEqual(act(s, { type: "skill", skill: "phongQuyenTanVan", whirl: { center: { row: 2, col: 2 }, turns: 3 } }), {
      ok: false,
      error: "invalidTarget",
    });
    const whirl = { center: { row: 4, col: 3 }, turns: -2 };
    const r = ok(act(s, { type: "skill", skill: "phongQuyenTanVan", whirl }));
    assert.ok(r.events.some((e) => e.type === "whirl" && !e.free && e.whirl.center.col === 3));
    assert.ok(r.events.some((e) => e.type === "board"));
    assert.equal(r.state.turn.side, 0, "kỹ năng không kết thúc lượt");
  });

  it("Bão Táp Càn Khôn tự xoay, chỉ cần chọn ô phá vùng", () => {
    const s = setup();
    const r = ok(act(s, { type: "skill", skill: "baoTapCanKhon", cell: { row: 3, col: 3 } }));
    const auto = autoWhirl(s.board, 2);
    assert.equal(r.events.some((e) => e.type === "whirl"), auto !== null);
  });
});

describe("Thuận Phong", () => {
  it("chưa kích hoạt thì không được xoay miễn phí", () => {
    const s = setup();
    assert.equal(canFreeWhirl(s), false);
    assert.deepEqual(act(s, { type: "whirl", whirl: { center: { row: 1, col: 1 }, turns: 1 } }), { ok: false, error: "noFreeWhirl" });
  });

  it("đang hiệu lực: xoay 1 nấc miễn phí, đúng số lần, trước kỹ năng", () => {
    const s = setup();
    s.sides[0].passiveTurns = 3;
    s.sides[0].freeWhirls = PASSIVE.phongFreeWhirls;
    assert.deepEqual(act(s, { type: "whirl", whirl: { center: { row: 1, col: 1 }, turns: 2 } }), { ok: false, error: "invalidTarget" });
    const r = ok(act(s, { type: "whirl", whirl: { center: { row: 1, col: 1 }, turns: -1 } }));
    assert.ok(r.events.some((e) => e.type === "whirl" && e.free));
    assert.equal(r.state.sides[0].fighters[0]!.energy, 100, "không tốn năng lượng");
    assert.equal(r.state.sides[0].freeWhirls, PASSIVE.phongFreeWhirls - 1);
    assert.deepEqual(act(r.state, { type: "whirl", whirl: { center: { row: 2, col: 2 }, turns: 1 } }), {
      ok: false,
      error: "noFreeWhirl",
    });

    const t = setup();
    t.sides[0].passiveTurns = 3;
    t.sides[0].freeWhirls = 1;
    const used = ok(act(t, { type: "skill", skill: "thanhPhongTuKhi" }));
    assert.equal(canFreeWhirl(used.state), false, "đã dùng kỹ năng thì không xoay được nữa");
  });

  it("kích hoạt: có lần xoay miễn phí, không cho năng lượng", () => {
    const team: SideConfig = { fighters: [hero(), fighter("k1"), fighter("k2")], leader: 0 };
    const foes: SideConfig = { fighters: [fighter("e1"), fighter("e2"), fighter("e3")], leader: 0 };
    const { state } = createBattle({ sides: [team, foes], seed: 1, timer: false });
    const s = structuredClone(state);
    s.sides[0].rage = 99;
    s.sides[0].fighters[0]!.energy = 40;
    for (const f of s.sides[1].fighters) f.effects.push({ kind: "reflect", value: 1, turns: 5 });
    const r = ok(act(s, { type: "skill", skill: "phongNhanLietKhong", target: 0, cell: { row: 0, col: 0 } }));
    assert.ok(r.events.some((e) => e.type === "passive" && e.side === 0));
    const passive = r.events.findIndex((e) => e.type === "passive");
    assert.ok(!r.events.slice(passive).some((e) => e.type === "energy" && e.side === 0 && e.fighter === 0 && e.amount > 0));
    assert.equal(r.state.sides[0].freeWhirls, PASSIVE.phongFreeWhirls);
  });
});
