// Catalog Tầm Tướng Ký: Gói 1 (12 tướng, LT-05) và slice-1 (3 tướng, tập con của Gói 1, dùng cho test).
// Công thức là biểu trưng của trò chơi, không phải diễn giải sử học, và **không dựa vào art nhân vật** (Shan, 04/11/2026):
// công thức cuối của mỗi tướng = node vai trò (nghề × hệ theo roster, tướng đặc biệt: dung hợp) + dấu danh tính lấy từ
// tước hiệu, địa danh, mốc chiến dịch, tên chiêu hoặc lore đã duyệt. Báo cáo: docs/02-game-modes/future/18-tam-tuong-ky-lt05-pack-1.md.

import { ELEMENTS, type Element } from "../battle";
import { historySource } from "../campaign/history";
import { companionById, isHero, isWarlord, specialById } from "../roster/roster";
import { buildCatalog, type Catalog } from "./engine";
import type { CatalogDeps, CatalogNode, CharacterInfo, HeroAnchor, HeroTier, Pack, Recipe, RoleHint } from "./types";

const ELEMENT_NAMES: Readonly<Record<Element, string>> = {
  kim: "Kim",
  moc: "Mộc",
  thuy: "Thủy",
  hoa: "Hỏa",
  tho: "Thổ",
  loi: "Lôi",
  phong: "Phong",
};

/** Tên hiển thị của nhóm gợi ý (`hintGroup`). */
export const HINT_GROUP_NAMES: Readonly<Record<string, string>> = {
  "nguyen-to": "Nguyên tố",
  "thien-nhien": "Thiên nhiên",
  "binh-khi": "Binh khí",
  "co-hieu": "Cờ hiệu",
  "thu-tich": "Thư tịch",
  ngoc: "Ngọc",
  "vai-tro": "Vai trò",
};

export const STARTER_NODES: readonly CatalogNode[] = ELEMENTS.map((element) => ({
  id: `elt.${element}`,
  kind: "element",
  nameVi: ELEMENT_NAMES[element],
  element,
  hintGroup: "nguyen-to",
}));

const mat = (id: string, nameVi: string, hintGroup: string, note?: string): CatalogNode => ({
  id: `mat.${id}`,
  kind: "material",
  nameVi,
  hintGroup,
  note,
});

const know = (id: string, nameVi: string, hintGroup: string, note?: string): CatalogNode => ({
  id: `know.${id}`,
  kind: "knowledge",
  nameVi,
  hintGroup,
  note,
});

const role = (id: string, nameVi: string, r: RoleHint, note?: string): CatalogNode => ({ id: `role.${id}`, kind: "knowledge", nameVi, hintGroup: "vai-tro", role: r, note });

const hero = (
  characterId: string,
  nameVi: string,
  tier: HeroTier,
  anchors: readonly HeroAnchor[],
  clue: string,
  historySourceIds?: readonly string[],
  pack = "pack-1",
): CatalogNode => ({ id: `hero.${characterId}`, kind: "character", nameVi, characterId, tier, anchors, clue: { kind: "text", text: clue }, historySourceIds, pack });

/** Tướng theo Đinh Bộ Lĩnh: Việt Nam sử lược, mục Đinh Tiên Hoàng (S04). Sứ quân: danh sách Thập nhị sứ quân (S01, S05). */
const DBL_SOURCES = ["S04"] as const;
const WARLORD_SOURCES = ["S01", "S05"] as const;

