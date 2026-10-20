// Đội hình khởi đầu: nhân vật chính và 5 nhân vật kèm hư cấu.
// Chỉ số và nguyên tố của nhân vật kèm là điểm xuất phát, chờ mô phỏng cân bằng.

import { heroSkills, mainSkills, professionSkills, ultimateOf } from "../battle/skills";
import type { Element } from "../battle/elements";
import type { Profession } from "../battle/rules";
import type { FighterConfig } from "../battle/state";

export interface BaseStats {
  readonly maxHp: number;
  readonly atk: number;
  readonly def: number;
}

/** Chỉ số gốc theo nghề, cùng một cấp. Điểm xuất phát. */
export const BASE_STATS: Readonly<Record<Profession, BaseStats>> = {
  tuongSi: { maxHp: 500, atk: 55, def: 10 },
  phapSu: { maxHp: 450, atk: 55, def: 8 },
  binhLinh: { maxHp: 600, atk: 45, def: 15 },
  ySu: { maxHp: 475, atk: 45, def: 10 },
  muuSi: { maxHp: 475, atk: 50, def: 10 },
  quanSu: { maxHp: 475, atk: 50, def: 10 },
};

/** Nhân vật chính mặc định: Đinh Bộ Lĩnh, Tướng sĩ, bộ kỹ năng theo nguyên tố đã chọn. */
export function mainCharacter(element: Element = "moc", profession: Profession = "tuongSi"): FighterConfig {
  return {
    id: "dinhBoLinh",
    name: "Đinh Bộ Lĩnh",
    element,
    profession,
    ...BASE_STATS[profession],
    skills: mainSkills(element).map((s) => s.id),
  };
}

function companion(id: string, name: string, profession: Profession, element: Element): FighterConfig {
  return {
    id,
    name,
    element,
    profession,
    ...BASE_STATS[profession],
    // Bản mở hết: chiêu nấc 1–2 và tuyệt chiêu nấc 3. Tiến trình lọc lại theo cấp ở buildCompanion.
    skills: [...professionSkills(profession), ultimateOf(id)].flatMap((s) => (s ? [s.id] : [])),
  };
}

/** 5 nhân vật kèm khởi đầu, mỗi người một nghề còn lại. Nguyên tố là điểm xuất phát. */
export const STARTER_COMPANIONS: readonly FighterConfig[] = [
  companion("haVan", "Hà Vân", "phapSu", "hoa"),
  companion("leThach", "Lê Thạch", "binhLinh", "tho"),
  companion("maiThanh", "Mai Thanh", "ySu", "thuy"),
  companion("toKim", "Tô Kim", "muuSi", "kim"),
  companion("phungPhong", "Phùng Phong", "quanSu", "phong"),
];

export interface ShopCompanion {
  readonly fighter: FighterConfig;
  /** Giá vàng. */
  readonly price: number;
}

/**
 * Nhân vật kèm bán ở cửa hàng: 2 người mỗi nghề, nguyên tố rải đủ 7 hệ. Giá chia 2 mức (khoảng 20 và 40
 * trận thắng), cân theo người cày nhiều nhất. Điểm xuất phát, xem docs/design/08-tien-trinh-kinh-te.md mục 3.
 */
export const SHOP_PRICES = { basic: 1500, elite: 3000 } as const;

export const SHOP_COMPANIONS: readonly ShopCompanion[] = [
  { fighter: companion("tranCuong", "Trần Cương", "tuongSi", "kim"), price: SHOP_PRICES.basic },
  { fighter: companion("lyLiet", "Lý Liệt", "tuongSi", "hoa"), price: SHOP_PRICES.elite },
  { fighter: companion("daoLam", "Đào Lam", "phapSu", "thuy"), price: SHOP_PRICES.basic },
  { fighter: companion("vuLoi", "Vũ Lôi", "phapSu", "loi"), price: SHOP_PRICES.elite },
  { fighter: companion("hoangMoc", "Hoàng Mộc", "binhLinh", "moc"), price: SHOP_PRICES.basic },
  { fighter: companion("caoKien", "Cao Kiên", "binhLinh", "kim"), price: SHOP_PRICES.elite },
  { fighter: companion("lucDiep", "Lục Diệp", "ySu", "moc"), price: SHOP_PRICES.basic },
  { fighter: companion("bachSuong", "Bạch Sương", "ySu", "phong"), price: SHOP_PRICES.elite },
  { fighter: companion("ninhHoa", "Ninh Hỏa", "muuSi", "hoa"), price: SHOP_PRICES.basic },
  { fighter: companion("quachAn", "Quách Ẩn", "muuSi", "thuy"), price: SHOP_PRICES.elite },
  { fighter: companion("taThach", "Tạ Thạch", "quanSu", "tho"), price: SHOP_PRICES.basic },
  { fighter: companion("macVan", "Mạc Vân", "quanSu", "loi"), price: SHOP_PRICES.elite },
];

/**
 * Tướng lịch sử gia nhập đội qua chiến dịch: bộ 6 kỹ năng theo nguyên tố như nhân vật chính, nâng theo ô.
 * Nghề và nguyên tố là điểm xuất phát, xem docs/design/09-che-do-choi.md mục 2.1.
 */
export const HERO_COMPANIONS: readonly FighterConfig[] = [
  hero("nguyenBac", "Nguyễn Bặc", "tuongSi", "hoa"),
  hero("dinhDien", "Đinh Điền", "binhLinh", "tho"),
  hero("luuCo", "Lưu Cơ", "muuSi", "kim"),
  hero("trinhTu", "Trịnh Tú", "ySu", "moc"),
  hero("leHoan", "Lê Hoàn", "quanSu", "loi"),
  hero("dinhLien", "Đinh Liễn", "phapSu", "thuy"),
];

function hero(id: string, name: string, profession: Profession, element: Element): FighterConfig {
  return { ...mainCharacter(element, profession), id, name, skills: heroSkills(element, id).map((s) => s.id) };
}

/** Tướng lịch sử: kỹ năng nâng theo ô như nhân vật chính, không có chiêu nhánh hay tuyệt chiêu riêng. */
export function isHero(id: string): boolean {
  return HERO_COMPANIONS.some((c) => c.id === id);
}

/** Mọi nhân vật kèm: khởi đầu, cửa hàng rồi tướng lịch sử. */
export const ALL_COMPANIONS: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
  ...HERO_COMPANIONS,
];

export function companionById(id: string): FighterConfig | undefined {
  return ALL_COMPANIONS.find((c) => c.id === id);
}

export function shopPrice(id: string): number | undefined {
  return SHOP_COMPANIONS.find((c) => c.fighter.id === id)?.price;
}
