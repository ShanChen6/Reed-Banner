import { writeFileSync } from 'node:fs';
import { act,createBattle,getSkill,scoreSkill,toView,type FighterConfig } from '../src/core';
import { scoreSkill as before } from './fixtures/2026-10-22-ai-task2-before';
const unit=(id:string,extra:Partial<FighterConfig>={}):FighterConfig=>({id,name:id,profession:'ySu',element:'thuy',maxHp:1000,atk:100,def:0,skills:[],...extra});
const state=createBattle({sides:[{fighters:[unit('caster',{skills:['element_thanhLuuTayTran']}),unit('ally',{comboPassive:'coordination',chasePassives:['commander','tho1','thuy2']})],leader:0},{fighters:[unit('enemy')],leader:0}],seed:31,timer:false,audit:true}).state;
state.sides[0].fighters[0]!.energy=100;state.sides[0].fighters[0]!.effects=[{kind:'atkDown',value:.1,turns:2}];state.sides[0].fighters[1]!.hp=100;
const def=getSkill('element_thanhLuuTayTran')!;
writeFileSync('docs/reports/2026-10-22-ai-f/ai-bug-repro.json',JSON.stringify({state,action:{type:'skill',skill:def.id},before:before(toView(state),def),after:scoreSkill(toView(state),def),engine:act(state,{type:'skill',skill:def.id})},null,2)+'\n');
