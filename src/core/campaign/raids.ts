// Đánh trùm (lộ trình 4.5): đánh lại sứ quân đã hạ ở 3 bậc khó hơn, trên "sân nhà" của sứ quân, thưởng riêng.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/design/09-che-do-choi.md mục 2.2.

import type { Difficulty } from "../ai";
import { FOOD_MAX } from "../battle/rules";
import type { Element, FighterConfig, SideIndex } from "../battle";
import { STANDARD_WEIGHTS, type SpawnWeights } from "../board";
import { GEAR_SETS, GEAR_SLOTS, type GearItem, type Tier } from "../gear";
import {
  MAX_LEVEL,
  receiveDrop,
  type CampaignState,
  type Profile,
} from "../progress";
import type { Rng } from "../rng";
import {
  BOSS_HP,
  CAMPAIGN,
  recommendedLevel,
  stageById,
  stageFighter,
  type CampaignStage,
} from "./campaign";

export const RAID_TIERS = [1, 2, 3] as const;
export type RaidTier = (typeof RAID_TIERS)[number];

export interface RaidTierInfo {
  /** Tên bậc hiện cho người chơi. */
  readonly name: string;
  /** Đối thủ hơn cấp màn chừng này (tối đa cấp 30). */
  readonly levelBonus: number;
  readonly difficulty: Difficulty;
  /** Thưởng lần đầu thắng bậc: vàng và một món trang bị phẩm này theo nguyên tố của sứ quân. */
  readonly gold: number;
  readonly gearTier: Tier;
}

export const RAID_TIER_INFO: Readonly<Record<RaidTier, RaidTierInfo>> = {
  1: {
    name: "Bậc I",
    levelBonus: 4,
    difficulty: "boss",
    gold: 300,
    gearTier: 3,
  },
  2: {
    name: "Bậc II",
    levelBonus: 8,
    difficulty: "nightmare",
    gold: 600,
    gearTier: 4,
  },
  3: {
    name: "Bậc III",
    levelBonus: 12,
    difficulty: "nightmare",
    gold: 1000,
    gearTier: 5,
  },
};

export const isRaidTier = (x: unknown): x is RaidTier =>
  typeof x === "number" && (RAID_TIERS as readonly number[]).includes(x);

/**
 * Sân nhà: bàn cờ nghiêng về loại ô hợp với nguyên tố của sứ quân. Cả hai phe cùng ăn ô, nhưng sứ quân quen
 * đất nên luôn đi trước và vào trận đầy lương (FOOD_MAX).
 */
export const HOME_TERRAIN: Readonly<Record<Element, SpawnWeights>> = {
  kim: { ...STANDARD_WEIGHTS, kiem: 22, tim: 11 },
  moc: { ...STANDARD_WEIGHTS, tim: 19, vang: 9, sach: 9 },
  thuy: { ...STANDARD_WEIGHTS, banhChung: 9, amDuong: 22 },
  hoa: { ...STANDARD_WEIGHTS, kiem: 24, banhChung: 12, tim: 12 },
  tho: { ...STANDARD_WEIGHTS, banhChung: 21, vang: 9, sach: 10, kiem: 15 },
  loi: {
    ...STANDARD_WEIGHTS,
    amDuong: 22,
    trong: 17,
    banhChung: 12,
    tim: 12,
    vang: 9,
    sach: 10,
  },
  phong: {
    ...STANDARD_WEIGHTS,
    trong: 20,
    amDuong: 19,
    banhChung: 12,
    tim: 12,
    vang: 9,
    sach: 10,
  },
};

export const HOME_RULE: Readonly<Record<Element, string>> = {
  kim: "Sân nhà Kim: nhiều ô kiếm, ít ô tim.",
  moc: "Sân nhà Mộc: nhiều ô tim, ít vàng và sách.",
  thuy: "Sân nhà Thủy: sông nước, nhiều âm dương, ít bánh chưng.",
  hoa: "Sân nhà Hỏa: nhiều ô kiếm, ít bánh chưng và tim.",
  tho: "Sân nhà Thổ: kho lương đầy, nhiều bánh chưng.",
  loi: "Sân nhà Lôi: nhiều âm dương và trống trận.",
  phong: "Sân nhà Phong: nhiều trống trận và âm dương.",
};

/** Màn có trùm để đánh lại: thủ lĩnh là sứ quân (bỏ màn tập trận). */
export const RAID_STAGES: readonly CampaignStage[] = CAMPAIGN.filter(
  (s) => s.foes[0]!.hero,
);

export function isRaidStage(stage: CampaignStage): boolean {
  return RAID_STAGES.includes(stage);
}

