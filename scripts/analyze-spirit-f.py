"""Reproducible F follow-up; keep historical reports/data immutable."""
import csv,gzip,hashlib,json,random,statistics,sys
from collections import defaultdict
from pathlib import Path
src=Path(sys.argv[1] if len(sys.argv)>1 else '/workspace/spirit-f')
out=Path('docs/reports/2026-10-22-spirit-f');out.mkdir(exist_ok=True)
old=Path('docs/reports/2026-10-22-spirit')
def previous(name):
 with gzip.open(old/(name+'.jsonl.gz'),'rt') as f:return [json.loads(l) for l in f]
def fresh(group,rule):
 paths=sorted(src.glob(f'{group}-{rule}-[0-9].jsonl'));assert paths,(group,rule)
 return [json.loads(l) for p in paths for l in p.read_text().splitlines()]
base=previous('screen-after');short=[r for r in base if max(r['counts']['turns'])<25]
sets={'screen-A':base}
manifest={'historicalScreen':1344,'shortReusedPerVariant':len(short),'replayed':{},'historicalSources':{}}
for rule in 'DEF':
 rows=fresh('screen',rule);assert len(rows)==506
 inherited=[dict(r,rule=rule,reusedFrom='2026-10-22-spirit/screen-after:A:endsBefore25',elapsedMs=0) for r in short]
 sets['screen-'+rule]=rows+inherited
for group,n in [('spirit',128),('focused',64),('pressure',64),('campaign',24),('campaign-gear',24)]:
 for rule in 'ADEF':
  if group.startswith('campaign') and rule!='F' and not(group=='campaign-gear' and rule=='D'):
   name=f'campaign-after-{rule}' if group=='campaign' else f'campaign-gear-after-{rule}'
   sets[f'{group}-{rule}']=previous(name);manifest['historicalSources'][f'{group}-{rule}']=name
  else:
   rows=fresh(group,rule);assert len(rows)==n,(group,rule,len(rows));sets[f'{group}-{rule}']=rows
# Replay equivalence protects reuse: engine/AI/outcomes/counts/skills/participants/seeds unchanged.
checks=[]
for group,rules in [('spirit','ADE'),('focused','AE')]:
 for rule in rules:
  before={r['caseId']:r for r in previous(group+'-'+rule)}
  for r in sets[group+'-'+rule]:
   b=before[r['caseId']]
   for key in ['seed','cap','winner','won','capHit','counts','sources','skills','finalFood','participants']:
    assert r[key]==b[key],(group,rule,r['caseId'],key)
  checks.append({'group':group,'rule':rule,'n':len(before),'exactOutcomeAndTelemetryMatch':True})
(out/'replay-equivalence.json').write_text(json.dumps(checks,indent=2))
for name,rows in sets.items():
 assert len(rows)==len({r['caseId'] for r in rows}),name
 for r in rows:
  for s in r['skills'].values():assert s['uses']==s['reasons'].get('chosen',0)
  if r.get('measurementVersion')==2:
   phases=list(r['phases'].values())
   for k in ['damage','absorbed','heal','shield','starvationDamage']:assert sum(p[k] for p in phases)==r['counts'][k],(name,r['caseId'],k)
   assert r['counts']['shield']==r['counts']['absorbed']+sum(p['expiredOrDispelled']+p['stranded'] for p in phases)+r['shieldRemaining'],(name,r['caseId'],'shield ledger')
 if name!='screen-A' and name not in manifest['historicalSources']:
  with gzip.open(out/(name+'.jsonl.gz'),'wt') as f:
   for r in sorted(rows,key=lambda r:r['caseId']):f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
 manifest['replayed'][name]=sum(r.get('measurementVersion')==2 for r in rows)
manifest['newPrimaryRuns']=sum(manifest['replayed'].values())
(out/'reuse-manifest.json').write_text(json.dumps(manifest,indent=2))
mean=lambda x:statistics.mean(x) if x else 0
duration=lambda r:sum(r['counts']['turns'])/2

def km(rows,q,side=None):
 times=defaultdict(lambda:[0,0])
 for r in rows:
  t=duration(r) if side is None else r['counts']['turns'][r['focalSide'] if side=='focal' else 1-r['focalSide']]
  times[t][int(r['capHit'])]+=1
 risk=len(rows);s=1
 for t,(events,censored) in sorted(times.items()):
  s*=1-events/risk
  if s<=1-q+1e-12:return t
  risk-=events+censored
 return None

