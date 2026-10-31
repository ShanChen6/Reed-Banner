import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  createBattle,
  parseBoard,
  getSkill,
  ghostTeam,
  type ArenaDefense,
  defineSkillRegistry,
  defineCharacterSkills,
  CHARACTER_SKILLS,
  comboSkillCost,
  comboMultiplier,
  inspectSkillChoices,
  parseProfile,
  parseProfileAction,
  profileActionPayload,
  newProfile,
  autoProgress,
  buildCompanion,
  buildMain,
  ALL_COMPANIONS,
  STORY_NODES,
  WARLORD_ENCOUNTERS,
  campaignEncounterFoes,
  encounterFighter,
  PROFESSIONS,
  ELEMENTS,
  PROFESSION_COMBO,
  SKILL_SLOT_ORDER,
  characterSkills,
  beginWave,
  type FighterConfig,
  type BattleState,
  type BattleAction,
  type ComboPassiveId,
} from "../../../src/core";
const unit = (
  id: string,
  passive?: ComboPassiveId,
  skills = ["role_tramKich"],
): FighterConfig => ({
  id,
  name: id,
  profession: "tuongSi",
  element: "loi",
  maxHp: 1000,
  atk: 100,
  def: 20,
  skills,
  comboPassive: passive,
});
function arena(
  passive: ComboPassiveId = "pursuit",
  opener = "role_phaTran",
  payoff = "role_tramKich",
  audit = false,
) {
  const s = createBattle({
    sides: [
      {
        fighters: [
          unit("open", undefined, [opener]),
          unit("follow", passive, [payoff]),
          unit("ally"),
        ],
        leader: 0,
      },
      { fighters: [unit("x"), unit("y"), unit("z")], leader: 0 },
    ],
    seed: 71,
    timer: true,
    audit,
  }).state;
  s.sides.forEach((side) => side.fighters.forEach((f) => (f.energy = 100)));
  return s;
}
function action(s: BattleState, a: BattleAction) {
  const r = act(s, a, a.type === "timeout" ? s.turn.deadline! + 1 : 0);
  assert.ok(r.ok, JSON.stringify(r));
  return r;
}
function skill(s: BattleState, id: string, target = 0) {
  return action(s, { type: "skill", skill: id, target });
}
function next(s: BattleState) {
  s.sides.forEach((side) => (side.food = 100));
  return action(s, { type: "timeout" }).state;
}
function follow(s: BattleState) {
  const n = next(next(s));
  assert.equal(n.turn.side, 0);
  return action(n, { type: "selectActor", fighter: 1 }).state;
}
const hit = (r: ReturnType<typeof skill>) => {
  const e = r.events.find((e) => e.type === "damage" && e.source === "skill");
  assert.ok(e?.type === "damage");
  return e.amount;
};