const PACK_1_NODES: readonly CatalogNode[] = [
  ...STARTER_NODES,
  // Bậc 1: hai nguyên tố. Cặp gương: Mộc+Thủy ≠ Thủy+Mộc, Kim+Thổ ≠ Thổ+Kim.
  mat("reed", "Lau sậy", "thien-nhien"),
  mat("herbs", "Dược thảo", "thien-nhien"),
  mat("forgedIron", "Sắt rèn", "binh-khi"),
  mat("bamboo", "Tre", "thien-nhien"),
  mat("cloth", "Vải gai", "co-hieu"),
  mat("storm", "Giông tố", "thien-nhien"),
  mat("charcoal", "Than củi", "thu-tich"),
  mat("dew", "Giọt sương", "ngoc"),
  mat("jadeStone", "Đá ngọc thô", "ngoc"),
  mat("rampart", "Lũy đất", "thien-nhien"),
  mat("blackBronze", "Đồng đen", "binh-khi"),
  mat("mountain", "Núi", "thien-nhien"),
  mat("boulder", "Đá tảng", "thien-nhien"),
  mat("estuary", "Cửa sông", "thien-nhien"),
  mat("cloud", "Mây trời", "thien-nhien"),
  // Vật dụng chung, không gắn với art của tướng nào.
  mat("ink", "Mực", "thu-tich"),
  mat("bambooSlips", "Thẻ tre", "thu-tich"),
  mat("commandFlag", "Cờ lệnh", "co-hieu"),
  mat("weapon", "Binh khí", "binh-khi"),
  mat("armor", "Giáp", "binh-khi"),
  mat("seal", "Ấn đồng", "thu-tich"),
  mat("boat", "Thuyền", "thien-nhien"),
  mat("village", "Lũy tre làng", "thien-nhien"),
  mat("gourd", "Quả bầu", "thien-nhien"),
  mat("road", "Đường xa", "thien-nhien"),
  mat("waterOrb", "Ngọc tụ khí", "ngoc"),
  mat("fortress", "Lũy kép", "thien-nhien"),
  mat("hoaLu", "Hoa Lư", "thien-nhien"),
  // Tri thức nghề.
  { ...know("martial", "Võ nghệ", "thu-tich"), professionHint: "tuongSi" },
  { ...know("troops", "Đội ngũ", "thu-tich"), professionHint: "binhLinh" },
  { ...know("stratagem", "Mưu kế", "thu-tich"), professionHint: "muuSi" },
  { ...know("medicine", "Y thuật", "thu-tich"), professionHint: "ySu" },
  { ...know("warManual", "Binh thư", "thu-tich"), professionHint: "quanSu" },
  { ...know("magic", "Pháp thuật", "thu-tich"), professionHint: "phapSu" },
  // Vai trò: tri thức nghề nhuộm hệ. Đổi nghề/hệ trong roster thì validator báo `roleMismatch`.
  role("tuongSiHoa", "Võ nghệ hệ Hỏa", { profession: "tuongSi", element: "hoa" }),
  role("tuongSiTho", "Võ nghệ hệ Thổ", { profession: "tuongSi", element: "tho" }),
  role("binhLinhTho", "Đội ngũ hệ Thổ", { profession: "binhLinh", element: "tho" }),
  role("muuSiKim", "Mưu kế hệ Kim", { profession: "muuSi", element: "kim" }),
  role("ySuMoc", "Y thuật hệ Mộc", { profession: "ySu", element: "moc" }),
  role("quanSuLoi", "Binh thư hệ Lôi", { profession: "quanSu", element: "loi" }),
  role("quanSuThuy", "Binh thư hệ Thủy", { profession: "quanSu", element: "thuy" }),
  role("quanSuPhong", "Binh thư hệ Phong", { profession: "quanSu", element: "phong" }),
  role("phapSuThuy", "Pháp thuật hệ Thủy", { profession: "phapSu", element: "thuy" }),
  role("hybrid", "Vạn tượng", { hybrid: true }, "Dung hợp tám nghề, bảy hệ của tướng đặc biệt"),
  // Dấu danh tính.
  know("reedBanner", "Cờ lau", "co-hieu", "Mốc chiến dịch: Nguyễn Bặc gia nhập ở “Cờ lau tập trận”"),
  know("outerArmor", "Ngoại giáp", "binh-khi", "Chức Ngoại giáp của Đinh Điền (chiêu Ngoại Giáp Hộ Quân)"),
  know("doHoPhu", "Đô hộ phủ", "thu-tich", "Chức Đô hộ phủ sĩ sư của Lưu Cơ (chiêu Đô Hộ Phủ Lệnh)"),
  know("hoaLuHerbs", "Thảo dược Hoa Lư", "thien-nhien", "Chiêu Hoa Lư Thảo Dược của Trịnh Tú"),
  know("tenCircuits", "Thập đạo", "co-hieu", "Chức Thập đạo tướng quân của Lê Hoàn (chiêu Thập Đạo Lôi Binh)"),
  know("royalSeal", "Vương ấn Nam Việt", "thu-tich", "Tước Nam Việt vương của Đinh Liễn (chiêu Nam Việt Vương Ấn)"),
  know("whiteTiger", "Mãnh thú trắng", "thien-nhien"),
  know("tigerLeaves", "Hổ xuất sơn", "thien-nhien", "Tên Phạm Bạch Hổ, chiêu Bạch Hổ Xuất Sơn"),
  know("steadfast", "Đỗ Động kiên tâm", "thien-nhien", "Đất Đỗ Động, chiêu Đỗ Động Kiên Tâm của Đỗ Cảnh Thạc"),
  know("riverGuard", "Bố Hải trấn giang", "co-hieu", "Đất Bố Hải Khẩu, chiêu Bố Hải Trấn Giang của Trần Lãm"),
  know("duongLam", "Đường Lâm phong khởi", "thien-nhien", "Đất Đường Lâm, chiêu Đường Lâm Phong Khởi của Ngô Nhật Khánh"),
  know("guardRoad", "Giữ đường cứu người", "thien-nhien", "Chủ đề nhiệm vụ mở khóa của Đinh Ngọc: cứu trợ, giữ đường"),
  know("wandering", "Vân du", "thien-nhien", "Danh xưng Vân Du Tử, chủ đề rong ruổi tìm người của Trần Vũ Phong"),
  // Tướng. Lời dẫn chế độ Hạng là chữ của trò chơi, không phải trích dẫn lịch sử.
  hero("nguyenBac", "Nguyễn Bặc", "lichSu", [{ kind: "campaign", text: "Cờ lau tập trận" }, { kind: "skill", text: "Định Quốc Hỏa Kỳ" }],
    "Võ tướng mang lửa trong tay, theo về từ buổi tập trận cờ lau.", DBL_SOURCES),
  hero("dinhDien", "Đinh Điền", "lichSu", [{ kind: "title", text: "Ngoại giáp" }, { kind: "skill", text: "Ngoại Giáp Hộ Quân" }],
    "Người giữ chức Ngoại giáp, đứng chắn trước đội ngũ vững như đất.", DBL_SOURCES),
  hero("luuCo", "Lưu Cơ", "lichSu", [{ kind: "title", text: "Đô hộ phủ sĩ sư" }, { kind: "skill", text: "Đô Hộ Phủ Lệnh" }],
    "Người bày mưu trong phủ đô hộ, lặng như mây mà sắc như kim.", DBL_SOURCES),
  hero("trinhTu", "Trịnh Tú", "lichSu", [{ kind: "skill", text: "Hoa Lư Thảo Dược" }, { kind: "place", text: "Hoa Lư" }],
    "Thầy thuốc theo quân, mang thảo dược của đất núi sông Hoa Lư.", DBL_SOURCES),
  hero("leHoan", "Lê Hoàn", "lichSu", [{ kind: "title", text: "Thập đạo tướng quân" }, { kind: "skill", text: "Thập Đạo Lôi Binh" }],
    "Người được giao điều mười đạo quân, ra lệnh nhanh như sấm.", DBL_SOURCES),
  hero("dinhLien", "Đinh Liễn", "lichSu", [{ kind: "title", text: "Nam Việt vương" }, { kind: "skill", text: "Nam Việt Vương Ấn" }],
    "Người mang vương ấn Nam Việt, phép thuật mềm như nước.", DBL_SOURCES),
  hero("phamBachHo", "Phạm Bạch Hổ", "lichSu", [{ kind: "skill", text: "Bạch Hổ Xuất Sơn" }, { kind: "place", text: "Đằng Châu" }],
    "Tên gọi như một mãnh thú trắng; có ngày rời núi đem quân về.", WARLORD_SOURCES),
  hero("doCanhThac", "Đỗ Cảnh Thạc", "lichSu", [{ kind: "place", text: "Đỗ Động" }, { kind: "skill", text: "Đỗ Động Kiên Tâm" }],
    "Chủ một vùng đất mang họ mình, lòng vững như đá tảng.", WARLORD_SOURCES),
  hero("tranLam", "Trần Lãm", "lichSu", [{ kind: "place", text: "Bố Hải Khẩu" }, { kind: "skill", text: "Bố Hải Trấn Giang" }],
    "Người giữ cửa sông nơi nước gặp biển, bày trận trên mặt nước.", WARLORD_SOURCES),
  hero("ngoNhatKhanh", "Ngô Nhật Khánh", "lichSu", [{ kind: "place", text: "Đường Lâm" }, { kind: "skill", text: "Đường Lâm Phong Khởi" }],
    "Gió nổi lên từ một làng cổ; người bày trận theo chiều gió.", WARLORD_SOURCES),
  hero("dinhNgoc", "Đinh Ngọc", "dacBiet", [{ kind: "lore", text: "Vạn Tượng Hành Giả" }, { kind: "lore", text: "Cứu trợ, giữ đường" }],
    "Hành giả muôn hình, giữ đường cho người lỡ bước."),
  hero("vuPhong", "Trần Vũ Phong", "dacBiet", [{ kind: "lore", text: "Vân Du Tử" }, { kind: "lore", text: "Rong ruổi tìm người" }],
    "Kẻ rong chơi trên mây, đi khắp các làng để tìm một người."),
];

