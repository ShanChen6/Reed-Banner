// Bảng xếp hạng trên server: ghi điểm từng bảng sau mỗi lần cộng thưởng, đọc top và hạng của mình.
// Điểm tính ở @/core (boardScores).

import { boardScores, type BoardId, type Profile } from "@/core";

export interface BoardEntry {
  readonly ownerId: string;
  readonly score: number;
  readonly updatedAt: number;
  /** Tên tài khoản đã đăng nhập; khách là null. */
  readonly name: string | null;
}

export interface LeaderboardStore {
  /** Ghi điểm hiện tại của người chơi trên các bảng; điểm không đổi thì giữ nguyên mốc thời gian. */
  submit(
    ownerId: string,
    scores: readonly { board: BoardId; score: number }[],
    now: number,
  ): Promise<void>;
  /** Điểm cao trước, bằng điểm thì ai đạt trước đứng trên. */
  top(board: BoardId, limit: number): Promise<BoardEntry[]>;
  /** Hạng và điểm của một người; null khi chưa có trên bảng. */
  rankOf(
    board: BoardId,
    ownerId: string,
  ): Promise<{ rank: number; score: number } | null>;
}

const above = (a: BoardEntry, b: BoardEntry) =>
  b.score - a.score || a.updatedAt - b.updatedAt;

export class MemoryLeaderboardStore implements LeaderboardStore {
  private readonly rows = new Map<string, BoardEntry & { board: BoardId }>();

  async submit(
    ownerId: string,
    scores: readonly { board: BoardId; score: number }[],
    now: number,
  ): Promise<void> {
    for (const { board, score } of scores) {
      const k = `${board}|${ownerId}`;
      if (this.rows.get(k)?.score === score) continue;
      this.rows.set(k, { board, ownerId, score, updatedAt: now, name: null });
    }
  }

  async top(board: BoardId, limit: number): Promise<BoardEntry[]> {
    return [...this.rows.values()]
      .filter((r) => r.board === board)
      .sort(above)
      .slice(0, limit);
  }

  async rankOf(
    board: BoardId,
    ownerId: string,
  ): Promise<{ rank: number; score: number } | null> {
    const mine = this.rows.get(`${board}|${ownerId}`);
    if (!mine) return null;
    const rank =
      1 +
      [...this.rows.values()].filter(
        (r) => r.board === board && above(r, mine) < 0,
      ).length;
    return { rank, score: mine.score };
  }
}

/** Ghi điểm của hồ sơ lên mọi bảng nó tham gia. Lỗi chỉ ghi log: bảng xếp hạng không được làm hỏng cộng thưởng. */
export async function submitProfile(
  store: LeaderboardStore | undefined,
  ownerId: string,
  profile: Profile,
  now: number,
) {
  if (!store) return;
  try {
    await store.submit(ownerId, boardScores(profile), now);
  } catch (e) {
    console.error("Không ghi được bảng xếp hạng", ownerId, e);
  }
}

export const LEADERBOARD_SIZE = 50;

export interface BoardView {
  readonly board: BoardId;
  readonly top: readonly {
    rank: number;
    name: string;
    mine: boolean;
    score: number;
  }[];
  readonly mine: { rank: number; score: number } | null;
}

export async function boardView(
  store: LeaderboardStore,
  board: BoardId,
  ownerId: string | null,
): Promise<BoardView> {
  const [top, mine] = await Promise.all([
    store.top(board, LEADERBOARD_SIZE),
    ownerId ? store.rankOf(board, ownerId) : null,
  ]);
  return {
    board,
    top: top.map((e, i) => ({
      rank: i + 1,
      // Khách chưa đăng nhập không có tên: hiện 4 ký tự cuối của id để phân biệt.
      name: e.name ?? `Khách ${e.ownerId.slice(-4)}`,
      mine: e.ownerId === ownerId,
      score: e.score,
    })),
    mine,
  };
}
