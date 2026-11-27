import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BOT_CHARACTERS, PVP_BOT_AFTER_MS, PVP_GOLD_WIN, PVP_TEAM_SOLO_MS, newProfile, pvpAiFactor, vnWeek } from "../../src/core";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import { MemorySeasonStore } from "../../src/server/seasons";
import { MemoryPvpStore, pvpEnqueue, pvpGetMatch, pvpOverview, type PvpDeps } from "../../src/server/pvp";

// Đấu máy khi chờ lâu (Shan chốt 27/11/2026): 1vs1 gặp một nhân vật máy, 3vs3 đánh cùng năm nhân vật máy; không tính điểm
// hạng, không vào bảng mùa, vẫn có vàng giảm theo số máy.

const T0 = 1_700_000_000_000;

function rich() {
  const p = newProfile();
  const sample = p.companions.haVan!;
  return { ...p, companions: { ...p.companions, nguyenBac: structuredClone(sample), dinhDien: structuredClone(sample) } };
}

async function setup() {
  const pvp = new MemoryPvpStore();
  const profiles: ProfileStore = new MemoryProfileStore();
  for (const id of ["a", "b"]) await profiles.put(id, rich(), 0, T0);
  const seasons = new MemorySeasonStore();
  let n = 0;
  const mk = (now: number): PvpDeps => ({ pvp, profiles, seasons, now, seed: 777 + n++, newId: () => `bot-${++n}`, nameOf: async (id) => `Tên ${id}` });
  return { pvp, profiles, seasons, mk };
}

/** Hỏi lại đều đặn như client thật (mỗi 10 giây) tới mốc `until`. */
async function waitInQueue(mk: (t: number) => PvpDeps, owner: string, until: number) {
  for (let t = T0; t <= until; t += 10_000) await pvpOverview(owner, mk(t));
  return pvpOverview(owner, mk(until));
}

const botIds = new Set(BOT_CHARACTERS.map((c) => c.id));

describe("Thư Hùng đấu máy khi chờ lâu", () => {
  it("1vs1: chưa đủ thời gian thì còn chờ; quá hạn mà không có ai thì gặp một nhân vật máy, ghi rõ là máy", async () => {
    const { mk, pvp } = await setup();
    await pvpEnqueue("a", "duel", mk(T0));
    assert.equal((await waitInQueue(mk, "a", T0 + PVP_BOT_AFTER_MS - 1000)).matchId, null);
    const o = await pvpOverview("a", mk(T0 + PVP_BOT_AFTER_MS + 1));
    assert.ok(o.matchId);
    const rec = (await pvp.getMatch(o.matchId!))!;
    assert.equal(rec.state.vsBot, true);
    assert.deepEqual(rec.owners, ["a"]);
    assert.deepEqual(rec.state.seats, [["a"], [null]]);
    const foe = rec.state.battle.sides[1].fighters[0]!;
    assert.ok(botIds.has(foe.id), foe.id);
    const v = await pvpGetMatch(o.matchId!, "a", mk(T0 + PVP_BOT_AFTER_MS + 2000));
    assert.ok(v.ok);
    if (!v.ok) return;
    assert.equal(v.view.vsBot, true);
    assert.equal(v.view.bots.length, 1);
    assert.equal(v.view.bots[0]!.name, foe.name);
    assert.ok(v.view.bots[0]!.lines.open.length > 0);
    assert.equal(v.view.seats.find((s) => s.side === 1)?.ai, true);
  });

  it("1vs1: có người khác trong hàng đợi (dù điểm cách xa) thì không ghép máy, chờ ghép người", async () => {
    const { mk, pvp } = await setup();
    await pvp.applyResult("b", "duel", { delta: 2000, won: true, counted: true, forgiven: 0, day: "x", now: T0 });
    await pvpEnqueue("a", "duel", mk(T0));
    await pvpEnqueue("b", "duel", mk(T0));
    let t = T0;
    let id: string | null = null;
    for (; t <= T0 + PVP_BOT_AFTER_MS + 5000 && !id; t += 5000) {
      id = (await pvpOverview("a", mk(t))).matchId ?? (await pvpOverview("b", mk(t + 1))).matchId;
    }
    assert.equal(id, null);
  });

  it("đấu máy xong: không đổi điểm hạng, không vào bảng mùa, vẫn có vàng giảm theo số máy", async () => {
    const { mk, pvp, profiles, seasons } = await setup();
    await pvpEnqueue("a", "duel", mk(T0));
    await waitInQueue(mk, "a", T0 + PVP_BOT_AFTER_MS);
    const id = (await pvpOverview("a", mk(T0 + PVP_BOT_AFTER_MS + 1))).matchId!;
    const mid = (await pvp.getMatch(id))!;
    const side = mid.state.players.a!.side;
    const forced = { ...mid, state: { ...mid.state, battle: { ...mid.state.battle, winner: side } }, seq: mid.seq + 1 };
    assert.ok(await pvp.saveMatch(forced, mid.seq));
    const t = T0 + PVP_BOT_AFTER_MS + 5000;
    const v = await pvpGetMatch(id, "a", mk(t));
    assert.ok(v.ok);
    if (!v.ok) return;
    const r = v.view.result!;
    assert.equal(r.counted, false);
    assert.equal(r.delta, 0);
    assert.equal(r.gold, Math.round(PVP_GOLD_WIN * pvpAiFactor(1)));
    assert.equal((await loadProfile(profiles, "a")).profile.gold, rich().gold + r.gold);
    assert.equal((await pvp.rating("a", "duel")).rating, (await pvp.rating("b", "duel")).rating);
    assert.equal(await seasons.rankOf("pvp", vnWeek(t), "a"), null);
  });

  it("3vs3: một mình quá hạn thì đánh cùng hai nhân vật máy gặp ba nhân vật máy, không trùng ai", async () => {
    const { mk, pvp } = await setup();
    assert.deepEqual(await pvpEnqueue("a", "team", mk(T0)), { ok: true });
    assert.equal((await waitInQueue(mk, "a", T0 + PVP_TEAM_SOLO_MS - 1000)).matchId, null);
    const o = await pvpOverview("a", mk(T0 + PVP_TEAM_SOLO_MS + 1));
    assert.ok(o.matchId);
    const rec = (await pvp.getMatch(o.matchId!))!;
    assert.equal(rec.state.vsBot, true);
    assert.deepEqual(rec.state.seats, [["a", null, null], [null, null, null]]);
    const ids = rec.state.battle.sides.flatMap((s) => s.fighters.map((f) => f.id)).slice(1);
    assert.equal(new Set(ids).size, 5);
    for (const id of ids) assert.ok(botIds.has(id), id);
    const v = await pvpGetMatch(o.matchId!, "a", mk(T0 + PVP_TEAM_SOLO_MS + 2000));
    assert.ok(v.ok);
    if (v.ok) assert.equal(v.view.bots.length, 5);
  });
});
