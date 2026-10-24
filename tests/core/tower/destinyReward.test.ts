import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAIN_ID,
  applyDestinyBoonReward,
  applyDestinyRecovery,
  createDestinyRun,
  destinyRecoveryCandidates,
  generateDestinyOffer,
  newProfile,
  type DestinyFighterSnapshot,
  type DestinyRun,
} from "../../../src/core";

const now = Date.UTC(2026, 9, 18, 17);

function rewardRun(): DestinyRun {
  const profile = newProfile();
  const made = createDestinyRun(profile, now, [MAIN_ID, "haVan", "maiThanh", "leThach"], []);
  assert.ok(made.ok);
  if (!made.ok) throw new Error("không tạo được Destiny fixture");
  const fighters: Record<string, DestinyFighterSnapshot> = structuredClone(made.run.fighters!);
  fighters[MAIN_ID] = { ...fighters[MAIN_ID]!, hp: 1, energy: 61 };
  fighters.haVan = { ...fighters.haVan!, hp: Math.floor(fighters.haVan!.config.maxHp / 2), energy: 47 };
  fighters.maiThanh = { ...fighters.maiThanh!, hp: 0, energy: 88, downed: true };
  return {
    ...made.run,
    fighters,
    hp: Object.fromEntries(made.run.roster.map((id) => [id, fighters[id]!.hp / fighters[id]!.config.maxHp])),
    phase: "reward",
    settledFloor: 1,
  };
}

describe("Destiny reward hồi phục theo mục tiêu", () => {
  it("thủ lĩnh gục luôn có Cứu viện và bắt buộc hồi sinh trước tầng kế", () => {
    const base = rewardRun();
    const fighters = {
      ...base.fighters,
      [MAIN_ID]: { ...base.fighters![MAIN_ID]!, hp: 0, energy: 0, downed: true },
    };
    const run = { ...base, fighters };
    const offer = generateDestinyOffer(run);
    assert.equal(offer.length, 3);
    assert.deepEqual(offer[0], { kind: "rescue" });
    const boon = offer.find((entry) => entry.kind === "boon");
    assert.ok(boon?.kind === "boon");
    if (boon?.kind === "boon")
      assert.deepEqual(applyDestinyBoonReward(run, { floor: 1, boonId: boon.boonId }),
        { ok: false, error: "leader_requires_rescue" });
    assert.deepEqual(applyDestinyRecovery(run, { floor: 1, kind: "rescue", targetIds: ["maiThanh"] }),
      { ok: false, error: "leader_requires_rescue" });
    const rescued = applyDestinyRecovery(run, { floor: 1, kind: "rescue", targetIds: [MAIN_ID] });
    assert.ok(rescued.ok && rescued.run.floor === 2 && rescued.run.fighters![MAIN_ID]!.hp > 0);
  });

  it("chữa +50% đúng một tướng sống, clamp max HP và không sửa energy/người khác", () => {
    const run = rewardRun();
    const untouched = structuredClone(run.fighters!.haVan!);
    const result = applyDestinyRecovery(run, { floor: 1, kind: "targeted_heal", targetIds: [MAIN_ID] });
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.equal(result.run.fighters![MAIN_ID]!.hp,
      Math.min(run.fighters![MAIN_ID]!.config.maxHp, 1 + Math.round(run.fighters![MAIN_ID]!.config.maxHp * 0.5)));
    assert.equal(result.run.fighters![MAIN_ID]!.energy, 61);
    assert.deepEqual(result.run.fighters!.haVan, untouched);
    assert.equal(result.run.floor, 2);
    assert.equal(result.run.phase, "prepare");
  });

  it("Quân y chữa tối đa ba mục tiêu sống, từ chối ID trùng, target gục và ngoài roster", () => {
    const run = rewardRun();
    const valid = applyDestinyRecovery(run, { floor: 1, kind: "field_medic", targetIds: [MAIN_ID, "haVan"] });
    assert.ok(valid.ok && valid.changed);
    if (valid.ok) {
      assert.ok(valid.run.fighters![MAIN_ID]!.hp > run.fighters![MAIN_ID]!.hp);
      assert.ok(valid.run.fighters!.haVan!.hp > run.fighters!.haVan!.hp);
      assert.equal(valid.run.fighters!.maiThanh!.hp, 0);
    }
    assert.deepEqual(applyDestinyRecovery(run, { floor: 1, kind: "field_medic", targetIds: [MAIN_ID, MAIN_ID] }),
      { ok: false, error: "duplicate_target" });
    assert.deepEqual(applyDestinyRecovery(run, { floor: 1, kind: "field_medic", targetIds: ["maiThanh"] }),
      { ok: false, error: "target_downed", fighterId: "maiThanh" });
    assert.deepEqual(applyDestinyRecovery(run, { floor: 1, kind: "field_medic", targetIds: ["ghost"] }),
      { ok: false, error: "fighter_not_in_roster", fighterId: "ghost" });
    assert.deepEqual(applyDestinyRecovery(run, {
      floor: 1, kind: "field_medic", targetIds: [MAIN_ID, "haVan", "maiThanh", "leThach"],
    }), { ok: false, error: "invalid_target_count" });
  });

  it("Cứu viện hồi sinh reserve ở 30%, reset energy và retry không áp lần hai", () => {
    const run = rewardRun();
    const rosterBefore = [...run.roster];
    const result = applyDestinyRecovery(run, { floor: 1, kind: "rescue", targetIds: ["maiThanh"] });
    assert.ok(result.ok);
    if (!result.ok) return;
    assert.equal(result.run.fighters!.maiThanh!.hp,
      Math.max(1, Math.round(run.fighters!.maiThanh!.config.maxHp * 0.3)));
    assert.equal(result.run.fighters!.maiThanh!.energy, 0, "không giữ energy trước khi gục");
    assert.equal(result.run.fighters!.maiThanh!.downed, false);
    assert.deepEqual(result.run.roster, rosterBefore, "reserve không tự chuyển vào active");
    const retry = applyDestinyRecovery(structuredClone(result.run), { floor: 1, kind: "rescue", targetIds: ["maiThanh"] });
    assert.ok(retry.ok && !retry.changed);
    if (retry.ok) assert.deepEqual(retry.run, result.run);
    assert.deepEqual(applyDestinyRecovery(run, { floor: 1, kind: "rescue", targetIds: [MAIN_ID] }),
      { ok: false, error: "target_alive", fighterId: MAIN_ID });
  });

  it("trả no_candidates khi reward không có mục tiêu hợp lệ", () => {
    const run = rewardRun();
    const allAlive = Object.fromEntries(Object.entries(run.fighters!).map(([id, fighter]) =>
      [id, { ...fighter, hp: fighter.config.maxHp, downed: false }]));
    const full = { ...run, fighters: allAlive };
    assert.deepEqual(destinyRecoveryCandidates(full, "targeted_heal"), []);
    assert.deepEqual(applyDestinyRecovery(full, { floor: 1, kind: "targeted_heal", targetIds: [MAIN_ID] }),
      { ok: false, error: "no_candidates" });
    assert.deepEqual(applyDestinyRecovery(full, { floor: 1, kind: "rescue", targetIds: [MAIN_ID] }),
      { ok: false, error: "no_candidates" });
  });
});
