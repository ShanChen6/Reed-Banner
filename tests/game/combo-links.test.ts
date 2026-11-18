import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { companionById, mainCharacter, skillComboOpeners, withComboPassive } from "../../src/core";
import { comboLinks, comboMember, crossLinksWith } from "../../src/app/game/combos/links";
import { passiveSource } from "../../src/app/game/battle/SkillDetails";

const member = (id: string) => comboMember(id, withComboPassive(id === "dinhBoLinh" ? mainCharacter("moc", "tuongSi") : companionById(id)!));

describe("trang Phối Hợp: liên kết kỹ năng → bị động", () => {
  it("mỗi liên kết có tín hiệu thật sự do chiêu phát và bị động bắt", () => {
    const team = [member("dinhBoLinh"), member("haVan"), member("maiThanh")];
    const links = comboLinks(team);
    assert.ok(links.length > 0);
    for (const l of links) {
      const emits = skillComboOpeners(l.skill);
      assert.ok(l.signals.length > 0 && l.signals.every((s) => emits.includes(s)));
      const who = passiveSource(l.passive);
      if (who === "ally") assert.notEqual(l.from, l.to);
      if (who === "self") assert.equal(l.from, l.to);
      assert.ok(team[l.from]!.skills.includes(l.skill));
      assert.ok(team[l.to]!.passives.some((p) => p.passive.id === l.passive.id));
    }
  });

  it("đếm liên kết chéo một tướng thêm vào đội khớp với danh sách đầy đủ", () => {
    const base = [member("dinhBoLinh"), member("haVan")];
    const cand = member("maiThanh");
    const n = comboLinks([...base, cand]).filter((l) => l.from !== l.to && (l.from === 2 || l.to === 2)).length;
    assert.equal(crossLinksWith(base, cand), n);
  });

  it("bị động chỉ nhận từ đồng đội không tự mở được khi đứng một mình", () => {
    const solo = comboLinks([member("dinhBoLinh")]);
    assert.ok(solo.every((l) => passiveSource(l.passive) !== "ally"));
  });
});
