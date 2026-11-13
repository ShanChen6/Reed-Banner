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
 * Bảng xếp hạng: điểm hiện tại của mỗi người trên mỗi bảng (chiến dịch, từng màn, sinh tồn, đấu trường), tính từ hồ
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

/**
 * Trận Đồ xếp hạng: mỗi người một ván mỗi kỳ mỗi bậc (chỉ mục duy nhất chặn mở ván thứ hai). Server giữ trạng thái
 * ván (gồm seed và RNG, không bao giờ gửi cho client) và áp từng lệnh, nên không thể luyện trước hay giả điểm.
 * `claimedAt` đặt đúng một lần khi nhận thưởng sau khi kỳ khép lại.
 */
export const formationEntries = pgTable(
  "formation_entries",
  {
    id: text("id").primaryKey(),
    level: text("level").notNull(),
    period: text("period").notNull(),
    ownerId: text("owner_id").notNull(),
    state: jsonb("state").notNull(),
    seq: integer("seq").notNull(),
    status: text("status").notNull(),
    score: integer("score"),
    turns: integer("turns"),
    startedAt: bigint("started_at", { mode: "number" }).notNull(),
    finishedAt: bigint("finished_at", { mode: "number" }),
    claimedAt: bigint("claimed_at", { mode: "number" }),
    rewardGold: integer("reward_gold"),
  },
  (t) => [
    uniqueIndex("formation_entries_attempt_idx").on(t.period, t.level, t.ownerId),
    index("formation_entries_rank_idx").on(t.level, t.period, t.status, t.score),
    index("formation_entries_owner_idx").on(t.ownerId, t.level),
  ],
);

/**
 * Sổ nhận thưởng hạng theo kỳ của các chế độ dùng chung cơ chế (Nhật Lệnh, Tháp Thiên Mệnh). Khóa chính
 * (mode, period, owner_id) chặn nhận hai lần: chèn trùng bị từ chối nên đúng một request cộng được vàng.
 */
export const rankRewardClaims = pgTable(
  "rank_reward_claims",
  {
    mode: text("mode").notNull(),
    period: text("period").notNull(),
    ownerId: text("owner_id").notNull(),
    rank: integer("rank").notNull(),
    gold: integer("gold").notNull(),
    claimedAt: bigint("claimed_at", { mode: "number" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.mode, t.period, t.ownerId] }), index("rank_reward_claims_owner_idx").on(t.ownerId, t.mode)],
);

/**
 * Điểm mùa theo tuần của Trấn Ải và Quần Hùng: mỗi người một dòng mỗi mùa mỗi chế độ. `updatedAt` đổi mỗi khi điểm
 * đổi, để bằng điểm thì ai đạt trước đứng trên. Bảng xếp hạng đọc theo (mode, season, score).
 */
export const seasonScores = pgTable(
  "season_scores",
  {
    mode: text("mode").notNull(),
    season: text("season").notNull(),
    ownerId: text("owner_id").notNull(),
    score: integer("score").notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.mode, t.season, t.ownerId] }), index("season_scores_rank_idx").on(t.mode, t.season, t.score)],
);

/**
 * Trận PvP (Quần Hùng online): trạng thái cả trận (`PvpState`, gồm seed và RNG, không bao giờ gửi cho client), `seq` để
 * ghi có điều kiện khi hai người chơi cùng gửi nước đi. `settledAt` đặt đúng một lần khi tính điểm hạng sau trận.
 */
