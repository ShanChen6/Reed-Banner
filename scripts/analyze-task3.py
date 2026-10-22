"""Paired parameter comparisons under the frozen task2 AI and F. Never pool censored endings."""
import csv,gzip,json,statistics,random,sys
from pathlib import Path
from collections import defaultdict,Counter
out=Path(sys.argv[1] if len(sys.argv)>1 else 'docs/reports/2026-10-22-balance-f')
def load(group,variant):
 paths=sorted(out.glob(f'{group}-{variant}-[0-9].jsonl')) or sorted(out.glob(f'{group}-{variant}-[0-9].jsonl.gz'))
 return [json.loads(l) for p in paths for l in (gzip.decompress(p.read_bytes()).decode() if p.suffix=='.gz' else p.read_text()).splitlines()]
def km(rs,q):
 by=defaultdict(lambda:[0,0])
 for r in rs:by[sum(r['turns'])/2][int(r['capped'])]+=1
 risk=len(rs);survival=1
 for t,(ended,censored) in sorted(by.items()):
  survival*=1-ended/risk
  if survival<=1-q+1e-12:return t
  risk-=ended+censored
 return None
def summary(rs):
 return {'n':len(rs),'pairs':len({r['pair'] for r in rs}),'seedClusters':len({r['seed'] for r in rs}),'wins':sum(r['won'] is True for r in rs),'losses':sum(r['won'] is False for r in rs),'cap':sum(r['capped'] for r in rs),'medianKM':km(rs,.5),'p90KM':km(rs,.9),**{f'over{x}':sum(max(r['turns'])>x for r in rs)/len(rs) for x in [25,34,44]},**{k:statistics.mean(r['totals'][k] for r in rs) for k in ['damage','heal','shield','absorbed','expired','healSpiritLost','shieldSpiritLost','overheal','nonStackLost','starvation']}}
def compare(before,after):
 b={r['id']:r for r in before};a={r['id']:r for r in after};assert a.keys()==b.keys() and len(a)==len(after) and len(b)==len(before)
 clusters=defaultdict(list)
 for id in b:
  x,y=b[id],a[id];assert x['seed']==y['seed'] and x['equipment']==y['equipment']
  clusters[x['seed']].append([sum(y['turns'])/2-sum(x['turns'])/2,int(y['capped'])-int(x['capped']),int(y['won'] is True)-int(x['won'] is True)])
 blocks=list(clusters.values());rng=random.Random(20261023);boots=[[],[],[]]
 for _ in range(1000):
  sample=[x for _ in blocks for x in rng.choice(blocks)]
  for i in range(3):boots[i].append(statistics.mean(x[i] for x in sample))
 return {'before':summary(before),'after':summary(after),'newCaps':sum(not b[id]['capped'] and a[id]['capped'] for id in b),'removedCaps':sum(b[id]['capped'] and not a[id]['capped'] for id in b),'completedWinnerFlips':sum(b[id]['won'] is not None and a[id]['won'] is not None and b[id]['won']!=a[id]['won'] for id in b),'paired':{label:{'delta':statistics.mean(x[i] for block in blocks for x in block),'ci95':[sorted(boots[i])[24],sorted(boots[i])[974]]} for i,label in enumerate(['restrictedDuration','capRate','observedWinsByCap'])}}
def csvout(path,rows):
 if not rows:return
 with (out/path).open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
results={}
for group in ['tuning','screen','validation','identity','gear','sets']:
 baseline=load(group,'baseline')
 if group=='screen' and not baseline:
  prior=Path('docs/reports/2026-10-22-ai-f')
  baseline=[json.loads(line) for p in sorted(prior.glob('screen-after-[0-9].jsonl.gz')) for line in gzip.decompress(p.read_bytes()).decode().splitlines()]
 if not baseline:continue
 for variant in ['shield18','heal20','both','shield35']:
  after=load(group,variant)
  expected={'tuning':48,'screen':1680,'validation':1680,'identity':24,'gear':96,'sets':108}[group]
  if len(after)!=expected or len(baseline)!=expected or {r['id'] for r in after}!={r['id'] for r in baseline}:continue
  result=compare(baseline,after);results[group+'-'+variant]=result
  (out/f'{group}-{variant}-comparison.json').write_text(json.dumps(result,indent=2)+'\n')
  if group in ['screen','validation','identity','gear','sets']:
   rows=[]
   for dimension in ['profession','element','level','equipment','mode','profile','opponentProfile']+(['identity'] if group=='identity' else ['gearChannel'] if group=='gear' else ['focalSet','opponentSet'] if group=='sets' else []):
    for value in sorted({r[dimension] for r in after},key=str):
     left=[r for r in baseline if r[dimension]==value];right=[r for r in after if r[dimension]==value]
     rows.append({'dimension':dimension,'value':value,**{'before_'+k:v for k,v in summary(left).items()},**{'after_'+k:v for k,v in summary(right).items()}})
   csvout(f'{group}-{variant}-groups.csv',rows)
   for label,rs in [('before',baseline),('after',after)]:
    active=defaultdict(Counter);passive=defaultdict(Counter);contribution=defaultdict(Counter)
    for r in rs:
     t=r['totals'];assert t['shield']==t['absorbed']+t['expired']+t['stranded']+r['remaining']
     for k in ['damage','heal','shield']:assert t[k]==sum(e[k] for e in r['contribution'].values())
     for s in r['skills'].values():
      assert s['uses']==s['reasons'].get('chosen',0)
      for k in ['actions','carried','affordable','executable','uses']:active[s['id']][k]+=s[k]
     for id,p in r['passive'].items():
      for k in ['carriedTurns','candidates','triggered','opened','used','expired','broken','holderTurns']:passive[id][k]+=p[k]
     for id,e in r['contribution'].items():
      parts=id.split(':');key=parts[0]+':'+parts[-1] if parts[0] in ['active','passive','prepared'] else id
      contribution[key].update(e)
    for name,table in [('active',active),('passive',passive),('contribution',contribution)]:
     keys=sorted({k for v in table.values() for k in v});csvout(f'{group}-{variant}-{label}-{name}.csv',[{'id':id,**{k:v[k] for k in keys}} for id,v in sorted(table.items())])
print(json.dumps(results,indent=2))