describe("combo chủ động–bị động", () => {
  it("phá giáp mở cơ hội; phải tự chọn người/đòn/mục tiêu để tận dụng", () => {
    const opened = skill(arena(), "role_phaTran");
    assert.ok(
      opened.events.some((e) => e.type === "combo" && e.outcome === "opened"),
    );
    const s = follow(opened.state);
    assert.ok(s.sides[0].fighters[1]!.comboReady);
    const wrong = skill(s, "role_tramKich", 1);
    assert.ok(wrong.state.sides[0].fighters[1]!.comboReady);
    assert.ok(
      !wrong.events.some((e) => e.type === "combo" && e.outcome === "used"),
    );
    const plain = structuredClone(s);
    delete plain.sides[0].fighters[1]!.comboReady;
    const base = hit(skill(plain, "role_tramKich"));
    const r = skill(s, "role_tramKich");
    assert.equal(hit(r), Math.round(base * 1.2));
    assert.equal(r.state.sides[0].fighters[1]!.comboReady, undefined);
    assert.equal(
      r.events.filter((e) => e.type === "combo" && e.outcome === "used").length,
      1,
    );
  });
  it("combo gameplay hoạt động khi audit:false; không đổi RNG hoặc lộ boardRng cho AI", () => {
    const a = skill(arena(), "role_phaTran"),
      b = skill(
        arena("pursuit", "role_phaTran", "role_tramKich", true),
        "role_phaTran",
      );
    assert.equal(a.state.boardRng, b.state.boardRng);
    assert.deepEqual(a.state.sides, b.state.sides);
    assert.deepEqual(a.state.comboState, b.state.comboState);
    const one = inspectSkillChoices(follow(a.state)),
      state = follow(b.state);
    state.boardRng ^= 123456;
    assert.deepEqual(inspectSkillChoices(state), one);
  });
  it("khống chế miễn nhiễm/không đổi hiệu ứng không mở cơ hội, người mở không tự kích hoạt", () => {
    const s = arena("resonance", "role_lyGian");
    s.sides[0].fighters[0] = {
      ...s.sides[0].fighters[0]!,
      comboPassive: "resonance",
    };
    s.sides[1].fighters[0]!.effects = [{ kind: "silence", value: 0, turns: 2 }];
    assert.equal(
      skill(s, "role_lyGian").state.sides[0].fighters[1]!.comboReady,
      undefined,
    );
    s.sides[1].fighters[0]!.effects = [];
    const r = skill(s, "role_lyGian");
    assert.ok(r.state.sides[0].fighters[1]!.comboReady);
    assert.equal(r.state.sides[0].fighters[0]!.comboReady, undefined);
  });
  it("hồi đầy máu không mở combo; hồi hữu hiệu mở giảm giá, core và AI cùng tính giá", () => {
    const full = arena("coordination", "role_linhDuoc");
    assert.equal(
      skill(full, "role_linhDuoc", 2).state.sides[0].fighters[1]!.comboReady,
      undefined,
    );
    full.sides[0].fighters[2]!.hp = 100;
    const s = follow(skill(full, "role_linhDuoc", 2).state);
    s.sides[0].fighters[1]!.energy = 20;
    assert.equal(
      comboSkillCost(s.sides[0].fighters[1]!, getSkill("role_tramKich")!),
      20,
    );
    assert.equal(inspectSkillChoices(s)[0]!.cost, 20);
    const r = skill(s, "role_tramKich");
    assert.equal(r.state.sides[0].fighters[1]!.energy, 0);
    assert.equal(r.state.sides[0].fighters[1]!.comboReady, undefined);
  });
  it("Tiếp sức tăng raw trước hệ số người nhận; không nhân TT hoặc hồi dư hai lần", () => {
    const s = follow(
      skill(arena("renewal", "role_tramKich", "role_linhDuoc"), "role_tramKich")
        .state,
    );
    s.sides[0].fighters[2]!.hp = 100;
    s.sides[0].fighters[2]!.spirit = 40;
    assert.equal(
      skill(s, "role_linhDuoc", 2).state.sides[0].fighters[2]!.hp,
      243,
    );
    const full = structuredClone(s);
    full.sides[0].fighters[2]!.hp = 1000;
    assert.ok(
      skill(full, "role_linhDuoc", 2).state.sides[0].fighters[1]!.comboReady,
    );
  });
  it("Khiên đồng đội phải hấp thụ đòn chủ động; cấp/refresh không tự mở phản công", () => {
    const r = skill(arena("retaliation", "role_tuongKhien"), "role_tuongKhien");
    assert.equal(r.state.sides[0].fighters[1]!.comboReady, undefined);
    const enemy = next(r.state);
    const blocked = skill(enemy, "role_tramKich", 1);
    assert.ok(blocked.state.sides[0].fighters[1]!.comboReady);
    assert.ok(
      blocked.events.some((e) => e.type === "damage" && e.absorbed > 0),
    );
    const dot = next(r.state);
    dot.sides[0].fighters[1]!.effects.push({
      kind: "burn",
      value: 50,
      turns: 2,
    });
    const tick = next(dot);
    assert.equal(tick.sides[0].fighters[1]!.comboReady, undefined);
  });
  it("Khiên tự cấp không mở Hộ vệ; mất Khiên không để lại nguồn giả", () => {
    const s = arena("retaliation", "role_thuThanh");
    s.turn.actor = 1;
    s.sides[0].fighters[1] = {
      ...s.sides[0].fighters[1]!,
      skills: ["role_thuThanh"],
    };
    const shield = skill(s, "role_thuThanh");
    const enemy = next(shield.state);
    const r = skill(enemy, "role_tramKich", 1);
    assert.equal(r.state.sides[0].fighters[1]!.comboReady, undefined);
    assert.equal(r.state.sides[0].fighters[1]!.comboShield, undefined);
  });
  it("Đoạn tiếp tế chỉ trừ thêm mục tiêu đã mở, không sinh năng lượng âm", () => {
    const s = follow(
      skill(
        arena("interdiction", "role_lyGian", "role_muaChuoc"),
        "role_lyGian",
      ).state,
    );
    s.sides[1].fighters[0]!.energy = 100;
    assert.equal(
      skill(s, "role_muaChuoc").state.sides[1].fighters[0]!.energy,
      50,
    );
    s.sides[1].fighters[0]!.energy = 3;
    assert.equal(
      skill(s, "role_muaChuoc").state.sides[1].fighters[0]!.energy,
      0,
    );
    s.sides[1].fighters[0]!.energy = 0;
    assert.ok(skill(s, "role_muaChuoc").state.sides[0].fighters[1]!.comboReady);
  });
  it("thời hạn theo lượt phe, qua đúng hai lượt tiếp theo rồi hết; freeze/silence chặn tận dụng", () => {
    let s = skill(arena(), "role_phaTran").state;
    const ready = s.sides[0].fighters[1]!.comboReady!;
    assert.equal(ready.expiresAt, 4);
    s = next(next(s));
    assert.ok(s.sides[0].fighters[1]!.comboReady);
    s = next(next(s));
    assert.ok(s.sides[0].fighters[1]!.comboReady);
    s = next(next(s));
    assert.equal(s.sides[0].fighters[1]!.comboReady, undefined);
    const t = follow(skill(arena(), "role_phaTran").state);
    t.sides[0].fighters[1]!.effects = [{ kind: "silence", value: 0, turns: 2 }];
    assert.equal(
      comboMultiplier(t, { side: 0, fighter: 1 }, "damage", {
        side: 1,
        fighter: 0,
      }),
      1,
    );
  });
  it("xua tan phá cơ hội; hạ mục tiêu hoặc người hưởng dọn sạch cơ hội", () => {
    const s = next(skill(arena(), "role_phaTran").state);
    s.sides[1].fighters[0] = {
      ...s.sides[1].fighters[0]!,
      skills: ["role_phaKe"],
    };
    const dispelled = skill(s, "role_phaKe");
    assert.equal(dispelled.state.sides[0].fighters[1]!.comboReady, undefined);
    assert.ok(
      dispelled.events.some((e) => e.type === "combo" && e.reason === "dispel"),
    );
    const kill = follow(skill(arena(), "role_phaTran").state);
    kill.turn.actor = 2;
    kill.sides[1].fighters[0]!.hp = 1;
    assert.equal(
      skill(kill, "role_tramKich").state.sides[0].fighters[1]!.comboReady,
      undefined,
    );
  });
  it("một combo không mở tiếp combo khác; không refresh/stack trên cơ hội đang có", () => {
    const start = arena();
    start.sides[0].fighters[2] = {
      ...start.sides[0].fighters[2]!,
      comboPassive: "renewal",
    };
    const r = skill(start, "role_phaTran");
    const s = follow(r.state);
    delete s.sides[0].fighters[2]!.comboReady;
    delete s.sides[0].fighters[2]!.comboOpenedAt;
    const attack = skill(s, "role_tramKich");
    assert.equal(attack.state.sides[0].fighters[2]!.comboReady, undefined);
  });
  it("sang đợt sinh tồn xóa cơ hội, nguồn Khiên và cooldown cũ", () => {
    const s = skill(arena(), "role_phaTran").state;
    s.winner = 0;
    const wave = beginWave(s, {
      wave: 2,
      foes: { fighters: [unit("boss")], leader: 0 },
      heal: 0.1,
      food: 60,
      revive: [],
      reviveHp: 0.1,
    });
    assert.equal(wave.state.sides[0].fighters[1]!.comboReady, undefined);
    assert.equal(wave.state.sides[0].fighters[1]!.comboOpenedAt, undefined);
    assert.deepEqual(wave.state.comboState?.sideTurns, [1, 0]);
  });
});

