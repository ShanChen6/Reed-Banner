import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  areaCells,
  createBattle,
  defenseMultiplier,
  elementMultiplier,
  generateBoard,
  createRng,
  getSkill,
  mainSkills,
  PASSIVE,
  STANDARD_WEIGHTS,
  type BattleState,
  type Element,
  type FighterConfig,
  type SideConfig,
} from "../../../src/core";

function fighter(id: string, extra: Partial<FighterConfig> = {}): FighterConfig {
  return { id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 100, def: 0, ...extra };
}

const hero = (element: Element, extra: Partial<FighterConfig> = {}) =>
  fighter("dbl", { element, skills: mainSkills(element).map((d) => d.id), ...extra });
const solo = (f: FighterConfig): SideConfig => ({ fighters: [f], leader: 0 });
const trio = (first: FighterConfig, p: string): SideConfig => ({
  fighters: [first, fighter(`${p}2`), fighter(`${p}3`)],
  leader: 0,
});
const foes = (extra: Partial<FighterConfig> = {}): SideConfig => ({
  fighters: [fighter("e1", extra), fighter("e2", extra), fighter("e3", extra)],
  leader: 0,
});

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

const me = (s: BattleState, i = 0) => s.sides[0].fighters[i]!;
const foe = (s: BattleState, i = 0) => s.sides[1].fighters[i]!;
const cell = { row: 3, col: 5 };

/** Hệ số sát thương của bước damage đầu tiên trong kỹ năng. */
function atkOf(id: string): number {
  const step = getSkill(id)!.steps.find((st) => st.type === "damage");
  assert.ok(step && step.type === "damage");
  return step.atk;
}

function skillHit(s: BattleState, skill: string, target = 0) {
  const r = ok(act(s, { type: "skill", skill, cell }));
  const hit = r.events.find((e) => e.type === "damage" && e.source === "skill" && e.side === 1 && e.fighter === target);
  assert.ok(hit && hit.type === "damage");
  return { r, hit };
}

describe("vùng phá ô theo hình", () => {
  const board = generateBoard(createRng(1), STANDARD_WEIGHTS);
  const key = (p: { row: number; col: number }) => `${p.row},${p.col}`;

  it("đoạn 4, cột, 2 cột liền nhau tự dịch vào trong bàn", () => {
    assert.deepEqual(areaCells(board, { row: 2, col: 10 }, { line: 4 }).map(key), ["2,8", "2,9", "2,10", "2,11"]);
    const col = areaCells(board, { row: 5, col: 4 }, { columns: 1 });
    assert.equal(col.length, 8);
    assert.ok(col.every((p) => p.col === 4));
    const two = areaCells(board, { row: 0, col: 11 }, { columns: 2 });
    assert.equal(two.length, 16);
    assert.deepEqual([...new Set(two.map((p) => p.col))], [10, 11]);
  });

  it("chữ thập nhỏ/lớn, chữ X lớn, 5×3", () => {
    assert.equal(areaCells(board, cell, { cross: "small" }).length, 5);
    assert.equal(areaCells(board, cell, { cross: "big" }).length, 19);
    assert.equal(areaCells(board, cell, { diagonal: 2 }).length, 9);
    assert.deepEqual(areaCells(board, { row: 0, col: 0 }, { diagonal: 2 }).map(key), ["0,0", "1,1", "2,2"]);
    assert.equal(areaCells(board, { row: 0, col: 0 }, { rect: [5, 3] }).length, 15);
  });
});

