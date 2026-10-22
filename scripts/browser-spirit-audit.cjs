/* eslint-disable @typescript-eslint/no-require-imports */
// Browser-only fixtures; app/server routes and production state are never modified.
const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');const fs=require('node:fs');const out=process.env.AUDIT_OUTPUT_DIR||'/workspace/spirit-audit';fs.mkdirSync(out,{recursive:true});const core=require(path.resolve(__dirname,'../src/core/index.ts'));
const rule=process.env.AUDIT_RULE||'A';if(!core.SPIRIT_EXPERIMENTS[rule])throw new Error('invalid AUDIT_RULE');
const PN={tuongSi:'Tướng sĩ',phapSu:'Pháp sư',binhLinh:'Binh lính',ySu:'Y sư',muuSi:'Mưu sĩ',quanSu:'Quân sư'},EN={kim:'Kim',moc:'Mộc',thuy:'Thủy',hoa:'Hỏa',tho:'Thổ',loi:'Lôi',phong:'Phong'};
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const errors=[];const results=[];
 if(!process.env.AUDIT_ONLY_FIXTURE) for(const [name,viewport]of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  const ctx=await browser.newContext({viewport,isMobile:name==='mobile',hasTouch:name==='mobile'});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3000/game/practice');await page.getByRole('button',{name:'Đổi đội hình',exact:true}).click();
  const prof=page.getByRole('radiogroup',{name:'Nghề nhân vật chính'}),elem=page.getByRole('radiogroup',{name:'Nguyên tố nhân vật chính'});
  const list=page.locator('section').filter({has:page.getByRole('heading',{name:/^Bộ kỹ năng/})});
  for(const p of core.PROFESSIONS)for(const e of core.ELEMENTS){
   await prof.getByRole('radio',{name:new RegExp('^'+PN[p])}).click();await elem.getByRole('radio',{name:EN[e],exact:true}).click();
   const defs=core.characterSkills(p,e);for(const d of defs)await list.locator('li').filter({hasText:d.name}).waitFor();const texts=await list.locator('li').allTextContents();assert.equal(texts.length,6);
   defs.forEach((d,i)=>{assert.ok(texts[i].includes(d.name),`${name} ${p}/${e} ${d.name}`);assert.ok(texts[i].includes(`Ô ${d.slot}`));});
  }
  await prof.getByRole('radio',{name:/^Y sư/}).click();await elem.getByRole('radio',{name:'Hỏa',exact:true}).click();
  await page.getByText('Chi tiết kỹ năng',{exact:true}).first().click();assert.ok((await page.locator('details[open]').innerText()).includes('Thanh tẩy'));
  assert.ok(await page.evaluate(w=>document.documentElement.scrollWidth<=w+1,viewport.width),'horizontal overflow');
  await page.screenshot({path:`${out}/${name}-lobby.png`,fullPage:true});
  results.push(`${name}: all 42 profession/element previews, slot order, touch details, no horizontal overflow`);
  // Browser-only fixture of preexisting slot investment; no production endpoint/shortcut.
  for(const level of [9,10,15,20]){
   const profile=core.newProfile();profile.companions.haVan={...core.autoProgress(level,null),skillPoints:2,skillLevels:{phepCong:4},branches:['phepLan']};profile.main={...core.autoProgress(level,null),skillPoints:8,skillLevels:{o1:2,o4:4,o6:3}};
   await page.evaluate(p=>localStorage.setItem('coLau.profile.v1',JSON.stringify(p)),profile);await page.reload();
   await page.getByRole('button',{name:'Đổi đội hình',exact:true}).click();await page.getByRole('radio',{name:`Tiến trình · cấp ${level}`,exact:true}).click();
   const locked=page.getByText('Mở ở cấp 20',{exact:true});if(level<20)assert.ok(await locked.count()>0);
   // Verify an actual upgrade persists and does not consume investments in temporarily locked slots.
   const up=page.getByRole('button',{name:'+ (1)',exact:true}).first();await up.click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('coLau.profile.v1')).main.skillPoints===7);
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('coLau.profile.v1')));assert.equal(saved.main.skillLevels.o4,4);assert.equal(saved.main.skillLevels.o6,3);assert.equal(saved.companions.haVan.skillPoints,7);assert.deepEqual(saved.companions.haVan.branches,[]);
  }
  results.push(`${name}: levels 9/10/15/20, locked skill and real upgrade persistence; locked o4/o6 investment retained`);
  await ctx.close();
 }
 // Online screen, browser route fixture backed by the real battle engine. No app route is added.
 for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
 const ctx=await browser.newContext({viewport,isMobile:device==='mobile',hasTouch:device==='mobile'});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 const a=core.buildMain(core.maxProgress(null),'moc','ySu');const mates=['leThach','haVan'].map(id=>core.buildCompanion(core.companionById(id),core.maxProgress(null)));
 let state=core.createBattle({sides:[{fighters:[a,...mates],leader:0},{fighters:[...mates,a],leader:0}],seed:33,timer:false,firstSide:0,experimentalSpirit:rule}).state;
 state.turn.number=49;state.sides[0].fighters.forEach((f,i)=>{f.spirit=[0,40,100][i];f.energy=100;f.hp=i===1?100:f.maxHp;});let seq=0;let sent=[];
 const payload=(events=[])=>({id:'audit-fixture',now:Date.now(),view:{battle:core.toView(state),seq,difficulty:'normal',forfeited:false},events});
 await ctx.addInitScript(()=>localStorage.setItem('coLau.online.battle','audit-fixture'));
 await p.route('**/api/battles/audit-fixture**',async route=>{if(route.request().method()==='POST'){const body=route.request().postDataJSON();sent.push(body.action);const r=core.act(state,body.action);assert.ok(r.ok,r.error);state=r.state;seq++;await route.fulfill({json:payload(r.events)});}else await route.fulfill({json:payload()});});
 await p.goto('http://127.0.0.1:3000/game/play');await p.getByRole('button',{name:'Tiếp tục trận dở',exact:true}).click();
 await p.getByText(`Tinh thần: Công/Thủ ${Math.round(core.spiritStatMultiplier(0,rule)*100)}% · Hồi/Khiên mới ${Math.round(core.spiritHealMultiplier(0,rule)*100)}%`,{exact:true}).first().waitFor();
 const skill=p.locator('button').filter({hasText:'Linh dược'}).first();await skill.click();await p.keyboard.press('Escape');assert.equal(sent.length,0);
 await skill.click();const ally=p.locator('button').filter({has:p.getByText('Lê Thạch',{exact:true})}).first();await Promise.all([p.waitForResponse(r=>r.url().endsWith('/actions')&&r.request().method()==='POST'),ally.click()]);
