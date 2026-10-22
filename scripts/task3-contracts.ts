import { readFileSync,writeFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SKILLS,CHASE_PASSIVES,BASE_STATS,GEAR_SETS,ELEMENT_RESONANCE,STAT_BASE,TIER_INFO,ROLE_SKILLS,ELEMENT_SKILLS,CHARACTER_SKILLS,DBL_ULTIMATES,scaleSkill,DEFAULT_SPIRIT_EXPERIMENT } from '../src/core';
const root='docs/reports/2026-10-22-balance-f';
const before=JSON.parse(readFileSync(`${root}/parameters-before.json`,'utf8'));
const after=JSON.parse(JSON.stringify({skills:SKILLS,chase:CHASE_PASSIVES,baseStats:BASE_STATS,sets:GEAR_SETS,resonance:ELEMENT_RESONANCE,flat:STAT_BASE,tiers:TIER_INFO}));
const changes:{path:string;before:unknown;after:unknown}[]=[];
function walk(a:unknown,b:unknown,path:string){
 if(JSON.stringify(a)===JSON.stringify(b))return;
 if(a&&b&&typeof a==='object'&&typeof b==='object'){
  const left=a as Record<string,unknown>,right=b as Record<string,unknown>;
  for(const key of new Set([...Object.keys(left),...Object.keys(right)]))walk(left[key],right[key],path?`${path}.${key}`:key);
 }else changes.push({path,before:a,after:b});
}
walk(before,after,'');
if(existsSync(`${root}/decision.json`)){
 const decision=JSON.parse(readFileSync(`${root}/decision.json`,'utf8'));
 const expected=decision.adopt?[{path:'skills.role_thuThanh.cost',before:30,after:35}]:[];
 if(JSON.stringify(changes)!==JSON.stringify(expected))throw Error('Unexpected parameter diff');
}
const ai=JSON.parse(readFileSync('docs/reports/2026-10-22-ai-f/ai-version.json','utf8'));
if(createHash('sha256').update(readFileSync(ai.canonicalAI)).digest('hex')!==ai.canonicalSHA256||DEFAULT_SPIRIT_EXPERIMENT!=='F')throw Error('AI/F changed');
writeFileSync(`${root}/parameters-after.json`,JSON.stringify(after,null,2)+'\n');
writeFileSync(`${root}/parameter-diff.json`,JSON.stringify(changes,null,2)+'\n');
const contract=(d:ReturnType<typeof scaleSkill>)=>JSON.stringify({cost:d.cost,steps:d.steps});
const gaps=[...ROLE_SKILLS,...ELEMENT_SKILLS,...CHARACTER_SKILLS,...DBL_ULTIMATES].filter(d=>[2,3,4].every(level=>contract(scaleSkill(d,level))===contract(scaleSkill(d,1)))).map(d=>({id:d.id,name:d.name,costByLevel:[1,2,3,4,5].map(level=>scaleSkill(d,level).cost),unchangedMidLevels:[2,3,4],source:'existing upgrade rules; design proposal only, not changed'}));
writeFileSync(`${root}/utility-upgrade-gaps.json`,JSON.stringify(gaps,null,2)+'\n');
console.log(JSON.stringify({changes,utilityGaps:gaps.map(d=>d.id),aiUnchanged:true,spirit:'F'}));
