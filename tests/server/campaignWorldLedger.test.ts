import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_FACTION_RESOLUTIONS,
  CAMPAIGN_LEDGER_EXPECTED,
  campaignAllFactionsResolved,
  campaignNodeUnlocked,
  campaignWorldLedger,
  completeCampaignNode,
  newProfile,
  parseCampaign,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import { createBattleFor, parseNewBattle } from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const ids = (n: number) =>
  Array.from(
    { length: n },
    (_, i) => `M${String(i + 1).padStart(2, "0")}` as CampaignMissionId,
  );

function complete(ids: readonly CampaignMissionId[]): CampaignProgressV2 {
  let next = newProfile().campaign;
  for (const id of ids) {
    const r = completeCampaignNode(next, id);
    assert.ok(r.ok, id);
    next = r.campaign;
  }
  return parseCampaign(next);
}

describe("Sổ thế cục 12 vùng và khóa M22", () => {
  it("bảng theo ledger: 1 liên minh, 3 quy phục, 6 đánh dẹp, 2 tan rã/còn tranh luận", () => {
    const count = (g: string) =>
      CAMPAIGN_FACTION_RESOLUTIONS.filter((r) => r.group === g).map(
        (r) => r.faction,
      );
    assert.deepEqual(count("alliance"), ["tranLam"]);
    assert.deepEqual(count("submission"), [
      "phamBachHo",
      "ngoXuongXi",
      "ngoNhatKhanh",
    ]);
    assert.equal(count("military").length, 6);
    assert.deepEqual(count("uncertain"), ["nguyenKhoan", "luDuong"]);
    assert.deepEqual(CAMPAIGN_LEDGER_EXPECTED, {
      alliance: 1,
      submission: 3,
      military: 6,
      uncertain: 2,
    });
    // Trạng thái gốc không đổi: Lữ Đường vẫn là quy phục (W10), chỉ xếp nhóm chưa chắc.
    const lu = CAMPAIGN_FACTION_RESOLUTIONS.find((r) => r.faction === "luDuong")!;
    assert.equal(lu.status, "submitted");
    assert.equal(lu.settlement, "regionalAccession");
  });

  it("đếm theo kết cục đã ghi, không theo số trận thắng", () => {
    const mid = campaignWorldLedger(complete(ids(12)).factions);
    assert.deepEqual(mid.resolved, {
      alliance: 1,
      submission: 2,
      military: 0,
      uncertain: 0,
    });
    assert.equal(mid.resolvedCount, 3);
    assert.equal(mid.allResolved, false);
    assert.deepEqual(mid.missingMissions, [
      "M13",
      "M14",
      "M15",
      "M16",
      "M17",
      "M18",
      "M19",
      "M20",
      "M21",
    ]);
    const full = campaignWorldLedger(complete(ids(21)).factions);
    assert.deepEqual(full.resolved, CAMPAIGN_LEDGER_EXPECTED);
    assert.equal(full.allResolved, true);
    // Bốn nhóm cộng lại đủ 12, nhóm quân sự chỉ có 6.
    assert.equal(
      full.rows.filter((r) => r.view.resolved && r.view.status === "defeated")
        .length,
      6,
    );
  });

  it("M22 chỉ mở khi đủ 12 sứ quân có kết cục, kể cả khi dữ liệu bị sửa tay", () => {
    const before = complete(ids(20));
    assert.equal(campaignNodeUnlocked(before, "M22"), false);
    const done = complete(ids(21));
    assert.equal(campaignAllFactionsResolved(done), true);
    assert.equal(campaignNodeUnlocked(done, "M22"), true);
    // Hồ sơ sửa tay: có M21 nhưng thiếu M19 (Lữ Đường chưa có kết cục).
    const forged: CampaignProgressV2 = {
      ...done,
      completed: done.completed.filter((id) => id !== "M19"),
    };
    assert.equal(campaignAllFactionsResolved(forged), false);
    assert.equal(campaignNodeUnlocked(forged, "M22"), false);
    const r = completeCampaignNode(forged, "M22");
    assert.deepEqual(r, { ok: false, error: "locked" });
    // Parser bỏ M21 khi thiếu nhánh trước, và không giữ M22 đang dở.
    const parsed = parseCampaign({ ...forged, inProgress: ["M22"] });
    assert.ok(!parsed.completed.includes("M21"));
    assert.deepEqual(parsed.inProgress, []);
  });

  it("server: không mở trận hay ghi M22 đang dở khi chưa đủ thế cục", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const seed = newProfile();
    assert.ok(
      await profiles.put(
        "g_ledger",
        { ...seed, campaign: { ...complete(ids(20)), inProgress: ["M22"] } },
        0,
      ),
    );
    const p = (await loadProfile(profiles, "g_ledger")).profile;
    assert.ok(!p.campaign.inProgress.includes("M22"));
    const input = parseNewBattle({
      campaignMission: "M22",
      campaignChoice: "disarmFirst",
      element: "hoa",
      profession: "tuongSi",
      companions: ["haVan", "maiThanh"],
    });
    if (input) {
      const res = await createBattleFor("g_ledger", input, {
        store,
        profiles,
        now: 1,
        seed: 2,
        newId: () => "m_1",
      });
      assert.equal(res.ok, false);
    }
  });
});
