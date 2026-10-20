import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyProfileAction,
  applyTowerResult,
  BOSS_HP,
  createBattle,
  newProfile,
  newTowerRun,
  parseProfile,
  stageFighter,
  RAID_STAGES,
  TOWER_FOOD_START,
  towerFloor,
  towerTeam,
} from "../../../src/core";

const profile = () => {
  const p = newProfile();
  return { ...p, main: { ...p.main, level: 10 } };
};

describe("leo tháp", () => {
  it("tầng sinh theo seed, cấp tăng dần, tầng 5 có sứ quân máu trùm", () => {
    const run = newTowerRun(profile(), 42);
    assert.equal(run.baseLevel, 8);
    assert.deepEqual(towerFloor(run, 3), towerFloor(run, 3));
    assert.equal(towerFloor(run, 1).level, 8);
    assert.equal(towerFloor(run, 4).level, 11);
    assert.equal(towerFloor(run, 1).foes.length, 3);
    const boss = towerFloor(run, 5);
    assert.ok(boss.boss);
    const leaders = RAID_STAGES.map((s) => s.foes[0]!.id);
    assert.ok(leaders.includes(boss.foes[0]!.id));
    const stage = RAID_STAGES.find((s) => s.foes[0]!.id === boss.foes[0]!.id)!;
    assert.equal(
      boss.foes[0]!.maxHp,
      Math.round(stageFighter(stage.foes[0]!, boss.level).maxHp * BOSS_HP),
    );
    // Quá cấp 30 thì đối thủ mạnh thêm.
    assert.equal(towerFloor(run, 30).level, 30);
    assert.ok(towerFloor(run, 31).foes[0]!.maxHp > 0);
  });

  it("vào trận với máu mang sang; người đã ngã không đứng dậy", () => {
    const p = profile();
    const run = { ...newTowerRun(p, 7), hp: [0.5, 0, 1] };
    const team = towerTeam(p, run);
    const { state } = createBattle({
      sides: [
        { fighters: team, leader: 0, hpRatio: run.hp, food: run.food },
        { fighters: towerFloor(run, 1).foes, leader: 0 },
      ],
      seed: 1,
    });
    const f = state.sides[0].fighters;
    assert.equal(f[0]!.hp, Math.round(f[0]!.maxHp * 0.5));
    assert.equal(f[1]!.hp, 0);
    assert.equal(f[2]!.hp, f[2]!.maxHp);
  });

  it("thắng: lên tầng, mang máu và lương, chờ chọn thưởng; thua: hết lượt leo, giữ kỷ lục", () => {
    const p0 = profile();
    const p = { ...p0, tower: { best: 4, run: newTowerRun(p0, 9) } };
    const won = applyTowerResult(p, true, [0.6, 0, 0.3], 41);
    const run = won.profile.tower.run!;
    assert.equal(run.floor, 2);
    assert.deepEqual(run.hp, [0.6, 0, 0.3]);
    assert.equal(run.food, 41);
    assert.equal(run.offer!.length, 3);
    assert.equal(won.result.newBest, false);
    // Còn thưởng chưa chọn thì không chọn sai được; chọn hồi máu thì người ngã đứng dậy.
    assert.deepEqual(
      applyProfileAction(won.profile, { type: "towerPick", index: 5 }),
      {
        ok: false,
        error: "noTowerOffer",
      },
    );
    const healed = applyProfileAction(won.profile, {
      type: "towerPick",
      index: 0,
    });
    assert.ok(healed.ok);
    assert.deepEqual(healed.profile.tower.run!.hp, [1, 0.25, 0.7]);
    assert.equal(healed.profile.tower.run!.offer, null);

    const atFive = {
      ...p,
      tower: { best: 4, run: { ...p.tower.run!, floor: 5 } },
    };
    const boss = applyTowerResult(atFive, true, [1, 1, 1], 60);
    assert.equal(boss.result.newBest, true);
    assert.equal(boss.result.bonusGold, 200);
    assert.equal(boss.profile.tower.best, 5);
    const lost = applyTowerResult(boss.profile, false, [0, 0, 0], 60);
    assert.equal(lost.profile.tower.run, null);
    assert.equal(lost.profile.tower.best, 5);
  });

  it("phúc cộng vào chỉ số cả đội; hồ sơ cũ không có tháp vẫn đọc được", () => {
    const p = profile();
    const run = { ...newTowerRun(p, 1), boons: { atk: 2 } };
    const base = towerTeam(p, newTowerRun(p, 1));
    const buffed = towerTeam(p, run);
    assert.equal(buffed[0]!.atk, Math.round(base[0]!.atk * 1.2));
    const { tower, ...old } = newProfile();
    void tower;
    assert.deepEqual(parseProfile(old).tower, { best: 0, run: null });
    const saved = parseProfile({ ...p, tower: { best: 3, run } });
    assert.equal(saved.tower.run!.food, TOWER_FOOD_START);
    assert.deepEqual(saved.tower.run!.boons, { atk: 2 });
  });
});
