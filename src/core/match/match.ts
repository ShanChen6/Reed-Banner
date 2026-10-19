// Trận online do server có thẩm quyền: nhận ý định của người chơi, chạy bù lượt hết giờ kiểu "tính lười",
// cho AI đánh, xử thua trận bỏ dở và ẩn mọi luồng ngẫu nhiên khỏi client.
// Xem docs/tech/ha-tang.md mục 2. Thuần, không đọc giờ hệ thống: `now` luôn do server truyền vào.

import { playAiTurn, type Difficulty } from "../ai";
import {
  act,
  createBattle,
  GRACE_MS,
  type BattleAction,
  type BattleError,
  type BattleEvent,
  type BattleState,
  type SideConfig,
  type SideIndex,
} from "../battle";

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
}

export interface MatchConfig {
  readonly sides: readonly [SideConfig, SideConfig];
  readonly difficulty: Difficulty;
  readonly seed: number;
  readonly firstSide: SideIndex;
  readonly now: number;
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
  });
  const match: Match = {
    battle: state,
    difficulty: config.difficulty,
    seq: 0,
    startedAt: config.now,
    lastHumanAt: config.now,
    forfeited: false,
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

function runAi(m: Match, at: number, difficulty: Difficulty): MatchStep {
  if (m.battle.winner !== null || m.battle.turn.side !== AI_SIDE) return { match: m, events: [] };
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
  if (m.battle.winner === null && now - m.lastHumanAt > ABANDON_MS) {
    const battle = structuredClone(m.battle);
    battle.winner = AI_SIDE;
    battle.turn.deadline = null;
    return { match: { ...m, battle, seq: m.seq + 1, forfeited: true }, events };
  }
  for (let turns = 0; turns < MAX_CATCH_UP_TURNS && m.battle.winner === null; turns++) {
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
  return { match: m, events };
}

export type MatchError = BattleError | "staleSeq" | "notYourTurn";

export type MatchResult =
  | ({ readonly ok: true } & MatchStep)
  | { readonly ok: false; readonly error: MatchError; readonly match: Match; readonly events: readonly BattleEvent[] };

/**
 * Một hành động của người chơi. Trước khi xử lý, trận được chạy bù tới `now`; `expectedSeq` (seq client
 * đang thấy) khác seq sau khi chạy bù thì từ chối. Nếu lượt chuyển sang AI, AI đánh luôn.
 * Khi lỗi, `match` vẫn là trạng thái đã chạy bù để server lưu lại.
 */
export function humanAct(start: Match, action: BattleAction, expectedSeq: number, now: number): MatchResult {
  const settled = settle(start, now);
  const fail = (error: MatchError): MatchResult => ({ ok: false, error, match: settled.match, events: settled.events });
  // Seq khác: client gửi lặp, hoặc vừa chạy bù hết giờ nên nước đi nhắm vào bàn cờ cũ.
  if (expectedSeq !== settled.match.seq) return fail("staleSeq");
  const m = settled.match;
  if (m.battle.winner !== null) return fail("battleOver");
  if (m.battle.turn.side !== HUMAN) return fail("notYourTurn");
  const r = act(m.battle, action, now);
  if (!r.ok) return fail(r.error);
  const next: Match = { ...m, battle: r.state, seq: m.seq + 1, lastHumanAt: now };
  const ai = runAi(next, now, m.difficulty);
  return { ok: true, match: ai.match, events: [...settled.events, ...r.events, ...ai.events] };
}

/** Trạng thái gửi cho client: bỏ luồng ngẫu nhiên của bàn cờ và của AI. */
export type PlayerView = Omit<BattleState, "boardRng" | "aiRng">;

export interface MatchView {
  readonly battle: PlayerView;
  readonly difficulty: Difficulty;
  readonly seq: number;
  readonly forfeited: boolean;
}

export function viewOf(m: Match): MatchView {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { boardRng, aiRng, ...battle } = m.battle;
  return { battle, difficulty: m.difficulty, seq: m.seq, forfeited: m.forfeited };
}
