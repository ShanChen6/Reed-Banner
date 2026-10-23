import assert from 'node:assert/strict';
import { it } from 'node:test';
import { act,createBattle,characterSkills,inspectSkillChoices,toView,type FighterConfig } from '../../../src/core';
function arena(skill:string,level:number,energy:number){
 const unit=(id:string):FighterConfig=>({id,name:id,profession:'binhLinh',element:'tho',maxHp:1000,atk:100,def:0,skills:[skill],skillLevels:{[skill]:level}});
 const state=createBattle({sides:[{fighters:[unit('a'),unit('b'),unit('c')],leader:0},{fighters:[unit('x'),unit('y'),unit('z')],leader:0}],seed:31,timer:false}).state;
 state.sides[0].fighters[0]!.energy=energy;state.sides[0].fighters[0]!.spirit=0;return state;
}
it('giá Thủ thành đồng bộ builder/AI/engine ở hai mốc nâng, giữ nguyên Khiên tại sàn F',()=>{
 for(const [level,cost,shield] of [[1,35,40],[5,30,56]]){
  const s=arena('role_thuThanh',level!,cost!-1),row=inspectSkillChoices(toView(s))[0]!;
  assert.equal(row.cost,cost);assert.equal(row.reason,'energy');
  assert.deepEqual(act(s,{type:'skill',skill:'role_thuThanh'}),{ok:false,error:'notEnoughEnergy'});
  assert.equal(s.sides[0].fighters[0]!.energy,cost!-1);
  s.sides[0].fighters[0]!.energy=cost!;
  const r=act(s,{type:'skill',skill:'role_thuThanh'});assert.ok(r.ok);
  assert.equal(r.state.sides[0].fighters[0]!.energy,0);
  assert.equal(r.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='shield')?.value,shield);
  assert.equal(r.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='taunt')?.turns,2);
 }
 const rendered=characterSkills('binhLinh','tho').find(d=>d.id==='role_thuThanh')!;
 assert.equal(rendered.cost,inspectSkillChoices(toView(arena('role_thuThanh',1,100)))[0]!.cost);
});
it('preset NPC legacy giữ giá cũ, thay đổi giá chỉ ở định nghĩa nghề mới',()=>{
 for(const [level,cost] of [[1,30],[5,25]]){
  const s=arena('thuThanh',level!,cost!);
  assert.equal(inspectSkillChoices(toView(s))[0]!.cost,cost);
  const r=act(s,{type:'skill',skill:'thuThanh'});assert.ok(r.ok);assert.equal(r.state.sides[0].fighters[0]!.energy,0);
  const owned=arena('role_thuThanh',level!,cost!);
  assert.deepEqual(act(owned,{type:'skill',skill:'role_thuThanh'}),{ok:false,error:'notEnoughEnergy'});
 }
});