const r = (id: string, first: string, second: string, result: string, reason: string): Recipe => ({
  id: `r.${id}`,
  first,
  second,
  result,
  reason,
});

const PACK_1_RECIPES: readonly Recipe[] = [
  // Bậc 1.
  r("reed", "elt.moc", "elt.thuy", "mat.reed", "Cây mọc bên nước thành lau sậy"),
  r("herbs", "elt.thuy", "elt.moc", "mat.herbs", "Nước nuôi cây thành dược thảo"),
  r("forgedIron", "elt.kim", "elt.hoa", "mat.forgedIron", "Kim loại đưa vào lửa thành sắt rèn"),
  r("bamboo", "elt.moc", "elt.moc", "mat.bamboo", "Cây chồng cây thành rừng tre"),
  r("cloth", "elt.moc", "elt.phong", "mat.cloth", "Sợi cây phơi gió dệt thành vải gai"),
  r("storm", "elt.loi", "elt.phong", "mat.storm", "Sấm dẫn gió thành giông tố"),
  r("charcoal", "elt.moc", "elt.hoa", "mat.charcoal", "Gỗ cháy thành than củi"),
  r("dew", "elt.thuy", "elt.thuy", "mat.dew", "Nước đọng nước thành giọt sương"),
  r("jadeStone", "elt.tho", "elt.kim", "mat.jadeStone", "Đất ủ kim thạch thành đá ngọc thô"),
  r("rampart", "elt.tho", "elt.tho", "mat.rampart", "Đất đắp lên đất thành lũy"),
  r("blackBronze", "elt.kim", "elt.tho", "mat.blackBronze", "Kim vùi trong đất lâu ngày thành đồng đen"),
  r("mountain", "elt.tho", "elt.phong", "mat.mountain", "Đất dồn đón gió thành núi"),
  r("boulder", "elt.tho", "elt.hoa", "mat.boulder", "Đất nung trong lửa thành đá tảng"),
  r("estuary", "elt.thuy", "elt.tho", "mat.estuary", "Nước gặp đất thành cửa sông"),
  r("cloud", "elt.thuy", "elt.phong", "mat.cloud", "Hơi nước theo gió thành mây"),
  // Vật dụng chung.
  r("ink", "mat.charcoal", "elt.thuy", "mat.ink", "Than củi mài với nước thành mực"),
  r("bambooSlips", "mat.bamboo", "elt.kim", "mat.bambooSlips", "Dao kim chẻ tre thành thẻ"),
  r("commandFlag", "mat.bamboo", "mat.cloth", "mat.commandFlag", "Cán tre buộc vải thành cờ lệnh"),
  r("weapon", "mat.forgedIron", "mat.bamboo", "mat.weapon", "Lưỡi sắt tra cán tre thành binh khí"),
  r("armor", "mat.forgedIron", "mat.cloth", "mat.armor", "Sắt rèn kết vào vải thành giáp"),
  r("seal", "mat.blackBronze", "mat.ink", "mat.seal", "Đồng đen khắc chữ, chấm mực thành ấn"),
  r("boat", "mat.bamboo", "elt.thuy", "mat.boat", "Tre thả xuống nước thành thuyền"),
  r("village", "mat.bamboo", "mat.rampart", "mat.village", "Tre trồng quanh lũy thành lũy tre làng"),
  r("gourd", "elt.moc", "mat.dew", "mat.gourd", "Dây leo uống sương kết quả bầu"),
  r("road", "mat.rampart", "elt.phong", "mat.road", "Lũy đất trải theo gió thành đường xa"),
  r("waterOrb", "mat.dew", "mat.jadeStone", "mat.waterOrb", "Sương đọng trên đá ngọc thành ngọc tụ khí"),
  r("fortress", "mat.rampart", "mat.rampart", "mat.fortress", "Lũy đắp thêm lũy"),
  r("hoaLu", "mat.mountain", "mat.boat", "mat.hoaLu", "Thuyền len giữa núi đá: Hoa Lư"),
  // Tri thức nghề.
  r("martial", "mat.weapon", "mat.rampart", "know.martial", "Luyện binh khí trên bãi tập thành võ nghệ"),
  r("troops", "mat.rampart", "mat.commandFlag", "know.troops", "Quân đứng sau lũy theo cờ thành đội ngũ"),
  r("stratagem", "mat.cloud", "mat.ink", "know.stratagem", "Mực vẽ thành mây, kế giấu không ai thấy"),
  r("medicine", "mat.herbs", "mat.gourd", "know.medicine", "Dược thảo cất trong bầu thành y thuật"),
  r("warManual", "mat.bambooSlips", "mat.ink", "know.warManual", "Mực viết lên thẻ tre thành binh thư"),
  r("magic", "mat.waterOrb", "mat.cloud", "know.magic", "Ngọc tụ khí gọi mây thành pháp thuật"),
  // Vai trò.
  r("tuongSiHoa", "know.martial", "elt.hoa", "role.tuongSiHoa", "Võ nghệ rèn trong lửa"),
  r("tuongSiTho", "know.martial", "elt.tho", "role.tuongSiTho", "Võ nghệ vững như đất"),
  r("binhLinhTho", "know.troops", "elt.tho", "role.binhLinhTho", "Đội ngũ đứng như đất"),
  r("muuSiKim", "know.stratagem", "elt.kim", "role.muuSiKim", "Mưu kế sắc như kim"),
  r("ySuMoc", "know.medicine", "elt.moc", "role.ySuMoc", "Y thuật theo cỏ cây"),
  r("quanSuLoi", "know.warManual", "elt.loi", "role.quanSuLoi", "Binh thư nhanh như sấm"),
  r("quanSuThuy", "know.warManual", "elt.thuy", "role.quanSuThuy", "Binh thư mềm như nước"),
  r("quanSuPhong", "know.warManual", "elt.phong", "role.quanSuPhong", "Binh thư theo chiều gió"),
  r("phapSuThuy", "know.magic", "elt.thuy", "role.phapSuThuy", "Pháp thuật gọi nước"),
  r("hybrid", "mat.cloud", "mat.mountain", "role.hybrid", "Mây núi muôn hình thành vạn tượng"),
  // Dấu danh tính.
  r("reedBanner", "mat.reed", "mat.commandFlag", "know.reedBanner", "Lau sậy làm cờ lệnh: cờ lau tập trận"),
  r("outerArmor", "mat.armor", "mat.rampart", "know.outerArmor", "Giáp dựng thành lũy chắn ngoài"),
  r("doHoPhu", "mat.seal", "mat.rampart", "know.doHoPhu", "Ấn đồng trong thành lũy: phủ đô hộ"),
  r("hoaLuHerbs", "mat.herbs", "mat.hoaLu", "know.hoaLuHerbs", "Dược thảo hái ở Hoa Lư"),
  r("tenCircuits", "mat.commandFlag", "mat.storm", "know.tenCircuits", "Cờ lệnh phất như giông điều mười đạo quân"),
  r("royalSeal", "mat.seal", "elt.thuy", "know.royalSeal", "Ấn đồng rửa nước thành vương ấn"),
  r("whiteTiger", "mat.mountain", "elt.kim", "know.whiteTiger", "Núi phương Kim sắc trắng, nơi mãnh thú trắng ở"),
  r("tigerLeaves", "know.whiteTiger", "mat.road", "know.tigerLeaves", "Mãnh thú trắng theo đường xuống núi"),
  r("steadfast", "mat.fortress", "mat.boulder", "know.steadfast", "Lũy kép chèn đá tảng, lòng không lay"),
  r("riverGuard", "mat.estuary", "mat.commandFlag", "know.riverGuard", "Cắm cờ lệnh giữ cửa sông"),
  r("duongLam", "mat.village", "mat.storm", "know.duongLam", "Gió nổi lên ở làng cổ"),
  r("guardRoad", "mat.road", "mat.gourd", "know.guardRoad", "Mang bầu nước giữ đường cứu người"),
  r("wandering", "mat.cloud", "mat.village", "know.wandering", "Theo mây qua các làng"),
  // Công thức cuối: vai trò + dấu danh tính.
  r("nguyenBac", "role.tuongSiHoa", "know.reedBanner", "hero.nguyenBac", "Võ nghệ hệ Hỏa dưới cờ lau"),
  r("dinhDien", "role.binhLinhTho", "know.outerArmor", "hero.dinhDien", "Đội ngũ hệ Thổ giữ ngoại giáp"),
  r("luuCo", "role.muuSiKim", "know.doHoPhu", "hero.luuCo", "Mưu kế hệ Kim trong phủ đô hộ"),
  r("trinhTu", "role.ySuMoc", "know.hoaLuHerbs", "hero.trinhTu", "Y thuật hệ Mộc với thảo dược Hoa Lư"),
  r("leHoan", "role.quanSuLoi", "know.tenCircuits", "hero.leHoan", "Binh thư hệ Lôi điều thập đạo"),
  r("dinhLien", "role.phapSuThuy", "know.royalSeal", "hero.dinhLien", "Pháp thuật hệ Thủy mang vương ấn"),
  r("phamBachHo", "role.tuongSiHoa", "know.tigerLeaves", "hero.phamBachHo", "Võ nghệ hệ Hỏa, hổ xuất sơn"),
  r("doCanhThac", "role.tuongSiTho", "know.steadfast", "hero.doCanhThac", "Võ nghệ hệ Thổ, Đỗ Động kiên tâm"),
  r("tranLam", "role.quanSuThuy", "know.riverGuard", "hero.tranLam", "Binh thư hệ Thủy trấn cửa sông"),
  r("ngoNhatKhanh", "role.quanSuPhong", "know.duongLam", "hero.ngoNhatKhanh", "Binh thư hệ Phong, gió nổi Đường Lâm"),
  r("dinhNgoc", "role.hybrid", "know.guardRoad", "hero.dinhNgoc", "Vạn tượng giữ đường cứu người"),
  r("vuPhong", "role.hybrid", "know.wandering", "hero.vuPhong", "Vạn tượng vân du"),
];

