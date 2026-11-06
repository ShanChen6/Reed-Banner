import assert from "node:assert/strict";
import { test } from "node:test";
import { CHASE_PASSIVES, getSkill, LEGACY_IDS, migrateLegacyIds } from "../../../src/core";
import { companionById } from "../../../src/core/roster/roster";

test("mã cũ rb0xx_…: mỗi mã mới là kỹ năng hoặc bị động có thật, không mã cũ nào còn trong core", () => {
  const values = Object.values(LEGACY_IDS);
  assert.equal(values.length, 28);
  assert.equal(new Set(values).size, 28);
  for (const [old, id] of Object.entries(LEGACY_IDS)) {
    assert.ok(getSkill(id) || id in CHASE_PASSIVES, `${old} → ${id}`);
    assert.equal(getSkill(old), undefined, old);
    assert.equal(old in CHASE_PASSIVES, false, old);
  }
});

test("migrateLegacyIds đổi cả giá trị lẫn khóa, giữ nguyên chuỗi chỉ chứa mã cũ ở giữa", () => {
  const raw = {
    skills: ["role_satThu_thuaHu", "rb070_ultimate"],
    chasePassives: ["assassinPrepared", "moc1", "rb070_passive"],
    skillLevels: { rb070_ultimate: 3 },
    note: "x rb070_ultimate y",
  };
  assert.deepEqual(migrateLegacyIds(raw), {
    skills: ["role_satThu_thuaHu", "docAnhTiemCham"],
    chasePassives: ["assassinPrepared", "moc1", "lamAnhTiepNhip"],
    skillLevels: { docAnhTiemCham: 3 },
    note: "x rb070_ultimate y",
  });
});

test("migrateLegacyIds trả lại chính đối tượng khi không có mã cũ", () => {
  const docAnh = companionById("docAnh")!;
  assert.equal(migrateLegacyIds(docAnh), docAnh);
  assert.equal(migrateLegacyIds(null), null);
});
