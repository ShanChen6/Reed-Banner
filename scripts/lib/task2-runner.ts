import { createBattle, playAiTurn, inspectSkillChoices, chooseMove, fighterSkill, hasEffect, type BattleEvent, type AiView, type SkillChoice } from '../../src/core';
import * as old from '../fixtures/2026-10-22-ai-task2-before';
import type { MeasuredCase } from './task2-cases';
export function measured(c:MeasuredCase, revision:'before'|'after'='after',cap=120,capture=false) {
 const start=performance.now();const initial=createBattle({...c.matchup,timer:false,audit:true});let state=initial.state;
 const totals={damage:0,absorbed:0,heal:0,shield:0,healSpiritLost:0,shieldSpiritLost:0,overheal:0,nonStackLost:0,starvation:0,expired:0,stranded:0};
 const turns=[0,0],foodSum=[0,0],starving=[0,0];
 type Effect={damage:number;heal:number;shield:number;energyGain:number;energyDrain:number;absorbed:number;expired:number;stranded:number;effects:number};
 const contribution:Record<string,Effect>={};
 const effect=(id:string)=>contribution[id]??(contribution[id]={damage:0,heal:0,shield:0,energyGain:0,energyDrain:0,absorbed:0,expired:0,stranded:0,effects:0});
 const passive:Record<string,{candidates:number;triggered:number;reasons:Record<string,number>;opened:number;used:number;expired:number;broken:number;holderTurns:number;carriedTurns:number}>={};
 const pstat=(id:string)=>passive[id]??(passive[id]={candidates:0,triggered:0,reasons:{},opened:0,used:0,expired:0,broken:0,holderTurns:0,carriedTurns:0});
 const skills:Record<string,{id:string;side:number;fighter:number;carried:number;actions:number;legal:number;affordable:number;targetable:number;useful:number;executable:number;firstOpportunitySpent:number|null;scoreSum:number;scoreMax:number;uses:number;reasons:Record<string,number>}>={};
 const stat=(side:number,fighter:number,id:string)=>skills[`${side}:${fighter}:${id}`]??(skills[`${side}:${fighter}:${id}`]={id,side,fighter,carried:0,actions:0,legal:0,affordable:0,targetable:0,useful:0,executable:0,firstOpportunitySpent:null,scoreSum:0,scoreMax:0,uses:0,reasons:{}});
 const ledger:Record<string,{amount:number;source:string}[]>={};
 const ready:Record<string,string>={};const spent:Record<string,number>={};
 const trajectory:unknown[]=[];let maxDepth=0;const limits:Record<string,number>={};const decisions:unknown[]=[];const snapshots:unknown[]=[];
 const sourceStack:string[]=[];let source='environment',turn=0;const pending=new Set<string>();
 const drain=(key:string,n:number,kind:'absorbed'|'expired'|'stranded')=>{const q=ledger[key]??[];while(n>0&&q.length){const g=q[0]!,v=Math.min(n,g.amount);effect(g.source)[kind]+=v;g.amount-=v;n-=v;if(!g.amount)q.shift();}};
 const flush=()=>{for(const key of pending){const n=(ledger[key]??[]).reduce((s,g)=>s+g.amount,0);totals.expired+=n;drain(key,n,'expired');}pending.clear();};
 const events=(es:readonly BattleEvent[])=>{for(const e of es){
  if(e.type==='upkeep')turn++;
  if(turn>cap||(e.type==='combo'&&(e.turn??0)>cap))continue;
  if(e.type==='sourceAudit'){if(e.phase==='begin'){sourceStack.push(source);source='environment:rage';}else source=sourceStack.pop()??'environment';}
  if(e.type!=='damage')flush();
  if(e.type==='swap'||e.type==='turnStart'||e.type==='upkeep')source='environment';
  if(e.type==='skill'){source=`active:${e.side}:${e.fighter}:${e.skill}`;stat(e.side,e.fighter,e.skill).uses++;}
  if(e.type==='chase')maxDepth=Math.max(maxDepth,e.depth);
  if(e.type==='effect')effect(source).effects++;
  if(e.type==='chase')source=`passive:${e.side}:${e.fighter}:${e.passive}`;
  if(e.type==='chaseAudit'){
   if(e.stage==='end')source='environment';
   if(e.stage==='limit')limits[e.reason]=(limits[e.reason]??0)+1;
   if(e.stage==='candidate'&&e.passive){const p=pstat(e.passive);p.candidates++;p.reasons[e.reason]=(p.reasons[e.reason]??0)+1;if(e.reason==='triggered')p.triggered++;}
  }
  if(e.type==='combo'){
   pstat(e.passive)[e.outcome]++;
   const key=`${e.side}:${e.fighter}`;
   if(e.outcome==='opened')ready[key]=e.passive;else delete ready[key];
   if(e.outcome==='used')source=`prepared:${e.side}:${e.fighter}:${e.passive}`;
  }
  if(e.type==='auditTurn'){
   turns[e.side]!++;foodSum[e.side]!+=e.food;if(!e.food)starving[e.side]!++;
   for(const i of e.living){const f=c.matchup.sides[e.side].fighters[i]!;for(const id of f.skills??[])stat(e.side,i,id).carried++;for(const id of [f.comboPassive,...(f.chasePassives??[])])if(id)pstat(id).carriedTurns++;}
   for(const [key,id] of Object.entries(ready))if(key.startsWith(`${e.side}:`))pstat(id).holderTurns++;
  }
  if(e.type==='damage'){
   const key=`${e.side}:${e.fighter}`;drain(key,e.absorbed,'absorbed');flush();
   totals.damage+=e.amount;totals.absorbed+=e.absorbed;if(e.source==='starvation')totals.starvation+=e.amount;
   effect(['burn','reflect','starvation'].includes(e.source)?`environment:${e.source}`:source).damage+=e.amount;
  }
  if(e.type==='energy')effect(source)[e.amount>=0?'energyGain':'energyDrain']+=Math.abs(e.amount);
  if(e.type==='sustain'){
   totals[e.kind]+=e.effective;totals[e.kind==='heal'?'healSpiritLost':'shieldSpiritLost']+=e.spiritLost;
   if(e.kind==='heal')totals.overheal+=e.overflow;else totals.nonStackLost+=e.nonStackLost;
   effect(source)[e.kind]+=e.effective;
   if(e.kind==='shield'&&e.effective>0)(ledger[`${e.side}:${e.fighter}`]??=[]).push({amount:e.effective,source});
  }
  if(e.type==='effectEnd'&&e.effect==='shield')pending.add(`${e.side}:${e.fighter}`);
  if(e.type==='ko'){const key=`${e.side}:${e.fighter}`,n=(ledger[key]??[]).reduce((s,g)=>s+g.amount,0);totals.stranded+=n;drain(key,n,'stranded');}
 }flush();};
 // Read initial upkeep/audit events without constructing a second random board.
 events(initial.events);
 const choose=(view:AiView)=>{
  const me=view.sides[view.turn.side].fighters[view.turn.actor]!,key=`${view.turn.side}:${view.turn.actor}`;
  const rows:SkillChoice[]=(revision==='before'?old.inspectSkillChoices:inspectSkillChoices)(view);
  const chosen=rows.find(r=>r.reason==='chosen')?.action??null;
  const rare=rows.filter(r=>['role_lyGian','role_phanKich','role_doatMenh'].includes(r.id));
  if((capture||rare.length)&&decisions.length<80)decisions.push({turn:view.turn.number,side:view.turn.side,actor:view.turn.actor,energy:me.energy,spentBefore:spent[key]??0,food:view.sides[view.turn.side].food,rows:rows.map(r=>({id:r.id,cost:r.cost,score:r.score,ratio:r.ratio,reason:r.reason,target:r.action?.type==='skill'?r.action.target:undefined})),hp:view.sides.map(s=>s.fighters.map(f=>({hp:f.hp,energy:f.energy,effects:f.effects}))),chosen});
  for(const r of rows){const x=stat(view.turn.side,view.turn.actor,r.id);x.actions++;x.reasons[r.reason]=(x.reasons[r.reason]??0)+1;const legal=!view.turn.skillUsed&&!hasEffect(me.effects,'silence');if(legal)x.legal++;if(legal&&me.energy>=r.cost)x.affordable++;if(legal)x.targetable++;if(legal&&r.score>0)x.useful++;x.scoreSum+=r.score;x.scoreMax=Math.max(x.scoreMax,r.score);if(legal&&me.energy>=r.cost&&r.score>0){x.executable++;if(x.firstOpportunitySpent===null)x.firstOpportunitySpent=spent[key]??0;}}
  if(chosen?.type==='skill')spent[key]=(spent[key]??0)+(rows.find(r=>r.id===chosen.skill)?.cost??fighterSkill(me,chosen.skill)!.cost);
  return chosen;
 };
 while(state.winner===null&&state.turn.number<=cap){
  const number=state.turn.number;
  const result=playAiTurn(state,'normal',0,{chooseSkill:choose,chooseMove:revision==='before'?old.chooseMove:chooseMove,...(revision==='before'?{bestWhirl:old.bestWhirl}:{})});events(result.events);state=result.state;
  if(state.turn.number<=cap)trajectory.push({turn:number,food:state.sides.map(s=>s.food),hp:state.sides.map(s=>s.fighters.map(f=>f.hp)),shield:state.sides.map(s=>s.fighters.map(f=>f.effects.find(e=>e.kind==='shield')?.value??0)),damage:totals.damage,heal:totals.heal});
  if(capture)snapshots.push({turn:number,events:result.events});
  if(state.winner===null&&state.turn.number===number)throw Error('non advancing');
 }
 const remaining=Object.values(ledger).flat().reduce((s,g)=>s+g.amount,0);
 if(totals.shield!==totals.absorbed+totals.expired+totals.stranded+remaining)throw Error(`shield reconciliation ${c.id}`);
 for(const x of Object.values(skills))if(x.uses!==(x.reasons.chosen??0))throw Error(`skill accounting ${c.id}`);
 const capped=state.turn.number>cap||state.winner===null;
 return {id:c.id,pair:c.pair,block:c.block,profession:c.profession,element:c.element,level:c.level,profile:c.profile,opponentProfile:c.opponentProfile,equipment:c.equipment,mode:c.matchup.sides[0].fighters.length===1?'1v1':'3v3',seed:c.matchup.seed,focalSide:c.focalSide,revision,rule:'F',cap,turns,won:capped?null:state.winner===c.focalSide,capped,draw:false,totals,foodSum,starving,remaining,skills,passive,limits,contribution,decisions,trajectory,maxDepth,progress:snapshots.length?undefined:state.sides.map(s=>s.fighters.map(f=>f.hp)),elapsedMs:performance.now()-start,...(capture?{trace:snapshots}:{})};
}
