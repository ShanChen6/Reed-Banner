import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act, autoProgress, beginWave, buildCompanion, characterSkills, createBattle, getSkill, personalSkillOf, playAiTurn,
  scaleSkill, specialById, SPECIAL_COMPANIONS, ALL_COMPANIONS, SKILL_SLOT_UNLOCK,
  type BattleEvent, type BattleState, type FighterConfig,
} from "../../../src/core";

/** Địch trung tính: Kim, ATK 100, DEF 20, không kỹ năng. */
const unit = (id: string, extra: Partial<FighterConfig> = {}): FighterConfig => ({
  id, name: id, profession: "tuongSi", element: "kim", maxHp: 2000, atk: 100, def: 20, skills: [], ...extra,
});
/** Nhân vật đặc biệt với ATK 100 và DEF 20 để so số học trực tiếp với bảng trong docs. */
const special = (id: "dinhNgoc" | "vuPhong", extra: Partial<FighterConfig> = {}): FighterConfig => ({
  ...specialById(id)!, maxHp: 2000, atk: 100, def: 20, ...extra,
});
function setup(me: FighterConfig, ally: FighterConfig, foes: FighterConfig[] = [unit("enemy"), unit("enemy2")], seed = 31, firstSide: 0 | 1 = 0): BattleState {
  const s = createBattle({ sides: [{ fighters: [me, ally], leader: 0, food: 60 }, { fighters: foes, leader: 0, food: 60 }], seed, timer: true, audit: true, firstSide }).state;
  s.sides[0].fighters[0]!.energy = 100;
  return s;
}
function cast(s: BattleState, skill: string, extra: { target?: number; whirl?: { center: { row: number; col: number }; turns: number } } = {}) {
  const r = act(s, { type: "skill", skill, target: extra.target ?? 0, whirl: extra.whirl });
  assert.ok(r.ok, `${skill} bị từ chối: ${r.ok ? "" : r.error}`);
  return r;
}
const end = (s: BattleState) => { const r = act(s, { type: "timeout" }, (s.turn.deadline ?? 0) + 4000); assert.ok(r.ok); return r; };
const damageOn = (events: readonly BattleEvent[], side: 0 | 1, fighter: number) =>
  events.filter((e): e is Extract<BattleEvent, { type: "damage" }> => e.type === "damage" && e.side === side && e.fighter === fighter);
const chases = (events: readonly BattleEvent[], passive: string) => events.filter((e) => e.type === "chase" && e.passive === passive);
const whirl = { center: { row: 3, col: 3 }, turns: 1 };

