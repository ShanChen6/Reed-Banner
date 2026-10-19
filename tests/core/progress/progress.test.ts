import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  addXp,
  applyRewards,
  autoProgress,
  battleRewards,
  buildMatchups,
  buildCompanion,
  buildMain,
  buyBranch,
  createBattle,
  fighterSkill,
  getSkill,
  leveledFoe,
  levelForXp,
  MAX_LEVEL,
  NEW_PROGRESS,
  newProfile,
  parseProfile,
  profileTeam,
  scaleSkill,
  STARTER_COMPANIONS,
  totalXpFor,
  upgradeSkill,
  xpToNext,
  type BattleState,
  type CharacterProgress,
} from "../../../src/core";

const at = (level: number, points = 0, extra: Partial<CharacterProgress> = {}): CharacterProgress => ({
  ...NEW_PROGRESS,
  xp: totalXpFor(level),
  level,
  skillPoints: points,
  ...extra,
});

describe("kinh nghiệm và cấp", () => {
  it("đường cong kinh nghiệm tăng dần và khớp với levelForXp", () => {
    assert.equal(xpToNext(1), 100);
    assert.ok(xpToNext(10) > xpToNext(9));
    for (const l of [1, 2, 5, 10, 20, MAX_LEVEL]) {
      assert.equal(levelForXp(totalXpFor(l)), l);
      if (l > 1) assert.equal(levelForXp(totalXpFor(l) - 1), l - 1);
    }
    assert.equal(levelForXp(1e9), MAX_LEVEL);
  });

  it("lên nhiều cấp một lúc thì nhận đủ điểm kỹ năng, kinh nghiệm không mất", () => {
    const { progress, levelsGained } = addXp(NEW_PROGRESS, totalXpFor(4) + 5);
    assert.equal(progress.level, 4);
    assert.equal(levelsGained, 3);
    assert.equal(progress.skillPoints, 3);
    assert.equal(addXp(progress, -50).progress.xp, progress.xp);
  });
});

describe("nâng cấp kỹ năng", () => {
  it("cấp 2–4 tăng 10% mỗi cấp hệ số chính; cấp 5 giảm 10% chi phí (bội số của 5)", () => {
    const base = getSkill("thanhMocHoPhap")!;
    const lv3 = scaleSkill(base, 3);
    const dmg = (d: typeof base) => (d.steps.find((s) => s.type === "damage") as { atk: number }).atk;
    assert.equal(dmg(lv3), Math.round(dmg(base) * 1.2 * 1000) / 1000);
    assert.equal(lv3.cost, base.cost);
    assert.equal(scaleSkill(base, 5).cost, 35); // 40 × 0.9 = 36 → 35
    assert.equal(scaleSkill(getSkill("coThuTranThien")!, 5).cost, 90);
    assert.equal(scaleSkill(base, 1), base);
    assert.equal(scaleSkill(base, 9).cost, 35);
  });

  it("thời lượng, số ô và cơ hội không đổi; Khiên và Công+ tăng", () => {
    const shield = scaleSkill(getSkill("thachGiap")!, 2).steps[0] as { value: number; turns: number | null };
    assert.equal(shield.value, 0.22);
    const freeze = scaleSkill(getSkill("hanBangTien")!, 5).steps.find((s) => s.type === "effect") as { chance?: number; turns: number | null };
    assert.equal(freeze.chance, 0.3);
    assert.equal(freeze.turns, 1);
    const destroy = scaleSkill(getSkill("lucDiepPhong")!, 4).steps[0];
    assert.deepEqual(destroy, getSkill("lucDiepPhong")!.steps[0]);
  });

  it("tốn điểm 1, 1, 2, 2; chặn khi thiếu điểm, chưa mở hoặc đã tối đa", () => {
    let p = at(5, 6);
    for (const cost of [1, 1, 2, 2]) {
      const r = upgradeSkill(p, "o1", null);
      assert.ok(r.ok);
      assert.equal(p.skillPoints - r.progress.skillPoints, cost);
      p = r.progress;
    }
    assert.equal(p.skillLevels.o1, 5);
    assert.deepEqual(upgradeSkill(p, "o1", null), { ok: false, error: "maxLevel" });
    assert.deepEqual(upgradeSkill(p, "o2", null), { ok: false, error: "notEnoughPoints" });
    assert.deepEqual(upgradeSkill(at(5, 3), "o4", null), { ok: false, error: "locked" });
    assert.deepEqual(upgradeSkill(at(5, 3), "phaTran", "tuongSi"), { ok: false, error: "locked" });
  });
});

