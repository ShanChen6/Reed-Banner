// Dịch vụ trận online: tạo trận, xem trận (kèm chạy bù), nhận hành động của người chơi.
// Không phụ thuộc Next.js; route handler chỉ đọc cookie/body rồi gọi vào đây, test gọi thẳng.

import {
  ARENA_ATTACKS_PER_DAY,
  ARENA_DIFFICULTY,
  ARENA_OFFERS,
  arenaDay,
  defenseOf,
  ghostTeam,
  beginCampaignNode,
  CAMPAIGN_CHOICE_IDS,
  campaignBattleScenario,
  campaignEncounter,
  campaignEncounterFoes,
  campaignNodeUnlocked,
  campaignScenarioByNode,
  campaignScenarioTag,
  isCampaignMissionId,
  dailyKey,
  dailySetup,
  createSurvivalRoster,
  ELEMENTS,
  humanAct,
  isRaidTier,
  leveledFoe,
  PLAYABLE_COMPANIONS,
  isSpecialCompanionId,
  specialFinalFoes,
  specialFinalReady,
  SPECIAL_FINAL_DIFFICULTY,
  type SpecialCompanionId,
  MAIN_ID,
  newSurvivalRun,
  survivalActiveSideConfig,
  syncSurvivalRosterState,
  survivalWave,
  ownsCompanion,
  isLeaderProfession,
  profileTeam,
  raidBossById,
  raidSetup,
  raidUnlocked,
  settle,
  settleCampaignScenario as evaluateCampaignScenario,
  startMatch,
  STARTER_COMPANIONS,
  viewOf,
  type MatchAction,
  type SurvivalResult,
  type SurvivalLeaderBuildChoice,
  type DailyScore,
  type BattleEvent,
  type Difficulty,
  type Element,
  type BattleRewards,
  type CampaignFirstClearReward,
  type CampaignMissionId,
  type CampaignScenarioSettlement,
  type RaidResult,
  type RaidTier,
  type FighterConfig,
  type GearItem,
  type LevelUp,
  type Match,
  type MatchError,
  type MatchView,
  type Pos,
  type Profession,
  type SideIndex,
  type Whirl,
} from "@/core";
import { loadProfile, updateProfile, type ProfileStore } from "./profiles";
import type { MatchRecord, MatchStore } from "./store";
import { dailySeed, type DailyStore } from "./daily";
import { type LeaderboardStore } from "./leaderboard";
import { type SeasonStore } from "./seasons";
import { offerDefense, type ArenaStore } from "./arena";
import { type TrialResult } from "./trialSettle";
import { type DestinyResult } from "./destinySettle";
import { type ExpeditionMatchResult } from "./expeditionSettle";
import { activeDestinyCycle } from "./destinyCycle";
import { reconcileDestinyCycle } from "./destinyExpire";
import type { DestinyLeaderboardStore } from "./destinyLeaderboard";
import { FEATURE_DISABLED_ERROR, destinyEnabled, expeditionEnabled, trialEnabled } from "./featureFlags";
import {
  reward,
} from "./battleRewards";

export interface Deps {
  readonly store: MatchStore;
  readonly profiles: ProfileStore;
  readonly now: number;
  /** Seed 32 bit, server bốc bằng crypto; client không bao giờ thấy. */
  readonly seed: number;
  readonly newId: () => string;
  /** Thử thách hằng ngày: kho lượt đánh và khóa bí mật sinh seed của ngày. Không có thì không mở được. */
  readonly daily?: DailyStore;
  readonly dailySecret?: string;
  /** Secret server-only để khóa luật Destiny theo cycle. */
  readonly destinySecret?: string;
  /** Bảng xếp hạng: ghi điểm sau mỗi lần cộng thưởng. */
  readonly leaderboard?: LeaderboardStore;
  readonly destinyLeaderboard?: DestinyLeaderboardStore;
  /** Đấu trường bóng ma. Không có thì không mở được. */
  readonly arena?: ArenaStore;
  /** Route production luôn truyền giá trị từ env; thiếu chỉ dành cho compatibility của caller nội bộ/test cũ. */
  readonly trialEnabled?: boolean;
  readonly destinyEnabled?: boolean;
  /** Viễn Chinh (`EXPEDITION_ENABLED`); thiếu là tắt. */
  readonly expeditionEnabled?: boolean;
  /** Điểm mùa theo tuần của Trấn Ải và Quần Hùng; không có thì không ghi mùa. */
  readonly seasons?: SeasonStore;
  /**
   * Người này đã đăng nhập chưa. Route production luôn truyền; có thì Sinh tồn, Nhật Lệnh, Quần Hùng và Thiên Mệnh
   * (online, có bảng xếp hạng và thưởng) từ chối khách. Thiếu chỉ dành cho caller nội bộ và test cũ.
   */
  readonly isSignedIn?: (ownerId: string) => Promise<boolean>;
}

