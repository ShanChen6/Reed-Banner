import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ABANDON_MS,
  applyProfileAction,
  autoProgress,
  buildMain,
  CAMPAIGN_MISSION_IDS,
  findValidMoves,
  fighterSkill,
  FOOD_MAX,
  FOOD_UPKEEP_BINH_LINH,
  GRACE_MS,
  newProfile,
  TURN_MS,
  SURVIVAL_FOOD,
  SURVIVAL_HEAL,
  SURVIVAL_RESERVE_HEAL,
  SURVIVAL_REVIVE_FOOD,
  SURVIVAL_REVIVE_HP,
  type Match,
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
import { arenaView, MemoryArenaStore } from "../../src/server/arena";
import {
  ARENA_ATTACKS_PER_DAY,
  ARENA_OFFERS,
  ARENA_START,
  ARENA_WIN_GOLD,
  arenaDay,
  DAILY_GOLD,
} from "../../src/core";

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
    assert.deepEqual(
      parseAction({
        seq: 0,
        action: {
          type: "nextWave",
          activeIds: ["dinhBoLinh", "haVan", "maiThanh"],
          leaderBuild: { profession: "phapSu", element: "hoa" },
        },
      }),
      {
        seq: 0,
        action: {
          type: "nextWave",
          activeIds: ["dinhBoLinh", "haVan", "maiThanh"],
          leaderBuild: { profession: "phapSu", element: "hoa" },
        },
      },
    );
    assert.equal(
      parseAction({
        seq: 0,
        action: { type: "nextWave", revive: 0, hp: 999999 },
      }),
      null,
    );
    assert.equal(parseAction({ seq: 0, action: { type: "hack" } }), null);
    assert.equal(
      parseAction({
        seq: 0,
        action: {
          type: "nextWave",
          leaderBuild: { profession: "phapSu", hp: 999999 },
        },
      }),
      null,
    );
    assert.equal(
      parseAction({
        seq: 0,
        action: { type: "endRun", hp: 999999 },
      }),
      null,
    );
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

describe("chiến dịch 13 màn cũ đã gỡ", () => {
  it("id màn cũ không mở trận nào, kể cả đánh trùm theo id màn cũ; trận lưu kiểu cũ không phát thưởng chiến dịch", async () => {
    for (const stage of ["coLau", "boHai", "doDong", "khong-co"]) {
      assert.equal(parseNewBattle({ ...input, stage }), null, stage);
      assert.equal(parseNewBattle({ ...input, stage, raid: 1 }), null, stage);
    }
    assert.equal(parseNewBattle({ ...input, raidBoss: "boHai", raid: 1 }), null);
    // Trận lưu trước CAMP-08.04 còn trường `stage`: chốt như trận thường, không ghi gì vào tiến độ chiến dịch.
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 4, newId: () => "m_old" };
    const r = await createBattleFor("g_old", parseNewBattle(input)!, deps);
    assert.ok(r.ok);
    const before = (await loadProfile(profiles, "g_old")).profile;
    const rec = (await store.get("m_old"))!;
    const battle = { ...rec.match.battle, winner: 0 as const };
    const legacyMatch = { ...rec.match, battle, seq: rec.match.seq + 1, stage: "coLau" };
    assert.ok(await store.save({ ...rec, match: legacyMatch }, rec.match.seq));
    const done = await getBattle("m_old", "g_old", { store, profiles, now: T0 + 1000 });
    assert.ok(done.ok && done.outcome);
    assert.equal(done.outcome.raid, undefined);
    assert.equal(done.outcome.campaignV2, undefined);
    const after = (await loadProfile(profiles, "g_old")).profile;
    assert.deepEqual(after.campaign, before.campaign);
  });
});

describe("trận đánh trùm", () => {
  it("chỉ đánh được bậc đã mở; sân nhà; thắng lần đầu ghi bậc, thưởng vàng và món trang bị", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 4, newId: () => "m_r" };
    const body = { ...input, raidBoss: "kieuCongHan", raid: 1 };
    assert.equal(parseNewBattle({ ...body, raid: 4 }), null);
    assert.equal(parseNewBattle({ ...body, raid: undefined }), null);
    assert.equal(parseNewBattle({ ...input, raid: 1 }), null);
    assert.equal(parseNewBattle({ ...body, raidBoss: "khongCo" }), null);
    assert.equal(parseNewBattle({ ...body, tower: true }), null);
    assert.equal(parseNewBattle(body)!.difficulty, "hard");
    assert.equal(parseNewBattle({ ...body, raid: 3 })!.difficulty, "nightmare");
    // Chỉ sứ quân bị đánh dẹp mới là trùm (Shan chốt 25/10/2026): đồng minh, quy phục, tan rã bị từ chối.
    for (const id of ["tranLam", "phamBachHo", "ngoXuongXi", "ngoNhatKhanh", "nguyenKhoan", "luDuong"])
      assert.equal(parseNewBattle({ ...body, raidBoss: id }), null, id);
    const locked = await createBattleFor("g_r", parseNewBattle(body)!, deps);
    assert.deepEqual(locked, { ok: false, error: "badRequest" });

    const cur = await loadProfile(profiles, "g_r");
    // Kiều Công Hãn mở theo mốc cốt truyện M15, không theo màn phongChau cũ.
    const campaign = {
      ...cur.profile.campaign,
      completed: CAMPAIGN_MISSION_IDS.slice(0, 15),
      factions: { tranLam: { status: "allied", mission: "M06" } } as const,
      supply: 40,
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
    const opened = (await loadProfile(profiles, "g_r")).profile.campaign;
    const r = await createBattleFor("g_r", parseNewBattle(body)!, deps);
    assert.ok(r.ok);
    assert.equal(r.view.raid, 1);
    assert.equal(r.view.raidBoss, "kieuCongHan");
    // Người chơi không mang lương chiến dịch.
    assert.equal(r.view.battle.sides[1].fighters[0]!.id, "kieuCongHan");
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
    assert.equal(done.outcome.campaignV2, undefined);
    assert.equal(done.outcome.raid.firstClear, true);
    assert.equal(done.outcome.raid.bonusGold, 300);
    assert.equal(done.outcome.raid.item?.tier, 3);
    assert.equal(done.outcome.raid.item?.element, "loi");
    const saved = (await loadProfile(profiles, "g_r")).profile;
    assert.deepEqual(saved.campaign, {
      ...opened,
      raids: { kieuCongHan: 1 },
    });
    // Đánh trùm không đổi tiến độ chiến dịch: hoàn thành, lương, thế cục giữ nguyên.
    assert.deepEqual(saved.campaign.completed, campaign.completed);
    assert.equal(saved.campaign.supply, 40);
    // Thắng trận đánh trùm đếm vào nhiệm vụ "thắng trận chiến dịch hoặc đánh trùm".
    assert.equal(saved.quests.weekStats.campaign, 1);
    assert.ok(saved.bag.some((i) => i.id === done.outcome!.raid!.item!.id));
  });
});

