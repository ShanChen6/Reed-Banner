import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ELEMENTS,
  MAIN_ID,
  PROFESSIONS,
  isDualTowerV1,
  validateLineup,
  type DestinyLeaderBuild,
  type DestinyRun,
  type FloorRules,
} from "../../src/core";
import {
  claimDestinyReward,
  destinyOverview,
  startDestinyBattle,
  startDestinyRun,
  stopDestinyRun,
  type DestinyDeps,
} from "../../src/server/destiny";
import { resolveDestinyFloor } from "../../src/server/destinyContent";
import { getBattle } from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const NOW = Date.UTC(2026, 9, 19, 2);
const SECRET = "destiny-server-secret-for-tests";

function setup(): DestinyDeps {
  let id = 0;
  return {
    store: new MemoryMatchStore(),
    profiles: new MemoryProfileStore(),
    now: NOW,
    seed: 123,
    newId: () => `destiny_${++id}`,
    destinySecret: SECRET,
  };
}

async function currentRun(deps: DestinyDeps, owner = "u1"): Promise<DestinyRun> {
  const profile = (await loadProfile(deps.profiles, owner)).profile;
  assert.ok(isDualTowerV1(profile.dualTower));
  if (!isDualTowerV1(profile.dualTower) || !profile.dualTower.destiny.run)
    throw new Error("missing Destiny run");
  return profile.dualTower.destiny.run;
}

function legalLineup(run: DestinyRun, rules: FloorRules, rotate = 0) {
  const companions = run.roster.slice(1).filter((id) => (run.fighters?.[id]?.hp ?? 0) > 0);
  const pairs: [string, string][] = [];
  for (let i = 0; i < companions.length; i++)
    for (let j = i + 1; j < companions.length; j++) pairs.push([companions[i]!, companions[j]!]);
  const shifted = [...pairs.slice(rotate % Math.max(1, pairs.length)), ...pairs.slice(0, rotate % Math.max(1, pairs.length))];
  for (const [a, b] of shifted) {
    for (const element of ELEMENTS) {
      for (const profession of PROFESSIONS) {
        const leaderBuild: DestinyLeaderBuild = { element, profession };
        const members = [
          { id: MAIN_ID, element, profession },
          run.fighters![a]!.config,
          run.fighters![b]!.config,
        ];
        if (validateLineup(rules, members).ok)
          return { activeIds: [MAIN_ID, a, b], leaderBuild };
      }
    }
  }
  throw new Error("fixture không tìm được lineup hợp luật");
}

async function finishMatch(deps: DestinyDeps, id: string, winner: 0 | 1) {
  const record = await deps.store.get(id);
  assert.ok(record);
  if (!record) throw new Error("missing match");
  const battle = structuredClone(record.match.battle);
  battle.winner = winner;
  battle.turn.deadline = null;
  if (winner === 1) battle.sides[0].fighters.forEach((fighter) => { fighter.hp = 0; });
  const match = { ...record.match, battle, seq: record.match.seq + 1 };
  assert.equal(await deps.store.save({ ...record, match, updatedAt: deps.now }, record.match.seq), true);
}

