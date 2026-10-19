import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROFESSIONS,
  act,
  createBattle,
  fatigueMultiplier,
  findValidMoves,
  professionSkills,
  type BattleState,
  type FighterConfig,
  type SideConfig,
} from "../../../src/core";

function fighter(id: string, extra: Partial<FighterConfig> = {}): FighterConfig {
  return { id, name: id, element: "kim", profession: "tuongSi", maxHp: 1000, atk: 100, def: 0, ...extra };
}

const solo = (f: FighterConfig): SideConfig => ({ fighters: [f], leader: 0 });
const trio = (p: string, first: Partial<FighterConfig> = {}): SideConfig => ({
  fighters: [fighter(`${p}1`, first), fighter(`${p}2`), fighter(`${p}3`)],
  leader: 0,
});

function setup(sides: [SideConfig, SideConfig], energy = 100): BattleState {
  const { state } = createBattle({ sides, seed: 1, timer: false });
  const s = structuredClone(state);
  for (const side of s.sides) for (const f of side.fighters) f.energy = energy;
  return s;
}

function ok(result: ReturnType<typeof act>) {
  assert.ok(result.ok, result.ok ? "" : result.error);
  return result;
}

const me = (s: BattleState, i = 0) => s.sides[0].fighters[i]!;
const foe = (s: BattleState, i = 0) => s.sides[1].fighters[i]!;

describe("khung kỹ năng", () => {
  it("mỗi nghề có 1 chiêu nấc 1 (30) và 2 chiêu nấc 2 (45)", () => {
    for (const p of PROFESSIONS) {
      const list = professionSkills(p);
      assert.deepEqual(list.map((d) => [d.tier, d.cost]), [[1, 30], [2, 45], [2, 45]], p);
    }
  });

  it("trừ năng lượng, tối đa 1 kỹ năng mỗi lần ra tay, kỹ năng không kết thúc lượt", () => {
    const s = setup([solo(fighter("a", { skills: ["tramKich", "phaTran"] })), solo(fighter("b"))]);
    const r = ok(act(s, { type: "skill", skill: "tramKich" }));
    assert.equal(me(r.state).energy, 70);
    assert.equal(r.state.turn.side, 0);
    assert.deepEqual(act(r.state, { type: "skill", skill: "phaTran" }), { ok: false, error: "skillUsed" });
    const m = findValidMoves(r.state.board)[0]!;
    ok(act(r.state, { type: "swap", ...m }));
  });

  it("từ chối kỹ năng không mang theo, thiếu năng lượng, đang Câm lặng", () => {
    const s = setup([solo(fighter("a", { skills: ["tramKich"] })), solo(fighter("b"))], 20);
    assert.deepEqual(act(s, { type: "skill", skill: "phaTran" }), { ok: false, error: "invalidSkill" });
    assert.deepEqual(act(s, { type: "skill", skill: "tramKich" }), { ok: false, error: "notEnoughEnergy" });
    me(s).energy = 100;
    me(s).effects.push({ kind: "silence", value: 0, turns: 1 });
    assert.deepEqual(act(s, { type: "skill", skill: "tramKich" }), { ok: false, error: "silenced" });
  });

  it("dùng kỹ năng tốn năng lượng đặt lại đồng hồ 30 giây", () => {
    const { state } = createBattle({
      sides: [solo(fighter("a", { skills: ["tramKich"] })), solo(fighter("b"))],
      seed: 1,
      now: 0,
    });
    const s = structuredClone(state);
    me(s).energy = 100;
    const r = ok(act(s, { type: "skill", skill: "tramKich" }, 20_000));
    assert.equal(r.state.turn.deadline, 50_000);
  });
});

