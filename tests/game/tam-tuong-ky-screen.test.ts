// LT-03: logic và dựng màn Tầm Tướng Ký (docs/05-ui-ux/screens/tam-tuong-ky.md).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SLICE_PACK, buildCatalog, combineNormal, initialDiscovery, makeableRecipes, type DiscoveryState } from "../../src/core/tam-tuong-ky";
import {
  EMPTY_SLOTS,
  clearSlot,
  foldVi,
  hintText,
  ledger,
  libraryGroups,
  libraryNodes,
  noticeFor,
  pickInto,
  swapSlots,
} from "../../src/app/game/tam-tuong-ky/altar";
import TamTuongKyScreen from "../../src/app/game/tam-tuong-ky/TamTuongKyScreen";
import { SCENE_SLUG, SCENE_TITLE, sceneOfSlug } from "../../src/app/game/scene";
import { tamTuongKyEnabled } from "../../src/server/featureFlags";
import { MemoryProfileStore } from "../../src/server/profiles";
import { getTamTuongKy } from "../../src/server/tamTuongKy";
import { tutorialTip } from "../../src/app/game/tam-tuong-ky/altar";

const catalog = buildCatalog(SLICE_PACK);
const HERO_NAMES = ["Nguyễn Bặc", "Lê Hoàn", "Đinh Ngọc"];
/** Màn chơi chạy Gói 1 (ACTIVE_PACK): 12 tướng. */
const PACK_1_NAMES = [...HERO_NAMES, "Đinh Điền", "Lưu Cơ", "Trịnh Tú", "Đinh Liễn", "Phạm Bạch Hổ", "Đỗ Cảnh Thạc", "Trần Lãm", "Ngô Nhật Khánh", "Trần Vũ Phong"];

function discoverAll(): DiscoveryState {
  let s = initialDiscovery(catalog);
  for (let more = true; more; ) {
    more = false;
    for (const r of makeableRecipes(catalog, s)) {
      s = combineNormal(catalog, s, r.first, r.second).next;
      more = true;
    }
  }
  return s;
}

describe("Đài Hợp Nguyên: chọn ô", () => {
  it("bấm lần lượt điền ô trước rồi ô sau; đủ hai ô thì thay ô sau", () => {
    let s = pickInto(EMPTY_SLOTS, "elt.moc");
    assert.deepEqual(s, ["elt.moc", null]);
    s = pickInto(s, "elt.thuy");
    assert.deepEqual(s, ["elt.moc", "elt.thuy"]);
    assert.deepEqual(pickInto(s, "elt.kim"), ["elt.moc", "elt.kim"]);
  });

  it("chọn cùng yếu tố hai lần (A+A)", () => {
    assert.deepEqual(pickInto(pickInto(EMPTY_SLOTS, "elt.moc"), "elt.moc"), ["elt.moc", "elt.moc"]);
  });

  it("bỏ một ô không ghép thêm; đổi chỗ đảo thứ tự", () => {
    assert.deepEqual(clearSlot(["elt.moc", "elt.thuy"], 0), [null, "elt.thuy"]);
    assert.deepEqual(pickInto([null, "elt.thuy"], "elt.kim"), ["elt.kim", "elt.thuy"]);
    assert.deepEqual(swapSlots(["elt.moc", "elt.thuy"]), ["elt.thuy", "elt.moc"]);
  });
});

describe("Vạn Vật Lục", () => {
  it("mới vào chỉ có 7 nguyên tố", () => {
    assert.deepEqual(libraryNodes(catalog, initialDiscovery(catalog), "", null).map((n) => n.id), SLICE_PACK.nodes.filter((n) => n.kind === "element").map((n) => n.id));
  });

  it("tìm không dấu: “thap dao”, “dai dao” ra đúng yếu tố; không liệt kê tướng", () => {
    const all = discoverAll();
    assert.deepEqual(libraryNodes(catalog, all, "thap dao", null).map((n) => n.nameVi), ["Thập đạo"]);
    assert.ok(libraryNodes(catalog, all, "Đại đao", null).some((n) => n.nameVi === "Đại đao"));
    assert.equal(foldVi("Đường xa"), "duong xa");
    assert.equal(libraryNodes(catalog, all, "", null).some((n) => n.kind === "character"), false);
  });

  it("lọc nhóm giữ đúng nhóm và có tên tiếng Việt", () => {
    const all = discoverAll();
    const groups = libraryGroups(catalog, all);
    assert.ok(groups.some((g) => g.id === "binh-khi" && g.name === "Binh khí"));
    assert.ok(libraryNodes(catalog, all, "", "binh-khi").every((n) => n.hintGroup === "binh-khi"));
  });
});

