import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chooseMove, chooseSkill, toView } from "../../../src/core/ai";
import { TURN_MS, GRACE_MS, type BattleAction, type FighterConfig } from "../../../src/core/battle";
import { STARTER_COMPANIONS, mainCharacter, SHOP_COMPANIONS } from "../../../src/core/roster";
import { createRng } from "../../../src/core/rng";
import {
  PVP_AI_FACTOR_MIN,
  PVP_LOG_SIZE,
  pvpLogAppend,
  PVP_BAN_BASE_MS,
  PVP_BAN_MAX_MS,
  PVP_GOLD_DAILY_CAP,
  PVP_GOLD_LOSS,
  PVP_GOLD_WIN,
  pvpBanMs,
  pvpGoldBase,
  PVP_DISCONNECT_MS,
  PVP_FORGIVE_PER_DAY,
  PVP_REJOIN_MS,
  pvpHasHumans,
  pvpHeartbeat,
  pvpIsDisconnected,
  pvpTakeover,
  PVP_BREAKER_STREAK,
  PVP_ELO_K,
  PVP_ELO_START,
  createPvpMatch,
  pvpAct,
  pvpActorOwner,
  pvpAdvanceAi,
  pvpAiFactor,
  pvpClock,
  pvpEloDelta,
  pvpExpected,
  pvpFirstSide,
  pvpIsOver,
  pvpSettle,
  pvpTimeout,
  pvpViewFor,
  type PvpConfig,
  type PvpState,
} from "../../../src/core/pvp";

const pool: FighterConfig[] = [...STARTER_COMPANIONS, ...SHOP_COMPANIONS.map((s) => s.fighter)];
const trio = (offset: number): FighterConfig[] => [0, 1, 2].map((i) => pool[(offset + i * 7) % pool.length] as FighterConfig);
const duel = (a = "a", b = "b", seed = 11): PvpConfig => ({
  sides: [
    { fighters: [mainCharacter("hoa", "tuongSi")], players: [a], captain: 0 },
    { fighters: [mainCharacter("thuy", "phapSu")], players: [b], captain: 0 },
  ],
  seed,
  now: 0,
});
const team = (names: [string, string, string, string, string, string], seed = 5): PvpConfig => ({
  sides: [
    { fighters: trio(0), players: [names[0], names[1], names[2]], captain: 0 },
    { fighters: trio(3), players: [names[3], names[4], names[5]], captain: 1 },
  ],
  seed,
  now: 0,
});
const T6 = ["p1", "p2", "p3", "q1", "q2", "q3"] as [string, string, string, string, string, string];

/** Một nước đi hợp lệ cho người thật, chọn bằng bộ não AI. */
function botMove(state: PvpState): BattleAction {
  const rng = createRng(state.battle.aiRng);
  const m = chooseMove(toView(state.battle), "normal", rng);
  return { type: "swap", from: m.from, to: m.to };
}

const must = (r: ReturnType<typeof pvpAct>): PvpState => {
  assert.ok(r.ok, r.ok ? "" : r.error);
  return r.state;
};

