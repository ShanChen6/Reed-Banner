// Bảng Postgres (Neon) cho dữ liệu online. Đổi schema xong chạy `pnpm db:generate` để sinh migration.

import { bigint, index, integer, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
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
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  /** Tên và ảnh lấy từ nhà cung cấp lần đăng nhập gần nhất, chỉ để hiển thị. */
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  lastLoginAt: bigint("last_login_at", { mode: "number" }).notNull(),
});

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