describe("chiêu nghề", () => {
  it("Trảm kích: 210% ATK chịu DEF; dấu ấn Kim: Thủ −15%", () => {
    const s = setup([solo(fighter("a", { skills: ["tramKich"] })), solo(fighter("b", { def: 100, element: "loi" }))]);
    const r = ok(act(s, { type: "skill", skill: "tramKich" }));
    assert.equal(foe(r.state).hp, 2000 - 105);
    assert.deepEqual(foe(r.state).effects, [{ kind: "defDown", value: 0.15, turns: 1 }]);
  });

  it("Phép lan ở 1vs1 trúng một đối thủ ×1.5", () => {
    const s = setup([solo(fighter("a", { skills: ["phepLan"], element: "loi" })), solo(fighter("b", { element: "kim" }))]);
    const r = ok(act(s, { type: "skill", skill: "phepLan" }));
    assert.equal(foe(r.state).hp, 2000 - 150);
  });

  it("Khiên hấp thụ trước khi trừ máu", () => {
    const s = setup([solo(fighter("a", { skills: ["tramKich"], element: "loi" })), solo(fighter("b", { element: "kim" }))]);
    foe(s).effects.push({ kind: "shield", value: 100, turns: null });
    const r = ok(act(s, { type: "skill", skill: "tramKich" }));
    assert.equal(foe(r.state).hp, 2000 - 110);
    assert.equal(foe(r.state).effects.length, 0);
  });

  it("Phản đòn trả lại một phần sát thương", () => {
    const s = setup([solo(fighter("a", { skills: ["tramKich"], element: "loi" })), solo(fighter("b", { element: "kim" }))]);
    foe(s).effects.push({ kind: "reflect", value: 0.4, turns: 2 });
    const r = ok(act(s, { type: "skill", skill: "tramKich" }));
    assert.equal(me(r.state).hp, 2000 - 84);
  });

  it("Thủ thành ở 3vs3: Khiêu khích buộc kỹ năng đơn mục tiêu nhắm vào người khiêu khích", () => {
    const s = setup([trio("p", { skills: ["tramKich"], element: "loi" }), trio("q")]);
    foe(s, 2).effects.push({ kind: "taunt", value: 0, turns: 2 });
    assert.deepEqual(act(s, { type: "skill", skill: "tramKich", target: 0 }), { ok: false, error: "invalidTarget" });
    const r = ok(act(s, { type: "skill", skill: "tramKich" }));
    assert.ok(foe(r.state, 2).hp < 1000);
    assert.equal(foe(r.state, 0).hp, 1000);
  });

  it("Thủ thành ở 1vs1: không có Khiêu khích, vẫn có Khiên", () => {
    const s = setup([solo(fighter("a", { skills: ["thuThanh"], profession: "binhLinh", element: "loi" })), solo(fighter("b"))]);
    const r = ok(act(s, { type: "skill", skill: "thuThanh" }));
    assert.deepEqual(me(r.state).effects, [{ kind: "shield", value: 400, turns: null }]);
  });

  it("Linh dược hồi máu và Thanh tẩy đồng đội được chọn", () => {
    const s = setup([trio("p", { skills: ["linhDuoc"], profession: "ySu", element: "loi" }), trio("q")]);
    me(s, 1).hp = 500;
    me(s, 1).effects.push({ kind: "burn", value: 10, turns: 2 }, { kind: "atkUp", value: 0.2, turns: 2 });
    const r = ok(act(s, { type: "skill", skill: "linhDuoc", target: 1 }));
    assert.equal(me(r.state, 1).hp, 720);
    assert.deepEqual(me(r.state, 1).effects.map((e) => e.kind), ["atkUp"]);
  });

  it("Phá kế Xua tan hiệu ứng có lợi của cả đội đối thủ", () => {
    const s = setup([trio("p", { skills: ["phaKe"], profession: "quanSu", element: "loi" }), trio("q")]);
    foe(s, 0).effects.push({ kind: "shield", value: 50, turns: null }, { kind: "silence", value: 0, turns: 1 });
    foe(s, 2).effects.push({ kind: "defUp", value: 0.2, turns: 2 });
    const r = ok(act(s, { type: "skill", skill: "phaKe" }));
    assert.deepEqual(foe(r.state, 0).effects.map((e) => e.kind), ["silence"]);
    assert.deepEqual(foe(r.state, 2).effects, []);
  });

  it("Cắt quân lương trừ lương đối thủ và năng lượng mỗi đối thủ", () => {
    const s = setup([trio("p", { skills: ["catQuanLuong"], profession: "muuSi", element: "kim" }), trio("q")]);
    const r = ok(act(s, { type: "skill", skill: "catQuanLuong" }));
    assert.equal(r.state.sides[1].food, 45);
    assert.deepEqual(r.state.sides[1].fighters.map((f) => f.energy), [90, 90, 90]);
  });

  it("Ngũ hành ấn hệ Thủy chắc chắn Đóng băng; đối thủ bị Đóng băng mất lượt ở 1vs1", () => {
    const s = setup([solo(fighter("a", { skills: ["nguHanhAn"], profession: "phapSu", element: "thuy" })), solo(fighter("b"))]);
    let r = ok(act(s, { type: "skill", skill: "nguHanhAn" }));
    assert.ok(foe(r.state).effects.some((e) => e.kind === "freeze"));
    const m = findValidMoves(r.state.board)[0]!;
    r = ok(act(r.state, { type: "swap", ...m }));
    assert.ok(r.events.some((e) => e.type === "frozenSkip" && e.side === 1));
    // Lượt sau của phe 1: miễn nhiễm Đóng băng
    assert.ok(foe(r.state).effects.some((e) => e.kind === "freezeImmune"));
  });

  it("Thiêu đốt (dấu ấn Hỏa) trừ máu đầu lượt của phe bị ảnh hưởng", () => {
    const s = setup([solo(fighter("a", { skills: ["muaChuoc"], profession: "muuSi", element: "hoa" })), solo(fighter("b"))]);
    let r = ok(act(s, { type: "skill", skill: "muaChuoc" }));
    assert.equal(foe(r.state).energy, 60);
    const m = findValidMoves(r.state.board)[0]!;
    r = ok(act(r.state, { type: "swap", ...m }));
    assert.ok(r.events.some((e) => e.type === "damage" && e.side === 1 && e.source === "burn" && e.amount === 30));
  });

  it("Hiệu lệnh: Công +25% cho cả đội; hết hạn sau 2 lượt của phe", () => {
    let s = setup([trio("p", { skills: ["hieuLenh"], element: "loi" }), trio("q")]);
    s = ok(act(s, { type: "skill", skill: "hieuLenh" })).state;
    assert.ok(s.sides[0].fighters.every((f) => f.effects.some((e) => e.kind === "atkUp" && e.turns === 2)));
    let ownTurns = 0;
    while (ownTurns < 2) {
      const side = s.turn.side;
      const r = ok(act(s, { type: "swap", ...findValidMoves(s.board)[0]! }));
      if (side === 0 && r.state.turn.side === 1) ownTurns++;
      s = r.state;
    }
    assert.ok(s.sides[0].fighters.every((f) => !f.effects.some((e) => e.kind === "atkUp")));
  });
});

