import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_FOUR,
  DRY_GROUND_WEIGHTS,
  STANDARD_WEIGHTS,
  WETLAND_WEIGHTS,
  campaignCopyErrors,
  campaignEncounter,
  campaignNodeUnlocked,
  campaignTerrain,
  chapterCompleted,
  chapterStatus,
  completeCampaignNode,
  createRng,
  findMatches,
  generateBoard,
  hasValidMove,
  missionCopy,
  newProfile,
  refill,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import {
  createBattleFor,
  getBattle,
  parseNewBattle,
} from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 12_000_000;
const OWNER = "g_west";
const THROUGH_M14: readonly CampaignMissionId[] = [
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
  "M13",
  "M14",
];
const body = (id: "M15" | "M16", choice: string) => ({
  campaignMission: id,
  campaignChoice: choice,
  element: "tho",
  profession: "tuongSi",
  companions: ["haVan", "maiThanh"],
});

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

async function setup(ids: readonly CampaignMissionId[] = THROUGH_M14) {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  const seed = newProfile();
  const campaign = complete(seed.campaign, ids);
  assert.ok(
    await profiles.put(
      OWNER,
      { ...seed, campaign: { ...campaign, supply: 70 } },
      0,
    ),
  );
  let n = 0;
  const deps = (now: number) => ({
    store,
    profiles,
    now,
    seed: 23,
    newId: () => `m_${++n}`,
  });
  return { store, profiles, deps };
}

