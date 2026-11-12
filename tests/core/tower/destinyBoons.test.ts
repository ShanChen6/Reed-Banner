import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DESTINY_BOON_CATALOG,
  DESTINY_FOOD_MAX,
  ELEMENTS,
  MAIN_ID,
  STANDARD_WEIGHTS,
  addDestinyBoon,
  applyDestinyBoonReward,
  applyDestinyBoonStats,
  applyDestinyTerrain,
  destinyFloorCount,
  validateWeights,
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
  it("catalog có 7 Phúc MVP và 8 Phúc V2, đủ group/rarity/maxStacks/effectVersion và không có crit", () => {
    assert.equal(Object.keys(DESTINY_BOON_CATALOG).length, 15);
    assert.equal(Object.values(DESTINY_BOON_CATALOG).filter(({ introducedIn }) => introducedIn === 1).length, 7);
    assert.ok(Object.values(DESTINY_BOON_CATALOG).reduce((sum, { maxStacks }) => sum + maxStacks, 0) >= 19,
      "đủ cộng dồn cho 19 lần chọn thưởng của run 20 tầng");
    assert.deepEqual(new Set(Object.values(DESTINY_BOON_CATALOG).map(({ group }) => group)),
      new Set(["offensive", "defensive", "vitality", "logistics", "tactical"]));
    for (const definition of Object.values(DESTINY_BOON_CATALOG)) {
      assert.ok(definition.maxStacks >= 1 && definition.maxStacks <= 3);
      assert.equal(definition.effectVersion, 1);
      assert.ok(["common", "rare", "epic"].includes(definition.rarity));
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

  it("run V1 chỉ được offer 7 Phúc cũ; run V2 có Phúc mới và Quân lệnh chỉ từ tầng 11", () => {
    const { run } = fixture();
    const seen = (base: DestinyRun, floors: readonly number[]) => new Set(
      floors.flatMap((floor) => destinyBoonOffer({ ...base, floor }, 15)));
    const v1 = seen(run, [1, 5, 9]);
    assert.equal(v1.size, 7);
    assert.ok([...v1].every((id) => DESTINY_BOON_CATALOG[id].introducedIn === 1));
    const v2 = { ...run, rulesVersion: 2 };
    assert.equal(seen(v2, [1, 10]).size, 14);
    assert.ok(!seen(v2, [1, 10]).has("mandate"));
    assert.ok(seen(v2, [11]).has("mandate"));
    assert.ok(!seen({ ...v2, food: DESTINY_FOOD_MAX }, [1]).has("granary"), "lương đầy thì không offer Kho lương");
  });

  it("Kho lương cộng lương ngay và kẹp ở mức tối đa", () => {
    const { run } = fixture();
    const v2 = { ...run, rulesVersion: 2, phase: "reward" as const, food: 60 };
    const floor = Array.from({ length: 19 }, (_, i) => i + 1)
      .find((n) => destinyBoonOffer({ ...v2, floor: n }).includes("granary"));
    assert.ok(floor, "có tầng offer Kho lương trong ba lựa chọn");
    const base = { ...v2, floor: floor!, settledFloor: floor! };
    const picked = applyDestinyBoonReward(base, { floor: floor!, boonId: "granary" });
    assert.ok(picked.ok);
    if (picked.ok) assert.equal(picked.run.food, 75);
    const nearCap = applyDestinyBoonReward({ ...base, food: 95 }, { floor: floor!, boonId: "granary" });
    assert.ok(nearCap.ok);
    if (nearCap.ok) assert.equal(nearCap.run.food, DESTINY_FOOD_MAX);
  });

  it("Tiên phong, Đồng nghề, Tử chiến và Quân lệnh áp đúng điều kiện", () => {
    const base: FighterConfig[] = [
      { id: MAIN_ID, name: "L", element: "hoa", profession: "tuongSi", maxHp: 100, atk: 100, def: 100 },
      { id: "same", name: "S", element: "thuy", profession: "tuongSi", maxHp: 100, atk: 100, def: 100 },
      { id: "hurt", name: "H", element: "thuy", profession: "phapSu", maxHp: 100, atk: 100, def: 100 },
    ];
    const { run } = fixture();
    const template = run.fighters![run.roster[1]!]!;
    const fighters = {
      ...run.fighters,
      same: { ...template, id: "same", config: base[1]!, hp: 100 },
      hurt: { ...template, id: "hurt", config: base[2]!, hp: 49 },
    };
    const withBoons = add({ ...run, fighters }, "vanguard", "professionUnity", "lastStand", "lastStand", "mandate");
    assert.deepEqual(applyDestinyBoonStats(withBoons, base).map(({ atk, def, maxHp }) => ({ atk, def, maxHp })), [
      { atk: 113, def: 113, maxHp: 105 },
      { atk: 105, def: 113, maxHp: 105 },
      { atk: 129, def: 105, maxHp: 105 },
    ]);
  });

  it("Hậu quân hồi dự bị, Dưỡng sức hồi người ra trận, không hồi người đã gục", () => {
    const { run, foes, companions } = fixture();
    const [a, b, reserve] = companions;
    const wound = (id: string, hp: number) => ({ ...run.fighters![id]!, hp, downed: hp === 0 });
    const maxHp = (id: string) => run.fighters![id]!.config.maxHp;
    const fighters = { ...run.fighters, [reserve!]: wound(reserve!, 1) };
    const boosted = add({ ...run, fighters }, "rearGuard", "rearGuard", "recuperate");
    const made = createDestinyFloorBattle(boosted, {
      activeIds: [MAIN_ID, a!, b!],
      leaderBuild: { element: "hoa", profession: "tuongSi" }, rules: {}, foes, seed: 7, timer: false,
    });
    assert.ok(made.ok);
    if (!made.ok) return;
    made.state.winner = 0;
    made.state.sides[0].fighters[1]!.hp = 1;
    made.state.sides[0].fighters[2]!.hp = 0;
    const settled = settleDestinyFloor(made.run, made.state);
    assert.ok(settled.ok && settled.won);
    if (!settled.ok) return;
    assert.equal(settled.run.fighters![reserve!]!.hp, 1 + Math.round(maxHp(reserve!) * 0.1));
    assert.equal(settled.run.fighters![a!]!.hp, 1 + Math.round(maxHp(a!) * 0.04));
    assert.equal(settled.run.fighters![b!]!.hp, 0);
    assert.equal(settled.run.fighters![b!]!.downed, true);

    const lost = createDestinyFloorBattle(boosted, {
      activeIds: [MAIN_ID, a!, b!],
      leaderBuild: { element: "hoa", profession: "tuongSi" }, rules: {}, foes, seed: 8, timer: false,
    });
    assert.ok(lost.ok);
    if (!lost.ok) return;
    lost.state.winner = 1;
    const lostSettle = settleDestinyFloor(lost.run, lost.state);
    assert.ok(lostSettle.ok && !lostSettle.won);
    if (lostSettle.ok) assert.equal(lostSettle.run.fighters![reserve!]!.hp, 1, "thua thì không hồi");
  });

  it("Địa lợi nghiêng bàn cờ về ô hợp hệ thủ lĩnh, giữ tổng 100 và biên tỉ lệ", () => {
    const { run } = fixture();
    assert.equal(applyDestinyTerrain(run, STANDARD_WEIGHTS, "tho"), STANDARD_WEIGHTS);
    for (const element of ELEMENTS) {
      for (const stacks of [1, 2]) {
        const boosted = add(run, ...Array<DestinyBoon>(stacks).fill("terrain"));
        const weights = applyDestinyTerrain(boosted, STANDARD_WEIGHTS, element);
        assert.doesNotThrow(() => validateWeights(weights));
        assert.equal(weights.vang + weights.sach, STANDARD_WEIGHTS.vang + STANDARD_WEIGHTS.sach - 2 * stacks);
      }
    }
    const one = applyDestinyTerrain(add(run, "terrain"), STANDARD_WEIGHTS, "tho");
    assert.equal(one.banhChung, STANDARD_WEIGHTS.banhChung + 2);
    const tight = { ...STANDARD_WEIGHTS, vang: 8, sach: 8, kiem: 24 };
    assert.deepEqual(applyDestinyTerrain(add(run, "terrain", "terrain"), tight, "kim"), tight,
      "ô cho đã ở mức tối thiểu thì không chuyển");
  });

  it("thắng tầng cuối là hoàn thành run, không mở phần thưởng; settle lại không đổi gì", () => {
    const { run, foes, companions } = fixture();
    const input = {
      activeIds: [MAIN_ID, companions[0]!, companions[1]!],
      leaderBuild: { element: "hoa" as const, profession: "tuongSi" as const }, rules: {}, foes, seed: 9, timer: false,
    };
    for (const [version, last] of [[1, 10], [2, 20]] as const) {
      assert.equal(destinyFloorCount(version), last);
      const before = createDestinyFloorBattle({ ...run, rulesVersion: version, floor: last - 1 }, input);
      assert.ok(before.ok);
      if (!before.ok) return;
      before.state.winner = 0;
      const mid = settleDestinyFloor(before.run, before.state);
      assert.ok(mid.ok && mid.run.phase === "reward" && mid.run.active && !mid.run.completed);

      const made = createDestinyFloorBattle({ ...run, rulesVersion: version, floor: last }, input);
      assert.ok(made.ok);
      if (!made.ok) return;
      made.state.winner = 0;
      const settled = settleDestinyFloor(made.run, made.state);
      assert.ok(settled.ok && settled.won);
      if (!settled.ok) return;
      assert.equal(settled.run.phase, "done");
      assert.equal(settled.run.active, false);
      assert.equal(settled.run.completed, true);
      assert.equal(settled.run.floor, last);
      const again = settleDestinyFloor(settled.run, made.state);
      assert.ok(again.ok && !again.changed && again.won);
      const reloaded = parseDualTower({ schema: 1, destiny: { cycleId: run.cycleId, run: settled.run } });
      assert.ok(isDualTowerV1(reloaded) && reloaded.destiny.run?.completed === true);
    }
  });
});
