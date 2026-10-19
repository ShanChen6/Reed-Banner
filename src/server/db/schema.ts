// Bảng Postgres (Neon) cho dữ liệu online. Đổi schema xong chạy `pnpm db:generate` để sinh migration.

import { bigint, index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
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
