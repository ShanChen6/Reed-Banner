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
};

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
