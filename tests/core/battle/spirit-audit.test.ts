import assert from 'node:assert/strict';
import { it } from 'node:test';
import { act, createBattle, parseBoard, type FighterConfig } from '../../../src/core';
const fighter=(id:string):FighterConfig=>({id,name:id,profession:'ySu',element:'loi',maxHp:1000,atk:1,def:0,skills:[]});
it('Y sư: tính hồi hữu hiệu trước hồi dư, không giảm Khiên chuyển đổi hai lần',()=>{
 for(const initialHp of [900,950,1000])for(const spirit of [0,50,100]){
 const {state}=createBattle({sides:[{fighters:[fighter('a'),fighter('b'),fighter('c')],leader:0},{fighters:[fighter('x'),fighter('y'),fighter('z')],leader:0}],seed:31,timer:false});
 state.sides[0].fighters[0]!.hp=initialHp;state.sides[0].fighters[0]!.spirit=spirit;
 state.board=parseBoard(`ABTSVABTSVAB\nTSVABTSVABTS\nTTATBSVABTSV\nVTBSATBSATBS\nABTSVABTSVAB\nTSVABTSVABTS\nVABTSVABTSVA\nBTSVABTSVABT`);
 const result=act(state,{type:'swap',from:{row:2,col:3},to:{row:2,col:2}});assert.ok(result.ok);
 const swap=result.events.find(e=>e.type==='swap');assert.ok(swap?.type==='swap');
 let hp=initialHp,shield=0;
 for(const step of swap.steps){const heal=Math.round(Math.round(1000*0.03*step.harvest.tim*1.5)*spiritHealMultiplier(spirit));const overflow=Math.max(0,heal-(1000-hp));hp=Math.min(1000,hp+heal);shield=Math.max(shield,overflow);}
 assert.equal(result.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='shield')?.value??0,shield);
 }
});

