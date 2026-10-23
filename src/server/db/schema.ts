// Bảng Postgres (Neon) cho dữ liệu online. Đổi schema xong chạy `pnpm db:generate` để sinh migration.

import { bigint, boolean, index, integer, jsonb, pgTable, primaryKey, text, uniqueIndex } from "drizzle-orm/pg-core";
import type { Match, Profile } from "@/core";

/** Trận online. `state` là toàn bộ trạng thái trận (kể cả seed), chỉ server đọc. */
export const matches = pgTable(
  "matches",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    /** Chép từ state.seq để ghi kèm điều kiện `WHERE seq = :expected`. */
    seq: integer("seq").notNull(),
    state: jsonb("state").$type<Match>().notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
    /** Lúc đã cộng phần thưởng cuối trận vào hồ sơ; null khi chưa (đặt kèm điều kiện để chỉ cộng một lần). */
    rewardedAt: bigint("rewarded_at", { mode: "number" }),
  },
  (t) => [index("matches_owner_idx").on(t.ownerId), index("matches_updated_idx").on(t.updatedAt)],
);

/**
 * Hồ sơ tiến trình của người chơi (khách hoặc đã đăng nhập): cấp, kỹ năng, chiêu nhánh, vàng. `version`
 * tăng mỗi lần ghi, ghi kèm điều kiện `WHERE version = :expected`.
 */
export const profiles = pgTable("profiles", {
  ownerId: text("owner_id").primaryKey(),
  version: integer("version").notNull(),
  data: jsonb("data").$type<Profile>().notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

/**
 * Tài khoản đã đăng nhập ít nhất một lần. Id chính là id khách lúc liên kết (`g_...`), nên trận và dữ liệu
 * đã có của khách giữ nguyên. Khách chưa đăng nhập chưa có dòng ở đây.
 */
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    /** Tên và ảnh lấy từ nhà cung cấp lần đăng nhập gần nhất, chỉ để hiển thị. */
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    lastLoginAt: bigint("last_login_at", { mode: "number" }).notNull(),
    /** Email đã xác nhận (chữ thường), để lấy lại mật khẩu. Mỗi email thuộc tối đa một tài khoản. */
    email: text("email"),
  },
  (t) => [uniqueIndex("accounts_email_idx").on(t.email)],
);

/**
 * Mã một lần gửi qua email: xác nhận email (`verify`, kèm email đang chờ) hoặc đặt lại mật khẩu (`reset`).
 * Chỉ lưu SHA-256 của mã; dùng xong thì xóa.
 */
export const emailTokens = pgTable(
  "email_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    purpose: text("purpose").notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  },
  (t) => [index("email_tokens_account_idx").on(t.accountId, t.purpose)],
);

/**
 * Danh tính gắn với tài khoản: mỗi (nhà cung cấp, id bên đó) thuộc đúng một tài khoản. Tên đăng nhập + mật
 * khẩu là nhà cung cấp "password" với subject là tên đăng nhập.
 */
export const identities = pgTable(
  "identities",
  {
    provider: text("provider").notNull(),
    subject: text("subject").notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    /** Chỉ dùng cho nhà cung cấp "password" (subject là tên đăng nhập): mật khẩu đã băm scrypt. */
    passwordHash: text("password_hash"),
    failedCount: integer("failed_count").notNull().default(0),
    lockedUntil: bigint("locked_until", { mode: "number" }),
  },
  (t) => [primaryKey({ columns: [t.provider, t.subject] }), index("identities_account_idx").on(t.accountId)],
);

/**
 * Thử thách hằng ngày: mỗi người một lượt mỗi ngày (khóa chính chặn mở trận thứ hai). Có `score` khi trận đã
 * kết thúc; bảng xếp hạng đọc theo (day, score).
 */
export const dailyEntries = pgTable(
  "daily_entries",
  {
    day: text("day").notNull(),
    ownerId: text("owner_id").notNull(),
    matchId: text("match_id").notNull(),
    startedAt: bigint("started_at", { mode: "number" }).notNull(),
    finishedAt: bigint("finished_at", { mode: "number" }),
    score: integer("score"),
    won: boolean("won"),
    turns: integer("turns"),
    permille: integer("permille"),
  },
  (t) => [primaryKey({ columns: [t.day, t.ownerId] }), index("daily_entries_rank_idx").on(t.day, t.score)],
);

/**
 * Bảng xếp hạng: điểm hiện tại của mỗi người trên mỗi bảng (chiến dịch, từng màn, tháp, sinh tồn), tính từ hồ
 * sơ sau mỗi lần cộng thưởng. `updatedAt` chỉ đổi khi điểm đổi, để bằng điểm thì ai đạt trước đứng trên.
 */
export const leaderboardScores = pgTable(
  "leaderboard_scores",
  {
    board: text("board").notNull(),
    ownerId: text("owner_id").notNull(),
    score: integer("score").notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.board, t.ownerId] }), index("leaderboard_rank_idx").on(t.board, t.score)],
);

/** BXH Destiny tách theo cycle; index khớp thứ tự floor ↓, turns ↑, completion ↑. */
export const destinyLeaderboardScores = pgTable(
  "destiny_leaderboard_scores",
  {
    cycleId: text("cycle_id").notNull(),
    ownerId: text("owner_id").notNull(),
    clearedFloor: integer("cleared_floor").notNull(),
    totalTurns: integer("total_turns").notNull(),
    completedAt: bigint("completed_at", { mode: "number" }).notNull(),
    eventId: text("event_id").notNull().unique(),
  },
  (t) => [
    primaryKey({ columns: [t.cycleId, t.ownerId] }),
    index("destiny_leaderboard_rank_idx").on(t.cycleId, t.clearedFloor, t.totalTurns, t.completedAt, t.ownerId),
  ],
);

/**
 * Đấu trường bóng ma: điểm, thành tích, đội phòng thủ (bản chụp), các đối thủ đang bày ra và số trận đã đánh
 * trong ngày. Điểm đổi bằng phép cộng trong SQL để hai trận cùng lúc không ghi đè nhau.
 */
export const arenaPlayers = pgTable(
  "arena_players",
  {
    ownerId: text("owner_id").primaryKey(),
    rating: integer("rating").notNull(),
    defense: jsonb("defense"),
    offers: jsonb("offers").notNull(),
    wins: integer("wins").notNull().default(0),
    losses: integer("losses").notNull().default(0),
    defenseWins: integer("defense_wins").notNull().default(0),
    defenseLosses: integer("defense_losses").notNull().default(0),
    day: text("day").notNull().default(""),
    attacks: integer("attacks").notNull().default(0),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (t) => [index("arena_players_rating_idx").on(t.rating)],
);
