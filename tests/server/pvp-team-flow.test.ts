import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { PVP_ELO_START, PVP_GOLD_LOSS, PVP_GOLD_WIN, createRng, newProfile, pvpActorOwner } from "../../src/core";
import { chooseMove, toView } from "../../src/core/ai";
import { DrizzlePvpStore } from "../../src/server/db/pvp";
import type { Db } from "../../src/server/db/store";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import { MemoryPvpStore, pvpEnqueue, pvpGetMatch, pvpOverview, pvpPlay, type PvpDeps, type PvpStore } from "../../src/server/pvp";
import { pvpDraftGet, pvpDraftPlay, type PvpDraftView } from "../../src/server/pvpDraft";
import { PVP_TEAM_FILL_MS } from "../../src/server/pvpTeam";

// Luồng 3vs3 xếp hạng từ đầu đến cuối, nhiều tài khoản: xếp hàng, ghép nhóm, cấm chọn, chuẩn bị, chơi hết trận bằng bot
// (mỗi bot đi bằng AI qua đúng API như trình duyệt), rồi tính điểm hạng và vàng từng người.

const T0 = 1_700_000_000_000;
const six = ["f1", "f2", "f3", "f4", "f5", "f6"];

async function makeDb(): Promise<PvpStore> {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzlePvpStore(db as unknown as Db);
}

const stores: readonly [string, () => Promise<PvpStore>][] = [
  ["bộ nhớ", async () => new MemoryPvpStore()],
  ["Postgres (PGlite, cùng migration với Neon)", makeDb],
];

/** Hồ sơ có 8 tướng (đủ điều kiện vào 3vs3 xếp hạng). */
function rich() {
  const p = newProfile();
  const sample = p.companions.haVan!;
  return { ...p, companions: { ...p.companions, nguyenBac: structuredClone(sample), dinhDien: structuredClone(sample) } };
}

