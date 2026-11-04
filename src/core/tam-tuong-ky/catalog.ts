// Catalog Tầm Tướng Ký. LT-01: slice 3 tướng Nguyễn Bặc, Lê Hoàn, Đinh Ngọc (Design Freeze P-30), trạng thái draft.
// Công thức là biểu trưng của trò chơi, không phải diễn giải sử học. Vật biểu trưng lấy từ art đã có:
// Nguyễn Bặc đại đao đơn lưỡi + dải vải đỏ; Lê Hoàn cờ lệnh tam giác + bó thẻ tre
// (docs/06-art/prompts/v4-2/14-group-a-19-character-weapon-pose-audit.md); Đinh Ngọc kiếm ngắn thẳng + mặt ngọc giọt nước
// (docs/03-characters/dinh-ngoc.md). Audit: docs/02-game-modes/future/15-tam-tuong-ky-lt01-catalog.md.

import { ELEMENTS, type Element } from "../battle";
import { historySource } from "../campaign/history";
import { companionById, isHero, isWarlord, specialById } from "../roster/roster";
import type { CatalogDeps, CatalogNode, CharacterInfo, Pack, Recipe } from "./types";

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

const SLICE_NODES: readonly CatalogNode[] = [
  ...STARTER_NODES,
  // Bậc 1: ghép hai starter.
  mat("reed", "Lau sậy", "thien-nhien"),
  mat("herbs", "Dược thảo", "thien-nhien", "Nhánh phụ, minh họa thứ tự ô ngược với Lau sậy"),
  mat("forgedIron", "Sắt rèn", "binh-khi"),
  mat("bamboo", "Tre", "thien-nhien"),
  mat("cloth", "Vải gai", "co-hieu"),
  mat("storm", "Giông tố", "thien-nhien"),
  mat("charcoal", "Than củi", "thu-tich"),
  mat("dew", "Giọt sương", "ngoc"),
  mat("jadeStone", "Đá ngọc thô", "ngoc"),
  mat("rampart", "Lũy đất", "thien-nhien"),
  // Bậc sau.
  mat("warDrum", "Trống trận", "co-hieu"),
  mat("ink", "Mực", "thu-tich"),
  mat("road", "Đường xa", "thien-nhien"),
  mat("commandFlag", "Cờ lệnh", "co-hieu"),
  mat("bambooSlips", "Thẻ tre", "thu-tich"),
  know("warManual", "Binh thư", "thu-tich"),
  know("tenCircuits", "Thập đạo", "co-hieu", "Gợi tới chiêu Thập Đạo Lôi Binh của Lê Hoàn"),
  mat("reedBanner", "Cờ lau", "co-hieu"),
  mat("redSash", "Dải vải đỏ", "co-hieu"),
  mat("greatBlade", "Đại đao", "binh-khi"),
  mat("sashedBlade", "Đại đao buộc vải đỏ", "binh-khi"),
  know("fireBanner", "Hỏa kỳ", "co-hieu", "Gợi tới chiêu Định Quốc Hỏa Kỳ của Nguyễn Bặc"),
  mat("shortSword", "Kiếm ngắn", "binh-khi"),
  mat("dropJade", "Ngọc giọt nước", "ngoc"),
  mat("jadeSword", "Kiếm ngọc", "binh-khi"),
  // Tướng.
  {
    id: "hero.nguyenBac",
    kind: "character",
    nameVi: "Nguyễn Bặc",
    characterId: "nguyenBac",
    tier: "lichSu",
    historySourceIds: ["S04"],
    note: "Tước Định Quốc công gợi ý từ tên chiêu; cần thêm claim vào sổ nguồn trước khi hiện trong Tướng Lục",
  },
  {
    id: "hero.leHoan",
    kind: "character",
    nameVi: "Lê Hoàn",
    characterId: "leHoan",
    tier: "lichSu",
    historySourceIds: ["S04"],
    note: "Chức Thập đạo tướng quân gợi ý từ tên chiêu; cần thêm claim vào sổ nguồn trước khi hiện trong Tướng Lục",
  },
  { id: "hero.dinhNgoc", kind: "character", nameVi: "Đinh Ngọc", characterId: "dinhNgoc", tier: "dacBiet" },
];

