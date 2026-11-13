import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { chooseMove, toView } from "../../src/core/ai";
import { PVP_DISCONNECT_MS, PVP_ELO_START, PVP_FORGIVE_PER_DAY, PVP_REJOIN_MS, newProfile, pvpActorOwner, createRng, TURN_MS, vnDay } from "../../src/core";
import { DrizzlePvpStore } from "../../src/server/db/pvp";
import type { Db } from "../../src/server/db/store";
import { MemoryProfileStore, type ProfileStore } from "../../src/server/profiles";
import {
  MemoryPvpStore,
  PVP_MATCH_ANY_AFTER_MS,
  PVP_QUEUE_STALE_MS,
  pvpEnqueue,
  pvpGetMatch,
  pvpLeaveQueue,
  pvpMatchWindow,
  pvpOverview,
  pvpPlay,
  type PvpDeps,
  type PvpStore,
} from "../../src/server/pvp";

const T0 = 1_700_000_000_000;

async function makeDb(): Promise<PvpStore> {
  const db = drizzle(new PGlite());
  await migrate(db, { migrationsFolder: "drizzle" });
  return new DrizzlePvpStore(db as unknown as Db);
}

const stores: readonly [string, () => Promise<PvpStore>][] = [
  ["bộ nhớ", async () => new MemoryPvpStore()],
  ["Postgres (PGlite, cùng migration với Neon)", makeDb],
];

describe("PvP server: ghép trận", () => {
  it("khoảng điểm cho phép ghép nới dần theo thời gian chờ", () => {
    assert.equal(pvpMatchWindow(0), 100);
    assert.equal(pvpMatchWindow(5_000), 150);
    assert.ok(pvpMatchWindow(30_000) > 300);
    assert.equal(pvpMatchWindow(PVP_MATCH_ANY_AFTER_MS), Number.POSITIVE_INFINITY);
  });
});

