import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  achievementById,
  achievementProgress,
  CAMPAIGN_MISSION_IDS,
  newProfile,
  NEW_QUESTS,
  parseCampaign,
  raidBossById,
  raidMatchups,
  raidRecommended,
  raidTeamIds,
  recordMatch,
  runBattle,
} from "../../../src/core";

// CAMP-08.04: các chế độ dùng chung với chiến dịch phân biệt hoàn thành cốt truyện và trận thắng.
describe("chế độ dùng chung với Campaign V2", () => {
  it("thành tựu Chương I chỉ đếm nhiệm vụ của Chương I", () => {
    const def = achievementById("a.chapter1")!;
    const upTo = (n: number) => ({
      ...newProfile(),
      campaign: parseCampaign({
        version: 2,
        completed: CAMPAIGN_MISSION_IDS.slice(0, n),
      }),
    });
    assert.equal(def.target, 4);
    assert.deepEqual(achievementProgress(upTo(3), def).value, 3);
    assert.equal(achievementProgress(upTo(4), def).done, true);
    // Thêm nhiệm vụ chương sau không đẩy số đếm Chương I vượt 4.
    assert.equal(def.value(upTo(12)), 4);
  });

  it("nhiệm vụ tuần chỉ đếm trận thắng của chiến dịch hoặc đánh trùm, không đếm trận thua hay chế độ khác", () => {
    const now = Date.UTC(2026, 9, 25, 5);
    const q = [
      { mode: "campaign", won: true },
      { mode: "campaign", won: false },
      { mode: "raid", won: true },
      { mode: "tower", won: true },
      { mode: "normal", won: true },
    ].reduce(
      (acc, m) =>
        recordMatch(
          acc,
          { mode: m.mode as never, won: m.won, coins: 0, waves: 0 },
          now,
        ),
      NEW_QUESTS,
    );
    assert.equal(q.weekStats.campaign, 2);
  });

  it("mô phỏng Đánh trùm dựng đúng sân nhà và đội kèm theo mốc mở", () => {
    const boss = raidBossById("kieuCongHan")!;
    assert.deepEqual(raidTeamIds(boss, "default"), ["haVan", "maiThanh"]);
    // Mốc M15: tướng lịch sử đã mở trước đó (Nguyễn Bặc M08, Đinh Điền M12).
    assert.deepEqual(raidTeamIds(boss, "heroes"), ["nguyenBac", "dinhDien"]);
    const { matchups, difficulty } = raidMatchups(boss, 1, 1, 3);
    assert.equal(difficulty, "hard");
    assert.equal(matchups[0]!.sides[1].food, 100);
    assert.equal(raidRecommended(boss, 1), 18);
    assert.equal(matchups[0]!.sides[0].fighters.length, 3);
    assert.ok(runBattle(matchups[0]!, { difficulty: ["normal", difficulty] }).turns > 0);
  });
});