describe("PvP: dựng trận", () => {
  it("1vs1 và 3vs3 hợp lệ, đồng hồ luôn bật, mỗi người một chỗ", () => {
    const d = createPvpMatch(duel()).state;
    assert.equal(d.format, "duel");
    assert.equal(d.battle.timer, true);
    assert.deepEqual(Object.keys(d.players).sort(), ["a", "b"]);
    const t = createPvpMatch(team(T6)).state;
    assert.equal(t.format, "team");
    assert.equal(Object.keys(t.players).length, 6);
    assert.deepEqual(t.captains, [0, 1]);
  });

  it("từ chối cấu hình sai", () => {
    const bad = (c: PvpConfig) => assert.throws(() => createPvpMatch(c), RangeError);
    bad({ ...duel(), sides: [{ fighters: trio(0), players: ["a", "b", "c"], captain: 0 }, { fighters: [mainCharacter()], players: ["d"], captain: 0 }] });
    bad({ ...duel("a", "a") });
    bad({ ...duel(), sides: [{ fighters: [mainCharacter()], players: ["a", "b"], captain: 0 }, { fighters: [mainCharacter()], players: ["c"], captain: 0 }] });
    bad({ ...duel(), sides: [{ fighters: [mainCharacter()], players: [null], captain: 0 }, { fighters: [mainCharacter()], players: [null], captain: 0 }] });
    bad({ ...team(T6), sides: [{ fighters: trio(0), players: ["p1", "p2", "p3"], captain: 3 }, { fighters: trio(3), players: ["q1", "q2", "q3"], captain: 0 }] });
    bad({ ...team(T6), sides: [{ fighters: trio(0), players: [null, "p2", "p3"], captain: 0 }, { fighters: trio(3), players: ["q1", "q2", "q3"], captain: 0 }] });
  });

  it("phe điểm thấp hơn đi trước, hòa thì bốc theo seed", () => {
    assert.equal(pvpFirstSide([1200, 1000], createRng(1)), 1);
    assert.equal(pvpFirstSide([900, 1000], createRng(1)), 0);
    const seen = new Set([...Array(20).keys()].map((i) => pvpFirstSide([1000, 1000], createRng(i))));
    assert.deepEqual([...seen].sort(), [0, 1]);
  });
});

describe("PvP: ai được làm gì", () => {
  it("chỉ chủ của tướng đang hành động được đổi ô; người khác bị từ chối", () => {
    const s = createPvpMatch(duel()).state;
    const owner = pvpActorOwner(s) as string;
    const other = owner === "a" ? "b" : "a";
    assert.deepEqual(pvpAct(s, other, botMove(s), 0), { ok: false, error: "notYourTurn" });
    assert.deepEqual(pvpAct(s, "ai-la", botMove(s), 0), { ok: false, error: "unknownPlayer" });
    const next = must(pvpAct(s, owner, botMove(s), 1000));
    assert.equal(next.players[owner]?.moves, 1);
  });

  it("3vs3: quyền đi theo chủ của tướng hành động, và đổi lượt qua phe kia sau một nước", () => {
    let s = createPvpMatch(team(T6)).state;
    const first = pvpActorOwner(s) as string;
    assert.equal(first, "p1");
    assert.deepEqual(pvpAct(s, "p2", botMove(s), 0), { ok: false, error: "notYourTurn" });
    s = must(pvpAct(s, first, botMove(s), 500));
    if (!s.battle.turn.extra) {
      assert.equal(s.battle.turn.side, 1);
      assert.equal(pvpActorOwner(s), "q1");
    }
  });

  it("chỉ đội trưởng của phe đang đánh đổi người hành động", () => {
    const s = createPvpMatch(team(T6)).state;
    const sel = { type: "selectActor", fighter: 1 } as const;
    assert.deepEqual(pvpAct(s, "p2", sel, 0), { ok: false, error: "notCaptain" });
    assert.deepEqual(pvpAct(s, "p1", sel, 0), { ok: true, state: pvpAct(s, "p1", sel, 0).ok ? (pvpAct(s, "p1", sel, 0) as { state: PvpState }).state : s, events: [] });
    // Đội trưởng phe kia (q2) không đổi được khi chưa đến lượt phe đó.
    assert.deepEqual(pvpAct(s, "q2", sel, 0), { ok: false, error: "notCaptain" });
    // Sau khi đội trưởng chọn tướng 2, chủ của tướng đó (p2) mới được đổi ô.
    const picked = must(pvpAct(s, "p1", sel, 0));
    assert.equal(pvpActorOwner(picked), "p2");
    assert.deepEqual(pvpAct(picked, "p1", botMove(picked), 0), { ok: false, error: "notYourTurn" });
    must(pvpAct(picked, "p2", botMove(picked), 100));
  });

  it("không dùng pvpAct để hết giờ, và trận xong thì không ai đi nữa", () => {
    const s = createPvpMatch(duel()).state;
    assert.deepEqual(pvpAct(s, "a", { type: "timeout" }, 0), { ok: false, error: "cannotTimeout" });
    const over: PvpState = { ...s, battle: { ...s.battle, winner: 0 } };
    assert.deepEqual(pvpAct(over, "a", botMove(s), 0), { ok: false, error: "battleOver" });
  });

  it("góc nhìn người chơi không lộ luồng ngẫu nhiên", () => {
    const v = pvpViewFor(createPvpMatch(team(T6)).state, "p1");
    assert.equal("boardRng" in v.battle, false);
    assert.equal("aiRng" in v.battle, false);
    assert.equal(v.you?.side, 0);
    assert.equal(pvpViewFor(createPvpMatch(team(T6)).state, "ai-la").you, null);
  });
});