const r = (id: string, first: string, second: string, result: string, reason: string): Recipe => ({
  id: `r.${id}`,
  first,
  second,
  result,
  reason,
});

const SLICE_RECIPES: readonly Recipe[] = [
  // Bậc 1. Cặp gương moc/thuy ra hai kết quả khác nhau (A-4).
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
  // Lê Hoàn: cờ lệnh tam giác và bó thẻ tre.
  r("warDrum", "mat.storm", "elt.moc", "mat.warDrum", "Tiếng giông vang trên mặt gỗ thành trống trận"),
  r("ink", "mat.charcoal", "elt.thuy", "mat.ink", "Than củi mài với nước thành mực"),
  r("commandFlag", "mat.bamboo", "mat.cloth", "mat.commandFlag", "Cán tre buộc vải thành cờ lệnh"),
  r("bambooSlips", "mat.bamboo", "elt.kim", "mat.bambooSlips", "Dao kim chẻ tre thành thẻ"),
  r("warManual", "mat.bambooSlips", "mat.ink", "know.warManual", "Mực viết lên thẻ tre thành binh thư"),
  r("tenCircuits", "mat.commandFlag", "mat.warDrum", "know.tenCircuits", "Cờ và trống điều động nhiều đạo quân"),
  r("leHoan", "know.tenCircuits", "know.warManual", "hero.leHoan", "Người điều mười đạo quân theo binh thư"),
  // Nguyễn Bặc: đại đao đơn lưỡi buộc dải vải đỏ, cờ lửa.
  r("redSash", "mat.cloth", "elt.hoa", "mat.redSash", "Vải nhuộm sắc lửa thành dải vải đỏ"),
  r("reedBanner", "mat.reed", "mat.redSash", "mat.reedBanner", "Lau sậy buộc dải vải đỏ thành cờ lau"),
  r("greatBlade", "mat.forgedIron", "mat.bamboo", "mat.greatBlade", "Lưỡi sắt tra cán dài thành đại đao"),
  r("sashedBlade", "mat.greatBlade", "mat.redSash", "mat.sashedBlade", "Đại đao buộc dải vải đỏ"),
  r("fireBanner", "mat.reedBanner", "elt.hoa", "know.fireBanner", "Cờ lau rực lửa thành hỏa kỳ"),
  r("nguyenBac", "mat.sashedBlade", "know.fireBanner", "hero.nguyenBac", "Đại đao tua đỏ dưới hỏa kỳ"),
  // Đinh Ngọc: kiếm ngắn thẳng và mặt ngọc giọt nước; chủ đề cứu trợ, giữ đường.
  r("road", "mat.rampart", "elt.phong", "mat.road", "Lũy đất trải theo gió thành đường xa"),
  r("shortSword", "mat.forgedIron", "elt.kim", "mat.shortSword", "Sắt rèn mài thêm kim thành kiếm ngắn"),
  r("dropJade", "mat.jadeStone", "mat.dew", "mat.dropJade", "Đá ngọc mài theo hình giọt sương"),
  r("jadeSword", "mat.shortSword", "mat.dropJade", "mat.jadeSword", "Kiếm ngắn đi cùng mặt ngọc"),
  r("dinhNgoc", "mat.jadeSword", "mat.road", "hero.dinhNgoc", "Người mang kiếm ngọc giữ đường xa"),
];

export const SLICE_PACK: Pack = {
  id: "slice-1",
  nameVi: "Slice thử nghiệm",
  contentVersion: 1,
  status: "draft",
  nodes: SLICE_NODES,
  recipes: SLICE_RECIPES,
  // Thử nghiệm cơ chế thành tựu bộ; số vàng theo khung P-21 (bộ 2 tướng 200, cả gói 1 000), gói thật đặt riêng.
  achievementSets: [
    { id: "ttk.slice-1.lichSu", title: "Tầm Tướng Ký: đủ tướng lịch sử gói thử", gold: 200, heroIds: ["hero.nguyenBac", "hero.leHoan"] },
    { id: "ttk.slice-1.all", title: "Tầm Tướng Ký: đủ gói thử", gold: 1000, heroIds: ["hero.nguyenBac", "hero.leHoan", "hero.dinhNgoc"] },
  ],
};

