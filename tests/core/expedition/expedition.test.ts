import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXPEDITION_MAPS,
  EXPEDITION_PINCER_HP,
  EXPEDITION_REST_HEAL,
  EXPEDITION_RUNS_PER_DAY,
  EXPEDITION_TIER_INFO,
  MAIN_ID,
  NEW_EXPEDITION,
  STARTER_COMPANIONS,
  abandonExpedition,
  applyExpeditionEnd,
  boardScores,
  countExpeditionRun,
  describeScore,
  beginExpeditionBattle,
  campExpedition,
  createBattle,
  createExpeditionRun,
  createRng,
  expeditionArmySide,
  expeditionBoardScore,
  expeditionDistance,
  expeditionEncounter,
  expeditionFoeSide,
  expeditionNeighbors,
  expeditionRunsLeft,
  expeditionSimProfile,
  expeditionStars,
  expeditionTierUnlocked,
  marchExpedition,
  parseExpedition,
  parseExpeditionStart,
  parseProfile,
  settleExpeditionBattle,
  type BattleState,
  type ExpeditionMatchTag,
  type ExpeditionRun,
  type ExpeditionState,
} from "../../../src/core";

const IDS = STARTER_COMPANIONS.map((c) => c.id);
const INPUT = { map: "aiBac", tier: 1, main: IDS.slice(0, 2), second: IDS.slice(2, 5) } as const;

function newRun(seed = 7): ExpeditionRun {
  const made = createExpeditionRun(expeditionSimProfile(10), NEW_EXPEDITION, INPUT, "run1", seed);
  if (!made.ok) throw new Error(made.error);
  return made.run;
}

/** Dựng trận thật rồi ép kết quả: phe thắng giữ nguyên máu, phe thua gục hết. */
function finished(run: ExpeditionRun, army: 0 | 1, node: string, winner: 0 | 1): BattleState {
  const encounter = expeditionEncounter(run, node, army)!;
  const { state } = createBattle({
    sides: [expeditionArmySide(run, army), expeditionFoeSide(encounter)],
    seed: 1,
    timer: false,
    firstSide: 0,
  });
  const loser = state.sides[winner === 0 ? 1 : 0];
  for (const f of loser.fighters) f.hp = 0;
  state.winner = winner;
  return state;
}

function fight(run: ExpeditionRun, army: 0 | 1, node: string, winner: 0 | 1) {
  const m = marchExpedition(run, army, node);
  assert.ok(m.ok && m.kind === "battle");
  if (!m.ok || m.kind !== "battle") throw new Error("expected battle");
  const started = beginExpeditionBattle(run, { army, node, matchId: "m", pincer: m.encounter.pincer });
  const tag: ExpeditionMatchTag = { runId: run.id, map: run.map, tier: run.tier, node, army, day: run.day };
  const settled = settleExpeditionBattle(started, tag, finished(started, army, node, winner));
  if (!settled.ok) throw new Error(settled.error);
  return settled;
}

describe("Viễn Chinh: sa bàn", () => {
  for (const map of Object.values(EXPEDITION_MAPS)) {
    it(`${map.name}: đồ thị hợp lệ, hai trại tới được thành đích`, () => {
      const ids = new Set(map.nodes.map((n) => n.id));
      assert.equal(ids.size, map.nodes.length, "id ô không trùng");
      for (const [a, b] of map.edges) assert.ok(ids.has(a) && ids.has(b), `${a}-${b}`);
      assert.equal(map.nodes.filter((n) => n.kind === "citadel").length, 1);
      for (const camp of map.camps) {
        assert.equal(map.nodes.find((n) => n.id === camp)?.kind, "camp");
        assert.ok(expeditionDistance(map, camp, map.citadel) < map.days);
      }
      // Thành đích có ít nhất hai ngả vào để giáp công được.
      assert.ok(expeditionNeighbors(map, map.citadel).length >= 2);
      assert.ok(map.parDays < map.days);
    });
  }
});

