// Tài khoản khách: id ngẫu nhiên lưu trong cookie có chữ ký HMAC, để client không giả được id người khác.
// Xem docs/tech/ha-tang.md mục 4. Đăng nhập OAuth sẽ gắn danh tính vào chính tài khoản này.

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const GUEST_COOKIE = "colau_guest";

const DEV_SECRET = "co-lau-dev-secret-khong-dung-cho-production";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Thiếu biến môi trường SESSION_SECRET");
  return DEV_SECRET;
}

function sign(id: string, key: string): string {
  return createHmac("sha256", key).update(id).digest("base64url");
}

/** Giá trị cookie cho một id: `<id>.<chữ ký>`. */
export function signGuest(id: string, key = secret()): string {
  return `${id}.${sign(id, key)}`;
}

/** Id khách nếu cookie hợp lệ, ngược lại null. */
export function verifyGuest(value: string | undefined, key = secret()): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1));
  const expected = Buffer.from(sign(id, key));
  return given.length === expected.length && timingSafeEqual(given, expected) ? id : null;
}

export function newGuestId(): string {
  return `g_${randomUUID()}`;
}
