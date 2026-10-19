import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MemoryAccountStore, signIn } from "../../src/server/accounts";
import { changePassword, hashPassword, LOCK_MS, login, MAX_FAILURES, register, verifyPassword } from "../../src/server/password";

const newId = () => "g_moi";
const reg = (username: string, password = "matkhau123", confirm = password) => ({ username, password, confirm });

describe("tên đăng nhập + mật khẩu", () => {
  it("băm scrypt có muối, kiểm tra đúng sai", async () => {
    const a = await hashPassword("Mật khẩu 1");
    const b = await hashPassword("Mật khẩu 1");
    assert.notEqual(a, b);
    assert.ok(a.startsWith("scrypt$"));
    assert.equal(await verifyPassword("Mật khẩu 1", a), true);
    assert.equal(await verifyPassword("mật khẩu 1", a), false);
    assert.equal(await verifyPassword("x", "rác"), false);
  });

  it("đăng ký: kiểm tra tên, mật khẩu, trùng tên; gắn vào tài khoản khách đang dùng", async () => {
    const store = new MemoryAccountStore();
    assert.deepEqual(await register(store, reg("ab"), null, 1, newId), { ok: false, error: "badUsername" });
    assert.deepEqual(await register(store, reg("tên có dấu"), null, 1, newId), { ok: false, error: "badUsername" });
    assert.deepEqual(await register(store, reg("shan", "ngan"), null, 1, newId), { ok: false, error: "badPassword" });
    assert.deepEqual(await register(store, reg("shan", "matkhau123", "khac12345"), null, 1, newId), { ok: false, error: "mismatch" });
    assert.deepEqual(await register(store, reg(" Shan.Chen "), "g_khach", 1, newId), { ok: true, accountId: "g_khach" });
    const acc = await store.get("g_khach");
    assert.equal(acc?.username, "shan.chen");
    assert.equal(acc?.name, "shan.chen");
    assert.deepEqual(acc?.providers, []);
    assert.deepEqual(await register(store, reg("SHAN.CHEN"), "g_2", 2, newId), { ok: false, error: "taken" });
    assert.deepEqual(await register(store, reg("ten_khac"), "g_khach", 2, newId), { ok: false, error: "hasPassword" });
    // Chưa có cookie: tài khoản mới.
    assert.deepEqual(await register(store, reg("nguoi_moi"), null, 3, newId), { ok: true, accountId: "g_moi" });
  });

  it("đã đăng nhập GitHub thì thêm tên đăng nhập vào cùng tài khoản, giữ tên hiển thị", async () => {
    const store = new MemoryAccountStore();
    await signIn(store, { provider: "github", subject: "1", name: "Shan", avatarUrl: null }, "g_1", 1, newId);
    assert.equal((await register(store, reg("shan"), "g_1", 2, newId)).ok, true);
    const acc = await store.get("g_1");
    assert.equal(acc?.name, "Shan");
    assert.equal(acc?.username, "shan");
    assert.deepEqual(acc?.providers, ["github"]);
  });

  it("đăng nhập: đúng vào tài khoản; sai hoặc tên không có báo như nhau; sai nhiều lần thì khóa", async () => {
    const store = new MemoryAccountStore();
    await register(store, reg("shan"), "g_1", 1, newId);
    assert.deepEqual(await login(store, { username: "SHAN", password: "matkhau123" }, 10), { ok: true, accountId: "g_1" });
    assert.deepEqual(await login(store, { username: "khongco", password: "matkhau123" }, 10), { ok: false, error: "wrong" });
    for (let i = 1; i < MAX_FAILURES; i++) {
      assert.deepEqual(await login(store, { username: "shan", password: "sai" }, 100), { ok: false, error: "wrong" });
    }
    assert.deepEqual(await login(store, { username: "shan", password: "sai" }, 100), { ok: false, error: "locked" });
    // Đang khóa thì mật khẩu đúng cũng không vào được; hết hạn khóa thì vào được.
    assert.deepEqual(await login(store, { username: "shan", password: "matkhau123" }, 100 + LOCK_MS - 1), { ok: false, error: "locked" });
    assert.deepEqual(await login(store, { username: "shan", password: "matkhau123" }, 100 + LOCK_MS), { ok: true, accountId: "g_1" });
    assert.equal((await store.getPassword("shan"))?.lockedUntil, null);
  });

  it("đổi mật khẩu cần mật khẩu hiện tại", async () => {
    const store = new MemoryAccountStore();
    await register(store, reg("shan"), "g_1", 1, newId);
    const input = { current: "matkhau123", password: "moi123456", confirm: "moi123456" };
    assert.deepEqual(await changePassword(store, "g_2", input, 5), { ok: false, error: "noPassword" });
    assert.deepEqual(await changePassword(store, "g_1", { ...input, current: "sai" }, 5), { ok: false, error: "wrong" });
    assert.deepEqual(await changePassword(store, "g_1", { ...input, confirm: "khac" }, 5), { ok: false, error: "mismatch" });
    assert.deepEqual(await changePassword(store, "g_1", input, 5), { ok: true, accountId: "g_1" });
    assert.equal((await login(store, { username: "shan", password: "matkhau123" }, 6)).ok, false);
    assert.equal((await login(store, { username: "shan", password: "moi123456" }, 7)).ok, true);
  });
});
