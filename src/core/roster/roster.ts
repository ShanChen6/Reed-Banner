// Nhân vật: Đinh Bộ Lĩnh, tướng thường (khởi đầu và cửa hàng), tướng lịch sử và sứ quân.
// Mọi nhân vật kèm mang bộ 3 chiêu nghề + 2 chiêu hệ + 1 chiêu riêng như Đinh Bộ Lĩnh, nâng theo ô; ô 4 là kỹ năng riêng.
// Xem docs/03-characters/danh-sach-nhan-vat.md; cân bằng bằng `pnpm sim -- --roster`.

import { chasePassives } from "../battle/chase";
import { PROFESSION_COMBO, type ComboPassiveId } from "../battle/combos";
import { characterSkills } from "../battle/skills";
import type { Element } from "../battle/elements";
import { NEW_PROFESSIONS_ENABLED, isLeaderProfession, type Profession } from "../battle/rules";
import type { FighterConfig } from "../battle/state";

export interface BaseStats {
  readonly maxHp: number;
  readonly atk: number;
  readonly def: number;
}

/** Chỉ số gốc theo nghề, cùng một cấp. Điểm xuất phát. */
export const BASE_STATS: Readonly<Record<Profession, BaseStats>> = {
  xaThu: { maxHp:475, atk:55, def:9 },
  satThu: { maxHp:450, atk:58, def:8 },
  tuongSi: { maxHp: 500, atk: 55, def: 10 },
  phapSu: { maxHp: 450, atk: 55, def: 8 },
  binhLinh: { maxHp: 600, atk: 45, def: 15 },
  ySu: { maxHp: 475, atk: 45, def: 10 },
  muuSi: { maxHp: 475, atk: 50, def: 10 },
  quanSu: { maxHp: 475, atk: 50, def: 10 },
};

/** Nhân vật chính mặc định: Đinh Bộ Lĩnh, Tướng sĩ; lắp bộ theo nghề và nguyên tố đã chọn. */
export function mainCharacter(element: Element = "moc", profession: Profession = "tuongSi"): FighterConfig {
  if (!isLeaderProfession(profession)) throw new RangeError(`Đinh Bộ Lĩnh chưa hỗ trợ nghề ${profession}`);
  return {
    id: "dinhBoLinh",
    name: "Đinh Bộ Lĩnh",
    element,
    profession,
    comboPassive: PROFESSION_COMBO[profession],
    chasePassives: chasePassives({profession,element}),
    ...BASE_STATS[profession],
    skills: characterSkills(profession, element).map((s) => s.id),
  };
}

/**
 * Nhân vật kèm: bộ 3 chiêu nghề + 2 chiêu hệ + 1 chiêu riêng như nhân vật chính, ô 4 thay bằng kỹ năng riêng (tuyệt chiêu
 * của tướng thường, chiêu riêng của tướng lịch sử và sứ quân). Bản mở hết; tiến trình lọc theo cấp ở buildHero.
 */
function companion(id: string, name: string, profession: Profession, element: Element, comboPassive: ComboPassiveId = PROFESSION_COMBO[profession]): FighterConfig {
  return { id, name, profession, element, ...BASE_STATS[profession], chasePassives:chasePassives({profession,element}), comboPassive, skills: characterSkills(profession, element, id).map((s) => s.id) };
}

/** 5 tướng thường khởi đầu, mỗi người một nghề còn lại. */
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
 * Tướng thường bán ở cửa hàng: cùng 5 người khởi đầu phủ đủ 6 nghề × 7 hệ, mỗi tổ hợp một người. Giá chia
 * 2 mức (khoảng 20 và 40 trận thắng), cân theo người cày nhiều nhất. Điểm xuất phát, xem docs/01-gameplay/tien-trinh-kinh-te.md mục 3.
 */
export const SHOP_PRICES = { basic: 1500, elite: 3000 } as const;

