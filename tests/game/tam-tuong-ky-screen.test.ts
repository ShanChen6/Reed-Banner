// LT-03: logic và dựng màn Tầm Tướng Ký (docs/05-ui-ux/screens/tam-tuong-ky.md).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SLICE_PACK, buildCatalog, catalogForPack, combineNormal, initialDiscovery, makeableRecipes, type DiscoveryState } from "../../src/core/tam-tuong-ky";
import {
  EMPTY_SLOTS,
  clearSlot,
  foldVi,
  hintText,
  LEDGER_GROUPS,
  altarResult,
  defaultLedgerGroup,
  ledger,
  ledgerGroup,
  ledgerGroups,
  libraryGroups,
  libraryNodes,
  noticeFor,
  pickInto,
  swapSlots,
} from "../../src/app/game/tam-tuong-ky/altar";
import TamTuongKyScreen from "../../src/app/game/tam-tuong-ky/TamTuongKyScreen";
import { SCENE_SLUG, SCENE_TITLE, sceneOfSlug } from "../../src/app/game/scene";
import { tamTuongKyEnabled, tamTuongKyFlagStatus, tamTuongKyRankedEnabled } from "../../src/server/featureFlags";
import { MemoryProfileStore } from "../../src/server/profiles";
import { getTamTuongKy, getTamTuongKyRanked } from "../../src/server/tamTuongKy";
import { MemorySeasonStore } from "../../src/server/seasons";
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
    assert.ok(libraryNodes(catalog, all, "binh khi", null).some((n) => n.nameVi === "Binh khí"));
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
    const n = noticeFor(catalog, combineNormal(catalog, s, "role.quanSuLoi", "know.tenCircuits"));
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
      // Nhóm Tướng Lục (mục 7.2) lộ được vì nhóm nào cũng có từ 2 người; không có tên hay characterId.
      assert.deepEqual(Object.keys(e).sort(), ["found", "group", "nodeId", "pack", "tier"]);
    }
  });

  it("nhóm theo quan hệ: Cờ lau Hoa Lư 7, Thập nhị sứ quân 12, Kỳ nhân 2, tám nghề × 7", () => {
    const groups = ledgerGroups(ledger(catalogForPack("pack-1-2-3"), { discoveredNodeIds: [], discoveredRecipeIds: [] } as unknown as DiscoveryState));
    assert.deepEqual(
      groups.map((g) => [g.name, g.entries.length]),
      [["Cờ lau Hoa Lư", 7], ["Thập nhị sứ quân", 12], ["Kỳ nhân", 2], ...["Tướng sĩ", "Binh lính", "Y sư", "Mưu sĩ", "Quân sư", "Pháp sư", "Xạ thủ", "Sát thủ"].map((n) => [n, 7])],
    );
    assert.equal(LEDGER_GROUPS.length, 11);
    // Đinh Bộ Lĩnh (bậc đặc biệt) xếp vào Hoa Lư, không vào Kỳ nhân; sứ quân ở Gói 1 vẫn vào Thập nhị sứ quân.
    assert.deepEqual(["dinhBoLinh", "nguyenBac", "phamBachHo", "dinhNgoc", "vuPhong", "docAnh"].map(ledgerGroup), ["hoaLu", "hoaLu", "suQuan", "kyNhan", "kyNhan", "nghe.satThu"]);
    assert.equal(defaultLedgerGroup(groups), "hoaLu");
  });

  it("nhóm mặc định là nhóm đầu tiên chưa tìm đủ", () => {
    const c = catalogForPack("pack-1-2-3");
    const hoaLu = c.pack.nodes.filter((n) => n.characterId && ledgerGroup(n.characterId) === "hoaLu").map((n) => n.id);
    const groups = ledgerGroups(ledger(c, { discoveredNodeIds: hoaLu, discoveredRecipeIds: [] } as unknown as DiscoveryState));
    assert.equal(groups[0]!.found, 7);
    assert.equal(defaultLedgerGroup(groups), "suQuan");
  });

  it("tìm thấy thì có nghề/hệ từ roster và vật biểu trưng", () => {
    const e = ledger(catalog, discoverAll()).find((x) => x.nodeId === "hero.nguyenBac");
    assert.ok(e && e.found);
    assert.deepEqual([e.info.profession, e.info.element, e.tier], ["tuongSi", "hoa", "lichSu"]);
    assert.deepEqual(e.symbols, ["Cờ lau"]);
  });
});

