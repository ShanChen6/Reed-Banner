import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DESTINY_BOON_CATALOG,
  MAIN_ID,
  addDestinyBoon,
  applyDestinyBoonReward,
  applyDestinyBoonStats,
  createDestinyFloorBattle,
  createDestinyRun,
  destinyBoonOffer,
  isDualTowerV1,
  newProfile,
  parseDualTower,
  profileTeam,
  removeDestinyBoon,
  settleDestinyFloor,
  type DestinyBoon,
  type DestinyRun,
  type FighterConfig,
  type GearItem,
  type SideConfig,
} from "../../../src/core";

const now = Date.UTC(2026, 9, 18, 17);

function fixture(): { run: DestinyRun; foes: SideConfig; companions: string[] } {
  const profile = newProfile();
  const companions = Object.keys(profile.companions);
  const made = createDestinyRun(profile, now, [MAIN_ID, ...companions.slice(0, 3)], []);
  assert.ok(made.ok);
  if (!made.ok) throw new Error("không tạo được Destiny fixture");
  return {
    run: made.run,
    foes: { fighters: profileTeam(profile, companions.slice(0, 2)), leader: 0 },
    companions,
  };
}

function add(run: DestinyRun, ...ids: DestinyBoon[]): DestinyRun {
  return ids.reduce((current, id) => {
    const result = addDestinyBoon(current, id);
    assert.ok(result.ok);
    return result.ok ? result.run : current;
  }, run);
}

