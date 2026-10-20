import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MemoryAccountStore, signIn } from "../../src/server/accounts";
import { login, register } from "../../src/server/password";
import {
  confirmEmail,
  MAX_MAILS_PER_HOUR,
  normalizeEmail,
  requestEmailVerify,
  requestPasswordReset,
  resetPassword,
  RESET_TTL_MS,
  VERIFY_TTL_MS,
} from "../../src/server/recovery";

const ORIGIN = "https://co-lau.test";
const newId = () => "g_moi";
const tokenOf = (text: string) => /token=([\w-]+)/.exec(text)![1]!;

/** Tài khoản "shan" (g_1) có email đã xác nhận shan@vi.du. */
async function withEmail() {
  const store = new MemoryAccountStore();
  await register(store, { username: "shan", password: "matkhau123", confirm: "matkhau123" }, "g_1", 1, newId);
  const v = await requestEmailVerify(store, "g_1", " Shan@Vi.Du ", 10, ORIGIN);
  assert.ok(v.ok && v.mail);
  assert.equal(v.mail.to, "shan@vi.du");
  assert.ok(v.mail.text.includes(`${ORIGIN}/api/auth/email/verify?token=`));
  assert.deepEqual(await confirmEmail(store, tokenOf(v.mail.text), 20), { ok: true, accountId: "g_1" });
  return store;
}

