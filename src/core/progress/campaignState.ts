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
import {
  CAMPAIGN_FACTION_IDS,
  CAMPAIGN_FACTION_RESOLUTIONS,
  factionStateFromCompleted,
  type CampaignFactionId,
  type CampaignFactionState,
} from "../campaign/factions";

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
  M22: ["reviewDossiers", "hearTheRegions"],
  M23: ["livelihood", "army", "law"],
  M24: ["armyView", "hoaLuView", "dinhLienView"],
};

export type CampaignRewardReceiptId =
  | `node:${CampaignMissionId}`
  | `chapter:${CampaignChapter}`
  | `hero:${CampaignCompanionId}`;

/**
 * Bậc Đánh trùm cao nhất đã thắng của từng sứ quân (1–3), theo id sứ quân của danh mục 12 sứ quân
 * (campaign/warlords.ts). Không phải tiến độ chiến dịch và không mở nhiệm vụ nào.
 */
export type RaidProgress = Readonly<Partial<Record<CampaignFactionId, number>>>;

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
  /**
   * Nhiệm vụ nhiều trận (công thành M20, trùm M21): số phase đã qua của lượt đánh hiện tại, tức phase kế tiếp
   * server sẽ tạo. Chỉ server ghi khi chốt trận; xong phase cuối thì xóa. Thiếu là phase đầu.
   */
  readonly siegePhases: Readonly<Partial<Record<CampaignMissionId, number>>>;
  /** Trùm nhiều phase: tỉ lệ máu trùm còn lại sau phase trùm trước, để phase sau không hồi máu. */
  readonly phaseBossHp: Readonly<Partial<Record<CampaignMissionId, number>>>;
  readonly rewardReceipts: readonly CampaignRewardReceiptId[];
  readonly unlockedHeroes: readonly CampaignCompanionId[];
  /**
   * Thế cục 12 sứ quân (FactionState): kết cục do nhiệm vụ giải quyết ghi, mỗi sứ quân một lần
   * (campaign/factions.ts). Không phải số trận thắng.
   */
  readonly factions: CampaignFactionState;
  /** Đánh trùm: giữ qua mọi lần đặt lại tiến độ chiến dịch. */
  readonly raids: RaidProgress;
}

export type CampaignState = CampaignProgressV2;

/**
 * Id màn của chiến dịch 13 màn cũ (đã gỡ ở CAMP-08.04) ứng với sứ quân, chỉ để chuyển bậc Đánh trùm đã thắng
 * sang khóa mới. Tiến độ màn cũ không quy đổi thành tiến độ V2.
 */
const LEGACY_RAID_IDS: Readonly<Record<string, CampaignFactionId>> = {
  boHai: "tranLam",
  dangChau: "phamBachHo",
  binhKieu: "ngoXuongXi",
  duongLam: "ngoNhatKhanh",
  tamDai: "nguyenKhoan",
  phongChau: "kieuCongHan",
  hoiHo: "kieuThuan",
  sieuLoai: "lyKhue",
  tienDu: "nguyenThuTiep",
  teGiang: "luDuong",
  tayPhuLiet: "nguyenSieu",
  doDong: "doCanhThac",
};
const FACTION_SET = new Set<string>(CAMPAIGN_FACTION_IDS);
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

export function newCampaignProgressV2(
  raids: RaidProgress = {},
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
    siegePhases: {},
    phaseBossHp: {},
    rewardReceipts: [],
    unlockedHeroes: [],
    factions: {},
    raids,
  };
}

export const NEW_CAMPAIGN: CampaignProgressV2 = newCampaignProgressV2();

export const clampCampaignFood = (supply: number) =>
  Math.max(CAMPAIGN_FOOD_MIN, Math.min(CAMPAIGN_FOOD_MAX, Math.round(supply)));

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
    node.prereqs.every((prereq) => campaign.completed.includes(prereq)) &&
    (id !== CAMPAIGN_UNIFICATION_NODE || campaignAllFactionsResolved(campaign))
  );
}

/**
 * Nút đầu tiên sau giai đoạn đánh dẹp (M22): chỉ mở khi đủ 12 sứ quân có kết cục, ngoài điều kiện graph. Server
 * kiểm tra hàm này ở mọi cổng (sự kiện, tạo trận, hoàn thành), nên URL hay API không vượt được.
 */
export const CAMPAIGN_UNIFICATION_NODE: CampaignMissionId = "M22";

/** Node kết chiến dịch (Đại lễ đăng quang 968). */
export const CAMPAIGN_FINAL_NODE: CampaignMissionId = "M24";

