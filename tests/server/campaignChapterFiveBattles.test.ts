import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_FIVE,
  DEFAULT_MAX_TURNS,
  DEFAULT_TEAM,
  ELEMENTS,
  SCARCE_SUPPLY_WEIGHTS,
  autoProgress,
  buildCompanion,
  buildMain,
  campaignBattleAdvice,
  campaignCopyErrors,
  campaignEncounter,
  campaignEncounterFoes,
  campaignFocusChapter,
  campaignNodeUnlocked,
  campaignTerrain,
  chapterStatus,
  companionById,
  completeCampaignNode,
  missionCopy,
  newProfile,
  runBattle,
  storyNodeById,
  type CampaignMissionId,
  type CampaignProgressV2,
  type SideIndex,
} from "../../src/core";
import {
  createBattleFor,
  getBattle,
  parseNewBattle,
} from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 15_000_000;
const OWNER = "g_east";
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
const body = (id: "M17" | "M18", choice: string) => ({
  campaignMission: id,
  campaignChoice: choice,
  element: "hoa",
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

async function setup(ids: readonly CampaignMissionId[] = THROUGH_M12) {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  const seed = newProfile();
  const campaign = complete(seed.campaign, ids);
  assert.ok(
    await profiles.put(
      OWNER,
      { ...seed, campaign: { ...campaign, supply: 80 } },
      0,
    ),
  );
  let n = 0;
  const deps = (now: number) => ({
    store,
    profiles,
    now,
    seed: 31,
    newId: () => `m_${++n}`,
  });
  return { store, profiles, deps, seed };
}

async function finish(
  store: MemoryMatchStore,
  id: string,
  winner: 0 | 1,
  turnNumber = 15,
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

describe("Chương V: M17 Siêu Loại, M18 Tiên Du", () => {
  it("nội dung hợp lệ; M17 ghi disputed và không nêu ngày tháng", () => {
    assert.deepEqual(campaignCopyErrors(), []);
    assert.deepEqual(CHAPTER_FIVE.playable, ["M17", "M18", "M19", "M20"]);
    const node = storyNodeById("M17")!;
    assert.ok(node.historicalBasis.includes("disputed"));
    const copy = missionCopy("M17")!;
    const beats = [
      ...(copy.cinematic ?? []),
      ...copy.intro,
      ...copy.outro,
      ...copy.choices.flatMap((c) => c.beats),
      ...(copy.sourceNotes ?? []).flatMap((n) => n.beats),
    ];
    const text = beats.map((b) => b.text).join(" ");
    assert.doesNotMatch(text, /\b9\d\d\b|tháng \d|ngày \d/);
    assert.match(text, /game tái dựng/);
    assert.ok(beats.some((b) => b.basis === "disputed"));
    assert.ok(
      (copy.sourceNotes ?? []).length > 0,
      "M17 phải có ghi chú chứng cứ",
    );
  });

  it("M18 có sức ép lương: đối thủ đầy lương, bàn ít bánh chưng, lương gợi ý cao hơn", () => {
    const enc = campaignEncounter("M18")!;
    assert.equal(enc.foeFood, 100);
    assert.equal(campaignTerrain("M18")!.weights, SCARCE_SUPPLY_WEIGHTS);
    assert.equal(SCARCE_SUPPLY_WEIGHTS.banhChung, 8);
    assert.equal(campaignTerrain("M17"), undefined);
    const p = newProfile();
    assert.ok(
      campaignBattleAdvice(p, "M18")!.suggestedFood >
        campaignBattleAdvice(p, "M17")!.suggestedFood,
    );
  });

  it("M18 ở cấp gợi ý luôn kết thúc, không kéo dài vô hạn", () => {
    const enc = campaignEncounter("M18")!;
    const level = enc.recommendedLevel;
    const progress = autoProgress(level, null);
    const foes = campaignEncounterFoes("M18")!;
    const food = campaignBattleAdvice(newProfile(), "M18")!.suggestedFood;
    const turns: number[] = [];
    for (let i = 0; i < 6; i++) {
      const player = [
        buildMain(progress, ELEMENTS[i % ELEMENTS.length]!, "tuongSi"),
        ...DEFAULT_TEAM.map((id) =>
          buildCompanion(companionById(id)!, autoProgress(level, null)),
        ),
      ];
      const r = runBattle(
        {
          sides: [
            { fighters: player, leader: 0, food },
            { fighters: foes, leader: 0, food: enc.foeFood! },
          ],
          seed: 4001 + i * 7919,
          firstSide: (i % 2) as SideIndex,
          weights: SCARCE_SUPPLY_WEIGHTS,
        },
        { difficulty: ["normal", "hard"] },
      );
      assert.notEqual(r.winner, null, `seed ${i}: chạm giới hạn lượt`);
      turns.push(r.turns);
    }
    assert.ok(Math.max(...turns) < DEFAULT_MAX_TURNS / 2, String(turns));
  });

  it("server: mở cùng M13 sau M12; M18 mang lương đối thủ và bàn đường lương căng", async () => {
    const { store, profiles, deps } = await setup();
    const c = (await loadProfile(profiles, OWNER)).profile.campaign;
    assert.equal(campaignNodeUnlocked(c, "M17"), true);
    assert.equal(campaignNodeUnlocked(c, "M18"), false);
    assert.deepEqual(
      chapterStatus(c, CHAPTER_FIVE).map((m) => m.status),
      ["open", "locked", "locked", "locked"],
    );
    const early = await createBattleFor(
      OWNER,
      parseNewBattle(body("M18", "prepareLogistics"))!,
      deps(T0),
    );
    assert.deepEqual(early, { ok: false, error: "badRequest" });

    const m17 = await createBattleFor(
      OWNER,
      parseNewBattle(body("M17", "strategicBriefing"))!,
      deps(T0 + 1),
    );
    assert.ok(m17.ok);
    assert.deepEqual(
      m17.view.battle.sides[1].fighters.map((f) => f.id),
      ["lyKhue", "sieu-loai-vanguard", "sieu-loai-strategist"],
    );
    await finish(store, m17.id, 0);
    const won17 = await getBattle(m17.id, OWNER, deps(T0 + 1000));
    assert.ok(won17.ok && won17.outcome?.campaignV2);
    assert.equal(won17.outcome.campaignV2.missionGold, 250);
    assert.equal(won17.outcome.campaignV2.faction?.faction, "lyKhue");
    assert.equal(won17.outcome.campaignV2.factionRecorded, true);

    const mid = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(mid.campaign.factions.lyKhue?.status, "defeated");
    assert.equal(mid.campaign.bestBattleTurns.M17, 7);
    assert.equal(campaignFocusChapter(mid.campaign), CHAPTER_FIVE);

    const m18 = await createBattleFor(
      OWNER,
      parseNewBattle(body("M18", "civilianRelief"))!,
      deps(T0 + 2000),
    );
    assert.ok(m18.ok);
    const rec = (await store.get(m18.id))!;
    assert.deepEqual(rec.match.battle.weights, SCARCE_SUPPLY_WEIGHTS);
    assert.equal(rec.match.battle.sides[1].food, 100);
    // Lương phe ta lấy từ hồ sơ (có thể đã trừ phần ăn của lượt đầu).
    assert.ok(rec.match.battle.sides[0].food <= mid.campaign.supply);
    assert.ok(rec.match.battle.sides[0].food > 0);

    // Thua: lương còn lại mang về, không ghi thế cục.
    await finish(store, m18.id, 1);
    const lost = await getBattle(m18.id, OWNER, deps(T0 + 3000));
    assert.ok(lost.ok && lost.outcome);
    assert.equal(lost.outcome.campaignV2, undefined);
    const afterLoss = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(afterLoss.campaign.factions.nguyenThuTiep, undefined);
    assert.ok(!afterLoss.campaign.completed.includes("M18"));

    const retry = await createBattleFor(
      OWNER,
      parseNewBattle(body("M18", "civilianRelief"))!,
      deps(T0 + 4000),
    );
    assert.ok(retry.ok);
    await finish(store, retry.id, 0, 21);
    const won18 = await getBattle(retry.id, OWNER, deps(T0 + 5000));
    assert.ok(won18.ok && won18.outcome?.campaignV2);
    assert.equal(won18.outcome.campaignV2.missionGold, 250);
    assert.equal(won18.outcome.campaignV2.chapterGold, 0);
    const end = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(end.campaign.factions.nguyenThuTiep?.status, "defeated");
    assert.equal(end.campaign.bestBattleTurns.M18, 10);
    assert.equal(
      end.campaign.rewardReceipts.filter((r) => r === "node:M18").length,
      1,
    );
    // Hai nút sự kiện không có bestTurns.
    assert.equal(end.campaign.bestBattleTurns.M12, undefined);
    assert.equal(end.stones, mid.stones);
    assert.equal(campaignNodeUnlocked(end.campaign, "M19"), true);
  });
});
