// Lưu tài khoản và danh tính OAuth vào Postgres bằng Drizzle. Neon HTTP không có transaction tương tác,
// nên mỗi bước là một câu lệnh tự đứng được: chạy song song thì người gắn danh tính trước thắng.

import { and, eq, gte, sql } from "drizzle-orm";
import {
  PASSWORD_PROVIDER,
  type Account,
  type AccountStore,
  type EmailToken,
  type OAuthProfile,
  type PasswordPatch,
  type PasswordRecord,
  type ProviderId,
  type TokenPurpose,
} from "../accounts";
import { accounts, emailTokens, identities } from "./schema";
import type { Db } from "./store";

export class DrizzleAccountStore implements AccountStore {
  constructor(private readonly db: Db) {}

  async accountForIdentity(provider: ProviderId, subject: string): Promise<string | null> {
    const [row] = await this.db
      .select({ accountId: identities.accountId })
      .from(identities)
      .where(and(eq(identities.provider, provider), eq(identities.subject, subject)))
      .limit(1);
    return row?.accountId ?? null;
  }

  async link(accountId: string, p: OAuthProfile, now: number): Promise<string> {
    await this.db
      .insert(accounts)
      .values({ id: accountId, name: p.name, avatarUrl: p.avatarUrl, createdAt: now, lastLoginAt: now })
      .onConflictDoUpdate({ target: accounts.id, set: { name: p.name, avatarUrl: p.avatarUrl, lastLoginAt: now } });
    await this.db
      .insert(identities)
      .values({ provider: p.provider, subject: p.subject, accountId, createdAt: now })
      .onConflictDoNothing();
    return (await this.accountForIdentity(p.provider, p.subject)) ?? accountId;
  }

  async get(id: string): Promise<Account | null> {
    const [row] = await this.db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    if (!row) return null;
    const ids = await this.db
      .select({ provider: identities.provider, subject: identities.subject })
      .from(identities)
      .where(eq(identities.accountId, id));
    const providers = [...new Set(ids.filter((i) => i.provider !== PASSWORD_PROVIDER).map((i) => i.provider as ProviderId))].sort();
    const username = ids.find((i) => i.provider === PASSWORD_PROVIDER)?.subject ?? null;
    return {
      id: row.id,
      name: row.name,
      avatarUrl: row.avatarUrl,
      providers,
      username,
      email: row.email,
      createdAt: row.createdAt,
      lastLoginAt: row.lastLoginAt,
    };
  }

  async getPassword(username: string): Promise<PasswordRecord | null> {
    const [row] = await this.db
      .select()
      .from(identities)
      .where(and(eq(identities.provider, PASSWORD_PROVIDER), eq(identities.subject, username)))
      .limit(1);
    if (!row?.passwordHash) return null;
    return { accountId: row.accountId, hash: row.passwordHash, failedCount: row.failedCount, lockedUntil: row.lockedUntil };
  }

  async createPassword(accountId: string, username: string, hash: string, now: number): Promise<boolean> {
    await this.db
      .insert(accounts)
      .values({ id: accountId, name: username, avatarUrl: null, createdAt: now, lastLoginAt: now })
      .onConflictDoNothing();
    const rows = await this.db
      .insert(identities)
      .values({ provider: PASSWORD_PROVIDER, subject: username, accountId, createdAt: now, passwordHash: hash })
      .onConflictDoNothing()
      .returning({ accountId: identities.accountId });
    return rows.length > 0;
  }

  async updatePassword(username: string, patch: PasswordPatch): Promise<void> {
    await this.db
      .update(identities)
      .set({ passwordHash: patch.hash, failedCount: patch.failedCount, lockedUntil: patch.lockedUntil })
      .where(and(eq(identities.provider, PASSWORD_PROVIDER), eq(identities.subject, username)));
  }

  async accountByEmail(email: string): Promise<string | null> {
    const [row] = await this.db.select({ id: accounts.id }).from(accounts).where(eq(accounts.email, email)).limit(1);
    return row?.id ?? null;
  }

  async setEmail(accountId: string, email: string): Promise<boolean> {
    try {
      const rows = await this.db
        .update(accounts)
        .set({ email })
        .where(
          and(
            eq(accounts.id, accountId),
            sql`not exists (select 1 from ${accounts} other where other.email = ${email} and other.id <> ${accountId})`,
          ),
        )
        .returning({ id: accounts.id });
      return rows.length > 0;
    } catch {
      // Hai tài khoản xác nhận cùng email cùng lúc: chỉ mục unique chặn người sau.
      return false;
    }
  }

  async addToken(token: EmailToken): Promise<void> {
    await this.db.insert(emailTokens).values(token);
  }

  async takeToken(tokenHash: string, purpose: TokenPurpose, now: number): Promise<EmailToken | null> {
    const [row] = await this.db
      .delete(emailTokens)
      .where(and(eq(emailTokens.tokenHash, tokenHash), eq(emailTokens.purpose, purpose)))
      .returning();
    return row && now < row.expiresAt ? { ...row, purpose } : null;
  }

  async countTokens(accountId: string, purpose: TokenPurpose, since: number): Promise<number> {
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(emailTokens)
      .where(and(eq(emailTokens.accountId, accountId), eq(emailTokens.purpose, purpose), gte(emailTokens.createdAt, since)));
    return row?.n ?? 0;
  }

  async deleteTokens(accountId: string, purpose: TokenPurpose): Promise<void> {
    await this.db.delete(emailTokens).where(and(eq(emailTokens.accountId, accountId), eq(emailTokens.purpose, purpose)));
  }
}
