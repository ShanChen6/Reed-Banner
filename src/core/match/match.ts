// Trận online do server có thẩm quyền: nhận ý định của người chơi, chạy bù lượt hết giờ kiểu "tính lười",
// cho AI đánh, xử thua trận bỏ dở và ẩn mọi luồng ngẫu nhiên khỏi client.
// Xem docs/tech/ha-tang.md mục 2. Thuần, không đọc giờ hệ thống: `now` luôn do server truyền vào.

import { playAiTurn, type Difficulty } from "../ai";
import {
  act,
  beginWave,
  createBattle,
  FOOD_MAX,
  GRACE_MS,
  type BattleAction,
  type BattleError,
  type BattleEvent,
  type BattleState,
  type Element,
  type Profession,
  type SideConfig,
  type SideIndex,
} from "../battle";
import type { SpawnWeights } from "../board";
import type { RaidTier } from "../campaign";
import type { GearItem } from "../gear";
import type { CharacterProgress } from "../progress";
import type { DestinyMatchTag, TowerMatchTag } from "../tower";
import {
  planBreak,
  autoReviveFighterId,
  applySurvivalLeaderBuild,
  downedFightersAfterWave,
  recoverSurvivalRoster,
  SURVIVAL_FOOD,
  SURVIVAL_REVIVE_FOOD,
  SURVIVAL_REVIVE_WAVES,
  proposeSurvivalLeaderBuild,
  syncSurvivalRosterState,
  survivalBreak,
  survivalCleared,
  proposeSurvivalLineup,
  wavePreview,
  type SurvivalRotationError,
  type SurvivalError,
  type SurvivalLeaderBuildChoice,
  type SurvivalLeaderBuildError,
  type SurvivalRun,
  type SurvivalDownedFighter,
  type WavePreview,
} from "../survival";

/** Trận dở không có hành động nào của người chơi quá mốc này thì xử thua. */
export const ABANDON_MS = 24 * 60 * 60 * 1000;
/** Giới hạn số lượt chạy bù trong một request, để không vượt thời gian của hàm serverless. */
export const MAX_CATCH_UP_TURNS = 120;

/** Phe người chơi luôn là phe 0, phe AI là phe 1. */
export const HUMAN: SideIndex = 0;
export const AI_SIDE: SideIndex = 1;

export interface Match {
  readonly battle: BattleState;
  readonly difficulty: Difficulty;
  /** Tăng sau mỗi lần trạng thái đổi; dùng chống ghi trùng (DB) và chống gửi lặp (client). */
  readonly seq: number;
  readonly startedAt: number;
  /** Lần cuối người chơi tự ra tay (không tính hết giờ). */
  readonly lastHumanAt: number;
  /** Trận kết thúc vì người chơi bỏ dở quá ABANDON_MS. */
  readonly forfeited: boolean;
  /** Id màn chiến dịch; không có ở trận Thường. */
  readonly stage?: string;
  /** Đánh trùm: bậc trùm ở màn `stage`. */
  readonly raid?: RaidTier;
  /** Leo tháp: số tầng. */
  readonly tower?: number;
  /** Sinh tồn: lượt chơi (đợt, người gục); trận chỉ kết thúc khi `done`. */
  readonly survival?: SurvivalRun;
  /** Thử thách hằng ngày: khóa ngày (YYYY-MM-DD). */
  readonly daily?: string;
  /** Đấu trường bóng ma: đối thủ lúc vào trận. */
  readonly arena?: ArenaOpponent;
  /** Tháp Thí Luyện (Song Tháp). Tách khỏi `tower` của Legacy để không đụng tower.run/best. */
  readonly trial?: TrialMatch;
  /** Tháp Vận Mệnh; tách hoàn toàn khỏi `tower` legacy. */
  readonly destiny?: DestinyMatch;
}

/** Danh tính tầng của trận Trial và giới hạn lượt của người chơi. */
export interface TrialMatch {
  readonly tag: TowerMatchTag;
  readonly turnLimit: number;
  /** Đá lần đầu của tầng lúc server mở trận; không có ở trận cũ thì chỉ nâng tiến trình, chưa chốt quyền nhận. */
  readonly firstClearStones?: number;
}

export interface DestinyMatch {
  readonly tag: DestinyMatchTag;
}

