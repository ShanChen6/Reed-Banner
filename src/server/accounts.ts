// Tài khoản và đăng nhập OAuth. Tài khoản chính là tài khoản khách: lần đầu đăng nhập, danh tính OAuth
// được gắn vào id khách đang dùng nên trận và dữ liệu đã có giữ nguyên, không cần gộp.
// Xem docs/tech/ha-tang.md mục 4. Postgres ở ./db/accounts; bản trong bộ nhớ cho dev và test.

export type ProviderId = "google" | "github";

/** Thông tin lấy từ nhà cung cấp sau khi đăng nhập. Không lưu email. */
export interface OAuthProfile {
  readonly provider: ProviderId;
  /** Id người dùng bên nhà cung cấp (không đổi khi họ đổi tên). */
  readonly subject: string;
  readonly name: string;
  readonly avatarUrl: string | null;
}

export interface Account {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly providers: readonly ProviderId[];
  readonly createdAt: number;
  readonly lastLoginAt: number;
}

export interface AccountStore {
  /** Tài khoản đang giữ danh tính này, nếu có. */
  accountForIdentity(provider: ProviderId, subject: string): Promise<string | null>;
  /**
   * Tạo hoặc cập nhật tài khoản `accountId` theo hồ sơ và gắn danh tính vào nếu danh tính chưa thuộc ai.
   * Trả về tài khoản giữ danh tính sau khi ghi (khác `accountId` nếu một request song song gắn trước).
   */
  link(accountId: string, profile: OAuthProfile, now: number): Promise<string>;
  get(id: string): Promise<Account | null>;
}

/**
 * Đăng nhập: danh tính đã thuộc tài khoản nào thì vào tài khoản đó (khách hiện tại, nếu có, bị bỏ lại).
 * Chưa thuộc ai thì gắn vào khách hiện tại, hoặc tài khoản mới nếu chưa có cookie khách. Đăng nhập thêm
 * nhà cung cấp thứ hai khi đang ở một tài khoản sẽ gắn cả hai vào cùng tài khoản.
 */
export async function signIn(
  store: AccountStore,
  profile: OAuthProfile,
  current: string | null,
  now: number,
  newId: () => string,
): Promise<string> {
  const owner = (await store.accountForIdentity(profile.provider, profile.subject)) ?? current ?? newId();
  return store.link(owner, profile, now);
}

export class MemoryAccountStore implements AccountStore {
  private readonly accounts = new Map<string, Omit<Account, "providers">>();
  private readonly identities = new Map<string, { provider: ProviderId; accountId: string }>();

  async accountForIdentity(provider: ProviderId, subject: string): Promise<string | null> {
    return this.identities.get(`${provider}:${subject}`)?.accountId ?? null;
  }

  async link(accountId: string, p: OAuthProfile, now: number): Promise<string> {
    const old = this.accounts.get(accountId);
    this.accounts.set(accountId, {
      id: accountId,
      name: p.name,
      avatarUrl: p.avatarUrl,
      createdAt: old?.createdAt ?? now,
      lastLoginAt: now,
    });
    const key = `${p.provider}:${p.subject}`;
    if (!this.identities.has(key)) this.identities.set(key, { provider: p.provider, accountId });
    return this.identities.get(key)!.accountId;
  }

  async get(id: string): Promise<Account | null> {
    const a = this.accounts.get(id);
    if (!a) return null;
    const providers = [...this.identities.values()].filter((i) => i.accountId === id).map((i) => i.provider);
    return { ...a, providers: [...new Set(providers)].sort() };
  }
}
