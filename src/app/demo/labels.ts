// Nhãn tiếng Việt và biểu tượng tạm cho trang /demo (chưa có art).

import type { BattleError, Difficulty, EffectKind, Element, Profession, TileKind } from "@/core";

export const TILE_ICON: Record<TileKind, string> = {
  kiem: "⚔️",
  amDuong: "☯️",
  banhChung: "🍙",
  tim: "❤️",
  vang: "💰",
  sach: "📖",
  trong: "🥁",
};

export const TILE_NAME: Record<TileKind, string> = {
  kiem: "Kiếm",
  amDuong: "Âm dương",
  banhChung: "Bánh chưng",
  tim: "Tim",
  vang: "Vàng",
  sach: "Sách",
  trong: "Trống trận",
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
