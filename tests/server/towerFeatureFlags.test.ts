import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { ELEMENTS, MAIN_ID, PROFESSIONS, STARTER_COMPANIONS, isDualTowerV1, validateLineup, type DestinyRun, type FloorRules } from "../../src/core";
import { POST as trialPost } from "../../src/app/api/trial/battles/route";
import { POST as destinyPost } from "../../src/app/api/destiny/run/route";
import { FEATURE_DISABLED_ERROR, towerFeatureFlags } from "../../src/server/featureFlags";
import { actBattle, createBattleFor, getBattle, settleAbandoned } from "../../src/server/battles";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import { MemoryMatchStore, accountStore } from "../../src/server/store";
import { signGuest } from "../../src/server/guest";
import { startTrialRequest, trialRegistry } from "../../src/server/trialApi";
import { startDestinyBattle, startDestinyRun } from "../../src/server/destiny";
import { resolveDestinyFloor } from "../../src/server/destinyContent";

const SECRET = "tower-feature-flags-test-secret";
const trialBody = {
  floor: 1,
  companions: ["leThach", "maiThanh"],
  leaderBuild: { element: "tho", profession: "muuSi" },
};
const destinyBody = { rosterIds: [MAIN_ID, ...STARTER_COMPANIONS.slice(0, 2).map(({ id }) => id)] };

const request = (url: string, body: unknown, cookie?: string) => new NextRequest(url, {
  method: "POST",
  headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
  body: JSON.stringify(body),
});

function destinyLineup(run: DestinyRun, rules: FloorRules) {
  const companions = run.roster.slice(1);
  for (let i = 0; i < companions.length; i++) for (let j = i + 1; j < companions.length; j++) {
    const a = companions[i]!;
    const b = companions[j]!;
    for (const element of ELEMENTS) for (const profession of PROFESSIONS) {
      const members = [
        { id: MAIN_ID, element, profession },
        run.fighters![a]!.config,
        run.fighters![b]!.config,
      ];
      if (validateLineup(rules, members).ok)
        return { activeIds: [MAIN_ID, a, b], leaderBuild: { element, profession } };
    }
  }
  throw new Error("missing legal Destiny lineup");
}

