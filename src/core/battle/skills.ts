// Kỹ năng không theo nguyên tố: chiêu nghề nấc 1–2 (tùy tướng AI, docs/03-characters/ky-nang/mo-hinh-nhan-vat.md mục 4.3),
// Dữ liệu raw legacy giữ số ô lịch sử; registry xuất layout2: tuyệt chiêu ô4, nghề nâng cao ô5.
// Kỹ năng là dữ liệu; battle.ts thực thi các bước theo thứ tự.

import { EXPANSION_ROLE_SKILLS, EXPANSION_CHARACTER_SKILLS } from "./expansion-skills";
import type { AreaShape, TileKind } from "../board";
import type { EffectKind } from "./effects";
import type { Element } from "./elements";
import type { Profession, GameProfession, LegacyProfession } from "./rules";

/** Ai nhận tác dụng của kỹ năng. enemy/ally: một người do người chơi chọn. */
export type SkillTarget = "enemy" | "ally" | "self" | "allEnemies" | "team";

/**
 * Ai nhận tác dụng của một bước: "targets" là các mục tiêu của kỹ năng, "self" là người tung chiêu,
 * "team" là cả phe mình còn sống, "enemies" là cả phe đối thủ còn sống.
 */
export type StepRecipient = "targets" | "self" | "team" | "enemies";

export type SkillStep =
  | {
      readonly type: "damage";
      readonly atk: number;
      /** Nhân sát thương khi máu trước đòn không vượt ngưỡng. */
      readonly execute?: { readonly threshold: number; readonly multiplier: number };
      /** Hồi cho người tung chiêu theo tỉ lệ sát thương gây ra. */
      readonly lifesteal?: number;
      /** Tỉ lệ DEF bỏ qua (xuyên giáp). */
      readonly pierce?: number;
      /** Bỏ qua Khiên của mục tiêu. */
      readonly pierceShield?: boolean;
    }
  | {
      readonly type: "effect";
      readonly to: StepRecipient;
      readonly effect: EffectKind;
      readonly value: number;
      readonly turns: number | null;
      /** value là tỉ lệ máu tối đa của người nhận (Khiên). */
      readonly ofMaxHp?: boolean;
      /** value là tỉ lệ ATK gốc của người tung chiêu (Thiêu đốt). */
      readonly ofAtk?: boolean;
      /** Cơ hội trúng mỗi người nhận; bỏ trống là chắc chắn. */
      readonly chance?: number;
    }
  | { readonly type: "heal"; readonly to: StepRecipient; readonly ratio: number }
  | { readonly type: "cleanse"; readonly to: StepRecipient }
  | { readonly type: "dispel"; readonly to: "targets" }
  | { readonly type: "energy"; readonly to: StepRecipient; readonly amount: number; readonly requiresHpDamage?: boolean }
  | { readonly type: "enemyFood"; readonly amount: number }
  | { readonly type: "mark"; readonly enhanced: boolean; readonly guaranteed?: boolean }
  /** Phá ô: ngẫu nhiên, hoặc một hình vùng quanh ô người chơi chạm. */
  | { readonly type: "destroy"; readonly area: { readonly random: number } | AreaShape }
  | { readonly type: "transform"; readonly kind: TileKind; readonly count: number }
  /**
   * Lốc xoáy: xoay vòng 8 ô quanh một ô tâm, tối đa `turns` nấc mỗi chiều.
   * auto: game tự chọn lần xoay tạo bộ ghép nhiều ô nhất (autoWhirl), người chơi không thao tác.
   */
  | { readonly type: "whirl"; readonly turns: number; readonly auto?: boolean };

export interface SkillDef {
  readonly id: string;
  readonly name: string;
  /** Nguồn nghề (cả preset AI cũ và chiêu nghề mới). */
  readonly profession?: GameProfession;
  readonly tier?: 1 | 2 | 3;
  /** Tuyệt chiêu nấc 3 hoặc chiêu riêng: id nhân vật sở hữu. */
  readonly character?: string;
  /** Ô bộ kỹ năng: 1/3/5 nghề, 2/6 hệ, 4 riêng; preset AI cũ giữ ô cũ. */
  readonly element?: Element;
  readonly slot?: number;
  readonly ultimate?: boolean;
  readonly characterKind?: "ultimate" | "signature";
  readonly cost: number;
  readonly target: SkillTarget;
  readonly steps: readonly SkillStep[];
}

const mark: SkillStep = { type: "mark", enhanced: false };

const DEFS: readonly SkillDef[] = [
  // Tướng sĩ
  { id: "tramKich", name: "Trảm kích", profession: "tuongSi", tier: 1, cost: 30, target: "enemy", steps: [{ type: "damage", atk: 2.1 }, mark] },
  {
    id: "hieuLenh", name: "Hiệu lệnh", profession: "tuongSi", tier: 2, cost: 45, target: "team",
    steps: [{ type: "effect", to: "targets", effect: "atkUp", value: 0.25, turns: 2 }, mark],
  },
  {
    id: "phaTran", name: "Phá trận", profession: "tuongSi", tier: 2, cost: 45, target: "enemy",
    steps: [{ type: "damage", atk: 3 }, { type: "effect", to: "targets", effect: "defDown", value: 0.3, turns: 2 }, mark],
  },
  // Binh lính
  {
    id: "thuThanh", name: "Thủ thành", profession: "binhLinh", tier: 1, cost: 30, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "effect", to: "self", effect: "shield", value: 0.2, turns: null, ofMaxHp: true },
      mark,
    ],
  },
  {
    id: "phanKich", name: "Phản kích", profession: "binhLinh", tier: 2, cost: 45, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "reflect", value: 0.4, turns: 2 },
      { type: "effect", to: "self", effect: "defUp", value: 0.3, turns: 2 },
      mark,
    ],
  },
  {
    id: "tuongKhien", name: "Tường khiên", profession: "binhLinh", tier: 2, cost: 45, target: "team",
    steps: [{ type: "effect", to: "targets", effect: "shield", value: 0.15, turns: null, ofMaxHp: true }, mark],
  },
  // Pháp sư
  { id: "phepCong", name: "Phép công", profession: "phapSu", tier: 1, cost: 30, target: "enemy", steps: [{ type: "damage", atk: 1.8 }, mark] },
  {
    id: "nguHanhAn", name: "Ngũ hành ấn", profession: "phapSu", tier: 2, cost: 45, target: "enemy",
    steps: [{ type: "damage", atk: 1.4 }, { type: "mark", enhanced: true, guaranteed: true }],
  },
  { id: "phepLan", name: "Phép lan", profession: "phapSu", tier: 2, cost: 45, target: "allEnemies", steps: [{ type: "damage", atk: 1 }, mark] },
  // Y sư
  {
    id: "linhDuoc", name: "Linh dược", profession: "ySu", tier: 1, cost: 30, target: "ally",
    steps: [{ type: "heal", to: "targets", ratio: 0.22 }, { type: "cleanse", to: "targets" }, mark],
  },
  {
    id: "duongSinh", name: "Dưỡng sinh", profession: "ySu", tier: 2, cost: 45, target: "team",
    steps: [{ type: "effect", to: "targets", effect: "regen", value: 0.07, turns: 3, ofMaxHp: true }, mark],
  },
  {
    id: "teDo", name: "Tế độ", profession: "ySu", tier: 2, cost: 45, target: "team",
    steps: [{ type: "heal", to: "targets", ratio: 0.15 }, { type: "cleanse", to: "targets" }, mark],
  },
  // Mưu sĩ
  { id: "muaChuoc", name: "Mua chuộc", profession: "muuSi", tier: 1, cost: 30, target: "enemy", steps: [{ type: "energy", to: "targets", amount: -40 }, mark] },
  {
    id: "lyGian", name: "Ly gián", profession: "muuSi", tier: 2, cost: 45, target: "enemy",
    steps: [{ type: "effect", to: "targets", effect: "silence", value: 0, turns: 2 }, mark],
  },
  {
    id: "catQuanLuong", name: "Cắt quân lương", profession: "muuSi", tier: 2, cost: 45, target: "allEnemies",
    steps: [{ type: "enemyFood", amount: -15 }, { type: "energy", to: "targets", amount: -10 }, mark],
  },
  // Quân sư
  {
    id: "nghiBinh", name: "Nghi binh", profession: "quanSu", tier: 1, cost: 30, target: "enemy",
    steps: [{ type: "effect", to: "targets", effect: "atkDown", value: 0.3, turns: 2 }, mark],
  },
  { id: "phaKe", name: "Phá kế", profession: "quanSu", tier: 2, cost: 45, target: "allEnemies", steps: [{ type: "dispel", to: "targets" }, mark] },
  {
    id: "bayTran", name: "Bày trận", profession: "quanSu", tier: 2, cost: 45, target: "team",
    steps: [{ type: "effect", to: "targets", effect: "defUp", value: 0.3, turns: 2 }, mark],
  },
];