// ——— Gói 1 (LT-05): 10 tướng lịch sử + 2 tướng đặc biệt (Design Freeze A-17, mục 5). ———
// Giữ nguyên mọi node và công thức của slice-1 (ID ổn định) nên sổ khám phá cũ chuyển sang không mất gì.
// Vật biểu trưng theo art: docs/06-art/prompts/v4-2/14-group-a-19-character-weapon-pose-audit.md (tướng lịch sử, sứ quân),
// docs/03-characters/dinh-ngoc.md, docs/03-characters/vu-phong.md. Báo cáo: docs/02-game-modes/future/18-tam-tuong-ky-lt05-pack-1.md.

const hero = (characterId: string, nameVi: string, tier: CatalogNode["tier"], historySourceIds?: readonly string[], note?: string): CatalogNode => ({
  id: `hero.${characterId}`,
  kind: "character",
  nameVi,
  characterId,
  tier,
  historySourceIds,
  note,
});

/** Sứ quân: danh sách Thập nhị sứ quân trong Toàn thư (S01) và Việt Nam sử lược (S05). */
const WARLORD_SOURCES = ["S01", "S05"] as const;

const PACK_1_NEW_NODES: readonly CatalogNode[] = [
  // Bậc 1 mới.
  mat("rattan", "Dây mây", "thien-nhien"),
  mat("feather", "Lông vũ", "thien-nhien"),
  mat("blackBronze", "Đồng đen", "binh-khi"),
  mat("mountain", "Núi", "thien-nhien"),
  mat("boulder", "Đá tảng", "thien-nhien"),
  mat("estuary", "Cửa sông", "thien-nhien"),
  mat("cloud", "Mây trời", "thien-nhien"),
  mat("staffShaft", "Cán gỗ bịt đồng", "binh-khi"),
  // Đinh Điền: giáo cán gỗ mũi lá, chùm lông lau, khiên mây.
  mat("spearHead", "Mũi giáo lá", "binh-khi"),
  mat("spear", "Giáo cán gỗ", "binh-khi"),
  mat("reedTassel", "Chùm lông lau", "co-hieu"),
  mat("tasselSpear", "Giáo chùm lông lau", "binh-khi"),
  mat("wovenRattan", "Mây đan", "thien-nhien"),
  mat("rattanShield", "Khiên mây", "binh-khi"),
  // Lưu Cơ: quạt lông trắng nan tỏa từ hoa thị đồng đen; phủ lệnh.
  mat("bronzeRosette", "Hoa thị đồng", "binh-khi"),
  mat("featherFan", "Quạt lông trắng", "co-hieu"),
  mat("seal", "Ấn đồng", "thu-tich"),
  know("decree", "Phủ lệnh", "thu-tich", "Gợi tới chiêu Đô Hộ Phủ Lệnh của Lưu Cơ"),
  // Trịnh Tú: hồ lô thuốc nắp đồng, tua xanh; thảo dược.
  mat("gourd", "Quả bầu", "thien-nhien"),
  mat("cappedGourd", "Hồ lô nắp đồng", "ngoc"),
  mat("greenTassel", "Tua xanh", "co-hieu"),
  mat("medicineGourd", "Hồ lô thuốc", "ngoc"),
  { ...know("herbalBook", "Sách thuốc", "thu-tich", "Gợi tới chiêu Hoa Lư Thảo Dược của Trịnh Tú"), professionHint: "ySu" },
  // Đinh Liễn: trượng gỗ đồng đầu cầu Thủy; vương ấn.
  mat("waterOrb", "Ngọc cầu Thủy", "ngoc", "Cặp gương với Ngọc giọt nước (Đá ngọc thô + Giọt sương)"),
  mat("waterStaff", "Trượng đầu cầu Thủy", "binh-khi"),
  know("royalSeal", "Vương ấn", "thu-tich", "Gợi tới chiêu Nam Việt Vương Ấn của Đinh Liễn"),
  // Phạm Bạch Hổ: đại đao rộng sống khía, cán quấn lông trắng; bạch hổ xuất sơn.
  mat("notchedBlade", "Đại đao sống khía", "binh-khi"),
  mat("featherGrip", "Đại đao cán quấn lông", "binh-khi"),
  know("whiteTiger", "Bạch hổ", "thien-nhien"),
  know("tigerLeaves", "Hổ xuất sơn", "thien-nhien", "Gợi tới chiêu Bạch Hổ Xuất Sơn của Phạm Bạch Hổ"),
  // Đỗ Cảnh Thạc: búa chiến cán dài đầu đồng vuông; kiên tâm.
  mat("bronzeHead", "Đầu búa đồng vuông", "binh-khi"),
  mat("longShaft", "Cán dài", "binh-khi"),
  mat("warHammer", "Búa chiến", "binh-khi"),
  mat("fortress", "Lũy kép", "thien-nhien"),
  know("steadfast", "Kiên tâm", "thu-tich", "Gợi tới chiêu Đỗ Động Kiên Tâm của Đỗ Cảnh Thạc"),
  // Trần Lãm: cờ lệnh, trấn giữ cửa sông; thuyền.
  know("riverGuard", "Trấn giang", "co-hieu", "Gợi tới chiêu Bố Hải Trấn Giang của Trần Lãm"),
  mat("boat", "Thuyền", "thien-nhien"),
  know("navy", "Thủy quân", "co-hieu"),
  // Ngô Nhật Khánh: cờ lệnh trong gió; làng Đường Lâm.
  know("windRise", "Phong khởi", "thien-nhien", "Gợi tới chiêu Đường Lâm Phong Khởi của Ngô Nhật Khánh"),
  mat("windFlag", "Cờ lệnh trong gió", "co-hieu"),
  mat("village", "Lũy tre làng", "thien-nhien"),
  mat("duongLam", "Làng Đường Lâm", "thien-nhien"),
  // Trần Vũ Phong: trượng trúc bịt đồng, hồ lô nước; vân du.
  mat("bambooStaff", "Trượng trúc", "binh-khi"),
  mat("waterGourd", "Hồ lô nước", "ngoc"),
  mat("travelPack", "Hành trang vân du", "thien-nhien"),
  // Tướng.
  hero("dinhDien", "Đinh Điền", "lichSu", ["S04"]),
  hero("luuCo", "Lưu Cơ", "lichSu", ["S04"]),
  hero("trinhTu", "Trịnh Tú", "lichSu", ["S04"]),
  hero("dinhLien", "Đinh Liễn", "lichSu", ["S04"]),
  hero("phamBachHo", "Phạm Bạch Hổ", "lichSu", WARLORD_SOURCES),
  hero("doCanhThac", "Đỗ Cảnh Thạc", "lichSu", WARLORD_SOURCES),
  hero("tranLam", "Trần Lãm", "lichSu", WARLORD_SOURCES),
  hero("ngoNhatKhanh", "Ngô Nhật Khánh", "lichSu", WARLORD_SOURCES),
  hero("vuPhong", "Trần Vũ Phong", "dacBiet"),
];

