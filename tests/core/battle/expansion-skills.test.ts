import assert from 'node:assert/strict';
import {test} from 'node:test';
import {act,createBattle,getSkill,scaleSkill,addEffect,removeEffects,NEGATIVE_EFFECTS,CHASE_LIMITS,type BattleState,type FighterConfig,type Effect} from '../../../src/core';
import {EXPANSION_ROLE_SKILLS,EXPANSION_CHARACTER_SKILLS} from '../../../src/core/battle/expansion-skills';
const unit=(id:string,extra:Partial<FighterConfig>={}):FighterConfig=>({id,name:id,profession:'tuongSi',element:'kim',maxHp:2000,atk:100,def:20,skills:[],comboPassive:'pursuit',...extra});
function setup(skill:string, extra:Partial<FighterConfig>={}):BattleState {
 const s=createBattle({sides:[{fighters:[unit('caster',{skills:[skill],...extra}),unit('ally')],leader:0,food:60},{fighters:[unit('enemy'),unit('enemy2')],leader:0,food:60}],seed:31,timer:true,audit:true}).state;
 s.sides[0].fighters[0]!.energy=100; return s;
}
function cast(s:BattleState,skill:string){const r=act(s,{type:'skill',skill,target:0,cell:{row:2,col:2}});assert.ok(r.ok);return r;}
function end(s:BattleState){const r=act(s,{type:'timeout'},(s.turn.deadline??0)+4000);assert.ok(r.ok);return r;}

test('20 stable canonical definitions, exact L1/L5 arithmetic and fixed attributes',()=>{
 assert.equal(EXPANSION_ROLE_SKILLS.length,6);assert.equal(EXPANSION_CHARACTER_SKILLS.length,14);
 for(const def of [...EXPANSION_ROLE_SKILLS,...EXPANSION_CHARACTER_SKILLS]){
  assert.deepEqual(getSkill(def.id),def);
  for(const level of [1,3,5]){
   const scaled=scaleSkill(def,level);
   assert.equal(scaled.cost,level===5?Math.floor(def.cost*.9/5)*5:def.cost);
   scaled.steps.forEach((step,i)=>{const old=def.steps[i]!;if(step.type==='damage'&&old.type==='damage'){
    assert.equal(step.atk,Math.round(old.atk*(1+.1*(level-1))*1000)/1000);
    assert.deepEqual(step.execute,old.execute);assert.equal(step.pierce,old.pierce);
   }});
  }
 }
 assert.equal(Math.round(100*2.24*100/118),190);
 assert.equal(Math.round(100*3.29*1.3*100/120),356);
});

test('Thừa Hư refunds once only for real HP damage; fully absorbed hits never refund',()=>{
 const id='role_satThu_thuaHu';
 const s=setup(id);s.sides[1].fighters[0]!.effects.push({kind:'shield',value:1000,turns:null});
 assert.equal(cast(s,id).state.sides[0].fighters[0]!.energy,70);
 assert.equal(cast(setup(id),id).state.sides[0].fighters[0]!.energy,75);
});

test('three hits round separately, drain once, personal energy reaction once/action',()=>{
 const id='rb074_ultimate';const r=cast(setup(id,{chasePassives:['guardian','strategist','rb074_passive']}),id);
 const hits=r.events.filter(e=>e.type==='damage'&&e.side===1&&e.fighter===0&&e.source==='skill');
 assert.equal(hits.length,3);for(const hit of hits){assert.equal(hit.type==='damage'&&hit.amount,63);}
 assert.equal(r.state.sides[0].fighters[0]!.energy,4);
 assert.equal(r.events.filter(e=>e.type==='chase'&&e.passive==='rb074_passive').length,1);
 assert.ok(r.events.filter(e=>e.type==='chase').length<=CHASE_LIMITS.maxReactions);
 const low=setup(id);low.sides[1].fighters[0]!.hp=20;
 const killed=cast(low,id);assert.equal(killed.events.filter(e=>e.type==='damage'&&e.side===1).length,1);
 assert.equal(killed.state.sides[1].fighters[1]!.hp,2000);
});

test('execute evaluates HP before last hit, not at start of two-hit action',()=>{
 const id='rb072_ultimate';const s=setup(id);s.sides[1].fighters[0]!.hp=750;
 const r=cast(s,id);const hits=r.events.filter(e=>e.type==='damage'&&e.side===1);
 assert.deepEqual(hits.map(e=>e.type==='damage'?e.amount:0),[96,125]);
});

