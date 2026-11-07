import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SOCIAL_PLATFORMS } from "../../src/app/game/footerLinks";
import { SOCIAL_ICON_PATHS } from "../../src/app/game/socialIcons";
import { linkPath, ORBIT_CENTER, slotAngles, SOCIAL_BLURB, splitRings } from "../../src/app/game/socialOrbit";

describe("quỹ đạo mạng xã hội", () => {
  it("ít nền tảng thì một vòng, nhiều thì hai vòng quay ngược chiều và đủ số biểu tượng", () => {
    assert.deepEqual(splitRings(0), []);
    assert.equal(splitRings(3).length, 1);
    for (const n of [4, 5, 6, 7, 8, 10]) {
      const rings = splitRings(n);
      assert.equal(rings.reduce((s, r) => s + r.count, 0), n);
      if (n > 4) {
        assert.equal(rings.length, 2);
        assert.notEqual(rings[0]!.reverse, rings[1]!.reverse);
        assert.ok(rings[0]!.r < rings[1]!.r);
      }
    }
    // bảy nền tảng hiện tại: 3 trong, 4 ngoài
    assert.deepEqual(splitRings(7).map((r) => r.count), [3, 4]);
  });

  it("các biểu tượng chia đều trên vòng", () => {
    assert.deepEqual(slotAngles(4, 20), [20, 110, 200, 290]);
    assert.deepEqual(slotAngles(0, 0), []);
  });

  it("đường dữ liệu kết thúc đúng tâm quỹ đạo", () => {
    const d = linkPath(100, 80);
    assert.ok(d.startsWith("M100.0 80.0 Q"));
    assert.ok(d.endsWith(`${ORBIT_CENTER.x} ${ORBIT_CENTER.y}`));
  });

  it("mọi nền tảng có chú thích; nền tảng có biểu tượng vẽ sẵn thì đường vẽ không rỗng", () => {
    for (const p of SOCIAL_PLATFORMS) assert.ok(SOCIAL_BLURB[p].length > 0, p);
    for (const p of ["Facebook", "TikTok", "LinkedIn", "GitHub", "Instagram", "Discord", "X"]) assert.ok((SOCIAL_ICON_PATHS[p] ?? "").startsWith("M"), p);
  });
});
