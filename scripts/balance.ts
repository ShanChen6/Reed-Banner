// Script mô phỏng cân bằng: AI đấu AI nhiều trận, in số liệu thời lượng và tỉ lệ thắng.
// Chạy: pnpm sim -- --mode 3v3 --battles 200 --difficulty normal --seed 1 [--element kim] [--json]
// Trang bị: --gear-tier 3 mặc đủ 9 món cùng hệ cho mọi nhân vật; --set coLau / --foe-set hoaLu chọn bộ
// của phe 0 / phe 1 (bỏ trống thì không bộ nào đạt mốc, chỉ còn cộng hưởng).

import { parseArgs } from "node:util";
import { buildMatchups, runBattle, summarize, type Difficulty, type Element, type SimGear, type SimMode, type Tier } from "../src/core";

const { values } = parseArgs({
  // pnpm chuyển nguyên dấu "--" vào argv; bỏ nó đi để parseArgs đọc được các cờ phía sau.
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: {
    mode: { type: "string", default: "3v3" },
    battles: { type: "string", default: "100" },
    difficulty: { type: "string", default: "normal" },
    seed: { type: "string", default: "1" },
    element: { type: "string", default: "moc" },
    "max-turns": { type: "string" },
    "gear-tier": { type: "string" },
    set: { type: "string" },
    "foe-set": { type: "string" },
    json: { type: "boolean", default: false },
  },
});

const modes: SimMode[] = values.mode === "all" ? ["1v1", "3v3"] : [values.mode as SimMode];
const difficulty = values.difficulty as Difficulty;
const battles = Number(values.battles);
const seed = Number(values.seed);
const element = values.element as Element;
const maxTurns = values["max-turns"] ? Number(values["max-turns"]) : undefined;

const gear: SimGear | undefined = values["gear-tier"]
  ? { tier: Number(values["gear-tier"]) as Tier, sets: [values.set ?? null, values["foe-set"] ?? null] }
  : undefined;
const gearLabel = gear ? ` · đồ bậc ${gear.tier} (${gear.sets[0] ?? "không bộ"} / ${gear.sets[1] ?? "không bộ"})` : "";

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const num = (x: number) => x.toFixed(1);

const report: Record<string, ReturnType<typeof summarize>> = {};
for (const mode of modes) {
  const started = performance.now();
  const results = buildMatchups(mode, battles, seed, element, gear).map((m) =>
    runBattle(m, { difficulty: [difficulty, difficulty], maxTurns }),
  );
  const s = summarize(results);
  report[mode] = s;
  if (values.json) continue;
  const secs = (performance.now() - started) / 1000;
  console.log(`\n## ${mode} · ${s.battles} trận · AI ${difficulty} · chính hệ ${element}${gearLabel} · ${secs.toFixed(1)}s`);
  console.log(`Hòa (chạm giới hạn lượt): ${s.draws}`);
  console.log(`Phe 0 thắng: ${pct(s.side0WinRate)} · Phe đi trước thắng: ${pct(s.firstSideWinRate)}`);
  const t = s.turnsPerSide;
  console.log(`Lượt mỗi phe: TB ${num(t.mean)} · p10 ${num(t.p10)} · trung vị ${num(t.median)} · p90 ${num(t.p90)}`);
  console.log(`Phút ước tính: TB ${num(s.minutes.mean)} · p10 ${num(s.minutes.p10)} · p90 ${num(s.minutes.p90)}`);
  console.log(`Máu còn lại của phe thắng: ${pct(s.winnerHpRatio)} · Bị động mỗi trận: ${num(s.passivesPerBattle)}`);
  console.log("\n| Nhân vật | Trận | Tỉ lệ thắng |\n|---|---|---|");
  for (const f of s.fighters) console.log(`| ${f.id} | ${f.battles} | ${pct(f.winRate)} |`);
  console.log("\n| Kỹ năng | Lần/trận |\n|---|---|");
  for (const [id, c] of Object.entries(s.skillsPerBattle)) console.log(`| ${id} | ${c.toFixed(2)} |`);
}
if (values.json) console.log(JSON.stringify(report, null, 2));
