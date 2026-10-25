import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createTrialRegistry,
  isDualTowerV1,
  parseDualTower,
  STONES_MAX,
  trialFloorId,
} from "../../src/core";
import { getBattle } from "../../src/server/battles";
import { loadProfile, MemoryProfileStore, updateProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";
import { settleTrial } from "../../src/server/trialSettle";
import { startTrialBattle } from "../../src/server/trial";

const T0 = 5_000_000;

const fixture = (floor: number, stones: number) => ({
  schema: 1,
  id: trialFloorId(floor),
  floor,
  contentVersion: 1,
  narrative: { title: `Tầng ${floor}`, intro: "Thử thách." },
  difficulty: "normal",
  rules: { bannedElements: ["kim"] },
  enemy: { foeIds: ["haVan", "maiThanh"], level: 5, power: 0.5 },
  board: { publicSeed: 1234 + floor },
  serverSalt: 99,
  turnLimit: 20,
  win: { kind: "defeatAll" },
  firstClearStones: stones,
  unlock: { requiresFloor: floor === 1 ? null : floor - 1 },
});

function setup() {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  let n = 0;
  const r = createTrialRegistry([fixture(1, 3), fixture(2, 5), fixture(3, 7)]);
  assert.ok(r.ok);
  const floors = r.ok ? r.registry : (undefined as never);
  return { store, profiles, deps: { store, profiles, now: T0, seed: 1, newId: () => `m_${++n}`, floors } };
}

const input = (floor: number) => ({
  floor,
  companions: ["haVan", "maiThanh"],
  leaderBuild: { element: "tho", profession: "muuSi" },
});

const state = async (profiles: MemoryProfileStore) => {
  const { profile } = await loadProfile(profiles, "g_1");
  assert.ok(isDualTowerV1(profile.dualTower));
  if (!isDualTowerV1(profile.dualTower)) throw new Error("schema");
  return { profile, trial: profile.dualTower.trial, ledger: profile.dualTower.stoneLedger };
};

async function play(
  s: ReturnType<typeof setup>,
  floor: number,
  winner: 0 | 1,
  turns = 7,
) {
  const a = await startTrialBattle("g_1", input(floor), s.deps);
  assert.ok(a.ok);
  if (!a.ok) throw new Error("start");
  const rec = await s.store.get(a.id);
  assert.ok(rec);
  const battle = structuredClone(rec.match.battle);
  battle.winner = winner;
  battle.turn.number = turns;
  assert.ok(
    await s.store.save({ ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 }, updatedAt: T0 }, rec.match.seq),
  );
  const res = await getBattle(a.id, "g_1", s.deps);
  assert.ok(res.ok);
  return a.id;
}

