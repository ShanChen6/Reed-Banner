// Script mô phỏng cân bằng: AI đấu AI nhiều trận, in số liệu thời lượng và tỉ lệ thắng.
// Chạy: pnpm sim -- --mode 3v3 --battles 200 --difficulty normal --seed 1 [--element kim] [--json]
// Trang bị: --gear-tier 3 mặc đủ 9 món cùng hệ cho mọi nhân vật; --set coLau / --foe-set hoaLu chọn bộ
// của phe 0 / phe 1 (bỏ trống thì không bộ nào đạt mốc, chỉ còn cộng hưởng).
// Tiến trình: --level 10 dựng mọi nhân vật ở cấp 10 (kỹ năng mở theo cấp, điểm kỹ năng tiêu đều).
// Chiến dịch: --stage tamDai (hoặc all) đánh màn đó với luật màn, đội người chơi ở cấp gợi ý (hoặc --level),
// --team heroes|default; --sweep 0..6 thử người chơi hơn đối thủ 0 tới 6 cấp.
// Đánh trùm: thêm --raid 1|2|3 (với --stage all chỉ chạy 12 màn có sứ quân).
// Sinh tồn: --survival [--level 10] --battles 50 in số đợt AI Thường vượt qua.
// Nhân vật kèm: --roster [--level 20] --battles 200 [--only haVan,tranLam] đo tỉ lệ thắng khi có từng người.

import { parseArgs } from "node:util";
import {
  ALL_COMPANIONS,
  buildMatchups,
  CAMPAIGN,
  isHero,
  isWarlord,
  rosterMatchups,
  recommendedLevel,
  runBattle,
  stageById,
  simulateSurvival,
  isRaidTier,
  RAID_STAGES,
  raidLevel,
  raidRecommended,
  raidSetup,
  stageMatchups,
  stageTeamIds,
  summarize,
  type CampaignStage,
  type RaidTier,
  type Difficulty,
  type Element,
  type SimGear,
  type SimMode,
  type StageTeam,
  type Tier,
} from "../src/core";

const { values } = parseArgs({
  // pnpm chuyển nguyên dấu "--" vào argv; bỏ nó đi để parseArgs đọc được các cờ phía sau.
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: {
    mode: { type: "string", default: "3v3" },
    battles: { type: "string", default: "100" },
    difficulty: { type: "string", default: "normal" },
    seed: { type: "string", default: "1" },
    element: { type: "string" },
    "max-turns": { type: "string" },
    "gear-tier": { type: "string" },
    set: { type: "string" },
    "foe-set": { type: "string" },
    level: { type: "string" },
    stage: { type: "string" },
    team: { type: "string", default: "heroes" },
    sweep: { type: "string" },
    raid: { type: "string" },
    survival: { type: "boolean", default: false },
    roster: { type: "boolean", default: false },
    only: { type: "string" },
    json: { type: "boolean", default: false },
  },
});

const modes: SimMode[] = values.mode === "all" ? ["1v1", "3v3"] : [values.mode as SimMode];
const difficulty = values.difficulty as Difficulty;
const battles = Number(values.battles);
const seed = Number(values.seed);
const element = (values.element ?? "moc") as Element;
const maxTurns = values["max-turns"] ? Number(values["max-turns"]) : undefined;

const gear: SimGear | undefined = values["gear-tier"]
  ? { tier: Number(values["gear-tier"]) as Tier, sets: [values.set ?? null, values["foe-set"] ?? null] }
  : undefined;
const level = values.level ? Number(values.level) : undefined;
const levelLabel = level === undefined ? "" : ` · cấp ${level}`;
const gearLabel = gear ? ` · đồ bậc ${gear.tier} (${gear.sets[0] ?? "không bộ"} / ${gear.sets[1] ?? "không bộ"})` : "";

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const num = (x: number) => x.toFixed(1);

if (values.survival) {
  runSurvival();
  process.exit(0);
}

/** Sinh tồn: --battles lượt chơi ở mỗi cấp, in số đợt vượt qua và số lượt trung bình mỗi đợt. */
function runSurvival(): void {
  const levels = level ? [level] : [5, 10, 20, 30];
  console.log(`\n## Sinh tồn · ${battles} lượt chơi mỗi cấp · AI normal đánh thay người chơi, đội khởi đầu`);
  console.log("| Cấp | Trung bình | p10 | Trung vị | p90 | Qua đợt 5 | Qua đợt 10 | Qua đợt 15 | Lượt/đợt |\n|---|---|---|---|---|---|---|---|---|");
  for (const lv of levels) {
    const runs = Array.from({ length: battles }, (_, i) => simulateSurvival(lv, (seed + i * 104729) >>> 0));
    const waves = runs.map((r) => r.cleared).sort((a, b) => a - b);
    const q = (x: number) => waves[Math.min(waves.length - 1, Math.floor(x * waves.length))]!;
    const reach = (f: number) => pct(waves.filter((x) => x >= f).length / waves.length);
    const avg = waves.reduce((a, b) => a + b, 0) / waves.length;
    const t = runs.flatMap((r) => r.turns);
    const perWave = t.reduce((a, b) => a + b, 0) / t.length;
    console.log(`| ${lv} | ${num(avg)} | ${q(0.1)} | ${q(0.5)} | ${q(0.9)} | ${reach(5)} | ${reach(10)} | ${reach(15)} | ${num(perWave)} |`);
  }
}

if (values.roster) {
  runRoster();
  process.exit(0);
}