/** Đối thủ đấu trường: chủ đội phòng thủ (null là bóng ma do máy tạo), tên và điểm lúc vào trận. */
export interface ArenaOpponent {
  readonly owner: string | null;
  readonly name: string;
  readonly rating: number;
}

export interface MatchConfig {
  readonly sides: readonly [SideConfig, SideConfig];
  readonly difficulty: Difficulty;
  readonly seed: number;
  readonly firstSide: SideIndex;
  readonly now: number;
  readonly weights?: SpawnWeights;
  readonly stage?: string;
  readonly raid?: RaidTier;
  readonly tower?: number;
  readonly survival?: SurvivalRun;
  readonly daily?: string;
  readonly arena?: ArenaOpponent;
  readonly trial?: TrialMatch;
  readonly destiny?: DestinyMatch;
}

export interface MatchStep {
  readonly match: Match;
  readonly events: readonly BattleEvent[];
}

/** Tạo trận có đồng hồ 30 giây. Nếu AI đi trước, AI đánh luôn lượt đầu. */
export function startMatch(config: MatchConfig): MatchStep {
  const { state, events } = createBattle({
    sides: [config.sides[0], config.sides[1]],
    seed: config.seed,
    timer: true,
    firstSide: config.firstSide,
    now: config.now,
    ...(config.weights ? { weights: config.weights } : {}),
  });
  const match: Match = {
    battle: state,
    difficulty: config.difficulty,
    seq: 0,
    startedAt: config.now,
    lastHumanAt: config.now,
    forfeited: false,
    ...(config.stage ? { stage: config.stage } : {}),
    ...(config.raid ? { raid: config.raid } : {}),
    ...(config.tower ? { tower: config.tower } : {}),
    ...(config.survival ? { survival: config.survival } : {}),
    ...(config.daily ? { daily: config.daily } : {}),
    ...(config.arena ? { arena: config.arena } : {}),
    ...(config.trial ? { trial: config.trial } : {}),
    ...(config.destiny ? { destiny: config.destiny } : {}),
  };
  const ai = runAi(match, config.now, config.difficulty);
  return { match: ai.match, events: [...events, ...ai.events] };
}

/**
 * Khi chạy bù, AI dùng cách chấm điểm nhẹ (không giả lập ô rơi) để một request chạy được nhiều lượt.
 * Độ khó Trùm/Ác mộng chấm như Khó; các mức khác giữ nguyên.
 */
export function catchUpDifficulty(d: Difficulty): Difficulty {
  return d === "boss" || d === "nightmare" ? "hard" : d;
}

/**
 * Trận đã kết thúc hẳn (cộng thưởng được). Sinh tồn: phe người chơi thắng một đợt chỉ là nghỉ giữa đợt,
 * lượt chơi kết thúc khi `survival.done`.
 */
export function matchOver(m: Match): boolean {
  if (m.battle.winner === null) return false;
  return !m.survival || m.survival.done || m.battle.winner !== HUMAN;
}

function runAi(m: Match, at: number, difficulty: Difficulty): MatchStep {
  if (m.battle.winner !== null || m.battle.turn.side !== AI_SIDE)
    return { match: m, events: [] };
  const r = playAiTurn(m.battle, difficulty, at);
  return { match: { ...m, battle: r.state, seq: m.seq + 1 }, events: r.events };
}

/**
 * Đưa trận về đúng thời điểm `now`: xử thua nếu bỏ dở quá 24 giờ, rồi lần lượt cho người chơi mất các
 * lượt đã quá hạn (kể cả ân hạn) và AI đánh lượt của mình, theo đúng mốc thời gian lúc đó.
 */
