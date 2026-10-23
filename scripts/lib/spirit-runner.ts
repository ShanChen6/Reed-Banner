import { comboSkillCost, chooseMove, createBattle, fighterSkill, hasEffect, inspectSkillChoices, isAlive, playAiTurn, stageById, type AiView, type BattleAction, type BattleEvent, type SkillChoice, type SpiritExperiment } from '../../src/core';
import type { AuditCase } from '../../src/core/sim/audit';
import * as before from '../fixtures/2026-10-22-ai-before';

function beforeChoices(view:AiView):SkillChoice[]{
 const me=view.sides[view.turn.side].fighters[view.turn.actor]!;
 const selected=before.chooseSkill(view);
 const rows=(me.skills??[]).map(id=>{const d=fighterSkill(me,id)!;const s=before.scoreSkill(view,d);return {id,cost:d.cost,score:s?.score??0,ratio:(s?.score??0)/Math.max(1,(d.cost+40)*me.atk*0.02),action: selected?.type==='skill'&&selected.skill===id?selected:undefined,reason:''};});
 const best=Math.max(0,...rows.map(r=>r.ratio));
 for(const r of rows)r.reason=view.turn.skillUsed?'slotUsed':hasEffect(me.effects,'silence')?'silenced':r.score<=0?'noValue':r.cost>me.energy?'energy':r.ratio<best*0.8?'saving':r.ratio<=1?'belowThreshold':r.action?'chosen':`dominated:${selected?.type==='skill'?selected.skill:'none'}`;
 return rows;
}
interface Opportunity {carriedTurns:number;actions:number;legal:number;affordable:number;suitable:number;uses:number;scoreSum:number;scoreMax:number;reasons:Record<string,number>;energyBeforeFirstOpportunity:number|null;}
export function runMeasured(c:AuditCase,ai:'before'|'after',rule:SpiritExperiment='A',cap=120,capture=false){
 const start=performance.now();
 const created=createBattle({...c.matchup,timer:false,experimentalSpirit:rule,audit:true});let state=created.state;
 const counts={turns:[0,0],hungry:[0,0],starving:[0,0],foodSum:[0,0],damage:0,absorbed:0,starvationDamage:0,heal:0,shield:0,healSpiritLost:0,shieldSpiritLost:0,overheal:0,nonStackLost:0,converted:0};
 const sources:Record<string,number>={};const skills:Record<string,Opportunity>={};const spent:Record<string,number>={};
 const trace:unknown[]=[];
 const combos={opened:0,used:0,expired:0,broken:0,byPassive:{} as Record<string,{opened:number;used:number;expired:number;broken:number}>};
 // Incremental grants are attributed FIFO when consumed; refresh keeps existing points.
 // This is measurement only. Expiration and dispel share effectEnd; no replacement loss under max stacking.
 const bins=['before25','25to33','34to43','44plus'] as const;
 const empty=()=>({heal:0,shield:0,absorbed:0,damage:0,starvationDamage:0,expiredOrDispelled:0,stranded:0,foodSum:0,turns:0});
 const phases=Object.fromEntries(bins.map(b=>[b,empty()]));
 const support:Record<string,ReturnType<typeof empty>>={};
 const shieldLedger:Record<string,{amount:number;skill:string;phase:string;profession:string}[]>={};
 const defensive:Record<string,{uses:number;heal:number;shield:number;absorbed:number;expiredOrDispelled:number;zeroImmediate:number}>={};
 const dstat=(id:string)=>defensive[id]??(defensive[id]={uses:0,heal:0,shield:0,absorbed:0,expiredOrDispelled:0,zeroImmediate:0});
 let atTurn=0,cast:string|null=null,castValue=0;
 const phase=()=>bins[Math.ceil(atTurn/2)<25?0:Math.ceil(atTurn/2)<34?1:Math.ceil(atTurn/2)<44?2:3]!;
 const finishCast=()=>{if(cast&&castValue===0)dstat(cast).zeroImmediate++;cast=null;castValue=0;};
 const drain=(key:string,amount:number,kind:'absorbed'|'expiredOrDispelled'|'stranded')=>{
  const q=shieldLedger[key]??[];
  while(amount>0&&q.length){const g=q[0]!;const n=Math.min(amount,g.amount);g.amount-=n;amount-=n;
   if(g.skill)dstat(g.skill)[kind==='stranded'?'expiredOrDispelled':kind]+=n;
   const owner=support[g.profession]??(support[g.profession]=empty());owner[kind]+=n;
   if(g.amount===0)q.shift();
  }
 };
 const food=c.matchup.sides.map(s=>s.food??60);
 const stats=(id:string)=>skills[id]??(skills[id]={carriedTurns:0,actions:0,legal:0,affordable:0,suitable:0,uses:0,scoreSum:0,scoreMax:0,reasons:{},energyBeforeFirstOpportunity:null});
 const pendingEnds=new Set<string>();
 const flushEnds=()=>{for(const key of pendingEnds){const n=(shieldLedger[key]??[]).reduce((a,g)=>a+g.amount,0);phases[phase()]!.expiredOrDispelled+=n;drain(key,n,'expiredOrDispelled');}pendingEnds.clear();};
 const events=(events:readonly BattleEvent[])=>{let beyond=false;for(const e of events){
  // A depleted shield emits effectEnd immediately BEFORE its damage event.
  if(e.type!=='damage')flushEnds();
  if(e.type==='upkeep'){finishCast();atTurn++;}
  if(e.type==='auditTurn'&&e.number>cap)beyond=true;
  if(beyond||(e.type==='combo'&&(e.turn??0)>cap))continue;
  const ph=phases[phase()]!;
  if(e.type==='swap'||e.type==='turnStart')finishCast();
  if(e.type==='skill'){finishCast();cast=e.skill;dstat(cast).uses++;}
  if(e.type==='auditTurn'){ph.turns++;ph.foodSum+=e.food;}
  if(e.type==='damage'){
   ph.damage+=e.amount;ph.absorbed+=e.absorbed;if(e.source==='starvation')ph.starvationDamage+=e.amount;
   drain(`${e.side}:${e.fighter}`,e.absorbed,'absorbed');flushEnds();
  }
  if(e.type==='sustain'){
   ph[e.kind]+=e.effective;
   const profession=c.matchup.sides[e.side].fighters[e.fighter]!.profession;
   const own=support[`${profession}:${phase()}`]??(support[`${profession}:${phase()}`]=empty());own[e.kind]+=e.effective;
   if(cast){dstat(cast)[e.kind]+=e.effective;castValue+=e.effective;}
   if(e.kind==='shield'&&e.effective>0)(shieldLedger[`${e.side}:${e.fighter}`]??=[]).push({amount:e.effective,skill:cast??'',phase:phase(),profession});
  }
  if(e.type==='effectEnd'&&e.effect==='shield'){
   pendingEnds.add(`${e.side}:${e.fighter}`);
  }
  if(e.type==='ko'){
   const key=`${e.side}:${e.fighter}`;const n=(shieldLedger[key]??[]).reduce((a,g)=>a+g.amount,0);ph.stranded+=n;drain(key,n,'stranded');
  }
  if(e.type==='combo'){combos[e.outcome]++;const p=combos.byPassive[e.passive]??(combos.byPassive[e.passive]={opened:0,used:0,expired:0,broken:0});p[e.outcome]++;}
  if(e.type==='food')food[e.side]=Math.max(0,Math.min(100,food[e.side]!+e.amount));
  if(e.type==='auditTurn'){
   food[e.side]=e.food;
   counts.turns[e.side]!++;counts.foodSum[e.side]!+=e.food;
   if(e.food>0&&e.food<30)counts.hungry[e.side]!++;if(e.food===0)counts.starving[e.side]!++;
   for(const f of e.living)for(const id of c.matchup.sides[e.side].fighters[f]?.skills??[])stats(id).carriedTurns++;
  }
  if(e.type==='damage'){counts.damage+=e.amount;counts.absorbed+=e.absorbed;sources[e.source]=(sources[e.source]??0)+e.amount;if(e.source==='starvation')counts.starvationDamage+=e.amount;}
  if(e.type==='sustain'){
   if(e.kind==='heal'){counts.heal+=e.effective;counts.healSpiritLost+=e.spiritLost;counts.overheal+=e.overflow;counts.converted+=e.converted;}
   else{counts.shield+=e.effective;counts.shieldSpiritLost+=e.spiritLost;counts.nonStackLost+=e.nonStackLost;}
  }
  if(e.type==='skill')stats(e.skill).uses++;
 }flushEnds();};
 events(created.events);
 const choose=(view:AiView):BattleAction|null=>{
  const me=view.sides[view.turn.side].fighters[view.turn.actor]!;
  const rows=ai==='before'?beforeChoices(view):inspectSkillChoices(view);
  const choice=rows.find(r=>r.reason==='chosen')?.action??null;
  const enemies=view.sides[view.turn.side===0?1:0];
  for(const r of rows){
   const s=stats(r.id);s.actions++;s.scoreSum+=r.score;s.scoreMax=Math.max(s.scoreMax,r.score);s.reasons[r.reason]=(s.reasons[r.reason]??0)+1;
   const legal=!view.turn.skillUsed&&!hasEffect(me.effects,'silence');if(legal)s.legal++;if(legal&&me.energy>=r.cost)s.affordable++;
   let suitable=r.score>0;
   if(r.id==='role_doatMenh')suitable=enemies.fighters.some(f=>isAlive(f)&&f.hp/f.maxHp<=0.35);
   if(r.id==='role_lyGian')suitable=enemies.fighters.some(f=>isAlive(f)&&!hasEffect(f.effects,'freeze')&&!hasEffect(f.effects,'silence')&&(f.skills??[]).some(id=>f.energy>=(fighterSkill(f,id)?.cost??Infinity)));
   if(legal&&me.energy>=r.cost&&suitable){s.suitable++;if(s.energyBeforeFirstOpportunity===null)s.energyBeforeFirstOpportunity=spent[`${view.turn.side}:${view.turn.actor}`]??0;}
  }
  if(choice?.type==='skill'){const key=`${view.turn.side}:${view.turn.actor}`;spent[key]=(spent[key]??0)+(fighterSkill(me,choice.skill)?comboSkillCost(me,fighterSkill(me,choice.skill)!):0);}
  if(capture)trace.push({turn:view.turn.number,side:view.turn.side,actor:view.turn.actor,spirit:me.spirit,energy:me.energy,food:view.sides.map(s=>s.food),hp:view.sides.map(s=>s.fighters.map(f=>f.hp)),choice,rows:rows.map(({id,cost,score,ratio,reason})=>({id,cost,score,ratio,reason}))});
  return choice;
 };
 let chunks=0;
 // Cap counts ordinary side turns, not extra actions. A chunk includes every extra action in that same turn.
 while(state.winner===null&&state.turn.number<=cap&&chunks<cap*2){
  const oldNumber=state.turn.number;
  const r=playAiTurn(state,c.group==='campaign'&&state.turn.side!==c.focalSide?stageById(c.stage!)!.difficulty:'normal',0,{chooseSkill:choose,chooseMove:ai==='before'?before.chooseMove:chooseMove,...(ai==='before'?{bestWhirl:before.bestWhirl}:{})});
  events(r.events);state=r.state;chunks++;
  if(capture){let atTurn=oldNumber;const observed=[];for(const e of r.events){if(e.type==='combo'&&(e.turn??0)>cap)continue;if(e.type==='upkeep')atTurn++;if(atTurn<=cap&&['combo','damage','sustain','spirit','auditTurn','ko','end','effectEnd','skill','food'].includes(e.type))observed.push({...e,atTurn});}trace.push({turn:oldNumber,events:observed});}
  if(state.turn.number===oldNumber&&state.winner===null)throw new Error('Non-advancing simulation');
 }
 finishCast();
 const shieldRemaining=Object.values(shieldLedger).flat().reduce((a,g)=>a+g.amount,0);
 const winner=state.turn.number>cap?null:state.winner;
 const capHit=winner===null;
 return {caseId:c.id,pair:c.pair,group:c.group,stage:c.stage,team:c.team,level:c.level,profession:c.profession,element:c.element,profile:c.profile,focalSide:c.focalSide,seed:c.matchup.seed,equipment:c.equipment,ai,rule,cap,winner,won:winner===null?null:winner===c.focalSide,capHit,counts,sources,skills,combos:{...combos,pending:combos.opened-combos.used-combos.expired-combos.broken},measurementVersion:2,phases,support,defensive,shieldRemaining,finalFood:food,participants:c.matchup.sides.map(s=>s.fighters.map(f=>({id:f.id,profession:f.profession,element:f.element,skillLevels:f.skillLevels,maxHp:f.maxHp,atk:f.atk,def:f.def,skills:f.skills}))),elapsedMs:performance.now()-start,...(capture?{trace}:{})};
}