describe("mở khóa và dựng nhân vật", () => {
  it("nhân vật chính cấp 1 có ô 1–2, cấp 5 thêm ô 3, cấp 20 đủ 6 ô", () => {
    const slots = (level: number) => buildMain(at(level), "moc", "tuongSi").skills!.map((id) => getSkill(id)!.slot);
    assert.deepEqual(slots(1), [1, 2]);
    assert.deepEqual(slots(5), [1, 2, 3]);
    assert.deepEqual(slots(15), [1, 2, 3, 4, 6]);
    assert.deepEqual(slots(20), [1, 2, 3, 4, 5, 6]);
  });

  it("cấp kỹ năng theo ô giữ nguyên khi đổi nguyên tố; chỉ số tăng theo cấp", () => {
    const p = at(20, 0, { skillLevels: { o3: 4 } });
    const moc = buildMain(p, "moc", "tuongSi");
    const kim = buildMain(p, "kim", "phapSu");
    assert.equal(moc.skillLevels?.thanhMocHoPhap, 4);
    assert.equal(kim.skillLevels?.doanKimNhatTuyen, 4);
    assert.equal(fighterSkill(kim, "doanKimNhatTuyen")!.steps[0]!.type, "damage");
    assert.ok(buildMain(p, "moc", "tuongSi").atk > buildMain(at(1), "moc", "tuongSi").atk);
    assert.equal(buildMain(at(1), "moc", "tuongSi").atk, 55);
  });

  it("nhân vật kèm: mua nhánh từ cấp 5, mang 1 nhánh vào trận", () => {
    const haVan = STARTER_COMPANIONS[0]!;
    assert.deepEqual(buyBranch(at(4, 2), "phepLan", "phapSu"), { ok: false, error: "locked" });
    assert.deepEqual(buyBranch(at(5, 2), "tramKich", "phapSu"), { ok: false, error: "invalidSkill" });
    let r = buyBranch(at(5, 2), "phepLan", "phapSu");
    assert.ok(r.ok);
    r = buyBranch(r.progress, "nguHanhAn", "phapSu");
    assert.ok(r.ok);
    assert.deepEqual(buyBranch(r.progress, "nguHanhAn", "phapSu"), { ok: false, error: "owned" });
    assert.deepEqual(buildCompanion(haVan, r.progress, "nguHanhAn").skills, ["phepCong", "nguHanhAn"]);
    assert.deepEqual(buildCompanion(haVan, r.progress).skills, ["phepCong", "phepLan"]);
    assert.deepEqual(buildCompanion(haVan, NEW_PROGRESS).skills, ["phepCong"]);
  });

  it("tiến trình tự dựng tiêu hết điểm có thể tiêu", () => {
    const p = autoProgress(12, "ySu");
    assert.equal(p.level, 12);
    assert.deepEqual([...p.branches].sort(), ["duongSinh", "teDo"]);
    assert.ok(p.skillPoints <= 1);
    const foe = leveledFoe(STARTER_COMPANIONS[2]!, 12);
    assert.equal(foe.skills!.length, 2);
    const main = autoProgress(MAX_LEVEL, null);
    assert.ok(Object.values(main.skillLevels).every((l) => l >= 4));
  });

  it("kỹ năng nâng cấp có tác dụng trong trận và giảm chi phí năng lượng", () => {
    const main = buildMain(at(1, 0, { skillLevels: { o2: 5 } }), "kim", "tuongSi");
    const { state } = createBattle({ sides: [{ fighters: [main], leader: 0 }, { fighters: [STARTER_COMPANIONS[0]!], leader: 0 }], seed: 3, timer: false, firstSide: 0 });
    state.sides[0].fighters[0]!.energy = 25; // giá gốc 30, cấp 5 còn 25
    const r = act(state, { type: "skill", skill: "kimYNgungThan" });
    assert.ok(r.ok);
    const s = (r as { state: BattleState }).state;
    assert.equal(s.sides[0].fighters[0]!.energy, 0);
    const atkUp = s.sides[0].fighters[0]!.effects.find((e) => e.kind === "atkUp");
    assert.equal(atkUp?.value, 0.35);
  });
});

