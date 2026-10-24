import {
  CAMPAIGN_MISSION_IDS,
  STORY_NODES,
  isCampaignMissionId,
  isCombatStoryNode,
  storyNodeById,
  type CampaignChapter,
  type CampaignCompanionId,
  type CampaignMissionId,
} from "../campaign/storyNodes";

export const CAMPAIGN_FOOD_MIN = 20;
export const CAMPAIGN_FOOD_MAX = 100;
export const CAMPAIGN_FOOD_START = 60;
export const FOOD_PRICE = 3;

export const CAMPAIGN_STORY_FLAGS = [
  "introViewed",
  "historyNoteViewed",
  "choiceSubmitted",
  "outroViewed",
] as const;
export type CampaignStoryFlag = (typeof CAMPAIGN_STORY_FLAGS)[number];

export const CAMPAIGN_REGIONS = [
  "hoaLu",
  "boHai",
  "westernRoute",
  "easternRoute",
  "unification",
] as const;
export type CampaignRegion = (typeof CAMPAIGN_REGIONS)[number];
export type CampaignRegionalOutcome =
  | "defended"
  | "allied"
  | "settled"
  | "secured"
  | "unified";

export const CAMPAIGN_CHOICE_IDS: Readonly<
  Partial<Record<CampaignMissionId, readonly string[]>>
> = {
  M01: ["listen", "folkPainting"],
  M02: ["askCoLoa", "askCountryside"],
  M03: ["reassurePeople", "fortifyPass"],
  M04: ["holdPass", "evacuatePeople"],
  M05: ["riverRoute", "landRoute"],
  M06: ["protectPeople", "keepWord", "unify"],
  M07: ["leadVanguard", "holdRearguard"],
  M08: ["silentMemorial", "addressTroops"],
  M09: ["viewTimeline", "fatherSonDialogue"],
  M10: ["viewWest", "viewEast"],
  M11: ["retainForces", "protectPeople"],
  M12: ["showStrength", "privateMeeting"],
  M13: ["publicTerms", "privatePledge"],
  M14: ["protectCivilians", "collectWeapons"],
  M15: ["offerSurrender", "advance"],
  M16: ["scoutWater", "advance"],
  M17: ["strategicBriefing", "rallyTroops"],
  M18: ["civilianRelief", "prepareLogistics"],
  M19: ["leHoanObserves", "anonymousEnvoy"],
  M20: ["breachGate", "drawOutForces"],
  M21: ["callOpenGate", "declareAdvance"],
  M22: ["disarmFirst", "rescueFirst"],
  M23: ["livelihood", "army", "law"],
  M24: ["armyView", "hoaLuView", "dinhLienView"],
};

export type CampaignRewardReceiptId =
  | `node:${CampaignMissionId}`
  | `chapter:${CampaignChapter}`
  | `hero:${CampaignCompanionId}`;

/** Temporary state for the old 13-stage and Raid adapters. */
export interface LegacyCampaignAdapterState {
  readonly cleared: readonly string[];
  readonly raids: Readonly<Record<string, number>>;
  readonly bestTurns: Readonly<Record<string, number>>;
}

export interface CampaignProgressV2 {
  readonly version: 2;
  readonly completed: readonly CampaignMissionId[];
  readonly inProgress: readonly CampaignMissionId[];
  readonly storyChoices: Readonly<Partial<Record<CampaignMissionId, string>>>;
  readonly storyFlags: Readonly<
    Partial<Record<CampaignMissionId, readonly CampaignStoryFlag[]>>
  >;
  readonly regionalOutcomes: Readonly<
    Partial<Record<CampaignRegion, CampaignRegionalOutcome>>
  >;
  readonly bestBattleTurns: Readonly<
    Partial<Record<CampaignMissionId, number>>
  >;
  readonly supply: number;
  readonly rewardReceipts: readonly CampaignRewardReceiptId[];
  readonly unlockedHeroes: readonly CampaignCompanionId[];
  /** @deprecated Remove after old Campaign/Raid callers migrate. */
  readonly legacy: LegacyCampaignAdapterState;
}

