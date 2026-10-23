import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAIN_ID,
  act,
  createDestinyFloorBattle,
  createDestinyRun,
  findValidMoves,
  newProfile,
  profileTeam,
  settleDestinyFloor,
  type DestinyRun,
  type DestinyFighterSnapshot,
  type SideConfig,
} from "../../../src/core";

const now = Date.UTC(2026, 9, 18, 17);

function fixture() {
  const profile = newProfile();
  const companionIds = Object.keys(profile.companions);
  const made = createDestinyRun(profile, now, [MAIN_ID, ...companionIds.slice(0, 3)], []);
  assert.ok(made.ok);
  if (!made.ok) throw new Error("không tạo được fixture Destiny");
  const foes: SideConfig = { fighters: profileTeam(profile, companionIds.slice(0, 2)), leader: 0 };
  return { run: made.run, foes, companionIds };
}

function runtimeRun(run: DestinyRun, changes: Record<string, { hp?: number; energy?: number; downed?: boolean }>, rage = 0): DestinyRun {
  const fighters: Record<string, DestinyFighterSnapshot> = structuredClone(run.fighters!);
  for (const [id, change] of Object.entries(changes)) fighters[id] = { ...fighters[id]!, ...change };
  return { ...run, fighters, rage };
}

describe("Destiny chọn đội và dựng trận", () => {
  it("xoay dự bị bị thương, giữ tỉ lệ HP/năng lượng/nộ khí và không hồi miễn phí", () => {
    const { run, foes, companionIds } = fixture();
    const reserve = companionIds[2]!;
    const wounded = Math.floor(run.fighters![reserve]!.config.maxHp / 3);
    const changed = runtimeRun(run, { [reserve]: { hp: wounded, energy: 47 } }, 38);
    const result = createDestinyFloorBattle(changed, {
      activeIds: [MAIN_ID, companionIds[0]!, reserve],
      leaderBuild: { element: "hoa", profession: "phapSu" },
      rules: {}, foes, seed: 17, timer: false,
    });
    assert.ok(result.ok, result.ok ? "" : result.error);
    if (!result.ok) return;
    assert.equal(result.state.sides[0].fighters[2]!.hp,
      Math.max(1, Math.round(result.state.sides[0].fighters[2]!.maxHp * wounded / run.fighters![reserve]!.config.maxHp)));
    assert.equal(result.state.sides[0].fighters[2]!.energy, 47);
    assert.equal(result.state.sides[0].rage, 38);
    assert.equal(result.state.sides[0].fighters[0]!.element, "hoa");
    assert.equal(result.state.sides[0].fighters[0]!.profession, "phapSu");
    assert.ok(Object.values(result.state.sides[0].fighters[0]!.skillLevels ?? {}).every((level) => level === 1));
    assert.equal(changed.fighters![reserve]!.hp, wounded, "hàm dựng trận không sửa/heal snapshot run");
  });

  it("đồng bộ HP/energy theo ID, giữ reserve và food xuyên tầng, rồi settle idempotent", () => {
    const { run, foes, companionIds } = fixture();
    const activeIds = [MAIN_ID, companionIds[0]!, companionIds[1]!] as const;
    const reserveId = companionIds[2]!;
    const reserveBefore = structuredClone(run.fighters![reserveId]!);
    const made = createDestinyFloorBattle(run, {
      activeIds,
      leaderBuild: { element: "moc", profession: "tuongSi" }, rules: {}, foes, seed: 19, timer: false,
    });
    assert.ok(made.ok);
    if (!made.ok) return;
    made.state.sides[0].fighters[0]!.hp = Math.floor(made.state.sides[0].fighters[0]!.maxHp / 2);
    made.state.sides[0].fighters[0]!.energy = 73;
    made.state.sides[0].fighters[1]!.hp = 0;
    made.state.sides[0].fighters[1]!.energy = 29;
    made.state.sides[0].fighters[2]!.hp = made.state.sides[0].fighters[2]!.maxHp - 1;
    made.state.sides[0].food = 7;
    made.state.sides[0].rage = 41;
    made.state.winner = 0;

    const settled = settleDestinyFloor(made.run, made.state);
    assert.ok(settled.ok);
    if (!settled.ok) return;
    assert.equal(settled.changed, true);
    assert.equal(settled.run.fighters![activeIds[0]]!.energy, 73);
    assert.equal(settled.run.fighters![activeIds[1]]!.hp, 0);
    assert.equal(settled.run.fighters![activeIds[1]]!.downed, true);
    assert.deepEqual(settled.run.fighters![reserveId], reserveBefore, "reserve không tự heal hay đổi energy");
    assert.equal(settled.run.food, 20, "food dùng clamp Tower legacy 20–100");
    assert.equal(settled.run.rage, 41);
    assert.equal(settled.run.phase, "reward");

    const replay = settleDestinyFloor(settled.run, made.state);
    assert.ok(replay.ok);
    if (!replay.ok) return;
    assert.equal(replay.changed, false);
    assert.strictEqual(replay.run, settled.run, "reload/retry không áp kết quả lần hai");
  });

  it("không settle trận chưa xong và kết thúc run khi cả ba active gục dù reserve còn sống", () => {
    const { run, foes, companionIds } = fixture();
    const made = createDestinyFloorBattle(run, {
      activeIds: [MAIN_ID, companionIds[0]!, companionIds[1]!],
      leaderBuild: { element: "moc", profession: "tuongSi" }, rules: {}, foes, seed: 23, timer: false,
    });
    assert.ok(made.ok);
    if (!made.ok) return;
    assert.deepEqual(settleDestinyFloor(made.run, made.state), { ok: false, error: "battle_not_finished" });
    made.state.sides[0].fighters.forEach((fighter) => { fighter.hp = 0; });
    made.state.winner = 1;
    const settled = settleDestinyFloor(made.run, made.state);
    assert.ok(settled.ok);
    if (!settled.ok) return;
    assert.equal(settled.run.active, false);
    assert.equal(settled.run.phase, "done");
    assert.equal(settled.won, false);
    assert.ok(settled.run.fighters![companionIds[2]!]!.hp > 0, "reserve sống không ngăn kết thúc run");
    const replay = settleDestinyFloor(structuredClone(settled.run), made.state);
    assert.ok(replay.ok && !replay.changed && !replay.won, "finish sau reload vẫn idempotent");
  });

  it("từ chối tướng đã ngã, ngoài roster, sai slot leader và nghề bị cấm", () => {
    const { run, foes, companionIds } = fixture();
    const base = { leaderBuild: { element: "moc" as const, profession: "tuongSi" as const }, rules: {}, foes, seed: 2 };
    const dead = runtimeRun(run, { [companionIds[0]!]: { hp: 0, downed: true } });
    assert.deepEqual(createDestinyFloorBattle(dead, { ...base, activeIds: [MAIN_ID, companionIds[0]!, companionIds[1]!] }),
      { ok: false, error: "fighter_downed", fighterId: companionIds[0] });
    assert.equal(createDestinyFloorBattle(run, { ...base, activeIds: [companionIds[0]!, MAIN_ID, companionIds[1]!] }).ok, false);
    assert.deepEqual(createDestinyFloorBattle(run, { ...base, activeIds: [MAIN_ID, companionIds[0]!, "ghost"] }),
      { ok: false, error: "fighter_not_in_roster", fighterId: "ghost" });
    const banned = createDestinyFloorBattle(run, {
      ...base, activeIds: [MAIN_ID, companionIds[0]!, companionIds[1]!], rules: { bannedProfessions: [run.fighters![companionIds[0]!]!.config.profession] },
    });
    assert.ok(!banned.ok && banned.error === "rules_violation");

    const oldSnapshot = structuredClone(run);
    delete (oldSnapshot.fighters![MAIN_ID] as { mainProgress?: unknown }).mainProgress;
    assert.deepEqual(createDestinyFloorBattle(oldSnapshot, {
      ...base, activeIds: [MAIN_ID, companionIds[0]!, companionIds[1]!],
    }), { ok: false, error: "invalid_run" });
  });

  it("khởi tạo đúng 3v3 và chạy trọn lượt bằng action chuẩn, không có API đổi active trong combat", () => {
    const { run, foes, companionIds } = fixture();
    const made = createDestinyFloorBattle(run, {
      activeIds: [MAIN_ID, companionIds[0]!, companionIds[1]!],
      leaderBuild: { element: "moc", profession: "tuongSi" }, rules: {}, foes, seed: 91, timer: false,
    });
    assert.ok(made.ok);
    if (!made.ok) return;
    assert.equal(made.state.sides[0].fighters.length, 3);
    assert.equal(made.state.sides[1].fighters.length, 3);
    let state = made.state;
    const startingSide = state.turn.side;
    for (let actions = 0; actions < 8 && state.turn.side === startingSide && state.winner === null; actions++) {
      const move = findValidMoves(state.board)[0]!;
      const result = act(state, { type: "swap", from: move.from, to: move.to });
      assert.ok(result.ok);
      if (!result.ok) break;
      state = result.state;
    }
    assert.ok(state.winner !== null || state.turn.side !== startingSide, "battle engine phải kết thúc lượt đầy đủ");
  });
});
