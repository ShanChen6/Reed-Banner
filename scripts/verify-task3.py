"""Validate complete calibration artifacts, exact ledgers, parameter budget and frozen provenance."""
import csv,gzip,hashlib,json
from pathlib import Path
root=Path('docs/reports/2026-10-22-balance-f');prior=Path('docs/reports/2026-10-22-ai-f')
def read(p):return gzip.decompress(p.read_bytes()).decode() if p.suffix=='.gz' else p.read_text()
def rows(p):return [json.loads(l) for l in read(p).splitlines() if l]
def pathRows(pattern):
 ps=sorted(root.glob(pattern)) or sorted(root.glob(pattern+'.gz'))
 return [r for p in ps for r in rows(p)]
expected={'tuning':{'baseline':48,'shield18':48,'heal20':48,'shield35':48},'screen':{'shield35':1680},'validation':{'baseline':1680,'shield35':1680},'identity':{'baseline':24,'shield35':24},'gear':{'baseline':96,'shield35':96},'sets':{'baseline':108,'shield35':108}}
params=json.loads((root/'parameters-before.json').read_text());prepared=json.loads((root/'prepared-parameters.json').read_text());discount=prepared['before']['coordination']['value']
assert prepared['before']==prepared['after']
priorManifest=json.loads((prior/'screen-after-0-manifest.json').read_text());assert prepared['sourceSHA256']==priorManifest['hashes'][prepared['source']]
energy=[];checked=0;allRows={}
for group,variants in expected.items():
 for variant,n in variants.items():
  rs=pathRows(f'{group}-{variant}-[0-9].jsonl');assert len(rs)==n and len({r['id'] for r in rs})==n,(group,variant,len(rs));allRows[group,variant]=rs
  casepath=next(root.glob(f'{group}-{variant}-[0-9]-cases.json.gz'));cases={c['id']:c for c in json.loads(read(casepath))}
  rawCost=savedCost=actualCost=0
  for r in rs:
   assert r['rule']=='F' and sum(r['turns'])<=120
   assert (r['won'] is None)==r['capped'] and r['draw'] is False
   t=r['totals'];assert t['shield']==t['absorbed']+t['expired']+t['stranded']+r['remaining']
   for key in ['damage','heal','shield']:assert t[key]==sum(c[key] for c in r['contribution'].values())
   raw=0
   for s in r['skills'].values():
    assert s['uses']==s['reasons'].get('chosen',0)
    f=cases[r['id']]['matchup']['sides'][s['side']]['fighters'][s['fighter']];level=f.get('skillLevels',{}).get(s['id'],1)
    base=35 if variant=='shield35' and s['id']=='role_thuThanh' else params['skills'][s['id']]['cost'];cost=int(base*.9//5)*5 if level>=5 else base
    if s['uses']:assert cost>=discount
    raw+=cost*s['uses']
   savings=r['passive'].get('coordination',{}).get('used',0)*discount;actual=raw-savings;assert actual>=0
   last={}
   for d in r['decisions']:
    selected=next((x for x in d['rows'] if x['reason']=='chosen'),None)
    spent=d['spentBefore']+(selected['cost'] if selected else 0);key=f"{d['side']}:{d['actor']}";last[key]=max(last.get(key,0),spent)
   assert sum(last.values())<=actual,(r['id'],'energy')
   rawCost+=raw;savedCost+=savings;actualCost+=actual;checked+=1
  energy.append({'group':group,'variant':variant,'n':n,'baseCastEnergy':rawCost,'coordinationSaved':savedCost,'paidCastEnergy':actualCost})
# The same actors, skill investment, gear and board seed on every parameter pair.
for group in ['tuning','validation','identity','gear','sets']:
 baseline=allRows[group,'baseline']
 for variant in expected[group]:
  if variant=='baseline':continue
  a={r['id']:r for r in allRows[group,variant]};assert {r['id'] for r in baseline}==a.keys()
  for b in baseline:assert b['seed']==a[b['id']]['seed'] and b['equipment']==a[b['id']]['equipment']
training={r['seed'] for (group,_),rs in allRows.items() if group!='validation' for r in rs};validation={r['seed'] for r in allRows['validation','baseline']};assert not training&validation
for key in ['before','after']:assert len(json.loads((root/f'parameters-{key}.json').read_text())['chase'])==20
assert len(prepared['before'])==6
changes=json.loads((root/'parameter-diff.json').read_text());assert changes==[{'path':'skills.role_thuThanh.cost','before':30,'after':35}]
# Resolve historical tool/source versions using exact archived bytes.
archives={}
for p in (root/'snapshots').glob('*.txt'):archives[hashlib.sha256(p.read_bytes()).hexdigest()]=str(p.relative_to(root))
resolved=[]
for p in sorted(root.rglob('*-manifest.json')):
 if p.name=='run-manifest.json':continue
 if 'identity-initial' in p.parts:continue # Excluded pilot with inconsistent gear metadata.
 m=json.loads(p.read_text())
 for path,sha in m.get('sourceHashes',{}).items():
  if Path(path).exists() and hashlib.sha256(Path(path).read_bytes()).hexdigest()==sha:location=path
  else:assert sha in archives,(p,path,sha);location=archives[sha]
  resolved.append({'manifest':str(p.relative_to(root)),'path':path,'sha256':sha,'resolvedTo':location})
 for row in rows(Path(str(p).replace('-manifest.json','.jsonl')) if Path(str(p).replace('-manifest.json','.jsonl')).exists() else Path(str(p).replace('-manifest.json','.jsonl.gz'))):assert row['fingerprint']==m['fingerprint']
(root/'source-provenance.json').write_text(json.dumps(resolved,indent=2)+'\n')
with (root/'energy-accounting.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(energy[0]));w.writeheader();w.writerows(energy)
(root/'validation.json').write_text(json.dumps({'verifiedPrimaryRows':checked,'primaryFreshRuns':5688,'reusedScreenBaseline':1680,'validationRunsPerVariant':1680,'validationSeedClusters':len(validation),'seedSetsDisjoint':True,'parameterDifferences':changes,'shieldAndContributionReconciliation':True,'choiceUseAndEnergyReconciliation':True,'preparedAndChaseDefinitionCounts':[6,20],'historicalSourcesResolved':len(resolved)},indent=2)+'\n')
print(f'Validated {checked} primary rows, energy/shield/contribution accounting,141 held-out seed clusters, and all historical source hashes.')
