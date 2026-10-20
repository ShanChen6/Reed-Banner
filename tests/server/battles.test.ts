import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ABANDON_MS,
  applyProfileAction,
  autoProgress,
  findValidMoves,
  GRACE_MS,
  newProfile,
  TURN_MS,
} from "../../src/core";
import {
  actBattle,
  createBattleFor,
  getBattle,
  httpStatus,
  parseAction,
  parseNewBattle,
} from "../../src/server/battles";
import { newGuestId, signGuest, verifyGuest } from "../../src/server/guest";
import {
  loadProfile,
  MemoryProfileStore,
  updateProfile,
} from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";
import { dailyBoard, MemoryDailyStore } from "../../src/server/daily";
import { MemoryLeaderboardStore } from "../../src/server/leaderboard";
import { DAILY_GOLD } from "../../src/core";

const T0 = 5_000_000;
const input = {
  mode: "3v3",
  element: "kim",
  profession: "ySu",
  companions: ["haVan", "maiThanh"],
  difficulty: "easy",
};

async function setup(seed = 4) {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  let n = 0;
  const created = await createBattleFor("g_1", parseNewBattle(input)!, {
    store,
    profiles,
    now: T0,
    seed,
    newId: () => `m_${++n}`,
  });
  assert.ok(created.ok);
  return { store, profiles, id: created.id, view: created.view };
}

