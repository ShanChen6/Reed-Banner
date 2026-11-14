import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MODE_TEXT } from "../../src/app/game/modeInfo";
import { GUIDE_SCENES, MODE_GUIDES } from "../../src/app/game/modeGuides";

const lines = Object.entries(MODE_GUIDES).flatMap(([scene, g]) =>
  [g.goal, ...g.steps, ...g.rules, ...g.rewards, ...g.tips].map((text) => ({ scene, text })),
);

describe("Thẻ Hướng dẫn của các chế độ", () => {
  it("có đủ mười hai chế độ ở thẻ Chiến Trường, không thừa không thiếu", () => {
    assert.deepEqual([...GUIDE_SCENES].sort(), Object.keys(MODE_TEXT).sort());
    assert.deepEqual(Object.keys(MODE_GUIDES).sort(), [...GUIDE_SCENES].sort());
  });

  it("mỗi chế độ có mục tiêu, cách chơi, luật và thưởng", () => {
    for (const scene of GUIDE_SCENES) {
      const g = MODE_GUIDES[scene];
      assert.ok(g.goal.length > 20, `${scene}: mục tiêu`);
      assert.ok(g.steps.length >= 2, `${scene}: cách chơi`);
      assert.ok(g.rules.length >= 2, `${scene}: luật`);
      assert.ok(g.rewards.length >= 1, `${scene}: thưởng`);
    }
  });

  it("câu đầy đủ kết thúc bằng dấu chấm và không lặp trong cùng chế độ", () => {
    for (const { scene, text } of lines) assert.match(text, /\.$/, `${scene}: ${text.slice(0, 50)}`);
    for (const scene of GUIDE_SCENES) {
      const g = MODE_GUIDES[scene];
      const all = [g.goal, ...g.steps, ...g.rules, ...g.rewards, ...g.tips];
      assert.equal(new Set(all).size, all.length, `${scene}: câu lặp`);
    }
  });

  it("văn phong: gọi người chơi là bạn, không dùng chữ Anh và ký tự ba chấm rời", () => {
    for (const { scene, text } of lines) {
      assert.doesNotMatch(text, /người chơi/i, `${scene}: ${text.slice(0, 50)}`);
      assert.doesNotMatch(text, /(?<![\p{L}\d])(offline|online|server|HP|ATK|DEF|Tianwu|boss)(?![\p{L}\d])/iu, `${scene}: ${text.slice(0, 50)}`);
      assert.doesNotMatch(text, /\.\.\.|"/, `${scene}: ${text.slice(0, 50)}`);
    }
  });
});