// Tuyệt chiêu riêng từng tướng thường, mang đậm nguyên tố của người đó nên không có dấu ấn. Tướng thường
// mang bộ 6 kỹ năng theo nguyên tố như Đinh Bộ Lĩnh, tuyệt chiêu thay ô 5 (như chiêu riêng của tướng lịch sử).
// Docs/design/14-nhan-vat.md. Số liệu cân bằng bằng `pnpm sim -- --roster`.
const ULTIMATES: readonly SkillDef[] = ([
  {
    id: "hoaVuLieuNguyen", name: "Hỏa Vũ Liệu Nguyên", profession: "phapSu", tier: 3, character: "haVan", cost: 100, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1.5 },
      { type: "effect", to: "targets", effect: "burn", value: 0.15, ofAtk: true, turns: 2 },
      { type: "destroy", area: { square: 3 } },
    ],
  },
  {
    id: "tranSonHoQuan", name: "Trấn Sơn Hộ Quân", profession: "binhLinh", tier: 3, character: "leThach", cost: 100, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "shield", value: 0.25, turns: null, ofMaxHp: true },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "effect", to: "self", effect: "reflect", value: 0.35, turns: 2 },
    ],
  },
  {
    id: "camLoHoiXuan", name: "Cam Lộ Hồi Xuân", profession: "ySu", tier: 3, character: "maiThanh", cost: 100, target: "team",
    steps: [
      { type: "heal", to: "targets", ratio: 0.3 },
      { type: "cleanse", to: "targets" },
      { type: "effect", to: "enemies", effect: "freeze", value: 0, turns: 1, chance: 0.3 },
    ],
  },
  {
    id: "kimNganLyTan", name: "Kim Ngân Ly Tán", profession: "muuSi", tier: 3, character: "toKim", cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 1.8, pierce: 0.5, pierceShield: true },
      { type: "energy", to: "targets", amount: -50 },
      { type: "effect", to: "targets", effect: "silence", value: 0, turns: 1 },
    ],
  },
  {
    id: "phongVanBienTran", name: "Phong Vân Biến Trận", profession: "quanSu", tier: 3, character: "phungPhong", cost: 100, target: "allEnemies",
    steps: [
      { type: "dispel", to: "targets" },
      { type: "effect", to: "targets", effect: "atkDown", value: 0.3, turns: 2 },
      { type: "energy", to: "team", amount: 20 },
      { type: "whirl", turns: 2, auto: true },
    ],
  },
  // Tướng thường bán ở cửa hàng, docs/03-characters/danh-sach-nhan-vat.md mục 4.
  {
    id: "kimQuaThietMa", name: "Kim Qua Thiết Mã", profession: "tuongSi", tier: 3, character: "tranCuong", cost: 100, target: "enemy",
    steps: [{ type: "damage", atk: 2.8, pierce: 0.4 }, { type: "effect", to: "targets", effect: "defDown", value: 0.3, turns: 2 }],
  },
  {
    id: "xichHoaDoatKy", name: "Xích Hỏa Đoạt Kỳ", profession: "tuongSi", tier: 3, character: "lyLiet", cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 3 },
      { type: "effect", to: "targets", effect: "burn", value: 0.15, ofAtk: true, turns: 3 },
      { type: "destroy", area: { cross: "small" } },
    ],
  },
  {
    id: "bangHaPhongToa", name: "Băng Hà Phong Tỏa", profession: "phapSu", tier: 3, character: "daoLam", cost: 100, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1.2 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.35 },
      { type: "destroy", area: { random: 8 } },
    ],
  },
  {
    id: "thienLoiGiangThe", name: "Thiên Lôi Giáng Thế", profession: "phapSu", tier: 3, character: "vuLoi", cost: 100, target: "enemy",
    steps: [{ type: "damage", atk: 2.5 }, { type: "energy", to: "targets", amount: -30 }, { type: "destroy", area: { columns: 1 } }],
  },
  {
    id: "reGiaGiuThanh", name: "Rễ Già Giữ Thành", profession: "binhLinh", tier: 3, character: "hoangMoc", cost: 100, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "regen", value: 0.06, turns: 3, ofMaxHp: true },
      { type: "effect", to: "self", effect: "shield", value: 0.25, turns: null, ofMaxHp: true },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
    ],
  },
  {
    id: "thietBichDongThanh", name: "Thiết Bích Đồng Thành", profession: "binhLinh", tier: 3, character: "caoKien", cost: 100, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "defUp", value: 0.35, turns: 3 },
      { type: "effect", to: "self", effect: "reflect", value: 0.35, turns: 2 },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
    ],
  },
  {
    id: "xuanMocVanSinh", name: "Xuân Mộc Vạn Sinh", profession: "ySu", tier: 3, character: "lucDiep", cost: 100, target: "team",
    steps: [
      { type: "heal", to: "targets", ratio: 0.2 },
      { type: "effect", to: "targets", effect: "regen", value: 0.06, turns: 2, ofMaxHp: true },
    ],
  },
  {
    id: "gioLanhTayUe", name: "Gió Lành Tẩy Uế", profession: "ySu", tier: 3, character: "bachSuong", cost: 100, target: "team",
    steps: [{ type: "cleanse", to: "targets" }, { type: "heal", to: "targets", ratio: 0.18 }, { type: "energy", to: "targets", amount: 15 }],
  },
  {
    id: "hoaThieuKhoLuong", name: "Hỏa Thiêu Kho Lương", profession: "muuSi", tier: 3, character: "ninhHoa", cost: 100, target: "allEnemies",
    steps: [
      { type: "enemyFood", amount: -25 },
      { type: "energy", to: "targets", amount: -25 },
      { type: "effect", to: "targets", effect: "burn", value: 0.1, ofAtk: true, turns: 2 },
    ],
  },
  {
    id: "thuyDonLyGian", name: "Thủy Độn Ly Gián", profession: "muuSi", tier: 3, character: "quachAn", cost: 100, target: "allEnemies",
    steps: [
      { type: "effect", to: "targets", effect: "silence", value: 0, turns: 1, chance: 0.5 },
      { type: "energy", to: "targets", amount: -20 },
    ],
  },
  {
    id: "batTranThachLuy", name: "Bát Trận Thạch Lũy", profession: "quanSu", tier: 3, character: "taThach", cost: 100, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "defUp", value: 0.3, turns: 2 },
      { type: "effect", to: "targets", effect: "shield", value: 0.12, turns: null, ofMaxHp: true },
    ],
  },
  {
    id: "loiTranKinhHon", name: "Lôi Trận Kinh Hồn", profession: "quanSu", tier: 3, character: "macVan", cost: 100, target: "allEnemies",
    steps: [
      { type: "effect", to: "targets", effect: "atkDown", value: 0.25, turns: 2 },
      { type: "energy", to: "targets", amount: -20 },
      { type: "destroy", area: { random: 6 } },
    ],
  },
  // 25 tướng thường thêm 20/10/2026 để phủ đủ 42 tổ hợp nghề × hệ. Vai trò theo nghề, sắc thái theo hệ.
  // Tướng sĩ: dồn sát thương 1 đối thủ.
  {
    id: "trucLamPhaTran", name: "Trúc Lâm Phá Trận", profession: "tuongSi", tier: 3, character: "lamTung", cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 2.6, lifesteal: 0.3 },
      { type: "effect", to: "self", effect: "regen", value: 0.05, turns: 2, ofMaxHp: true },
    ],
  },
  {
    id: "langDaoTram", name: "Lãng Đào Trảm", profession: "tuongSi", tier: 3, character: "hoLang", cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 2.6 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.4 },
      { type: "energy", to: "targets", amount: -20 },
    ],
  },
  {
    id: "sonHaTranKich", name: "Sơn Hà Trấn Kích", profession: "tuongSi", tier: 3, character: "khaSon", cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 2.5 },
      { type: "effect", to: "self", effect: "shield", value: 0.2, turns: null, ofMaxHp: true },
      { type: "destroy", area: { cross: "small" } },
    ],
  },
  {
    id: "loiDaoLienTram", name: "Lôi Đao Liên Trảm", profession: "tuongSi", tier: 3, character: "tongTan", cost: 100, target: "enemy",
    steps: [{ type: "damage", atk: 2.7, pierceShield: true }, { type: "energy", to: "targets", amount: -30 }],
  },
  {
    id: "truyPhongDoatMenh", name: "Truy Phong Đoạt Mệnh", profession: "tuongSi", tier: 3, character: "huaLang", cost: 100, target: "enemy",
    steps: [{ type: "damage", atk: 2.4 }, { type: "energy", to: "team", amount: 15 }, { type: "whirl", turns: 2, auto: true }],
  },
  // Pháp sư: sát thương cả đội đối thủ.
  {
    id: "nganChamTanXa", name: "Ngân Châm Tán Xạ", profession: "phapSu", tier: 3, character: "chuNgan", cost: 100, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1.2, pierce: 0.3 },
      { type: "effect", to: "targets", effect: "defDown", value: 0.2, turns: 2 },
    ],
  },
  {
    id: "kinhCucTrienThan", name: "Kinh Cức Triền Thân", profession: "phapSu", tier: 3, character: "damThao", cost: 100, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1.1, lifesteal: 0.25 },
      { type: "effect", to: "targets", effect: "atkDown", value: 0.15, turns: 2 },
    ],
  },
  {
    id: "diaMachBungPhat", name: "Địa Mạch Bùng Phát", profession: "phapSu", tier: 3, character: "doanNham", cost: 100, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1.3 },
      { type: "effect", to: "team", effect: "defUp", value: 0.15, turns: 2 },
      { type: "destroy", area: { square: 3 } },
    ],
  },
  {
    id: "phongAnCuongLuu", name: "Phong Ấn Cuồng Lưu", profession: "phapSu", tier: 3, character: "lieuYen", cost: 100, target: "allEnemies",
    steps: [{ type: "damage", atk: 1.1 }, { type: "dispel", to: "targets" }, { type: "whirl", turns: 2, auto: true }],
  },
  // Binh lính: khiêu khích, chịu đòn, che chắn.
  {
    id: "thuyTraiLienHoan", name: "Thủy Trại Liên Hoàn", profession: "binhLinh", tier: 3, character: "thaiHa", cost: 100, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "shield", value: 0.18, turns: null, ofMaxHp: true },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "effect", to: "enemies", effect: "freeze", value: 0, turns: 1, chance: 0.25 },
    ],
  },
  {
    id: "viemGiapHoDoanh", name: "Viêm Giáp Hộ Doanh", profession: "binhLinh", tier: 3, character: "truongViem", cost: 100, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "shield", value: 0.25, turns: null, ofMaxHp: true },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "effect", to: "self", effect: "reflect", value: 0.3, turns: 2 },
      { type: "effect", to: "enemies", effect: "burn", value: 0.1, ofAtk: true, turns: 2 },
    ],
  },
  {
    id: "chanLoiThietVe", name: "Chấn Lôi Thiết Vệ", profession: "binhLinh", tier: 3, character: "ongChan", cost: 100, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "defUp", value: 0.4, turns: 2 },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "energy", to: "enemies", amount: -20 },
    ],
  },
  {
    id: "phongLuyHoKy", name: "Phong Lũy Hộ Kỳ", profession: "binhLinh", tier: 3, character: "manhTuong", cost: 100, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "shield", value: 0.15, turns: null, ofMaxHp: true },
      { type: "energy", to: "targets", amount: 15 },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
    ],
  },
  // Y sư: hồi máu cả đội.
  {
    id: "kimChamDoMenh", name: "Kim Châm Độ Mệnh", profession: "ySu", tier: 3, character: "chauNgoc", cost: 100, target: "team",
    steps: [
      { type: "heal", to: "targets", ratio: 0.22 },
      { type: "cleanse", to: "targets" },
      { type: "effect", to: "targets", effect: "defUp", value: 0.2, turns: 2 },
    ],
  },
  {
    id: "danHoaHoiNguyen", name: "Đan Hỏa Hồi Nguyên", profession: "ySu", tier: 3, character: "hongDan", cost: 100, target: "team",
    steps: [{ type: "heal", to: "targets", ratio: 0.22 }, { type: "effect", to: "targets", effect: "atkUp", value: 0.15, turns: 2 }],
  },
  {
    id: "hauThoDuongNguyen", name: "Hậu Thổ Dưỡng Nguyên", profession: "ySu", tier: 3, character: "beLien", cost: 100, target: "team",
    steps: [
      { type: "heal", to: "targets", ratio: 0.2 },
      { type: "effect", to: "targets", effect: "shield", value: 0.1, turns: null, ofMaxHp: true },
    ],
  },
  {
    id: "loiChamKhoiTu", name: "Lôi Châm Khởi Tử", profession: "ySu", tier: 3, character: "tieuMinh", cost: 100, target: "team",
    steps: [{ type: "heal", to: "targets", ratio: 0.22 }, { type: "energy", to: "targets", amount: 20 }],
  },
  // Mưu sĩ: phá năng lượng, lương, khống chế.
  {
    id: "trucDocMeHon", name: "Trúc Độc Mê Hồn", profession: "muuSi", tier: 3, character: "nhanTruc", cost: 100, target: "allEnemies",
    steps: [
      { type: "energy", to: "targets", amount: -25 },
      { type: "effect", to: "targets", effect: "silence", value: 0, turns: 1, chance: 0.4 },
      { type: "effect", to: "team", effect: "regen", value: 0.04, turns: 2, ofMaxHp: true },
    ],
  },
  {
    id: "doanDaoTuyetLuong", name: "Đoạn Đạo Tuyệt Lương", profession: "muuSi", tier: 3, character: "maNhac", cost: 100, target: "allEnemies",
    steps: [{ type: "enemyFood", amount: -30 }, { type: "energy", to: "targets", amount: -20 }, { type: "destroy", area: { random: 6 } }],
  },
  {
    id: "kinhLoiDoatKhi", name: "Kinh Lôi Đoạt Khí", profession: "muuSi", tier: 3, character: "tuKinh", cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 1.5 },
      { type: "energy", to: "targets", amount: -50 },
      { type: "effect", to: "targets", effect: "silence", value: 0, turns: 1 },
    ],
  },
  {
    id: "phieuPhongLyGian", name: "Phiêu Phong Ly Gián", profession: "muuSi", tier: 3, character: "buiPhieu", cost: 100, target: "allEnemies",
    steps: [{ type: "energy", to: "targets", amount: -25 }, { type: "dispel", to: "targets" }, { type: "whirl", turns: 2, auto: true }],
  },
  // Quân sư: suy yếu đối thủ, cổ vũ đội mình.
  {
    id: "thietTranPhaGiap", name: "Thiết Trận Phá Giáp", profession: "quanSu", tier: 3, character: "nghiemThiet", cost: 100, target: "allEnemies",
    steps: [
      { type: "effect", to: "targets", effect: "defDown", value: 0.3, turns: 2 },
      { type: "effect", to: "team", effect: "atkUp", value: 0.15, turns: 2 },
    ],
  },
  {
    id: "thanhLamBayTran", name: "Thanh Lâm Bày Trận", profession: "quanSu", tier: 3, character: "samTue", cost: 100, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "regen", value: 0.05, turns: 2, ofMaxHp: true },
      { type: "effect", to: "targets", effect: "defUp", value: 0.2, turns: 2 },
    ],
  },
  {
    id: "trieuDangVayThanh", name: "Triều Dâng Vây Thành", profession: "quanSu", tier: 3, character: "viTrieu", cost: 100, target: "allEnemies",
    steps: [
      { type: "effect", to: "targets", effect: "atkDown", value: 0.25, turns: 2 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.3 },
    ],
  },
  {
    id: "hoaCongLienKe", name: "Hỏa Công Liên Kế", profession: "quanSu", tier: 3, character: "tonDiem", cost: 100, target: "allEnemies",
    steps: [
      { type: "effect", to: "targets", effect: "atkDown", value: 0.2, turns: 2 },
      { type: "effect", to: "targets", effect: "burn", value: 0.12, ofAtk: true, turns: 2 },
      { type: "energy", to: "team", amount: 10 },
    ],
  },
] satisfies SkillDef[]).map((d) => ({ ...d, slot: 5 }));

