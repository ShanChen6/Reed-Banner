// Lưu trận online. Server là nguồn sự thật; mọi lần ghi kèm điều kiện seq (chống ghi trùng khi hai request
// chạy song song). Postgres (Neon + Drizzle) ở ./db; bản trong bộ nhớ cho dev và test.

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Match } from "@/core";
import { MemoryAccountStore, type AccountStore } from "./accounts";
import { DrizzleAccountStore } from "./db/accounts";
import { DrizzleProfileStore } from "./db/profiles";
import { DrizzleMatchStore, type Db } from "./db/store";
import { MemoryProfileStore, type ProfileStore } from "./profiles";

function neonDb(url: string): Db {
  return drizzle(neon(url)) as unknown as Db;
}

export interface MatchRecord {
  readonly id: string;
  /** Tài khoản sở hữu (khách hoặc đã đăng nhập). */
  readonly ownerId: string;
  readonly match: Match;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface MatchStore {
  create(record: MatchRecord): Promise<void>;
  get(id: string): Promise<MatchRecord | null>;
  /** Ghi đè khi seq đang lưu đúng bằng `expectedSeq`; trả về false nếu đã có request khác ghi trước. */
  save(record: MatchRecord, expectedSeq: number): Promise<boolean>;
  /** Đánh dấu đã cộng thưởng cuối trận; true chỉ cho lần gọi đầu tiên (thưởng được cộng đúng một lần). */
  claimReward(id: string, now: number): Promise<boolean>;
}

/**
 * Lưu trong bộ nhớ của tiến trình: dùng cho dev và test. Trên Vercel mỗi instance có bộ nhớ riêng nên
 * chưa dùng cho production được.
 */
export class MemoryMatchStore implements MatchStore {
  private readonly records = new Map<string, MatchRecord>();
  private readonly rewarded = new Set<string>();

  async create(record: MatchRecord): Promise<void> {
    if (this.records.has(record.id)) throw new Error(`Trận đã tồn tại: ${record.id}`);
    this.records.set(record.id, structuredClone(record));
  }

  async get(id: string): Promise<MatchRecord | null> {
    const r = this.records.get(id);
    return r ? structuredClone(r) : null;
  }

  async save(record: MatchRecord, expectedSeq: number): Promise<boolean> {
    const current = this.records.get(record.id);
    if (!current || current.match.seq !== expectedSeq) return false;
    this.records.set(record.id, structuredClone(record));
    return true;
  }

  async claimReward(id: string): Promise<boolean> {
    if (!this.records.has(id) || this.rewarded.has(id)) return false;
    this.rewarded.add(id);
    return true;
  }
}

const globalStore = globalThis as unknown as { coLauMatchStore?: MatchStore; coLauAccountStore?: AccountStore; coLauProfileStore?: ProfileStore };

/**
 * Kho dùng chung của server: Postgres (Neon) khi có DATABASE_URL, ngược lại lưu trong bộ nhớ (dev).
 * Giữ qua hot reload khi dev.
 */
export function matchStore(): MatchStore {
  const url = process.env.DATABASE_URL;
  globalStore.coLauMatchStore ??= url ? new DrizzleMatchStore(neonDb(url)) : new MemoryMatchStore();
  return globalStore.coLauMatchStore;
}

/** Kho tài khoản, cùng nguồn với kho trận. */
export function accountStore(): AccountStore {
  const url = process.env.DATABASE_URL;
  globalStore.coLauAccountStore ??= url ? new DrizzleAccountStore(neonDb(url)) : new MemoryAccountStore();
  return globalStore.coLauAccountStore;
}

/** Kho hồ sơ tiến trình, cùng nguồn với kho trận. */
export function profileStore(): ProfileStore {
  const url = process.env.DATABASE_URL;
  globalStore.coLauProfileStore ??= url ? new DrizzleProfileStore(neonDb(url)) : new MemoryProfileStore();
  return globalStore.coLauProfileStore;
}

/** Postgres cho việc định kỳ; null khi dev không có DATABASE_URL (lưu bộ nhớ, không cần dọn). */
export function database(): Db | null {
  const url = process.env.DATABASE_URL;
  return url ? neonDb(url) : null;
}

export interface DatabaseCheck {
  readonly kind: "neon" | "memory";
  readonly ok: boolean;
  /** Đã có bảng `profiles`, bảng của migration mới nhất (migration đã chạy hết). */
  readonly migrated?: boolean;
  readonly error?: string;
}

/** Kiểm tra nối Postgres và migration mới nhất; không có DATABASE_URL thì báo đang dùng bộ nhớ. */
export async function checkDatabase(): Promise<DatabaseCheck> {
  const url = process.env.DATABASE_URL;
  if (!url) return { kind: "memory", ok: process.env.NODE_ENV !== "production" };
  try {
    const rows = (await neon(url)`select to_regclass('public.profiles') as t`) as { t: string | null }[];
    const migrated = rows[0]?.t != null;
    return { kind: "neon", ok: migrated, migrated };
  } catch (e) {
    return { kind: "neon", ok: false, error: e instanceof Error ? e.name : "unknown" };
  }
}
