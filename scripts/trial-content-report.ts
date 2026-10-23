import { TRIAL_DESIGN_REASON, TRIAL_FLOOR_DATA } from "../src/server/trialContent";
import { evaluateTrialContent } from "../src/server/trialContentReport";

const results = evaluateTrialContent(TRIAL_FLOOR_DATA);
console.log("| Tầng | Legal teams | Sample run | Success | Turns | Lý do |");
console.log("|---:|---:|---|---:|---:|---|");
for (const result of results) {
  const ids = result.sampleIds.length > 0 ? result.sampleIds.join(" + ") : "—";
  console.log(`| ${result.floor} | ${result.legalTeams} | ${ids} | ${result.wins}/${result.sampleTeams} (${Math.round(result.successRate * 100)}%) | ${result.sampleTurns ?? "—"} | ${TRIAL_DESIGN_REASON[result.floor - 1]} |`);
}