export type CampaignState = CampaignProgressV2;

const LEGACY_STAGE_IDS = [
  "coLau",
  "boHai",
  "dangChau",
  "binhKieu",
  "duongLam",
  "tamDai",
  "phongChau",
  "hoiHo",
  "sieuLoai",
  "tienDu",
  "teGiang",
  "tayPhuLiet",
  "doDong",
] as const;
const LEGACY_STAGE_SET = new Set<string>(LEGACY_STAGE_IDS);
const STORY_FLAG_SET = new Set<string>(CAMPAIGN_STORY_FLAGS);
const REGION_SET = new Set<string>(CAMPAIGN_REGIONS);
const HERO_IDS = [
  "dinhLien",
  "nguyenBac",
  "dinhDien",
  "luuCo",
  "trinhTu",
  "leHoan",
] as const satisfies readonly CampaignCompanionId[];
const HERO_SET = new Set<string>(HERO_IDS);
const OUTCOME_BY_REGION: Readonly<
  Record<CampaignRegion, readonly CampaignRegionalOutcome[]>
> = {
  hoaLu: ["defended"],
  boHai: ["allied"],
  westernRoute: ["settled", "secured"],
  easternRoute: ["settled", "secured"],
  unification: ["unified"],
};

const emptyLegacy = (): LegacyCampaignAdapterState => ({
  cleared: [],
  raids: {},
  bestTurns: {},
});

export function newCampaignProgressV2(
  raids: Readonly<Record<string, number>> = {},
): CampaignProgressV2 {
  return {
    version: 2,
    completed: [],
    inProgress: [],
    storyChoices: {},
    storyFlags: {},
    regionalOutcomes: {},
    bestBattleTurns: {},
    supply: CAMPAIGN_FOOD_START,
    rewardReceipts: [],
    unlockedHeroes: [],
    legacy: { ...emptyLegacy(), raids },
  };
}

export const NEW_CAMPAIGN: CampaignProgressV2 = newCampaignProgressV2();

export const clampCampaignFood = (supply: number) =>
  Math.max(
    CAMPAIGN_FOOD_MIN,
    Math.min(CAMPAIGN_FOOD_MAX, Math.round(supply)),
  );

export function chapterCompleted(
  campaign: CampaignProgressV2,
  chapter: CampaignChapter,
): boolean {
  return STORY_NODES.filter((node) => node.chapter === chapter).every((node) =>
    campaign.completed.includes(node.id),
  );
}

/** Chapters IV and V are parallel geographic routes after Chapter III. */
export function chapterUnlocked(
  campaign: CampaignProgressV2,
  chapter: CampaignChapter,
): boolean {
  if (chapter === 1) return true;
  if (chapter === 2) return chapterCompleted(campaign, 1);
  if (chapter === 3) return chapterCompleted(campaign, 2);
  if (chapter === 4 || chapter === 5) return chapterCompleted(campaign, 3);
  return chapterCompleted(campaign, 4) && chapterCompleted(campaign, 5);
}

export function campaignNodeUnlocked(
  campaign: CampaignProgressV2,
  id: CampaignMissionId,
): boolean {
  const node = storyNodeById(id);
  return (
    !!node &&
    chapterUnlocked(campaign, node.chapter) &&
    node.prereqs.every((prereq) => campaign.completed.includes(prereq))
  );
}

export type CompleteCampaignNodeResult =
  | { readonly ok: true; readonly campaign: CampaignProgressV2 }
  | {
      readonly ok: false;
      readonly error:
        | "unknownNode"
        | "locked"
        | "invalidChoice"
        | "invalidTurns";
    };