assert.equal(sent[0].type,'skill');assert.equal(sent[0].target,1);
 const expected=100+Math.round(Math.round(mates[0].maxHp*core.fighterSkill(state.sides[0].fighters[0],'role_linhDuoc').steps[0].ratio)*core.spiritHealMultiplier(40,rule));
 assert.equal(state.sides[0].fighters[1].hp,expected);
 if(process.env.AUDIT_LAYOUT_DEBUG)console.log('LAYOUT',JSON.stringify(await p.evaluate(()=>({innerWidth,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,leaves:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>391&&e.children.length===0).slice(-15).map(e=>({tag:e.tagName,cls:e.className,text:e.innerText?.slice(0,45),right:e.getBoundingClientRect().right}))}))));
 assert.ok(await p.evaluate(w=>document.documentElement.scrollWidth<=w+1,viewport.width),`${device}: game/profile horizontal overflow`);
 await p.screenshot({path:`${out}/${device}-spirit.png`,fullPage:true});
 results.push(`${device} route fixture: heterogeneous TT 0/40/100, effective multipliers, cancel targeting without request; targeted healing matches real engine`);
 // Test each real default decay boundary through the rendered UI, using an intercepted read only.
 for(const turn of [24,25,30,35,40,44,50]) {
  const value=core.spiritAt(turn,rule);state=core.createBattle({sides:[{fighters:[a,...mates],leader:0},{fighters:[...mates,a],leader:0}],seed:33,timer:false,firstSide:0,experimentalSpirit:rule}).state;state.turn.number=turn*2-1;
  state.sides.forEach(side=>side.fighters.forEach(f=>f.spirit=value));seq=0;
  await p.reload();await p.getByRole('button',{name:'Tiếp tục trận dở',exact:true}).click();
  await p.getByText(`Tinh thần: Công/Thủ ${Math.round(core.spiritStatMultiplier(value,rule)*100)}% · Hồi/Khiên mới ${Math.round(core.spiritHealMultiplier(value,rule)*100)}%`,{exact:true}).first().waitFor();
 }
 results.push(`${device}: rendered spirit multipliers at side turns 24/25/30/35/40/44/50`);
 // Play a real targeted support skill at the late floor, rather than only reading labels.
 state.sides[0].fighters.forEach(f=>{f.spirit=0;f.energy=100;});state.sides[0].fighters[1].hp=100;seq=0;sent=[];
 await p.reload();await p.getByRole('button',{name:'Tiếp tục trận dở',exact:true}).click();
 const lateSkill=p.locator('button').filter({hasText:'Linh dược'}).first();await lateSkill.click();
 await Promise.all([p.waitForResponse(r=>r.url().endsWith('/actions')&&r.request().method()==='POST'),p.locator('button').filter({has:p.getByText('Lê Thạch',{exact:true})}).first().click()]);
 const lateExpected=100+Math.round(Math.round(mates[0].maxHp*core.fighterSkill(state.sides[0].fighters[0],'role_linhDuoc').steps[0].ratio)*core.spiritHealMultiplier(0,rule));
 assert.equal(state.sides[0].fighters[1].hp,lateExpected);
 await p.screenshot({path:`${out}/${device}-late-floor.png`,fullPage:true});
 results.push(`${device}: rule ${rule}, turn 50 actual targeted heal at TT0: ${lateExpected-100} effective HP`);
 // Region cast and cancel with a full-energy mage; only test fixture changes profession.
 const mage=core.buildMain(core.maxProgress(null),'hoa','phapSu');state=core.createBattle({sides:[{fighters:[mage,...mates],leader:0},{fighters:[...mates,a],leader:0}],seed:33,timer:false,firstSide:0,experimentalSpirit:rule}).state;state.sides[0].fighters[0].energy=100;seq=0;sent=[];
 await p.reload();await p.getByRole('button',{name:'Tiếp tục trận dở',exact:true}).click();
 const region=p.locator('button').filter({hasText:'Phóng Hỏa Thiêu Doanh'}).first();await region.click();await region.click();assert.equal(sent.length,0);await region.click();
 const cell=p.locator('[role="gridcell"][data-row="3"][data-col="3"]');
 await Promise.all([p.waitForResponse(r=>r.url().endsWith('/actions')&&r.request().method()==='POST'),device==='mobile'?cell.tap():cell.click()]);
 assert.deepEqual(sent[0].cell,{row:3,col:3});assert.equal(sent[0].skill,'element_phongHoaThieuDoanh');
 results.push(`${device}: region targeting, tap-to-cancel and actual board skill request`);
 await ctx.close();}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({results,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