// Bộ kỹ năng nhân vật chính theo nguyên tố, docs/03-characters/ky-nang/preset-ai-he-cu.md mục 2–7.
const MAIN: readonly SkillDef[] = [
  {
    id: "lucDiepPhong", name: "Lục Diệp Phong", element: "moc", slot: 1, cost: 35, target: "self",
    steps: [{ type: "destroy", area: { random: 5 } }],
  },
  {
    id: "linhMocHoiSinh", name: "Linh Mộc Hồi Sinh", element: "moc", slot: 2, cost: 30, target: "self",
    steps: [{ type: "heal", to: "self", ratio: 0.11 }, { type: "transform", kind: "tim", count: 3 }],
  },
  {
    id: "thanhMocHoPhap", name: "Thanh Mộc Hộ Pháp", element: "moc", slot: 3, cost: 40, target: "enemy",
    steps: [{ type: "damage", atk: 1.5, lifesteal: 0.3 }, { type: "destroy", area: { square: 2 } }],
  },
  {
    id: "cuongVuThienDiep", name: "Cuồng Vũ Thiên Diệp", element: "moc", slot: 4, cost: 60, target: "allEnemies",
    steps: [{ type: "damage", atk: 0.65 }, { type: "destroy", area: { square: 3 } }],
  },
  {
    id: "coThuTranThien", name: "Cổ Thụ Trấn Thiên", element: "moc", slot: 5, cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 2.25 },
      { type: "effect", to: "self", effect: "regen", value: 0.05, turns: 2, ofMaxHp: true },
      { type: "destroy", area: { square: 4 } },
    ],
  },
  {
    id: "thanhTrucBaoPhu", name: "Thanh Trúc Bảo Phù", element: "moc", slot: 6, cost: 50, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "regen", value: 0.06, turns: 3, ofMaxHp: true },
      { type: "cleanse", to: "self" },
      { type: "effect", to: "self", effect: "defUp", value: 0.15, turns: 2 },
    ],
  },
  // Kim
  {
    id: "luyenKimThanhKiem", name: "Luyện Kim Thành Kiếm", element: "kim", slot: 1, cost: 20, target: "self",
    steps: [{ type: "transform", kind: "kiem", count: 4 }],
  },
  {
    id: "kimYNgungThan", name: "Kim Ý Ngưng Thần", element: "kim", slot: 2, cost: 30, target: "self",
    steps: [{ type: "effect", to: "self", effect: "atkUp", value: 0.25, turns: 2 }],
  },
  {
    id: "doanKimNhatTuyen", name: "Đoạn Kim Nhất Tuyến", element: "kim", slot: 3, cost: 35, target: "enemy",
    steps: [
      { type: "damage", atk: 2.4, pierce: 0.3 },
      { type: "effect", to: "targets", effect: "defDown", value: 0.2, turns: 2 },
      { type: "destroy", area: { line: 4 } },
    ],
  },
  {
    id: "thietKyTungHoanh", name: "Thiết Kỵ Tung Hoành", element: "kim", slot: 4, cost: 60, target: "allEnemies",
    steps: [{ type: "damage", atk: 0.9 }, { type: "destroy", area: { columns: 1 } }],
  },
  {
    id: "kimAnPhaThien", name: "Kim Ấn Phá Thiên", element: "kim", slot: 5, cost: 100, target: "enemy",
    steps: [{ type: "damage", atk: 3.2, pierce: 0.5, pierceShield: true }, { type: "destroy", area: { cross: "big" } }],
  },
  {
    id: "giapDongHoThe", name: "Giáp Đồng Hộ Thể", element: "kim", slot: 6, cost: 50, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "defUp", value: 0.3, turns: 3 },
      { type: "effect", to: "self", effect: "atkUp", value: 0.15, turns: 3 },
    ],
  },
  // Thủy
  {
    id: "thuyNguyetTuLinh", name: "Thủy Nguyệt Tụ Linh", element: "thuy", slot: 1, cost: 20, target: "self",
    steps: [{ type: "transform", kind: "amDuong", count: 5 }],
  },
  {
    id: "thanhLuuTayTran", name: "Thanh Lưu Tẩy Trần", element: "thuy", slot: 2, cost: 30, target: "self",
    steps: [{ type: "cleanse", to: "self" }, { type: "heal", to: "self", ratio: 0.1 }],
  },
  {
    id: "hanBangTien", name: "Hàn Băng Tiễn", element: "thuy", slot: 3, cost: 40, target: "enemy",
    steps: [
      { type: "damage", atk: 1.75 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.3 },
      { type: "destroy", area: { square: 2 } },
    ],
  },
  {
    id: "bachDangTrieuDang", name: "Bạch Đằng Triều Dâng", element: "thuy", slot: 4, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 0.8 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.2 },
      { type: "destroy", area: { random: 9 } },
    ],
  },
  {
    id: "thuyKiepVanTrung", name: "Thủy Kiếp Vạn Trùng", element: "thuy", slot: 5, cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 2.9 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1 },
      { type: "destroy", area: { columns: 2 } },
    ],
  },
  {
    id: "linhThuyHoMenh", name: "Linh Thủy Hộ Mệnh", element: "thuy", slot: 6, cost: 50, target: "team",
    steps: [{ type: "heal", to: "targets", ratio: 0.12 }, { type: "cleanse", to: "targets" }],
  },
  // Hỏa
  {
    id: "phongHoaThieuDoanh", name: "Phóng Hỏa Thiêu Doanh", element: "hoa", slot: 1, cost: 35, target: "self",
    steps: [{ type: "destroy", area: { square: 3 } }],
  },
  {
    id: "noHoaThieuThan", name: "Nộ Hỏa Thiêu Thân", element: "hoa", slot: 2, cost: 30, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "atkUp", value: 0.35, turns: 2 },
      { type: "effect", to: "self", effect: "defDown", value: 0.15, turns: 2 },
    ],
  },
  {
    id: "xichDiemTien", name: "Xích Diễm Tiễn", element: "hoa", slot: 3, cost: 40, target: "enemy",
    steps: [
      { type: "damage", atk: 2 },
      { type: "effect", to: "targets", effect: "burn", value: 0.1, ofAtk: true, turns: 2 },
      { type: "destroy", area: { cross: "small" } },
    ],
  },
  {
    id: "hoaThieuLienTrai", name: "Hỏa Thiêu Liên Trại", element: "hoa", slot: 4, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1 },
      { type: "effect", to: "targets", effect: "burn", value: 0.1, ofAtk: true, turns: 1 },
      { type: "destroy", area: { square: 3 } },
    ],
  },
  {
    id: "lietDiemPhanThanh", name: "Liệt Diễm Phần Thành", element: "hoa", slot: 5, cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 3.6 },
      { type: "effect", to: "targets", effect: "burn", value: 0.1, ofAtk: true, turns: 3 },
      { type: "destroy", area: { rect: [5, 3] } },
    ],
  },
  {
    id: "ducHoaTrungSinh", name: "Dục Hỏa Trùng Sinh", element: "hoa", slot: 6, cost: 50, target: "self",
    steps: [{ type: "heal", to: "self", ratio: 0.2 }, { type: "effect", to: "self", effect: "atkUp", value: 0.2, turns: 2 }],
  },
  // Thổ
  {
    id: "hauThoTichLuong", name: "Hậu Thổ Tích Lương", element: "tho", slot: 1, cost: 20, target: "self",
    steps: [{ type: "transform", kind: "banhChung", count: 5 }],
  },
  {
    id: "thachGiap", name: "Thạch Giáp", element: "tho", slot: 2, cost: 30, target: "self",
    steps: [{ type: "effect", to: "self", effect: "shield", value: 0.2, turns: null, ofMaxHp: true }],
  },
  {
    id: "sonBangDiaLiet", name: "Sơn Băng Địa Liệt", element: "tho", slot: 3, cost: 40, target: "enemy",
    steps: [
      { type: "damage", atk: 1.5 },
      { type: "effect", to: "self", effect: "shield", value: 0.1, turns: null, ofMaxHp: true },
      { type: "destroy", area: { square: 2 } },
    ],
  },
  {
    id: "diaChanTamQuan", name: "Địa Chấn Tam Quân", element: "tho", slot: 4, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 0.75 },
      { type: "effect", to: "targets", effect: "defDown", value: 0.15, turns: 2 },
      { type: "destroy", area: { square: 3 } },
    ],
  },
  {
    id: "thaiSonApDinh", name: "Thái Sơn Áp Đỉnh", element: "tho", slot: 5, cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 2.6 },
      { type: "effect", to: "self", effect: "shield", value: 0.2, turns: null, ofMaxHp: true },
      { type: "destroy", area: { square: 4 } },
    ],
  },
  {
    id: "kienThanhBatDong", name: "Kiên Thành Bất Động", element: "tho", slot: 6, cost: 50, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "shield", value: 0.15, turns: null, ofMaxHp: true },
      { type: "effect", to: "self", effect: "reflect", value: 0.3, turns: 2 },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
    ],
  },
  // Lôi
  {
    id: "loiTruGiangThe", name: "Lôi Trụ Giáng Thế", element: "loi", slot: 1, cost: 40, target: "self",
    steps: [{ type: "destroy", area: { columns: 1 } }],
  },
  {
    id: "tinhDienHoThan", name: "Tĩnh Điện Hộ Thân", element: "loi", slot: 2, cost: 30, target: "self",
    steps: [{ type: "cleanse", to: "self" }, { type: "effect", to: "self", effect: "defUp", value: 0.2, turns: 2 }],
  },
  {
    id: "loiTienXuyenVan", name: "Lôi Tiễn Xuyên Vân", element: "loi", slot: 3, cost: 40, target: "enemy",
    steps: [
      { type: "damage", atk: 2 },
      { type: "energy", to: "targets", amount: -15 },
      { type: "destroy", area: { random: 4 } },
    ],
  },
  {
    id: "loiVongThienLa", name: "Lôi Võng Thiên La", element: "loi", slot: 4, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 0.9 },
      { type: "energy", to: "targets", amount: -10 },
      { type: "destroy", area: { random: 9 } },
    ],
  },
  {
    id: "cuuTieuLoiPhat", name: "Cửu Tiêu Lôi Phạt", element: "loi", slot: 5, cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 3.2 },
      { type: "effect", to: "targets", effect: "silence", value: 0, turns: 1 },
      { type: "destroy", area: { columns: 1 } },
      { type: "destroy", area: { random: 8 } },
    ],
  },
  {
    id: "loiDinhHieuLenh", name: "Lôi Đình Hiệu Lệnh", element: "loi", slot: 6, cost: 50, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "atkUp", value: 0.25, turns: 2 },
      { type: "energy", to: "enemies", amount: -15 },
    ],
  },
];