for (const [name, factory] of stores) {
  describe(`PvP server (${name})`, () => {
    let seq = 0;
    const setup = async () => {
      const pvp = await factory();
      const profiles: ProfileStore = new MemoryProfileStore();
      for (const id of ["a", "b", "c"]) await profiles.put(id, newProfile(), 0, T0);
      const mk = (now: number): PvpDeps => ({ pvp, profiles, now, seed: 12345 + seq++, newId: () => `m${++seq}` });
      return { pvp, profiles, mk };
    };

    /** Hai người vào hàng đợi rồi hỏi: người sau thấy mình đã được ghép. */
    const pair = async (mk: (n: number) => PvpDeps, a = "a", b = "b", now = T0) => {
      assert.deepEqual(await pvpEnqueue(a, "duel", mk(now)), { ok: true });
      assert.deepEqual(await pvpEnqueue(b, "duel", mk(now)), { ok: true });
      await pvpOverview(a, mk(now + 100));
      const o = await pvpOverview(b, mk(now + 200));
      const oa = await pvpOverview(a, mk(now + 300));
      assert.ok(o.matchId ?? oa.matchId);
      assert.equal(o.matchId ?? oa.matchId, oa.matchId ?? o.matchId);
      return (o.matchId ?? oa.matchId) as string;
    };

    it("chưa vào hàng đợi thì không có gì; vào rồi rời được; thể thức lạ bị từ chối", async () => {
      const { mk } = await setup();
      const o = await pvpOverview("a", mk(T0));
      assert.deepEqual([o.queue, o.matchId, o.ratings.duel.rating, o.forgiveLeft], [null, null, PVP_ELO_START, PVP_FORGIVE_PER_DAY]);
      assert.deepEqual(await pvpEnqueue("a", "team" as never, mk(T0)), { ok: false, error: "badFormat" });
      await pvpEnqueue("a", "duel", mk(T0));
      assert.equal((await pvpOverview("a", mk(T0 + 1000))).queue?.waitedMs, 1000);
      await pvpLeaveQueue("a", mk(T0 + 2000));
      assert.equal((await pvpOverview("a", mk(T0 + 3000))).queue, null);
    });

    it("hai người ghép được với nhau; người thứ ba chờ riêng", async () => {
      const { mk } = await setup();
      const id = await pair(mk);
      await pvpEnqueue("c", "duel", mk(T0 + 500));
      const c = await pvpOverview("c", mk(T0 + 600));
      assert.equal(c.matchId, null);
      assert.ok(c.queue);
      const a = await pvpOverview("a", mk(T0 + 700));
      assert.equal(a.matchId, id);
      assert.deepEqual(await pvpEnqueue("a", "duel", mk(T0 + 800)), { ok: false, error: "inMatch" });
    });

    it("điểm cách xa thì chưa ghép, chờ đủ lâu thì ghép với bất kỳ ai", async () => {
      const { mk, pvp } = await setup();
      await pvp.applyResult("a", "duel", { delta: 500, won: true, counted: true, forgiven: 0, day: vnDay(T0), now: T0 });
      await pvpEnqueue("a", "duel", mk(T0));
      await pvpEnqueue("b", "duel", mk(T0));
      assert.equal((await pvpOverview("a", mk(T0 + 100))).matchId, null);
      assert.equal((await pvpOverview("b", mk(T0 + 200))).matchId, null);
      const late = T0 + PVP_MATCH_ANY_AFTER_MS + 1;
      await pvpOverview("a", mk(late - 1000)); // a còn tín hiệu
      const b = await pvpOverview("b", mk(late));
      assert.ok(b.matchId);
    });

    it("người đã đóng trang (im lặng quá lâu) bị bỏ qua khi ghép", async () => {
      const { mk } = await setup();
      await pvpEnqueue("a", "duel", mk(T0));
      await pvpEnqueue("b", "duel", mk(T0 + PVP_QUEUE_STALE_MS + 5000));
      assert.equal((await pvpOverview("b", mk(T0 + PVP_QUEUE_STALE_MS + 6000))).matchId, null);
    });

    it("xem trận: không lộ luồng ngẫu nhiên hay id đối thủ; người ngoài không xem được", async () => {
      const { mk } = await setup();
      const id = await pair(mk);
      const r = await pvpGetMatch(id, "a", mk(T0 + 1000));
      assert.ok(r.ok);
      if (!r.ok) return;
      const json = JSON.stringify(r.view);
      assert.equal("boardRng" in r.view.battle, false);
      assert.equal(json.includes('"b"') && json.includes("ownerId"), false);
      assert.equal(r.view.seats.filter((s) => s.mine).length, 1);
      assert.equal(r.view.format, "duel");
      assert.deepEqual(await pvpGetMatch(id, "c", mk(T0 + 1000)), { ok: false, error: "notFound" });
      assert.deepEqual(await pvpGetMatch("khong-co", "a", mk(T0)), { ok: false, error: "notFound" });
    });

    it("chỉ người có lượt đi được; nước đi hợp lệ đổi lượt", async () => {
      const { mk, pvp } = await setup();
      const id = await pair(mk);
      const rec = (await pvp.getMatch(id))!;
      const first = pvpActorOwner(rec.state) as string;
      const other = first === "a" ? "b" : "a";
      const m = chooseMove(toView(rec.state.battle), "normal", createRng(rec.state.battle.aiRng));
      const swap = { type: "swap", from: m.from, to: m.to } as const;
      const bad = await pvpPlay(id, other, swap, mk(T0 + 1000));
      assert.deepEqual([bad.ok, !bad.ok && bad.error], [false, "notYourTurn"]);
      const ok = await pvpPlay(id, first, swap, mk(T0 + 1000));
      assert.ok(ok.ok);
      const after = (await pvp.getMatch(id))!;
      assert.equal(after.seq > rec.seq, true);
    });

    it("hết giờ thì lượt bị mất khi có người hỏi (chạy bù), không cần tiến trình nền", async () => {
      const { mk, pvp } = await setup();
      const id = await pair(mk);
      const before = (await pvp.getMatch(id))!;
      const first = pvpActorOwner(before.state) as string;
      const other = first === "a" ? "b" : "a";
      // `other` hỏi sau khi lượt của `first` đã quá hạn: first bị tính hết giờ (và đã im lặng, nên là mất kết nối được tha).
      const r = await pvpGetMatch(id, other, mk(T0 + TURN_MS + 2000));
      assert.ok(r.ok);
      const after = (await pvp.getMatch(id))!;
      assert.equal(after.state.players[first]?.timeouts, 1);
      assert.equal(after.state.players[first]?.disconnects, 1);
      assert.equal(after.state.players[first]?.streak, 0);
    });

    it("mất kết nối quá hạn thì AI tiếp quản và người đó không vào lại được", async () => {
      const { mk, pvp } = await setup();
      const id = await pair(mk);
      const t = T0 + PVP_REJOIN_MS + 5000;
      // Chỉ b còn gửi tín hiệu (mỗi 10 giây, như client thật); a im lặng từ đầu.
      for (let at = T0 + 10_000; at <= t; at += 10_000) assert.ok((await pvpGetMatch(id, "b", mk(at))).ok);
      assert.ok((await pvpGetMatch(id, "b", mk(t))).ok);
      const rec = (await pvp.getMatch(id))!;
      assert.equal(rec.state.players.a?.left, true);
      assert.equal(rec.state.seats.flat().includes(null), true);
      const back = await pvpGetMatch(id, "a", mk(t + 1000));
      assert.ok(back.ok);
      if (back.ok) assert.equal(back.view.you.left, true);
      const play = await pvpPlay(id, "a", { type: "swap", from: { row: 0, col: 0 }, to: { row: 0, col: 1 } }, mk(t + 2000));
      assert.deepEqual([play.ok, !play.ok && play.error], [false, "left"]);
    });

    it("cả hai im lặng quá hạn thì trận bị hủy, không ai đổi điểm", async () => {
      const { mk, pvp } = await setup();
      const id = await pair(mk);
      const r = await pvpGetMatch(id, "a", mk(T0 + PVP_REJOIN_MS * 3));
      assert.ok(r.ok);
      const rec = (await pvp.getMatch(id))!;
      assert.equal(rec.status, "abandoned");
      assert.equal((await pvp.rating("a", "duel")).wins + (await pvp.rating("b", "duel")).wins, 0);
    });

    it("chơi hết một trận: người thắng cộng, người thua trừ, tính điểm đúng một lần dù hỏi nhiều lần", async () => {
      const { mk, pvp } = await setup();
      const id = await pair(mk);
      let now = T0 + 1000;
      let guard = 0;
      for (; guard < 3000; guard++) {
        const rec = (await pvp.getMatch(id))!;
        if (rec.status !== "active") break;
        const who = pvpActorOwner(rec.state);
        if (who === null) {
          now += 1000;
          await pvpGetMatch(id, "a", mk(now));
          continue;
        }
        now += 700;
        const m = chooseMove(toView(rec.state.battle), "normal", createRng(rec.state.battle.aiRng));
        const r = await pvpPlay(id, who, { type: "swap", from: m.from, to: m.to }, mk(now));
        if (!r.ok && r.error !== "conflict") assert.fail(`${who}: ${r.error} ${r.detail ?? ""}`);
        await pvpGetMatch(id, who === "a" ? "b" : "a", mk(now)); // người kia cũng còn tín hiệu
      }
      const done = (await pvp.getMatch(id))!;
      assert.equal(done.status, "finished", `guard ${guard}`);
      assert.notEqual(done.settledAt, null);
      const ra = await pvp.rating("a", "duel");
      const rb = await pvp.rating("b", "duel");
      assert.equal(ra.rating + rb.rating, PVP_ELO_START * 2);
      assert.equal(ra.wins + ra.losses, 1);
      assert.equal(rb.wins + rb.losses, 1);
      // Hỏi lại nhiều lần (kể cả cùng lúc) không tính điểm lần nữa.
      await Promise.all([pvpGetMatch(id, "a", mk(now + 5000)), pvpGetMatch(id, "b", mk(now + 5000)), pvpGetMatch(id, "a", mk(now + 6000))]);
      assert.equal((await pvp.rating("a", "duel")).rating, ra.rating);
      const view = await pvpGetMatch(id, "a", mk(now + 7000));
      assert.ok(view.ok);
      if (view.ok) {
        assert.equal(view.view.status, "finished");
        assert.equal(view.view.result?.delta, ra.rating - PVP_ELO_START);
      }
      // Trận xong thì vào hàng đợi lại được.
      assert.deepEqual(await pvpEnqueue("a", "duel", mk(now + 8000)), { ok: true });
    });

    it("lượt mất kết nối đã được tha trừ vào số lần tha hôm nay sau trận", async () => {
      const { mk, pvp } = await setup();
      const id = await pair(mk);
      const rec = (await pvp.getMatch(id))!;
      const first = pvpActorOwner(rec.state) as string;
      // first bị mất một lượt vì mất kết nối; sau đó ép trận kết thúc bằng cách cho `winner` (mô phỏng trận xong).
      await pvpGetMatch(id, first === "a" ? "b" : "a", mk(T0 + TURN_MS + 2000));
      const mid = (await pvp.getMatch(id))!;
      assert.equal(mid.state.players[first]?.disconnects, 1);
      const forced = { ...mid, state: { ...mid.state, battle: { ...mid.state.battle, winner: 0 as const } }, seq: mid.seq + 1 };
      assert.equal(await pvp.saveMatch(forced, mid.seq), true);
      await pvpGetMatch(id, first, mk(T0 + TURN_MS + 3000));
      const row = await pvp.rating(first, "duel");
      assert.equal(row.forgiveUsed, 1);
      assert.equal((await pvpOverview(first, mk(T0 + TURN_MS + 4000))).forgiveLeft, PVP_FORGIVE_PER_DAY - 1);
      assert.equal(PVP_DISCONNECT_MS < TURN_MS, true);
    });
  });
}
