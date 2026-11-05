import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXPEDITION_GATE_ID,
  EXPEDITION_MAPS,
  EXPEDITION_SCENARIOS,
  type ExpeditionScenario,
  EXPEDITION_TIER_INFO,
  NEW_EXPEDITION,
  STARTER_COMPANIONS,
  act,
  applyExpeditionEnd,
  beginExpeditionBattle,
  campExpedition,
  createBattle,
  createExpeditionRun,
  createRng,
  expeditionArmySide,
  expeditionBattleRef,
  expeditionEdgeKey,
  expeditionEncounter,
  expeditionFoeSide,
  expeditionMatchTag,
  expeditionNeighbors,
  expeditionObjectiveMet,
  expeditionSimProfile,
  expeditionStars,
  expeditionVisible,
  settle,
  marchExpedition,
  parseExpedition,
  scoutExpedition,
  settleExpeditionBattle,
  startMatch,
  type BattleState,
  type ExpeditionEncounter,
  type ExpeditionRun,
} from "../../../src/core";

const IDS = STARTER_COMPANIONS.map((c) => c.id);
const SCENARIO = EXPEDITION_SCENARIOS.cuaBien! as Required<ExpeditionScenario>;
const MAP = EXPEDITION_MAPS.cuaBien;

function newRun(seed = 7): ExpeditionRun {
  const made = createExpeditionRun(
    expeditionSimProfile(10),
    NEW_EXPEDITION,
    { map: "cuaBien", tier: 1, main: IDS.slice(0, 2), second: IDS.slice(2, 5) },
    "run1",
    seed,
  );
  if (!made.ok) throw new Error(made.error);
  return made.run;
}

/** Lượt không có đường bị phá (để kiểm từng luật riêng). */
const clean = (run: ExpeditionRun): ExpeditionRun => ({ ...run, broken: [] });

