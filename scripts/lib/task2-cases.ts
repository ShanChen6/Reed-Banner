import { ALL_COMPANIONS, PROFESSIONS, ELEMENTS, buildMain, buildCompanion, autoProgress, withGear, GEAR_SLOTS, equip, EMPTY_LOADOUT, type Profession, type FighterConfig, type GearItem, type Loadout } from '../../src/core';
import type { AuditCase } from '../../src/core/sim/audit';
export const LEVELS = [1,4,5,9,10,14,15,19,20,30] as const;
export const GEARS = ['none','ordinary','invested'] as const;
export type GearPolicy = typeof GEARS[number];
const roles = { attack:['tuongSi','phapSu','quanSu'], balanced:['tuongSi','ySu','quanSu'], defense:['binhLinh','ySu','binhLinh'], resources:['muuSi','quanSu','muuSi'] } as const;
export interface MeasuredCase extends Omit<AuditCase,'equipment'> { equipment: GearPolicy; gearItems: GearItem[][]; opponentProfile: string; block: number; }
/** Constructible from shop/drop/merge, bounded investment scenarios, not estimated population quantiles. */
export function equipment(f: FighterConfig, level:number, policy:GearPolicy):Loadout {
 let loadout=EMPTY_LOADOUT;
 const count=policy==='none'?0:policy==='ordinary'?(level<5?2:level<10?3:level<15?5:level<20?6:9):(level<5?3:level<10?5:level<15?6:9);
 const tier=policy==='invested'?(level<10?2:level<20?3:level<30?4:5):(level<10?1:level<20?2:3);
 for(const [i,slot] of GEAR_SLOTS.slice(0,count).entries()) {
  const item:GearItem={id:`${f.id}-${slot}`,slot,tier,element:policy==='invested'?f.element:ELEMENTS[(i+ELEMENTS.indexOf(f.element))%7]!,set:policy==='invested'?'coLau':['coLau','hoaLu','dongCo'][i%3]!,...(slot==='vuKhi'?{profession:f.profession}:{})};
  const r=equip(loadout,item);if(!r.ok)throw Error(r.error);loadout=r.loadout;
 } return loadout;
}
export function task2Cases(block=0):MeasuredCase[] {
 const out:MeasuredCase[]=[];const profiles=Object.keys(roles) as (keyof typeof roles)[];
 for(const [pi,profession] of PROFESSIONS.entries())for(const [ei,element] of ELEMENTS.entries())for(const [li,level] of LEVELS.entries())for(const mode of ['1v1','3v3']) {
  const index=pi*7+ei+li*11+block*17;
  const profile=profiles[(pi+ei+li+block)%4]!,opponentProfile=profiles[(pi*3+ei+li+block)%4]!;
  const make=(p:Profession,j:number)=>{const pool=ALL_COMPANIONS.filter(f=>f.profession===p);return buildCompanion(pool[(index+j*7)%pool.length]!,autoProgress(level,null));};
  const own=[buildMain(autoProgress(level,null),element,profession),...(mode==='1v1'?[]:roles[profile].slice(0,2).map((p,j)=>make(p,j)))];
  const foe=(mode==='1v1'?[PROFESSIONS[(index+1)%6]!]:roles[opponentProfile]).map((p,j)=>make(p,j+3));
  const policy=GEARS[(pi+ei+li+block)%3]!;
  const items=[own,foe].map(side=>side.map(f=>equipment(f,level,policy)));
  const equipped=[own,foe].map((side,s)=>side.map((f,i)=>withGear(f,items[s]![i]!)));
  const flat=items.map(side=>side.flatMap(l=>[...Object.values(l.weapons),...Object.values(l.slots)].filter((x):x is GearItem=>!!x)));
  const seed=( [701,1907][(pi+ei+li+block)%2]!+index*7919+block*104729)>>>0;
  const pair=`b${block}:${profession}:${element}:${level}:${mode}:${policy}`;
  for(const side of [0,1] as const)out.push({id:`${pair}:side${side}`,pair,group:'screen',level,profession,element,profile,focalSide:side,equipment:policy,gearItems:side===0?flat:[flat[1]!,flat[0]!],opponentProfile,block,matchup:{seed,firstSide:0,sides:(side===0?equipped:[equipped[1]!,equipped[0]!]).map(fighters=>({fighters,leader:0})) as unknown as AuditCase['matchup']['sides']}});
 }return out;
}
