// CAMP-09.02: mô phỏng mọi nhiệm vụ có trận của Campaign V2 theo đúng cách server chốt mục tiêu (phòng thủ đủ
// lượt, trùm qua ngưỡng máu, công thành nhiều phase), với nhiều hồ sơ người chơi. In JSON tổng hợp từng ô.
// Chạy: pnpm exec tsx scripts/campaign-balance.ts --runs 200 [--missions M03,M04] [--profiles starter,heroes]
//   [--seed 1] > out.json. Nhiệm vụ story/diplomacy/preparation không có trận nên không chạy.

import { parseArgs } from "node:util";
import {
  STORY_NODES,
  isCombatStoryNode,
  simulateMission,
  type CampaignMissionId,
  type MissionRunResult,
  type MissionSimOptions,
} from "../src/core";

const { values } = parseArgs({
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: {
    runs: { type: "string", default: "200" },
    missions: { type: "string" },
    profiles: { type: "string" },
    seed: { type: "string", default: "1" },
  },
});

/** Hồ sơ người chơi: đội khởi đầu hay tướng lịch sử, cấp lệch so với gợi ý, có đồ hay không. */
export const PROFILES: Readonly<Record<string, MissionSimOptions>> = {
  starter: { team: "default" },
  heroes: { team: "heroes" },
  "heroes-1": { team: "heroes", levelOffset: -1 },
  "heroes+2": { team: "heroes", levelOffset: 2 },
  "heroes-gear2": { team: "heroes", gearTier: 2 },
};

const runs = Number(values.runs);
const seed = Number(values.seed);
const missions = (values.missions?.split(",") ??
  STORY_NODES.filter(isCombatStoryNode).map((n) => n.id)) as CampaignMissionId[];
const profiles = values.profiles?.split(",") ?? Object.keys(PROFILES);

const median = (xs: number[]) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};
const quantile = (xs: number[], q: number) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))]!;
};
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : null);

function summarizeCell(results: MissionRunResult[]) {
  const phaseCount = Math.max(...results.map((r) => r.phases.length));
  const phases = Array.from({ length: phaseCount }, (_, i) => {
    const reached = results.flatMap((r) => (r.phases[i] ? [r.phases[i]!] : []));
    const passed = reached.filter((p) => p.status === "advance" || p.status === "succeeded");
    return {
      phase: i,
      reached: reached.length,
      winRate: reached.length ? passed.length / reached.length : null,
      medianTurns: median(reached.map((p) => p.playerTurns)),
      medianFoodStart: median(reached.map((p) => p.foodStart)),
      medianFoodEnd: median(reached.map((p) => p.foodEnd)),
      meanFoodBought: mean(reached.map((p) => p.foodBought)),
      bossThresholdRate: passed.length ? passed.filter((p) => p.bossThreshold).length / passed.length : null,
      medianBossHpEnd: median(passed.flatMap((p) => (p.bossHpEnd === null ? [] : [p.bossHpEnd]))),
      wiped: reached.filter((p) => p.status === "failed").length,
      starvedWipes: reached.filter((p) => p.status === "failed" && p.foodEnd === 0).length,
      stalled: reached.filter((p) => p.status === "stalled").length,
      medianPlayerHpEndOnWin: median(passed.map((p) => p.playerHpEnd)),
      meanRewardGoldOnWin: mean(passed.map((p) => p.rewardGold)),
      meanRewardXpOnWin: mean(passed.map((p) => p.rewardXp)),
      shuffles: reached.reduce((a, p) => a + p.shuffles, 0),
      noValidMoveAtStart: reached.filter((p) => !p.hadValidMove).length,
    };
  });
  const cleared = results.filter((r) => r.outcome === "succeeded");
  // Server giữ phase đã qua: số trận kỳ vọng để qua nhiệm vụ khi đánh lại phase thua = tổng 1/p của từng phase.
  const expectedAttempts = phases.every((p) => p.winRate)
    ? phases.reduce((a, p) => a + 1 / p.winRate!, 0)
    : null;
  return {
    runs: results.length,
    clearRate: cleared.length / results.length,
    expectedAttempts,
    medianTurnsOnClear: median(cleared.map((r) => r.phases.reduce((a, p) => a + p.playerTurns, 0))),
    p90TurnsOnClear: quantile(cleared.map((r) => r.phases.reduce((a, p) => a + p.playerTurns, 0)), 0.9),
    lose: {
      wiped: results.filter((r) => r.outcome === "wiped").length,
      stalled: results.filter((r) => r.outcome === "stalled").length,
    },
    phases,
  };
}

const out: Record<string, Record<string, unknown>> = {};
const t0 = Date.now();
for (const id of missions) {
  out[id] = {};
  for (const name of profiles) {
    const opts = PROFILES[name];
    if (!opts) throw new Error(`Không có hồ sơ ${name}`);
    const results = Array.from({ length: runs }, (_, i) => simulateMission(id, i, seed, opts));
    out[id]![name] = summarizeCell(results);
    console.error(`${id} ${name} xong (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
}
console.log(JSON.stringify(out, null, 2));
