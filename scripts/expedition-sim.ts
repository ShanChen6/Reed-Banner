// Viễn Chinh: mô phỏng nhiều lượt cho từng sa bàn × bậc, AI đánh thay người chơi với đội khởi đầu (Đinh Bộ Lĩnh
// và 5 nhân vật khởi đầu) ở cấp gợi ý cộng `--offset`, không trang bị. In JSON tổng hợp.
// Chạy: pnpm exec tsx scripts/expedition-sim.ts --runs 100 [--maps aiBac,cuaBien] [--tiers 1,2] [--offset 0]
//   [--player normal] [--seed 1] [--no-escort]   (--no-escort: bỏ nhiệm vụ hộ tống ở sa bàn thường)

import { parseArgs } from "node:util";
import {
  EXPEDITION_SIM_MAPS,
  EXPEDITION_TIER_INFO,
  simulateExpedition,
  type Difficulty,
  type ExpeditionMapId,
  type ExpeditionTier,
} from "../src/core";

const { values } = parseArgs({
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: {
    runs: { type: "string", default: "100" },
    maps: { type: "string" },
    tiers: { type: "string", default: "1,2,3" },
    offset: { type: "string", default: "0" },
    player: { type: "string", default: "normal" },
    seed: { type: "string", default: "1" },
    "no-escort": { type: "boolean", default: false },
  },
});

const runs = Number(values.runs);
const maps = (values.maps?.split(",") ?? EXPEDITION_SIM_MAPS) as ExpeditionMapId[];
const tiers = values.tiers!.split(",").map(Number) as ExpeditionTier[];
const offset = Number(values.offset);
const seed = Number(values.seed);
const mean = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, x) => a + x, 0) / xs.length) * 100) / 100 : null);

const out = [];
for (const map of maps)
  for (const tier of tiers) {
    const level = EXPEDITION_TIER_INFO[tier].level + offset;
    const results = Array.from({ length: runs }, (_, i) =>
      simulateExpedition({ map, tier, level, seed: seed * 100_003 + i * 7919, player: values.player as Difficulty, escort: !values["no-escort"] }));
    const wins = results.filter((r) => r.won);
    const reasons: Record<string, number> = {};
    for (const r of results) if (!r.won) reasons[r.endReason ?? "?"] = (reasons[r.endReason ?? "?"] ?? 0) + 1;
    out.push({
      map,
      tier,
      level,
      runs,
      winRate: wins.length / runs,
      meanDaysOnWin: mean(wins.map((r) => r.days)),
      stars: [1, 2, 3].map((s) => results.filter((r) => r.stars >= s).length / runs),
      meanBattles: mean(results.map((r) => r.battles)),
      meanBattlesLost: mean(results.map((r) => r.battlesLost)),
      meanCamps: mean(results.map((r) => r.camps)),
      pincerRate: mean(results.map((r) => (r.battles ? r.pincers / r.battles : 0))),
      meanTurnsPerBattle: mean(results.map((r) => (r.battles ? r.turns / r.battles : 0))),
      losses: reasons,
      meanScouts: mean(results.map((r) => r.scouts)),
      cutRate: mean(results.map((r) => (r.cut ? 1 : 0))),
      savedRate: mean(results.map((r) => (r.saved ? 1 : 0))),
      missionRate: mean(results.map((r) => (r.mission ? 1 : 0))),
      marketHeldRate: mean(results.map((r) => (r.marketHeld ? 1 : 0))),
      endings: results.reduce<Record<string, number>>((acc, r) => (r.ending ? { ...acc, [r.ending]: (acc[r.ending] ?? 0) + 1 } : acc), {}),
    });
    const pct = (f: (r: (typeof results)[number]) => boolean) => `${Math.round((100 * results.filter(f).length) / runs)}%`;
    console.error(`${map} bậc ${tier}: thắng ${pct((r) => r.won)} · chặn viện ${pct((r) => r.cut)} · cứu dân ${pct((r) => r.saved)} · giữ kho ${pct((r) => r.marketHeld)} · thắng kèm nhiệm vụ ${pct((r) => r.mission)} · trinh sát ${mean(results.map((r) => r.scouts))}`);
  }
console.log(JSON.stringify(out, null, 2));
