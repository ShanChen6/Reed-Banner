import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { CHARACTER_SKILLS, DBL_ULTIMATES, ELEMENT_SKILLS, ROLE_SKILLS } from "../../src/core";
import { REUSED_SKILL_ART, skillArt } from "../../src/app/game/art/skills";

test("ô 2/6 hệ (element_<mã>) dùng lại ảnh hệ cũ của Đinh Bộ Lĩnh", () => {
  for (const def of ELEMENT_SKILLS) {
    const art = skillArt(def);
    assert.ok(art, def.id);
    assert.equal(art.badge, undefined);
    assert.ok(existsSync(`public/art/skills/${art.file}.webp`), art.file);
  }
});

test("56 tuyệt chiêu ô 4 Đinh Bộ Lĩnh: Tướng sĩ, Pháp sư, Binh lính, Y sư có ảnh riêng, nghề khác ảnh hệ + huy hiệu nghề", () => {
  assert.equal(DBL_ULTIMATES.length, 56);
  for (const def of DBL_ULTIMATES) {
    const art = skillArt(def);
    assert.ok(art, def.id);
    assert.ok(existsSync(`public/art/skills/${art.file}.webp`), art.file);
    if (["tuongSi", "phapSu", "binhLinh", "ySu"].includes(def.profession ?? "")) {
      assert.equal(art.file, def.id);
      assert.equal(art.badge, undefined);
    } else {
      assert.equal(art.badge, def.profession);
      assert.ok(existsSync(`public/art/professions/${art.badge}.webp`), art.badge);
    }
  }
});

test("kỹ năng chưa có ảnh vẫn vẽ SVG", () => {
  assert.equal(skillArt({ id: "role_khongCo" }), undefined);
  assert.equal(skillArt({ id: "element_khongCo" }), undefined);
});

test("mọi chiêu nghề của 8 nghề có ảnh vẽ tay", () => {
  for (const def of ROLE_SKILLS) {
    const art = skillArt(def);
    assert.ok(art, def.id);
    assert.ok(existsSync(`public/art/skills/${art.file}.webp`), def.id);
  }
});

test("28 chiêu ô 4 tướng dùng lại ảnh hệ cũ: đúng mã, có file, mỗi ảnh một lần", () => {
  const ids = new Set(CHARACTER_SKILLS.map((d) => d.id));
  const files = Object.values(REUSED_SKILL_ART);
  assert.equal(files.length, 28);
  assert.equal(new Set(files).size, files.length);
  for (const [id, file] of Object.entries(REUSED_SKILL_ART)) {
    assert.ok(ids.has(id), id);
    assert.ok(existsSync(`public/art/skills/${file}.webp`), file);
    assert.deepEqual(skillArt({ id }), { file });
  }
});
