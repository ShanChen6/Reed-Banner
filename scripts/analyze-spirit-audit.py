"""Summarize paired audit runs; raw inputs must be complete. No application dependencies changed."""
import csv, gzip, hashlib, json, os, random, statistics, sys
from collections import defaultdict
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv)>1 else '/workspace/spirit-audit')
out = Path(sys.argv[2] if len(sys.argv)>2 else 'docs/reports/2026-10-22-spirit')
out.mkdir(parents=True,exist_ok=True)

def read(name):
    paths=sorted(src.glob(name))
    assert paths,name
    return [json.loads(line) for p in paths for line in p.read_text().splitlines()]
sets={f'screen-{ai}':read(f'screen-{ai}-[0-3].jsonl') for ai in ['before','after']}
sets.update({f'spirit-{r}':read(f'spirit-{r}.jsonl') for r in 'ABCDE'})
sets.update({f'focused-{r}':read(f'focused-{r}.jsonl') for r in 'ACE'})
sets.update({f'campaign-{ai}-A':read(f'campaign-{ai}-A.jsonl') for ai in ['before','after']})
sets.update({f'campaign-after-{r}':read(f'campaign-after-{r}.jsonl') for r in 'BCDE'})
sets.update({f'campaign-gear-{ai}-{r}':read(f'campaign-gear-{ai}-{r}.jsonl') for ai,r in [('before','A'),('after','A'),('after','C'),('after','E')]})
for name,rows in sets.items():
    expected=1344 if name.startswith('screen') else 128 if name.startswith('spirit') else 64 if name.startswith('focused') else 24
    assert len(rows)==expected,(name,len(rows))
    assert len({r['caseId'] for r in rows})==expected,name
    for r in rows:
        for s in r['skills'].values():assert s['uses']==s['reasons'].get('chosen',0),(name,r['caseId'])
    with gzip.open(out/f'{name}.jsonl.gz','wt',encoding='utf8') as f:
        for r in sorted(rows,key=lambda x:x['caseId']):f.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')

turns=lambda r:sum(r['counts']['turns'])/2
mean=lambda xs:statistics.mean(xs) if xs else 0
# Kaplan-Meier duration quantile, not a fabricated termination time for censored records.
def kmq(rows,q):
    times=defaultdict(lambda:[0,0])
    for r in rows:times[turns(r)][int(r['capHit'])]+=1
    risk=len(rows);survival=1.
    for t,(events,censored) in sorted(times.items()):
        survival*=1-events/risk
        if survival<=1-q+1e-12:return t
        risk-=events+censored
    return None

def summary(rows):
    return dict(n=len(rows),clusters=len({r['seed'] for r in rows}),wins=sum(r['won'] is True for r in rows),losses=sum(r['won'] is False for r in rows),censored=sum(r['capHit'] for r in rows),median=kmq(rows,.5),p90=kmq(rows,.9),over25=mean([turns(r)>25 for r in rows]),over34=mean([turns(r)>34 for r in rows]),over44=mean([turns(r)>44 for r in rows]),damage=mean([r['counts']['damage'] for r in rows]),heal=mean([r['counts']['heal'] for r in rows]),shield=mean([r['counts']['shield'] for r in rows]),absorbed=mean([r['counts']['absorbed'] for r in rows]),healSpiritLost=mean([r['counts']['healSpiritLost'] for r in rows]),shieldSpiritLost=mean([r['counts']['shieldSpiritLost'] for r in rows]),overheal=mean([r['counts']['overheal'] for r in rows]),nonStackLost=mean([r['counts']['nonStackLost'] for r in rows]),converted=mean([r['counts']['converted'] for r in rows]),food=mean([sum(r['finalFood'])/2 for r in rows]),hungry=mean([sum(r['counts']['hungry']) for r in rows]),starving=mean([sum(r['counts']['starving']) for r in rows]),starvationDamage=mean([r['counts']['starvationDamage'] for r in rows]),skillUses=mean([sum(s['uses'] for s in r['skills'].values()) for r in rows]),elapsedSeconds=sum(r['elapsedMs'] for r in rows)/1000)