// Phong được tách riêng để dễ đọc; cùng khung với các hệ khác.
const PHONG: readonly SkillDef[] = [
  {
    id: "phongQuyenTanVan", name: "Phong Quyển Tàn Vân", element: "phong", slot: 1, cost: 40, target: "self",
    steps: [{ type: "whirl", turns: 2 }],
  },
  {
    id: "thanhPhongTuKhi", name: "Thanh Phong Tụ Khí", element: "phong", slot: 2, cost: 30, target: "self",
    steps: [{ type: "effect", to: "self", effect: "atkUp", value: 0.2, turns: 2 }, { type: "energy", to: "self", amount: 10 }],
  },
  {
    id: "phongNhanLietKhong", name: "Phong Nhận Liệt Không", element: "phong", slot: 3, cost: 40, target: "enemy",
    steps: [{ type: "damage", atk: 1.75 }, { type: "dispel", to: "targets" }, { type: "destroy", area: { square: 2 } }],
  },
  {
    id: "cuongPhongQuetTran", name: "Cuồng Phong Quét Trận", element: "phong", slot: 4, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 0.6 },
      { type: "effect", to: "targets", effect: "atkDown", value: 0.1, turns: 2 },
      { type: "destroy", area: { diagonal: 2 } },
    ],
  },
  {
    id: "baoTapCanKhon", name: "Bão Táp Càn Khôn", element: "phong", slot: 5, cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 3 },
      { type: "dispel", to: "targets" },
      { type: "effect", to: "targets", effect: "atkDown", value: 0.25, turns: 2 },
      { type: "whirl", turns: 2, auto: true },
      { type: "destroy", area: { square: 4 } },
    ],
  },
  {
    id: "phongHanhVanLy", name: "Phong Hành Vạn Lý", element: "phong", slot: 6, cost: 50, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "defUp", value: 0.15, turns: 2 },
      { type: "energy", to: "targets", amount: 15 },
    ],
  },
];

