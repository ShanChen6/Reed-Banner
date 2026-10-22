"""Fresh matched controls. Old Spirit datasets are not inputs to this experiment."""
import csv,gzip,json,statistics,random,hashlib,sys
from collections import defaultdict
from pathlib import Path
src=Path(sys.argv[1] if len(sys.argv)>1 else '/workspace/combo-audit');out=Path('docs/reports/2026-10-22-combo');out.mkdir(exist_ok=True)
sets={}
for group,n in [('screen',1344),('focused',192),('campaign',24)]:
 for mode in ['off','on']:
  files=sorted(src.glob(f'{group}-{mode}-[0-9].jsonl'));rows=[json.loads(l) for p in files for l in p.read_text().splitlines()];assert len(rows)==n,(group,mode,len(rows));assert len({r['caseId'] for r in rows})==n
  for r in rows:
   assert r['rule']=='A' and r['cap']==120 and r['ai']=='after'
   assert r['combos']['opened']==sum(r['combos'][k] for k in ['used','expired','broken','pending'])
   assert all(s['uses']==s['reasons'].get('chosen',0) for s in r['skills'].values())
   if mode=='off':assert r['combos']['opened']==r['combos']['used']==0
  sets[group+'-'+mode]=rows
  with gzip.open(out/f'{group}-{mode}.jsonl.gz','wt') as f:
   for r in sorted(rows,key=lambda r:r['caseId']):f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
mean=lambda xs:statistics.mean(xs) if xs else 0
time=lambda r:sum(r['counts']['turns'])/2

def km(rs,q):
 times=defaultdict(lambda:[0,0])
 for r in rs:times[time(r)][int(r['capHit'])]+=1
 risk=len(rs);s=1
 for t,(events,censored) in sorted(times.items()):
  s*=1-events/risk
  if s<=1-q+1e-12:return t
  risk-=events+censored
 return None

def summary(rs):
 return dict(n=len(rs),clusters=len({r['seed'] for r in rs}),wins=sum(r['won'] is True for r in rs),losses=sum(r['won'] is False for r in rs),draws=0,capped=sum(r['capHit'] for r in rs),median=km(rs,.5),p90=km(rs,.9),over25=mean([max(r['counts']['turns'])>25 for r in rs]),over34=mean([max(r['counts']['turns'])>34 for r in rs]),over44=mean([max(r['counts']['turns'])>44 for r in rs]),**{k:sum(r['combos'][k] for r in rs) for k in ['opened','used','expired','broken','pending']},**{k:mean([r['counts'][k] for r in rs]) for k in ['damage','heal','shield','absorbed','starvationDamage']},foodOnTurn=sum(sum(r['counts']['foodSum']) for r in rs)/sum(sum(r['counts']['turns']) for r in rs))
def csvout(name,rows):
 with (out/name).open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
summaryrows=[dict(dataset=k,**summary(v)) for k,v in sets.items()];csvout('summary.csv',summaryrows)
modeRows=[]
for name,rs in sets.items():
 for mode in ['solo','team']:
  subset=[r for r in rs if (len(r['participants'][0])==len(r['participants'][1])==1)==(mode=='solo')]
  if subset:modeRows.append(dict(dataset=name,mode=mode,**summary(subset)))
csvout('modes.csv',modeRows)
passiveRows=[]
for name,rs in sets.items():
 ids={k for r in rs for k in r['combos']['byPassive']}
 for k in sorted(ids):
  totals={f:sum(r['combos']['byPassive'].get(k,{}).get(f,0) for r in rs) for f in ['opened','used','expired','broken']}
  passiveRows.append(dict(dataset=name,passive=k,**totals,pending=totals['opened']-totals['used']-totals['expired']-totals['broken']))
