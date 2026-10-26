// Đấu trường bóng ma trên server: kho điểm và đội phòng thủ, bày đối thủ, ghi kết quả. Luật và số liệu ở
// @/core (arena). Xem docs/02-game-modes/README.md mục 5.3.

import {
  ARENA_ATTACKS_PER_DAY,
  ARENA_OFFERS,
  ARENA_START,
  arenaDay,
  botDefense,
  botName,
  createRng,
  defenseOf,
  type ArenaDefense,
  type ArenaMember,
} from "@/core";
import type { LeaderboardStore } from "./leaderboard";
import { loadProfile, type ProfileStore } from "./profiles";

/** Một đối thủ đang bày ra. `owner` chỉ nằm trên server; bóng ma máy tạo có `owner` null và dựng lại từ seed. */
export interface ArenaOffer {
  readonly owner: string | null;
  readonly name: string;
  readonly rating: number;
  readonly members: readonly ArenaMember[];
  readonly power: number;
  /** Bóng ma máy tạo: seed và cấp để dựng lại đúng đội đã bày. */
  readonly seed?: number;
  readonly level?: number;
}

export interface ArenaRow {
  readonly ownerId: string;
  readonly rating: number;
  readonly defense: ArenaDefense | null;
  readonly offers: readonly ArenaOffer[];
  readonly wins: number;
  readonly losses: number;
  readonly defenseWins: number;
  readonly defenseLosses: number;
  /** Ngày của bộ đếm `attacks`. */
  readonly day: string;
  readonly attacks: number;
  readonly updatedAt: number;
}

export type ArenaRecord = "win" | "loss" | "defenseWin" | "defenseLoss";

export interface ArenaCandidate {
  readonly ownerId: string;
  readonly rating: number;
  readonly defense: ArenaDefense;
  /** Tên tài khoản đã đăng nhập; khách là null. */
  readonly name: string | null;
}

export interface ArenaStore {
  get(ownerId: string): Promise<ArenaRow | null>;
  /** Lấy hàng của người chơi, tạo với điểm khởi đầu nếu chưa có. */
  ensure(ownerId: string, now: number): Promise<ArenaRow>;
  setDefense(
    ownerId: string,
    defense: ArenaDefense,
    now: number,
  ): Promise<void>;
  setOffers(ownerId: string, offers: readonly ArenaOffer[]): Promise<void>;
  /** Người chơi khác đã có đội phòng thủ, điểm gần `rating` nhất trước. */
  candidates(
    ownerId: string,
    rating: number,
    limit: number,
  ): Promise<ArenaCandidate[]>;
  /** Dùng một trận của ngày `day`; false khi đã hết lượt. */
  useAttack(
    ownerId: string,
    day: string,
    limit: number,
    now: number,
  ): Promise<boolean>;
  /** Cộng điểm (không xuống dưới 0) và một trận vào thành tích; trả điểm mới, null khi không có hàng. */
  record(
    ownerId: string,
    delta: number,
    result: ArenaRecord,
    now: number,
  ): Promise<number | null>;
}

/** Cột thành tích tăng theo từng loại kết quả. */
export const RECORD_FIELD = {
  win: "wins",
  loss: "losses",
  defenseWin: "defenseWins",
  defenseLoss: "defenseLosses",
} as const satisfies Record<ArenaRecord, keyof ArenaRow>;

const guestName = (id: string) => `Khách ${id.slice(-4)}`;

const newRow = (ownerId: string, now: number): ArenaRow => ({
  ownerId,
  rating: ARENA_START,
  defense: null,
  offers: [],
  wins: 0,
  losses: 0,
  defenseWins: 0,
  defenseLosses: 0,
  day: "",
  attacks: 0,
  updatedAt: now,
});

export class MemoryArenaStore implements ArenaStore {
  private readonly rows = new Map<string, ArenaRow>();

  async get(ownerId: string): Promise<ArenaRow | null> {
    return this.rows.get(ownerId) ?? null;
  }

  async ensure(ownerId: string, now: number): Promise<ArenaRow> {
    const row = this.rows.get(ownerId) ?? newRow(ownerId, now);
    this.rows.set(ownerId, row);
    return row;
  }

  private patch(ownerId: string, p: Partial<ArenaRow>) {
    const row = this.rows.get(ownerId);
    if (row) this.rows.set(ownerId, { ...row, ...p });
  }

  async setDefense(ownerId: string, defense: ArenaDefense, now: number) {
    this.patch(ownerId, { defense, updatedAt: now });
  }

  async setOffers(ownerId: string, offers: readonly ArenaOffer[]) {
    this.patch(ownerId, { offers });
  }

  async candidates(
    ownerId: string,
    rating: number,
    limit: number,
  ): Promise<ArenaCandidate[]> {
    return [...this.rows.values()]
      .filter((r) => r.ownerId !== ownerId && r.defense)
      .sort((a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating))
      .slice(0, limit)
      .map((r) => ({
        ownerId: r.ownerId,
        rating: r.rating,
        defense: r.defense!,
        name: null,
      }));
  }

  async useAttack(ownerId: string, day: string, limit: number, now: number) {
    const row = this.rows.get(ownerId);
    if (!row) return false;
    const used = row.day === day ? row.attacks : 0;
    if (used >= limit) return false;
    this.patch(ownerId, { day, attacks: used + 1, updatedAt: now });
    return true;
  }

