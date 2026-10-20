// Tiến trình nhân vật: kinh nghiệm, cấp, điểm kỹ năng, nâng cấp kỹ năng, mở khóa theo cấp, nhánh nấc 2
// và phần thưởng cuối trận. Dữ liệu thuần, tuần tự hóa được (lưu DB hoặc trình duyệt).
// Xem docs/design/08-tien-trinh-kinh-te.md. Số liệu là điểm xuất phát, chờ mô phỏng cân bằng.

import {
  getSkill,
  heroSkills,
  professionSkills,
  SKILL_MAX_LEVEL,
  type BattleState,
  type Element,
  type FighterConfig,
  type Profession,
  type SideIndex,
} from "../battle";
import { BASE_STATS, mainCharacter } from "../roster";

export const MAX_LEVEL = 30;

/** Kinh nghiệm cần để lên từ `level` lên cấp kế tiếp. */
export function xpToNext(level: number): number {
  return 100 + 40 * (level - 1);
}

/** Tổng kinh nghiệm để đạt `level` tính từ cấp 1. */
export function totalXpFor(level: number): number {
  let sum = 0;
  for (let l = 1; l < Math.min(level, MAX_LEVEL); l++) sum += xpToNext(l);
  return sum;
}

/** Cấp ứng với một lượng kinh nghiệm tích lũy. */
export function levelForXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= totalXpFor(level + 1)) level++;
  return level;
}

/** Mỗi cấp trên 1 cộng thêm tỉ lệ này vào máu, ATK và DEF gốc. */
export const STAT_GROWTH = 0.03;
/** Điểm kỹ năng nhận mỗi lần lên cấp. */
export const SKILL_POINTS_PER_LEVEL = 1;
/** Điểm cần để nâng kỹ năng từ cấp i lên cấp i + 1 (chỉ số 1..4). */
export const UPGRADE_COST: Readonly<Record<number, number>> = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
};
/** Cấp tùy tướng (đối thủ AI dùng chiêu nghề) mở chiêu nhánh nấc 2, và giá mỗi chiêu nhánh. */
export const BRANCH_UNLOCK_LEVEL = 5;
export const BRANCH_COST = 1;
/** Cấp mở khóa từng ô kỹ năng của nhân vật chính và nhân vật kèm (ô 1–6). Bị động có từ cấp 1. */
export const MAIN_SLOT_UNLOCK: Readonly<Record<number, number>> = {
  1: 1,
  2: 1,
  3: 5,
  4: 10,
  5: 20,
  6: 15,
};

/**
 * Tiến trình của một nhân vật. Nhân vật chính và nhân vật kèm nâng kỹ năng theo ô ("o1".."o6") nên giữ
 * nguyên khi đổi nguyên tố; tùy tướng AI nâng chiêu nghề theo id. Không có trong `skillLevels` là cấp 1.
 */
export interface CharacterProgress {
  readonly xp: number;
  readonly level: number;
  readonly skillPoints: number;
  readonly skillLevels: Readonly<Record<string, number>>;
  /** Chiêu nhánh nấc 2 đã mua (chỉ tùy tướng AI). */
  readonly branches: readonly string[];
}

export const NEW_PROGRESS: CharacterProgress = {
  xp: 0,
  level: 1,
  skillPoints: 0,
  skillLevels: {},
  branches: [],
};

/** Khóa nâng cấp của ô kỹ năng nhân vật chính. */
export const mainSlotKey = (slot: number) => `o${slot}`;

/** Ô kỹ năng nhân vật chính đã mở ở `level`, theo thứ tự ô. */
export function unlockedMainSlots(level: number): number[] {
  return [1, 2, 3, 4, 5, 6].filter((slot) => level >= MAIN_SLOT_UNLOCK[slot]!);
}

export interface XpGain {
  readonly progress: CharacterProgress;
  readonly levelsGained: number;
}

/** Cộng kinh nghiệm; lên cấp thì nhận điểm kỹ năng. Kinh nghiệm không bao giờ mất. */
export function addXp(p: CharacterProgress, xp: number): XpGain {
  const total = p.xp + Math.max(0, Math.floor(xp));
  const level = levelForXp(total);
  const levelsGained = level - p.level;
  return {
    progress: {
      ...p,
      xp: total,
      level,
      skillPoints: p.skillPoints + levelsGained * SKILL_POINTS_PER_LEVEL,
    },
    levelsGained,
  };
}

/** Điểm cần cho lần nâng kế tiếp của kỹ năng đang ở `level`; null khi đã tối đa. */
export function upgradeCost(level: number): number | null {
  return level >= SKILL_MAX_LEVEL ? null : UPGRADE_COST[level]!;
}

export type ProgressError =
  | "maxLevel"
  | "notEnoughPoints"
  | "locked"
  | "owned"
  | "invalidSkill";
