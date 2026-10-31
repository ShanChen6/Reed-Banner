import assert from 'node:assert/strict';
import { it } from 'node:test';
import { act, createBattle, getSkill, scoreSkill, toView, type FighterConfig } from '../../../src/core';
import { scoreSkill as beforeScore } from '../../../scripts/fixtures/2026-10-22-ai-task2-before';
import { task2Cases, LEVELS, GEARS } from '../../../scripts/lib/task2-cases';
import { measured } from '../../../scripts/lib/task2-runner';
const unit=(id:string,extra:Partial<FighterConfig>={}):FighterConfig=>({id,name:id,profession:'ySu',element:'thuy',maxHp:1000,atk:100,def:0,skills:[],...extra});
it('AI: self-heal đầy máu không nhận điểm phối hợp từ đồng đội bị thương',()=>{
 const s=createBattle({sides:[{fighters:[unit('caster',{skills:['element_thanhLuuTayTran']}),unit('ally',{comboPassive:'coordination',chasePassives:['commander','tho1','thuy2']})],leader:0},{fighters:[unit('enemy')],leader:0}],seed:31,timer:false}).state;
 s.sides[0].fighters[0]!.energy=100;s.sides[0].fighters[0]!.effects=[{kind:'atkDown',value:.1,turns:2}];s.sides[0].fighters[1]!.hp=100;
 const def=getSkill('element_thanhLuuTayTran')!;
 assert.equal(scoreSkill(toView(s),def)!.score,100);
 assert.ok(beforeScore(toView(s),def)!.score>100);
 const r=act(s,{type:'skill',skill:def.id});assert.ok(r.ok);assert.ok(!r.events.some(e=>e.type==='combo'||e.type==='chase'));
 // A genuinely wounded recipient still opens the real healing opportunity.
 s.sides[0].fighters[0]!.hp=500;
 assert.ok(scoreSkill(toView(s),def)!.score>100);
 const a=act(s,{type:'skill',skill:def.id});assert.ok(a.ok);assert.ok(a.events.some(e=>e.type==='combo'&&e.outcome==='opened'));
});
it('kịch bản:56 nghề/hệ, hai mode, cấp trước/sau mốc,3 mức đồ, đảo bên giữ cùng config/seed',()=>{
 const cs=task2Cases();assert.equal(cs.length,2240);
 assert.equal(new Set(cs.map(c=>c.profession+':'+c.element)).size,56);
 assert.deepEqual(new Set(cs.map(c=>c.level)),new Set(LEVELS));assert.deepEqual(new Set(cs.map(c=>c.equipment)),new Set(GEARS));
 const roster=new Set<string>();
 for(let i=0;i<cs.length;i+=2){const a=cs[i]!,b=cs[i+1]!;assert.equal(a.matchup.sides[a.focalSide].fighters[0]!.id,'dinhBoLinh');assert.equal(a.matchup.seed,b.matchup.seed);assert.deepEqual(a.matchup.sides[0],b.matchup.sides[1]);a.matchup.sides.flatMap(s=>s.fighters).forEach(f=>roster.add(f.id));if(a.level<10)assert.ok(a.gearItems.flat().every(g=>g.tier<=2));}
 assert.equal(roster.size,61);
});
it('telemetry F: attribution và Khiên bảo toàn, ứng viên kích hoạt khớp số reaction',()=>{
 const c=task2Cases().find(c=>c.level===20&&c.matchup.sides[0].fighters.length===3)!;
 const r=measured(c,'after',20,true);
 assert.equal(r.totals.shield,r.totals.absorbed+r.totals.expired+r.totals.stranded+r.remaining);
 assert.equal(Object.values(r.contribution).reduce((s,c)=>s+c.heal,0),r.totals.heal);
 assert.equal(Object.values(r.contribution).reduce((s,c)=>s+c.damage,0),r.totals.damage);
 const count=r.trace!.flatMap(t=>(t as {events:readonly {type:string}[]}).events).filter(e=>e.type==='chase').length;
 assert.equal(Object.values(r.passive).reduce((s,p)=>s+p.triggered,0),count);
});
it('audit Nộ có biên nguồn riêng và không đổi tác dụng khi tắt audit',()=>{
 const make=(audit:boolean)=>{const s=createBattle({sides:[{fighters:[unit('caster',{skills:['role_tramKich']})],leader:0},{fighters:[unit('enemy',{element:'tho'})],leader:0}],seed:31,timer:false,audit}).state;s.sides[0].fighters[0]!.energy=100;s.sides[1].rage=99;return s;};
 const a=act(make(true),{type:'skill',skill:'role_tramKich',target:0}),b=act(make(false),{type:'skill',skill:'role_tramKich',target:0});assert.ok(a.ok&&b.ok);
 assert.deepEqual(a.state.sides,b.state.sides);assert.equal(a.state.boardRng,b.state.boardRng);
 const begin=a.events.findIndex(e=>e.type==='sourceAudit'&&e.phase==='begin'),end=a.events.findIndex(e=>e.type==='sourceAudit'&&e.phase==='end');assert.ok(begin>=0&&end>begin);
 assert.ok(a.events.slice(begin,end).some(e=>e.type==='sustain'&&e.kind==='shield'));
 assert.ok(!b.events.some(e=>e.type==='sourceAudit'));
});
it('harness cap chỉ ghi lượt đã chơi, không coi lượt kế tiếp là kết thúc thật',()=>{
 const r=measured(task2Cases()[0]!,'after',2);
 assert.deepEqual(r.turns,[1,1]);assert.equal(r.capped,true);assert.equal(r.won,null);
 assert.ok(r.trajectory.every(t=>(t as {turn:number}).turn<=2));
});
