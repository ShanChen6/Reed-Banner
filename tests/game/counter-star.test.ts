import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { counteredFoes, counterText } from "../../src/app/game/art/CounterStar";

describe("Ngôi sao khắc chế trước trận", () => {
  const foes = [
    { name: "Tiết Dạ", element: "hoa" },
    { name: "Nhan Trúc", element: "moc" },
    { name: "Tống Tấn", element: "loi" },
  ] as const;

  it("chỉ đánh dấu đối thủ mà hệ đó khắc", () => {
    assert.deepEqual(counteredFoes("thuy", foes).map((f) => f.name), ["Tiết Dạ"], "Thủy khắc Hỏa");
    assert.deepEqual(counteredFoes("kim", foes).map((f) => f.name), ["Nhan Trúc"], "Kim khắc Mộc");
    assert.deepEqual(counteredFoes("tho", foes).map((f) => f.name), ["Tống Tấn"], "Thổ khắc Lôi");
    assert.deepEqual(counteredFoes("hoa", foes), [], "Hỏa không khắc ai trong ba người này");
  });

  it("bỏ qua đối thủ chưa rõ hệ và ghi lời giải thích", () => {
    assert.deepEqual(counteredFoes("thuy", [{ name: "?", element: null }]), []);
    assert.equal(counterText(counteredFoes("thuy", foes)), "Khắc Tiết Dạ (Hỏa)");
  });
});