describe("layout 2 và mở rộng roster", () => {
  it("đổi ô 4/5 giữ cấp, XP, điểm đã tiêu và điểm dư; chỉ một lần cho main lẫn tướng", () => {
    const raw = JSON.parse(JSON.stringify(newProfile()));
    delete raw.skillLayout;
    raw.main = {
      ...autoProgress(20, null),
      skillPoints: 7,
      skillLevels: { o1: 3, o4: 5, o5: 2, o6: 4 },
    };
    raw.companions.haVan = { ...raw.main, skillLevels: { o4: 2 } };
    const p = parseProfile(raw);
    assert.equal(p.skillLayout, 2);
    assert.equal(p.main.skillLevels.o4, 2);
    assert.equal(p.main.skillLevels.o5, 5);
    assert.equal(p.main.skillPoints, 7);
    assert.equal(p.companions.haVan!.skillLevels.o5, 2);
    assert.equal(p.companions.haVan!.skillLevels.o4, undefined);
    assert.equal(p.main.xp, raw.main.xp);
    assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(p))), p);
  });
  it("đủ mọi nhân vật và 42 tổ hợp: thứ tự 1..6, tuyệt chiêu4/cấp10, nghề5/cấp15", () => {
    assert.deepEqual(SKILL_SLOT_ORDER, [1, 2, 3, 4, 5, 6]);
    for (const p of PROFESSIONS)
      for (const e of ELEMENTS) {
        const defs = characterSkills(p, e);
        assert.deepEqual(
          defs.map((d) => d.slot),
          [1, 2, 3, 4, 5, 6],
        );
        assert.equal(defs[3]!.ultimate, true);
        assert.equal(defs[4]!.profession, p);
        assert.equal(buildMain(autoProgress(9, null), e, p).skills!.length, 3);
        assert.equal(buildMain(autoProgress(10, null), e, p).skills!.length, 4);
      }
    for (const c of ALL_COMPANIONS) {
      const f = buildCompanion(c, autoProgress(20, null));
      assert.equal(f.comboPassive, PROFESSION_COMBO[c.profession]);
      assert.ok(f.skills!.every((id) => getSkill(id)));
    }
  });
  it("tướng mới khai báo bằng dữ liệu, có thể chọn bị động khác mẫu nghề mà không sửa engine", () => {
    const base = {
      ...unit("future", "coordination"),
      profession: "phapSu" as const,
    };
    const f = buildCompanion(base, autoProgress(20, null));
    assert.equal(f.id, "future");
    assert.equal(f.comboPassive, "coordination");
    assert.equal(f.skills!.length, 6);
  });
});

