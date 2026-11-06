import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { ALL_PROFESSIONS, CHARACTER_SKILLS, DBL_ULTIMATES, ELEMENT_SKILLS, ROLE_SKILLS } from "../../src/core";
import { SPECIAL_SKILL_SETS } from "../../src/core/battle/special-skills";
import { PACK_1_2_3, PACK_3 } from "../../src/core/tam-tuong-ky/catalog";
import { personalSkillArtFile, skillArt } from "../../src/app/game/art/skills";

test("ô 2/6 hệ (element_<mã>) dùng lại ảnh hệ cũ của Đinh Bộ Lĩnh", () => {
  for (const def of ELEMENT_SKILLS) {
    const art = skillArt(def);
    assert.ok(art, def.id);
    assert.equal(art.badge, undefined);
    assert.ok(existsSync(`public/art/skills/${art.file}.webp`), art.file);
  }
});

test("56 tuyệt chiêu ô 4 Đinh Bộ Lĩnh: cả 8 nghề đều có ảnh riêng, không huy hiệu", () => {
  assert.equal(DBL_ULTIMATES.length, 56);
  for (const def of DBL_ULTIMATES) {
    const art = skillArt(def);
    assert.ok(art, def.id);
    assert.equal(art.file, def.id);
    assert.equal(art.badge, undefined);
    assert.ok(existsSync(`public/art/skills/${art.file}.webp`), art.file);
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

test("mọi chiêu ô 4 riêng của tướng có ảnh riêng, tên file trùng mã kỹ năng", () => {
  assert.ok(CHARACTER_SKILLS.length > 0);
  for (const def of CHARACTER_SKILLS) {
    assert.deepEqual(skillArt(def), { file: def.id }, def.id);
    assert.ok(existsSync(`public/art/skills/${def.id}.webp`), def.id);
  }
});

test("Đinh Ngọc và Trần Vũ Phong: cả 6 chiêu có ảnh riêng", () => {
  for (const def of [...SPECIAL_SKILL_SETS.dinhNgoc!, ...SPECIAL_SKILL_SETS.vuPhong!]) {
    assert.deepEqual(skillArt(def), { file: def.id });
    assert.ok(existsSync(`public/art/skills/${def.id}.webp`), def.id);
  }
});

test("Tầm Tướng Ký: 56 yếu tố tuyệt chiêu Gói 3 dùng ảnh chiêu ô 4 của chính tướng", () => {
  const nodes = PACK_3.nodes.filter((n) => n.id.startsWith("know.skill."));
  assert.equal(nodes.length, 56);
  for (const n of nodes) {
    const file = personalSkillArtFile(n.id.slice("know.skill.".length));
    assert.ok(file, n.id);
    assert.ok(existsSync(`public/art/skills/${file}.webp`), n.id);
  }
});

test("Tầm Tướng Ký: đủ tranh tri thức nghề cho 8 nghề ở public/art/tam-tuong-ky/tri-thuc-nghe/", () => {
  for (const profession of ALL_PROFESSIONS) {
    assert.ok(existsSync(`public/art/tam-tuong-ky/tri-thuc-nghe/${profession}.webp`), profession);
  }
});

test("Tầm Tướng Ký: mọi yếu tố (trừ tướng và nguyên tố) có icon, không còn ô chữ cái", () => {
  const missing = PACK_1_2_3.nodes.filter((n) => {
    if (n.kind === "character" || n.element) return false;
    if (existsSync(`public/art/tam-tuong-ky/yeu-to/${n.id}.webp`)) return false;
    if (n.id.startsWith("know.skill.")) return personalSkillArtFile(n.id.slice("know.skill.".length)) === undefined;
    const profession = n.professionHint ?? (n.role?.hybrid ? undefined : n.role?.profession);
    return !(profession && existsSync(`public/art/tam-tuong-ky/tri-thuc-nghe/${profession}.webp`));
  });
  assert.deepEqual(missing.map((n) => n.id), []);
});