summaries={k:summary(v) for k,v in sets.items()}
with (out/'summary.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=['dataset',*next(iter(summaries.values())).keys()]);w.writeheader()
    for name,s in summaries.items():w.writerow(dict(dataset=name,**s))
# All strata retain their own n, censoring, resources, runtime and seed envelope.
group_rows=[]
for name,rows in sets.items():
    if not name.startswith(('spirit','focused')):continue
    groups=defaultdict(list)
    for r in rows:groups[(r['profile'],r['level'],'1v1' if len(r['participants'][0])==1 else '3v3')].append(r)
    for key,rr in sorted(groups.items()):
        g=summary(rr);byseed=defaultdict(list)
        for r in rr:byseed[r['seed']].append(float(r['won'] is True))
        envelope=[mean(x) for x in byseed.values()]
        row=dict(dataset=name,profile=key[0],level=key[1],mode=key[2],**g,seedWinMin=min(envelope),seedWinMax=max(envelope))
        for field in ['carriedTurns','actions','legal','affordable','suitable']:
            row['skill_'+field]=sum(s[field] for r in rr for s in r['skills'].values())
        group_rows.append(row)
with (out/'spirit-groups.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=list(group_rows[0]));w.writeheader();w.writerows(group_rows)
for name in [n for n in sets if n.startswith(('spirit','focused'))]:assert sum(r['n'] for r in group_rows if r['dataset']==name)==len(sets[name])
# Orientation and repeated board seeds are kept in the same bootstrap cluster, across both variants.
def paired(before,after):
    b={r['caseId']:r for r in before};a={r['caseId']:r for r in after};assert b.keys()==a.keys()
    groups=defaultdict(list)
    for k in b:groups[b[k]['seed']].append(float(a[k]['won'] is True)-float(b[k]['won'] is True))
    rng=random.Random(20261022);blocks=list(groups.values());boot=[]
    for _ in range(2000):
        sampled=[blocks[rng.randrange(len(blocks))] for _ in blocks];boot.append(mean([x for block in sampled for x in block]))
    boot.sort()
    return dict(delta=mean([v for block in blocks for v in block]),low=boot[49],high=boot[1949],clusters=len(blocks),flips=sum(b[k]['won'] is not None and a[k]['won'] is not None and b[k]['won']!=a[k]['won'] for k in b),censorChanges=sum(b[k]['capHit']!=a[k]['capHit'] for k in b))
comparisons={f'AI before→after':paired(sets['screen-before'],sets['screen-after'])}
for x,y in [('A','B'),('A','C'),('C','D'),('C','E')]:comparisons[f'{x}→{y}']=paired(sets[f'spirit-{x}'],sets[f'spirit-{y}'])
for x,y in [('A','C'),('C','E')]:comparisons[f'focused {x}→{y}']=paired(sets[f'focused-{x}'],sets[f'focused-{y}'])
(out/'paired-comparisons.json').write_text(json.dumps(comparisons,indent=2))
# Cells are screening estimates only: four orientations/seeds per cell, not powered balance tests.
with (out/'screen-cells.csv').open('w') as f:
    w=csv.writer(f);w.writerow(['ai','profession','element','level','mode','n','wins','losses','censored','median','p90'])
    for ai in ['before','after']:
        groups=defaultdict(list)
        for r in sets[f'screen-{ai}']:groups[(r['profession'],r['element'],r['level'],'1v1' if len(r['participants'][0])==1 else '3v3')].append(r)
        for key,rows in sorted(groups.items()):
            s=summary(rows);w.writerow([ai,*key,*[s[x] for x in ['n','wins','losses','censored','median','p90']]])
# Skill diagnostics preserve all competitors and score/energy data in raw records.
skillrows=[]
for name in ['screen-before','screen-after']:
    stats=defaultdict(lambda:defaultdict(float));reasons=defaultdict(lambda:defaultdict(int));energy=defaultdict(list)
    for r in sets[name]:
        for key,s in r['skills'].items():
            for field in ['carriedTurns','actions','legal','affordable','suitable','uses','scoreSum']:stats[key][field]+=s[field]
            stats[key]['scoreMax']=max(stats[key]['scoreMax'],s['scoreMax'])
            for k,n in s['reasons'].items():reasons[key][k]+=n
            if s['energyBeforeFirstOpportunity'] is not None:energy[key].append(s['energyBeforeFirstOpportunity'])
    for key,s in sorted(stats.items()):skillrows.append(dict(dataset=name,skill=key,**s,scoreMean=s['scoreSum']/max(1,s['actions']),energyBeforeFirstOpportunityMean=mean(energy[key]),reasons=json.dumps(reasons[key],ensure_ascii=False)))
with (out/'skill-opportunities.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=list(skillrows[0]));w.writeheader();w.writerows(skillrows)
# A single measured game can produce multiple criteria; traces are reruns, excluded from sample n.
manifest=json.loads((src/'trace-manifest.json').read_text())
for m in manifest:
    data=read(m['file']);assert len(data)==1
    with gzip.open(out/(m['file']+'.gz'),'wt',encoding='utf8') as f:f.write(json.dumps(data[0],ensure_ascii=False,separators=(',',':'))+'\n')
(out/'trace-manifest.json').write_text(json.dumps(manifest,indent=2))
phase_rows=[]
for m in manifest:
    r=read(m['file'])[0]
    phases={phase:dict(heal=0,shield=0,absorbed=0,damage=0,spiritLost=0,decisions=0) for phase in ['before25','from25']}
    for entry in r['trace']:
        if 'rows' in entry:phases['from25' if entry['turn']>=49 else 'before25']['decisions']+=1
        for e in entry.get('events',[]):
            phase=phases['from25' if e['atTurn']>=49 else 'before25']
            if e['type']=='damage':phase['damage']+=e['amount'];phase['absorbed']+=e['absorbed']
            if e['type']=='sustain':phase[e['kind']]+=e['effective'];phase['spiritLost']+=e['spiritLost']
    for key,values in phases.items():phase_rows.append(dict(criterion=m['criterion'],caseId=m['caseId'],rule=m['rule'],phase=key,**values))
with (out/'trace-phases.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=list(phase_rows[0]));w.writeheader();w.writerows(phase_rows)
for name in ['desktop-lobby.png','mobile-lobby.png','desktop-spirit.png','mobile-spirit.png']:
    (out/name).write_bytes((src/name).read_bytes())

for name in ['browser-final.log','baseline-sha256.txt','refresh-censored.log']:
    (out/name).write_text((src/name).read_text())
baseline=src.parent/'audit-baseline'/'source'
protected=['src/core/battle/skills.ts','src/core/roster/roster.ts','src/core/progress/progress.ts','src/core/progress/profile.ts','src/core/campaign/campaign.ts','package.json','pnpm-lock.yaml']
checks={name:Path(name).read_bytes()==(baseline/name).read_bytes() if (baseline/name).exists() else None for name in protected}
if baseline.exists():assert all(checks.values())
(out/'protected-files.json').write_text(json.dumps(checks,indent=2))
files=['src/core/battle/rules.ts','src/core/battle/battle.ts','src/core/ai/ai.ts','src/core/sim/audit.ts','scripts/lib/spirit-runner.ts','scripts/fixtures/2026-10-22-ai-before.ts','scripts/spirit-audit.ts']
(out/'source-sha256.json').write_text(json.dumps({name:hashlib.sha256(Path(name).read_bytes()).hexdigest() for name in files},indent=2))
for phase in ['before','after']:
    log=src.parent/'audit-baseline'/f'bug-{phase}.log'
    if log.exists():(out/f'bug-{phase}.log').write_text(log.read_text())
try:
    os.environ.setdefault('MPLCONFIGDIR','/tmp/reed-matplotlib')
    import matplotlib;matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    fig,(ax,bx)=plt.subplots(1,2,figsize=(10,4),layout='constrained')
    rules=list('ABCDE');ax.bar(rules,[summaries['spirit-'+r]['median'] for r in rules],label='KM median')
    for i,r in enumerate(rules):
        p=summaries['spirit-'+r]['p90']
        ax.plot(i,p if p is not None else 60,'^',color='darkorange')
        if p is None:ax.annotate('P90 ≥ 60',(i,60),xytext=(i-.4,64))
    ax.set(ylabel='Ordinary side turns (mean of both sides)',title='128 paired scenarios per rule',ylim=(0,70));ax.legend()
    bx.bar(rules,[summaries['spirit-'+r]['censored'] for r in rules],color='firebrick');bx.set(title='Censored at 120 total turns',ylabel='Games without observed termination',ylim=(0,30))
    fig.savefig(out/'spirit-comparison.png',dpi=160);plt.close(fig)
except ImportError:pass

fmt=lambda v:'≥60 / chưa xác định' if v is None else f'{v:.1f}'
pct=lambda v:f'{100*v:.1f}%'
lines=['# Kiểm chứng AI và Tinh thần sau cải tổ kỹ năng','', 'Ngày 22/10/2026. Tiếp nối [báo cáo cải tổ](2026-10-22-ky-nang.md). Giữ nguyên khung 3 nghề + 2 hệ + 1 tuyệt chiêu, mọi hệ số/giá/mốc mở và luật quân lương. Luật Tinh thần mặc định vẫn A; các nhánh B–E chỉ truyền nội bộ trong harness.','',
'## Baseline và sửa bug','',
'Checkout `work`, HEAD `ab357e34bfdd92c6fcf2068df6676ccb0f15c2de` có toàn bộ thay đổi chưa commit của đợt cải tổ trước; không reset hoặc ghi đè chúng. Snapshot trước sửa: `/workspace/audit-baseline/current.tar`, patch `/workspace/audit-baseline/working.patch`; SHA-256 ở [manifest](2026-10-22-spirit/baseline-sha256.txt). AI cũ được đóng băng trong `scripts/fixtures/2026-10-22-ai-before.ts`; import/exports chỉ đổi để chạy harness. Không coi HEAD đơn lẻ là baseline của bản cải tổ chưa commit.','',
'Bug Y sư tái hiện trước sửa: HP 950/1000, TT50, ghép 3 tim, lượng hồi thô135 → lượng hồi hiệu dụng68 → hồi dư18. Code cũ cho43 Khiên; test thất bại `43 !== 18`. Đã sửa tính hồi hữu hiệu trước khi lấy dư và không nhân TT lần hai khi chuyển dư thành Khiên. Khi HP còn thiếu nhiều hơn lượng hồi hữu hiệu, không được tạo Khiên từ phần hồi thô bị triệt tiêu. Ở TT0 không có hồi hoặc Khiên mới. Đây là sửa bug, không đổi hệ số thiết kế.','',
'ATK/DEF dùng hệ số buff/debuff rồi nhân TT, sau đó mới xuyên DEF trong công thức sát thương. Luật mặc định: TT100 đầu trận, từ lượt25 phe giảm10/lượt, lượt34 bằng0; mốc24/25/26/33/34/35 được kiểm tra cả hai phe đi trước, cả1vs1/3vs3. Lượt thêm không tăng bộ đếm; Đóng băng vẫn chịu lượt thường; người gục không giảm TT. Hồi trực tiếp, tim, Hồi phục và hút máu chịu TT người nhận; Khiên mới chịu TT, Khiên đang tồn tại không tự co lại. Làm mới giữ số lớn hơn và thời hạn dài hơn. Thiêu đốt lưu theo ATK gốc lúc tạo; Phản đòn dựa trên đòn nhận; mất máu hết lương theo maxHP. Ba nguồn gián tiếp không nhân TT lần nữa, nhưng đầu vào sát thương trực tiếp có thể đã chịu TT. Các luật đó không đổi.','',
'Đã sửa thêm lỗi phép đo: cap không tính lượt vừa khởi đầu ngoài cap; snapshot lương cuối lấy từ event trong giới hạn, không lấy upkeep của lượt tiếp. Tái chạy đúng66 hàng censored bị ảnh hưởng; kiểm tra winner/decision/counter/source giống hệt trước sửa, chỉ finalFood snapshot và runtime đổi. Không cộng những lượt tái chạy này vào n.', '', '## Sửa AI và phạm vi heuristic','',
'- Sửa tính giá trị sát thương/ô kiếm/hồi/Khiên theo chỉ số hiệu dụng và TT, buff/debuff, sĩ khí, xuyên giáp, bị động thủ lĩnh. Dùng cùng helper hiệu dụng với engine. Sửa thứ tự làm tròn hồi/hút máu.','- Trừ phần Khiên mới không vượt Khiên đang có và Hồi phục đang tồn tại. Bỏ giá trị hồi/Khiên mới ở TT0. Khiên cũ vẫn có giá trị hấp thụ và Xua tan.','- Ly gián dự báo luân phiên trong đúng thời hạn: năng lượng/kỹ năng mục tiêu và số lần mục tiêu kịp hành động. Không coi người chưa tới lượt trước hết Câm lặng là một mục tiêu có cùng giá trị.','- Phản kích dùng lượng sát thương dự kiến, phần hướng đòn qua Khiêu khích, đồng đội còn sống và tình huống1vs1. Đoạt mệnh dùng HP trước đòn; thêm cùng thưởng kết liễu mà bộ chấm nước đổi ô đã có. Đây là cải tiến heuristic ngoài sửa công thức, được đo chung trong nhánh AI mới, không giả định là một bug của engine.','- Giữ ngưỡng tiết kiệm năng lượng/giá lượt dùng, không quota dùng chiêu, không tăng sức mạnh chiêu. Không mở rộng sang AI phối hợp nhiều lượt. Cascade bàn cờ giữ thu hoạch giảm, không đọc boardRng; test ngang bằng thông tin vẫn chạy.','',
'## Phương pháp và ngân sách','',
'Pilot engine cũ:4 trận khoảng1,08s. Pilot có đo chi tiết:6 trận khoảng2,93s (khác đội/cấp, không dùng để kết luận tăng/giảm hiệu năng). Chọn 5 tiến trình mô phỏng tối đa trên5 CPU; log elapsedMs từng trận ở dữ liệu gốc. Không quy lượt ra phút theo tốc độ AI.','',
'Sàng lọc AI:42 tổ hợp ĐBL ×4 cấp9/10/15/20 ×2 chế độ ×2 seed cơ sở701/1907 ×2 hướng =1.344 trận/AI. ĐBL luôn có mặt ở focalSide. Mỗi cặp cùng seed và đội: phe có ĐBL ở bên0/đi trước, rồi đổi sang bên1/đi sau. 3vs3 phân tầng tấn công/cân bằng/phòng thủ/phá tài nguyên, xoay nghề và phần tử trong toàn60 nhân vật kèm; test xác nhận đủ61 ID gồm ĐBL. Không dùng cặp đầu roster. 1vs1 ghi đối thủ cụ thể trong raw participants. Mỗi ô nhỏ chỉ4 trận, là sàng lọc không phải cân bằng đủ lực thống kê.','',
'Tất cả generic dùng không trang bị và `autoProgress(level,null)` như nhau giữa phương án; phân đều điểm vào ô thấp nhất theo thứ tự1/2/3/5/4/6, không điểm thưởng hay ưu tiên riêng cho chiêu hiếm. Cùng seed không bảo đảm cùng diễn biến sau khi quyết định AI khác.','',
'Nhánh A so AI before/after giữ **cùng engine đã sửa bug Y sư, cùng luật A và kỹ năng**. Vì vậy tách được tác động AI; không quy chênh lệch đó cho chuyển khung kỹ năng hay sửa bug. Tác động riêng của sửa bug được chứng minh bằng test định lượng43→18, chưa chạy một ma trận nhân tố engine-cũ/engine-mới. AI cũ vẫn chạy với helper cascade tương thích, nhưng scorer/selector là bản đóng băng.','',
'Tinh thần dùng AI mới cố định:4 nhóm đội ×4 cấp ×2 chế độ ×2 seed ×2 hướng =128 trận/phương án. Có phòng thủ đấu phòng thủ. A=mặc định; B=không giảm; C=chỉ giảm hồi/Khiên10/lượt; D=giảm hồi/Khiên5/lượt, về0 lượt44; E=hồi/Khiên giữ sàn20%. B–E có ATK/DEF100%. Sau pilot, chỉ mở rộng A/C/E trên phòng thủ với4 seed mới3119/4567/6079/7919,64 trận/phương án. Không mở rộng B/D khi chưa có lợi thế rõ.','',
'Giới hạn120 lượt thường tổng hai phe, tương đương60 lượt/phe khi chưa kết thúc. Lượt thêm là hành động bổ sung trong lượt, không tăng bộ đếm này. Censored không gọi là thua/hòa hoặc thời lượng kết thúc. Chưa có luật hòa tự nhiên ở engine; cột hòa tự nhiên bằng0. KM median/P90 xử lý right censoring, P90 không nhận diện thì ghi≥60. Nền tảng duration là (lượt thường đã bắt đầu của phe0+phe1)/2, nên có bước0,5.','',
'Độ bất định: bootstrap2.000 lần, seed20261022, gom cùng board seed (cả hai hướng và mọi cấu hình trùng seed) vào một cluster và ghép các biến thể theo caseId. CI95% dưới đây là CI mô hình có điều kiện trên các kịch bản đã chọn; cùng roster/lớp đội/cấp tạo phụ thuộc rộng hơn, nên không suy rộng thành CI cân bằng toàn game. Không coi hai hướng hay các biến thể trên cùng seed là quan sát độc lập. Chỉ số thắng là **thắng quan sát được trong cap/n**, không giả định trận censored thua cuối cùng.','',
'Mỗi lớp đội/cấp/chế độ có n, thắng/thua/censor, duration KM, lượng hỗ trợ/lương, cơ hội kỹ năng và runtime riêng tại [spirit-groups.csv](2026-10-22-spirit/spirit-groups.csv). seedWinMin/Max là khoảng quan sát giữa các seed (không phải CI95%); nhóm nhỏ4 trận không đủ để ước lượng cân bằng tin cậy.', '', '## Kết quả chính','',
'| Tập | n | Thắng / thua / censored | KM trung vị / P90 lượt | >25 / >34 / >44 |','|---|---:|---|---|---|']
for name,s in summaries.items():lines.append(f"| {name} | {s['n']} | {s['wins']} / {s['losses']} / {s['censored']} | {fmt(s['median'])} / {fmt(s['p90'])} | {pct(s['over25'])} / {pct(s['over34'])} / {pct(s['over44'])} |")
lines+=['','![So sánh duration và censored](2026-10-22-spirit/spirit-comparison.png)','','| So sánh ghép cặp | Δ thắng trong cap | CI95% cluster bootstrap | Cluster seed | Đổi kết quả đã kết thúc | Đổi trạng thái censor |','|---|---|---|---:|---:|---:|']
for name,c in comparisons.items():lines.append(f"| {name} | {pct(c['delta'])} | [{pct(c['low'])}; {pct(c['high'])}] | {c['clusters']} | {c['flips']} | {c['censorChanges']} |")
lines+=['','## Damage, hỗ trợ và lương','','Giá trị trung bình/trận, cộng cả hai phe. Giảm tiềm năng hồi/Khiên do TT tách khỏi hồi dư và không cộng dồn; không đồng nhất giảm tiềm năng với HP thực tế bị mất. Hồi dư gồm phần có thể chuyển thành Khiên, cột converted trong CSV ghi riêng; không cộng hai cột đó thành hai tổn thất. Khiên nhận là phần tăng lượng Khiên, thời hạn được làm mới không đếm thành Khiên mới.','','| Tập | HP mất | Hồi hữu hiệu | Khiên nhận / hấp thụ | Hồi bị TT giảm / hồi dư | Khiên bị TT giảm / không cộng dồn | Lương cuối | Lượt Đói / hết lương (hai phe) | HP mất vì hết lương | Chiêu/trận |','|---|---:|---:|---|---|---|---:|---|---:|---:|']
for name,s in summaries.items():
    if name.startswith('screen'):continue
    lines.append(f"| {name} | {s['damage']:.0f} | {s['heal']:.0f} | {s['shield']:.0f} / {s['absorbed']:.0f} | {s['healSpiritLost']:.0f} / {s['overheal']:.0f} | {s['shieldSpiritLost']:.0f} / {s['nonStackLost']:.0f} | {s['food']:.1f} | {s['hungry']:.1f} / {s['starving']:.1f} | {s['starvationDamage']:.0f} | {s['skillUses']:.1f} |")
lines+=['','## Chiêu hiếm: cơ hội và lựa chọn','','Carried=lượt thường nhân vật còn sống mang chiêu đã mở. Actions=gồm lượt thêm. Legal=được ra tay, chưa dùng chiêu và không Câm lặng; affordable=legal đủ năng lượng. Suitable=đủ điều kiện đó và tình huống có giá trị (Đoạt mệnh:HP≤35%; Ly gián:địch có chiêu đủ năng lượng, chưa đóng băng/Câm lặng; các chiêu khác scorer>0). Vì đo tình huống kết liễu bằng ngưỡng, uses của Đoạt mệnh có thể vượt suitable nếu AI dùng nó khi còn >35% nhưng đòn vẫn hiệu quả. Energy là năng lượng actor đã chi trước cơ hội phù hợp đầu tiên trong từng trận, lấy trung bình những trận có cơ hội, không phải tổng mọi actor.','','| AI | Chiêu | Carried | Actions | Legal | Affordable | Suitable | Uses | Score TB/max | Energy trước cơ hội đầu |','|---|---|---:|---:|---:|---:|---:|---:|---|---:|']
for r in skillrows:
    if not (r['skill'].startswith('role_') or r['skill'].startswith('element_')):continue
    lines.append(f"| {r['dataset']} | {r['skill']} | {int(r['carriedTurns'])} | {int(r['actions'])} | {int(r['legal'])} | {int(r['affordable'])} | {int(r['suitable'])} | {int(r['uses'])} | {r['scoreMean']:.1f}/{r['scoreMax']:.1f} | {r['energyBeforeFirstOpportunityMean']:.1f} |")
lines+=['','Phản kích đã được dùng39 lần trong baseline rộng, dù báo cáo cũ mẫu nhỏ ghi0: riêng số0 trước đó không chứng minh một bug. Tách cải thiện phép đo khỏi cải thiện AI; Ly gián0→461, Phản kích39→242, Đoạt mệnh3→33 là số liệu cùng sampler trước/sau mới. Lý do bỏ qua từng kỹ năng cạnh tranh, tổng score và thời điểm năng lượng được lưu đầy đủ trong [skill-opportunities.csv](2026-10-22-spirit/skill-opportunities.csv) và raw JSONL. `saving`=để dành cho option tốt hơn theo ngưỡng80%; `dominated:<id>`=đủ điều kiện nhưng option khác thắng điểm; `energy`, `noValue`, `belowThreshold`, `silenced`, `slotUsed` được tách riêng. Tổng reason=chosen được đối chiếu với event skill thực thi cho mọi trận: không có request kỹ năng bị AI chọn nhưng engine không thực thi.','',
'## Chiến dịch','','Phong Châu và đối chứng Tam Đái, đúng cấp gợi ý, food và tỉ lệ ô/preset/độ khó của màn. Đội default là tướng khởi đầu; đội heroes chỉ gồm tướng gia nhập ở màn trước, không dùng sứ quân chưa đánh bại. Bộ chính không trang bị để kiểm soát biến; thêm đối chứng white3: mỗi người chơi có3 món Trắng đồng hệ (vũ khí đúng nghề, đỉnh mão, y phục), đối thủ giữ preset trần. Đây là kịch bản đầu tư nhẹ có thể farm từ loot ở tiến trình đó, không giả định một phân bố đồ rơi đại diện mọi người chơi. Không đủ6 món cùng bộ để kích thưởng bộ; mọi cộng hưởng khác do engine tự tính. Điểm tự phân cùng chính sách. Có96 trận trang bị bổ sung cho before-A/after-A/C/E; tổng3.760 trận phân tích, không cộng pilot/trace/tái chạy kỹ thuật. Cấp/ATK/DEF/skillLevels cụ thể ở participants.3 seed, đổi bên;6 trận mỗi màn/đội/variant. Chưa tách đủ yếu tố tương tác nghề/hệ khỏi AI và TT; preset đối thủ giữ nguyên, không chỉnh trùm để bù.','','| Variant | Màn | Đội | n | Thắng / thua / cap | KM median / P90 | Khoảng thắng giữa3 seed |','|---|---|---|---:|---|---|---|']
for name,rows in sets.items():
    if not name.startswith('campaign'):continue
    groups=defaultdict(list)
    for r in rows:groups[(r['stage'],r['team'])].append(r)
    for key,rr in groups.items():
        s=summary(rr);seedwins=defaultdict(list)
        for row in rr:seedwins[row['seed']].append(float(row['won'] is True))
        envelope=[mean(values) for values in seedwins.values()]
        lines.append(f"| {name} | {key[0]} | {key[1]} | {s['n']} | {s['wins']}/{s['losses']}/{s['censored']} | {fmt(s['median'])}/{fmt(s['p90'])} | {pct(min(envelope))}–{pct(max(envelope))} |")
lines+=['','Ở Phong Châu, gộp hai đội chỉ để xem độ nhạy: không đồ before-A4/12 thắng, after-A6/12, C7/12, E6/12; white3 lần lượt8/12,10/12,10/12,10/12. Đồ/đội/hệ có ảnh hưởng lớn;3 board seed và6 trận mỗi đội chưa đủ để cân lại trùm. Khoảng giữa seed không phải CI95%. Đợt này giữ bộ kỹ năng mới, nên không tái ước lượng riêng tác động chuyển từ bộ6 chiêu hệ cũ; không quy mọi chênh lệch Phong Châu cho một nguyên nhân. Chưa có bằng chứng ở đây buộc phải giảm chỉ số/cấp preset đối thủ.', '', '## Trace đại diện','','Chọn theo tiêu chí, không chọn thủ công trận thuận kết luận: dài nhất nhóm phòng thủ A; caseId nhỏ nhất trong các trận B bị censor; caseId nhỏ nhất đổi thắng/thua đã kết thúc giữa A/C; case phòng thủ trên25 lượt có chênh tổng hồi+Khiên A/C lớn nhất. Trace chứa hành động, score/competitor/reason, HP/TT/energy/food và event thật; tái chạy không cộng vào cỡ mẫu.']
for m in manifest:lines.append(f"- {m['criterion']}: `{m['caseId']}`, rule {m['rule']}: [{m['file']}](2026-10-22-spirit/{m['file']}.gz)")
lines+=['','Trace tách tài nguyên trước global turn49 và từ49 (lúc phe đầu bắt đầu lượt25) tại [trace-phases.csv](2026-10-22-spirit/trace-phases.csv). Counter và cap dùng timestamp lượt của event, không gán upkeep lượt kế về lượt trước.', '', '## Trình duyệt','','Chromium/Playwright thực thi trên desktop1440×1000 và mobile390×844. Cả hai kiểm tra42 preview nghề×hệ, thứ tự1/2/3/5/4/6, cấp9/10/15/20, nâng cấp thực và lưu điểm ở ô4/6 tạm khóa; fixture hồ sơ nghề cổ được chuyển và hoàn đúng điểm. Kiểm tra chọn đồng minh, hủy không gửi action, chọn vùng và hủy bằng chạm lại. Fixture browser route dùng **engine thật** để kiểm chứng hồi ở TT0/40/100 và hiển thị các mốc24/25/26/33/34/35; không thêm endpoint/đường tắt vào ứng dụng. Fixture không thay kiểm tra tải nhiều lượt tự nhiên hay bài chơi tay người dùng. Không pageerror, lobby không tràn ngang.','',
'Sửa UI xác nhận: TT trước chỉ hiện số viết tắt, nay có hệ số Công/Thủ/Hồi/Khiên; native title không đủ cho touch nên thêm Chi tiết kỹ năng dạng details; màn chờ đọc hồ sơ lưu khi quay về để không hiển thị cấp1 khi hồ sơ đã lên cấp. Cửa hàng giải thích bộ sứ quân đối thủ khác bộ tuyển về. Đã sửa nhãn mở khóa cửa hàng không co lại làm mobile390px tràn thành415px; test sau sửa so scrollWidth với viewport cấu hình390, không dùng innerWidth có thể bị browser nới ra. [Log browser](2026-10-22-spirit/browser-final.log), screenshot desktop/mobile trong thư mục dữ liệu.','',
'## Kiểm tra bắt buộc', '', '328/328 test qua,83 suite, không fail/skip. Lint và TypeScript qua; production build qua. Test mới xác minh API bỏ qua experimentalSpirit/audit từ payload ngoài, không cho chọn luật thử nghiệm qua request. Chromium desktop/mobile không pageerror. Skills, roster, tiến trình/hồ sơ, preset campaign và package/lockfile byte-identical với snapshot đầu task; chỉ engine bug, chấm AI, instrumentation/harness và UI được sửa trong lượt này. Chưa kiểm tra trên thiết bị mobile vật lý hoặc tải máy chủ nhiều người.', '', '## Điểm thiết kế — chỉ đề xuất, chưa đổi','','- Mua chuộc/Ly gián/Phá kế không tăng hiệu quả ở cấp kỹ năng2–4 vì năng lượng/thời hạn/xua tan không scale; cấp5 chỉ giảm giá. Nâng theo ô giúp đổi nghề không mất điểm nhưng đầu tư vào tiện ích hiện có lợi ích thấp. UI đã giải thích giới hạn này; đề xuất thiết kế nhánh nâng riêng sau quyết định; không tự tăng lượng trừ/thời hạn.','- Kim Ý Ngưng Thần nay là đòn xuyên giáp, Tĩnh Điện Hộ Thân nay trao đổi năng lượng: tên chưa khớp tác dụng. Đề xuất đổi tên hiển thị (giữ ID) trong task thiết kế riêng.','- Mộc/Thủy bổ trợ cùng hồi bản thân: Mộc thêm biến tim, Thủy Thanh tẩy; có khác biệt nhưng hình ảnh vai trò chưa mạnh. Chưa đổi số liệu.','- Tuyệt chiêu mở cấp10, sứ quân có chiêu60/80 có thể cạnh tranh rất tốt với nghề45–60; raw opportunities cho phép kiểm tra reason dominated. Không tăng giá hoặc trì hoãn mở khóa chỉ vì số dùng chiêu nghề thấp. Cần thử cùng sứ quân đối thủ/tuyển về và người chơi thật.','',
'## Đề xuất và giới hạn','','Khuyến nghị **C làm ứng viên chơi thử tiếp theo**, không thay mặc định A. C bỏ suy giảm ATK/DEF nhưng vẫn cắt hồi/Khiên cuối trận; trong pilot giảm đuôi dài mà không thêm censor, phần mở rộng phòng thủ xác nhận xu hướng. Nếu ưu tiên giữ vai trò hỗ trợ sau lượt34, E là ứng viên sát cạnh: giữ20% hồi/Khiên, đổi lại có thể kéo trận hơn. B không phù hợp nếu muốn chặn phòng thủ vô hạn:26/128 trận chỉ biết chưa kết thúc ở cap; không thể gọi P90 là60. D chậm hơn C và còn censor, chưa có lý do mở rộng.','',
'Không đặt mục tiêu mọi nghề thắng50%. Đây là AI với một chính sách phân điểm/trang bị; số seed và tình huống phòng thủ mở rộng vẫn nhỏ, chưa có thiết kế thí nghiệm đầy đủ mọi nghề×hệ×đồ×tướng. Skill usage tăng không chứng minh cân bằng, và heuristic mới cùng sửa công thức là một gói AI, chưa tách từng hạng mục. Người chơi cần thử nhịp trận, khả năng đọc TT và ý nghĩa Y sư/Binh lính sau25/34; người dùng quyết định giữ A hay cho thử C/E. Không merge, push hoặc triển khai production.','',
'## Tái lập','','Trong checkout `/workspace/Reed-Banner`, đặt `XDG_DATA_HOME=/workspace/.cache/data`, `XDG_CACHE_HOME=/workspace/.cache`, `COREPACK_HOME=/workspace/.cache/corepack` trước các lệnh; các thư mục này ghi được trong sandbox. Khởi động dev server bằng `corepack pnpm dev --hostname 127.0.0.1` khi chạy browser. Dùng Node24.19.0, pnpm10.28.0 qua Corepack; snapshot cùng dependency/lockfile. `corepack pnpm exec tsx scripts/spirit-audit.ts --group screen --ai before` và `--ai after`; có thể chia `--shard 0 --shards 4` đến3, gom đủ1344 dòng mỗi AI. Với luật: `--group spirit --rule A` đếnE. Mở rộng: `--group spirit --rule C --seeds 3119,4567,6079,7919 --profile defense`, lặp A/E. Chiến dịch trang bị: thêm `--equipment white3` cho before-A và after-A/C/E. Chiến dịch: `--group campaign --ai before`/after và `--rule A` đếnE với after. Cap mặc định120 tổng lượt thường. Trace: cùng group/rule thêm `--trace <caseId>` lấy từ manifest.','',
'`corepack pnpm exec tsx scripts/browser-spirit-audit.cjs` cần Chromium tại `/usr/bin/chromium`, Playwright sẵn trong runner và dev server đã khởi động. `AUDIT_OUTPUT_DIR` đổi chỗ screenshot. Không ghi fixture vào app/server.','',
'`python scripts/select-spirit-traces.py /workspace/spirit-audit` chọn và tái chạy trace theo tiêu chí đã ghi. `MPLCONFIGDIR=/tmp/reed-matplotlib python scripts/analyze-spirit-audit.py /workspace/spirit-audit docs/reports/2026-10-22-spirit` tái tạo CSV, raw JSONL nén, CI và biểu đồ (matplotlib tùy chọn để vẽ). [summary.csv](2026-10-22-spirit/summary.csv), [screen-cells.csv](2026-10-22-spirit/screen-cells.csv), [paired-comparisons.json](2026-10-22-spirit/paired-comparisons.json), [source-sha256.json](2026-10-22-spirit/source-sha256.json), [protected-files.json](2026-10-22-spirit/protected-files.json). Raw `*.jsonl.gz` đọc bằng gzip; không chứa credential.']
lines+=['']+[f'- [{name}.jsonl.gz](2026-10-22-spirit/{name}.jsonl.gz)' for name in sets]
Path('docs/reports/2026-10-22-tinh-than-ai.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({'total':sum(len(r) for r in sets.values()),'summaries':summaries,'comparisons':comparisons},ensure_ascii=False,indent=2))
