import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyRaidResult,
  BOSS_HP,
  CAMPAIGN_MISSION_IDS,
  createRng,
  ELEMENTS,
  encounterFighter,
  HOME_TERRAIN,
  newProfile,
  parseCampaign,
  parseProfile,
  RAID_BOSSES,
  RAID_TIERS,
  raidBossById,
  raidDifficulty,
  raidLevel,
  raidSetup,
  raidUnlocked,
  raidUnlockMission,
  validateWeights,
  WARLORD_ENCOUNTERS,
  warlordUnlockMission,
  type CampaignMissionId,
} from "../../../src/core";

/** Hồ sơ chiến dịch đã hoàn thành M01 tới `last` theo thứ tự id (parser bỏ nhiệm vụ thiếu tiền đề). */
const upTo = (last: CampaignMissionId) =>
  parseCampaign({
    version: 2,
    completed: CAMPAIGN_MISSION_IDS.slice(
      0,
      CAMPAIGN_MISSION_IDS.indexOf(last) + 1,
    ),
  });

describe("đánh trùm", () => {
  it("chỉ 6 sứ quân bị đánh dẹp là trùm, sân nhà hợp lệ, mỗi người một mốc V2 theo design-freeze mục 5", () => {
    assert.equal(WARLORD_ENCOUNTERS.length, 12);
    assert.equal(RAID_BOSSES.length, 6);
    for (const e of ELEMENTS) validateWeights(HOME_TERRAIN[e]);
    assert.deepEqual(
      Object.fromEntries(RAID_BOSSES.map((b) => [b.id, raidUnlockMission(b.id)])),
      {
        kieuCongHan: "M15",
        kieuThuan: "M16",
        lyKhue: "M17",
        nguyenThuTiep: "M18",
        nguyenSieu: "M20",
        doCanhThac: "M21",
      },
    );
    // Id màn cũ không còn là id trùm.
    assert.equal(raidBossById("boHai"), undefined);
    assert.equal(raidBossById("doDong"), undefined);
  });

  it("đồng minh, sứ quân quy phục hay tan rã không là trùm; mốc của họ chỉ mở bán ở cửa hàng", () => {
    for (const id of ["tranLam", "phamBachHo", "ngoXuongXi", "ngoNhatKhanh", "nguyenKhoan", "luDuong"]) {
      assert.equal(raidBossById(id), undefined, id);
      assert.equal(raidUnlockMission(id), undefined, id);
      assert.ok(warlordUnlockMission(id), id);
    }
  });

  it("mở theo nhiệm vụ V2 đã hoàn thành; bậc sau cần thắng bậc trước", () => {
    const fresh = newProfile().campaign;
    for (const b of RAID_BOSSES) assert.ok(!raidUnlocked(fresh, b.id, 1), b.id);
    const m14 = upTo("M14");
    assert.ok(!raidUnlocked(m14, "kieuCongHan", 1));
    const m15 = upTo("M15");
    assert.ok(m15.completed.includes("M15"));
    assert.ok(raidUnlocked(m15, "kieuCongHan", 1));
    assert.ok(!raidUnlocked(m15, "kieuCongHan", 2));
    assert.ok(!raidUnlocked(m15, "kieuThuan", 1));
    // Sứ quân quy phục ở M11–M14 đã qua mốc nhưng không có trận.
    assert.ok(!raidUnlocked(m15, "phamBachHo", 1));
    const won = { ...m15, raids: { kieuCongHan: 1 } };
    assert.ok(raidUnlocked(won, "kieuCongHan", 2));
    assert.ok(!raidUnlocked(won, "kieuCongHan", 3));
    assert.ok(!raidUnlocked(m15, "phongChau", 1));
  });

  it("đối thủ lên cấp theo bậc, thủ lĩnh 3vs3 máu trùm, sứ quân đầy lương, AI khó hơn theo bậc", () => {
    const boss = raidBossById("doCanhThac")!;
    assert.deepEqual(
      RAID_TIERS.map((t) => raidLevel(boss, t)),
      [24, 28, 30],
    );
    const setup = raidSetup(boss, 1);
    const plain = encounterFighter(boss.foes[0]!, 24);
    assert.equal(setup.foes[0]!.maxHp, Math.round(plain.maxHp * BOSS_HP));
    assert.equal(setup.difficulty, "nightmare");
    // Tùy tướng không nhân máu trùm.
    assert.equal(setup.foes[1]!.maxHp, encounterFighter(boss.foes[1]!, 24).maxHp);
    for (const b of RAID_BOSSES) assert.equal(b.mode, "3v3", b.id);
    const first = raidBossById("kieuCongHan")!;
    assert.deepEqual(
      RAID_TIERS.map((t) => raidDifficulty(first, t)),
      ["hard", "boss", "nightmare"],
    );
    assert.equal(setup.foeFood, 100);
    assert.equal(setup.weights, HOME_TERRAIN[boss.foes[0]!.element]);
  });

  it("chỉ thưởng lần đầu thắng mỗi bậc; ghi theo id sứ quân", () => {
    const p = { ...newProfile(), campaign: upTo("M15") };
    const lose = applyRaidResult(p, "kieuCongHan", 1, false, createRng(1));
    assert.equal(lose.profile, p);
    const win = applyRaidResult(p, "kieuCongHan", 1, true, createRng(1));
    assert.equal(win.profile.gold, p.gold + 300);
    assert.equal(win.profile.bag.length, 1);
    assert.deepEqual(win.profile.campaign.raids, { kieuCongHan: 1 });
    assert.deepEqual(win.profile.campaign.completed, p.campaign.completed);
    const again = applyRaidResult(win.profile, "kieuCongHan", 1, true, createRng(1));
    assert.equal(again.result.firstClear, false);
    assert.equal(again.profile, win.profile);
    for (const id of ["boHai", "tranLam"])
      assert.equal(applyRaidResult(p, id, 1, true, createRng(1)).profile, p, id);
  });

  it("hồ sơ cũ: bậc theo id màn cũ chuyển sang id sứ quân, bậc sai bị bỏ, màn cũ không thành tiến độ V2", () => {
    const p = parseProfile({
      ...newProfile(),
      campaign: { cleared: [], food: 50 },
    });
    assert.deepEqual(p.campaign.raids, {});
    const q = parseProfile({
      ...newProfile(),
      campaign: { cleared: [], food: 50, raids: { boHai: 2, x: 9, y: "1" } },
    });
    assert.deepEqual(q.campaign.raids, { tranLam: 2 });
    const v2 = parseProfile({
      ...newProfile(),
      campaign: {
        version: 2,
        completed: ["M01"],
        legacy: {
          cleared: ["coLau", "boHai", "tamDai"],
          raids: { tamDai: 3, doDong: 1, coLau: 2 },
          bestTurns: { coLau: 20 },
        },
        raids: { tamDai: 1, lyKhue: 2, kieuThuan: 7 },
      },
    }).campaign;
    assert.deepEqual(v2.raids, { nguyenKhoan: 3, doCanhThac: 1, lyKhue: 2 });
    assert.deepEqual(v2.completed, ["M01"]);
    assert.ok(!("legacy" in v2));
  });
});
