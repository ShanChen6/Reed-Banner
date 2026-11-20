import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { filterHeroes } from "../../src/app/game/arena/HeroFilterBar";
import LeaderBuildPicker from "../../src/app/game/arena/LeaderBuildPicker";

const heroes = [
  { id: "haVan", name: "Hà Vân", element: "kim", profession: "phapSu" },
  { id: "leThach", name: "Lê Thạch", element: "tho", profession: "binhLinh" },
  { id: "dinhBoLinh", name: "Đinh Bộ Lĩnh", element: "moc", profession: "tuongSi" },
] as const;

describe("lưới tướng Đấu người", () => {
  it("tìm tên không dấu, lọc theo hệ và nghề", () => {
    assert.deepEqual(filterHeroes(heroes, "ha van", "all", "all").map((h) => h.id), ["haVan"]);
    assert.deepEqual(filterHeroes(heroes, "dinh", "all", "all").map((h) => h.id), ["dinhBoLinh"]);
    assert.deepEqual(filterHeroes(heroes, "", "tho", "all").map((h) => h.id), ["leThach"]);
    assert.deepEqual(filterHeroes(heroes, "", "all", "phapSu").map((h) => h.id), ["haVan"]);
    assert.deepEqual(filterHeroes(heroes, "", "kim", "binhLinh"), []);
  });

  it("chọn nghề và hệ Đinh Bộ Lĩnh bằng chip, mục bị cấm không bấm được", () => {
    const html = renderToStaticMarkup(
      createElement(LeaderBuildPicker, {
        element: "moc",
        profession: "tuongSi",
        onChange: () => {},
        bannedElements: ["hoa"],
        bannedProfessions: ["ySu"],
      }),
    );
    assert.match(html, /aria-label="Nghề của Đinh Bộ Lĩnh"/);
    assert.match(html, /aria-label="Hệ của Đinh Bộ Lĩnh"/);
    assert.match(html, /aria-pressed="true"[^>]*>.*?Tướng sĩ/);
    assert.match(html, /disabled=""[^>]*title="Hệ này đã bị cấm"/);
    assert.match(html, /disabled=""[^>]*title="Nghề này đã bị cấm"/);
  });
});