describe("PvP: đồng hồ, mất lượt và phá trận", () => {
  it("đồng hồ báo đúng người và hạn giờ", () => {
    const s = createPvpMatch(duel()).state;
    const c = pvpClock(s, 1000);
    assert.equal(c.player, pvpActorOwner(s));
    assert.equal(c.deadline, TURN_MS);
    assert.equal(c.remainingMs, TURN_MS - 1000);
    assert.equal(pvpClock(s, TURN_MS + 5).remainingMs, 0);
  });

  it("hết giờ sớm bị từ chối; hết giờ thật thì mất lượt và quyền đi sang đối thủ", () => {
    const s = createPvpMatch(duel()).state;
    assert.deepEqual(pvpTimeout(s, 1000), { ok: false, error: "tooEarly" });
    const owner = pvpActorOwner(s) as string;
    const r = pvpTimeout(s, TURN_MS + 1);
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.player, owner);
    assert.equal(r.becameBreaker, false);
    assert.equal(r.state.players[owner]?.timeouts, 1);
    assert.notEqual(pvpActorOwner(r.state), owner);
    assert.equal(r.state.battle.turn.side, s.battle.turn.side === 0 ? 1 : 0);
    assert.equal(r.state.battle.winner, null);
  });

  it("bỏ lượt liên tiếp đủ ngưỡng thì phá trận; đi một nước thì đặt lại", () => {
    let s = createPvpMatch(duel()).state;
    const target = pvpActorOwner(s) as string;
    let now = 0;
    let breaker = false;
    /** Người chơi vẫn còn kết nối (có tín hiệu) nhưng không đi nước nào: đây mới là bỏ lượt. */
    const alive = (at: number) => {
      for (const p of ["a", "b"]) {
        const hb = pvpHeartbeat(s, p, at);
        assert.ok(hb.ok);
        if (hb.ok) s = hb.state;
      }
    };
    // Mỗi vòng: target hết giờ, đối thủ hết giờ (để quyền quay lại target).
    for (let i = 0; i < PVP_BREAKER_STREAK; i++) {
      while (pvpActorOwner(s) !== target) {
        now = (s.battle.turn.deadline as number) + GRACE_MS + 1;
        alive(now);
        const r = pvpTimeout(s, now);
        assert.ok(r.ok);
        if (r.ok) s = r.state;
      }
      now = (s.battle.turn.deadline as number) + 1;
      alive(now);
      const r = pvpTimeout(s, now);
      assert.ok(r.ok);
      if (!r.ok) return;
      s = r.state;
      breaker = r.becameBreaker;
      assert.equal(s.players[target]?.streak, i + 1);
    }
    assert.equal(breaker, true);
    assert.equal(s.players[target]?.breaker, true);

    // Người khác đi nước thì streak của người khác về 0; target đi một nước thì streak về 0 nhưng vẫn là phá trận.
    while (pvpActorOwner(s) !== target) {
      alive((s.battle.turn.deadline as number) + 1);
      const r = pvpTimeout(s, (s.battle.turn.deadline as number) + 1);
      assert.ok(r.ok);
      if (r.ok) s = r.state;
    }
    s = must(pvpAct(s, target, botMove(s), (s.battle.turn.deadline as number) - 100));
    assert.equal(s.players[target]?.streak, 0);
    assert.equal(s.players[target]?.breaker, true);
  });

  it("tướng AI hết giờ không bị tính cho ai", () => {
    const c = team(T6);
    const withAi: PvpConfig = { ...c, sides: [{ ...c.sides[0], players: ["p1", null, "p3"] }, c.sides[1]] };
    let s = createPvpMatch(withAi).state;
    // Cho p1 đi một nước, rồi phe kia đi, đến lượt tướng 2 (AI) của phe 0.
    for (let guard = 0; guard < 20 && !(s.battle.turn.side === 0 && pvpActorOwner(s) === null); guard++) {
      const owner = pvpActorOwner(s);
      if (owner === null) {
        s = pvpAdvanceAi(s, 0).state;
        continue;
      }
      s = must(pvpAct(s, owner, botMove(s), 10));
    }
    if (pvpActorOwner(s) !== null) return; // bàn không dẫn tới lượt AI ở phe 0 trong 20 nước: không kiểm tra.
    const r = pvpTimeout(s, (s.battle.turn.deadline as number) + 1);
    assert.ok(r.ok);
    if (r.ok) {
      assert.equal(r.player, null);
      assert.deepEqual(Object.values(r.state.players).map((p) => p.timeouts), Object.values(s.players).map((p) => p.timeouts));
    }
  });
});

