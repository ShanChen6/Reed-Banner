import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { companionById, mainCharacter, withComboPassive } from "../../src/core";
import { comboChains, comboMember } from "../../src/app/game/combos/links";
import { LANDING_CHAIN } from "../../src/app/home/data";

describe("trang giới thiệu", () => {
  it("chuỗi Hợp Kích ví dụ là chuỗi thật của đội mặc định theo luật bộ máy", () => {
    const team = [
      comboMember("dinhBoLinh", withComboPassive(mainCharacter("moc", "tuongSi"))),
      comboMember("haVan", withComboPassive(companionById("haVan")!)),
      comboMember("maiThanh", withComboPassive(companionById("maiThanh")!)),
    ];
    const [opener, ...steps] = LANDING_CHAIN;
    const found = comboChains(team).some(
      (c) =>
        team[c.from]!.id === opener.who &&
        c.skill.id === opener.skill &&
        c.steps.length === steps.length &&
        c.steps.every((s, i) => team[s.fighter]!.id === steps[i]!.who && s.passive.id === steps[i]!.passive),
    );
    assert.ok(found);
  });
});

describe("số viết bằng chữ", () => {
  it("đọc đúng các số trang giới thiệu dùng", async () => {
    const { numberWords, NumberWords } = await import("../../src/app/home/words");
    assert.deepEqual([7, 8, 10, 12, 14, 15, 21, 24, 75, 100, 105].map(numberWords), [
      "bảy", "tám", "mười", "mười hai", "mười bốn", "mười lăm", "hai mươi mốt", "hai mươi tư", "bảy mươi lăm", "một trăm", "một trăm lẻ năm",
    ]);
    assert.equal(NumberWords(8), "Tám");
  });
});
