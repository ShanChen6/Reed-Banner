import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GRACE_MS,
  TURN_MS,
  completeCampaignNode,
  newProfile,
} from "../../src/core";
import {
  createBattleFor,
  getBattle,
  parseNewBattle,
} from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const OWNER = "g_m04";
const T0 = 9_000_000;

/** Hồ sơ đã qua M01–M03 (đi qua đường server đã có test riêng ở campaignChapterOne.test.ts). */
function afterM03() {
  let profile = newProfile();
  for (const id of ["M01", "M02", "M03"] as const) {
    const done = completeCampaignNode(profile.campaign, id);
    assert.ok(done.ok);
    profile = { ...profile, campaign: done.campaign };
  }
  return profile;
}

/** Bỏ mặc cho hết giờ, tải lại nhiều lần; trả số response mang thưởng. */
async function idle(
  deps: (now: number) => Parameters<typeof getBattle>[2],
  id: string,
) {
  let now = T0;
  const outcomes = [];
  for (let i = 0; i < 20; i++) {
    now += TURN_MS + GRACE_MS + 1;
    const res = await getBattle(id, OWNER, deps(now));
    assert.ok(res.ok);
    if (res.outcome) outcomes.push(res.outcome);
  }
  return outcomes;
}

describe("Chương I: M04 Hoa Lư năm 951 trên server", () => {
  it("tạo trận 3vs3 Thường với đội hồ sơ; qua M04 thì hết chương, +250 vàng chương và mở khóa Đinh Liễn đúng một lần", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const start = afterM03();
    assert.ok(await profiles.put(OWNER, start, 0));
    // seed 1 qua được khi bỏ mặc (kiểm tra cục bộ 27/30 seed qua khi không thao tác).
    const deps = (now: number) => ({
      store,
      profiles,
      now,
      seed: 1,
      newId: () => "m_04",
    });

    const input = parseNewBattle({
      campaignMission: "M04",
      campaignChoice: "holdPass",
      element: "moc",
      profession: "tuongSi",
      companions: start.team,
    });
    assert.ok(input);
    assert.equal(input.mode, "3v3");
    assert.equal(input.difficulty, "normal");
    const created = await createBattleFor(OWNER, input, deps(T0));
    assert.ok(created.ok);
    assert.equal(created.view.campaignScenario?.nodeId, "M04");
    assert.deepEqual(
      created.view.battle.sides[1].fighters.map((f) => f.id),
      ["ngo-951-field-commander", "ngo-951-soldier", "ngo-951-strategist"],
    );
    assert.equal(created.view.battle.sides[0].fighters.length, 3);

    const outcomes = await idle(deps, created.id);
    assert.equal(outcomes.length, 1);
    const reward = outcomes[0]!.campaignV2!;
    assert.equal(reward.firstClear, true);
    assert.equal(reward.missionGold, 250);
    assert.equal(reward.chapterGold, 250);
    assert.deepEqual(reward.unlockedHeroes, ["dinhLien"]);

    const end = (await loadProfile(profiles, OWNER)).profile;
    assert.deepEqual(end.campaign.completed, ["M01", "M02", "M03", "M04"]);
    assert.ok(end.campaign.rewardReceipts.includes("chapter:1"));
    assert.ok(end.campaign.rewardReceipts.includes("hero:dinhLien"));
    assert.equal(end.campaign.regionalOutcomes.hoaLu, "defended");
    assert.equal(end.companions.dinhLien?.level, end.main.level);
    assert.equal(end.stones, start.stones);

    // Đánh lại M04: không nhận lại thưởng nhiệm vụ, thưởng chương hay đồng hành.
    const again = await createBattleFor(
      OWNER,
      parseNewBattle({
        ...input,
        campaignMission: "M04",
        companions: start.team,
      })!,
      { ...deps(T0), newId: () => "m_04b" },
    );
    assert.ok(again.ok);
    const replayed = await idle(
      (now) => ({ ...deps(now), newId: () => "m_04b" }),
      "m_04b",
    );
    for (const o of replayed) {
      assert.equal(o.campaignV2?.totalGold ?? 0, 0);
      assert.deepEqual(o.campaignV2?.unlockedHeroes ?? [], []);
    }
    const final = (await loadProfile(profiles, OWNER)).profile;
    assert.deepEqual(
      final.campaign.rewardReceipts,
      end.campaign.rewardReceipts,
    );
    assert.equal(final.campaign.storyChoices.M04, "holdPass");
  });

  it("M04 khóa khi chưa qua M03", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 1, newId: () => "m_x" };
    const input = parseNewBattle({
      campaignMission: "M04",
      element: "moc",
      profession: "tuongSi",
      companions: newProfile().team,
    })!;
    assert.deepEqual(await createBattleFor(OWNER, input, deps), {
      ok: false,
      error: "badRequest",
    });
  });
});
