"""F-only diagnosis; cluster repeated board seeds and retain censored durations."""
import csv,gzip,json,random,statistics,hashlib,sys
from pathlib import Path
from collections import defaultdict,Counter
out=Path(sys.argv[1] if len(sys.argv)>1 else 'docs/reports/2026-10-22-ai-f')
def load(pattern):
 paths=sorted(out.glob(pattern)) or sorted(out.glob(pattern+'.gz'))
 return [json.loads(line) for p in paths for line in (gzip.decompress(p.read_bytes()).decode() if p.suffix=='.gz' else p.read_text()).splitlines() if line]
rs=load('screen-after-[0-9].jsonl')
assert len(rs)==1680 and len({r['id'] for r in rs})==1680,len(rs)
assert len({r['sourceHash'] for r in rs})==1
for r in rs:
 assert r['rule']=='F' and sum(r['turns'])<=120
 t=r['totals'];assert t['shield']==t['absorbed']+t['expired']+t['stranded']+r['remaining']
 for k in ['damage','heal','shield']:
  assert t[k]==sum(c[k] for c in r['contribution'].values()),(r['id'],k)
 for s in r['skills'].values():assert s['uses']==s['reasons'].get('chosen',0)
 for p in r['passive'].values():assert p['used']+p['expired']+p['broken']<=p['opened']
def csvout(name,rows):
 with (out/name).open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
def km(rows,q):
 by=defaultdict(lambda:[0,0])
 for r in rows:by[sum(r['turns'])/2][int(r['capped'])]+=1
 risk=len(rows);surv=1
 for time,(ended,censored) in sorted(by.items()):
  surv*=1-ended/risk
  if surv<=1-q+1e-12:return time
  risk-=ended+censored
 return None
def summary(rows):
 return {'n':len(rows),'pairs':len({r['pair'] for r in rows}),'seedClusters':len({r['seed'] for r in rows}),'wins':sum(r['won'] is True for r in rows),'losses':sum(r['won'] is False for r in rows),'draws':sum(r['draw'] for r in rows),'capped':sum(r['capped'] for r in rows),'medianKM':km(rows,.5),'p90KM':km(rows,.9),**{f'over{n}':sum(max(r['turns'])>n for r in rows)/len(rows) for n in [25,34,44]},**{k:sum(r['totals'][k] for r in rows)/len(rows) for k in rows[0]['totals']},'foodPerTurn':sum(sum(r['foodSum']) for r in rows)/sum(sum(r['turns']) for r in rows),'starvingTurns':sum(sum(r['starving']) for r in rows)}
base=summary(rs)
groups=[{'dimension':'all','value':'all',**base}]
for key in ['mode','profession','element','level','equipment','profile','opponentProfile']:
 for value in sorted({r[key] for r in rs},key=str):groups.append({'dimension':key,'value':value,**summary([r for r in rs if r[key]==value])})
csvout('groups.csv',groups)
clusters=defaultdict(list)
for r in rs:clusters[r['seed']].append(r)
rng=random.Random(20261022);blocks=list(clusters.values());boot=[]
for _ in range(1000):
 sample=[r for _ in blocks for r in rng.choice(blocks)]
 boot.append([sum(r['won'] is True for r in sample)/len(sample),sum(r['capped'] for r in sample)/len(sample),km(sample,.5),km(sample,.9)])
base['clusterBootstrap95']={label:[sorted(b[i] for b in boot)[24],sorted(b[i] for b in boot)[974]] for i,label in enumerate(['observedWinByCap','capRate'])}
base['durationBootstrap95']={label:[sorted(b[i] for b in boot if b[i] is not None)[24],sorted(b[i] for b in boot if b[i] is not None)[974]] for i,label in [(2,'medianKM'),(3,'p90KM')]}
(out/'summary.json').write_text(json.dumps(base,indent=2))
sideRows=[]
for mode in ['all','1v1','3v3']:
 subset=rs if mode=='all' else [r for r in rs if r['mode']==mode]
 for label in ['focal','opponent']:
  transformed=[{**r,'turns':[2*r['turns'][r['focalSide'] if label=='focal' else 1-r['focalSide']],0]} for r in subset]
  sideRows.append({'mode':mode,'side':label,'n':len(subset),'medianKM':km(transformed,.5),'p90KM':km(transformed,.9)})