it("lượt thêm giữ bộ đếm và cho người chơi tận dụng ngay; không mở chuỗi từ đòn combo", () => {
  const s = skill(arena(), "role_phaTran").state;
  s.board = parseBoard(
    `ABTSVABTSVAB\nTSVABTSVABTS\nKKAKKSVABTSV\nVTKSATBSATBS\nABTSVABTSVAB\nTSVABTSVABTS\nVABTSVABTSVA\nBTSVABTSVABT`,
  );
  const r = action(s, {
    type: "swap",
    from: { row: 3, col: 2 },
    to: { row: 2, col: 2 },
  });
  assert.equal(r.state.turn.extra, true);
  assert.deepEqual(r.state.comboState?.sideTurns, s.comboState?.sideTurns);
  assert.equal(
    r.state.sides[0].fighters[1]!.comboReady!.expiresAt,
    s.sides[0].fighters[1]!.comboReady!.expiresAt,
  );
  const chosen = action(r.state, { type: "selectActor", fighter: 1 });
  const used = skill(chosen.state, "role_tramKich");
  assert.ok(
    used.events.some((e) => e.type === "combo" && e.outcome === "used"),
  );
});
it("toàn bộ đối thủ chiến dịch V2 và 12 sứ quân, gồm tùy tướng, có bị động cấu hình được", () => {
  for (const node of STORY_NODES)
    for (const f of campaignEncounterFoes(node.id) ?? [])
      assert.ok(f.comboPassive, `${node.id}:${f.id}`);
  for (const w of WARLORD_ENCOUNTERS)
    for (const foe of w.foes)
      assert.ok(encounterFighter(foe, w.level).comboPassive, `${w.id}:${foe.id}`);
});

it("registry chặn trùng ID và key prototype; không âm thầm ghi đè khi thêm tướng", () => {
  const def = getSkill("role_tramKich")!;
  assert.throws(() => defineSkillRegistry([def, { ...def }]), /Trùng ID/);
  assert.equal(getSkill("toString"), undefined);
});
it("Tiếp sức không tăng regen hoặc bị tiêu bởi tick hồi; regen không mở Hiệp lực", () => {
  const initial = arena("renewal", "role_tramKich", "role_duongSinh");
  initial.sides[0].fighters[2] = {
    ...initial.sides[0].fighters[2]!,
    comboPassive: "coordination",
    hp: 100,
  };
  const s = follow(skill(initial, "role_tramKich").state);
  const r = skill(s, "role_duongSinh");
  assert.ok(r.state.sides[0].fighters[1]!.comboReady);
  assert.equal(
    r.state.sides[0].fighters[2]!.effects.find((e) => e.kind === "regen")!
      .value,
    70,
  );
  const tick = next(next(r.state));
  assert.equal(tick.sides[0].fighters[2]!.comboReady, undefined);
});

