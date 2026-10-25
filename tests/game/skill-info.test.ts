import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { characterSkills, ELEMENTS, PASSIVE, PROFESSIONS, scaleSkill, SKILL_MAX_LEVEL } from "../../src/core";
import { passiveText, skillLevelTable, skillStepTexts } from "../../src/app/game/battle/labels";

describe("mô tả kỹ năng trang giới thiệu", () => {
  it("bảng cấp khớp scaleSkill cho mọi kỹ năng của nhân vật chính", () => {
    for (const p of PROFESSIONS) for (const e of ELEMENTS) for (const def of characterSkills(p, e)) {
      const table = skillLevelTable(def);
      assert.equal(table[0]!.label, "Năng lượng");
      assert.deepEqual(table[0]!.values, Array.from({ length: SKILL_MAX_LEVEL }, (_, i) => String(scaleSkill(def, i + 1).cost)));
      for (const row of table) assert.equal(row.values.length, SKILL_MAX_LEVEL);
      assert.equal(skillStepTexts(def).length, def.steps.length);
    }
  });

  it("sát thương tăng theo cấp", () => {
    const def = characterSkills("tuongSi", "kim").find((d) => d.steps.some((s) => s.type === "damage"))!;
    const row = skillLevelTable(def).find((r) => r.label.startsWith("Sát thương"))!;
    assert.notEqual(row.values[0], row.values.at(-1));
  });

  it("bị động Nộ đọc số từ core", () => {
    assert.match(passiveText("hoa"), new RegExp(`\\+${Math.round(PASSIVE.hoaDamage * 100)}%`));
    for (const e of ELEMENTS) assert.ok(passiveText(e).length > 20);
  });
});

describe("điều kiện kích hoạt bị động", () => {
  it("mọi bị động phối hợp/truy kích và bị động Nộ đều có điều kiện", async () => {
    const { COMBO_PASSIVES, CHASE_PASSIVES, RAGE_MAX, RAGE_PER_DRUM } = await import("../../src/core");
    const { chaseTriggerText, comboTriggerText, rageTriggerText } = await import("../../src/app/game/battle/labels");
    for (const p of Object.values(COMBO_PASSIVES)) assert.equal(comboTriggerText(p).length, 3);
    for (const p of Object.values(CHASE_PASSIVES)) assert.equal(chaseTriggerText(p).length, 2);
    const rage = rageTriggerText().join(" ");
    assert.ok(rage.includes(`+${RAGE_PER_DRUM}`) && rage.includes(String(RAGE_MAX)));
  });
});