// Chiêu riêng của nhân vật lịch sử: thay kỹ năng ô 5 trong bộ theo nguyên tố, mang dấu ấn từng người.
// Raw legacy giữ ô5; registry/layout hồ sơ mới dùng ô4 cho tuyệt chiêu.
// Docs/design/14-nhan-vat.md mục 5–6. Tên tự đặt, số liệu là điểm xuất phát chờ mô phỏng.
const SIGNATURES: readonly SkillDef[] = [
  // Tướng lịch sử phe người chơi
  {
    id: "dinhQuocHoaKy", name: "Định Quốc Hỏa Kỳ", character: "nguyenBac", slot: 5, cost: 100, target: "enemy",
    steps: [
      { type: "damage", atk: 2.4 },
      { type: "effect", to: "targets", effect: "burn", value: 0.15, ofAtk: true, turns: 2 },
      { type: "effect", to: "team", effect: "atkUp", value: 0.15, turns: 2 },
    ],
  },
  {
    id: "ngoaiGiapHoQuan", name: "Ngoại Giáp Hộ Quân", character: "dinhDien", slot: 5, cost: 100, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "shield", value: 0.2, turns: null, ofMaxHp: true },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "effect", to: "self", effect: "reflect", value: 0.35, turns: 2 },
    ],
  },
  {
    id: "doHoPhuLenh", name: "Đô Hộ Phủ Lệnh", character: "luuCo", slot: 5, cost: 100, target: "allEnemies",
    steps: [
      { type: "energy", to: "targets", amount: -30 },
      { type: "effect", to: "targets", effect: "silence", value: 0, turns: 1, chance: 0.5 },
      { type: "effect", to: "targets", effect: "defDown", value: 0.15, turns: 2 },
    ],
  },
  {
    id: "hoaLuThaoDuoc", name: "Hoa Lư Thảo Dược", character: "trinhTu", slot: 5, cost: 100, target: "team",
    steps: [
      { type: "heal", to: "targets", ratio: 0.28 },
      { type: "cleanse", to: "targets" },
      { type: "effect", to: "targets", effect: "regen", value: 0.05, turns: 2, ofMaxHp: true },
    ],
  },
  {
    id: "thapDaoLoiBinh", name: "Thập Đạo Lôi Binh", character: "leHoan", slot: 5, cost: 100, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1 },
      { type: "effect", to: "targets", effect: "atkDown", value: 0.25, turns: 2 },
      { type: "energy", to: "team", amount: 20 },
    ],
  },
  {
    id: "namVietVuongAn", name: "Nam Việt Vương Ấn", character: "dinhLien", slot: 5, cost: 100, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1.3 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.3 },
      { type: "destroy", area: { random: 6 } },
    ],
  },
  // 12 sứ quân: giá 60 (trùm 80) để AI chịu dùng thay vì xài chiêu rẻ liên tục; mạnh hơn ô 4 cùng hệ.
  {
    id: "boHaiTranGiang", name: "Bố Hải Trấn Giang", character: "tranLam", slot: 5, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 0.8 },
      { type: "effect", to: "targets", effect: "atkDown", value: 0.3, turns: 2 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.35 },
      { type: "destroy", area: { random: 4 } },
    ],
  },
  {
    id: "bachHoXuatSon", name: "Bạch Hổ Xuất Sơn", character: "phamBachHo", slot: 5, cost: 60, target: "enemy",
    steps: [
      { type: "damage", atk: 3.2 },
      { type: "effect", to: "targets", effect: "burn", value: 0.2, ofAtk: true, turns: 2 },
      { type: "effect", to: "self", effect: "atkUp", value: 0.2, turns: 2 },
    ],
  },
  {
    id: "ngoGiaDiMuu", name: "Ngô Gia Di Mưu", character: "ngoXuongXi", slot: 5, cost: 60, target: "enemy",
    steps: [
      { type: "damage", atk: 2.4, pierce: 0.4 },
      { type: "energy", to: "targets", amount: -50 },
      { type: "effect", to: "targets", effect: "silence", value: 0, turns: 1 },
      { type: "destroy", area: { random: 6 } },
    ],
  },
  {
    id: "duongLamPhongKhoi", name: "Đường Lâm Phong Khởi", character: "ngoNhatKhanh", slot: 5, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 0.6 },
      { type: "dispel", to: "targets" },
      { type: "effect", to: "targets", effect: "atkDown", value: 0.25, turns: 2 },
      { type: "whirl", turns: 2, auto: true },
    ],
  },
  {
    id: "tamDaiKienThanh", name: "Tam Đái Kiên Thành", character: "nguyenKhoan", slot: 5, cost: 60, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "shield", value: 0.25, turns: null, ofMaxHp: true },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "effect", to: "self", effect: "reflect", value: 0.35, turns: 2 },
    ],
  },
  {
    id: "phongChauLoiKich", name: "Phong Châu Lôi Kích", character: "kieuCongHan", slot: 5, cost: 60, target: "allEnemies",
    steps: [{ type: "damage", atk: 1 }, { type: "energy", to: "targets", amount: -15 }, { type: "destroy", area: { random: 4 } }],
  },
  {
    id: "hoiHoSinhKhi", name: "Hồi Hồ Sinh Khí", character: "kieuThuan", slot: 5, cost: 60, target: "team",
    steps: [
      { type: "heal", to: "targets", ratio: 0.25 },
      { type: "effect", to: "targets", effect: "regen", value: 0.06, turns: 2, ofMaxHp: true },
    ],
  },
  {
    id: "sieuLoaiPhaGiap", name: "Siêu Loại Phá Giáp", character: "lyKhue", slot: 5, cost: 60, target: "enemy",
    steps: [
      { type: "damage", atk: 3.4, pierce: 0.5 },
      { type: "effect", to: "targets", effect: "defDown", value: 0.3, turns: 2 },
      { type: "destroy", area: { random: 6 } },
    ],
  },
  {
    id: "tienDuDoatLuong", name: "Tiên Du Đoạt Lương", character: "nguyenThuTiep", slot: 5, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 0.6 },
      { type: "enemyFood", amount: -25 },
      { type: "energy", to: "targets", amount: -30 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.25 },
    ],
  },
  {
    id: "teGiangThuyTran", name: "Tế Giang Thủy Trận", character: "luDuong", slot: 5, cost: 60, target: "allEnemies",
    steps: [
      { type: "damage", atk: 1.5 },
      { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.35 },
      { type: "transform", kind: "amDuong", count: 4 },
    ],
  },
  {
    id: "phuLietHoaLuy", name: "Phù Liệt Hỏa Lũy", character: "nguyenSieu", slot: 5, cost: 60, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "shield", value: 0.3, turns: null, ofMaxHp: true },
      { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 },
      { type: "effect", to: "enemies", effect: "burn", value: 0.15, ofAtk: true, turns: 2 },
    ],
  },
  {
    id: "doDongKienTam", name: "Đỗ Động Kiên Tâm", character: "doCanhThac", slot: 5, cost: 80, target: "enemy",
    steps: [
      { type: "damage", atk: 3.6 },
      { type: "effect", to: "team", effect: "defUp", value: 0.3, turns: 2 },
      { type: "destroy", area: { random: 8 } },
    ],
  },
];

