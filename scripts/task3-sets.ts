// Controlled3x3 existing set choices; no production item or set definition changes.
import { parseArgs } from 'node:util';
import { readFileSync,writeFileSync,appendFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { SKILLS,GEAR_SETS,ALL_COMPANIONS,buildMain,buildCompanion,autoProgress,presetLoadout,withGear,equippedItems,type SkillDef,type GearItem } from '../src/core';
import { task2Cases,type MeasuredCase } from './lib/task2-cases';
import { measured } from './lib/task2-runner';
const {values:v}=parseArgs({options:{variant:{type:'string',default:'baseline'}}});if(!['baseline','shield35'].includes(v.variant))throw Error('invalid variant');
const root='docs/reports/2026-10-22-balance-f',baseline=JSON.parse(readFileSync(`${root}/parameters-before.json`,'utf8')) as {skills:Record<string,SkillDef>};
for(const id of ['role_thuThanh','role_linhDuoc'])Object.assign(SKILLS[id]!,structuredClone(baseline.skills[id]!));if(v.variant==='shield35')Object.assign(SKILLS.role_thuThanh!,{cost:35});
const ai=JSON.parse(readFileSync('docs/reports/2026-10-22-ai-f/ai-version.json','utf8'));const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');if(hash(ai.canonicalAI)!==ai.canonicalSHA256)throw Error('AI changed');
const selected=task2Cases().filter(c=>['binhLinh','ySu','tuongSi'].includes(c.profession)&&c.element==='kim'&&c.level===30);
const cases=[];
for(const c of selected)for(const focalSet of GEAR_SETS)for(const opponentSet of GEAR_SETS){
 const items:GearItem[][]=[[],[]];
 const sides=c.matchup.sides.map((s,side)=>({...s,fighters:s.fighters.map(f=>{
  const base=f.id==='dinhBoLinh'?buildMain(autoProgress(30,null),f.element,f.profession):buildCompanion(ALL_COMPANIONS.find(x=>x.id===f.id)!,autoProgress(30,null));
  const gear=presetLoadout(f.element,f.profession,5,side===c.focalSide?focalSet.id:opponentSet.id);items[side]!.push(...equippedItems(gear,f.profession).map(g=>({...g,id:`${f.id}:${g.id}`})));return withGear(base,gear);
 })}));
 cases.push({...c,id:`sets:${c.id}:${focalSet.id}:${opponentSet.id}`,pair:`sets:${c.pair}:${focalSet.id}:${opponentSet.id}`,gearItems:items,equipment:'invested' as const,focalSet:focalSet.id,opponentSet:opponentSet.id,matchup:{...c.matchup,seed:c.matchup.seed+40000063,sides:sides as unknown as MeasuredCase['matchup']['sides']}});
}
const sourceHashes=Object.fromEntries(['src/core/ai/ai.ts','src/core/battle/skills.ts','src/core/gear/gear.ts','scripts/task3-sets.ts','scripts/lib/task2-runner.ts'].map(p=>[p,hash(p)]));
const manifest={variant:v.variant,sourceHashes,rule:'F',aiSHA:ai.canonicalSHA256,cases:cases.length,policy:'Binh linh/Y su/Tuong si, Kim, level30,1vs1/3vs3,3x3 set choices,9 same-element orange items both sides'};
const fingerprint=createHash('sha256').update(JSON.stringify(manifest)).digest('hex'),name=`sets-${v.variant}-0`,path=`${root}/${name}.jsonl`;
if(existsSync(`${root}/${name}-manifest.json`)&&JSON.parse(readFileSync(`${root}/${name}-manifest.json`,'utf8')).fingerprint!==fingerprint)throw Error('source changed');
writeFileSync(`${root}/${name}-manifest.json`,JSON.stringify({...manifest,fingerprint},null,2));writeFileSync(`${root}/${name}-cases.json.gz`,gzipSync(JSON.stringify(cases)));
const done=new Set<string>();if(existsSync(path))for(const line of readFileSync(path,'utf8').trim().split('\n').filter(Boolean))done.add(JSON.parse(line).id);
for(const c of cases){if(done.has(c.id))continue;appendFileSync(path,JSON.stringify({...measured(c,'after'),variant:v.variant,focalSet:c.focalSet,opponentSet:c.opponentSet,fingerprint})+'\n');done.add(c.id);}
console.log(`${name}: ${done.size}/${cases.length} complete`);