/** Dựng trận thật rồi ép kết quả: phe thắng giữ nguyên máu, phe thua gục hết. */
function finished(run: ExpeditionRun, army: 0 | 1, encounter: ExpeditionEncounter, winner: 0 | 1): BattleState {
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

function fight(run: ExpeditionRun, army: 0 | 1, to: string, winner: 0 | 1) {
  const m = marchExpedition(run, army, to);
  if (!m.ok || m.kind !== "battle") throw new Error(`expected battle, got ${JSON.stringify(m.ok ? m.kind : m.error)}`);
  const started = beginExpeditionBattle(run, expeditionBattleRef(army, m.encounter, "m"));
  const settled = settleExpeditionBattle(started, expeditionMatchTag(run, army, m.encounter), finished(started, army, m.encounter, winner));
  if (!settled.ok) throw new Error(settled.error);
  return { ...settled, encounter: m.encounter };
}

function move(run: ExpeditionRun, army: 0 | 1, to: string): ExpeditionRun {
  const m = marchExpedition(run, army, to);
  if (!m.ok || m.kind !== "moved") throw new Error(`expected move, got ${JSON.stringify(m.ok ? m.kind : m.error)}`);
  return m.run;
}

/** Còn đường từ `from` tới `to` khi bỏ các đường trong `broken`. */
function reachable(from: string, to: string, broken: readonly string[]): boolean {
  const seen = new Set([from]);
  const open = [from];
  while (open.length) {
    const id = open.pop()!;
    if (id === to) return true;
    for (const n of expeditionNeighbors(MAP, id))
      if (!seen.has(n) && !broken.includes(expeditionEdgeKey(id, n))) {
        seen.add(n);
        open.push(n);
      }
  }
  return false;
}

describe("Cửa Biển: đường bị phá", () => {
  it("mỗi lượt chọn 2 trong 4 đường theo seed, cùng seed thì như nhau", () => {
    const run = newRun(11);
    assert.equal(run.broken?.length, 2);
    const pool = SCENARIO.broken.edges.map(([a, b]) => expeditionEdgeKey(a, b));
    for (const k of run.broken!) assert.ok(pool.includes(k));
    assert.deepEqual(newRun(11).broken, run.broken);
    const seen = new Set(Array.from({ length: 40 }, (_, i) => newRun(i).broken!.join("|")));
    assert.ok(seen.size > 1, "seed khác nhau phải ra tổ hợp khác nhau");
  });

  it("mọi tổ hợp 2 đường bị phá vẫn còn đường tới thành đích, làng và bãi cạn", () => {
    const pool = SCENARIO.broken.edges.map(([a, b]) => expeditionEdgeKey(a, b));
    for (let i = 0; i < pool.length; i++)
      for (let j = i + 1; j < pool.length; j++) {
        const broken = [pool[i]!, pool[j]!];
        for (const camp of MAP.camps)
          for (const goal of [MAP.citadel, "lang-chai", "bai-can"])
            assert.ok(reachable(camp, goal, broken), `${camp} → ${goal} khi phá ${broken.join(", ")}`);
      }
  });

  it("chọn đi trúng đường bị phá: đứng yên, mất ngày, đường lộ; đi lại thì báo lỗi", () => {
    const run = { ...newRun(), broken: [expeditionEdgeKey("trai-ben", "ben-coi")] };
    const m = marchExpedition(run, 0, "ben-coi");
    assert.ok(m.ok && m.kind === "blocked" && m.reason === "broken");
    if (!m.ok || m.kind !== "blocked") return;
    assert.equal(m.run.day, 2);
    assert.equal(m.run.armies[0].at, "trai-ben");
    assert.deepEqual(m.run.knownBroken, [expeditionEdgeKey("trai-ben", "ben-coi")]);
    const again = marchExpedition(m.run, 0, "ben-coi");
    assert.ok(!again.ok && again.error === "roadBroken");
  });

  it("trinh sát lộ đường bị phá trong 2 bước, vén sương và tốn một ngày", () => {
    const run = { ...newRun(), broken: [expeditionEdgeKey("bai-su", "mui-cat"), expeditionEdgeKey("mui-cat", "bai-can")] };
    assert.ok(!expeditionVisible(run).has("mui-cat"));
    const s = scoutExpedition(run, 1);
    assert.ok(s.ok);
    if (!s.ok) return;
    assert.equal(s.run.day, 2);
    // Từ Trại Bãi Sậy: Bãi Sú 1 bước, Mũi Cát 2 bước nên đường Bãi Sú–Mũi Cát lộ; Mũi Cát–Bãi Cạn cũng trong vùng.
    assert.ok(s.run.knownBroken?.includes(expeditionEdgeKey("bai-su", "mui-cat")));
    assert.ok(expeditionVisible(s.run).has("mui-cat"));
    // Đạo trinh sát không hồi sức (máu đầy nên kiểm lương: đạo kia +10, đạo trinh sát giữ nguyên).
    assert.equal(s.run.armies[1].food, run.armies[1].food);
    assert.ok(s.run.armies[0].food > run.armies[0].food);
  });

  it("mọi sa bàn trinh sát được; sa bàn không có đường bị phá thì không lộ đường nào", () => {
    const made = createExpeditionRun(expeditionSimProfile(10), NEW_EXPEDITION, { map: "kinhThanh", tier: 1, main: IDS.slice(0, 2), second: IDS.slice(2, 5) }, "r", 1);
    assert.ok(made.ok);
    if (!made.ok) return;
    assert.equal(made.run.broken, undefined);
    const s = scoutExpedition(made.run, 0);
    assert.ok(s.ok);
    if (!s.ok) return;
    assert.equal(s.run.day, 2);
    assert.ok((s.run.scouted ?? []).length > 0);
    assert.equal(s.run.knownBroken, undefined);
  });
});

describe("Cửa Biển: con nước", () => {
  const atShoal = (day: number, tideKnown?: boolean): ExpeditionRun => {
    const run = clean(newRun());
    return {
      ...run,
      day,
      ...(tideKnown ? { tideKnown } : {}),
      armies: [run.armies[0], { ...run.armies[1], at: "bai-can" }],
    };
  };

  it("chưa biết lịch mà đi lúc nước lên: mất ngày và biết lịch", () => {
    const m = marchExpedition(atShoal(3), 1, MAP.citadel);
    assert.ok(m.ok && m.kind === "blocked" && m.reason === "tide");
    if (!m.ok || m.kind !== "blocked") return;
    assert.equal(m.run.tideKnown, true);
    assert.equal(m.run.day, 4);
  });

  it("đã biết lịch thì nước lên báo lỗi, không mất ngày", () => {
    const m = marchExpedition(atShoal(3, true), 1, MAP.citadel);
    assert.ok(!m.ok && m.error === "highTide");
  });

  it("ngày nước rút vào cửa nước: đánh thẳng tướng giữ thành, không có phase phá cổng", () => {
    const m = marchExpedition(atShoal(SCENARIO.tide.days[0]!), 1, MAP.citadel);
    assert.ok(m.ok && m.kind === "battle");
    if (!m.ok || m.kind !== "battle") return;
    assert.equal(m.encounter.mode, undefined);
    assert.ok(m.encounter.foes.every((f) => !f.structure));
  });
});

describe("Cửa Biển: rút dân", () => {
  /** Đạo Chính chiếm Bến Cói rồi ghé Làng Chài. */
  function toVillage(): ExpeditionRun {
    let run = clean(newRun());
    run = fight(run, 0, "ben-coi", 0).run;
    return move(run, 0, "lang-chai");
  }

  it("ghé làng nhận dân, đưa về trại là xong và biết lịch con nước", () => {
    let run = toVillage();
    assert.equal(run.refugees, 0);
    assert.equal(run.tideKnown, undefined);
    run = move(run, 0, "ben-coi");
    run = move(run, 0, "trai-ben");
    assert.equal(run.refugees, "saved");
    assert.equal(run.tideKnown, true);
  });

  it("đồn chặn chưa chiếm thì rời làng gặp truy binh; thắng thì đi tiếp, vẫn mang dân", () => {
    let run = clean(newRun());
    // Đi vòng không chiếm Bến Cói: đặt thẳng đạo Chính ở làng, Đài Quan Triều đã chiếm.
    run = { ...run, armies: [{ ...run.armies[0], at: "lang-chai" }, run.armies[1]], refugees: 0, nodes: { ...run.nodes, "dai-trieu": { cleared: true } } };
    const r = fight(run, 0, "dai-trieu", 0);
    assert.equal(r.encounter.mode, "chase");
    assert.deepEqual(r.encounter.objective, { type: "escort", turns: SCENARIO.refugees.chaseTurns });
    assert.equal(r.run.armies[0].at, "dai-trieu");
    assert.equal(r.run.refugees, 0);
  });

  it("thua trận khi đang mang dân thì mất dân", () => {
    let run = clean(newRun());
    run = { ...run, armies: [{ ...run.armies[0], at: "lang-chai" }, run.armies[1]], refugees: 0 };
    const r = fight(run, 0, "dai-trieu", 1);
    assert.equal(r.run.refugees, "lost");
    assert.equal(r.run.armies[0].at, "lang-chai");
  });
});

describe("Cửa Biển: cầu và thuyền viện", () => {
  it("cầu là trận giữ cầu; thắng thì chặn thuyền viện", () => {
    let run = clean(newRun());
    run = fight(run, 1, "bai-su", 0).run;
    const r = fight(run, 1, "doi-cat", 0);
    assert.deepEqual(r.encounter.objective, { type: "hold", turns: SCENARIO.hold.turns });
    assert.equal(r.encounter.foes.length, 3);
    assert.equal(r.run.reinforcementsCut, true);
  });

  it("thuyền viện tới cuối ngày 5 làm thành đích mạnh thêm; đã cắt thì không tới", () => {
    const run = { ...clean(newRun()), day: 5 };
    const camped = campExpedition(run);
    assert.ok(camped.ok);
    if (!camped.ok) return;
    assert.equal(camped.run.arrivals, 1);
    const atGate = (r: ExpeditionRun): ExpeditionRun => ({ ...r, armies: [{ ...r.armies[0], at: "doi-cat" }, r.armies[1]] });
    const before = expeditionEncounter(atGate({ ...run, day: 6 }), MAP.citadel, 0)!;
    const after = expeditionEncounter(atGate(camped.run), MAP.citadel, 0)!;
    assert.ok(after.power > before.power * 1.1);
    const cut = campExpedition({ ...run, reinforcementsCut: true });
    assert.ok(cut.ok && cut.run.arrivals === undefined);
  });
});

describe("Cửa Biển: phản công Chợ", () => {
  function takeMarket(): ExpeditionRun {
    let run = clean(newRun());
    run = fight(run, 1, "bai-su", 0).run;
    return fight(run, 1, "cho-song", 0).run;
  }

  it("chiếm chợ thì 2 ngày sau giặc phản công; đạo giữ chợ phải đánh trước", () => {
    let run = takeMarket();
    assert.equal(run.market?.status, "pending");
    const taken = run.market!.taken;
    while (run.day <= taken + SCENARIO.counter.afterDays) run = (campExpedition(run) as { ok: true; run: ExpeditionRun }).run;
    assert.equal(run.market?.status, "due");
    assert.ok(!campExpedition(run).ok);
    const other = marchExpedition(run, 0, "ben-coi");
    assert.ok(!other.ok && other.error === "counterPending");
    const r = fight(run, 1, "cho-song", 0);
    assert.equal(r.encounter.mode, "counter");
    assert.equal(r.run.market?.status, "held");
  });

  it("không ai đứng giữ thì giặc chiếm lại chợ", () => {
    let run = takeMarket();
    run = move(run, 1, "bai-su");
    while (run.market?.status === "pending") run = (campExpedition(run) as { ok: true; run: ExpeditionRun }).run;
    assert.equal(run.market?.status, "lost");
    assert.equal(run.nodes["cho-song"]?.cleared, undefined);
    assert.deepEqual(run.nodes["cho-song"]?.foeHp, [SCENARIO.counter.retakenHp, SCENARIO.counter.retakenHp]);
  });
});

describe("Cửa Biển: phá cổng", () => {
  const atDike = (): ExpeditionRun => {
    const run = clean(newRun());
    return { ...run, armies: [run.armies[0], { ...run.armies[1], at: "mui-cat" }], nodes: { ...run.nodes, "mui-cat": { cleared: true } } };
  };

  it("đánh vào từ cửa bộ: phase phá cổng có cổng là công trình; cổng sụp thì trận sau đánh tướng", () => {
    const r = fight(atDike(), 1, MAP.citadel, 0);
    assert.equal(r.encounter.mode, "gate");
    const gate = r.encounter.foes[0]!;
    assert.equal(gate.id, EXPEDITION_GATE_ID);
    assert.equal(gate.structure, true);
    assert.equal(r.run.phase, "march");
    assert.equal(r.run.nodes[MAP.citadel]?.gateDown, true);
    const next = expeditionEncounter(r.run, MAP.citadel, 1)!;
    assert.equal(next.mode, undefined);
    assert.ok(next.foes.every((f) => !f.structure));
    const won = fight(r.run, 1, MAP.citadel, 0);
    assert.equal(won.run.phase, "won");
  });

  it("thủ lĩnh phe địch trong trận phá cổng không phải cổng", () => {
    const e = expeditionEncounter(atDike(), MAP.citadel, 1)!;
    assert.equal(expeditionFoeSide(e).leader, 1);
  });
});

describe("Cửa Biển: kết thúc và thưởng", () => {
  const ended = (patch: Partial<ExpeditionRun>): ExpeditionRun => ({ ...newRun(), ...patch });

  it("toàn thắng 3 sao và thêm một món phẩm cao hơn; chiếm trại 2 sao", () => {
    const full = ended({ phase: "won", day: 10, refugees: "saved", reinforcementsCut: true });
    assert.equal(expeditionStars(full), 3);
    assert.equal(expeditionStars(ended({ phase: "won", day: MAP.parDays })), 2);
    assert.equal(expeditionStars(ended({ phase: "won", day: MAP.parDays + 1 })), 1);
    const r = applyExpeditionEnd(expeditionSimProfile(10), { ...NEW_EXPEDITION, run: full }, createRng(1));
    const result = r.state.run!.result!;
    assert.equal(result.ending, "full");
    assert.equal(result.gold, Math.round(EXPEDITION_TIER_INFO[1].firstGold * SCENARIO.endingGold.full));
    assert.ok(result.item);
    assert.equal(result.bonusItem?.tier, EXPEDITION_TIER_INFO[1].gearTier + 1);
  });

  for (const endReason of ["timeout", "abandoned"] as const)
    it(`giữ dân (${endReason}): chỉ có vàng thắng lại × hệ số, không qua bậc, không có món`, () => {
      const run = ended({ phase: "lost", endReason, refugees: "saved", reinforcementsCut: true });
      assert.equal(expeditionStars(run), 1);
      const r = applyExpeditionEnd(expeditionSimProfile(10), { ...NEW_EXPEDITION, run }, createRng(1));
      const result = r.state.run!.result!;
      assert.equal(result.ending, "refuge");
      assert.equal(result.won, false);
      assert.equal(result.firstClear, false);
      assert.equal(result.item, null);
      assert.equal(result.gold, Math.round(EXPEDITION_TIER_INFO[1].repeatGold * SCENARIO.endingGold.refuge));
      assert.equal(r.state.cleared.cuaBien, undefined);
      assert.equal(r.state.bestDays, undefined);
    });

  it("hết ngày mà chưa làm đủ hai việc phụ thì không thưởng", () => {
    const run = ended({ phase: "lost", endReason: "timeout", refugees: "saved" });
    const r = applyExpeditionEnd(expeditionSimProfile(10), { ...NEW_EXPEDITION, run }, createRng(1));
    assert.equal(r.state.run!.result!.gold, 0);
    assert.equal(r.state.cleared.cuaBien, undefined);
  });

  it("lưu rồi đọc lại giữ các trường kịch bản", () => {
    const run = ended({
      knownBroken: [expeditionEdgeKey("bai-su", "mui-cat")],
      scouted: ["mui-cat"],
      tideKnown: true,
      refugees: 1,
      arrivals: 1,
      reinforcementsCut: true,
      market: { taken: 3, status: "held" },
      log: ["Ngày 1: thử"],
      nodes: { [MAP.citadel]: { gateDown: true, foeHp: [1, 0.5, 0] } },
    });
    const parsed = parseExpedition(JSON.parse(JSON.stringify({ ...NEW_EXPEDITION, run })))!.run!;
    for (const k of ["broken", "knownBroken", "scouted", "tideKnown", "refugees", "arrivals", "reinforcementsCut", "market", "log"] as const)
      assert.deepEqual(parsed[k], run[k], k);
    assert.equal(parsed.nodes[MAP.citadel]?.gateDown, true);
  });
});

describe("Cửa Biển: mục tiêu trận", () => {
  it("giữ đủ lượt thì phe người chơi thắng ngay trong lớp Match", () => {
    let run = clean(newRun());
    run = fight(run, 1, "bai-su", 0).run;
    const m = marchExpedition(run, 1, "doi-cat");
    assert.ok(m.ok && m.kind === "battle");
    if (!m.ok || m.kind !== "battle") return;
    const objective = { type: "hold" as const, turns: 1 };
    let match = startMatch({
      sides: [expeditionArmySide(run, 1), expeditionFoeSide(m.encounter)],
      difficulty: "easy",
      seed: 3,
      firstSide: 0,
      now: 0,
      expedition: { ...expeditionMatchTag(run, 1, m.encounter), objective },
    }).match;
    assert.equal(match.battle.winner, null);
    // Người chơi để hết giờ một lượt, AI đánh lượt của mình: đủ 1 lượt giữ cầu nếu còn người đứng.
    match = settle(match, match.battle.turn.deadline! + 60_000).match;
    assert.ok(match.battle.sides[0].fighters.some((f) => f.hp > 0));
    assert.equal(match.battle.winner, 0);
  });

  it("cổng là công trình: không bao giờ ra tay, phe chỉ còn cổng thì lượt trôi qua", () => {
    const run = clean(newRun());
    const atDike: ExpeditionRun = { ...run, armies: [run.armies[0], { ...run.armies[1], at: "mui-cat" }], nodes: { ...run.nodes, "mui-cat": { cleared: true } } };
    const e = expeditionEncounter(atDike, MAP.citadel, 1)!;
    const { state } = createBattle({
      sides: [expeditionArmySide(atDike, 1), { ...expeditionFoeSide(e), hpRatio: [1, 0, 0], leader: 0 }],
      seed: 2,
      timer: true,
      firstSide: 0,
      now: 0,
    });
    const r = act(state, { type: "timeout" }, state.turn.deadline! + 1);
    assert.ok(r.ok);
    if (!r.ok) return;
    // Phe địch chỉ còn cổng: lượt của địch trôi qua ngay, lại tới người chơi.
    assert.equal(r.state.turn.side, 0);
    assert.ok(r.events.some((ev) => ev.type === "frozenSkip" && ev.side === 1));
    assert.ok(!expeditionObjectiveMet({ type: "gate", fighter: 0 }, r.state));
    r.state.sides[1].fighters[0]!.hp = 0;
    assert.ok(expeditionObjectiveMet({ type: "gate", fighter: 0 }, r.state));
  });
});
