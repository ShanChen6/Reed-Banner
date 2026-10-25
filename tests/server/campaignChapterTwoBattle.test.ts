import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ESTUARY_WEIGHTS,
  clampCampaignFood,
  completeCampaignNode,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import {
  createBattleFor,
  getBattle,
  parseNewBattle,
} from "../../src/server/battles";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 9_000_000;
const OWNER = "g_bohai";
const m07 = {
  campaignMission: "M07",
  campaignChoice: "holdRearguard",
  element: "loi",
  profession: "tuongSi",
  companions: ["haVan", "maiThanh"],
};

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

async function setup(supply = 70) {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  const seed = newProfile();
  const campaign = complete(seed.campaign, [
    "M01",
    "M02",
    "M03",
    "M04",
    "M05",
    "M06",
  ]);
  assert.ok(
    await profiles.put(
      OWNER,
      { ...seed, campaign: { ...campaign, supply } },
      0,
    ),
  );
  let n = 0;
  const deps = (now: number) => ({
    store,
    profiles,
    now,
    seed: 11,
    newId: () => `m_${++n}`,
  });
  return { store, profiles, deps, seed };
}

/** Kết thúc trận bằng cách đặt người thắng; HP phe thua về 0 cho khớp mục tiêu. */
async function finish(
  store: MemoryMatchStore,
  id: string,
  winner: 0 | 1,
  food: number,
) {
  const rec = (await store.get(id))!;
  const sides = rec.match.battle.sides.map((side, i) =>
    i === winner
      ? { ...side, food }
      : {
          ...side,
          fighters: side.fighters.map((f) => ({ ...f, hp: 0 })),
        },
  ) as unknown as typeof rec.match.battle.sides;
  const battle = { ...rec.match.battle, sides, winner };
  assert.ok(
    await store.save(
      { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
      rec.match.seq,
    ),
  );
}

describe("Chương II: M07 trận giữ cửa biển, M08 nhận quân không có trận", () => {
  it("M07 là trận 3vs3 với toán cướp hư cấu trên bàn cửa sông; Trần Lãm không ở phe đối thủ", async () => {
    const { store, deps } = await setup();
    const created = await createBattleFor(
      OWNER,
      parseNewBattle(m07)!,
      deps(T0),
    );
    assert.ok(created.ok);
    const ids = created.view.battle.sides[1].fighters.map((f) => f.id);
    assert.deepEqual(ids, [
      "bo-hai-raider-chief",
      "bo-hai-raider-boatman",
      "bo-hai-raider-scout",
    ]);
    assert.ok(!ids.includes("tranLam"));
    const rec = (await store.get(created.id))!;
    assert.deepEqual(rec.match.battle.weights, ESTUARY_WEIGHTS);
    assert.equal(rec.match.raidBoss, undefined);
  });

  it("M08 không tạo được trận", () => {
    assert.equal(
      parseNewBattle({
        ...m07,
        campaignMission: "M08",
        campaignChoice: undefined,
      }),
      null,
    );
  });

  it("thua M07 thì M08 vẫn khóa; lương còn lại vẫn mang sang", async () => {
    const { store, profiles, deps } = await setup();
    const created = await createBattleFor(
      OWNER,
      parseNewBattle(m07)!,
      deps(T0),
    );
    assert.ok(created.ok);
    await finish(store, created.id, 1, 0);
    const lost = await getBattle(created.id, OWNER, deps(T0 + 1000));
    assert.ok(lost.ok && lost.outcome);
    assert.equal(lost.outcome.campaignV2, undefined);
    const after = (await loadProfile(profiles, OWNER)).profile;
    assert.ok(!after.campaign.completed.includes("M07"));
    const m08 = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m08_locked", nodeId: "M08", choice: "silentMemorial" },
      T0 + 2000,
    );
    assert.deepEqual(m08, { ok: false, error: "locked" });
    assert.equal(
      after.campaign.supply,
      clampCampaignFood(created.view.battle.sides[0].food),
    );
  });

  it("thắng M07 mới mở M08; M08 hoàn thành không trận, không thưởng trận, không đụng lương", async () => {
    const { store, profiles, deps } = await setup();
    const created = await createBattleFor(
      OWNER,
      parseNewBattle(m07)!,
      deps(T0),
    );
    assert.ok(created.ok);
    await finish(store, created.id, 0, 47);
    const won = await getBattle(created.id, OWNER, deps(T0 + 1000));
    assert.ok(won.ok && won.outcome?.campaignV2);
    assert.equal(won.outcome.campaignV2.missionGold, 250);
    assert.equal(won.outcome.campaignV2.chapterGold, 0);
    // Gọi lại không cộng lần hai.
    const again = await getBattle(created.id, OWNER, deps(T0 + 2000));
    assert.ok(again.ok);
    assert.equal(again.outcome, undefined);

    const mid = (await loadProfile(profiles, OWNER)).profile;
    assert.ok(mid.campaign.completed.includes("M07"));
    assert.equal(mid.campaign.supply, 47);
    assert.equal(mid.campaign.storyChoices.M07, "holdRearguard");

    const m08 = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m08_takeover", nodeId: "M08", choice: "addressTroops" },
      T0 + 3000,
    );
    assert.ok(m08.ok);
    assert.equal(m08.outcome.historicalOutcome, "allianced");
    // 50 vàng nhiệm vụ + 250 vàng hoàn thành Chương II; không có thưởng trận.
    assert.equal(m08.outcome.rewardGold, 300);
    const end = m08.profile;
    assert.equal(end.gold, mid.gold + 300);
    assert.equal(end.campaign.supply, mid.campaign.supply);
    assert.equal(end.main.xp, mid.main.xp);
    assert.deepEqual(end.bag, mid.bag);
    assert.deepEqual(end.quests, mid.quests);
    assert.equal(end.stones, mid.stones);
    assert.ok(end.campaign.rewardReceipts.includes("chapter:2"));
    assert.ok(end.campaign.unlockedHeroes.includes("nguyenBac"));

    const retry = await completeCampaignEvent(
      profiles,
      OWNER,
      { eventId: "evt_m08_retry", nodeId: "M08", choice: "addressTroops" },
      T0 + 4000,
    );
    assert.ok(retry.ok);
    assert.equal(retry.outcome.rewardGold, 0);
    assert.equal(retry.profile.gold, end.gold);
  });
});
