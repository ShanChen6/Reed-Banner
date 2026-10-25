import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_SIX,
  campaignCopyErrors,
  campaignNodeUnlocked,
  campaignPhaseLabels,
  campaignScenarioByNode,
  campaignScenarioTag,
  completeCampaignNode,
  createBattle,
  missionCopy,
  newProfile,
  settleCampaignScenario,
  type CampaignMissionId,
  type CampaignProgressV2,
  type FighterConfig,
} from "../../src/core";
import {
  actBattle,
  createBattleFor,
  getBattle,
  parseNewBattle,
} from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 17_000_000;
const OWNER = "g_dodong";
const THROUGH_M20 = Array.from(
  { length: 20 },
  (_, i) => `M${String(i + 1).padStart(2, "0")}` as CampaignMissionId,
);
const body = (choice: string) => ({
  campaignMission: "M21",
  campaignChoice: choice,
  element: "moc",
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
  const campaign = complete(seed.campaign, THROUGH_M20);
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
    // Seed chẵn: phe ta đi trước, nên máu trùm lúc vào trận chưa bị lượt AI (hồi máu) đổi.
    seed: 54,
    newId: () => `m_${++n}`,
  });
  return { store, profiles, deps };
}

/** Sửa trạng thái trận đã lưu: `bossRatio` đặt máu thủ lĩnh phe địch, `winner` như engine ghi. */
async function edit(
  store: MemoryMatchStore,
  id: string,
  opts: { winner: 0 | 1 | null; bossRatio?: number; turnNumber?: number },
) {
  const rec = (await store.get(id))!;
  const sides = rec.match.battle.sides.map((side, i) => ({
    ...side,
    fighters: side.fighters.map((f, j) => {
      if (opts.winner !== null && i !== opts.winner) return { ...f, hp: 0 };
      if (i === 1 && j === 0 && opts.bossRatio !== undefined)
        return { ...f, hp: Math.round(f.maxHp * opts.bossRatio) };
      return f;
    }),
  })) as unknown as typeof rec.match.battle.sides;
  const battle = {
    ...rec.match.battle,
    sides,
    winner: opts.winner,
    turn: { ...rec.match.battle.turn, number: opts.turnNumber ?? 15 },
  };
  assert.ok(
    await store.save(
      { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
      rec.match.seq,
    ),
  );
}

const fighter = (id: string): FighterConfig => ({
  id,
  name: id,
  element: "tho",
  profession: "binhLinh",
  maxHp: 100,
  atk: 20,
  def: 10,
  skills: [],
});

describe("M21 Đỗ Động: mở đường vây và trùm nhiều phase", () => {
  it("nội dung: cao trào do game chọn, không gọi là trận cuối, không có câu cấm", () => {
    assert.deepEqual(campaignCopyErrors(), []);
    assert.ok(CHAPTER_SIX.playable.includes("M21"));
    assert.deepEqual(campaignPhaseLabels("M21"), [
      "Mở đường vây",
      "Phá tuyến ngoài",
      "Trận quyết",
    ]);
    const copy = missionCopy("M21")!;
    const text = [
      ...(copy.cinematic ?? []),
      ...copy.intro,
      ...copy.outro,
      ...copy.choices.flatMap((c) => c.beats),
      ...(copy.sourceNotes ?? []).flatMap((n) => n.beats),
    ]
      .map((b) => b.text)
      .join(" ");
    assert.match(text, /Đỗ Cảnh Công/);
    assert.match(text, /không phải trận cuối/);
    assert.doesNotMatch(text, /11 sứ quân|vây hơn một năm|\b9\d\d\b|tháng \d/);
  });

  it("phase trùm qua khi máu trùm tới ngưỡng, trận quyết phải hạ trùm", () => {
    const plan = campaignScenarioByNode("M21")!;
    assert.equal(plan.phases.length, 3);
    const outer = campaignScenarioTag("M21", 1)!;
    const state = createBattle({
      sides: [
        { fighters: [fighter("player")], leader: 0 },
        { fighters: [fighter("doCanhThac")], leader: 0 },
      ],
      seed: 3,
      firstSide: 0,
      now: 1,
    }).state;
    const max = state.sides[1].fighters[0]!.maxHp;
    state.sides[1].fighters[0]!.hp = max / 2 + 1;
    let r = settleCampaignScenario(outer, state);
    assert.ok(r.ok);
    assert.equal(r.verdict.status, "pending");
    state.sides[1].fighters[0]!.hp = max / 2;
    r = settleCampaignScenario(outer, state);
    assert.ok(r.ok);
    assert.equal(r.verdict.status, "advance");
    // Trận quyết không có ngưỡng: trùm còn máu thì chưa xong.
    const final = settleCampaignScenario(campaignScenarioTag("M21", 2)!, state);
    assert.ok(final.ok);
    assert.equal(final.verdict.status, "pending");
  });

  it("server: ba trận, máu trùm mang sang, chỉ trận quyết hoàn thành; M22 mở sau đó", async () => {
    const { store, profiles, deps } = await setup();
    const start = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(campaignNodeUnlocked(start.campaign, "M21"), true);
    assert.equal(campaignNodeUnlocked(start.campaign, "M22"), false);

    const road = await createBattleFor(OWNER, parseNewBattle(body("callOpenGate"))!, deps(T0));
    assert.ok(road.ok);
    assert.equal(road.view.battle.sides[1].fighters[0]!.id, "do-dong-road-captain");
    await edit(store, road.id, { winner: 0 });
    const r1 = await getBattle(road.id, OWNER, deps(T0 + 100));
    assert.ok(r1.ok && r1.outcome);
    assert.equal(r1.outcome.campaignV2, undefined);
    let p = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(p.campaign.siegePhases.M21, 1);
    assert.equal(p.campaign.phaseBossHp.M21, undefined);

    const outer = await createBattleFor(OWNER, parseNewBattle(body("callOpenGate"))!, deps(T0 + 200));
    assert.ok(outer.ok);
    assert.equal(outer.view.battle.sides[1].fighters[0]!.id, "doCanhThac");
    // Trên ngưỡng: trận còn tiếp, chưa chốt gì.
    await edit(store, outer.id, { winner: null, bossRatio: 0.7 });
    const above = await getBattle(outer.id, OWNER, deps(T0 + 250));
    assert.ok(above.ok);
    assert.equal(above.outcome, undefined);
    await edit(store, outer.id, { winner: null, bossRatio: 0.4 });
    const r2 = await getBattle(outer.id, OWNER, deps(T0 + 300));
    assert.ok(r2.ok && r2.outcome);
    assert.equal(r2.outcome.campaignV2, undefined, "đổi phase không có thưởng nhiệm vụ");
    p = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(p.campaign.siegePhases.M21, 2);
    assert.equal(p.campaign.phaseBossHp.M21, 0.4);
    assert.ok(!p.campaign.completed.includes("M21"));
    const gold = p.gold;
    // Tải lại và gửi hành động vào trận đã đổi phase: không chốt lại.
    const again = await getBattle(outer.id, OWNER, deps(T0 + 350));
    assert.ok(again.ok);
    assert.equal(again.outcome, undefined);
    const blocked = await actBattle(
      outer.id,
      OWNER,
      { action: { type: "timeout" }, seq: (await store.get(outer.id))!.match.seq },
      deps(T0 + 360),
    );
    assert.ok(!blocked.ok);
    assert.equal(blocked.error, "battleOver");
    assert.equal((await loadProfile(profiles, OWNER)).profile.gold, gold);

    // Trận quyết: trùm vào trận với máu còn lại, không hồi.
    const lose = await createBattleFor(OWNER, parseNewBattle(body("declareAdvance"))!, deps(T0 + 400));
    assert.ok(lose.ok);
    const boss = lose.view.battle.sides[1].fighters[0]!;
    assert.equal(boss.id, "doCanhThac");
    assert.equal(boss.hp, Math.round(boss.maxHp * 0.4));
    const aide = lose.view.battle.sides[1].fighters[1]!;
    assert.equal(aide.hp, aide.maxHp);
    await edit(store, lose.id, { winner: 1 });
    await getBattle(lose.id, OWNER, deps(T0 + 500));
    p = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(p.campaign.siegePhases.M21, 2);
    assert.equal(p.campaign.phaseBossHp.M21, 0.4, "thua không hồi máu trùm");

    const win = await createBattleFor(OWNER, parseNewBattle(body("declareAdvance"))!, deps(T0 + 600));
    assert.ok(win.ok);
    await edit(store, win.id, { winner: 0, turnNumber: 23 });
    const done = await getBattle(win.id, OWNER, deps(T0 + 700));
    assert.ok(done.ok && done.outcome?.campaignV2);
    assert.equal(done.outcome.campaignV2.missionGold, 250);
    assert.equal(done.outcome.campaignV2.faction?.faction, "doCanhThac");
    const end = (await loadProfile(profiles, OWNER)).profile;
    assert.ok(end.campaign.completed.includes("M21"));
    assert.equal(end.campaign.factions.doCanhThac?.status, "defeated");
    assert.equal(end.campaign.siegePhases.M21, undefined);
    assert.equal(end.campaign.phaseBossHp.M21, undefined);
    assert.equal(end.campaign.rewardReceipts.filter((r) => r === "node:M21").length, 1);
    assert.equal(end.stones, start.stones);
    assert.equal(campaignNodeUnlocked(end.campaign, "M22"), true);
    // Tải lại trận quyết không thưởng lần hai.
    const reload = await getBattle(win.id, OWNER, deps(T0 + 800));
    assert.ok(reload.ok);
    assert.equal(reload.outcome, undefined);
  });
});
