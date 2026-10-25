import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_FOUR,
  CHAPTER_THREE,
  boardScores,
  campaignFocusChapter,
  chapterStatus,
  completeCampaignNode,
  newProfile,
  parseProfile,
  raidBossById,
  warlordUnlockMission,
  raidUnlocked,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { parseNewBattle } from "../../src/server/battles";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";

function complete(
  campaign: CampaignProgressV2,
  ids: readonly CampaignMissionId[],
): CampaignProgressV2 {
  let next = campaign;
  for (const id of ids) {
    const r = completeCampaignNode(next, id);
    assert.ok(r.ok, id);
    next = r.campaign;
  }
  return next;
}

const THROUGH_M10: readonly CampaignMissionId[] = [
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
];

describe("Ba tuyến quy phục M11–M13 trên server", () => {
  it("không tạo được trận cho M09–M13", () => {
    for (const campaignMission of ["M09", "M10", "M11", "M12", "M13"])
      assert.equal(
        parseNewBattle({
          campaignMission,
          element: "hoa",
          profession: "tuongSi",
          companions: [],
        }),
        null,
      );
  });

  it("hoàn thành bằng sự kiện, ghi thế cục một lần mỗi sứ quân, không tính trận thắng", async () => {
    const profiles = new MemoryProfileStore();
    const owner = "g_chapter3";
    const seed = newProfile();
    const campaign = complete(seed.campaign, THROUGH_M10);
    assert.ok(await profiles.put(owner, { ...seed, campaign }, 0));
    const before = (await loadProfile(profiles, owner)).profile;
    assert.deepEqual(before.campaign.factions, {
      tranLam: { status: "allied", mission: "M06" },
    });

    const early = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m12_early", nodeId: "M12", choice: "privateMeeting" },
      1,
    );
    assert.deepEqual(early, { ok: false, error: "locked" });

    const m11 = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m11_dang", nodeId: "M11", choice: "protectPeople" },
      2,
    );
    assert.ok(m11.ok);
    assert.equal(m11.outcome.historicalOutcome, "submitted");
    assert.deepEqual(m11.outcome.faction, {
      id: "phamBachHo",
      status: "submitted",
      resolutionMethod: "recordedSubmission",
      recorded: true,
    });
    assert.equal(m11.outcome.rewardGold, 150);

    const m12 = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m12_binh", nodeId: "M12", choice: "showStrength" },
      3,
    );
    assert.ok(m12.ok);
    assert.equal(m12.outcome.faction?.id, "ngoXuongXi");
    // M12 khép Chương III: vàng nhiệm vụ + thưởng chương, mở khóa Đinh Điền.
    assert.equal(m12.outcome.rewardGold, 150 + 250);
    assert.ok(Object.hasOwn(m12.profile.companions, "dinhDien"));

    const m13 = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m13_duong", nodeId: "M13", choice: "privatePledge" },
      4,
    );
    assert.ok(m13.ok);
    assert.equal(m13.outcome.faction?.id, "ngoNhatKhanh");
    assert.equal(m13.profile.campaign.regionalOutcomes.westernRoute, "settled");

    // Gửi lại (cùng hoặc khác eventId, cùng lựa chọn) không ghi thêm gì.
    const retry = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m11_retry", nodeId: "M11", choice: "protectPeople" },
      5,
    );
    assert.ok(retry.ok);
    assert.equal(retry.outcome.rewardGold, 0);
    assert.equal(retry.outcome.faction?.recorded, false);
    const otherTone = await completeCampaignEvent(
      profiles,
      owner,
      { eventId: "evt_m11_other", nodeId: "M11", choice: "retainForces" },
      6,
    );
    assert.deepEqual(otherTone, { ok: false, error: "invalidChoice" });

    const stored = (await loadProfile(profiles, owner)).profile;
    assert.deepEqual(stored.campaign.factions, {
      tranLam: { status: "allied", mission: "M06" },
      phamBachHo: { status: "submitted", mission: "M11" },
      ngoXuongXi: { status: "submitted", mission: "M12" },
      ngoNhatKhanh: { status: "submitted", mission: "M13" },
    });
    assert.equal(stored.gold, before.gold + 150 + 150 + 250 + 150);
    // Không đi qua pipeline trận: nhiệm vụ ngày/thành tựu thắng trận, XP, đá, túi đồ, lương giữ nguyên.
    assert.deepEqual(stored.quests, before.quests);
    assert.equal(stored.main.xp, before.main.xp);
    assert.equal(stored.stones, before.stones);
    assert.deepEqual(stored.bag, before.bag);
    assert.equal(stored.campaign.supply, before.campaign.supply);
    assert.deepEqual(stored.campaign.bestBattleTurns, {});
    assert.equal(stored.quests.totals.win ?? 0, 0);
    assert.ok(
      !boardScores(stored).some((b) =>
        ["mission:M11", "mission:M12", "mission:M13"].includes(b.board),
      ),
    );
    // Round-trip qua parser giữ đúng thế cục.
    assert.deepEqual(
      parseProfile(JSON.parse(JSON.stringify(stored))).campaign.factions,
      stored.campaign.factions,
    );
  });

  it("Chương III chơi được hết, Chương IV mới mở M13", () => {
    const campaign = complete(newProfile().campaign, THROUGH_M10);
    assert.deepEqual(
      chapterStatus(campaign, CHAPTER_THREE).map((m) => m.status),
      ["completed", "completed", "open", "locked"],
    );
    const after = complete(campaign, ["M11", "M12"]);
    assert.deepEqual(
      chapterStatus(after, CHAPTER_FOUR).map((m) => m.status),
      ["open", "locked", "locked", "locked"],
    );
    const m13 = complete(after, ["M13"]);
    assert.deepEqual(
      chapterStatus(m13, CHAPTER_FOUR).map((m) => m.status),
      ["completed", "open", "locked", "locked"],
    );
    // Hết nhiệm vụ mở thì màn Chiến dịch mở chương xa nhất đã có tiến độ.
    assert.equal(campaignFocusChapter(m13), CHAPTER_FOUR);
  });

  it("ba sứ quân quy phục không là trùm Đánh trùm, chỉ mở bán ở cửa hàng theo mốc V2", () => {
    const base = newProfile().campaign;
    // Hồ sơ còn màn cũ đã qua: parser bỏ màn cũ nên không mở gì.
    const legacy = parseProfile({
      ...newProfile(),
      campaign: {
        version: 2,
        legacy: { cleared: ["coLau", "boHai", "dangChau", "binhKieu", "duongLam"] },
      },
    }).campaign;
    for (const id of ["phamBachHo", "ngoXuongXi", "ngoNhatKhanh"]) {
      assert.equal(raidUnlocked(legacy, id, 1), false, id);
      // Quy phục trong cốt truyện nên không là trùm; mốc chỉ mở bán ở cửa hàng.
      assert.equal(raidBossById(id), undefined, id);
    }
    const m13 = complete(base, [...THROUGH_M10, "M11", "M12", "M13"]);
    assert.equal(warlordUnlockMission("phamBachHo"), "M11");
    assert.equal(warlordUnlockMission("ngoXuongXi"), "M12");
    assert.equal(warlordUnlockMission("ngoNhatKhanh"), "M13");
    for (const id of ["phamBachHo", "ngoXuongXi", "ngoNhatKhanh"])
      assert.equal(raidUnlocked(m13, id, 1), false, id);
  });
});
