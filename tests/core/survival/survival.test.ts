import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ABANDON_MS,
  applySurvivalResult,
  autoRevive,
  BOSS_HP,
  createBattle,
  FOOD_MAX,
  humanAct,
  matchOver,
  newProfile,
  newSurvivalRun,
  parseProfile,
  planBreak,
  profileTeam,
  RAID_STAGES,
  settle,
  startMatch,
  SURVIVAL_FOOD,
  SURVIVAL_HEAL,
  SURVIVAL_REVIVE_FOOD,
  SURVIVAL_REVIVE_HP,
  survivalWave,
  viewOf,
  type BattleState,
  type Match,
} from "../../../src/core";

const profile = () => {
  const p = newProfile();
  return { ...p, main: { ...p.main, level: 10 } };
};

/** Trận đợt 1 mà phe người chơi vừa thắng: thủ lĩnh còn nửa máu, vị trí 2 đã gục. */
function wonWave(food = 30): BattleState {
  const p = profile();
  const run = newSurvivalRun(p, 7);
  const { state } = createBattle({
    sides: [
      { fighters: profileTeam(p, p.team), leader: 0 },
      { fighters: survivalWave(run, 1).foes, leader: 0 },
    ],
    seed: 3,
    timer: true,
  });
  const s = structuredClone(state);
  const [a, b] = s.sides[0].fighters;
  a!.hp = Math.round(a!.maxHp / 2);
  a!.energy = 50;
  b!.hp = 0;
  s.sides[0].food = food;
  s.sides[1].fighters.forEach((f) => (f.hp = 0));
  s.winner = 0;
  return s;
}