describe("phần thưởng và hồ sơ", () => {
  const ended = (books: number, gold: number, winner: 0 | 1, fighters = 1): BattleState => {
    const team = STARTER_COMPANIONS.slice(0, fighters);
    const { state } = createBattle({ sides: [{ fighters: team, leader: 0 }, { fighters: team, leader: 0 }], seed: 1, timer: false });
    state.sides[0].books = books;
    state.sides[0].gold = gold;
    state.winner = winner;
    return state;
  };

  it("thắng/thua đều giữ sách và vàng; 3vs3 chia đều; Quân sư và Mưu sĩ cộng 10%", () => {
    assert.deepEqual(battleRewards(ended(10, 10, 0), 0), { won: true, xp: [110], gold: 50 });
    assert.deepEqual(battleRewards(ended(10, 10, 1), 0), { won: false, xp: [70], gold: 30 });
    const three = battleRewards(ended(12, 0, 0, 3), 0); // Hà Vân, Lê Thạch, Mai Thanh
    assert.deepEqual(three.xp, [80, 80, 80]);
    const withBonus = STARTER_COMPANIONS.slice(3, 5); // Tô Kim (Mưu sĩ), Phùng Phong (Quân sư)
    const { state } = createBattle({ sides: [{ fighters: withBonus, leader: 0 }, { fighters: withBonus, leader: 0 }], seed: 1, timer: false });
    state.sides[0].gold = 10;
    state.winner = 0;
    const r = battleRewards(state, 0);
    assert.equal(r.gold, 55);
    assert.deepEqual(r.xp, [66, 66]);
  });

  it("cộng thưởng vào hồ sơ, báo lên cấp; đọc hồ sơ hỏng thì về hồ sơ mới", () => {
    const fresh = newProfile();
    const { profile, levelUps } = applyRewards(fresh, ["dinhBoLinh", "haVan"], { won: true, xp: [250, 50], gold: 40 });
    assert.equal(profile.gold, 40);
    assert.equal(profile.main.level, 3);
    assert.deepEqual(levelUps, [{ id: "dinhBoLinh", level: 3 }]);
    assert.equal(profile.companions.haVan!.xp, 50);
    assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(profile))), profile);
    assert.deepEqual(parseProfile({ version: 2 }), fresh);
    assert.deepEqual(parseProfile(null), fresh);
    const team = profileTeam(profile, ["haVan", "khongCo"]);
    assert.deepEqual(team.map((f) => f.id), ["dinhBoLinh", "haVan"]);
  });
});

describe("mô phỏng theo cấp", () => {
  it("--level dựng mọi nhân vật theo tiến trình tự dựng", () => {
    const [m] = buildMatchups("3v3", 1, 1, "moc", undefined, 5);
    const [main, ...rest] = m!.sides[0].fighters;
    assert.equal(main!.skills!.length, 3);
    assert.ok(Object.values(main!.skillLevels!).some((l) => l > 1));
    for (const f of [...rest, ...m!.sides[1].fighters]) assert.equal(f.skills!.length, 2);
  });
});