csvout('duration-per-side.csv',sideRows)
active=defaultdict(Counter);passive=defaultdict(Counter);sources=defaultdict(Counter)
for r in rs:
 for s in r['skills'].values():
  x=active[s['id']]
  for k in ['carried','actions','legal','affordable','targetable','useful','executable','uses']:x[k]+=s[k]
  for reason,n in s['reasons'].items():x['reason_'+reason]+=n
 for id,p in r['passive'].items():
  x=passive[id]
  for k in ['carriedTurns','candidates','triggered','opened','used','expired','broken','holderTurns']:x[k]+=p[k]
  for reason,n in p['reasons'].items():x['reason_'+reason]+=n
 for key,c in r['contribution'].items():
  category=key.split(':')[0];id=key.split(':')[-1] if category in ['active','passive','prepared'] else key
  for k,v in c.items():sources[category+':'+id][k]+=v
keys=sorted({k for x in active.values() for k in x});csvout('active.csv',[{'id':id,**{k:x[k] for k in keys},'usesPerExecutable':x['uses']/x['executable'] if x['executable'] else None} for id,x in sorted(active.items())])
keys=sorted({k for x in passive.values() for k in x});csvout('passive.csv',[{'id':id,**{k:x[k] for k in keys},'pending':x['opened']-x['used']-x['expired']-x['broken']} for id,x in sorted(passive.items())])
keys=sorted({k for x in sources.values() for k in x});csvout('contribution.csv',[{'source':id,**{k:x[k] for k in keys}} for id,x in sorted(sources.items())])
pairs=defaultdict(list)
for r in rs:pairs[r['pair']].append(r)
# Predeclared anomaly score: capped first, then duration, then defensive throughput. Select 12 independent scenario pairs.
ranked=sorted(pairs,key=lambda p:(-sum(r['capped'] for r in pairs[p]),-max(sum(r['turns']) for r in pairs[p]),-sum(r['totals']['heal']+r['totals']['absorbed'] for r in pairs[p]),p))
selected=ranked[:12]
(out/'expand-pairs.json').write_text(json.dumps(selected,indent=2))
(out/'anomalies.json').write_text(json.dumps([{'pair':p,'mode':pairs[p][0]['mode'],'equipment':pairs[p][0]['equipment'],'level':pairs[p][0]['level'],'profile':pairs[p][0]['profile'],'opponentProfile':pairs[p][0]['opponentProfile'],'capped':sum(r['capped'] for r in pairs[p]),'maxSideTurns':max(max(r['turns']) for r in pairs[p]),'healing':sum(r['totals']['heal'] for r in pairs[p])} for p in selected],indent=2))
# Evidence trajectories: last ten observed turn boundaries; no inference that HP throughput is a permanent loop.
traces=[]
for p in selected[:4]:
 r=max(pairs[p],key=lambda r:sum(r['turns']))
 traces.append({'id':r['id'],'capped':r['capped'],'lastWindows':r['trajectory'][-10:],'limits':r['limits'],'maxDepth':r['maxDepth']})