/**
 * Chiến dịch hoàn thành khi server đã ghi xong M24, không đếm số trận thắng. M24 chỉ mở theo graph sau M22
 * (cổng 12 vùng) và M23, nên trạng thái này kéo theo đủ 24/24 node.
 */
export function campaignCompleted(campaign: CampaignProgressV2): boolean {
  return campaign.completed.includes(CAMPAIGN_FINAL_NODE);
}

/** Đủ 12 sứ quân có kết cục, suy từ nhiệm vụ đã hoàn thành (giống parser), không tin dữ liệu sửa tay. */
export function campaignAllFactionsResolved(
  campaign: Pick<CampaignProgressV2, "completed">,
): boolean {
  const factions = factionStateFromCompleted(campaign.completed);
  return CAMPAIGN_FACTION_RESOLUTIONS.every((r) => factions[r.faction]);
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

/** Node có thể chia nhiều trận: công thành, hoặc trùm (số phase thật do server đối chiếu kế hoạch scenario). */
function multiPhaseNode(id: string): boolean {
  const type = storyNodeById(id)?.type;
  return type === "siege" || type === "boss";
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

const validRaidTier = (tier: unknown): tier is number =>
  Number.isInteger(tier) && Number(tier) >= 1 && Number(tier) <= 3;

/**
 * Bậc Đánh trùm: khóa mới theo id sứ quân, cộng thêm bậc lưu theo id màn cũ (`legacy.raids` của bản V2 trước
 * CAMP-08.04, hoặc `raids` của hồ sơ V1). Cùng một sứ quân thì giữ bậc cao hơn.
 */
function parseRaids(...sources: unknown[]): RaidProgress {
  const out: Partial<Record<CampaignFactionId, number>> = {};
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const [key, tier] of Object.entries(source)) {
      const id = FACTION_SET.has(key)
        ? (key as CampaignFactionId)
        : LEGACY_RAID_IDS[key];
      if (id && validRaidTier(tier)) out[id] = Math.max(out[id] ?? 0, tier);
    }
  }
  return out;
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
  const value = raw as Omit<Partial<CampaignProgressV2>, "raids"> & {
    readonly raids?: unknown;
    readonly legacy?: { readonly raids?: unknown };
  };
  if (!value || typeof value !== "object") return newCampaignProgressV2();

  // V1 completion is intentionally reset. Raid tiers survive the transition.
  if (value.version !== 2) return newCampaignProgressV2(parseRaids(value.raids));

  const completed = normalizeCompleted(value.completed);
  const supply =
    typeof value.supply === "number" && Number.isFinite(value.supply)
      ? clampCampaignFood(value.supply)
      : CAMPAIGN_FOOD_START;
  const provisional: CampaignProgressV2 = {
    ...newCampaignProgressV2(),
    completed,
    supply,
    factions: factionStateFromCompleted(completed),
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
  // Phase công thành chỉ giữ cho node công thành đã mở; số phase thật do server đối chiếu kế hoạch scenario.
  const siegePhases = Object.fromEntries(
    Object.entries(
      value.siegePhases && typeof value.siegePhases === "object"
        ? value.siegePhases
        : {},
    ).filter(
      ([id, phase]) =>
        isCampaignMissionId(id) &&
        multiPhaseNode(id) &&
        campaignNodeUnlocked(provisional, id) &&
        Number.isSafeInteger(phase) &&
        Number(phase) > 0 &&
        Number(phase) < 10,
    ),
  );
  const phaseBossHp = Object.fromEntries(
    Object.entries(
      value.phaseBossHp && typeof value.phaseBossHp === "object"
        ? value.phaseBossHp
        : {},
    ).filter(
      ([id, ratio]) =>
        siegePhases[id] !== undefined &&
        storyNodeById(id)?.type === "boss" &&
        typeof ratio === "number" &&
        ratio > 0 &&
        ratio <= 1,
    ),
  );
  const rewardReceipts = uniqueStrings(value.rewardReceipts).filter(
    validReceipt,
  );
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
    siegePhases,
    phaseBossHp,
    rewardReceipts,
    unlockedHeroes,
    // Suy ra từ nhiệm vụ đã hoàn thành thay vì tin dữ liệu lưu: luôn khớp bảng, không trùng.
    factions: factionStateFromCompleted(completed),
    // Màn cũ (`legacy.cleared`, `legacy.bestTurns`) bị bỏ; chỉ bậc Đánh trùm được chuyển sang.
    raids: parseRaids(value.legacy?.raids, value.raids),
  };
}
