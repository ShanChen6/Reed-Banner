// Ván cờ vây đấu người do server làm trọng tài (mã phòng, giao hữu). Thuần logic: server lưu `GoMatch`, mỗi lệnh của người
// chơi đi qua đây để kiểm luật, trừ đồng hồ và xử thắng thua. Thời gian truyền từ ngoài vào (`now`, ms).
// Hai bên cùng bỏ lượt thì server tự đoán quân chết (guessDead, seed cố định theo ván) rồi đếm điểm, không có bước thỏa thuận.

import { ELEMENTS, type Element } from "../battle/elements";
import { guessDead } from "./ai";
import { BLACK, BOARD_SIZES, KOMI, PASS, WHITE, isLegal, isOver, newGame, opponent, playInPlace, scoreArea, type BoardSize, type Color, type Mode, type Position } from "./logic";

export type GoEndReason = "score" | "capture" | "resign" | "timeout";

export interface GoResult {
  readonly winner: Color;
  readonly reason: GoEndReason;
  /** Đếm điểm: điểm hai bên (Trắng đã cộng komi) và quân chết đã bỏ ra. */
  readonly score?: { readonly black: number; readonly white: number; readonly dead: readonly number[] };
}

export interface GoMatch {
  readonly size: BoardSize;
  readonly mode: Mode;
  /** Nguyên tố của Đen (đi trước) và Trắng: chỉ đổi hình quân và nền bàn. */
  readonly elements: Readonly<Record<Color, Element>>;
  /** Đồng hồ mỗi bên (ms). */
  readonly clockMs: number;
  /** Các nước đã đi: điểm trên bàn hoặc PASS (-1). */
  readonly moves: readonly number[];
  /** Thời gian còn lại mỗi bên tính tới đầu lượt hiện tại. */
  readonly timeLeft: Readonly<Record<Color, number>>;
  /** Lúc lượt hiện tại bắt đầu; null khi phòng còn chờ người vào. */
  readonly turnStartedAt: number | null;
  readonly result: GoResult | null;
}

export type GoMatchError = "ended" | "notYourTurn" | "illegal" | "waiting";
export type GoMatchResult = { readonly ok: true; readonly match: GoMatch } | { readonly ok: false; readonly error: GoMatchError };

/** Đồng hồ mỗi bên khi đấu người (phút). Bắt buộc có đồng hồ để không ai giữ ván mãi. */
export const GO_ONLINE_CLOCKS = [10, 20, 30] as const;

export const isElement = (v: unknown): v is Element => typeof v === "string" && (ELEMENTS as readonly string[]).includes(v);
export const isBoardSize = (v: unknown): v is BoardSize => typeof v === "number" && (BOARD_SIZES as number[]).includes(v);

export function newGoMatch(opts: { size: BoardSize; mode: Mode; elements: Record<Color, Element>; clockMs: number; startedAt: number | null }): GoMatch {
  return {
    size: opts.size,
    mode: opts.mode,
    elements: opts.elements,
    clockMs: opts.clockMs,
    moves: [],
    timeLeft: { [BLACK]: opts.clockMs, [WHITE]: opts.clockMs } as Record<Color, number>,
    turnStartedAt: opts.startedAt,
    result: null,
  };
}

/** Thế cờ sau các nước đã đi. */
export function goPosition(m: GoMatch): Position {
  const pos = newGame(m.size, m.mode);
  for (const move of m.moves) if (playInPlace(pos, move) < 0) break;
  return pos;
}

export const goToMove = (m: GoMatch): Color => (m.moves.length % 2 === 0 ? BLACK : WHITE);

/** Thời gian còn lại tại `now` (chỉ bên tới lượt bị trừ). */
export function goTimeLeft(m: GoMatch, now: number): Record<Color, number> {
  const left = { [BLACK]: m.timeLeft[BLACK], [WHITE]: m.timeLeft[WHITE] } as Record<Color, number>;
  if (m.clockMs > 0 && m.turnStartedAt !== null && !m.result) {
    const side = goToMove(m);
    left[side] = Math.max(0, left[side] - (now - m.turnStartedAt));
  }
  return left;
}

/** Xử hết giờ. Không đổi gì thì trả lại đúng ván cũ. */
export function goSettle(m: GoMatch, now: number): GoMatch {
  if (m.result || m.clockMs <= 0 || m.turnStartedAt === null) return m;
  const left = goTimeLeft(m, now);
  const side = goToMove(m);
  if (left[side] > 0) return m;
  return { ...m, timeLeft: left, result: { winner: opponent(side), reason: "timeout" } };
}

/** Kết quả khi ván kết thúc trên bàn: bắt quân trước (ván nhập môn) hoặc hai lần bỏ lượt (đếm điểm). */
function boardResult(m: GoMatch, pos: Position): GoResult | null {
  if (!isOver(pos)) return null;
  if (pos.winner) return { winner: pos.winner, reason: "capture" };
  const seed = m.moves.reduce((h, x) => (Math.imul(h, 31) + x + 7) | 0, m.size);
  const dead = guessDead(pos, seed);
  const s = scoreArea(pos.board, pos.size, dead, KOMI);
  return { winner: s.black > s.white ? BLACK : WHITE, reason: "score", score: { black: s.black, white: s.white, dead } };
}

/** Một nước của bên `color`: điểm trên bàn hoặc PASS. */
export function goPlay(m: GoMatch, color: Color, point: number, now: number): GoMatchResult {
  if (m.turnStartedAt === null) return { ok: false, error: "waiting" };
  const settled = goSettle(m, now);
  if (settled.result) return { ok: false, error: "ended" };
  if (goToMove(settled) !== color) return { ok: false, error: "notYourTurn" };
  const pos = goPosition(settled);
  if (!Number.isInteger(point) || !isLegal(pos, point)) return { ok: false, error: "illegal" };
  playInPlace(pos, point);
  const next: GoMatch = { ...settled, moves: [...settled.moves, point], timeLeft: goTimeLeft(settled, now), turnStartedAt: now };
  return { ok: true, match: { ...next, result: boardResult(next, pos) } };
}

export function goResign(m: GoMatch, color: Color, now: number): GoMatchResult {
  const settled = goSettle(m, now);
  if (settled.result) return { ok: false, error: "ended" };
  return { ok: true, match: { ...settled, timeLeft: goTimeLeft(settled, now), result: { winner: opponent(color), reason: "resign" } } };
}

/** Điểm gửi lên: số nguyên trong bàn hoặc PASS; JSON lạ thì null. */
export function parseGoPoint(v: unknown, size: number): number | null {
  if (v === PASS) return PASS;
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v < size * size ? v : null;
}