const set = (id: string, title: string, gold: number, heroIds: readonly string[]) => ({ id: `ttk.pack-1.${id}`, title: `Tầm Tướng Ký: ${title}`, gold, heroIds: heroIds.map((h) => `hero.${h}`) });

export const PACK_1: Pack = {
  id: "pack-1",
  nameVi: "Gói 1: Dẹp loạn",
  contentVersion: 2,
  // Shan duyệt công thức và lời dẫn (L5-6, 04/11/2026). Phát hành tới người chơi do cờ TAM_TUONG_KY_ENABLED quyết định.
  status: "published",
  nodes: PACK_1_NODES,
  recipes: PACK_1_RECIPES,
  // Thành tựu bộ theo P-21: bộ theo hệ có 2 tướng 200 vàng; 2 tướng đặc biệt 300; 6 tướng theo Đinh Bộ Lĩnh 500;
  // 4 sứ quân 400; cả gói 1 000. Mộc và Lôi mỗi hệ 1 tướng nên chưa có bộ.
  achievementSets: [
    set("hoa", "đủ tướng hệ Hỏa", 200, ["nguyenBac", "phamBachHo"]),
    set("tho", "đủ tướng hệ Thổ", 200, ["dinhDien", "doCanhThac"]),
    set("kim", "đủ tướng hệ Kim", 200, ["luuCo", "dinhNgoc"]),
    set("thuy", "đủ tướng hệ Thủy", 200, ["dinhLien", "tranLam"]),
    set("phong", "đủ tướng hệ Phong", 200, ["ngoNhatKhanh", "vuPhong"]),
    set("dacBiet", "đủ tướng đặc biệt", 300, ["dinhNgoc", "vuPhong"]),
    set("dinhBoLinh", "đủ sáu tướng theo Đinh Bộ Lĩnh", 500, ["nguyenBac", "dinhDien", "luuCo", "trinhTu", "leHoan", "dinhLien"]),
    set("suQuan", "đủ bốn sứ quân", 400, ["phamBachHo", "doCanhThac", "tranLam", "ngoNhatKhanh"]),
    set("all", "đủ Gói 1", 1000, ["nguyenBac", "dinhDien", "luuCo", "trinhTu", "leHoan", "dinhLien", "phamBachHo", "doCanhThac", "tranLam", "ngoNhatKhanh", "dinhNgoc", "vuPhong"]),
  ],
};

