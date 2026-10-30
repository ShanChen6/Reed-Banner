// Hằng số luật trận đấu. Số liệu là điểm xuất phát, sẽ chỉnh bằng mô phỏng.
// Xem docs/01-gameplay/tran-dau.md và docs/01-gameplay/tai-nguyen-cong-thuc.md.

import type { TileKind } from "../board";

/** Sáu nghề đã phát hành; cũng là danh sách nghề của Đinh Bộ Lĩnh. */
export const LEGACY_PROFESSIONS = ["tuongSi", "phapSu", "binhLinh", "ySu", "muuSi", "quanSu"] as const;
export type LegacyProfession = (typeof LEGACY_PROFESSIONS)[number];
/** ID canonical: alias cungThu chỉ được đọc tại biên dữ liệu. */
export const EXPANSION_PROFESSIONS = ["xaThu", "satThu"] as const;
export type ExpansionProfession = (typeof EXPANSION_PROFESSIONS)[number];
export const ALL_PROFESSIONS = [...LEGACY_PROFESSIONS, ...EXPANSION_PROFESSIONS] as const;
export type GameProfession = (typeof ALL_PROFESSIONS)[number];
export type Profession = LegacyProfession;
/** Giữ tắt cho tới khi PROF-02..06 có bằng chứng nghiệm thu. */
export const NEW_PROFESSIONS_ENABLED: boolean = false;
export const PROFESSIONS = LEGACY_PROFESSIONS;
export const PROFESSION_DISPLAY_NAME: Readonly<Record<GameProfession, string>> = {
  tuongSi: "Tướng sĩ", phapSu: "Pháp sư", binhLinh: "Binh lính", ySu: "Y sư",
  muuSi: "Mưu sĩ", quanSu: "Quân sư", xaThu: "Xạ thủ", satThu: "Sát thủ",
};
export function normalizeProfession(value: unknown): GameProfession | undefined {
  if (value === "cungThu") return "xaThu";
  return typeof value === "string" && (ALL_PROFESSIONS as readonly string[]).includes(value)
    ? value as GameProfession : undefined;
}
export function isActiveProfession(value: unknown): value is Profession {
  return typeof value === "string" && (PROFESSIONS as readonly string[]).includes(value);
}
export function isLeaderProfession(value: unknown): value is LegacyProfession {
  return typeof value === "string" && (LEGACY_PROFESSIONS as readonly string[]).includes(value);
}
/** Ô công kích dùng chung mọi nghề; key kiem giữ nguyên cho save/replay. */
export const ATTACK_TILE: TileKind = "kiem";
/** Chỉ các ô tài nguyên có tương tác riêng theo nghề; không gán ô công kích cho nghề. */
export const PROFESSION_RESOURCE_TILE: Readonly<Partial<Record<Profession, TileKind>>> = {
  phapSu: "amDuong", binhLinh: "banhChung", ySu: "tim", muuSi: "vang", quanSu: "sach",
};
/** @deprecated Dữ liệu legacy; không dùng để định nghĩa ô công kích hay thêm nghề mới. */
export const PROFESSION_TILE: Readonly<Record<LegacyProfession, TileKind>> = {
  tuongSi: ATTACK_TILE, ...PROFESSION_RESOURCE_TILE,
} as Readonly<Record<LegacyProfession, TileKind>>;

/** 1vs1: máu tối đa nhân thêm, vì không có đồng đội chia sát thương. Điểm xuất phát theo mô phỏng. */
export const SOLO_HP_MULTIPLIER = 2;

/**
 * Tinh thần: mỗi tướng bắt đầu với SPIRIT_MAX. Từ lượt thứ SPIRIT_DECAY_START_TURN của phe, đầu mỗi
 * lượt thường giảm5; về0 ở lượt44. ATK/DEF không giảm theo Tinh thần.
 * Hồi/Khiên mới theo người nhận: 0.2 + 0.8 × Tinh thần/100 (phương án F).
 */
export const SPIRIT_MAX = 100;
export const SPIRIT_DECAY_START_TURN = 25;
export const SPIRIT_DECAY = 5;
/** ATK và DEF còn tỉ lệ này khi Tinh thần về 0. */
export const SPIRIT_STAT_FLOOR = 1;

/** Chỉ harness mô phỏng truyền lựa chọn này; API ứng dụng không nhận cấu hình thử nghiệm. */
export type SpiritExperiment = "A" | "B" | "C" | "D" | "E" | "F";
export const DEFAULT_SPIRIT_EXPERIMENT: SpiritExperiment = "F";
export const SPIRIT_EXPERIMENTS = {
  A: { decay: 10, statFloor: 0.7, healFloor: 0 },
  B: { decay: 0, statFloor: 1, healFloor: 0 },
  C: { decay: 10, statFloor: 1, healFloor: 0 },
  D: { decay: 5, statFloor: 1, healFloor: 0 },
  E: { decay: 10, statFloor: 1, healFloor: 0.2 },
  F: { decay: 5, statFloor: 1, healFloor: 0.2 },
} as const;