describe("dịch vụ trận online", () => {
  it("kiểm tra body tạo trận", () => {
    assert.ok(parseNewBattle(input));
    assert.equal(parseNewBattle({ ...input, companions: ["haVan"] }), null);
    assert.equal(
      parseNewBattle({ ...input, companions: ["haVan", "haVan"] }),
      null,
    );
    assert.equal(parseNewBattle({ ...input, element: "go" }), null);
    assert.deepEqual(parseNewBattle({ ...input, mode: "1v1" })?.companions, []);
    assert.equal(parseNewBattle(null), null);
  });

  it("kiểm tra hình dạng hành động", () => {
    assert.deepEqual(
      parseAction({
        seq: 0,
        action: {
          type: "swap",
          from: { row: 0, col: 0 },
          to: { row: 0, col: 1 },
          x: 1,
        },
      }),
      {
        seq: 0,
        action: {
          type: "swap",
          from: { row: 0, col: 0 },
          to: { row: 0, col: 1 },
        },
      },
    );
    assert.equal(parseAction({ seq: "0", action: { type: "timeout" } }), null);
    assert.equal(
      parseAction({
        seq: 0,
        action: { type: "skill", skill: "x", cell: { row: "a" } },
      }),
      null,
    );
    assert.equal(parseAction({ seq: 0, action: { type: "hack" } }), null);
  });

  it("tạo trận: đội người chơi đúng lựa chọn, đối thủ không trùng đồng đội, client không thấy seed", async () => {
    const { view } = await setup();
    const mine = view.battle.sides[0].fighters.map((f) => f.id);
    const foes = view.battle.sides[1].fighters.map((f) => f.id);
    assert.deepEqual(mine, ["dinhBoLinh", "haVan", "maiThanh"]);
    assert.equal(foes.length, 3);
    assert.ok(!foes.some((f) => mine.includes(f)));
    assert.equal(view.battle.sides[0].fighters[0]!.profession, "ySu");
    assert.equal(JSON.stringify(view).includes("Rng"), false);
  });

  it("đánh một nước, chặn người khác, chặn gửi lặp", async () => {
    const { store, profiles, id, view } = await setup();
    const mv = findValidMoves(view.battle.board as never)[0]!;
    const body = {
      seq: view.seq,
      action: { type: "swap", from: mv.from, to: mv.to },
    };
    assert.deepEqual(
      await actBattle(id, "g_khac", body, { store, profiles, now: T0 + 1000 }),
      { ok: false, error: "notFound" },
    );
    const r = await actBattle(id, "g_1", body, {
      store,
      profiles,
      now: T0 + 1000,
    });
    assert.ok(r.ok, r.ok ? "" : r.error);
    assert.ok(r.view.seq > view.seq);
    const again = await actBattle(id, "g_1", body, {
      store,
      profiles,
      now: T0 + 2000,
    });
    assert.equal(!again.ok && again.error, "staleSeq");
    assert.equal(httpStatus("staleSeq"), 409);
  });

  it("xem trận chạy bù lượt hết giờ và lưu lại", async () => {
    const { store, profiles, id, view } = await setup();
    const later = T0 + 2 * (TURN_MS + GRACE_MS) + 5;
    const r = await getBattle(id, "g_1", { store, profiles, now: later });
    assert.ok(r.ok);
    assert.ok(r.events.some((e) => e.type === "timeout"));
    assert.ok(r.view.seq > view.seq);
    assert.equal((await store.get(id))!.match.seq, r.view.seq);
    // Ghi kèm điều kiện seq: bản cũ không ghi đè được bản mới.
    const stale = (await store.get(id))!;
    assert.equal(await store.save(stale, view.seq), false);
  });

  it("trận kết thúc thì cộng thưởng vào hồ sơ đúng một lần", async () => {
    const { store, profiles, id } = await setup();
    const before = (await loadProfile(profiles, "g_1")).version;
    // Bỏ trận quá 24 giờ: xử thua, vẫn nhận kinh nghiệm cơ bản.
    const later = T0 + ABANDON_MS + 1000;
    const r = await getBattle(id, "g_1", { store, profiles, now: later });
    assert.ok(r.ok && r.view.battle.winner === 1 && r.view.forfeited);
    assert.ok(r.outcome && !r.outcome.rewards.won);
    const { profile, version } = await loadProfile(profiles, "g_1");
    assert.equal(version, before + 1);
    assert.equal(profile.main.xp, r.outcome.rewards.xp[0]);
    assert.equal(profile.companions.haVan!.xp, r.outcome.rewards.xp[1]);
    // Thua có 30% rơi món (phẩm tối đa Lục); món rơi nằm trong túi đồ với id của hồ sơ.
    assert.deepEqual(profile.bag, r.outcome.drop ? [r.outcome.drop] : []);
    if (r.outcome.drop)
      assert.ok(r.outcome.drop.tier <= 2 && r.outcome.drop.id === "g1");
    const again = await getBattle(id, "g_1", {
      store,
      profiles,
      now: later + 1000,
    });
    assert.ok(again.ok && again.outcome === undefined);
    assert.equal((await loadProfile(profiles, "g_1")).version, before + 1);
  });

  it("tạo trận theo hồ sơ: đội mang cấp đã lên, đối thủ cùng cấp, lưu nguyên tố và nghề vừa chọn", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 4, newId: () => "m_x" };
    const low = await createBattleFor("g_2", parseNewBattle(input)!, {
      ...deps,
      newId: () => "m_low",
    });
    const cur = await loadProfile(profiles, "g_2");
    assert.ok(
      await profiles.put(
        "g_2",
        { ...cur.profile, main: autoProgress(10, null) },
        cur.version,
      ),
    );
    const high = await createBattleFor("g_2", parseNewBattle(input)!, deps);
    assert.ok(low.ok && high.ok);
    const hp = (v: typeof low.view, side: 0 | 1) =>
      v.battle.sides[side].fighters[0]!.maxHp;
    assert.ok(hp(high.view, 0) > hp(low.view, 0));
    assert.ok(hp(high.view, 1) > hp(low.view, 1));
    const saved = (await loadProfile(profiles, "g_2")).profile;
    assert.equal(saved.element, "kim");
    assert.equal(saved.profession, "ySu");
  });

  it("chỉ ra trận nhân vật kèm đã có; mua rồi thì được", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 4, newId: () => "m_shop" };
    const withShop = parseNewBattle({
      ...input,
      companions: ["haVan", "daoLam"],
    })!;
    assert.ok(withShop, "nhân vật cửa hàng là id hợp lệ");
    assert.deepEqual(await createBattleFor("g_3", withShop, deps), {
      ok: false,
      error: "badRequest",
    });
    const cur = await loadProfile(profiles, "g_3");
    assert.ok(
      await profiles.put("g_3", { ...cur.profile, gold: 5000 }, cur.version),
    );
    const bought = await updateProfile(
      profiles,
      "g_3",
      (p) =>
        applyProfileAction(p, { type: "buyCompanion", character: "daoLam" }),
      T0,
    );
    assert.ok(bought.ok);
    const created = await createBattleFor("g_3", withShop, deps);
    assert.ok(created.ok);
    assert.deepEqual(
      created.view.battle.sides[0].fighters.map((f) => f.id),
      ["dinhBoLinh", "haVan", "daoLam"],
    );
  });

  it("ghi hồ sơ kèm điều kiện version: bị ghi trước thì đọc lại và thử lại", async () => {
    const profiles = new MemoryProfileStore();
    let first = true;
    const r = await updateProfile(
      profiles,
      "g_3",
      (p) => {
        if (first) {
          // Một request khác ghi chen vào giữa lúc đọc và lúc ghi.
          first = false;
          void profiles.put("g_3", { ...newProfile(), gold: 100 }, 0);
        }
        return { ok: true, profile: { ...p, gold: p.gold + 5 } };
      },
      T0,
    );
    assert.ok(r.ok);
    assert.equal(r.stored.profile.gold, 105);
    assert.equal(r.stored.version, 2);
  });

  it("cookie khách có chữ ký, sửa id thì không hợp lệ", () => {
    const id = newGuestId();
    const v = signGuest(id, "k");
    assert.equal(verifyGuest(v, "k"), id);
    assert.equal(verifyGuest(v.replace("g_", "g_x"), "k"), null);
    assert.equal(verifyGuest(v, "khac"), null);
    assert.equal(verifyGuest(undefined, "k"), null);
  });
});

