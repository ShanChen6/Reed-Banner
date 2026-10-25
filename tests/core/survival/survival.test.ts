import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ABANDON_MS,
  act,
  applySurvivalLeaderBuild,
  applySurvivalResult,
  autoReviveFighterId,
  BOSS_HP,
  beginWave,
  buildMain,
  createBattle,
  createSurvivalRoster,
  coordinateSurvivalRoundTransition,
  deserializeSurvivalRun,
  downedFightersAfterWave,
  recoverSurvivalRoster,
  FOOD_MAX,
  humanAct,
  matchOver,
  newProfile,
  newSurvivalRun,
  MAIN_ID,
  parseProfile,
  planBreak,
  profileTeam,
  proposeSurvivalLeaderBuild,
  proposeSurvivalLineup,
  rescaleSurvivalHp,
  WARLORD_ENCOUNTERS,
  readSurvivalFighterState,
  settle,
  selectableActors,
  startMatch,
  SURVIVAL_FOOD,
  SURVIVAL_HEAL,
  SURVIVAL_RESERVE_HEAL,
  SURVIVAL_REVIVE_FOOD,
  SURVIVAL_REVIVE_HP,
  survivalWave,
  survivalActiveConfigs,
  survivalActiveSideConfig,
  syncSurvivalRosterState,
  updateSurvivalFighterRuntime,
  withGear,
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
  it("tạo snapshot 3 active + tối đa 2 reserve từ fighter sở hữu", () => {
    const base = profile();
    const p = {
      ...base,
      bag: [
        {
          id: "g_test",
          slot: "vuKhi" as const,
          element: "moc" as const,
          tier: 1 as const,
          set: "coLau",
          profession: "tuongSi" as const,
        },
      ],
      loadouts: {
        dinhBoLinh: { weapons: { tuongSi: "g_test" }, slots: {} },
      },
    };
    const result = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(result.ok);
    const { roster } = result;
    assert.deepEqual(roster.activeIds, [MAIN_ID, "haVan", "maiThanh"]);
    assert.deepEqual(roster.reserveIds, ["leThach", "toKim"]);
    assert.equal(Object.keys(roster.entries).length, 5);
    assert.deepEqual(
      survivalActiveConfigs(roster).map((f) => f.id),
      roster.activeIds,
    );
    assert.equal(roster.entries[MAIN_ID]!.snapshot.kind, "main");
    assert.equal(
      roster.entries[MAIN_ID]!.snapshot.config.id,
      roster.entries[MAIN_ID]!.id,
    );
    assert.deepEqual(
      roster.entries[MAIN_ID]!.snapshot.equipment,
      {
        kind: "snapshot",
        value: {
          characterId: MAIN_ID,
          items: [p.bag[0]],
        },
      },
    );
    assert.ok(roster.entries[MAIN_ID]!.snapshot.config.skills!.length > 0);
    assert.equal(roster.entries["haVan"]!.location.kind, "active");
    assert.deepEqual(roster.entries["leThach"]!.location, {
      kind: "reserve",
      runtime: {
        hp: roster.entries["leThach"]!.snapshot.config.maxHp,
        energy: 0,
      },
    });

    const run = newSurvivalRun(p, 13, roster);
    assert.equal(run.stateVersion, 2);
    assert.deepEqual(run.roster, roster);
    assert.equal(run.settledThroughWave, 0);
  });

  it("chấp nhận roster không reserve và giữ snapshot tách khỏi chỉnh sửa profile", () => {
    const p = profile();
    const result = createSurvivalRoster(p, [MAIN_ID, "haVan", "maiThanh"]);
    assert.ok(result.ok);
    assert.deepEqual(result.roster.reserveIds, []);
    assert.equal(Object.keys(result.roster.entries).length, 3);

    const before = structuredClone(result.roster);
    const edited = {
      ...p,
      element: "hoa" as const,
      profession: "phapSu" as const,
      companions: {
        ...p.companions,
        haVan: { ...p.companions.haVan!, level: 20 },
      },
    };
    assert.notDeepEqual(profileTeam(edited, ["haVan", "maiThanh"]), profileTeam(p, ["haVan", "maiThanh"]));
    assert.deepEqual(result.roster, before);
  });

  it("preview rotation đồng thời hai fighter và bảo toàn runtime theo ID", () => {
    const p = profile();
    const created = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(created.ok);
    let run = newSurvivalRun(p, 13, created.roster);
    let battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    battle.sides[0].fighters[1]!.hp = 123;
    battle.sides[0].fighters[1]!.energy = 67;
    const reserveState = updateSurvivalFighterRuntime(
      run,
      battle,
      "leThach",
      {
        hp: created.roster.entries["leThach"]!.snapshot.config.maxHp,
        energy: 44,
      },
      1,
    );
    assert.ok(reserveState.ok);
    run = reserveState.value.run;
    battle = reserveState.value.battle;
    battle.sides[0].rage = 73;
    battle.winner = 0;
    const originalRun = structuredClone(run);
    const originalBattle = structuredClone(battle);

    const preview = proposeSurvivalLineup(run, battle, [
      MAIN_ID,
      "leThach",
      "maiThanh",
    ]);
    assert.ok(preview.ok);
    assert.deepEqual(preview.value.run.roster.activeIds, [
      MAIN_ID,
      "leThach",
      "maiThanh",
    ]);
    assert.deepEqual(preview.value.run.roster.reserveIds, ["haVan", "toKim"]);
    const projected = survivalActiveSideConfig(preview.value.run.roster);
    assert.ok(projected.ok);
    assert.deepEqual(
      projected.value.fighters.map((fighter) => fighter.id),
      [MAIN_ID, "leThach", "maiThanh"],
    );
    assert.deepEqual(
      preview.value.run.roster.entries["leThach"]!.snapshot,
      originalRun.roster.entries["leThach"]!.snapshot,
    );
    assert.equal(preview.value.battle.sides[0].fighters[1]!.id, "leThach");
    assert.equal(
      preview.value.battle.sides[0].fighters[1]!.hp,
      created.roster.entries["leThach"]!.snapshot.config.maxHp,
    );
    assert.equal(preview.value.battle.sides[0].fighters[1]!.energy, 44);
    assert.equal(preview.value.battle.sides[0].fighters[2]!.id, "maiThanh");
    assert.equal(
      preview.value.run.roster.entries["haVan"]!.location.kind,
      "reserve",
    );
    const haVan = preview.value.run.roster.entries["haVan"]!;
    assert.equal(haVan.downedAtWave, null);
    assert.deepEqual(
      haVan.location.kind === "reserve" ? haVan.location.runtime : null,
      { hp: 123, energy: 67 },
    );
    assert.equal(preview.value.battle.sides[0].rage, 73);

    const doubleSwap = proposeSurvivalLineup(run, battle, [
      MAIN_ID,
      "leThach",
      "toKim",
    ]);
    assert.ok(doubleSwap.ok);
    assert.deepEqual(doubleSwap.value.run.roster.reserveIds, [
      "haVan",
      "maiThanh",
    ]);
    assert.equal(doubleSwap.value.battle.sides[0].fighters[1]!.energy, 44);
    assert.equal(
      doubleSwap.value.battle.sides[0].fighters[1]!.hp,
      created.roster.entries["leThach"]!.snapshot.config.maxHp,
    );
    assert.deepEqual(
      doubleSwap.value.run.roster.entries["haVan"]!.location,
      { kind: "reserve", runtime: { hp: 123, energy: 67 } },
    );
    assert.deepEqual(run, originalRun);
    assert.deepEqual(battle, originalBattle);
  });

  it("đưa fighter gục về reserve mà không xóa trạng thái và giữ main gục làm leader", () => {
    const p = profile();
    const created = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach"],
    );
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 13, created.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    battle.sides[0].fighters[0]!.hp = 0;
    battle.sides[0].fighters[0]!.energy = 11;
    battle.sides[0].fighters[1]!.hp = 0;
    battle.sides[0].fighters[1]!.energy = 58;
    battle.winner = 0;
    const synced = syncSurvivalRosterState(run, battle);
    assert.ok(synced.ok);

    const preview = proposeSurvivalLineup(synced.value, battle, [
      MAIN_ID,
      "leThach",
      "maiThanh",
    ]);
    assert.ok(preview.ok);
    assert.equal(preview.value.battle.sides[0].leader, 0);
    assert.equal(preview.value.battle.sides[0].fighters[0]!.hp, 0);
    assert.equal(preview.value.run.roster.entries[MAIN_ID]!.downedAtWave, 1);
    const haVan = preview.value.run.roster.entries["haVan"]!;
    assert.equal(haVan.downedAtWave, 1);
    assert.equal(haVan.location.kind, "reserve");
    assert.deepEqual(
      haVan.location.kind === "reserve" ? haVan.location.runtime : null,
      { hp: 0, energy: 58 },
    );
    assert.deepEqual(
      proposeSurvivalLineup(synced.value, battle, [
        MAIN_ID,
        "haVan",
        "maiThanh",
      ]),
      { ok: false, error: "fighterDowned" },
    );
  });

  it("giữ đồng đội gục tại chỗ khi không còn reserve sống", () => {
    const p = profile();
    const created = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 13, created.roster);
    let battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    battle.sides[0].fighters[1]!.hp = 0;
    battle.sides[0].fighters[1]!.energy = 58;
    let state = updateSurvivalFighterRuntime(
      run,
      battle,
      "leThach",
      { hp: 0, energy: 13 },
      1,
    );
    assert.ok(state.ok);
    state = updateSurvivalFighterRuntime(
      state.value.run,
      state.value.battle,
      "toKim",
      { hp: 0, energy: 17 },
      1,
    );
    assert.ok(state.ok);
    battle = state.value.battle;
    battle.winner = 0;
    const synced = syncSurvivalRosterState(state.value.run, battle);
    assert.ok(synced.ok);

    const preview = proposeSurvivalLineup(synced.value, battle, [
      MAIN_ID,
      "haVan",
      "maiThanh",
    ]);
    assert.ok(preview.ok);
    assert.equal(preview.value.battle.sides[0].fighters[1]!.hp, 0);
    assert.deepEqual(preview.value.run.roster.activeIds, [
      MAIN_ID,
      "haVan",
      "maiThanh",
    ]);
    assert.equal(
      proposeSurvivalLineup(synced.value, battle, [
        MAIN_ID,
        "leThach",
        "maiThanh",
      ]).ok,
      false,
    );
  });

  it("cho phép lineup không đổi, và bỏ preview không sửa run/battle; từ chối ngoài BREAK", () => {
    const p = profile();
    const created = createSurvivalRoster(p, [MAIN_ID, "haVan", "maiThanh"]);
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 13, created.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    battle.sides[0].fighters[1]!.hp = 71;
    battle.sides[0].fighters[1]!.energy = 22;
    battle.winner = 0;
    const originalRun = structuredClone(run);
    const originalBattle = structuredClone(battle);
    const preview = proposeSurvivalLineup(run, battle, [
      MAIN_ID,
      "haVan",
      "maiThanh",
    ]);
    assert.ok(preview.ok);
    assert.deepEqual(preview.value.run.roster.activeIds, run.roster.activeIds);
    assert.deepEqual(preview.value.run.roster.reserveIds, []);
    assert.equal(preview.value.battle.sides[0].fighters[1]!.hp, 71);
    assert.equal(preview.value.battle.sides[0].fighters[1]!.energy, 22);
    assert.deepEqual(run, originalRun);
    assert.deepEqual(battle, originalBattle);

    const fighting = structuredClone(battle);
    fighting.winner = null;
    assert.deepEqual(
      proposeSurvivalLineup(run, fighting, [MAIN_ID, "haVan", "maiThanh"]),
      { ok: false, error: "notBreak" },
    );
  });

  it("xác thực run và mọi lựa chọn rotation với domain errors ổn định", () => {
    const p = profile();
    const created = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 13, created.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    battle.winner = 0;

    assert.deepEqual(
      proposeSurvivalLineup(run, battle, [MAIN_ID, "haVan"]),
      { ok: false, error: "invalidLineup" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(run, battle, ["haVan", MAIN_ID, "maiThanh"]),
      { ok: false, error: "mainMustLead" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(run, battle, ["haVan", "maiThanh", "leThach"]),
      { ok: false, error: "mainMustLead" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(run, battle, [MAIN_ID, "haVan", "haVan"]),
      { ok: false, error: "duplicateFighter" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(run, battle, [MAIN_ID, "unowned-id", "maiThanh"]),
      { ok: false, error: "unknownFighter" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(run, battle, {
        activeIds: [MAIN_ID, "haVan", "maiThanh"],
        hp: 999999,
      }),
      { ok: false, error: "invalidPayload" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(run, battle, [MAIN_ID, 1, "maiThanh"]),
      { ok: false, error: "invalidPayload" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(
        { ...run, roster: { ...run.roster, activeIds: [] } } as never,
        battle,
        [MAIN_ID, "haVan", "maiThanh"],
      ),
      { ok: false, error: "invalidRoster" },
    );
    assert.deepEqual(
      proposeSurvivalLineup({ ...run, stateVersion: 1 } as never, battle, [
        MAIN_ID,
        "haVan",
        "maiThanh",
      ]),
      { ok: false, error: "invalidState" },
    );
    assert.deepEqual(
      proposeSurvivalLineup({ ...run, done: true }, battle, [
        MAIN_ID,
        "haVan",
        "maiThanh",
      ]),
      { ok: false, error: "finished" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(run, { ...battle, winner: 1 }, [
        MAIN_ID,
        "haVan",
        "maiThanh",
      ]),
      { ok: false, error: "finished" },
    );
    assert.deepEqual(
      proposeSurvivalLineup(run, { ...battle, winner: null }, [
        MAIN_ID,
        "haVan",
        "maiThanh",
      ]),
      { ok: false, error: "notBreak" },
    );
    const downedBattle = structuredClone(battle);
    downedBattle.sides[0].fighters[1]!.hp = 0;
    assert.deepEqual(
      proposeSurvivalLineup(run, downedBattle, [
        MAIN_ID,
        "haVan",
        "maiThanh",
      ]),
      { ok: false, error: "fighterDowned" },
    );

    const firstRequest = proposeSurvivalLineup(run, battle, [
      MAIN_ID,
      "leThach",
      "toKim",
    ]);
    const duplicateRequest = proposeSurvivalLineup(run, battle, [
      MAIN_ID,
      "leThach",
      "toKim",
    ]);
    assert.deepEqual(duplicateRequest, firstRequest);
    assert.deepEqual(run.roster.activeIds, [MAIN_ID, "haVan", "maiThanh"]);
  });

  it("preview lựa chọn nghề/hệ leader chỉ lưu trong SurvivalRun", () => {
    const p = profile();
    const created = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach"],
    );
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 17, created.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    battle.sides[0].fighters[0]!.hp -= 100;
    battle.sides[0].fighters[0]!.energy = 41;
    battle.winner = 0;
    const leaderHpBefore = battle.sides[0].fighters[0]!.hp;
    const profileBefore = structuredClone(p);
    const runBefore = structuredClone(run);
    const otherEntries = {
      haVan: structuredClone(run.roster.entries["haVan"]),
      maiThanh: structuredClone(run.roster.entries["maiThanh"]),
      leThach: structuredClone(run.roster.entries["leThach"]),
    };

    const professionOnly = proposeSurvivalLeaderBuild(run, battle, {
      profession: "phapSu",
    });
    assert.ok(professionOnly.ok);
    assert.deepEqual(professionOnly.choice, {
      profession: "phapSu",
      element: p.element,
    });
    const elementOnly = proposeSurvivalLeaderBuild(run, battle, {
      element: "hoa",
    });
    assert.ok(elementOnly.ok);
    assert.deepEqual(elementOnly.choice, {
      profession: p.profession,
      element: "hoa",
    });
    const both = proposeSurvivalLeaderBuild(run, battle, {
      profession: "muuSi",
      element: "kim",
    });
    assert.ok(both.ok);
    assert.deepEqual(both.choice, { profession: "muuSi", element: "kim" });
    assert.deepEqual(
      both.run.roster.entries[MAIN_ID]!.snapshot.leaderBuildChoice,
      { profession: "muuSi", element: "kim" },
    );
    assert.deepEqual(
      both.run.roster.entries[MAIN_ID]!.snapshot.config,
      run.roster.entries[MAIN_ID]!.snapshot.config,
    );
    assert.equal(battle.sides[0].fighters[0]!.hp, both.run.roster.entries[MAIN_ID]!.location.kind === "active"
      ? battle.sides[0].fighters[0]!.hp
      : -1);
    assert.equal(battle.sides[0].fighters[0]!.energy, 41);
      assert.equal(battle.sides[0].fighters[0]!.hp, leaderHpBefore);
    assert.deepEqual(both.run.roster.entries["haVan"], otherEntries.haVan);
    assert.deepEqual(both.run.roster.entries["maiThanh"], otherEntries.maiThanh);
    assert.deepEqual(both.run.roster.entries["leThach"], otherEntries.leThach);
    assert.deepEqual(p, profileBefore);
    const unchanged = proposeSurvivalLeaderBuild(run, battle, {});
    assert.ok(unchanged.ok);
    assert.deepEqual(unchanged.choice, {
      profession: p.profession,
      element: p.element,
    });

    assert.deepEqual(run, runBefore);
    const serialized = JSON.parse(JSON.stringify(both.run));
    const restored = deserializeSurvivalRun(serialized, battle);
    assert.ok(restored.ok);
    assert.deepEqual(
      restored.run.roster.entries[MAIN_ID]!.snapshot.leaderBuildChoice,
      { profession: "muuSi", element: "kim" },
    );
  });

  it("từ chối nghề/hệ sai và build preview ngoài BREAK hoặc sau khi kết thúc", () => {
    const p = profile();
    const created = createSurvivalRoster(p, [MAIN_ID, "haVan", "maiThanh"]);
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 17, created.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    battle.winner = 0;
    assert.deepEqual(
      proposeSurvivalLeaderBuild(run, battle, { profession: "invalid" }),
      { ok: false, error: "invalidProfession" },
    );
    assert.deepEqual(
      proposeSurvivalLeaderBuild(run, battle, { element: "invalid" }),
      { ok: false, error: "invalidElement" },
    );
    assert.deepEqual(
      proposeSurvivalLeaderBuild(run, battle, { hp: 99999 }),
      { ok: false, error: "invalidPayload" },
    );
    assert.deepEqual(
      proposeSurvivalLeaderBuild(run, { ...battle, winner: null }, {
        profession: "phapSu",
      }),
      { ok: false, error: "notBreak" },
    );
    assert.deepEqual(
      proposeSurvivalLeaderBuild({ ...run, done: true }, battle, {
        profession: "phapSu",
      }),
      { ok: false, error: "finished" },
    );
    assert.deepEqual(
      proposeSurvivalLeaderBuild(run, { ...battle, winner: 1 }, {
        profession: "phapSu",
      }),
      { ok: false, error: "finished" },
    );
  });

  it("rebuild leader bằng builder chính thức và giữ tỷ lệ HP, energy, rage, gear", () => {
    const base = profile();
    const weapon = {
      id: "g_main_sword",
      slot: "vuKhi" as const,
      element: "moc" as const,
      tier: 3 as const,
      set: "coLau",
      profession: "tuongSi" as const,
    };
    const hat = {
      id: "g_main_hat",
      slot: "dinhMao" as const,
      element: "hoa" as const,
      tier: 2 as const,
      set: "hoaLu",
    };
    const p = {
      ...base,
      bag: [weapon, hat],
      loadouts: {
        dinhBoLinh: {
          weapons: { tuongSi: weapon.id },
          slots: { dinhMao: hat.id },
        },
      },
    };
    const created = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach"],
    );
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 17, created.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    const main = battle.sides[0].fighters[0]!;
    main.hp = Math.round(main.maxHp / 2);
    main.energy = 39;
    battle.sides[0].rage = 72;
    battle.winner = 0;
    const synced = syncSurvivalRosterState(run, battle);
    assert.ok(synced.ok);
    const selected = proposeSurvivalLeaderBuild(
      synced.value,
      battle,
      { profession: "phapSu", element: "hoa" },
    );
    assert.ok(selected.ok);

    const rebuilt = applySurvivalLeaderBuild(selected.run, battle);
    assert.ok(rebuilt.ok);
    const entry = rebuilt.value.run.roster.entries[MAIN_ID]!;
    const gearLoadout = {
      weapons: { tuongSi: weapon },
      slots: { dinhMao: hat },
    };
    const expected = withGear(
      buildMain(p.main, "hoa", "phapSu"),
      gearLoadout,
    );
    const leader = rebuilt.value.battle.sides[0].fighters[0]!;
    assert.equal(entry.snapshot.config.id, MAIN_ID);
    assert.equal(entry.snapshot.config.profession, "phapSu");
    assert.equal(entry.snapshot.config.element, "hoa");
    assert.equal(entry.snapshot.config.maxHp, expected.maxHp);
    assert.equal(entry.snapshot.config.atk, expected.atk);
    assert.equal(entry.snapshot.config.def, expected.def);
    assert.deepEqual(entry.snapshot.equipment, run.roster.entries[MAIN_ID]!.snapshot.equipment);
    assert.equal(leader.hp, Math.round(main.hp / main.maxHp * expected.maxHp));
    assert.equal(leader.maxHp, expected.maxHp);
    assert.equal(leader.energy, 39);
    assert.equal(rebuilt.value.battle.sides[0].rage, 72);
    assert.equal(leader.profession, "phapSu");
    assert.equal(leader.element, "hoa");
    assert.deepEqual(leader.skills, expected.skills);
    assert.deepEqual(leader.skillLevels, expected.skillLevels);
    const staleSnapshot = {
      ...rebuilt.value.run.roster.entries[MAIN_ID]!,
      snapshot: {
        ...rebuilt.value.run.roster.entries[MAIN_ID]!.snapshot,
        config: {
          ...rebuilt.value.run.roster.entries[MAIN_ID]!.snapshot.config,
          skills: main.skills,
          skillLevels: main.skillLevels,
        },
      },
    };
    const staleRun = {
      ...rebuilt.value.run,
      roster: {
        ...rebuilt.value.run.roster,
        entries: {
          ...rebuilt.value.run.roster.entries,
          [MAIN_ID]: staleSnapshot,
        },
      },
    };
    const staleBattleBase = structuredClone(rebuilt.value.battle);
    const staleBattle = {
      ...staleBattleBase,
      sides: [
        {
          ...staleBattleBase.sides[0],
          fighters: [
            {
              ...staleBattleBase.sides[0].fighters[0]!,
              skills: main.skills,
              skillLevels: main.skillLevels,
            },
            ...staleBattleBase.sides[0].fighters.slice(1),
          ],
        },
        staleBattleBase.sides[1],
      ] as BattleState["sides"],
    };
    const repaired = applySurvivalLeaderBuild(staleRun, staleBattle);
    assert.ok(repaired.ok);
    assert.deepEqual(
      repaired.value.battle.sides[0].fighters[0]!.skills,
      expected.skills,
    );
    assert.deepEqual(
      repaired.value.battle.sides[0].fighters[0]!.skillLevels,
      expected.skillLevels,
    );
    assert.equal(rebuilt.value.run.roster.entries["haVan"]!.snapshot.config.atk,
      run.roster.entries["haVan"]!.snapshot.config.atk);
    assert.equal(p.profession, base.profession);
    assert.equal(p.element, base.element);
    assert.equal(
      rebuilt.value.run.roster.entries[MAIN_ID]!.snapshot.leaderHpRatio,
      main.hp / main.maxHp,
    );
    assert.deepEqual(
      applySurvivalLeaderBuild(rebuilt.value.run, rebuilt.value.battle),
      rebuilt,
    );
    const reloaded = deserializeSurvivalRun(
      JSON.parse(JSON.stringify(rebuilt.value.run)),
      rebuilt.value.battle,
    );
    assert.ok(reloaded.ok);
    assert.deepEqual(
      applySurvivalLeaderBuild(reloaded.run, rebuilt.value.battle),
      { ok: true, value: { run: reloaded.run, battle: rebuilt.value.battle } },
    );
  });

  it("đổi loadout kỹ năng theo nghề/hệ qua nhiều wave, giữ unlock/level và cast được sau reload", () => {
    const base = profile();
    const skillProgress = {
      ...base.main,
      level: 20,
      skillLevels: { o1: 3, o2: 4, o3: 2, o4: 5, o5: 3, o6: 4 },
    };
    const p = { ...base, main: skillProgress };
    const created = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
    );
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 71, created.roster);
    const started = startMatch({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      difficulty: "easy",
      seed: 71,
      firstSide: 0,
      now: 10_000,
      survival: run,
    });
    let match = started.match;
    const unlocked = (level: number) =>
      buildMain({ ...skillProgress, level }, "moc", "tuongSi").skills ?? [];
    assert.equal(unlocked(9).length, 3);
    assert.equal(unlocked(10).length, 4);
    assert.equal(unlocked(15).length, 5);
    assert.equal(unlocked(20).length, 6);

    const expectedFor = (profession: "tuongSi" | "phapSu", element: "moc" | "hoa") =>
      buildMain(skillProgress, element, profession);
    const advance = (
      leaderBuild: { profession?: "tuongSi" | "phapSu"; element?: "moc" | "hoa" },
      now: number,
    ) => {
      const won = {
        ...match,
        battle: { ...match.battle, winner: 0 as const },
      };
      const result = coordinateSurvivalRoundTransition(
        won,
        { type: "nextWave", leaderBuild },
        now,
      );
      assert.ok(result.ok, result.ok ? "" : result.error);
      match = result.match;

      const restored = deserializeSurvivalRun(
        JSON.parse(JSON.stringify(match.survival)),
        match.battle,
      );
      assert.ok(restored.ok);
      match = { ...match, survival: restored.run };

      const leader = match.battle.sides[0].fighters[0]!;
      const expected = expectedFor(
        leader.profession as "tuongSi" | "phapSu",
        leader.element as "moc" | "hoa",
      );
      assert.deepEqual(leader.skills, expected.skills);
      assert.deepEqual(leader.skillLevels, expected.skillLevels);
      assert.deepEqual(
        Object.keys(leader.skillLevels ?? {}).sort(),
        [...(leader.skills ?? [])].sort(),
      );
      assert.deepEqual(
        viewOf(match).battle.sides[0].fighters[0]!.skills,
        expected.skills,
      );
      assert.equal(leader.energy, won.battle.sides[0].fighters[0]!.energy);
      return leader;
    };

    const professionChanged = advance({ profession: "phapSu" }, 11_000);
    assert.equal(professionChanged.profession, "phapSu");
    assert.equal(professionChanged.element, "moc");
    assert.ok(professionChanged.skills?.includes("role_phepLan"));
    assert.ok(!professionChanged.skills?.includes("role_tramKich"));
    professionChanged.energy = 100;
    const cast = act(match.battle, {
      type: "skill",
      skill: "role_phepLan",
    });
    assert.ok(cast.ok, cast.ok ? "" : cast.error);
    match = { ...match, battle: cast.state };

    const elementChanged = advance({ element: "hoa" }, 12_000);
    assert.equal(elementChanged.profession, "phapSu");
    assert.equal(elementChanged.element, "hoa");
    assert.ok(elementChanged.skills?.includes("element_phongHoaThieuDoanh"));
    assert.ok(!elementChanged.skills?.includes("element_lucDiepPhong"));

    const bothChanged = advance(
      { profession: "tuongSi", element: "hoa" },
      13_000,
    );
    assert.equal(bothChanged.profession, "tuongSi");
    assert.equal(bothChanged.element, "hoa");
    assert.ok(bothChanged.skills?.includes("role_tramKich"));
    assert.ok(!bothChanged.skills?.includes("role_phepLan"));
  });

  it("không hồi sinh leader gục, giữ HP đầy/gần 0 và chống cộng HP do làm tròn lặp", () => {
    assert.equal(rescaleSurvivalHp(300, 600, 450), 225);
    assert.equal(rescaleSurvivalHp(0, 600, 450), 0);
    assert.equal(rescaleSurvivalHp(600, 600, 450), 450);
    assert.equal(rescaleSurvivalHp(1, 600, 450), 1);
    assert.equal(rescaleSurvivalHp(2, 600, 450, 2 / 600), 2);

    const p = profile();
    const created = createSurvivalRoster(p, [MAIN_ID, "haVan", "maiThanh"]);
    assert.ok(created.ok);
    const run = newSurvivalRun(p, 17, created.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    battle.sides[0].fighters[0]!.hp = 2;
    battle.sides[0].fighters[0]!.energy = 64;
    battle.winner = 0;
    const synced = syncSurvivalRosterState(run, battle);
    assert.ok(synced.ok);
    const downedOrNearZero = synced.value.roster.entries[MAIN_ID]!;
    assert.equal(downedOrNearZero.snapshot.leaderHpRatio, 2 / battle.sides[0].fighters[0]!.maxHp);
    let staged = proposeSurvivalLeaderBuild(synced.value, battle, {
      profession: "phapSu",
    });
    assert.ok(staged.ok);
    let applied = applySurvivalLeaderBuild(staged.run, battle);
    assert.ok(applied.ok);
    const expectedRatio = 2 / battle.sides[0].fighters[0]!.maxHp;
    for (const profession of ["tuongSi", "phapSu", "binhLinh", "tuongSi"] as const) {
      staged = proposeSurvivalLeaderBuild(applied.value.run, applied.value.battle, {
        profession,
      });
      assert.ok(staged.ok);
      applied = applySurvivalLeaderBuild(staged.run, applied.value.battle);
      assert.ok(applied.ok);
      assert.equal(
        applied.value.battle.sides[0].fighters[0]!.hp,
        Math.max(
          1,
          Math.round(
            expectedRatio *
              applied.value.battle.sides[0].fighters[0]!.maxHp,
          ),
        ),
      );
      assert.equal(applied.value.battle.sides[0].fighters[0]!.energy, 64);
      const afterSaveSync = syncSurvivalRosterState(
        applied.value.run,
        applied.value.battle,
      );
      assert.ok(afterSaveSync.ok);
      assert.equal(
        afterSaveSync.value.roster.entries[MAIN_ID]!.snapshot.leaderHpRatio,
        expectedRatio,
      );
      applied = {
        ok: true,
        value: {
          run: afterSaveSync.value,
          battle: applied.value.battle,
        },
      };
    }

    const deadBattle = structuredClone(battle);
    deadBattle.sides[0].fighters[0]!.hp = 0;
    const deadRun = syncSurvivalRosterState(run, deadBattle);
    assert.ok(deadRun.ok);
    const deadChoice = proposeSurvivalLeaderBuild(deadRun.value, deadBattle, {
      profession: "phapSu",
    });
    assert.ok(deadChoice.ok);
    const deadApplied = applySurvivalLeaderBuild(deadChoice.run, deadBattle);
    assert.ok(deadApplied.ok);
    assert.equal(deadApplied.value.battle.sides[0].fighters[0]!.hp, 0);
    assert.equal(deadApplied.value.run.roster.entries[MAIN_ID]!.downedAtWave, 1);
  });

  it("duy trì runtime reserve theo ID, giới hạn giá trị và round-trip serialization", () => {
    const p = profile();
    const result = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(result.ok);
    const run = newSurvivalRun(p, 13, result.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    const updated = updateSurvivalFighterRuntime(
      run,
      battle,
      "leThach",
      { hp: 0, energy: 35 },
      2,
    );
    assert.ok(updated.ok);
    const reserve = readSurvivalFighterState(
      updated.value.run,
      updated.value.battle,
      "leThach",
    );
    assert.ok(reserve.ok);
    assert.equal(reserve.value.hp, 0);
    assert.equal(reserve.value.energy, 35);
    assert.equal(reserve.value.downedAtWave, 2);
    assert.equal(
      updated.value.run.roster.entries["toKim"]!.location.kind === "reserve"
        ? updated.value.run.roster.entries["toKim"]!.location.runtime.hp
        : -1,
      result.roster.entries["toKim"]!.snapshot.config.maxHp,
    );
    assert.deepEqual(
      updateSurvivalFighterRuntime(
        updated.value.run,
        updated.value.battle,
        "leThach",
        { hp: 1 },
        3,
      ),
      { ok: false, error: "fighterDowned" },
    );
    assert.deepEqual(
      updateSurvivalFighterRuntime(run, battle, "toKim", { hp: -1 }, 1),
      { ok: false, error: "invalidHp" },
    );
    assert.deepEqual(
      updateSurvivalFighterRuntime(run, battle, "toKim", { energy: 101 }, 1),
      { ok: false, error: "invalidEnergy" },
    );
    const restored = JSON.parse(JSON.stringify(updated.value.run));
    assert.deepEqual(
      readSurvivalFighterState(restored, battle, "leThach"),
      reserve,
    );
  });

  it("ánh xạ active theo fighter ID, lưu downedAtWave và không chia sẻ state mutable", () => {
    const p = profile();
    const result = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach"],
    );
    assert.ok(result.ok);
    const run = newSurvivalRun(p, 13, result.roster);
    const battle = createBattle({
      sides: [
        { fighters: survivalActiveConfigs(run.roster), leader: 0 },
        { fighters: survivalWave(run, 1).foes, leader: 0 },
      ],
      seed: 4,
      timer: true,
    }).state;
    const active = readSurvivalFighterState(run, battle, "haVan");
    assert.ok(active.ok);
    assert.equal(active.value.location, "active");
    const damaged = updateSurvivalFighterRuntime(
      run,
      battle,
      "haVan",
      { hp: 0 },
      4,
    );
    assert.ok(damaged.ok);
    const synced = syncSurvivalRosterState(
      damaged.value.run,
      damaged.value.battle,
    );
    assert.ok(synced.ok);
    const downed = readSurvivalFighterState(
      synced.value,
      damaged.value.battle,
      "haVan",
    );
    assert.ok(downed.ok);
    assert.equal(downed.value.hp, 0);
    assert.equal(downed.value.downedAtWave, 4);
    assert.equal(synced.value.downed[1], 4);

    const reorderedBattle = structuredClone(damaged.value.battle);
    [reorderedBattle.sides[0].fighters[1], reorderedBattle.sides[0].fighters[2]] = [
      reorderedBattle.sides[0].fighters[2]!,
      reorderedBattle.sides[0].fighters[1]!,
    ];
    const reorderedRun = {
      ...synced.value,
      downed: [null, null, 4],
      roster: {
        ...synced.value.roster,
        activeIds: [MAIN_ID, "maiThanh", "haVan"] as const,
        entries: {
          ...synced.value.roster.entries,
          maiThanh: {
            ...synced.value.roster.entries["maiThanh"]!,
            location: { kind: "active" as const, slot: 1 as const },
          },
          haVan: {
            ...synced.value.roster.entries["haVan"]!,
            location: { kind: "active" as const, slot: 2 as const },
          },
        },
      },
    };
    const afterMove = readSurvivalFighterState(
      reorderedRun,
      reorderedBattle,
      "haVan",
    );
    assert.ok(afterMove.ok);
    assert.equal(afterMove.value.hp, 0);
    assert.equal(afterMove.value.downedAtWave, 4);
    const bothDownBattle = structuredClone(reorderedBattle);
    bothDownBattle.sides[0].fighters[1]!.hp = 0;
    const bothDownRun = {
      ...reorderedRun,
      downed: [null, 4, 4],
      roster: {
        ...reorderedRun.roster,
        entries: {
          ...reorderedRun.roster.entries,
          maiThanh: {
            ...reorderedRun.roster.entries["maiThanh"]!,
            downedAtWave: 4,
          },
        },
      },
    };
    assert.deepEqual(
      downedFightersAfterWave(bothDownRun, bothDownBattle).map((f) => f.id),
      ["haVan", "maiThanh"],
    );
    assert.equal(
      autoReviveFighterId(5, downedFightersAfterWave(bothDownRun, bothDownBattle)),
      "haVan",
    );
    const movedSync = syncSurvivalRosterState(reorderedRun, reorderedBattle);
    assert.ok(movedSync.ok);
    assert.deepEqual(movedSync.value.downed, [null, null, 4]);

    const first = readSurvivalFighterState(run, battle, MAIN_ID);
    const second = readSurvivalFighterState(run, battle, "haVan");
    assert.ok(first.ok && second.ok);
    (first.value.skills as string[]).push("test-only");
    assert.ok(!second.value.skills.includes("test-only"));
    assert.ok(!run.roster.entries[MAIN_ID]!.snapshot.config.skills!.includes("test-only"));
    assert.deepEqual(
      readSurvivalFighterState(
        JSON.parse(JSON.stringify(synced.value)),
        JSON.parse(JSON.stringify(damaged.value.battle)),
        "haVan",
      ),
      downed,
    );
  });

  it("chiếu đúng 3 active vào battle và giữ runtime, leader, board qua wave", () => {
    const p = profile();
    const rosterResult = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(rosterResult.ok);
    const run = newSurvivalRun(p, 21, rosterResult.roster);
    const side = survivalActiveSideConfig(run.roster);
    assert.ok(side.ok);
    assert.equal(side.value.fighters.length, 3);
    assert.equal(side.value.leader, 0);
    assert.deepEqual(
      side.value.fighters.map((fighter) => fighter.id),
      [MAIN_ID, "haVan", "maiThanh"],
    );
    assert.ok(
      side.value.fighters.every((fighter) => !["leThach", "toKim"].includes(fighter.id)),
    );

    const initial = createBattle({
      sides: [side.value, { fighters: survivalWave(run, 1).foes, leader: 0 }],
      seed: 15,
      timer: true,
      firstSide: 0,
    }).state;
    const battle = structuredClone(initial);
    battle.sides[0].fighters[0]!.hp -= 17;
    battle.sides[0].fighters[0]!.energy = 22;
    battle.sides[0].fighters[1]!.hp -= 31;
    battle.sides[0].fighters[1]!.energy = 67;
    battle.sides[0].rage = 73;
    battle.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    battle.winner = 0;

    const synchronized = syncSurvivalRosterState(run, battle);
    assert.ok(synchronized.ok);
    const synchronizedAgain = syncSurvivalRosterState(
      synchronized.value,
      battle,
    );
    assert.ok(synchronizedAgain.ok);
    assert.deepEqual(synchronizedAgain.value, synchronized.value);
    const beforeRoundTrip = [MAIN_ID, "haVan", "maiThanh"].map((id) => {
      const state = readSurvivalFighterState(synchronized.value, battle, id);
      assert.ok(state.ok);
      return [state.value.id, state.value.hp, state.value.energy];
    });

    it("deserialize V2 giữ nguyên run và từ chối state version/roster lỗi", () => {
      const p = profile();
      const rosterResult = createSurvivalRoster(
        p,
        [MAIN_ID, "haVan", "maiThanh"],
        ["leThach", "toKim"],
      );
      assert.ok(rosterResult.ok);
      const run = newSurvivalRun(p, 778, rosterResult.roster);
      const side = survivalActiveSideConfig(run.roster);
      assert.ok(side.ok);
      const battle = createBattle({
        sides: [
          side.value,
          { fighters: survivalWave(run, 1).foes, leader: 0 },
        ],
        seed: 91,
        timer: true,
      }).state;
      const encoded = JSON.parse(JSON.stringify(run));
      assert.deepEqual(deserializeSurvivalRun(encoded, battle), {
        ok: true,
        migrated: false,
        run,
      });
      const oldRoster = { ...encoded.roster };
      delete oldRoster.orderIds;
      const oldV2 = deserializeSurvivalRun(
        { ...encoded, roster: oldRoster },
        battle,
      );
      assert.ok(oldV2.ok);
      assert.deepEqual(
        oldV2.run.roster.orderIds,
        [...run.roster.activeIds, ...run.roster.reserveIds],
      );
      const oldEntries = Object.fromEntries(
        Object.entries(encoded.roster.entries).map(([id, entry]) => {
          const copy = { ...(entry as Record<string, unknown>) };
          delete copy.revivedAtWave;
          return [id, copy];
        }),
      );
      const withoutReviveHistory = deserializeSurvivalRun(
        {
          ...encoded,
          roster: { ...encoded.roster, entries: oldEntries },
        },
        battle,
      );
      assert.ok(withoutReviveHistory.ok);
      assert.ok(
        withoutReviveHistory.run.roster.orderIds.every(
          (id) =>
            withoutReviveHistory.run.roster.entries[id]!.revivedAtWave === null,
        ),
      );
      assert.deepEqual(
        deserializeSurvivalRun({ ...encoded, stateVersion: 99 }, battle),
        { ok: false, error: "invalidSurvivalState" },
      );
      assert.deepEqual(
        deserializeSurvivalRun(
          {
            ...encoded,
            roster: {
              ...encoded.roster,
              reserveIds: ["leThach", "leThach"],
            },
          },
          battle,
        ),
        { ok: false, error: "invalidSurvivalState" },
      );
    });
    for (const id of ["leThach", "toKim"]) {
      const reserve = readSurvivalFighterState(synchronized.value, battle, id);
      assert.ok(reserve.ok);
      assert.equal(reserve.value.location, "reserve");
      assert.equal(reserve.value.energy, 0);
      assert.equal(
        reserve.value.hp,
        rosterResult.roster.entries[id]!.snapshot.config.maxHp,
      );
    }

    const plan = planBreak(synchronized.value, battle);
    assert.ok(plan.ok);
    const next = beginWave(plan.battle, plan.config).state;
    assert.equal(next.sides[0].fighters.length, 3);
    assert.equal(next.sides[0].leader, 0);
    assert.deepEqual(
      next.sides[0].fighters.map((fighter) => fighter.id),
      [MAIN_ID, "haVan", "maiThanh"],
    );
    assert.deepEqual(
      next.sides[0].fighters.map(({ id, hp, energy }) => [id, hp, energy]),
      [
        [MAIN_ID, Math.min(battle.sides[0].fighters[0]!.maxHp, battle.sides[0].fighters[0]!.hp + Math.round(battle.sides[0].fighters[0]!.maxHp * SURVIVAL_HEAL)), 22],
        ["haVan", Math.min(battle.sides[0].fighters[1]!.maxHp, battle.sides[0].fighters[1]!.hp + Math.round(battle.sides[0].fighters[1]!.maxHp * SURVIVAL_HEAL)), 67],
        ["maiThanh", battle.sides[0].fighters[2]!.hp, battle.sides[0].fighters[2]!.energy],
      ],
    );
    assert.equal(next.sides[0].fighters[0]!.skills?.join(","), side.value.fighters[0]!.skills?.join(","));
    assert.deepEqual(
      next.sides[0].fighters.map((fighter) => ({
        skills: fighter.skills,
        skillLevels: fighter.skillLevels,
        comboPassive: fighter.comboPassive,
        chasePassives: fighter.chasePassives,
      })),
      side.value.fighters.map((fighter) => ({
        skills: fighter.skills,
        skillLevels: fighter.skillLevels,
        comboPassive: fighter.comboPassive,
        chasePassives: fighter.chasePassives,
      })),
    );
    assert.equal(next.sides[0].rage, 73);
    assert.deepEqual(next.board, battle.board);
    assert.equal(next.boardRng, battle.boardRng);
    assert.equal(next.aiRng, battle.aiRng);
    assert.equal(next.turn.number, 1);
    assert.equal(next.turn.side, 0);
    assert.equal(next.turn.lastActor, null);
    assert.deepEqual(selectableActors(next), [0, 1, 2]);

    const serializedRun = JSON.parse(JSON.stringify(plan.run));
    const serializedBattle = JSON.parse(JSON.stringify(next));
    for (const id of [MAIN_ID, "haVan", "maiThanh"]) {
      const state = readSurvivalFighterState(serializedRun, serializedBattle, id);
      assert.ok(state.ok);
      assert.equal(state.value.id, id);
      assert.ok(next.sides[0].fighters.some((fighter) => fighter.id === id));
    }
    assert.equal(serializedBattle.sides[0].fighters.some((f: { id: string }) => f.id === "leThach"), false);
    assert.equal(serializedBattle.sides[0].fighters.some((f: { id: string }) => f.id === "toKim"), false);
    assert.deepEqual(beforeRoundTrip, [
      [MAIN_ID, battle.sides[0].fighters[0]!.hp, 22],
      ["haVan", battle.sides[0].fighters[1]!.hp, 67],
      ["maiThanh", battle.sides[0].fighters[2]!.hp, battle.sides[0].fighters[2]!.energy],
    ]);
  });

  it("hồi đúng một lần theo vai trò của round thắng; downed, energy, rage và profile giữ nguyên", () => {
    const p = profile();
    const profileBeforeRecovery = structuredClone(p);
    const rosterResult = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(rosterResult.ok);
    const run = newSurvivalRun(p, 31, rosterResult.roster);
    const side = survivalActiveSideConfig(run.roster);
    assert.ok(side.ok);
    const battle = structuredClone(
      createBattle({
        sides: [
          side.value,
          { fighters: survivalWave(run, 1).foes, leader: 0 },
        ],
        seed: 19,
        timer: true,
      }).state,
    );
    battle.sides[0].fighters[0]!.hp = 1;
    battle.sides[0].fighters[0]!.energy = 17;
    battle.sides[0].fighters[1]!.hp = battle.sides[0].fighters[1]!.maxHp - 1;
    battle.sides[0].fighters[1]!.energy = 62;
    battle.sides[0].fighters[2]!.hp = 0;
    battle.sides[0].fighters[2]!.energy = 29;
    battle.sides[0].rage = 71;
    battle.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    battle.winner = 0;
    const reserveDown = updateSurvivalFighterRuntime(
      run,
      battle,
      "toKim",
      { hp: 0, energy: 44 },
      1,
    );
    assert.ok(reserveDown.ok);
    const reserveDamaged = updateSurvivalFighterRuntime(
      reserveDown.value.run,
      reserveDown.value.battle,
      "leThach",
      {
        hp: Math.round(
          rosterResult.roster.entries["leThach"]!.snapshot.config.maxHp / 2,
        ),
        energy: 13,
      },
      1,
    );
    assert.ok(reserveDamaged.ok);
    const reserveDStart = readSurvivalFighterState(
      reserveDamaged.value.run,
      reserveDamaged.value.battle,
      "leThach",
    );
    assert.ok(reserveDStart.ok);
    const recovery = recoverSurvivalRoster(
      reserveDamaged.value.run,
      reserveDamaged.value.battle,
    );
    assert.ok(recovery.ok);
    const recovered = recovery.value;
    const activeA = readSurvivalFighterState(recovered.run, recovered.battle, MAIN_ID);
    const activeB = readSurvivalFighterState(recovered.run, recovered.battle, "haVan");
    const activeC = readSurvivalFighterState(recovered.run, recovered.battle, "maiThanh");
    const reserveD = readSurvivalFighterState(recovered.run, recovered.battle, "leThach");
    const reserveE = readSurvivalFighterState(recovered.run, recovered.battle, "toKim");
    assert.ok(activeA.ok && activeB.ok && activeC.ok && reserveD.ok && reserveE.ok);
    assert.equal(activeA.value.hp, Math.min(activeA.value.maxHp, 1 + Math.round(activeA.value.maxHp * SURVIVAL_HEAL)));
    assert.equal(activeB.value.hp, activeB.value.maxHp);
    assert.equal(activeC.value.hp, 0);
    assert.equal(reserveD.value.hp, Math.min(reserveD.value.maxHp, reserveDStart.value.hp + Math.round(reserveD.value.maxHp * SURVIVAL_RESERVE_HEAL)));
    assert.equal(reserveE.value.hp, 0);
    assert.equal(activeA.value.energy, 17);
    assert.equal(activeB.value.energy, 62);
    assert.equal(activeC.value.energy, 29);
    assert.equal(reserveD.value.energy, 13);
    assert.equal(reserveE.value.energy, 44);
    assert.equal(recovered.battle.sides[0].rage, 71);
    assert.equal(recovered.run.settledThroughWave, 1);
    assert.equal(recovered.run.roster.entries["maiThanh"]!.downedAtWave, 1);
    assert.equal(recovered.run.roster.entries["toKim"]!.downedAtWave, 1);
    assert.deepEqual(p, profileBeforeRecovery);

    assert.deepEqual(
      recoverSurvivalRoster(recovered.run, recovered.battle),
      { ok: false, error: "alreadySettled" },
    );
    assert.deepEqual(
      recoverSurvivalRoster(run, { ...battle, winner: null }),
      { ok: false, error: "noBreak" },
    );
  });

  it("hồi sinh ID dự bị theo bộ đếm wave cũ, giữ trong reserve và chỉ hồi sinh một fighter", () => {
    const p = profile();
    const rosterResult = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(rosterResult.ok);
    const baseRun = newSurvivalRun(p, 43, rosterResult.roster);
    const run3 = { ...baseRun, wave: 3 };
    const side = survivalActiveSideConfig(run3.roster);
    assert.ok(side.ok);
    const battle3 = createBattle({
      sides: [
        side.value,
        { fighters: survivalWave(run3, 3).foes, leader: 0 },
      ],
      seed: 23,
      timer: true,
    }).state;
    const reserveDown = updateSurvivalFighterRuntime(
      run3,
      battle3,
      "leThach",
      { hp: 0, energy: 38 },
      3,
    );
    assert.ok(reserveDown.ok);
    const win3 = structuredClone(reserveDown.value.battle);
    win3.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    win3.winner = 0;
    const candidates3 = downedFightersAfterWave(
      reserveDown.value.run,
      win3,
    );
    assert.equal(autoReviveFighterId(3, candidates3), null);
    const firstBreak = planBreak(reserveDown.value.run, win3);
    assert.ok(firstBreak.ok);
    assert.deepEqual(firstBreak.config.revive, []);
    assert.equal(
      firstBreak.run.roster.entries["leThach"]!.downedAtWave,
      3,
    );
    const wave4Battle = beginWave(firstBreak.battle, firstBreak.config).state;
    wave4Battle.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    wave4Battle.winner = 0;
    const eligible = downedFightersAfterWave(firstBreak.run, wave4Battle);
    assert.equal(autoReviveFighterId(4, eligible), "leThach");
    const secondBreak = planBreak(firstBreak.run, wave4Battle);
    assert.ok(secondBreak.ok);
    assert.deepEqual(secondBreak.config.revive, []);
    const revivedReserve =
      secondBreak.run.roster.entries["leThach"]!;
    assert.equal(revivedReserve.location.kind, "reserve");
    if (revivedReserve.location.kind === "reserve") {
      assert.equal(
        revivedReserve.location.runtime.hp,
        Math.max(
          1,
          Math.round(
            revivedReserve.snapshot.config.maxHp * SURVIVAL_REVIVE_HP,
          ),
        ),
      );
      assert.equal(revivedReserve.location.runtime.energy, 0);
    }
    assert.equal(revivedReserve.downedAtWave, null);
    assert.equal(secondBreak.run.wave, 5);
  });

  it("trả lương hồi sinh theo fighter ID, xét tiếp tế, khóa auto-revive và chặn lặp", () => {
    const p = profile();
    const rosterResult = createSurvivalRoster(
      p,
      [MAIN_ID, "haVan", "maiThanh"],
      ["leThach", "toKim"],
    );
    assert.ok(rosterResult.ok);
    const baseRun = { ...newSurvivalRun(p, 52, rosterResult.roster), wave: 3 };
    const side = survivalActiveSideConfig(baseRun.roster);
    assert.ok(side.ok);
    const battle = createBattle({
      sides: [
        side.value,
        { fighters: survivalWave(baseRun, 3).foes, leader: 0 },
      ],
      seed: 29,
      timer: true,
    }).state;
    const down = updateSurvivalFighterRuntime(
      baseRun,
      battle,
      "toKim",
      { hp: 0, energy: 50 },
      3,
    );
    assert.ok(down.ok);
    const won = structuredClone(down.value.battle);
    won.sides[0].food = 20;
    won.sides[1].fighters.forEach((fighter) => (fighter.hp = 0));
    won.winner = 0;

    const insufficient = planBreak(down.value.run, { ...won, sides: [
      { ...won.sides[0], food: 0 },
      won.sides[1],
    ] }, "toKim");
    assert.deepEqual(insufficient, { ok: false, error: "notEnoughFood" });
    const paid = planBreak(down.value.run, won, "toKim");
    assert.ok(paid.ok);
    assert.equal(paid.config.food, 20 + SURVIVAL_FOOD - SURVIVAL_REVIVE_FOOD);
    assert.deepEqual(paid.config.revive, []);
    const revived = paid.run.roster.entries["toKim"]!;
    assert.equal(revived.location.kind, "reserve");
    assert.equal(revived.downedAtWave, null);
    if (revived.location.kind === "reserve") {
      assert.equal(
        revived.location.runtime.hp,
        Math.max(1, Math.round(revived.snapshot.config.maxHp * SURVIVAL_REVIVE_HP)),
      );
      assert.equal(revived.location.runtime.energy, 0);
    }
    assert.deepEqual(
      planBreak(paid.run, beginWave(paid.battle, paid.config).state, "toKim"),
      { ok: false, error: "noBreak" },
    );

    const dueRun = {
      ...down.value.run,
      roster: {
        ...down.value.run.roster,
        entries: {
          ...down.value.run.roster.entries,
          toKim: {
            ...down.value.run.roster.entries["toKim"]!,
            downedAtWave: 1,
            location: {
              kind: "reserve" as const,
              runtime: { hp: 0, energy: 50 },
            },
          },
        },
      },
    };
    assert.deepEqual(
      planBreak(dueRun, won, "leThach"),
      { ok: false, error: "invalidRevive" },
    );
  });

  it("từ chối lineup thiếu main, fighter trùng, chưa sở hữu và quá hai reserve", () => {
    const p = profile();
    assert.deepEqual(
      createSurvivalRoster(p, ["haVan", "maiThanh", "leThach"]),
      { ok: false, error: "invalidActiveLineup" },
    );
    assert.deepEqual(
      createSurvivalRoster(p, [MAIN_ID, "haVan", "haVan"]),
      { ok: false, error: "duplicateFighter" },
    );
    assert.deepEqual(
      createSurvivalRoster(p, [MAIN_ID, "haVan", "maiThanh"], ["haVan"]),
      { ok: false, error: "duplicateFighter" },
    );
    assert.deepEqual(
      createSurvivalRoster(p, [MAIN_ID, "haVan", "tranCuong"]),
      { ok: false, error: "notOwned" },
    );
    assert.deepEqual(
      createSurvivalRoster(p, [MAIN_ID, "haVan", "maiThanh"], [
        "leThach",
        "toKim",
        "phungPhong",
      ]),
      { ok: false, error: "invalidReserveLineup" },
    );
  });

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
    const leaders: string[] = WARLORD_ENCOUNTERS.map((w) => w.id);
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
    assert.equal(plan.run.roster.entries["haVan"]!.downedAtWave, null);
    assert.equal(plan.config.food, 30 + SURVIVAL_FOOD - SURVIVAL_REVIVE_FOOD);
    const full = planBreak(run, wonWave(FOOD_MAX), 1);
    assert.ok(full.ok);
    assert.equal(full.config.food, FOOD_MAX - SURVIVAL_REVIVE_FOOD);
  });

  it("tự hồi sinh sau 2 đợt kể từ lúc gục, mỗi lần nghỉ tối đa 1 người", () => {
    const waiting = {
      id: "waiting",
      name: "waiting",
      downedAtWave: 1,
      location: "active" as const,
    };
    assert.equal(autoReviveFighterId(1, [waiting]), null);
    assert.equal(autoReviveFighterId(2, [waiting]), "waiting");
    assert.equal(
      autoReviveFighterId(4, [
        {
          id: "reserve-newer",
          name: "newer",
          downedAtWave: 3,
          location: "reserve",
        },
        {
          id: "active-older",
          name: "older",
          downedAtWave: 2,
          location: "active",
        },
      ]),
      "active-older",
    );
    assert.equal(
      autoReviveFighterId(4, [
        {
          id: "first-in-roster",
          name: "first",
          downedAtWave: 3,
          location: "reserve",
        },
        {
          id: "second-in-roster",
          name: "second",
          downedAtWave: 3,
          location: "active",
        },
      ]),
      "first-in-roster",
    );
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
