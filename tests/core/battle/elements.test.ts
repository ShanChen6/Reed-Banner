import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ELEMENTS, elementMultiplier, elementRelation } from "../../../src/core";

describe("nguyên tố", () => {
  it("khắc, bị khắc, tương sinh theo bảng", () => {
    assert.equal(elementRelation("kim", "moc"), "counter");
    assert.equal(elementRelation("moc", "kim"), "countered");
    assert.equal(elementRelation("kim", "thuy"), "generate");
    assert.equal(elementRelation("moc", "phong"), "counter");
    assert.equal(elementRelation("phong", "tho"), "counter");
    assert.equal(elementRelation("phong", "hoa"), "generate");
    assert.equal(elementRelation("loi", "thuy"), "counter");
    assert.equal(elementRelation("tho", "loi"), "counter");
    assert.equal(elementRelation("loi", "kim"), "neutral");
  });

  it("hệ số sát thương", () => {
    assert.equal(elementMultiplier("hoa", "kim"), 1.25);
    assert.equal(elementMultiplier("hoa", "tho"), 1.1);
    assert.equal(elementMultiplier("hoa", "thuy"), 0.75);
    assert.equal(elementMultiplier("hoa", "hoa"), 1);
  });

  it("Lôi và Phong mỗi hệ khắc đúng 1, bị đúng 1 nguyên tố khắc", () => {
    for (const e of ["loi", "phong"] as const) {
      assert.equal(ELEMENTS.filter((t) => elementRelation(e, t) === "counter").length, 1);
      assert.equal(ELEMENTS.filter((t) => elementRelation(e, t) === "countered").length, 1);
    }
  });
});