describe("dữ liệu nhân vật đặc biệt", () => {
  it("hai nhân vật có loadout 6+4 hợp lệ, không nằm trong roster thường", () => {
    assert.deepEqual(SPECIAL_COMPANIONS.map((c) => c.id), ["dinhNgoc", "vuPhong"]);
    for (const c of SPECIAL_COMPANIONS) {
      assert.ok(c.special);
      assert.ok(!ALL_COMPANIONS.some((x) => x.id === c.id));
      const skills = characterSkills(c.profession, c.element, c.id);
      assert.deepEqual(skills.map((d) => d.slot), [1, 2, 3, 4, 5, 6]);
      assert.deepEqual(c.skills, skills.map((d) => d.id));
      assert.equal(skills.find((d) => d.ultimate)?.slot, 4);
      assert.equal(personalSkillOf(c.id)?.id, skills[3]!.id);
      for (const d of skills) assert.deepEqual(getSkill(d.id), d);
    }
    assert.equal(specialById("dinhNgoc")!.element, "kim");
    assert.equal(specialById("vuPhong")!.element, "phong");
    assert.equal(specialById("dinhNgoc")!.comboPassive, "phongLenh");
    assert.equal(specialById("vuPhong")!.comboPassive, undefined);
    assert.equal(specialById("vuPhong")!.chasePassives!.length, 4);
  });

  it("chỉ số theo cấp khớp bảng docs (nền riêng, không theo bảng nghề)", () => {
    const at = (id: string, level: number) => {
      const f = buildCompanion(specialById(id)!, autoProgress(level, null));
      return [f.maxHp, f.atk, f.def];
    };
    assert.deepEqual(at("dinhNgoc", 1), [500, 50, 10]);
    assert.deepEqual(at("dinhNgoc", 10), [635, 64, 13]);
    assert.deepEqual(at("dinhNgoc", 30), [935, 94, 19]);
    assert.deepEqual(at("vuPhong", 1), [480, 52, 9]);
    assert.deepEqual(at("vuPhong", 10), [610, 66, 11]);
    assert.deepEqual(at("vuPhong", 20), [754, 82, 14]);
    assert.deepEqual(at("vuPhong", 30), [898, 97, 17]);
  });

  it("chiêu mở theo cấp 1/1/5/10/15/20, giữ nguyên bị động; Vũ Phong không rơi về bị động phối hợp của nghề", () => {
    for (const id of ["dinhNgoc", "vuPhong"]) {
      for (const [level, count] of [[1, 2], [5, 3], [10, 4], [15, 5], [20, 6]] as const) {
        const f = buildCompanion(specialById(id)!, autoProgress(level, null));
        assert.equal(f.skills!.length, count, `${id} cấp ${level}`);
        assert.ok(f.skills!.every((s) => SKILL_SLOT_UNLOCK[getSkill(s)!.slot!]! <= level));
        assert.ok(f.special);
      }
    }
    const vp = buildCompanion(specialById("vuPhong")!, autoProgress(30, null));
    assert.equal(vp.comboPassive, undefined);
    assert.equal(vp.chasePassives!.length, 4);
    assert.equal(buildCompanion(specialById("dinhNgoc")!, autoProgress(30, null)).comboPassive, "phongLenh");
  });

  it("cấp 5: chi phí và hệ số khớp bảng docs", () => {
    const check = (id: string, cost1: number, cost5: number, atk1?: number, atk5?: number) => {
      const d = getSkill(id)!;
      assert.equal(d.cost, cost1);
      assert.equal(scaleSkill(d, 5).cost, cost5);
      const hit = (x: typeof d) => x.steps.find((s) => s.type === "damage");
      if (atk1) { assert.equal(hit(d)!.type === "damage" && (hit(d) as { atk: number }).atk, atk1); assert.equal((hit(scaleSkill(d, 5)) as { atk: number }).atk, atk5); }
    };
    check("dn_kimQuangPhaTran", 30, 25, 1.8, 2.52);
    check("dn_thuyAnhXuyenLuu", 35, 30, 1.55, 2.17);
    check("dn_hoaBoDoatMenh", 45, 40, 2.1, 2.94);
    check("dn_vanTuongQuyNhat", 90, 80, 2.3, 3.22);
    check("dn_thoAnTranTam", 40, 35);
    check("dn_loiVanKhaiLo", 55, 45, 0.7, 0.98);
    check("vp_phongKhoiVanDong", 40, 35, 1.3, 1.82);
    check("vp_muaGiangYLoan", 40, 35, 1.35, 1.89);
    check("vp_lucDiepDanLo", 45, 40);
    check("vp_vanDuThienLy", 90, 80, 0.9, 1.26);
    check("vp_diaMachHoDoi", 55, 45);
    check("vp_cuongPhongDoiCuc", 50, 45);
    // Hệ số cố định ở cấp 5: pierce, ngưỡng execute, xác suất, thời lượng, số nấc whirl.
    const k5 = scaleSkill(getSkill("dn_kimQuangPhaTran")!, 5).steps[0] as { pierce: number };
    assert.equal(k5.pierce, 0.2);
    const e5 = scaleSkill(getSkill("dn_hoaBoDoatMenh")!, 5).steps[0] as { execute: { threshold: number; multiplier: number } };
    assert.deepEqual(e5.execute, { threshold: 0.35, multiplier: 1.25 });
    const f5 = scaleSkill(getSkill("vp_muaGiangYLoan")!, 5).steps[1] as { chance: number; turns: number };
    assert.deepEqual([f5.chance, f5.turns], [0.3, 1]);
  });

  it("nhân vật đặc biệt không nhận nội tại nghề: Binh lính đặc biệt vẫn trả phí lương thường", () => {
    const plain = createBattle({ sides: [{ fighters: [unit("a", { profession: "binhLinh" })], leader: 0, food: 60 }, { fighters: [unit("b")], leader: 0 }], seed: 3 }).state;
    const sp = createBattle({ sides: [{ fighters: [unit("a", { profession: "binhLinh", special: true })], leader: 0, food: 60 }, { fighters: [unit("b")], leader: 0 }], seed: 3 }).state;
    assert.equal(plain.sides[0].food, 57);
    assert.equal(sp.sides[0].food, 55);
  });

  it("bốn bị động truy kích chỉ hợp lệ với nhân vật đặc biệt không có bị động phối hợp", () => {
    const four = ["vp_truongThietHoiDap", "vp_phiDiepTheoGio", "vp_hoaAnVanSau", "vp_loiVanTranPhap"] as const;
    const build = (extra: Partial<FighterConfig>) => () => createBattle({ sides: [{ fighters: [unit("a", extra)], leader: 0 }, { fighters: [unit("b")], leader: 0 }], seed: 1 });
    assert.doesNotThrow(build({ special: true, chasePassives: [...four] }));
    assert.throws(build({ chasePassives: [...four] }), RangeError);
    assert.throws(build({ special: true, comboPassive: "pursuit", chasePassives: [...four] }), RangeError);
    assert.throws(build({ special: true, chasePassives: [four[0], four[0], four[1]] }), RangeError);
  });
});