test('poison stacks distinguish instances, cap at two sources, refresh stronger and cleanse all',()=>{
 const effects:Effect[]=[];
 const poison=(fighter:number,value=12):Effect=>({kind:'poison',value,turns:2,source:{side:0,fighter}});
 assert.ok(addEffect(effects,poison(0)));assert.ok(addEffect(effects,poison(1)));
 assert.equal(addEffect(effects,poison(2)),false);effects[0]!.turns=1;
 assert.ok(addEffect(effects,poison(0,17)));assert.ok(addEffect(effects,poison(0,10)));
 assert.equal(effects[0]!.value,17);assert.equal(effects[0]!.turns,2);
 assert.deepEqual(removeEffects(effects,NEGATIVE_EFFECTS),['poison','poison']);assert.deepEqual(effects,[]);
 assert.equal(addEffect(effects,{kind:'poison',value:12,turns:2}),false);
});

test('poison snapshots ATK, survives dead source, ticks twice only at target side boundary without reactions',()=>{
 const id='rb070_ultimate';let s=cast(setup(id),id).state;
 const target=s.sides[1].fighters[0]!;assert.equal(target.effects.find(e=>e.kind==='poison')?.value,12);
 s.sides[0].fighters[0]!.hp=0;
 s=end(s).state; // target side starts: no poison tick
 assert.equal(s.turn.side,1);assert.equal(s.sides[1].fighters[0]!.effects.find(e=>e.kind==='poison')?.turns,2);
 s.sides[1].fighters[0]!.effects.push({kind:'shield',value:5,turns:null});
 const first=end(s);const ticks=first.events.filter(e=>e.type==='damage'&&e.source==='poison');
 assert.equal(ticks.length,1);assert.ok(ticks[0]?.type==='damage');assert.equal(ticks[0].amount,7);assert.equal(ticks[0].absorbed,5);
 assert.equal(first.events.filter(e=>e.type==='chase').length,0);
 s=end(first.state).state;const second=end(s);
 assert.equal(second.events.filter(e=>e.type==='damage'&&e.source==='poison').length,1);
 assert.equal(second.state.sides[1].fighters[0]!.effects.some(e=>e.kind==='poison'),false);
});

test('shield counter uses actual attacker and ignores missing provenance',()=>{
 const id='role_tramKich';const s=setup(id);s.sides[1].fighters[1]={...s.sides[1].fighters[1]!,chasePassives:['guardian','strategist','rb066_kienThu']};
 s.sides[1].fighters[0]!.effects.push({kind:'shield',value:100,turns:null});
 const r=cast(s,id);const counter=r.events.find(e=>e.type==='chase'&&e.passive==='rb066_kienThu');
 assert.ok(counter&&counter.type==='chase');assert.deepEqual(counter.target,{side:0,fighter:0});
});

test('every new active executes at skill 1/3/5 in solo and teams without duplicating board effects',()=>{
 for(const def of [...EXPANSION_ROLE_SKILLS,...EXPANSION_CHARACTER_SKILLS])for(const level of [1,3,5])for(const size of [1,3]){
  const make=(side:string)=>Array.from({length:size},(_,i)=>unit(`${side}${i}`,side==='p'&&i===0?{skills:[def.id],skillLevels:{[def.id]:level}}:{}));
  const s=createBattle({sides:[{fighters:make('p'),leader:0},{fighters:make('q'),leader:0}],seed:31,timer:false}).state;
  s.sides[0].fighters[0]!.energy=100;
  const r=act(s,{type:'skill',skill:def.id,target:0,cell:{row:2,col:2}});assert.ok(r.ok,`${def.id}:L${level}:${size}`);
  const boardSteps=def.steps.filter(s=>s.type==='destroy'||s.type==='transform'||s.type==='whirl').length;
  assert.ok(r.events.filter(e=>e.type==='board').length<=boardSteps,`${def.id} board duplicated by AoE`);
  for(const side of r.state.sides)for(const f of side.fighters)assert.ok(f.energy>=0&&f.energy<=100);
 }
});

test('mixed recipient support uses each teammate HP and spirit exactly once',()=>{
 const id='rb_tlx_lucTienTroiDuong';const s=setup(id);
 s.sides[0].fighters[0]!.hp=1000;s.sides[0].fighters[0]!.spirit=0;
 s.sides[0].fighters[1]={...s.sides[0].fighters[1]!,maxHp:1000,hp:500};
 const r=cast(s,id);assert.equal(r.state.sides[0].fighters[0]!.hp,1024);assert.equal(r.state.sides[0].fighters[1]!.hp,560);
});