/** Trận thuộc chế độ online có bảng xếp hạng và thưởng. */
const rankedMatch = (m: Match): boolean => !!(m.survival || m.daily || m.arena || m.destiny);

/** Khách bị từ chối khi `deps.isSignedIn` có mặt và trả false. */
async function guestBlocked(deps: Pick<Deps, "isSignedIn">, ownerId: string): Promise<boolean> {
  return deps.isSignedIn !== undefined && !(await deps.isSignedIn(ownerId));
}

const DIFFICULTIES: readonly Difficulty[] = [
  "easy",
  "normal",
  "hard",
  "boss",
  "nightmare",
];

export interface NewBattleInput {
  readonly mode: "1v1" | "3v3";
  readonly element: Element;
  readonly profession: Profession;
  /** 3vs3: đúng 2 id nhân vật kèm khởi đầu. */
  readonly companions: readonly string[];
  readonly difficulty: Difficulty;
  /** Đánh trùm: id sứ quân (danh mục 12 sứ quân); thể thức, độ khó và đối thủ lấy theo sứ quân và bậc. */
  readonly raidBoss?: string;
  /** Đánh trùm: bậc của sứ quân `raidBoss`. */
  readonly raid?: RaidTier;
  /** Campaign V2: nhiệm vụ có trận; thể thức, độ khó và đối thủ lấy theo nhiệm vụ. */
  readonly campaignMission?: CampaignMissionId;
  /** Campaign V2: lựa chọn trình diễn trước trận (chỉ đổi lời dẫn). */
  readonly campaignChoice?: string;
  /** Sinh tồn: bắt đầu lượt chơi mới với đội đang chọn ở hồ sơ. */
  readonly survival?: true;
  /** Sinh tồn: tối đa 2 reserve IDs; active vẫn lấy theo `companions` của request. */
  readonly reserveCompanions?: readonly string[];
  /** Thử thách hằng ngày: đề chung của hôm nay, mỗi người một lượt. */
  readonly daily?: true;
  /** Đấu trường: đánh đối thủ thứ mấy trong các đối thủ đang bày. */
  readonly arena?: number;
  /** Trận cuối nhiệm vụ nhân vật đặc biệt: 3vs3 với đội đang chọn, đối thủ là chính nhân vật. */
  readonly specialQuest?: SpecialCompanionId;
}

export type ServiceError =
  | MatchError
  | "badRequest"
  | "notFound"
  | "conflict"
  /** Hôm nay đã đánh thử thách ngày. */
  | "dailyDone"
  /** Hôm nay đã hết trận đấu trường. */
  | "arenaLimit"
  /** Đối thủ đấu trường không còn. */
  | "arenaGone"
  /** Trận Destiny thuộc chu kỳ đã đóng. */
  | "cycleExpired"
  /** Chế độ online có bảng xếp hạng và thưởng chỉ cho tài khoản đã đăng nhập; khách chơi thường thoải mái. */
  | "loginRequired"
  | typeof FEATURE_DISABLED_ERROR;

/** Phần thưởng cuối trận đã cộng vào hồ sơ, gửi kèm đúng một lần (response làm trận kết thúc). */
export interface Outcome {
  readonly rewards: BattleRewards;
  readonly levelUps: readonly LevelUp[];
  /** Món rơi đã vào túi đồ (kèm id trong hồ sơ); null khi không rơi hoặc túi đầy. */
  readonly drop: GearItem | null;
  /** Túi đầy: món rơi được bán ngay với giá này. */
  readonly soldFor: number;
  /** Campaign V2 completion and milestone reward; separate from battle loot. */
  readonly campaignV2?: CampaignFirstClearReward;
  /** Chỉ có ở trận đánh trùm. */
  readonly raid?: RaidResult;
  /** Chỉ có ở trận Tháp Thí Luyện. */
  readonly trial?: TrialResult;
  /** Chỉ có ở trận Destiny; không kèm vàng/EXP/drop. */
  readonly destiny?: DestinyResult;
  /** Chỉ có ở sinh tồn. */
  readonly survival?: SurvivalResult;
  /** Chỉ có ở trận Viễn Chinh: kết quả trên sa bàn (và thưởng kết thúc nếu trận này kết thúc lượt). */
  readonly expedition?: ExpeditionMatchResult;
  /** Chỉ có ở thử thách hằng ngày: điểm và hạng lúc vừa xong. */
  readonly daily?: { readonly score: DailyScore; readonly rank: number | null };
  /** Chỉ có ở đấu trường. */
  readonly arena?: ArenaResult;
  /** Trận cuối nhiệm vụ nhân vật đặc biệt: nhân vật đã gia nhập chưa. */
  readonly specialQuest?: { readonly id: string; readonly joined: boolean };
}