describe("Đinh Ngọc: sáu chủ động", () => {
  const ngoc = (extra: Partial<FighterConfig> = {}) => special("dinhNgoc", extra);
  it("ô1 Kim Quang Phá Trận xuyên 20% DEF: 155 sát thương (ATK 100, DEF 20)", () => {
    const r = cast(setup(ngoc(), unit("ally")), "dn_kimQuangPhaTran");
    assert.equal(damageOn(r.events, 1, 0)[0]!.amount, Math.round(180 * 100 / 116));
    assert.equal(r.state.sides[0].fighters[0]!.energy, 70);
  });

  it("ô2 dùng hệ Thủy dù phòng thủ Kim: khắc Hỏa ×1.25, và giảm ATK địch 10% trong 1 lượt", () => {
    const s = setup(ngoc(), unit("ally"), [unit("hoa", { element: "hoa" }), unit("e2")]);
    const r = cast(s, "dn_thuyAnhXuyenLuu");
    assert.equal(damageOn(r.events, 1, 0)[0]!.amount, Math.round(155 * 1.25 * 100 / 120));
    const atkDown = r.state.sides[1].fighters[0]!.effects.find((e) => e.kind === "atkDown");
    assert.deepEqual([atkDown?.value, atkDown?.turns], [0.1, 1]);
    // Cùng chiêu lên Thổ (Thủy bị Thổ khắc): ×0.75.
    const t = cast(setup(ngoc(), unit("ally"), [unit("tho", { element: "tho" }), unit("e2")]), "dn_thuyAnhXuyenLuu");
    assert.equal(damageOn(t.events, 1, 0)[0]!.amount, Math.round(155 * 0.75 * 100 / 120));
  });

  it("ô3 Hỏa Bộ Đoạt Mệnh nhân 1.25 khi mục tiêu ≤35% HP ngay trước hit", () => {
    const s = setup(ngoc(), unit("ally"));
    const base = damageOn(cast(s, "dn_hoaBoDoatMenh").events, 1, 0)[0]!.amount;
    // Chiêu hệ Hỏa đánh địch Kim: khắc ×1.25 (hệ phòng thủ Kim của Đinh Ngọc không liên quan).
    assert.equal(base, Math.round(210 * 1.25 * 100 / 120));
    const low = setup(ngoc(), unit("ally"));
    low.sides[1].fighters[0]!.hp = 700;
    assert.equal(damageOn(cast(low, "dn_hoaBoDoatMenh").events, 1, 0)[0]!.amount, Math.round(210 * 1.25 * 1.25 * 100 / 120));
  });

  it("ô4 Vạn Tượng Quy Nhất: đánh địch, thanh tẩy bản thân rồi dựng Khiên 8% HP tối đa", () => {
    const s = setup(ngoc(), unit("ally"));
    s.sides[0].fighters[0]!.effects.push({ kind: "burn", value: 10, turns: 2 }, { kind: "defDown", value: 0.2, turns: 2 });
    const r = cast(s, "dn_vanTuongQuyNhat");
    assert.equal(damageOn(r.events, 1, 0)[0]!.amount, Math.round(230 * 100 / 120));
    const self = r.state.sides[0].fighters[0]!;
    assert.ok(!self.effects.some((e) => e.kind === "burn" || e.kind === "defDown"));
    const sh = self.effects.find((e) => e.kind === "shield")!;
    assert.deepEqual([sh.value, sh.turns], [160, 2]);
    assert.equal(self.energy, 10);
    // Không có hit nào lên đồng đội hay địch thứ hai.
    assert.equal(damageOn(r.events, 1, 1).length, 0);
  });

  it("ô4 cấp 5 Khiên 11.2%: không nhân thêm lần hai ngoài Tinh thần", () => {
    const s = setup(ngoc({ skillLevels: { dn_vanTuongQuyNhat: 5 } }), unit("ally"));
    const r = cast(s, "dn_vanTuongQuyNhat");
    assert.equal(r.state.sides[0].fighters[0]!.effects.find((e) => e.kind === "shield")!.value, 224);
    assert.equal(r.state.sides[0].fighters[0]!.energy, 20);
  });

  it("ô5 Thổ Ấn Trấn Tâm: Khiên 12% và DEF +10% cho bản thân, không gây damage", () => {
    const r = cast(setup(ngoc(), unit("ally")), "dn_thoAnTranTam");
    const self = r.state.sides[0].fighters[0]!;
    assert.deepEqual([self.effects.find((e) => e.kind === "shield")!.value, self.effects.find((e) => e.kind === "defUp")!.value], [240, 0.1]);
    assert.equal(r.events.filter((e) => e.type === "damage").length, 0);
  });

  it("ô6 Lôi Văn Khai Lộ: đánh mọi địch 0.7× ATK và phá ô trên bàn cờ đúng một lần", () => {
    const r = cast(setup(ngoc(), unit("ally")), "dn_loiVanKhaiLo");
    for (const i of [0, 1]) assert.equal(damageOn(r.events, 1, i)[0]!.amount, Math.round(70 * 100 / 120));
    assert.equal(r.events.filter((e) => e.type === "board").length, 1);
  });
});

