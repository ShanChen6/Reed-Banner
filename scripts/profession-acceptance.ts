/** Reproducible PROF-06 evidence. --quick is a smoke cohort, never release acceptance. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {EXPANSION_COMPANIONS,ALL_COMPANIONS,buildCompanion,autoProgress,withGear,presetLoadout,createBattle,playAiTurn,CHASE_LIMITS,type FighterConfig} from '../src/core';
const quick=process.argv.includes('--quick');
const rows:unknown[]=[];
const levels=quick?[20]:[1,10,20,30];
const skillLevels=quick?[3]:[1,3,5];
const gearTiers=quick?[0]:[0,3];
const seeds=quick?[31]:[31,73];
const make=(f:FighterConfig,level:number,skillLevel:number,gear:number)=>{
 const built=buildCompanion(f,autoProgress(level,null));
 const leveled={...built,skillLevels:Object.fromEntries((built.skills??[]).map(id=>[id,skillLevel]))};
 return gear?withGear(leveled,presetLoadout(f.element,f.profession,3,null)):leveled;
};
const select=(profession:string,element?:string)=>ALL_COMPANIONS.find(f=>f.profession===profession&&(!element||f.element===element))!;
const oldRoles=['tuongSi','binhLinh','ySu','phapSu','muuSi','quanSu'];
for(const [index,hero] of EXPANSION_COMPANIONS.entries()) for(const level of levels)for(const skillLevel of skillLevels)for(const gear of gearTiers)for(const mode of [1,3]){
 const foeRole=oldRoles[index%oldRoles.length]!;
 const focal=[make(hero,level,skillLevel,gear)];
 const opponent=[make(select(foeRole,hero.element)??select(foeRole),level,skillLevel,gear)];
 if(mode===3){
  focal.push(make(select('quanSu'),level,skillLevel,gear),make(select('muuSi'),level,skillLevel,gear));
  opponent.push(make(select('ySu'),level,skillLevel,gear),make(select('binhLinh'),level,skillLevel,gear));
 }
 const wins:number[]=[];const durations:number[]=[];let censored=0,maxReactions=0,maxDepth=0,poisonDamage=0,energyGain=0,energyDrain=0;
 const contributions:Record<string,number>={};let games=0;
 for(const seed of seeds)for(const focalSide of [0,1] as const)for(const firstSide of [0,1] as const){
  const configs=[{fighters:focal,leader:0},{fighters:opponent,leader:0}] as const;
  const sides=focalSide===0?[configs[0],configs[1]] as const:[configs[1],configs[0]] as const;
  let state=createBattle({sides,seed,firstSide,timer:false,audit:true}).state;
  let actions=0;
  while(state.winner===null&&state.turn.number<=160&&actions<1000){
   const result=playAiTurn(state,'normal');const counts=new Map<number,number>();
   for(const e of result.events){
    if(e.type==='chase'){
     counts.set(e.action,(counts.get(e.action)??0)+1);maxDepth=Math.max(maxDepth,e.depth);
     contributions[e.passive]=(contributions[e.passive]??0)+1;
    }
    if(e.type==='combo'&&e.outcome==='used')contributions[`P1:${e.passive}`]=(contributions[`P1:${e.passive}`]??0)+1;
    if(e.type==='damage'&&e.source==='poison')poisonDamage+=e.amount;
    if(e.type==='energy'){if(e.amount>0)energyGain+=e.amount;else energyDrain-=e.amount;}
   }
   maxReactions=Math.max(maxReactions,...counts.values());
   if(maxReactions>CHASE_LIMITS.maxReactions||maxDepth>CHASE_LIMITS.maxDepth)throw new Error('Reaction guard violated');
   if(result.state.sides.some(s=>s.fighters.some(f=>f.energy<0||f.energy>100)))throw new Error('Energy out of bounds');
   state=result.state;actions++;
  }
  games++;durations.push(state.turn.number);
  if(state.winner===null)censored++;else wins.push(state.winner===focalSide?1:0);
 }
 const n=wins.length;const p=n?wins.reduce((a,b)=>a+b,0)/n:0;const z=1.96;const denom=1+z*z/Math.max(1,n);const center=(p+z*z/(2*Math.max(1,n)))/denom;const half=z*Math.sqrt(p*(1-p)/Math.max(1,n)+z*z/(4*Math.max(1,n*n)))/denom;
 rows.push({hero:hero.id,profession:hero.profession,foeRole,level,skillLevel,gear,mode,games,completed:n,censored,winRate:n?p:null,ci95:n?[center-half,center+half]:null,meanTurns:durations.reduce((a,b)=>a+b,0)/games,stats:focal.map(f=>({id:f.id,hp:f.maxHp,atk:f.atk,def:f.def})),maxReactions,maxDepth,poisonDamage,energyGain,energyDrain,contributions});
 process.stdout.write(`${hero.id} L${level} S${skillLevel} G${gear} ${mode}v${mode}: ${games} games, ${censored} censored\n`);
}
mkdirSync('docs/reports/professions-2026-10-30',{recursive:true});
writeFileSync(`docs/reports/professions-2026-10-30/${quick?'smoke':'matrix'}.json`,JSON.stringify({cohort:quick?'smoke-only':'matrix',releaseAccepted:false,limits:{turns:160,actions:1000},seeds,rows},null,2)+'\n');
