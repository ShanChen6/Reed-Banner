/**
 * Kỹ năng của hai nhân vật đặc biệt dung hợp tám nghề/bảy hệ: Minh Nguyệt và Vũ Phong.
 * Nguồn thiết kế: docs/03-characters/minh-nguyet.md và docs/03-characters/vu-phong.md (DRAFT, số liệu là điểm xuất phát).
 * Mỗi nhân vật có đúng sáu chủ động (ô 1–6, ô 4 là tuyệt chiêu); bốn nội tại nằm ở chase.ts và combos.ts.
 * `damageElement` là hệ của từng chiêu, tách khỏi hệ phòng thủ của người tung chiêu.
 */
import type { SkillDef } from "./skills";

const def = (d: Omit<SkillDef, "character"> & { character: string }): SkillDef => d;

export const MINH_NGUYET_SKILLS: readonly SkillDef[] = [
  def({
    id: "mn_kimQuangPhaTran", name: "Kim Quang Phá Trận", character: "minhNguyet", slot: 1, cost: 30, target: "enemy",
    damageElement: "kim", steps: [{ type: "damage", atk: 1.8, pierce: 0.2 }],
  }),
  def({
    id: "mn_thuyAnhXuyenLuu", name: "Thủy Ảnh Xuyên Lưu", character: "minhNguyet", slot: 2, cost: 35, target: "enemy",
    damageElement: "thuy",
    steps: [{ type: "damage", atk: 1.55 }, { type: "effect", to: "targets", effect: "atkDown", value: 0.1, turns: 1 }],
  }),
  def({
    id: "mn_hoaBoDoatMenh", name: "Hỏa Bộ Đoạt Mệnh", character: "minhNguyet", slot: 3, cost: 45, target: "enemy",
    damageElement: "hoa", steps: [{ type: "damage", atk: 2.1, execute: { threshold: 0.35, multiplier: 1.25 } }],
  }),
  def({
    id: "mn_vanTuongQuyNhat", name: "Vạn Tượng Quy Nhất", character: "minhNguyet", slot: 4, cost: 90, target: "enemy",
    ultimate: true, characterKind: "ultimate", damageElement: "kim",
    steps: [
      { type: "damage", atk: 2.3 },
      { type: "cleanse", to: "self" },
      { type: "effect", to: "self", effect: "shield", value: 0.08, turns: 2, ofMaxHp: true },
    ],
  }),
  def({
    id: "mn_thoAnTranTam", name: "Thổ Ấn Trấn Tâm", character: "minhNguyet", slot: 5, cost: 40, target: "self",
    steps: [
      { type: "effect", to: "self", effect: "shield", value: 0.12, turns: 2, ofMaxHp: true },
      { type: "effect", to: "self", effect: "defUp", value: 0.1, turns: 2 },
    ],
  }),
  def({
    id: "mn_loiVanKhaiLo", name: "Lôi Văn Khai Lộ", character: "minhNguyet", slot: 6, cost: 55, target: "allEnemies",
    damageElement: "loi", steps: [{ type: "damage", atk: 0.7 }, { type: "destroy", area: { random: 3 } }],
  }),
];

export const VU_PHONG_SKILLS: readonly SkillDef[] = [
  def({
    id: "vp_phongKhoiVanDong", name: "Phong Khởi Vân Động", character: "vuPhong", slot: 1, cost: 40, target: "enemy",
    damageElement: "phong", steps: [{ type: "damage", atk: 1.3 }, { type: "whirl", turns: 1 }],
  }),
  def({
    id: "vp_muaGiangYLoan", name: "Mưa Giăng Ý Loạn", character: "vuPhong", slot: 2, cost: 40, target: "enemy",
    damageElement: "thuy",
    steps: [{ type: "damage", atk: 1.35 }, { type: "effect", to: "targets", effect: "freeze", value: 0, turns: 1, chance: 0.3 }],
  }),
  def({
    id: "vp_lucDiepDanLo", name: "Lục Diệp Dẫn Lộ", character: "vuPhong", slot: 3, cost: 45, target: "ally",
    steps: [{ type: "cleanse", to: "targets" }, { type: "heal", to: "targets", ratio: 0.08 }],
  }),
  def({
    id: "vp_vanDuThienLy", name: "Vân Du Thiên Lý", character: "vuPhong", slot: 4, cost: 90, target: "allEnemies",
    ultimate: true, characterKind: "ultimate", damageElement: "phong",
    steps: [{ type: "damage", atk: 0.9 }, { type: "dispel", to: "targets" }, { type: "whirl", turns: 2, auto: true }],
  }),
  def({
    id: "vp_diaMachHoDoi", name: "Địa Mạch Hộ Đội", character: "vuPhong", slot: 5, cost: 55, target: "team",
    steps: [
      { type: "effect", to: "targets", effect: "shield", value: 0.06, turns: 2, ofMaxHp: true },
      { type: "effect", to: "targets", effect: "defUp", value: 0.08, turns: 2 },
    ],
  }),
  def({
    id: "vp_cuongPhongDoiCuc", name: "Cuồng Phong Đổi Cục", character: "vuPhong", slot: 6, cost: 50, target: "self",
    steps: [{ type: "whirl", turns: 2 }, { type: "effect", to: "team", effect: "atkUp", value: 0.1, turns: 2 }],
  }),
];

export const SPECIAL_SKILLS: readonly SkillDef[] = [...MINH_NGUYET_SKILLS, ...VU_PHONG_SKILLS];

/** Bộ sáu chiêu theo id nhân vật, đã sắp theo ô. */
export const SPECIAL_SKILL_SETS: Readonly<Record<string, readonly SkillDef[]>> = {
  minhNguyet: MINH_NGUYET_SKILLS,
  vuPhong: VU_PHONG_SKILLS,
};
