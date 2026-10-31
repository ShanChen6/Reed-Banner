import assert from "node:assert/strict";
import { it } from "node:test";
import {
  act, createBattle, beginWave, mainCharacter, ALL_COMPANIONS, LEGACY_PROFESSIONS as PROFESSIONS, ELEMENTS,
  characterSkills, chasePassives, COMBO_PASSIVES, CHASE_PASSIVES, CHASE_LIMITS,
  spiritAt, spiritHealMultiplier, type FighterConfig, type BattleState,
  autoProgress, buildMain, presetLoadout, withGear, equippedItems,
  newProfile, parseProfile, profileTeam, equipItem, type Profile,
} from "../../../src/core";

const unit = (id: string, extra: Partial<FighterConfig> = {}): FighterConfig => ({
  id, name: id, profession: "tuongSi", element: "loi", maxHp: 1000,
  atk: 100, def: 0, skills: [], ...extra,
});
function state(fighters: FighterConfig[], audit = false) {
  const s = createBattle({ sides: [{ fighters, leader: 0 }, {
    fighters: [unit("enemy"), unit("other")], leader: 0,
  }], seed: 31, timer: true, audit }).state;
  s.sides[0].fighters[0]!.energy = 100;
  return s;
}
function cast(s: BattleState, skill: string, target = 0) {
  const r = act(s, { type: "skill", skill, target });
  assert.ok(r.ok);
  return r;
}

it("baseline: 42 bộ ĐBL và60 đồng hành có đúng4 bị động +6 chủ động", () => {
  const roster = [...PROFESSIONS.flatMap(p => ELEMENTS.map(e => mainCharacter(e, p))), ...ALL_COMPANIONS];
  for (const f of roster) {
    assert.ok(f.comboPassive && COMBO_PASSIVES[f.comboPassive], f.id);
    const passives = chasePassives(f);
    assert.equal(passives.length, 3);
    assert.equal(new Set(passives).size, 3);
    passives.forEach(id => assert.ok(CHASE_PASSIVES[id]));
    const skills = characterSkills(f.profession, f.element, f.id);
    assert.equal(skills.length, 6);
    assert.equal(new Set(skills.map(d => d.slot)).size, 6);
    assert.equal(skills.find(d => d.ultimate)?.slot, 4);
  }
});

it("F: truy kích hồi/Khiên theo người nhận ở đủ mốc, không tiêu Tiếp sức", () => {
  for (const turn of [24, 25, 30, 35, 40, 44, 60]) {
    const s = state([
      unit("caster", { skills: ["role_tramKich"] }),
      unit("medic", { comboPassive: "renewal", chasePassives: ["medic", "moc1", "moc2"] }),
      unit("receiver"),
    ]);
    const receiver = s.sides[0].fighters[2]!;
    receiver.hp = 100;
    receiver.spirit = spiritAt(turn);
    s.sides[0].fighters[1]!.comboReady = {
      passive: "renewal", source: { side: 0, fighter: 0 }, openedBy: 0, expiresAt: 4,
    };
    const r = cast(s, "role_tramKich");
    const mult = spiritHealMultiplier(receiver.spirit);
    assert.equal(r.state.sides[0].fighters[2]!.hp, 100 + Math.round(50 * mult) + Math.round(40 * mult));
    assert.equal(r.state.sides[0].fighters[2]!.effects.find(e => e.kind === "shield")?.value, Math.round(40 * mult));
    assert.ok(r.state.sides[0].fighters[1]!.comboReady);
  }
});

it("Khiên từ truy kích không giả nguồn chủ động để mở Hộ vệ khi bị đánh", () => {
  const s = state([
    unit("caster", { comboPassive: "retaliation", skills: ["role_tramKich"], chasePassives: ["tho2", "martial", "arcane"] }),
    unit("healer", { chasePassives: ["medic", "moc1", "moc2"] }),
  ]);
  s.sides[0].fighters[0]!.hp = 500;
  const healed = cast(s, "role_tramKich");
  assert.equal(healed.state.sides[0].fighters[0]!.effects.find(e => e.kind === "shield")?.value, 40);
  const turn = act(healed.state, { type: "timeout" }, healed.state.turn.deadline! + 1);
  assert.ok(turn.ok);
  turn.state.sides[1].fighters[turn.state.turn.actor] = {
    ...turn.state.sides[1].fighters[turn.state.turn.actor]!, skills: ["role_tramKich"], energy: 100,
  };
  const hit = cast(turn.state, "role_tramKich");
  assert.equal(hit.state.sides[0].fighters[0]!.comboReady, undefined);
  assert.ok(hit.events.some(e => e.type === "chase" && e.passive === "tho2"));
});

