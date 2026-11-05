// Viễn Chinh: nhiệm vụ của năm sa bàn ngoài Cửa Biển (GDD mục 4.3): hộ tống hoặc chặn viện binh, thắng kèm nhiệm vụ
// thì vàng nhân missionGold.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXPEDITION_MAPS,
  EXPEDITION_SCENARIOS,
  EXPEDITION_TIER_INFO,
  NEW_EXPEDITION,
  STARTER_COMPANIONS,
  applyExpeditionEnd,
  beginExpeditionBattle,
  createBattle,
  createExpeditionRun,
  createRng,
  expeditionArmySide,
  expeditionBattleRef,
  expeditionFoeSide,
  expeditionMatchTag,
  expeditionMissionDone,
  expeditionSimProfile,
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

const ended = (map: ExpeditionMapId, patch: Partial<ExpeditionRun>): ExpeditionRun => ({ ...newRun(map), day: 5, ...patch });

describe("Viễn Chinh: nhiệm vụ các sa bàn", () => {
  it("mọi sa bàn có ít nhất một nhiệm vụ; sa bàn thường có thưởng nhiệm vụ", () => {
    for (const map of Object.values(EXPEDITION_MAPS)) {
      const s = EXPEDITION_SCENARIOS[map.id]!;
      assert.ok(s.refugees || s.reinforcements, map.id);
      assert.ok(s.endingGold || (s.missionGold ?? 0) > 1, map.id);
      if (s.reinforcements) assert.ok(s.hold?.nodes.length, `${map.id} có viện binh thì phải có ô chặn`);
    }
  });

  it("Ải Bắc: chiếm Kho Ngựa Thồ thì nhận tù binh; rời kho khi Lũy Đèo Mây chưa chiếm thì gặp truy binh", () => {
    let run = newRun("aiBac");
    run = { ...run, armies: [{ ...run.armies[0], at: "ban-na" }, run.armies[1]] };
    run = fight(run, 0, "kho-ngua").run;
    assert.equal(run.refugees, 0);
    assert.ok(run.log?.some((l) => l.includes("nhận tù binh")));
    const back = marchExpedition(run, 0, "ban-na");
    assert.ok(back.ok && back.kind === "battle" && back.encounter.mode === "chase");
  });

  it("Ngã Ba Sông: đạo hộ tống đứng ở Kho Thóc giữ được kho qua phản công thì tính là đưa dân về", () => {
    let run = newRun("chauTho");
    run = { ...run, refugees: 0, armies: [{ ...run.armies[0], at: "lang-ruong" }, run.armies[1]] };
    run = fight(run, 0, "kho-thoc").run;
    assert.equal(run.refugees, 0);
    run = { ...run, market: { taken: run.day, status: "due" } };
    run = fight(run, 0, "kho-thoc").run;
    assert.equal(run.market?.status, "held");
    assert.equal(run.refugees, "saved");
  });

  it("thua khi đang hộ tống thì người được hộ tống bị bắt lại", () => {
    let run = newRun("thuongDu");
    run = { ...run, refugees: 0, armies: [{ ...run.armies[0], at: "ban-moc" }, run.armies[1]] };
    run = fight(run, 0, "deo-ngang", 1).run;
    assert.equal(run.refugees, "lost");
    assert.equal(expeditionMissionDone(run), false);
  });

  it("thắng kèm nhiệm vụ: vàng nhân missionGold; thắng mà chưa xong nhiệm vụ thì vàng thường", () => {
    const cases: [ExpeditionMapId, Partial<ExpeditionRun>][] = [
      ["aiBac", { refugees: "saved" }],
      ["thuongDu", { refugees: "saved", reinforcementsCut: true }],
      ["chauTho", { refugees: "saved" }],
      ["kinhThanh", { reinforcementsCut: true }],
      ["quanDao", { reinforcementsCut: true }],
    ];
    for (const [map, done] of cases) {
      const gold = (patch: Partial<ExpeditionRun>) => {
        const run = ended(map, { phase: "won", ...patch });
        return applyExpeditionEnd(expeditionSimProfile(10), { ...NEW_EXPEDITION, run }, createRng(1)).state.run!.result!;
      };
      const withMission = gold(done);
      assert.equal(withMission.mission, true, map);
      assert.equal(withMission.gold, Math.round(EXPEDITION_TIER_INFO[1].firstGold * EXPEDITION_SCENARIOS[map]!.missionGold!), map);
      const without = gold({});
      assert.equal(without.mission, undefined, map);
      assert.equal(without.gold, EXPEDITION_TIER_INFO[1].firstGold, map);
    }
    // Thượng Du có hai nhiệm vụ: chỉ đưa dân về mà chưa chặn viện thì chưa tính.
    assert.equal(expeditionMissionDone(ended("thuongDu", { refugees: "saved" })), false);
  });

  it("thua viễn chinh dù xong nhiệm vụ thì không có thưởng", () => {
    const run = ended("aiBac", { phase: "lost", endReason: "timeout", refugees: "saved" });
    const r = applyExpeditionEnd(expeditionSimProfile(10), { ...NEW_EXPEDITION, run }, createRng(1));
    assert.equal(r.state.run!.result!.gold, 0);
    assert.equal(r.state.cleared.aiBac, undefined);
  });
});
