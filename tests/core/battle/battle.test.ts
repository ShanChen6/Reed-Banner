import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  cascadeMultiplier,
  createBattle,
  defenseMultiplier,
  findValidMoves,
  moraleOf,
  parseBoard,
  selectableActors,
  type BattleEvent,
  type BattleState,
  type FighterConfig,
  type SideConfig,
} from "../../../src/core";

function fighter(id: string, extra: Partial<FighterConfig> = {}): FighterConfig {
  return { id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 20, def: 0, ...extra };
}

const solo = (f: FighterConfig = fighter("a")): SideConfig => ({ fighters: [f], leader: 0 });
const trio = (p: string, extra: Partial<FighterConfig> = {}): SideConfig => ({
  fighters: [fighter(`${p}1`, extra), fighter(`${p}2`, extra), fighter(`${p}3`, extra)],
  leader: 0,
});

function ok(result: ReturnType<typeof act>) {
  assert.ok(result.ok, result.ok ? "" : result.error);
  return result;
}

function firstMove(state: BattleState) {
  return findValidMoves(state.board)[0]!;
}

function play(state: BattleState, now = 0) {
  const m = firstMove(state);
  return ok(act(state, { type: "swap", from: m.from, to: m.to }, now));
}

describe("công thức", () => {
  it("sĩ khí theo lương", () => {
    assert.equal(moraleOf(100), "eager");
    assert.equal(moraleOf(70), "eager");
    assert.equal(moraleOf(69), "normal");
    assert.equal(moraleOf(30), "normal");
    assert.equal(moraleOf(29), "hungry");
    assert.equal(moraleOf(1), "hungry");
    assert.equal(moraleOf(0), "starving");
  });

  it("cascade +10% mỗi bước, tối đa +50%", () => {
    assert.equal(cascadeMultiplier(0), 1);
    assert.equal(cascadeMultiplier(2), 1.2);
    assert.equal(cascadeMultiplier(9), 1.5);
  });

  it("DEF dạng phần trăm", () => {
    assert.equal(defenseMultiplier(0), 1);
    assert.equal(defenseMultiplier(100), 0.5);
    assert.ok(Math.abs(defenseMultiplier(50) - 2 / 3) < 1e-12);
    assert.equal(defenseMultiplier(100, 1), 1);
  });
});

describe("createBattle", () => {
  it("khởi đầu: đầy máu, 0 năng lượng, lương 60 trừ chi phí lượt đầu", () => {
    const { state, events } = createBattle({ sides: [solo(), solo()], seed: 1, now: 1000 });
    assert.equal(state.sides[0].fighters[0]!.hp, 2000, "1vs1: máu tối đa ×2");
    assert.equal(state.sides[0].food, 55);
    assert.equal(state.sides[1].food, 60);
    assert.equal(state.turn.side, 0);
    assert.equal(state.turn.deadline, 31_000);
    assert.deepEqual(events.at(-1), { type: "turnStart", side: 0, actor: 0, extra: false });
  });

  it("đội có Binh lính chỉ tụt 3 lương", () => {
    const { state } = createBattle({ sides: [solo(fighter("a", { profession: "binhLinh" })), solo()], seed: 1 });
    assert.equal(state.sides[0].food, 57);
  });

  it("tắt đồng hồ thì không có deadline", () => {
    const { state } = createBattle({ sides: [solo(), solo()], seed: 1, timer: false });
    assert.equal(state.turn.deadline, null);
  });

  it("cùng seed và cùng chuỗi nước đi cho cùng trận", () => {
    const run = () => {
      let { state } = createBattle({ sides: [trio("p"), trio("q")], seed: 42 });
      for (let i = 0; i < 30 && state.winner === null; i++) state = play(state).state;
      return JSON.stringify(state);
    };
    assert.equal(run(), run());
  });
});