it("truy kích không tự mở cơ hội chuẩn bị từ tín hiệu phản ứng", () => {
  const s = state([
    unit("caster", { skills: ["role_tramKich"] }),
    unit("healer", { chasePassives: ["medic", "moc1", "moc2"] }),
    unit("commander", { comboPassive: "coordination" }),
  ]);
  s.sides[0].fighters[0]!.hp = 500;
  const r = cast(s, "role_tramKich");
  assert.ok(r.events.some(e => e.type === "chase" && e.passive === "medic"));
  assert.equal(r.state.sides[0].fighters[2]!.comboReady, undefined);
});

it("chuỗi tất định, chặn lặp/độ sâu; audit không đổi gameplay", () => {
  const team = Array.from({ length: 6 }, (_, i) => unit(`ally${i}`, {
    skills: ["role_tramKich"], comboPassive: "pursuit", chasePassives: ["kim1", "kim2", "hoa1"],
  }));
  const r = cast(state(team), "role_tramKich");
  const traced = cast(state(team, true), "role_tramKich");
  const events = r.events.filter(e => e.type === "chase");
  assert.ok(events.length > 0 && events.length <= CHASE_LIMITS.maxReactions);
  assert.ok(events.every(e => e.depth <= CHASE_LIMITS.maxDepth));
  assert.equal(new Set(events.map(e => `${e.side}:${e.fighter}:${e.passive}`)).size, events.length);
  assert.deepEqual(traced.events.filter(e => e.type === "chase"), events);
  assert.deepEqual(traced.state.sides, r.state.sides);
  assert.equal(traced.state.boardRng, r.state.boardRng);
});

it("người gục/câm lặng/đóng băng không truy kích; hồi đầy máu không farm tín hiệu", () => {
  for (const blocked of ["down", "silence", "freeze", "full"] as const) {
    const s = state([
      unit("caster", { comboPassive: "pursuit", skills: ["role_tramKich"] }),
      unit("healer", { chasePassives: ["medic", "moc1", "moc2"] }),
    ]);
    if (blocked !== "full") s.sides[0].fighters[0]!.hp = 500;
    if (blocked === "down") s.sides[0].fighters[1]!.hp = 0;
    else if (blocked !== "full") s.sides[0].fighters[1]!.effects = [{ kind: blocked, value: 0, turns: 1 }];
    assert.ok(!cast(s, "role_tramKich").events.some(e => e.type === "chase"));
  }
});

it("F: sinh tồn reset Tinh thần cả người gục, hồi nghỉ không chịu hệ số chiến đấu", () => {
  const s = state([unit("leader"), unit("down")]);
  s.sides[0].fighters[0]!.spirit = 0;
  s.sides[0].fighters[0]!.hp = 500;
  s.sides[0].fighters[1]!.spirit = 0;
  s.sides[0].fighters[1]!.hp = 0;
  s.winner = 0;
  const r = beginWave(s, { wave: 2, foes: { fighters: [unit("new")], leader: 0 }, heal: .1, food: 100, revive: [], reviveHp: .3 });
  assert.deepEqual(r.state.sides[0].fighters.map(f => f.spirit), [100, 100]);
  assert.equal(r.state.sides[0].fighters[0]!.hp, 600);
  assert.equal(r.state.sides[0].fighters[1]!.hp, 0);
  assert.equal(r.state.turn.number, 1);
});

it("F: thủ lĩnh gục không ngừng suy giảm của đồng đội còn sống", () => {
  const s = state([unit("leader"), unit("survivor")]);
  s.sides[0].fighters[0]!.hp = 0;
  s.turn = { ...s.turn, number: 48, side: 1 };
  const r = act(s, { type: "timeout" }, s.turn.deadline! + 1);
  assert.ok(r.ok);
  assert.deepEqual(r.state.sides[0].fighters.map(f => f.spirit), [100, 95]);
});

it("hồ sơ dựng lại đúng cấp +9 món +bộ/cộng hưởng một lần ở42 bộ ĐBL", () => {
  for (const profession of PROFESSIONS) for (const element of ELEMENTS) {
    const progress = autoProgress(20, null);
    const gear = presetLoadout(element, profession, 5, "coLau");
    const items = equippedItems(gear, profession);
    let profile: Profile = { ...newProfile(), profession, element, main: progress, bag: items };
    for (const item of items) {
      const result = equipItem(profile, "dinhBoLinh", item.id);
      assert.ok(result.ok);
      profile = result.profile;
    }
    const expected = withGear(buildMain(progress, element, profession), gear);
    const restored = parseProfile(JSON.parse(JSON.stringify(profile)));
    assert.deepEqual(profileTeam(restored)[0], expected);
    assert.deepEqual(profileTeam(parseProfile(JSON.parse(JSON.stringify(restored))))[0], expected);
  }
});