/** Applies a completion already authorized by the server. */
export function completeCampaignNode(
  campaign: CampaignProgressV2,
  id: string,
  options: {
    readonly choice?: string;
    readonly flags?: readonly CampaignStoryFlag[];
    readonly turns?: number;
  } = {},
): CompleteCampaignNodeResult {
  if (!isCampaignMissionId(id)) return { ok: false, error: "unknownNode" };
  if (!campaignNodeUnlocked(campaign, id))
    return { ok: false, error: "locked" };
  const choices = CAMPAIGN_CHOICE_IDS[id] ?? [];
  if (options.choice !== undefined && !choices.includes(options.choice))
    return { ok: false, error: "invalidChoice" };
  const recordedChoice = campaign.storyChoices[id];
  if (
    campaign.completed.includes(id) &&
    options.choice !== undefined &&
    options.choice !== recordedChoice
  )
    return { ok: false, error: "invalidChoice" };
  const node = storyNodeById(id)!;
  if (
    options.turns !== undefined &&
    (!isCombatStoryNode(node) ||
      !Number.isSafeInteger(options.turns) ||
      options.turns <= 0)
  )
    return { ok: false, error: "invalidTurns" };

  const completed = campaign.completed.includes(id)
    ? campaign.completed
    : [...campaign.completed, id];
  const oldBest = campaign.bestBattleTurns[id];
  const bestBattleTurns =
    options.turns !== undefined &&
    (oldBest === undefined || options.turns < oldBest)
      ? { ...campaign.bestBattleTurns, [id]: options.turns }
      : campaign.bestBattleTurns;
  const flags = options.flags
    ? [...new Set(options.flags.filter((flag) => STORY_FLAG_SET.has(flag)))]
    : undefined;
  return {
    ok: true,
    campaign: {
      ...campaign,
      completed,
      inProgress: campaign.inProgress.filter((nodeId) => nodeId !== id),
      storyChoices:
        options.choice === undefined
          ? campaign.storyChoices
          : { ...campaign.storyChoices, [id]: options.choice },
      storyFlags:
        flags === undefined
          ? campaign.storyFlags
          : { ...campaign.storyFlags, [id]: flags },
      bestBattleTurns,
    },
  };
}

export function beginCampaignNode(
  campaign: CampaignProgressV2,
  id: string,
): CampaignProgressV2 {
  if (
    !isCampaignMissionId(id) ||
    campaign.completed.includes(id) ||
    campaign.inProgress.includes(id) ||
    !campaignNodeUnlocked(campaign, id)
  )
    return campaign;
  return { ...campaign, inProgress: [...campaign.inProgress, id] };
}

export function recordCampaignRewardReceipt(
  campaign: CampaignProgressV2,
  receipt: string,
): { readonly campaign: CampaignProgressV2; readonly recorded: boolean } {
  if (!validReceipt(receipt) || campaign.rewardReceipts.includes(receipt))
    return { campaign, recorded: false };
  return {
    campaign: {
      ...campaign,
      rewardReceipts: [...campaign.rewardReceipts, receipt],
    },
    recorded: true,
  };
}

function uniqueStrings(raw: unknown): string[] {
  return Array.isArray(raw)
    ? [
        ...new Set(
          raw.filter((value): value is string => typeof value === "string"),
        ),
      ]
    : [];
}

function parseLegacy(raw: unknown): LegacyCampaignAdapterState {
  const value = raw as Partial<LegacyCampaignAdapterState> | null;
  const source = value && typeof value === "object" ? value : {};
  const cleared = uniqueStrings(source.cleared).filter((id) =>
    LEGACY_STAGE_SET.has(id),
  );
  const raids = Object.fromEntries(
    Object.entries(
      source.raids && typeof source.raids === "object" ? source.raids : {},
    ).filter(
      ([id, tier]) =>
        LEGACY_STAGE_SET.has(id) &&
        Number.isInteger(tier) &&
        Number(tier) >= 1 &&
        Number(tier) <= 3,
    ),
  ) as Readonly<Record<string, number>>;
  const bestTurns = Object.fromEntries(
    Object.entries(
      source.bestTurns && typeof source.bestTurns === "object"
        ? source.bestTurns
        : {},
    ).filter(
      ([id, turns]) =>
        LEGACY_STAGE_SET.has(id) &&
        Number.isSafeInteger(turns) &&
        Number(turns) > 0,
    ),
  ) as Readonly<Record<string, number>>;
  return { cleared, raids, bestTurns };
}

