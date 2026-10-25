import {
  clampCampaignFood,
  chapterCompleted,
  completeCampaignNode,
  recordCampaignRewardReceipt,
  type CampaignRegionalOutcome,
  type CampaignRegion,
  type CampaignStoryFlag,
} from "../progress/campaignState";
import {
  NEW_PROGRESS,
  SKILL_POINTS_PER_LEVEL,
  totalXpFor,
  type CharacterProgress,
} from "../progress/progress";
import type { Profile } from "../progress/profile";
import {
  isCombatStoryNode,
  storyNodeById,
  type CampaignCompanionId,
  type CampaignMissionId,
} from "./storyNodes";
import {
  recordFactionResolution,
  type CampaignFactionResolution,
} from "./factions";

export const CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD = 250;

export type CampaignRewardSource = "event" | "battle";

export interface CampaignFirstClearInput {
  readonly nodeId: CampaignMissionId;
  readonly source: CampaignRewardSource;
  readonly choice?: string;
  readonly flags?: readonly CampaignStoryFlag[];
  readonly turns?: number;
  /** Only battle settlement may carry remaining supplies into Campaign. */
  readonly supply?: number;
}

export interface CampaignFirstClearReward {
  readonly nodeId: CampaignMissionId;
  readonly firstClear: boolean;
  readonly missionGold: number;
  readonly chapterGold: number;
  readonly totalGold: number;
  readonly supply: number;
  readonly unlockedHeroes: readonly CampaignCompanionId[];
  /** Sứ quân nhiệm vụ này giải quyết; `factionRecorded` chỉ đúng ở lần ghi đầu tiên. */
  readonly faction?: CampaignFactionResolution;
  readonly factionRecorded: boolean;
}

export type CampaignFirstClearResult =
  | {
      readonly ok: true;
      readonly profile: Profile;
      readonly reward: CampaignFirstClearReward;
    }
  | {
      readonly ok: false;
      readonly error: "unknownNode" | "wrongSource" | "locked" | "invalidChoice" | "invalidTurns";
    };

const REGIONAL_RESULT: Readonly<
  Partial<Record<CampaignMissionId, readonly [CampaignRegion, CampaignRegionalOutcome]>>
> = {
  M04: ["hoaLu", "defended"],
  M05: ["boHai", "allied"],
  M06: ["boHai", "allied"],
  M13: ["westernRoute", "settled"],
  M14: ["westernRoute", "settled"],
  M19: ["easternRoute", "settled"],
  M24: ["unification", "unified"],
};

function recruitProgress(level: number): CharacterProgress {
  const normalized = Math.max(1, Math.floor(level));
  return {
    ...NEW_PROGRESS,
    level: normalized,
    xp: totalXpFor(normalized),
    skillPoints: (normalized - 1) * SKILL_POINTS_PER_LEVEL,
  };
}

/**
 * Applies Campaign-only completion, first-clear gold, chapter bonus, supplies
 * and recruits as one pure Profile transition. The server must call it inside
 * one owner-scoped CAS update.
 */
export function applyCampaignFirstClear(
  profile: Profile,
  input: CampaignFirstClearInput,
): CampaignFirstClearResult {
  const node = storyNodeById(input.nodeId);
  if (!node) return { ok: false, error: "unknownNode" };
  if ((input.source === "battle") !== isCombatStoryNode(node))
    return { ok: false, error: "wrongSource" };

  const completion = completeCampaignNode(profile.campaign, input.nodeId, {
    ...(input.choice === undefined ? {} : { choice: input.choice }),
    ...(input.flags === undefined ? {} : { flags: input.flags }),
    ...(input.turns === undefined ? {} : { turns: input.turns }),
  });
  if (!completion.ok) return completion;

  const nodeReceipt = `node:${input.nodeId}` as const;
  const missionReceipt = recordCampaignRewardReceipt(
    completion.campaign,
    nodeReceipt,
  );
  let campaign = missionReceipt.campaign;
  const missionGold = missionReceipt.recorded ? node.rewards.firstClearGold : 0;

  const regional = REGIONAL_RESULT[input.nodeId];
  if (regional) {
    const [region, outcome] = regional;
    campaign = {
      ...campaign,
      regionalOutcomes: { ...campaign.regionalOutcomes, [region]: outcome },
    };
  }
  const faction = recordFactionResolution(campaign.factions, input.nodeId);
  if (faction.recorded) campaign = { ...campaign, factions: faction.factions };
  if (input.source === "battle" && input.supply !== undefined)
    campaign = { ...campaign, supply: clampCampaignFood(input.supply) };

  let chapterGold = 0;
  const unlockedHeroes: CampaignCompanionId[] = [];
  let companions = profile.companions;
  if (chapterCompleted(campaign, node.chapter)) {
    const chapterReceipt = recordCampaignRewardReceipt(
      campaign,
      `chapter:${node.chapter}`,
    );
    campaign = chapterReceipt.campaign;
    if (chapterReceipt.recorded)
      chapterGold = CAMPAIGN_CHAPTER_FIRST_CLEAR_GOLD;

    for (const unlock of node.unlockedContent) {
      if (unlock.kind !== "companion") continue;
      const heroReceipt = recordCampaignRewardReceipt(
        campaign,
        `hero:${unlock.id}`,
      );
      campaign = heroReceipt.campaign;
      if (!campaign.unlockedHeroes.includes(unlock.id))
        campaign = {
          ...campaign,
          unlockedHeroes: [...campaign.unlockedHeroes, unlock.id],
        };
      if (!Object.hasOwn(companions, unlock.id))
        companions = {
          ...companions,
          [unlock.id]: recruitProgress(profile.main.level),
        };
      if (heroReceipt.recorded) unlockedHeroes.push(unlock.id);
    }
  }

  const totalGold = missionGold + chapterGold;
  return {
    ok: true,
    profile: {
      ...profile,
      gold: profile.gold + totalGold,
      companions,
      campaign,
    },
    reward: {
      nodeId: input.nodeId,
      firstClear: missionReceipt.recorded,
      missionGold,
      chapterGold,
      totalGold,
      supply: campaign.supply,
      unlockedHeroes,
      ...(faction.resolution ? { faction: faction.resolution } : {}),
      factionRecorded: faction.recorded,
    },
  };
}
