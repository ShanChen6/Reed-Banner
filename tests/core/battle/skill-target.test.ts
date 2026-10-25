import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  createBattle,
  defaultSkillTarget,
  getSkill,
  legacyElementSkills,
  skillTargetOptions,
  type BattleState,
  type FighterConfig,
  type SideConfig,
} from "../../../src/core";

function fighter(id: string, extra: Partial<FighterConfig> = {}): FighterConfig {
  return { id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 100, def: 0, ...extra };
}

const MOC = legacyElementSkills("moc").map((d) => d.id);
const trio = (p: string, first: Partial<FighterConfig> = {}): SideConfig => ({
  fighters: [fighter(`${p}1`, first), fighter(`${p}2`), fighter(`${p}3`)],
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

const hit = (r: ReturnType<typeof ok>) =>
  r.events.filter((e) => e.type === "damage" && e.source === "skill" && e.side === 1).map((e) => e.type === "damage" && e.fighter);

describe("chọn mục tiêu kỹ năng", () => {
  it("liệt kê đối thủ còn sống, Khiêu khích chỉ còn kẻ khiêu khích; mặc định là đối diện", () => {
    const s = setup([trio("p", { skills: ["tramKich", "linhDuoc", "phepLan"] }), trio("q")]);
    const tram = getSkill("tramKich")!;
    assert.deepEqual(skillTargetOptions(s, tram), [0, 1, 2]);
    assert.equal(defaultSkillTarget(s, tram), 0);
    s.sides[1].fighters[0]!.hp = 0;
    assert.deepEqual(skillTargetOptions(s, tram), [1, 2]);
    assert.equal(defaultSkillTarget(s, tram), 1);
    s.sides[1].fighters[2]!.effects.push({ kind: "taunt", value: 0, turns: 2 });
    assert.deepEqual(skillTargetOptions(s, tram), [2]);
    assert.equal(defaultSkillTarget(s, tram), 2);
    assert.deepEqual(skillTargetOptions(s, getSkill("linhDuoc")!), [0, 1, 2]);
    assert.equal(defaultSkillTarget(s, getSkill("linhDuoc")!), 0);
    assert.deepEqual(skillTargetOptions(s, getSkill("phepLan")!), []);
  });

  it("kỹ năng phá vùng đơn mục tiêu đánh đúng đối thủ được chọn", () => {
    const s = setup([trio("p", { element: "moc", skills: MOC }), trio("q", { element: "loi" })]);
    const cell = { row: 0, col: 0 };
    const r = ok(act(structuredClone(s), { type: "skill", skill: "thanhMocHoPhap", cell, target: 2 }));
    assert.deepEqual(hit(r), [2]);
    const d = ok(act(structuredClone(s), { type: "skill", skill: "thanhMocHoPhap", cell }));
    assert.deepEqual(hit(d), [0], "không truyền mục tiêu thì giữ cách chọn cũ");
  });
});
