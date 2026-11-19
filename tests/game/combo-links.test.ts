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

describe("trang Hợp Kích: chuỗi phản ứng", () => {
  it("chuỗi theo luật bộ máy: tối đa 4 bước, mỗi bước bắt tín hiệu bước trước phát, Cơ hội chỉ ở bước đầu", async () => {
    const { comboChains, bestChains } = await import("../../src/app/game/combos/links");
    const team = [member("dinhBoLinh"), member("haVan"), member("maiThanh")];
    const chains = comboChains(team);
    assert.ok(chains.length > 0);
    for (const c of chains) {
      assert.ok(c.steps.length >= 2 && c.steps.length <= 4);
      c.steps.forEach((s, i) => {
        if (s.passive.kind === "combo") assert.equal(i, 0);
        if (i === 0) assert.ok(skillComboOpeners(c.skill).includes(s.signal));
      });
      assert.equal(new Set(c.steps.map((s) => `${s.fighter}:${s.passive.id}`)).size, c.steps.length);
    }
    const best = bestChains(team);
    assert.equal(new Set(best.map((c) => `${c.from}:${c.skill.id}`)).size, best.length);
    assert.ok(best.every((c, i) => i === 0 || c.steps.length <= best[i - 1]!.steps.length));
  });

  it("giảm Thủ không mạnh hơn mức đang có bị bỏ qua như trong trận: hai Kim phá trong đội chỉ một cái vào chuỗi", async () => {
    const { comboChains } = await import("../../src/app/game/combos/links");
    const kimDbl = comboMember("dinhBoLinh", withComboPassive(mainCharacter("kim", "tuongSi")));
    const team = [kimDbl, member("tranCuong"), member("maiThanh")];
    const chains = comboChains(team);
    assert.ok(chains.length > 0);
    for (const c of chains) assert.ok(c.steps.filter((st) => st.passive.id === "kim1").length <= 1);
    // Phá trận tự giảm Thủ 30% nên Kim phá (12%) không theo sau chiêu này.
    for (const c of chains.filter((x) => x.skill.id === "role_phaTran")) assert.ok(c.steps.every((st) => st.passive.id !== "kim1"));
  });
});
