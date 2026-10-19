// Hằng số luật trận đấu. Số liệu là điểm xuất phát, sẽ chỉnh bằng mô phỏng.
// Xem docs/design/02-tran-dau.md và docs/design/03-tai-nguyen-cong-thuc.md.

import type { TileKind } from "../board";

export const PROFESSIONS = ["tuongSi", "phapSu", "binhLinh", "ySu", "muuSi", "quanSu"] as const;
export type Profession = (typeof PROFESSIONS)[number];

/** Loại ô gắn với mỗi nghề. Trống trận không gắn nghề nào. */
export const PROFESSION_TILE: Record<Profession, TileKind> = {
  tuongSi: "kiem",
  phapSu: "amDuong",
  binhLinh: "banhChung",
  ySu: "tim",
  muuSi: "vang",
  quanSu: "sach",
};

/** 1vs1: máu tối đa nhân thêm, vì không có đồng đội chia sát thương. Điểm xuất phát theo mô phỏng. */
export const SOLO_HP_MULTIPLIER = 2;

/**
 * Mệt mỏi (1vs1): từ lượt thứ FATIGUE_START_TURN của mỗi phe, hồi máu và Khiên giảm FATIGUE_STEP
 * mỗi lượt, về 0 sau 10 lượt, để trận giữa hai bên thiên phòng thủ vẫn kết thúc bằng hạ gục.
 */
export const FATIGUE_START_TURN = 30;
export const FATIGUE_STEP = 0.1;

/** Hệ số hồi máu và Khiên theo số lượt của phe (tính từ 1). */
export function fatigueMultiplier(sideTurn: number): number {
  if (sideTurn < FATIGUE_START_TURN) return 1;
  return Math.max(0, 1 - FATIGUE_STEP * (sideTurn - FATIGUE_START_TURN + 1));
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