// ——— Gói 2 (Shan chọn 04/11/2026): 8 sứ quân còn lại + Đinh Bộ Lĩnh (bậc đặc biệt, A-21). ———
// Dùng chung sổ với Gói 1 (gộp bằng `mergePacks`), bật bằng cờ TAM_TUONG_KY_PACK2_ENABLED. Cùng cách dựng: vai trò +
// dấu danh tính (đất phong, tên chiêu riêng), không dựa vào art. Báo cáo: docs/02-game-modes/future/21-tam-tuong-ky-pack-2.md.

const PACK_2_NODES: readonly CatalogNode[] = [
  mat("grain", "Lúa", "thien-nhien"),
  mat("bridge", "Cầu tre", "thien-nhien"),
  mat("lake", "Hồ nước", "thien-nhien"),
  mat("granary", "Kho lương", "thien-nhien"),
  role("tuongSiKim", "Võ nghệ hệ Kim", { profession: "tuongSi", element: "kim" }),
  role("muuSiThuy", "Mưu kế hệ Thủy", { profession: "muuSi", element: "thuy" }),
  role("phapSuLoi", "Pháp thuật hệ Lôi", { profession: "phapSu", element: "loi" }),
  role("binhLinhHoa", "Đội ngũ hệ Hỏa", { profession: "binhLinh", element: "hoa" }),
  know("ngoGia", "Ngô gia di mưu", "thu-tich", "Đất Bình Kiều, chiêu Ngô Gia Di Mưu của Ngô Xương Xí"),
  know("tamDai", "Tam Đái kiên thành", "thien-nhien", "Đất Tam Đái, chiêu Tam Đái Kiên Thành của Nguyễn Khoan"),
  know("phongChau", "Phong Châu lôi kích", "thien-nhien", "Đất Phong Châu, chiêu Phong Châu Lôi Kích của Kiều Công Hãn"),
  know("hoiHo", "Hồi Hồ sinh khí", "thien-nhien", "Đất Hồi Hồ, chiêu Hồi Hồ Sinh Khí của Kiều Thuận"),
  know("phaGiap", "Siêu Loại phá giáp", "binh-khi", "Đất Siêu Loại, chiêu Siêu Loại Phá Giáp của Lý Khuê"),
  know("tienDu", "Tiên Du đoạt lương", "thien-nhien", "Đất Tiên Du, chiêu Tiên Du Đoạt Lương của Nguyễn Thủ Tiệp"),
  know("teGiang", "Tế Giang thủy trận", "thien-nhien", "Đất Tế Giang, chiêu Tế Giang Thủy Trận của Lữ Đường"),
  know("hoaLuy", "Phù Liệt hỏa lũy", "thien-nhien", "Đất Tây Phù Liệt, chiêu Phù Liệt Hỏa Lũy của Nguyễn Siêu"),
  know("daiCoViet", "Dựng nước Đại Cồ Việt", "thien-nhien", "Đinh Bộ Lĩnh dẹp loạn, dựng nước Đại Cồ Việt ở Hoa Lư"),
  hero("ngoXuongXi", "Ngô Xương Xí", "lichSu", [{ kind: "place", text: "Bình Kiều" }, { kind: "skill", text: "Ngô Gia Di Mưu" }],
    "Người nhà Ngô giữ đất Bình Kiều, mưu kế sắc như kim.", WARLORD_SOURCES, "pack-2"),
  hero("nguyenKhoan", "Nguyễn Khoan", "lichSu", [{ kind: "place", text: "Tam Đái" }, { kind: "skill", text: "Tam Đái Kiên Thành" }],
    "Chủ thành Tam Đái, đội ngũ đứng vững như đất.", WARLORD_SOURCES, "pack-2"),
  hero("kieuCongHan", "Kiều Công Hãn", "lichSu", [{ kind: "place", text: "Phong Châu" }, { kind: "skill", text: "Phong Châu Lôi Kích" }],
    "Sấm nổ trên đất Phong Châu; người dùng phép gọi sét.", WARLORD_SOURCES, "pack-2"),
  hero("kieuThuan", "Kiều Thuận", "lichSu", [{ kind: "place", text: "Hồi Hồ" }, { kind: "skill", text: "Hồi Hồ Sinh Khí" }],
    "Thầy thuốc bên hồ Hồi Hồ, giữ sinh khí cho quân.", WARLORD_SOURCES, "pack-2"),
  hero("lyKhue", "Lý Khuê", "lichSu", [{ kind: "place", text: "Siêu Loại" }, { kind: "skill", text: "Siêu Loại Phá Giáp" }],
    "Võ tướng đất Siêu Loại, đòn đánh sắc phá cả giáp.", WARLORD_SOURCES, "pack-2"),
  hero("nguyenThuTiep", "Nguyễn Thủ Tiệp", "lichSu", [{ kind: "place", text: "Tiên Du" }, { kind: "skill", text: "Tiên Du Đoạt Lương" }],
    "Người giữ Tiên Du, mưu cướp kho lương theo đường nước.", WARLORD_SOURCES, "pack-2"),
  hero("luDuong", "Lữ Đường", "lichSu", [{ kind: "place", text: "Tế Giang" }, { kind: "skill", text: "Tế Giang Thủy Trận" }],
    "Bày thủy trận trên sông Tế Giang, phép mềm như nước.", WARLORD_SOURCES, "pack-2"),
  hero("nguyenSieu", "Nguyễn Siêu", "lichSu", [{ kind: "place", text: "Tây Phù Liệt" }, { kind: "skill", text: "Phù Liệt Hỏa Lũy" }],
    "Đốt lửa quanh lũy ở Tây Phù Liệt, đội ngũ nóng như lửa.", WARLORD_SOURCES, "pack-2"),
  hero("dinhBoLinh", "Đinh Bộ Lĩnh", "dacBiet", [{ kind: "place", text: "Hoa Lư" }, { kind: "lore", text: "Dẹp loạn, dựng nước Đại Cồ Việt" }],
    "Người từ đất núi sông dẹp loạn mười hai sứ quân, dựng nước Đại Cồ Việt.", DBL_SOURCES, "pack-2"),
];

