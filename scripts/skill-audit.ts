// Historical sampler for reproducing the first report only; use spirit-audit.ts for profession/element measurements.
// So sánh hai revision: chạy cùng script, cấu hình và seed; JSON trên stdout.
import { parseArgs } from 'node:util';
import { autoProgress, buildMain, buildMatchups, LEGACY_PROFESSIONS as PROFESSIONS, runBattle, summarize, missionMatchups, campaignEncounter, type CampaignMissionId, type SimMode } from '../src/core';
const {values}=parseArgs({options:{seed:{type:'string'},battles:{type:'string',default:'12'},level:{type:'string'},mode:{type:'string'},profession:{type:'string'},mission:{type:'string'}}});
const count=Number(values.battles);
const seeds=values.seed===undefined?[1,73]:[Number(values.seed)];
if(!Number.isSafeInteger(count)||count<1||seeds.some(s=>!Number.isSafeInteger(s)||s<0)) throw new Error('seed/battles không hợp lệ');
const levels=values.level===undefined?[9,10,15,20]:[Number(values.level)];
const modes=values.mode===undefined?['1v1','3v3'] as SimMode[]:[values.mode as SimMode];
const professions=values.profession===undefined?PROFESSIONS:PROFESSIONS.filter(p=>p===values.profession);
if(levels.some(l=>!Number.isInteger(l)||l<1||l>30)||modes.some(m=>!['1v1','3v3'].includes(m))||!professions.length) throw new Error('level/mode/profession không hợp lệ');
for (const seed of seeds) {
  if (!values.mission) for (const level of levels) for (const mode of modes) for (const profession of professions) {
    const matches = buildMatchups(mode, count, seed, 'moc', undefined, level).map(m => ({...m, sides: m.sides.map(s => ({...s, fighters: s.fighters.map(f => f.id === 'dinhBoLinh' ? buildMain(autoProgress(level, null), 'moc', profession) : f)})) as unknown as typeof m.sides}));
    console.log(JSON.stringify({seed, level, mode, profession, ...summarize(matches.map(m => runBattle(m)))}));
  }
  // Chiến dịch 13 màn cũ đã gỡ (CAMP-08.04): mẫu chiến dịch chạy nhiệm vụ V2 có trận.
  for (const id of values.mission ? [values.mission] : values.level || values.mode || values.profession ? [] : ['M03', 'M07', 'M15', 'M21']) {
    if (!campaignEncounter(id)) throw new Error(`Missing mission ${id}`);
    const { matchups, difficulty } = missionMatchups(id as CampaignMissionId, count, seed, {team:'default'});
    console.log(JSON.stringify({seed, mission: id, ...summarize(matchups.map(m => runBattle(m, {difficulty:['normal', difficulty]})))}));
  }
}