describe("Thẻ kết quả hợp nguyên", () => {
  it("phân loại mới / đã biết / tướng / không ra gì; ghép không hợp lệ thì không hiện thẻ", () => {
    const from = ["elt.moc", "elt.thuy"] as const;
    assert.equal(altarResult({ status: "created", nodeId: "mat.reed" }, 1, from)?.kind, "new");
    assert.equal(altarResult({ status: "created", nodeId: "mat.reed", nodeAlreadyKnown: true }, 2, from)?.kind, "known");
    assert.equal(altarResult({ status: "alreadyKnown", nodeId: "mat.reed" }, 3, from)?.kind, "known");
    assert.deepEqual(altarResult({ status: "created", nodeId: "hero.nguyenBac", isCharacter: true }, 4, from, 120), { seq: 4, from, points: 120, kind: "hero", nodeId: "hero.nguyenBac" });
    assert.deepEqual(altarResult({ status: "noRecipe" }, 5, from), { seq: 5, from, kind: "miss" });
    assert.equal(altarResult({ status: "invalid", reason: "unknownInput" }, 6, from), null);
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
    assert.match(html, />Phiếu<\/div><div[^>]*>3\/10<\/div>/);
    assert.match(html, /Mở lượt mới · 1 phiếu/);
    assert.match(html, /Mẹo: chọn Mộc vào ô trước và Mộc vào ô sau/);
    for (const t of ["Vạn Vật Lục", "Đài Hợp Nguyên", "Tướng Lục", "Ô trước", "Ô sau", "aria-live"]) assert.match(html, new RegExp(t));
    assert.equal(tutorialTip(r.view.discovery) !== null, true);
    for (const name of PACK_1_NAMES) assert.doesNotMatch(html, new RegExp(name));
    assert.match(html, /Công thức biểu trưng của trò chơi, không phải diễn giải sử học/);
    for (const bad of ["Nhận tướng", "Chiêu mộ", "vàng"]) assert.doesNotMatch(html, new RegExp(bad));
    // Tướng Lục chia nhóm và phân trang (mục 7.2): 12 tướng Gói 1, nhóm đầu Cờ lau Hoa Lư có 6 người, vừa một trang.
    assert.match(html, /Tướng Lục · 0\/12/);
    assert.match(html, /Cờ lau Hoa Lư/);
    assert.equal((html.match(/Tướng chưa tìm thấy/g) ?? []).length, 6);
  });

  it("có phân cảnh /game/tam-tuong-ky; cờ mặc định tắt, chỉ chuỗi true mới bật", () => {
    assert.equal(sceneOfSlug("tam-tuong-ky"), "TAM_TUONG_KY");
    assert.equal(SCENE_SLUG.TAM_TUONG_KY, "tam-tuong-ky");
    assert.equal(SCENE_TITLE.TAM_TUONG_KY, "Tầm Tướng Ký");
    assert.equal(tamTuongKyEnabled({}), false);
    assert.equal(tamTuongKyEnabled({ TAM_TUONG_KY_ENABLED: "1" }), false);
    assert.equal(tamTuongKyEnabled({ TAM_TUONG_KY_ENABLED: "true" }), true);
    // Giá trị dán vào bảng biến môi trường hay dính khoảng trắng, xuống dòng hoặc viết hoa.
    for (const v of ["TRUE", " true", "true\n", "True\r\n"]) assert.equal(tamTuongKyEnabled({ TAM_TUONG_KY_ENABLED: v }), true, JSON.stringify(v));
    for (const v of ["1", "yes", "", "tru e"]) assert.equal(tamTuongKyEnabled({ TAM_TUONG_KY_ENABLED: v }), false, JSON.stringify(v));
  });

  it("một biến duy nhất: Hạng và các gói đã duyệt đi cùng cờ chế độ; biến cũ không còn tác dụng", () => {
    assert.equal(tamTuongKyRankedEnabled({ TAM_TUONG_KY_RANKED_ENABLED: "true" }), false);
    assert.equal(tamTuongKyRankedEnabled({ TAM_TUONG_KY_ENABLED: "true\n" }), true);
    assert.deepEqual(tamTuongKyFlagStatus({ TAM_TUONG_KY_ENABLED: "true" }), { enabled: true, ranked: true, pack2: true, pack3: true, invalid: [], obsolete: [] });
    assert.deepEqual(tamTuongKyFlagStatus({ TAM_TUONG_KY_ENABLED: "1", TAM_TUONG_KY_PACK3_ENABLED: "true" }), { enabled: false, ranked: false, pack2: false, pack3: false, invalid: ["TAM_TUONG_KY_ENABLED"], obsolete: ["TAM_TUONG_KY_PACK3_ENABLED"] });
    assert.deepEqual(tamTuongKyFlagStatus({ TAM_TUONG_KY_RANKED_ENABLED: "true", TAM_TUONG_KY_PACK2_ENABLED: "true" }), { enabled: false, ranked: false, pack2: false, pack3: false, invalid: [], obsolete: ["TAM_TUONG_KY_RANKED_ENABLED", "TAM_TUONG_KY_PACK2_ENABLED"] });
  });

  it("chế độ Thường: yếu tố có dấu “còn công thức chưa tìm” trong nhãn đọc màn hình", async () => {
    const r = await getTamTuongKy({ profiles: new MemoryProfileStore(), now: Date.parse("2026-11-04T05:00:00Z"), enabled: true, isSignedIn: async () => true }, "acc-1");
    assert.ok(r.ok);
    const html = renderToStaticMarkup(createElement(TamTuongKyScreen, { initial: r.view }));
    assert.match(html, /aria-label="Lôi, còn công thức chưa tìm"/);
  });

  it("chế độ Hạng: tab Hạng tuần, 7 lời dẫn, túi và cửa hàng; không lộ tên tướng, không có gợi ý", async () => {
    const r = await getTamTuongKyRanked(
      { profiles: new MemoryProfileStore(), now: Date.parse("2026-11-04T05:00:00Z"), enabled: true, rankedEnabled: true, seasons: new MemorySeasonStore(), isSignedIn: async () => true },
      "acc-1",
    );
    assert.ok(r.ok);
    const html = renderToStaticMarkup(createElement(TamTuongKyScreen, { ranked: true, initialRanked: r.view, initialMode: "ranked" }));
    assert.match(html, /Hạng tuần/);
    assert.match(html, />Túi nguyên tố<\/div><div[^>]*>21<\/div>/);
    assert.match(html, /Mua 1 bó/);
    assert.equal((html.match(/Tướng chưa tìm thấy · /g) ?? []).length, 7);
    for (const name of PACK_1_NAMES) assert.doesNotMatch(html, new RegExp(name));
    assert.doesNotMatch(html, /Gợi ý nhóm|Gợi ý nguyên liệu/);
  });
});