describe("lượt", () => {
  it("nước đi không hợp lệ bị từ chối, trạng thái không đổi", () => {
    const { state } = createBattle({ sides: [solo(), solo()], seed: 1 });
    const before = JSON.stringify(state);
    const result = act(state, { type: "swap", from: { row: 0, col: 0 }, to: { row: 5, col: 5 } });
    assert.deepEqual(result, { ok: false, error: "invalidMove" });
    assert.equal(JSON.stringify(state), before);
  });

  it("đổi ô xong chuyển sang phe kia, trừ khi có lượt thêm", () => {
    let { state } = createBattle({ sides: [solo(), solo()], seed: 3 });
    for (let i = 0; i < 20; i++) {
      const side = state.turn.side;
      const result = play(state);
      const extra = result.events.some((e) => e.type === "turnStart" && e.extra);
      state = result.state;
      if (state.winner !== null) break;
      assert.equal(state.turn.side, extra ? side : 1 - side);
    }
  });

  it("3vs3: mặc định người kế tiếp, người vừa ra tay phải nghỉ", () => {
    let { state } = createBattle({ sides: [trio("p"), trio("q")], seed: 5, timer: false });
    assert.deepEqual(selectableActors(state), [0, 1, 2]);
    assert.equal(state.turn.actor, 0);
    const seen: number[] = [];
    for (let i = 0; i < 40 && state.winner === null; i++) {
      const { side, actor, lastActor } = state.turn;
      assert.notEqual(actor, lastActor);
      if (side === 0) seen.push(actor);
      state = play(state).state;
    }
    assert.ok(new Set(seen).size === 3);
  });

  it("chọn người hành động khác người mặc định", () => {
    const { state } = createBattle({ sides: [trio("p"), trio("q")], seed: 5 });
    const r = ok(act(state, { type: "selectActor", fighter: 2 }));
    assert.equal(r.state.turn.actor, 2);
    assert.deepEqual(act(state, { type: "selectActor", fighter: 7 }), { ok: false, error: "invalidActor" });
  });

  it("hết giờ thì mất lượt; báo sớm bị từ chối; đổi ô quá ân hạn bị từ chối", () => {
    const { state } = createBattle({ sides: [solo(), solo()], seed: 1, now: 0 });
    assert.deepEqual(act(state, { type: "timeout" }, 30_000), { ok: false, error: "tooEarly" });
    const m = firstMove(state);
    assert.deepEqual(act(state, { type: "swap", from: m.from, to: m.to }, 33_001), { ok: false, error: "tooLate" });
    ok(act(state, { type: "swap", from: m.from, to: m.to }, 33_000));
    const r = ok(act(state, { type: "timeout" }, 30_001));
    assert.equal(r.state.turn.side, 1);
    assert.equal(r.state.turn.deadline, 60_001);
    assert.equal(r.state.sides[0].fighters[0]!.hp, 2000);
  });
});

