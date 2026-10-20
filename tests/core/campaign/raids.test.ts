import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyRaidResult,
  BOSS_HP,
  createRng,
  ELEMENTS,
  HOME_TERRAIN,
  newProfile,
  parseProfile,
  RAID_STAGES,
  RAID_TIERS,
  raidDifficulty,
  raidLevel,
  raidSetup,
  raidUnlocked,
  stageById,
  stageFighter,
  validateWeights,
} from "../../../src/core";

describe("đánh trùm", () => {
  it("mọi màn có sứ quân đều đánh lại được, sân nhà hợp lệ", () => {
    assert.equal(RAID_STAGES.length, 12);
    assert.ok(!RAID_STAGES.some((s) => s.id === "coLau"));
    for (const e of ELEMENTS) validateWeights(HOME_TERRAIN[e]);
  });

  it("bậc mở lần lượt sau khi qua màn", () => {
    const c = { cleared: ["coLau", "boHai"], food: 60, raids: { boHai: 1 } };
    assert.ok(raidUnlocked(c, "boHai", 1));
    assert.ok(raidUnlocked(c, "boHai", 2));
    assert.ok(!raidUnlocked(c, "boHai", 3));
    assert.ok(!raidUnlocked(c, "dangChau", 1));
    assert.ok(!raidUnlocked(c, "coLau", 1));
  });

  it("đối thủ lên cấp theo bậc, thủ lĩnh máu trùm, sứ quân đầy lương, AI khó hơn theo bậc", () => {
    const stage = stageById("doDong")!;
    assert.deepEqual(
      RAID_TIERS.map((t) => raidLevel(stage, t)),
      [24, 28, 30],
    );
    const setup = raidSetup(stage, 1);
    const plain = stageFighter(stage.foes[0]!, 24);
    assert.equal(setup.foes[0]!.maxHp, Math.round(plain.maxHp * BOSS_HP));
    assert.equal(setup.difficulty, "nightmare");
    const solo = stageById("boHai")!;
    assert.equal(
      raidSetup(solo, 1).foes[0]!.maxHp,
      stageFighter(solo.foes[0]!, raidLevel(solo, 1)).maxHp,
    );
    assert.deepEqual(
      RAID_TIERS.map((t) => raidDifficulty(stageById("boHai")!, t)),
      ["normal", "hard", "boss"],
    );
    assert.equal(setup.foeFood, 100);
    assert.equal(setup.weights, HOME_TERRAIN[stage.foes[0]!.element]);
  });

  it("chỉ thưởng lần đầu thắng mỗi bậc", () => {
    const p = {
      ...newProfile(),
      campaign: { cleared: ["coLau", "boHai"], food: 60, raids: {} },
    };
    const lose = applyRaidResult(p, "boHai", 1, false, createRng(1));
    assert.equal(lose.profile, p);
    const win = applyRaidResult(p, "boHai", 1, true, createRng(1));
    assert.equal(win.profile.gold, p.gold + 300);
    assert.equal(win.profile.bag.length, 1);
    assert.equal(win.profile.campaign.raids.boHai, 1);
    const again = applyRaidResult(win.profile, "boHai", 1, true, createRng(1));
    assert.equal(again.result.firstClear, false);
    assert.equal(again.profile, win.profile);
  });

  it("hồ sơ cũ không có raids vẫn đọc được, bậc sai bị bỏ", () => {
    const p = parseProfile({
      ...newProfile(),
      campaign: { cleared: [], food: 50 },
    });
    assert.deepEqual(p.campaign.raids, {});
    const q = parseProfile({
      ...newProfile(),
      campaign: { cleared: [], food: 50, raids: { boHai: 2, x: 9, y: "1" } },
    });
    assert.deepEqual(q.campaign.raids, { boHai: 2 });
  });
});