describe("bộ kỹ năng các nguyên tố", () => {
  it("Kim, Thủy, Hỏa, Thổ, Lôi đủ 6 ô theo thứ tự", () => {
    for (const e of ["kim", "thuy", "hoa", "tho", "loi"] as const) {
      assert.deepEqual(mainSkills(e).map((d) => d.slot), [1, 2, 3, 4, 5, 6], e);
    }
  });

  it("Kim: Đoạn Kim Nhất Tuyến bỏ qua 30% DEF và giảm Thủ mục tiêu", () => {
    const s = setup([solo(hero("kim")), solo(fighter("b", { element: "loi", def: 100 }))]);
    const { r, hit } = skillHit(s, "doanKimNhatTuyen");
    const expected = Math.round(atkOf("doanKimNhatTuyen") * 100 * elementMultiplier("kim", "loi") * defenseMultiplier(100, 0.3));
    assert.equal(hit.amount, expected);
    assert.ok(foe(r.state).effects.some((e) => e.kind === "defDown" && e.value === 0.2));
  });

  it("Kim: Kim Ấn Phá Thiên xuyên Khiên", () => {
    const s = setup([solo(hero("kim")), solo(fighter("b", { element: "loi" }))]);
    foe(s).effects.push({ kind: "shield", value: 500, turns: null });
    const { hit } = skillHit(s, "kimAnPhaThien");
    assert.equal(hit.absorbed, 0);
    assert.equal(hit.amount, Math.round(atkOf("kimAnPhaThien") * 100 * elementMultiplier("kim", "loi")));
  });

  it("Thủy: Thủy Kiếp Vạn Trùng chắc chắn Đóng băng; Linh Thủy Hộ Mệnh hồi và Thanh tẩy cả đội", () => {
    const s = setup([solo(hero("thuy")), solo(fighter("b", { element: "loi" }))]);
    const { r } = skillHit(s, "thuyKiepVanTrung");
    assert.ok(foe(r.state).effects.some((e) => e.kind === "freeze"));

    const t = setup([trio(hero("thuy"), "k"), foes()]);
    me(t, 1).hp = 500;
    me(t, 2).effects.push({ kind: "burn", value: 10, turns: 2 });
    const r2 = ok(act(t, { type: "skill", skill: "linhThuyHoMenh" }));
    assert.equal(me(r2.state, 1).hp, 500 + Math.round(1000 * 0.12));
    assert.equal(me(r2.state, 2).effects.length, 0);
  });

  it("Hỏa: Xích Diễm Tiễn Thiêu đốt 10% ATK trong 2 lượt", () => {
    const s = setup([solo(hero("hoa")), solo(fighter("b", { element: "loi" }))]);
    const { r } = skillHit(s, "xichDiemTien");
    assert.deepEqual(foe(r.state).effects.find((e) => e.kind === "burn"), { kind: "burn", value: 10, turns: 2 });
  });

  it("Thổ: Kiên Thành Bất Động cho cả đội Khiên, bản thân Phản đòn và Khiêu khích", () => {
    const s = setup([trio(hero("tho"), "k"), foes()]);
    const r = ok(act(s, { type: "skill", skill: "kienThanhBatDong" }));
    for (let i = 0; i < 3; i++) assert.ok(me(r.state, i).effects.some((e) => e.kind === "shield" && e.value === 150));
    assert.deepEqual(me(r.state).effects.map((e) => e.kind).sort(), ["reflect", "shield", "taunt"]);
    assert.deepEqual(me(r.state, 1).effects.map((e) => e.kind), ["shield"]);
  });

  it("Lôi: Lôi Đình Hiệu Lệnh trừ năng lượng mọi đối thủ; Cửu Tiêu Lôi Phạt Câm lặng", () => {
    const s = setup([trio(hero("loi"), "k"), foes()]);
    const r = ok(act(s, { type: "skill", skill: "loiDinhHieuLenh" }));
    for (let i = 0; i < 3; i++) assert.equal(foe(r.state, i).energy, 85);
    for (let i = 0; i < 3; i++) assert.ok(me(r.state, i).effects.some((e) => e.kind === "atkUp"));

    const t = setup([solo(hero("loi")), solo(fighter("b", { element: "kim" }))]);
    const { r: r2 } = skillHit(t, "cuuTieuLoiPhat");
    assert.ok(foe(r2.state).effects.some((e) => e.kind === "silence"));
  });
});

/** Cho thủ lĩnh tự mất máu qua Phản đòn của đối thủ để đầy Nộ, rồi trả về kết quả. */
function triggerPassive(element: Element, skill: string) {
  const s = setup([trio(hero(element), "k"), foes({ element: "phong" })]);
  s.sides[0].rage = 99;
  for (const f of s.sides[1].fighters) f.effects.push({ kind: "reflect", value: 1, turns: 5 });
  const r = ok(act(s, { type: "skill", skill, target: 0, cell }));
  assert.ok(r.events.some((e) => e.type === "passive" && e.side === 0), element);
  return r;
}

describe("kỹ năng bị động theo nguyên tố", () => {
  it("Thủy: Đóng băng ngay 1 đối thủ", () => {
    const r = triggerPassive("thuy", "hanBangTien");
    assert.ok(r.state.sides[1].fighters.some((f) => f.effects.some((e) => e.kind === "freeze")));
  });

  it("Thổ: Khiên 25% máu tối đa và Phản đòn 25%", () => {
    const r = triggerPassive("tho", "sonBangDiaLiet");
    const passive = r.events.findIndex((e) => e.type === "passive");
    const after = r.events.slice(passive);
    assert.ok(after.some((e) => e.type === "effect" && e.side === 0 && e.fighter === 0 && e.effect === "shield"));
    assert.ok(me(r.state).effects.some((e) => e.kind === "reflect" && e.value === PASSIVE.thoReflect));
  });

  it("Lôi: trừ 20 năng lượng mọi đối thủ", () => {
    const r = triggerPassive("loi", "loiTienXuyenVan");
    assert.equal(foe(r.state, 1).energy, 100 - PASSIVE.loiDrain);
  });

  it("Kim đang bị động: kỹ năng bỏ qua thêm 40% DEF và xuyên Khiên", () => {
    const s = setup([solo(hero("kim")), solo(fighter("b", { element: "loi", def: 100 }))]);
    s.sides[0].passiveTurns = 3;
    foe(s).effects.push({ kind: "shield", value: 500, turns: null });
    const { hit } = skillHit(s, "thietKyTungHoanh");
    const pierce = 1 - (1 - PASSIVE.kimPierce);
    const expected = Math.round(atkOf("thietKyTungHoanh") * 100 * 1.5 * elementMultiplier("kim", "loi") * defenseMultiplier(100, pierce));
    assert.equal(hit.amount, expected);
    assert.equal(hit.absorbed, 0);
  });

  it("Hỏa đang bị động: sát thương kỹ năng +30%", () => {
    const s = setup([solo(hero("hoa", { def: 100 })), solo(fighter("b", { element: "loi" }))]);
    s.sides[0].passiveTurns = 3;
    const { hit } = skillHit(s, "xichDiemTien");
    assert.equal(hit.amount, Math.round(atkOf("xichDiemTien") * 100 * (1 + PASSIVE.hoaDamage) * elementMultiplier("hoa", "loi")));
  });
});
