import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALL_COMPANIONS, ELEMENTS, PROFESSIONS, ROLE_SKILLS, ELEMENT_SKILLS,
  characterSkills, skillSource, getSkill, personalSkillOf, buildMain, buildCompanion,
  autoProgress, NEW_PROGRESS, parseProfile, newProfile, upgradeSkill,
  needsCell, whirlStep, act, createBattle, chooseSkill, toView, scaleSkill, buildCampaignLeader, legacyHeroSkills,
  type FighterConfig, type BattleState, type Profile,
} from "../../../src/core";

function arena(skills: string[], trio = false): BattleState {
  const f = (id: string, skills: string[] = []): FighterConfig => ({id, name:id, profession:"tuongSi", element:"kim", maxHp:1000, atk:100, def:0, skills});
  const {state} = createBattle({sides:[{fighters:trio ? [f("a",skills), f("b"), f("c")] : [f("a",skills)],leader:0}, {fighters:trio ? [f("x"), f("y"), f("z")] : [f("x")],leader:0}],seed:17,firstSide:0,timer:false});
  for (const side of state.sides) side.fighters.forEach((f, i) => { side.fighters[i] = { ...f, maxHp:1000, hp:1000 }; });
  state.sides[0].fighters[0]!.energy = 100;
  return state;
}

describe("bộ nghề + hệ", () => {
  it("đủ 42 tổ hợp: 3 nghề, 2 hệ, 1 tuyệt chiêu; ID không trùng và thứ tự theo mốc", () => {
    assert.equal(ROLE_SKILLS.length,18);
    assert.equal(ELEMENT_SKILLS.length,14);
    assert.equal(new Set([...ROLE_SKILLS,...ELEMENT_SKILLS].map(d=>d.id)).size,32);
    for (const p of PROFESSIONS) for (const e of ELEMENTS) {
      const defs = characterSkills(p,e);
      assert.deepEqual(defs.map(d=>d.slot),[1,2,3,4,5,6]);
      assert.equal(new Set(defs.map(d=>d.id)).size,6);
      assert.equal(defs.filter(d=>skillSource(d)==="profession").length,3);
      assert.equal(defs.filter(d=>skillSource(d)==="element").length,2);
      assert.equal(defs.filter(d=>skillSource(d)==="character").length,1);
      assert.ok(defs.every(d=>getSkill(d.id)===d));
      assert.deepEqual(buildMain(autoProgress(30,null),e,p).skills,defs.map(d=>d.id));
    }
  });
  it("mọi nhân vật kèm dùng đúng chiêu riêng ô 4, không có chiêu thứ bảy", () => {
    assert.ok(ALL_COMPANIONS.length>=60);
    for (const c of ALL_COMPANIONS) {
      const defs = characterSkills(c.profession,c.element,c.id);
      assert.equal(defs.find(d=>d.slot===4)?.id,personalSkillOf(c.id)?.id,c.id);
      assert.ok(personalSkillOf(c.id));
      assert.deepEqual(c.skills,defs.map(d=>d.id));
      assert.deepEqual(buildCompanion(c,autoProgress(30,null)).skills,defs.map(d=>d.id));
    }
  });
  it("mốc mở chính xác và khóa nâng cấp trước mốc", () => {
    const expected = [[1,1,2],[4,1,2],[5,1,2,3],[9,1,2,3],[10,1,2,3,4],[14,1,2,3,4],[15,1,2,3,4,5],[19,1,2,3,4,5],[20,1,2,3,4,5,6]];
    for (const [level,...slots] of expected) {
      const p={...NEW_PROGRESS,level:level!,skillPoints:10};
      assert.deepEqual(buildMain(p,"moc","ySu").skills!.map(id=>getSkill(id)!.slot),slots);
      for (const slot of [1,2,3,4,5,6]) assert.equal(upgradeSkill(p,`o${slot}`,null).ok,slots.includes(slot));
    }
  });
  it("đổi nghề/hệ và đọc hồ sơ nhiều lần giữ nguyên mọi điểm, kể cả ô tạm khóa", () => {
    const p={...newProfile(), main:{...autoProgress(15,null),skillLevels:{o1:2,o2:3,o3:4,o4:5,o5:2,o6:4}}};
    let saved: Profile=p;
    for (let i=0;i<3;i++) saved=parseProfile(JSON.parse(JSON.stringify(saved)));
    assert.deepEqual(saved,p);
    for (const profession of PROFESSIONS) for (const element of ELEMENTS) {
      const fighter=buildMain(saved.main,element,profession);
      for (const id of fighter.skills!) assert.equal(fighter.skillLevels![id],saved.main.skillLevels[`o${getSkill(id)!.slot}` as keyof typeof saved.main.skillLevels]);
      assert.ok(!fighter.skills!.some(id=>getSkill(id)!.slot===6));
    }
  });
  it("hồ sơ nghề cổ hoàn đúng số thực chi, giữ cấp/XP/tài nguyên/đồ; không hoàn lần hai", () => {
    const profile=newProfile();
    const old={...profile,gold:1234,companions:{...profile.companions,haVan:{...autoProgress(15,null),skillPoints:3,skillLevels:{phepCong:4,nguHanhAn:3,o2:2},branches:["nguHanhAn"]}}};
    const migrated=parseProfile(old);
    assert.equal(migrated.companions.haVan!.skillPoints,10); // 3 chưa chi + 4 + 2 nâng + 1 nhánh
    assert.deepEqual(migrated.companions.haVan!.skillLevels,{o2:2});
    assert.equal(migrated.companions.haVan!.xp,old.companions.haVan.xp);
    assert.equal(migrated.companions.haVan!.level,15);
    assert.deepEqual({...migrated,companions:undefined},{...old,companions:undefined});
    assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(migrated))),migrated);
  });
  it("preset thủ lĩnh chiến dịch giữ mốc cũ; người sở hữu dùng khung mới", () => {
    for (const level of [1,5,9,10,15,19,20,30,35]) {
      const f=buildCampaignLeader(level,"thuy","quanSu","tranLam");
      const unlock:Record<number,number>={1:1,2:1,3:5,4:10,5:20,6:15};
      assert.deepEqual(f.skills,legacyHeroSkills("thuy","tranLam").filter(d=>level>=unlock[d.slot!]!).map(d=>d.id));
      assert.ok(!f.skills!.some(id=>id.startsWith("role_")));
    }
  });
});

