import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXPEDITION_RUNS_PER_DAY, EXPEDITION_TIER_INFO, STARTER_COMPANIONS } from "../../src/core";
import type { Deps } from "../../src/server/battles";
import { getBattle } from "../../src/server/battles";
import {
  abandonExpeditionRun,
  campExpeditionArmies,
  expeditionOverview,
  marchExpeditionArmy,
  scoutExpeditionArmy,
  startExpedition,
} from "../../src/server/expedition";
import { MemoryLeaderboardStore } from "../../src/server/leaderboard";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const IDS = STARTER_COMPANIONS.map((c) => c.id);
const START = { map: "aiBac", tier: 1, main: IDS.slice(0, 2), second: IDS.slice(2, 5) };

function setup(enabled = true): Deps {
  let id = 0;
  return {
    store: new MemoryMatchStore(),
    profiles: new MemoryProfileStore(),
    leaderboard: new MemoryLeaderboardStore(),
    now: Date.UTC(2026, 10, 4, 3),
    seed: 99,
    newId: () => `e_${++id}`,
    expeditionEnabled: enabled,
  };
}

async function finishMatch(deps: Deps, id: string, winner: 0 | 1) {
  const record = await deps.store.get(id);
  if (!record) throw new Error("missing match");
  const battle = structuredClone(record.match.battle);
  battle.winner = winner;
  battle.turn.deadline = null;
  battle.sides[winner === 0 ? 1 : 0].fighters.forEach((f) => { f.hp = 0; });
  const match = { ...record.match, battle, seq: record.match.seq + 1 };
  assert.equal(await deps.store.save({ ...record, match, updatedAt: deps.now }, record.match.seq), true);
}

const run = async (deps: Deps, owner: string) => (await loadProfile(deps.profiles, owner)).profile.expedition?.run;

