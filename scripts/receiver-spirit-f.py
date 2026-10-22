import json,gzip,csv,pathlib
out=pathlib.Path('docs/reports/2026-10-22-spirit-f');rows=[]
for path in sorted(out.glob('trace-*.jsonl.gz')):
 with gzip.open(path,'rt') as f:r=json.load(f)
 bins=['before25','25to33','34to43','44plus'];metrics={b:{'heal':0,'shield':0,'absorbed':0,'damage':0,'ko':0,'skillUses':0} for b in bins};turns=[1,0]
 for chunk in r['trace']:
  for e in chunk.get('events',[]):
   if e['type']=='auditTurn':turns[e['side']]=(e['number']+1)//2
   if 'side' not in e:continue
   n=turns[e['side']];b=bins[0 if n<25 else 1 if n<34 else 2 if n<44 else 3];m=metrics[b]
   if e['type']=='sustain':m[e['kind']]+=e['effective']
   if e['type']=='damage':m['damage']+=e['amount'];m['absorbed']+=e['absorbed']
   if e['type']=='ko':m['ko']+=1
   if e['type']=='skill':m['skillUses']+=1
 for b,m in metrics.items():rows.append(dict(file=path.name,caseId=r['caseId'],rule=r['rule'],receiverOwnTurns=b,**m))
with (out/'trace-receiver-windows.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
# Late support opportunities in selected traces only; actor's own ordinary turn.
from collections import defaultdict
opportunities=[]
for path in sorted(out.glob('trace-*.jsonl.gz')):
 with gzip.open(path,'rt') as f:r=json.load(f)
 stats=defaultdict(lambda:{'decisions':0,'eligible':0,'uses':0})
 for d in r['trace']:
  if 'rows' not in d:continue
  n=(d['turn']+1)//2;b=bins[0 if n<25 else 1 if n<34 else 2 if n<44 else 3]
  for skill in d['rows']:
   if skill['id'] not in ['role_linhDuoc','role_duongSinh','role_thuThanh','role_tuongKhien']:continue
   s=stats[(b,skill['id'])];s['decisions']+=1
   s['eligible']+=skill['reason'] not in ['slotUsed','silenced'] and d['energy']>=skill['cost'] and skill['score']>0
   s['uses']+=d['choice'] is not None and d['choice'].get('type')=='skill' and d['choice'].get('skill')==skill['id']
 for (b,skill),s in sorted(stats.items()):opportunities.append(dict(file=path.name,rule=r['rule'],actorOwnTurns=b,skill=skill,**s))
with (out/'late-role-opportunities-traces.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(opportunities[0]));w.writeheader();w.writerows(opportunities)