const PACK_2_RECIPES: readonly Recipe[] = [
  // Bậc 1 và vật dụng mới. Cặp gương với Gói 1: Giông tố+Lũy tre làng ≠ Lũy tre làng+Giông tố.
  r("grain", "elt.tho", "elt.moc", "mat.grain", "Đất nuôi cây thành lúa"),
  r("bridge", "mat.bamboo", "mat.estuary", "mat.bridge", "Tre bắc qua cửa sông thành cầu"),
  r("lake", "mat.estuary", "mat.dew", "mat.lake", "Nước sông đọng sương thành hồ"),
  r("granary", "mat.grain", "mat.rampart", "mat.granary", "Lúa cất sau lũy thành kho lương"),
  // Vai trò.
  r("tuongSiKim", "know.martial", "elt.kim", "role.tuongSiKim", "Võ nghệ sắc như kim"),
  r("muuSiThuy", "know.stratagem", "elt.thuy", "role.muuSiThuy", "Mưu kế mềm như nước"),
  r("phapSuLoi", "know.magic", "elt.loi", "role.phapSuLoi", "Pháp thuật gọi sấm"),
  r("binhLinhHoa", "know.troops", "elt.hoa", "role.binhLinhHoa", "Đội ngũ nóng như lửa"),
  // Dấu danh tính.
  r("ngoGia", "mat.bambooSlips", "mat.bridge", "know.ngoGia", "Mưu nhà Ngô ghi trên thẻ tre, giữ ở bến cầu Bình Kiều"),
  r("tamDai", "mat.village", "mat.rampart", "know.tamDai", "Lũy đắp quanh làng thành thành vững"),
  r("phongChau", "mat.storm", "mat.village", "know.phongChau", "Giông sấm đánh xuống làng Phong Châu"),
  r("hoiHo", "mat.lake", "mat.gourd", "know.hoiHo", "Bầu nước múc ở hồ Hồi Hồ giữ sinh khí"),
  r("phaGiap", "mat.armor", "mat.forgedIron", "know.phaGiap", "Sắt rèn xuyên qua giáp"),
  r("tienDu", "mat.granary", "mat.boat", "know.tienDu", "Thuyền chở lương rời kho"),
  r("teGiang", "mat.estuary", "mat.waterOrb", "know.teGiang", "Ngọc tụ khí bày trận trên sông"),
  r("hoaLuy", "mat.fortress", "mat.charcoal", "know.hoaLuy", "Than đốt quanh lũy kép thành hỏa lũy"),
  r("daiCoViet", "mat.hoaLu", "elt.tho", "know.daiCoViet", "Đất Hoa Lư dựng nước"),
  // Công thức cuối.
  r("ngoXuongXi", "role.muuSiKim", "know.ngoGia", "hero.ngoXuongXi", "Mưu kế hệ Kim của nhà Ngô"),
  r("nguyenKhoan", "role.binhLinhTho", "know.tamDai", "hero.nguyenKhoan", "Đội ngũ hệ Thổ giữ thành Tam Đái"),
  r("kieuCongHan", "role.phapSuLoi", "know.phongChau", "hero.kieuCongHan", "Pháp thuật hệ Lôi ở Phong Châu"),
  r("kieuThuan", "role.ySuMoc", "know.hoiHo", "hero.kieuThuan", "Y thuật hệ Mộc bên hồ Hồi Hồ"),
  r("lyKhue", "role.tuongSiKim", "know.phaGiap", "hero.lyKhue", "Võ nghệ hệ Kim phá giáp"),
  r("nguyenThuTiep", "role.muuSiThuy", "know.tienDu", "hero.nguyenThuTiep", "Mưu kế hệ Thủy đoạt lương"),
  r("luDuong", "role.phapSuThuy", "know.teGiang", "hero.luDuong", "Pháp thuật hệ Thủy bày trận Tế Giang"),
  r("nguyenSieu", "role.binhLinhHoa", "know.hoaLuy", "hero.nguyenSieu", "Đội ngũ hệ Hỏa giữ hỏa lũy"),
  r("dinhBoLinh", "role.hybrid", "know.daiCoViet", "hero.dinhBoLinh", "Vạn tượng dựng nước Đại Cồ Việt"),
];

