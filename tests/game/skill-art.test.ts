import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { DBL_ULTIMATES, ELEMENT_SKILLS } from "../../src/core";
import { skillArt } from "../../src/app/game/art/skills";

test("ô 2/6 hệ (element_<mã>) dùng lại ảnh hệ cũ của Đinh Bộ Lĩnh", () => {
  for (const def of ELEMENT_SKILLS) {
    const art = skillArt(def);
    assert.ok(art, def.id);
    assert.equal(art.badge, undefined);
    assert.ok(existsSync(`public/art/skills/${art.file}.webp`), art.file);
  }
});

test("56 tuyệt chiêu ô 4 Đinh Bộ Lĩnh có ảnh theo hệ và huy hiệu nghề", () => {
  assert.equal(DBL_ULTIMATES.length, 56);
  for (const def of DBL_ULTIMATES) {
    const art = skillArt(def);
    assert.ok(art, def.id);
    assert.equal(art.badge, def.profession);
    assert.ok(existsSync(`public/art/skills/${art.file}.webp`), art.file);
    assert.ok(existsSync(`public/art/professions/${art.badge}.webp`), art.badge);
  }
});

test("kỹ năng chưa có ảnh vẫn vẽ SVG", () => {
  assert.equal(skillArt({ id: "role_linhDuoc" }), undefined);
  assert.equal(skillArt({ id: "element_khongCo" }), undefined);
});

test("chiêu nghề Tướng sĩ, Pháp sư có ảnh vẽ tay", () => {
  for (const id of ["role_tramKich", "role_phaTran", "role_doatMenh", "role_phepLan", "role_nguHanhAn", "role_thienDiaCong"]) {
    const art = skillArt({ id });
    assert.ok(art, id);
    assert.ok(existsSync(`public/art/skills/${art.file}.webp`), id);
  }
});
