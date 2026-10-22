import csv,gzip,json,os
from collections import defaultdict
from pathlib import Path
os.environ.setdefault('MPLCONFIGDIR','/tmp/reed-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path('docs/reports/2026-10-22-spirit-f')
def read(group,rule):
 p=root/f'{group}-{rule}.jsonl.gz'
 if group=='screen' and rule=='A':p=root.parent/'2026-10-22-spirit/screen-after.jsonl.gz'
 with gzip.open(p,'rt') as f:return [json.loads(l) for l in f]
fig,axes=plt.subplots(1,3,figsize=(13,4),sharey=True)
for ax,group in zip(axes,['screen','focused','pressure']):
 for rule,color in zip('ADEF',['#737373','#cb4b16','#268bd2','#228833']):
  rows=read(group,rule);times=defaultdict(lambda:[0,0])
  for r in rows:times[sum(r['counts']['turns'])/2][int(r['capHit'])]+=1
  risk=len(rows);survival=1.;x=[0];y=[1]
  for t,(events,censored) in sorted(times.items()):
   survival*=1-events/risk;x.append(t);y.append(survival);risk-=events+censored
  ax.step(x,y,where='post',label=rule,color=color,linewidth=1.8)
 ax.set_title(f'{group} (n={len(rows)}/rule)');ax.set_xlabel('Ordinary turns per side (total / 2)');ax.set_xlim(0,60);ax.grid(alpha=.15)
 for t in [25,34,44]:ax.axvline(t,color='#dddddd',linewidth=.7)
axes[0].set_ylabel('Fraction still in battle (Kaplan–Meier)');axes[-1].legend(title='Rule');fig.suptitle('Experimental F: slower decay + 20% sustain floor; cap = 60 turns/side');fig.tight_layout();fig.savefig(root/'survival.png',dpi=180)
