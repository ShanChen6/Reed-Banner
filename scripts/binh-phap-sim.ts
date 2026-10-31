// Mô phỏng Trận Đồ: chạy nhiều seed với vài chiến thuật để đo tỷ lệ thắng, độ dài ván và xác nhận không có nước đi sai.
//   pnpm exec tsx scripts/binh-phap-sim.ts [--runs 2000] [--level thuong|all] [--seed 1] [--csv out.csv]
import { parseArgs } from "node:util";
import { writeFileSync } from "node:fs";
import {
  RULESETS,
  createPuzzle,
  legalPlacements,
  replay,
  transition,
  type Command,
  type PuzzleState,
  type Ruleset,
} from "../src/core/binh-phap";
import { createRng, type Rng } from "../src/core/rng";

const MAX_TURNS = 3000;

type Agent = (s: PuzzleState, rng: Rng) => Command;

const place = (s: PuzzleState, i: number): Command => ({ kind: "place", row: Math.floor(i / s.width), col: i % s.width });

const random: Agent = (s, rng) => {
  const legal = legalPlacements(s);
  return legal.length ? place(s, legal[rng.int(0, legal.length - 1)]!) : { kind: "discard" };
};

/** Chọn nước cho ra nhiều ô khai thông mới nhất rồi tới nhiều điểm nhất; Thu Hồi chỉ dùng khi thanh nóng. */
const greedy: Agent = (s) => {
  if (s.hand.kind === "eraser" && s.discardHeat < 2) return { kind: "discard" };
  const legal = legalPlacements(s);
  let best: Command | null = null;
  let bestScore = -Infinity;
  for (const i of legal) {
    const cmd = place(s, i);
    const t = transition(s, cmd);
    if (!t.ok) throw new Error("nước hợp lệ bị từ chối");
    const v = t.state.coveredCount * 1000 + t.state.score - (s.hand.kind === "eraser" ? 500 : 0);
    if (v > bestScore) {
      bestScore = v;
      best = cmd;
    }
  }
  return best ?? { kind: "discard" };
};

const AGENTS: Record<string, Agent> = { random, greedy };

interface Result {
  readonly won: boolean;
  readonly turns: number;
  readonly discards: number;
  readonly covered: number;
  readonly lines: number;
  readonly score: number;
}

function play(rules: Ruleset, seed: number, agent: Agent): Result {
  const rng = createRng(seed ^ 0x9e3779b9);
  let s = createPuzzle(rules, seed);
  const log: Command[] = [];
  while (s.phase === "playing" && s.turn < MAX_TURNS) {
    const cmd = agent(s, rng);
    const t = transition(s, cmd);
    if (!t.ok) throw new Error(`nước bị từ chối: ${JSON.stringify(cmd)} ${t.reason}`);
    s = t.state;
    log.push(cmd);
  }
  const again = replay(rules, seed, log);
  if (JSON.stringify(again) !== JSON.stringify(s)) throw new Error(`replay lệch ở seed ${seed}`);
  return { won: s.phase === "won", turns: s.turn, discards: s.discarded, covered: s.coveredCount / (s.width * s.height), lines: s.linesCleared, score: s.score };
}

const pct = (xs: number[], p: number) => [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(p * xs.length))] ?? 0;
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

const { values } = parseArgs({ options: { runs: { type: "string", default: "2000" }, level: { type: "string", default: "all" }, seed: { type: "string", default: "1" }, csv: { type: "string" } } });
const runs = Number(values.runs);
const seed0 = Number(values.seed);
const levels = values.level === "all" ? RULESETS : RULESETS.filter((r) => r.id === values.level);
if (!levels.length || !Number.isInteger(runs) || runs < 1) throw new Error("tham số không hợp lệ");

const rows = ["level,agent,runs,win_rate,median_turns,p90_turns,mean_discards,mean_covered,mean_lines,mean_score"];
console.log("level      agent   runs  thắng   lượt(med/p90)  bỏ lệnh  khai thông  hàng  điểm");
for (const rules of levels) {
  for (const [name, agent] of Object.entries(AGENTS)) {
    const res: Result[] = [];
    for (let i = 0; i < runs; i++) res.push(play(rules, seed0 + i, agent));
    const wins = res.filter((r) => r.won).length / runs;
    const turns = res.map((r) => r.turns);
    const line = [rules.id, name, runs, wins.toFixed(3), pct(turns, 0.5), pct(turns, 0.9), mean(res.map((r) => r.discards)).toFixed(2), mean(res.map((r) => r.covered)).toFixed(3), mean(res.map((r) => r.lines)).toFixed(2), mean(res.map((r) => r.score)).toFixed(0)];
    rows.push(line.join(","));
    console.log(`${rules.id.padEnd(10)} ${name.padEnd(7)} ${String(runs).padStart(5)} ${(wins * 100).toFixed(1).padStart(6)}%  ${String(pct(turns, 0.5)).padStart(5)}/${String(pct(turns, 0.9)).padEnd(5)}  ${String(line[6]).padStart(7)}  ${String(line[7]).padStart(10)}  ${String(line[8]).padStart(4)}  ${line[9]}`);
  }
}
if (values.csv) writeFileSync(values.csv, rows.join("\n") + "\n");
