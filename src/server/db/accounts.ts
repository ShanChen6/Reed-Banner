// Lưu tài khoản và danh tính OAuth vào Postgres bằng Drizzle. Neon HTTP không có transaction tương tác,
// nên mỗi bước là một câu lệnh tự đứng được: chạy song song thì người gắn danh tính trước thắng.

import { and, eq } from "drizzle-orm";
import type { Account, AccountStore, OAuthProfile, ProviderId } from "../accounts";
import { accounts, identities } from "./schema";
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
    const ids = await this.db.select({ provider: identities.provider }).from(identities).where(eq(identities.accountId, id));
    const providers = [...new Set(ids.map((i) => i.provider as ProviderId))].sort();
    return { id: row.id, name: row.name, avatarUrl: row.avatarUrl, providers, createdAt: row.createdAt, lastLoginAt: row.lastLoginAt };
  }
}