describe("kiểm tra cấu hình", () => {
  it("không có DATABASE_URL thì báo dùng bộ nhớ", async () => {
    const { checkDatabase } = await import("../../src/server/store");
    const saved = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    assert.deepEqual(await checkDatabase(), { kind: "memory", ok: true });
    if (saved !== undefined) process.env.DATABASE_URL = saved;
  });
});

describe("trận chiến dịch", () => {
  it("chỉ đánh được màn đã mở; lương mang sang, thắng lần đầu ghi màn và thưởng vàng", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 4, newId: () => "m_c" };
    const body = { ...input, stage: "boHai" };
    assert.equal(parseNewBattle({ ...input, stage: "khong-co" }), null);
    assert.equal(parseNewBattle(body)!.mode, "1v1");
    const locked = await createBattleFor("g_c", parseNewBattle(body)!, deps);
    assert.deepEqual(locked, { ok: false, error: "badRequest" });

    const cur = await loadProfile(profiles, "g_c");
    assert.ok(
      await profiles.put(
        "g_c",
        {
          ...cur.profile,
          campaign: { cleared: [], food: 42, raids: {}, bestTurns: {} },
        },
        cur.version,
      ),
    );
    const r = await createBattleFor(
      "g_c",
      parseNewBattle({ ...input, stage: "coLau" })!,
      deps,
    );
    assert.ok(r.ok);
    assert.equal(r.view.stage, "coLau");
    assert.equal(r.view.difficulty, "easy");
    // Vào trận với 42 lương; lượt đầu có thể đã trừ tiền nuôi quân.
    const upkeep = r.events.filter(
      (e) => e.type === "upkeep" && e.side === 0,
    ).length;
    assert.ok(
      r.view.battle.sides[0].food <= 42 &&
        r.view.battle.sides[0].food >= 42 - 10 * upkeep,
    );
    assert.equal(r.view.battle.sides[1].fighters.length, 1);

    // Ép trận kết thúc với phe người chơi thắng rồi xem: cộng kết quả chiến dịch.
    const rec = (await store.get("m_c"))!;
    const battle = { ...rec.match.battle, winner: 0 as const };
    battle.sides = [{ ...battle.sides[0], food: 33 }, battle.sides[1]];
    assert.ok(
      await store.save(
        { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
        rec.match.seq,
      ),
    );
    const done = await getBattle("m_c", "g_c", {
      store,
      profiles,
      now: T0 + 1000,
    });
    assert.ok(done.ok && done.outcome?.campaign);
    assert.deepEqual(done.outcome.campaign, {
      firstClear: true,
      bonusGold: 100,
      food: 33,
      joined: "nguyenBac",
    });
    const saved = (await loadProfile(profiles, "g_c")).profile;
    assert.deepEqual(saved.campaign, {
      cleared: ["coLau"],
      food: 33,
      raids: {},
      bestTurns: { coLau: 1 },
    });
    assert.equal(saved.companions.nguyenBac?.level, 1);
  });
});