function normalizeCompleted(raw: unknown): CampaignMissionId[] {
  const candidates = new Set(uniqueStrings(raw).filter(isCampaignMissionId));
  const completed: CampaignMissionId[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of CAMPAIGN_MISSION_IDS) {
      if (!candidates.has(id) || completed.includes(id)) continue;
      const node = storyNodeById(id)!;
      if (node.prereqs.every((prereq) => completed.includes(prereq))) {
        completed.push(id);
        changed = true;
      }
    }
  }
  return completed;
}

function validReceipt(value: string): value is CampaignRewardReceiptId {
  if (value.startsWith("node:"))
    return isCampaignMissionId(value.slice("node:".length));
  if (/^chapter:[1-6]$/.test(value)) return true;
  return value.startsWith("hero:") && HERO_SET.has(value.slice("hero:".length));
}

export function parseCampaign(raw: unknown): CampaignProgressV2 {
  const value = raw as Partial<CampaignProgressV2> & {
    readonly raids?: unknown;
  };
  if (!value || typeof value !== "object") return newCampaignProgressV2();

  // V1 completion is intentionally reset. Raid tiers survive the transition.
  if (value.version !== 2) {
    const old = parseLegacy(value);
    return newCampaignProgressV2(old.raids);
  }

  const completed = normalizeCompleted(value.completed);
  const supply =
    typeof value.supply === "number" && Number.isFinite(value.supply)
      ? clampCampaignFood(value.supply)
      : CAMPAIGN_FOOD_START;
  const provisional: CampaignProgressV2 = {
    ...newCampaignProgressV2(),
    completed,
    supply,
  };
  const inProgress = uniqueStrings(value.inProgress).filter(
    (id): id is CampaignMissionId =>
      isCampaignMissionId(id) &&
      !completed.includes(id) &&
      campaignNodeUnlocked(provisional, id),
  );
  const storyChoices = Object.fromEntries(
    Object.entries(
      value.storyChoices && typeof value.storyChoices === "object"
        ? value.storyChoices
        : {},
    ).filter(
      ([id, choice]) =>
        isCampaignMissionId(id) &&
        typeof choice === "string" &&
        (CAMPAIGN_CHOICE_IDS[id] ?? []).includes(choice),
    ),
  );
  const storyFlags = Object.fromEntries(
    Object.entries(
      value.storyFlags && typeof value.storyFlags === "object"
        ? value.storyFlags
        : {},
    ).flatMap(([id, flags]) => {
      if (!isCampaignMissionId(id)) return [];
      const parsed = uniqueStrings(flags).filter(
        (flag): flag is CampaignStoryFlag => STORY_FLAG_SET.has(flag),
      );
      return parsed.length > 0 ? [[id, parsed] as const] : [];
    }),
  );
  const regionalOutcomes = Object.fromEntries(
    Object.entries(
      value.regionalOutcomes && typeof value.regionalOutcomes === "object"
        ? value.regionalOutcomes
        : {},
    ).filter(
      ([region, outcome]) =>
        REGION_SET.has(region) &&
        typeof outcome === "string" &&
        OUTCOME_BY_REGION[region as CampaignRegion].includes(
          outcome as CampaignRegionalOutcome,
        ),
    ),
  );
  const bestBattleTurns = Object.fromEntries(
    Object.entries(
      value.bestBattleTurns && typeof value.bestBattleTurns === "object"
        ? value.bestBattleTurns
        : {},
    ).filter(([id, turns]) => {
      const node = storyNodeById(id);
      return (
        !!node &&
        isCombatStoryNode(node) &&
        Number.isSafeInteger(turns) &&
        Number(turns) > 0
      );
    }),
  );
  const rewardReceipts = uniqueStrings(value.rewardReceipts).filter(validReceipt);
  const unlockedHeroes = uniqueStrings(value.unlockedHeroes).filter(
    (id): id is CampaignCompanionId => HERO_SET.has(id),
  );

  return {
    version: 2,
    completed,
    inProgress,
    storyChoices,
    storyFlags,
    regionalOutcomes,
    bestBattleTurns,
    supply,
    rewardReceipts,
    unlockedHeroes,
    legacy: parseLegacy(value.legacy),
  };
}