describe("PvP: mất kết nối", () => {
  /** Cho `player` im lặng (không tín hiệu) rồi tới lúc hết giờ lượt hiện tại. */
  const timeoutAt = (s: PvpState) => (s.battle.turn.deadline as number) + 1;

  it("tín hiệu còn sống và nước đi cập nhật lastSeen; im lặng quá ngưỡng là mất kết nối", () => {
    let s = createPvpMatch(duel()).state;
    assert.equal(pvpIsDisconnected(s, "a", PVP_DISCONNECT_MS), false);
    assert.equal(pvpIsDisconnected(s, "a", PVP_DISCONNECT_MS + 1), true);
    const hb = pvpHeartbeat(s, "a", 20_000);
    assert.ok(hb.ok);
    if (hb.ok) s = hb.state;
    assert.equal(pvpIsDisconnected(s, "a", 20_000 + PVP_DISCONNECT_MS), false);
    assert.deepEqual(pvpHeartbeat(s, "ai-la", 0), { ok: false, error: "unknownPlayer" });
  });

  it("hết giờ khi mất kết nối được tha: lượt vẫn mất nhưng không tính phá trận và trừ một lần tha", () => {
    let s = createPvpMatch(duel()).state;
    const target = pvpActorOwner(s) as string;
    // Không tín hiệu nào từ lúc dựng trận, nên tới lúc hết giờ (30 giây) người này đã im lặng hơn 15 giây.
    for (let i = 0; i < 5; i++) {
      while (pvpActorOwner(s) !== target) {
        const r = pvpTimeout(s, timeoutAt(s));
        assert.ok(r.ok);
        if (r.ok) s = r.state;
      }
      const r = pvpTimeout(s, timeoutAt(s));
      assert.ok(r.ok);
      if (!r.ok) return;
      s = r.state;
      if (i < PVP_FORGIVE_PER_DAY) {
        assert.equal(r.kind, "disconnect");
        assert.equal(s.players[target]?.streak, 0);
        assert.equal(s.players[target]?.breaker, false);
        assert.equal(s.players[target]?.forgiveLeft, PVP_FORGIVE_PER_DAY - 1 - i);
      }
    }
    // Hết lượt tha: hai lần cuối tính như bỏ lượt (đối thủ cũng im lặng nên cả hai cùng chịu).
    assert.equal(s.players[target]?.disconnects, PVP_FORGIVE_PER_DAY);
    assert.ok((s.players[target]?.streak ?? 0) >= 1);
  });

  it("bỏ lượt khi vẫn có tín hiệu không được tha", () => {
    let s = createPvpMatch(duel()).state;
    const target = pvpActorOwner(s) as string;
    const hb = pvpHeartbeat(s, target, 25_000);
    assert.ok(hb.ok);
    if (hb.ok) s = hb.state;
    const r = pvpTimeout(s, timeoutAt(s));
    assert.ok(r.ok);
    if (r.ok) {
      assert.equal(r.kind, "afk");
      assert.equal(r.state.players[target]?.streak, 1);
      assert.equal(r.state.players[target]?.forgiveLeft, PVP_FORGIVE_PER_DAY);
    }
  });

  it("số lần tha hôm nay lấy từ cấu hình của từng người", () => {
    const s = createPvpMatch({ ...duel(), forgiveLeft: { a: 0, b: 1 } }).state;
    assert.equal(s.players.a?.forgiveLeft, 0);
    assert.equal(s.players.b?.forgiveLeft, 1);
    const target = pvpActorOwner(s) as string;
    const r = pvpTimeout(s, timeoutAt(s));
    assert.ok(r.ok);
    if (r.ok && target === "a") {
      assert.equal(r.kind, "afk");
      assert.equal(r.forgivenessExhausted, true);
    }
  });

  it("quá hạn giữ chỗ thì AI tiếp quản, không vào lại được, đội trưởng chuyển cho người thật khác", () => {
    let s = createPvpMatch(team(T6)).state;
    // Mọi người im lặng trừ p2, p3 và q1..q3 có tín hiệu gần đây.
    for (const p of ["p2", "p3", "q1", "q2", "q3"]) {
      const hb = pvpHeartbeat(s, p, PVP_REJOIN_MS);
      assert.ok(hb.ok);
      if (hb.ok) s = hb.state;
    }
    assert.deepEqual(pvpTakeover(s, PVP_REJOIN_MS).replaced, []);
    const t = pvpTakeover(s, PVP_REJOIN_MS + 1);
    assert.deepEqual(t.replaced, ["p1"]);
    assert.equal(t.state.seats[0][0], null);
    assert.equal(t.state.captains[0], 1);
    assert.equal(t.state.players.p1?.left, true);
    assert.deepEqual(pvpHeartbeat(t.state, "p1", PVP_REJOIN_MS + 2), { ok: false, error: "left" });
    assert.deepEqual(pvpAct(t.state, "p1", { type: "selectActor", fighter: 1 }, 0), { ok: false, error: "left" });
    // AI đi thay tướng 1 của phe 0 khi đến lượt.
    assert.equal(pvpActorOwner(t.state), null);
    const adv = pvpAdvanceAi(t.state, 1000);
    assert.notEqual(adv.state.battle.turn.number, t.state.battle.turn.number);
    assert.ok(pvpHasHumans(t.state));
  });

  it("phe hết người thật thì không còn đội trưởng; cả trận hết người thật thì báo", () => {
    let s = createPvpMatch(duel()).state;
    const t = pvpTakeover(s, PVP_REJOIN_MS + 1);
    assert.deepEqual([...t.replaced].sort(), ["a", "b"]);
    assert.deepEqual(t.state.captains, [-1, -1]);
    assert.equal(pvpHasHumans(t.state), false);
    s = t.state;
  });

  it("settle: người bị AI tiếp quản không đổi điểm và không bị cảnh cáo; người ở lại ít điểm hơn vì có AI", () => {
    let s = createPvpMatch(duel()).state;
    const hb = pvpHeartbeat(s, "b", PVP_REJOIN_MS);
    assert.ok(hb.ok);
    if (hb.ok) s = hb.state;
    s = pvpTakeover(s, PVP_REJOIN_MS + 1).state;
    s = { ...s, battle: { ...s.battle, winner: 1 } };
    const r = pvpSettle(s, { a: 1000, b: 1000 });
    const a = r.find((x) => x.player === "a")!;
    const b = r.find((x) => x.player === "b")!;
    assert.deepEqual([a.delta, a.counted, a.left, a.breaker], [0, false, true, false]);
    assert.ok(b.delta > 0 && b.delta < PVP_ELO_K / 2);
  });

  it("settle báo số lượt đã được tha để server trừ vào số lần tha hôm nay", () => {
    let s = createPvpMatch(duel()).state;
    const r1 = pvpTimeout(s, (s.battle.turn.deadline as number) + 1);
    assert.ok(r1.ok);
    if (!r1.ok) return;
    s = { ...r1.state, battle: { ...r1.state.battle, winner: 0 } };
    const out = pvpSettle(s, {});
    assert.equal(out.reduce((n, x) => n + x.disconnects, 0), 1);
  });
});

