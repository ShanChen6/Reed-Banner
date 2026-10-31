// Kịch bản kiểm chứng nghề/hệ và Tinh thần; không dùng generator roster cũ gắn nhãn sai ĐBL.
import { ELEMENTS, PROFESSIONS, type Profession, type SideIndex } from '../battle';
import { autoProgress, buildCompanion, buildMain } from '../progress';
import { withGear, presetLoadout } from '../gear';
import { ALL_COMPANIONS } from '../roster';
import { campaignEncounter } from '../campaign';
import type { Difficulty } from '../ai';
import { missionMatchups, missionTeamIds } from './campaign';
import type { Matchup } from './sim';

export const AUDIT_PROFILES = ['attack','balanced','defense','resources'] as const;
export type AuditProfile = typeof AUDIT_PROFILES[number];
export interface AuditCase {
 readonly id:string; readonly group:'screen'|'spirit'|'campaign'; readonly level:number;
 readonly profession:Profession; readonly element:typeof ELEMENTS[number]; readonly profile:AuditProfile;
 readonly pair:string; readonly focalSide:SideIndex; readonly matchup:Matchup;
 /** Nhóm campaign: nhiệm vụ Campaign V2 và độ khó AI phe đối thủ của nhiệm vụ đó. */ readonly stage?:string; readonly foeDifficulty?:Difficulty;
 readonly team?:string; readonly equipment:'none'|'white3';
}
const roles:Record<AuditProfile,readonly Profession[]>={attack:['tuongSi','phapSu','quanSu'],balanced:['tuongSi','ySu','quanSu'],defense:['binhLinh','ySu','binhLinh'],resources:['muuSi','quanSu','muuSi']};
function unit(profession:Profession,index:number,level:number){
 const pool=ALL_COMPANIONS.filter(c=>c.profession===profession);
 return buildCompanion(pool[index%pool.length]!,autoProgress(level,null));
}
function pair(base:Omit<AuditCase,'id'|'focalSide'|'matchup'>,matchup:Matchup):AuditCase[]{
 return [0,1].map(n=>({...base,id:`${base.pair}:side${n}`,focalSide:n as SideIndex,matchup:{...matchup,sides:n===0?matchup.sides:[matchup.sides[1],matchup.sides[0]],firstSide:0}}));
}
/** 2 seed blocks, 2 orientations/case; strata rotate by profession, element and level. All 60 roster units participate. */
export function screeningCases(seeds:readonly number[]=[701,1907]):AuditCase[]{
 const cases:AuditCase[]=[];
 for(const [pi,profession] of PROFESSIONS.entries()) for(const [ei,element] of ELEMENTS.entries()) for(const [li,level] of [9,10,15,20].entries()) for(const mode of ['1v1','3v3'] as const) for(const [si,seed] of seeds.entries()){
  const index=pi*7+ei+li*11+si*17;
  const profile=AUDIT_PROFILES[(pi+ei+li+si)%4]!;
  const opposite=AUDIT_PROFILES[(pi+ei+si*3)%4]!;
  const main=buildMain(autoProgress(level,null),element,profession);
  const own=mode==='1v1'?[main]:[main,...roles[profile].slice(0,2).map((p,j)=>unit(p,index+j*3,level))];
  const foe=mode==='1v1'?[unit(PROFESSIONS[(index+si)%6]!,index,level)]:roles[opposite].map((p,j)=>unit(p,index+5+j*7,level));
  const key=`screen:${profession}:${element}:${level}:${mode}:${seed}`;
  cases.push(...pair({pair:key,group:'screen',level,profession,element,profile,equipment:'none'},{sides:[{fighters:own,leader:0},{fighters:foe,leader:0}],seed:(seed+index*7919)>>>0,firstSide:0}));
 }
 return cases;
}
/** Targeted defense/attack/resource matchups for rule experiments, shared by A–E. */
export function spiritCases(seeds:readonly number[]=[701,1907]):AuditCase[]{
 const out:AuditCase[]=[];
 for(const [i,profile] of AUDIT_PROFILES.entries()) for(const level of [9,10,15,20]) for(const mode of ['1v1','3v3'] as const) for(const seed of seeds){
  const profession:Profession=profile==='defense'?'ySu':roles[profile][0]!;
  const element=ELEMENTS[(i+level)%7]!;
  const main=buildMain(autoProgress(level,null),element,profession);
  const own=mode==='1v1'?[main]:[main,...roles[profile].slice(0,2).map((p,j)=>unit(p,level+i*3+j*5,level))];
  const foe=mode==='1v1'?[unit(profile==='defense'?'ySu':roles[profile][0]!,level+4,level)]:roles[profile].map((p,j)=>unit(p,level+i*2+j*3,level));
  const key=`spirit:${profile}:${level}:${mode}:${seed}`;
  out.push(...pair({pair:key,group:'spirit',level,profession,element,profile,equipment:'none'},{sides:[{fighters:own,leader:0},{fighters:foe,leader:0}],seed:(seed+i*104729+level*7919)>>>0,firstSide:0}));
 }
 return out;
}
/** Only starter/previously joined heroes, never a not-yet-defeated warlord. Nhiệm vụ V2 thay màn cũ phongChau/tamDai (CAMP-08.04). */
export function campaignAuditCases(seeds:readonly number[]=[701,1907,3119],equipment:'none'|'white3'='none'):AuditCase[]{
 const out:AuditCase[]=[];
 for(const id of ['M15','M17'] as const) for(const team of ['default','heroes'] as const) for(const [si,seed] of seeds.entries()){
  const level=campaignEncounter(id)!.recommendedLevel;const element=ELEMENTS[(si+2)%7]!;
  const sim=missionMatchups(id,1,seed,{level,element,team});let m=sim.matchups[0]!;
  if(equipment==='white3') {
   const side=m.sides[0];
   const fighters=side.fighters.map(f=>{const all=presetLoadout(f.element,f.profession,1,null);return withGear(f,{weapons:{[f.profession]:all.weapons[f.profession]!},slots:{dinhMao:all.slots.dinhMao!,yPhuc:all.slots.yPhuc!}});});
   m={...m,sides:[{...side,fighters},m.sides[1]]};
  }
  const key=`campaign:${id}:${team}:${seed}${equipment==='none'?'':':white3'}`;
  out.push(...pair({pair:key,group:'campaign',level,profession:'tuongSi',element,profile:'balanced',stage:id,foeDifficulty:sim.difficulty,team:missionTeamIds(id,team).join('+'),equipment},m));
 }
 return out;
}