/** Thứ tự hiển thị theo tiến trình, độc lập ID ô lưu. */
export const SKILL_SLOT_ORDER = [1, 2, 3, 4, 5, 6] as const;
export const SKILL_SLOT_UNLOCK: Readonly<Record<number, number>> = { 1: 1, 2: 1, 3: 5, 4: 10, 5: 15, 6: 20 };

// Dữ liệu mới tách ID khỏi chiêu AI cũ để preset chiến dịch không đổi ngầm.
function role(id: string, profession: Profession, slot: number, cost?: number): SkillDef {
  const old = DEFS.find(d => d.id === id)!;
  return { ...old, id: `role_${id}`, profession, slot, tier: undefined, cost: cost ?? old.cost,
    steps: old.steps.filter(s => s.type !== "mark") };
}
const RAW_ROLE_SKILLS: readonly SkillDef[] = [
  role("tramKich", "tuongSi", 1),
  { ...role("phaTran", "tuongSi", 3), steps: [{ type: "damage", atk: 2.5, pierce: 0.3 }, { type: "effect", to: "targets", effect: "defDown", value: 0.3, turns: 2 }] },
  { id: "role_doatMenh", name: "Đoạt mệnh", profession: "tuongSi", slot: 4, cost: 60, target: "enemy", steps: [{ type: "damage", atk: 2.6, execute: { threshold: 0.35, multiplier: 1.5 } }] },
  { ...role("phepLan", "phapSu", 1, 30), steps: [{ type: "damage", atk: 0.9 }] },
  { ...role("nguHanhAn", "phapSu", 3), steps: [{ type: "damage", atk: 1.4 }, { type: "mark", enhanced: true, guaranteed: true }] },
  { id: "role_thienDiaCong", name: "Thiên địa cộng hưởng", profession: "phapSu", slot: 4, cost: 60, target: "allEnemies", steps: [{ type: "damage", atk: 1.1 }, { type: "destroy", area: { square: 3 } }] },
  role("thuThanh", "binhLinh", 1, 35), role("tuongKhien", "binhLinh", 3),
  { ...role("phanKich", "binhLinh", 4, 55), steps: [...role("phanKich", "binhLinh", 4).steps, { type: "effect", to: "self", effect: "taunt", value: 0, turns: 2 }] },
  role("linhDuoc", "ySu", 1), role("duongSinh", "ySu", 3), role("teDo", "ySu", 4, 55),
  role("muaChuoc", "muuSi", 1), role("lyGian", "muuSi", 3), role("catQuanLuong", "muuSi", 4, 55),
  role("nghiBinh", "quanSu", 1), role("hieuLenh", "quanSu", 3), role("phaKe", "quanSu", 4, 55),
];
export const ROLE_SKILLS = [...RAW_ROLE_SKILLS.map(d => d.slot === 4 ? { ...d, slot: 5 } : d), ...EXPANSION_ROLE_SKILLS];
function elemental(id: string, slot: number): SkillDef {
  const old = [...MAIN, ...PHONG].find(d => d.id === id)!;
  return { ...old, id: `element_${id}`, slot };
}
export const ELEMENT_SKILLS: readonly SkillDef[] = [
  elemental("luyenKimThanhKiem", 2),
  { ...elemental("kimYNgungThan", 6), cost: 35, target: "enemy", steps: [{ type: "damage", atk: 1.3, pierce: 0.5 }] },
  elemental("lucDiepPhong", 2), elemental("linhMocHoiSinh", 6),
  elemental("thuyNguyetTuLinh", 2), elemental("thanhLuuTayTran", 6),
  elemental("phongHoaThieuDoanh", 2), elemental("noHoaThieuThan", 6),
  elemental("hauThoTichLuong", 2), elemental("thachGiap", 6),
  elemental("loiTruGiangThe", 2),
  { ...elemental("tinhDienHoThan", 6), target: "enemy", steps: [{ type: "energy", to: "targets", amount: -20 }, { type: "energy", to: "self", amount: 10 }] },
  elemental("phongQuyenTanVan", 2),
  { ...elemental("thanhPhongTuKhi", 6), target: "team", steps: [{ type: "energy", to: "targets", amount: 10 }, { type: "effect", to: "targets", effect: "defUp", value: 0.1, turns: 2 }] },
];