export function settle(start: Match, now: number): MatchStep {
  let m = start;
  const events: BattleEvent[] = [];
  if (m.survival && !m.survival.done && now - m.lastHumanAt > ABANDON_MS) {
    // Sinh tồn bỏ dở không xử thua: lượt chơi dừng ở đợt cuối đã vượt qua và vẫn ghi điểm.
    const battle = structuredClone(m.battle);
    if (battle.winner === null) battle.winner = AI_SIDE;
    battle.turn.deadline = null;
    return {
      match: {
        ...m,
        battle,
        seq: m.seq + 1,
        survival: { ...m.survival, done: true },
      },
      events,
    };
  }
  if (m.battle.winner === null && now - m.lastHumanAt > ABANDON_MS) {
    const battle = structuredClone(m.battle);
    battle.winner = AI_SIDE;
    battle.turn.deadline = null;
    return { match: { ...m, battle, seq: m.seq + 1, forfeited: true }, events };
  }
  for (
    let turns = 0;
    turns < MAX_CATCH_UP_TURNS && m.battle.winner === null;
    turns++
  ) {
    const { turn } = m.battle;
    if (turn.side === AI_SIDE) {
      // AI chỉ còn lượt dở khi lần chạy bù trước dừng ở giới hạn; đánh tiếp ngay.
      const r = runAi(m, now, catchUpDifficulty(m.difficulty));
      m = r.match;
      events.push(...r.events);
      continue;
    }
    if (turn.deadline === null || now <= turn.deadline + GRACE_MS) break;
    // Hết giờ có hiệu lực ngay sau ân hạn; lượt AI kế tiếp và đồng hồ mới tính từ mốc đó.
    const at = turn.deadline + GRACE_MS + 1;
    const r = act(m.battle, { type: "timeout" }, at);
    if (!r.ok) break;
    m = { ...m, battle: r.state, seq: m.seq + 1 };
    events.push(...r.events);
    const ai = runAi(m, at, catchUpDifficulty(m.difficulty));
    m = ai.match;
    events.push(...ai.events);
  }
  return { match: closeLost(m), events };
}

export type MatchError =
  | BattleError
  | SurvivalError
  | SurvivalRotationError
  | SurvivalLeaderBuildError
  | "staleSeq"
  | "notYourTurn";

/** Hành động ngoài bàn cờ của sinh tồn, chỉ làm được lúc nghỉ giữa đợt. */
export type SurvivalAction =
  /** Vào đợt kế; lineup và revive được xác nhận atomically ở BREAK. */
  | {
      readonly type: "nextWave";
      readonly revive?: string | number;
      readonly activeIds?: readonly string[];
      readonly leaderBuild?: Partial<SurvivalLeaderBuildChoice>;
    }
  /** Dừng lượt chơi, ghi điểm theo số đợt đã vượt qua. */
  | { readonly type: "endRun" };

export type MatchAction = BattleAction | SurvivalAction;

const isSurvivalAction = (a: MatchAction): a is SurvivalAction =>
  a.type === "nextWave" || a.type === "endRun";

/**
 * Sinh tồn: phe người chơi gục hết thì lượt chơi kết thúc.
 * Trial: quá `turnLimit` lượt của người chơi mà chưa thắng thì thua (số lượt tính theo lượt phe của engine).
 */
function closeLost(m: Match): Match {
  if (
    m.trial &&
    m.battle.winner === null &&
    m.battle.turn.number > 2 * m.trial.turnLimit
  ) {
    const battle = structuredClone(m.battle);
    battle.winner = AI_SIDE;
    battle.turn.deadline = null;
    return { ...m, battle, seq: m.seq + 1 };
  }
  return m.survival && !m.survival.done && m.battle.winner === AI_SIDE
    ? {
        ...m,
        seq: m.seq + 1,
        survival: { ...m.survival, done: true },
      }
    : m;
}

/**
 * Commits the single BREAK -> FIGHTING/FINISHED transition.
 * All recovery, supply, revive, and next-wave state is produced atomically before Match persistence.
 */