describe("tiến trình vĩnh viễn và đá lần đầu của Trial", () => {
  it("người chơi cũ chưa có kỷ lục: 0 đá, không có records", async () => {
    const s = setup();
    const { profile, trial } = await state(s.profiles);
    assert.equal(profile.stones, 0);
    assert.equal(trial.records, undefined);
  });

  it("thắng lần đầu: cộng đá một lần, ghi claimed, ledger và kỷ lục", async () => {
    const s = setup();
    await play(s, 1, 0, 9);
    const { profile, trial, ledger } = await state(s.profiles);
    assert.equal(profile.stones, 3);
    assert.equal(trial.cleared, 1);
    assert.deepEqual(trial.claimedFloors, [1]);
    assert.deepEqual(ledger, ["trial:first:1"]);
    assert.deepEqual(trial.records, [{ floor: 1, clears: 1, bestTurns: 9 }]);
  });

  it("thắng lại cùng tầng: không thêm đá, chỉ cải thiện kỷ lục (bestTurns không tăng)", async () => {
    const s = setup();
    await play(s, 1, 0, 9);
    await play(s, 1, 0, 12);
    let st = await state(s.profiles);
    assert.equal(st.profile.stones, 3);
    assert.deepEqual(st.trial.records, [{ floor: 1, clears: 2, bestTurns: 9 }]);
    await play(s, 1, 0, 5);
    st = await state(s.profiles);
    assert.equal(st.profile.stones, 3);
    assert.deepEqual(st.trial.records, [{ floor: 1, clears: 3, bestTurns: 5 }]);
    assert.deepEqual(st.ledger, ["trial:first:1"]);
  });

  it("thua: không đá, không kỷ lục, không mở tầng; sau đó thắng vẫn nhận đá", async () => {
    const s = setup();
    await play(s, 1, 1);
    let st = await state(s.profiles);
    assert.equal(st.profile.stones, 0);
    assert.equal(st.trial.cleared, 0);
    assert.deepEqual(st.trial.claimedFloors, []);
    assert.equal(st.trial.records, undefined);
    await play(s, 1, 0);
    st = await state(s.profiles);
    assert.equal(st.profile.stones, 3);
  });

  it("tuần tự đúng thứ tự mở khóa, đá theo từng tầng; chơi lại tầng cũ không nhận thêm", async () => {
    const s = setup();
    await play(s, 1, 0);
    await play(s, 2, 0);
    await play(s, 1, 0);
    const st = await state(s.profiles);
    assert.equal(st.profile.stones, 8);
    assert.equal(st.trial.cleared, 2);
    assert.deepEqual(st.trial.claimedFloors, [1, 2]);
    const locked = await startTrialBattle("g_1", input(4), s.deps);
    assert.ok(!locked.ok);
  });

  it("chốt lặp cùng một trận (getBattle nhiều lần/song song) không nhân đôi", async () => {
    const s = setup();
    const id = await play(s, 1, 0);
    await Promise.all([
      getBattle(id, "g_1", s.deps),
      getBattle(id, "g_1", s.deps),
      getBattle(id, "g_1", s.deps),
    ]);
    const st = await state(s.profiles);
    assert.equal(st.profile.stones, 3);
    assert.equal(st.trial.records?.[0]?.clears, 1);
  });

  it("hai yêu cầu chốt đồng thời cùng tầng (hai tab): chỉ một bên nhận đá", async () => {
    const s = setup();
    const a = await startTrialBattle("g_1", input(1), s.deps);
    assert.ok(a.ok);
    if (!a.ok) return;
    const rec = await s.store.get(a.id);
    assert.ok(rec);
    const battle = structuredClone(rec.match.battle);
    battle.winner = 0;
    const match = { ...rec.match, battle };
    const deps = { profiles: s.profiles, now: T0 };
    const [r1, r2] = await Promise.all([
      settleTrial("g_1", "m_x", match, deps),
      settleTrial("g_1", "m_y", match, deps),
    ]);
    assert.equal((r1?.stonesGranted ?? 0) + (r2?.stonesGranted ?? 0), 3);
    const st = await state(s.profiles);
    assert.equal(st.profile.stones, 3);
    assert.deepEqual(st.trial.claimedFloors, [1]);
    assert.equal(st.trial.records?.[0]?.clears, 2);
  });

  it("hoàn tác thưởng: ví tràn thì không đổi ví/sổ, vẫn mở tầng, quyền nhận còn nguyên", async () => {
    const s = setup();
    await updateProfile(s.profiles, "g_1", (p) => ({ ok: true as const, profile: { ...p, stones: STONES_MAX - 1 } }), T0);
    await play(s, 1, 0);
    const st = await state(s.profiles);
    assert.equal(st.profile.stones, STONES_MAX - 1);
    assert.equal(st.trial.cleared, 1);
    assert.deepEqual(st.trial.claimedFloors, []);
    assert.deepEqual(st.ledger, []);
  });

  it("không đụng vàng/EXP", async () => {
    const s = setup();
    const before = (await loadProfile(s.profiles, "g_1")).profile;
    await play(s, 1, 0);
    const { profile } = await state(s.profiles);
    assert.equal(profile.gold, before.gold);
    assert.deepEqual(profile.main, before.main);
  });

  it("lưu vĩnh viễn: roundtrip JSON giữ records, claimed, active; dữ liệu hỏng bị lọc", async () => {
    const s = setup();
    await play(s, 1, 0, 9);
    const { profile } = await state(s.profiles);
    const again = parseDualTower(JSON.parse(JSON.stringify(profile.dualTower)));
    assert.deepEqual(again, profile.dualTower);
    const dirty = parseDualTower({
      schema: 1,
      trial: {
        cleared: 2,
        records: [
          { floor: 1, clears: 2, bestTurns: 8 },
          { floor: 1, clears: 1, bestTurns: 4 },
          { floor: 99, clears: 1, bestTurns: 1 },
          { floor: 2, clears: 0, bestTurns: 3 },
          { floor: 2, clears: -1, bestTurns: "x" },
          "rác",
        ],
      },
    });
    assert.ok(isDualTowerV1(dirty));
    if (isDualTowerV1(dirty)) assert.deepEqual(dirty.trial.records, [{ floor: 1, clears: 2, bestTurns: 4 }]);
  });
});
