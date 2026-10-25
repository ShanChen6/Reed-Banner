import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import {
  CAMPAIGN_CHAPTERS,
  CAMPAIGN_FACTION_IDS,
  factionResolutionOf,
} from "../../src/core";
import {
  PLACED_STRONGHOLDS,
  UNANCHORED_MISSIONS,
  UNPLACED_STRONGHOLDS,
  WORLD_H,
  WORLD_STRONGHOLDS,
  WORLD_W,
  chapterStrongholds,
  chapterThumbUrl,
  strongholdOfMission,
} from "../../src/app/game/campaign/worldAtlas";

describe("Bản đồ Sử ký toàn cảnh", () => {
  it("13 điểm: Hoa Lư là đầu não, 12 cứ điểm đúng 12 sứ quân", () => {
    assert.equal(WORLD_STRONGHOLDS.length, 13);
    const hq = WORLD_STRONGHOLDS.filter((s) => s.faction === null);
    assert.deepEqual(
      hq.map((s) => s.place),
      ["Hoa Lư"],
    );
    assert.deepEqual(
      WORLD_STRONGHOLDS.flatMap((s) => (s.faction ? [s.faction] : [])).sort(),
      [...CAMPAIGN_FACTION_IDS].sort(),
    );
  });

  it("nhiệm vụ kết cục của mỗi sứ quân nằm ở cứ điểm của họ", () => {
    for (const s of WORLD_STRONGHOLDS) {
      if (!s.faction) continue;
      const r = factionResolutionOf(s.faction)!;
      assert.ok(s.missions.includes(r.mission), `${s.faction} ${r.mission}`);
    }
    assert.deepEqual(strongholdOfMission("M06")?.missions, [
      "M05",
      "M06",
      "M07",
      "M08",
    ]);
    assert.deepEqual(strongholdOfMission("M24")?.missions, [
      "M01",
      "M02",
      "M03",
      "M04",
      "M09",
      "M10",
      "M23",
      "M24",
    ]);
  });

  it("mỗi nhiệm vụ thuộc nhiều nhất một điểm; chỉ M22 không gắn đất", () => {
    const all = WORLD_STRONGHOLDS.flatMap((s) => s.missions);
    assert.equal(new Set(all).size, all.length);
    assert.deepEqual(UNANCHORED_MISSIONS, ["M22"]);
  });

  it("Bình Kiều không có tọa độ, các điểm khác nằm trong khung và không sát nhau", () => {
    assert.deepEqual(
      UNPLACED_STRONGHOLDS.map((s) => [s.faction, s.place, s.certainty]),
      [["ngoXuongXi", "Bình Kiều", "disputed"]],
    );
    const margin = 90;
    for (const s of PLACED_STRONGHOLDS) {
      const [x, y] = s.at!;
      assert.ok(x >= margin && x <= WORLD_W - margin, `${s.place} x ${x}`);
      assert.ok(y >= margin && y <= WORLD_H - margin, `${s.place} y ${y}`);
    }
    for (let i = 0; i < PLACED_STRONGHOLDS.length; i++)
      for (let j = i + 1; j < PLACED_STRONGHOLDS.length; j++) {
        const a = PLACED_STRONGHOLDS[i]!;
        const b = PLACED_STRONGHOLDS[j]!;
        const d = Math.hypot(a.at![0] - b.at![0], a.at![1] - b.at![1]);
        assert.ok(d >= 120, `${a.place}–${b.place} cách ${d.toFixed(0)}`);
      }
  });

  it("chọn chương chỉ làm nổi các điểm có nhiệm vụ của chương", () => {
    const ch2 = CAMPAIGN_CHAPTERS.find((c) => c.chapter === 2)!;
    assert.deepEqual(chapterStrongholds(ch2.missions), ["tranLam"]);
    const ch3 = CAMPAIGN_CHAPTERS.find((c) => c.chapter === 3)!;
    assert.deepEqual(chapterStrongholds(ch3.missions), [
      "hoaLu",
      "phamBachHo",
      "ngoXuongXi",
    ]);
    for (const c of CAMPAIGN_CHAPTERS)
      assert.ok(existsSync(`public${chapterThumbUrl(c.chapter)}`), c.title);
  });
});
