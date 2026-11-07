import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONTACT_VARIANTS, DEFAULT_CONTACT_VARIANT, parseContactVariant } from "../../src/app/game/contactVariant";

describe("chọn phương án khối liên hệ", () => {
  it("a/b/c và tên đầy đủ, không phân biệt hoa thường", () => {
    assert.equal(parseContactVariant("a"), "flags");
    assert.equal(parseContactVariant("B"), "scroll");
    assert.equal(parseContactVariant(" c "), "tablets");
    for (const v of CONTACT_VARIANTS) assert.equal(parseContactVariant(v), v);
  });

  it("thiếu hoặc sai thì dùng phương án mặc định (giá cờ lau)", () => {
    assert.equal(DEFAULT_CONTACT_VARIANT, "flags");
    for (const v of [null, undefined, "", "d", "xyz"]) assert.equal(parseContactVariant(v as string | null | undefined), "flags");
  });
});
