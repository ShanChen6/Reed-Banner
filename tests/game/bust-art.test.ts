import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { BUST_IDS, bustUrl, portraitUrl, STAGE_BACKDROP_ELEMENTS, stageBackdropUrl } from "../../src/app/game/art/portrait-data";

describe("Chân dung bán thân (bust.webp)", () => {
  it("mỗi nhân vật trong BUST_IDS có chân dung cũ làm dự phòng và tệp bust.webp tồn tại", () => {
    for (const id of BUST_IDS) {
      assert.ok(portraitUrl(id), `${id} chưa có portrait.webp để dự phòng`);
      const url = bustUrl(id);
      assert.ok(url?.endsWith("/bust.webp"), `${id}: đường dẫn bust`);
      assert.ok(existsSync(`public${url}`), `thiếu public${url}`);
    }
  });

  it("nhân vật chưa có bust thì bustUrl là null", () => {
    assert.equal(bustUrl("khongCoNguoiNay"), null);
    assert.equal(bustUrl("leThach"), null);
  });
});

describe("Tranh nền sân khấu theo hệ", () => {
  it("mỗi hệ trong STAGE_BACKDROP_ELEMENTS có tệp WebP", () => {
    for (const el of STAGE_BACKDROP_ELEMENTS) {
      const url = stageBackdropUrl(el);
      assert.ok(url, el);
      assert.ok(existsSync(`public${url}`), `thiếu public${url}`);
    }
  });

  it("đủ tranh cho cả 7 hệ; id lạ thì không có đường dẫn", () => {
    for (const el of ["kim", "moc", "thuy", "hoa", "tho", "loi", "phong"]) assert.ok(STAGE_BACKDROP_ELEMENTS.has(el), el);
    assert.equal(stageBackdropUrl("khongCo"), null);
  });
});