describe("email và lấy lại mật khẩu", () => {
  it("chuẩn hóa email", () => {
    assert.equal(normalizeEmail("  A.B@Ví.Dụ.VN "), "a.b@ví.dụ.vn");
    assert.equal(normalizeEmail("khong-co-a-cong"), null);
    assert.equal(normalizeEmail("a@b"), null);
    assert.equal(normalizeEmail(`${"a".repeat(250)}@b.vn`), null);
  });

  it("email chỉ lưu sau khi xác nhận; mã dùng một lần, có hạn", async () => {
    const store = new MemoryAccountStore();
    await register(store, { username: "shan", password: "matkhau123", confirm: "matkhau123" }, "g_1", 1, newId);
    assert.deepEqual(await requestEmailVerify(store, "g_1", "sai", 10, ORIGIN), { ok: false, error: "badEmail" });
    const v = await requestEmailVerify(store, "g_1", "shan@vi.du", 10, ORIGIN);
    assert.ok(v.ok && v.mail);
    assert.equal((await store.get("g_1"))?.email, null);
    const token = tokenOf(v.mail.text);
    assert.deepEqual(await confirmEmail(store, token, 20), { ok: true, accountId: "g_1" });
    assert.equal((await store.get("g_1"))?.email, "shan@vi.du");
    assert.deepEqual(await confirmEmail(store, token, 30), { ok: false, error: "badToken" });
    assert.deepEqual(await confirmEmail(store, "", 30), { ok: false, error: "badToken" });
    // Email đang dùng thì không gửi lại thư.
    assert.deepEqual(await requestEmailVerify(store, "g_1", "SHAN@vi.du", 40, ORIGIN), { ok: true, mail: null });
    // Hết hạn.
    const late = await requestEmailVerify(store, "g_1", "moi@vi.du", 50, ORIGIN);
    assert.ok(late.ok && late.mail);
    assert.deepEqual(await confirmEmail(store, tokenOf(late.mail.text), 50 + VERIFY_TTL_MS), { ok: false, error: "badToken" });
    assert.equal((await store.get("g_1"))?.email, "shan@vi.du");
  });

  it("email đã thuộc tài khoản khác thì báo ở bước xác nhận", async () => {
    const store = await withEmail();
    await signIn(store, { provider: "github", subject: "2", name: "Khác", avatarUrl: null }, "g_2", 30, newId);
    const v = await requestEmailVerify(store, "g_2", "shan@vi.du", 40, ORIGIN);
    assert.ok(v.ok && v.mail);
    assert.deepEqual(await confirmEmail(store, tokenOf(v.mail.text), 50), { ok: false, error: "emailTaken" });
    assert.equal((await store.get("g_2"))?.email, null);
  });

  it("quên mật khẩu: theo tên hoặc email; không có thì im lặng; đặt lại xong mã hỏng, mở khóa", async () => {
    const store = await withEmail();
    assert.equal(await requestPasswordReset(store, "khongco", 100, ORIGIN), null);
    assert.equal(await requestPasswordReset(store, "ai@vi.du", 100, ORIGIN), null);
    const byName = await requestPasswordReset(store, " SHAN ", 100, ORIGIN);
    assert.equal(byName?.to, "shan@vi.du");
    assert.ok(byName?.text.includes(`${ORIGIN}/game/reset-password?token=`));
    assert.ok(byName?.text.includes('"shan"'));
    const byEmail = await requestPasswordReset(store, "Shan@Vi.Du", 100, ORIGIN);
    assert.equal(byEmail?.to, "shan@vi.du");

    // Đang bị khóa vì sai nhiều lần.
    for (let i = 0; i < 5; i++) await login(store, { username: "shan", password: "sai" }, 110);
    assert.equal((await store.getPassword("shan"))?.lockedUntil !== null, true);

    const token = tokenOf(byName!.text);
    // Mật khẩu mới không hợp lệ thì mã chưa bị dùng.
    assert.deepEqual(await resetPassword(store, { token, password: "ngan", confirm: "ngan" }, 120), { ok: false, error: "badPassword" });
    assert.deepEqual(await resetPassword(store, { token, password: "matkhaumoi", confirm: "khac12345" }, 120), { ok: false, error: "mismatch" });
    assert.deepEqual(await resetPassword(store, { token, password: "matkhaumoi", confirm: "matkhaumoi" }, 120), { ok: true, accountId: "g_1" });
    assert.deepEqual(await login(store, { username: "shan", password: "matkhaumoi" }, 130), { ok: true, accountId: "g_1" });
    assert.deepEqual(await login(store, { username: "shan", password: "matkhau123" }, 130), { ok: false, error: "wrong" });
    // Dùng lại mã, hoặc mã thứ hai cùng lúc: đều hỏng.
    const again = { password: "khac12345", confirm: "khac12345" };
    assert.deepEqual(await resetPassword(store, { token, ...again }, 140), { ok: false, error: "badToken" });
    assert.deepEqual(await resetPassword(store, { token: tokenOf(byEmail!.text), ...again }, 140), { ok: false, error: "badToken" });
  });

  it("mã đặt lại có hạn, hỏng khi đổi email, tài khoản không có email hay tên đăng nhập thì không gửi", async () => {
    const store = await withEmail();
    const m1 = await requestPasswordReset(store, "shan", 100, ORIGIN);
    const ok = { password: "matkhaumoi", confirm: "matkhaumoi" };
    assert.deepEqual(await resetPassword(store, { token: tokenOf(m1!.text), ...ok }, 100 + RESET_TTL_MS), { ok: false, error: "badToken" });

    const m2 = await requestPasswordReset(store, "shan", 200, ORIGIN);
    const v = await requestEmailVerify(store, "g_1", "moi@vi.du", 210, ORIGIN);
    assert.ok(v.ok && v.mail);
    await confirmEmail(store, tokenOf(v.mail.text), 220);
    assert.deepEqual(await resetPassword(store, { token: tokenOf(m2!.text), ...ok }, 230), { ok: false, error: "badToken" });

    await register(store, { username: "khong_email", password: "matkhau123", confirm: "matkhau123" }, "g_3", 1, newId);
    assert.equal(await requestPasswordReset(store, "khong_email", 300, ORIGIN), null);
  });

  it("giới hạn số thư mỗi giờ", async () => {
    const store = await withEmail();
    for (let i = 0; i < MAX_MAILS_PER_HOUR; i++) assert.ok(await requestPasswordReset(store, "shan", 1000 + i, ORIGIN));
    assert.equal(await requestPasswordReset(store, "shan", 2000, ORIGIN), null);
    assert.ok(await requestPasswordReset(store, "shan", 1000 + MAX_MAILS_PER_HOUR + 60 * 60 * 1000, ORIGIN));

    for (let i = 0; i < MAX_MAILS_PER_HOUR; i++) assert.ok((await requestEmailVerify(store, "g_1", `e${i}@vi.du`, 3000, ORIGIN)).ok);
    assert.deepEqual(await requestEmailVerify(store, "g_1", "e9@vi.du", 3000, ORIGIN), { ok: false, error: "tooMany" });
  });
});
