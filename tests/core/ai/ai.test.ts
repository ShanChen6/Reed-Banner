import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  chooseMove,
  chooseSkill,
  createBattle,
  createRng,
  findValidMoves,
  parseBoard,
  playAiTurn,
  professionSkills,
  simulateKnown,
  toView,
  type BattleState,
  type Difficulty,
  type FighterConfig,
  type SideConfig,
} from "../../../src/core";

function fighter(id: string, extra: Partial<FighterConfig> = {}): FighterConfig {
  return { id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 50, def: 0, ...extra };
}
const trio = (p: string, extra: Partial<FighterConfig> = {}): SideConfig => ({
  fighters: [fighter(`${p}1`, extra), fighter(`${p}2`, extra), fighter(`${p}3`, extra)],
  leader: 0,
});
const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard", "boss", "nightmare"];

describe("simulateKnown", () => {
  it("chỉ tính phần biết chắc: ô mới để trống", () => {
    const b = parseBoard(`
      ABTSV
      TSVAB
      KKAKB
      VTBSA
    `);
    const o = simulateKnown(b, { row: 2, col: 3 }, { row: 2, col: 2 });
    assert.equal(o.harvest.kiem, 3);
    assert.equal(o.unknownCells, 3);
    assert.equal(o.extraTurn, false);
    assert.deepEqual(o.swordsByStep, [3]);
  });

  it("đếm ô đặc biệt sinh ra và lượt thêm", () => {
    const b = parseBoard(`
      KABTSV
      KBTSVA
      AKKTBS
      KTSVAB
      VSABTK
    `);
    const o = simulateKnown(b, { row: 3, col: 0 }, { row: 2, col: 0 });
    assert.equal(o.specialsCreated, 1);
    assert.equal(o.extraTurn, true);
  });
});

describe("ngang bằng thông tin", () => {
  it("AI không nhận luồng ngẫu nhiên của bàn cờ", () => {
    const { state } = createBattle({ sides: [trio("p"), trio("q")], seed: 3 });
    assert.equal("boardRng" in toView(state), false);
  });

  it("cùng bàn nhìn thấy, đổi seed ô rơi thì quyết định không đổi", () => {
    for (let seed = 0; seed < 10; seed++) {
      const { state } = createBattle({ sides: [trio("p"), trio("q")], seed });
      const other: BattleState = { ...state, boardRng: state.boardRng ^ 0xdeadbeef };
      for (const d of DIFFICULTIES) {
        const a = chooseMove(toView(state), d, createRng(state.aiRng));
        const b = chooseMove(toView(other), d, createRng(other.aiRng));
        assert.deepEqual(a, b, `${seed} ${d}`);
      }
    }
  });
});

describe("chọn nước đi", () => {
  it("cùng luồng AI cho cùng quyết định", () => {
    const { state } = createBattle({ sides: [trio("p"), trio("q")], seed: 8 });
    const a = chooseMove(toView(state), "normal", createRng(42));
    const b = chooseMove(toView(state), "normal", createRng(42));
    assert.deepEqual(a, b);
  });

  it("độ khó cao nhất chọn nước ghép 5 thay vì ghép 3", () => {
    const { state } = createBattle({ sides: [trio("p"), trio("q")], seed: 1 });
    const board = parseBoard(`
      ABTSVABTSVAB
      BTKVATSVABTS
      KKAKKSVABTSV
      TSBATBSATBSA
      ABTSVABTSVAB
      TSVABTSVABTS
      VABTSVABTSVA
      BTSVABTSVABT
    `);
    const move = chooseMove(toView({ ...state, board }), "nightmare", createRng(1));
    assert.deepEqual(move, { from: { row: 1, col: 2 }, to: { row: 2, col: 2 } });
  });
});

describe("kỹ năng của AI", () => {
  it("dùng Trảm kích khi đủ năng lượng", () => {
    const { state } = createBattle({
      sides: [trio("p", { skills: ["tramKich"] }), trio("q")],
      seed: 1,
    });
    const s = structuredClone(state);
    s.sides[0].fighters[0]!.energy = 100;
    assert.equal(chooseSkill(toView(s))?.type, "skill");
  });

  it("không hồi máu khi cả đội đầy máu", () => {
    const { state } = createBattle({
      sides: [trio("p", { profession: "ySu", skills: ["teDo"], element: "loi" }), trio("q")],
      seed: 1,
    });
    const s = structuredClone(state);
    s.sides[0].fighters[0]!.energy = 100;
    assert.equal(chooseSkill(toView(s)), null);
  });
});

describe("AI đấu AI", () => {
  it("mọi độ khó đánh trọn lượt hợp lệ và trận kết thúc", () => {
    for (const d of DIFFICULTIES) {
      const make = (p: string): SideConfig => ({
        fighters: (["tuongSi", "phapSu", "ySu"] as const).map((profession, k) =>
          fighter(`${p}${k}`, { profession, maxHp: 400, skills: professionSkills(profession).map((x) => x.id) }),
        ),
        leader: 0,
      });
      let { state } = createBattle({ sides: [make("p"), make("q")], seed: 11, timer: false });
      let turns = 0;
      while (state.winner === null && turns < 400) {
        const side = state.turn.side;
        state = playAiTurn(state, d).state;
        assert.ok(state.winner !== null || state.turn.side !== side);
        turns++;
      }
      assert.notEqual(state.winner, null, d);
    }
  });

  it("mọi độ khó đều thắng đối thủ đi ngẫu nhiên", () => {
    for (const difficulty of ["easy", "nightmare"] as const) {
      const rng = createRng(5);
      let wins = 0;
      const n = 4;
      for (let seed = 0; seed < n; seed++) {
        let { state } = createBattle({
          sides: [trio("p", { maxHp: 500 }), trio("q", { maxHp: 500 })],
          seed: seed + 100,
          timer: false,
          firstSide: (seed % 2) as 0 | 1,
        });
        while (state.winner === null) {
          if (state.turn.side === 0) {
            state = playAiTurn(state, difficulty).state;
          } else {
            const moves = findValidMoves(state.board);
            const move = moves[rng.int(0, moves.length - 1)]!;
            const result = act(state, { type: "swap", ...move });
            assert.ok(result.ok);
            state = result.state;
          }
        }
        if (state.winner === 0) wins++;
      }
      assert.ok(wins >= 3, `${difficulty} thắng ${wins}/${n}`);
    }
  });
});
