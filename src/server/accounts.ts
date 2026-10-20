// Tài khoản và đăng nhập (OAuth hoặc tên đăng nhập + mật khẩu). Tài khoản chính là tài khoản khách: lần
// đầu đăng nhập hay đăng ký, danh tính được gắn vào id khách đang dùng nên trận và dữ liệu giữ nguyên.
// Xem docs/tech/ha-tang.md mục 4. Postgres ở ./db/accounts; bản trong bộ nhớ cho dev và test.

export type ProviderId = "google" | "github";

/** Thông tin lấy từ nhà cung cấp sau khi đăng nhập. Không lấy email của nhà cung cấp. */
export interface OAuthProfile {
  readonly provider: ProviderId;
  /** Id người dùng bên nhà cung cấp (không đổi khi họ đổi tên). */
  readonly subject: string;
  readonly name: string;
  readonly avatarUrl: string | null;
}

/** Danh tính tên đăng nhập + mật khẩu nằm cùng bảng với danh tính OAuth, dưới tên nhà cung cấp này. */
export const PASSWORD_PROVIDER = "password";

export interface Account {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  /** Nhà cung cấp OAuth đã liên kết. */
  readonly providers: readonly ProviderId[];
  /** Tên đăng nhập (đã chuẩn hóa) nếu tài khoản có mật khẩu. */
  readonly username: string | null;
  /** Email đã xác nhận, dùng để lấy lại mật khẩu (xem ./recovery). */
  readonly email: string | null;
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
  /** Mật khẩu của một tên đăng nhập (đã chuẩn hóa); null nếu chưa ai dùng tên đó. */
  getPassword(username: string): Promise<PasswordRecord | null>;
  /**
   * Gắn tên đăng nhập + mật khẩu vào tài khoản (tạo tài khoản mang tên đó nếu chưa có; tài khoản đã có thì
   * giữ tên hiển thị). Trả về false nếu tên đã thuộc tài khoản khác.
   */
  createPassword(accountId: string, username: string, hash: string, now: number): Promise<boolean>;
  updatePassword(username: string, patch: PasswordPatch): Promise<void>;
  /** Tài khoản có email (đã xác nhận) này, nếu có. */
  accountByEmail(email: string): Promise<string | null>;
  /** Đặt email đã xác nhận cho tài khoản; false nếu email đang thuộc tài khoản khác hoặc tài khoản không có. */
  setEmail(accountId: string, email: string): Promise<boolean>;
  addToken(token: EmailToken): Promise<void>;
  /** Lấy và xóa mã (mỗi mã chỉ dùng được một lần); null nếu không có, sai mục đích hoặc đã hết hạn. */
  takeToken(tokenHash: string, purpose: TokenPurpose, now: number): Promise<EmailToken | null>;
  /** Số mã đã tạo cho tài khoản từ `since` (giới hạn số thư gửi đi). */
  countTokens(accountId: string, purpose: TokenPurpose, since: number): Promise<number>;
  deleteTokens(accountId: string, purpose: TokenPurpose): Promise<void>;
}

export type TokenPurpose = "verify" | "reset";

/** Mã một lần gửi qua email. Chỉ lưu SHA-256 của mã. */
export interface EmailToken {
  readonly tokenHash: string;
  readonly purpose: TokenPurpose;
  readonly accountId: string;
  /** Email nhận thư (với `verify` là email đang chờ xác nhận). */
  readonly email: string;
  readonly createdAt: number;
  readonly expiresAt: number;
}

export interface PasswordRecord {
  readonly accountId: string;
  readonly hash: string;
  /** Số lần sai liên tiếp, đặt lại khi đúng hoặc khi bị khóa. */
  readonly failedCount: number;
  readonly lockedUntil: number | null;
}

export type PasswordPatch = Partial<Pick<PasswordRecord, "hash" | "failedCount" | "lockedUntil">>;

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
  private readonly accounts = new Map<string, Omit<Account, "providers" | "username" | "email">>();
  private readonly emails = new Map<string, string>();
  private readonly tokens = new Map<string, EmailToken>();
  private readonly identities = new Map<string, { provider: ProviderId; accountId: string }>();
  private readonly passwords = new Map<string, PasswordRecord>();

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
    const username = [...this.passwords.entries()].find(([, r]) => r.accountId === id)?.[0] ?? null;
    return { ...a, providers: [...new Set(providers)].sort(), username, email: this.emails.get(id) ?? null };
  }

  async getPassword(username: string): Promise<PasswordRecord | null> {
    return this.passwords.get(username) ?? null;
  }

  async createPassword(accountId: string, username: string, hash: string, now: number): Promise<boolean> {
    if (this.passwords.has(username)) return false;
    if (!this.accounts.has(accountId)) {
      this.accounts.set(accountId, { id: accountId, name: username, avatarUrl: null, createdAt: now, lastLoginAt: now });
    }
    this.passwords.set(username, { accountId, hash, failedCount: 0, lockedUntil: null });
    return true;
  }

  async updatePassword(username: string, patch: PasswordPatch): Promise<void> {
    const r = this.passwords.get(username);
    if (r) this.passwords.set(username, { ...r, ...patch });
  }

  async accountByEmail(email: string): Promise<string | null> {
    return [...this.emails.entries()].find(([, e]) => e === email)?.[0] ?? null;
  }

  async setEmail(accountId: string, email: string): Promise<boolean> {
    const owner = await this.accountByEmail(email);
    if (!this.accounts.has(accountId) || (owner !== null && owner !== accountId)) return false;
    this.emails.set(accountId, email);
    return true;
  }

  async addToken(token: EmailToken): Promise<void> {
    this.tokens.set(token.tokenHash, token);
  }

  async takeToken(tokenHash: string, purpose: TokenPurpose, now: number): Promise<EmailToken | null> {
    const t = this.tokens.get(tokenHash);
    if (!t || t.purpose !== purpose) return null;
    this.tokens.delete(tokenHash);
    return now < t.expiresAt ? t : null;
  }

  async countTokens(accountId: string, purpose: TokenPurpose, since: number): Promise<number> {
    return [...this.tokens.values()].filter((t) => t.accountId === accountId && t.purpose === purpose && t.createdAt >= since).length;
  }

  async deleteTokens(accountId: string, purpose: TokenPurpose): Promise<void> {
    for (const [k, t] of this.tokens) if (t.accountId === accountId && t.purpose === purpose) this.tokens.delete(k);
  }
}