describe("trận đánh trùm", () => {
  it("chỉ đánh được bậc đã mở; sân nhà; thắng lần đầu ghi bậc, thưởng vàng và món trang bị", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 4, newId: () => "m_r" };
    const body = { ...input, stage: "boHai", raid: 1 };
    assert.equal(parseNewBattle({ ...body, raid: 4 }), null);
    assert.equal(parseNewBattle(body)!.difficulty, "normal");
    assert.equal(parseNewBattle({ ...body, raid: 3 })!.difficulty, "boss");
    const locked = await createBattleFor("g_r", parseNewBattle(body)!, deps);
    assert.deepEqual(locked, { ok: false, error: "badRequest" });

    const cur = await loadProfile(profiles, "g_r");
    const campaign = {
      cleared: ["coLau", "boHai"],
      food: 40,
      raids: {},
      bestTurns: {},
    };
    assert.ok(
      await profiles.put(
        "g_r",
        { ...cur.profile, gold: 0, campaign },
        cur.version,
      ),
    );
    const tier2 = await createBattleFor(
      "g_r",
      parseNewBattle({ ...body, raid: 2 })!,
      deps,
    );
    assert.deepEqual(tier2, { ok: false, error: "badRequest" });
    const r = await createBattleFor("g_r", parseNewBattle(body)!, deps);
    assert.ok(r.ok);
    assert.equal(r.view.raid, 1);
    assert.equal(r.view.stage, "boHai");
    // Người chơi không mang lương chiến dịch.
    assert.equal(r.view.battle.sides[1].fighters[0]!.id, "tranLam");
    assert.ok(r.view.battle.sides[0].food !== 40);

    const rec = (await store.get("m_r"))!;
    const battle = { ...rec.match.battle, winner: 0 as const };
    assert.ok(
      await store.save(
        { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
        rec.match.seq,
      ),
    );
    const done = await getBattle("m_r", "g_r", {
      store,
      profiles,
      now: T0 + 1000,
    });
    assert.ok(done.ok && done.outcome?.raid);
    assert.equal(done.outcome.campaign, undefined);
    assert.equal(done.outcome.raid.firstClear, true);
    assert.equal(done.outcome.raid.bonusGold, 300);
    assert.equal(done.outcome.raid.item?.tier, 3);
    assert.equal(done.outcome.raid.item?.element, "thuy");
    const saved = (await loadProfile(profiles, "g_r")).profile;
    assert.deepEqual(saved.campaign, { ...campaign, raids: { boHai: 1 } });
    assert.ok(saved.bag.some((i) => i.id === done.outcome!.raid!.item!.id));
  });
});