export function raidLevel(stage: CampaignStage, tier: RaidTier): number {
  return Math.min(MAX_LEVEL, stage.level + RAID_TIER_INFO[tier].levelBonus);
}

/** Cấp gợi ý: cấp gợi ý của màn cộng cùng mức tăng của bậc. */
export function raidRecommended(stage: CampaignStage, tier: RaidTier): number {
  return Math.min(
    MAX_LEVEL,
    recommendedLevel(stage) + RAID_TIER_INFO[tier].levelBonus,
  );
}

/** Bậc cao nhất đã thắng của trùm ở màn này (0 là chưa). */
export function raidCleared(campaign: CampaignState, stageId: string): number {
  return campaign.raids[stageId] ?? 0;
}

/** Bậc 1 mở khi đã qua màn; bậc sau mở khi đã thắng bậc trước. */
export function raidUnlocked(
  campaign: CampaignState,
  stageId: string,
  tier: RaidTier,
): boolean {
  const stage = stageById(stageId);
  return (
    !!stage &&
    isRaidStage(stage) &&
    campaign.cleared.includes(stageId) &&
    raidCleared(campaign, stageId) >= tier - 1
  );
}

export interface RaidSetup {
  readonly foes: FighterConfig[];
  readonly difficulty: Difficulty;
  readonly weights: SpawnWeights;
  readonly foeFood: number;
  /** Sứ quân trên sân nhà luôn đi trước. */
  readonly firstSide: SideIndex;
  readonly rule: string;
}

/** Luật và đội đối thủ của một bậc: cả đội lên cấp, thủ lĩnh máu ×BOSS_HP, sân nhà theo nguyên tố thủ lĩnh. */
export function raidSetup(stage: CampaignStage, tier: RaidTier): RaidSetup {
  const level = raidLevel(stage, tier);
  const element = stage.foes[0]!.element;
  return {
    foes: stage.foes.map((f, i) => {
      const fighter = stageFighter(f, level);
      return i === 0
        ? { ...fighter, maxHp: Math.round(fighter.maxHp * BOSS_HP) }
        : fighter;
    }),
    difficulty: RAID_TIER_INFO[tier].difficulty,
    weights: HOME_TERRAIN[element],
    foeFood: FOOD_MAX,
    firstSide: 1,
    rule: `${HOME_RULE[element]} Sứ quân đi trước, vào trận đầy lương.`,
  };
}

export interface RaidResult {
  readonly tier: RaidTier;
  /** Lần đầu thắng bậc này. */
  readonly firstClear: boolean;
  readonly bonusGold: number;
  /** Món thưởng lần đầu đã vào túi; null khi không có hoặc túi đầy (khi đó bán ngay). */
  readonly item: GearItem | null;
  readonly soldFor: number;
}

/** Món thưởng lần đầu: phẩm theo bậc, nguyên tố của sứ quân; vũ khí theo nghề của sứ quân. */
export function raidRewardItem(
  rng: Rng,
  stage: CampaignStage,
  tier: RaidTier,
): GearItem {
  const leader = stage.foes[0]!;
  const slot = GEAR_SLOTS[rng.int(0, GEAR_SLOTS.length - 1)]!;
  const item: GearItem = {
    id: "",
    slot,
    element: leader.element,
    tier: RAID_TIER_INFO[tier].gearTier,
    set: GEAR_SETS[rng.int(0, GEAR_SETS.length - 1)]!.id,
  };
  return slot === "vuKhi" ? { ...item, profession: leader.profession } : item;
}

/** Cộng kết quả trận đánh trùm: thắng lần đầu bậc này thì ghi bậc, thưởng vàng và một món trang bị. */
export function applyRaidResult(
  profile: Profile,
  stageId: string,
  tier: RaidTier,
  won: boolean,
  rng: Rng,
): { profile: Profile; result: RaidResult } {
  const stage = stageById(stageId);
  const firstClear =
    !!stage && won && raidCleared(profile.campaign, stageId) < tier;
  if (!firstClear)
    return {
      profile,
      result: { tier, firstClear, bonusGold: 0, item: null, soldFor: 0 },
    };
  const { gold } = RAID_TIER_INFO[tier];
  const next: Profile = {
    ...profile,
    gold: profile.gold + gold,
    campaign: {
      ...profile.campaign,
      raids: { ...profile.campaign.raids, [stageId]: tier },
    },
  };
  const received = receiveDrop(next, raidRewardItem(rng, stage!, tier));
  return {
    profile: received.profile,
    result: {
      tier,
      firstClear,
      bonusGold: gold,
      item: received.item,
      soldFor: received.soldFor,
    },
  };
}
