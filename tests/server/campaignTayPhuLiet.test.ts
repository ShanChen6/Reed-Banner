import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_FIVE,
  STANDARD_WEIGHTS,
  campaignCopyErrors,
  campaignNodeUnlocked,
  campaignSiegeStages,
  completeCampaignNode,
  missionCopy,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import {
  actBattle,
  createBattleFor,
  getBattle,
  parseNewBattle,
} from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 16_000_000;
const OWNER = "g_siege";
const THROUGH_M19: readonly CampaignMissionId[] = [
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
  "M17",
  "M18",
  "M19",
];
const body = (choice: string) => ({
  campaignMission: "M20",
  campaignChoice: choice,
  element: "thuy",
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

async function setup() {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  const seed = newProfile();
  const campaign = complete(seed.campaign, THROUGH_M19);
  assert.ok(
    await profiles.put(
      OWNER,
      { ...seed, campaign: { ...campaign, supply: 90 } },
      0,
    ),
  );
  let n = 0;
  const deps = (now: number) => ({
    store,
    profiles,
    now,
    seed: 47,
    newId: () => `m_${++n}`,
  });
  return { store, profiles, deps };
}

/** Chốt trận: `winner` null là chưa ai thắng (phase giữ đoàn lương đủ lượt). */
async function finish(
  store: MemoryMatchStore,
  id: string,
  winner: 0 | 1 | null,
  turnNumber = 15,
  food?: number,
) {
  const rec = (await store.get(id))!;
  const sides = rec.match.battle.sides.map((side, i) => ({
    ...side,
    ...(i === 0 && food !== undefined ? { food } : {}),
    fighters:
      winner === null || i === winner
        ? side.fighters
        : side.fighters.map((f) => ({ ...f, hp: 0 })),
  })) as unknown as typeof rec.match.battle.sides;
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

const foeIds = (view: {
  battle: { sides: readonly { fighters: readonly { id: string }[] }[] };
}) => view.battle.sides[1]!.fighters.map((f) => f.id);

describe("M20 Tây Phù Liệt: công thành ba phase", () => {
  it("nội dung: ba phase, ghi chú nguồn, không chốt quân số hay lũy lửa", () => {
    assert.deepEqual(campaignCopyErrors(), []);
    assert.ok(CHAPTER_FIVE.playable.includes("M20"));
    assert.deepEqual(campaignSiegeStages("M20"), [
      "breach",
      "escort",
      "assault",
    ]);
    const copy = missionCopy("M20")!;
    const beats = [
      ...(copy.cinematic ?? []),
      ...copy.intro,
      ...copy.outro,
      ...copy.choices.flatMap((c) => c.beats),
    ];
    const text = beats.map((b) => b.text).join(" ");
    assert.match(text, /Nguyễn Hữu Công/);
    assert.match(text, /tình tiết phục vụ gameplay/i);
    assert.doesNotMatch(text, /\b9\d\d\b|tháng \d|ngày \d|vạn quân/);
    // Lựa chọn trước trận chỉ đổi lời kể, không hứa thêm lương.
    for (const choice of copy.choices)
      assert.doesNotMatch(
        choice.beats.map((b) => b.text).join(" "),
        /\+\s*\d+\s*lương|nhận .*lương/,
      );
  });

  it("server: mỗi phase một trận, phase do hồ sơ quyết, chỉ phase cuối hoàn thành nhiệm vụ", async () => {
    const { store, profiles, deps } = await setup();
    const start = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(campaignNodeUnlocked(start.campaign, "M20"), true);

    // Hai trận phase 1 song song: trận chốt sau không được nhảy phase lần nữa.
    const a = await createBattleFor(
      OWNER,
      parseNewBattle(body("breachGate"))!,
      deps(T0),
    );
    const b = await createBattleFor(
      OWNER,
      parseNewBattle(body("drawOutForces"))!,
      deps(T0 + 1),
    );
    assert.ok(a.ok && b.ok);
    assert.deepEqual(foeIds(a.view), [
      "phu-liet-wall-captain",
      "phu-liet-wall-guard",
      "phu-liet-wall-archer",
    ]);
    const recA = (await store.get(a.id))!;
    assert.equal(recA.match.campaignScenario?.phaseIndex, 0);
    // Lựa chọn không đổi lương mang vào trận; bàn cờ là bàn chuẩn của Battle Engine.
    assert.deepEqual(recA.match.battle.weights, STANDARD_WEIGHTS);
    assert.equal(
      recA.match.battle.sides[0].food,
      (await store.get(b.id))!.match.battle.sides[0].food,
    );

    await finish(store, a.id, 0, 15, 57);
    const adv = await getBattle(a.id, OWNER, deps(T0 + 100));
    assert.ok(adv.ok && adv.outcome);
    assert.equal(
      adv.outcome.campaignV2,
      undefined,
      "qua phase không có thưởng lần đầu",
    );
    const p1 = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(p1.campaign.siegePhases.M20, 1);
    assert.ok(!p1.campaign.completed.includes("M20"));
    assert.ok(p1.campaign.inProgress.includes("M20"));
    assert.equal(p1.campaign.factions.nguyenSieu, undefined);
    assert.equal(p1.campaign.supply, 57, "lương còn lại mang sang phase sau");

    // Tải lại không chốt lần hai; trận đã qua phase không nhận thêm hành động.
    const again = await getBattle(a.id, OWNER, deps(T0 + 200));
    assert.ok(again.ok);
    assert.equal(again.outcome, undefined);
    assert.equal((await loadProfile(profiles, OWNER)).profile.gold, p1.gold);
    const blocked = await actBattle(
      a.id,
      OWNER,
      { action: { type: "timeout" }, seq: (await store.get(a.id))!.match.seq },
      deps(T0 + 250),
    );
    assert.ok(!blocked.ok);
    assert.equal(blocked.error, "battleOver");

    await finish(store, b.id, 0, 15, 88);
    await getBattle(b.id, OWNER, deps(T0 + 300));
    const p1b = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(p1b.campaign.siegePhases.M20, 1);
    // Trận trùng không nạp lại lương; lương nó đã tiêu (90 → 88) vẫn trừ vào hồ sơ (CAMP-08.03).
    assert.equal(p1b.campaign.supply, 55, "trận trùng không nạp lại lương");

    // Phase 2: giữ đoàn lương, đủ lượt mà chưa ai thắng là qua.
    const escort = await createBattleFor(
      OWNER,
      parseNewBattle(body("breachGate"))!,
      deps(T0 + 400),
    );
    assert.ok(escort.ok);
    assert.deepEqual(foeIds(escort.view), [
      "phu-liet-raid-leader",
      "phu-liet-raider",
      "phu-liet-scout",
    ]);
    const escortRec = (await store.get(escort.id))!;
    assert.equal(escortRec.match.campaignScenario?.phaseIndex, 1);
    assert.ok(escortRec.match.battle.sides[0].food <= 57);
    await finish(store, escort.id, null, 9);
    const notYet = await getBattle(escort.id, OWNER, deps(T0 + 450));
    assert.ok(notYet.ok);
    assert.equal(notYet.outcome, undefined, "chưa đủ 5 lượt");
    await finish(store, escort.id, null, 11);
    const held = await getBattle(escort.id, OWNER, deps(T0 + 500));
    assert.ok(held.ok && held.outcome);
    assert.equal(held.outcome.campaignV2, undefined);
    assert.equal(
      (await loadProfile(profiles, OWNER)).profile.campaign.siegePhases.M20,
      2,
    );

    // Phase 3 thua: giữ phase, không hoàn thành.
    const lose = await createBattleFor(
      OWNER,
      parseNewBattle(body("breachGate"))!,
      deps(T0 + 600),
    );
    assert.ok(lose.ok);
    assert.equal(foeIds(lose.view)[0], "nguyenSieu");
    await finish(store, lose.id, 1);
    await getBattle(lose.id, OWNER, deps(T0 + 700));
    const afterLoss = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(afterLoss.campaign.siegePhases.M20, 2);
    assert.ok(!afterLoss.campaign.completed.includes("M20"));

    const win = await createBattleFor(
      OWNER,
      parseNewBattle(body("breachGate"))!,
      deps(T0 + 800),
    );
    assert.ok(win.ok);
    await finish(store, win.id, 0, 19);
    const done = await getBattle(win.id, OWNER, deps(T0 + 900));
    assert.ok(done.ok && done.outcome?.campaignV2);
    assert.equal(done.outcome.campaignV2.missionGold, 250);
    assert.equal(done.outcome.campaignV2.faction?.faction, "nguyenSieu");
    const end = (await loadProfile(profiles, OWNER)).profile;
    assert.ok(end.campaign.completed.includes("M20"));
    assert.equal(end.campaign.siegePhases.M20, undefined);
    assert.equal(end.campaign.factions.nguyenSieu?.status, "defeated");
    assert.equal(
      end.campaign.rewardReceipts.filter((r) => r === "node:M20").length,
      1,
    );
    assert.ok(end.campaign.unlockedHeroes.includes("trinhTu"));
    assert.equal(end.stones, start.stones);
    // M21 còn cần tuyến tây.
    assert.equal(campaignNodeUnlocked(end.campaign, "M21"), false);

    // Đánh lại: đi lại từ phase 1, phase cuối không có thưởng lần đầu.
    const replay = await createBattleFor(
      OWNER,
      parseNewBattle(body("breachGate"))!,
      deps(T0 + 1000),
    );
    assert.ok(replay.ok);
    assert.equal(
      (await store.get(replay.id))!.match.campaignScenario?.phaseIndex,
      0,
    );
  });
});
