import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDestinyRun,
  destinyCycleId,
  isDualTowerV1,
  MAIN_ID,
  newProfile,
  NEW_PROGRESS,
  parseDualTower,
  SHOP_COMPANIONS,
  type DestinyFighterSnapshot,
  type FloorRules,
  type Profile,
} from "../../../src/core";

const monday = Date.UTC(2026, 9, 18, 17); // 2026-10-19 00:00 VN
const free: readonly FloorRules[] = [{}, { bannedElements: ["kim"] }];

function ownedEight(): Profile {
  const base = newProfile();
  const bought = SHOP_COMPANIONS.slice(0, 3).map(({ fighter }) => fighter.id);
  return {
    ...base,
    companions: { ...base.companions, ...Object.fromEntries(bought.map((id) => [id, NEW_PROGRESS])) },
  };
}

describe("Destiny run và roster snapshot", () => {
  it("chu kỳ đổi đúng thứ Hai 00:00 Việt Nam", () => {
    assert.equal(destinyCycleId(monday - 1), "2026-10-12");
    assert.equal(destinyCycleId(monday), "2026-10-19");
    assert.equal(destinyCycleId(monday + 7 * 86_400_000 - 1), "2026-10-19");
    assert.equal(destinyCycleId(monday + 7 * 86_400_000), "2026-10-26");
  });

  it("tạo roster 3/5/8, leader slot đầu, food 60 và runtime theo ID", () => {
    const profile = ownedEight();
    const all = [MAIN_ID, ...Object.keys(profile.companions)];
    for (const size of [3, 5, 8]) {
      const result = createDestinyRun(profile, monday, all.slice(0, size), free);
      assert.ok(result.ok);
      if (!result.ok) continue;
      assert.equal(result.run.roster.length, size);
      assert.equal(result.run.roster[0], MAIN_ID);
      assert.equal(result.run.food, 60);
      assert.deepEqual(result.run.boons, []);
      assert.equal(result.run.phase, "prepare");
      assert.equal(result.run.cycleId, "2026-10-19");
      assert.deepEqual(Object.keys(result.run.fighters ?? {}), result.run.roster);
      for (const id of result.run.roster) {
        const fighter: DestinyFighterSnapshot | undefined = result.run.fighters?.[id];
        assert.equal(fighter?.id, id);
        assert.equal(fighter?.hp, fighter?.config.maxHp);
        assert.equal(fighter?.energy, 0);
        assert.equal(fighter?.downed, false);
      }
    }
  });

  it("snapshot nghề/hệ/cấp/gear tách khỏi thay đổi Profile", () => {
    const base = newProfile();
    const gear = { id: "g1", slot: "vuKhi" as const, element: "moc" as const, tier: 1 as const, set: "coLau", profession: "tuongSi" as const };
    const mutableMain = { ...base.main, level: 7 };
    const mutableBag = [gear];
    const profile: Profile = {
      ...base,
      bag: mutableBag,
      loadouts: { [MAIN_ID]: { weapons: { tuongSi: gear.id }, slots: {} } },
      main: mutableMain,
    };
    const result = createDestinyRun(profile, monday, [MAIN_ID, "haVan", "maiThanh"], free);
    assert.ok(result.ok);
    if (!result.ok) return;
    const before = structuredClone(result.run);
    mutableMain.level = 30;
    mutableBag.length = 0;
    assert.deepEqual(result.run, before);
    assert.equal(result.run.fighters?.[MAIN_ID]?.level, 7);
    assert.deepEqual(result.run.fighters?.[MAIN_ID]?.equipment, [gear]);
  });

  it("từ chối ownership, ID trùng, leader sai, size và roster không giải được luật", () => {
    const p = newProfile();
    assert.equal(createDestinyRun(p, monday, [MAIN_ID, "haVan"], free).ok, false);
    assert.deepEqual(createDestinyRun(p, monday, ["haVan", MAIN_ID, "maiThanh"], free), { ok: false, error: "leader_must_be_first" });
    assert.deepEqual(createDestinyRun(p, monday, [MAIN_ID, "haVan", "haVan"], free), { ok: false, error: "duplicate_fighter" });
    assert.deepEqual(createDestinyRun(p, monday, [MAIN_ID, "haVan", "not-owned"], free), { ok: false, error: "not_owned", fighterId: "not-owned" });
    const noFire = createDestinyRun(p, monday, [MAIN_ID, "leThach", "maiThanh"], [{ minElements: { hoa: 2 } }]);
    assert.deepEqual(noFire, { ok: false, error: "no_legal_lineup", floorIndex: 0 });
  });

  it("serialize/resume idempotent, dữ liệu fighter hỏng bị từ chối; legacy vẫn đọc được", () => {
    const result = createDestinyRun(newProfile(), monday, [MAIN_ID, "haVan", "maiThanh"], free);
    assert.ok(result.ok);
    if (!result.ok) return;
    const state = parseDualTower({ schema: 1, destiny: { cycleId: result.run.cycleId, run: result.run } });
    assert.ok(isDualTowerV1(state));
    if (!isDualTowerV1(state)) return;
    assert.deepEqual(state.destiny.run, result.run);
    assert.deepEqual(parseDualTower(JSON.parse(JSON.stringify(state))), state);

    const preBattleBuilder = structuredClone(result.run);
    delete (preBattleBuilder.fighters![MAIN_ID] as { mainProgress?: unknown }).mainProgress;
    const compatible = parseDualTower({ schema: 1, destiny: { cycleId: result.run.cycleId, run: preBattleBuilder } });
    assert.ok(isDualTowerV1(compatible) && compatible.destiny.run !== null);

    const broken = structuredClone(result.run) as { fighters?: Record<string, { id: string }> };
    broken.fighters![MAIN_ID]!.id = "other";
    const rejected = parseDualTower({ schema: 1, destiny: { cycleId: result.run.cycleId, run: broken } });
    assert.ok(isDualTowerV1(rejected) && rejected.destiny.run === null);

    const legacy = { roster: [MAIN_ID, "haVan", "maiThanh"], floor: 2, hp: { [MAIN_ID]: 1, haVan: 0.5, maiThanh: 0 }, food: 12, active: true };
    const old = parseDualTower({ schema: 1, destiny: { cycleId: "2026-10-19", run: legacy } });
    assert.ok(isDualTowerV1(old));
    if (isDualTowerV1(old)) assert.deepEqual(old.destiny.run, legacy);
  });
});
