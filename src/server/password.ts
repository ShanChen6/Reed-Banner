// Đăng ký và đăng nhập bằng tên đăng nhập + mật khẩu. Mật khẩu băm bằng scrypt (có sẵn trong Node), sai
// liên tiếp nhiều lần thì khóa tên đó một lúc để chống dò. Chưa có email nên không khôi phục được mật
// khẩu: trang đăng ký cảnh báo và khuyên liên kết thêm Google/GitHub. Xem docs/tech/ha-tang.md mục 4.

import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";
import type { AccountStore } from "./accounts";

const scrypt = (password: string, salt: Buffer, keylen: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key))),
  );

/** Tên đăng nhập: 3–20 ký tự chữ thường không dấu, số, dấu chấm, gạch dưới; không phân biệt hoa thường. */
export const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
/** Sai liên tiếp ngần này lần thì khóa tên đăng nhập trong LOCK_MS. */
export const MAX_FAILURES = 5;
export const LOCK_MS = 15 * 60 * 1000;

const SCRYPT = { N: 16384, r: 8, p: 1 } as const;
const KEY_LEN = 32;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Băm mật khẩu, dạng `scrypt$N$r$p$muối$khóa` để sau này đổi tham số vẫn kiểm tra được mật khẩu cũ. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFC"), salt, KEY_LEN, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, key] = stored.split("$");
  if (algo !== "scrypt" || !salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  const actual = await scrypt(password.normalize("NFC"), Buffer.from(salt, "base64url"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return timingSafeEqual(actual, expected);
}

/** Băm sẵn một mật khẩu giả để tên không tồn tại cũng tốn thời gian như tên có thật. */
let dummyHash: Promise<string> | null = null;

export type PasswordError =
  | "badUsername"
  | "badPassword"
  | "mismatch"
  | "taken"
  | "hasPassword"
  | "wrong"
  | "locked"
  | "noPassword"
  | "badEmail"
  | "emailTaken"
  | "badToken"
  | "tooMany";

export type PasswordResult = { readonly ok: true; readonly accountId: string } | { readonly ok: false; readonly error: PasswordError };

export function checkNewPassword(password: string, confirm: string): PasswordError | null {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return "badPassword";
  if (password !== confirm) return "mismatch";
  return null;
}

/**
 * Đăng ký: gắn tên đăng nhập + mật khẩu vào tài khoản đang dùng (khách hoặc đã đăng nhập Google/GitHub),
 * hoặc tài khoản mới nếu chưa có cookie. Mỗi tài khoản có tối đa một tên đăng nhập.
 */
export async function register(
  store: AccountStore,
  input: { username: string; password: string; confirm: string },
  current: string | null,
  now: number,
  newId: () => string,
): Promise<PasswordResult> {
  const username = normalizeUsername(input.username);
  if (!USERNAME_PATTERN.test(username)) return { ok: false, error: "badUsername" };
  const bad = checkNewPassword(input.password, input.confirm);
  if (bad) return { ok: false, error: bad };
  if (current && (await store.get(current))?.username) return { ok: false, error: "hasPassword" };
  if (await store.getPassword(username)) return { ok: false, error: "taken" };
  const accountId = current ?? newId();
  const created = await store.createPassword(accountId, username, await hashPassword(input.password), now);
  return created ? { ok: true, accountId } : { ok: false, error: "taken" };
}

/** Kiểm tra mật khẩu kèm khóa tạm khi sai nhiều lần. Tên không tồn tại báo "wrong" như sai mật khẩu. */
async function check(store: AccountStore, username: string, password: string, now: number): Promise<PasswordResult> {
  const record = await store.getPassword(username);
  if (!record) {
    dummyHash ??= hashPassword("khong-dung-mat-khau-nay");
    await verifyPassword(password, await dummyHash);
    return { ok: false, error: "wrong" };
  }
  if (record.lockedUntil !== null && now < record.lockedUntil) return { ok: false, error: "locked" };
  if (!(await verifyPassword(password, record.hash))) {
    const failed = record.failedCount + 1;
    const lock = failed >= MAX_FAILURES;
    await store.updatePassword(username, { failedCount: lock ? 0 : failed, lockedUntil: lock ? now + LOCK_MS : null });
    return { ok: false, error: lock ? "locked" : "wrong" };
  }
  if (record.failedCount > 0 || record.lockedUntil !== null) await store.updatePassword(username, { failedCount: 0, lockedUntil: null });
  return { ok: true, accountId: record.accountId };
}

/** Đăng nhập: vào tài khoản giữ tên đăng nhập (khách đang dùng trên máy này, nếu có, bị bỏ lại). */
export async function login(store: AccountStore, input: { username: string; password: string }, now: number): Promise<PasswordResult> {
  const username = normalizeUsername(input.username);
  if (!USERNAME_PATTERN.test(username)) return { ok: false, error: "wrong" };
  return check(store, username, input.password, now);
}

export async function changePassword(
  store: AccountStore,
  accountId: string,
  input: { current: string; password: string; confirm: string },
  now: number,
): Promise<PasswordResult> {
  const username = (await store.get(accountId))?.username;
  if (!username) return { ok: false, error: "noPassword" };
  const bad = checkNewPassword(input.password, input.confirm);
  if (bad) return { ok: false, error: bad };
  const r = await check(store, username, input.current, now);
  if (!r.ok) return r;
  await store.updatePassword(username, { hash: await hashPassword(input.password) });
  return { ok: true, accountId };
}