export function coordinateSurvivalRoundTransition(
  m: Match,
  action: SurvivalAction,
  now: number,
): MatchResult {
  const fail = (error: MatchError): MatchResult => ({
    ok: false,
    error,
    match: m,
    events: [],
  });
  const run = m.survival;
  if (run?.done || m.battle.winner === AI_SIDE)
    return fail("finished");
  if (!run || !survivalBreak(run, m.battle)) return fail("noBreak");
  if (action.type === "endRun")
    return {
      ok: true,
      match: {
        ...m,
        seq: m.seq + 1,
        lastHumanAt: now,
        survival: { ...run, done: true },
      },
      events: [],
    };
  const plan = planBreak(run, m.battle, action.revive);
  if (!plan.ok) return fail(plan.error);
  let nextRun = plan.run;
  let nextBattle = plan.battle;
  let config = plan.config;
  const main = plan.run.roster.entries["dinhBoLinh"]!;
  const requestedBuild = action.leaderBuild
    ? proposeSurvivalLeaderBuild(plan.run, plan.battle, action.leaderBuild)
    : null;
  if (requestedBuild && !requestedBuild.ok)
    return fail(requestedBuild.error);
  if (requestedBuild?.ok) nextRun = requestedBuild.run;
  const choice = nextRun.roster.entries["dinhBoLinh"]!.snapshot
    .leaderBuildChoice;
  const needsLeaderBuild =
    choice !== undefined &&
    (choice.profession !== main.snapshot.config.profession ||
      choice.element !== main.snapshot.config.element);
  if (action.activeIds !== undefined || needsLeaderBuild) {
    const battleForLineup = structuredClone(plan.battle);
    for (const slot of plan.config.revive) {
      const fighter = battleForLineup.sides[0].fighters[slot];
      if (!fighter) return fail("invalidState");
      fighter.hp = Math.max(
        1,
        Math.round(fighter.maxHp * plan.config.reviveHp),
      );
      fighter.energy = 0;
    }
    const synced = syncSurvivalRosterState(nextRun, battleForLineup);
    if (!synced.ok) return fail("invalidRoster");
    nextRun = synced.value;
    nextBattle = battleForLineup;
    if (action.activeIds !== undefined) {
      const rotation = proposeSurvivalLineup(
        nextRun,
        nextBattle,
        action.activeIds,
      );
      if (!rotation.ok) return fail(rotation.error);
      nextRun = rotation.value.run;
      nextBattle = rotation.value.battle;
    }
    const built = applySurvivalLeaderBuild(nextRun, nextBattle);
    if (!built.ok) return fail(built.error);
    nextRun = built.value.run;
    nextBattle = built.value.battle;
    config = {
      ...plan.config,
      playerFighters: nextBattle.sides[0].fighters,
      revive: [],
    };
  }
  const r = beginWave(nextBattle, config, now);
  return {
    ok: true,
    match: {
      ...m,
      battle: r.state,
      difficulty: plan.wave.difficulty,
      seq: m.seq + 1,
      lastHumanAt: now,
      survival: nextRun,
    },
    events: r.events,
  };
}

export type MatchResult =
  | ({ readonly ok: true } & MatchStep)
  | {
      readonly ok: false;
      readonly error: MatchError;
      readonly match: Match;
      readonly events: readonly BattleEvent[];
    };

/**
 * Một hành động của người chơi. Trước khi xử lý, trận được chạy bù tới `now`; `expectedSeq` (seq client
 * đang thấy) khác seq sau khi chạy bù thì từ chối. Nếu lượt chuyển sang AI, AI đánh luôn.
 * Khi lỗi, `match` vẫn là trạng thái đã chạy bù để server lưu lại.
 */
export function humanAct(
  start: Match,
  action: MatchAction,
  expectedSeq: number,
  now: number,
): MatchResult {
  const settled = settle(start, now);
  const fail = (error: MatchError): MatchResult => ({
    ok: false,
    error,
    match: settled.match,
    events: settled.events,
  });
  // Seq khác: client gửi lặp, hoặc vừa chạy bù hết giờ nên nước đi nhắm vào bàn cờ cũ.
  if (expectedSeq !== settled.match.seq) return fail("staleSeq");
  const m = settled.match;
  if (isSurvivalAction(action)) {
    const r = coordinateSurvivalRoundTransition(m, action, now);
    return { ...r, events: [...settled.events, ...r.events] };
  }
  if (m.battle.winner !== null) return fail("battleOver");
  if (m.battle.turn.side !== HUMAN) return fail("notYourTurn");
  const r = act(m.battle, action, now);
  if (!r.ok) return fail(r.error);
  const next: Match = {
    ...m,
    battle: r.state,
    seq: m.seq + 1,
    lastHumanAt: now,
  };
  const ai = runAi(next, now, m.difficulty);
  return {
    ok: true,
    match: closeLost(ai.match),
    events: [...settled.events, ...r.events, ...ai.events],
  };
}

/** Trạng thái gửi cho client: bỏ luồng ngẫu nhiên của bàn cờ và của AI. */
export type PlayerView = Omit<BattleState, "boardRng" | "aiRng">;