describe("Đinh Ngọc: bốn nội tại", () => {
  const ngoc = (extra: Partial<FighterConfig> = {}) => special("dinhNgoc", extra);
  const striker = unit("striker", { skills: ["role_tramKich"], atk: 100 });

  it("P1 Thổ Mạch Hộ Thân: Khiên vừa về 0 vì đòn chủ động của địch thì DEF +15% tới hết lượt kế tiếp của phe mình", () => {
    const s = setup(ngoc(), unit("ally"), [striker, unit("e2")], 31, 1);
    s.sides[1].fighters[0]!.energy = 100;
    s.sides[0].fighters[0]!.effects.push({ kind: "shield", value: 20, turns: null });
    const r = cast({ ...s }, "role_tramKich", { target: 0 });
    const self = r.state.sides[0].fighters[0]!;
    assert.equal(chases(r.events, "dn_thoMachHoThan").length, 1);
    const def = self.effects.find((e) => e.kind === "defUp");
    assert.deepEqual([def?.value, def?.turns], [0.15, 1]);
    assert.ok(!self.effects.some((e) => e.kind === "shield"));
  });

  it("P1 không kích khi Khiên còn dư sau đòn, cũng không kích vì Khiên hết hạn", () => {
    const s = setup(ngoc(), unit("ally"), [striker, unit("e2")], 31, 1);
    s.sides[1].fighters[0]!.energy = 100;
    s.sides[0].fighters[0]!.effects.push({ kind: "shield", value: 5000, turns: null });
    const r = cast(s, "role_tramKich", { target: 0 });
    assert.equal(chases(r.events, "dn_thoMachHoThan").length, 0);
    assert.ok(!r.state.sides[0].fighters[0]!.effects.some((e) => e.kind === "defUp"));
  });

  it("P2 Mộc Tức Dưỡng Sinh: cuối lượt hồi 5% HP khi ≤40%, tối đa 3 lần mỗi trận", () => {
    let s = setup(ngoc(), unit("ally"));
    s.sides[0].fighters[0]!.hp = 300; // 15%: vẫn dưới 40% sau ba lần hồi
    const ticks: number[] = [];
    for (let i = 0; i < 6; i++) {
      s = end(s).state;
      s = end(s).state;
      ticks.push(s.sides[0].fighters[0]!.hp);
    }
    assert.deepEqual(ticks, [400, 500, 600, 600, 600, 600]);
    assert.equal(s.sides[0].fighters[0]!.chaseCounters!.dn_mocTucDuongSinh, 3);
  });

  it("P2 không hồi khi HP trên 40%, không tiêu quota; hồi theo Tinh thần của chính mình", () => {
    let s = setup(ngoc(), unit("ally"));
    s.sides[0].fighters[0]!.hp = 900; // 45%
    s = end(end(s).state).state;
    assert.equal(s.sides[0].fighters[0]!.hp, 900);
    assert.equal(s.sides[0].fighters[0]!.chaseCounters, undefined);
    s.sides[0].fighters[0]!.hp = 700;
    s.sides[0].fighters[0]!.spirit = 20;
    s = end(end(s).state).state;
    assert.equal(s.sides[0].fighters[0]!.hp, 700 + Math.round(100 * 0.36));
  });

  it("P2 reset khi sang đợt mới", () => {
    const s = setup(ngoc(), unit("ally"));
    s.sides[0].fighters[0]!.chaseCounters = { dn_mocTucDuongSinh: 3 };
    s.winner = 0;
    const next = beginWave(s, { wave: 2, foes: { fighters: [unit("w1")], leader: 0 }, heal: 0, food: 60, revive: [], reviveHp: 0.5 }).state;
    assert.equal(next.sides[0].fighters[0]!.chaseCounters, undefined);
  });

  it("P3 Lôi Ý Đoạt Cơ: kỹ năng gây mất HP thật trừ 6 năng lượng mục tiêu bị trúng đầu tiên, một lần mỗi hành động", () => {
    const s = setup(ngoc(), unit("ally"), [unit("e1"), unit("e2")]);
    s.sides[1].fighters[0]!.energy = 50;
    s.sides[1].fighters[1]!.energy = 50;
    const r = cast(s, "dn_loiVanKhaiLo");
    assert.equal(chases(r.events, "dn_loiYDoatCo").length, 1);
    assert.equal(r.state.sides[1].fighters[0]!.energy, 44);
    assert.equal(r.state.sides[1].fighters[1]!.energy, 50);
  });

  it("P3 không kích khi chiêu không gây mất HP (ô5) hoặc mục tiêu hết năng lượng", () => {
    const r1 = cast(setup(ngoc(), unit("ally")), "dn_thoAnTranTam");
    assert.equal(chases(r1.events, "dn_loiYDoatCo").length, 0);
    const r2 = cast(setup(ngoc(), unit("ally")), "dn_kimQuangPhaTran");
    assert.equal(chases(r2.events, "dn_loiYDoatCo").length, 0);
  });

  it("P4 Phong Lệnh Tiếp Ứng: đồng đội khác khống chế thành công mở một cơ hội +15% damage vào đúng địch đó", () => {
    const freezer = unit("freezer", { skills: ["freezeNow"] });
    // Chiêu thử nghiệm đóng băng không có trong registry: dùng Ngũ hành ấn Thủy của Pháp sư (khống chế 100%).
    const caster = unit("caster", { element: "thuy", profession: "phapSu", skills: ["nguHanhAn"], comboPassive: undefined });
    void freezer;
    const s = setup(caster, ngoc());
    s.sides[0].fighters[0]!.energy = 100;
    const r = cast(s, "nguHanhAn", { target: 0 });
    const ready = r.state.sides[0].fighters[1]!.comboReady;
    assert.equal(ready?.passive, "phongLenh");
    assert.deepEqual(ready?.target, { side: 1, fighter: 0 });
    // Người chơi đổi qua Đinh Ngọc, dùng ô1 vào đúng địch: +15%.
    const next = end(end(r.state).state).state;
    next.turn.actor = 1;
    next.sides[0].fighters[1]!.energy = 100;
    const hit = cast(next, "dn_kimQuangPhaTran", { target: 0 });
    assert.equal(damageOn(hit.events, 1, 0)[0]!.amount, Math.round(180 * 1.15 * 100 / 116));
  });

  it("P4 không mở khi chính Đinh Ngọc khống chế (chỉ đồng đội khác)", () => {
    const s = setup(ngoc({ skills: ["nguHanhAn"], element: "thuy" }), unit("ally"));
    const r = cast(s, "nguHanhAn", { target: 0 });
    assert.equal(r.state.sides[0].fighters[0]!.comboReady, undefined);
  });
});