def summary(rows):
 d=dict(n=len(rows),clusters=len({r['seed'] for r in rows}),wins=sum(r['won'] is True for r in rows),losses=sum(r['won'] is False for r in rows),naturalDraws=0,capped=sum(r['capHit'] for r in rows),median=km(rows,.5),p90=km(rows,.9),focalMedian=km(rows,.5,'focal'),focalP90=km(rows,.9,'focal'),opponentMedian=km(rows,.5,'other'),opponentP90=km(rows,.9,'other'))
 for t in [25,34,44]:d['over'+str(t)]=mean([max(r['counts']['turns'])>t for r in rows])
 for k in ['damage','absorbed','heal','shield','starvationDamage','healSpiritLost','shieldSpiritLost','nonStackLost','overheal','converted']:d[k]=mean([r['counts'][k] for r in rows])
 d['foodMeanOnTurn']=sum(sum(r['counts']['foodSum']) for r in rows)/sum(sum(r['counts']['turns']) for r in rows)
 d['finalFood']=mean([mean(r['finalFood']) for r in rows])
 d['starvingTurns']=mean([sum(r['counts']['starving']) for r in rows]);d['hungryTurns']=mean([sum(r['counts']['hungry']) for r in rows])
 d['skillUses']=mean([sum(s['uses'] for s in r['skills'].values()) for r in rows])
 return d
summaries={name:summary(rows) for name,rows in sets.items()}
def csvout(name,rows):
 with (out/name).open('w') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
csvout('summary.csv',[dict(dataset=k,**s) for k,s in summaries.items()])
groups=[]
for name,rows in sets.items():
 cells=defaultdict(list)
 for r in rows:
  matchup=r['caseId'].split(':')[1] if name.startswith('pressure') else r.get('stage') or r['profile']
  cells[(matchup,r['level'],'1v1' if len(r['participants'][0])==1 else '3v3')].append(r)
 for (matchup,level,mode),rs in sorted(cells.items()):groups.append(dict(dataset=name,matchup=matchup,level=level,mode=mode,**summary(rs)))
csvout('groups.csv',groups)
phaseRows=[];skillRows=[];recipientRows=[];defenseRows=[]
for name,rows in sets.items():
 exact=[r for r in rows if r.get('measurementVersion')==2]
 if not exact:continue
 for phase in ['before25','25to33','34to43','44plus']:
  totals={k:sum(r['phases'][phase][k] for r in exact) for k in exact[0]['phases'][phase]}
  phaseRows.append(dict(dataset=name,phase=phase,nMeasured=len(exact),nWithTurns=sum(r['phases'][phase]['turns']>0 for r in exact),**totals))
 keys=set(k for r in rows for k in r['skills'])
 for k in sorted(keys):
  ss=[r['skills'][k] for r in rows if k in r['skills']]
  skillRows.append(dict(dataset=name,skill=k,**{f:sum(s[f] for s in ss) for f in ['carriedTurns','actions','legal','affordable','suitable','uses']}))
 for k in sorted({k for r in exact for k in r['support']}):
  ss=[r['support'][k] for r in exact if k in r['support']]
  recipientRows.append(dict(dataset=name,recipientProfessionAndPhase=k,**{f:sum(s[f] for s in ss) for f in ss[0]}))
 for k in sorted({k for r in exact for k in r['defensive']}):
  ss=[r['defensive'][k] for r in exact if k in r['defensive']]
  defenseRows.append(dict(dataset=name,skill=k,**{f:sum(s[f] for s in ss) for f in ss[0]}))
csvout('phases.csv',phaseRows);csvout('skill-opportunities.csv',skillRows);csvout('recipient-support.csv',recipientRows);csvout('skill-sustain-value.csv',defenseRows)
# Actual board seed is the cluster, both side orders stay together.
def paired(control,variant):
 a={r['caseId']:r for r in control};b={r['caseId']:r for r in variant};assert a.keys()==b.keys()
 clusters=defaultdict(list)
 for k in a:
  assert a[k]['seed']==b[k]['seed'] and a[k]['participants']==b[k]['participants']
  clusters[a[k]['seed']].append([float(b[k]['won'] is True)-float(a[k]['won'] is True),duration(b[k])-duration(a[k]),float(b[k]['capHit'])-float(a[k]['capHit'])])
 values=list(clusters.values());rng=random.Random(20261022);boot=[[],[],[]]
 for _ in range(2000):
  sample=[v for _ in values for v in values[rng.randrange(len(values))]]
  for i in range(3):boot[i].append(mean([r[i] for r in sample]))
 d={'clusters':len(values),'n':len(a),'completedFlips':sum(a[k]['won'] is not None and b[k]['won'] is not None and a[k]['won']!=b[k]['won'] for k in a),'censorChanges':sum(a[k]['capHit']!=b[k]['capHit'] for k in a),'longerAtLeast5':sum(duration(b[k])-duration(a[k])>=5 for k in a),'longerAtLeast10':sum(duration(b[k])-duration(a[k])>=10 for k in a)}
 for i,label in enumerate(['observedWinByCap','restrictedDuration','cappedRate']):
  vals=sorted(boot[i]);d[label]={'delta':mean([r[i] for block in values for r in block]),'ci95':[vals[49],vals[1949]]}
 return d