export const pvpMatches = pgTable(
  "pvp_matches",
  {
    id: text("id").primaryKey(),
    format: text("format").notNull(),
    state: jsonb("state").notNull(),
    seq: integer("seq").notNull(),
    status: text("status").notNull(),
    owners: jsonb("owners").notNull(),
    results: jsonb("results"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
    settledAt: bigint("settled_at", { mode: "number" }),
  },
  (t) => [index("pvp_matches_status_idx").on(t.status, t.updatedAt)],
);

/** Hàng đợi ghép trận: mỗi người một dòng. `matchId` đặt khi đã được ghép, người chơi đọc ra ở lần hỏi kế tiếp. */
export const pvpQueue = pgTable(
  "pvp_queue",
  {
    ownerId: text("owner_id").primaryKey(),
    format: text("format").notNull(),
    rating: integer("rating").notNull(),
    enqueuedAt: bigint("enqueued_at", { mode: "number" }).notNull(),
    lastSeen: bigint("last_seen", { mode: "number" }).notNull(),
    matchId: text("match_id"),
    /** Tướng chọn khi xếp hàng 3vs3 (null ở 1vs1). */
    hero: text("hero"),
  },
  (t) => [index("pvp_queue_wait_idx").on(t.format, t.matchId, t.enqueuedAt)],
);

/**
 * Điểm hạng PvP của từng người ở từng thể thức. Điểm đổi bằng phép cộng trong SQL để hai trận kết thúc cùng lúc không ghi
 * đè nhau. `forgiveDay` và `forgiveUsed` đếm số lượt mất kết nối đã được tha trong ngày (giờ Việt Nam).
 */
export const pvpRatings = pgTable(
  "pvp_ratings",
  {
    ownerId: text("owner_id").notNull(),
    format: text("format").notNull(),
    rating: integer("rating").notNull(),
    wins: integer("wins").notNull().default(0),
    losses: integer("losses").notNull().default(0),
    forgiveDay: text("forgive_day").notNull().default(""),
    forgiveUsed: integer("forgive_used").notNull().default(0),
    /** Tuần (giờ Việt Nam) của bộ đếm `breakCount`: số trận bị tính phá trận trong tuần. */
    breakWeek: text("break_week").notNull().default(""),
    breakCount: integer("break_count").notNull().default(0),
    /** Bị hạn chế ghép trận tới mốc này (ms); 0 là không bị hạn chế. */
    banUntil: bigint("ban_until", { mode: "number" }).notNull().default(0),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.ownerId, t.format] }), index("pvp_ratings_rank_idx").on(t.format, t.rating)],
);

/** Vàng PvP đã nhận mỗi ngày (giờ Việt Nam), để giữ trần vàng mỗi ngày. Số trận không bị giới hạn. */
export const pvpDaily = pgTable(
  "pvp_daily",
  {
    ownerId: text("owner_id").notNull(),
    day: text("day").notNull(),
    gold: integer("gold").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.ownerId, t.day] })],
);

/** Số trận một người đã đấu với cùng một đối thủ trong ngày: quá mức thì trận đó không có vàng (điểm hạng vẫn tính). */
export const pvpPairs = pgTable(
  "pvp_pairs",
  {
    day: text("day").notNull(),
    ownerId: text("owner_id").notNull(),
    opponentId: text("opponent_id").notNull(),
    matches: integer("matches").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.ownerId, t.opponentId] })],
);

/**
 * Phòng mời bằng mã của Đấu người 3vs3 (giao hữu, không tính điểm). `slots` là sáu chỗ ngồi (0–2 phe một, 3–5 phe hai) gồm người,
 * tướng đã chọn và nghề, hệ nếu là Đinh Bộ Lĩnh. Ghi kèm điều kiện `seq` như trận.
 */
export const pvpRooms = pgTable(
  "pvp_rooms",
  {
    code: text("code").primaryKey(),
    host: text("host").notNull(),
    status: text("status").notNull(),
    slots: jsonb("slots").notNull(),
    fillAi: boolean("fill_ai").notNull().default(false),
    matchId: text("match_id"),
    seq: integer("seq").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (t) => [index("pvp_rooms_updated_idx").on(t.status, t.updatedAt)],
);

/** Mỗi người chỉ ở một phòng: dòng này chỉ ra phòng đang ở. */
export const pvpRoomMembers = pgTable("pvp_room_members", {
  ownerId: text("owner_id").primaryKey(),
  code: text("code").notNull(),
});
