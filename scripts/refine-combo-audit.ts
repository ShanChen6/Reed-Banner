/** Reuse is justified only because the sole AI change adds value to dispelling comboReady. */
import {
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
  existsSync,
} from "node:fs";
import { parseArgs } from "node:util";
import {
  screeningCases,
  spiritCases,
  pressureCases,
  campaignAuditCases,
} from "../src/core/sim/audit";
import { getSkill } from "../src/core";
import { runMeasured } from "./lib/spirit-runner";
const { values } = parseArgs({ options: { group: { type: "string" } } });
const group = values.group;
if (!group || !["screen", "focused", "campaign"].includes(group))
  throw new Error("invalid group");
const dir = "/workspace/combo-audit";
const cases =
  group === "screen"
    ? screeningCases()
    : group === "focused"
      ? [...spiritCases(), ...pressureCases()]
      : campaignAuditCases();
const oldPaths = group === "screen" ? [0, 1] : [0];
const oldRows = oldPaths.flatMap((i) =>
  readFileSync(`${dir}/pre-dispel/${group}-on-${i}.jsonl`, "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l)),
);
const old = new Map(oldRows.map((r) => [r.caseId, r]));
const audit: { caseId: string; replayed: boolean; reason: string }[] = [];
const rows = [];
for (const c of cases) {
  const before = old.get(c.id);
  if (!before) throw new Error("missing baseline");
  const dispel = c.matchup.sides.some((s) =>
    s.fighters.some((f) =>
      f.skills?.some((id) =>
        getSkill(id)?.steps.some((s) => s.type === "dispel"),
      ),
    ),
  );
  const replay = before.combos.opened > 0 && dispel;
  const row = replay
    ? runMeasured(c, "after", "A", 120)
    : {
        ...before,
        reusedFrom: "pre-dispel AI: changed valuation is unreachable",
      };
  const reason = replay
    ? "combo opportunities and dispel skill carried"
    : before.combos.opened === 0
      ? "no opportunity in original trajectory; valuation remains zero by induction"
      : "no carried dispel step; changed scoring branch unreachable";
  rows.push(
    JSON.stringify({
      ...row,
      comboMode: "on",
      comboRevision: "dispel-aware-v2",
    }),
  );
  audit.push({ caseId: c.id, replayed: replay, reason });
}
const temp = `${dir}/${group}-on-0.jsonl.tmp`;
writeFileSync(temp, rows.join("\n") + "\n");
renameSync(temp, `${dir}/${group}-on-0.jsonl`);
if (existsSync(`${dir}/${group}-on-1.jsonl`))
  unlinkSync(`${dir}/${group}-on-1.jsonl`);
writeFileSync(`${dir}/revision-${group}.json`, JSON.stringify(audit, null, 2));
console.log(
  JSON.stringify({
    group,
    replayed: audit.filter((r) => r.replayed).length,
    reused: audit.filter((r) => !r.replayed).length,
  }),
);