describe("Thông báo và gợi ý", () => {
  it("mỗi kết quả có lời riêng", () => {
    const s = initialDiscovery(catalog);
    assert.match(noticeFor(catalog, combineNormal(catalog, s, "elt.moc", "elt.thuy")).text, /Khám phá mới: Lau sậy/);
    const known = combineNormal(catalog, s, "elt.moc", "elt.thuy").next;
    assert.match(noticeFor(catalog, combineNormal(catalog, known, "elt.moc", "elt.thuy")).text, /Đã biết/);
    assert.match(noticeFor(catalog, combineNormal(catalog, s, "elt.loi", "elt.loi")).text, /Chưa tìm được mối liên hệ/);
    assert.equal(noticeFor(catalog, combineNormal(catalog, s, "mat.reed", "elt.kim")).tone, "invalid");
  });

  it("ghép ra tướng thì báo tên tướng đó", () => {
    const all = discoverAll();
    const s: DiscoveryState = {
      ...all,
      discoveredNodeIds: all.discoveredNodeIds.filter((id) => id !== "hero.leHoan"),
      discoveredRecipeIds: all.discoveredRecipeIds.filter((id) => id !== "r.leHoan"),
    };
    const n = noticeFor(catalog, combineNormal(catalog, s, "know.tenCircuits", "know.warManual"));
    assert.equal(n.tone, "hero");
    assert.match(n.text, /Lê Hoàn/);
  });

  it("lời gợi ý không chứa tên tướng hay tên node chưa mở", () => {
    const text = hintText({ level: 2, hintGroup: "co-hieu", ingredientId: "mat.cloth" }) + hintText({ level: 1, hintGroup: "ngoc" });
    for (const name of HERO_NAMES) assert.doesNotMatch(text, new RegExp(name));
  });
});

describe("Tướng Lục", () => {
  it("bóng mờ đủ số tướng, chưa tìm không có tên hay characterId", () => {
    const entries = ledger(catalog, initialDiscovery(catalog));
    assert.equal(entries.length, 3);
    for (const e of entries) {
      assert.equal(e.found, false);
      assert.deepEqual(Object.keys(e).sort(), ["found", "nodeId", "tier"]);
    }
  });

  it("tìm thấy thì có nghề/hệ từ roster và vật biểu trưng", () => {
    const e = ledger(catalog, discoverAll()).find((x) => x.nodeId === "hero.nguyenBac");
    assert.ok(e && e.found);
    assert.deepEqual([e.info.profession, e.info.element, e.tier], ["tuongSi", "hoa", "lichSu"]);
    assert.deepEqual(e.symbols, ["Đại đao buộc vải đỏ", "Hỏa kỳ"]);
  });
});

describe("Màn chơi", () => {
  it("chưa có dữ liệu server thì hiện chờ, không vẽ sổ", () => {
    assert.match(renderToStaticMarkup(createElement(TamTuongKyScreen)), /Đang mở Tướng Lục/);
  });

  it("dựng lúc mới vào: có ba vùng, phiếu, nút mở lượt, không lộ tên tướng, không có chữ thưởng/chiêu mộ", async () => {
    const r = await getTamTuongKy({ profiles: new MemoryProfileStore(), now: Date.parse("2026-11-04T05:00:00Z"), enabled: true, isSignedIn: async () => true }, "acc-1");
    assert.ok(r.ok);
    const html = renderToStaticMarkup(createElement(TamTuongKyScreen, { initial: r.view }));
    assert.match(html, /Phiếu: <strong[^>]*>3<\/strong>\/10/);
    assert.match(html, /Mở lượt mới · 1 phiếu/);
    assert.match(html, /Mẹo: chọn Mộc vào ô trước và Mộc vào ô sau/);
    for (const t of ["Vạn Vật Lục", "Đài Hợp Nguyên", "Tướng Lục", "Ô trước", "Ô sau", "aria-live"]) assert.match(html, new RegExp(t));
    assert.equal(tutorialTip(r.view.discovery) !== null, true);
    for (const name of PACK_1_NAMES) assert.doesNotMatch(html, new RegExp(name));
    assert.match(html, /Công thức biểu trưng của trò chơi, không phải diễn giải sử học/);
    for (const bad of ["Nhận tướng", "Chiêu mộ", "vàng"]) assert.doesNotMatch(html, new RegExp(bad));
    assert.equal((html.match(/Tướng chưa tìm thấy/g) ?? []).length, 12);
  });

  it("có phân cảnh /game/tam-tuong-ky; cờ mặc định tắt, chỉ chuỗi true mới bật", () => {
    assert.equal(sceneOfSlug("tam-tuong-ky"), "TAM_TUONG_KY");
    assert.equal(SCENE_SLUG.TAM_TUONG_KY, "tam-tuong-ky");
    assert.equal(SCENE_TITLE.TAM_TUONG_KY, "Tầm Tướng Ký");
    assert.equal(tamTuongKyEnabled({}), false);
    assert.equal(tamTuongKyEnabled({ TAM_TUONG_KY_ENABLED: "1" }), false);
    assert.equal(tamTuongKyEnabled({ TAM_TUONG_KY_ENABLED: "true" }), true);
  });
});