it("bóng ma phòng thủ cũ nhận bị động khi dựng trận mới, không đổi chỉ số/đầu tư", () => {
  const f = unit("old");
  delete (f as { comboPassive?: string }).comboPassive;
  const old: ArenaDefense = {
    team: [f],
    members: [
      {
        id: f.id,
        name: f.name,
        element: f.element,
        profession: f.profession,
        level: 20,
      },
    ],
    power: 123,
  };
  const next = ghostTeam(old, "Người chơi");
  assert.equal(next[0]!.comboPassive, "pursuit");
  assert.equal(next[0]!.atk, f.atk);
  assert.deepEqual(next[0]!.skills, f.skills);
  assert.equal(old.team[0]!.comboPassive, undefined);
});

it("AI định giá Xua tan cơ hội nguy hiểm ngay cả khi mục tiêu không có buff thường", () => {
  const s = next(skill(arena(), "role_phaTran").state);
  s.sides[1].fighters[0] = {
    ...s.sides[1].fighters[0]!,
    skills: ["role_phaKe"],
  };
  s.sides[0].fighters[1] = { ...s.sides[0].fighters[1]!, atk: 1000 };
  const row = inspectSkillChoices(s)[0]!;
  assert.ok(row.score > 0);
  assert.equal(row.reason, "chosen");
  const r = skill(s, "role_phaKe");
  assert.equal(r.state.sides[0].fighters[1]!.comboReady, undefined);
});
it("chuẩn bị combo tạo cửa sổ hạ gục mà cùng đòn đánh thường chưa đủ", () => {
  const s = follow(skill(arena(), "role_phaTran").state);
  const plain = structuredClone(s);
  delete plain.sides[0].fighters[1]!.comboReady;
  const base = hit(skill(plain, "role_tramKich"));
  s.sides[1].fighters[0]!.hp = base + 1;
  plain.sides[1].fighters[0]!.hp = base + 1;
  assert.equal(skill(plain, "role_tramKich").state.sides[1].fighters[0]!.hp, 1);
  const r = skill(s, "role_tramKich");
  assert.equal(r.state.sides[1].fighters[0]!.hp, 0);
  assert.ok(
    r.events.some((e) => e.type === "ko" && e.side === 1 && e.fighter === 0),
  );
});

it("nguồn chiêu riêng canonical mở rộng mà không qua chuyển ô legacy", () => {
  const next = {
    id: "futureUltimate",
    name: "Tuyệt chiêu mới",
    character: "future",
    slot: 4,
    ultimate: true,
    cost: 60,
    target: "enemy" as const,
    steps: [{ type: "damage" as const, atk: 2 }],
  };
  assert.deepEqual(defineCharacterSkills([next]), [next]);
  assert.equal(defineSkillRegistry([next])[next.id]!.slot, 4);
  assert.throws(
    () => defineCharacterSkills([next, { ...next, id: "another" }]),
    /Trùng chiêu riêng/,
  );
  assert.throws(() => defineCharacterSkills([{ ...next, slot: 5 }]), /ô4/);
  // Xạ thủ/Sát thủ đã vào ALL_COMPANIONS: mỗi nhân vật kèm một chiêu riêng.
  assert.equal(CHARACTER_SKILLS.length, ALL_COMPANIONS.length);
});

it("API nâng ô 4/5 yêu cầu layout2, chặn client cache cũ nâng nhầm chiêu", () => {
  for (const key of ["o4", "o5"]) {
    const action = { type: "upgrade" as const, character: "dinhBoLinh", key };
    assert.equal(parseProfileAction(action), null);
    assert.equal(parseProfileAction({ ...action, skillLayout: 1 }), null);
    assert.deepEqual(parseProfileAction(profileActionPayload(action)), action);
  }
  assert.equal(
    parseProfileAction({
      type: "upgrade",
      character: "dinhBoLinh",
      key: "o4",
      skillLayout: 99,
    }),
    null,
  );
});
