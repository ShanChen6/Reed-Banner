import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  canFreeSlide,
  createBattle,
  createRng,
  generateBoard,
  isValidSlide,
  mainSkills,
  PASSIVE,
  slideCells,
  STANDARD_WEIGHTS,
  tileAt,
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

describe("trượt hàng/cột", () => {
  const board = generateBoard(createRng(1), STANDARD_WEIGHTS);

  it("ô tràn khỏi một đầu quay vào đầu kia", () => {
    const right = slideCells(board, { axis: "row", index: 2, offset: 1 });
    assert.deepEqual(tileAt(right, { row: 2, col: 0 }), tileAt(board, { row: 2, col: 11 }));
    assert.deepEqual(tileAt(right, { row: 2, col: 5 }), tileAt(board, { row: 2, col: 4 }));
    assert.deepEqual(tileAt(right, { row: 3, col: 5 }), tileAt(board, { row: 3, col: 5 }));
    const up = slideCells(board, { axis: "col", index: 4, offset: -2 });
    assert.deepEqual(tileAt(up, { row: 0, col: 4 }), tileAt(board, { row: 2, col: 4 }));
    assert.deepEqual(tileAt(up, { row: 7, col: 4 }), tileAt(board, { row: 1, col: 4 }));
  });

  it("kiểm tra hàng/cột và số ô", () => {
    assert.ok(isValidSlide(board, { axis: "row", index: 7, offset: -2 }, 2));
    assert.ok(!isValidSlide(board, { axis: "row", index: 8, offset: 1 }, 2));
    assert.ok(!isValidSlide(board, { axis: "col", index: 11, offset: 3 }, 2));
    assert.ok(!isValidSlide(board, { axis: "col", index: 0, offset: 0 }, 2));
  });
});

describe("bộ kỹ năng hệ Phong", () => {
  it("đủ 6 ô", () => {
    assert.deepEqual(mainSkills("phong").map((d) => d.slot), [1, 2, 3, 4, 5, 6]);
  });

  it("Phong Quyển Tàn Vân cần chọn hàng/cột, tối đa 2 ô", () => {
    const s = setup();
    assert.deepEqual(act(s, { type: "skill", skill: "phongQuyenTanVan" }), { ok: false, error: "invalidTarget" });
    assert.deepEqual(act(s, { type: "skill", skill: "phongQuyenTanVan", slide: { axis: "row", index: 0, offset: 3 } }), {
      ok: false,
      error: "invalidTarget",
    });
    const slide = { axis: "col" as const, index: 3, offset: -2 };
    const r = ok(act(s, { type: "skill", skill: "phongQuyenTanVan", slide }));
    assert.ok(r.events.some((e) => e.type === "slide" && !e.free && e.slide.index === 3));
    assert.ok(r.events.some((e) => e.type === "board"));
    assert.equal(r.state.turn.side, 0, "kỹ năng không kết thúc lượt");
  });

  it("Bão Táp Càn Khôn chỉ trượt hàng, đúng 2 ô", () => {
    const s = setup();
    const cell = { row: 3, col: 3 };
    for (const slide of [
      { axis: "col" as const, index: 1, offset: 2 },
      { axis: "row" as const, index: 1, offset: 1 },
    ]) {
      assert.deepEqual(act(s, { type: "skill", skill: "baoTapCanKhon", cell, slide }), { ok: false, error: "invalidTarget" });
    }
    ok(act(s, { type: "skill", skill: "baoTapCanKhon", cell, slide: { axis: "row", index: 1, offset: -2 } }));
  });
});

describe("Thuận Phong", () => {
  it("chưa kích hoạt thì không được trượt miễn phí", () => {
    const s = setup();
    assert.equal(canFreeSlide(s), false);
    assert.deepEqual(act(s, { type: "slide", slide: { axis: "row", index: 0, offset: 1 } }), { ok: false, error: "noFreeSlide" });
  });

  it("đang hiệu lực: trượt 1 ô miễn phí, đúng số lần, trước kỹ năng", () => {
    const s = setup();
    s.sides[0].passiveTurns = 3;
    s.sides[0].freeSlides = PASSIVE.phongFreeSlides;
    assert.deepEqual(act(s, { type: "slide", slide: { axis: "row", index: 0, offset: 2 } }), { ok: false, error: "invalidTarget" });
    const r = ok(act(s, { type: "slide", slide: { axis: "row", index: 0, offset: 1 } }));
    assert.ok(r.events.some((e) => e.type === "slide" && e.free));
    assert.equal(r.state.sides[0].fighters[0]!.energy, 100, "không tốn năng lượng");
    assert.equal(r.state.sides[0].freeSlides, PASSIVE.phongFreeSlides - 1);
    assert.deepEqual(act(r.state, { type: "slide", slide: { axis: "row", index: 1, offset: 1 } }), {
      ok: false,
      error: "noFreeSlide",
    });

    const t = setup();
    t.sides[0].passiveTurns = 3;
    t.sides[0].freeSlides = 1;
    const used = ok(act(t, { type: "skill", skill: "thanhPhongTuKhi" }));
    assert.equal(canFreeSlide(used.state), false, "đã dùng kỹ năng thì không trượt được nữa");
  });

  it("kích hoạt: thủ lĩnh nhận 15 năng lượng và có lần trượt miễn phí", () => {
    const team: SideConfig = { fighters: [hero(), fighter("k1"), fighter("k2")], leader: 0 };
    const foes: SideConfig = { fighters: [fighter("e1"), fighter("e2"), fighter("e3")], leader: 0 };
    const { state } = createBattle({ sides: [team, foes], seed: 1, timer: false });
    const s = structuredClone(state);
    s.sides[0].rage = 99;
    s.sides[0].fighters[0]!.energy = 40;
    for (const f of s.sides[1].fighters) f.effects.push({ kind: "reflect", value: 1, turns: 5 });
    const r = ok(act(s, { type: "skill", skill: "phongNhanLietKhong", target: 0, cell: { row: 0, col: 0 } }));
    assert.ok(r.events.some((e) => e.type === "passive" && e.side === 0));
    assert.ok(r.events.some((e) => e.type === "energy" && e.side === 0 && e.fighter === 0 && e.amount === PASSIVE.phongEnergy));
    assert.equal(r.state.sides[0].freeSlides, PASSIVE.phongFreeSlides);
  });
});
