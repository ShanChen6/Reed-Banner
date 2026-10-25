import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD,
  CAMPAIGN_MISSION_IDS,
  STORY_NODES,
  campaignCompleted,
  campaignEventByNode,
  campaignPhaseCount,
  isCombatStoryNode,
  newProfile,
  parseProfile,
  storyNodeById,
  type CampaignMissionId,
} from "../../src/core";
import { createBattleFor, getBattle, parseNewBattle } from "../../src/server/battles";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

// CAMP-09.03: hồ sơ mới đi hết M01 → M24 qua đúng API server (sự kiện và trận), kiểm tra thứ tự, thua/đánh lại,
// tải lại hồ sơ, chốt trận hai lần và nhận thưởng hai lần. Trận được ép thắng/thua bằng cách sửa trạng thái trận
// đã lưu rồi gọi getBattle, như các test server khác.

const OWNER = "g_e2e";
const T0 = 21_000_000;
const MISSION_GOLD = STORY_NODES.reduce((a, n) => a + n.rewards.firstClearGold, 0);

async function setup() {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  assert.ok(await profiles.put(OWNER, newProfile(), 0));
  let n = 0;
  let now = T0;
  const deps = () => ({ store, profiles, now: (now += 1000), seed: 3 + n, newId: () => `m_${++n}` });
  return { store, profiles, deps };
}

type Env = Awaited<ReturnType<typeof setup>>;

const battleBody = (id: CampaignMissionId) => ({
  campaignMission: id,
  element: "moc",
  profession: "tuongSi",
  companions: ["haVan", "maiThanh"],
});

/** Ép trận đã lưu kết thúc: thắng thì phe đối thủ hết máu, thua thì phe người chơi hết máu. */
async function finish(env: Env, matchId: string, won: boolean) {
  const rec = (await env.store.get(matchId))!;
  const loser = won ? 1 : 0;
  const sides = rec.match.battle.sides.map((s, i) =>
    i === loser ? { ...s, fighters: s.fighters.map((f) => ({ ...f, hp: 0 })) } : s,
  ) as unknown as typeof rec.match.battle.sides;
  const battle = { ...rec.match.battle, sides, winner: (won ? 0 : 1) as 0 | 1 };
  assert.ok(await env.store.save({ ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } }, rec.match.seq));
  return getBattle(matchId, OWNER, env.deps());
}

async function playPhase(env: Env, id: CampaignMissionId, won: boolean) {
  const created = await createBattleFor(OWNER, parseNewBattle(battleBody(id))!, env.deps());
  assert.ok(created.ok, `${id}: không tạo được trận`);
  const done = await finish(env, created.id, won);
  assert.ok(done.ok, id);
  return { id: created.id, done };
}

async function event(env: Env, id: CampaignMissionId, eventId = `evt_${id}`, choice?: string) {
  return completeCampaignEvent(
    env.profiles,
    OWNER,
    { eventId, nodeId: id, choice: choice ?? campaignEventByNode(id)?.choices[0]?.id ?? "none" },
    env.deps().now,
  );
}