describe("Viễn Chinh: xuất quân", () => {
  it("chụp 6 người vào hai đạo, Đinh Bộ Lĩnh dẫn đạo Chính", () => {
    const run = newRun();
    assert.deepEqual(run.armies[0].ids, [MAIN_ID, ...IDS.slice(0, 2)]);
    assert.deepEqual(run.armies[1].ids, IDS.slice(2, 5));
    assert.equal(run.armies[0].at, EXPEDITION_MAPS.aiBac.camps[0]);
    assert.equal(run.day, 1);
    assert.equal(run.phase, "march");
  });

  it("từ chối đạo sai cỡ, trùng người, người chưa có, bậc chưa mở, đang có lượt", () => {
    const profile = expeditionSimProfile(10);
    const bad = (input: typeof INPUT | Record<string, unknown>, state: ExpeditionState = NEW_EXPEDITION) =>
      createExpeditionRun(profile, state, input as typeof INPUT, "x", 1);
    assert.deepEqual(bad({ ...INPUT, second: [IDS[0], IDS[3], IDS[4]] }), { ok: false, error: "duplicate" });
    assert.deepEqual(bad({ ...INPUT, second: [IDS[2], IDS[3], "khongCo"] }), { ok: false, error: "notOwned" });
    assert.deepEqual(bad({ ...INPUT, tier: 2 }), { ok: false, error: "tierLocked" });
    assert.deepEqual(bad(INPUT, { ...NEW_EXPEDITION, run: newRun() }), { ok: false, error: "runActive" });
    assert.equal(parseExpeditionStart({ ...INPUT, main: IDS.slice(0, 3) }), null);
    assert.deepEqual(parseExpeditionStart(INPUT), INPUT);
  });

  it("bậc sau mở khi đã thắng bậc trước của cùng sa bàn", () => {
    const state: ExpeditionState = { cleared: { aiBac: 1 }, stars: {}, run: null };
    assert.ok(expeditionTierUnlocked(state, "aiBac", 2));
    assert.ok(!expeditionTierUnlocked(state, "aiBac", 3));
    assert.ok(!expeditionTierUnlocked(state, "cuaBien", 2));
  });
});