export interface MatchView {
  readonly battle: PlayerView;
  readonly difficulty: Difficulty;
  readonly seq: number;
  readonly forfeited: boolean;
  readonly stage?: string;
  readonly raid?: RaidTier;
  readonly tower?: number;
  readonly survival?: SurvivalView;
  readonly daily?: string;
  /** Trial: tầng đang đánh và giới hạn lượt; không lộ seed hay dấu vân tay. */
  readonly trial?: { readonly floor: number; readonly turnLimit: number };
  readonly destiny?: { readonly cycleId: string; readonly floor: number };
  /** Đấu trường: tên đối thủ (không lộ id chủ đội). */
  readonly arena?: { readonly name: string; readonly rating: number };
}

/** Sinh tồn gửi cho client: không có seed, kèm báo trước đợt kế tiếp. */
export interface SurvivalView {
  readonly wave: number;
  readonly cleared: number;
  readonly downed: readonly (number | null)[];
  readonly downedFighters: readonly {
    readonly id: string;
    readonly name: string;
    readonly downedAtWave: number;
    readonly location: "active" | "reserve";
  }[];
  readonly autoReviveId: string | null;
  readonly done: boolean;
  /** Đợt đang đánh. */
  readonly current: WavePreview;
  /** Đợt kế tiếp; không có khi lượt chơi đã kết thúc. */
  readonly next?: WavePreview;
  /** Server-calculated read-only preview of recovery, supplies, and revive choices at BREAK. */
  readonly break?: SurvivalBreakView;
}

export interface SurvivalBreakView {
  readonly activeIds: readonly [string, string, string];
  readonly reserveIds: readonly string[];
  readonly leaderBuildBasis?: {
    readonly profession: Profession;
    readonly element: Element;
    readonly hp: number;
    readonly maxHp: number;
    readonly hpRatio: number;
    readonly progress: CharacterProgress;
    readonly equipment: readonly GearItem[];
  };
  readonly foodCurrent: number;
  readonly foodAfterSupply: number;
  readonly reviveCost: number;
  readonly foodAfterPaidRevive: number | null;
  readonly canPayRevive: boolean;
  readonly autoReviveId: string | null;
  readonly fighters: readonly {
    readonly id: string;
    readonly name: string;
    readonly element: Element;
    readonly profession: Profession;
    readonly location: "active" | "reserve";
    readonly hpBeforeRecovery: number;
    readonly hp: number;
    readonly hpAfterRecovery: number;
    readonly maxHp: number;
    readonly energy: number;
    readonly downedAtWave: number | null;
    readonly revivedAtWave: number | null;
    readonly roundsUntilAutoRevive: number | null;
    readonly autoRevive: boolean;
  }[];
}

