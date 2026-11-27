import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BASE_WEIGHTS,
  BOT_CHARACTERS,
  PERSONALITIES,
  PLAYABLE_COMPANIONS,
  botCharacter,
  chooseMove,
  createBattle,
  createRng,
  playAiTurn,
  resolveWeights,
  toView,
  type BattleState,
  type FighterConfig,
  type PersonalityId,
  type SideConfig,
} from "../../../src/core";

const fighter = (id: string, extra: Partial<FighterConfig> = {}): FighterConfig => ({
  id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 50, def: 0, ...extra,
});
const side = (...ids: string[]): SideConfig => ({ fighters: ids.map((id) => fighter(id)), leader: 0 });
const IDS = Object.keys(PERSONALITIES) as PersonalityId[];

describe("tính cách máy", () => {
  it("đủ 8 tính cách và 20 nhân vật: 12 sứ quân, 6 tướng lịch sử, 2 nhân vật đặc biệt, id có trong roster", () => {
    assert.equal(IDS.length, 8);
    assert.equal(BOT_CHARACTERS.length, 20);
    assert.equal(new Set(BOT_CHARACTERS.map((c) => c.id)).size, 20);
    for (const c of BOT_CHARACTERS) {
      assert.ok(PLAYABLE_COMPANIONS.some((f) => f.id === c.id), `${c.id} không có trong roster`);
      assert.ok(PERSONALITIES[c.personality], c.id);
      assert.ok(c.quirk && c.lines.open && c.lines.win && c.lines.lose, `${c.id} thiếu nét riêng hoặc thoại`);
    }
    for (const id of IDS) assert.ok(BOT_CHARACTERS.some((c) => c.personality === id), `${id} chưa ai mang`);
  });

  it("không có tính cách thì dùng đúng trọng số gốc, nước đi y như AI gốc", () => {
    for (let seed = 0; seed < 5; seed++) {
      const { state } = createBattle({ sides: [side("tranLam"), side("q")], seed });
      assert.equal(resolveWeights(toView(state), undefined), BASE_WEIGHTS);
      const a = chooseMove(toView(state), "normal", createRng(state.aiRng));
      const b = chooseMove(toView(state), "normal", createRng(state.aiRng), undefined);
      assert.deepEqual(a, b);
    }
  });

  it('"auto" lấy tính cách và nét riêng theo nhân vật đang hành động; người không có trong danh sách là AI gốc', () => {
    const { state } = createBattle({ sides: [side("phamBachHo"), side("q")], seed: 1, firstSide: 0 });
    const w = resolveWeights(toView(state), "auto");
    assert.equal(w.damage, PERSONALITIES.manhCong.weights.damage * botCharacter("phamBachHo")!.tweak.damage!);
    const other = createBattle({ sides: [side("p"), side("q")], seed: 1, firstSide: 0 }).state;
    assert.equal(resolveWeights(toView(other), "auto"), BASE_WEIGHTS);
  });

  it("Tùy cơ đổi lối theo thế trận: dẫn máu thì thủ, bị dồn thì liều", () => {
    const { state } = createBattle({ sides: [side("p"), side("q")], seed: 2, firstSide: 0 });
    const hurt = (s: BattleState, who: 0 | 1): BattleState => ({
      ...s,
      sides: s.sides.map((x, i) => (i === who ? { ...x, fighters: x.fighters.map((f) => ({ ...f, hp: Math.round(f.maxHp * 0.3) })) } : x)) as unknown as BattleState["sides"],
    });
    assert.equal(resolveWeights(toView(hurt(state, 1)), "tuyCo"), PERSONALITIES.thuThanh.weights);
    assert.equal(resolveWeights(toView(hurt(state, 0)), "tuyCo"), PERSONALITIES.lieuLinh.weights);
    assert.equal(resolveWeights(toView(state), "tuyCo"), PERSONALITIES.laoLuyen.weights);
  });

  it("ngang bằng thông tin: đổi seed ô rơi thì mọi tính cách vẫn chọn như cũ", () => {
    for (let seed = 0; seed < 5; seed++) {
      const { state } = createBattle({ sides: [side("p1", "p2", "p3"), side("q1", "q2", "q3")], seed });
      const other: BattleState = { ...state, boardRng: state.boardRng ^ 0xdeadbeef };
      for (const id of IDS) {
        const a = chooseMove(toView(state), "normal", createRng(state.aiRng), id);
        const b = chooseMove(toView(other), "normal", createRng(other.aiRng), id);
        assert.deepEqual(a, b, `${seed} ${id}`);
      }
    }
  });

  it("tính cách khác nhau thì có lúc chọn nước khác nhau, và trận vẫn chạy tới cuối", () => {
    let differs = 0;
    for (let seed = 0; seed < 20; seed++) {
      const { state } = createBattle({ sides: [side("p1", "p2", "p3"), side("q1", "q2", "q3")], seed });
      const picks = new Set(IDS.map((id) => JSON.stringify(chooseMove(toView(state), "hard", createRng(state.aiRng), id))));
      if (picks.size > 1) differs++;
    }
    assert.ok(differs > 0);
    let { state } = createBattle({ sides: [side("leHoan", "dinhDien", "luuCo"), side("q1", "q2", "q3")], seed: 9, timer: false });
    for (let i = 0; i < 400 && state.winner === null; i++) state = playAiTurn(state, "normal", 0, state.turn.side === 0 ? { personality: "auto" } : {}).state;
    assert.notEqual(state.winner, null);
  });
});
