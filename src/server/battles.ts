// Dịch vụ trận online: tạo trận, xem trận (kèm chạy bù), nhận hành động của người chơi.
// Không phụ thuộc Next.js; route handler chỉ đọc cookie/body rồi gọi vào đây, test gọi thẳng.

import {
  ALL_COMPANIONS,
  ARENA_ATTACKS_PER_DAY,
  ARENA_DIFFICULTY,
  ARENA_OFFERS,
  ARENA_WIN_GOLD,
  arenaDay,
  arenaDelta,
  defenseOf,
  ghostTeam,
  applyCampaignResult,
  applyRaidResult,
  applyTowerResult,
  applySurvivalResult,
  recordMatch,
  DAILY_GOLD,
  dailyKey,
  dailyScore,
  dailySetup,
  applyRewards,
  battleRewards,
  createRng,
  createSurvivalRoster,
  ELEMENTS,
  HUMAN,
  humanAct,
  isRaidTier,
  leveledFoe,
  matchOver,
  MAIN_ID,
  newSurvivalRun,
  survivalCleared,
  survivalActiveSideConfig,
  syncSurvivalRosterState,
  survivalWave,
  newTowerRun,
  ownsCompanion,
  PROFESSIONS,
  profileTeam,
  raidSetup,
  raidUnlocked,
  receiveDrop,
  rollDrop,
  settle,
  stageById,
  stageFoes,
  stageUnlocked,
  startMatch,
  STARTER_COMPANIONS,
  towerFloor,
  towerTeam,
  viewOf,
  type MatchAction,
  type SurvivalResult,
  type SurvivalLeaderBuildChoice,
  type DailyScore,
  type MatchMode,
  type Profile,
  type BattleEvent,
  type Difficulty,
  type Element,
  type BattleRewards,
  type CampaignResult,
  type RaidResult,
  type RaidTier,
  type TowerResult,
  type TowerRun,
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
import { submitProfile, type LeaderboardStore } from "./leaderboard";
import { offerDefense, type ArenaStore } from "./arena";
import { settleTrial, type TrialResult } from "./trialSettle";
import { settleDestinyMatch, type DestinyResult } from "./destinySettle";
import { activeDestinyCycle } from "./destinyCycle";
import { reconcileDestinyCycle } from "./destinyExpire";
import type { DestinyLeaderboardStore } from "./destinyLeaderboard";
import { FEATURE_DISABLED_ERROR, destinyEnabled, trialEnabled } from "./featureFlags";

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
  /** Màn chiến dịch: thể thức, độ khó và đối thủ lấy theo màn. */
  readonly stage?: string;
  /** Đánh trùm: bậc của trùm ở màn `stage`. */
  readonly raid?: RaidTier;
  /** Leo tháp: đánh tầng kế tiếp của lượt leo (bắt đầu lượt mới nếu chưa có). */
  readonly tower?: true;
  /** Sinh tồn: bắt đầu lượt chơi mới với đội đang chọn ở hồ sơ. */
  readonly survival?: true;
  /** Sinh tồn: tối đa 2 reserve IDs; active vẫn lấy theo `companions` của request. */
  readonly reserveCompanions?: readonly string[];
  /** Thử thách hằng ngày: đề chung của hôm nay, mỗi người một lượt. */
  readonly daily?: true;
  /** Đấu trường: đánh đối thủ thứ mấy trong các đối thủ đang bày. */
  readonly arena?: number;
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
  | typeof FEATURE_DISABLED_ERROR;

/** Phần thưởng cuối trận đã cộng vào hồ sơ, gửi kèm đúng một lần (response làm trận kết thúc). */
export interface Outcome {
  readonly rewards: BattleRewards;
  readonly levelUps: readonly LevelUp[];
  /** Món rơi đã vào túi đồ (kèm id trong hồ sơ); null khi không rơi hoặc túi đầy. */
  readonly drop: GearItem | null;
  /** Túi đầy: món rơi được bán ngay với giá này. */
  readonly soldFor: number;
  /** Chỉ có ở trận chiến dịch. */
  readonly campaign?: CampaignResult;
  /** Chỉ có ở trận đánh trùm. */
  readonly raid?: RaidResult;
  /** Chỉ có ở trận leo tháp. */
  readonly tower?: TowerResult;
  /** Chỉ có ở trận Tháp Thí Luyện. */
  readonly trial?: TrialResult;
  /** Chỉ có ở trận Destiny; không kèm vàng/EXP/drop. */
  readonly destiny?: DestinyResult;
  /** Chỉ có ở sinh tồn. */
  readonly survival?: SurvivalResult;
  /** Chỉ có ở thử thách hằng ngày: điểm và hạng lúc vừa xong. */
  readonly daily?: { readonly score: DailyScore; readonly rank: number | null };
  /** Chỉ có ở đấu trường. */
  readonly arena?: ArenaResult;
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

/** Kiểm tra body tạo trận; null khi không hợp lệ. */
export function parseNewBattle(body: unknown): NewBattleInput | null {
  if (!isObj(body)) return null;
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
    if (
      body.survival !== true ||
      body.stage !== undefined ||
      body.tower !== undefined
    )
      return null;
    const reserves =
      body.reserveCompanions === undefined ? [] : body.reserveCompanions;
    const knownIds = new Set(ALL_COMPANIONS.map((c) => c.id));
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
  if (body.tower !== undefined) {
    if (body.tower !== true || body.stage !== undefined) return null;
    const parsed = parseNewBattle({
      ...body,
      tower: undefined,
      mode: "3v3",
      difficulty: "normal",
    });
    return parsed && { ...parsed, tower: true };
  }
  if (body.stage !== undefined) {
    const stage =
      typeof body.stage === "string" ? stageById(body.stage) : undefined;
    if (!stage) return null;
    if (body.raid !== undefined && !isRaidTier(body.raid)) return null;
    const raid = body.raid as RaidTier | undefined;
    const parsed = parseNewBattle({
      ...body,
      stage: undefined,
      raid: undefined,
      mode: stage.mode,
      difficulty: raid ? raidSetup(stage, raid).difficulty : stage.difficulty,
    });
    return parsed && { ...parsed, stage: stage.id, ...(raid ? { raid } : {}) };
  }
  const { mode, element, profession, difficulty } = body;
  const companions = Array.isArray(body.companions) ? body.companions : [];
  if (
    !oneOf(["1v1", "3v3"] as const, mode) ||
    !oneOf(ELEMENTS, element) ||
    !oneOf(PROFESSIONS, profession)
  )
    return null;
  if (!oneOf(DIFFICULTIES, difficulty)) return null;
  const ids = ALL_COMPANIONS.map((c) => c.id);
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
  if (input.tower) return createTowerBattle(ownerId, input, deps);
  if (input.survival) return createSurvivalBattle(ownerId, input, deps);
  if (input.daily) return createDailyBattle(ownerId, deps);
  if (input.arena !== undefined)
    return createArenaBattle(ownerId, input.arena, deps);
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
  const stage = input.stage === undefined ? undefined : stageById(input.stage);
  if (
    stage &&
    !(input.raid
      ? raidUnlocked(profile.campaign, stage.id, input.raid)
      : stageUnlocked(profile.campaign, stage.id))
  )
    return { ok: false, error: "badRequest" };
  // Đánh trùm: luật sân nhà, không dùng lương chiến dịch.
  const raid = stage && input.raid ? raidSetup(stage, input.raid) : undefined;
  const foes = raid
    ? raid.foes
    : stage
      ? stageFoes(stage)
      : pickFoes(input, deps.seed).map((f) =>
          leveledFoe(f, profile.main.level),
        );
  const foeFood = raid ? raid.foeFood : stage?.foeFood;
  const weights = raid ? raid.weights : stage?.weights;
  const { match, events } = startMatch({
    sides: [
      // Chiến dịch: lương mang sang từ trận trước; phe AI theo luật màn.
      {
        fighters: team,
        leader: 0,
        ...(stage && !raid ? { food: profile.campaign.food } : {}),
      },
      {
        fighters: foes,
        leader: 0,
        ...(foeFood !== undefined ? { food: foeFood } : {}),
      },
    ],
    difficulty: input.difficulty,
    seed: deps.seed,
    firstSide: (deps.seed & 1) as SideIndex,
    now: deps.now,
    ...(stage
      ? {
          stage: stage.id,
          ...(input.raid ? { raid: input.raid } : {}),
          ...(weights ? { weights } : {}),
        }
      : {}),
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
 * Leo tháp: đánh tầng kế tiếp của lượt leo, bắt đầu lượt mới nếu chưa có. Đánh dấu lượt leo đang có trận ngay
 * trong lần ghi hồ sơ để hai request không cùng mở hai trận một tầng. Còn phần thưởng chưa chọn thì không đánh.
 */
async function createTowerBattle(
  ownerId: string,
  input: NewBattleInput,
  deps: Deps,
): Promise<ServiceResult> {
  let run: TowerRun | undefined;
  const u = await updateProfile(
    deps.profiles,
    ownerId,
    (p) => {
      const cur = p.tower.run ?? newTowerRun(p, deps.seed);
      if (cur.active || cur.offer)
        return { ok: false, error: "badRequest" as const };
      run = { ...cur, active: true };
      return {
        ok: true,
        profile: {
          ...p,
          element: input.element,
          profession: input.profession,
          tower: { ...p.tower, run },
        },
      };
    },
    deps.now,
  );
  if (!u.ok || !run) return { ok: false, error: u.ok ? "badRequest" : u.error };
  const floor = towerFloor(run, run.floor);
  const { match, events } = startMatch({
    sides: [
      {
        fighters: towerTeam(u.stored.profile, run),
        leader: 0,
        food: run.food,
        hpRatio: run.hp,
      },
      { fighters: floor.foes, leader: 0 },
    ],
    difficulty: floor.difficulty,
    seed: deps.seed,
    firstSide: (deps.seed & 1) as SideIndex,
    now: deps.now,
    weights: floor.weights,
    tower: floor.floor,
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

/** Ghi điểm đấu trường cho hai bên sau trận. Lỗi chỉ ghi log, không làm hỏng cộng thưởng. */
async function settleArena(
  ownerId: string,
  match: Match,
  won: boolean,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<ArenaResult | undefined> {
  const opp = match.arena;
  if (!opp) return undefined;
  const gold = won ? ARENA_WIN_GOLD : 0;
  const arena = deps.arena;
  if (!arena) return { won, opponent: opp.name, delta: 0, rating: null, gold };
  try {
    const mine = await arena.ensure(ownerId, deps.now);
    const d = arenaDelta(mine.rating, opp.rating, won);
    const rating = await arena.record(
      ownerId,
      d.attacker,
      won ? "win" : "loss",
      deps.now,
    );
    const scores: [string, number | null][] = [[ownerId, rating]];
    if (opp.owner !== null)
      scores.push([
        opp.owner,
        await arena.record(
          opp.owner,
          d.defender,
          won ? "defenseLoss" : "defenseWin",
          deps.now,
        ),
      ]);
    for (const [owner, score] of scores)
      if (score !== null)
        await deps.leaderboard?.submit(
          owner,
          [{ board: "arena", score }],
          deps.now,
        );
    return { won, opponent: opp.name, delta: d.attacker, rating, gold };
  } catch (e) {
    console.error("Không ghi được điểm đấu trường", ownerId, e);
    return { won, opponent: opp.name, delta: 0, rating: null, gold };
  }
}

function matchMode(m: Match): MatchMode {
  if (m.arena) return "arena";
  if (m.survival) return "survival";
  if (m.tower) return "tower";
  if (m.stage) return m.raid ? "raid" : "campaign";
  return m.daily ? "daily" : "normal";
}

function matchFeatureEnabled(match: Match, deps: Pick<Deps, "trialEnabled" | "destinyEnabled">): boolean {
  if (match.trial) return trialEnabled(deps);
  if (match.destiny) return destinyEnabled(deps);
  return true;
}

/** Trial: không vàng/EXP/món rơi; chỉ ghi tiến trình Trial. Đá do bước thưởng riêng cấp. */
async function rewardTrial(
  r: MatchRecord,
  match: Match,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome> {
  const trial = await settleTrial(r.ownerId, r.id, match, deps);
  return {
    rewards: {
      won: match.battle.winner === HUMAN,
      xp: match.battle.sides[HUMAN].fighters.map(() => 0),
      gold: 0,
    },
    levelUps: [],
    drop: null,
    soldFor: 0,
    ...(trial ? { trial } : {}),
  };
}

async function rewardDestiny(
  r: MatchRecord,
  match: Match,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome> {
  const destiny = await settleDestinyMatch(r.ownerId, r.id, match, deps);
  return {
    rewards: {
      won: match.battle.winner === HUMAN,
      xp: match.battle.sides[HUMAN].fighters.map(() => 0),
      gold: 0,
    },
    levelUps: [],
    drop: null,
    soldFor: 0,
    ...(destiny ? { destiny } : {}),
  };
}

/** Thử thách ngày xong: ghi điểm lên bảng xếp hạng, chỉ cộng vàng (đội là đội của đề, không nhận kinh nghiệm). */
async function rewardDaily(
  r: MatchRecord,
  match: Match,
  day: string,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome> {
  const score = dailyScore(match.battle);
  const gold = score.won ? DAILY_GOLD.win : DAILY_GOLD.loss;
  const u = await updateProfile(
    deps.profiles,
    r.ownerId,
    (p) => ({
      ok: true,
      profile: {
        ...p,
        gold: p.gold + gold,
        quests: recordMatch(
          p.quests,
          {
            mode: "daily",
            won: score.won,
            coins: match.battle.sides[HUMAN].gold,
            waves: 0,
          },
          deps.now,
        ),
      },
    }),
    deps.now,
  );
  if (!u.ok) console.error("Không cộng được thưởng thử thách ngày", r.id);
  let rank: number | null = null;
  if (deps.daily) {
    await deps.daily.finish(day, r.ownerId, score, deps.now);
    rank = await deps.daily.rankOf(day, r.ownerId);
  }
  return {
    rewards: {
      won: score.won,
      xp: match.battle.sides[HUMAN].fighters.map(() => 0),
      gold,
    },
    levelUps: [],
    drop: null,
    soldFor: 0,
    daily: { score, rank },
  };
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

/**
 * Trận đã kết thúc mà chưa cộng thưởng: đánh dấu đã cộng (chỉ một request thắng) rồi cộng vào hồ sơ.
 * Thua vẫn nhận kinh nghiệm cơ bản và giữ vàng, sách đã nhặt.
 */
/** Seed món rơi theo id trận: cộng thưởng chạy lại (lỗi ghi) vẫn ra cùng món. */
function dropSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++)
    h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

async function reward(
  r: MatchRecord,
  match: Match,
  deps: Omit<Deps, "seed" | "newId">,
): Promise<Outcome | undefined> {
  if (!matchOver(match) || !(await deps.store.claimReward(r.id, deps.now)))
    return undefined;
  if (match.destiny) return rewardDestiny(r, match, deps);
  if (match.trial) return rewardTrial(r, match, deps);
  if (match.daily) return rewardDaily(r, match, match.daily, deps);
  // Sinh tồn: vượt qua ít nhất một đợt tính là thắng (kinh nghiệm, món rơi).
  const cleared = match.survival
    ? survivalCleared(match.survival, match.battle)
    : 0;
  const rewards = battleRewards(
    match.battle,
    HUMAN,
    match.survival ? cleared > 0 : undefined,
  );
  const ids = match.battle.sides[HUMAN].fighters.map((f) => f.id);
  const rolled = rollDrop(
    createRng(dropSeed(r.id)),
    match.difficulty,
    rewards.won,
    "",
  );
  let levelUps: readonly LevelUp[] = [];
  let drop: GearItem | null = null;
  let soldFor = 0;
  let campaign: CampaignResult | undefined;
  let raid: RaidResult | undefined;
  let tower: TowerResult | undefined;
  let survival: SurvivalResult | undefined;
  const stage = match.stage;
  const u = await updateProfile(
    deps.profiles,
    r.ownerId,
    (p) => {
      const applied = applyRewards(p, ids, rewards);
      levelUps = applied.levelUps;
      let next: Profile = {
        ...applied.profile,
        // Đấu trường: vàng thưởng thêm khi thắng.
        gold:
          applied.profile.gold +
          (match.arena && rewards.won ? ARENA_WIN_GOLD : 0),
        quests: recordMatch(
          applied.profile.quests,
          {
            mode: matchMode(match),
            won: rewards.won,
            coins: match.battle.sides[HUMAN].gold,
            waves: cleared,
          },
          deps.now,
        ),
      };
      if (match.survival) {
        const c = applySurvivalResult(next, cleared);
        next = c.profile;
        survival = c.result;
      } else if (match.tower) {
        const side = match.battle.sides[HUMAN];
        const c = applyTowerResult(
          next,
          rewards.won,
          side.fighters.map((f) => f.hp / f.maxHp),
          side.food,
        );
        next = c.profile;
        tower = c.result;
      } else if (stage && match.raid) {
        // Rng riêng cho món thưởng, khác luồng món rơi thường.
        const c = applyRaidResult(
          next,
          stage,
          match.raid,
          rewards.won,
          createRng(dropSeed(`${r.id}:raid`)),
        );
        next = c.profile;
        raid = c.result;
      } else if (stage) {
        const c = applyCampaignResult(
          next,
          stage,
          rewards.won,
          match.battle.sides[HUMAN].food,
          match.battle.turn.number,
        );
        next = c.profile;
        campaign = c.result;
      }
      if (!rolled) return { ok: true, profile: next };
      const received = receiveDrop(next, rolled);
      drop = received.item;
      soldFor = received.soldFor;
      return { ok: true, profile: received.profile };
    },
    deps.now,
  );
  if (!u.ok) console.error("Không cộng được thưởng cuối trận", r.id, u.error);
  else
    await submitProfile(
      deps.leaderboard,
      r.ownerId,
      u.stored.profile,
      deps.now,
    );
  const arena = await settleArena(r.ownerId, match, rewards.won, deps);
  return {
    rewards,
    levelUps,
    drop,
    soldFor,
    ...(campaign ? { campaign } : {}),
    ...(raid ? { raid } : {}),
    ...(tower ? { tower } : {}),
    ...(survival ? { survival } : {}),
    ...(arena ? { arena } : {}),
  };
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
  if (!(await destinyMatchCurrent(r, deps))) return { ok: false, error: "cycleExpired" };
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
