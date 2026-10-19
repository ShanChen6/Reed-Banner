// Bảng Postgres (Neon) cho dữ liệu online. Đổi schema xong chạy `pnpm db:generate` để sinh migration.

import { bigint, index, integer, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import type { Match } from "@/core";

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
  },
  (t) => [index("matches_owner_idx").on(t.ownerId)],
);

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

/** Danh tính OAuth gắn với tài khoản: mỗi (nhà cung cấp, id bên đó) thuộc đúng một tài khoản. */
export const identities = pgTable(
  "identities",
  {
    provider: text("provider").notNull(),
    subject: text("subject").notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.subject] }), index("identities_account_idx").on(t.accountId)],
);
