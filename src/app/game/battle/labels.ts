// Nhãn tiếng Việt cho màn chơi. Hình vẽ nằm trong ./art.

import {
  getGearSet,
  TIER_INFO,
  type BattleError,
  type Difficulty,
  type EffectKind,
  type Element,
  type GearItem,
  type GearSlot,
  type Profession,
  type SpecialGrade,
  type Tier,
  type TileKind,
} from "@/core";

export const TILE_NAME: Record<TileKind, string> = {
  kiem: "Kiếm",
  amDuong: "Âm dương",
  banhChung: "Bánh chưng",
  tim: "Tim",
  vang: "Vàng",
  sach: "Sách",
  trong: "Trống trận",
};

/** Tên ô đặc biệt theo docs/design/01-ban-co.md mục 3. */
export const SPECIAL_NAME: Record<SpecialGrade, Record<TileKind, string>> = {
  strong: {
    kiem: "Kiếm lửa",
    amDuong: "Âm dương thái cực",
    banhChung: "Mâm cỗ",
    tim: "Tim vàng",
    vang: "Rương vàng",
    sach: "Binh thư",
    trong: "Trống đồng",
  },
  weak: {
    kiem: "Kiếm đồng",
    amDuong: "Bùa âm dương",
    banhChung: "Giỏ bánh",
    tim: "Tim bạc",
    vang: "Túi vàng",
    sach: "Thẻ tre",
    trong: "Trống da",
  },
};

export const PROFESSION_NAME: Record<Profession, string> = {
  tuongSi: "Tướng sĩ",
  phapSu: "Pháp sư",
  binhLinh: "Binh lính",
  ySu: "Y sư",
  muuSi: "Mưu sĩ",
  quanSu: "Quân sư",
};

export const ELEMENT_NAME: Record<Element, string> = {
  kim: "Kim",
  moc: "Mộc",
  thuy: "Thủy",
  hoa: "Hỏa",
  tho: "Thổ",
  loi: "Lôi",
  phong: "Phong",
};

export const EFFECT_NAME: Record<EffectKind, string> = {
  shield: "Khiên",
  freeze: "Đóng băng",
  freezeImmune: "Miễn băng",
  burn: "Thiêu đốt",
  atkUp: "Công+",
  atkDown: "Công−",
  defUp: "Thủ+",
  defDown: "Thủ−",
  regen: "Hồi phục",
  taunt: "Khiêu khích",
  reflect: "Phản đòn",
  silence: "Câm lặng",
};

export const GOOD_EFFECTS: readonly EffectKind[] = ["shield", "atkUp", "defUp", "regen", "reflect", "taunt", "freezeImmune"];

export const DIFFICULTY_NAME: Record<Difficulty, string> = {
  easy: "Dễ",
  normal: "Thường",
  hard: "Khó",
  boss: "Trùm",
  nightmare: "Ác mộng",
};

export const ERROR_TEXT: Record<BattleError, string> = {
  battleOver: "Trận đã kết thúc",
  invalidActor: "Không chọn được người này",
  invalidMove: "Nước đi không tạo bộ ghép",
  invalidSkill: "Không dùng được kỹ năng này",
  invalidTarget: "Mục tiêu không hợp lệ",
  skillUsed: "Đã dùng kỹ năng trong lần ra tay này",
  silenced: "Đang bị Câm lặng",
  notEnoughEnergy: "Không đủ năng lượng",
  tooLate: "Đã hết giờ",
  tooEarly: "Chưa hết giờ",
  noTimer: "Không có đồng hồ",
  noFreeSlide: "Không còn lượt trượt miễn phí",
};

export const SLOT_NAME: Record<GearSlot, string> = {
  vuKhi: "Vũ khí",
  dinhMao: "Đính mão",
  yPhuc: "Y phục",
  hoThu: "Hộ thủ",
  baoNgoa: "Bảo ngoa",
  gioiChi: "Giới chỉ",
  hangLien: "Hạng liên",
  hoPhu: "Hộ phù",
  ngocBoi: "Ngọc bội",
};

/** Tên phẩm ngắn theo màu, dùng cho nút chọn. */
export const TIER_COLOR_NAME: Record<Tier, string> = { 1: "Trắng", 2: "Lục", 3: "Lam", 4: "Tím", 5: "Cam" };

export const TIER_CLASS: Record<Tier, string> = {
  1: "text-stone-100",
  2: "text-green-400",
  3: "text-sky-400",
  4: "text-purple-400",
  5: "text-orange-400",
};

/** Mô tả một món: "Vũ khí (Pháp sư) Lam hệ Kim, bộ Cờ Lau". */
export function gearText(item: GearItem): string {
  const set = getGearSet(item.set)?.name ?? item.set;
  const prof = item.profession ? ` (${PROFESSION_NAME[item.profession]})` : "";
  return `${SLOT_NAME[item.slot]}${prof} ${TIER_INFO[item.tier].name} hệ ${ELEMENT_NAME[item.element]}, bộ ${set}`;
}
