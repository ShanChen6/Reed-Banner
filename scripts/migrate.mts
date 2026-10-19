// Áp migration trong ./drizzle lên Postgres (Neon) trước khi build. Không có DATABASE_URL thì bỏ qua,
// để build ở máy dev và CI không cần database.

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("Không có DATABASE_URL, bỏ qua migration.");
} else {
  await migrate(drizzle(neon(url)), { migrationsFolder: "drizzle" });
  console.log("Đã áp migration.");
}
