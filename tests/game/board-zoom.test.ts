import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clampZoom, parseZoom, stepZoom, ZOOM_DEFAULT, ZOOM_MAX, ZOOM_MIN, zoomLabel, zoomStorageKey } from "../../src/app/game/board-zoom/zoom";

describe("thu phóng bàn cờ", () => {
  it("kẹp trong 60–160 % và làm tròn nấc 10 %", () => {
    assert.equal(clampZoom(0.2), ZOOM_MIN);
    assert.equal(clampZoom(9), ZOOM_MAX);
    assert.equal(clampZoom(1.234), 1.2);
    assert.equal(clampZoom(1.26), 1.3);
    assert.equal(clampZoom(Number.NaN), ZOOM_DEFAULT);
  });

  it("lên xuống từng nấc, không vượt biên, không lệch số thực", () => {
    assert.equal(stepZoom(1, 1), 1.1);
    assert.equal(stepZoom(0.7, -1), 0.6);
    assert.equal(stepZoom(ZOOM_MIN, -1), ZOOM_MIN);
    assert.equal(stepZoom(ZOOM_MAX, 1), ZOOM_MAX);
    let z = ZOOM_MIN;
    for (let i = 0; i < 10; i++) z = stepZoom(z, 1);
    assert.equal(z, ZOOM_MAX);
  });

  it("đọc giá trị đã lưu, hỏng thì về 100 %", () => {
    assert.equal(parseZoom(null), 1);
    assert.equal(parseZoom(""), 1);
    assert.equal(parseZoom("abc"), 1);
    assert.equal(parseZoom("1.4"), 1.4);
    assert.equal(parseZoom("5"), ZOOM_MAX);
  });

  it("nhãn phần trăm và khóa lưu riêng từng bàn", () => {
    assert.equal(zoomLabel(1.1), "110%");
    assert.equal(zoomLabel(0.6), "60%");
    assert.notEqual(zoomStorageKey("battle"), zoomStorageKey("khai-lo"));
  });
});
