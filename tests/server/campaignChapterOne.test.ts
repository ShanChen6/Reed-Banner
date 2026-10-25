import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FOOD_UPKEEP, GRACE_MS, TURN_MS, newProfile } from "../../src/core";
import {
  createBattleFor,
  getBattle,
  parseNewBattle,
} from "../../src/server/battles";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 7_000_000;
const OWNER = "g_chapter1";
const m03 = {
  campaignMission: "M03",
  campaignChoice: "fortifyPass",
  element: "moc",
  profession: "tuongSi",
  companions: [],
};

function setup() {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  let n = 0;
  const deps = (now: number) => ({
    store,
    profiles,
    now,
    seed: 6,
    newId: () => `m_${++n}`,
  });
  return { store, profiles, deps };
}

describe("Chương I: luồng M01 → M02 → M03 trên server", () => {
  it("parse nhiệm vụ V2: lấy thể thức và độ khó theo nhiệm vụ, chặn payload trộn và lựa chọn lạ", () => {
    assert.deepEqual(parseNewBattle(m03), {
      mode: "1v1",
      element: "moc",
      profession: "tuongSi",
      difficulty: "easy",
      companions: [],
      campaignMission: "M03",
      campaignChoice: "fortifyPass",
    });
    assert.equal(parseNewBattle({ ...m03, stage: "coLau" }), null);
    assert.equal(parseNewBattle({ ...m03, raid: 1 }), null);
    assert.equal(parseNewBattle({ ...m03, tower: true }), null);
    assert.equal(parseNewBattle({ ...m03, campaignChoice: "listen" }), null);
    assert.equal(parseNewBattle({ ...m03, campaignMission: "M01" }), null);
    assert.equal(parseNewBattle({ ...m03, campaignMission: "M99" }), null);
    assert.equal(
      parseNewBattle({
        mode: "1v1",
        element: "moc",
        profession: "tuongSi",
        difficulty: "easy",
        campaignChoice: "fortifyPass",
      }),
      null,
    );
  });

  it("chưa qua M02 thì không mở được trận M03; M04 chưa có encounter thì từ chối", async () => {
    const { deps } = setup();
    assert.deepEqual(
      await createBattleFor(OWNER, parseNewBattle(m03)!, deps(T0)),
      {
        ok: false,
        error: "badRequest",
      },
    );
    const m04 = parseNewBattle({
      campaignMission: "M04",
      element: "moc",
      profession: "tuongSi",
      companions: ["haVan", "maiThanh"],
    });
    assert.ok(m04);
    assert.deepEqual(await createBattleFor(OWNER, m04, deps(T0)), {
      ok: false,
      error: "badRequest",
    });
  });

  it("hồ sơ mới đi liền tới hết M03, tải lại giữa chừng không mất trận, thưởng chỉ một lần", async () => {
    const { profiles, deps } = setup();
    const start = (await loadProfile(profiles, OWNER)).profile;
    assert.deepEqual(start.campaign.completed, []);

    for (const [nodeId, choice] of [
      ["M01", "listen"],
      ["M02", "askCountryside"],
    ] as const) {
      const done = await completeCampaignEvent(
        profiles,
        OWNER,
        { eventId: `evt_${nodeId}_0001`, nodeId, choice },
        T0,
      );
      assert.ok(done.ok);
      assert.equal(done.outcome.firstClear, true);
      // Gửi lại cùng sự kiện: không cộng lần hai.
      const again = await completeCampaignEvent(
        profiles,
        OWNER,
        { eventId: `evt_${nodeId}_0001`, nodeId, choice },
        T0,
      );
      assert.ok(again.ok);
      assert.equal(again.outcome.rewardGold, 0);
    }
    const afterEvents = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(afterEvents.gold, start.gold + 100);

    const created = await createBattleFor(
      OWNER,
      parseNewBattle(m03)!,
      deps(T0),
    );
    assert.ok(created.ok);
    assert.deepEqual(created.view.campaignScenario, {
      nodeId: "M03",
      scenarioId: "M03-phase-1",
      phaseIndex: 0,
      startFood: afterEvents.campaign.supply,
    });
    assert.equal(created.view.raidBoss, undefined);
    assert.equal(
      created.view.battle.sides[1].fighters[0]!.id,
      "hoa-lu-raider-chief",
    );
    // Lương mang từ hồ sơ vào trận (lượt đầu đã trừ phần ăn).
    const food = created.view.battle.sides[0].food;
    assert.ok(
      food <= afterEvents.campaign.supply &&
        food >= afterEvents.campaign.supply - FOOD_UPKEEP,
    );

    const begun = (await loadProfile(profiles, OWNER)).profile;
    assert.deepEqual(begun.campaign.inProgress, ["M03"]);
    assert.equal(begun.campaign.storyChoices.M03, "fortifyPass");

    // Người chơi rời trang; mỗi lần tải lại, server chạy bù các lượt hết giờ.
    let outcomes = 0;
    let now = T0;
    let campaignGold = 0;
    for (let i = 0; i < 12; i++) {
      now += TURN_MS + GRACE_MS + 1;
      const res = await getBattle(created.id, OWNER, deps(now));
      assert.ok(res.ok);
      if (res.outcome) {
        outcomes++;
        assert.ok(res.outcome.campaignV2);
        campaignGold = res.outcome.campaignV2.totalGold;
      }
    }
    assert.equal(outcomes, 1);
    assert.equal(campaignGold, 250);

    const end = (await loadProfile(profiles, OWNER)).profile;
    assert.deepEqual(end.campaign.completed, ["M01", "M02", "M03"]);
    assert.deepEqual(end.campaign.inProgress, []);
    assert.deepEqual(end.campaign.rewardReceipts, [
      "node:M01",
      "node:M02",
      "node:M03",
    ]);
    assert.equal(end.campaign.storyChoices.M03, "fortifyPass");
    assert.ok(end.campaign.bestBattleTurns.M03! >= 1);
    assert.equal(end.stones, start.stones);
    assert.ok(!("legacy" in end.campaign));

    // Đánh lại M03 sau khi qua: được tạo trận, lựa chọn đã ghi không đổi.
    const replay = await createBattleFor(
      OWNER,
      parseNewBattle({ ...m03, campaignChoice: "reassurePeople" })!,
      deps(now),
    );
    assert.ok(replay.ok);
    const after = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(after.campaign.storyChoices.M03, "fortifyPass");
    assert.deepEqual(after.campaign.inProgress, []);
    assert.deepEqual(
      after.campaign.rewardReceipts,
      end.campaign.rewardReceipts,
    );
    assert.ok(newProfile().campaign.completed.length === 0);
  });
});
