// Kiểm tra khả thi tầng Song Tháp, tách hai câu hỏi khác nhau:
//   1. Luật có khóa đội hình không (tĩnh, chính xác, trên bộ tướng dự kiến)?
//   2. Có tìm được đường thắng không (tìm kiếm có giới hạn, chỉ là chứng cứ, không phải chứng minh)?
// "Có đội hợp lệ" không có nghĩa "tầng giải được". Không sửa engine, không đổi độ khó hay tặng tướng.
import { chooseSkill, playAiTurn, toView, type Difficulty } from "../ai";
import {
  act,
  createBattle,
  ELEMENTS,
  PROFESSIONS,
  selectableActors,
  type BattleAction,
  type BattleState,
  type Element,
  type FighterConfig,
  type Profession,
  type SideConfig,
  type SideIndex,
} from "../battle";
import { findValidMoves, type SpawnWeights } from "../board";
import {
  MAIN_ID,
  ownsCompanion,
  profileTeam,
  type Profile,
} from "../progress";
import { SHOP_COMPANIONS, STARTER_COMPANIONS } from "../roster";
import { resolveFloor } from "./floorContract";
import {
  validateFloorRules,
  validateLineup,
  type FloorRules,
  type LineupErrorCode,
  type LineupMember,
  type RuleIssue,
} from "./floorRules";
import { prepareTowerLineup } from "./prepare";
import {
  toFloorDefinition,
  trialEnemyBuilder,
  type TrialFloorSpec,
  type WinCriteria,
} from "./trialFloors";

/* ───────────── 1. Khả thi tĩnh của luật ───────────── */

export interface Lineup {
  /** members[0] là thủ lĩnh với build đã chọn. */
  readonly members: readonly [LineupMember, LineupMember, LineupMember];
}

export type FeasibilityStatus = "feasible" | "rules_invalid" | "no_lineup";

export interface FeasibilityReport {
  readonly status: FeasibilityStatus;
  readonly ruleIssues: readonly RuleIssue[];
  /** Tướng kèm hợp lệ về dữ liệu (không trùng, không phải thủ lĩnh). */
  readonly companionsConsidered: number;
  /** Tướng kèm bị luật cấm ngay từ hệ/nghề của chính họ. */
  readonly companionsBanned: readonly string[];
  readonly lineupsExamined: number;
  readonly lineupsValid: number;
  /** Đếm lỗi theo mã trên các đội đã xét: chỉ ra luật nào chặn nhiều nhất. */
  readonly blockedBy: Readonly<Partial<Record<LineupErrorCode, number>>>;
  /** Vài đội hợp lệ đầu tiên theo thứ tự cố định. */
  readonly samples: readonly Lineup[];
  /** true khi dừng vì chạm `maxExamined`; số liệu chỉ là một phần. */
  readonly truncated: boolean;
}

export interface FeasibilityOptions {
  readonly leaderId?: string;
  readonly maxExamined?: number;
  readonly maxSamples?: number;
}

export const DEFAULT_MAX_EXAMINED = 20000;

/**
 * Duyệt mọi cặp tướng kèm × mọi build thủ lĩnh (hệ × nghề) và kiểm bằng `validateLineup`.
 * Chính xác trong phạm vi bộ tướng được đưa vào; không nói gì về việc thắng được hay không.
 */
