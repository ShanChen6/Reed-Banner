import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBattle,
  mainCharacter,
  legacyElementSkills,
  playAiTurn,
  STARTER_COMPANIONS,
  type BattleEvent,
  type BattleState,
} from "../../src/core";
import {
  AFTER_HIT_MS,
  createCueBus,
  HIT_DELAY_MS,
  stageCues,
  VICTORY_DELAY_MS,
} from "../../src/app/game/stage/director";

const byId = (id: string) => STARTER_COMPANIONS.find((c) => c.id === id)!;

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

describe("đạo diễn trận", () => {
  it("đòn kiếm: người hành động vung đòn, bên kia trúng đòn sau một nhịp, mỗi người một lần", () => {
    const s = battle(1);
    const events: BattleEvent[] = [
      { type: "damage", side: 1, fighter: 0, amount: 30, absorbed: 0, source: "sword" },
      { type: "damage", side: 1, fighter: 0, amount: 12, absorbed: 0, source: "sword" },
    ];
    const { start, end } = stageCues(s, events);
    assert.deepEqual(start, []);
    assert.deepEqual(end, [
      { side: s.turn.side, fighter: s.turn.actor, kind: "attack", delay: 0 },
      { side: 1, fighter: 0, kind: "hit", delay: HIT_DELAY_MS },
    ]);
  });

  it("kỹ năng: người thi triển ra động tác ngay, đổi luôn người ra đòn kiếm sau đó", () => {
    const s = battle(1);
    const { start, end } = stageCues(s, [
      { type: "skill", side: 0, fighter: 2, skill: "x" },
      { type: "heal", side: 0, fighter: 1, amount: 40 },
      { type: "heal", side: 0, fighter: 0, amount: 0 },
      { type: "damage", side: 1, fighter: 1, amount: 20, absorbed: 0, source: "sword" },
    ]);
    assert.deepEqual(start, [{ side: 0, fighter: 2, kind: "cast", delay: 0 }]);
    assert.deepEqual(end, [
      { side: 0, fighter: 1, kind: "heal", delay: 0 },
      { side: 0, fighter: 2, kind: "attack", delay: 0 },
      { side: 1, fighter: 1, kind: "hit", delay: HIT_DELAY_MS },
    ]);
  });

  it("tuyệt chiêu và chiêu riêng (ô 5) ra động tác lớn, kỹ năng thường vẫn là thi triển", () => {
    const s = battle(1);
    const big = stageCues(s, [{ type: "skill", side: 0, fighter: 1, skill: "hoaVuLieuNguyen" }]);
    assert.equal(big.start[0]?.kind, "ultimate");
    const main5 = legacyElementSkills("moc").find((d) => d.slot === 5)!;
    assert.equal(stageCues(s, [{ type: "skill", side: 0, fighter: 0, skill: main5.id }]).start[0]?.kind, "ultimate");
    const main1 = legacyElementSkills("moc").find((d) => d.slot === 1)!;
    assert.equal(stageCues(s, [{ type: "skill", side: 0, fighter: 0, skill: main1.id }]).start[0]?.kind, "cast");
  });

  it("lượt mới đổi phe ra đòn; bỏng không có người vung đòn", () => {
    const s = battle(1);
    const { end } = stageCues(s, [
      { type: "turnStart", side: 1, actor: 2, extra: false },
      { type: "damage", side: 1, fighter: 2, amount: 5, absorbed: 0, source: "burn" },
      { type: "damage", side: 0, fighter: 0, amount: 25, absorbed: 0, source: "sword" },
    ]);
    assert.deepEqual(end, [
      { side: 1, fighter: 2, kind: "hit", delay: 0 },
      { side: 1, fighter: 2, kind: "attack", delay: 0 },
      { side: 0, fighter: 0, kind: "hit", delay: HIT_DELAY_MS },
    ]);
  });

  it("khiên hút trọn đòn thì đỡ, còn lọt máu thì trúng đòn", () => {
    const s = battle(1);
    const { end } = stageCues(s, [
      { type: "damage", side: 1, fighter: 0, amount: 0, absorbed: 30, source: "skill" },
      { type: "damage", side: 1, fighter: 1, amount: 8, absorbed: 22, source: "skill" },
    ]);
    assert.deepEqual(end.map((c) => c.kind), ["guard", "hit"]);
  });

  it("hiệu ứng: khiên là đỡ, tăng là buff, giảm là debuff; phát sau cú trúng nếu vừa bị đánh", () => {
    const s = battle(1);
    const { end } = stageCues(s, [
      { type: "effect", side: 0, fighter: 0, effect: "shield" },
      { type: "effect", side: 0, fighter: 1, effect: "atkUp" },
      { type: "damage", side: 1, fighter: 2, amount: 10, absorbed: 0, source: "skill" },
      { type: "effect", side: 1, fighter: 2, effect: "burn" },
      { type: "effect", side: 1, fighter: 1, effect: "freezeImmune" },
    ]);
    assert.deepEqual(end, [
      { side: 0, fighter: 0, kind: "guard", delay: 0 },
      { side: 0, fighter: 1, kind: "buff", delay: 0 },
      { side: 1, fighter: 2, kind: "hit", delay: 0 },
      { side: 1, fighter: 2, kind: "debuff", delay: AFTER_HIT_MS },
    ]);
  });

  it("hết trận: người còn đứng của phe thắng ăn mừng, người vừa gục thì không", () => {
    const s = battle(1);
    const { end } = stageCues(s, [
      { type: "damage", side: 0, fighter: 2, amount: 999, absorbed: 0, source: "skill" },
      { type: "ko", side: 0, fighter: 2 },
      { type: "end", winner: 0 },
    ]);
    assert.deepEqual(
      end.filter((c) => c.kind === "victory"),
      [
        { side: 0, fighter: 0, kind: "victory", delay: VICTORY_DELAY_MS },
        { side: 0, fighter: 1, kind: "victory", delay: VICTORY_DELAY_MS },
      ],
    );
  });

  it("đợt mới ở Sinh tồn: phe mình vào thế", () => {
    const s = battle(1);
    const { end } = stageCues(s, [{ type: "wave", wave: 2 }]);
    assert.deepEqual(end.map((c) => `${c.side}:${c.fighter}:${c.kind}`), ["0:0:ready", "0:1:ready", "0:2:ready"]);
  });

  it("cả trận AI: mọi động tác trỏ tới nhân vật có thật", () => {
    let s = battle(9);
    let cues = 0;
    for (let turn = 0; turn < 60 && s.winner === null; turn++) {
      const r = playAiTurn(s, "hard");
      const { start, end } = stageCues(s, r.events);
      for (const c of [...start, ...end]) {
        assert.ok(s.sides[c.side].fighters[c.fighter], `${c.side}:${c.fighter}`);
        cues++;
      }
      s = r.state;
    }
    assert.ok(cues > 30);
  });

  it("kênh động tác: bỏ lô rỗng, gỡ người nghe được", () => {
    const bus = createCueBus();
    const got: number[] = [];
    const off = bus.on((c) => got.push(c.length));
    bus.emit([]);
    bus.emit([{ side: 0, fighter: 0, kind: "hit", delay: 0 }]);
    off();
    bus.emit([{ side: 0, fighter: 0, kind: "hit", delay: 0 }]);
    assert.deepEqual(got, [1]);
  });
});