export const PACK_2: Pack = {
  id: "pack-2",
  nameVi: "Gói 2: Thập nhị sứ quân",
  contentVersion: 1,
  // Shan duyệt công thức, lời dẫn và vàng thành tựu ngày 04/11/2026. Người chơi thấy Gói 2 khi cờ TAM_TUONG_KY_PACK2_ENABLED bật.
  status: "published",
  nodes: PACK_2_NODES,
  recipes: PACK_2_RECIPES,
  // Theo khung P-21 (Shan duyệt 04/11/2026): bộ hệ 200, đủ 8 sứ quân Gói 2 600, đủ 12 sứ quân (hai gói) 800, đủ 3 tướng đặc biệt 300,
  // đủ Gói 2 1 000. Bộ hệ Mộc, Lôi gộp tướng hai gói (mỗi gói một tướng).
  achievementSets: [
    { id: "ttk.pack-2.kim", title: "Tầm Tướng Ký: đủ tướng hệ Kim Gói 2", gold: 200, heroIds: ["hero.ngoXuongXi", "hero.lyKhue"] },
    { id: "ttk.pack-2.thuy", title: "Tầm Tướng Ký: đủ tướng hệ Thủy Gói 2", gold: 200, heroIds: ["hero.nguyenThuTiep", "hero.luDuong"] },
    { id: "ttk.pack-2.moc", title: "Tầm Tướng Ký: đủ tướng hệ Mộc", gold: 200, heroIds: ["hero.trinhTu", "hero.kieuThuan"] },
    { id: "ttk.pack-2.loi", title: "Tầm Tướng Ký: đủ tướng hệ Lôi", gold: 200, heroIds: ["hero.leHoan", "hero.kieuCongHan"] },
    { id: "ttk.pack-2.suQuan", title: "Tầm Tướng Ký: đủ tám sứ quân Gói 2", gold: 600, heroIds: ["hero.ngoXuongXi", "hero.nguyenKhoan", "hero.kieuCongHan", "hero.kieuThuan", "hero.lyKhue", "hero.nguyenThuTiep", "hero.luDuong", "hero.nguyenSieu"] },
    { id: "ttk.pack-2.thapNhi", title: "Tầm Tướng Ký: đủ mười hai sứ quân", gold: 800, heroIds: ["hero.phamBachHo", "hero.doCanhThac", "hero.tranLam", "hero.ngoNhatKhanh", "hero.ngoXuongXi", "hero.nguyenKhoan", "hero.kieuCongHan", "hero.kieuThuan", "hero.lyKhue", "hero.nguyenThuTiep", "hero.luDuong", "hero.nguyenSieu"] },
    { id: "ttk.pack-2.dacBiet", title: "Tầm Tướng Ký: đủ ba tướng đặc biệt", gold: 300, heroIds: ["hero.dinhNgoc", "hero.vuPhong", "hero.dinhBoLinh"] },
    { id: "ttk.pack-2.all", title: "Tầm Tướng Ký: đủ Gói 2", gold: 1000, heroIds: ["hero.ngoXuongXi", "hero.nguyenKhoan", "hero.kieuCongHan", "hero.kieuThuan", "hero.lyKhue", "hero.nguyenThuTiep", "hero.luDuong", "hero.nguyenSieu", "hero.dinhBoLinh"] },
  ],
};

/**
 * Gộp các gói thành một sổ: node và công thức trùng ID chỉ giữ một bản (gói sau không được đổi nghĩa ID đã có).
 * Thành tựu của từng gói giữ nguyên.
 */