/** Tinh thần sau khi phe bắt đầu sideTurn lượt thường; lượt thêm không tăng bộ đếm. */
export function spiritAt(sideTurn: number, experiment: SpiritExperiment = DEFAULT_SPIRIT_EXPERIMENT): number {
  return Math.max(0, SPIRIT_MAX - SPIRIT_EXPERIMENTS[experiment].decay * Math.max(0, sideTurn - SPIRIT_DECAY_START_TURN + 1));
}
export function spiritStatMultiplier(spirit: number, experiment: SpiritExperiment = DEFAULT_SPIRIT_EXPERIMENT): number {
  const floor = SPIRIT_EXPERIMENTS[experiment].statFloor;
  return floor + (1 - floor) * (Math.max(0, Math.min(100, spirit)) / SPIRIT_MAX);
}
export function spiritHealMultiplier(spirit: number, experiment: SpiritExperiment = DEFAULT_SPIRIT_EXPERIMENT): number {
  const floor = SPIRIT_EXPERIMENTS[experiment].healFloor;
  return floor + (1 - floor) * (Math.max(0, Math.min(100, spirit)) / SPIRIT_MAX);
}

export const TURN_MS = 30_000;
export const GRACE_MS = 3_000;

export const FOOD_START = 60;
export const FOOD_MAX = 100;
export const FOOD_UPKEEP = 5;
export const FOOD_UPKEEP_BINH_LINH = 3;
export const FOOD_PER_TILE = 4;
export const STARVATION_HP_RATIO = 0.03;

export const ENERGY_MAX = 100;
export const ENERGY_PER_TILE = 10;
export const ENERGY_PHAP_SU = 1.5;
export const ENERGY_HUNGRY = 0.5;
export const ENERGY_IDLE_ALLY = 4;

export const RAGE_MAX = 100;
export const RAGE_PER_DRUM = 8;
/** +1 nộ cho mỗi 2% máu tối đa bị mất. */
export const RAGE_PER_HP_RATIO = 50;
export const PASSIVE_TURNS = 3;

/**
 * Mặc định tạm: docs chưa ghi lượng hồi của một ô tim. Chờ chốt bằng mô phỏng.
 */
export const HEAL_PER_TILE_RATIO = 0.03;
export const HEAL_Y_SU = 1.5;
/** Mặc định tạm: docs chưa ghi lượng hồi của Tim vàng. */
export const HEAL_TIM_VANG_RATIO = 0.2;
export const HEAL_TIM_BAC_RATIO = 0.1;

export const SWORD_WEAK = 1.5;
export const SWORD_STRONG = 2;
export const CASCADE_STEP_BONUS = 0.1;
export const CASCADE_MAX_BONUS = 0.5;
export const TUONG_SI_BONUS = 1.3;
export const BINH_LINH_DEF_PER_TIER = 0.05;
export const MUU_SI_DRAIN_PER_TILE = 2;

/**
 * Ô thu hoạch khi kỹ năng hoặc lần xoay miễn phí đổi bàn cờ (phá, biến, xoay rồi cascade), không phải
 * đổi ô. Không có hai hệ số này thì kỹ năng bàn cờ giá rẻ là một nước đi miễn phí: kiếm đánh đủ sát
 * thương và ô âm dương hoàn lại năng lượng để dùng tiếp (mô phỏng 19/10/2026).
 */
export const SKILL_BOARD_SWORD = 0.5;
export const SKILL_BOARD_ENERGY = 0.5;

export const BUA_AM_DUONG_ENERGY = 10;
export const GIO_BANH_FOOD = 5;
export const TRONG_DA_RAGE = 20;
export const TRONG_DONG_RAGE = 40;

export type Morale = "eager" | "normal" | "hungry" | "starving";

export function moraleOf(food: number): Morale {
  if (food >= 70) return "eager";
  if (food >= 30) return "normal";
  if (food >= 1) return "hungry";
  return "starving";
}

export const MORALE_DAMAGE: Record<Morale, number> = {
  eager: 1.15,
  normal: 1,
  hungry: 0.75,
  starving: 0.5,
};

/** Hệ số cascade: bước đầu ×1, mỗi bước sau +10%, tối đa +50%. */
export function cascadeMultiplier(stepIndex: number): number {
  return 1 + Math.min(CASCADE_MAX_BONUS, CASCADE_STEP_BONUS * stepIndex);
}

/** DEF dạng phần trăm: DEF 100 giảm 50% sát thương. */
export function defenseMultiplier(def: number, pierce = 0): number {
  return 100 / (100 + Math.max(0, def * (1 - pierce)));
}

export const TRONG_DONG_ATK = 0.1;
export const TRONG_DONG_TURNS = 2;
export const QUAN_SU_PER_TILE = 0.05;
export const QUAN_SU_MAX = 0.3;
export const QUAN_SU_TURNS = 3;
/** Mặc định tạm: docs ghi "Khiên tạm thời" nhưng chưa ghi thời lượng. */
export const Y_SU_SHIELD_TURNS = 2;
