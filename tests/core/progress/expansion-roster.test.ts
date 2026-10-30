import assert from 'node:assert/strict';
import {test} from 'node:test';
import {EXPANSION_COMPANIONS,EXPANSION_SHOP_COMPANIONS,ALL_COMPANIONS,companionById,buildCompanion,autoProgress,characterSkills,chasePassives,COMBO_PASSIVES,CHASE_PASSIVES,scaleSkill,newProfile,parseProfile,parseInventory,isGearItem,loadoutOf,withGear,profileTeam,applyProfileAction,NEW_PROGRESS,mainCharacter,type CharacterProgress,type GearItem} from '../../../src/core';

test('14 new registry entries have exact base stats, slots, P1+P2+P3+P4 and no second element chase',()=>{
 assert.equal(EXPANSION_COMPANIONS.length,14);assert.equal(new Set(EXPANSION_COMPANIONS.map(f=>f.id)).size,14);
 for(const f of EXPANSION_COMPANIONS){
  assert.deepEqual(companionById(f.id),f);
  const marksman=f.profession==='xaThu';
  assert.deepEqual([f.maxHp,f.atk,f.def],marksman?[475,55,9]:[450,58,8]);
  assert.equal(f.comboPassive,marksman?'pursuit':'resonance');assert.equal(COMBO_PASSIVES[f.comboPassive!].value,.2);
  const chase=chasePassives(f);assert.equal(chase.length,3);assert.equal(chase[0],marksman?'marksmanPrepared':'assassinPrepared');
  assert.equal(chase[1],`${f.element}1`);assert.ok(chase[2]!.startsWith('rb'));chase.forEach(id=>assert.ok(CHASE_PASSIVES[id]));
  const skills=characterSkills(f.profession,f.element,f.id);assert.deepEqual(skills.map(s=>s.slot),[1,2,3,4,5,6]);
  assert.equal(skills[3]!.character,f.id);assert.equal(skills[3]!.ultimate,true);
  for(const level of [1,10,20,30]){
   const built=buildCompanion(f,autoProgress(level,null));
   assert.equal(built.maxHp,Math.round(f.maxHp*(1+.03*(level-1))));
   assert.equal(built.atk,Math.round(f.atk*(1+.03*(level-1))));
   assert.equal(built.def,Math.round(f.def*(1+.03*(level-1))));
   for(const skillLevel of [1,3,5]) for(const skill of skills) assert.ok(Number.isFinite(scaleSkill(skill,skillLevel).cost));
  }
 }
});

test('price is 1500 each, release gate prevents acquiring or deploying before acceptance',()=>{
 for(const {fighter,price} of EXPANSION_SHOP_COMPANIONS){
  assert.equal(price,1500);assert.ok(!ALL_COMPANIONS.some(f=>f.id===fighter.id));
  const p={...newProfile(),gold:100000,companions:{...newProfile().companions,[fighter.id]:NEW_PROGRESS}};
  assert.equal(profileTeam(p,[fighter.id]).length,1);
  assert.equal(applyProfileAction({...newProfile(),gold:100000},{type:'buyCompanion',character:fighter.id}).ok,false);
 }
 assert.throws(()=>mainCharacter('kim','xaThu'),/chưa hỗ trợ/);
 assert.throws(()=>mainCharacter('kim','satThu'),/chưa hỗ trợ/);
});

test('save migration is idempotent and preserves old investments and unreleased roster',()=>{
 const fresh=newProfile();const cp:CharacterProgress={...NEW_PROGRESS,level:20,xp:123,skillPoints:7,skillLevels:{o1:3,o4:2},branches:[]};
 const raw={...fresh,profession:'cungThu',gold:9876,main:cp,companions:{...fresh.companions,docAnh:cp},bag:[{id:'g7',slot:'vuKhi',profession:'cungThu',element:'kim',tier:2,set:'none'}],loadouts:{docAnh:{weapons:{cungThu:'g7'},slots:{}}},nextItemId:8};
 const before=structuredClone(raw);const p=parseProfile(raw);
 assert.deepEqual(raw,before);assert.equal(p.profession,'tuongSi');assert.equal(p.unavailableLeaderProfession,'xaThu');
 assert.equal(p.gold,9876);assert.deepEqual(p.main,cp);assert.deepEqual(p.companions.docAnh,cp);
 assert.equal(p.bag[0]!.profession,'xaThu');assert.equal(p.bag[0]!.id,'g7');assert.deepEqual(p.loadouts.docAnh!.weapons,{xaThu:'g7'});
 assert.deepEqual(parseProfile(p),p);assert.equal(p.nextItemId,8);
});

test('alias collision keeps both weapons in bag; canonical equipped key wins deterministically',()=>{
 const item=(id:string,profession:string)=>({id,profession,slot:'vuKhi',element:'kim',tier:2,set:'none'});
 const parsed=parseInventory({bag:[item('g1','cungThu'),item('g2','xaThu')],loadouts:{bachNoLang:{weapons:{cungThu:'g1',xaThu:'g2'},slots:{}}}});
 assert.equal(parsed.bag.length,2);assert.deepEqual(parsed.loadouts.bachNoLang!.weapons,{xaThu:'g2'});
 assert.equal(isGearItem({...item('x','xaThu'),profession:undefined}),false);
 const profile={...newProfile(),...parsed};const gear=loadoutOf(profile,'bachNoLang');
 const base=EXPANSION_COMPANIONS[0]!;const equipped=withGear(base,gear);assert.ok(equipped.atk>base.atk);
 const canonical:GearItem={id:'z',slot:'vuKhi',profession:'satThu',element:'kim',tier:2,set:'none'};assert.equal(isGearItem(canonical),true);
});