/** Kết quả đấu trường: điểm đổi và điểm mới của người đánh. */
export interface ArenaResult {
  readonly won: boolean;
  readonly opponent: string;
  readonly delta: number;
  /** Null khi không ghi được điểm (lỗi kho). */
  readonly rating: number | null;
  readonly gold: number;
}

export type ServiceResult =
  | {
      readonly ok: true;
      readonly id: string;
      readonly view: MatchView;
      readonly events: readonly BattleEvent[];
      readonly outcome?: Outcome;
    }
  | {
      readonly ok: false;
      readonly error: ServiceError;
      readonly view?: MatchView;
    };

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;
const oneOf = <T extends string>(list: readonly T[], x: unknown): x is T =>
  typeof x === "string" && (list as readonly string[]).includes(x);

/** One guarded server entrypoint for every Campaign V2 battle objective. */
export function settleCampaignScenarioMatch(
  match: Match,
  events: readonly BattleEvent[] = [],
): CampaignScenarioSettlement {
  return evaluateCampaignScenario(
    match.campaignScenario,
    match.battle,
    events,
  );
}

/** Kiểm tra body tạo trận; null khi không hợp lệ. */
export function parseNewBattle(body: unknown): NewBattleInput | null {
  if (!isObj(body)) return null;
  if (body.campaignMission !== undefined) {
    // Payload Campaign V2 không được trộn với đánh trùm hay chế độ khác.
    const mixed = [
      "stage",
      "raidBoss",
      "raid",
      "tower",
      "survival",
      "reserveCompanions",
      "daily",
      "arena",
    ];
    if (mixed.some((key) => body[key] !== undefined)) return null;
    const id = body.campaignMission;
    if (typeof id !== "string" || !isCampaignMissionId(id)) return null;
    const scenario = campaignBattleScenario(id);
    if (!scenario) return null;
    const choice = body.campaignChoice;
    if (
      choice !== undefined &&
      (typeof choice !== "string" ||
        !(CAMPAIGN_CHOICE_IDS[id] ?? []).includes(choice))
    )
      return null;
    const parsed = parseNewBattle({
      ...body,
      campaignMission: undefined,
      campaignChoice: undefined,
      mode: scenario.mode,
      difficulty: scenario.difficulty,
    });
    return (
      parsed && {
        ...parsed,
        campaignMission: id,
        ...(choice !== undefined ? { campaignChoice: choice } : {}),
      }
    );
  }
  if (body.campaignChoice !== undefined) return null;
  if (body.specialQuest !== undefined) {
    const mixed = ["stage", "raidBoss", "raid", "tower", "survival", "reserveCompanions", "daily", "arena"];
    if (mixed.some((key) => body[key] !== undefined) || !isSpecialCompanionId(body.specialQuest)) return null;
    const parsed = parseNewBattle({
      ...body,
      specialQuest: undefined,
      mode: "3v3",
      difficulty: SPECIAL_FINAL_DIFFICULTY,
    });
    return parsed && { ...parsed, specialQuest: body.specialQuest };
  }
  // Chiến dịch 13 màn cũ đã gỡ (CAMP-08.04): id màn cũ không còn mở trận nào, kể cả đánh trùm.
  if (body.stage !== undefined) return null;
  // Leo tháp cũ đã gỡ: client cũ còn gửi `tower` thì từ chối, không mở nhầm trận thường.
  if (body.tower !== undefined) return null;
  if (body.arena !== undefined) {
    if (
      !Number.isInteger(body.arena) ||
      (body.arena as number) < 0 ||
      (body.arena as number) >= ARENA_OFFERS
    )
      return null;
    // Đội là đội 3vs3 đang chọn ở hồ sơ, đối thủ là đội phòng thủ đã bày.
    return {
      mode: "3v3",
      element: "moc",
      profession: "tuongSi",
      companions: [],
      difficulty: ARENA_DIFFICULTY,
      arena: body.arena as number,
    };
  }
  if (body.daily !== undefined) {
    if (body.daily !== true) return null;
    // Đề ngày quyết định đội và đối thủ; bỏ qua mọi lựa chọn khác.
    return {
      mode: "3v3",
      element: "moc",
      profession: "tuongSi",
      companions: [],
      difficulty: "hard",
      daily: true,
    };
  }
  if (body.survival !== undefined) {
    if (body.survival !== true || body.raidBoss !== undefined) return null;
    const reserves =
      body.reserveCompanions === undefined ? [] : body.reserveCompanions;
    const knownIds = new Set(PLAYABLE_COMPANIONS.map((c) => c.id));
    if (
      !Array.isArray(reserves) ||
      reserves.length > 2 ||
      reserves.some((id) => typeof id !== "string" || !knownIds.has(id)) ||
      new Set(reserves).size !== reserves.length
    )
      return null;
    const parsed = parseNewBattle({
      ...body,
      survival: undefined,
      reserveCompanions: undefined,
      mode: "3v3",
      difficulty: "easy",
    });
    return parsed && {
      ...parsed,
      survival: true,
      ...(reserves.length > 0 ? { reserveCompanions: reserves as string[] } : {}),
    };
  }
  if (body.reserveCompanions !== undefined) return null;
  if (body.raidBoss !== undefined || body.raid !== undefined) {
    const boss =
      typeof body.raidBoss === "string"
        ? raidBossById(body.raidBoss)
        : undefined;
    if (!boss || !isRaidTier(body.raid)) return null;
    const raid = body.raid;
    const parsed = parseNewBattle({
      ...body,
      raidBoss: undefined,
      raid: undefined,
      mode: boss.mode,
      difficulty: raidSetup(boss, raid).difficulty,
    });
    return parsed && { ...parsed, raidBoss: boss.id, raid };
  }
  const { mode, element, profession, difficulty } = body;
  const companions = Array.isArray(body.companions) ? body.companions : [];
  if (
    !oneOf(["1v1", "3v3"] as const, mode) ||
    !oneOf(ELEMENTS, element) ||
    !isLeaderProfession(profession)
  )
    return null;
  if (!oneOf(DIFFICULTIES, difficulty)) return null;
  const ids = PLAYABLE_COMPANIONS.map((c) => c.id);
  if (
    mode === "3v3" &&
    (companions.length !== 2 ||
      new Set(companions).size !== 2 ||
      !companions.every((c) => oneOf(ids, c)))
  )
    return null;
  return {
    mode,
    element,
    profession,
    difficulty,
    companions: mode === "3v3" ? (companions as string[]) : [],
  };
}