import { spiritAt, spiritStatMultiplier, spiritHealMultiplier, effectiveAtk, effectiveDef, inspectSkillChoices, chooseSkill, type BattleState, type SpiritExperiment } from '../../../src/core';
import { screeningCases, spiritCases, campaignAuditCases } from '../../../src/core/sim/audit';
function setup(skills:string[]=[],solo=false,rule:SpiritExperiment | null=null){
 const f=(id:string):FighterConfig=>({...fighter(id),profession:'tuongSi',atk:100,skills});
 return createBattle({sides:[{fighters:solo?[f('a')]:[f('a'),f('b'),f('c')],leader:0},{fighters:solo?[f('x')]:[f('x'),f('y'),f('z')],leader:0}],seed:31,timer:true,audit:true,...(rule?{experimentalSpirit:rule}:{})}).state;
}
function timeout(s:BattleState){const r=act(s,{type:'timeout'},s.turn.deadline!+1);assert.ok(r.ok);return r;}
it('đếm đúng 24/25/26/33/34/35 cho từng phe, cả hai phe đi trước; người gục không mất TT',()=>{
 for(const first of [0,1] as const)for(const solo of [false,true]){
  let s=createBattle({sides:[{fighters:[fighter('a'),...(!solo?[fighter('b')]:[])],leader:0},{fighters:[fighter('x'),...(!solo?[fighter('y')]:[])],leader:0}],seed:21,firstSide:first,timer:true}).state;
  if(!solo)s.sides[0].fighters[1]!.hp=0;
  const turns:[number,number]=[0,0];turns[first]++;
  for(let i=0;i<70;i++){
   for(const side of [0,1] as const){s.sides[side].food=100;assert.equal(s.sides[side].fighters[0]!.spirit,spiritAt(turns[side]!));}
   const r=timeout(s);s=r.state;turns[s.turn.side]!++;
  }
  if(!solo)assert.equal(s.sides[0].fighters[1]!.spirit,100);
 }
 for(const [n,v] of [[24,100],[25,95],[26,90],[33,55],[34,50],[35,45],[44,0]])assert.equal(spiritAt(n!),v);
});
it('lượt thêm không trừ TT, Đóng băng vẫn chịu mốc lượt thường',()=>{
 let s=setup([],true);s.turn.number=49;s.sides[0].fighters[0]!.spirit=95;
 s.board=parseBoard(`ABTSVABTSVAB\nTSVABTSVABTS\nKKAKKSVABTSV\nVTKSATBSATBS\nABTSVABTSVAB\nTSVABTSVABTS\nVABTSVABTSVA\nBTSVABTSVABT`);
 const extra=act(s,{type:'swap',from:{row:3,col:2},to:{row:2,col:2}});assert.ok(extra.ok);assert.equal(extra.state.turn.number,49);assert.equal(extra.state.turn.extra,true);assert.equal(extra.state.sides[0].fighters[0]!.spirit,95);
 s=setup([],true);s.turn.number=48;s.turn={...s.turn,side:1};s.sides[0].fighters[0]!.effects=[{kind:'freeze',value:0,turns:1}];
 const skipped=timeout(s);assert.ok(skipped.events.some(e=>e.type==='frozenSkip'&&e.side===0));assert.equal(skipped.state.sides[0].fighters[0]!.spirit,95);
});
it('hồi trực tiếp/regen/hút máu theo người nhận, giữ sàn hồi 20% ở TT0',()=>{
 for(const spirit of [0,40,100]){
  const s=setup(['role_linhDuoc']);s.sides[0].fighters[0]!.energy=100;s.sides[0].fighters[1]!.hp=100;s.sides[0].fighters[1]!.spirit=spirit;
  const r=act(s,{type:'skill',skill:'role_linhDuoc',target:1});assert.ok(r.ok);assert.equal(r.state.sides[0].fighters[1]!.hp,100+Math.round(220*spiritHealMultiplier(spirit)));
  const t=setup();t.turn.number=2;t.turn={...t.turn,side:1};t.sides[0].fighters[0]!.hp=100;t.sides[0].fighters[0]!.spirit=spirit;t.sides[0].fighters[0]!.effects=[{kind:'regen',value:71,turns:3}];
  assert.equal(timeout(t).state.sides[0].fighters[0]!.hp,100+Math.round(71*spiritHealMultiplier(spirit)));
  const l=setup(['trucLamPhaTran']);const me=l.sides[0].fighters[0]!;me.energy=100;me.hp=100;me.spirit=spirit;
  const steal=act(l,{type:'skill',skill:'trucLamPhaTran',target:0});assert.ok(steal.ok);const damage=steal.events.find(e=>e.type==='damage'&&e.source==='skill');assert.ok(damage?.type==='damage');assert.equal(steal.state.sides[0].fighters[0]!.hp,100+Math.round(Math.round(damage.amount*0.3)*spiritHealMultiplier(spirit)));
 }
});
it('Khiên mới/làm mới chịu TT một lần, Khiên cũ tồn tại; giữ sàn Khiên 20% ở TT0',()=>{
 let s=setup(['role_thuThanh']);s.sides[0].fighters[0]!.energy=100;
 let r=act(s,{type:'skill',skill:'role_thuThanh'});assert.ok(r.ok);assert.equal(r.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='shield')?.value,200);
 for(const spirit of [50,0]){
  s=structuredClone(r.state);s.turn.skillUsed=false;s.sides[0].fighters[0]!.energy=100;s.sides[0].fighters[0]!.spirit=spirit;
  const refresh=act(s,{type:'skill',skill:'role_thuThanh'});assert.ok(refresh.ok);assert.equal(refresh.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='shield')?.value,200);
  const audit=refresh.events.find(e=>e.type==='sustain'&&e.kind==='shield');assert.ok(audit?.type==='sustain');assert.equal(audit.effective,0);assert.equal(audit.spiritLost,200-Math.round(200*spiritHealMultiplier(spirit)));assert.equal(audit.nonStackLost,Math.round(200*spiritHealMultiplier(spirit)));
 }
 s=setup(['role_thuThanh']);s.sides[0].fighters[0]!.energy=100;s.sides[0].fighters[0]!.spirit=0;r=act(s,{type:'skill',skill:'role_thuThanh'});assert.ok(r.ok);assert.equal(r.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='shield')?.value,40);
});
it('ATK/DEF áp buff rồi TT rồi xuyên giáp; DOT và hết lương không nhân TT',()=>{
 const s=setup();const f=s.sides[0].fighters[0]!;f.spirit=20;f.effects=[{kind:'atkUp',value:0.5,turns:2},{kind:'atkDown',value:0.1,turns:2}];assert.ok(Math.abs(effectiveAtk(f)-140)<1e-9);
 for(const spirit of [0,100]){const t=setup();t.turn={...t.turn,side:1};t.turn.number=2;t.sides[0].fighters[0]!.spirit=spirit;t.sides[0].fighters[0]!.effects=[{kind:'burn',value:41,turns:2}];t.sides[0].food=0;
 const r=timeout(t);assert.deepEqual(r.events.filter(e=>e.type==='damage'&&e.side===0&&e.fighter===0).map(e=>e.type==='damage'?[e.source,e.amount]:[]),[['starvation',30],['burn',41]]);}
 const d={...f,def:100,effects:[{kind:'defUp' as const,value:0.3,turns:2}]};assert.ok(Math.abs(effectiveDef(s.sides[0],d)-130)<1e-9);
});
it('F là mặc định; AI định giá hồi/Khiên ở sàn20% và trừ Khiên đã có',()=>{
 assert.equal(setup().experimentalSpirit,undefined);
 for(const id of ['role_linhDuoc','role_duongSinh','element_thachGiap']){
  const s=setup([id],true);s.sides[0].fighters[0]!.energy=100;s.sides[0].fighters[0]!.hp=100;s.sides[0].fighters[0]!.spirit=0;
  assert.ok(inspectSkillChoices(s)[0]!.score>0,id);
 }
 const s=setup(['element_thachGiap']);s.sides[0].fighters[0]!.energy=100;s.sides[0].fighters[0]!.effects=[{kind:'shield',value:300,turns:null}];assert.equal(inspectSkillChoices(s)[0]!.score,0);
});
it('Ly gián chỉ có giá trị khi mục tiêu kịp hành động trong thời hạn',()=>{
 const s=setup(['role_lyGian']);s.sides[0].fighters[0]!.energy=100;
 s.sides[1].fighters.forEach((f,i)=>{s.sides[1].fighters[i]={...f,skills:['role_tramKich'],energy:i===2?100:0};});
 assert.equal(chooseSkill(s),null);s.sides[1].fighters[0]!.energy=100;const a=chooseSkill(s);assert.ok(a?.type==='skill');assert.equal(a.target,0);
});
it('sampler phủ 42 tổ hợp/4 cấp/roster và ĐBL luôn có mặt, đổi bên giữ cùng seed/đội',()=>{
 const cases=screeningCases();assert.equal(cases.length,1344);const ids=new Set<string>();
 for(let i=0;i<cases.length;i+=2){const a=cases[i]!,b=cases[i+1]!;assert.equal(a.matchup.sides[a.focalSide].fighters[0]!.id,'dinhBoLinh');assert.equal(b.matchup.sides[b.focalSide].fighters[0]!.id,'dinhBoLinh');assert.equal(a.matchup.seed,b.matchup.seed);assert.deepEqual(a.matchup.sides[0],b.matchup.sides[1]);a.matchup.sides.flatMap(s=>s.fighters).forEach(f=>ids.add(f.id));}
 assert.equal(ids.size,61);assert.equal(spiritCases().length,128);assert.equal(campaignAuditCases().length,24);
 const bare=campaignAuditCases([701]),geared=campaignAuditCases([701],'white3');assert.equal(geared.length,bare.length);assert.ok(geared[0]!.matchup.sides[0].fighters[0]!.maxHp>bare[0]!.matchup.sides[0].fighters[0]!.maxHp);assert.deepEqual(geared[0]!.matchup.sides[1],bare[0]!.matchup.sides[1]);
});
it('Phản đòn không nhân TT lần hai; đòn xuyên giáp dùng DEF sau buff và TT',()=>{
 for(const spirit of [0,100]){
  const s=setup(['role_phaTran']);const a=s.sides[0].fighters[0]!,t=s.sides[1].fighters[0]!;
  a.energy=100;t.spirit=spirit;t.effects=[{kind:'reflect',value:0.4,turns:2}];
  const r=act(s,{type:'skill',skill:'role_phaTran',target:0});assert.ok(r.ok);
  const hit=r.events.find(e=>e.type==='damage'&&e.source==='skill');const reflect=r.events.find(e=>e.type==='damage'&&e.source==='reflect');assert.ok(hit?.type==='damage'&&reflect?.type==='damage');assert.equal(reflect.amount,Math.round(hit.amount*0.4));
 }
 const s=setup(['role_phaTran']);const a=s.sides[0].fighters[0]!,t=s.sides[1].fighters[0]!;a.energy=100;a.spirit=40;a.effects=[{kind:'atkUp',value:0.25,turns:2}];s.sides[1].fighters[0]={...t,def:100,spirit:40,effects:[{kind:'defUp',value:0.5,turns:2}]};
 const r=act(s,{type:'skill',skill:'role_phaTran',target:0});assert.ok(r.ok);const hit=r.events.find(e=>e.type==='damage'&&e.source==='skill');assert.ok(hit?.type==='damage');assert.equal(hit.amount,Math.round(2.5*100*1.25*100/(100+100*1.5*0.7)));
});
import { runMeasured } from '../../../scripts/lib/spirit-runner';
it('runner tách chạm giới hạn, không tính lượt vừa khởi đầu ngoài cap',()=>{
 const c=screeningCases()[0]!;const r=runMeasured(c,'after','F',2);
 assert.equal(r.capHit,true);assert.equal(r.winner,null);assert.deepEqual(r.counts.turns,[1,1]);
 for(const s of Object.values(r.skills))assert.equal(s.reasons.chosen??0,s.uses);
});

