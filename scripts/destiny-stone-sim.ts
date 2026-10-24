import { simulateDestinyCycle, summarize, type DestinySimPolicy } from "../src/server/destinyBalanceReport";

const cycles = ["2026-10-19", "2026-10-26", "2026-11-02", "2026-11-09"];
const caps = [3, 5, 8] as const;
const levels = [5, 10, 20, 30] as const;
const policies: readonly DestinySimPolicy[] = ["boon_first", "recovery_first"];

console.log("| Cap | Level | Policy | Mean floor | Median | P90 | Food | HP% | Revive | Boon | Recovery | Stone/week |");
console.log("|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
for (const cap of caps) for (const level of levels) for (const policy of policies) {
  const rows = cycles.map((cycle) => simulateDestinyCycle(cycle, cap, level, policy));
  const floor = summarize(rows.map((row) => row.floors));
  const avg = (pick: (row: typeof rows[number]) => number) => rows.reduce((sum, row) => sum + pick(row), 0) / rows.length;
  console.log(`| ${cap} | ${level} | ${policy} | ${floor.mean.toFixed(2)} | ${floor.median} | ${floor.p90} | ${avg((r) => r.food).toFixed(1)} | ${(100 * avg((r) => r.hpRatio)).toFixed(1)} | ${avg((r) => r.revives).toFixed(2)} | ${avg((r) => r.boonPicks).toFixed(2)} | ${avg((r) => r.recoveryPicks).toFixed(2)} | ${avg((r) => r.stones).toFixed(2)} |`);
}

console.log("\nMulti-run/week (best of policy paths; milestone/cycle stones remain once):");
for (const cap of caps) {
  const one = cycles.map((cycle) => simulateDestinyCycle(cycle, cap, 10, "boon_first"));
  const two = cycles.map((cycle, index) => Math.max(one[index]!.floors, simulateDestinyCycle(cycle, cap, 10, "recovery_first").floors));
  console.log(`${cap}|1run=${summarize(one.map((r) => r.floors)).mean.toFixed(2)}|2run=${summarize(two).mean.toFixed(2)}|3run=${summarize(two).mean.toFixed(2)}`);
}
