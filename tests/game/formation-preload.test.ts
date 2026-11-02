import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { RULESETS } from "../../src/core/binh-phap";
import { portraitUrlsFor } from "../../src/app/game/formation/preload";

describe("tải sẵn chân dung Trận Đồ", () => {
  it("liệt kê đủ ảnh chân dung của bộ luật và ảnh có thật trong public", () => {
    for (const r of RULESETS) {
      const urls = portraitUrlsFor(r);
      assert.ok(urls.length > 0, r.id);
      assert.equal(new Set(urls).size, urls.length, `${r.id}: không trùng`);
      for (const u of urls) assert.ok(existsSync(`public${u}`), `${r.id}: thiếu ${u}`);
    }
  });
  it("Đại trận (nhiều nghề hệ nhất) có nhiều ảnh hơn Hướng dẫn", () => {
    const by = (id: string) => portraitUrlsFor(RULESETS.find((r) => r.id === id)!).length;
    assert.ok(by("dai-tran") > by("huong-dan"));
  });
});
