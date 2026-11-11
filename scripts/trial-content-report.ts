import { TRIAL_DESIGN_REASON, TRIAL_FLOOR_DATA } from "../src/server/trialContent";
import { evaluateTrialContent } from "../src/server/trialContentReport";

// Tham số tùy chọn: `pnpm tsx scripts/trial-content-report.ts 21 50` chỉ chạy tầng 21 đến 50.
const [from = 1, to = TRIAL_FLOOR_DATA.length] = process.argv.slice(2).map(Number);
const results = evaluateTrialContent(TRIAL_FLOOR_DATA.filter((spec) => spec.floor >= from && spec.floor <= to));
console.log("| Tầng | Legal teams | Sample run | Success | Turns | Lý do |");
console.log("|---:|---:|---|---:|---:|---|");
for (const result of results) {
  const ids = result.sampleIds.length > 0 ? result.sampleIds.join(" + ") : "—";
  console.log(`| ${result.floor} | ${result.legalTeams} | ${ids} | ${result.wins}/${result.sampleTeams} (${Math.round(result.successRate * 100)}%) | ${result.sampleTurns ?? "—"} | ${TRIAL_DESIGN_REASON[result.floor - 1]} |`);
}
