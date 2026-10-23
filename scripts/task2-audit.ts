import { parseArgs } from 'node:util';
import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { task2Cases } from './lib/task2-cases';
import { measured } from './lib/task2-runner';
const {values:v}=parseArgs({options:{group:{type:'string',default:'pilot'},out:{type:'string',default:'docs/reports/2026-10-22-ai-f'},revision:{type:'string',default:'after'},shard:{type:'string',default:'0'},shards:{type:'string',default:'1'},ids:{type:'string'},trace:{type:'string'}}});
if(!['pilot','screen','expanded','diagnostic'].includes(v.group)||!['before','after'].includes(v.revision))throw Error('invalid group/revision');
const shard=Number(v.shard),shards=Number(v.shards);if(!Number.isSafeInteger(shard)||!Number.isSafeInteger(shards)||shards<1||shard<0||shard>=shards)throw Error('invalid shard');
const all=task2Cases();let cases=all;
if(v.group==='pilot'){
 const seen=new Set<string>();const pairs=new Set<string>();
 for(const c of all){const key=`${c.profession}:${c.matchup.sides[0].fighters.length}:${c.equipment}`;if(!seen.has(key)){seen.add(key);pairs.add(c.pair);}}
 cases=all.filter(c=>pairs.has(c.pair));
}
if(v.group==='diagnostic')cases=all.filter(c=>c.element==='kim'&&[15,20,30].includes(c.level));
if(v.group==='expanded'){
 if(!v.ids)throw Error('expanded requires --ids JSON pair IDs');
 const ids=new Set<string>(JSON.parse(readFileSync(v.ids,'utf8')));
 cases=all.filter(c=>ids.has(c.pair)).flatMap(c=>[3119,4567].map(seed=>({...c,id:`${c.id}:expand${seed}`,pair:`${c.pair}:expand${seed}`,matchup:{...c.matchup,seed:(c.matchup.seed+seed)>>>0}})));
}
if(v.trace)cases=all.filter(c=>c.id===v.trace);
const files=execFileSync('git',['ls-files','src','scripts/lib','scripts/fixtures/2026-10-22-ai-task2-before.ts','scripts/task2-audit.ts'],{encoding:'utf8'}).trim().split('\n');
// Include newly added measurement files before they are committed.
for(const f of ['scripts/lib/task2-cases.ts','scripts/lib/task2-runner.ts','scripts/fixtures/2026-10-22-ai-task2-before.ts','scripts/task2-audit.ts'])if(!files.includes(f))files.push(f);
const hashes=Object.fromEntries(files.sort().map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const sourceHash=createHash('sha256').update(JSON.stringify(hashes)).digest('hex');
mkdirSync(v.out,{recursive:true});
const name=`${v.group}-${v.revision}${v.trace?'-trace':''}-${shard}`;
const manifest={sourceHash,hashes,revision:v.revision,group:v.group,rule:'F',cap:120,difficulty:'normal',levelPolicy:'autoProgress(level,null), stable slot round-robin lowest level first',cases:cases.length,shard,shards,seedPolicy:'paired sides share board seed, decisions may diverge; clusters use scenario+seed',gearPolicy:'see task2-cases.ts; investment scenarios, not population estimates',node:process.version,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()};
const manifestPath=`${v.out}/${name}-manifest.json`;
if(existsSync(manifestPath)&&JSON.parse(readFileSync(manifestPath,'utf8')).sourceHash!==sourceHash)throw Error('source changed; use a new output directory');
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
writeFileSync(`${v.out}/${name}-cases.json.gz`,gzipSync(JSON.stringify(cases)));
const path=`${v.out}/${name}.jsonl`,done=new Set<string>();
if(existsSync(path))for(const line of readFileSync(path,'utf8').trim().split('\n').filter(Boolean))done.add(JSON.parse(line).id);
const selected=cases.filter((_,i)=>i%shards===shard);
for(const c of selected){if(done.has(c.id))continue;const result=measured(c,v.revision as 'before'|'after',120,Boolean(v.trace));appendFileSync(path,JSON.stringify({...result,sourceHash})+'\n');if(done.size%10===0)process.stderr.write(`${name}: ${done.size}/${selected.length}\n`);done.add(c.id);}
console.log(`${name}: ${done.size}/${selected.length} complete`);
