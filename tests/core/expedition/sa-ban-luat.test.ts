// Viễn Chinh: luật riêng nhẹ của năm sa bàn ngoài Cửa Biển (GDD mục 4.1) và Trinh sát chung.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXPEDITION_GATE_ID,
  EXPEDITION_MAPS,
  EXPEDITION_SCENARIOS,
  NEW_EXPEDITION,
  STARTER_COMPANIONS,
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
  expeditionEnding,
  expeditionFoeSide,
  expeditionMatchTag,
  expeditionNeighbors,
  expeditionSimProfile,
  expeditionStars,
  marchExpedition,
  settleExpeditionBattle,
  type BattleState,
  type ExpeditionEncounter,
  type ExpeditionMapId,
  type ExpeditionRun,
} from "../../../src/core";

const IDS = STARTER_COMPANIONS.map((c) => c.id);

function newRun(map: ExpeditionMapId, seed = 7): ExpeditionRun {
  const made = createExpeditionRun(expeditionSimProfile(10), NEW_EXPEDITION, { map, tier: 1, main: IDS.slice(0, 2), second: IDS.slice(2, 5) }, "r", seed);
  if (!made.ok) throw new Error(made.error);
  return made.run;
}

function finished(run: ExpeditionRun, army: 0 | 1, encounter: ExpeditionEncounter, winner: 0 | 1): BattleState {
  const { state } = createBattle({ sides: [expeditionArmySide(run, army), expeditionFoeSide(encounter)], seed: 1, timer: false, firstSide: 0 });
  for (const f of state.sides[winner === 0 ? 1 : 0].fighters) f.hp = 0;
  state.winner = winner;
  return state;
}

function fight(run: ExpeditionRun, army: 0 | 1, to: string, winner: 0 | 1 = 0) {
  const m = marchExpedition(run, army, to);
  if (!m.ok || m.kind !== "battle") throw new Error(`expected battle, got ${JSON.stringify(m.ok ? m.kind : m.error)}`);
  const started = beginExpeditionBattle(run, expeditionBattleRef(army, m.encounter, "m"));
  const settled = settleExpeditionBattle(started, expeditionMatchTag(run, army, m.encounter), finished(started, army, m.encounter, winner));
  if (!settled.ok) throw new Error(settled.error);
  return { ...settled, encounter: m.encounter };
}

const at = (run: ExpeditionRun, army: 0 | 1, node: string): ExpeditionRun => {
  const armies: [ExpeditionRun["armies"][0], ExpeditionRun["armies"][1]] = [run.armies[0], run.armies[1]];
  armies[army] = { ...armies[army], at: node };
  return { ...run, armies };
};