csvout('passives.csv',passiveRows)
comparisons={};solo=0
for group in ['screen','focused','campaign']:
 off={r['caseId']:r for r in sets[group+'-off']};on={r['caseId']:r for r in sets[group+'-on']};assert off.keys()==on.keys();blocks=defaultdict(list)
 for k,a in off.items():
  b=on[k];assert a['seed']==b['seed'] and a['participants']==b['participants']
  if len(a['participants'][0])==len(a['participants'][1])==1:
   for field in ['winner','capHit','counts','skills','sources','finalFood']:assert a[field]==b[field],(k,field)
   assert b['combos']['opened']==0;solo+=1
  blocks[a['seed']].append([time(b)-time(a),float(b['capHit'])-float(a['capHit']),float(b['won'] is True)-float(a['won'] is True)])
 vals=list(blocks.values());rng=random.Random(20261022);boots=[[],[],[]]
 for _ in range(2000):
  sample=[r for _ in vals for r in vals[rng.randrange(len(vals))]]
  for i in range(3):boots[i].append(mean([r[i] for r in sample]))
 d={'n':len(off),'clusters':len(vals),'completedFlips':sum(a['won'] is not None and on[k]['won'] is not None and a['won']!=on[k]['won'] for k,a in off.items()),'newCaps':sum(not a['capHit'] and on[k]['capHit'] for k,a in off.items()),'removedCaps':sum(a['capHit'] and not on[k]['capHit'] for k,a in off.items())}
 for i,label in enumerate(['restrictedDuration','cappedRate','observedWinByCap']):
  bs=sorted(boots[i]);d[label]={'delta':mean([v[i] for block in vals for v in block]),'ci95':[bs[49],bs[1949]]}
 comparisons[group]=d
(out/'paired-comparisons.json').write_text(json.dumps(comparisons,indent=2))
(out/'validation.json').write_text(json.dumps({'newPrimaryRuns':3120,'noArchivedSpiritOutcomesUsed':True,'matchedSoloCasesExactlyEqual':solo,'comboConservation':True,'sameParticipantsSeedsAndCap':True},indent=2))
# Diagnostic selections, never pooled into primary n.
allOn=[(g,r) for g in ['screen','focused','campaign'] for r in sets[g+'-on'] if r['combos']['used']>0]
offLookup={(g,r['caseId']):r for g in ['screen','focused','campaign'] for r in sets[g+'-off']}
selected=[];seen=set()
def pick(reason,rows,key):
 for g,r in sorted(rows,key=lambda x:(-key(x),x[1]['caseId'])):
  if r['caseId'] in seen:continue
  b=offLookup[g,r['caseId']];selected.append(dict(reason=reason,group=g,caseId=r['caseId'],onTurns=time(r),offTurns=time(b),onWon=r['won'],offWon=b['won'],onCap=r['capHit']));seen.add(r['caseId']);break
flips=[x for x in allOn if x[1]['won'] is not None and offLookup[x[0],x[1]['caseId']]['won'] is not None and x[1]['won']!=offLookup[x[0],x[1]['caseId']]['won']]
pick('earlierCompletedFlip',flips,lambda x:time(offLookup[x[0],x[1]['caseId']])-time(x[1]))
pick('mostRetaliations',allOn,lambda x:x[1]['combos']['byPassive'].get('retaliation',{}).get('used',0))
pick('mostRenewals',allOn,lambda x:x[1]['combos']['byPassive'].get('renewal',{}).get('used',0))
pick('longTailRisk',[x for x in allOn if x[1]['capHit']] or allOn,lambda x:time(x[1])-time(offLookup[x[0],x[1]['caseId']]))
(out/'trace-manifest.json').write_text(json.dumps(selected,indent=2))
print(json.dumps({'summary':summaryrows,'paired':comparisons,'traces':selected,'soloExactlyEqual':solo},indent=2))

revision={}
for group in ['screen','focused','campaign']:
 p=src/f'revision-{group}.json'
 if p.exists():
  rows=json.loads(p.read_text());revision[group]={'replayed':sum(r['replayed'] for r in rows),'reusedOn':sum(not r['replayed'] for r in rows),'cases':rows}
(out/'ai-revision-reuse.json').write_text(json.dumps({'change':'Only dispel scoring adds comboOpportunityValue; zero when no ready opportunity exists.','offReused':1560,'onGroups':revision},indent=2))

v=json.loads((out/'validation.json').read_text())
v['primaryObservations']=3120
v['initialFreshRuns']=3120
v['aiCorrectionReruns']=sum(g['replayed'] for g in revision.values())
v['measuredRunsExcludingPilotAndTrace']=3120+v['aiCorrectionReruns']
v['archivedABaselineRegressionCases']=1344
(out/'validation.json').write_text(json.dumps(v,indent=2))