describe("áp kết quả bàn cờ", () => {
  // Bàn đặt sẵn: kéo (2,3)→(2,2) ghép 3 kiếm ở hàng 2; ô rơi phía trên tùy seed.
  function withBoard(state: BattleState, text: string): BattleState {
    return { ...state, board: parseBoard(text) };
  }
  const BOARD = `
    ABTSVABTSVAB
    TSVABTSVABTS
    KKAKBSVABTSV
    VTBSATBSATBS
    ABTSVABTSVAB
    TSVABTSVABTS
    VABTSVABTSVA
    BTSVABTSVABT
  `;

  function swordDamage(events: readonly BattleEvent[], step = 0) {
    const swapEv = events.find((e) => e.type === "swap");
    assert.ok(swapEv && swapEv.type === "swap");
    return events.filter((e) => e.type === "damage" && e.source === "sword")[step];
  }

  it("ghép 3 kiếm: ATK × 3 × hệ số", () => {
    const { state } = createBattle({
      sides: [solo(fighter("a", { atk: 20, element: "hoa" })), solo(fighter("b", { def: 100, element: "kim" }))],
      seed: 1,
    });
    const r = ok(act(withBoard(state, BOARD), { type: "swap", from: { row: 2, col: 3 }, to: { row: 2, col: 2 } }));
    // lương 55: bình thường; Hỏa khắc Kim ×1.25; DEF 100 ×0.5
    assert.deepEqual(swordDamage(r.events), { type: "damage", side: 1, fighter: 0, amount: 38, absorbed: 0, source: "sword" });
  });

  it("đói thì giảm sát thương", () => {
    const { state } = createBattle({
      sides: [{ ...solo(), food: 20 }, solo()],
      seed: 1,
    });
    const r = ok(act(withBoard(state, BOARD), { type: "swap", from: { row: 2, col: 3 }, to: { row: 2, col: 2 } }));
    assert.deepEqual(swordDamage(r.events), { type: "damage", side: 1, fighter: 0, amount: 45, absorbed: 0, source: "sword" });
  });

  it("ghép âm dương cho năng lượng; Pháp sư ×1.5", () => {
    const board = BOARD.replace("KKAKBSVABTSV", "AAKABSVKBTSV");
    for (const [profession, expected] of [
      ["tuongSi", 30],
      ["phapSu", 45],
    ] as const) {
      const { state } = createBattle({ sides: [solo(fighter("a", { profession })), solo()], seed: 1 });
      const r = ok(act(withBoard(state, board), { type: "swap", from: { row: 2, col: 3 }, to: { row: 2, col: 2 } }));
      const first = r.events.find((e) => e.type === "energy");
      assert.deepEqual(first, { type: "energy", side: 0, fighter: 0, amount: expected });
    }
  });

  it("ghép trống trận tích nộ cho thủ lĩnh; đầy 100 thì kích hoạt bị động", () => {
    const board = BOARD.replace("KKAKBSVABTSV", "DDADBSVABTSV");
    const { state } = createBattle({ sides: [solo(fighter("a", { element: "moc" })), solo()], seed: 1 });
    const primed: BattleState = structuredClone(withBoard(state, board));
    primed.sides[0].rage = 95;
    const r = ok(act(primed, { type: "swap", from: { row: 2, col: 3 }, to: { row: 2, col: 2 } }));
    assert.ok(r.events.some((e) => e.type === "passive" && e.side === 0));
    assert.equal(r.state.sides[0].rage, 0);
    assert.equal(r.state.sides[0].passiveTurns, 4);
  });

  it("ghép bánh chưng cộng lương", () => {
    const board = BOARD.replace("KKAKBSVABTSV", "BBABKSVAKTSV");
    const { state } = createBattle({ sides: [solo(), solo()], seed: 1 });
    const r = ok(act(withBoard(state, board), { type: "swap", from: { row: 2, col: 3 }, to: { row: 2, col: 2 } }));
    assert.deepEqual(r.events.find((e) => e.type === "food"), { type: "food", side: 0, amount: 12 });
  });

  it("Tinh thần: đầy khi vào trận, trừ dần từ lượt 25 của phe", () => {
    for (let seed = 1; seed < 20; seed++) {
      const { state } = createBattle({ sides: [solo(), solo()], seed, timer: false });
      assert.equal(state.sides[0].fighters[0]!.spirit, 100);
      const s = structuredClone(state);
      s.turn.number = 49;
      const r = play(s);
      if (r.state.turn.side !== 1 || r.state.winner !== null) continue;
      assert.equal(r.state.sides[1].fighters[0]!.spirit, 95);
      assert.equal(r.state.sides[0].fighters[0]!.spirit, 100);
      assert.ok(r.events.some((e) => e.type === "spirit" && e.side === 1 && e.spirit === 95));
      return;
    }
    assert.fail("không tìm được seed không có lượt thêm");
  });

  it("hết lương: mất 3% máu tối đa đầu lượt", () => {
    const { state, events } = createBattle({ sides: [{ ...solo(), food: 3 }, solo()], seed: 1 });
    assert.equal(state.sides[0].food, 0);
    assert.deepEqual(
      events.find((e) => e.type === "damage"),
      { type: "damage", side: 0, fighter: 0, amount: 60, absorbed: 0, source: "starvation" },
    );
  });

  it("hạ gục hết phe đối thủ thì kết thúc trận", () => {
    const { state } = createBattle({
      sides: [solo(fighter("a", { atk: 1000 })), solo(fighter("b", { maxHp: 100 }))],
      seed: 1,
    });
    const r = ok(act(withBoard(state, BOARD), { type: "swap", from: { row: 2, col: 3 }, to: { row: 2, col: 2 } }));
    assert.equal(r.state.winner, 0);
    assert.ok(r.events.some((e) => e.type === "end" && e.winner === 0));
    assert.deepEqual(act(r.state, { type: "timeout" }, 1e9), { ok: false, error: "battleOver" });
  });
});

describe("trận tự đấu", () => {
  it("trận 3vs3 với nước đi đầu tiên luôn kết thúc, mọi chỉ số trong giới hạn", () => {
    for (let seed = 0; seed < 20; seed++) {
      let { state } = createBattle({ sides: [trio("p"), trio("q", { element: "hoa" })], seed, timer: false });
      let moves = 0;
      while (state.winner === null && moves < 2000) {
        state = play(state).state;
        moves++;
        for (const side of state.sides) {
          assert.ok(side.food >= 0 && side.food <= 100);
          assert.ok(side.rage >= 0 && side.rage <= 100);
          for (const f of side.fighters) {
            assert.ok(f.hp >= 0 && f.hp <= f.maxHp);
            assert.ok(f.energy >= 0 && f.energy <= 100);
          }
        }
      }
      assert.notEqual(state.winner, null, `seed ${seed}`);
    }
  });
});