describe("PvP: điểm hạng", () => {
  it("1vs1 ngang điểm: thắng +16, thua −16", () => {
    assert.equal(pvpExpected(1000, 1000), 0.5);
    assert.equal(pvpEloDelta({ won: true, own: 1000, foe: 1000, aiCount: 0 }), PVP_ELO_K / 2);
    assert.equal(pvpEloDelta({ won: false, own: 1000, foe: 1000, aiCount: 0 }), -PVP_ELO_K / 2);
  });

  it("thắng người mạnh hơn được nhiều hơn; hệ số AI giảm điểm nhưng không về 0", () => {
    const strong = pvpEloDelta({ won: true, own: 900, foe: 1200, aiCount: 0 });
    const weak = pvpEloDelta({ won: true, own: 1200, foe: 900, aiCount: 0 });
    assert.ok(strong > weak && weak > 0);
    assert.equal(pvpAiFactor(0), 1);
    assert.equal(pvpAiFactor(1), 0.75);
    assert.equal(pvpAiFactor(99), PVP_AI_FACTOR_MIN);
    const half = pvpEloDelta({ won: true, own: 1000, foe: 1000, aiCount: 2 });
    assert.ok(half > 0 && half < PVP_ELO_K / 2);
    assert.throws(() => pvpAiFactor(-1), RangeError);
  });

  it("pvpSettle 1vs1: người thắng cộng, người thua trừ, tổng bằng nhau khi ngang điểm", () => {
    let s = createPvpMatch(duel()).state;
    s = { ...s, battle: { ...s.battle, winner: 0 } };
    const r = pvpSettle(s, { a: 1000, b: 1000 });
    assert.deepEqual(r.map((x) => [x.player, x.won, x.delta]), [["a", true, 16], ["b", false, -16]]);
    assert.ok(r.every((x) => x.counted));
  });

  it("người phá trận không đổi điểm dù thắng hay thua; người còn lại vẫn tính", () => {
    let s = createPvpMatch(duel()).state;
    s = { ...s, battle: { ...s.battle, winner: 0 }, players: { ...s.players, a: { ...(s.players.a as NonNullable<PvpState["players"][string]>), breaker: true } } };
    const r = pvpSettle(s, { a: 1000, b: 1000 });
    const a = r.find((x) => x.player === "a")!;
    const b = r.find((x) => x.player === "b")!;
    assert.deepEqual([a.delta, a.after, a.counted, a.breaker], [0, 1000, false, true]);
    assert.equal(b.delta, -16);
  });

  it("3vs3: kỳ vọng theo điểm trung bình phe, mỗi người cộng vào điểm riêng; điểm không xuống dưới 0", () => {
    let s = createPvpMatch(team(T6)).state;
    s = { ...s, battle: { ...s.battle, winner: 1 } };
    const r = pvpSettle(s, { p1: 1400, p2: 1000, p3: 1000, q1: 1000, q2: 1000, q3: 1000 });
    // Phe 0 trung bình 1133, mạnh hơn phe 1: thua nên mất nhiều hơn 16 mỗi người, còn phe 1 thắng được hơn 16.
    for (const x of r.filter((y) => y.side === 0)) assert.ok(x.delta < -16, `${x.player} ${x.delta}`);
    for (const x of r.filter((y) => y.side === 1)) assert.ok(x.delta > 16);
    assert.equal(r.find((x) => x.player === "p1")?.before, 1400);
    const zero = pvpSettle(s, { p1: 3, p2: 3, p3: 3, q1: 3, q2: 3, q3: 3 });
    assert.ok(zero.every((x) => x.after >= 0));
  });

  it("trận có AI: người thật vẫn được tính nhưng điểm ít hơn trận toàn người", () => {
    const base = team(T6);
    const withAi: PvpConfig = { ...base, sides: [{ ...base.sides[0], players: ["p1", "p2", null] }, base.sides[1]] };
    let all = createPvpMatch(base).state;
    let ai = createPvpMatch(withAi).state;
    all = { ...all, battle: { ...all.battle, winner: 0 } };
    ai = { ...ai, battle: { ...ai.battle, winner: 0 } };
    const rating = { p1: PVP_ELO_START, p2: PVP_ELO_START, p3: PVP_ELO_START, q1: PVP_ELO_START, q2: PVP_ELO_START, q3: PVP_ELO_START };
    const full = pvpSettle(all, rating).find((x) => x.player === "p1")!.delta;
    const part = pvpSettle(ai, rating).find((x) => x.player === "p1")!.delta;
    assert.ok(part > 0 && part < full);
    assert.equal(pvpSettle(ai, rating).some((x) => x.player === "p3"), false);
  });

  it("trận chưa xong thì không tính điểm", () => {
    assert.throws(() => pvpSettle(createPvpMatch(duel()).state, {}), RangeError);
  });
});

