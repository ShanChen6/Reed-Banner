import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { act, companionById, createBattle, needsCell, SHOP_COMPANIONS, STARTER_COMPANIONS, ultimateOf, type BattleState, type FighterConfig } from "../../../src/core";

const byId = (id: string) => companionById(id)!;
const foe = (id: string): FighterConfig => ({ id, name: id, element: "moc", profession: "tuongSi", maxHp: 1000, atk: 50, def: 0 });

/** Phe 0 là nhân vật kèm `id` cùng một đồng đội, phe 1 là hai đối thủ; mọi người đầy năng lượng. */
function setup(id: string): BattleState {
  const { state } = createBattle({
    sides: [
      { fighters: [byId(id), byId(id === "maiThanh" ? "haVan" : "maiThanh")], leader: 0 },
      { fighters: [foe("a"), foe("b")], leader: 0 },
    ],
    seed: 5,
    timer: false,
    firstSide: 0,
  });
  const s = structuredClone(state);
  for (const side of s.sides) for (const f of side.fighters) f.energy = 100;
  return s;
}

function cast(s: BattleState, skill: string, extra: object = {}): BattleState {
  const r = act(s, { type: "skill", skill, ...extra });
  assert.ok(r.ok, r.ok ? "" : r.error);
  return (r as { state: BattleState }).state;
}

describe("tuyệt chiêu nấc 3", () => {
  it("mỗi nhân vật kèm khởi đầu có một tuyệt chiêu riêng, 100 năng lượng", () => {
    const ids = STARTER_COMPANIONS.map((c) => ultimateOf(c.id)?.id);
    assert.equal(new Set(ids).size, 5);
    assert.ok(STARTER_COMPANIONS.every((c) => c.skills!.includes(ultimateOf(c.id)!.id)));
  });

  it("Hỏa Vũ Liệu Nguyên: đánh cả đội đối thủ và thiêu đốt", () => {
    const s = cast(setup("haVan"), "hoaVuLieuNguyen", { cell: { row: 3, col: 3 } });
    for (const f of s.sides[1].fighters) {
      assert.ok(f.hp < 1000);
      assert.ok(f.effects.some((e) => e.kind === "burn"));
    }
    assert.ok(s.sides[0].fighters[0]!.energy < 100);
  });

  it("Trấn Sơn Hộ Quân: Khiên cả đội, khiêu khích và phản đòn", () => {
    const s = cast(setup("leThach"), "tranSonHoQuan");
    assert.ok(s.sides[0].fighters.every((f) => f.effects.some((e) => e.kind === "shield")));
    const self = s.sides[0].fighters[0]!;
    assert.ok(self.effects.some((e) => e.kind === "taunt"));
    assert.ok(self.effects.some((e) => e.kind === "reflect"));
  });

  it("Cam Lộ Hồi Xuân: hồi máu cả đội", () => {
    const start = setup("maiThanh");
    for (const f of start.sides[0].fighters) f.hp = Math.floor(f.maxHp / 2);
    const s = cast(start, "camLoHoiXuan");
    assert.ok(s.sides[0].fighters.every((f) => f.hp > Math.floor(f.maxHp / 2)));
  });

  it("Kim Ngân Ly Tán: xuyên giáp, rút năng lượng và câm lặng", () => {
    const s = cast(setup("toKim"), "kimNganLyTan", { target: 1 });
    const t = s.sides[1].fighters[1]!;
    assert.ok(t.hp < 1000);
    assert.equal(t.energy, 50);
    assert.ok(t.effects.some((e) => e.kind === "silence"));
  });

  it("Phong Vân Biến Trận: giảm công đối thủ, cả đội thêm năng lượng, trượt bàn", () => {
    const start = setup("phungPhong");
    start.sides[0].fighters[1]!.energy = 0;
    const r = act(start, { type: "skill", skill: "phongVanBienTran", slide: { axis: "row", index: 2, offset: 2 } });
    assert.ok(r.ok, r.ok ? "" : r.error);
    const s = (r as { state: BattleState }).state;
    assert.ok(s.sides[1].fighters.every((f) => f.effects.some((e) => e.kind === "atkDown")));
    assert.equal(s.sides[0].fighters[1]!.energy, 20);
    assert.ok(r.events.some((e) => e.type === "slide"));
  });

  it("tuyệt chiêu của nhân vật cửa hàng dùng được trong trận", () => {
    for (const { fighter } of SHOP_COMPANIONS) {
      const def = ultimateOf(fighter.id)!;
      const extra = {
        ...(def.target === "enemy" || def.target === "ally" ? { target: 0 } : {}),
        ...(needsCell(def) ? { cell: { row: 3, col: 3 } } : {}),
      };
      const r = act(setup(fighter.id), { type: "skill", skill: def.id, ...extra });
      assert.ok(r.ok, `${def.id}: ${r.ok ? "" : r.error}`);
    }
  });
});