export type ProgressResult =
  | { readonly ok: true; readonly progress: CharacterProgress }
  | { readonly ok: false; readonly error: ProgressError };

/**
 * Các khóa nâng cấp được phép của một nhân vật ở cấp hiện tại. `profession` null là bộ theo ô (nhân vật
 * chính và nhân vật kèm), còn lại là chiêu nghề của tùy tướng AI.
 */
export function upgradeKeys(
  p: CharacterProgress,
  profession: Profession | null,
): string[] {
  if (profession === null) return unlockedMainSlots(p.level).map(mainSlotKey);
  return professionSkills(profession)
    .filter((s) => s.tier === 1 || p.branches.includes(s.id))
    .map((s) => s.id);
}

/**
 * Nâng một kỹ năng lên 1 cấp. `profession` null là bộ theo ô (nhân vật chính và nhân vật kèm), còn lại là
 * nghề của tùy tướng AI (khóa theo id chiêu).
 */
export function upgradeSkill(
  p: CharacterProgress,
  key: string,
  profession: Profession | null,
): ProgressResult {
  if (!upgradeKeys(p, profession).includes(key))
    return { ok: false, error: "locked" };
  const level = p.skillLevels[key] ?? 1;
  const cost = upgradeCost(level);
  if (cost === null) return { ok: false, error: "maxLevel" };
  if (p.skillPoints < cost) return { ok: false, error: "notEnoughPoints" };
  return {
    ok: true,
    progress: {
      ...p,
      skillPoints: p.skillPoints - cost,
      skillLevels: { ...p.skillLevels, [key]: level + 1 },
    },
  };
}

/** Mua một chiêu nhánh nấc 2 của tùy tướng AI. Mua được cả hai, mỗi trận chọn một. */
export function buyBranch(
  p: CharacterProgress,
  skill: string,
  profession: Profession,
): ProgressResult {
  const def = getSkill(skill);
  if (!def || def.profession !== profession || def.tier !== 2)
    return { ok: false, error: "invalidSkill" };
  if (p.branches.includes(skill)) return { ok: false, error: "owned" };
  if (p.level < BRANCH_UNLOCK_LEVEL) return { ok: false, error: "locked" };
  if (p.skillPoints < BRANCH_COST)
    return { ok: false, error: "notEnoughPoints" };
  return {
    ok: true,
    progress: {
      ...p,
      skillPoints: p.skillPoints - BRANCH_COST,
      branches: [...p.branches, skill],
    },
  };
}

function scaleStats(f: FighterConfig, level: number): FighterConfig {
  const base = BASE_STATS[f.profession];
  const m = 1 + STAT_GROWTH * (Math.min(MAX_LEVEL, Math.max(1, level)) - 1);
  return {
    ...f,
    maxHp: Math.round(base.maxHp * m),
    atk: Math.round(base.atk * m),
    def: Math.round(base.def * m),
  };
}

/**
 * Nhân vật chính theo tiến trình: chỉ mang kỹ năng đã mở, chỉ số và cấp kỹ năng theo cấp. `character` là
 * tướng lịch sử: ô 5 thay bằng chiêu riêng của người đó.
 */
export function buildMain(
  p: CharacterProgress,
  element: Element,
  profession: Profession,
  character?: string,
): FighterConfig {
  const open = new Set(unlockedMainSlots(p.level));
  const skills = heroSkills(element, character).filter((s) =>
    open.has(s.slot ?? 0),
  );
  const skillLevels = Object.fromEntries(
    skills.map((s) => [s.id, p.skillLevels[mainSlotKey(s.slot!)] ?? 1]),
  );
  return {
    ...scaleStats(mainCharacter(element, profession), p.level),
    skills: skills.map((s) => s.id),
    skillLevels,
  };
}

/**
 * Nhân vật kèm theo tiến trình (tướng thường, tướng lịch sử, sứ quân): dựng như nhân vật chính với nghề,
 * nguyên tố và kỹ năng ô 5 riêng.
 */
export function buildCompanion(
  base: FighterConfig,
  p: CharacterProgress,
): FighterConfig {
  return {
    ...buildMain(p, base.element, base.profession, base.id),
    id: base.id,
    name: base.name,
  };
}

/**
 * Tùy tướng chiến dịch (đối thủ AI không có bộ theo nguyên tố) theo tiến trình: chiêu nghề nấc 1, tối đa 1
 * chiêu nhánh nấc 2 đã mua (`branch`; bỏ trống thì lấy chiêu nhánh mua đầu tiên).
 */
