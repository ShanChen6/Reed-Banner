import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_COMPANIONS, applyProfileAction, MAIN_ID, newProfile, receiveDrop, type Profile } from "../../src/core";
import { candidatesFor } from "../../src/app/game/profile/GearPicker";
import {
  fold,
  isFiltered,
  NO_FILTER,
  rosterOf,
  sortRoster,
  visibleRoster,
  type RosterEntry,
} from "../../src/app/game/profile/roster";

const withAll = (): Profile => ({
  ...newProfile(),
  companions: Object.fromEntries(ALL_COMPANIONS.map((c, i) => [c.id, { xp: 0, level: 1 + (i % 5), skillPoints: 0, skillLevels: {}, branches: [] }])),
});

describe("Doanh Trại: danh sách tướng sĩ", () => {
  it("bỏ dấu, không phân biệt hoa thường", () => {
    assert.equal(fold("  Đinh  Bộ LĨNH "), "dinh bo linh");
    assert.equal(fold("Lê Hoàn"), "le hoan");
  });

  it("chủ tướng luôn có và đứng đầu, đội ra trận đánh dấu vị trí", () => {
    const r = rosterOf(newProfile());
    assert.equal(r[0]!.id, MAIN_ID);
    assert.equal(r[0]!.team, 0);
    const team = newProfile().team;
    assert.deepEqual(
      r.filter((e) => e.team !== null && e.team > 0).map((e) => e.id).sort(),
      [...team].sort(),
    );
  });

  it("tìm không dấu kết hợp lọc hệ, đội hình; không có kết quả", () => {
    const r = rosterOf(withAll());
    const hv = visibleRoster(r, { ...NO_FILTER, query: "ha van" }, "name");
    assert.ok(hv.some((e) => e.name === "Hà Vân"));
    const hoaInTeam = visibleRoster(r, { ...NO_FILTER, elements: ["hoa"], team: "in" }, "team");
    assert.ok(hoaInTeam.every((e) => e.element === "hoa" && e.team !== null));
    assert.equal(visibleRoster(r, { ...NO_FILTER, query: "khong co ai" }, "team").length, 0);
    assert.equal(isFiltered(NO_FILTER), false);
    assert.equal(isFiltered({ ...NO_FILTER, query: "   " }), false);
  });

  it("sắp xếp ổn định khi nhiều người cùng cấp", () => {
    const same = (key: string, name: string): RosterEntry => ({ key, id: key, name, element: "moc", profession: "tuongSi", level: 5, team: null });
    const list = [same("b", "Bình"), same("a2", "An"), same("a1", "An")];
    assert.deepEqual(sortRoster(list, "levelDesc").map((e) => e.key), ["a1", "a2", "b"]);
    assert.deepEqual(sortRoster([...list].reverse(), "levelDesc").map((e) => e.key), ["a1", "a2", "b"]);
  });
});

describe("Doanh Trại: bảng chọn đồ", () => {
  it("chỉ đưa vũ khí đúng nghề, món đang ở người khác vẫn hiện để chuyển", () => {
    let p = newProfile();
    p = receiveDrop(p, { id: "", slot: "vuKhi", element: "moc", tier: 2, set: "coLau", profession: "phapSu" }).profile;
    p = receiveDrop(p, { id: "", slot: "vuKhi", element: "moc", tier: 3, set: "coLau", profession: "tuongSi" }).profile;
    p = receiveDrop(p, { id: "", slot: "gioiChi", element: "moc", tier: 1, set: "coLau" }).profile;
    const r = applyProfileAction(p, { type: "equip", character: MAIN_ID, item: "g3" });
    assert.ok(r.ok);
    // Hà Vân là Pháp sư.
    const weapons = candidatesFor(r.profile, "haVan", "vuKhi");
    assert.deepEqual(weapons.usable.map((it) => it.id), ["g1"]);
    assert.equal(weapons.otherProfession, 1);
    assert.deepEqual(candidatesFor(r.profile, "haVan", "gioiChi").usable.map((it) => it.id), ["g3"]);
  });
});
