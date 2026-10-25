// Đánh trùm (lộ trình 4.5): đấu lại sứ quân ở 3 bậc khó hơn, trên "sân nhà" của sứ quân, thưởng riêng.
// Số liệu là điểm xuất phát do Claude đặt, chờ Shan duyệt. Xem docs/design/09-che-do-choi.md mục 2.2.
// CAMP-08.04: đối thủ đọc từ danh mục sứ quân (warlords.ts), mở theo mốc Campaign V2 (design-freeze mục 5), bậc
// lưu theo id sứ quân. Chỉ 6 sứ quân bị đánh dẹp trong cốt truyện (nhóm "military" của sổ thế cục) là trùm, mỗi
// trận là tái đấu (Shan chốt 25/10/2026); đồng minh, sứ quân quy phục hay tan rã không có trận Đánh trùm.

import type { Difficulty } from "../ai";
import { FOOD_MAX } from "../battle/rules";
import type { FighterConfig } from "../battle";
import type { SpawnWeights } from "../board";
import { GEAR_SETS, GEAR_SLOTS, type GearItem, type Tier } from "../gear";
import {
  MAX_LEVEL,
  receiveDrop,
  type CampaignState,
  type Profile,
} from "../progress";
import type { Rng } from "../rng";
import { factionResolutionOf, type CampaignFactionId } from "./factions";
import { STORY_NODES, type CampaignMissionId } from "./storyNodes";
import {
  BOSS_HP,
  HOME_RULE,
  HOME_TERRAIN,
  WARLORD_ENCOUNTERS,
  encounterFighter,
  warlordEncounter,
  type WarlordEncounter,
} from "./warlords";

export const RAID_TIERS = [1, 2, 3] as const;
export type RaidTier = (typeof RAID_TIERS)[number];

export interface RaidTierInfo {
  /** Tên bậc hiện cho người chơi. */
  readonly name: string;
  /** Đối thủ hơn cấp màn chừng này (tối đa cấp 30). */
  readonly levelBonus: number;
  /** AI khó hơn màn gốc chừng này nấc (Dễ → Thường → Khó → Trùm → Ác mộng). */
  readonly difficultySteps: number;
  /** Thưởng lần đầu thắng bậc: vàng và một món trang bị phẩm này theo nguyên tố của sứ quân. */
  readonly gold: number;
  readonly gearTier: Tier;
}

export const RAID_TIER_INFO: Readonly<Record<RaidTier, RaidTierInfo>> = {
  1: {
    name: "Bậc I",
    levelBonus: 4,
    difficultySteps: 1,
    gold: 300,
    gearTier: 3,
  },
  2: {
    name: "Bậc II",
    levelBonus: 8,
    difficultySteps: 2,
    gold: 600,
    gearTier: 4,
  },
  3: {
    name: "Bậc III",
    levelBonus: 12,
    difficultySteps: 3,
    gold: 1000,
    gearTier: 5,
  },
};

export const isRaidTier = (x: unknown): x is RaidTier =>
  typeof x === "number" && (RAID_TIERS as readonly number[]).includes(x);

const DIFFICULTY_ORDER: readonly Difficulty[] = [
  "easy",
  "normal",
  "hard",
  "boss",
  "nightmare",
];

/** Trùm đánh lại được: 6 sứ quân bị đánh dẹp trong cốt truyện, theo thứ tự danh mục, mỗi người mở theo mốc riêng. */
export const RAID_BOSSES: readonly WarlordEncounter[] =
  WARLORD_ENCOUNTERS.filter(
    (w) => factionResolutionOf(w.id)?.group === "military",
  );

const RAID_BOSS_IDS = new Set<string>(RAID_BOSSES.map((b) => b.id));

export function raidBossById(id: string): WarlordEncounter | undefined {
  return RAID_BOSS_IDS.has(id) ? warlordEncounter(id) : undefined;
}

/** Độ khó AI của bậc: nâng từ độ khó gốc của sứ quân, tối đa Ác mộng. */
export function raidDifficulty(
  boss: WarlordEncounter,
  tier: RaidTier,
): Difficulty {
  const i = DIFFICULTY_ORDER.indexOf(boss.difficulty);
  return DIFFICULTY_ORDER[
    Math.min(
      DIFFICULTY_ORDER.length - 1,
      i + RAID_TIER_INFO[tier].difficultySteps,
    )
  ]!;
}