function survivalBreakView(
  run: SurvivalRun,
  battle: BattleState,
): SurvivalBreakView | undefined {
  if (!survivalBreak(run, battle)) return undefined;
  const recovery = recoverSurvivalRoster(run, battle);
  if (!recovery.ok) return undefined;

  const recoveredRun = recovery.value.run;
  const recoveredBattle = recovery.value.battle;
  const downed = downedFightersAfterWave(recoveredRun, recoveredBattle);
  const autoReviveId = autoReviveFighterId(run.wave, downed);
  const foodCurrent = battle.sides[0].food;
  const foodAfterSupply = Math.min(FOOD_MAX, foodCurrent + SURVIVAL_FOOD);
  const canPayRevive =
    autoReviveId === null &&
    downed.length > 0 &&
    foodAfterSupply >= SURVIVAL_REVIVE_FOOD;
  const downedById = new Map<string, SurvivalDownedFighter>(
    downed.map((fighter) => [fighter.id, fighter]),
  );
  const fighters = recoveredRun.roster.orderIds.flatMap((id) => {
    const entry = recoveredRun.roster.entries[id];
    if (!entry) return [];
    const location = entry.location.kind;
    const fighter =
      location === "active"
        ? recoveredBattle.sides[0].fighters[entry.location.slot]
        : null;
    const hp =
      location === "active" ? (fighter?.hp ?? 0) : entry.location.runtime.hp;
    const originalEntry = run.roster.entries[id]!;
    const originalFighter =
      originalEntry.location.kind === "active"
        ? battle.sides[0].fighters[originalEntry.location.slot]
        : null;
    const hpBeforeRecovery =
      originalEntry.location.kind === "active"
        ? (originalFighter?.hp ?? 0)
        : originalEntry.location.runtime.hp;
    const maxHp = entry.snapshot.config.maxHp;
    const energy =
      location === "active"
        ? (fighter?.energy ?? 0)
        : entry.location.runtime.energy;
    const downedFighter = downedById.get(id);
    const downedAtWave = downedFighter?.downedAtWave ?? null;
    const wavesElapsed =
      downedAtWave === null ? null : run.wave - downedAtWave;
    const roundsUntilAutoRevive =
      wavesElapsed === null
        ? null
        : Math.max(0, SURVIVAL_REVIVE_WAVES - 1 - wavesElapsed);
    return [
      {
        id,
        name: entry.snapshot.config.name,
        element: entry.snapshot.config.element,
        profession: entry.snapshot.config.profession,
        location,
        hpBeforeRecovery,
        hp,
        hpAfterRecovery: hp,
        maxHp,
        energy,
        downedAtWave,
        revivedAtWave: entry.revivedAtWave ?? null,
        roundsUntilAutoRevive,
        autoRevive: id === autoReviveId,
      },
    ];
  });
  const leaderEntry = recoveredRun.roster.entries["dinhBoLinh"];
  const leader = recoveredBattle.sides[0].fighters[0];
  const mainBuild = leaderEntry?.snapshot.mainBuild;
  const leaderBuildBasis =
    leaderEntry?.snapshot.equipment.kind === "snapshot" &&
    mainBuild?.kind === "snapshot" &&
    leader
      ? {
          profession: leaderEntry.snapshot.config.profession,
          element: leaderEntry.snapshot.config.element,
          hp: leader.hp,
          maxHp: leader.maxHp,
          hpRatio:
            leaderEntry.snapshot.leaderHpProjection?.hp === leader.hp &&
            leaderEntry.snapshot.leaderHpProjection.maxHp === leader.maxHp
              ? (leaderEntry.snapshot.leaderHpRatio ??
                leader.hp / leader.maxHp)
              : leader.hp / leader.maxHp,
          progress: mainBuild.progress,
          equipment: leaderEntry.snapshot.equipment.value.items,
        }
      : undefined;
  return {
    activeIds: recoveredRun.roster.activeIds,
    reserveIds: recoveredRun.roster.reserveIds,
    ...(leaderBuildBasis ? { leaderBuildBasis } : {}),
    foodCurrent,
    foodAfterSupply,
    reviveCost: SURVIVAL_REVIVE_FOOD,
    foodAfterPaidRevive: canPayRevive
      ? foodAfterSupply - SURVIVAL_REVIVE_FOOD
      : null,
    canPayRevive,
    autoReviveId,
    fighters,
  };
}

function survivalView(run: SurvivalRun, battle: BattleState): SurvivalView {
  const breakView = survivalBreakView(run, battle);
  return {
    wave: run.wave,
    cleared: survivalCleared(run, battle),
    downed: run.downed,
    downedFighters: downedFightersAfterWave(run, battle),
    autoReviveId: autoReviveFighterId(
      run.wave,
      downedFightersAfterWave(run, battle),
    ),
    done: run.done,
    current: wavePreview(run, run.wave),
    ...(breakView ? { break: breakView } : {}),
    ...(run.done ? {} : { next: wavePreview(run, run.wave + 1) }),
  };
}

export function viewOf(m: Match): MatchView {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { boardRng, aiRng, ...battle } = m.battle;
  return {
    battle,
    difficulty: m.difficulty,
    seq: m.seq,
    forfeited: m.forfeited,
    ...(m.stage ? { stage: m.stage } : {}),
    ...(m.raid ? { raid: m.raid } : {}),
    ...(m.tower ? { tower: m.tower } : {}),
    ...(m.survival ? { survival: survivalView(m.survival, m.battle) } : {}),
    ...(m.daily ? { daily: m.daily } : {}),
    ...(m.trial
      ? { trial: { floor: m.trial.tag.floor, turnLimit: m.trial.turnLimit } }
      : {}),
    ...(m.destiny
      ? { destiny: { cycleId: m.destiny.tag.cycleId, floor: m.destiny.tag.floor } }
      : {}),
    ...(m.arena
      ? { arena: { name: m.arena.name, rating: m.arena.rating } }
      : {}),
  };
}