describe("trận leo tháp", () => {
  it("bắt đầu lượt leo, không mở hai trận một tầng, thắng thì chờ chọn thưởng", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    let n = 0;
    const deps = {
      store,
      profiles,
      now: T0,
      seed: 11,
      newId: () => `m_t${++n}`,
    };
    const body = { ...input, tower: true };
    assert.equal(parseNewBattle({ ...body, tower: 1 }), null);
    assert.equal(parseNewBattle({ ...body, stage: "coLau" }), null);
    const r = await createBattleFor("g_t", parseNewBattle(body)!, deps);
    assert.ok(r.ok);
    assert.equal(r.view.tower, 1);
    assert.equal(r.view.battle.sides[1].fighters.length, 3);
    const run = (await loadProfile(profiles, "g_t")).profile.tower.run!;
    assert.equal(run.active, true);
    assert.equal(run.floor, 1);
    assert.deepEqual(
      await createBattleFor("g_t", parseNewBattle(body)!, deps),
      { ok: false, error: "badRequest" },
    );

    const rec = (await store.get(r.id))!;
    const battle = { ...rec.match.battle, winner: 0 as const };
    const f = battle.sides[0].fighters;
    battle.sides = [
      {
        ...battle.sides[0],
        food: 35,
        fighters: [
          { ...f[0]!, hp: Math.round(f[0]!.maxHp / 2) },
          { ...f[1]!, hp: 0 },
          f[2]!,
        ],
      },
      battle.sides[1],
    ];
    assert.ok(
      await store.save(
        { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
        rec.match.seq,
      ),
    );
    const done = await getBattle(r.id, "g_t", {
      store,
      profiles,
      now: T0 + 1000,
    });
    assert.ok(done.ok && done.outcome?.tower);
    assert.deepEqual(done.outcome.tower, {
      floor: 1,
      won: true,
      best: 1,
      newBest: true,
      bonusGold: 0,
    });
    const after = (await loadProfile(profiles, "g_t")).profile.tower;
    assert.equal(after.best, 1);
    assert.equal(after.run!.floor, 2);
    assert.equal(after.run!.active, false);
    assert.equal(after.run!.food, 35);
    assert.equal(after.run!.hp[1], 0);
    assert.ok(Math.abs(after.run!.hp[0]! - 0.5) < 0.01);
    // Còn thưởng chưa chọn thì chưa lên tầng được.
    assert.deepEqual(
      await createBattleFor("g_t", parseNewBattle(body)!, deps),
      { ok: false, error: "badRequest" },
    );
  });
});

describe("trận sinh tồn", () => {
  it("nghỉ giữa đợt chưa cộng thưởng, sang đợt kế, dừng lại thì ghi kỷ lục và vàng", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = {
      store,
      profiles,
      now: T0,
      seed: 21,
      newId: () => "m_s1",
    };
    const leaderboard = new MemoryLeaderboardStore();
    const body = { ...input, survival: true };
    assert.equal(parseNewBattle({ ...body, survival: 1 }), null);
    assert.equal(parseNewBattle({ ...body, tower: true }), null);
    const r = await createBattleFor("g_s", parseNewBattle(body)!, deps);
    assert.ok(r.ok);
    assert.equal(r.view.survival!.wave, 1);
    assert.equal(r.view.survival!.next!.wave, 2);
    assert.equal(r.view.battle.turn.side, 0);
    assert.equal(r.view.battle.sides[1].fighters.length, 2);

    // Phe người chơi vừa hạ hết đợt 1.
    const win = async () => {
      const rec = (await store.get(r.id))!;
      const battle = structuredClone(rec.match.battle);
      battle.sides[1].fighters.forEach((f) => (f.hp = 0));
      battle.winner = 0;
      assert.ok(
        await store.save(
          { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
          rec.match.seq,
        ),
      );
      return rec.match.seq + 1;
    };
    let seq = await win();
    const rest = await getBattle(r.id, "g_s", {
      store,
      profiles,
      now: T0 + 1000,
    });
    assert.ok(rest.ok && !rest.outcome);
    assert.equal(rest.view.survival!.cleared, 1);

    const next = await actBattle(
      r.id,
      "g_s",
      { seq, action: { type: "nextWave" } },
      { store, profiles, now: T0 + 2000 },
    );
    assert.ok(next.ok && !next.outcome);
    assert.equal(next.view.survival!.wave, 2);
    assert.equal(next.view.battle.winner, null);

    seq = await win();
    const end = await actBattle(
      r.id,
      "g_s",
      { seq, action: { type: "endRun" } },
      { store, profiles, leaderboard, now: T0 + 3000 },
    );
    assert.ok(end.ok && end.outcome?.survival);
    assert.deepEqual(end.outcome.survival, {
      cleared: 2,
      best: 2,
      newBest: true,
      gold: 20,
    });
    assert.equal(end.outcome.rewards.won, true);
    const p = (await loadProfile(profiles, "g_s")).profile;
    assert.equal(p.survival.best, 2);
    // Nhiệm vụ: một trận sinh tồn, thắng, vượt 2 đợt.
    assert.equal(p.quests.weekStats.waves, 2);
    assert.equal(p.quests.totals.play, 1);
    // Bảng xếp hạng sinh tồn ghi ngay khi cộng thưởng.
    assert.deepEqual(await leaderboard.rankOf("survival", "g_s"), {
      rank: 1,
      score: 2,
    });
  });
});

