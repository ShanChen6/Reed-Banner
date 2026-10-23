// Read-only regression against the checkpoint: active numeric contracts must survive layout/combo changes.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { SKILLS, scaleSkill, type SkillDef } from "../src/core";
const commit = "32f87aa1410c14ad35627d6075819f85fe27c23d";
const oldText = execFileSync(
  "git",
  ["show", `${commit}:src/core/battle/skills.ts`],
  { encoding: "utf8" },
);
const js = ts.transpileModule(oldText, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const legacy: {
  SKILLS: Record<string, SkillDef>;
  scaleSkill: (d: SkillDef, l: number) => SkillDef;
} = {} as never;
runInNewContext(js, { exports: legacy });
const digest = (x: string) => createHash("sha256").update(x).digest("hex");
const contract = (d: SkillDef) =>
  JSON.stringify({
    id: d.id,
    name: d.name,
    profession: d.profession,
    element: d.element,
    character: d.character,
    tier: d.tier,
    cost: d.cost,
    target: d.target,
    steps: d.steps,
  });
if (
  JSON.stringify(Object.keys(legacy.SKILLS).sort()) !==
  JSON.stringify(Object.keys(SKILLS).sort())
)
  throw new Error("Active skill IDs changed");
const checks = [];
for (const [id, current] of Object.entries(SKILLS))
  for (const level of [1, 2, 3, 4, 5]) {
    const before = contract(legacy.scaleSkill(legacy.SKILLS[id]!, level)),
      after = contract(scaleSkill(current, level));
    if (before !== after)
      throw new Error(`Numeric contract changed ${id} @${level}`);
    checks.push({ id, level, sha256: digest(after) });
  }
const oldRules = execFileSync(
  "git",
  ["show", `${commit}:src/core/battle/rules.ts`],
  { encoding: "utf8" },
);
if (oldRules !== readFileSync("src/core/battle/rules.ts", "utf8"))
  throw new Error("Spirit/food rules changed");
const oldCampaign = execFileSync(
  "git",
  ["show", `${commit}:src/core/campaign/campaign.ts`],
  { encoding: "utf8" },
);
if (oldCampaign !== readFileSync("src/core/campaign/campaign.ts", "utf8"))
  throw new Error("Campaign presets changed");
const stats = (text: string) =>
  text.slice(
    text.indexOf("export const BASE_STATS"),
    text.indexOf("/** Nhân vật chính"),
  );
if (
  stats(
    execFileSync("git", ["show", `${commit}:src/core/roster/roster.ts`], {
      encoding: "utf8",
    }),
  ) !== stats(readFileSync("src/core/roster/roster.ts", "utf8"))
)
  throw new Error("Base stats changed");
const result = {
  checkpoint: commit,
  skills: Object.keys(SKILLS).length,
  levelsChecked: 5,
  numericContractsEqual: true,
  spiritAndFoodRulesByteIdentical: true,
  campaignPresetsByteIdentical: true,
  baseStatsByteIdentical: true,
  checks,
};
writeFileSync(
  "docs/reports/2026-10-22-combo/skill-contracts.json",
  JSON.stringify(result, null, 2),
);
console.log(
  `Verified ${result.skills} skills ×5 levels, base stats, Spirit/food and campaign against ${commit.slice(0, 7)}`,
);