describe("Viễn Chinh trên server", () => {
  it("cờ tắt thì mọi thao tác báo featureDisabled", async () => {
    const deps = setup(false);
    assert.deepEqual(await startExpedition("u", START, deps), { ok: false, error: "featureDisabled" });
    assert.equal((await expeditionOverview("u", deps)).enabled, false);
  });

  it("khách chưa đăng nhập vẫn xuất quân được (chế độ offline)", async () => {
    const deps = { ...setup(), isSignedIn: async () => false };
    assert.equal((await startExpedition("guest", START, deps)).ok, true);
    const moved = await marchExpeditionArmy("guest", { army: 1, to: "ban-na" }, deps);
    assert.ok(moved.ok);
  });

  it("xuất quân, vào làng, đánh đồn, thắng thì chiếm ô và nhận thưởng trận", async () => {
    const deps = setup();
    assert.equal((await startExpedition("u", START, deps)).ok, true);
    assert.deepEqual(await startExpedition("u", START, deps), { ok: false, error: "runActive" });
    const overview = await expeditionOverview("u", deps);
    assert.ok(overview.enabled && overview.run && !("seed" in overview.run));
    assert.ok(overview.enabled && overview.encounters["khe-da"]);
    // Sương mù: ô xa chưa thấy thì không báo trước địch.
    assert.ok(overview.enabled && !overview.encounters["gac-bac"] && !overview.visible.includes("gac-bac"));

    const moved = await marchExpeditionArmy("u", { army: 1, to: "ban-na" }, deps);
    assert.ok(moved.ok && moved.kind === "moved");
    assert.equal((await run(deps, "u"))?.day, 2);

    const opened = await marchExpeditionArmy("u", { army: 0, to: "khe-da" }, deps);
    assert.ok(opened.ok && opened.kind === "battle");
    if (!opened.ok || opened.kind !== "battle") return;
    assert.equal(opened.view.expedition?.node, "khe-da");
    // Gọi lại khi đang có trận thì trả về đúng trận đó.
    const again = await marchExpeditionArmy("u", { army: 1, to: "kho-ngua" }, deps);
    assert.ok(again.ok && again.kind === "battle" && again.id === opened.id && again.resumed);

    const goldBefore = (await loadProfile(deps.profiles, "u")).profile.gold;
    await finishMatch(deps, opened.id, 0);
    const done = await getBattle(opened.id, "u", deps);
    assert.ok(done.ok && done.outcome?.expedition?.won);
    const after = await run(deps, "u");
    assert.equal(after?.phase, "march");
    assert.equal(after?.armies[0].at, "khe-da");
    assert.equal(after?.nodes["khe-da"]?.cleared, true);
    assert.equal(after?.day, 3);
    assert.ok((await loadProfile(deps.profiles, "u")).profile.gold >= goldBefore);
    // Mở lại trận đã chốt không chốt lần hai.
    await getBattle(opened.id, "u", deps);
    assert.equal((await run(deps, "u"))?.day, 3);
  });

  it("chiếm thành đích: thưởng lần đầu, mở bậc kế; rút quân giữa trận tính thua rồi kết thúc", async () => {
    const deps = setup();
    await startExpedition("u", START, deps);
    // Dời hai đạo tới hai cổng thành để thử nhanh.
    const stored = await loadProfile(deps.profiles, "u");
    const r = stored.profile.expedition!.run!;
    await deps.profiles.put("u", {
      ...stored.profile,
      expedition: { ...stored.profile.expedition!, run: { ...r, armies: [{ ...r.armies[0], at: "gac-bac" }, { ...r.armies[1], at: "gac-nam" }] } },
    }, stored.version, deps.now);
    const gold = stored.profile.gold;
    const opened = await marchExpeditionArmy("u", { army: 0, to: "thanh-ai-bac" }, deps);
    assert.ok(opened.ok && opened.kind === "battle");
    if (!opened.ok || opened.kind !== "battle") return;
    await finishMatch(deps, opened.id, 0);
    const done = await getBattle(opened.id, "u", deps);
    assert.ok(done.ok);
    if (!done.ok) return;
    assert.equal(done.outcome?.expedition?.phase, "won");
    assert.equal(done.outcome?.expedition?.end?.firstClear, true);
    const profile = (await loadProfile(deps.profiles, "u")).profile;
    assert.equal(profile.expedition?.cleared.aiBac, 1);
    assert.ok(profile.gold >= gold + EXPEDITION_TIER_INFO[1].firstGold);
    const overview = await expeditionOverview("u", deps);
    assert.ok(overview.enabled && overview.maps.find((m) => m.id === "aiBac")!.tiers[1]!.unlocked);

    // Lượt mới, đang đánh thì rút quân.
    assert.equal((await startExpedition("u", { ...START, tier: 2 }, deps)).ok, true);
    const fight = await marchExpeditionArmy("u", { army: 0, to: "khe-da" }, deps);
    assert.ok(fight.ok && fight.kind === "battle");
    assert.deepEqual(await abandonExpeditionRun("u", deps), { ok: true, stopped: true });
    const ended = await run(deps, "u");
    assert.equal(ended?.phase, "lost");
    assert.equal(ended?.endReason, "abandoned");
    assert.equal(ended?.defeats, 1);
    assert.deepEqual(await campExpeditionArmies("u", deps), { ok: false, error: "notMarching" });
  });

  it("hết lượt xuất quân trong ngày thì báo dailyLimit, sang ngày mới thì đi được", async () => {
    const deps = setup();
    for (let i = 0; i < EXPEDITION_RUNS_PER_DAY; i++) {
      assert.equal((await startExpedition("u", START, deps)).ok, true);
      assert.deepEqual(await abandonExpeditionRun("u", deps), { ok: true, stopped: true });
    }
    const overview = await expeditionOverview("u", deps);
    assert.ok(overview.enabled && overview.runsLeft === 0);
    assert.deepEqual(await startExpedition("u", START, deps), { ok: false, error: "dailyLimit" });
    const tomorrow = { ...deps, now: deps.now + 24 * 3600 * 1000 };
    assert.equal((await startExpedition("u", START, tomorrow)).ok, true);
  });

  it("Cửa Biển: không gửi đường bị phá chưa lộ, trinh sát được, trận giữ cầu ghi mục tiêu vào trận", async () => {
    const deps = setup();
    assert.equal((await startExpedition("c", { ...START, map: "cuaBien" }, deps)).ok, true);
    const overview = await expeditionOverview("c", deps);
    assert.ok(overview.enabled && overview.run);
    if (!overview.enabled || !overview.run) return;
    assert.ok(!("broken" in overview.run));
    assert.ok(overview.scenario && overview.scenario.tideDays === null);
    assert.equal((await run(deps, "c"))?.broken?.length, 2);

    const scouted = await scoutExpeditionArmy("c", { army: 0 }, deps);
    assert.ok(scouted.ok);
    assert.equal((await run(deps, "c"))?.day, 2);
    // Sa bàn không kịch bản thì không trinh sát.
    assert.equal((await scoutExpeditionArmy("c", { army: 2 }, deps)).ok, false);

    // Đưa Biệt đạo tới Bãi Sú (đường bộ từ trại không bao giờ bị phá) rồi đánh Cầu Phao.
    const first = await marchExpeditionArmy("c", { army: 1, to: "bai-su" }, deps);
    assert.ok(first.ok && first.kind === "battle");
    if (!first.ok || first.kind !== "battle") return;
    await finishMatch(deps, first.id, 0);
    await getBattle(first.id, "c", deps);
    const stored = await run(deps, "c");
    const blocked = stored?.broken?.includes("bai-su~doi-cat");
    const known = stored?.knownBroken?.includes("bai-su~doi-cat");
    const bridge = await marchExpeditionArmy("c", { army: 1, to: "doi-cat" }, deps);
    if (known) {
      assert.deepEqual(bridge, { ok: false, error: "roadBroken" });
      return;
    }
    assert.ok(bridge.ok);
    if (!bridge.ok) return;
    if (blocked) assert.equal(bridge.kind, "blocked");
    else {
      assert.equal(bridge.kind, "battle");
      if (bridge.kind !== "battle") return;
      assert.deepEqual(bridge.view.expedition?.objective, { type: "hold", turns: 5 });
    }
  });
});
