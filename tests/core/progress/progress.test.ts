import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  ALL_COMPANIONS,
  isHero,
  addXp,
  applyProfileAction,
  applyRewards,
  autoProgress,
  battleRewards,
  buildMatchups,
  buildCompanion,
  buildMain,
  buyBranch,
  createBattle,
  DEFAULT_TEAM,
  fighterSkill,
  getSkill,
  leveledFoe,
  levelForXp,
  MAX_LEVEL,
  NEW_PROGRESS,
  newProfile,
  ownsCompanion,
  parseProfile,
  parseProfileAction,
  PROFESSIONS,
  professionSkills,
  profileTeam,
  scaleSkill,
  SHOP_COMPANIONS,
  SHOP_PRICES,
  STARTER_COMPANIONS,
  totalXpFor,
  ultimateOf,
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

  it("tuyệt chiêu nấc 3 tự mở ở cấp 10, nâng được bằng điểm", () => {
    const leThach = STARTER_COMPANIONS[1]!;
    assert.ok(!buildCompanion(leThach, at(9, 3)).skills!.includes("tranSonHoQuan"));
    assert.deepEqual(upgradeSkill(at(9, 3), "tranSonHoQuan", "binhLinh", "leThach"), { ok: false, error: "locked" });
    assert.deepEqual(buildCompanion(leThach, at(10, 3)).skills, ["thuThanh", "tranSonHoQuan"]);
    // Tuyệt chiêu của người khác không nâng được.
    assert.deepEqual(upgradeSkill(at(10, 3), "tranSonHoQuan", "binhLinh", "haVan"), { ok: false, error: "locked" });
    const r = upgradeSkill(at(10, 3), "tranSonHoQuan", "binhLinh", "leThach");
    assert.ok(r.ok);
    assert.equal(buildCompanion(leThach, r.progress).skillLevels!.tranSonHoQuan, 2);
    for (const c of STARTER_COMPANIONS) {
      const ult = ultimateOf(c.id)!;
      assert.equal(ult.tier, 3);
      assert.equal(ult.cost, 100);
      assert.equal(ult.profession, c.profession);
    }
  });

  it("tiến trình tự dựng tiêu hết điểm có thể tiêu", () => {
    const p = autoProgress(12, "ySu");
    assert.equal(p.level, 12);
    assert.deepEqual([...p.branches].sort(), ["duongSinh", "teDo"]);
    assert.ok(p.skillPoints <= 1);
    const foe = leveledFoe(STARTER_COMPANIONS[2]!, 12);
    assert.deepEqual(foe.skills!.length, 3); // nấc 1, một nhánh, tuyệt chiêu từ cấp 10
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

describe("thao tác trên hồ sơ", () => {
  it("nâng kỹ năng, mua và chọn chiêu nhánh qua cùng một hàm cho /demo và server", () => {
    const branches = professionSkills("phapSu").filter((d) => d.tier === 2);
    const p0 = { ...newProfile(), main: at(5, 2), companions: { ...newProfile().companions, haVan: at(5, 2) } };
    assert.deepEqual(applyProfileAction(newProfile(), { type: "upgrade", character: "dinhBoLinh", key: "o1" }), {
      ok: false,
      error: "notEnoughPoints",
    });
    const up = applyProfileAction(p0, { type: "upgrade", character: "dinhBoLinh", key: "o1" });
    assert.ok(up.ok);
    assert.equal(up.profile.main.skillLevels.o1, 2);
    assert.equal(up.profile.main.skillPoints, 1);
    assert.equal(applyProfileAction(p0, { type: "chooseBranch", character: "haVan", skill: branches[0]!.id }).ok, false);
    const bought = applyProfileAction(p0, { type: "buyBranch", character: "haVan", skill: branches[0]!.id });
    assert.ok(bought.ok);
    const chosen = applyProfileAction(bought.profile, { type: "chooseBranch", character: "haVan", skill: branches[0]!.id });
    assert.ok(chosen.ok);
    assert.equal(chosen.profile.branchChoice.haVan, branches[0]!.id);
    assert.deepEqual(applyProfileAction(p0, { type: "buyBranch", character: "khongCo", skill: "x" }), { ok: false, error: "invalidSkill" });
    assert.deepEqual(applyProfileAction(p0, { type: "buyBranch", character: "dinhBoLinh", skill: "x" }), { ok: false, error: "invalidSkill" });
  });

  it("mua nhân vật kèm bằng vàng và chọn đội 3vs3", () => {
    const rich = { ...newProfile(), gold: SHOP_PRICES.basic + 10 };
    assert.deepEqual(applyProfileAction(newProfile(), { type: "buyCompanion", character: "daoLam" }), { ok: false, error: "notEnoughGold" });
    assert.deepEqual(applyProfileAction(rich, { type: "buyCompanion", character: "haVan" }), { ok: false, error: "invalidSkill" });
    assert.deepEqual(applyProfileAction(rich, { type: "chooseTeam", companions: ["haVan", "daoLam"] }), { ok: false, error: "notOwned" });
    assert.deepEqual(applyProfileAction(rich, { type: "upgrade", character: "daoLam", key: "phepCong" }), { ok: false, error: "notOwned" });
    const bought = applyProfileAction(rich, { type: "buyCompanion", character: "daoLam" });
    assert.ok(bought.ok);
    assert.equal(bought.profile.gold, 10);
    assert.ok(ownsCompanion(bought.profile, "daoLam"));
    assert.deepEqual(applyProfileAction(bought.profile, { type: "buyCompanion", character: "daoLam" }), { ok: false, error: "owned" });
    for (const bad of [["haVan"], ["haVan", "haVan"], ["haVan", "vuLoi"]]) {
      assert.equal(applyProfileAction(bought.profile, { type: "chooseTeam", companions: bad }).ok, false);
    }
    const team = applyProfileAction(bought.profile, { type: "chooseTeam", companions: ["daoLam", "leThach"] });
    assert.ok(team.ok);
    assert.deepEqual(team.profile.team, ["daoLam", "leThach"]);
    // Lưu rồi đọc lại giữ nhân vật đã mua và đội; đội hỏng thì về mặc định.
    const saved = parseProfile(JSON.parse(JSON.stringify(team.profile)));
    assert.deepEqual(saved, team.profile);
    assert.deepEqual(parseProfile({ ...team.profile, team: ["vuLoi", "haVan"] }).team, DEFAULT_TEAM);
    assert.ok(!ownsCompanion(parseProfile({ ...team.profile, companions: { ...team.profile.companions, giaMao: NEW_PROGRESS } }), "giaMao"));
    assert.deepEqual(profileTeam(team.profile, team.profile.team).map((f) => f.id), ["dinhBoLinh", "daoLam", "leThach"]);
  });

  it("cửa hàng: 12 nhân vật, 2 mỗi nghề, đủ 7 hệ, ai cũng có tuyệt chiêu riêng", () => {
    assert.equal(SHOP_COMPANIONS.length, 12);
    for (const p of PROFESSIONS) assert.equal(SHOP_COMPANIONS.filter((c) => c.fighter.profession === p).length, 2);
    assert.equal(new Set(SHOP_COMPANIONS.map((c) => c.fighter.element)).size, 7);
    // Tướng lịch sử dùng bộ kỹ năng theo nguyên tố, không có tuyệt chiêu riêng.
    for (const c of ALL_COMPANIONS.filter((c) => !isHero(c.id))) {
      const ult = ultimateOf(c.id);
      assert.ok(ult, c.id);
      assert.equal(ult.profession, c.profession);
      assert.ok(c.skills!.includes(ult.id));
    }
  });

  it("kiểm tra hình dạng thao tác gửi lên", () => {
    assert.deepEqual(parseProfileAction({ type: "buyCompanion", character: "daoLam" }), { type: "buyCompanion", character: "daoLam" });
    assert.deepEqual(parseProfileAction({ type: "chooseTeam", companions: ["a", "b"] }), { type: "chooseTeam", companions: ["a", "b"] });
    assert.equal(parseProfileAction({ type: "chooseTeam", companions: ["a", 1] }), null);
    assert.deepEqual(parseProfileAction({ type: "upgrade", character: "dinhBoLinh", key: "o1", x: 1 }), {
      type: "upgrade",
      character: "dinhBoLinh",
      key: "o1",
    });
    assert.equal(parseProfileAction({ type: "upgrade", character: "dinhBoLinh" }), null);
    assert.equal(parseProfileAction({ type: "gold", character: "dinhBoLinh", amount: 999 }), null);
    assert.equal(parseProfileAction(null), null);
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