/** Tỉ lệ thắng của phe có từng nhân vật kèm, bạn và đối thủ rút ngẫu nhiên từ cả kho. */
function runRoster(): void {
  const levels = level ? [level] : [10, 20, 30];
  const only = values.only?.split(",");
  const candidates = only ? ALL_COMPANIONS.filter((c) => only.includes(c.id)) : ALL_COMPANIONS;
  const group = (id: string) => (isHero(id) ? "tướng lịch sử" : isWarlord(id) ? "sứ quân" : "tướng thường");
  for (const lv of levels) {
    if (!values.json) {
      console.log(`\n## Nhân vật kèm · cấp ${lv} · ${battles} trận mỗi người · AI normal hai phe`);
      console.log("| Nhân vật | Nhóm | Nghề | Hệ | Thắng | Lượt/phe (trung vị) |\n|---|---|---|---|---|---|");
    }
    const rows: { id: string; rate: number }[] = [];
    for (const [id, ms] of rosterMatchups(candidates, ALL_COMPANIONS, battles, lv, seed)) {
      const s = summarize(ms.map((m) => runBattle(m, { difficulty: ["normal", "normal"], maxTurns })));
      const c = candidates.find((x) => x.id === id)!;
      rows.push({ id, rate: s.side0WinRate });
      if (values.json) console.log(JSON.stringify({ level: lv, id, group: group(id), rate: s.side0WinRate }));
      else console.log(`| ${c.name} | ${group(id)} | ${c.profession} | ${c.element} | ${pct(s.side0WinRate)} | ${num(s.turnsPerSide.median)} |`);
    }
    if (!values.json) {
      for (const g of ["tướng thường", "tướng lịch sử", "sứ quân"]) {
        const r = rows.filter((x) => group(x.id) === g);
        if (r.length) console.log(`Trung bình ${g}: ${pct(r.reduce((a, x) => a + x.rate, 0) / r.length)}`);
      }
    }
  }
}

if (values.stage) {
  runStages();
  process.exit(0);
}

/** Tỉ lệ thắng của người chơi ở từng màn; --sweep in thêm một cột cho mỗi mức hơn cấp. */
function runStages(): void {
  const raidArg = values.raid === undefined ? undefined : Number(values.raid);
  if (raidArg !== undefined && !isRaidTier(raidArg)) fail(`--raid phải là 1, 2 hoặc 3`);
  const raid = raidArg as RaidTier | undefined;
  const stages: CampaignStage[] =
    values.stage === "all"
      ? [...(raid ? RAID_STAGES : CAMPAIGN)]
      : [stageById(values.stage!) ?? fail(`Không có màn ${values.stage}`)];
  const team = values.team as StageTeam;
  const sweep = values.sweep?.split("..").map(Number);
  const offsets = sweep ? range(sweep[0]!, sweep[1] ?? sweep[0]!) : null;
  const rate = (stage: CampaignStage, lv: number) => {
    const results = stageMatchups(stage, battles, seed, {
      level: lv,
      team,
      ...(raid ? { raid } : {}),
      ...(values.element ? { element } : {}),
    }).map((m) => runBattle(m, { difficulty: ["normal", raid ? raidSetup(stage, raid).difficulty : stage.difficulty], maxTurns }));
    return summarize(results);
  };
  const json: Record<string, unknown> = {};
  if (!values.json) {
    console.log(`\n## ${raid ? `Đánh trùm bậc ${raid}` : "Chiến dịch"} · ${battles} trận mỗi ô · người chơi AI normal, hệ ${values.element ?? "xoay vòng 7 hệ"}, đội ${team}`);
    console.log(
      offsets
        ? `| Màn | Đối thủ | Khó | Đội kèm | ${offsets.map((o) => `+${o}`).join(" | ")} |\n|---|---|---|---|${offsets.map(() => "---|").join("")}`
        : "| Màn | Đối thủ | Khó | Đội kèm | Cấp | Thắng | Lượt/phe (trung vị) |\n|---|---|---|---|---|---|---|",
    );
  }
  for (const stage of stages) {
    const mates = stage.mode === "3v3" ? stageTeamIds(stage, team, !!raid).join("+") : "—";
    const foeLevel = raid ? raidLevel(stage, raid) : stage.level;
    const head = `| ${stage.id} | ${foeLevel} | ${raid ? raidSetup(stage, raid).difficulty : stage.difficulty} | ${mates} |`;
    if (offsets) {
      const rates = offsets.map((o) => rate(stage, foeLevel + o).side0WinRate);
      json[stage.id] = Object.fromEntries(offsets.map((o, i) => [`+${o}`, rates[i]]));
      if (!values.json) console.log(`${head} ${rates.map(pct).join(" | ")} |`);
    } else {
      const lv = level ?? (raid ? raidRecommended(stage, raid) : recommendedLevel(stage));
      const s = rate(stage, lv);
      json[stage.id] = { level: lv, ...s };
      if (!values.json) console.log(`${head} ${lv} | ${pct(s.side0WinRate)} | ${num(s.turnsPerSide.median)} |`);
    }
  }
  if (values.json) console.log(JSON.stringify(json, null, 2));
}

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const report: Record<string, ReturnType<typeof summarize>> = {};
for (const mode of modes) {
  const started = performance.now();
  const results = buildMatchups(mode, battles, seed, element, gear, level).map((m) =>
    runBattle(m, { difficulty: [difficulty, difficulty], maxTurns }),
  );
  const s = summarize(results);
  report[mode] = s;
  if (values.json) continue;
  const secs = (performance.now() - started) / 1000;
  console.log(`\n## ${mode} · ${s.battles} trận · AI ${difficulty} · chính hệ ${element}${gearLabel}${levelLabel} · ${secs.toFixed(1)}s`);
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