describe("thử thách hằng ngày", () => {
  it("mỗi người một lượt mỗi ngày, xong thì lên bảng xếp hạng và nhận vàng", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const daily = new MemoryDailyStore();
    let n = 0;
    const deps = (now: number) => ({
      store,
      profiles,
      daily,
      dailySecret: "bí mật",
      now,
      seed: 5,
      newId: () => `m_d${++n}`,
    });
    const input = parseNewBattle({ daily: true })!;
    assert.equal(parseNewBattle({ daily: 1 }), null);
    const a = await createBattleFor("g_a", input, deps(T0));
    const b = await createBattleFor("g_b", input, deps(T0 + 5));
    assert.ok(a.ok && b.ok);
    assert.equal(a.view.daily, b.view.daily);
    // Cùng đề: cùng bàn cờ và cùng đối thủ.
    assert.deepEqual(a.view.battle.board, b.view.battle.board);
    assert.deepEqual(
      a.view.battle.sides[1].fighters.map((f) => f.id),
      b.view.battle.sides[1].fighters.map((f) => f.id),
    );
    assert.deepEqual(await createBattleFor("g_a", input, deps(T0 + 9)), {
      ok: false,
      error: "dailyDone",
    });

    const finish = async (id: string, winner: 0 | 1, turns: number) => {
      const rec = (await store.get(id))!;
      const battle = structuredClone(rec.match.battle);
      battle.sides[winner === 0 ? 1 : 0].fighters.forEach((f) => (f.hp = 0));
      battle.winner = winner;
      battle.turn.number = turns;
      assert.ok(
        await store.save(
          { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
          rec.match.seq,
        ),
      );
    };
    await finish(a.id, 0, 30);
    await finish(b.id, 0, 20);
    const ra = await getBattle(a.id, "g_a", deps(T0 + 100));
    const rb = await getBattle(b.id, "g_b", deps(T0 + 200));
    assert.ok(ra.ok && ra.outcome?.daily && rb.ok && rb.outcome?.daily);
    assert.equal(ra.outcome.daily.rank, 1);
    assert.equal(rb.outcome.daily.rank, 1);
    assert.equal(ra.outcome.rewards.gold, DAILY_GOLD.win);
    assert.equal(
      (await loadProfile(profiles, "g_a")).profile.gold,
      DAILY_GOLD.win,
    );

    const board = await dailyBoard(daily, a.view.daily!, "g_a");
    assert.deepEqual(
      board.top.map((r) => [r.rank, r.mine, r.score.turns]),
      [
        [1, false, 20],
        [2, true, 30],
      ],
    );
    assert.equal(board.mine?.rank, 2);
    assert.equal(
      board.top[0]!.name,
      "Khách g_b".replace("g_b", "g_b".slice(-4)),
    );
  });
});
