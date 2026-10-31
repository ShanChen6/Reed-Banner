import { writeFileSync, mkdirSync } from "node:fs";
import {
  ALL_COMPANIONS,
  mainCharacter,
  characterSkills,
  COMBO_PASSIVES,
  skillComboOpeners,
  STORY_NODES,
  campaignEncounterFoes,
} from "../src/core";
const out = "docs/reports/2026-10-22-combo";
mkdirSync(out, { recursive: true });
const roster = [mainCharacter(), ...ALL_COMPANIONS].map((f) => {
  const passive = COMBO_PASSIVES[f.comboPassive!];
  const skills = characterSkills(f.profession, f.element, f.id);
  return {
    id: f.id,
    name: f.name,
    profession: f.profession,
    element: f.element,
    passive: passive.id,
    passiveName: passive.name,
    triggers: passive.triggers,
    payoff: passive.payoff,
    skills: skills.map((d) => ({
      id: d.id,
      name: d.name,
      slot: d.slot,
      ultimate: d.ultimate ?? false,
      cost: d.cost,
      openers: skillComboOpeners(d),
    })),
  };
});
// Campaign V2: đối thủ phase đầu của mọi nhiệm vụ có trận (chiến dịch 13 màn cũ đã gỡ ở CAMP-08.04).
const campaign = STORY_NODES.flatMap((n) => {
  const foes = campaignEncounterFoes(n.id);
  return foes ? [{ id: n.id, foes }] : [];
}).map((s) => ({
  stage: s.id,
  foes: s.foes.map((f) => ({
    id: f.id,
    profession: f.profession,
    element: f.element,
    passive: f.comboPassive,
    skills: f.skills,
  })),
}));
writeFileSync(
  `${out}/catalog.json`,
  JSON.stringify({ roster, campaign }, null, 2),
);
const names = {
  xaThu:"Xạ thủ",satThu:"Sát thủ",tuongSi: "Tướng sĩ",
  phapSu: "Pháp sư",
  binhLinh: "Binh lính",
  ySu: "Y sư",
  muuSi: "Mưu sĩ",
  quanSu: "Quân sư",
};
const table = [
  "# Ma trận nhân vật: kỹ năng và bị động phối hợp",
  "",
  `> Sinh từ dữ liệu thực bằng \`pnpm exec tsx scripts/combo-catalog.ts\`. Đây là ${roster.length} nhân vật, không phải ${roster.length} luật engine riêng. Các tướng cùng nghề dùng chung mẫu bị động; tuyệt chiêu cá nhân vẫn riêng. ĐBL có thể đổi nghề/hệ, bảng ghi mặc định.`,
  "",
  "| Nhân vật | Nghề / hệ | Bị động | Ô 1 / 2 / 3 / 4 tuyệt chiêu / 5 / 6 |",
  "|---|---|---|---|",
  ...roster.map(
    (f) =>
      `| ${f.name} (${f.id}) | ${names[f.profession]} / ${f.element} | ${f.passiveName} | ${f.skills.map((d) => `${d.slot}. ${d.name}`).join(" / ")} |`,
  ),
];
writeFileSync(`${out}/roster-matrix.md`, table.join("\n") + "\n");
console.log(
  `Catalog: ${roster.length} heroes, ${campaign.length} campaign presets`,
);
