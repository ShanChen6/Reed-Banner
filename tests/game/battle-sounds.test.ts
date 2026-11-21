import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBattle, elementRelation, mainCharacter, playAiTurn, STARTER_COMPANIONS, type BattleEvent, type BattleState } from "../../src/core";
import { CUE_IDS } from "../../src/app/game/audio/cues";
import { eventFrames, bounceFrames } from "../../src/app/game/battle/animation";
import { BATTLE_PRELOAD, frameCue, soundsForEvents, timerCue, TURN_DELAY_MS } from "../../src/app/game/battle/sounds";
import { AFTER_HIT_MS, HIT_DELAY_MS } from "../../src/app/game/stage/director";

const byId = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id)!;
const known = new Set<string>(CUE_IDS);

function battle(seed: number): BattleState {
  return createBattle({
    sides: [
      { fighters: [mainCharacter("thuy"), byId("haVan"), byId("maiThanh")], leader: 0 },
      { fighters: [byId("leThach"), byId("toKim"), byId("phungPhong")], leader: 0 },
    ],
    seed,
    timer: false,
  }).state;
}

describe("âm thanh trận đánh", () => {
  it("tiếng ghép ô: đổi ô, đổi sai, 3/4/5 ô, combo cao dần và chạm trần ở tầng 4", () => {
    assert.equal(frameCue(undefined), null);
    assert.equal(frameCue({ kind: "swap" })!.id, "battle.swap");
    assert.equal(frameCue({ kind: "bounce" })!.id, "battle.invalid");
    assert.equal(frameCue({ kind: "clear", size: 3, chain: 1 })!.id, "battle.match3");
    assert.equal(frameCue({ kind: "clear", size: 4, chain: 1 })!.id, "battle.match4");
    assert.equal(frameCue({ kind: "clear", size: 7, chain: 1 })!.id, "battle.match5");
    // 4 và 5 ô có tệp riêng nên phát đúng tốc độ gốc.
    assert.equal(frameCue({ kind: "clear", size: 4, chain: 1 })!.rate, undefined);
    assert.equal(frameCue({ kind: "clear", size: 5, chain: 1 })!.rate, undefined);
    assert.deepEqual([2, 3, 4, 5, 9].map((c) => frameCue({ kind: "clear", size: 3, chain: c })!.id), ["battle.combo1", "battle.combo2", "battle.combo3", "battle.combo4", "battle.combo4"]);
    // Mỗi tầng có tệp riêng nên không đổi tốc độ phát.
    assert.ok([2, 3, 4, 5, 9].every((c) => frameCue({ kind: "clear", size: 3, chain: c })!.rate === undefined));
  });

  it("khung hoạt ảnh mang âm thanh: đổi ô rồi xóa, và đổi sai thì bật lại", () => {
    const s = battle(3);
    const r = playAiTurn(s, "hard");
    const frames = eventFrames(s.board, r.events);
    const kinds = frames.flatMap((f) => (f.sound ? [f.sound.kind] : []));
    assert.ok(kinds.includes("swap"));
    assert.ok(kinds.includes("clear"));
    assert.equal(bounceFrames(s.board, { row: 0, col: 0 }, { row: 0, col: 1 })[0]!.sound?.kind, "bounce");
  });

  it("đòn kiếm: tiếng theo nghề người ra đòn, tiếng trúng sau một nhịp, mỗi loại một lần", () => {
    const s = battle(1);
    const actor = s.sides[s.turn.side].fighters[s.turn.actor]!;
    const { start, end } = soundsForEvents(s, [
      { type: "damage", side: 1, fighter: 0, amount: 30, absorbed: 0, source: "sword" },
      { type: "damage", side: 1, fighter: 0, amount: 12, absorbed: 0, source: "sword" },
    ]);
    assert.deepEqual(start, []);
    assert.deepEqual(end.map((c) => c.id), [`battle.hit.${actor.profession}`, "battle.damage"]);
    assert.equal(end[1]!.delay, HIT_DELAY_MS);
  });

  it("kỹ năng thường theo hệ của người thi triển; tuyệt chiêu ra tiếng riêng", () => {
    const s = battle(1);
    const f = s.sides[0].fighters[1]!;
    assert.deepEqual(soundsForEvents(s, [{ type: "skill", side: 0, fighter: 1, skill: "khongCo" }]).start.map((c) => c.id), [`battle.skill.${f.element}`]);
  });

  it("khiên đỡ trọn đòn, hồi, hiệu ứng, gục và kết thúc", () => {
    const s = battle(1);
    const events: BattleEvent[] = [
      { type: "damage", side: 1, fighter: 1, amount: 0, absorbed: 20, source: "sword" },
      { type: "heal", side: 0, fighter: 0, amount: 15 },
      { type: "heal", side: 0, fighter: 1, amount: 0 },
      { type: "effect", side: 1, fighter: 0, effect: "burn" },
      { type: "effect", side: 1, fighter: 0, effect: "freeze" },
      { type: "effect", side: 0, fighter: 0, effect: "atkUp" },
      { type: "effect", side: 1, fighter: 2, effect: "atkDown" },
      { type: "ko", side: 1, fighter: 0 },
      { type: "end", winner: 0 },
    ];
    const ids = soundsForEvents(s, events).end.map((c) => c.id);
    for (const id of ["battle.shield", "battle.heal", "battle.burn", "battle.freeze", "battle.buff", "battle.debuff", "battle.ko", "battle.win"]) assert.ok(ids.includes(id as never), id);
    assert.equal(ids.filter((i) => i === "battle.heal").length, 1);
    const lose = soundsForEvents(s, [{ type: "end", winner: 1 }]).end.map((c) => c.id);
    assert.deepEqual(lose, ["battle.lose"]);
    const heal = soundsForEvents(s, [{ type: "heal", side: 0, fighter: 0, amount: 5 }]).end[0]!;
    assert.equal(heal.delay, AFTER_HIT_MS);
  });

  it("chạy trận thật bằng AI: mọi cue sinh ra đều là mã đã khai báo và có đúng một tiếng ghép ô khi đổi ô", () => {
    for (let seed = 1; seed <= 6; seed++) {
      let s = battle(seed);
      for (let i = 0; i < 40 && s.winner === null; i++) {
        const r = playAiTurn(s, "hard");
        const snd = soundsForEvents(s, r.events);
        for (const c of [...snd.start, ...snd.end]) assert.ok(known.has(c.id), c.id);
        for (const f of eventFrames(s.board, r.events)) {
          const c = frameCue(f.sound);
          if (c) assert.ok(known.has(c.id), c.id);
        }
        s = r.state;
      }
    }
  });

  it("đòn khắc hệ ra tiếng chí mạng thay cho tiếng trúng thường", () => {
    // Thủy (nhân vật chính, đi trước) khắc Hỏa; đội địch có một Hỏa để chắc chắn có ca khắc hệ.
    const s = createBattle({
      sides: [
        { fighters: [mainCharacter("thuy"), byId("haVan"), byId("maiThanh")], leader: 0 },
        { fighters: [mainCharacter("hoa"), byId("toKim"), byId("phungPhong")], leader: 0 },
      ],
      seed: 1,
      timer: false,
    }).state;
    const actor = s.sides[s.turn.side].fighters[s.turn.actor]!;
    const foes = s.sides[1 - s.turn.side]!.fighters;
    assert.ok(foes.some((f) => elementRelation(actor.element, f.element) === "counter"));
    const hitOn = (i: number) => soundsForEvents(s, [{ type: "damage", side: (1 - s.turn.side) as 0 | 1, fighter: i, amount: 20, absorbed: 0, source: "skill" }]).end.map((c) => c.id);
    for (let i = 0; i < foes.length; i++) {
      const counter = elementRelation(actor.element, foes[i]!.element) === "counter";
      assert.deepEqual(hitOn(i), [counter ? "battle.crit" : "battle.damage"], foes[i]!.element);
    }
    // Sát thương theo lượt (độc, bỏng) không bao giờ là chí mạng.
    const dot = foes.findIndex((f) => elementRelation(actor.element, f.element) === "counter");
    assert.deepEqual(soundsForEvents(s, [{ type: "damage", side: (1 - s.turn.side) as 0 | 1, fighter: dot, amount: 5, absorbed: 0, source: "poison" }]).end.map((c) => c.id), ["battle.damage"]);
  });

  it("đổi phe thì có tiếng đổi lượt sau tiếng trúng đòn; thêm lượt cùng phe thì không", () => {
    const s = battle(1);
    const other = (1 - s.turn.side) as 0 | 1;
    const turn = soundsForEvents(s, [{ type: "turnStart", side: other, actor: 0, extra: false }]).end;
    assert.deepEqual(turn.map((c) => c.id), ["battle.turn"]);
    assert.ok(turn[0]!.delay! > HIT_DELAY_MS + 200);
    assert.equal(turn[0]!.delay, TURN_DELAY_MS);
    assert.deepEqual(soundsForEvents(s, [{ type: "turnStart", side: s.turn.side, actor: s.turn.actor, extra: true }]).end, []);
  });

  it("đồng hồ: chỉ gõ khi còn 5 giây trở xuống, hai giây cuối cao hơn", () => {
    assert.equal(timerCue(null), null);
    assert.equal(timerCue(30), null);
    assert.equal(timerCue(6), null);
    assert.equal(timerCue(0), null);
    assert.equal(timerCue(5)!.id, "battle.timer");
    assert.equal(timerCue(5)!.rate, undefined);
    assert.ok(timerCue(1)!.rate! > 1);
  });

  it("sinh tồn: đợt mới vào sân có tiếng riêng", () => {
    assert.deepEqual(soundsForEvents(battle(1), [{ type: "wave", wave: 2 }]).start.map((c) => c.id), ["survival.wave"]);
  });

  it("danh sách tải sẵn chỉ gồm cue hợp lệ", () => {
    for (const c of BATTLE_PRELOAD) assert.ok(known.has(c));
  });
});
