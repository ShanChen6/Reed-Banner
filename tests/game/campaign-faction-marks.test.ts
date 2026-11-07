import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync } from "node:fs";
import {
  FACTION_MARKS,
  FLAG_ART,
} from "../../src/app/game/campaign/factionMarks";
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

  it("mỗi sứ quân có tranh ký hiệu thì tệp WebP tồn tại, Hoa Lư giữ nét vẽ mã", () => {
    assert.equal(FLAG_ART.has("hoaLu"), false);
    for (const id of FLAG_ART)
      assert.ok(
        existsSync(`public/art/flags/co-${id}.webp`),
        `thiếu public/art/flags/co-${id}.webp`,
      );
    for (const s of WORLD_STRONGHOLDS)
      if (s.id !== "hoaLu")
        assert.ok(FLAG_ART.has(s.id), `${s.id} chưa có tranh ký hiệu`);
  });
});