describe("thực thi chiêu mới", () => {
  it("cả 32 chiêu mới thực thi được ở 1vs1 và 3vs3, giữ luật Câm lặng", () => {
    for (const def of [...ROLE_SKILLS,...ELEMENT_SKILLS]) for (const trio of [false,true]) {
      const s=arena([def.id],trio);
      const action={type:"skill" as const,skill:def.id,target:0,
        ...(needsCell(def)?{cell:{row:3,col:3}}:{}),
        ...(whirlStep(def)?{whirl:{center:{row:3,col:3},turns:1}}:{})};
      const r=act(s,action);
      assert.ok(r.ok,`${def.id} ${trio}: ${!r.ok?r.error:""}`);
      assert.ok(r.state.turn.skillUsed);
      s.sides[0].fighters[0]!.effects.push({kind:"silence",value:0,turns:2});
      assert.equal(act(s,action).ok,false,def.id);
    }
  });
  it("Đoạt mệnh xét ngưỡng trước đòn, nâng hệ số nhưng giữ ngưỡng", () => {
    for (const [hp,damage] of [[351,260],[350,390]]) {
      const s=arena(["role_doatMenh"]);
      s.sides[1].fighters[0]!.hp=hp!;
      const r=act(s,{type:"skill",skill:"role_doatMenh",target:0});
      assert.ok(r.ok);
      const hit=r.events.find(e=>e.type==="damage" && e.side===1);
      assert.ok(hit && hit.type==="damage");
      assert.equal(hit.amount,Math.min(hp!,damage!));
    }
    const step=scaleSkill(getSkill("role_doatMenh")!,5).steps[0]!;
    assert.ok(step.type==="damage");
    assert.deepEqual(step.execute,{threshold:0.35,multiplier:1.5});
    assert.equal(step.atk,3.64);
  });
  it("Phép lan có hệ số 1vs1 ×1.5 và không nhân trong 3vs3", () => {
    for (const trio of [false,true]) {
      const s=arena(["role_phepLan"],trio);
      const r=act(s,{type:"skill",skill:"role_phepLan"});
      assert.ok(r.ok);
      assert.equal(r.state.sides[1].fighters[0]!.hp,1000-(trio?90:135));
    }
  });
  it("Thủ thành chuyển đòn sang Binh lính; mỗi lượt chỉ dùng một chiêu", () => {
    const s=arena(["role_thuThanh"],true);
    const r=act(s,{type:"skill",skill:"role_thuThanh"});
    assert.ok(r.ok);
    assert.equal(r.state.sides[0].fighters[0]!.effects.find(e=>e.kind==="shield")?.value,200);
    const foe=r.state.sides[1].fighters[0]!;
    const next={...r.state,turn:{...r.state.turn,side:1 as const,actor:0,skillUsed:false}};
    const armed={...next,sides:[next.sides[0],{...next.sides[1],fighters:[{...foe,energy:100,skills:["role_tramKich"]},...next.sides[1].fighters.slice(1)]}] as typeof next.sides};
    const hit=act(armed,{type:"skill",skill:"role_tramKich",target:1});
    assert.equal(hit.ok,false); // mục tiêu khác người Khiêu khích bị chặn
    const redirected=act(armed,{type:"skill",skill:"role_tramKich"});
    assert.ok(redirected.ok);
    assert.equal(redirected.state.sides[0].fighters[1]!.hp,1000);
    assert.equal(redirected.state.sides[0].fighters[0]!.hp,990);
    const blocked=act(redirected.state,{type:"skill",skill:"role_tramKich",target:1});
    assert.equal(blocked.ok,false);
  });
  it("Linh dược hồi + Thanh tẩy, Phá kế xóa buff nhưng giữ debuff", () => {
    const s=arena(["role_linhDuoc"],true);
    s.sides[0].fighters[1]!.hp=500;
    s.sides[0].fighters[1]!.effects=[{kind:"silence",value:0,turns:2},{kind:"atkUp",value:0.2,turns:2}];
    const heal=act(s,{type:"skill",skill:"role_linhDuoc",target:1});
    assert.ok(heal.ok);
    assert.equal(heal.state.sides[0].fighters[1]!.hp,720);
    assert.deepEqual(heal.state.sides[0].fighters[1]!.effects.map(e=>e.kind),["atkUp"]);
    const d=arena(["role_phaKe"],true);
    d.sides[1].fighters[1]!.effects=[{kind:"atkUp",value:0.2,turns:2},{kind:"burn",value:5,turns:2}];
    const dispel=act(d,{type:"skill",skill:"role_phaKe"});
    assert.ok(dispel.ok);
    assert.deepEqual(dispel.state.sides[1].fighters[1]!.effects.map(e=>e.kind),["burn"]);
  });
});