const PACK_1_NEW_RECIPES: readonly Recipe[] = [
  // Bậc 1 mới. Cặp gương với slice: Kim>Thổ (Đồng đen) ≠ Thổ>Kim (Đá ngọc thô).
  r("rattan", "elt.moc", "elt.tho", "mat.rattan", "Cây mọc trên đất thành dây mây"),
  r("feather", "elt.phong", "elt.phong", "mat.feather", "Gió nối gió, chim bay để lại lông vũ"),
  r("blackBronze", "elt.kim", "elt.tho", "mat.blackBronze", "Kim vùi trong đất lâu ngày thành đồng đen"),
  r("mountain", "elt.tho", "elt.phong", "mat.mountain", "Đất dồn đón gió thành núi"),
  r("boulder", "elt.tho", "elt.hoa", "mat.boulder", "Đất nung trong lửa thành đá tảng"),
  r("estuary", "elt.thuy", "elt.tho", "mat.estuary", "Nước gặp đất thành cửa sông"),
  r("cloud", "elt.thuy", "elt.phong", "mat.cloud", "Hơi nước theo gió thành mây"),
  r("staffShaft", "elt.moc", "elt.kim", "mat.staffShaft", "Gỗ bịt kim thành cán bịt đồng"),
  // Đinh Điền.
  r("spearHead", "mat.forgedIron", "elt.moc", "mat.spearHead", "Sắt rèn theo hình lá thành mũi giáo"),
  r("spear", "mat.spearHead", "mat.bamboo", "mat.spear", "Mũi giáo tra cán thành giáo"),
  r("reedTassel", "mat.reed", "elt.phong", "mat.reedTassel", "Bông lau bay trong gió thành chùm lông lau"),
  r("tasselSpear", "mat.spear", "mat.reedTassel", "mat.tasselSpear", "Giáo buộc chùm lông lau"),
  r("wovenRattan", "mat.rattan", "mat.rattan", "mat.wovenRattan", "Dây mây đan với dây mây"),
  r("rattanShield", "mat.wovenRattan", "elt.tho", "mat.rattanShield", "Mây đan dày như đất thành khiên"),
  r("dinhDien", "mat.tasselSpear", "mat.rattanShield", "hero.dinhDien", "Giáo chùm lông lau và khiên mây"),
  // Lưu Cơ.
  r("bronzeRosette", "mat.blackBronze", "elt.hoa", "mat.bronzeRosette", "Đồng đen đúc thành hoa thị"),
  r("featherFan", "mat.feather", "mat.bronzeRosette", "mat.featherFan", "Lông vũ tỏa nan từ hoa thị đồng"),
  r("seal", "mat.blackBronze", "mat.ink", "mat.seal", "Đồng đen khắc chữ, chấm mực thành ấn"),
  r("decree", "mat.bambooSlips", "mat.seal", "know.decree", "Thẻ tre đóng ấn thành phủ lệnh"),
  r("luuCo", "mat.featherFan", "know.decree", "hero.luuCo", "Quạt lông trắng và phủ lệnh"),
  // Trịnh Tú.
  r("gourd", "elt.moc", "mat.dew", "mat.gourd", "Dây leo uống sương kết quả bầu"),
  r("cappedGourd", "mat.gourd", "mat.blackBronze", "mat.cappedGourd", "Quả bầu khô đậy nắp đồng"),
  r("greenTassel", "mat.cloth", "elt.moc", "mat.greenTassel", "Vải nhuộm lá thành tua xanh"),
  r("medicineGourd", "mat.cappedGourd", "mat.greenTassel", "mat.medicineGourd", "Hồ lô buộc tua xanh đựng thuốc"),
  r("herbalBook", "mat.herbs", "mat.bambooSlips", "know.herbalBook", "Dược thảo ghi lên thẻ tre thành sách thuốc"),
  r("trinhTu", "mat.medicineGourd", "know.herbalBook", "hero.trinhTu", "Hồ lô thuốc và sách thuốc"),
  // Đinh Liễn. Cặp gương: Giọt sương>Đá ngọc thô (Ngọc cầu Thủy) ≠ Đá ngọc thô>Giọt sương (Ngọc giọt nước).
  r("waterOrb", "mat.dew", "mat.jadeStone", "mat.waterOrb", "Sương đọng trên đá ngọc thành cầu Thủy"),
  r("waterStaff", "mat.staffShaft", "mat.waterOrb", "mat.waterStaff", "Cán bịt đồng gắn cầu Thủy thành trượng"),
  r("royalSeal", "mat.seal", "mat.cloth", "know.royalSeal", "Ấn đồng bọc khăn thành vương ấn"),
  r("dinhLien", "mat.waterStaff", "know.royalSeal", "hero.dinhLien", "Trượng cầu Thủy và vương ấn"),
  // Phạm Bạch Hổ.
  r("notchedBlade", "mat.greatBlade", "mat.forgedIron", "mat.notchedBlade", "Đại đao tôi thêm sắt, sống mài khía"),
  r("featherGrip", "mat.notchedBlade", "mat.feather", "mat.featherGrip", "Cán đao quấn lông trắng"),
  r("whiteTiger", "mat.mountain", "elt.kim", "know.whiteTiger", "Núi phương Kim sắc trắng, nơi bạch hổ ở"),
  r("tigerLeaves", "know.whiteTiger", "mat.mountain", "know.tigerLeaves", "Bạch hổ rời núi"),
  r("phamBachHo", "mat.featherGrip", "know.tigerLeaves", "hero.phamBachHo", "Đại đao cán lông trắng và hổ xuất sơn"),
  // Đỗ Cảnh Thạc.
  r("bronzeHead", "mat.blackBronze", "mat.rampart", "mat.bronzeHead", "Đồng đen đúc khối vuông như lũy"),
  r("longShaft", "mat.bamboo", "elt.moc", "mat.longShaft", "Tre nối gỗ thành cán dài"),
  r("warHammer", "mat.bronzeHead", "mat.longShaft", "mat.warHammer", "Đầu đồng vuông tra cán dài thành búa chiến"),
  r("fortress", "mat.rampart", "mat.rampart", "mat.fortress", "Lũy đắp thêm lũy"),
  r("steadfast", "mat.fortress", "mat.boulder", "know.steadfast", "Lũy kép chèn đá tảng, lòng không lay"),
  r("doCanhThac", "mat.warHammer", "know.steadfast", "hero.doCanhThac", "Búa chiến và lòng kiên tâm"),
  // Trần Lãm.
  r("riverGuard", "mat.estuary", "mat.commandFlag", "know.riverGuard", "Cắm cờ lệnh giữ cửa sông"),
  r("boat", "mat.bamboo", "elt.thuy", "mat.boat", "Tre thả xuống nước thành thuyền"),
  r("navy", "mat.boat", "mat.commandFlag", "know.navy", "Thuyền theo cờ lệnh thành thủy quân"),
  r("tranLam", "know.riverGuard", "know.navy", "hero.tranLam", "Trấn giữ cửa sông bằng thủy quân"),
  // Ngô Nhật Khánh.
  r("windRise", "mat.storm", "mat.storm", "know.windRise", "Giông dồn giông thành phong khởi"),
  r("windFlag", "mat.commandFlag", "know.windRise", "mat.windFlag", "Cờ lệnh tung trong gió nổi"),
  r("village", "mat.bamboo", "mat.rampart", "mat.village", "Tre trồng quanh lũy thành lũy tre làng"),
  r("duongLam", "mat.village", "elt.tho", "mat.duongLam", "Lũy tre trên đất cổ thành làng Đường Lâm"),
  r("ngoNhatKhanh", "mat.windFlag", "mat.duongLam", "hero.ngoNhatKhanh", "Cờ lệnh nổi gió ở Đường Lâm"),
  // Trần Vũ Phong: chủ đề rong ruổi, tìm người.
  r("bambooStaff", "mat.bamboo", "mat.blackBronze", "mat.bambooStaff", "Trúc già bịt đồng thành trượng đi đường"),
  r("waterGourd", "mat.gourd", "elt.thuy", "mat.waterGourd", "Quả bầu đựng nước thành hồ lô nước"),
  r("travelPack", "mat.waterGourd", "mat.cloud", "mat.travelPack", "Hồ lô nước theo mây thành hành trang vân du"),
  r("vuPhong", "mat.bambooStaff", "mat.travelPack", "hero.vuPhong", "Trượng trúc và hành trang vân du"),
];