describe("sinh tồn", () => {
  it("đợt sinh theo seed: 2 đối thủ ở đợt 1–2, 3 từ đợt 3, đợt 5 có sứ quân máu trùm", () => {
    const run = newSurvivalRun(profile(), 42);
    assert.deepEqual(survivalWave(run, 4), survivalWave(run, 4));
    assert.equal(survivalWave(run, 1).foes.length, 2);
    assert.equal(survivalWave(run, 3).foes.length, 3);
    assert.equal(survivalWave(run, 1).level, 10);
    assert.equal(survivalWave(run, 5).level, 11);
    const boss = survivalWave(run, 5);
    assert.ok(boss.boss);
    assert.equal(boss.foes.length, 3);
    const leaders = RAID_STAGES.map((s) => s.foes[0]!.id);
    assert.ok(leaders.includes(boss.foes[0]!.id));
    assert.ok(boss.foes[0]!.maxHp > boss.foes[1]!.maxHp * (BOSS_HP - 0.5));
  });

  it("nghỉ giữa đợt: hồi máu người còn sống, cộng lương, đợt mới thay đối thủ trên cùng bàn cờ", () => {
    const battle = wonWave();
    const run = newSurvivalRun(profile(), 7);
    const plan = planBreak(run, battle);
    assert.ok(plan.ok);
    // Vừa gục ở đợt 1 nên chưa tự đứng dậy.
    assert.deepEqual(plan.run.downed, [null, 1, null]);
    assert.deepEqual(plan.config.revive, []);
    assert.equal(plan.config.food, 30 + SURVIVAL_FOOD);
    assert.equal(plan.run.wave, 2);
  });

  it("trả lương để hồi sinh ngay; thiếu lương hoặc chọn người còn sống thì từ chối", () => {
    const run = newSurvivalRun(profile(), 7);
    assert.deepEqual(planBreak(run, wonWave(5), 1), {
      ok: false,
      error: "notEnoughFood",
    });
    assert.deepEqual(planBreak(run, wonWave(), 0), {
      ok: false,
      error: "invalidRevive",
    });
    const plan = planBreak(run, wonWave(), 1);
    assert.ok(plan.ok);
    assert.deepEqual(plan.config.revive, [1]);
    assert.deepEqual(plan.run.downed, [null, null, null]);
    assert.equal(plan.config.food, 30 + SURVIVAL_FOOD - SURVIVAL_REVIVE_FOOD);
    const full = planBreak(run, wonWave(FOOD_MAX), 1);
    assert.ok(full.ok);
    assert.equal(full.config.food, FOOD_MAX - SURVIVAL_REVIVE_FOOD);
  });

  it("tự hồi sinh sau 2 đợt kể từ lúc gục, mỗi lần nghỉ tối đa 1 người", () => {
    assert.equal(autoRevive(1, [null, 1, null]), null);
    assert.equal(autoRevive(2, [null, 1, null]), 1);
    assert.equal(autoRevive(4, [3, 2, null]), 1);
  });

  it("trận sinh tồn: nghỉ giữa đợt chưa kết thúc, sang đợt 2 rồi dừng lại để ghi điểm", () => {
    const p = profile();
    const run = newSurvivalRun(p, 7);
    const start = startMatch({
      sides: [
        { fighters: profileTeam(p, p.team), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      difficulty: "easy",
      seed: 3,
      firstSide: 0,
      now: 0,
      survival: run,
    }).match;
    assert.deepEqual(
      humanAct(start, { type: "nextWave" }, start.seq, 10).ok,
      false,
    );
    const atBreak: Match = { ...start, battle: wonWave(), seq: start.seq + 1 };
    assert.equal(matchOver(atBreak), false);
    assert.equal(viewOf(atBreak).survival!.cleared, 1);
    assert.equal(viewOf(atBreak).survival!.next!.wave, 2);
    assert.equal("seed" in viewOf(atBreak).survival!, false);

    const next = humanAct(
      atBreak,
      { type: "nextWave", revive: 1 },
      atBreak.seq,
      10,
    );
    assert.ok(next.ok);
    const b = next.match.battle;
    assert.equal(b.winner, null);
    assert.equal(b.turn.side, 0);
    assert.equal(b.turn.number, 1);
    assert.equal(next.match.survival!.wave, 2);
    assert.equal(b.sides[1].fighters.length, 2);
    const [lead, revived] = b.sides[0].fighters;
    const lmax = lead!.maxHp;
    assert.equal(
      lead!.hp,
      Math.round(lmax / 2) + Math.round(lmax * SURVIVAL_HEAL),
    );
    assert.equal(lead!.energy, 50);
    assert.equal(revived!.hp, Math.round(revived!.maxHp * SURVIVAL_REVIVE_HP));
    assert.ok(next.events.some((e) => e.type === "wave" && e.wave === 2));

    const won2: Match = {
      ...next.match,
      battle: { ...b, winner: 0 },
      seq: next.match.seq + 1,
    };
    const end = humanAct(won2, { type: "endRun" }, won2.seq, 20);
    assert.ok(end.ok);
    assert.ok(matchOver(end.match));
    assert.equal(viewOf(end.match).survival!.cleared, 2);
  });

  it("bỏ dở quá 24 giờ không xử thua: dừng ở đợt cuối đã vượt qua", () => {
    const p = profile();
    const run = { ...newSurvivalRun(p, 7), wave: 4 };
    const m = startMatch({
      sides: [
        { fighters: profileTeam(p, p.team), leader: 0 },
        { fighters: survivalWave(run, 4).foes, leader: 0 },
      ],
      difficulty: "normal",
      seed: 3,
      firstSide: 0,
      now: 0,
      survival: run,
    }).match;
    const s = settle(m, ABANDON_MS + 1).match;
    assert.ok(matchOver(s));
    assert.equal(s.forfeited, false);
    assert.equal(viewOf(s).survival!.cleared, 3);
  });

  it("kết quả: kỷ lục và vàng theo số đợt, hồ sơ cũ đọc ra kỷ lục 0", () => {
    const p = profile();
    const a = applySurvivalResult(p, 6);
    assert.deepEqual(a.result, {
      cleared: 6,
      best: 6,
      newBest: true,
      gold: 60,
    });
    assert.equal(a.profile.gold, p.gold + 60);
    const b = applySurvivalResult(a.profile, 3);
    assert.equal(b.result.newBest, false);
    assert.equal(b.profile.survival.best, 6);
    const old = JSON.parse(JSON.stringify(p));
    delete old.survival;
    assert.equal(parseProfile(old)!.survival.best, 0);
  });
});