describe("AI với vai trò mới", () => {
  it("không phí hồi/Thanh tẩy vào đội đầy máu chỉ có buff", () => {
    const s=arena(["role_linhDuoc","role_duongSinh","role_teDo"],true);
    s.sides[0].fighters[0]!.effects=[{kind:"atkUp",value:0.3,turns:2}];
    assert.equal(chooseSkill(toView(s)),null);
    s.sides[0].fighters[2]!.hp=200;
    const choice=chooseSkill(toView(s));
    assert.ok(choice?.type==="skill");
    if(choice.skill==="role_linhDuoc") assert.equal(choice.target,2);
  });
  it("phá năng lượng/Câm lặng nhắm người có năng lượng, Xua tan bỏ qua debuff", () => {
    for (const skill of ["role_muaChuoc","role_lyGian"]) {
      const s=arena([skill],true);
      const target=skill==="role_lyGian"?0:2; // Ly gián 2 lượt chỉ có giá trị với người sắp hành động.
      s.sides[1].fighters[target]!.energy=100;
      s.sides[1].fighters[target]={...s.sides[1].fighters[target]!,skills:["role_tramKich"]};
      const choice=chooseSkill(toView(s));
      assert.ok(choice?.type==="skill");
      assert.equal(choice.target,target);
    }
    const s=arena(["role_phaKe"],true);
    s.sides[1].fighters[0]!.effects=[{kind:"burn",value:5,turns:2}];
    assert.equal(chooseSkill(toView(s)),null);
    s.sides[1].fighters[2]!.effects=[{kind:"shield",value:300,turns:null},{kind:"atkUp",value:0.3,turns:2}];
    assert.ok(chooseSkill(toView(s)));
  });
  it("đánh giá buff/debuff theo hệ số, không triệt tiêu Công Hỏa với tự giảm Thủ", () => {
    for (const skill of ["role_nghiBinh","element_noHoaThieuThan"]) {
      const s=arena([skill]);
      const choice=chooseSkill(toView(s));
      assert.ok(choice?.type==="skill",skill);
      assert.equal(choice.skill,skill);
    }
  });
  it("chiêu bàn cờ không đọc RNG ô rơi và chọn vùng hợp lệ", () => {
    const s=arena(["element_phongHoaThieuDoanh"]);
    const first=chooseSkill(toView(s));
    assert.deepEqual(first,chooseSkill(toView({...s,boardRng:s.boardRng^0xabcdef})));
    assert.ok(first?.type==="skill" && first.cell);
    assert.ok(act(s,first).ok);
  });
});