const toPos = (p: unknown): Pos | null =>
  isObj(p) && Number.isInteger(p.row) && Number.isInteger(p.col)
    ? { row: p.row as number, col: p.col as number }
    : null;

const toWhirl = (w: unknown): Whirl | null => {
  if (!isObj(w) || !Number.isInteger(w.turns)) return null;
  const center = toPos(w.center);
  return center ? { center, turns: w.turns as number } : null;
};

function toAction(a: Record<string, unknown>): MatchAction | null {
  switch (a.type) {
    case "nextWave":
      if (
        Object.keys(a).some(
          (key) =>
            key !== "type" &&
            key !== "revive" &&
            key !== "activeIds" &&
            key !== "leaderBuild",
        )
      )
        return null;
      if (a.activeIds !== undefined) {
        if (
          !Array.isArray(a.activeIds) ||
          !a.activeIds.every(
            (fighterId) =>
              typeof fighterId === "string" && fighterId.length > 0,
          )
        )
          return null;
      }
      if (a.leaderBuild !== undefined) {
        if (
          !isObj(a.leaderBuild) ||
          Object.keys(a.leaderBuild).some(
            (key) => key !== "profession" && key !== "element",
          ) ||
          (a.leaderBuild.profession !== undefined &&
            typeof a.leaderBuild.profession !== "string") ||
          (a.leaderBuild.element !== undefined &&
            typeof a.leaderBuild.element !== "string")
        )
          return null;
      }
      const revive =
        a.revive === undefined
          ? undefined
          : Number.isInteger(a.revive)
            ? (a.revive as number)
            : typeof a.revive === "string" && a.revive.length > 0
              ? a.revive
              : null;
      if (revive === null) return null;
      return {
        type: "nextWave",
        ...(revive === undefined ? {} : { revive }),
        ...(a.activeIds === undefined
          ? {}
          : { activeIds: a.activeIds as string[] }),
        ...(a.leaderBuild === undefined
          ? {}
          : {
              leaderBuild: a.leaderBuild as Partial<SurvivalLeaderBuildChoice>,
            }),
      };
    case "endRun":
      if (Object.keys(a).some((key) => key !== "type")) return null;
      return { type: "endRun" };
    case "swap": {
      const from = toPos(a.from);
      const to = toPos(a.to);
      return from && to ? { type: "swap", from, to } : null;
    }
    case "selectActor":
      return Number.isInteger(a.fighter)
        ? { type: "selectActor", fighter: a.fighter as number }
        : null;
    case "timeout":
      return { type: "timeout" };
    case "whirl": {
      const whirl = toWhirl(a.whirl);
      return whirl ? { type: "whirl", whirl } : null;
    }
    case "skill": {
      const cell = a.cell === undefined ? undefined : toPos(a.cell);
      const whirl = a.whirl === undefined ? undefined : toWhirl(a.whirl);
      if (typeof a.skill !== "string" || cell === null || whirl === null)
        return null;
      if (a.target !== undefined && !Number.isInteger(a.target)) return null;
      return {
        type: "skill",
        skill: a.skill,
        ...(a.target === undefined ? {} : { target: a.target as number }),
        ...(cell ? { cell } : {}),
        ...(whirl ? { whirl } : {}),
      };
    }
    default:
      return null;
  }
}

