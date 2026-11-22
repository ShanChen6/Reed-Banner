// Ván Tam Quân Kỳ do server làm trọng tài (Shan chốt 23/11/2026): đấu sứ quân có thưởng và đấu online giữa hai tài khoản.
// Thuần logic: server lưu `TqkMatch`, mỗi lệnh của người chơi đi qua đây để kiểm luật, trừ đồng hồ và xử thắng thua.
// Thời gian truyền từ ngoài vào (`now`, ms), không đọc đồng hồ máy.

import { AREA, BLUE, RED, endGame, isLegal, newGame, play, type Color, type Move, type Position } from "./logic";
import type { Level } from "./ai";

export type TqkMatchMode = "ai" | "online";
export type TqkEndReason = "resign" | "timeout";
export type TqkMatchError = "ended" | "notYourTurn" | "illegal" | "waiting";

export interface TqkMatch {
  readonly mode: TqkMatchMode;
  /** Đấu sứ quân: độ khó của máy. Online: null. */
  readonly level: Level | null;
  /** Sứ quân đối địch (id nhân vật), quyết định tên và chân dung bên Xanh. */
  readonly rival: string;
  /** Đấu sứ quân: phe người chơi cầm. Online: Đỏ là chủ phòng, Xanh là người vào bằng mã. */
  readonly human: Color;
  /** Đồng hồ mỗi bên (ms); 0 là không giới hạn. */
  readonly clockMs: number;
  readonly moves: readonly Move[];
  /** Thời gian còn lại mỗi bên (ms), tính tới đầu lượt hiện tại. */
  readonly timeLeft: Readonly<Record<Color, number>>;
  /** Lúc lượt hiện tại bắt đầu (ms); null khi chưa bắt đầu (phòng online chờ người vào). */
  readonly turnStartedAt: number | null;
  /** Kết thúc ngoài bàn cờ (đầu hàng, hết giờ); chiếu bí, chiếm soái trướng, hòa tính từ nước đi. */
  readonly ended: { readonly loser: Color; readonly reason: TqkEndReason } | null;
}

export type TqkMatchResult = { readonly ok: true; readonly match: TqkMatch } | { readonly ok: false; readonly error: TqkMatchError };

/** Mốc đồng hồ được chọn khi đấu online (phút). Online bắt buộc có đồng hồ để không ai giữ ván mãi. */
export const TQK_ONLINE_CLOCKS = [10, 15, 30] as const;

export function newTqkMatch(opts: {
  readonly mode: TqkMatchMode;
  readonly level: Level | null;
  readonly rival: string;
  readonly human: Color;
  readonly clockMs: number;
  readonly startedAt: number | null;
}): TqkMatch {
  return {
    mode: opts.mode,
    level: opts.level,
    rival: opts.rival,
    human: opts.human,
    clockMs: opts.clockMs,
    moves: [],
    timeLeft: { r: opts.clockMs, b: opts.clockMs },
    turnStartedAt: opts.startedAt,
    ended: null,
  };
}

/** Thế cờ hiện tại, kể cả kết thúc ngoài bàn cờ. */
export function tqkPosition(m: TqkMatch): Position {
  let pos = newGame();
  for (const move of m.moves) pos = play(pos, move);
  return m.ended ? endGame(pos, m.ended.loser, m.ended.reason) : pos;
}

/** Thời gian còn lại của bên đang tới lượt tại `now` (bên kia giữ nguyên). */
export function tqkTimeLeft(m: TqkMatch, pos: Position, now: number): Record<Color, number> {
  const left = { ...m.timeLeft };
  if (m.clockMs > 0 && m.turnStartedAt !== null && !pos.result) left[pos.toMove] = Math.max(0, left[pos.toMove] - (now - m.turnStartedAt));
  return left;
}

/** Xử hết giờ: bên tới lượt cạn đồng hồ thì thua. Không đổi gì thì trả lại đúng ván cũ. */
export function tqkSettle(m: TqkMatch, now: number): TqkMatch {
  if (m.clockMs <= 0 || m.turnStartedAt === null) return m;
  const pos = tqkPosition(m);
  if (pos.result) return m;
  const left = tqkTimeLeft(m, pos, now);
  if (left[pos.toMove] > 0) return m;
  return { ...m, timeLeft: left, ended: { loser: pos.toMove, reason: "timeout" } };
}

/** Một nước đi của phe `color`: kiểm lượt, luật và đồng hồ. */
export function tqkPlay(m: TqkMatch, color: Color, move: Move, now: number): TqkMatchResult {
  if (m.turnStartedAt === null) return { ok: false, error: "waiting" };
  const settled = tqkSettle(m, now);
  const pos = tqkPosition(settled);
  if (pos.result) return { ok: false, error: "ended" };
  if (pos.toMove !== color) return { ok: false, error: "notYourTurn" };
  const clean: Move = { from: move.from, to: move.to, unit: move.unit, kind: move.kind };
  if (!isLegal(pos, clean)) return { ok: false, error: "illegal" };
  return { ok: true, match: { ...settled, moves: [...settled.moves, clean], timeLeft: tqkTimeLeft(settled, pos, now), turnStartedAt: now } };
}

/** Phe `color` đầu hàng. */
export function tqkResign(m: TqkMatch, color: Color, now: number): TqkMatchResult {
  const settled = tqkSettle(m, now);
  if (tqkPosition(settled).result) return { ok: false, error: "ended" };
  return { ok: true, match: { ...settled, ended: { loser: color, reason: "resign" } } };
}

/** Kiểm dữ liệu nước đi gửi lên (JSON lạ thì null). */
export function parseTqkMove(v: unknown): Move | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const sq = (x: unknown) => typeof x === "number" && Number.isInteger(x) && x >= 0 && x < AREA;
  const unitOk = o.unit === "stack" || (typeof o.unit === "number" && Number.isInteger(o.unit) && o.unit >= 0 && o.unit < 4);
  const kinds = ["move", "join", "capture", "fire", "strike"];
  if (!sq(o.from) || !sq(o.to) || !unitOk || typeof o.kind !== "string" || !kinds.includes(o.kind)) return null;
  return { from: o.from as number, to: o.to as number, unit: o.unit as Move["unit"], kind: o.kind as Move["kind"] };
}

/** Phe máy khi đấu sứ quân; online thì null. */
export const tqkMachine = (m: TqkMatch): Color | null => (m.mode === "ai" ? (m.human === RED ? BLUE : RED) : null);