describe("Viễn Chinh: kịch bản năm sa bàn", () => {
  it("mọi sa bàn có kịch bản; khối luật trỏ vào ô và đường có thật", () => {
    for (const map of Object.values(EXPEDITION_MAPS)) {
      const s = EXPEDITION_SCENARIOS[map.id];
      assert.ok(s, map.id);
      const ids = new Set(map.nodes.map((n) => n.id));
      for (const [a, b] of s.broken?.edges ?? []) assert.ok(expeditionNeighbors(map, a).includes(b), `${map.id} ${a}~${b}`);
      for (const id of [
        ...(s.hold?.nodes ?? []),
        s.counter?.node,
        s.gate?.skipFrom,
        s.refugees?.village,
        s.refugees?.home,
        s.tide?.revealedBy,
      ])
        if (id) assert.ok(ids.has(id), `${map.id} ${id}`);
      if (s.counter) assert.equal(map.nodes.find((n) => n.id === s.counter!.node)?.kind, "granary");
      if (s.gate?.skipFrom) assert.ok(expeditionNeighbors(map, map.citadel).includes(s.gate.skipFrom));
      // Bốn kết thúc riêng chỉ khi có cả rút dân và viện binh.
      if (s.endingGold) assert.ok(s.refugees && s.reinforcements);
    }
  });

  it("Ải Bắc: hai lối đèo bị phá theo seed, thành đích vẫn tới được; thành có cổng", () => {
    const map = EXPEDITION_MAPS.aiBac;
    for (let seed = 1; seed <= 20; seed++) {
      const run = newRun("aiBac", seed);
      assert.equal(run.broken?.length, 2);
      for (const camp of map.camps) {
        const seen = new Set([camp]);
        const open = [camp];
        while (open.length) {
          const id = open.pop()!;
          for (const n of expeditionNeighbors(map, id))
            if (!seen.has(n) && !run.broken!.includes(expeditionEdgeKey(id, n))) { seen.add(n); open.push(n); }
        }
        assert.ok(seen.has(map.citadel), `seed ${seed}`);
      }
    }
    const enc = expeditionEncounter(at(newRun("aiBac"), 0, "gac-bac"), "thanh-ai-bac", 0)!;
    assert.equal(enc.mode, "gate");
    assert.equal(enc.foes[0]!.id, EXPEDITION_GATE_ID);
  });

  it("Thượng Du: viện binh vào thành ngày 8; giữ Đèo Ngang thì chặn", () => {
    let run = { ...newRun("thuongDu"), day: 8 };
    const before = expeditionEncounter(at(run, 0, "gac-may"), "thanh-thuong-du", 0)!.power;
    run = (campExpedition(run) as { ok: true; run: ExpeditionRun }).run;
    assert.equal(run.arrivals, 1);
    const after = expeditionEncounter(at(run, 0, "gac-may"), "thanh-thuong-du", 0)!.power;
    assert.ok(after > before * 1.1);

    const fresh = at(newRun("thuongDu"), 0, "ban-moc");
    const r = fight({ ...fresh, nodes: { ...fresh.nodes, "ban-moc": { cleared: true } } }, 0, "deo-ngang");
    assert.deepEqual(r.encounter.objective, { type: "hold", turns: EXPEDITION_SCENARIOS.thuongDu!.hold!.turns });
    assert.equal(r.run.reinforcementsCut, true);
    let cut = { ...r.run, day: 8 };
    cut = (campExpedition(cut) as { ok: true; run: ExpeditionRun }).run;
    assert.equal(cut.arrivals, undefined);
  });

  it("Ngã Ba Sông: chiếm Kho Thóc thì hai ngày sau giặc phản công", () => {
    const run = at(newRun("chauTho"), 0, "lang-ruong");
    const r = fight({ ...run, nodes: { ...run.nodes, "lang-ruong": { cleared: true } } }, 0, "kho-thoc");
    assert.equal(r.run.market?.status, "pending");
    let next = r.run;
    while (next.market?.status === "pending") next = (campExpedition(next) as { ok: true; run: ExpeditionRun }).run;
    assert.equal(next.market?.status, "due");
    const counter = marchExpedition(next, 0, "kho-thoc");
    assert.ok(counter.ok && counter.kind === "battle" && counter.encounter.mode === "counter");
  });

  it("Kinh Thành: Lũy Cầu Tây là trận giữ, thắng thì chặn viện binh", () => {
    const run = at(newRun("kinhThanh"), 0, "don-ruong");
    const r = fight({ ...run, nodes: { ...run.nodes, "don-ruong": { cleared: true } } }, 0, "cau-tay");
    assert.equal(r.encounter.objective?.type, "hold");
    assert.equal(r.run.reinforcementsCut, true);
  });

  it("Quần Đảo: phải phá cổng, trừ khi đổ bộ từ Làng Đảo Rùa", () => {
    const run = newRun("quanDao");
    assert.equal(expeditionEncounter(at(run, 0, "cau-dai"), "thanh-dao", 0)!.mode, "gate");
    assert.equal(expeditionEncounter(at(run, 0, "dao-rua"), "thanh-dao", 0)!.mode, undefined);
  });

  it("năm sa bàn giữ luật sao chung, không có bốn kết thúc riêng", () => {
    const won = { ...newRun("kinhThanh"), phase: "won" as const, day: 6 };
    assert.equal(expeditionEnding(won), undefined);
    assert.equal(expeditionStars(won), 3);
    const end = applyExpeditionEnd(expeditionSimProfile(10), { ...NEW_EXPEDITION, run: won }, createRng(1));
    assert.equal(end.state.cleared.kinhThanh, 1);
    assert.equal(end.state.run?.result?.ending, undefined);
  });
});