const LEGACY_SHOP_COMPANIONS: readonly ShopCompanion[] = [
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
  // Thêm 20/10/2026: cùng 5 người khởi đầu và 12 người trên phủ đủ 42 tổ hợp nghề × hệ.
  { fighter: companion("lamTung", "Lâm Tùng", "tuongSi", "moc"), price: SHOP_PRICES.basic },
  { fighter: companion("hoLang", "Hồ Lãng", "tuongSi", "thuy"), price: SHOP_PRICES.basic },
  { fighter: companion("khaSon", "Kha Sơn", "tuongSi", "tho"), price: SHOP_PRICES.basic },
  { fighter: companion("tongTan", "Tống Tấn", "tuongSi", "loi"), price: SHOP_PRICES.elite },
  { fighter: companion("huaLang", "Hứa Lăng", "tuongSi", "phong"), price: SHOP_PRICES.elite },
  { fighter: companion("chuNgan", "Chu Ngân", "phapSu", "kim"), price: SHOP_PRICES.basic },
  { fighter: companion("damThao", "Đàm Thảo", "phapSu", "moc"), price: SHOP_PRICES.basic },
  { fighter: companion("doanNham", "Doãn Nham", "phapSu", "tho"), price: SHOP_PRICES.elite },
  { fighter: companion("lieuYen", "Liễu Yên", "phapSu", "phong"), price: SHOP_PRICES.elite },
  { fighter: companion("thaiHa", "Thái Hà", "binhLinh", "thuy"), price: SHOP_PRICES.basic },
  { fighter: companion("truongViem", "Trương Viêm", "binhLinh", "hoa"), price: SHOP_PRICES.basic },
  { fighter: companion("ongChan", "Ông Chấn", "binhLinh", "loi"), price: SHOP_PRICES.elite },
  { fighter: companion("manhTuong", "Mạnh Tường", "binhLinh", "phong"), price: SHOP_PRICES.elite },
  { fighter: companion("chauNgoc", "Châu Ngọc", "ySu", "kim"), price: SHOP_PRICES.basic },
  { fighter: companion("hongDan", "Hồng Đan", "ySu", "hoa"), price: SHOP_PRICES.basic },
  { fighter: companion("beLien", "Bế Liên", "ySu", "tho"), price: SHOP_PRICES.elite },
  { fighter: companion("tieuMinh", "Tiêu Minh", "ySu", "loi"), price: SHOP_PRICES.elite },
  { fighter: companion("nhanTruc", "Nhan Trúc", "muuSi", "moc"), price: SHOP_PRICES.basic },
  { fighter: companion("maNhac", "Mã Nhạc", "muuSi", "tho"), price: SHOP_PRICES.basic },
  { fighter: companion("tuKinh", "Từ Kinh", "muuSi", "loi"), price: SHOP_PRICES.elite },
  { fighter: companion("buiPhieu", "Bùi Phiêu", "muuSi", "phong"), price: SHOP_PRICES.elite },
  { fighter: companion("nghiemThiet", "Nghiêm Thiết", "quanSu", "kim"), price: SHOP_PRICES.basic },
  { fighter: companion("samTue", "Sầm Tuệ", "quanSu", "moc"), price: SHOP_PRICES.basic },
  { fighter: companion("viTrieu", "Vi Triều", "quanSu", "thuy"), price: SHOP_PRICES.elite },
  { fighter: companion("tonDiem", "Tôn Diệm", "quanSu", "hoa"), price: SHOP_PRICES.elite },
];

/** Registry thử nghiệm: giữ ID/tiến trình kể cả khi release gate tắt. Chưa cấp miễn phí. */
export const EXPANSION_COMPANIONS: readonly FighterConfig[] = [
  {...companion("bachNoLang","Bạch Nỏ Lang","xaThu","kim"),chasePassives:["marksmanPrepared","kim1","rb_bnl_passive"]},
  {...companion("thanhLamXa","Thanh Lâm Xạ","xaThu","moc"),chasePassives:["marksmanPrepared","moc1","rb_tlx_passive"]},
  {...companion("lamGiangPhiDiep","Lam Giang Phi Diệp","xaThu","thuy"),chasePassives:["marksmanPrepared","thuy1","rb064_canhGioi"]},
  {...companion("xichDiemLuan","Xích Diệm Luân","xaThu","hoa"),chasePassives:["marksmanPrepared","hoa1","rb065_hoaCot"]},
  {...companion("tranSonThach","Trấn Sơn Thạch","xaThu","tho"),chasePassives:["marksmanPrepared","tho1","rb066_kienThu"]},
  {...companion("loiMinhXa","Lôi Minh Xạ","xaThu","loi"),chasePassives:["marksmanPrepared","loi1","rb067_chopThoiCo"]},
  {...companion("tatPhongLang","Tật Phong Lăng","xaThu","phong"),chasePassives:["marksmanPrepared","phong1","rb068_hoiNhip"]},
  {...companion("bachPhongDao","Bạch Phong Đao","satThu","kim"),chasePassives:["assassinPrepared","kim1","rb069_passive"]},
  {...companion("docAnh","Độc Ảnh","satThu","moc"),chasePassives:["assassinPrepared","moc1","rb070_passive"]},
  {...companion("hanGiangKhach","Hàn Giang Khách","satThu","thuy"),chasePassives:["assassinPrepared","thuy1","rb071_passive"]},
  {...companion("xichDa","Xích Dạ","satThu","hoa"),chasePassives:["assassinPrepared","hoa1","rb072_passive"]},
  {...companion("diaAn","Địa Ẩn","satThu","tho"),chasePassives:["assassinPrepared","tho1","rb073_passive"]},
  {...companion("loiAnh","Lôi Ảnh","satThu","loi"),chasePassives:["assassinPrepared","loi1","rb074_passive"]},
  {...companion("voAnh","Vô Ảnh","satThu","phong"),chasePassives:["assassinPrepared","phong1","rb075_passive"]},
];
/** Product IDs remain stable independently of camelCase runtime/save IDs. */
export const EXPANSION_CHARACTER_IDS: Readonly<Record<string,string>> = Object.fromEntries(EXPANSION_COMPANIONS.map((f,i)=>[`RB-${String(62+i).padStart(3,'0')}`,f.id]));
/** Giá basic 1.500 vàng/tướng được Shan chốt trong task PROF ngày 30/10/2026. */
export const EXPANSION_SHOP_COMPANIONS: readonly ShopCompanion[] = EXPANSION_COMPANIONS.map(fighter=>({fighter,price:SHOP_PRICES.basic}));
export const SHOP_COMPANIONS: readonly ShopCompanion[] = [...LEGACY_SHOP_COMPANIONS, ...(NEW_PROFESSIONS_ENABLED ? EXPANSION_SHOP_COMPANIONS : [])];
export function isReleasedCompanion(id:string):boolean {
  return NEW_PROFESSIONS_ENABLED || !EXPANSION_COMPANIONS.some(c=>c.id===id);
}