/** F follow-up: DBL healer/soldier and heavy sustain teams against attack, plus healer mirror. */
export function pressureCases(seeds:readonly number[]=[3119,4567]):AuditCase[]{
 const out:AuditCase[]=[];
 for(const kind of ['soldierAttack','healerAttack','healersAttack','healersMirror'] as const)for(const level of [9,10,15,20])for(const seed of seeds){
  const profession:Profession=kind==='soldierAttack'?'binhLinh':'ySu';
  const element=ELEMENTS[(level+seeds.indexOf(seed))%7]!;
  const main=buildMain(autoProgress(level,null),element,profession);
  const support:readonly Profession[]=kind.startsWith('healers')?['ySu','ySu']:['binhLinh','ySu'];
  const own=[main,...support.map((p,j)=>unit(p,level+j*7,level))];
  const foe=(kind==='healersMirror'?['ySu','ySu','ySu'] as const:roles.attack).map((p,j)=>unit(p,level+4+j*3,level));
  const key=`pressure:${kind}:${level}:${seed}`;
  out.push(...pair({pair:key,group:'spirit',level,profession,element,profile:'defense',equipment:'none'}, {sides:[{fighters:own,leader:0},{fighters:foe,leader:0}],seed:(seed+level*7919)>>>0,firstSide:0}));
 }
 return out;
}
