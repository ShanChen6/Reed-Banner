import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FACTION_MARKS } from "../../src/app/game/campaign/factionMarks";
import { WORLD_STRONGHOLDS } from "../../src/app/game/campaign/worldAtlas";

describe("Cờ nhận diện trên bản đồ Sử ký", () => {
  it("mỗi cứ điểm có một hình vẽ riêng, Hoa Lư có dáng cờ riêng", () => {
    const glyphs = WORLD_STRONGHOLDS.map((s) => FACTION_MARKS[s.id].glyph);
    assert.equal(new Set(glyphs).size, WORLD_STRONGHOLDS.length);
    for (const s of WORLD_STRONGHOLDS)
      assert.equal(
        FACTION_MARKS[s.id].shape === "twin",
        s.id === "hoaLu",
        s.id,
      );
  });
});