it('F: mốc 24/25/30/35/40/44+, ATK/DEF không giảm TT và vẫn chịu buff',()=>{
 for(const [turn,mult] of [[24,1],[25,.96],[30,.76],[35,.56],[40,.36],[44,.2],[60,.2]]){
  assert.ok(Math.abs(spiritHealMultiplier(spiritAt(turn!,'F'),'F')-mult!)<1e-12);
  assert.equal(spiritStatMultiplier(spiritAt(turn!,'F'),'F'),1);
 }
 for(const first of [0,1] as const){
  let s=createBattle({sides:[{fighters:[fighter('a')],leader:0},{fighters:[fighter('b')],leader:0}],seed:21,firstSide:first,timer:true,}).state;
  const turns:[number,number]=[0,0];turns[first]++;
  for(let i=0;i<92;i++){for(const side of [0,1] as const){s.sides[side].food=100;assert.equal(s.sides[side].fighters[0]!.spirit,spiritAt(turns[side]!,'F'));}s=timeout(s).state;turns[s.turn.side]!++;}
 }
 const s=setup([],false,null),f=s.sides[0].fighters[0]!;f.spirit=0;f.effects=[{kind:'atkUp',value:.5,turns:2},{kind:'atkDown',value:.1,turns:2}];assert.equal(effectiveAtk(f),140);
 assert.equal(effectiveDef(s.sides[0],{...f,def:100,effects:[{kind:'defUp',value:.3,turns:2}]}),130);
});
it('F: receiver healing/regen/lifesteal one scaling; AI values floor, old shield unchanged',()=>{
 for(const spirit of [0,50,100]){
  const mult=spiritHealMultiplier(spirit,'F');
  const s=setup(['role_linhDuoc'],false,null);s.sides[0].fighters[0]!.energy=100;s.sides[0].fighters[0]!.spirit=100;s.sides[0].fighters[1]!.hp=100;s.sides[0].fighters[1]!.spirit=spirit;
  const r=act(s,{type:'skill',skill:'role_linhDuoc',target:1});assert.ok(r.ok);assert.equal(r.state.sides[0].fighters[1]!.hp,100+Math.round(220*mult));assert.ok(inspectSkillChoices(s)[0]!.score>0);
  const t=setup([],false,null);t.turn.number=2;t.turn={...t.turn,side:1};t.sides[0].fighters[0]!.hp=100;t.sides[0].fighters[0]!.spirit=spirit;t.sides[0].fighters[0]!.effects=[{kind:'regen',value:71,turns:3}];assert.equal(timeout(t).state.sides[0].fighters[0]!.hp,100+Math.round(71*mult));
  const l=setup(['trucLamPhaTran'],false,null);const me=l.sides[0].fighters[0]!;me.energy=100;me.hp=100;me.spirit=spirit;const steal=act(l,{type:'skill',skill:'trucLamPhaTran',target:0});assert.ok(steal.ok);const d=steal.events.find(e=>e.type==='damage'&&e.source==='skill');assert.ok(d?.type==='damage');assert.equal(steal.state.sides[0].fighters[0]!.hp,100+Math.round(Math.round(d.amount*.3)*mult));
  const sh=setup(['role_thuThanh'],false,null);sh.sides[0].fighters[0]!.energy=100;sh.sides[0].fighters[0]!.spirit=spirit;const added=act(sh,{type:'skill',skill:'role_thuThanh'});assert.ok(added.ok);assert.equal(added.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='shield')!.value,Math.round(200*mult));
  sh.sides[0].fighters[0]!.effects=[{kind:'shield',value:300,turns:null}];const kept=act(sh,{type:'skill',skill:'role_thuThanh'});assert.ok(kept.ok);assert.equal(kept.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='shield')!.value,300);
 }
});
it('F Y sư chuyển hồi dư sang Khiên chỉ nhân một lần; lượt thêm không giảm TT',()=>{
 for(const spirit of [0,50,100])for(const hp of [900,950,1000]){
  const s=setup([],false,null);s.sides[0].fighters[0]={...s.sides[0].fighters[0]!,profession:'ySu',hp,spirit};s.board=parseBoard(`ABTSVABTSVAB\nTSVABTSVABTS\nTTATBSVABTSV\nVTBSATBSATBS\nABTSVABTSVAB\nTSVABTSVABTS\nVABTSVABTSVA\nBTSVABTSVABT`);
  const r=act(s,{type:'swap',from:{row:2,col:3},to:{row:2,col:2}});assert.ok(r.ok);const sw=r.events.find(e=>e.type==='swap');assert.ok(sw?.type==='swap');let h=hp,shield=0;
  for(const step of sw.steps){const raw=Math.round(1000*.03*step.harvest.tim*1.5);const heal=Math.round(raw*spiritHealMultiplier(spirit,'F'));shield=Math.max(shield,Math.max(0,heal-(1000-h)));h=Math.min(1000,h+heal);}assert.equal(r.state.sides[0].fighters[0]!.effects.find(e=>e.kind==='shield')?.value??0,shield);
 }
 const s=setup([],true,null);s.turn.number=49;s.sides[0].fighters[0]!.spirit=95;s.board=parseBoard(`ABTSVABTSVAB\nTSVABTSVABTS\nKKAKKSVABTSV\nVTKSATBSATBS\nABTSVABTSVAB\nTSVABTSVABTS\nVABTSVABTSVA\nBTSVABTSVABT`);const r=act(s,{type:'swap',from:{row:3,col:2},to:{row:2,col:2}});assert.ok(r.ok);assert.equal(r.state.turn.number,49);assert.equal(r.state.sides[0].fighters[0]!.spirit,95);
});
it('shield ledger reconciles useful, expired/dispelled, stranded and remaining; phases reconcile',()=>{
 for(const rule of ['F'] as const){const r=runMeasured(spiritCases().find(c=>c.profile==='defense'&&c.level===20&&c.id.includes('3v3'))!,'after',rule,120);
  const phases=Object.values(r.phases);assert.equal(phases.reduce((a,p)=>a+p.heal,0),r.counts.heal);assert.equal(phases.reduce((a,p)=>a+p.absorbed,0),r.counts.absorbed);
  assert.equal(r.counts.shield,r.counts.absorbed+phases.reduce((a,p)=>a+p.expiredOrDispelled+p.stranded,0)+r.shieldRemaining);
 }
});
it('F: Khiên đội theo từng người nhận, Đóng băng vẫn suy giảm lượt thường',()=>{
 const s=setup(['ngoaiGiapHoQuan'],false,null);s.sides[0].fighters[0]!.energy=100;
 s.sides[0].fighters.forEach((f,i)=>f.spirit=[100,0,50][i]!);
 const r=act(s,{type:'skill',skill:'ngoaiGiapHoQuan'});assert.ok(r.ok);
 assert.deepEqual(r.state.sides[0].fighters.map(f=>f.effects.find(e=>e.kind==='shield')?.value),[200,40,120]);
 const t=setup([],true,null);t.turn.number=48;t.turn={...t.turn,side:1};t.sides[0].fighters[0]!.effects=[{kind:'freeze',value:0,turns:1}];
 const skipped=timeout(t);assert.ok(skipped.events.some(e=>e.type==='frozenSkip'&&e.side===0));assert.equal(skipped.state.sides[0].fighters[0]!.spirit,95);
});