/** Canonical personal skills. New heroes add layout2 records here, never legacy slot transforms. */
export function defineCharacterSkills(defs:readonly SkillDef[]):readonly SkillDef[]{
 const owners=new Set<string>();
 for(const def of defs){
  if(!def.character||def.slot!==4||!def.ultimate)throw new RangeError(`Chiêu riêng cần character, ultimate và ô4: ${def.id}`);
  if(owners.has(def.character))throw new RangeError(`Trùng chiêu riêng nhân vật: ${def.character}`);
  owners.add(def.character);
 }
 return defs;
}
export const CHARACTER_SKILLS:readonly SkillDef[]=defineCharacterSkills([
 ...ULTIMATES.map((d):SkillDef=>({...d,slot:4,ultimate:true,characterKind:'ultimate'})),
 ...SIGNATURES.map((d):SkillDef=>({...d,slot:4,ultimate:true,characterKind:'signature'})),
 ...EXPANSION_CHARACTER_SKILLS,
 // Future personal skills are canonical records: slot4, ultimate:true, stable ID + character.
]);

/** ĐBL: one personal ultimate for every profession × element loadout. */
const DBL_ROLE_FINISHERS: Record<LegacyProfession, { name: string; target: SkillTarget; steps: readonly SkillStep[] }> = {
 tuongSi: {name:"Bình định",target:"enemy",steps:[{type:"damage",atk:3.2,pierce:0.3},{type:"effect",to:"targets",effect:"defDown",value:0.25,turns:2}]},
 phapSu: {name:"Thiên uy",target:"allEnemies",steps:[{type:"damage",atk:2.2},{type:"effect",to:"targets",effect:"silence",value:0,turns:1}]},
 binhLinh: {name:"Trấn quốc",target:"enemy",steps:[{type:"damage",atk:2.4},{type:"effect",to:"team",effect:"shield",value:0.15,ofMaxHp:true,turns:2}]},
 ySu: {name:"Hưng sinh",target:"team",steps:[{type:"heal",to:"targets",ratio:0.28},{type:"cleanse",to:"targets"}]},
 muuSi: {name:"Định kế",target:"enemy",steps:[{type:"dispel",to:"targets"},{type:"damage",atk:2.3},{type:"energy",to:"targets",amount:-25}]},
 quanSu: {name:"Nhất thống",target:"team",steps:[{type:"effect",to:"targets",effect:"atkUp",value:0.25,turns:2},{type:"energy",to:"targets",amount:20}]},
};
const DBL_ELEMENT_FINISHERS:Record<Element,{name:string;steps:readonly SkillStep[]}>= {
 kim:{name:"Kim",steps:[{type:"effect",to:"team",effect:"atkUp",value:0.15,turns:2}]},
 moc:{name:"Mộc",steps:[{type:"heal",to:"team",ratio:0.1}]},
 thuy:{name:"Thủy",steps:[{type:"cleanse",to:"team"},{type:"effect",to:"team",effect:"shield",value:0.08,ofMaxHp:true,turns:2}]},
 hoa:{name:"Hỏa",steps:[{type:"effect",to:"enemies",effect:"defDown",value:0.15,turns:2}]},
 tho:{name:"Thổ",steps:[{type:"effect",to:"team",effect:"shield",value:0.12,ofMaxHp:true,turns:2}]},
 loi:{name:"Lôi",steps:[{type:"energy",to:"enemies",amount:-15}]},
 phong:{name:"Phong",steps:[{type:"energy",to:"team",amount:15}]},
};
export const DBL_ULTIMATES:readonly SkillDef[]=Object.entries(DBL_ROLE_FINISHERS).flatMap(([profession,role])=>
 Object.entries(DBL_ELEMENT_FINISHERS).map(([element,flavor])=>({
 id:`dbl_${profession}_${element}`,name:`${role.name} · ${flavor.name}`,character:"dinhBoLinh",characterKind:"ultimate" as const,
 profession:profession as Profession,element:element as Element,slot:4,ultimate:true,cost:80,target:role.target,steps:[...role.steps,...flavor.steps],
 })));
export function dinhBoLinhUltimate(profession:Profession,element:Element):SkillDef {
 return DBL_ULTIMATES.find(d=>d.profession===profession&&d.element===element)!;
}

/** Tuyệt chiêu là nguồn nhân vật kể cả tuyệt chiêu mặc định theo hệ của Đinh Bộ Lĩnh. */
export function skillSource(def: SkillDef): "profession" | "element" | "character" {
  return def.ultimate || def.character !== undefined ? "character" : def.profession !== undefined ? "profession" : "element";
}

/** Nguồn thống nhất cho mọi nhân vật chơi được; tiến trình lọc sau khi lắp bộ. */
export function characterSkills(profession: Profession, element: Element, character?: string): SkillDef[] {
  const ultimate = !character || character === "dinhBoLinh" ? dinhBoLinhUltimate(profession,element) : personalSkillOf(character) ?? getSkill(legacyElementSkills(element).find(d => d.slot === 5)!.id)!;
  const defs = [...ROLE_SKILLS.filter(d => d.profession === profession), ...ELEMENT_SKILLS.filter(d => d.element === element), ultimate];
  return SKILL_SLOT_ORDER.map(slot => defs.find(d => d.slot === slot)!);
}

export function defineSkillRegistry(defs:readonly SkillDef[]):Readonly<Record<string,SkillDef>> {
  const seen=new Set<string>();
  for(const def of defs){if(seen.has(def.id))throw new RangeError(`Trùng ID kỹ năng: ${def.id}`);seen.add(def.id);}
  return Object.fromEntries(defs.map(d=>[d.id,d]));
}
export const SKILLS: Readonly<Record<string, SkillDef>> = defineSkillRegistry(
  [
    ...DEFS,
    ...[...MAIN,...PHONG].map((d):SkillDef=>d.slot===5?{...d,slot:4,ultimate:true}:d.slot===4?{...d,slot:5}:d),
    ...CHARACTER_SKILLS,...DBL_ULTIMATES,...ROLE_SKILLS,...ELEMENT_SKILLS,
  ],
);

export function getSkill(id: string): SkillDef | undefined {
  return Object.hasOwn(SKILLS,id) ? SKILLS[id] : undefined;
}

