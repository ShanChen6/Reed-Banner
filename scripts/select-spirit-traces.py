import json,pathlib,subprocess,sys
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/workspace/spirit-audit');rows={r: [json.loads(x) for x in (root/f'spirit-{r}.jsonl').read_text().splitlines()] for r in 'ABCDE'}
a={r['caseId']:r for r in rows['A']};c={r['caseId']:r for r in rows['C']}
turns=lambda x:sum(x['counts']['turns'])/2
long=max((r for r in rows['A'] if r['profile']=='defense'),key=lambda r:(turns(r),r['caseId']))
cap=sorted((r for r in rows['B'] if r['capHit']),key=lambda r:r['caseId'])[0]
flip=sorted((r for r in rows['A'] if not r['capHit'] and not c[r['caseId']]['capHit'] and r['won']!=c[r['caseId']]['won']),key=lambda r:r['caseId'])[0]
support=max((r for r in rows['A'] if r['profile']=='defense' and turns(r)>25),key=lambda r:abs(r['counts']['heal']+r['counts']['shield']-c[r['caseId']]['counts']['heal']-c[r['caseId']]['counts']['shield']))
selected=[('long-defense','A',long),('censored','B',cap),('flip-A','A',flip),('flip-C','C',flip),('support-A','A',support),('support-C','C',support)]
manifest=[]
for label,rule,row in selected:
 path=root/f'trace-{label}.jsonl'
 with path.open('w') as out:subprocess.run(['corepack','pnpm','exec','tsx','scripts/spirit-audit.ts','--group','spirit','--rule',rule,'--trace',row['caseId']],cwd=pathlib.Path(__file__).resolve().parent.parent,stdout=out,check=True)
 manifest.append({'criterion':label,'caseId':row['caseId'],'rule':rule,'file':path.name})
(root/'trace-manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps(manifest,indent=2))
