import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_FIVE,
  CHAPTER_FOUR,
  DRY_GROUND_WEIGHTS,
  SCARCE_SUPPLY_WEIGHTS,
  campaignFinaleGate,
  campaignNodeUnlocked,
  campaignRouteSummary,
  chapterCompleted,
  chapterStatus,
  completeCampaignNode,
  missionMatchups,
  missionTeamIds,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";

const THROUGH_M12: readonly CampaignMissionId[] = [
  "M01",
  "M02",
  "M03",
  "M04",
  "M05",
  "M06",
  "M07",
  "M08",
  "M09",
  "M10",
  "M11",
  "M12",
];
const WEST: readonly CampaignMissionId[] = ["M13", "M14", "M15", "M16"];
const EAST: readonly CampaignMissionId[] = ["M17", "M18", "M19", "M20"];

/** Hồ sơ đã qua parser server, để thế cục được dựng như khi tải thật. */
async function stored(
  ids: readonly CampaignMissionId[],
): Promise<CampaignProgressV2> {
  const profiles = new MemoryProfileStore();
  const seed = newProfile();
  let campaign = seed.campaign;
  for (const id of ids) {
    const r = completeCampaignNode(campaign, id);
    assert.ok(r.ok, id);
    campaign = r.campaign;
  }
  assert.ok(await profiles.put("g_routes", { ...seed, campaign }, 0));
  return (await loadProfile(profiles, "g_routes")).profile.campaign;
}

describe("Hai tuyến IV/V: tổng kết vùng và cửa vào Đỗ Động", () => {
  it("tuyến tây tuyến tính đúng freeze: mỗi vùng chỉ mở khi vùng trước xong", async () => {
    let ids = [...THROUGH_M12];
    for (const id of WEST) {
      const c = await stored(ids);
      for (const later of WEST.slice(WEST.indexOf(id) + 1))
        assert.equal(campaignNodeUnlocked(c, later), false, `${id}→${later}`);
      assert.equal(campaignNodeUnlocked(c, id), true, id);
      ids = [...ids, id];
    }
  });

  it("xong cả tuyến tây: tổng kết đủ 4 vùng, Chương IV hoàn thành, Đỗ Động vẫn khóa và liệt kê vùng phía đông còn thiếu", async () => {
    const c = await stored([...THROUGH_M12, ...WEST, "M17"]);
    const west = campaignRouteSummary(c, "west");
    assert.equal(west.complete, true);
    assert.ok(chapterCompleted(c, 4));
    assert.deepEqual(
      west.regions.map((r) => [
        r.mission,
        r.faction?.resolved ? r.faction.resolutionMethod : null,
        r.battle,
      ]),
      [
        ["M13", "politicalAccord", false],
        ["M14", "dispersal", false],
        ["M15", "campaign", true],
        ["M16", "campaign", true],
      ],
    );
    assert.deepEqual(
      west.regions.map((r) => r.place),
      ["Đường Lâm", "Tam Đái", "Phong Châu", "Hồi Hồ"],
    );
    const east = campaignRouteSummary(c, "east");
    assert.equal(east.complete, false);
    assert.deepEqual(
      east.regions.map((r) => r.state),
      ["completed", "open", "locked", "locked"],
    );
    assert.deepEqual(campaignFinaleGate(c), {
      ready: false,
      missing: ["M18", "M19", "M20"],
    });
    assert.equal(chapterStatus(c, CHAPTER_FIVE)[1]!.status, "open");
  });

  it("chỉ khi xong cả hai tuyến thì Đỗ Động mới mở", async () => {
    const c = await stored([...THROUGH_M12, ...WEST, ...EAST]);
    assert.deepEqual(campaignFinaleGate(c), { ready: true, missing: [] });
    assert.ok(chapterCompleted(c, 4) && chapterCompleted(c, 5));
    const westOnly = await stored([...THROUGH_M12, ...EAST, "M13"]);
    assert.equal(campaignFinaleGate(westOnly).ready, false);
    assert.deepEqual(campaignFinaleGate(westOnly).missing, [
      "M14",
      "M15",
      "M16",
    ]);
    assert.ok(
      chapterStatus(westOnly, CHAPTER_FOUR).some((m) => m.status === "open"),
    );
  });

  it("sim nhiệm vụ dùng đúng tham số server: địa hình, lương đối thủ, độ khó, đội có tướng lịch sử", () => {
    const m15 = missionMatchups("M15", 2, 5);
    assert.equal(m15.difficulty, "hard");
    assert.equal(m15.matchups[0]!.weights, DRY_GROUND_WEIGHTS);
    const m18 = missionMatchups("M18", 2, 5);
    assert.equal(m18.matchups[0]!.weights, SCARCE_SUPPLY_WEIGHTS);
    assert.equal(m18.matchups[0]!.sides[1].food, 100);
    assert.deepEqual(missionTeamIds("M15", "heroes"), [
      "nguyenBac",
      "dinhDien",
    ]);
    assert.deepEqual(missionTeamIds("M07", "heroes"), ["dinhLien", "haVan"]);
  });
});
