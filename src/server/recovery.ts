// Email của tài khoản và lấy lại mật khẩu qua email. Email chỉ được lưu sau khi người chơi bấm đường dẫn xác
// nhận gửi tới chính email đó. Quên mật khẩu: nhập tên đăng nhập hoặc email, thư mang đường dẫn đặt lại dùng
// một lần, hạn ngắn. Màn hình luôn báo "đã gửi nếu thông tin đúng" để không lộ tên hay email nào có thật.
// Hàm ở đây chỉ soạn thư, route gửi thư sau khi đã trả lời (thời gian trả lời không lộ gì). Xem
// docs/07-architecture/ha-tang.md mục 4.

import { createHash, randomBytes } from "node:crypto";
import type { AccountStore, TokenPurpose } from "./accounts";
import { resetMail, verifyMail, type Mail } from "./mail";
import { checkNewPassword, hashPassword, normalizeUsername, type PasswordError, type PasswordResult } from "./password";

export const EMAIL_MAX = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Đường dẫn đặt lại mật khẩu sống 30 phút, đường dẫn xác nhận email sống 24 giờ. */
export const RESET_TTL_MS = 30 * 60 * 1000;
export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
/** Mỗi tài khoản nhận tối đa ngần này thư mỗi loại trong một giờ (chống dùng form để gửi thư rác). */
export const MAX_MAILS_PER_HOUR = 3;
const HOUR_MS = 60 * 60 * 1000;

export const RESET_PATH = "/game/reset-password";
export const VERIFY_PATH = "/api/auth/email/verify";

/** Email đã chuẩn hóa (bỏ khoảng trắng, chữ thường), hoặc null nếu không hợp lệ. */
export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  return email.length <= EMAIL_MAX && EMAIL_PATTERN.test(email) ? email : null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function issue(
  store: AccountStore,
  purpose: TokenPurpose,
  accountId: string,
  email: string,
  now: number,
  ttl: number,
): Promise<string | null> {
  if ((await store.countTokens(accountId, purpose, now - HOUR_MS)) >= MAX_MAILS_PER_HOUR) return null;
  const token = randomBytes(32).toString("base64url");
  await store.addToken({ tokenHash: hashToken(token), purpose, accountId, email, createdAt: now, expiresAt: now + ttl });
  return token;
}

export type EmailRequestResult = { readonly ok: true; readonly mail: Mail | null } | { readonly ok: false; readonly error: PasswordError };

/**
 * Thêm hoặc đổi email: soạn thư xác nhận gửi tới email mới (email cũ, nếu có, giữ nguyên tới khi xác nhận).
 * Không báo email đã thuộc người khác ở bước này; bước xác nhận mới báo, cho người đọc được thư đó.
 */
export async function requestEmailVerify(
  store: AccountStore,
  accountId: string,
  raw: string,
  now: number,
  origin: string,
): Promise<EmailRequestResult> {
  const email = normalizeEmail(raw);
  if (!email) return { ok: false, error: "badEmail" };
  const account = await store.get(accountId);
  if (!account) return { ok: false, error: "noPassword" };
  if (account.email === email) return { ok: true, mail: null };
  const token = await issue(store, "verify", accountId, email, now, VERIFY_TTL_MS);
  if (!token) return { ok: false, error: "tooMany" };
  return { ok: true, mail: verifyMail(email, `${origin}${VERIFY_PATH}?token=${token}`, VERIFY_TTL_MS / HOUR_MS) };
}

/** Bấm đường dẫn xác nhận: lưu email vào tài khoản. */
export async function confirmEmail(store: AccountStore, token: string, now: number): Promise<PasswordResult> {
  const t = token ? await store.takeToken(hashToken(token), "verify", now) : null;
  if (!t) return { ok: false, error: "badToken" };
  if (!(await store.setEmail(t.accountId, t.email))) return { ok: false, error: "emailTaken" };
  return { ok: true, accountId: t.accountId };
}

/**
 * Quên mật khẩu: `login` là tên đăng nhập hoặc email. Chỉ soạn thư khi tài khoản có cả tên đăng nhập lẫn email
 * đã xác nhận (và chưa vượt giới hạn thư); mọi trường hợp khác trả về null, người gửi không phân biệt được.
 */
export async function requestPasswordReset(store: AccountStore, login: string, now: number, origin: string): Promise<Mail | null> {
  let accountId: string | null;
  if (login.includes("@")) {
    const email = normalizeEmail(login);
    accountId = email ? await store.accountByEmail(email) : null;
  } else {
    accountId = (await store.getPassword(normalizeUsername(login)))?.accountId ?? null;
  }
  const account = accountId ? await store.get(accountId) : null;
  if (!account?.username || !account.email) return null;
  const token = await issue(store, "reset", account.id, account.email, now, RESET_TTL_MS);
  if (!token) return null;
  return resetMail(account.email, account.username, `${origin}${RESET_PATH}?token=${token}`, RESET_TTL_MS / 60_000);
}

/**
 * Đặt mật khẩu mới bằng mã trong thư. Mã hỏng ngay khi dùng, mọi mã đặt lại khác của tài khoản cũng hỏng theo;
 * tên đăng nhập đang bị khóa vì sai nhiều lần thì được mở. Mã gửi tới email cũ không dùng được sau khi đổi email.
 */
export async function resetPassword(
  store: AccountStore,
  input: { token: string; password: string; confirm: string },
  now: number,
): Promise<PasswordResult> {
  const bad = checkNewPassword(input.password, input.confirm);
  if (bad) return { ok: false, error: bad };
  const t = input.token ? await store.takeToken(hashToken(input.token), "reset", now) : null;
  const account = t ? await store.get(t.accountId) : null;
  if (!t || !account?.username || account.email !== t.email) return { ok: false, error: "badToken" };
  await store.updatePassword(account.username, { hash: await hashPassword(input.password), failedCount: 0, lockedUntil: null });
  await store.deleteTokens(account.id, "reset");
  return { ok: true, accountId: account.id };
}