export function buildAide(
  base: FighterConfig,
  p: CharacterProgress,
  branch?: string | null,
): FighterConfig {
  const tiers = professionSkills(base.profession);
  const chosen = branch && p.branches.includes(branch) ? branch : p.branches[0];
  const skills = tiers
    .filter((s) => s.tier === 1 || s.id === chosen)
    .map((s) => s.id);
  const skillLevels = Object.fromEntries(
    skills.map((id) => [id, p.skillLevels[id] ?? 1]),
  );
  return { ...scaleStats(base, p.level), skills, skillLevels };
}

/**
 * Tiến trình tự dựng ở một cấp, dùng cho đối thủ AI và mô phỏng: tiêu hết điểm, lần lượt nâng kỹ năng
 * đang thấp nhất; tùy tướng AI mua cả hai chiêu nhánh khi đủ cấp.
 */
export function autoProgress(
  level: number,
  profession: Profession | null,
): CharacterProgress {
  const lv = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  let p: CharacterProgress = {
    ...NEW_PROGRESS,
    xp: totalXpFor(lv),
    level: lv,
    skillPoints: (lv - 1) * SKILL_POINTS_PER_LEVEL,
  };
  if (profession !== null) {
    for (const s of professionSkills(profession).filter((d) => d.tier === 2)) {
      const r = buyBranch(p, s.id, profession);
      if (r.ok) p = r.progress;
    }
  }
  for (;;) {
    const keys = upgradeKeys(p, profession).sort(
      (a, b) => (p.skillLevels[a] ?? 1) - (p.skillLevels[b] ?? 1),
    );
    const next = keys.find((k) => upgradeSkill(p, k, profession).ok);
    if (!next) return p;
    p = (
      upgradeSkill(p, next, profession) as {
        ok: true;
        progress: CharacterProgress;
      }
    ).progress;
  }
}

/**
 * Tiến trình tối đa, cho chế độ chơi thử: cấp tối đa, mọi kỹ năng mở được đều ở cấp kỹ năng tối đa, tùy
 * tướng AI có đủ hai chiêu nhánh. Không phải tiến trình kiếm được (vượt tổng điểm kỹ năng của cấp tối đa).
 */
export function maxProgress(
  profession: Profession | null,
): CharacterProgress {
  const base: CharacterProgress = {
    ...NEW_PROGRESS,
    xp: totalXpFor(MAX_LEVEL),
    level: MAX_LEVEL,
    branches:
      profession === null
        ? []
        : professionSkills(profession)
            .filter((s) => s.tier === 2)
            .map((s) => s.id),
  };
  const keys = upgradeKeys(base, profession);
  return {
    ...base,
    skillLevels: Object.fromEntries(keys.map((k) => [k, SKILL_MAX_LEVEL])),
  };
}

// ——— Phần thưởng cuối trận ———

/** Kinh nghiệm mỗi ô sách ghép được, và vàng mỗi ô vàng. Điểm xuất phát. */
export const XP_PER_BOOK = 5;
export const GOLD_PER_COIN = 3;
/** Kinh nghiệm cơ bản mỗi nhân vật ra trận, theo kết quả. */
export const BASE_XP = { win: 60, loss: 20 } as const;
export const WIN_GOLD = 20;
/** Phụ ngoài trận của Quân sư (kinh nghiệm) và Mưu sĩ (vàng); có trong đội là được, không cộng dồn. */
export const PROFESSION_REWARD_BONUS = 0.1;

export interface BattleRewards {
  readonly won: boolean;
  /** Kinh nghiệm theo vị trí trong phe, đã chia đều. */
  readonly xp: readonly number[];
  readonly gold: number;
}

/**
 * Phần thưởng của một phe khi trận kết thúc. Thua vẫn giữ 100% vàng và sách đã nhặt. Kinh nghiệm cơ bản
 * tính cho từng người, cộng với kinh nghiệm từ sách, rồi chia đều cho mọi người ra trận (1vs1: nhân vật
 * chính nhận hết).
 */
export function battleRewards(
  state: BattleState,
  side: SideIndex,
  /** Ghi đè thắng/thua (sinh tồn tính thắng khi vượt qua ít nhất một đợt). */
  wonOverride?: boolean,
): BattleRewards {
  const own = state.sides[side];
  const won = wonOverride ?? state.winner === side;
  const n = own.fighters.length;
  const has = (prof: Profession) =>
    own.fighters.some((f) => f.profession === prof);
  const xpBonus = has("quanSu") ? 1 + PROFESSION_REWARD_BONUS : 1;
  const goldBonus = has("muuSi") ? 1 + PROFESSION_REWARD_BONUS : 1;
  const pool =
    ((won ? BASE_XP.win : BASE_XP.loss) * n + own.books * XP_PER_BOOK) *
    xpBonus;
  const each = Math.floor(pool / n);
  const gold = Math.floor(
    (own.gold * GOLD_PER_COIN + (won ? WIN_GOLD : 0)) * goldBonus,
  );
  return { won, xp: own.fighters.map(() => each), gold };
}
