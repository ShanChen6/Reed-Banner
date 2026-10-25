import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_CHOICE_IDS,
  CAMPAIGN_RECRUITS,
  STORY_NODES,
  WARLORD_COMPANIONS,
  applyCampaignFirstClear,
  applyProfileAction,
  campaignNodeUnlocked,
  isCombatStoryNode,
  newProfile,
  profileTeam,
  recruitMilestone,
  recruitTableErrors,
  warlordUnlockMission,
  type CampaignMissionId,
  type Profile,
} from "../../../src/core";

/** Đi qua nhiệm vụ bằng đúng chuyển trạng thái server dùng (event hoặc trận thắng). */
function clear(profile: Profile, id: CampaignMissionId): Profile {
  const node = STORY_NODES.find((n) => n.id === id)!;
  const combat = isCombatStoryNode(node);
  const r = applyCampaignFirstClear(profile, {
    nodeId: id,
    source: combat ? "battle" : "event",
    ...(combat
      ? { turns: 5, supply: 50 }
      : { choice: CAMPAIGN_CHOICE_IDS[id]![0]! }),
  });
  assert.ok(r.ok, id);
  return r.profile;
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

describe("CAMP-03.03: bảng tuyển tướng lịch sử", () => {
  it("bảng khớp story nodes và freeze 4.2, mã nguồn thuộc allowlist", () => {
    assert.deepEqual(recruitTableErrors(), []);
    assert.deepEqual(
      CAMPAIGN_RECRUITS.map((r) => [r.id, r.milestone]),
      [
        ["dinhLien", "M04"],
        ["nguyenBac", "M08"],
        ["dinhDien", "M12"],
        ["luuCo", "M16"],
        ["trinhTu", "M20"],
        ["leHoan", "M24"],
      ],
    );
    for (const r of CAMPAIGN_RECRUITS) {
      assert.equal(recruitMilestone(r.id), r.milestone);
      assert.ok(r.sourceRefs.length > 0, r.id);
      assert.ok(r.doNotClaim.length > 0, r.id);
    }
  });

  it("độ tin cậy không vượt nguồn: năm tướng ngoài Đinh Liễn và Lê Hoàn chỉ có lớp truyền thuyết", () => {
    for (const r of CAMPAIGN_RECRUITS) {
      assert.notEqual(r.historicalConfidence, "high", r.id);
      if (["nguyenBac", "dinhDien", "luuCo", "trinhTu"].includes(r.id)) {
        assert.equal(r.historicalConfidence, "low", r.id);
        assert.ok(r.basis.includes("legend"), r.id);
        assert.ok(!r.basis.includes("recorded"), r.id);
      }
    }
    const lien = CAMPAIGN_RECRUITS.find((r) => r.id === "dinhLien")!;
    assert.equal(lien.chapter, 1);
    assert.match(lien.doNotClaim, /Phong Châu/);
    assert.doesNotMatch(lien.historicalRole, /Phong Châu|bại tướng/);
  });

  it("12 sứ quân mở bán theo đúng mốc Đánh trùm của freeze mục 5", () => {
    assert.deepEqual(
      WARLORD_COMPANIONS.map((w) => [
        w.fighter.id,
        warlordUnlockMission(w.fighter.id),
      ]),
      [
        ["tranLam", "M08"],
        ["phamBachHo", "M11"],
        ["ngoXuongXi", "M12"],
        ["ngoNhatKhanh", "M13"],
        ["nguyenKhoan", "M14"],
        ["kieuCongHan", "M15"],
        ["kieuThuan", "M16"],
        ["lyKhue", "M17"],
        ["nguyenThuTiep", "M18"],
        ["luDuong", "M19"],
        ["nguyenSieu", "M20"],
        ["doCanhThac", "M21"],
      ],
    );
  });
});

describe("CAMP-03.03: tuyển tướng theo mốc và chống nhận hai lần", () => {
  it("tới M11 đội có đủ 3 người, gồm hai tướng lịch sử mở ở mốc Chương I và II", () => {
    let p = newProfile();
    for (const id of THROUGH_M10) p = clear(p, id);
    assert.ok(campaignNodeUnlocked(p.campaign, "M11"));
    assert.ok(p.companions.dinhLien && p.companions.nguyenBac);
    assert.deepEqual(p.campaign.unlockedHeroes, ["dinhLien", "nguyenBac"]);
    const team = applyProfileAction(p, {
      type: "chooseTeam",
      companions: ["dinhLien", "nguyenBac"],
    });
    assert.ok(team.ok);
    assert.deepEqual(
      profileTeam(team.profile, team.profile.team).map((f) => f.id),
      ["dinhBoLinh", "dinhLien", "nguyenBac"],
    );
  });

  it("mở lại mốc không tạo bản sao, không hạ cấp, không cộng vàng hay tướng lần hai", () => {
    let p = newProfile();
    for (const id of ["M01", "M02", "M03", "M04"] as const) p = clear(p, id);
    const lien = p.companions.dinhLien!;
    const leveled: Profile = {
      ...p,
      companions: { ...p.companions, dinhLien: { ...lien, level: 9 } },
    };
    const again = applyCampaignFirstClear(leveled, {
      nodeId: "M04",
      source: "battle",
      turns: 3,
      supply: 40,
    });
    assert.ok(again.ok);
    assert.equal(again.reward.totalGold, 0);
    assert.deepEqual(again.reward.unlockedHeroes, []);
    assert.equal(again.profile.companions.dinhLien!.level, 9);
    assert.equal(again.profile.gold, leveled.gold);
    assert.equal(
      again.profile.campaign.rewardReceipts.filter((r) => r === "hero:dinhLien")
        .length,
      1,
    );
  });

  it("đã có sẵn tướng (vd. từ bản cũ) thì mốc giữ nguyên tiến trình, chỉ ghi phiếu một lần", () => {
    let p = newProfile();
    for (const id of ["M01", "M02", "M03"] as const) p = clear(p, id);
    const owned: Profile = {
      ...p,
      companions: {
        ...p.companions,
        dinhLien: { ...newProfile().main, level: 12, skillPoints: 0 },
      },
    };
    const done = clear(owned, "M04");
    assert.equal(done.companions.dinhLien!.level, 12);
    assert.equal(done.companions.dinhLien!.skillPoints, 0);
    assert.ok(done.campaign.rewardReceipts.includes("hero:dinhLien"));
  });
});