describe("Viễn Chinh: hành quân", () => {
  it("chỉ đi sang ô kề; ô có địch trả về trận, đối thủ tất định theo seed", () => {
    const run = newRun();
    assert.deepEqual(marchExpedition(run, 0, "deo-may"), { ok: false, error: "notAdjacent" });
    const a = marchExpedition(run, 0, "khe-da");
    const b = marchExpedition(newRun(), 0, "khe-da");
    assert.ok(a.ok && a.kind === "battle" && b.ok && b.kind === "battle");
    if (a.ok && a.kind === "battle" && b.ok && b.kind === "battle")
      assert.deepEqual(a.encounter.foes.map((f) => f.id), b.encounter.foes.map((f) => f.id));
  });

  it("vào làng: không đánh, hết ngày, đạo kia nghỉ", () => {
    const run = newRun();
    const m = marchExpedition(run, 0, "ban-na");
    assert.ok(m.ok && m.kind === "moved");
    if (!m.ok || m.kind !== "moved") return;
    assert.equal(m.run.day, 2);
    assert.equal(m.run.armies[0].at, "ban-na");
    assert.equal(m.run.nodes["ban-na"]?.cleared, true);
  });

  it("thắng trận: chiếm ô, đạo kia nghỉ hồi máu (kể cả người gục)", () => {
    let run = newRun();
    const id = run.armies[1].ids[0]!;
    const f = run.armies[1].fighters[id]!;
    run = { ...run, armies: [run.armies[0], { ...run.armies[1], fighters: { ...run.armies[1].fighters, [id]: { ...f, hp: 0 } } }] };
    const s = fight(run, 0, "khe-da", 0);
    assert.ok(s.won);
    assert.equal(s.run.armies[0].at, "khe-da");
    assert.equal(s.run.nodes["khe-da"]?.cleared, true);
    assert.equal(s.run.armies[1].fighters[id]!.hp, Math.round(f.config.maxHp * EXPEDITION_REST_HEAL));
    assert.equal(s.run.day, 2);
  });

  it("thua trận: đạo rút về chỗ cũ, gục hết, địch giữ thương vong, tính một lần thua", () => {
    const s = fight(newRun(), 0, "khe-da", 1);
    assert.ok(!s.won);
    assert.equal(s.run.armies[0].at, EXPEDITION_MAPS.aiBac.camps[0]);
    assert.ok(s.run.armies[0].ids.every((id) => s.run.armies[0].fighters[id]!.hp === 0));
    assert.ok(s.run.nodes["khe-da"]?.foeHp);
    assert.equal(s.run.defeats, 1);
    assert.deepEqual(marchExpedition(s.run, 0, "khe-da"), { ok: false, error: "armyDown" });
    // Nghỉ một ngày là đứng dậy đánh tiếp được.
    const camped = campExpedition(s.run);
    assert.ok(camped.ok);
    if (camped.ok) assert.equal(marchExpedition(camped.run, 0, "khe-da").ok, true);
  });

  it("giáp công: đạo kia đứng kề ô bị đánh thì máu địch giảm", () => {
    let run = newRun();
    const solo = expeditionEncounter(run, "kho-ngua", 0)!;
    run = { ...run, armies: [{ ...run.armies[0], at: "ban-na" }, { ...run.armies[1], at: "bai-lau" }] };
    const pincer = expeditionEncounter(run, "kho-ngua", 0)!;
    assert.ok(!solo.pincer && pincer.pincer);
    assert.ok(Math.abs(pincer.foes[0]!.maxHp - solo.foes[0]!.maxHp * EXPEDITION_PINCER_HP) <= 1);
  });

  it("địch tăng viện theo ngày", () => {
    const run = newRun();
    const later = { ...run, day: 6 };
    assert.ok(expeditionEncounter(later, "khe-da", 0)!.foes[0]!.atk > expeditionEncounter(run, "khe-da", 0)!.foes[0]!.atk);
  });

  it("hết hạn ngày mà chưa chiếm thành thì thua", () => {
    let run = { ...newRun(), day: EXPEDITION_MAPS.aiBac.days };
    const c = campExpedition(run);
    assert.ok(c.ok);
    if (!c.ok) return;
    run = c.run;
    assert.equal(run.phase, "lost");
    assert.equal(run.endReason, "timeout");
  });

  it("chiếm thành đích là thắng, có sao và thưởng lần đầu đúng một lần", () => {
    let run = newRun();
    run = { ...run, armies: [{ ...run.armies[0], at: "gac-bac" }, { ...run.armies[1], at: "gac-nam" }], day: 8 };
    const s = fight(run, 0, "thanh-ai-bac", 0);
    assert.equal(s.run.phase, "won");
    assert.equal(expeditionStars(s.run), 3);
    const profile = expeditionSimProfile(10);
    const state: ExpeditionState = { ...NEW_EXPEDITION, run: s.run };
    const end = applyExpeditionEnd(profile, state, createRng(1));
    assert.equal(end.profile.gold, profile.gold + EXPEDITION_TIER_INFO[1].firstGold);
    assert.equal(end.state.cleared.aiBac, 1);
    assert.equal(end.state.stars["aiBac:1"], 3);
    assert.equal(end.state.bestDays?.["aiBac:1"], 8);
    assert.ok(end.state.run?.result?.item);
    const again = applyExpeditionEnd(end.profile, end.state, createRng(1));
    assert.equal(again.profile.gold, end.profile.gold);
    // Lượt sau thắng lại: vàng nhỏ, không món.
    const repeat = applyExpeditionEnd(end.profile, { ...end.state, run: { ...s.run, rewarded: false } }, createRng(1));
    assert.equal(repeat.profile.gold, end.profile.gold + EXPEDITION_TIER_INFO[1].repeatGold);
    assert.equal(repeat.state.run?.result?.item, null);
  });

  it("thẻ trận cũ không chốt được", () => {
    const run = newRun();
    const started = beginExpeditionBattle(run, { army: 0, node: "khe-da", matchId: "m", pincer: false });
    const tag: ExpeditionMatchTag = { runId: "khac", map: run.map, tier: run.tier, node: "khe-da", army: 0, day: 1 };
    assert.deepEqual(settleExpeditionBattle(started, tag, finished(started, 0, "khe-da", 0)), { ok: false, error: "staleMatch" });
  });

  it("rút khỏi viễn chinh thì kết thúc, không thưởng", () => {
    const run = abandonExpedition(newRun());
    const end = applyExpeditionEnd(expeditionSimProfile(10), { ...NEW_EXPEDITION, run }, createRng(1));
    assert.equal(end.state.run?.result?.won, false);
    assert.equal(end.state.run?.result?.gold, 0);
  });
});