export function analyzeFeasibility(
  rules: FloorRules,
  companions: readonly LineupMember[],
  options: FeasibilityOptions = {},
): FeasibilityReport {
  const leaderId = options.leaderId ?? MAIN_ID;
  const maxExamined = options.maxExamined ?? DEFAULT_MAX_EXAMINED;
  const maxSamples = options.maxSamples ?? 3;
  const ruleIssues = validateFloorRules(rules);

  const seen = new Set<string>();
  const pool = companions.filter((c) => {
    if (!c.id || c.id === leaderId || seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
  const empty = {
    ruleIssues,
    companionsConsidered: pool.length,
    companionsBanned: [] as string[],
    lineupsExamined: 0,
    lineupsValid: 0,
    blockedBy: {},
    samples: [] as Lineup[],
    truncated: false,
  };
  if (ruleIssues.length > 0) return { status: "rules_invalid", ...empty };

  const banned = pool
    .filter(
      (c) =>
        rules.bannedElements?.includes(c.element) ||
        rules.bannedProfessions?.includes(c.profession),
    )
    .map((c) => c.id);

  const blockedBy: Partial<Record<LineupErrorCode, number>> = {};
  const samples: Lineup[] = [];
  let examined = 0;
  let valid = 0;
  let truncated = false;

  outer: for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      for (const element of ELEMENTS) {
        for (const profession of PROFESSIONS) {
          if (examined >= maxExamined) {
            truncated = true;
            break outer;
          }
          examined++;
          const members = [
            { id: leaderId, element, profession },
            pool[i]!,
            pool[j]!,
          ] as const;
          const r = validateLineup(rules, members, leaderId);
          if (r.ok) {
            valid++;
            if (samples.length < maxSamples) samples.push({ members });
          } else {
            for (const e of r.errors) blockedBy[e.code] = (blockedBy[e.code] ?? 0) + 1;
          }
        }
      }
    }
  }
  return {
    status: valid > 0 ? "feasible" : "no_lineup",
    ruleIssues,
    companionsConsidered: pool.length,
    companionsBanned: banned,
    lineupsExamined: examined,
    lineupsValid: valid,
    blockedBy,
    samples,
    truncated,
  };
}

/* ───────────── 2. Tìm đường thắng có giới hạn ───────────── */

export interface PuzzleSetup {
  readonly sides: readonly [SideConfig, SideConfig];
  readonly seed: number;
  readonly firstSide?: SideIndex;
  readonly weights?: SpawnWeights;
  /** Độ khó AI của phe đối thủ. */
  readonly difficulty: Difficulty;
  readonly win: WinCriteria;
  /** Số nước đi tối đa của người chơi (mỗi lần đổi ô tính một nước, kể cả lượt thêm). */
  readonly turnLimit: number;
}

export interface SearchBudget {
  /** Số lần gọi act(swap) tối đa. */
  readonly maxNodes?: number;
  /** Số trạng thái giữ lại mỗi độ sâu. */
  readonly beamWidth?: number;
}

export const DEFAULT_MAX_NODES = 4000;
export const DEFAULT_BEAM_WIDTH = 24;

/** Một bước người chơi: chọn người, (tùy chọn) kỹ năng, rồi đổi ô. */
export type PuzzleStep = readonly BattleAction[];

export type UnresolvedReason =
  | "budget_exhausted"
  | "beam_pruned"
  | "explored_restricted_model"
  | "replay_mismatch"
  | "invalid_setup";

export interface SearchCoverage {
  readonly nodes: number;
  readonly maxDepth: number;
  readonly beamWidth: number;
  readonly maxNodes: number;
  /** Số trạng thái bị loại vì vượt beam. */
  readonly pruned: number;
  readonly deduped: number;
  readonly budgetExhausted: boolean;
  /** Mô hình hành động đã duyệt; mọi kết luận "không thấy" chỉ đúng trong mô hình này. */
  readonly actionModel: "actor×swap+heuristic-skill";
}

export type PuzzleResult =
  | {
      readonly status: "win_found";
      readonly path: readonly PuzzleStep[];
      readonly humanMoves: number;
      /** Đã phát lại độc lập từ đầu và cho cùng kết quả thắng. */
      readonly verified: true;
      readonly coverage: SearchCoverage;
    }
  | {
      /** Không tìm thấy đường thắng; KHÔNG có nghĩa là tầng bất khả thi. */
      readonly status: "unresolved";
      readonly reason: UnresolvedReason;
      readonly coverage: SearchCoverage;
    };

type Verdict = "won" | "lost" | "ongoing";

function evaluate(state: BattleState, win: WinCriteria, moves: number): Verdict {
  if (state.winner === 1) return "lost";
  const foes = state.sides[1].fighters;
  const allDown = foes.every((f) => f.hp <= 0);
  const leaderDown = (foes[state.sides[1].leader]?.hp ?? 1) <= 0;
  switch (win.kind) {
    case "defeatAll":
      if (allDown) return "won";
      return state.winner === 0 ? "lost" : "ongoing";
    case "defeatLeader":
      return leaderDown || state.winner === 0 ? "won" : "ongoing";
    case "surviveTurns":
      return state.winner === 0 || moves >= win.turns ? "won" : "ongoing";
  }
}

function settleToHuman(state: BattleState, d: Difficulty): BattleState {
  let s = state;
  for (let guard = 0; guard < 50 && s.winner === null && s.turn.side === 1; guard++)
    s = playAiTurn(s, d).state;
  return s;
}

function startState(setup: PuzzleSetup): BattleState {
  const { state } = createBattle({
    sides: [setup.sides[0], setup.sides[1]],
    seed: setup.seed,
    timer: false,
    firstSide: setup.firstSide ?? 0,
    ...(setup.weights ? { weights: setup.weights } : {}),
  });
  return settleToHuman(state, setup.difficulty);
}

function validSetup(s: PuzzleSetup): boolean {
  return (
    Number.isInteger(s.turnLimit) &&
    s.turnLimit >= 1 &&
    Number.isInteger(s.seed) &&
    s.sides.every((x) => x.fighters.length >= 1) &&
    !(
      s.win.kind === "surviveTurns" &&
      (!Number.isInteger(s.win.turns) || s.win.turns < 1 || s.win.turns > s.turnLimit)
    )
  );
}

const hpOf = (fs: readonly { hp: number; maxHp: number }[]) =>
  fs.reduce((a, f) => a + f.hp, 0) / fs.reduce((a, f) => a + f.maxHp, 0);

/** Điểm càng thấp càng tốt: máu đối thủ còn lại, trừ chút cho máu mình. */
const score = (s: BattleState) => hpOf(s.sides[1].fighters) * 100 - hpOf(s.sides[0].fighters) * 20;

const stateKey = (s: BattleState) =>
  JSON.stringify([
    s.sides.map((x) => x.fighters.map((f) => [f.hp, f.energy, f.effects.length])),
    s.board.cells,
    s.boardRng,
    s.aiRng,
    s.turn.actor,
    s.turn.lastActor,
  ]);

interface Node {
  readonly state: BattleState;
  readonly path: readonly PuzzleStep[];
  readonly moves: number;
}

/** Phát lại một đường đi từ đầu (kể cả phản ứng của AI) và trả phán quyết cuối. */
export function replayPath(setup: PuzzleSetup, path: readonly PuzzleStep[]): Verdict {
  let s = startState(setup);
  let moves = 0;
  for (const step of path) {
    for (const a of step) {
      const r = act(s, a);
      if (!r.ok) return "lost";
      s = r.state;
    }
    moves++;
    s = settleToHuman(s, setup.difficulty);
    const v = evaluate(s, setup.win, moves);
    if (v !== "ongoing") return moves <= setup.turnLimit ? v : "lost";
  }
  return "ongoing";
}

/**
 * Tìm kiếm beam tất định theo độ sâu. Trả `win_found` kèm đường đã phát lại xác nhận, hoặc `unresolved`.
 * Không bao giờ kết luận "bất khả thi": chỉ duyệt nước đi (người × đổi ô, kỹ năng theo heuristic của AI).
 */
export function searchPuzzle(setup: PuzzleSetup, budget: SearchBudget = {}): PuzzleResult {
  const maxNodes = Math.max(1, budget.maxNodes ?? DEFAULT_MAX_NODES);
  const beamWidth = Math.max(1, budget.beamWidth ?? DEFAULT_BEAM_WIDTH);
  let nodes = 0;
  let maxDepth = 0;
  let pruned = 0;
  let deduped = 0;
  let budgetExhausted = false;
  const coverage = (): SearchCoverage => ({
    nodes,
    maxDepth,
    beamWidth,
    maxNodes,
    pruned,
    deduped,
    budgetExhausted,
    actionModel: "actor×swap+heuristic-skill",
  });
  if (!validSetup(setup))
    return { status: "unresolved", reason: "invalid_setup", coverage: coverage() };

  const root = startState(setup);
  let layer: Node[] = [{ state: root, path: [], moves: 0 }];
  if (evaluate(root, setup.win, 0) === "won")
    return { status: "win_found", path: [], humanMoves: 0, verified: true, coverage: coverage() };

  for (let depth = 1; depth <= setup.turnLimit && layer.length > 0; depth++) {
    const next: Node[] = [];
    const seen = new Set<string>();
    for (const node of layer) {
      const s0 = node.state;
      for (const actor of selectableActors(s0)) {
        let base = s0;
        const pre: BattleAction[] = [];
        if (actor !== s0.turn.actor) {
          const r = act(s0, { type: "selectActor", fighter: actor });
          if (!r.ok) continue;
          base = r.state;
          pre.push({ type: "selectActor", fighter: actor });
        }
        const variants: { s: BattleState; pre: BattleAction[] }[] = [{ s: base, pre }];
        const skill = chooseSkill(toView(base));
        if (skill) {
          const r = act(base, skill);
          if (r.ok) variants.push({ s: r.state, pre: [...pre, skill] });
        }
        for (const v of variants) {
          if (v.s.winner !== null) continue;
          for (const mv of findValidMoves(v.s.board)) {
            if (nodes >= maxNodes) {
              budgetExhausted = true;
              break;
            }
            const swap: BattleAction = { type: "swap", from: mv.from, to: mv.to };
            const r = act(v.s, swap);
            nodes++;
            if (!r.ok) continue;
            const state = settleToHuman(r.state, setup.difficulty);
            const moves = node.moves + 1;
            const path = [...node.path, [...v.pre, swap]];
            maxDepth = Math.max(maxDepth, depth);
            const verdict = evaluate(state, setup.win, moves);
            if (verdict === "won") {
              const ok = replayPath(setup, path) === "won";
              return ok
                ? { status: "win_found", path, humanMoves: moves, verified: true, coverage: coverage() }
                : { status: "unresolved", reason: "replay_mismatch", coverage: coverage() };
            }
            if (verdict === "lost" || state.winner !== null) continue;
            const key = stateKey(state);
            if (seen.has(key)) {
              deduped++;
              continue;
            }
            seen.add(key);
            next.push({ state, path, moves });
          }
          if (budgetExhausted) break;
        }
        if (budgetExhausted) break;
      }
      if (budgetExhausted) break;
    }
    if (budgetExhausted) break;
    next.sort(
      (a, b) =>
        score(a.state) - score(b.state) ||
        JSON.stringify(a.path).localeCompare(JSON.stringify(b.path)),
    );
    pruned += Math.max(0, next.length - beamWidth);
    layer = next.slice(0, beamWidth);
  }
  const reason: UnresolvedReason = budgetExhausted
    ? "budget_exhausted"
    : pruned > 0
      ? "beam_pruned"
      : "explored_restricted_model";
  return { status: "unresolved", reason, coverage: coverage() };
}

/* ───────────── 3. Phân tích một tầng Trial ───────────── */

export type StageStatus =
  | "rules_invalid"
  | "no_lineup"
  | "win_path_found"
  | "no_win_path_detected";

export interface LineupAttempt {
  readonly ids: readonly string[];
  readonly result: PuzzleResult;
}

export interface StageReport {
  readonly floorId: string;
  readonly status: StageStatus;
  readonly feasibility: FeasibilityReport;
  readonly attempts: readonly LineupAttempt[];
  readonly winningLineup?: Lineup;
  readonly path?: readonly PuzzleStep[];
  /** Luôn có: kết quả là chứng cứ heuristic, không phải chứng minh. */
  readonly disclaimer: string;
}

export interface StageOptions extends SearchBudget {
  /** Số đội hợp lệ tối đa đem đi tìm đường thắng. */
  readonly maxLineups?: number;
}

const DISCLAIMER =
  "Tìm kiếm có giới hạn theo mô hình hành động hẹp: 'no_win_path_detected' không chứng minh tầng bất khả thi, " +
  "'win_path_found' chỉ chứng minh có một đường thắng với đội/seed đã thử.";

/** Chủ sở hữu tướng kèm của hồ sơ, dạng LineupMember (hệ/nghề lấy từ cấu hình thực tế trong trận). */
export function profileCandidates(profile: Profile): readonly LineupMember[] {
  const ids = [...STARTER_COMPANIONS.map((c) => c.id), ...SHOP_COMPANIONS.map((c) => c.fighter.id)].filter(
    (id, i, a) => a.indexOf(id) === i && id !== MAIN_ID && ownsCompanion(profile, id),
  );
  const cfg: readonly FighterConfig[] = profileTeam(profile, ids);
  return cfg.slice(1).map((f) => ({ id: f.id, element: f.element, profession: f.profession }));
}

/**
 * Với một tầng Trial và hồ sơ: (1) luật có tự khóa không, (2) có đội hợp lệ nào không,
 * (3) thử tìm đường thắng cho vài đội đầu tiên. Dựng đội qua `prepareTowerLineup` như server thật.
 */
export function analyzeTrialFloor(
  spec: TrialFloorSpec,
  profile: Profile,
  options: StageOptions = {},
): StageReport {
  const feasibility = analyzeFeasibility(spec.rules, profileCandidates(profile));
  const base = { floorId: spec.id, feasibility, disclaimer: DISCLAIMER };
  if (feasibility.status === "rules_invalid")
    return { ...base, status: "rules_invalid", attempts: [] };
  if (feasibility.status === "no_lineup")
    return { ...base, status: "no_lineup", attempts: [] };

  const resolved = resolveFloor(toFloorDefinition(spec), "trial", trialEnemyBuilder(spec));
  if (!resolved.ok) return { ...base, status: "rules_invalid", attempts: [] };
  const floor = resolved.floor;

  const maxLineups = Math.max(1, options.maxLineups ?? 3);
  const attempts: LineupAttempt[] = [];
  for (const lineup of feasibility.samples.slice(0, maxLineups)) {
    const [leader, a, b] = lineup.members;
    const prepared = prepareTowerLineup(
      profile,
      {
        mode: "trial",
        companions: [a.id, b.id],
        leaderBuild: { element: leader.element as Element, profession: leader.profession as Profession },
      },
      spec.rules,
    );
    if (!prepared.ok) continue;
    const result = searchPuzzle(
      {
        sides: [prepared.lineup.side, { fighters: floor.foes, leader: 0 }],
        seed: spec.board.publicSeed,
        firstSide: 0,
        weights: floor.weights,
        difficulty: floor.difficulty,
        win: spec.win,
        turnLimit: spec.turnLimit,
      },
      options,
    );
    attempts.push({ ids: prepared.lineup.ids, result });
    if (result.status === "win_found")
      return { ...base, status: "win_path_found", attempts, winningLineup: lineup, path: result.path };
  }
  return { ...base, status: "no_win_path_detected", attempts };
}