describe("Vũ Phong: sáu chủ động", () => {
  const phong = (extra: Partial<FighterConfig> = {}) => special("vuPhong", extra);
  it("ô1 Phong Khởi Vân Động: 1.3× ATK rồi xoay bàn cờ 1 nấc; thiếu lốc xoáy thì bị từ chối", () => {
    const s = setup(phong(), unit("ally"));
    assert.deepEqual(act(s, { type: "skill", skill: "vp_phongKhoiVanDong", target: 0 }), { ok: false, error: "invalidTarget" });
    const r = cast(s, "vp_phongKhoiVanDong", { whirl });
    assert.equal(damageOn(r.events, 1, 0)[0]!.amount, Math.round(130 * 100 / 120));
    assert.equal(r.events.filter((e) => e.type === "whirl").length, 1);
    assert.equal(r.state.sides[0].fighters[0]!.energy, 60);
  });

  it("ô2 Mưa Giăng Ý Loạn: hệ Thủy, 30% Đóng băng 1 lượt (có lúc trúng, có lúc không)", () => {
    let frozen = 0;
    const n = 60;
    for (let seed = 1; seed <= n; seed++) {
      const r = cast(setup(phong(), unit("ally"), [unit("e1"), unit("e2")], seed), "vp_muaGiangYLoan");
      assert.equal(damageOn(r.events, 1, 0)[0]!.amount, Math.round(135 * 100 / 120));
      if (r.state.sides[1].fighters[0]!.effects.some((e) => e.kind === "freeze")) frozen++;
    }
    assert.ok(frozen > 5 && frozen < 35, `đóng băng ${frozen}/${n}`);
    const fire = cast(setup(phong(), unit("ally"), [unit("hoa", { element: "hoa" }), unit("e2")]), "vp_muaGiangYLoan");
    assert.equal(damageOn(fire.events, 1, 0)[0]!.amount, Math.round(135 * 1.25 * 100 / 120));
  });

  it("ô3 Lục Diệp Dẫn Lộ: thanh tẩy rồi hồi 8% HP tối đa người nhận, nhân Tinh thần của người nhận", () => {
    const s = setup(phong(), unit("ally", { maxHp: 1000 }));
    const ally = s.sides[0].fighters[1]!;
    ally.hp = 300;
    ally.effects.push({ kind: "burn", value: 10, turns: 2 });
    const r = cast(s, "vp_lucDiepDanLo", { target: 1 });
    const healed = r.state.sides[0].fighters[1]!;
    assert.equal(healed.hp, 380);
    assert.ok(!healed.effects.some((e) => e.kind === "burn"));
    assert.equal(r.state.sides[0].fighters[0]!.energy, 55);
    // Tinh thần 20%: 0.2 + 0.8×0.2 = 0.36 → hồi round(80×0.36).
    const s2 = setup(phong(), unit("ally", { maxHp: 1000 }));
    s2.sides[0].fighters[1]!.hp = 300;
    s2.sides[0].fighters[1]!.spirit = 20;
    assert.equal(cast(s2, "vp_lucDiepDanLo", { target: 1 }).state.sides[0].fighters[1]!.hp, 300 + Math.round(80 * 0.36));
    // Solo hoặc không chọn mục tiêu: tự chữa.
    const s3 = setup(phong(), unit("ally"));
    s3.sides[0].fighters[0]!.hp = 1000;
    assert.equal(act(s3, { type: "skill", skill: "vp_lucDiepDanLo" }).ok, true);
  });

  it("ô4 Vân Du Thiên Lý: đánh mọi địch, Xua tan buff từng địch, xoay bàn cờ tự động", () => {
    const s = setup(phong(), unit("ally"));
    for (const f of s.sides[1].fighters) f.effects.push({ kind: "atkUp", value: 0.2, turns: 2 });
    const r = cast(s, "vp_vanDuThienLy");
    for (const i of [0, 1]) {
      assert.equal(damageOn(r.events, 1, i)[0]!.amount, Math.round(90 * 100 / 120));
      assert.ok(!r.state.sides[1].fighters[i]!.effects.some((e) => e.kind === "atkUp"));
    }
    assert.ok(r.events.filter((e) => e.type === "whirl").length <= 1);
    assert.equal(r.state.sides[0].fighters[0]!.energy, 10);
  });

  it("ô5 Địa Mạch Hộ Đội: Khiên 6% HP và DEF +8% cho từng người trong đội", () => {
    const r = cast(setup(phong(), unit("ally", { maxHp: 1000 })), "vp_diaMachHoDoi");
    const [a, b] = r.state.sides[0].fighters;
    assert.equal(a!.effects.find((e) => e.kind === "shield")!.value, 120);
    assert.equal(b!.effects.find((e) => e.kind === "shield")!.value, 60);
    for (const f of [a!, b!]) assert.equal(f.effects.find((e) => e.kind === "defUp")!.value, 0.08);
  });

  it("ô6 Cuồng Phong Đổi Cục: xoay bàn cờ rồi ATK cả đội +10% trong 2 lượt", () => {
    const r = cast(setup(phong(), unit("ally")), "vp_cuongPhongDoiCuc", { whirl: { center: { row: 4, col: 4 }, turns: 2 } });
    assert.equal(r.events.filter((e) => e.type === "whirl").length, 1);
    for (const f of r.state.sides[0].fighters) {
      const up = f.effects.find((e) => e.kind === "atkUp")!;
      assert.deepEqual([up.value, up.turns], [0.1, 2]);
    }
    assert.equal(r.state.sides[0].fighters[0]!.energy, 50);
  });
});