describe("Viễn Chinh: lưu hồ sơ", () => {
  it("đọc lại đúng trạng thái đã lưu, bỏ dữ liệu hỏng", () => {
    const state: ExpeditionState = { cleared: { aiBac: 2 }, stars: { "aiBac:1": 3 }, run: newRun() };
    const json = JSON.parse(JSON.stringify(state));
    assert.deepEqual(parseExpedition(json), state);
    assert.equal(parseExpedition(null), null);
    assert.deepEqual(parseExpedition({ cleared: { lạ: 3, aiBac: 9 }, stars: { "x:1": 2 }, run: { version: 2 } }), NEW_EXPEDITION);
    const profile = parseProfile(JSON.parse(JSON.stringify({ ...expeditionSimProfile(5), expedition: state })));
    assert.deepEqual(profile.expedition, state);
    assert.equal(parseProfile(JSON.parse(JSON.stringify(expeditionSimProfile(5)))).expedition, undefined);
  });

  it("giới hạn lượt xuất quân mỗi ngày, sang ngày mới thì mở lại", () => {
    let state: ExpeditionState = NEW_EXPEDITION;
    for (let i = 0; i < EXPEDITION_RUNS_PER_DAY; i++) {
      assert.equal(expeditionRunsLeft(state, "2026-11-04"), EXPEDITION_RUNS_PER_DAY - i);
      state = countExpeditionRun(state, "2026-11-04")!;
    }
    assert.equal(expeditionRunsLeft(state, "2026-11-04"), 0);
    assert.equal(countExpeditionRun(state, "2026-11-04"), null);
    assert.equal(expeditionRunsLeft(state, "2026-11-05"), EXPEDITION_RUNS_PER_DAY);
    assert.deepEqual(countExpeditionRun(state, "2026-11-05")?.daily, { day: "2026-11-05", runs: 1 });
    assert.deepEqual(parseExpedition(JSON.parse(JSON.stringify(state)))?.daily, state.daily);
  });

  it("bảng xếp hạng: nhiều sao đứng trên, bằng sao thì ít ngày hơn đứng trên", () => {
    assert.equal(expeditionBoardScore(NEW_EXPEDITION), 0);
    const a: ExpeditionState = { ...NEW_EXPEDITION, stars: { "aiBac:1": 3, "aiBac:2": 2 }, bestDays: { "aiBac:1": 8, "aiBac:2": 11 } };
    const b: ExpeditionState = { ...a, bestDays: { "aiBac:1": 7, "aiBac:2": 11 } };
    const c: ExpeditionState = { ...NEW_EXPEDITION, stars: { "aiBac:1": 3, "aiBac:2": 3 }, bestDays: { "aiBac:1": 12, "aiBac:2": 12 } };
    assert.ok(expeditionBoardScore(b) > expeditionBoardScore(a));
    assert.ok(expeditionBoardScore(c) > expeditionBoardScore(b));
    assert.deepEqual(describeScore("expedition", expeditionBoardScore(a)), { main: 5, turns: 19 });
    const profile = { ...expeditionSimProfile(5), expedition: a };
    assert.deepEqual(boardScores(profile).find((x) => x.board === "expedition"), { board: "expedition", score: expeditionBoardScore(a) });
    assert.deepEqual(parseExpedition(JSON.parse(JSON.stringify(a)))?.bestDays, a.bestDays);
  });
});