/** Kiểm tra hình dạng hành động `{ seq, action }`; luật chi tiết do core xét. */
export function parseAction(
  body: unknown,
): { action: MatchAction; seq: number } | null {
  if (!isObj(body) || !Number.isInteger(body.seq) || !isObj(body.action))
    return null;
  const action = toAction(body.action);
  return action ? { action, seq: body.seq as number } : null;
}

/** Đối thủ: các nhân vật kèm khởi đầu không có trong đội người chơi, chọn theo seed. */
function pickFoes(input: NewBattleInput, seed: number): FighterConfig[] {
  const pool = STARTER_COMPANIONS.filter(
    (c) => !input.companions.includes(c.id),
  );
  const count = input.mode === "3v3" ? 3 : 1;
  const start = seed % pool.length;
  return Array.from(
    { length: count },
    (_, i) => pool[(start + i) % pool.length]!,
  );
}

/**
 * Tạo trận theo hồ sơ trên server: đội người chơi mang cấp, kỹ năng và chiêu nhánh đã nâng; đối thủ cùng
 * cấp với nhân vật chính. Nguyên tố và nghề vừa chọn được lưu lại vào hồ sơ.
 */
export async function createBattleFor(
  ownerId: string,
  input: NewBattleInput,
  deps: Deps,
): Promise<ServiceResult> {
  if ((input.survival || input.daily || input.arena !== undefined) && (await guestBlocked(deps, ownerId)))
    return { ok: false, error: "loginRequired" };
  if (input.survival) return createSurvivalBattle(ownerId, input, deps);
  if (input.daily) return createDailyBattle(ownerId, deps);
  if (input.arena !== undefined)
    return createArenaBattle(ownerId, input.arena, deps);
  if (input.campaignMission)
    return createCampaignMissionBattle(
      ownerId,
      input,
      input.campaignMission,
      deps,
    );
  const { profile } = await loadProfile(deps.profiles, ownerId);
  // Chỉ ra trận nhân vật đã có (khởi đầu hoặc đã mua).
  if (!input.companions.every((id) => ownsCompanion(profile, id)))
    return { ok: false, error: "badRequest" };
  const chosen = {
    ...profile,
    element: input.element,
    profession: input.profession,
  };
  if (
    chosen.element !== profile.element ||
    chosen.profession !== profile.profession
  ) {
    // Chỉ để lần sau mở trang chọn sẵn; ghi không được (hai tab cùng ghi) cũng không sao.
    await updateProfile(
      deps.profiles,
      ownerId,
      (p) => ({
        ok: true,
        profile: { ...p, element: input.element, profession: input.profession },
      }),
      deps.now,
    );
  }
  const team = profileTeam(chosen, input.companions);
  const boss =
    input.raidBoss === undefined ? undefined : raidBossById(input.raidBoss);
  if (input.raidBoss !== undefined || input.raid !== undefined) {
    // Đánh trùm mở theo mốc Campaign V2 server đã ghi; bậc sau cần thắng bậc trước.
    if (
      !boss ||
      !input.raid ||
      !raidUnlocked(profile.campaign, boss.id, input.raid)
    )
      return { ok: false, error: "badRequest" };
  }
  // Trận cuối nhiệm vụ nhân vật đặc biệt: chỉ mở khi đã xong hai bước trước.
  const special = input.specialQuest;
  if (special && !specialFinalReady(profile, special)) return { ok: false, error: "badRequest" };
  // Đánh trùm: luật sân nhà, không dùng lương chiến dịch.
  const raid = boss && input.raid ? raidSetup(boss, input.raid) : undefined;
  const foes = raid
    ? raid.foes
    : special
      ? specialFinalFoes(special, profile.main.level, leveledFoe)
      : pickFoes(input, deps.seed).map((f) => leveledFoe(f, profile.main.level));
  const { match, events } = startMatch({
    sides: [
      { fighters: team, leader: 0 },
      {
        fighters: foes,
        leader: 0,
        ...(raid ? { food: raid.foeFood } : {}),
      },
    ],
    difficulty: input.difficulty,
    seed: deps.seed,
    firstSide: (deps.seed & 1) as SideIndex,
    now: deps.now,
    ...(boss && raid
      ? { raidBoss: boss.id, raid: input.raid, weights: raid.weights }
      : {}),
    ...(special ? { specialQuest: special } : {}),
  });
  const record: MatchRecord = {
    id: deps.newId(),
    ownerId,
    match,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  await deps.store.create(record);
  return { ok: true, id: record.id, view: viewOf(match), events };
}

/**
 * Campaign V2: trận của một nhiệm vụ đã mở. Ghi nhiệm vụ đang dở, lựa chọn trình diễn và lựa chọn hệ/nghề
 * trong cùng một lần ghi hồ sơ, để tải lại trang vẫn biết người chơi đang ở đâu. Hoàn thành và thưởng lần
 * đầu chỉ ghi khi server chốt trận (rewardCampaignV2).
 */
async function createCampaignMissionBattle(
  ownerId: string,
  input: NewBattleInput,
  nodeId: CampaignMissionId,
  deps: Deps,
): Promise<ServiceResult> {
  if (!campaignEncounterFoes(nodeId) || !campaignScenarioTag(nodeId))
    return { ok: false, error: "badRequest" };
  const updated = await updateProfile(
    deps.profiles,
    ownerId,
    (p) => {
      if (
        !campaignNodeUnlocked(p.campaign, nodeId) ||
        !input.companions.every((id) => ownsCompanion(p, id))
      )
        return { ok: false as const, error: "badRequest" as const };
      const done = p.campaign.completed.includes(nodeId);
      let campaign = beginCampaignNode(p.campaign, nodeId);
      // Lựa chọn đã ghi lúc hoàn thành thì giữ nguyên khi đánh lại.
      if (!done && input.campaignChoice !== undefined)
        campaign = {
          ...campaign,
          storyChoices: {
            ...campaign.storyChoices,
            [nodeId]: input.campaignChoice,
          },
          storyFlags: {
            ...campaign.storyFlags,
            [nodeId]: ["introViewed", "historyNoteViewed"],
          },
        };
      return {
        ok: true as const,
        profile: {
          ...p,
          element: input.element,
          profession: input.profession,
          campaign,
        },
      };
    },
    deps.now,
  );
  if (!updated.ok)
    return {
      ok: false,
      error: updated.error === "conflict" ? "conflict" : "badRequest",
    };
  const profile = updated.stored.profile;
  // Công thành nhiều trận: phase kế tiếp lấy từ hồ sơ server đã ghi, client không chọn được phase.
  const phaseIndex = profile.campaign.siegePhases[nodeId] ?? 0;
  const foes = campaignEncounterFoes(nodeId, phaseIndex);
  const tag = campaignScenarioTag(nodeId, phaseIndex);
  if (!foes || !tag) return { ok: false, error: "badRequest" };
  const weights = campaignScenarioByNode(nodeId)?.phases[tag.phaseIndex]?.weights;
  const foeFood = campaignEncounter(nodeId, phaseIndex)?.foeFood;
  const bossHp =
    campaignScenarioByNode(nodeId)?.phases[phaseIndex]?.objective.type ===
    "bossPhases"
      ? profile.campaign.phaseBossHp[nodeId]
      : undefined;
  const { match, events } = startMatch({
    sides: [
      // Lương mang từ hồ sơ Campaign (cũng là lương còn lại sau phase trước); phe đối thủ theo encounter.
      {
        fighters: profileTeam(profile, input.companions),
        leader: 0,
        food: profile.campaign.supply,
      },
      {
        fighters: foes,
        leader: 0,
        ...(foeFood !== undefined ? { food: foeFood } : {}),
        // Trùm nhiều phase: thủ lĩnh (trùm) vào trận với máu còn lại của phase trước; tùy tướng là quân mới.
        ...(bossHp !== undefined
          ? { hpRatio: foes.map((_, i) => (i === 0 ? bossHp : 1)) }
          : {}),
      },
    ],
    difficulty: input.difficulty,
    seed: deps.seed,
    firstSide: (deps.seed & 1) as SideIndex,
    now: deps.now,
    campaignScenario: { ...tag, startFood: profile.campaign.supply },
    ...(weights ? { weights } : {}),
  });
  const record: MatchRecord = {
    id: deps.newId(),
    ownerId,
    match,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  await deps.store.create(record);
  return { ok: true, id: record.id, view: viewOf(match), events };
}

/** Sinh tồn: một trận cho cả lượt chơi; đợt 1 với đội đang chọn ở hồ sơ, người chơi đi trước. */
async function createSurvivalBattle(
  ownerId: string,
  input: NewBattleInput,
  deps: Deps,
): Promise<ServiceResult> {
  const { profile } = await loadProfile(deps.profiles, ownerId);
  const roster = createSurvivalRoster(
    profile,
    [MAIN_ID, ...input.companions],
    input.reserveCompanions ?? [],
  );
  if (!roster.ok) return { ok: false, error: "badRequest" };
  // Seed đợt tách khỏi seed bàn cờ.
  const run = newSurvivalRun(
    profile,
    Math.imul(deps.seed, 0x2c1b3c6d) ^ 0x5bd1e995,
    roster.roster,
  );
  const wave = survivalWave(run, 1);
  const activeSide = survivalActiveSideConfig(run.roster);
  if (!activeSide.ok) return { ok: false, error: "badRequest" };
  const { match, events } = startMatch({
    sides: [
      activeSide.value,
      { fighters: wave.foes, leader: 0 },
    ],
    difficulty: wave.difficulty,
    seed: deps.seed,
    firstSide: 0,
    now: deps.now,
    survival: run,
  });
  const record: MatchRecord = {
    id: deps.newId(),
    ownerId,
    match,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  await deps.store.create(record);
  return { ok: true, id: record.id, view: viewOf(match), events };
}

/** Thử thách hằng ngày: giữ chỗ lượt của hôm nay trước rồi mới tạo trận, nên mỗi người chỉ một trận một ngày. */
async function createDailyBattle(
  ownerId: string,
  deps: Deps,
): Promise<ServiceResult> {
  if (!deps.daily || !deps.dailySecret)
    return { ok: false, error: "badRequest" };
  const day = dailyKey(deps.now);
  const seed = dailySeed(deps.dailySecret, day);
  const id = deps.newId();
  if (!(await deps.daily.start(day, ownerId, id, deps.now)))
    return { ok: false, error: "dailyDone" };
  const setup = dailySetup(seed);
  const { match, events } = startMatch({
    sides: [
      { fighters: setup.team, leader: 0 },
      { fighters: setup.foes, leader: 0 },
    ],
    difficulty: setup.difficulty,
    // Cùng seed cho bàn cờ và AI: ai đi cùng nước thì gặp cùng ô rơi.
    seed,
    firstSide: 0,
    now: deps.now,
    weights: setup.weights,
    daily: day,
  });
  const record: MatchRecord = {
    id,
    ownerId,
    match,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  await deps.store.create(record);
  return { ok: true, id, view: viewOf(match), events };
}

/**
 * Đấu trường: đánh đối thủ thứ `index` đang bày bằng đội 3vs3 đang chọn ở hồ sơ. Dùng một trận của ngày rồi
 * xóa các đối thủ đã bày, để lần sau mở trang có đối thủ mới. Lần đầu đánh mà chưa có đội phòng thủ thì
 * lấy luôn đội này.
 */
async function createArenaBattle(
  ownerId: string,
  index: number,
  deps: Deps,
): Promise<ServiceResult> {
  const arena = deps.arena;
  if (!arena) return { ok: false, error: "badRequest" };
  const row = await arena.ensure(ownerId, deps.now);
  const offer = row.offers[index];
  if (!offer) return { ok: false, error: "badRequest" };
  const defense = await offerDefense(arena, offer);
  if (!defense) {
    // Chủ đội đã bị xóa (khách bỏ chơi lâu): bỏ các đối thủ cũ để lần sau bày mới.
    await arena.setOffers(ownerId, []);
    return { ok: false, error: "arenaGone" };
  }
  const { profile } = await loadProfile(deps.profiles, ownerId);
  if (
    !(await arena.useAttack(
      ownerId,
      arenaDay(deps.now),
      ARENA_ATTACKS_PER_DAY,
      deps.now,
    ))
  )
    return { ok: false, error: "arenaLimit" };
  if (!row.defense)
    await arena.setDefense(ownerId, defenseOf(profile), deps.now);
  await arena.setOffers(ownerId, []);
  // Điểm đối thủ lấy lúc vào trận; bóng ma máy tạo luôn ở điểm khởi đầu.
  const rating =
    offer.owner === null
      ? offer.rating
      : ((await arena.get(offer.owner))?.rating ?? offer.rating);
  const { match, events } = startMatch({
    sides: [
      { fighters: profileTeam(profile, profile.team), leader: 0 },
      { fighters: ghostTeam(defense, offer.name), leader: 0 },
    ],
    difficulty: ARENA_DIFFICULTY,
    seed: deps.seed,
    firstSide: (deps.seed & 1) as SideIndex,
    now: deps.now,
    arena: { owner: offer.owner, name: offer.name, rating },
  });
  const record: MatchRecord = {
    id: deps.newId(),
    ownerId,
    match,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
  await deps.store.create(record);
  return { ok: true, id: record.id, view: viewOf(match), events };
}

function matchFeatureEnabled(match: Match, deps: Pick<Deps, "trialEnabled" | "destinyEnabled" | "expeditionEnabled">): boolean {
  if (match.trial) return trialEnabled(deps);
  if (match.destiny) return destinyEnabled(deps);
  if (match.expedition) return expeditionEnabled(deps);
  return true;
}

async function load(
  id: string,
  ownerId: string,
  store: MatchStore,
): Promise<MatchRecord | null> {
  const r = await store.get(id);
  // Trận của người khác trả về như không tồn tại, để không lộ id.
  return r && r.ownerId === ownerId ? r : null;
}

/** Chạy bù tới `now`, lưu nếu có thay đổi, cộng thưởng nếu trận vừa kết thúc. */
async function settleRecord(
  r: MatchRecord,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<ServiceResult> {
  const settled = settle(r.match, deps.now);
  let match = settled.match;
  if (
    match.survival?.stateVersion === 2 &&
    match.survival.roster &&
    match.seq !== r.match.seq
  ) {
    const synced = syncSurvivalRosterState(match.survival, match.battle);
    if (!synced.ok) return { ok: false, error: "badRequest" };
    match = { ...match, survival: synced.value };
  }
  const { events } = settled;
  if (
    match.seq !== r.match.seq &&
    !(await deps.store.save({ ...r, match, updatedAt: deps.now }, r.match.seq))
  ) {
    return { ok: false, error: "conflict" };
  }
  const outcome = await reward(r, match, deps);
  return {
    ok: true,
    id: r.id,
    view: viewOf(match),
    events,
    ...(outcome ? { outcome } : {}),
  };
}

async function destinyMatchCurrent(
  r: MatchRecord,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<boolean> {
  const tag = r.match.destiny?.tag;
  if (!tag) return true;
  const scheduled = activeDestinyCycle(deps.now);
  if (!scheduled.ok || tag.cycleId !== scheduled.cycle.cycleId) {
    await reconcileDestinyCycle(deps.profiles, r.ownerId, deps.now);
    return false;
  }
  return true;
}

/** Xem trận: chạy bù tới `now` (hết giờ, AI, xử thua 24 giờ) rồi lưu nếu có thay đổi. */
export async function getBattle(
  id: string,
  ownerId: string,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<ServiceResult> {
  const r = await load(id, ownerId, deps.store);
  if (!r) return { ok: false, error: "notFound" };
  if (!matchFeatureEnabled(r.match, deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  if (rankedMatch(r.match) && (await guestBlocked(deps, ownerId))) return { ok: false, error: "loginRequired" };
  if (!(await destinyMatchCurrent(r, deps))) return { ok: false, error: "cycleExpired" };
  return settleRecord(r, deps);
}

/**
 * Việc định kỳ: chốt các trận bỏ dở (xử thua sau 24 giờ không ra tay) và cộng thưởng còn treo, để hồ sơ
 * nhận thưởng kể cả khi người chơi không bao giờ mở lại trận.
 */
export async function settleAbandoned(
  ids: readonly string[],
  deps: Omit<Deps, "seed" | "newId">,
): Promise<number> {
  let settled = 0;
  for (const id of ids) {
    const r = await deps.store.get(id);
    if (!r) continue;
    if (!matchFeatureEnabled(r.match, deps)) continue;
    if (!(await destinyMatchCurrent(r, deps))) continue;
    const res = await settleRecord(r, deps);
    if (res.ok && res.outcome) settled++;
  }
  return settled;
}

/** Nhận một hành động. Lỗi luật vẫn lưu phần chạy bù và trả view mới để client đồng bộ lại. */
export async function actBattle(
  id: string,
  ownerId: string,
  body: unknown,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<ServiceResult> {
  const parsed = parseAction(body);
  if (!parsed) return { ok: false, error: "badRequest" };
  const r = await load(id, ownerId, deps.store);
  if (!r) return { ok: false, error: "notFound" };
  if (!matchFeatureEnabled(r.match, deps)) return { ok: false, error: FEATURE_DISABLED_ERROR };
  if (rankedMatch(r.match) && (await guestBlocked(deps, ownerId))) return { ok: false, error: "loginRequired" };
  if (!(await destinyMatchCurrent(r, deps))) return { ok: false, error: "cycleExpired" };
  if (r.match.campaignScenario) {
    const scenario = settleCampaignScenarioMatch(r.match);
    if (
      !scenario.ok ||
      scenario.verdict.status === "advance" ||
      scenario.verdict.status === "succeeded" ||
      scenario.verdict.status === "failed"
    )
      return { ok: false, error: "battleOver", view: viewOf(r.match) };
  }
  const result = humanAct(r.match, parsed.action, parsed.seq, deps.now);
  let match = result.match;
  if (
    match.survival?.stateVersion === 2 &&
    match.survival.roster &&
    match.seq !== r.match.seq
  ) {
    const synced = syncSurvivalRosterState(match.survival, match.battle);
    if (!synced.ok) return { ok: false, error: "badRequest" };
    match = { ...match, survival: synced.value };
  }
  const changed = match.seq !== r.match.seq;
  if (
    changed &&
    !(await deps.store.save(
      { ...r, match, updatedAt: deps.now },
      r.match.seq,
    ))
  ) {
    return { ok: false, error: "conflict" };
  }
  if (!result.ok)
    return { ok: false, error: result.error, view: viewOf(match) };
  const outcome = await reward(r, match, deps);
  return {
    ok: true,
    id,
    view: viewOf(match),
    events: result.events,
    ...(outcome ? { outcome } : {}),
  };
}

/** Mã HTTP cho từng lỗi. */
export function httpStatus(error: ServiceError): number {
  if (error === FEATURE_DISABLED_ERROR) return 503;
  if (error === "loginRequired") return 401;
  if (error === "notFound" || error === "arenaGone") return 404;
  if (
    error === "conflict" ||
    error === "staleSeq" ||
    error === "dailyDone" ||
    error === "arenaLimit" ||
    error === "cycleExpired"
  )
    return 409;
  return error === "badRequest" ? 400 : 422;
}