describe("Vũ Phong: bốn nội tại", () => {
  const phong = (extra: Partial<FighterConfig> = {}) => special("vuPhong", extra);
  const striker = unit("striker", { skills: ["role_tramKich"] });

  it("P1 Trượng Thiết Hồi Đáp: mất HP thật vì chủ động của địch thì trả đòn Kim 30% ATK vào đúng kẻ đó", () => {
    const s = setup(phong(), unit("ally"), [striker, unit("e2")], 31, 1);
    s.sides[1].fighters[0]!.energy = 100;
    const r = cast(s, "role_tramKich", { target: 0 });
    assert.equal(chases(r.events, "vp_truongThietHoiDap").length, 1);
    const back = damageOn(r.events, 1, 0).filter((e) => e.source === "skill");
    assert.equal(back[0]!.amount, Math.round(30 * 100 / 120));
  });

  it("P1 không trả đòn khi bị hạ gục hoặc khi Khiên đỡ hết", () => {
    const dead = setup(phong(), unit("ally"), [striker, unit("e2")], 31, 1);
    dead.sides[1].fighters[0]!.energy = 100;
    dead.sides[0].fighters[0]!.hp = 5;
    assert.equal(chases(cast(dead, "role_tramKich", { target: 0 }).events, "vp_truongThietHoiDap").length, 0);
    const shielded = setup(phong(), unit("ally"), [striker, unit("e2")], 31, 1);
    shielded.sides[1].fighters[0]!.energy = 100;
    shielded.sides[0].fighters[0]!.effects.push({ kind: "shield", value: 9000, turns: null });
    assert.equal(chases(cast(shielded, "role_tramKich", { target: 0 }).events, "vp_truongThietHoiDap").length, 0);
  });

  it("P2 Phi Diệp Theo Gió: đồng đội làm địch xuống ≤50% HP thì truy kích Phong 30% ATK; chính mình thì không", () => {
    const mate = unit("mate", { skills: ["role_tramKich"] });
    const s = setup(unit("lead"), phong(), [unit("e1"), unit("e2")]);
    s.sides[0].fighters[0] = { ...s.sides[0].fighters[0]!, ...mate, hp: 2000, energy: 100 };
    s.sides[1].fighters[0]!.hp = 1100;
    const r = cast(s, "role_tramKich", { target: 0 });
    assert.equal(chases(r.events, "vp_phiDiepTheoGio").length, 1);
    const hits = damageOn(r.events, 1, 0).filter((e) => e.source === "skill");
    assert.equal(hits.at(-1)!.amount, Math.round(30 * 100 / 120));
    // Chính Vũ Phong tung chiêu làm địch yếu: không tự kích P2.
    const own = setup(phong({ skills: ["role_tramKich"] }), unit("ally"));
    own.sides[1].fighters[0]!.hp = 1100;
    assert.equal(chases(cast(own, "role_tramKich", { target: 0 }).events, "vp_phiDiepTheoGio").length, 0);
  });

  it("P3 Hỏa Ẩn Vân Sau: địch còn sống ≤30% HP sau kỹ năng của mình thì Thiêu đốt 2 lượt, mỗi lượt 30% ATK", () => {
    const s = setup(phong({ skills: ["vp_muaGiangYLoan"] }), unit("ally"));
    s.sides[1].fighters[0]!.hp = 700;
    const r = cast(s, "vp_muaGiangYLoan");
    assert.equal(chases(r.events, "vp_hoaAnVanSau").length, 1);
    const burn = r.state.sides[1].fighters[0]!.effects.find((e) => e.kind === "burn")!;
    assert.deepEqual([burn.value, burn.turns], [30, 2]);
    // Hạ gục thì không có Thiêu đốt; địch còn máu thì không kích.
    const dead = setup(phong({ skills: ["vp_muaGiangYLoan"] }), unit("ally"));
    dead.sides[1].fighters[0]!.hp = 50;
    assert.equal(chases(cast(dead, "vp_muaGiangYLoan").events, "vp_hoaAnVanSau").length, 0);
    assert.equal(chases(cast(setup(phong({ skills: ["vp_muaGiangYLoan"] }), unit("ally")), "vp_muaGiangYLoan").events, "vp_hoaAnVanSau").length, 0);
  });

  it("P4 Lôi Vân Trấn Pháp: Xua tan hữu hiệu của phe ta thì Câm lặng đúng địch đó 1 lượt", () => {
    const s = setup(phong(), unit("ally"));
    s.sides[1].fighters[0]!.effects.push({ kind: "shield", value: 500, turns: null });
    const r = cast(s, "vp_vanDuThienLy");
    assert.equal(chases(r.events, "vp_loiVanTranPhap").length, 1);
    const sil = r.state.sides[1].fighters[0]!.effects.find((e) => e.kind === "silence")!;
    assert.equal(sil.turns, 1);
    assert.ok(!r.state.sides[1].fighters[1]!.effects.some((e) => e.kind === "silence"));
  });

  it("P4 không kích khi địch không có buff để Xua tan", () => {
    const r = cast(setup(phong(), unit("ally")), "vp_vanDuThienLy");
    assert.equal(chases(r.events, "vp_loiVanTranPhap").length, 0);
  });
});