describe("trận tự đấu có kỹ năng", () => {
  it("mọi nghề và nguyên tố dùng kỹ năng khi đủ năng lượng, chỉ số luôn trong giới hạn", () => {
    // Bot chọn nước đầu tiên và chỉ số tạm nên vài trận Khiên + hồi máu kéo dài; cân bằng thuộc về mô phỏng.
    let finished = 0;
    const elements = ["kim", "moc", "thuy", "hoa", "tho", "loi", "phong"] as const;
    for (let seed = 0; seed < 14; seed++) {
      const make = (p: string, offset: number): SideConfig => ({
        fighters: [0, 1, 2].map((k) => {
          const profession = PROFESSIONS[(seed + k + offset) % PROFESSIONS.length]!;
          return fighter(`${p}${k}`, {
            profession,
            element: elements[(seed + k * 2 + offset) % elements.length]!,
            atk: 20,
            skills: professionSkills(profession).map((d) => d.id),
          });
        }),
        leader: 0,
      });
      let { state } = createBattle({ sides: [make("p", 0), make("q", 3)], seed, timer: false });
      let moves = 0;
      while (state.winner === null && moves < 3000) {
        const actor = state.sides[state.turn.side].fighters[state.turn.actor]!;
        const skill = [...(actor.skills ?? [])].reverse().find((id) => {
          const r = act(state, { type: "skill", skill: id });
          return r.ok;
        });
        if (skill) state = ok(act(state, { type: "skill", skill })).state;
        if (state.winner !== null) break;
        state = ok(act(state, { type: "swap", ...findValidMoves(state.board)[0]! })).state;
        moves++;
        for (const side of state.sides) {
          for (const f of side.fighters) {
            assert.ok(f.hp >= 0 && f.hp <= f.maxHp);
            assert.ok(f.energy >= 0 && f.energy <= 100);
          }
        }
      }
      if (state.winner !== null) finished++;
    }
    assert.ok(finished >= 7, `chỉ ${finished}/14 trận kết thúc`);
  });
});

describe("Mệt mỏi (1vs1)", () => {
  it("từ lượt 30 mỗi phe, hồi máu và Khiên giảm 10% mỗi lượt, về 0 sau 10 lượt", () => {
    assert.equal(fatigueMultiplier(29), 1);
    assert.equal(fatigueMultiplier(30), 0.9);
    assert.ok(Math.abs(fatigueMultiplier(35) - 0.4) < 1e-9);
    assert.equal(fatigueMultiplier(39), 0);
    assert.equal(fatigueMultiplier(60), 0);
  });

  it("ở 1vs1 lượt 35 của phe: Linh dược chỉ hồi 40%, Thủ thành cho Khiên 40%", () => {
    const s = setup([solo(fighter("a", { skills: ["linhDuoc"], profession: "ySu", element: "loi" })), solo(fighter("b"))]);
    s.turn.number = 69;
    me(s).hp = 500;
    const r = ok(act(s, { type: "skill", skill: "linhDuoc" }));
    assert.equal(me(r.state).hp, 500 + Math.round(2000 * 0.22 * 0.4));

    const t = setup([solo(fighter("a", { skills: ["thuThanh"], profession: "binhLinh", element: "loi" })), solo(fighter("b"))]);
    t.turn.number = 69;
    const r2 = ok(act(t, { type: "skill", skill: "thuThanh" }));
    assert.deepEqual(me(r2.state).effects, [{ kind: "shield", value: 160, turns: null }]);
  });

  it("không áp dụng ở 3vs3", () => {
    const s = setup([trio("p", { skills: ["linhDuoc"], profession: "ySu", element: "loi" }), trio("q")]);
    s.turn.number = 79;
    me(s, 1).hp = 500;
    const r = ok(act(s, { type: "skill", skill: "linhDuoc", target: 1 }));
    assert.equal(me(r.state, 1).hp, 720);
  });
});
