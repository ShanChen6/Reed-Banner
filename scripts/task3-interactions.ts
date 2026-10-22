import { parseArgs } from 'node:util';
import { writeFileSync,readFileSync,appendFileSync,mkdirSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { SKILLS, ALL_COMPANIONS, PROFESSIONS, ELEMENTS, buildMain,buildCompanion,autoProgress,withGear,gearStats,presetLoadout,equippedItems,GEAR_SETS,GEAR_SLOTS,type GearItem,type SkillDef } from '../src/core';
import { task2Cases,equipment,type MeasuredCase } from './lib/task2-cases';
import { measured } from './lib/task2-runner';
const {values:v}=parseArgs({options:{group:{type:'string',default:'identity'},variant:{type:'string',default:'baseline'}}});
if(!['identity','gear'].includes(v.group)||!['baseline','shield35'].includes(v.variant))throw Error('invalid option');
const out='docs/reports/2026-10-22-balance-f';mkdirSync(out,{recursive:true});
const before=JSON.parse(readFileSync(`${out}/parameters-before.json`,'utf8')) as {skills:Record<string,SkillDef>};
for(const id of ['role_linhDuoc','role_thuThanh'])Object.assign(SKILLS[id]!,structuredClone(before.skills[id]!));
if(v.variant==='shield35')Object.assign(SKILLS.role_thuThanh!,{cost:35});
const ai=JSON.parse(readFileSync('docs/reports/2026-10-22-ai-f/ai-version.json','utf8'));
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');if(hash(ai.canonicalAI)!==ai.canonicalSHA256)throw Error('AI changed');
type Case=MeasuredCase&{identity?:string;gearChannel?:string};
const original=task2Cases();const cases:Case[]=[];
if(v.group==='identity')for(const profession of ['binhLinh','ySu'] as const){
 const element=ELEMENTS.find(e=>ALL_COMPANIONS.filter(f=>f.profession===profession&&f.element===e).length>=2)!;
 if(!element)throw Error('missing identity cohort');
 const pool=ALL_COMPANIONS.filter(f=>f.profession===profession&&f.element===element).slice(0,2);
 for(const mode of [1,3])for(const focalSide of [0,1] as const){
  const c=original.find(c=>c.profession===profession&&c.element===element&&c.level===20&&c.focalSide===focalSide&&c.matchup.sides[0].fighters.length===mode)!;
  for(const base of [buildMain(autoProgress(20,null),element,profession),...pool.map(f=>buildCompanion(f,autoProgress(20,null)))]){
   const next=structuredClone(c);const gearItems:GearItem[][]=[[],[]];
   const sides=next.matchup.sides.map((s,side)=>({...s,fighters:s.fighters.map((f,i)=>{
    const raw=side===focalSide&&i===0?base:f.id==='dinhBoLinh'?buildMain(autoProgress(20,null),f.element,f.profession):buildCompanion(ALL_COMPANIONS.find(x=>x.id===f.id)!,autoProgress(20,null));
    const gear=equipment(raw,20,'ordinary');gearItems[side]!.push(...equippedItems(gear,raw.profession));return withGear(raw,gear);
   })}));
   cases.push({...next,id:`identity:${next.id}:${base.id}`,pair:`identity:${next.pair}:${base.id}`,identity:base.id,gearItems,equipment:'ordinary',matchup:{...next.matchup,seed:next.matchup.seed+20000033,sides:sides as unknown as MeasuredCase['matchup']['sides']}});
  }
 }
}
if(v.group==='gear')for(const profession of PROFESSIONS)for(const mode of [1,3])for(const focalSide of [0,1] as const){
 const c=original.find(c=>c.profession===profession&&c.element==='kim'&&c.level===30&&c.focalSide===focalSide&&c.matchup.sides[0].fighters.length===mode)!;
 for(const channel of ['flat','set','resonance','full']){
  const next=structuredClone(c);const gearItems:GearItem[][]=[[],[]];
  const sides=next.matchup.sides.map((s,side)=>({...s,fighters:s.fighters.map(f=>{
   const base=f.id==='dinhBoLinh'?buildMain(autoProgress(30,null),f.element,f.profession):buildCompanion(ALL_COMPANIONS.find(x=>x.id===f.id)!,autoProgress(30,null));
   const loadout=equipment(base,30,'invested'),g=gearStats(loadout,f.element,f.profession);gearItems[side]!.push(...equippedItems(loadout,base.profession));
   const percent={atk:0,maxHp:0,def:0};for(const b of g.bonuses)if(channel==='full'||channel===b.kind)for(const stat of ['atk','maxHp','def'] as const)percent[stat]+=b.bonus[stat]??0;
   return {...base,...Object.fromEntries((['atk','maxHp','def'] as const).map(stat=>[stat,Math.round((base[stat]+g.flat[stat])*(1+percent[stat]))]))};
  })}));
  cases.push({...next,id:`gear:${next.id}:${channel}`,pair:`gear:${next.pair}:${channel}`,gearChannel:channel,gearItems,equipment:'invested',matchup:{...next.matchup,seed:next.matchup.seed+30000041,sides:sides as unknown as MeasuredCase['matchup']['sides']}});
 }
}
const sourceHashes=Object.fromEntries(['src/core/ai/ai.ts','src/core/battle/skills.ts','src/core/gear/gear.ts','scripts/task3-interactions.ts','scripts/lib/task2-runner.ts'].map(p=>[p,hash(p)]));
const manifest={group:v.group,variant:v.variant,rule:'F',aiSHA:ai.canonicalSHA256,sourceHashes,n:cases.length,kind:v.group==='gear'?'counterfactual attribution of existing flat/set/resonance, not production gear modes':'same profession/element, different character ultimate, ordinary focal gear; supports and foe held fixed'};
const fingerprint=createHash('sha256').update(JSON.stringify(manifest)).digest('hex'),name=`${v.group}-${v.variant}-0`;
if(existsSync(`${out}/${name}-manifest.json`)&&JSON.parse(readFileSync(`${out}/${name}-manifest.json`,'utf8')).fingerprint!==fingerprint)throw Error('source changed');
writeFileSync(`${out}/${name}-manifest.json`,JSON.stringify({...manifest,fingerprint},null,2));writeFileSync(`${out}/${name}-cases.json.gz`,gzipSync(JSON.stringify(cases)));
const path=`${out}/${name}.jsonl`,done=new Set<string>();if(existsSync(path))for(const line of readFileSync(path,'utf8').trim().split('\n').filter(Boolean))done.add(JSON.parse(line).id);
for(const c of cases){if(done.has(c.id))continue;appendFileSync(path,JSON.stringify({...measured(c,'after'),variant:v.variant,identity:c.identity,gearChannel:c.gearChannel,fingerprint})+'\n');done.add(c.id);}
// Pure formula stress check: level30 only, legal slots/professions; not an acquisition cohort.
if(v.group==='gear'){
 const rows=[];
 for(const profession of PROFESSIONS)for(const element of ELEMENTS)for(const tier of [1,2,3,4,5] as const)for(const count of [3,6,9])for(const set of GEAR_SETS){
  const f=buildMain(autoProgress(30,null),element,profession),all=presetLoadout(element,profession,tier,set.id);
  const selected=new Set<string>(GEAR_SLOTS.slice(0,count));
  const gear={weapons:all.weapons,slots:Object.fromEntries(Object.entries(all.slots).filter(([slot])=>selected.has(slot)))};
  const g=gearStats(gear,element,profession),full=withGear(f,gear);
  rows.push({profession,element,tier,count,set:set.id,base:{atk:f.atk,maxHp:f.maxHp,def:f.def},flat:g.flat,percent:g.percent,bonuses:g.bonuses,full:{atk:full.atk,maxHp:full.maxHp,def:full.def}});
 }
 writeFileSync(`${out}/gear-formulas.json`,JSON.stringify(rows,null,2));
}
console.log(`${name}: ${done.size}/${cases.length} complete`);