comparisons={}
for group in ['screen','spirit','focused','pressure','campaign','campaign-gear']:
 for control in 'ADE':comparisons[f'{group}:F-{control}']=paired(sets[group+'-'+control],sets[group+'-F'])
(out/'paired-comparisons.json').write_text(json.dumps(comparisons,indent=2))
# Deterministic trace selection, ties by case ID; category samples are descriptive.
allF=[(g,r) for g in ['screen','spirit','focused','pressure','campaign','campaign-gear'] for r in sets[g+'-F']]
def pick(items,key):return sorted(items,key=lambda gr:(-key(gr),gr[1]['caseId']))[0]
controls={g:{r['caseId']:r for r in sets[g+'-D']} for g,_ in allF}
long=pick([(g,r) for g,r in allF if r['profile']=='defense' and not r['capHit']],lambda gr:duration(gr[1]))
# Typical = closest to defense non-censored median, with exposure past34.
defs=[(g,r) for g,r in allF if r['profile']=='defense' and not r['capHit'] and duration(r)>34]
med=statistics.median([duration(r) for _,r in defs]);typical=sorted(defs,key=lambda gr:(abs(duration(gr[1])-med),gr[1]['caseId']))[0]
delta=pick(allF,lambda gr:duration(gr[1])-duration(controls[gr[0]][gr[1]['caseId']]))
flips=[(g,r) for g,r in allF if r['won'] is not None and controls[g][r['caseId']]['won'] is not None and r['won']!=controls[g][r['caseId']]['won']]
flip=pick(flips,lambda gr:duration(gr[1])) if flips else None
caps=[gr for gr in allF if gr[1]['capHit']]
selected=[('typicalLongDefense',typical),('maxLongDefense',long),('largestFminusD',delta)]+([('completedOutcomeFlip',flip)] if flip else [])+([('cap',sorted(caps,key=lambda gr:gr[1]['caseId'])[0])] if caps else [])
if caps:
 least=min(caps,key=lambda gr:((gr[1]['phases']['44plus']['damage']-gr[1]['phases']['44plus']['heal'])/sum(sum(f['maxHp'] for f in side)*(2 if len(side)==1 else 1) for side in gr[1]['participants']),gr[1]['caseId']))
 selected.append(('leastProgressCapped',least))
traces=[]
for reason,(g,r) in selected:
 traces.append(dict(reason=reason,group=g,caseId=r['caseId'],Fturns=duration(r),Dturns=duration(controls[g][r['caseId']]),Fwon=r['won'],Dwon=controls[g][r['caseId']]['won'],capHit=r['capHit']))
(out/'trace-manifest.json').write_text(json.dumps(traces,indent=2))
print(json.dumps({'summaries':summaries,'traces':traces,'newPrimaryRuns':manifest['newPrimaryRuns']},indent=2))

# Floor exposure is descriptive. Net HP loss distinguishes progress from recovered damage.
late=[]
for group,r in allF:
 if r.get('measurementVersion')!=2 or r['phases']['44plus']['turns']==0:continue
 p=r['phases']['44plus'];initial=sum(sum(f['maxHp'] for f in side)*(2 if len(side)==1 else 1) for side in r['participants'])
 late.append(dict(group=group,caseId=r['caseId'],capHit=r['capHit'],duration=duration(r),ordinaryTurns44plus=p['turns'],heal=p['heal'],damage=p['damage'],netHpDrain=p['damage']-p['heal'],initialTotalHp=initial,netHpDrainRatio=(p['damage']-p['heal'])/initial,newShield=p['shield'],absorbed=p['absorbed'],starvationDamage=p['starvationDamage']))
csvout('floor-exposure.csv',late)

cells=[]
for rule in 'ADEF':
 strata=defaultdict(list)
 for r in sets['screen-'+rule]:strata[(r['profession'],r['element'],r['level'],'1v1' if len(r['participants'][0])==1 else '3v3')].append(r)
 for (profession,element,level,mode),rs in sorted(strata.items()):cells.append(dict(rule=rule,profession=profession,element=element,level=level,mode=mode,**summary(rs)))
csvout('screen-cells.csv',cells)