for (const [name, factory] of stores) {
  describe(`PvP 3vs3 xếp hạng, trọn luồng (${name})`, () => {
    let n = 0;
    const setup = async (users: readonly string[]) => {
      const pvp = await factory();
      const profiles: ProfileStore = new MemoryProfileStore();
      for (const id of users) await profiles.put(id, rich(), 0, T0);
      const mk = (now: number): PvpDeps => ({ pvp, profiles, now, seed: 4242 + n++, newId: () => `flow-${++n}`, nameOf: async (id) => `Tên ${id}` });
      return { pvp, profiles, mk };
    };

    /** Mọi người ra hàng đợi, hỏi lại đều đặn như client thật, cấm chọn bằng bot, chuẩn bị xong: trả mã trận. */
    const toMatch = async (mk: (t: number) => PvpDeps, users: readonly string[], active: readonly string[], fill = false) => {
      for (const u of users) assert.deepEqual(await pvpEnqueue(u, "team", mk(T0)), { ok: true });
      let t = T0;
      let draftId: string | null = null;
      // Chỉ người còn hoạt động hỏi lại; chờ đủ lâu thì máy điền chỗ trống.
      for (let guard = 0; guard < 80 && !draftId; guard++) {
        t += 1000 * (fill ? 1 : 0.2);
        for (const u of active) draftId = (await pvpOverview(u, mk(t))).draftId ?? draftId;
        if (!fill && guard > 3) break;
      }
      assert.ok(draftId, "phải ghép được và mở cấm chọn");
      const view = async (u: string): Promise<PvpDraftView> => ((await pvpDraftGet(draftId!, u, mk(t))) as { ok: true; view: PvpDraftView }).view;
      let v = await view(active[0]!);
      for (let guard = 0; guard < 40 && v.status === "active"; guard++) {
        t += 500;
        const who = active.find((u) => v.turn?.name === `Tên ${u}`);
        if (!who) {
          // Lượt của người vắng mặt: chờ hết giờ để máy làm thay.
          t += 20_000;
          v = await view(active[0]!);
          continue;
        }
        const mine = await view(who);
        const free = mine.choices.find((c) => c.error === null);
        const body =
          mine.turn!.kind === "ban"
            ? ({ type: "ban", ban: { kind: "hero", id: mine.roster[mine.roster.length - 1]!.id } } as const)
            : free
              ? ({ type: "pick", hero: free.hero.id } as const)
              : null;
        if (!body) {
          t += 20_000;
          v = await view(who);
          continue;
        }
        const r = await pvpDraftPlay(draftId, who, body, mk(t));
        assert.ok(r.ok, r.ok ? "" : r.error);
        v = (r as { ok: true; view: PvpDraftView }).view;
      }
      assert.equal(v.status, "prep");
      for (const u of active) await pvpDraftPlay(draftId, u, { type: "ready" }, mk(t + 100));
      // Người vắng mặt không bấm sẵn sàng: hết giờ chuẩn bị thì dựng trận.
      v = await view(active[0]!);
      if (v.status !== "done") v = ((await pvpDraftGet(draftId, active[0]!, mk(t + 60_000))) as { ok: true; view: PvpDraftView }).view;
      assert.equal(v.status, "done");
      assert.ok(v.matchId);
      return { matchId: v.matchId!, t: t + 60_000 };
    };

    it("sáu người thật chơi hết trận: điểm hạng và vàng tính riêng từng người, tính đúng một lần", async () => {
      const { mk, pvp, profiles } = await setup(six);
      const { matchId, t } = await toMatch(mk, six, six);
      let now = t;
      let guard = 0;
      for (; guard < 4000; guard++) {
        const rec = (await pvp.getMatch(matchId))!;
        if (rec.status !== "active") break;
        const who = pvpActorOwner(rec.state);
        if (who === null) {
          now += 1000;
          await pvpGetMatch(matchId, six[0]!, mk(now));
          continue;
        }
        now += 700;
        const m = chooseMove(toView(rec.state.battle), "normal", createRng(rec.state.battle.aiRng));
        const r = await pvpPlay(matchId, who, { type: "swap", from: m.from, to: m.to }, mk(now));
        if (!r.ok && r.error !== "conflict") assert.fail(`${who}: ${r.error} ${r.detail ?? ""}`);
        // Mọi người khác cũng còn tín hiệu (client hỏi lại đều).
        for (const o of six) if (o !== who) await pvpGetMatch(matchId, o, mk(now));
      }
      const done = (await pvp.getMatch(matchId))!;
      assert.equal(done.status, "finished", `guard ${guard}`);
      assert.notEqual(done.settledAt, null);
      assert.equal(done.owners.length, 6);

      const winner = done.state.battle.winner!;
      const ratings = await Promise.all(six.map((u) => pvp.rating(u, "team")));
      const sides = six.map((u) => done.state.players[u]!.side);
      // Ba người thắng, ba người thua; điểm cộng trừ cân nhau (hai phe cùng điểm khởi đầu, không có AI).
      assert.equal(ratings.reduce((a, r) => a + r.rating, 0), PVP_ELO_START * 6);
      six.forEach((u, i) => {
        const won = sides[i] === winner;
        assert.equal(ratings[i]!.wins, won ? 1 : 0, u);
        assert.equal(ratings[i]!.losses, won ? 0 : 1, u);
        assert.equal(ratings[i]!.rating > PVP_ELO_START, won, u);
      });
      // 1vs1 không bị đụng tới.
      for (const u of six) assert.equal((await pvp.rating(u, "duel")).wins + (await pvp.rating(u, "duel")).losses, 0);
      // Vàng: thắng 60, thua 20, mỗi người một lần.
      for (const [i, u] of six.entries()) assert.equal((await loadProfile(profiles, u)).profile.gold, sides[i] === winner ? PVP_GOLD_WIN : PVP_GOLD_LOSS, u);
      // Hỏi lại nhiều lần không tính lần hai.
      await Promise.all(six.map((u) => pvpGetMatch(matchId, u, mk(now + 5000))));
      assert.deepEqual((await Promise.all(six.map((u) => pvp.rating(u, "team")))).map((r) => r.rating), ratings.map((r) => r.rating));
      // Mọi người xong trận thì rảnh: không còn kẹt trong trận hay cấm chọn.
      for (const u of six) {
        const o = await pvpOverview(u, mk(now + 6000));
        assert.deepEqual([o.matchId, o.draftId, o.queue], [null, null, null], u);
      }
      const view = await pvpGetMatch(matchId, six[0]!, mk(now + 7000));
      assert.ok(view.ok);
      if (view.ok) assert.equal(view.view.status, "finished");
    });

    it("bốn người thật và hai chỗ máy điền, một người biến mất giữa chừng: máy tiếp quản, người đó không được tính điểm, ba người còn lại vẫn chơi hết", async () => {
      const users = six.slice(0, 4);
      const { mk, pvp } = await setup(users);
      const afk = users[3]!;
      const active = users.slice(0, 3);
      const { matchId, t } = await toMatch(mk, users, active, true);
      assert.ok(t >= T0 + PVP_TEAM_FILL_MS);
      let now = t;
      let guard = 0;
      for (; guard < 6000; guard++) {
        const rec = (await pvp.getMatch(matchId))!;
        if (rec.status !== "active") break;
        const who = pvpActorOwner(rec.state);
        if (who === afk) {
          // Người vắng mặt không đi: để hết giờ lượt rồi hỏi lại, máy chủ tự xử lý.
          now += 31_000;
          await pvpGetMatch(matchId, active[0]!, mk(now));
          continue;
        }
        if (who === null) {
          now += 1000;
          await pvpGetMatch(matchId, active[0]!, mk(now));
          continue;
        }
        now += 1500;
        const m = chooseMove(toView(rec.state.battle), "normal", createRng(rec.state.battle.aiRng));
        const r = await pvpPlay(matchId, who, { type: "swap", from: m.from, to: m.to }, mk(now));
        if (!r.ok && r.error !== "conflict" && r.error !== "notYourTurn" && r.error !== "left") assert.fail(`${who}: ${r.error}`);
        for (const o of active) await pvpGetMatch(matchId, o, mk(now));
      }
      const done = (await pvp.getMatch(matchId))!;
      assert.equal(done.status, "finished", `guard ${guard}`);
      const stat = done.state.players[afk]!;
      assert.ok(stat.left || stat.breaker, "người vắng mặt bị máy tiếp quản hoặc tính phá trận");
      const a = await pvp.rating(afk, "team");
      // Người vắng mặt không đổi điểm và không tính thắng thua.
      assert.equal(a.rating, PVP_ELO_START);
      assert.equal(a.wins + a.losses, 0);
      for (const u of active) assert.equal((await pvp.rating(u, "team")).wins + (await pvp.rating(u, "team")).losses, 1, u);
    });
  });
}
