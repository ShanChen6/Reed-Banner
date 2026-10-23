import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTrialRegistry, trialFloorId } from "../../src/core";
import { getBattle } from "../../src/server/battles";
import { loadProfile, MemoryProfileStore, updateProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";
import {
  abandonTrialRequest,
  startTrialRequest,
  trialOverview,
  trialRegistry,
} from "../../src/server/trialApi";

const T0 = 5_000_000;

const fixture = (floor: number, over: Record<string, unknown> = {}) => ({
  schema: 1,
  id: trialFloorId(floor),
  floor,
  contentVersion: 1,
  narrative: { title: `Tầng ${floor}`, intro: "Thử thách." },
  difficulty: "normal",
  rules: { bannedElements: ["kim"] },
  enemy: { foeIds: ["haVan", "maiThanh"], level: 5, power: 0.5 },
  board: { publicSeed: 1234 + floor },
  serverSalt: 424242,
  turnLimit: 20,
  win: { kind: "defeatAll" },
  firstClearStones: 3,
  unlock: { requiresFloor: floor === 1 ? null : floor - 1 },
  ...over,
});

function setup() {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  let n = 0;
  const r = createTrialRegistry([fixture(1), fixture(2), fixture(3)]);
  assert.ok(r.ok);
  const floors = r.ok ? r.registry : (undefined as never);
  return { store, profiles, floors, deps: { store, profiles, now: T0, seed: 1, newId: () => `m_${++n}`, floors } };
}

const body = (floor: number, over: Record<string, unknown> = {}) => ({
  floor,
  companions: ["haVan", "maiThanh"],
  leaderBuild: { element: "tho", profession: "muuSi" },
  ...over,
});

describe("API Tháp Thí Luyện", () => {
  it("registry phát hành đủ 20 tầng thật", async () => {
    assert.equal(trialRegistry().size, 20);
    const o = await trialOverview(new MemoryProfileStore(), null, trialRegistry());
    assert.equal(o.available, true);
    assert.equal(o.floors.length, 20);
    assert.equal(o.floors[0]?.state, "open");
    assert.ok(o.floors.slice(1).every((floor) => floor.state === "locked"));
    assert.equal(o.stones, 0);
  });

  it("tổng quan: khách mới → tầng 1 mở, còn lại khóa; không lộ dữ liệu server-only", async () => {
    const s = setup();
    const o = await trialOverview(s.profiles, "g_1", s.floors);
    assert.deepEqual(o.floors.map((f) => f.state), ["open", "locked", "locked"]);
    assert.equal(o.cleared, 0);
    assert.equal(o.supported, true);
    const json = JSON.stringify(o);
    assert.ok(!json.includes("serverSalt") && !json.includes("424242"));
    assert.equal(o.floors[0]!.floor.firstClearStones, 3);
  });

  it("khách chưa có cookie vẫn xem được danh sách (không cần hồ sơ)", async () => {
    const s = setup();
    const o = await trialOverview(s.profiles, null, s.floors);
    assert.equal(o.floors.length, 3);
    assert.deepEqual(o.floors.map((f) => f.state), ["open", "locked", "locked"]);
  });

  it("mở trận: 200, trả id/view có trial; gọi lặp trả resumed; tầng khóa 403", async () => {
    const s = setup();
    const a = await startTrialRequest("g_1", body(1), s.deps);
    assert.equal(a.status, 200);
    assert.equal(a.body.resumed, false);
    assert.deepEqual((a.body.view as { trial: unknown }).trial, { floor: 1, turnLimit: 20 });
    const b = await startTrialRequest("g_1", body(1), s.deps);
    assert.equal(b.status, 200);
    assert.equal(b.body.resumed, true);
    assert.equal(b.body.id, a.body.id);
    const c = await startTrialRequest("g_1", body(2), s.deps);
    assert.equal(c.status, 409);
    assert.equal(c.body.error, "active_elsewhere");
    const o = await trialOverview(s.profiles, "g_1", s.floors);
    assert.deepEqual(o.active, { matchId: a.body.id, floor: 1 });
  });

  it("mã lỗi: 400 body hỏng, 404 tầng lạ, 403 khóa, 422 sai luật (kèm chi tiết)", async () => {
    const s = setup();
    assert.equal((await startTrialRequest("g_1", null, s.deps)).status, 400);
    assert.equal((await startTrialRequest("g_1", body(9), s.deps)).status, 404);
    assert.equal((await startTrialRequest("g_1", body(2), s.deps)).status, 403);
    const bad = await startTrialRequest(
      "g_1",
      body(1, { leaderBuild: { element: "kim", profession: "muuSi" } }),
      s.deps,
    );
    assert.equal(bad.status, 422);
    assert.equal(bad.body.error, "lineup_invalid");
    assert.ok(bad.body.lineup);
  });

  it("thắng rồi: tổng quan cho thấy cleared, đá, đã nhận, kỷ lục; tầng kế mở", async () => {
    const s = setup();
    const a = await startTrialRequest("g_1", body(1), s.deps);
    const id = a.body.id as string;
    const rec = await s.store.get(id);
    assert.ok(rec);
    const battle = structuredClone(rec.match.battle);
    battle.winner = 0;
    battle.turn.number = 11;
    await s.store.save({ ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 }, updatedAt: T0 }, rec.match.seq);
    const res = await getBattle(id, "g_1", s.deps);
    assert.ok(res.ok);
    if (res.ok) assert.equal(res.outcome?.trial?.stonesGranted, 3);
    const o = await trialOverview(s.profiles, "g_1", s.floors);
    assert.equal(o.cleared, 1);
    assert.equal(o.stones, 3);
    assert.equal(o.active, null);
    assert.deepEqual(o.floors.map((f) => f.state), ["cleared", "open", "locked"]);
    assert.equal(o.floors[0]!.firstClearClaimed, true);
    assert.deepEqual(o.floors[0]!.record, { floor: 1, clears: 1, bestTurns: 11 });
    assert.equal(o.floors[1]!.firstClearClaimed, false);
  });

  it("bỏ trận: gỡ dấu; không có trận là no-op; chủ khác không bị ảnh hưởng", async () => {
    const s = setup();
    assert.deepEqual((await abandonTrialRequest("g_1", s.deps)).body, { abandoned: false });
    await startTrialRequest("g_1", body(1), s.deps);
    await startTrialRequest("g_2", body(1), s.deps);
    const r = await abandonTrialRequest("g_1", s.deps);
    assert.equal(r.status, 200);
    assert.deepEqual(r.body, { abandoned: true });
    assert.equal((await trialOverview(s.profiles, "g_1", s.floors)).active, null);
    assert.ok((await trialOverview(s.profiles, "g_2", s.floors)).active);
  });

  it("schema Song Tháp mới hơn: supported=false, mở trận bị từ chối 409, hồ sơ không bị ghi đè", async () => {
    const s = setup();
    await updateProfile(
      s.profiles,
      "g_1",
      (p) => ({ ok: true as const, profile: { ...p, dualTower: { schema: 99, x: 1 } } }),
      T0,
    );
    const o = await trialOverview(s.profiles, "g_1", s.floors);
    assert.equal(o.supported, false);
    const r = await startTrialRequest("g_1", body(1), s.deps);
    assert.equal(r.status, 409);
    assert.equal(r.body.error, "unsupported_schema");
    const { profile } = await loadProfile(s.profiles, "g_1");
    assert.deepEqual(profile.dualTower, { schema: 99, x: 1 });
  });
});