(out/'progress-windows.json').write_text(json.dumps(traces,indent=2))
before=load('diagnostic-before-0.jsonl');after=load('diagnostic-after-0.jsonl')
if len(before)==len(after)==72:
 b={r['id']:r for r in before};a={r['id']:r for r in after};assert b.keys()==a.keys()
 changes=[]
 for id in b:
  assert b[id]['seed']==a[id]['seed']
  if any(b[id][k]!=a[id][k] for k in ['turns','won','totals','skills']):changes.append(id)
 (out/'ai-comparison.json').write_text(json.dumps({'nPerRevision':72,'matchedPairsOfRuns':72,'orientationPairs':36,'before':summary(before),'after':summary(after),'changedOutcomesOrTelemetry':len(changes),'changedIds':changes,'scope':'AI correction only; F, skills, gear and seed held fixed; RNG trajectories may diverge'},indent=2))
 evidence=[]
 for r in after:
  for d in r['decisions']:
   if any(x['id'] in ['role_lyGian','role_phanKich','role_doatMenh'] for x in d['rows']):
    evidence.append({'case':r['id'],'decision':d})
 selected=defaultdict(list)
 for entry in evidence:
  for row in entry['decision']['rows']:
   if row['id'] in ['role_lyGian','role_phanKich','role_doatMenh']:
    key=row['id']+':'+row['reason']
    if len(selected[key])<3:selected[key].append(entry)
 (out/'rare-decisions.json').write_text(json.dumps(dict(selected),indent=2))
expanded=load('expanded-after-0.jsonl')
if expanded:
 assert len(expanded)==48
 (out/'expanded-summary.json').write_text(json.dumps(summary(expanded),indent=2))
# Conditional rare-skill context; decision snapshots have a per-battle cap, denominators explicitly reported.
casefile=out/'screen-after-0-cases.json.gz'
cases={c['id']:c for c in json.loads(gzip.decompress(casefile.read_bytes()))};context={}
for id in ['role_doatMenh','role_lyGian','role_phanKich']:
 data=[]
 for r in rs:
  for d in r['decisions']:
   row=next((x for x in d['rows'] if x['id']==id),None)
   if not row:continue
   conditions={'solo':r['mode']=='1v1','affordable':d['energy']>=row['cost']}
   if id=='role_doatMenh':
    t=row.get('target',0);t=0 if t is None else t;foe=1-d['side'];hp=d['hp'][foe][t]['hp'];maxhp=cases[r['id']]['matchup']['sides'][foe]['fighters'][t]['maxHp']*(2 if r['mode']=='1v1' else 1);conditions['executeTarget']=hp/maxhp<=.35
   data.append({'reason':row['reason'],'spentBefore':d['spentBefore'],'score':row['score'],**conditions})
 context[id]={'capturedDecisions':len(data),'allActorDecisions':sum(s['actions'] for r in rs for s in r['skills'].values() if s['id']==id),'medianEnergySpentBefore':statistics.median([x['spentBefore'] for x in data]) if data else None,'soloChosen':sum(x['solo'] and x['reason']=='chosen' for x in data),'teamChosen':sum(not x['solo'] and x['reason']=='chosen' for x in data)}
 if id=='role_doatMenh':context[id].update(executeTarget=sum(x['executeTarget'] for x in data),executeAffordable=sum(x['executeTarget'] and x['affordable'] for x in data),executeChosen=sum(x['executeTarget'] and x['reason']=='chosen' for x in data),savingWithExecute=sum(x['executeTarget'] and x['reason']=='saving' for x in data))
(out/'rare-context.json').write_text(json.dumps(context,indent=2))
lookup={r['id']:r for r in rs};checked=0
for r in after:
 for field in ['turns','won','totals','skills','passive','limits','contribution','trajectory']:
  assert r[field]==lookup[r['id']][field],(r['id'],field)
 checked+=1
traceChecked=0
for path in sorted((out/'traces').glob('*/*.jsonl*')):
 for line in (gzip.decompress(path.read_bytes()).decode() if path.suffix=='.gz' else path.read_text()).splitlines():
  r=json.loads(line)
  for field in ['turns','won','totals','skills','passive','limits','contribution','trajectory']:assert r[field]==lookup[r['id']][field],(r['id'],field)
  traceChecked+=1
(out/'validation.json').write_text(json.dumps({'screenRuns':1680,'orientationPairs':840,'seedClusters':len(clusters),'sourceHash':rs[0]['sourceHash'],'shieldAndContributionReconciliation':True,'skillChoiceUseReconciliation':True,'diagnosticAfterReplayMatchesScreen':checked,'traceReplayMatchesScreen':traceChecked,'expandedRuns':len(expanded)},indent=2))
print(json.dumps(base,indent=2))