describe("leo tháp cũ đã gỡ", () => {
  it("từ chối yêu cầu tạo trận còn mang `tower`", () => {
    assert.equal(parseNewBattle({ ...input, tower: true }), null);
  });
});

describe("trận sinh tồn", () => {
  it("không ghi profession/element của payload tạo run vào Profile", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const ownerId = "g_survival_profile_isolation";
    const original = (await loadProfile(profiles, ownerId)).profile;
    const parsed = parseNewBattle({
      ...input,
      element: "hoa",
      profession: "ySu",
      survival: true,
    });
    assert.ok(parsed);
    const created = await createBattleFor(ownerId, parsed, {
      store,
      profiles,
      now: T0,
      seed: 34,
      newId: () => "m_survival_profile_isolation",
    });
    assert.ok(created.ok);

    assert.deepEqual((await loadProfile(profiles, ownerId)).profile, original);
    const saved = await store.get(created.id);
    assert.deepEqual(
      saved!.match.survival!.roster.entries.dinhBoLinh!.snapshot.leaderBuildChoice,
      { profession: original.profession, element: original.element },
    );
  });

  it("tạo trận từ active và reserve được chọn trong màn chuẩn bị", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const parsed = parseNewBattle({
      ...input,
      companions: ["leThach", "phungPhong"],
      reserveCompanions: ["haVan"],
      survival: true,
    });
    assert.ok(parsed);
    const created = await createBattleFor("g_roster", parsed, {
      store,
      profiles,
      now: T0,
      seed: 34,
      newId: () => "m_roster",
    });
    assert.ok(created.ok);
    assert.deepEqual(
      created.view.battle.sides[0].fighters.map((fighter) => fighter.id),
      ["dinhBoLinh", "leThach", "phungPhong"],
    );
    const saved = await store.get(created.id);
    assert.deepEqual(saved!.match.survival!.roster.activeIds, [
      "dinhBoLinh",
      "leThach",
      "phungPhong",
    ]);
    assert.deepEqual(saved!.match.survival!.roster.reserveIds, ["haVan"]);
  });

  it("xác thực lựa chọn round ở server và không commit request lỗi", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const parsed = parseNewBattle({
      ...input,
      survival: true,
      reserveCompanions: ["leThach"],
    });
    assert.ok(parsed);
    const created = await createBattleFor("g_actions", parsed, {
      store,
      profiles,
      now: T0,
      seed: 86,
      newId: () => "m_actions",
    });
    assert.ok(created.ok);
    const initialRecord = await store.get(created.id);
    assert.ok(initialRecord);
    const breakBattle = structuredClone(initialRecord.match.battle);
    breakBattle.sides[0].fighters[1]!.hp = 0;
    breakBattle.sides[0].food = 0;
    breakBattle.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    breakBattle.winner = 0;
    const breakSeq = initialRecord.match.seq + 1;
    assert.ok(
      await store.save(
        {
          ...initialRecord,
          match: { ...initialRecord.match, battle: breakBattle, seq: breakSeq },
        },
        initialRecord.match.seq,
      ),
    );

    const invalidActions = [
      {
        action: {
          type: "nextWave",
          activeIds: ["dinhBoLinh", "unknown", "maiThanh"],
        },
        error: "unknownFighter",
      },
      {
        action: {
          type: "nextWave",
          activeIds: ["dinhBoLinh", "haVan", "maiThanh"],
        },
        error: "fighterDowned",
      },
      {
        action: {
          type: "nextWave",
          leaderBuild: { element: "not-an-element" },
        },
        error: "invalidElement",
      },
      {
        action: { type: "nextWave", revive: "haVan" },
        error: "notEnoughFood",
      },
    ] as const;
    for (const { action, error } of invalidActions) {
      const result = await actBattle(
        created.id,
        "g_actions",
        { seq: breakSeq, action },
        { store, profiles, now: T0 + 1000 },
      );
      assert.ok(!result.ok);
      assert.equal(result.error, error);
      const stillAtBreak: Match = (await store.get(created.id))!.match;
      assert.equal(stillAtBreak.seq, breakSeq);
      assert.equal(stillAtBreak.survival!.wave, 1);
      assert.equal(stillAtBreak.battle.sides[0].food, 0);
      assert.equal(stillAtBreak.battle.sides[0].fighters[1]!.hp, 0);
      assert.equal(stillAtBreak.survival!.settledThroughWave, 0);
    }

    const tampered = await actBattle(
      created.id,
      "g_actions",
      {
        seq: breakSeq,
        action: {
          type: "nextWave",
          activeIds: ["dinhBoLinh", "leThach", "maiThanh"],
          hp: 999999,
          atk: 999999,
          def: 999999,
          energy: 999999,
        },
      },
      { store, profiles, now: T0 + 1100 },
    );
    assert.ok(!tampered.ok);
    assert.equal(tampered.error, "badRequest");
    assert.equal((await store.get(created.id))!.match.seq, breakSeq);

    const stale = await actBattle(
      created.id,
      "g_actions",
      { seq: breakSeq - 1, action: { type: "nextWave" } },
      { store, profiles, now: T0 + 1200 },
    );
    assert.ok(!stale.ok);
    assert.equal(stale.error, "staleSeq");
    assert.equal((await store.get(created.id))!.match.seq, breakSeq);

    const ended = await actBattle(
      created.id,
      "g_actions",
      { seq: breakSeq, action: { type: "endRun" } },
      { store, profiles, now: T0 + 1300 },
    );
    assert.ok(ended.ok);
    const afterFinish = await actBattle(
      created.id,
      "g_actions",
      { seq: ended.view.seq, action: { type: "nextWave" } },
      { store, profiles, now: T0 + 1400 },
    );
    assert.ok(!afterFinish.ok);
    assert.equal(afterFinish.error, "finished");
  });

  it("hai tab xác nhận nextWave đồng thời chỉ commit một lần", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const parsed = parseNewBattle({
      ...input,
      survival: true,
      reserveCompanions: ["leThach", "toKim"],
    });
    assert.ok(parsed);
    const created = await createBattleFor("g_race", parsed, {
      store,
      profiles,
      now: T0,
      seed: 88,
      newId: () => "m_race",
    });
    assert.ok(created.ok);
    const record = await store.get(created.id);
    assert.ok(record);
    const battle = structuredClone(record.match.battle);
    battle.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    battle.winner = 0;
    const breakSeq = record.match.seq + 1;
    assert.ok(
      await store.save(
        { ...record, match: { ...record.match, battle, seq: breakSeq } },
        record.match.seq,
      ),
    );

    const [firstTab, secondTab] = await Promise.all([
      actBattle(
        created.id,
        "g_race",
        {
          seq: breakSeq,
          action: {
            type: "nextWave",
            activeIds: ["dinhBoLinh", "leThach", "maiThanh"],
            leaderBuild: { profession: "phapSu", element: "hoa" },
          },
        },
        { store, profiles, now: T0 + 1000 },
      ),
      actBattle(
        created.id,
        "g_race",
        {
          seq: breakSeq,
          action: {
            type: "nextWave",
            activeIds: ["dinhBoLinh", "toKim", "haVan"],
            leaderBuild: { profession: "ySu", element: "thuy" },
          },
        },
        { store, profiles, now: T0 + 1001 },
      ),
    ]);
    const successes = [firstTab, secondTab].filter((result) => result.ok);
    const failures = [firstTab, secondTab].filter((result) => !result.ok);
    assert.equal(successes.length, 1);
    assert.equal(failures.length, 1);
    assert.equal(failures[0]!.error, "conflict");
    const committedResult = firstTab.ok ? firstTab : secondTab;
    assert.ok(committedResult.ok);

    const committed = (await store.get(created.id))!.match;
    assert.equal(committed.survival!.wave, 2);
    assert.equal(committed.survival!.settledThroughWave, 1);
    assert.deepEqual(
      committed.battle.sides[0].fighters.map((fighter) => fighter.id),
      committedResult.view.battle.sides[0].fighters.map((fighter) => fighter.id),
    );
    assert.equal(
      committed.battle.sides[0].food,
      committedResult.view.battle.sides[0].food,
    );
    assert.ok(committed.battle.sides[0].food <= Math.min(FOOD_MAX, battle.sides[0].food + SURVIVAL_FOOD));
  });

  it("retry sau khi mất response đồng bộ round đã commit mà không settle lần hai", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const parsed = parseNewBattle({
      ...input,
      survival: true,
      reserveCompanions: ["leThach"],
    });
    assert.ok(parsed);
    const created = await createBattleFor("g_retry", parsed, {
      store,
      profiles,
      now: T0,
      seed: 89,
      newId: () => "m_retry",
    });
    assert.ok(created.ok);
    const record = await store.get(created.id);
    assert.ok(record);
    const battle = structuredClone(record.match.battle);
    battle.sides[0].fighters[0]!.hp = 200;
    battle.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    battle.winner = 0;
    const breakSeq = record.match.seq + 1;
    assert.ok(
      await store.save(
        { ...record, match: { ...record.match, battle, seq: breakSeq } },
        record.match.seq,
      ),
    );

    const actionBody = {
      seq: breakSeq,
      action: { type: "nextWave" },
    };
    const firstResponse = await actBattle(created.id, "g_retry", actionBody, {
      store,
      profiles,
      now: T0 + 1000,
    });
    assert.ok(firstResponse.ok);
    const committed = (await store.get(created.id))!.match;
    const hpAfterTransition = committed.battle.sides[0].fighters[0]!.hp;
    const foodAfterTransition = committed.battle.sides[0].food;

    const retry = await actBattle(created.id, "g_retry", actionBody, {
      store,
      profiles,
      now: T0 + 1100,
    });
    assert.ok(!retry.ok);
    assert.equal(retry.error, "staleSeq");
    const resumed = await getBattle(created.id, "g_retry", {
      store,
      profiles,
      now: T0 + 1200,
    });
    assert.ok(resumed.ok);
    assert.equal(resumed.view.survival!.wave, 2);
    const afterResume = (await store.get(created.id))!.match;
    assert.equal(afterResume.battle.sides[0].fighters[0]!.hp, hpAfterTransition);
    assert.equal(afterResume.battle.sides[0].food, foodAfterTransition);
    assert.equal(afterResume.survival!.settledThroughWave, 1);
  });

  it("kết thúc khi cả ba active gục dù reserve còn sống và không tự đưa reserve vào trận", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const parsed = parseNewBattle({
      ...input,
      survival: true,
      reserveCompanions: ["leThach", "toKim"],
    });
    assert.ok(parsed);
    const created = await createBattleFor("g_all_down", parsed, {
      store,
      profiles,
      now: T0,
      seed: 90,
      newId: () => "m_all_down",
    });
    assert.ok(created.ok);
    const record = await store.get(created.id);
    assert.ok(record);
    const battle = structuredClone(record.match.battle);
    battle.sides[0].fighters.forEach((fighter) => (fighter.hp = 0));
    battle.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    battle.winner = 1;
    battle.turn.deadline = null;
    assert.ok(
      await store.save(
        {
          ...record,
          match: {
            ...record.match,
            battle,
            seq: record.match.seq + 1,
          },
        },
        record.match.seq,
      ),
    );

    const finished = await getBattle(created.id, "g_all_down", {
      store,
      profiles,
      now: T0 + 1000,
    });
    assert.ok(finished.ok && finished.outcome?.survival);
    assert.equal(finished.view.survival!.done, true);
    assert.deepEqual(
      finished.view.battle.sides[0].fighters.map((fighter) => fighter.id),
      ["dinhBoLinh", "haVan", "maiThanh"],
    );
    const saved = (await store.get(created.id))!.match;
    assert.equal(saved.survival!.done, true);
    assert.deepEqual(saved.survival!.roster.reserveIds, [
      "leThach",
      "toKim",
    ]);
    assert.ok(
      saved.survival!.roster.reserveIds.every((id) => {
        const entry = saved.survival!.roster.entries[id]!;
        return (
          entry.location.kind === "reserve" &&
          entry.location.runtime.hp > 0
        );
      }),
    );
  });

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
    const body = {
      ...input,
      survival: true,
      reserveCompanions: ["leThach", "toKim"],
    };
    assert.equal(parseNewBattle({ ...body, survival: 1 }), null);
    assert.equal(parseNewBattle({ ...body, tower: true }), null);
    assert.deepEqual(
      parseNewBattle({ ...body, reserveCompanions: ["leThach", "toKim"] })
        ?.reserveCompanions,
      ["leThach", "toKim"],
    );
    assert.equal(
      parseNewBattle({ ...body, reserveCompanions: ["leThach", "leThach"] }),
      null,
    );
    assert.equal(
      parseNewBattle({
        ...body,
        reserveCompanions: ["leThach", "toKim", "phungPhong"],
      }),
      null,
    );
    assert.equal(
      parseNewBattle({ ...input, reserveCompanions: ["leThach"] }),
      null,
    );
    const r = await createBattleFor("g_s", parseNewBattle(body)!, deps);
    assert.ok(r.ok);
    assert.equal("seed" in r.view.survival!, false);
    assert.equal(JSON.stringify(r.view).includes("seed"), false);
    assert.equal(r.view.survival!.wave, 1);
    assert.equal(r.view.survival!.next!.wave, 2);
    assert.equal(r.view.battle.turn.side, 0);
    assert.equal(r.view.battle.sides[1].fighters.length, 2);
    assert.equal(r.view.battle.sides[0].fighters.length, 3);
    const saved = await store.get(r.id);
    assert.deepEqual(saved!.match.survival!.roster.activeIds, [
      "dinhBoLinh",
      "haVan",
      "maiThanh",
    ]);
    assert.deepEqual(saved!.match.survival!.roster.reserveIds, [
      "leThach",
      "toKim",
    ]);
    const prematureNextWave = await actBattle(
      r.id,
      "g_s",
      { seq: saved!.match.seq, action: { type: "nextWave" } },
      { store, profiles, now: T0 + 500 },
    );
    assert.ok(!prematureNextWave.ok);
    assert.equal(prematureNextWave.error, "noBreak");
    assert.equal((await store.get(r.id))!.match.survival!.wave, 1);

    const reserveEntry = saved!.match.survival!.roster.entries["leThach"]!;
    assert.equal(reserveEntry.location.kind, "reserve");
    assert.ok(reserveEntry.location.kind === "reserve");
    const withDownedReserve = {
      ...saved!.match,
      survival: {
        ...saved!.match.survival!,
        roster: {
          ...saved!.match.survival!.roster,
          entries: {
            ...saved!.match.survival!.roster.entries,
            leThach: {
              ...reserveEntry,
              downedAtWave: 1,
              location: {
                kind: "reserve" as const,
                runtime: { hp: 0, energy: 33 },
              },
            },
            toKim: {
              ...saved!.match.survival!.roster.entries["toKim"]!,
              location: {
                kind: "reserve" as const,
                runtime: {
                  hp:
                    saved!.match.survival!.roster.entries["toKim"]!
                      .snapshot.config.maxHp - 300,
                  energy: 42,
                },
              },
            },
          },
        },
      },
      seq: saved!.match.seq + 1,
    };
    assert.ok(
      await store.save(
        { ...saved!, match: withDownedReserve },
        saved!.match.seq,
      ),
    );

    // Phe người chơi vừa hạ hết đợt 1.
    const win = async () => {
      const rec = (await store.get(r.id))!;
      const battle = structuredClone(rec.match.battle);
      if (rec.match.survival!.wave === 1) {
        battle.sides[0].fighters[0]!.hp -= 100;
        battle.sides[0].fighters[0]!.effects = [
          { kind: "burn", value: 1, turns: 1 },
        ];
        battle.sides[0].fighters[1]!.hp = 0;
        battle.sides[0].fighters[0]!.energy = 37;
        battle.sides[0].rage = 64;
      }
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
    const savedBreak = (await store.get(r.id))!.match;
    const breakPreview = rest.view.survival!.break;
    assert.ok(breakPreview);
    assert.deepEqual(breakPreview.activeIds, ["dinhBoLinh", "haVan", "maiThanh"]);
    assert.deepEqual(breakPreview.reserveIds, ["leThach", "toKim"]);
    assert.equal(
      breakPreview.leaderBuildBasis?.profession,
      savedBreak.survival!.roster.entries["dinhBoLinh"]!.snapshot.config.profession,
    );
    assert.equal(
      breakPreview.leaderBuildBasis?.element,
      savedBreak.survival!.roster.entries["dinhBoLinh"]!.snapshot.config.element,
    );
    assert.equal(breakPreview.leaderBuildBasis?.progress.level, 1);
    assert.equal(
      breakPreview.leaderBuildBasis?.hp,
      breakPreview.fighters.find((fighter) => fighter.id === "dinhBoLinh")?.hpAfterRecovery,
    );
    assert.equal(breakPreview.foodCurrent, savedBreak.battle.sides[0].food);
    assert.equal(
      breakPreview.foodAfterSupply,
      Math.min(FOOD_MAX, savedBreak.battle.sides[0].food + SURVIVAL_FOOD),
    );
    assert.equal(breakPreview.canPayRevive, true);
    assert.equal(
      breakPreview.foodAfterPaidRevive,
      breakPreview.foodAfterSupply - SURVIVAL_REVIVE_FOOD,
    );
    const previewLeader = breakPreview.fighters.find(
      (fighter) => fighter.id === "dinhBoLinh",
    )!;
    assert.equal(
      previewLeader.hpAfterRecovery,
      Math.min(
        previewLeader.maxHp,
        previewLeader.hpBeforeRecovery +
          Math.round(previewLeader.maxHp * SURVIVAL_HEAL),
      ),
    );
    const previewReserve = breakPreview.fighters.find(
      (fighter) => fighter.id === "toKim",
    )!;
    assert.equal(previewReserve.location, "reserve");
    assert.equal(
      previewReserve.hpAfterRecovery,
      Math.min(
        previewReserve.maxHp,
        previewReserve.hpBeforeRecovery +
          Math.round(previewReserve.maxHp * SURVIVAL_RESERVE_HEAL),
      ),
    );
    assert.equal(previewReserve.energy, 42);
    const previewDownedReserve = breakPreview.fighters.find(
      (fighter) => fighter.id === "leThach",
    )!;
    assert.equal(previewDownedReserve.hpAfterRecovery, 0);
    assert.equal(previewDownedReserve.roundsUntilAutoRevive, 1);
    assert.equal(previewDownedReserve.autoRevive, false);
    const activeBeforeNextWave = savedBreak.battle.sides[0].fighters[0]!;
    const foodBeforeNextWave = savedBreak.battle.sides[0].food;
    const boardBeforeNextWave = structuredClone(savedBreak.battle.board);
    const boardRngBeforeNextWave = savedBreak.battle.boardRng;
    const aiRngBeforeNextWave = savedBreak.battle.aiRng;
    assert.equal(savedBreak.battle.winner, 0);
    assert.equal(savedBreak.survival!.settledThroughWave, 0);

    // Reload/fetch at BREAK is read-only with respect to recovery and supply settlement.
    const reloadedBreak = await getBattle(r.id, "g_s", {
      store,
      profiles,
      now: T0 + 1500,
    });
    assert.ok(reloadedBreak.ok && !reloadedBreak.outcome);
    const stillAtBreak = (await store.get(r.id))!.match;
    assert.equal(stillAtBreak.battle.sides[0].fighters[0]!.hp, activeBeforeNextWave.hp);
    assert.equal(stillAtBreak.battle.sides[0].fighters[0]!.energy, 37);
    assert.equal(stillAtBreak.battle.sides[0].food, foodBeforeNextWave);
    assert.equal(stillAtBreak.survival!.settledThroughWave, 0);

    const forgedRotation = await actBattle(
      r.id,
      "g_s",
      {
        seq,
        action: {
          type: "nextWave",
          activeIds: ["dinhBoLinh", "leThach", "toKim"],
          hp: 999999,
          energy: 999999,
        },
      },
      { store, profiles, now: T0 + 1750 },
    );
    assert.deepEqual(forgedRotation, { ok: false, error: "badRequest" });
    const unchangedBreak = (await store.get(r.id))!.match;
    assert.equal(unchangedBreak.seq, savedBreak.seq);
    assert.equal(unchangedBreak.survival!.wave, 1);
    assert.equal(unchangedBreak.battle.winner, 0);

    const invalidLeaderBuild = await actBattle(
      r.id,
      "g_s",
      {
        seq,
        action: {
          type: "nextWave",
          leaderBuild: { profession: "not-a-profession" },
        },
      },
      { store, profiles, now: T0 + 1800 },
    );
    assert.ok(!invalidLeaderBuild.ok);
    assert.equal(invalidLeaderBuild.error, "invalidProfession");
    assert.equal((await store.get(r.id))!.match.seq, savedBreak.seq);

    const next = await actBattle(
      r.id,
      "g_s",
      {
        seq,
        action: {
          type: "nextWave",
          revive: "leThach",
          activeIds: ["dinhBoLinh", "leThach", "toKim"],
          leaderBuild: { profession: "phapSu", element: "hoa" },
        },
      },
      { store, profiles, now: T0 + 2000 },
    );
    assert.ok(next.ok && !next.outcome);
    assert.equal(next.view.survival!.wave, 2);
    assert.equal(next.view.battle.winner, null);
    const transitioned = (await store.get(r.id))!.match;
    const leaderSnapshot =
      transitioned.survival!.roster.entries["dinhBoLinh"]!.snapshot;
    assert.equal(leaderSnapshot.config.profession, "phapSu");
    assert.equal(leaderSnapshot.config.element, "hoa");
    const expectedLeaderConfig = buildMain(
      leaderSnapshot.mainBuild!.progress,
      "hoa",
      "phapSu",
    );
    assert.equal(leaderSnapshot.config.maxHp, expectedLeaderConfig.maxHp);
    assert.equal(
      transitioned.battle.sides[0].fighters[0]!.hp,
      Math.round(
        (Math.min(
          activeBeforeNextWave.maxHp,
          activeBeforeNextWave.hp +
            Math.round(activeBeforeNextWave.maxHp * SURVIVAL_HEAL),
        ) /
          activeBeforeNextWave.maxHp) *
          expectedLeaderConfig.maxHp,
      ),
    );
    assert.equal(
      transitioned.battle.sides[0].fighters[0]!.maxHp,
      expectedLeaderConfig.maxHp,
    );
    assert.equal(transitioned.battle.sides[0].fighters[0]!.energy, 37);
    assert.deepEqual(transitioned.battle.sides[0].fighters[0]!.effects, []);
    assert.equal(transitioned.battle.sides[0].rage, 64);
    assert.equal(
      transitioned.battle.sides[0].food,
      Math.min(FOOD_MAX, foodBeforeNextWave + SURVIVAL_FOOD) -
        SURVIVAL_REVIVE_FOOD -
      FOOD_UPKEEP_BINH_LINH,
    );
    assert.deepEqual(transitioned.battle.board, boardBeforeNextWave);
    assert.equal(transitioned.battle.boardRng, boardRngBeforeNextWave);
    assert.equal(transitioned.battle.aiRng, aiRngBeforeNextWave);
    assert.equal(transitioned.survival!.settledThroughWave, 1);
    assert.deepEqual(transitioned.survival!.roster.activeIds, [
      "dinhBoLinh",
      "leThach",
      "toKim",
    ]);
    assert.equal(
      transitioned.survival!.roster.entries["leThach"]!.revivedAtWave,
      2,
    );
    assert.deepEqual(transitioned.survival!.roster.reserveIds, [
      "haVan",
      "maiThanh",
    ]);
    assert.equal(
      transitioned.survival!.roster.entries["haVan"]!.downedAtWave,
      1,
    );
    assert.deepEqual(
      transitioned.survival!.roster.entries["haVan"]!.location,
      { kind: "reserve", runtime: { hp: 0, energy: 0 } },
    );
    assert.deepEqual(
      transitioned.battle.sides[0].fighters.map((fighter) => fighter.id),
      ["dinhBoLinh", "leThach", "toKim"],
    );
    assert.equal(transitioned.battle.sides[0].leader, 0);
    assert.equal(transitioned.battle.sides[0].fighters.length, 3);
    assert.equal(transitioned.battle.turn.side, 0);
    assert.ok(transitioned.battle.turn.actor >= 0 && transitioned.battle.turn.actor < 3);
    assert.ok(
      transitioned.battle.sides[0].fighters[transitioned.battle.turn.actor]!.hp > 0,
    );
    assert.equal(transitioned.battle.turn.acted.length, 0);
    assert.equal(transitioned.battle.turn.lastActor, null);
    assert.equal(transitioned.battle.lastActors[0], null);
    assert.equal(transitioned.battle.sides[0].fighters[0]!.spirit, 100);
    assert.equal(transitioned.battle.sides[0].fighters[1]!.spirit, 100);
    assert.deepEqual(
      transitioned.battle.sides[0].fighters[1]!.skills,
      transitioned.survival!.roster.entries["leThach"]!.snapshot.config.skills,
    );
    assert.ok(
      fighterSkill(
        transitioned.battle.sides[0].fighters[1]!,
        transitioned.battle.sides[0].fighters[1]!.skills![0]!,
      ),
    );
    assert.equal(
      transitioned.battle.sides[0].fighters[1]!.hp,
      Math.max(
        1,
        Math.round(
          transitioned.survival!.roster.entries["leThach"]!.snapshot.config
            .maxHp * SURVIVAL_REVIVE_HP,
        ),
      ),
    );
    assert.equal(transitioned.battle.sides[0].fighters[1]!.energy, 0);
    const toKimInitialHp =
      saved!.match.survival!.roster.entries["toKim"]!.snapshot.config.maxHp -
      300;
    assert.equal(
      transitioned.battle.sides[0].fighters[2]!.hp,
      Math.min(
        transitioned.battle.sides[0].fighters[2]!.maxHp,
        toKimInitialHp +
          Math.round(
            transitioned.battle.sides[0].fighters[2]!.maxHp *
              SURVIVAL_RESERVE_HEAL,
          ),
      ),
    );
    assert.equal(transitioned.battle.sides[0].fighters[2]!.energy, 42);
    assert.ok(
      transitioned.battle.sides[0].fighters.every(
        (fighter) => !["haVan", "maiThanh"].includes(fighter.id),
      ),
    );
    const reserveAfterRevive = (await store.get(r.id))!.match.survival!
      .roster.entries["leThach"]!;
    assert.equal(reserveAfterRevive.downedAtWave, null);
    assert.deepEqual(reserveAfterRevive.location, {
      kind: "active",
      slot: 1,
    });
    const duplicateRevive = await actBattle(
      r.id,
      "g_s",
      {
        seq,
        action: {
          type: "nextWave",
          revive: "leThach",
          activeIds: ["dinhBoLinh", "leThach", "toKim"],
          leaderBuild: { profession: "phapSu", element: "hoa" },
        },
      },
      { store, profiles, now: T0 + 2001 },
    );
    assert.ok(!duplicateRevive.ok);
    assert.equal(duplicateRevive.error, "staleSeq");
    const afterDuplicate = (await store.get(r.id))!.match.survival!.roster
      .entries["leThach"]!;
    assert.deepEqual(afterDuplicate, reserveAfterRevive);

    const nextMove = findValidMoves(transitioned.battle.board)[0]!;
    const afterRotationMove = await actBattle(
      r.id,
      "g_s",
      { seq: transitioned.seq, action: { type: "swap", ...nextMove } },
      { store, profiles, now: T0 + 2100 },
    );
    assert.ok(afterRotationMove.ok && !afterRotationMove.outcome);
    assert.ok(afterRotationMove.events.some(
      (event) => event.type === "turnStart" && event.side === 1,
    ));
    assert.deepEqual(
      afterRotationMove.view.battle.sides[0].fighters.map((fighter) => fighter.id),
      ["dinhBoLinh", "leThach", "toKim"],
    );

    seq = await win();
    const beforeSingleRotation = (await store.get(r.id))!.match;
    const rotateOne = await actBattle(
      r.id,
      "g_s",
      {
        seq,
        action: {
          type: "nextWave",
          activeIds: ["dinhBoLinh", "leThach", "maiThanh"],
        },
      },
      { store, profiles, now: T0 + 2500 },
    );
    assert.ok(rotateOne.ok && !rotateOne.outcome);
    assert.deepEqual(
      rotateOne.view.battle.sides[0].fighters.map((fighter) => fighter.id),
      ["dinhBoLinh", "leThach", "maiThanh"],
    );
    assert.equal(rotateOne.view.battle.sides[0].fighters[2]!.energy,
      beforeSingleRotation.survival!.roster.entries["maiThanh"]!.location.kind === "reserve"
        ? beforeSingleRotation.survival!.roster.entries["maiThanh"]!.location.runtime.energy
        : -1,
    );

    seq = await win();
    const beforeEndRun = (await store.get(r.id))!.match;
    const end = await actBattle(
      r.id,
      "g_s",
      { seq, action: { type: "endRun" } },
      { store, profiles, leaderboard, now: T0 + 3000 },
    );
    assert.ok(end.ok && end.outcome?.survival);
    assert.deepEqual(end.outcome.survival, {
      cleared: 3,
      best: 3,
      newBest: true,
      gold: 30,
    });
    assert.equal(end.outcome.rewards.won, true);
    const afterEndRun = (await store.get(r.id))!.match;
    assert.equal(
      afterEndRun.battle.sides[0].fighters[0]!.hp,
      beforeEndRun.battle.sides[0].fighters[0]!.hp,
    );
    assert.equal(
      afterEndRun.battle.sides[0].food,
      beforeEndRun.battle.sides[0].food,
    );
    assert.equal(
      afterEndRun.survival!.settledThroughWave,
      beforeEndRun.survival!.settledThroughWave,
    );
    const p = (await loadProfile(profiles, "g_s")).profile;
    assert.equal(p.survival.best, 3);
    // Nhiệm vụ: một trận sinh tồn, thắng, vượt 3 đợt.
    assert.equal(p.quests.weekStats.waves, 3);
    assert.equal(p.quests.totals.play, 1);
    // Bảng xếp hạng sinh tồn ghi ngay khi cộng thưởng.
    assert.deepEqual(await leaderboard.rankOf("survival", "g_s"), {
      rank: 1,
      score: 3,
    });
  });

  it("server từ chối fighter đã biết nhưng chưa được sở hữu trong roster Survival", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = {
      store,
      profiles,
      now: T0,
      seed: 22,
      newId: () => "m_s_forged",
    };
    const forgedActive = parseNewBattle({
      ...input,
      companions: ["tranCuong", "maiThanh"],
      survival: true,
    });
    assert.ok(forgedActive);
    assert.deepEqual(
      await createBattleFor("g_s_forged", forgedActive, deps),
      { ok: false, error: "badRequest" },
    );

    const forgedReserve = parseNewBattle({
      ...input,
      survival: true,
      reserveCompanions: ["tranCuong"],
    });
    assert.ok(forgedReserve);
    assert.deepEqual(
      await createBattleFor("g_s_forged", forgedReserve, deps),
      { ok: false, error: "badRequest" },
    );
    assert.equal(await store.get("m_s_forged"), null);

    const validWithReserves = parseNewBattle({
      ...input,
      survival: true,
      reserveCompanions: ["leThach", "toKim"],
    });
    assert.ok(validWithReserves);
    const created = await createBattleFor(
      "g_s_valid_roster",
      validWithReserves,
      { ...deps, newId: () => "m_s_valid_roster" },
    );
    assert.ok(created.ok);
    const record = await store.get(created.id);
    assert.deepEqual(record!.match.survival!.roster.reserveIds, [
      "leThach",
      "toKim",
    ]);
    assert.deepEqual(
      Object.keys(record!.match.survival!.roster.entries).sort(),
      ["dinhBoLinh", "haVan", "leThach", "maiThanh", "toKim"].sort(),
    );
    assert.equal(record!.match.battle.sides[0].fighters.length, 3);
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

describe("đấu trường bóng ma", () => {
  it("bày đối thủ, đánh đội phòng thủ của người khác, cộng điểm cả hai bên, hết lượt trong ngày", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const arena = new MemoryArenaStore();
    const leaderboard = new MemoryLeaderboardStore();
    const base = { arena, profiles, leaderboard, now: T0 };
    // g_b mở đấu trường trước: có đội phòng thủ, lên bảng ở điểm khởi đầu.
    await arenaView("g_b", "view", { ...base, seed: 1 });
    const view = await arenaView("g_a", "view", { ...base, seed: 2 });
    assert.equal(view.rating, ARENA_START);
    assert.equal(view.attacksLeft, ARENA_ATTACKS_PER_DAY);
    assert.equal(view.offers.length, ARENA_OFFERS);
    const real = view.offers.findIndex((o) => !o.bot);
    assert.ok(real >= 0);
    assert.equal(view.offers.filter((o) => o.bot).length, ARENA_OFFERS - 1);
    // Không lộ id chủ đội.
    assert.ok(view.offers.every((o) => !("owner" in o)));

    assert.equal(parseNewBattle({ arena: ARENA_OFFERS }), null);
    assert.equal(parseNewBattle({ arena: "0" }), null);
    const deps = {
      store,
      profiles,
      arena,
      leaderboard,
      now: T0,
      seed: 6,
      newId: () => "m_a1",
    };
    const r = await createBattleFor(
      "g_a",
      parseNewBattle({ arena: real })!,
      deps,
    );
    assert.ok(r.ok);
    assert.equal(r.view.arena!.name, view.offers[real]!.name);
    assert.equal(
      r.view.battle.sides[1].fighters[0]!.name,
      view.offers[real]!.name,
    );
    // Đối thủ đã bày bị xóa sau khi đánh.
    assert.equal((await arena.get("g_a"))!.offers.length, 0);

    const rec = (await store.get(r.id))!;
    const battle = structuredClone(rec.match.battle);
    battle.sides[1].fighters.forEach((f) => (f.hp = 0));
    battle.winner = 0;
    await store.save(
      { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
      rec.match.seq,
    );
    const goldBefore = (await loadProfile(profiles, "g_a")).profile.gold;
    const end = await getBattle(r.id, "g_a", {
      store,
      profiles,
      arena,
      leaderboard,
      now: T0 + 1000,
    });
    assert.ok(end.ok && end.outcome?.arena);
    assert.deepEqual(end.outcome.arena, {
      won: true,
      opponent: view.offers[real]!.name,
      delta: 16,
      rating: ARENA_START + 16,
      gold: ARENA_WIN_GOLD,
    });
    const p = (await loadProfile(profiles, "g_a")).profile;
    assert.equal(
      p.gold,
      goldBefore + end.outcome.rewards.gold + ARENA_WIN_GOLD,
    );
    const b = (await arena.get("g_b"))!;
    assert.equal(b.rating, ARENA_START - 8);
    assert.equal(b.defenseLosses, 1);
    assert.deepEqual(await leaderboard.rankOf("arena", "g_a"), {
      rank: 1,
      score: ARENA_START + 16,
    });
    assert.deepEqual(await leaderboard.rankOf("arena", "g_b"), {
      rank: 2,
      score: ARENA_START - 8,
    });

    // Mở lại trang thì có đối thủ mới; dùng hết lượt trong ngày thì không đánh được nữa.
    const again = await arenaView("g_a", "view", { ...base, seed: 3 });
    assert.equal(again.offers.length, ARENA_OFFERS);
    assert.equal(again.attacksLeft, ARENA_ATTACKS_PER_DAY - 1);
    assert.equal(again.wins, 1);
    for (let i = 1; i < ARENA_ATTACKS_PER_DAY; i++)
      assert.ok(
        await arena.useAttack("g_a", arenaDay(T0), ARENA_ATTACKS_PER_DAY, T0),
      );
    const limited = await createBattleFor(
      "g_a",
      parseNewBattle({ arena: 0 })!,
      { ...deps, newId: () => "m_a2" },
    );
    assert.deepEqual(limited, { ok: false, error: "arenaLimit" });
    assert.equal(httpStatus("arenaLimit"), 409);
  });

  it("chủ đội đã bị xóa thì báo và bày đối thủ mới", async () => {
    const arena = new MemoryArenaStore();
    const profiles = new MemoryProfileStore();
    await arena.ensure("g_a", T0);
    await arena.setOffers("g_a", [
      {
        owner: "g_xoa",
        name: "Khách _xoa",
        rating: 1000,
        members: [],
        power: 0,
      },
    ]);
    const r = await createBattleFor("g_a", parseNewBattle({ arena: 0 })!, {
      store: new MemoryMatchStore(),
      profiles,
      arena,
      now: T0,
      seed: 1,
      newId: () => "m_g",
    });
    assert.deepEqual(r, { ok: false, error: "arenaGone" });
    assert.equal((await arena.get("g_a"))!.offers.length, 0);
  });
});

it('API tạo trận không chuyển cấu hình Tinh thần thử nghiệm hoặc audit vào cấu hình ứng dụng', () => {
  const input = parseNewBattle({ mode: '3v3', element: 'moc', profession: 'ySu', companions: ['haVan', 'leThach'], difficulty: 'normal', experimentalSpirit: 'B', audit: true });
  assert.ok(input);
  assert.equal('experimentalSpirit' in input, false);
  assert.equal('audit' in input, false);
});
