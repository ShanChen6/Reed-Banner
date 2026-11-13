// Dựng HTML các mảng màn trận tách từ DemoGame.tsx (12/11/2026) với trạng thái trận thật, để bắt lỗi khi hiển thị
// những tình huống smoke test trình duyệt không đi tới: kết thúc trận, nhiệm vụ Bình Loạn đạt/thất bại.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CAMPAIGN_SCENARIOS,
  STARTER_COMPANIONS,
  battleRewards,
  createBattle,
  getSkill,
  mainCharacter,
  type BattleState,
  type CampaignScenarioTag,
  type GearItem,
} from "../../src/core";
import { SceneContext, type SceneApi } from "../../src/app/game/SceneContext";
import { BattleResult, type BattleResultProps } from "../../src/app/game/battle/BattleResult";
import { CampaignResult } from "../../src/app/game/battle/CampaignResult";
import { SkillBar } from "../../src/app/game/battle/SkillBar";
import { TeamColumn } from "../../src/app/game/battle/TeamColumn";
import type { Outcome } from "../../src/app/game/battle/demoSetup";

const byId = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id)!;
const noop = () => {};

function battle(winner: 0 | 1 | null): BattleState {
  const state = createBattle({
    sides: [
      { fighters: [mainCharacter("hoa"), byId("haVan"), byId("maiThanh")], leader: 0 },
      { fighters: [byId("leThach"), byId("toKim"), byId("phungPhong")], leader: 0 },
    ],
    seed: 7,
    timer: false,
  }).state;
  state.winner = winner;
  return state;
}

const scene: SceneApi = {
  currentScene: "PRACTICE",
  params: new URLSearchParams(),
  go: noop,
  goHref: noop,
  arrived: true,
};
const render = (el: ReactElement) => renderToStaticMarkup(createElement(SceneContext.Provider, { value: scene }, el));

function outcome(state: BattleState, extra: Partial<Outcome> = {}): Outcome {
  return { rewards: battleRewards(state, 0), levelUps: [], drop: null, soldFor: 0, ...extra };
}

function resultProps(state: BattleState, over: Partial<BattleResultProps> = {}): BattleResultProps {
  return {
    arenaFoe: null, dailyDay: null, destinyFloorNo: null, drop: null, expeditionMatch: false, mode: "practice",
    online: false, outcome: null, raidBoss: null, replay: noop, restart: noop, specialQuestId: null, state,
    survival: null, towerFeatures: { trial: true, destiny: true }, ...over,
  };
}

describe("mảng màn trận tách từ DemoGame", () => {
  it("BattleResult: thắng, thua, có thưởng và đồ rơi, Thiên Mệnh hoàn thành tháp", () => {
    const won = battle(0);
    assert.match(render(createElement(BattleResult, resultProps(won))), /Bạn thắng!/);
    assert.match(render(createElement(BattleResult, resultProps(battle(1)))), /Bạn thua/);

    const item: GearItem = { id: "g1", slot: "yPhuc", element: "hoa", tier: 3, set: "coLau" };
    const withLoot = render(createElement(BattleResult, resultProps(won, { mode: "progress", outcome: outcome(won, { drop: item }), drop: item })));
    assert.match(withLoot, /kinh nghiệm mỗi người/);

    const tower = render(createElement(BattleResult, resultProps(won, {
      online: true, mode: "progress", destinyFloorNo: 20,
      outcome: outcome(won, { destiny: { floor: 20, won: true, phase: "done", completed: true } }),
    })));
    assert.match(tower, /tầng cuối của tháp/);
    assert.match(tower, /Về Tháp Thiên Mệnh/);
  });

  it("CampaignResult: đạt mục tiêu và thất bại", () => {
    const plan = CAMPAIGN_SCENARIOS[0]!;
    const scenario: CampaignScenarioTag = { nodeId: plan.nodeId, scenarioId: plan.nodeId, phaseIndex: 0 };
    const base = { bossThreshold: undefined, labels: [], phaseAdvanced: false, phaseBoss: undefined, scenario };
    const ok = render(createElement(CampaignResult, { ...base, outcome: null, scenarioFailed: false }));
    const failed = render(createElement(CampaignResult, { ...base, outcome: null, scenarioFailed: true }));
    assert.ok(ok.length > 0 && failed.length > 0);
    assert.notEqual(ok, failed, "đạt và thất bại hiện khác nhau");
  });

  it("SkillBar và TeamColumn dựng đủ kỹ năng và thẻ nhân vật", () => {
    const state = battle(null);
    const actor = state.sides[0].fighters[0]!;
    const skills = (actor.skills ?? []).map((id) => getSkill(id)!).filter(Boolean);
    const bar = render(createElement(SkillBar, {
      actor, aim: null, castSkill: noop, myTurn: true, setAim: noop, setPendingWhirl: noop, setSelected: noop,
      setWhirlAim: noop, skills, stacked: false, state, whirlAim: null,
    }));
    assert.match(bar, /aria-label="Kỹ năng"/);
    for (const def of skills) assert.ok(bar.includes(def.name), def.name);

    const column = render(createElement(TeamColumn, {
      aim: null, aimMark: 0, aimingAlly: false, aimingFoe: false, apply: () => true, arenaFoe: null, fireAim: noop,
      floats: [], inline: false, own: state.sides[1], s: 1, selectable: [], skillBar: () => null, started: true, state,
    }));
    assert.match(column, /Tianwu/);
    for (const f of state.sides[1].fighters) assert.ok(column.includes(f.name), f.name);
  });
});
