// Chiêu nghề nấc 1–2 của nhân vật kèm, xem docs/design/06-nhan-vat-ky-nang.md mục 4.
// Kỹ năng là dữ liệu; battle.ts thực thi các bước theo thứ tự.

import type { AreaShape, TileKind } from "../board";
import type { EffectKind } from "./effects";
import type { Element } from "./elements";
import type { Profession } from "./rules";

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
  | { readonly type: "energy"; readonly to: StepRecipient; readonly amount: number }
  | { readonly type: "enemyFood"; readonly amount: number }
  | { readonly type: "mark"; readonly enhanced: boolean; readonly guaranteed?: boolean }
  /** Phá ô: ngẫu nhiên, hoặc một hình vùng quanh ô người chơi chạm. */
  | { readonly type: "destroy"; readonly area: { readonly random: number } | AreaShape }
  | { readonly type: "transform"; readonly kind: TileKind; readonly count: number }
  /**
   * Trượt 1 hàng hoặc 1 cột do người chơi chọn, tối đa `distance` ô.
   * axis: chỉ cho trượt hàng; exact: phải đi đúng `distance` ô.
   */
  | { readonly type: "slide"; readonly distance: number; readonly axis?: "row"; readonly exact?: boolean };

export interface SkillDef {
  readonly id: string;
  readonly name: string;
  /** Chiêu nghề của nhân vật kèm. */
  readonly profession?: Profession;
  readonly tier?: 1 | 2;
  /** Kỹ năng nhân vật chính theo nguyên tố, ô 1–6. */
  readonly element?: Element;
  readonly slot?: number;
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

// Bộ kỹ năng nhân vật chính theo nguyên tố, docs/design/12-ky-nang-nhan-vat-chinh.md mục 2–7.
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
    steps: [{ type: "slide", distance: 2 }],
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
      { type: "slide", distance: 2, axis: "row", exact: true },
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

export const SKILLS: Readonly<Record<string, SkillDef>> = Object.fromEntries([...DEFS, ...MAIN, ...PHONG].map((d) => [d.id, d]));

export function getSkill(id: string): SkillDef | undefined {
  return SKILLS[id];
}

export function professionSkills(profession: Profession): SkillDef[] {
  return DEFS.filter((d) => d.profession === profession);
}

/** 6 kỹ năng chủ động của nhân vật chính theo nguyên tố. */
export function mainSkills(element: Element): SkillDef[] {
  return [...MAIN, ...PHONG].filter((d) => d.element === element).sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
}

/** Bước trượt của kỹ năng, nếu có (người chơi phải chọn hàng/cột và hướng). */
export function slideStep(def: SkillDef): Extract<SkillStep, { type: "slide" }> | undefined {
  return def.steps.find((s): s is Extract<SkillStep, { type: "slide" }> => s.type === "slide");
}

/** Kỹ năng cần người chơi chạm một ô làm tâm hoặc góc vùng. */
export function needsCell(def: SkillDef): boolean {
  return def.steps.some((s) => s.type === "destroy" && !("random" in s.area));
}

/**
 * Kỹ năng bị động của thủ lĩnh theo nguyên tố, tự kích hoạt khi đầy Nộ, hiệu lực 3 lượt của phe.
 * Xem docs/design/12-ky-nang-nhan-vat-chinh.md.
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
   * Phong: trong thời gian hiệu lực, phe được trượt miễn phí 1 ô trước kỹ năng và đổi ô, tối đa
   * phongFreeSlides lần cho mỗi lần kích hoạt (mô phỏng: mỗi lần ra tay một lần thì phe Phong thắng
   * khoảng 80%). Bỏ 15 năng lượng tức thì theo mô phỏng 19/10/2026.
   */
  phongFreeSlide: 1,
  phongFreeSlides: 1,
} as const;

/**
 * Dấu ấn nguyên tố trên chiêu nghề, xem docs/design/05-nguyen-to.md mục 5.
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