describe("E2E Campaign V2: hồ sơ mới đi hết 24 nhiệm vụ", () => {
  it("đi theo thứ tự, chặn sai thứ tự, thua thì đánh lại, không nhận hai lần, tải lại không mất tiến độ", async () => {
    const env = await setup();
    let firstClearGold = 0;

    // Sai thứ tự: chưa qua M01 thì không mở sự kiện hay trận phía sau.
    assert.deepEqual(await event(env, "M02"), { ok: false, error: "locked" });
    const early = await createBattleFor(OWNER, parseNewBattle(battleBody("M03"))!, env.deps());
    assert.deepEqual(early, { ok: false, error: "badRequest" });
    // Nhiệm vụ không có trận không tạo trận; nhiệm vụ có trận không đi đường sự kiện.
    assert.equal(parseNewBattle(battleBody("M01")), null);
    assert.equal(parseNewBattle(battleBody("M24")), null);

    for (const id of CAMPAIGN_MISSION_IDS) {
      const node = storyNodeById(id)!;
      const before = (await loadProfile(env.profiles, OWNER)).profile;
      if (!isCombatStoryNode(node)) {
        const r = await event(env, id);
        assert.ok(r.ok, `${id}: ${r.ok ? "" : r.error}`);
        assert.equal(r.outcome.firstClear, true, id);
        firstClearGold += r.outcome.rewardGold;
        // Bấm hai lần (cùng eventId) và gửi lại sau khi xong: không cộng thêm vàng.
        const twice = await event(env, id);
        assert.ok(twice.ok, id);
        assert.equal(twice.outcome.rewardGold, 0, id);
        const retry = await event(env, id, `evt_${id}_again`);
        assert.ok(retry.ok && retry.outcome.firstClear === false && retry.outcome.rewardGold === 0, id);
        assert.deepEqual(await event(env, id, `evt_${id}_other`, campaignEventByNode(id)!.choices.at(-1)!.id),
          campaignEventByNode(id)!.choices.length > 1 ? { ok: false, error: "invalidChoice" } : retry, id);
        assert.equal((await loadProfile(env.profiles, OWNER)).profile.gold, r.profile.gold, id);
        continue;
      }
      assert.deepEqual(await event(env, id), { ok: false, error: "notEvent" }, id);
      // Thua một lần ở phase đầu: không hoàn thành, không thưởng lần đầu, không tiến phase.
      const lost = await playPhase(env, id, false);
      assert.ok(lost.done.ok);
      assert.equal(lost.done.outcome?.campaignV2, undefined, id);
      const afterLoss = (await loadProfile(env.profiles, OWNER)).profile;
      assert.ok(!afterLoss.campaign.completed.includes(id), id);
      assert.equal(afterLoss.campaign.siegePhases[id] ?? 0, 0, id);
      // Thắng lần lượt từng phase; phase cuối mới hoàn thành nhiệm vụ.
      const phases = campaignPhaseCount(id);
      let last: Awaited<ReturnType<typeof playPhase>> | undefined;
      for (let p = 0; p < phases; p++) {
        last = await playPhase(env, id, true);
        assert.ok(last.done.ok);
        const mid = (await loadProfile(env.profiles, OWNER)).profile;
        if (p < phases - 1) {
          assert.equal(last.done.outcome?.campaignV2, undefined, `${id}#${p}`);
          assert.equal(mid.campaign.siegePhases[id], p + 1, `${id}#${p}`);
          assert.ok(!mid.campaign.completed.includes(id));
        }
      }
      assert.ok(last!.done.ok);
      const reward = last!.done.outcome!.campaignV2!;
      assert.equal(reward.firstClear, true, id);
      assert.equal(reward.missionGold, node.rewards.firstClearGold, id);
      firstClearGold += reward.totalGold;
      // Chốt lại cùng trận (tải lại trang): không cộng thêm gì.
      const settled = (await loadProfile(env.profiles, OWNER)).profile;
      const again = await getBattle(last!.id, OWNER, env.deps());
      assert.ok(again.ok);
      assert.deepEqual((await loadProfile(env.profiles, OWNER)).profile, settled, id);
      // Đánh lại nhiệm vụ đã qua: chỉ thưởng trận thường, không thưởng lần đầu.
      if (phases === 1) {
        const replay = await playPhase(env, id, true);
        assert.ok(replay.done.ok);
        assert.equal(replay.done.outcome?.campaignV2?.firstClear ?? false, false, id);
        assert.equal(replay.done.outcome?.campaignV2?.totalGold ?? 0, 0, id);
        const after = (await loadProfile(env.profiles, OWNER)).profile;
        assert.deepEqual(after.campaign.completed, settled.campaign.completed, id);
      }
      assert.ok(before.gold <= (await loadProfile(env.profiles, OWNER)).profile.gold, id);
    }

    const final = await loadProfile(env.profiles, OWNER);
    assert.ok(campaignCompleted(final.profile.campaign));
    assert.deepEqual([...final.profile.campaign.completed].sort(), [...CAMPAIGN_MISSION_IDS].sort());
    // Tổng thưởng lần đầu đúng một lần: vàng nhiệm vụ + vàng 6 chương.
    assert.equal(firstClearGold, MISSION_GOLD + 6 * CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD);
    // Đủ 6 tướng lịch sử (mỗi id một bản ghi trong hồ sơ).
    for (const hero of ["nguyenBac", "dinhDien", "luuCo", "trinhTu", "leHoan", "dinhLien"])
      assert.ok(final.profile.companions[hero], hero);
    // Tải lại hồ sơ (JSON qua kho) giữ nguyên tiến độ.
    const reloaded = parseProfile(JSON.parse(JSON.stringify(final.profile)));
    assert.deepEqual(reloaded.campaign, final.profile.campaign);
    // Không phát đá: chiến dịch không đổi số đá của hồ sơ mới.
    assert.equal(final.profile.stones, newProfile().stones);
  });
});