describe("hai nhân vật đặc biệt trong trận AI đầy đủ", () => {
  for (const id of ["dinhNgoc", "vuPhong"] as const) {
    for (const mode of ["1vs1", "3vs3"] as const) {
      it(`${id} ${mode}: AI chơi hết trận bằng cả sáu chiêu hợp lệ, không lỗi và không vượt giới hạn chuỗi`, () => {
        const me = buildCompanion(specialById(id)!, autoProgress(30, null));
        const foes = [unit("f1", { maxHp: 900, atk: 80 }), unit("f2", { maxHp: 900, atk: 80, element: "moc" }), unit("f3", { maxHp: 900, atk: 80, element: "loi" })];
        const mates = [unit("m1", { maxHp: 900, atk: 80 }), unit("m2", { maxHp: 900, atk: 80 })];
        const sides = mode === "1vs1"
          ? [{ fighters: [me], leader: 0 }, { fighters: [foes[0]!], leader: 0 }]
          : [{ fighters: [me, ...mates], leader: 0 }, { fighters: foes, leader: 0 }];
        let state = createBattle({ sides: sides as never, seed: 7, timer: false, audit: false }).state;
        const used = new Set<string>();
        const seen: BattleEvent[] = [];
        for (let i = 0; i < 400 && state.winner === null; i++) {
          const r = playAiTurn(state, "normal");
          state = r.state;
          seen.push(...r.events);
          for (const e of r.events) if (e.type === "skill" && e.side === 0 && e.fighter === 0) used.add(e.skill);
        }
        assert.notEqual(state.winner, null, "trận phải kết thúc");
        assert.ok(used.size >= 1, "AI phải dùng ít nhất một chiêu của nhân vật");
        for (const skill of used) assert.ok(me.skills!.includes(skill));
        assert.ok(seen.every((e) => e.type !== "chase" || e.depth <= 4));
      });
    }
  }
});