export function raidLevel(boss: WarlordEncounter, tier: RaidTier): number {
  return Math.min(MAX_LEVEL, boss.level + RAID_TIER_INFO[tier].levelBonus);
}

/** Cấp gợi ý: cấp gợi ý gốc cộng cùng mức tăng của bậc. */
export function raidRecommended(
  boss: WarlordEncounter,
  tier: RaidTier,
): number {
  return Math.min(
    MAX_LEVEL,
    boss.recommended + RAID_TIER_INFO[tier].levelBonus,
  );
}

/** Bậc cao nhất đã thắng của sứ quân này (0 là chưa). */
export function raidCleared(campaign: CampaignState, bossId: string): number {
  return campaign.raids[bossId as CampaignFactionId] ?? 0;
}

/**
 * Nhiệm vụ Campaign V2 mở Đánh trùm của trùm `id` (unlockedContent kind "raid" của node, design-freeze mục 5).
 * Mốc đó cũng mở bán sứ quân ở cửa hàng (warlordUnlockMission), kể cả sứ quân không phải trùm.
 */
export function raidUnlockMission(id: string): CampaignMissionId | undefined {
  if (!RAID_BOSS_IDS.has(id)) return undefined;
  return STORY_NODES.find((node) =>
    node.unlockedContent.some((u) => u.kind === "raid" && u.target === id),
  )?.id;
}

/** Đã qua nhiệm vụ mở khóa của sứ quân (server ghi completion). */
export function raidBossOpen(campaign: CampaignState, bossId: string): boolean {
  const gate = raidUnlockMission(bossId);
  return !!gate && campaign.completed.includes(gate);
}

/** Bậc 1 mở khi đã qua mốc; bậc sau mở khi đã thắng bậc trước. */
export function raidUnlocked(
  campaign: CampaignState,
  bossId: string,
  tier: RaidTier,
): boolean {
  return (
    !!raidBossById(bossId) &&
    raidBossOpen(campaign, bossId) &&
    raidCleared(campaign, bossId) >= tier - 1
  );
}

export interface RaidSetup {
  readonly foes: FighterConfig[];
  readonly difficulty: Difficulty;
  readonly weights: SpawnWeights;
  readonly foeFood: number;
  readonly rule: string;
}

/** Luật và đội đối thủ của một bậc: cả đội lên cấp, thủ lĩnh 3vs3 máu ×BOSS_HP, sân nhà theo nguyên tố thủ lĩnh. */
export function raidSetup(boss: WarlordEncounter, tier: RaidTier): RaidSetup {
  const level = raidLevel(boss, tier);
  const element = boss.foes[0]!.element;
  return {
    foes: boss.foes.map((f, i) => {
      const fighter = encounterFighter(f, level);
      // 1vs1 đã nhân máu cho cả hai phe; thêm máu trùm nữa thì quá khó (mô phỏng 20/10/2026: 20–25%).
      return i === 0 && boss.mode === "3v3"
        ? { ...fighter, maxHp: Math.round(fighter.maxHp * BOSS_HP) }
        : fighter;
    }),
    difficulty: raidDifficulty(boss, tier),
    weights: HOME_TERRAIN[element],
    foeFood: FOOD_MAX,
    rule: `${HOME_RULE[element]} Sứ quân vào trận đầy lương.`,
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
  boss: WarlordEncounter,
  tier: RaidTier,
): GearItem {
  const leader = boss.foes[0]!;
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

/**
 * Cộng kết quả trận đánh trùm: thắng lần đầu bậc này thì ghi bậc, thưởng vàng và một món trang bị. Bậc đã ghi
 * thì thắng lại không thưởng nữa, nên chốt cùng một trận hai lần không nhận hai lần.
 */
export function applyRaidResult(
  profile: Profile,
  bossId: string,
  tier: RaidTier,
  won: boolean,
  rng: Rng,
): { profile: Profile; result: RaidResult } {
  const boss = raidBossById(bossId);
  const firstClear =
    !!boss && won && raidCleared(profile.campaign, bossId) < tier;
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
      raids: { ...profile.campaign.raids, [boss!.id]: tier },
    },
  };
  const received = receiveDrop(next, raidRewardItem(rng, boss!, tier));
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
