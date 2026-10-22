"""Replay deterministic selections without counting them as new primary observations."""
import concurrent.futures,csv,gzip,json,pathlib,subprocess
out=pathlib.Path('docs/reports/2026-10-22-spirit-f');src=pathlib.Path('/workspace/spirit-f')
manifest=json.loads((out/'trace-manifest.json').read_text());jobs=[]
for i,t in enumerate(manifest):
 for rule in 'FD':jobs.append((i,t,rule))
# All four policies on the largest F-D tail change.
i=next(i for i,t in enumerate(manifest) if t['reason']=='largestFminusD')
for rule in 'AE':jobs.append((i,manifest[i],rule))
def run(job):
 i,t,rule=job;name=f'trace-{i}-{t["reason"]}-{rule}';path=src/(name+'.jsonl')
 if not path.exists():
  with path.open('w') as f:subprocess.run(['/workspace/onboarding/pnpm','exec','tsx','scripts/spirit-f-audit.ts','--group',t['group'],'--rule',rule,'--trace',t['caseId']],stdout=f,check=True)
 row=json.loads(path.read_text());assert row['caseId']==t['caseId']
 with gzip.open(out/(name+'.jsonl.gz'),'wt') as f:f.write(path.read_text())
 rows=[]
 for label,lo,hi in [('25to33',25,33),('34to43',34,43),('44plus',44,60),('last10',51,60)]:
  events=[e for chunk in row['trace'] for e in chunk.get('events',[]) if lo<=(e['atTurn']+1)//2<=hi]
  heal=sum(e['effective'] for e in events if e['type']=='sustain' and e['kind']=='heal');damage=sum(e['amount'] for e in events if e['type']=='damage')
  uses={}
  for e in events:
   if e['type']=='skill':uses[e['skill']]=uses.get(e['skill'],0)+1
  rows.append(dict(file=name,reason=t['reason'],caseId=t['caseId'],rule=rule,window=label,damage=damage,heal=heal,netHpDrain=damage-heal,initialTeamHp=sum(sum(f['maxHp'] for f in s)*(2 if len(s)==1 else 1) for s in row['participants']),absorbed=sum(e['absorbed'] for e in events if e['type']=='damage'),newShield=sum(e['effective'] for e in events if e['type']=='sustain' and e['kind']=='shield'),ko=sum(e['type']=='ko' for e in events),ordinaryTurns=sum(e['type']=='auditTurn' for e in events),skills=json.dumps(uses),capHit=row['capHit']))
 return rows
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:rows=[r for group in ex.map(run,jobs) for r in group]
with (out/'trace-windows.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
print(json.dumps({'traces':len(jobs),'windows':len(rows)}))