export function mergePacks(id: string, nameVi: string, packs: readonly Pack[]): Pack {
  const nodes = new Map<string, CatalogNode>();
  const recipes = new Map<string, Recipe>();
  for (const p of packs) {
    for (const n of p.nodes) if (!nodes.has(n.id)) nodes.set(n.id, n);
    for (const x of p.recipes) if (!recipes.has(x.id)) recipes.set(x.id, x);
  }
  return {
    id,
    nameVi,
    contentVersion: Math.max(...packs.map((p) => p.contentVersion)),
    status: packs.every((p) => p.status === "published") ? "published" : "draft",
    nodes: [...nodes.values()],
    recipes: [...recipes.values()],
    achievementSets: packs.flatMap((p) => p.achievementSets ?? []),
  };
}

/** Sổ gộp Gói 1 + Gói 2 (khi cờ Gói 2 bật). */
export const PACK_1_2: Pack = mergePacks("pack-1-2", "Gói 1 + Gói 2", [PACK_1, PACK_2]);

/** Tên các gói theo `pack` của tướng, cho Tướng Lục chia mục. */
export const PACK_NAMES: Readonly<Record<string, string>> = { "pack-1": PACK_1.nameVi, "pack-2": PACK_2.nameVi };

/** Mọi node và công thức của mọi gói đã viết: khi rút một gói, sổ người chơi không mất khám phá của gói đó. */
export const KNOWN_NODE_IDS: ReadonlySet<string> = new Set(PACK_1_2.nodes.map((n) => n.id));
export const KNOWN_RECIPE_IDS: ReadonlySet<string> = new Set(PACK_1_2.recipes.map((x) => x.id));

/** Sổ theo mã server trả về (`TtkView.packId`), để client vẽ đúng sổ đang chạy. Mã lạ thì dùng Gói 1. */
const PACKS_BY_ID: Readonly<Record<string, Pack>> = { "pack-1": PACK_1, "pack-1-2": PACK_1_2 };
const CATALOG_CACHE = new Map<string, Catalog>();
export function catalogForPack(packId: string | undefined): Catalog {
  const pack = (packId && PACKS_BY_ID[packId]) || PACK_1;
  let hit = CATALOG_CACHE.get(pack.id);
  if (!hit) CATALOG_CACHE.set(pack.id, (hit = buildCatalog(pack)));
  return hit;
}

/** Sổ server đang chạy theo cờ: Gói 1, hoặc Gói 1 + Gói 2. */
export function activePack(pack2: boolean): Pack {
  return pack2 ? PACK_1_2 : PACK_1;
}

/** Tập con của một pack gồm các tướng chọn và mọi node, công thức trên đường tới họ (cùng ID). */
export function subPack(pack: Pack, id: string, nameVi: string, heroIds: readonly string[]): Pack {
  const byResult = new Map(pack.recipes.map((x) => [x.result, x]));
  const keep = new Set<string>(pack.nodes.filter((n) => n.kind === "element").map((n) => n.id));
  const visit = (nodeId: string) => {
    if (keep.has(nodeId)) return;
    keep.add(nodeId);
    const x = byResult.get(nodeId);
    if (x) {
      visit(x.first);
      visit(x.second);
    }
  };
  heroIds.forEach(visit);
  return {
    id,
    nameVi,
    contentVersion: pack.contentVersion,
    status: "draft",
    nodes: pack.nodes.filter((n) => keep.has(n.id)),
    recipes: pack.recipes.filter((x) => keep.has(x.result)),
    achievementSets: [
      { id: `ttk.${id}.lichSu`, title: "Tầm Tướng Ký: đủ tướng lịch sử gói thử", gold: 200, heroIds: heroIds.filter((h) => pack.nodes.find((n) => n.id === h)?.tier === "lichSu") },
      { id: `ttk.${id}.all`, title: "Tầm Tướng Ký: đủ gói thử", gold: 1000, heroIds },
    ],
  };
}

/** Slice 3 tướng (LT-01): Nguyễn Bặc, Lê Hoàn, Đinh Ngọc; tập con của Gói 1, dùng cho test. */
export const SLICE_PACK: Pack = subPack(PACK_1, "slice-1", "Slice thử nghiệm", ["hero.nguyenBac", "hero.leHoan", "hero.dinhNgoc"]);

/** Gói server đang chạy khi cờ bật. */
export const ACTIVE_PACK: Pack = PACK_1;

/**
 * Gói đã duyệt nội dung: thành tựu của chúng nằm trong danh sách thành tựu. Trang Nhiệm vụ chỉ hiện thành tựu `ttk.*` khi
 * cờ TAM_TUONG_KY_ENABLED bật; cờ tắt thì không ai có tiến độ nên cũng không nhận được.
 */
export const PUBLISHED_PACKS: readonly Pack[] = [PACK_1, PACK_2].filter((p) => p.status === "published");

/** Bậc và nghề/hệ đọc từ roster, không chép vào catalog. Đinh Bộ Lĩnh chưa có (P-27, gói 2). */
export function rosterCharacter(characterId: string): CharacterInfo | undefined {
  // Đinh Bộ Lĩnh là nhân vật chính, nghề/hệ đổi theo người chơi; trong Tầm Tướng Ký là bậc đặc biệt (A-21, P-27).
  // Nghề/hệ dưới đây là mặc định của hồ sơ mới, chỉ để hiển thị.
  if (characterId === "dinhBoLinh") return { profession: "tuongSi", element: "moc", tier: "dacBiet" };
  const special = specialById(characterId);
  if (special) return { profession: special.profession, element: special.element, tier: "dacBiet" };
  const c = companionById(characterId);
  if (!c) return undefined;
  return { profession: c.profession, element: c.element, tier: isHero(c.id) || isWarlord(c.id) ? "lichSu" : "thuong" };
}

/** Phụ thuộc mặc định trong core; chân dung nằm ở tầng app nên test truyền vào. */
export const CORE_CATALOG_DEPS: CatalogDeps = {
  character: rosterCharacter,
  hasHistorySource: (id) => historySource(id) !== undefined,
};