/** Kết thúc trận bằng cách đặt người thắng; HP phe thua về 0 cho khớp mục tiêu. */
async function finish(
  store: MemoryMatchStore,
  id: string,
  winner: 0 | 1,
  turnNumber = 13,
) {
  const rec = (await store.get(id))!;
  const sides = rec.match.battle.sides.map((side, i) =>
    i === winner
      ? side
      : { ...side, fighters: side.fighters.map((f) => ({ ...f, hp: 0 })) },
  ) as unknown as typeof rec.match.battle.sides;
  const battle = {
    ...rec.match.battle,
    sides,
    winner,
    turn: { ...rec.match.battle.turn, number: turnNumber },
  };
  assert.ok(
    await store.save(
      { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
      rec.match.seq,
    ),
  );
}

describe("Chương IV: M15 Phong Châu (đất khô) và M16 Hồi Hồ (đầm lầy)", () => {
  it("nội dung hợp lệ: encounter, copy, địa hình khác nhau rõ", () => {
    assert.deepEqual(campaignCopyErrors(), []);
    for (const id of ["M15", "M16"] as const) {
      assert.ok(missionCopy(id), id);
      assert.ok(CHAPTER_FOUR.playable.includes(id), id);
      assert.equal(campaignEncounter(id)!.foes.length, 3);
    }
    assert.equal(campaignTerrain("M15")!.weights, DRY_GROUND_WEIGHTS);
    assert.equal(campaignTerrain("M16")!.weights, WETLAND_WEIGHTS);
    assert.ok(DRY_GROUND_WEIGHTS.amDuong < STANDARD_WEIGHTS.amDuong);
    assert.ok(WETLAND_WEIGHTS.amDuong > STANDARD_WEIGHTS.amDuong);
    assert.ok(DRY_GROUND_WEIGHTS.banhChung >= 2 * WETLAND_WEIGHTS.banhChung);
    assert.ok(DRY_GROUND_WEIGHTS.kiem > WETLAND_WEIGHTS.kiem);
  });

  it("bàn đất khô và đầm lầy luôn sinh được bàn hợp lệ, lấp ô không làm kẹt bàn", () => {
    for (const weights of [DRY_GROUND_WEIGHTS, WETLAND_WEIGHTS]) {
      for (let seed = 1; seed <= 200; seed++) {
        const rng = createRng(seed);
        const board = generateBoard(rng, weights);
        assert.equal(findMatches(board).length, 0);
        assert.ok(hasValidMove(board));
        // Xóa một hàng rồi lấp lại theo tỉ lệ địa hình: ô mới luôn là loại hợp lệ.
        const cleared = {
          ...board,
          cells: board.cells.map((c, i) => (i < board.cols ? null : c)),
        };
        const { board: filled } = refill(cleared, rng, weights);
        assert.ok(filled.cells.every((c) => c !== null && c.kind in weights));
      }
    }
  });

  it("M15/M16 khóa khi chưa xong M14; server từ chối tạo trận", async () => {
    const { profiles, deps } = await setup(THROUGH_M14.slice(0, -1));
    const c = (await loadProfile(profiles, OWNER)).profile.campaign;
    assert.equal(campaignNodeUnlocked(c, "M15"), false);
    const early = await createBattleFor(
      OWNER,
      parseNewBattle(body("M15", "advance"))!,
      deps(T0),
    );
    assert.deepEqual(early, { ok: false, error: "badRequest" });
  });

  it("M15: 3vs3 Khó, Kiều Công Hãn mang chiêu riêng, bàn đất khô; thắng ghi đánh dẹp và thưởng một lần", async () => {
    const { store, profiles, deps } = await setup();
    const parsed = parseNewBattle(body("M15", "offerSurrender"))!;
    assert.equal(parsed.mode, "3v3");
    assert.equal(parsed.difficulty, "hard");
    assert.equal(parseNewBattle(body("M15", "scoutWater")), null);
    const created = await createBattleFor(OWNER, parsed, deps(T0));
    assert.ok(created.ok);
    const foes = created.view.battle.sides[1].fighters;
    assert.deepEqual(
      foes.map((f) => f.id),
      ["kieuCongHan", "phong-chau-vanguard", "phong-chau-strategist"],
    );
    assert.ok(foes[0]!.skills?.includes("phongChauLoiKich"));
    const rec = (await store.get(created.id))!;
    assert.deepEqual(rec.match.battle.weights, DRY_GROUND_WEIGHTS);

    await finish(store, created.id, 0);
    const won = await getBattle(created.id, OWNER, deps(T0 + 1000));
    assert.ok(won.ok && won.outcome?.campaignV2);
    const reward = won.outcome.campaignV2;
    assert.equal(reward.missionGold, 250);
    assert.equal(reward.chapterGold, 0);
    assert.equal(reward.faction?.faction, "kieuCongHan");
    assert.equal(reward.faction?.status, "defeated");
    assert.equal(reward.factionRecorded, true);
    const mid = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(mid.campaign.factions.kieuCongHan?.status, "defeated");
    assert.equal(mid.campaign.bestBattleTurns.M15, 6);
    assert.equal(mid.campaign.storyChoices.M15, "offerSurrender");
    assert.equal(campaignNodeUnlocked(mid.campaign, "M16"), true);

    // Đánh lại: không thưởng nhiệm vụ, không ghi thế cục lần hai.
    const replay = await createBattleFor(
      OWNER,
      parseNewBattle(body("M15", "offerSurrender"))!,
      deps(T0 + 2000),
    );
    assert.ok(replay.ok);
    await finish(store, replay.id, 0, 9);
    const again = await getBattle(replay.id, OWNER, deps(T0 + 3000));
    assert.ok(again.ok && again.outcome?.campaignV2);
    assert.equal(again.outcome.campaignV2.firstClear, false);
    assert.equal(again.outcome.campaignV2.totalGold, 0);
    assert.equal(again.outcome.campaignV2.factionRecorded, false);
    const after = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(
      after.campaign.rewardReceipts.filter((r) => r === "node:M15").length,
      1,
    );
    assert.equal(after.campaign.bestBattleTurns.M15, 4);
  });

  it("M16: bàn đầm lầy; thua không ghi gì, thắng khép Chương IV, mở Lưu Cơ; M21 vẫn chờ tuyến đông", async () => {
    const { store, profiles, deps } = await setup([...THROUGH_M14, "M15"]);
    const lostBattle = await createBattleFor(
      OWNER,
      parseNewBattle(body("M16", "scoutWater"))!,
      deps(T0),
    );
    assert.ok(lostBattle.ok);
    const rec = (await store.get(lostBattle.id))!;
    assert.deepEqual(rec.match.battle.weights, WETLAND_WEIGHTS);
    assert.equal(lostBattle.view.battle.sides[1].fighters[0]!.id, "kieuThuan");
    await finish(store, lostBattle.id, 1);
    const lost = await getBattle(lostBattle.id, OWNER, deps(T0 + 1000));
    assert.ok(lost.ok && lost.outcome);
    assert.equal(lost.outcome.campaignV2, undefined);
    const mid = (await loadProfile(profiles, OWNER)).profile;
    assert.ok(!mid.campaign.completed.includes("M16"));
    assert.equal(mid.campaign.factions.kieuThuan, undefined);

    const created = await createBattleFor(
      OWNER,
      parseNewBattle(body("M16", "advance"))!,
      deps(T0 + 2000),
    );
    assert.ok(created.ok);
    await finish(store, created.id, 0);
    const won = await getBattle(created.id, OWNER, deps(T0 + 3000));
    assert.ok(won.ok && won.outcome?.campaignV2);
    assert.equal(won.outcome.campaignV2.missionGold, 250);
    assert.equal(won.outcome.campaignV2.chapterGold, 250);
    assert.deepEqual(won.outcome.campaignV2.unlockedHeroes, ["luuCo"]);
    const end = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(end.campaign.factions.kieuThuan?.status, "defeated");
    assert.ok(chapterCompleted(end.campaign, 4));
    assert.ok(
      chapterStatus(end.campaign, CHAPTER_FOUR).every(
        (m) => m.status === "completed",
      ),
    );
    assert.equal(campaignNodeUnlocked(end.campaign, "M21"), false);
    assert.equal(end.stones, mid.stones);
  });
});
