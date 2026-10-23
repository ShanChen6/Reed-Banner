import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  CAMPAIGN,
  CHASE_PASSIVES,
  COMBO_PASSIVES,
  DEFAULT_SPIRIT_EXPERIMENT,
  ELEMENTS,
  MAIN_SLOT_UNLOCK,
  PROFESSIONS,
  PROFESSION_COMBO,
  characterSkills,
  chasePassives,
  dailySetup,
  runBattle,
  simulateSurvival,
  simulateTower,
  spiritAt,
  spiritHealMultiplier,
  spiritStatMultiplier,
  summarize,
} from "../src/core";
import { skillText } from "../src/app/game/battle/labels";

const out = "docs/reports/2026-10-23-pve-ui-handoff";
mkdirSync(`${out}/raw`, { recursive: true });

const rows = Array.from({ length: 14 }, (_, day) => {
  const seed = (34_000_019 + day * 104_729) >>> 0;
  const setup = dailySetup(seed);
  return [0, 1].map((firstSide) => {
    const result = runBattle(
      {
        sides: [
          { fighters: setup.team, leader: 0 },
          { fighters: setup.foes, leader: 0 },
        ],
        weights: setup.weights,
        seed,
        firstSide: firstSide as 0 | 1,
      },
      { difficulty: ["normal", setup.difficulty], maxTurns: 120 },
    );
    return {
      day,
      seed,
      profession: setup.profession,
      element: setup.element,
      stage: setup.stage,
      ...result,
    };
  });
}).flat();

const aggregate = summarize(rows);
const grouped = <K extends string>(key: (row: (typeof rows)[number]) => K) =>
  Object.fromEntries(
    [...new Set(rows.map(key))].sort().map((value) => {
      const selected = rows.filter((row) => key(row) === value);
      return [value, summarize(selected)];
    }),
  );

const uiContracts: Array<Record<string, unknown>> = [];
for (const profession of PROFESSIONS) {
  for (const element of ELEMENTS) {
    const skills = characterSkills(profession, element);
    const reactions = chasePassives({ profession, element });
    if (skills.length !== 6 || reactions.length !== 3) throw new Error(`${profession}/${element}: loadout`);
    const prepared = PROFESSION_COMBO[profession];
    if (!COMBO_PASSIVES[prepared] || reactions.some((id) => !CHASE_PASSIVES[id])) throw new Error(`${profession}/${element}: passive`);
    for (const skill of skills) {
      const label = skillText(skill);
      const unlock = MAIN_SLOT_UNLOCK[skill.slot!];
      if (!label.includes(`${skill.cost} NL`) || !label.includes(`mở cấp ${unlock}`)) throw new Error(`${skill.id}: label`);
    }
    uiContracts.push({ profession, element, actives: skills.map((s) => s.id), prepared, reactions });
  }
}

const spirit = [24, 25, 30, 44].map((turn) => {
  const value = spiritAt(turn);
  return {
    turn,
    spirit: value,
    statMultiplier: spiritStatMultiplier(value),
    healShieldMultiplier: spiritHealMultiplier(value),
  };
});
const expectedSpirit = [
  { turn: 24, spirit: 100, statMultiplier: 1, healShieldMultiplier: 1 },
  { turn: 25, spirit: 95, statMultiplier: 1, healShieldMultiplier: 0.96 },
  { turn: 30, spirit: 70, statMultiplier: 1, healShieldMultiplier: 0.76 },
  { turn: 44, spirit: 0, statMultiplier: 1, healShieldMultiplier: 0.2 },
];
if (JSON.stringify(spirit) !== JSON.stringify(expectedSpirit)) throw new Error("F contract changed");

const sources = [
  "src/core/ai/ai.ts",
  "src/core/battle/rules.ts",
  "src/core/battle/skills.ts",
  "src/core/campaign/campaign.ts",
  "src/core/tower/tower.ts",
  "src/core/survival/survival.ts",
  "src/core/daily/daily.ts",
  "src/app/game/battle/SkillDetails.tsx",
  "src/app/game/battle/DemoGame.tsx",
  "src/app/game/battle/labels.ts",
  "scripts/task4-audit.ts",
];
const sha256 = Object.fromEntries(
  sources.map((path) => [path, createHash("sha256").update(readFileSync(path)).digest("hex")]),
);

writeFileSync(`${out}/raw/daily.jsonl`, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
writeFileSync(
  `${out}/daily-summary.json`,
  JSON.stringify({ aggregate, byProfession: grouped((r) => r.profession), byElement: grouped((r) => r.element), byStage: grouped((r) => r.stage) }, null, 2) + "\n",
);
writeFileSync(
  `${out}/ui-contracts.json`,
  JSON.stringify({ rule: DEFAULT_SPIRIT_EXPERIMENT, spirit, loadouts: uiContracts, campaignStages: CAMPAIGN.map((s) => s.id), sourceSHA256: sha256 }, null, 2) + "\n",
);
const sequenceLevels = [5, 10, 20, 30];
const sequence = Object.fromEntries(sequenceLevels.map((level) => {
  const tower = [simulateTower(level, 35_000_019 + level * 1009, 8).cleared];
  const survival = [simulateSurvival(level, 36_000_019 + level * 1009, 8)];
  return [level, { tower, survival }];
}));
writeFileSync(`${out}/sequence-summary.json`, JSON.stringify(sequence, null, 2) + "\n");
console.log(`Audited ${rows.length} daily battles, ${uiContracts.length} UI contracts, and ${sequenceLevels.length * 2} sequence runs.`);