describe("tab Tầm Tướng Ký trên trang Xếp hạng", () => {
  it("vẽ điểm và số nguyên tố đã tiêu; hạng của mình ngoài top hiện riêng", async () => {
    const { TtkBoard } = await import("../../src/app/game/leaderboard/LeaderboardScreen");
    const html = renderToStaticMarkup(
      createElement(TtkBoard, { data: { week: "2026-11-02", top: [{ rank: 1, name: "Shan", mine: false, points: 500, unitsSpent: 90 }], mine: { rank: 7, points: 200, unitsSpent: 10 } } }),
    );
    assert.match(html, /500 điểm · tiêu 90/);
    assert.match(html, /Hạng của bạn: 7 · 200 điểm · tiêu 10/);
    assert.match(html, /tuần bắt đầu 2026-11-02/);
    assert.match(renderToStaticMarkup(createElement(TtkBoard, { data: { week: "2026-11-02", top: [], mine: null } })), /chưa có ai ghép ra tướng đề cử/);
  });
});

describe("Tướng Lục khi bật Gói 2", () => {
  it("chia nhóm theo quan hệ thay cho gói, 6 thẻ mỗi trang, không lộ tên", async () => {
    const r = await getTamTuongKy({ profiles: new MemoryProfileStore(), now: Date.parse("2026-11-04T05:00:00Z"), enabled: true, pack2: true, isSignedIn: async () => true }, "acc-1");
    assert.ok(r.ok && r.view.packId === "pack-1-2");
    const html = renderToStaticMarkup(createElement(TamTuongKyScreen, { initial: r.view }));
    assert.match(html, /Tướng Lục · 0\/21/);
    for (const chip of [/Cờ lau Hoa Lư <span[^>]*>0\/7</, /Thập nhị sứ quân <span[^>]*>0\/12</, /Kỳ nhân <span[^>]*>0\/2</]) assert.match(html, chip);
    assert.doesNotMatch(html, /Gói 1: Dẹp loạn|Gói 2: Thập nhị sứ quân/);
    assert.equal((html.match(/Tướng chưa tìm thấy/g) ?? []).length, 6);
    assert.match(html, /Trang 1\/2/);
    for (const name of ["Đinh Bộ Lĩnh", "Lý Khuê", "Ngô Xương Xí"]) assert.doesNotMatch(html, new RegExp(name));
  });
});
