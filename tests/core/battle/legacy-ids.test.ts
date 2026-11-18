import assert from "node:assert/strict";
import { test } from "node:test";
import { CHASE_PASSIVES, getSkill, LEGACY_IDS, migrateLegacyIds, NEW_PROGRESS, newProfile, parseProfile } from "../../../src/core";
import { companionById } from "../../../src/core/roster/roster";

/** Mã nhân vật, node và công thức Tầm Tướng Ký của Minh Nguyệt: không phải kỹ năng hay bị động. */
const CHARACTER_IDS = new Set(["minhNguyet", "hero.minhNguyet", "r.minhNguyet"]);

test("mã cũ: mỗi mã mới là kỹ năng, bị động hoặc nhân vật có thật, không mã cũ nào còn trong core", () => {
  const values = Object.values(LEGACY_IDS);
  assert.equal(values.length, 40);
  assert.equal(new Set(values).size, 40);
  for (const [old, id] of Object.entries(LEGACY_IDS)) {
    if (CHARACTER_IDS.has(id)) continue;
    assert.ok(getSkill(id) || id in CHASE_PASSIVES, `${old} → ${id}`);
    assert.equal(getSkill(old), undefined, old);
    assert.equal(old in CHASE_PASSIVES, false, old);
  }
  assert.ok(companionById("minhNguyet"));
  for (const old of Object.keys(LEGACY_IDS).filter((k) => CHARACTER_IDS.has(LEGACY_IDS[k]!))) assert.equal(companionById(old.replace(/^(hero|r)\./, "")), undefined, old);
});

test("hồ sơ cũ có Minh Nguyệt theo mã cũ: giữ tướng, đội, cấp kỹ năng, nhiệm vụ phụ và sổ Tầm Tướng Ký", () => {
  const p = newProfile();
  const old = JSON.parse(
    JSON.stringify({
      ...p,
      companions: { ...p.companions, minhNguyet: { ...NEW_PROGRESS, level: 7, skillLevels: { o1: 2 } } },
      team: ["haVan", "minhNguyet"],
      loadouts: { minhNguyet: { slots: {}, weapons: {} } },
      tamTuongKy: { discovery: { discoveredNodeIds: ["elt.kim", "hero.minhNguyet"], discoveredRecipeIds: ["r.minhNguyet"] }, triedPairs: ["hero.minhNguyet>elt.kim"] },
    }).replace(/minhNguyet/g, "dinhNgoc"),
  );
  const migrated = migrateLegacyIds(old) as typeof old;
  assert.ok(!JSON.stringify(migrated).includes("dinhNgoc"));
  const profile = parseProfile(migrated);
  assert.equal(profile.companions.minhNguyet?.level, 7);
  assert.equal(profile.companions.minhNguyet?.skillLevels.o1, 2);
  assert.deepEqual(profile.team, ["haVan", "minhNguyet"]);
  assert.deepEqual(migrated.tamTuongKy.triedPairs, ["hero.minhNguyet>elt.kim"]);
  assert.deepEqual(migrated.tamTuongKy.discovery.discoveredRecipeIds, ["r.minhNguyet"]);
  // Kỹ năng, bị động riêng theo mã cũ trong trận đang chơi.
  assert.deepEqual(migrateLegacyIds({ skills: ["dn_vanTuongQuyNhat"], chasePassives: ["dn_loiYDoatCo"] }), { skills: ["mn_vanTuongQuyNhat"], chasePassives: ["mn_loiYDoatCo"] });
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
