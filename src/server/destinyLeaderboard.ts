import type { DestinyCycle } from "./destinyCycle";
import { destinyCycleById } from "./destinyCycle";

export interface DestinyLeaderboardEntry {
  readonly cycleId: string;
  readonly ownerId: string;
  readonly clearedFloor: number;
  readonly totalTurns: number;
  readonly completedAt: number;
  readonly eventId: string;
  readonly name: string | null;
}

export interface DestinyLeaderboardSubmission {
  readonly eventId: string;
  readonly cycleId: string;
  readonly ownerId: string;
  readonly clearedFloor: number;
  readonly totalTurns: number;
  readonly completedAt: number;
}

export interface DestinyLeaderboardStore {
  /** Chỉ thay best của owner trong cycle; duplicate/stale event trả false. */
  submit(value: DestinyLeaderboardSubmission): Promise<boolean>;
  page(cycleId: string, offset: number, limit: number): Promise<readonly DestinyLeaderboardEntry[]>;
  rankOf(cycleId: string, ownerId: string): Promise<{ rank: number; entry: DestinyLeaderboardEntry } | null>;
  /** Số người có tên trên bảng của chu kỳ. */
  count(cycleId: string): Promise<number>;
}

const compare = (a: DestinyLeaderboardEntry, b: DestinyLeaderboardEntry) =>
  b.clearedFloor - a.clearedFloor ||
  a.totalTurns - b.totalTurns ||
  a.completedAt - b.completedAt ||
  a.ownerId.localeCompare(b.ownerId);

const validSubmission = (value: DestinyLeaderboardSubmission) =>
  destinyCycleById(value.cycleId) !== null &&
  typeof value.eventId === "string" && value.eventId.length > 0 && value.eventId.length <= 100 &&
  typeof value.ownerId === "string" && value.ownerId.length > 0 &&
  Number.isInteger(value.clearedFloor) && value.clearedFloor >= 1 && value.clearedFloor <= 1_000 &&
  Number.isInteger(value.totalTurns) && value.totalTurns >= 0 &&
  Number.isSafeInteger(value.completedAt) && value.completedAt >= 0;

const better = (next: DestinyLeaderboardSubmission, current: DestinyLeaderboardEntry) =>
  next.clearedFloor > current.clearedFloor ||
  (next.clearedFloor === current.clearedFloor && next.totalTurns < current.totalTurns) ||
  (next.clearedFloor === current.clearedFloor && next.totalTurns === current.totalTurns &&
    next.completedAt < current.completedAt);

export class MemoryDestinyLeaderboardStore implements DestinyLeaderboardStore {
  private readonly rows = new Map<string, DestinyLeaderboardEntry>();
  private readonly events = new Set<string>();

  async submit(value: DestinyLeaderboardSubmission): Promise<boolean> {
    if (!validSubmission(value) || this.events.has(value.eventId)) return false;
    this.events.add(value.eventId);
    const key = `${value.cycleId}|${value.ownerId}`;
    const current = this.rows.get(key);
    if (current && !better(value, current)) return false;
    this.rows.set(key, { ...value, name: null });
    return true;
  }

  async page(cycleId: string, offset: number, limit: number): Promise<readonly DestinyLeaderboardEntry[]> {
    return [...this.rows.values()].filter((row) => row.cycleId === cycleId)
      .sort(compare).slice(offset, offset + limit);
  }

  async count(cycleId: string): Promise<number> {
    return [...this.rows.values()].filter((row) => row.cycleId === cycleId).length;
  }

  async rankOf(cycleId: string, ownerId: string) {
    const sorted = [...this.rows.values()].filter((row) => row.cycleId === cycleId).sort(compare);
    const index = sorted.findIndex((row) => row.ownerId === ownerId);
    return index < 0 ? null : { rank: index + 1, entry: sorted[index]! };
  }
}

export interface DestinyLeaderboardView {
  readonly cycle: DestinyCycle;
  readonly entries: readonly {
    rank: number;
    name: string;
    mine: boolean;
    clearedFloor: number;
    totalTurns: number;
    completedAt: number;
  }[];
  readonly mine: { rank: number; clearedFloor: number; totalTurns: number; completedAt: number } | null;
  readonly nextCursor: string | null;
}

export async function destinyLeaderboardView(
  store: DestinyLeaderboardStore,
  cycle: DestinyCycle,
  ownerId: string | null,
  offset: number,
  limit: number,
): Promise<DestinyLeaderboardView> {
  const [rows, mine] = await Promise.all([
    store.page(cycle.cycleId, offset, limit + 1),
    ownerId ? store.rankOf(cycle.cycleId, ownerId) : null,
  ]);
  const page = rows.slice(0, limit);
  return {
    cycle,
    entries: page.map((entry, index) => ({
      rank: offset + index + 1,
      name: entry.name ?? `Khách ${entry.ownerId.slice(-4)}`,
      mine: entry.ownerId === ownerId,
      clearedFloor: entry.clearedFloor,
      totalTurns: entry.totalTurns,
      completedAt: entry.completedAt,
    })),
    mine: mine ? {
      rank: mine.rank,
      clearedFloor: mine.entry.clearedFloor,
      totalTurns: mine.entry.totalTurns,
      completedAt: mine.entry.completedAt,
    } : null,
    nextCursor: rows.length > limit ? String(offset + limit) : null,
  };
}