  async record(
    ownerId: string,
    delta: number,
    result: ArenaRecord,
    now: number,
  ): Promise<number | null> {
    const row = this.rows.get(ownerId);
    if (!row) return null;
    const rating = Math.max(0, row.rating + delta);
    const key = RECORD_FIELD[result];
    this.patch(ownerId, { rating, [key]: row[key] + 1, updatedAt: now });
    return rating;
  }
}

/** Bày đối thủ: tối đa ARENA_OFFERS người chơi thật có điểm gần nhất (chọn ngẫu nhiên trong nhóm gần), thiếu thì thêm bóng ma máy tạo. */
export async function makeOffers(
  store: ArenaStore,
  ownerId: string,
  rating: number,
  level: number,
  seed: number,
): Promise<ArenaOffer[]> {
  const rng = createRng(seed >>> 0);
  const pool = await store.candidates(ownerId, rating, ARENA_OFFERS * 4);
  const real: ArenaOffer[] = [];
  while (real.length < ARENA_OFFERS && pool.length > 0) {
    const c = pool.splice(rng.int(0, pool.length - 1), 1)[0]!;
    real.push({
      owner: c.ownerId,
      name: c.name ?? guestName(c.ownerId),
      rating: c.rating,
      members: c.defense.members,
      power: c.defense.power,
    });
  }
  const bots = Array.from({ length: ARENA_OFFERS - real.length }, () => {
    const s = rng.int(0, 2 ** 31 - 1);
    const d = botDefense(s, level);
    return {
      owner: null,
      name: botName(s),
      rating: ARENA_START,
      members: d.members,
      power: d.power,
      seed: s,
      level,
    };
  });
  return [...real, ...bots].sort((a, b) => b.rating - a.rating);
}

/** Đội phòng thủ của một đối thủ đang bày; null khi chủ đội không còn (bị xóa). */
export async function offerDefense(
  store: ArenaStore,
  offer: ArenaOffer,
): Promise<ArenaDefense | null> {
  if (offer.owner === null)
    return botDefense(offer.seed ?? 0, offer.level ?? 1);
  return (await store.get(offer.owner))?.defense ?? null;
}

export interface ArenaDeps {
  readonly arena: ArenaStore;
  readonly profiles: ProfileStore;
  readonly leaderboard?: LeaderboardStore;
  readonly now: number;
  readonly seed: number;
}

export interface ArenaView {
  readonly rating: number;
  readonly rank: number | null;
  readonly wins: number;
  readonly losses: number;
  readonly defenseWins: number;
  readonly defenseLosses: number;
  readonly attacksLeft: number;
  readonly attacksPerDay: number;
  readonly defense: Omit<ArenaDefense, "team"> | null;
  readonly offers: readonly {
    readonly name: string;
    readonly rating: number;
    readonly members: readonly ArenaMember[];
    readonly power: number;
    readonly bot: boolean;
  }[];
}

export type ArenaCommand = "view" | "defend" | "refresh";

/**
 * Trang đấu trường: tạo hàng nếu chưa có, đặt đội phòng thủ lần đầu (hoặc khi bấm cập nhật) từ đội 3vs3 đang
 * chọn, bày đối thủ mới khi chưa có (hoặc khi bấm đổi).
 */
export async function arenaView(
  ownerId: string,
  command: ArenaCommand,
  deps: ArenaDeps,
): Promise<ArenaView> {
  const { arena, now } = deps;
  let row = await arena.ensure(ownerId, now);
  const { profile } = await loadProfile(deps.profiles, ownerId);
  if (!row.defense || command === "defend") {
    await arena.setDefense(ownerId, defenseOf(profile), now);
    // Lần đầu có đội phòng thủ thì lên bảng đấu trường.
    if (!row.defense && deps.leaderboard)
      await deps.leaderboard
        .submit(ownerId, [{ board: "arena", score: row.rating }], now)
        .catch((e: unknown) =>
          console.error("Không ghi được bảng đấu trường", e),
        );
  }
  if (row.offers.length === 0 || command === "refresh")
    await arena.setOffers(
      ownerId,
      await makeOffers(
        arena,
        ownerId,
        row.rating,
        profile.main.level,
        deps.seed,
      ),
    );
  row = (await arena.get(ownerId)) ?? row;
  const day = arenaDay(now);
  const rank = deps.leaderboard
    ? ((await deps.leaderboard.rankOf("arena", ownerId))?.rank ?? null)
    : null;
  return {
    rating: row.rating,
    rank,
    wins: row.wins,
    losses: row.losses,
    defenseWins: row.defenseWins,
    defenseLosses: row.defenseLosses,
    attacksLeft: ARENA_ATTACKS_PER_DAY - (row.day === day ? row.attacks : 0),
    attacksPerDay: ARENA_ATTACKS_PER_DAY,
    defense: row.defense
      ? { members: row.defense.members, power: row.defense.power }
      : null,
    offers: row.offers.map((o) => ({
      name: o.name,
      rating: o.rating,
      members: o.members,
      power: o.power,
      bot: o.owner === null,
    })),
  };
}
