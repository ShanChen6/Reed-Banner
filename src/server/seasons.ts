// Điểm mùa theo tuần của Trấn Ải và Quần Hùng (@/core progress/season). Server ghi khi một lượt chơi hoặc trận kết thúc;
// bảng mùa chỉ gồm người có điểm dương. Bằng điểm thì ai đạt điểm đó trước (updatedAt nhỏ hơn) đứng trên.

import { seasonKey, type SeasonMode } from "@/core";

export interface SeasonEntry {
  readonly mode: SeasonMode;
  readonly season: string;
  readonly ownerId: string;
  readonly score: number;
  readonly updatedAt: number;
  /** Tên tài khoản đã đăng nhập; khách là null. */
  readonly name: string | null;
}

export interface SeasonStore {
  /** Giữ điểm cao nhất của người này trong mùa (Trấn Ải: số đợt cao nhất của một lượt chơi). */
  best(mode: SeasonMode, season: string, ownerId: string, score: number, now: number): Promise<void>;
  /** Cộng dồn vào điểm mùa, có thể âm (Quần Hùng: điểm nhận được từ các trận mình đánh). */
  add(mode: SeasonMode, season: string, ownerId: string, delta: number, now: number): Promise<void>;
  /** Người có điểm dương, điểm cao trước. */
  top(mode: SeasonMode, season: string, limit: number): Promise<SeasonEntry[]>;
  /** Hạng và điểm; null khi chưa có điểm dương. */
  rankOf(mode: SeasonMode, season: string, ownerId: string): Promise<{ rank: number; score: number } | null>;
  /** Số người có tên trên bảng mùa (điểm dương). */
  count(mode: SeasonMode, season: string): Promise<number>;
}

const above = (a: { score: number; updatedAt: number }, b: { score: number; updatedAt: number }) => b.score - a.score || a.updatedAt - b.updatedAt;

export class MemorySeasonStore implements SeasonStore {
  private readonly rows = new Map<string, SeasonEntry>();
  private readonly key = (m: string, s: string, o: string) => `${m}|${s}|${o}`;

  async best(mode: SeasonMode, season: string, ownerId: string, score: number, now: number): Promise<void> {
    const k = this.key(mode, season, ownerId);
    const cur = this.rows.get(k);
    if (cur && cur.score >= score) return;
    this.rows.set(k, { mode, season, ownerId, score, updatedAt: now, name: null });
  }

  async add(mode: SeasonMode, season: string, ownerId: string, delta: number, now: number): Promise<void> {
    if (delta === 0) return;
    const k = this.key(mode, season, ownerId);
    const cur = this.rows.get(k);
    this.rows.set(k, { mode, season, ownerId, score: (cur?.score ?? 0) + delta, updatedAt: now, name: null });
  }

  private ranked(mode: SeasonMode, season: string): SeasonEntry[] {
    return [...this.rows.values()].filter((r) => r.mode === mode && r.season === season && r.score > 0).sort(above);
  }

  async top(mode: SeasonMode, season: string, limit: number): Promise<SeasonEntry[]> {
    return this.ranked(mode, season).slice(0, limit);
  }

  async rankOf(mode: SeasonMode, season: string, ownerId: string): Promise<{ rank: number; score: number } | null> {
    const list = this.ranked(mode, season);
    const i = list.findIndex((r) => r.ownerId === ownerId);
    return i < 0 ? null : { rank: i + 1, score: list[i]!.score };
  }

  async count(mode: SeasonMode, season: string): Promise<number> {
    return this.ranked(mode, season).length;
  }
}

/** Ghi điểm mùa, lỗi chỉ ghi log: bảng mùa không được làm hỏng cộng thưởng cuối trận. */
export async function recordSeason(
  store: SeasonStore | undefined,
  change: { mode: SeasonMode; ownerId: string; now: number } & ({ best: number } | { add: number }),
): Promise<void> {
  if (!store) return;
  try {
    const season = seasonKey(change.now);
    if ("best" in change) await store.best(change.mode, season, change.ownerId, change.best, change.now);
    else await store.add(change.mode, season, change.ownerId, change.add, change.now);
  } catch (e) {
    console.error("Không ghi được điểm mùa", change.mode, change.ownerId, e);
  }
}

export const SEASON_BOARD_SIZE = 50;

export interface SeasonBoardView {
  readonly board: SeasonMode;
  readonly season: string;
  readonly top: readonly { rank: number; name: string; mine: boolean; score: number }[];
  readonly mine: { rank: number; score: number } | null;
}

export async function seasonBoardView(store: SeasonStore, mode: SeasonMode, season: string, ownerId: string | null): Promise<SeasonBoardView> {
  const [top, mine] = await Promise.all([store.top(mode, season, SEASON_BOARD_SIZE), ownerId ? store.rankOf(mode, season, ownerId) : null]);
  return {
    board: mode,
    season,
    top: top.map((e, i) => ({ rank: i + 1, name: e.name ?? `Khách ${e.ownerId.slice(-4)}`, mine: e.ownerId === ownerId, score: e.score })),
    mine,
  };
}