describe("Destiny boon catalog", () => {
  it("catalog MVP có 7 Phúc, đủ group/rarity/maxStacks/effectVersion và không có crit", () => {
    assert.equal(Object.keys(DESTINY_BOON_CATALOG).length, 7);
    assert.deepEqual(new Set(Object.values(DESTINY_BOON_CATALOG).map(({ group }) => group)),
      new Set(["offensive", "defensive", "vitality", "logistics", "tactical"]));
    for (const definition of Object.values(DESTINY_BOON_CATALOG)) {
      assert.ok(definition.maxStacks >= 1 && definition.maxStacks <= 3);
      assert.equal(definition.effectVersion, 1);
      assert.ok(definition.rarity === "common" || definition.rarity === "rare");
      assert.ok(!JSON.stringify(definition).includes("crit"));
    }
  });

  it("add/remove đúng stack và chặn vượt cap", () => {
    const { run } = fixture();
    const capped = add(run, "atk", "atk", "atk");
    assert.equal(capped.boons?.find(({ id }) => id === "atk")?.stacks, 3);
    assert.deepEqual(addDestinyBoon(capped, "atk"), { ok: false, error: "stack_cap" });
    const removed = removeDestinyBoon(capped, "atk");
    assert.ok(removed.ok);
    if (!removed.ok) return;
    assert.equal(removed.run.boons?.find(({ id }) => id === "atk")?.stacks, 2);
    assert.deepEqual(removeDestinyBoon(run, "atk"), { ok: false, error: "not_owned" });
  });

  it("stat cộng sau item/element config, condition cùng hệ và có trang bị áp đúng", () => {
    const gear: GearItem = { id: "g", slot: "yPhuc", element: "hoa", tier: 1, set: "coLau" };
    const base: FighterConfig[] = [
      { id: MAIN_ID, name: "L", element: "hoa", profession: "tuongSi", maxHp: 100, atk: 100, def: 100 },
      { id: "same", name: "S", element: "hoa", profession: "tuongSi", maxHp: 100, atk: 100, def: 100 },
      { id: "other", name: "O", element: "thuy", profession: "tuongSi", maxHp: 100, atk: 100, def: 100 },
    ];
    const { run } = fixture();
    const fighters = {
      ...run.fighters,
      [MAIN_ID]: { ...run.fighters![MAIN_ID]!, equipment: [gear] },
      same: { ...run.fighters![run.roster[1]!]!, id: "same", config: base[1]!, equipment: [] },
      other: { ...run.fighters![run.roster[2]!]!, id: "other", config: base[2]!, equipment: [gear] },
    };
    const withBoons = add({ ...run, fighters }, "atk", "def", "hp", "elementalEdge", "armoredFormation");
    const modified = applyDestinyBoonStats(withBoons, base);
    assert.deepEqual(modified.map(({ atk, def, maxHp }) => ({ atk, def, maxHp })), [
      { atk: 118, def: 123, maxHp: 110 },
      { atk: 118, def: 115, maxHp: 110 },
      { atk: 110, def: 123, maxHp: 110 },
    ]);
  });

  it("energy/rage bonus không bị lưu chồng khi settle", () => {
    const { run, foes, companions } = fixture();
    const fighters = { ...run.fighters, [MAIN_ID]: { ...run.fighters![MAIN_ID]!, energy: 30 } };
    const boosted = add({ ...run, fighters, rage: 25 }, "supplyCache", "supplyCache", "battleDrum");
    const made = createDestinyFloorBattle(boosted, {
      activeIds: [MAIN_ID, companions[0]!, companions[1]!],
      leaderBuild: { element: "hoa", profession: "tuongSi" }, rules: {}, foes, seed: 31, timer: false,
    });
    assert.ok(made.ok);
    if (!made.ok) return;
    assert.equal(made.state.sides[0].fighters[0]!.energy, 50);
    assert.equal(made.state.sides[0].rage, 35);
    made.state.winner = 0;
    const settled = settleDestinyFloor(made.run, made.state);
    assert.ok(settled.ok);
    if (!settled.ok) return;
    assert.equal(settled.run.fighters![MAIN_ID]!.energy, 30);
    assert.equal(settled.run.rage, 25);

    const nearCapFighters = {
      ...run.fighters,
      [MAIN_ID]: { ...run.fighters![MAIN_ID]!, energy: 95 },
    };
    const nearCap = add({ ...run, fighters: nearCapFighters, rage: 95 }, "supplyCache", "supplyCache", "battleDrum");
    const capped = createDestinyFloorBattle(nearCap, {
      activeIds: [MAIN_ID, companions[0]!, companions[1]!],
      leaderBuild: { element: "hoa", profession: "tuongSi" }, rules: {}, foes, seed: 32, timer: false,
    });
    assert.ok(capped.ok);
    if (!capped.ok) return;
    assert.equal(capped.state.sides[0].fighters[0]!.energy, 100);
    assert.equal(capped.state.sides[0].rage, 100);
    capped.state.winner = 0;
    const cappedSettle = settleDestinyFloor(capped.run, capped.state);
    assert.ok(cappedSettle.ok);
    if (cappedSettle.ok) {
      assert.equal(cappedSettle.run.fighters![MAIN_ID]!.energy, 95);
      assert.equal(cappedSettle.run.rage, 95);
    }
  });

  it("offer deterministic, reward chỉ nhận item được offer và idempotent theo floor", () => {
    const { run } = fixture();
    const rewardRun = { ...run, phase: "reward" as const, settledFloor: 1 };
    const a = destinyBoonOffer(rewardRun);
    const b = destinyBoonOffer(structuredClone(rewardRun));
    assert.deepEqual(a, b);
    assert.equal(new Set(a).size, a.length);
    const notOffered = (Object.keys(DESTINY_BOON_CATALOG) as DestinyBoon[]).find((id) => !a.includes(id))!;
    assert.deepEqual(applyDestinyBoonReward(rewardRun, { floor: 1, boonId: notOffered }),
      { ok: false, error: "not_offered" });
    const picked = applyDestinyBoonReward(rewardRun, { floor: 1, boonId: a[0]! });
    assert.ok(picked.ok && picked.changed);
    if (!picked.ok) return;
    const retry = applyDestinyBoonReward(structuredClone(picked.run), { floor: 1, boonId: a[0]! });
    assert.ok(retry.ok && !retry.changed);
  });

  it("save/load giữ stack/version, nâng atk/def/hp cũ và cô lập Tower legacy", () => {
    const { run } = fixture();
    const stacked = add(run, "atk", "atk", "elementalEdge");
    const state = parseDualTower({ schema: 1, destiny: { cycleId: stacked.cycleId, run: stacked } });
    assert.ok(isDualTowerV1(state));
    if (!isDualTowerV1(state)) return;
    assert.deepEqual(state.destiny.run?.boons, stacked.boons);

    const legacyBoons = { ...run, boons: ["atk", "atk", "hp"] };
    const migrated = parseDualTower({ schema: 1, destiny: { cycleId: run.cycleId, run: legacyBoons } });
    assert.ok(isDualTowerV1(migrated));
    if (isDualTowerV1(migrated)) assert.deepEqual(migrated.destiny.run?.boons, [
      { id: "atk", stacks: 2, effectVersion: 1 },
      { id: "hp", stacks: 1, effectVersion: 1 },
    ]);
  });
});
