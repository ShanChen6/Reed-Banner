// Follow-up runner. Historical short screening cases are reused by the analysis script.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { parseArgs } from 'node:util';
import { screeningCases,spiritCases,campaignAuditCases,pressureCases } from '../src/core/sim/audit';
import { runMeasured } from './lib/spirit-runner';
import type { SpiritExperiment } from '../src/core';
const {values:v}=parseArgs({options:{group:{type:'string',default:'pilot'},rule:{type:'string',default:'F'},shard:{type:'string',default:'0'},shards:{type:'string',default:'1'},trace:{type:'string'}}});
if(!['A','D','E','F'].includes(v.rule))throw new Error('invalid rule');
const shard=Number(v.shard),shards=Number(v.shards);
if(!Number.isInteger(shard)||!Number.isInteger(shards)||shard<0||shards<1||shard>=shards)throw new Error('invalid shard');
const historical=gunzipSync(readFileSync('docs/reports/2026-10-22-spirit/screen-after.jsonl.gz')).toString().trim().split('\n').map(l=>JSON.parse(l));
const long=new Set(historical.filter(r=>Math.max(...r.counts.turns)>=25).map(r=>r.caseId));
const cases=v.group==='screen'?screeningCases().filter(c=>long.has(c.id)):v.group==='spirit'?spiritCases():v.group==='focused'?spiritCases([3119,4567,6079,7919]).filter(c=>c.profile==='defense'):v.group==='pressure'?pressureCases():v.group==='campaign'?campaignAuditCases():v.group==='campaign-gear'?campaignAuditCases(undefined,'white3'):v.group==='pilot'?pressureCases().filter(c=>c.level===20).slice(0,8):[];
const selected=cases.filter((c,i)=>v.trace?c.id===v.trace:i%shards===shard);
if(!selected.length)throw new Error('no cases');
for(const c of selected)console.log(JSON.stringify(runMeasured(c,'after',v.rule as SpiritExperiment,120,Boolean(v.trace))));