/**
 * Tướng lịch sử gia nhập đội qua chiến dịch, ô 4 là chiêu riêng.
 * Nghề và nguyên tố là điểm xuất phát, xem docs/02-game-modes/README.md mục 2.1.
 */
export const HERO_COMPANIONS: readonly FighterConfig[] = [
  companion("nguyenBac", "Nguyễn Bặc", "tuongSi", "hoa"),
  companion("dinhDien", "Đinh Điền", "binhLinh", "tho"),
  companion("luuCo", "Lưu Cơ", "muuSi", "kim"),
  companion("trinhTu", "Trịnh Tú", "ySu", "moc"),
  companion("leHoan", "Lê Hoàn", "quanSu", "loi"),
  companion("dinhLien", "Đinh Liễn", "phapSu", "thuy"),
];

/** Tướng lịch sử gia nhập qua chiến dịch, không bán. */
export function isHero(id: string): boolean {
  return HERO_COMPANIONS.some((c) => c.id === id);
}

export type WarlordCompanion = ShopCompanion;

/**
 * 12 sứ quân bán ở cửa hàng sau nhiệm vụ mốc Campaign V2 của họ (warlordUnlockMission, campaign/recruits.ts),
 * dù trong cốt truyện họ liên minh, quy phục, tan rã hay bị đánh dẹp. Nghề, nguyên tố và chiêu riêng (ô 4)
 * giống hệt khi làm đối thủ ở danh mục 12 sứ quân. Giá theo mô phỏng `pnpm sim -- --roster`.
 */
export const WARLORD_COMPANIONS: readonly WarlordCompanion[] = [
  warlord("tranLam", "Trần Lãm", "quanSu", "thuy", 3000),
  warlord("phamBachHo", "Phạm Bạch Hổ", "tuongSi", "hoa", 3000),
  warlord("ngoXuongXi", "Ngô Xương Xí", "muuSi", "kim", 3000),
  warlord("ngoNhatKhanh", "Ngô Nhật Khánh", "quanSu", "phong", 3000),
  warlord("nguyenKhoan", "Nguyễn Khoan", "binhLinh", "tho", 3000),
  warlord("kieuCongHan", "Kiều Công Hãn", "phapSu", "loi", 3000),
  warlord("kieuThuan", "Kiều Thuận", "ySu", "moc", 3000),
  warlord("lyKhue", "Lý Khuê", "tuongSi", "kim", 3000),
  warlord("nguyenThuTiep", "Nguyễn Thủ Tiệp", "muuSi", "thuy", 3000),
  warlord("luDuong", "Lữ Đường", "phapSu", "thuy", 3000),
  warlord("nguyenSieu", "Nguyễn Siêu", "binhLinh", "hoa", 3000),
  warlord("doCanhThac", "Đỗ Cảnh Thạc", "tuongSi", "tho", 3000),
];

function warlord(
  id: string,
  name: string,
  profession: Profession,
  element: Element,
  price: number,
): WarlordCompanion {
  return { fighter: companion(id, name, profession, element), price };
}

export function isWarlord(id: string): boolean {
  return WARLORD_COMPANIONS.some((c) => c.fighter.id === id);
}

/** Mọi nhân vật kèm: khởi đầu, cửa hàng, tướng lịch sử rồi sứ quân. */
export const ALL_COMPANIONS: readonly FighterConfig[] = [
  ...STARTER_COMPANIONS,
  ...SHOP_COMPANIONS.map((c) => c.fighter),
  ...HERO_COMPANIONS,
  ...WARLORD_COMPANIONS.map((c) => c.fighter),
];

export function companionById(id: string): FighterConfig | undefined {
  return [...ALL_COMPANIONS, ...EXPANSION_COMPANIONS].find((c) => c.id === id);
}

export function shopPrice(id: string): number | undefined {
  return [...SHOP_COMPANIONS, ...WARLORD_COMPANIONS].find((c) => c.fighter.id === id)?.price;
}
