import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import {
  botDefense,
  createSurvivalRoster,
  mainCharacter,
  MAIN_ID,
  type Match,
  newProfile,
  newSurvivalRun,
  startMatch,
  STARTER_COMPANIONS,
  survivalActiveSideConfig,
  survivalWave,
  syncSurvivalRosterState,
  updateSurvivalFighterRuntime,
} from "../../src/core";
import { DrizzleAccountStore } from "../../src/server/db/accounts";
import { DrizzleDailyStore } from "../../src/server/db/daily";
import { DrizzleLeaderboardStore } from "../../src/server/db/leaderboard";
import { DrizzleArenaStore } from "../../src/server/db/arena";
import { DrizzleDestinyLeaderboardStore } from "../../src/server/db/destinyLeaderboard";
import { MemoryArenaStore, type ArenaStore } from "../../src/server/arena";
import { MemoryLeaderboardStore, type LeaderboardStore } from "../../src/server/leaderboard";
import { DrizzleProfileStore } from "../../src/server/db/profiles";
import { DrizzleMatchStore, type Db } from "../../src/server/db/store";
import { signIn } from "../../src/server/accounts";
import { deleteExpiredTokens } from "../../src/server/db/maintenance";
import { matches } from "../../src/server/db/schema";

describe("lưu trận vào Postgres (PGlite, cùng migration với Neon)", () => {
  it("tạo, đọc, ghi kèm điều kiện seq", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleMatchStore(db as unknown as Db);
    const { match } = startMatch({
      sides: [
        { fighters: [mainCharacter()], leader: 0 },
        { fighters: [STARTER_COMPANIONS[0]!], leader: 0 },
      ],
      difficulty: "normal",
      seed: 9,
      firstSide: 0,
      now: 1000,
    });

    const record = { id: "m_1", ownerId: "g_1", match, createdAt: 1000, updatedAt: 1000 };
    await store.create(record);
    assert.deepEqual(await store.get("m_1"), record);
    assert.equal(await store.get("m_khong"), null);
    const next = { ...record, match: { ...match, seq: match.seq + 1 }, updatedAt: 2000 };
    const competing = {
      ...next,
      updatedAt: 2500,
      match: { ...next.match, lastHumanAt: 2500 },
    };
    const writes = await Promise.all([
      store.save(next, match.seq),
      store.save(competing, match.seq),
    ]);
    assert.deepEqual(writes.sort(), [false, true]);
    assert.equal((await store.get("m_1"))!.match.seq, match.seq + 1);
    assert.deepEqual(
      (
        await Promise.all([
        store.claimReward("m_1", 3000),
        store.claimReward("m_1", 4000),
        ])
      ).sort(),
      [false, true],
    );
    assert.equal(await store.claimReward("m_khong", 4000), false);
  });

  it("Survival V2 được resume giữa round và break, legacy chỉ active được nâng cấp", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleMatchStore(db as unknown as Db);
    const originalProfile = newProfile();
    const profile = {
      ...originalProfile,
      profession: "phapSu" as const,
      element: "hoa" as const,
    };
    const rosterResult = createSurvivalRoster(
      profile,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(rosterResult.ok);
    const run = {
      ...newSurvivalRun(profile, 1234, rosterResult.roster),
      wave: 2,
    };
    const side = survivalActiveSideConfig(run.roster);
    assert.ok(side.ok);
    const { match: started } = startMatch({
      sides: [
        side.value,
        { fighters: survivalWave(run, 2).foes, leader: 0 },
      ],
      difficulty: "easy",
      seed: 99,
      firstSide: 0,
      now: 100,
      survival: run,
    });
    const activeUpdate = updateSurvivalFighterRuntime(
      run,
      started.battle,
      "haVan",
      { hp: 41, energy: 62 },
      2,
    );
    assert.ok(activeUpdate.ok);
    const reserveUpdate = updateSurvivalFighterRuntime(
      activeUpdate.value.run,
      activeUpdate.value.battle,
      "leThach",
      { hp: 0, energy: 27 },
      2,
    );
    assert.ok(reserveUpdate.ok);
    const sync = syncSurvivalRosterState(
      reserveUpdate.value.run,
      reserveUpdate.value.battle,
    );
    assert.ok(sync.ok);

    const midRound = {
      ...started,
      battle: reserveUpdate.value.battle,
      survival: sync.value,
    };
    const record = {
      id: "m_survival_v2",
      ownerId: "g_1",
      match: midRound,
      createdAt: 100,
      updatedAt: 100,
    };
    await store.create(record);
    const resumed = await store.get(record.id);
    assert.ok(resumed);
    assert.deepEqual(resumed.match.survival, sync.value);
    assert.deepEqual(
      resumed.match.survival.roster.activeIds,
      [MAIN_ID, "haVan", "maiThanh"],
    );
    assert.deepEqual(
      resumed.match.survival.roster.reserveIds,
      ["leThach", "toKim"],
    );
    assert.equal(
      resumed.match.survival.roster.entries[MAIN_ID]!.snapshot.config.profession,
      profile.profession,
    );
    assert.equal(
      resumed.match.survival.roster.entries[MAIN_ID]!.snapshot.config.element,
      profile.element,
    );
    assert.equal(resumed.match.battle.sides[0].fighters[1]!.hp, 41);
    assert.equal(resumed.match.battle.sides[0].fighters[1]!.energy, 62);
    assert.equal(
      resumed.match.survival.roster.entries["leThach"]!.location.kind === "reserve"
        ? resumed.match.survival.roster.entries["leThach"]!.location.runtime.energy
        : -1,
      27,
    );
    assert.equal(
      resumed.match.survival.roster.entries["leThach"]!.downedAtWave,
      2,
    );
    assert.deepEqual(originalProfile, newProfile());

    const atBreak = {
      ...midRound,
      battle: { ...midRound.battle, winner: 0 as const },
    };
    const breakRecord = {
      ...record,
      id: "m_survival_break",
      match: atBreak,
    };
    await store.create(breakRecord);
    const resumedBreak = await store.get(breakRecord.id);
    assert.ok(resumedBreak);
    assert.equal(resumedBreak.match.battle.winner, 0);
    assert.deepEqual(resumedBreak.match.survival!.roster, sync.value.roster);
    assert.equal(resumedBreak.match.survival!.seed, 1234);

    const legacy = {
      ...midRound,
      survival: {
        seed: 4321,
        baseLevel: run.baseLevel,
        wave: 2,
        downed: [null, 2, null],
        done: false,
      },
      battle: {
        ...midRound.battle,
        sides: [
          {
            ...midRound.battle.sides[0],
            fighters: midRound.battle.sides[0].fighters.map((fighter, i) =>
              i === 1 ? { ...fighter, hp: 0 } : fighter,
            ),
          },
          midRound.battle.sides[1],
        ],
      },
    };
    await db
      .update(matches)
      .set({ state: legacy as unknown as Match })
      .where(eq(matches.id, record.id));
    const upgraded = await store.get(record.id);
    assert.ok(upgraded);
    assert.equal(upgraded.match.survival!.stateVersion, 2);
    assert.deepEqual(
      upgraded.match.survival!.roster.activeIds,
      [MAIN_ID, "haVan", "maiThanh"],
    );
    assert.deepEqual(upgraded.match.survival!.roster.reserveIds, []);
    assert.equal(upgraded.match.survival!.roster.entries["haVan"]!.snapshot.config.id, "haVan");
    assert.equal(upgraded.match.survival!.roster.entries["haVan"]!.downedAtWave, 2);
    assert.equal(upgraded.match.survival!.roster.entries["haVan"]!.snapshot.equipment.kind, "legacyEmbedded");
    assert.equal(upgraded.match.battle.sides[0].fighters[1]!.hp, 0);
    assert.equal(upgraded.match.survival!.seed, 4321);

    await db
      .update(matches)
      .set({
        state: {
          ...upgraded.match,
          survival: { ...upgraded.match.survival!, stateVersion: 99 },
        } as unknown as Match,
      })
      .where(eq(matches.id, record.id));
    await assert.rejects(
      store.get(record.id),
      /Invalid stored Survival state/,
    );
  });

  it("hồ sơ: tạo lần đầu, ghi kèm điều kiện version", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleProfileStore(db as unknown as Db);
    const p = newProfile();
    assert.equal(await store.get("g_1"), null);
    assert.equal(await store.put("g_1", p, 0, 1000), true);
    assert.equal(await store.put("g_1", p, 0, 1000), false);
    const rich = { ...p, gold: 50 };
    assert.equal(await store.put("g_1", rich, 1, 2000), true);
    assert.equal(await store.put("g_1", p, 1, 3000), false);
    assert.deepEqual(await store.get("g_1"), { profile: rich, version: 2 });
  });

  it("tài khoản: gắn danh tính, vào lại, gắn thêm nhà cung cấp, danh tính không đổi chủ", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleAccountStore(db as unknown as Db);
    const google = { provider: "google" as const, subject: "s1", name: "Shan", avatarUrl: null };
    assert.equal(await signIn(store, google, "g_1", 10, () => "g_moi"), "g_1");
    assert.equal(await signIn(store, { ...google, name: "Shan mới" }, "g_2", 20, () => "g_moi"), "g_1");
    assert.equal(await signIn(store, { provider: "github", subject: "7", name: "gh", avatarUrl: "https://a" }, "g_1", 30, () => "g_moi"), "g_1");
    assert.deepEqual(await store.get("g_1"), {
      id: "g_1",
      name: "gh",
      avatarUrl: "https://a",
      providers: ["github", "google"],
      username: null,
      email: null,
      createdAt: 10,
      lastLoginAt: 30,
    });
    // Gắn thẳng danh tính đã có chủ vào tài khoản khác: vẫn thuộc chủ cũ.
    assert.equal(await store.link("g_3", google, 40), "g_1");
    assert.equal(await store.get("g_2"), null);
  });

  it("email và mã một lần: email duy nhất, lấy mã một lần, đếm, xóa, dọn mã hết hạn", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleAccountStore(db as unknown as Db);
    await store.createPassword("g_1", "shan", "h", 1);
    await store.createPassword("g_2", "khac", "h", 1);
    assert.equal(await store.setEmail("g_1", "shan@vi.du"), true);
    assert.equal(await store.setEmail("g_1", "shan@vi.du"), true);
    assert.equal(await store.setEmail("g_2", "shan@vi.du"), false);
    assert.equal(await store.setEmail("g_khong", "a@vi.du"), false);
    assert.equal((await store.get("g_1"))?.email, "shan@vi.du");
    assert.equal((await store.get("g_2"))?.email, null);
    assert.equal(await store.accountByEmail("shan@vi.du"), "g_1");
    assert.equal(await store.accountByEmail("ai@vi.du"), null);

    const t = { tokenHash: "a", purpose: "reset", accountId: "g_1", email: "shan@vi.du", createdAt: 100, expiresAt: 200 } as const;
    await store.addToken(t);
    await store.addToken({ ...t, tokenHash: "b", createdAt: 150 });
    await store.addToken({ ...t, tokenHash: "c", purpose: "verify" });
    assert.equal(await store.countTokens("g_1", "reset", 0), 2);
    assert.equal(await store.countTokens("g_1", "reset", 120), 1);
    assert.equal(await store.takeToken("a", "verify", 110), null);
    assert.deepEqual(await store.takeToken("a", "reset", 110), t);
    assert.equal(await store.takeToken("a", "reset", 110), null);
    // Hết hạn: vẫn bị xóa, không trả về.
    assert.equal(await store.takeToken("b", "reset", 200), null);
    assert.equal(await store.countTokens("g_1", "reset", 0), 0);
    await store.addToken({ ...t, tokenHash: "d" });
    await store.deleteTokens("g_1", "reset");
    assert.equal(await store.countTokens("g_1", "reset", 0), 0);
    assert.equal(await store.countTokens("g_1", "verify", 0), 1);
    assert.equal(await deleteExpiredTokens(db as unknown as Db, 201), 1);
    assert.equal(await store.countTokens("g_1", "verify", 0), 0);
  });

  it("mật khẩu: tạo, trùng tên, cập nhật số lần sai và khóa, tên đăng nhập trong tài khoản", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleAccountStore(db as unknown as Db);
    assert.equal(await store.createPassword("g_1", "shan", "h1", 10), true);
    assert.equal(await store.createPassword("g_2", "shan", "h2", 11), false);
    assert.deepEqual(await store.getPassword("shan"), { accountId: "g_1", hash: "h1", failedCount: 0, lockedUntil: null });
    assert.equal(await store.getPassword("khong"), null);
    await store.updatePassword("shan", { failedCount: 3 });
    await store.updatePassword("shan", { lockedUntil: 99 });
    assert.deepEqual(await store.getPassword("shan"), { accountId: "g_1", hash: "h1", failedCount: 3, lockedUntil: 99 });
    await store.updatePassword("shan", { hash: "h3", failedCount: 0, lockedUntil: null });
    assert.deepEqual(await store.getPassword("shan"), { accountId: "g_1", hash: "h3", failedCount: 0, lockedUntil: null });
    const acc = await store.get("g_1");
    assert.equal(acc?.username, "shan");
    assert.equal(acc?.name, "shan");
    assert.deepEqual(acc?.providers, []);
    // Tài khoản GitHub có sẵn thêm mật khẩu: giữ tên hiển thị.
    await store.link("g_3", { provider: "github", subject: "9", name: "Gh", avatarUrl: null }, 20);
    assert.equal(await store.createPassword("g_3", "gh_user", "h", 21), true);
    assert.equal((await store.get("g_3"))?.name, "Gh");
  });

  it("thử thách ngày: mỗi người một lượt, xếp hạng theo điểm rồi giờ xong, kèm tên tài khoản", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const accounts = new DrizzleAccountStore(db as unknown as Db);
    await signIn(accounts, { provider: "google", subject: "1", name: "Shan", avatarUrl: null }, "g_a", 1, () => "g_x");
    const store = new DrizzleDailyStore(db as unknown as Db);
    const day = "2026-10-20";
    assert.equal(await store.start(day, "g_a", "m_a", 10), true);
    assert.equal(await store.start(day, "g_a", "m_khac", 11), false);
    assert.equal(await store.start(day, "g_b", "m_b", 12), true);
    assert.equal(await store.start(day, "g_c", "m_c", 13), true);
    assert.equal((await store.get(day, "g_a"))!.result, null);
    const win = (turns: number) => ({ won: true, turns, permille: 500, score: 1_000_000 - turns * 1000 + 500 });
    await store.finish(day, "g_a", win(30), 100);
    await store.finish(day, "g_b", win(20), 200);
    await store.finish(day, "g_c", win(30), 50);
    // Ghi lần hai không đổi kết quả.
    await store.finish(day, "g_b", win(40), 300);
    const top = await store.top(day, 10);
    assert.deepEqual(top.map((e) => e.ownerId), ["g_b", "g_c", "g_a"]);
    assert.equal(top[2]!.name, "Shan");
    assert.equal(top[0]!.name, null);
    assert.equal(top[0]!.result!.turns, 20);
    assert.equal(await store.rankOf(day, "g_a"), 3);
    assert.equal(await store.rankOf(day, "g_b"), 1);
    assert.equal(await store.rankOf("2026-10-21", "g_a"), null);
  });

  it("bảng xếp hạng: điểm cao trước, bằng điểm thì ai đạt trước; ghi lại cùng điểm không đổi mốc", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const accounts = new DrizzleAccountStore(db as unknown as Db);
    await signIn(accounts, { provider: "google", subject: "1", name: "Shan", avatarUrl: null }, "g_a", 1, () => "g_x");
    for (const store of [new DrizzleLeaderboardStore(db as unknown as Db), new MemoryLeaderboardStore()] as LeaderboardStore[]) {
      await store.submit("g_a", [{ board: "tower", score: 10 }], 100);
      await store.submit("g_b", [{ board: "tower", score: 10 }], 200);
      await store.submit("g_c", [{ board: "tower", score: 12 }, { board: "survival", score: 3 }], 300);
      // Cùng điểm gửi lại sau: g_a vẫn đạt trước g_b.
      await store.submit("g_a", [{ board: "tower", score: 10 }], 400);
      const top = await store.top("tower", 10);
      assert.deepEqual(top.map((e) => e.ownerId), ["g_c", "g_a", "g_b"]);
      assert.deepEqual(await store.rankOf("tower", "g_b"), { rank: 3, score: 10 });
      assert.equal(await store.rankOf("survival", "g_a"), null);
      await store.submit("g_b", [{ board: "tower", score: 15 }], 500);
      assert.deepEqual(await store.rankOf("tower", "g_b"), { rank: 1, score: 15 });
    }
    const top = await new DrizzleLeaderboardStore(db as unknown as Db).top("tower", 10);
    assert.equal(top.find((e) => e.ownerId === "g_a")!.name, "Shan");
  });

  it("BXH Destiny: migration, tie order, dedup và cycle isolation", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const store = new DrizzleDestinyLeaderboardStore(db as unknown as Db);
    const submit = (eventId: string, cycleId: string, ownerId: string, clearedFloor: number, totalTurns: number, completedAt: number) =>
      store.submit({ eventId, cycleId, ownerId, clearedFloor, totalTurns, completedAt });
    assert.equal(await submit("e1", "2026-10-19", "g_a", 5, 30, 100), true);
    assert.equal(await submit("e2", "2026-10-19", "g_b", 5, 20, 200), true);
    assert.equal(await submit("e3", "2026-10-19", "g_c", 6, 99, 300), true);
    assert.equal(await submit("e1", "2026-10-19", "g_a", 5, 30, 100), false);
    assert.equal(await submit("bad", "2026-10-19", "g_x", 0, 0, 0), false);
    assert.equal(await submit("next", "2026-10-26", "g_a", 1, 5, 400), true);
    assert.deepEqual((await store.page("2026-10-19", 0, 10)).map(({ ownerId }) => ownerId), ["g_c", "g_b", "g_a"]);
    assert.equal((await store.rankOf("2026-10-19", "g_a"))?.rank, 3);
    assert.equal((await store.rankOf("2026-10-26", "g_a"))?.rank, 1);
  });

  it("đấu trường: tạo hàng, đối thủ gần điểm nhất, giới hạn lượt trong ngày, cộng điểm không xuống dưới 0", async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "drizzle" });
    const accounts = new DrizzleAccountStore(db as unknown as Db);
    await signIn(accounts, { provider: "google", subject: "1", name: "Shan", avatarUrl: null }, "g_b", 1, () => "g_x");
    for (const store of [new DrizzleArenaStore(db as unknown as Db), new MemoryArenaStore()] as ArenaStore[]) {
      const a = await store.ensure("g_a", 10);
      assert.equal(a.rating, 1000);
      assert.equal(a.defense, null);
      assert.deepEqual(a.offers, []);
      // Gọi lại không tạo trùng, không đổi gì.
      assert.deepEqual(await store.ensure("g_a", 20), a);
      for (const [id, delta] of [["g_b", 100], ["g_c", -300], ["g_d", 20]] as const) {
        await store.ensure(id, 10);
        await store.setDefense(id, botDefense(1, 3), 10);
        await store.record(id, delta, "win", 10);
      }
      // g_e chưa có đội phòng thủ thì không bị bày.
      await store.ensure("g_e", 10);
      const c = await store.candidates("g_a", 1000, 2);
      assert.deepEqual(c.map((x) => x.ownerId), ["g_d", "g_b"]);
      assert.deepEqual(c[0]!.defense, botDefense(1, 3));
      const offers = [{ owner: "g_b", name: "Shan", rating: 1100, members: [], power: 0 }];
      await store.setOffers("g_a", offers);
      assert.deepEqual((await store.get("g_a"))!.offers, offers);

      assert.equal(await store.useAttack("g_a", "d1", 2, 30), true);
      assert.equal(await store.useAttack("g_a", "d1", 2, 30), true);
      assert.equal(await store.useAttack("g_a", "d1", 2, 30), false);
      assert.equal(await store.useAttack("g_a", "d2", 2, 40), true);
      assert.equal((await store.get("g_a"))!.attacks, 1);
      assert.equal(await store.useAttack("g_khong", "d2", 2, 40), false);

      assert.equal(await store.record("g_a", -2000, "loss", 50), 0);
      assert.equal(await store.record("g_a", 30, "defenseWin", 60), 30);
      const after = (await store.get("g_a"))!;
      assert.deepEqual([after.losses, after.defenseWins, after.wins], [1, 1, 0]);
      assert.equal(await store.record("g_khong", 5, "win", 60), null);
    }
    const named = await new DrizzleArenaStore(db as unknown as Db).candidates("g_a", 1100, 1);
    assert.equal(named[0]!.name, "Shan");
  });
});
