// Thử thách hằng ngày trên server: seed của ngày (bí mật, ai cũng như nhau), lượt đánh mỗi người mỗi ngày,
// bảng xếp hạng. Luật đề và cách tính điểm ở @/core (daily).

import { createHmac } from "node:crypto";
import type { DailyScore } from "@/core";

/** Seed của ngày: HMAC theo khóa bí mật của server, nên không đoán trước được đề ngày mai. */
export function dailySeed(secret: string, day: string): number {
  return createHmac("sha256", secret).update(`daily:${day}`).digest().readUInt32BE(0);
}

export interface DailyEntry {
  readonly day: string;
  readonly ownerId: string;
  readonly matchId: string;
  readonly startedAt: number;
  /** Chỉ có khi trận đã kết thúc. */
  readonly result: (DailyScore & { readonly finishedAt: number }) | null;
  /** Tên hiển thị trên bảng xếp hạng (tài khoản đã đăng nhập); khách là null. */
  readonly name: string | null;
}

export interface DailyStore {
  /** Ghi lượt đánh của ngày; false khi người này đã có lượt trong ngày. */
  start(day: string, ownerId: string, matchId: string, now: number): Promise<boolean>;
  get(day: string, ownerId: string): Promise<DailyEntry | null>;
  /** Ghi kết quả khi trận kết thúc (chỉ lần đầu). */
  finish(day: string, ownerId: string, score: DailyScore, now: number): Promise<void>;
  /** Các lượt đã xong, điểm cao trước, bằng điểm thì ai xong trước đứng trên. */
  top(day: string, limit: number): Promise<DailyEntry[]>;
  /** Hạng của một lượt đã xong: 1 + số lượt xếp trên. */
  rankOf(day: string, ownerId: string): Promise<number | null>;
  /** Số lượt đã xong trong ngày (mọi người có tên trên bảng). */
  countFinished(day: string): Promise<number>;
}

const before = (a: DailyEntry, b: DailyEntry) =>
  b.result!.score - a.result!.score || a.result!.finishedAt - b.result!.finishedAt;

export class MemoryDailyStore implements DailyStore {
  private readonly rows = new Map<string, DailyEntry>();
  private readonly key = (day: string, ownerId: string) => `${day}|${ownerId}`;

  async start(day: string, ownerId: string, matchId: string, now: number): Promise<boolean> {
    const k = this.key(day, ownerId);
    if (this.rows.has(k)) return false;
    this.rows.set(k, { day, ownerId, matchId, startedAt: now, result: null, name: null });
    return true;
  }

  async get(day: string, ownerId: string): Promise<DailyEntry | null> {
    return this.rows.get(this.key(day, ownerId)) ?? null;
  }

  async finish(day: string, ownerId: string, score: DailyScore, now: number): Promise<void> {
    const k = this.key(day, ownerId);
    const r = this.rows.get(k);
    if (r && !r.result) this.rows.set(k, { ...r, result: { ...score, finishedAt: now } });
  }

  async top(day: string, limit: number): Promise<DailyEntry[]> {
    return [...this.rows.values()].filter((r) => r.day === day && r.result).sort(before).slice(0, limit);
  }

  async countFinished(day: string): Promise<number> {
    return [...this.rows.values()].filter((r) => r.day === day && r.result).length;
  }

  async rankOf(day: string, ownerId: string): Promise<number | null> {
    const mine = this.rows.get(this.key(day, ownerId));
    if (!mine?.result) return null;
    return 1 + [...this.rows.values()].filter((r) => r.day === day && r.result && before(r, mine) < 0).length;
  }
}

/** Một dòng bảng xếp hạng gửi cho client: không lộ id người chơi. */
export interface BoardRow {
  readonly rank: number;
  readonly name: string;
  readonly mine: boolean;
  readonly score: DailyScore;
}

export interface DailyBoard {
  readonly day: string;
  /** Lượt của người đang xem: chưa đánh (null), đang đánh (result null) hoặc đã xong (kèm hạng). */
  readonly mine: { readonly matchId: string; readonly result: DailyScore | null; readonly rank: number | null } | null;
  readonly top: readonly BoardRow[];
}

export const BOARD_SIZE = 20;

/** Bảng xếp hạng của ngày `day` và lượt của `ownerId` (null khi chưa có cookie). */
export async function dailyBoard(store: DailyStore, day: string, ownerId: string | null): Promise<DailyBoard> {
  const [top, entry] = await Promise.all([store.top(day, BOARD_SIZE), ownerId ? store.get(day, ownerId) : null]);
  const rank = entry?.result && ownerId ? await store.rankOf(day, ownerId) : null;
  return {
    day,
    mine: entry ? { matchId: entry.matchId, result: entry.result, rank } : null,
    top: top.map((e, i) => ({
      rank: i + 1,
      // Khách chưa đăng nhập không có tên: hiện 4 ký tự cuối của id để phân biệt.
      name: e.name ?? `Khách ${e.ownerId.slice(-4)}`,
      mine: e.ownerId === ownerId,
      score: e.result!,
    })),
  };
}