/** Cấp kỹ năng: 1 đến SKILL_MAX_LEVEL, nâng bằng điểm kỹ năng. Xem docs/03-characters/ky-nang/preset-ai-he-cu.md mục 1.1. */
export const SKILL_MAX_LEVEL = 5;
/** Mỗi cấp trên 1 cộng thêm tỉ lệ này vào hệ số chính. */
export const SKILL_LEVEL_BONUS = 0.1;
/** Ở cấp tối đa, chi phí năng lượng giảm tỉ lệ này, làm tròn xuống bội số của 5. */
export const SKILL_MAX_LEVEL_DISCOUNT = 0.1;

/** Hiệu ứng có giá trị là hệ số chính (Khiên, Công/Thủ, Hồi phục, Thiêu đốt, Phản đòn) được tăng theo cấp. */
const SCALED_EFFECTS: readonly EffectKind[] = ["shield", "atkUp", "atkDown", "defUp", "defDown", "regen", "burn", "poison", "reflect"];

/**
 * Kỹ năng ở một cấp: sát thương, lượng hồi và hệ số hiệu ứng ×(1 + 10% mỗi cấp trên 1); thời lượng, số ô,
 * cơ hội và năng lượng cộng/trừ giữ nguyên. Cấp tối đa giảm 10% chi phí.
 */
export function scaleSkill(def: SkillDef, level = 1): SkillDef {
  const lv = Math.max(1, Math.min(SKILL_MAX_LEVEL, Math.floor(level)));
  if (lv === 1) return def;
  const m = 1 + SKILL_LEVEL_BONUS * (lv - 1);
  const r = (x: number) => Math.round(x * m * 1000) / 1000;
  const steps = def.steps.map((step): SkillStep => {
    if (step.type === "damage") return { ...step, atk: r(step.atk) };
    if (step.type === "heal") return { ...step, ratio: r(step.ratio) };
    if (step.type === "effect" && SCALED_EFFECTS.includes(step.effect)) return { ...step, value: r(step.value) };
    return step;
  });
  const cost = lv === SKILL_MAX_LEVEL ? Math.floor((def.cost * (1 - SKILL_MAX_LEVEL_DISCOUNT)) / 5) * 5 : def.cost;
  return { ...def, cost, steps };
}

/** Kỹ năng `id` của một nhân vật, theo cấp kỹ năng của người đó; undefined nếu không mang kỹ năng này. */
export function fighterSkill(
  f: { readonly skills?: readonly string[]; readonly skillLevels?: Readonly<Record<string, number>> },
  id: string,
): SkillDef | undefined {
  const def = getSkill(id);
  if (!def || !(f.skills ?? []).includes(id)) return undefined;
  return scaleSkill(def, f.skillLevels?.[id]);
}

export function professionSkills(profession: Profession): SkillDef[] {
  return DEFS.filter((d) => d.profession === profession);
}

/** Tuyệt chiêu (ô 4) của một tướng thường; undefined nếu người đó không có. */
export function ultimateOf(character: string): SkillDef | undefined {
  return CHARACTER_SKILLS.find(d=>d.character===character&&d.characterKind!=='signature');
}

/** Preset hệ cũ: chỉ AI chiến dịch và kiểm thử hồi quy. Player dùng characterSkills. */
export function legacyElementSkills(element: Element): SkillDef[] {
  return [...MAIN, ...PHONG].filter((d) => d.element === element).sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
}

/** Chiêu riêng của một nhân vật lịch sử (tướng phe người chơi hoặc sứ quân); undefined nếu không có. */
export function signatureOf(character: string): SkillDef | undefined {
  return CHARACTER_SKILLS.find(d=>d.character===character&&d.characterKind==='signature');
}

/** Kỹ năng ô 4 riêng của một nhân vật: chiêu riêng (tướng lịch sử, sứ quân) hoặc tuyệt chiêu (tướng thường). */
export function personalSkillOf(character: string): SkillDef | undefined {
  return CHARACTER_SKILLS.find(d=>d.character===character);
}

/** Preset AI chiến dịch cũ; player dùng characterSkills. */
export function legacyHeroSkills(element: Element, character?: string): SkillDef[] {
  const sig = character === undefined ? undefined : personalSkillOf(character);
  return legacyElementSkills(element).map((d) => (sig && d.slot === 5 ? { ...sig, slot: 5 } : d));
}

/** Bước lốc xoáy người chơi tự chọn tâm (không tính bước tự xoay). */
export function whirlStep(def: SkillDef): Extract<SkillStep, { type: "whirl" }> | undefined {
  return def.steps.find((s): s is Extract<SkillStep, { type: "whirl" }> => s.type === "whirl" && !s.auto);
}

/** Kỹ năng cần người chơi chạm một ô làm tâm hoặc góc vùng. */
export function needsCell(def: SkillDef): boolean {
  return def.steps.some((s) => s.type === "destroy" && !("random" in s.area));
}

/**
 * Kỹ năng bị động của thủ lĩnh theo nguyên tố, tự kích hoạt khi đầy Nộ, hiệu lực 3 lượt của phe.
 * Xem docs/03-characters/ky-nang/preset-ai-he-cu.md.
 */
export const PASSIVES: Record<Element, { readonly name: string }> = {
  moc: { name: "Sinh Sôi Bất Tận" },
  kim: { name: "Kim Cốt Thiết Thân" },
  thuy: { name: "Hàn Tuyền" },
  hoa: { name: "Liệt Hỏa Tâm" },
  tho: { name: "Bàn Thạch" },
  loi: { name: "Điện Quang Tốc Kích" },
  phong: { name: "Thuận Phong" },
};

/** Số liệu kỹ năng bị động. */
export const PASSIVE = {
  /** Mộc: Hồi phục cho cả đội, tỉ lệ máu tối đa mỗi lượt. */
  mocTeamRegen: 0.03,
  /** Kim: đánh thường và kỹ năng bỏ qua tỉ lệ DEF này; kỹ năng xuyên Khiên. */
  kimPierce: 0.4,
  /** Thủy: Đóng băng ngay 1 đối thủ; kỹ năng gây sát thương thêm cơ hội Đóng băng. */
  thuyFreezeChance: 0.25,
  /** Hỏa: mọi sát thương của bản thân tăng, DEF bản thân giảm. */
  hoaDamage: 0.3,
  hoaDefDown: 0.15,
  /** Thổ: Khiên theo máu tối đa và Phản đòn cho bản thân. */
  thoShield: 0.25,
  thoReflect: 0.25,
  /** Lôi: trừ năng lượng mọi đối thủ; mỗi ô âm dương ghép được cho thêm năng lượng. */
  loiDrain: 20,
  loiEnergyPerTile: 5,
  /**
   * Phong: trong thời gian hiệu lực, phe được xoay lốc xoáy miễn phí phongFreeWhirlTurns nấc trước
   * kỹ năng và đổi ô, tối đa phongFreeWhirls lần cho mỗi lần kích hoạt.
   */
  phongFreeWhirlTurns: 1,
  phongFreeWhirls: 1,
} as const;

/**
 * Dấu ấn nguyên tố trên chiêu nghề, xem docs/01-gameplay/nguyen-to.md mục 5.
 * Giá trị N chưa có trong docs là mặc định tạm, chờ mô phỏng.
 */
export const MARK = {
  burnAtk: 0.3,
  burnTurns: 1,
  burnTurnsEnhanced: 3,
  freezeChance: 0.2,
  regenMaxHp: 0.05,
  regenTurnsEnhanced: 2,
  defDown: 0.15,
  defDownEnhanced: 0.3,
  defDownTurnsEnhanced: 2,
  shieldMaxHp: 0.1,
  energyDrain: 10,
  atkDown: 0.1,
} as const;

export type MarkAudience = "enemies" | "self" | "team";

/** Dấu ấn nhắm vào đâu: kẻ địch trúng chiêu, bản thân hay cả đội. */
export function markAudience(element: Element, enhanced: boolean): MarkAudience {
  if (element === "moc" || element === "tho") return enhanced ? "team" : "self";
  return "enemies";
}