describe("Song Tháp feature flags", { concurrency: false }, () => {
  it("parse fail-closed: chỉ exact true bật flag", () => {
    assert.deepEqual(towerFeatureFlags({}), { trial: false, destiny: false });
    assert.deepEqual(towerFeatureFlags({ TRIAL_ENABLED: "true" }), { trial: true, destiny: false });
    assert.deepEqual(towerFeatureFlags({ DESTINY_ENABLED: "true" }), { trial: false, destiny: true });
    assert.deepEqual(towerFeatureFlags({ TRIAL_ENABLED: "true", DESTINY_ENABLED: "true" }), { trial: true, destiny: true });
    assert.deepEqual(towerFeatureFlags({ TRIAL_ENABLED: "TRUE", DESTINY_ENABLED: "1" }), { trial: false, destiny: false });
  });

  it("API trực tiếp giữ độc lập ở cả 4 tổ hợp và disabled không tạo cookie/state", async () => {
    const old = { trial: process.env.TRIAL_ENABLED, destiny: process.env.DESTINY_ENABLED, secret: process.env.SESSION_SECRET };
    process.env.SESSION_SECRET = SECRET;
    try {
      for (const [trial, destiny] of [[false, false], [true, false], [false, true], [true, true]] as const) {
        process.env.TRIAL_ENABLED = String(trial);
        process.env.DESTINY_ENABLED = String(destiny);
        const trialResponse = await trialPost(request("http://localhost/api/trial/battles", trialBody));
        const trialJson = await trialResponse.json();
        assert.equal(trialResponse.status, trial ? 200 : 503);
        assert.equal(trialJson.error, trial ? undefined : FEATURE_DISABLED_ERROR);
        if (!trial) assert.equal(trialResponse.headers.get("set-cookie"), null);

        // Thiên Mệnh có bảng xếp hạng và thưởng nên cần tài khoản đã đăng nhập; khách bị 401 khi cờ bật.
        if (destiny) {
          const guest = await destinyPost(request("http://localhost/api/destiny/run", destinyBody));
          assert.equal(guest.status, 401);
          assert.equal(guest.headers.get("set-cookie"), null);
        }
        const accountId = `g_flag_destiny_${trial}_${destiny}`;
        await accountStore().link(accountId, { provider: "github", subject: accountId, name: "Người Thử", avatarUrl: null }, Date.now());
        const destinyResponse = await destinyPost(
          request("http://localhost/api/destiny/run", destinyBody, destiny ? `colau_guest=${signGuest(accountId)}` : undefined),
        );
        const destinyJson = await destinyResponse.json();
        assert.equal(destinyResponse.status, destiny ? 200 : 503);
        assert.equal(destinyJson.error, destiny ? undefined : FEATURE_DISABLED_ERROR);
        if (!destiny) assert.equal(destinyResponse.headers.get("set-cookie"), null);
      }
    } finally {
      if (old.trial === undefined) delete process.env.TRIAL_ENABLED; else process.env.TRIAL_ENABLED = old.trial;
      if (old.destiny === undefined) delete process.env.DESTINY_ENABLED; else process.env.DESTINY_ENABLED = old.destiny;
      if (old.secret === undefined) delete process.env.SESSION_SECRET; else process.env.SESSION_SECRET = old.secret;
    }
  });

  it("freeze trận Trial đã xong: không claim/wallet khi OFF, bật lại settle đúng một lần", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: Date.UTC(2026, 9, 24), seed: 7, newId: () => "flag_trial", floors: trialRegistry(), trialEnabled: true };
    const started = await startTrialRequest("flag-owner", trialBody, deps);
    assert.equal(started.status, 200);
    const record = await store.get("flag_trial");
    assert.ok(record);
    if (!record) return;
    const battle = structuredClone(record.match.battle);
    battle.winner = 0;
    battle.turn.deadline = null;
    assert.equal(await store.save({ ...record, match: { ...record.match, battle, seq: 1 }, updatedAt: deps.now }, 0), true);

    const before = await loadProfile(profiles, "flag-owner");
    assert.equal(await settleAbandoned(["flag_trial"], { ...deps, trialEnabled: false }), 0);
    assert.deepEqual(
      await actBattle("flag_trial", "flag-owner", { seq: 1, action: { type: "timeout" } }, { ...deps, trialEnabled: false }),
      { ok: false, error: FEATURE_DISABLED_ERROR },
    );
    const frozen = await getBattle("flag_trial", "flag-owner", { ...deps, trialEnabled: false });
    assert.deepEqual(frozen, { ok: false, error: FEATURE_DISABLED_ERROR });
    const afterFrozen = await loadProfile(profiles, "flag-owner");
    assert.equal(afterFrozen.profile.stones, before.profile.stones);
    assert.ok(isDualTowerV1(afterFrozen.profile.dualTower));
    if (isDualTowerV1(afterFrozen.profile.dualTower)) assert.equal(afterFrozen.profile.dualTower.trial.cleared, 0);

    const settled = await getBattle("flag_trial", "flag-owner", { ...deps, trialEnabled: true });
    assert.ok(settled.ok && settled.outcome?.trial?.stonesGranted);
    const replay = await getBattle("flag_trial", "flag-owner", { ...deps, trialEnabled: true });
    assert.ok(replay.ok && !replay.outcome);
    const final = await loadProfile(profiles, "flag-owner");
    assert.ok(final.profile.stones > before.profile.stones);
  });

  it("freeze settlement Destiny độc lập với Trial rồi resume không nhân thưởng", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const now = Date.UTC(2026, 9, 19, 2);
    let id = 0;
    const deps = { store, profiles, now, seed: 9, newId: () => `flag_destiny_${++id}`, destinySecret: SECRET, trialEnabled: false, destinyEnabled: true };
    const owner = "destiny-flag-owner";
    const initial = await loadProfile(profiles, owner);
    const roster = [MAIN_ID, ...Object.keys(initial.profile.companions).slice(0, 3)];
    const started = await startDestinyRun(owner, { rosterIds: roster }, deps);
    assert.ok(started.ok);
    if (!started.ok) return;
    const floor = resolveDestinyFloor(started.run, SECRET);
    assert.ok(floor.ok);
    if (!floor.ok) return;
    const opened = await startDestinyBattle(owner, destinyLineup(started.run, floor.floor.rules), deps);
    assert.ok(opened.ok);
    if (!opened.ok) return;
    const record = await store.get(opened.id);
    assert.ok(record);
    if (!record) return;
    const battle = structuredClone(record.match.battle);
    battle.winner = 0;
    battle.turn.deadline = null;
    assert.equal(await store.save({ ...record, match: { ...record.match, battle, seq: record.match.seq + 1 }, updatedAt: now }, record.match.seq), true);

    const before = await loadProfile(profiles, owner);
    assert.deepEqual(await getBattle(opened.id, owner, { ...deps, destinyEnabled: false }), { ok: false, error: FEATURE_DISABLED_ERROR });
    const frozen = await loadProfile(profiles, owner);
    assert.equal(frozen.version, before.version);
    assert.equal(frozen.profile.stones, before.profile.stones);

    const settled = await getBattle(opened.id, owner, deps);
    assert.ok(settled.ok && settled.outcome?.destiny);
    const replay = await getBattle(opened.id, owner, deps);
    assert.ok(replay.ok && !replay.outcome);
  });

  it("OFF/OFF không chặn battle legacy/normal", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: 10_000, seed: 3, newId: () => "normal_flag_off", trialEnabled: false, destinyEnabled: false };
    const created = await createBattleFor("normal-owner", {
      mode: "3v3", element: "moc", profession: "tuongSi",
      companions: ["haVan", "maiThanh"], difficulty: "easy",
    }, deps);
    assert.ok(created.ok);
    assert.ok((await getBattle("normal_flag_off", "normal-owner", deps)).ok);
  });
});
