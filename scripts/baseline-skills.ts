// Task 1: inventory only; does not run balance simulations or overwrite historical artifacts.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  ALL_COMPANIONS, PROFESSIONS, ELEMENTS, mainCharacter, characterSkills,
  chasePassives, COMBO_PASSIVES, CHASE_PASSIVES, CHASE_LIMITS,
  SKILL_SLOT_UNLOCK, CAMPAIGN, stageFoes, DEFAULT_SPIRIT_EXPERIMENT,
  SPIRIT_EXPERIMENTS, spiritAt, spiritHealMultiplier, getSkill,
  type FighterConfig,
} from "../src/core";

const out = "docs/reports/2026-10-22-baseline-f";
mkdirSync(out, { recursive: true });
const passiveIds = (f: FighterConfig) => [f.comboPassive!, ...chasePassives(f)];
const owned = [
  ...PROFESSIONS.flatMap(p => ELEMENTS.map(e => mainCharacter(e, p))),
  ...ALL_COMPANIONS,
].map(f => ({
  id: f.id, name: f.name, profession: f.profession, element: f.element,
  passives: passiveIds(f),
  active: characterSkills(f.profession, f.element, f.id).map(d => ({
    ...d, unlock: SKILL_SLOT_UNLOCK[d.slot!], upgradeLevels: [1, 2, 3, 4, 5],
    upgradeCosts: [1, 1, 2, 2], source: d.ultimate ? "character" : d.profession ? "profession" : "element",
  })),
}));
const campaign = CAMPAIGN.map(stage => ({ stage: stage.id, fighters: stageFoes(stage).map(f => ({
  id: f.id, profession: f.profession, element: f.element, passives: passiveIds(f),
  active: f.skills?.map(id => ({ ...getSkill(id), level: f.skillLevels?.[id] ?? 1 })),
})) }));
const targets = {
  damage: "địch nhận tín hiệu; tín hiệu Khiên chọn địch sống đầu tiên",
  armor: "địch nhận tín hiệu", drain: "địch nhận tín hiệu",
  heal: "đồng minh sống có tỷ lệ HP thấp nhất; hòa chọn vị trí trước",
  shield: "đồng minh nhận tín hiệu hồi",
  energy: "người nhận tín hiệu hồi hoặc người phát tín hiệu sát thương",
};
const definitions = {
  prepared: Object.values(COMBO_PASSIVES).map(p => ({
    ...p, source: "src/core/battle/combos.ts:PROFESSION_COMBO", unlock: 1,
    upgrade: "không nâng riêng, không tốn điểm", rage: 0,
    target: "receiverOnly" in p && p.receiverOnly ? "người nhận Khiên do đồng đội cấp" : "đồng đội của người mở điều kiện",
    duration: "hai lượt thường tiếp theo; expiresAt=sideTurns+3", stacking: "một cơ hội, không refresh",
    limit: "mỗi người tối đa một cơ hội mở trong một lượt thường",
  })),
  chase: Object.values(CHASE_PASSIVES).map(p => ({
    ...p, source: "src/core/battle/chase.ts", unlock: 1,
    upgrade: "không nâng riêng, không tốn điểm", rage: 0,
    target: targets[p.effect], duration: p.effect === "armor" ? "1 lượt người nhận" : p.effect === "shield" ? "2 lượt người nhận" : "tức thì",
    stacking: p.effect === "armor" || p.effect === "shield" ? "max giá trị và thời hạn; không cộng dồn" : "tác dụng thật trong giới hạn tài nguyên",
    limit: "mỗi bị động/người một lần mỗi hành động gốc", chainLimits: CHASE_LIMITS,
  })),
};
const sources = [
  "src/core/battle/rules.ts", "src/core/battle/battle.ts", "src/core/battle/skills.ts",
  "src/core/battle/combos.ts", "src/core/battle/combo-engine.ts", "src/core/battle/chase.ts",
  "src/core/battle/effects.ts", "src/core/battle/state.ts", "src/app/game/battle/DemoGame.tsx",
  "tests/core/battle/chase-baseline.test.ts", "tests/core/battle/spirit-audit.test.ts",
  "src/core/ai/ai.ts", "src/core/gear/gear.ts", "src/core/progress/progress.ts",
  "src/core/progress/profile.ts", "src/core/roster/roster.ts", "scripts/baseline-skills.ts",
];
const result = {
  commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  branch: execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim(),
  sourceHashes: Object.fromEntries(sources.map(path => [path, createHash("sha256").update(readFileSync(path)).digest("hex")])),
  defaultSpirit: DEFAULT_SPIRIT_EXPERIMENT,
  rule: SPIRIT_EXPERIMENTS[DEFAULT_SPIRIT_EXPERIMENT],
  checkpoints: [24, 25, 30, 35, 40, 44, 60].map(turn => ({ turn, spirit: spiritAt(turn), multiplier: Number(spiritHealMultiplier(spiritAt(turn)).toFixed(2)) })),
  definitions, owned, campaign,
};
writeFileSync(`${out}/inventory.json`, JSON.stringify(result, null, 2) + "\n");
writeFileSync(`${out}/inventory.md`, [
  "# Bản đồ kỹ năng baseline F", "", "> Cập nhật: 22/10/2026", "",
  "Sinh bằng `pnpm exec tsx scripts/baseline-skills.ts`. Nguồn, trigger, mục tiêu, thời hạn, cộng dồn, giới hạn và nâng cấp từng bị động nằm trong [inventory.json](inventory.json), mục definitions. Bốn bị động mở cấp1, không nâng riêng, không dùng Nộ. Sáu chủ động mở theo cấp ghi ở từng ô; nâng1–5, giá1/1/2/2. Tài liệu22 và code là nguồn hiện hành.", "",
  "## Nhân vật sở hữu: 42 bộ ĐBL +60 đồng hành", "",
  "| Nhân vật | Nghề / hệ | Bốn bị động: nghề1 / nghề2 / hệ1 / hệ2 | Sáu chủ động: ô:ID (cấp mở) |",
  "|---|---|---|---|",
  ...owned.map(f => `| ${f.name} (${f.id}) | ${f.profession}/${f.element} | ${f.passives.join(" / ")} | ${f.active.map(d => `${d.slot}:${d.id} (${d.unlock})`).join(" / ")} |`),
  "", "## Preset đối thủ PvE", "",
  "Chỉ liệt kê các chiêu thực sự mở theo cấp màn; không gán sáu ô người chơi cho tùy tướng legacy. Các chế độ tháp/sinh tồn/ngày tái dùng builder theo luật hiện hành.", "",
  "| Màn | Nhân vật | Bốn bị động | Chủ động thực mang |", "|---|---|---|---|",
  ...campaign.flatMap(s => s.fighters.map(f => `| ${s.stage} | ${f.id} | ${f.passives.join(" / ")} | ${f.active?.map(d => `${d.id}@${d.level}`).join(" / ")} |`)), "",
].join("\n"));
console.log(`Baseline F: ${owned.length} owned loadouts, ${campaign.length} stages, 26 passive definitions.`);
