import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {EXPANSION_COMPANIONS,characterSkills,scaleSkill} from '../../src/core';
import {rigOf,partsOf,partUrl} from '../../src/app/game/stage/rigs';
import {portraitUrl} from '../../src/app/game/art/portrait-data';
import {ProfessionIcon} from '../../src/app/game/art/icons';
import {SkillIcon} from '../../src/app/game/art/skills';
import {skillStepTexts} from '../../src/app/game/battle/labels';

test('all new companions reuse existing portraits, rig layers and action poses',()=>{
 for(const f of EXPANSION_COMPANIONS){
  const rig=rigOf(f.id);assert.ok(rig);const portrait=portraitUrl(f.id);assert.ok(portrait&&existsSync(`public${portrait}`));
  for(const part of partsOf(rig))assert.ok(existsSync(`public${partUrl(rig,part)}`),`${f.id}:${part}`);
  assert.equal(rig.skeleton,'warrior');if(rig.skeleton!=='warrior')continue;
  for(const pose of ['attack','cast','ultimate'] as const){const art=rig.poses?.[pose];assert.ok(art);assert.ok(existsSync(`public/art/characters/${rig.dir}/${art.name}.webp`));}
  assert.ok(rig.down);assert.ok(existsSync(`public/art/characters/${rig.dir}/${rig.down.name}.webp`));
 }
});

test('missing painted profession/skill icons render safe SVG; all tooltips have actual step text',()=>{
 for(const profession of ['xaThu','satThu'] as const){
  const html=renderToStaticMarkup(createElement(ProfessionIcon,{profession}));
  assert.ok(html.includes('<svg'));assert.equal(html.includes('<image'),false);assert.ok(html.includes('aria-hidden="true"'));
 }
 for(const f of EXPANSION_COMPANIONS)for(const skill of characterSkills(f.profession,f.element,f.id))for(const level of [1,3,5]){
  const def=scaleSkill(skill,level);assert.ok(renderToStaticMarkup(createElement(SkillIcon,{def})).includes('<svg'));
  const text=skillStepTexts(def).join(' ');assert.ok(text.length>0);assert.equal(/undefined|NaN/.test(text),false);
 }
});
