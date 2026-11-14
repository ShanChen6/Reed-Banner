// Sinh và cân tầng 51-100 của Tháp Thí Luyện: chọn luật ghép hợp lệ (có đội khởi đầu đủ điều kiện), đối thủ, tỉ lệ ô, rồi dò
// sức mạnh đối thủ để số đội mẫu thắng (trên 12) rơi vào dải mục tiêu của tầng. In ra các dòng `floor(...)` để dán vào
// `src/server/trialContent.ts`. Chạy một đoạn tầng: pnpm exec tsx scripts/gen-trial-floors.ts --from 51 --to 60 --out a.txt
// Dải mục tiêu: tầng 51-67 thắng 8/12, 68-84 thắng 7/12, 85-99 thắng 6/12, tầng 100 thắng 5/12 (tháp khó dần, đỉnh ở tầng 100).

import { appendFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { ELEMENTS, PROFESSIONS, createRng, trialFloorId, type Element, type FloorRules, type Profession, type TrialFloorSpec } from "../src/core";
import { analyzeFeasibility, profileCandidates } from "../src/core/tower/puzzleValidator";
import { TRIAL_FLOOR_DATA, TRIAL_WEIGHTS } from "../src/server/trialContent";
import { evaluateTrialFloor, trialTestProfile } from "../src/server/trialContentReport";

const { values } = parseArgs({
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: { from: { type: "string" }, to: { type: "string" }, out: { type: "string" }, retune: { type: "string" } },
});

export const targetWins = (floor: number) => (floor <= 50 ? 8 : floor <= 67 ? 8 : floor <= 84 ? 7 : floor <= 99 ? 6 : 5);

const EL: Record<Element, string> = { kim: "Kim", moc: "Mộc", thuy: "Thủy", hoa: "Hỏa", tho: "Thổ", loi: "Lôi", phong: "Phong" };
const PR: Record<Profession, string> = { tuongSi: "Tướng sĩ", binhLinh: "Binh lính", muuSi: "Mưu sĩ", ySu: "Y sư", phapSu: "Pháp sư", quanSu: "Quân sư", xaThu: "Xạ thủ", satThu: "Sát thủ" };
const WEIGHT_NOTE = { STANDARD: "", OFFENSE: "bàn nhiều kiếm", LOW_HEAL: "ô tim rất hiếm", TACTICAL: "bàn nhiều trống và âm dương" } as const;
type WeightName = keyof typeof WEIGHT_NOTE;
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const FOE_POOL = [...new Set(TRIAL_FLOOR_DATA.filter((f) => f.floor >= 21).flatMap((f) => f.enemy.foeIds))];

interface Parts { rules: FloorRules; phrases: string[]; shorts: string[] }

function pickRules(floor: number, rng: ReturnType<typeof createRng>): Parts {
  const want = floor <= 70 ? 3 : 4;
  const rules: { -readonly [K in keyof FloorRules]: FloorRules[K] } = {};
  const phrases: string[] = [];
  const shorts: string[] = [];
  let count = 0;
  const shuffle = <T,>(xs: readonly T[]) => [...xs].sort(() => rng.next() - 0.5);
  const kinds = shuffle(["banEl", "banPr", "minEl", "minPr", "sameEl", "samePr"] as const);
  for (const kind of kinds) {
    if (count >= want) break;
    if (kind === "banEl") {
      const n = Math.min(2, want - count);
      const es = shuffle(ELEMENTS).slice(0, n);
      rules.bannedElements = es;
      phrases.push(`cấm hệ ${es.map((e) => EL[e]).join(" và ")}`);
      shorts.push(`Cấm ${es.map((e) => EL[e]).join(" ")}`);
      count += n;
    } else if (kind === "banPr") {
      const n = Math.min(2, want - count);
      const ps = shuffle(PROFESSIONS).slice(0, n);
      rules.bannedProfessions = ps;
      phrases.push(`cấm ${ps.map((p) => PR[p]).join(" và ")}`);
      shorts.push(`Cấm ${ps.map((p) => PR[p]).join(" ")}`);
      count += n;
    } else if (kind === "minEl") {
      const e = shuffle(ELEMENTS)[0]!;
      rules.minElements = { [e]: 1 };
      phrases.push(`cần một tướng hệ ${EL[e]}`);
      shorts.push(`Cần ${EL[e]}`);
      count += 1;
    } else if (kind === "minPr") {
      const p = shuffle(PROFESSIONS)[0]!;
      rules.minProfessions = { [p]: 1 };
      phrases.push(`cần một ${PR[p]}`);
      shorts.push(`Cần ${PR[p]}`);
      count += 1;
    } else if (kind === "sameEl") {
      rules.maxSameElement = 1;
      phrases.push("ba tướng ra trận phải khác hệ");
      shorts.push("Ba Hệ");
      count += 1;
    } else {
      rules.maxSameProfession = 1;
      phrases.push("ba tướng ra trận phải khác nghề");
      shorts.push("Ba Nghề");
      count += 1;
    }
  }
  return count === want ? { rules, phrases, shorts } : pickRules(floor, rng);
}

const legalPairs = (rules: FloorRules, level: number) => {
  const profile = trialTestProfile(level);
  const ids = Object.keys(profile.companions);
  let n = 0;
  for (let a = 0; a < ids.length; a++)
    for (let b = a + 1; b < ids.length; b++) {
      const minimal = { ...profile, companions: { [ids[a]!]: profile.companions[ids[a]!]!, [ids[b]!]: profile.companions[ids[b]!]! } };
      if (analyzeFeasibility(rules, profileCandidates(minimal), { maxSamples: 1 }).status === "feasible") n++;
    }
  return n;
};

const seen = new Set(TRIAL_FLOOR_DATA.map((f) => JSON.stringify(f.rules)));

function build(floor: number): { spec: TrialFloorSpec; weightName: WeightName; intro: string; title: string; reason: string } {
  const rng = createRng(0x51d0 + floor * 7919);
  let parts: Parts;
  for (let tries = 0; ; tries++) {
    parts = pickRules(floor, rng);
    const key = JSON.stringify(parts.rules);
    if (seen.has(key)) continue;
    const report = analyzeFeasibility(parts.rules, profileCandidates(trialTestProfile(30)), { maxSamples: 12 });
    if (report.status !== "feasible" || report.samples.length < 6 || legalPairs(parts.rules, 30) < 2) continue;
    seen.add(key);
    break;
  }
  const names = Object.keys(TRIAL_WEIGHTS) as WeightName[];
  const weightName = names[rng.int(0, names.length - 1)]!;
  const pool = [...FOE_POOL];
  const foes = [0, 1, 2].map(() => pool.splice(rng.int(0, pool.length - 1), 1)[0]!);
  const boss = floor % 5 === 0;
  const difficulty = floor % 10 === 0 ? "nightmare" : boss ? "boss" : "hard";
  const note = WEIGHT_NOTE[weightName];
  const intro = `${parts.phrases.join(", ").replace(/^./, (c) => c.toUpperCase())}${note ? `; ${note}` : ""}.`;
  const title = floor === 100 ? "Thiên Đỉnh Thí Luyện" : floor % 10 === 0 ? `Ải Trùm Chặng ${ROMAN[Math.floor((floor - 1) / 10) + 1]}` : boss ? `Ải ${parts.shorts[0]}` : parts.shorts.slice(0, 2).join(" · ");
  const power = 0.9 + (floor - 50) * 0.012;
  const spec: TrialFloorSpec = {
    schema: 1,
    id: trialFloorId(floor),
    floor,
    contentVersion: 1,
    narrative: { title, intro },
    difficulty,
    rules: parts.rules,
    enemy: { foeIds: foes, level: 30, power: +power.toFixed(2) },
    board: { publicSeed: 0x5a17_0000 + floor * 7919, weights: TRIAL_WEIGHTS[weightName] },
    serverSalt: 0x2d41_0000 + floor * 104729,
    turnLimit: floor <= 70 ? 27 : floor <= 90 ? 26 : 25,
    win: { kind: "defeatAll" },
    firstClearStones: 20 + Math.round(((floor - 51) * 10) / 49),
    unlock: { requiresFloor: floor - 1 },
  };
  const reason = `${boss ? "Ải trùm" : "Luật ghép"} ${floor <= 70 ? "ba" : "bốn"} luật đơn, địch cấp 30; đội khởi đầu vẫn có lời giải, sức mạnh địch dò theo mục tiêu thắng ${targetWins(floor)}/12.`;
  return { spec, weightName, intro, title, reason };
}

/** Dò sức mạnh đối thủ để số đội mẫu thắng nằm trong [target, target+1]; lấy mức cao nhất đạt được. */
function calibrate(spec: TrialFloorSpec, target: number): { power: number; wins: number } {
  let power = spec.enemy.power;
  let best: { power: number; wins: number } | null = null;
  let lo = 0.3;
  let hi = 2.4;
  for (let i = 0; i < 9; i++) {
    const r = evaluateTrialFloor({ ...spec, enemy: { ...spec.enemy, power: +power.toFixed(2) } });
    if (r.wins >= target && (best === null || power > best.power)) best = { power: +power.toFixed(2), wins: r.wins };
    if (r.wins >= target && r.wins <= target + 1) break;
    if (r.wins > target + 1) lo = power;
    else hi = power;
    power = (lo + hi) / 2;
    if (hi - lo < 0.02) break;
  }
  return best ?? { power: +lo.toFixed(2), wins: 0 };
}

const out = values.out!;
if (values.retune) {
  // Dò lại sức mạnh một tầng cũ theo dải mục tiêu mới.
  for (const n of values.retune.split(",").map(Number)) {
    const spec = TRIAL_FLOOR_DATA.find((f) => f.floor === n)!;
    const r = calibrate(spec, targetWins(n));
    appendFileSync(out, `retune ${n} power ${r.power} wins ${r.wins} (đang ${spec.enemy.power})\n`);
  }
} else {
  for (let f = Number(values.from); f <= Number(values.to); f++) {
    const { spec, weightName, reason } = build(f);
    const r = calibrate(spec, targetWins(f));
    const rules = JSON.stringify(spec.rules);
    appendFileSync(
      out,
      JSON.stringify({ floor: f, title: spec.narrative.title, intro: spec.narrative.intro, rules: spec.rules, foes: spec.enemy.foeIds, power: r.power, wins: r.wins, difficulty: spec.difficulty, turnLimit: spec.turnLimit, stones: spec.firstClearStones, weight: weightName, reason, ruleText: rules }) + "\n",
    );
  }
}