describe("PvP: mô phỏng trận qua cùng đường pvpAct", () => {
  /**
   * Mỗi người thật là một bot đi bằng pvpAct; tướng AI đi bằng pvpAdvanceAi; thỉnh thoảng một người bỏ lượt.
   * Mọi nước đi đều qua kiểm tra quyền, nên trận chỉ chạy tới nơi nếu các luật quyền đúng.
   */
  function playOut(config: PvpConfig, afkEvery = 0, maxSteps = 4000): { state: PvpState; steps: number; timeouts: number } {
    let { state } = createPvpMatch(config);
    let now = 0;
    let timeouts = 0;
    let steps = 0;
    while (!pvpIsOver(state) && steps++ < maxSteps) {
      const owner = pvpActorOwner(state);
      if (owner === null) {
        state = pvpAdvanceAi(state, now).state;
        continue;
      }
      if (afkEvery > 0 && steps % afkEvery === 0) {
        now = (state.battle.turn.deadline as number) + 1;
        const r = pvpTimeout(state, now);
        assert.ok(r.ok);
        if (r.ok) {
          state = r.state;
          timeouts++;
        }
        continue;
      }
      now += 800;
      const rng = createRng(state.battle.aiRng);
      const skill = chooseSkill(toView(state.battle));
      if (skill) {
        const r = pvpAct(state, owner, skill, now);
        if (r.ok) state = r.state;
        if (pvpIsOver(state)) break;
      }
      const m = chooseMove(toView(state.battle), "normal", rng);
      state = { ...state, battle: { ...state.battle, aiRng: rng.state() } };
      state = must(pvpAct(state, owner, { type: "swap", from: m.from, to: m.to }, now));
    }
    return { state, steps, timeouts };
  }

  it("1vs1 hai bot chơi hết trận, có người thắng, điểm cân nhau", () => {
    for (const seed of [1, 2, 3]) {
      const { state } = playOut(duel("a", "b", seed));
      assert.notEqual(state.battle.winner, null, `seed ${seed}`);
      const r = pvpSettle(state, { a: 1000, b: 1000 });
      assert.equal(r[0]!.delta + r[1]!.delta, 0);
    }
  });

  it("3vs3 sáu bot chơi hết trận qua kiểm tra quyền", () => {
    for (const seed of [4, 5]) {
      const { state } = playOut(team(T6, seed));
      assert.notEqual(state.battle.winner, null, `seed ${seed}`);
      assert.ok(Object.values(state.players).every((p) => p.moves >= 0));
      assert.ok(Object.values(state.players).some((p) => p.moves > 0));
    }
  });

  it("3vs3 có hai tướng trùng nhau trong một phe (hết tướng khác nên được chọn trùng): trận vẫn chạy hết", () => {
    const base = team(T6, 11);
    const f = base.sides[0].fighters;
    const config: PvpConfig = { ...base, sides: [{ ...base.sides[0], fighters: [f[0]!, f[0]!, f[2]!] }, base.sides[1]] };
    const { state } = playOut(config);
    assert.notEqual(state.battle.winner, null);
  });

  it("3vs3 có người bỏ lượt và có AI điền: trận vẫn kết thúc, điểm tính đúng", () => {
    const base = team(T6, 9);
    const config: PvpConfig = { ...base, sides: [base.sides[0], { ...base.sides[1], players: ["q1", "q2", null] }] };
    const { state, timeouts } = playOut(config, 5);
    assert.notEqual(state.battle.winner, null);
    assert.ok(timeouts > 0);
    const r = pvpSettle(state, {});
    assert.equal(r.length, 5);
    assert.ok(r.every((x) => x.before === PVP_ELO_START && x.after >= 0));
  });
});