describe("Destiny server lifecycle", () => {
  it("start/resume, 9 lần win+reward, rotate, boss tầng 10 rồi lose; settlement/reward không lặp", async () => {
    const deps = setup();
    const initial = await loadProfile(deps.profiles, "u1");
    const roster = [MAIN_ID, ...Object.keys(initial.profile.companions).slice(0, 5)];
    const legacyTower = structuredClone(initial.profile.tower);
    const started = await startDestinyRun("u1", { rosterIds: roster }, deps);
    assert.ok(started.ok);
    assert.deepEqual((await destinyOverview("u1", deps)).progress?.run?.roster, roster);

    for (let floor = 1; floor <= 10; floor++) {
      const run = await currentRun(deps);
      assert.equal(run.floor, floor);
      assert.equal(run.phase, "prepare");
      const content = resolveDestinyFloor(run, SECRET);
      assert.ok(content.ok);
      if (!content.ok) return;
      const input = legalLineup(run, content.floor.rules, floor);
      const opened = await startDestinyBattle("u1", input, deps);
      assert.ok(opened.ok);
      if (!opened.ok) return;
      assert.equal(opened.view.destiny?.floor, floor);
      if (floor === 5) {
        const resumed = await startDestinyBattle("u1", input, deps);
        assert.ok(resumed.ok && resumed.resumed);
        if (resumed.ok) assert.equal(resumed.id, opened.id);
      }
      if (floor === 10) assert.equal(opened.view.difficulty, "boss");
      await finishMatch(deps, opened.id, floor === 10 ? 1 : 0);

      const [a, b] = await Promise.all([
        getBattle(opened.id, "u1", deps),
        getBattle(opened.id, "u1", deps),
      ]);
      assert.ok(a.ok && b.ok);
      assert.equal([a, b].filter((r) => r.ok && r.outcome?.destiny).length, 1,
        "claimReward chỉ cho một settlement có outcome");

      const afterBattle = await currentRun(deps);
      assert.equal(afterBattle.settledFloor, floor);
      assert.equal(afterBattle.matchId, undefined);
      if (floor === 10) {
        assert.equal(afterBattle.phase, "done");
        assert.equal(afterBattle.active, false);
        break;
      }
      assert.equal(afterBattle.phase, "reward");
      assert.equal(afterBattle.offer?.length, 3);
      assert.deepEqual(generateKinds(afterBattle.offer!), generateKinds((await currentRun(deps)).offer!),
        "reload giữ nguyên offer authoritative");
      assert.ok(!afterBattle.offer?.some(({ kind }) => kind === "rescue"),
        "không offer Cứu viện khi không có fighter gục");

      const rewardBody = { floor, index: 0, targetIds: [MAIN_ID] };
      const [r1, r2] = await Promise.all([
        claimDestinyReward("u1", rewardBody, deps),
        claimDestinyReward("u1", rewardBody, deps),
      ]);
      assert.ok(r1.ok && r2.ok);
      assert.equal([r1, r2].filter((r) => r.ok && r.changed).length, 1,
        "hai tab chỉ áp reward một lần");
      assert.deepEqual(await claimDestinyReward("u1", { floor: floor - 1, index: 0 }, deps),
        { ok: false, error: "stale_reward" });
    }

    const finalProfile = (await loadProfile(deps.profiles, "u1")).profile;
    assert.ok(isDualTowerV1(finalProfile.dualTower));
    if (isDualTowerV1(finalProfile.dualTower)) assert.equal(finalProfile.dualTower.destiny.cycleBest, 9);
    assert.deepEqual(finalProfile.tower, legacyTower, "Destiny không sửa Tower legacy");
  });

  it("stop idempotent ở prepare và battle", async () => {
    const deps = setup();
    const profile = (await loadProfile(deps.profiles, "u2")).profile;
    const roster = [MAIN_ID, ...Object.keys(profile.companions).slice(0, 4)];
    assert.ok((await startDestinyRun("u2", { rosterIds: roster }, deps)).ok);
    assert.deepEqual(await stopDestinyRun("u2", deps), { ok: true, stopped: true });
    assert.deepEqual(await stopDestinyRun("u2", deps), { ok: true, stopped: false });

    const deps2 = setup();
    assert.ok((await startDestinyRun("u3", { rosterIds: roster }, deps2)).ok);
    const run = await currentRun(deps2, "u3");
    const content = resolveDestinyFloor(run, SECRET);
    assert.ok(content.ok);
    if (!content.ok) return;
    const opened = await startDestinyBattle("u3", legalLineup(run, content.floor.rules), deps2);
    assert.ok(opened.ok);
    assert.deepEqual(await stopDestinyRun("u3", deps2), { ok: true, stopped: true });
    assert.equal((await currentRun(deps2, "u3")).phase, "done");
  });
});

function generateKinds(offer: readonly { readonly kind: string }[]) {
  return offer.map(({ kind }) => kind);
}
