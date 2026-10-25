import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CAMPAIGN_CHAPTERS, STORY_NODES } from "../../src/core";
import {
  MAP_H,
  MAP_LAYOUT,
  MAP_W,
  MIN_GAP,
  UNPLACED_BOX,
  markerKind,
} from "../../src/app/game/campaign/mapLayout";

describe("Bản đồ Chiến dịch V2", () => {
  it("đặt đủ 24 nhiệm vụ và 6 huy hiệu chương trong khung", () => {
    assert.equal(Object.keys(MAP_LAYOUT.markers).length, 24);
    for (const n of STORY_NODES) {
      const [x, y] = MAP_LAYOUT.markers[n.id];
      assert.ok(x >= 0 && x <= MAP_W && y >= 0 && y <= MAP_H, n.id);
    }
    for (const c of CAMPAIGN_CHAPTERS) assert.ok(MAP_LAYOUT.hubs[c.chapter]);
  });

  it("không có hai điểm (nhiệm vụ hoặc huy hiệu) đè nhau", () => {
    const pts = [
      ...Object.entries(MAP_LAYOUT.markers),
      ...Object.entries(MAP_LAYOUT.hubs).map(
        ([k, v]) => [`hub${k}`, v] as const,
      ),
    ];
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const [a, pa] = pts[i]!;
        const [b, pb] = pts[j]!;
        const d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]);
        assert.ok(d >= MIN_GAP - 0.5, `${a}–${b} cách ${d.toFixed(1)}`);
      }
  });

  it("chỉ điểm không định vị được nằm trong ô riêng, điểm khác không lọt vào ô", () => {
    assert.deepEqual([...MAP_LAYOUT.unplaced].sort(), ["M12", "M22"]);
    const inBox = ([x, y]: readonly [number, number]) =>
      x >= UNPLACED_BOX.x &&
      x <= UNPLACED_BOX.x + UNPLACED_BOX.w &&
      y >= UNPLACED_BOX.y &&
      y <= UNPLACED_BOX.y + UNPLACED_BOX.h;
    for (const n of STORY_NODES)
      assert.equal(
        inBox(MAP_LAYOUT.markers[n.id]),
        MAP_LAYOUT.unplaced.includes(n.id),
        n.id,
      );
  });

  it("nhiều nhiệm vụ cùng vùng vẫn tách được (Hoa Lư có 8 nhiệm vụ)", () => {
    const hoaLu = MAP_LAYOUT.regions.find((r) => r.name === "Hoa Lư")!;
    assert.equal(hoaLu.missions.length, 8);
    // Tên vùng ngày nay chỉ là dữ liệu chú thích, không phải tên vùng.
    assert.equal(hoaLu.modernRegion, "Ninh Bình");
    const bh = MAP_LAYOUT.regions.find((r) => r.name === "Bố Hải")!;
    assert.deepEqual(bh.missions, ["M05", "M06", "M07", "M08"]);
  });

  it("hình điểm theo loại nhiệm vụ", () => {
    const kinds = Object.fromEntries(
      STORY_NODES.map((n) => [n.id, markerKind(n)]),
    );
    assert.equal(kinds.M03, "combat");
    assert.equal(kinds.M20, "combat");
    assert.equal(kinds.M06, "diplomacy");
    assert.equal(kinds.M24, "story");
    assert.equal(kinds.M23, "story");
  });
});