describe("PvP: vàng và hạn chế ghép trận", () => {
  it("vàng gốc theo thắng, thua và giảm theo số AI", () => {
    assert.equal(pvpGoldBase(true, 0), PVP_GOLD_WIN);
    assert.equal(pvpGoldBase(false, 0), PVP_GOLD_LOSS);
    assert.ok(pvpGoldBase(true, 1) < PVP_GOLD_WIN && pvpGoldBase(true, 1) > 0);
    assert.ok(PVP_GOLD_DAILY_CAP > PVP_GOLD_WIN);
  });

  it("phá trận lần đầu chỉ cảnh cáo; từ lần hai hạn chế 15 phút, gấp đôi mỗi lần, tối đa 24 giờ", () => {
    assert.equal(pvpBanMs(1), 0);
    assert.equal(pvpBanMs(2), PVP_BAN_BASE_MS);
    assert.equal(pvpBanMs(3), PVP_BAN_BASE_MS * 2);
    assert.equal(pvpBanMs(30), PVP_BAN_MAX_MS);
    assert.throws(() => pvpBanMs(0), RangeError);
  });
});

describe("PvP: nhật ký diễn biến", () => {
  it("chỉ giữ sự kiện nhỏ gọn, mã tăng dần, tối đa PVP_LOG_SIZE mục mới nhất", () => {
    let s = createPvpMatch(duel()).state;
    assert.deepEqual([s.log.length, s.logNext], [0, 1]);
    const damage = { type: "damage", side: 1, fighter: 0, amount: 5, absorbed: 0, source: { kind: "swap" } } as never;
    const heavy = { type: "shuffle", board: s.battle.board } as never;
    s = pvpLogAppend(s, [heavy, damage]);
    assert.deepEqual(s.log.map((e) => e.event.type), ["damage"]);
    for (let i = 0; i < PVP_LOG_SIZE + 20; i++) s = pvpLogAppend(s, [damage]);
    assert.equal(s.log.length, PVP_LOG_SIZE);
    assert.equal(s.log.at(-1)?.id, s.logNext - 1);
    assert.equal(pvpLogAppend(s, [heavy]), s);
  });
});