const set = (id: string, title: string, gold: number, heroIds: readonly string[]) => ({ id: `ttk.pack-1.${id}`, title: `Tầm Tướng Ký: ${title}`, gold, heroIds: heroIds.map((h) => `hero.${h}`) });

export const PACK_1: Pack = {
  id: "pack-1",
  nameVi: "Gói 1: Dẹp loạn",
  contentVersion: 1,
  status: "draft",
  nodes: [...SLICE_NODES, ...PACK_1_NEW_NODES],
  recipes: [...SLICE_RECIPES, ...PACK_1_NEW_RECIPES],
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

/** Gói server đang chạy khi cờ bật. Gói 1 còn `draft`: chỉ chạy sau cờ, chưa có thành tựu trên trang Nhiệm vụ. */
export const ACTIVE_PACK: Pack = PACK_1;

/** Gói đã phát hành: thành tựu của chúng hiện ở trang Nhiệm vụ. Chưa có gói nào. */
export const PUBLISHED_PACKS: readonly Pack[] = [PACK_1].filter((p) => p.status === "published");

/** Bậc và nghề/hệ đọc từ roster, không chép vào catalog. Đinh Bộ Lĩnh chưa có (P-27, gói 2). */
export function rosterCharacter(characterId: string): CharacterInfo | undefined {
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
