import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  act,
  createBattle,
  mainCharacter,
  playAiTurn,
  STARTER_COMPANIONS,
  findValidMoves,
  type BattleEvent,
  type BattleState,
} from "../../src/core";
import { sidesAfterEvents } from "../../src/app/game/battle/heldSides";

const byId = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id)!;

const ELEMENTS = ["kim", "moc", "thuy", "hoa", "tho", "loi", "phong"] as const;

function battle(seed: number, solo = false, element: (typeof ELEMENTS)[number] = "hoa"): BattleState {
  return createBattle({
    sides: solo
      ? [
          { fighters: [mainCharacter(element)], leader: 0 },
          { fighters: [byId("leThach")], leader: 0 },
        ]
      : [
          { fighters: [mainCharacter(element), byId("haVan"), byId("maiThanh")], leader: 0 },
          { fighters: [byId("leThach"), byId("toKim"), byId("phungPhong")], leader: 0 },
        ],
    seed,
    timer: false,
  }).state;
}

const stats = (s: BattleState["sides"]) =>
  s.map((side) => ({
    food: side.food,
    rage: side.rage,
    fighters: side.fighters.map((f) => ({
      hp: f.hp,
      energy: f.energy,
      spirit: f.spirit,
      effects: f.effects.map((e) => e.kind).sort(),
    })),
  }));

/** Sự kiện trước khi phe kia vào lượt: phần giao diện diễn xong trước lúc nghỉ chuyển phe. */
function ownBatch(before: BattleState, events: readonly BattleEvent[]): BattleEvent[] {
  const end = events.findIndex((e) => e.type === "turnStart" && e.side !== before.turn.side);
  return end < 0 ? [...events] : events.slice(0, end);
}

describe("sidesAfterEvents", () => {
  it("dựng lại đúng chỉ số cuối từ sự kiện của cả trận", () => {
    for (const solo of [true, false]) {
      for (const [k, element] of ELEMENTS.entries()) {
        const seed = k + 1;
        let state = battle(seed, solo, element);
        for (let t = 0; t < 40 && state.winner === null; t++) {
          const r = playAiTurn(state, "normal");
          assert.deepEqual(
            stats(sidesAfterEvents(state.sides, r.events, r.state)),
            stats(r.state.sides),
            `${element} seed ${seed} lượt ${t}`,
          );
          state = r.state;
        }
      }
    }
  });

  it("năng lượng từ ô âm dương hiện ngay khi diễn xong nước đi, trước lượt đối thủ", () => {
    let checked = 0;
    for (let seed = 1; seed <= 30 && checked < 3; seed++) {
      const state = battle(seed, true);
      for (const { from, to } of findValidMoves(state.board)) {
        const r = act(state, { type: "swap", from, to });
        if (!r.ok || r.state.turn.side === state.turn.side) continue;
        const own = ownBatch(state, r.events);
        const gained = own
          .filter((e) => e.type === "energy" && e.side === 0 && e.fighter === 0)
          .reduce((n, e) => n + (e.type === "energy" ? e.amount : 0), 0);
        if (gained <= 0) continue;
        const shown = sidesAfterEvents(state.sides, own, r.state);
        assert.equal(shown[0].fighters[0]!.energy, state.sides[0].fighters[0]!.energy + gained);
        checked++;
        break;
      }
    }
    assert.ok(checked > 0, "không tìm được nước ăn ô âm dương");
  });
});
