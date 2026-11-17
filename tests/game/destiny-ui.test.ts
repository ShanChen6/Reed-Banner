import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAIN_ID, createDestinyRun, newProfile, type DestinyRewardOffer } from "../../src/core";
import {
  NO_ROSTER_FILTER,
  aliveIds,
  defaultDestinyBuild,
  filterRosterIds,
  legalLeaderBuilds,
  lineupLegal,
  rewardCandidates,
  rewardTargetLimit,
  rosterFilterActive,
} from "../../src/app/game/destiny/destiny-ui";

const now = Date.UTC(2026, 9, 18, 17);

function run() {
  const made = createDestinyRun(newProfile(), now, [MAIN_ID, "haVan", "maiThanh", "leThach"], [{}]);
  assert.ok(made.ok);
  if (!made.ok) throw new Error("fixture Destiny không tạo được");
  return made.run;
}

describe("Destiny UI helpers", () => {
  it("chỉ cho đúng 3 active còn sống và build thủ lĩnh hợp luật", () => {
    const current = run();
    const active = [MAIN_ID, "haVan", "maiThanh"];
    const builds = legalLeaderBuilds(current, {}, active);
    assert.ok(builds.length > 0);
    assert.equal(lineupLegal(current, {}, active, defaultDestinyBuild(current, {}, active)), true);
    assert.equal(lineupLegal(current, {}, [MAIN_ID, "haVan"], builds[0]!), false);

    const downed = { ...current, fighters: { ...current.fighters, haVan: { ...current.fighters!.haVan!, hp: 0, downed: true } } };
    assert.ok(!aliveIds(downed).includes("haVan"));
    assert.equal(lineupLegal(downed, {}, active, builds[0]!), false);
  });

  it("lọc đúng mục tiêu sống/gục và giới hạn từng recovery reward", () => {
    const base = run();
    const current = {
      ...base,
      fighters: {
        ...base.fighters,
        haVan: { ...base.fighters!.haVan!, hp: base.fighters!.haVan!.hp - 10 },
        maiThanh: { ...base.fighters!.maiThanh!, hp: 0, downed: true },
      },
    };
    const heal: DestinyRewardOffer = { kind: "targeted_heal" };
    const medic: DestinyRewardOffer = { kind: "field_medic" };
    const rescue: DestinyRewardOffer = { kind: "rescue" };
    assert.deepEqual(rewardCandidates(current, heal), ["haVan"]);
    assert.deepEqual(rewardCandidates(current, rescue), ["maiThanh"]);
    assert.deepEqual(rewardTargetLimit(heal), { min: 1, max: 1, downed: false });
    assert.deepEqual(rewardTargetLimit(medic), { min: 1, max: 3, downed: false });
    assert.deepEqual(rewardTargetLimit(rescue), { min: 1, max: 1, downed: true });
    assert.deepEqual(rewardCandidates(current, { kind: "boon", boonId: "atk" }), []);
  });
});

describe("Destiny bộ lọc khóa đội hình", () => {
  const info = (id: string) => ({
    a: { name: "Đoàn Cự", element: "kim", profession: "xaThu" },
    b: { name: "Bạch Sương", element: "phong", profession: "ySu" },
    c: { name: "Trần Ngọc", element: "kim", profession: "ySu" },
  } as const)[id as "a" | "b" | "c"];
  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
  const ids = ["a", "b", "c"];

  it("không lọc thì giữ nguyên danh sách và thứ tự", () => {
    assert.deepEqual(filterRosterIds(ids, [], NO_ROSTER_FILTER, info, fold), ids);
    assert.equal(rosterFilterActive(NO_ROSTER_FILTER), false);
    assert.equal(rosterFilterActive({ ...NO_ROSTER_FILTER, query: "  " }), false, "chỉ có khoảng trắng là chưa lọc");
  });

  it("tìm tên không dấu, lọc hệ, nghề và chỉ đã chọn, ghép được với nhau", () => {
    assert.deepEqual(filterRosterIds(ids, [], { ...NO_ROSTER_FILTER, query: "doan" }, info, fold), ["a"]);
    assert.deepEqual(filterRosterIds(ids, [], { ...NO_ROSTER_FILTER, element: "kim" }, info, fold), ["a", "c"]);
    assert.deepEqual(filterRosterIds(ids, [], { ...NO_ROSTER_FILTER, element: "kim", profession: "ySu" }, info, fold), ["c"]);
    assert.deepEqual(filterRosterIds(ids, ["b", "c"], { ...NO_ROSTER_FILTER, pickedOnly: true }, info, fold), ["b", "c"]);
    assert.deepEqual(filterRosterIds(["a", "x"], [], NO_ROSTER_FILTER, info, fold), ["a"], "bỏ id không có dữ liệu");
  });
});
