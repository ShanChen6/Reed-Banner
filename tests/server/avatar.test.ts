import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MemoryAccountStore } from "../../src/server/accounts";
import { chooseAvatar } from "../../src/server/avatar";
import { MemoryProfileStore } from "../../src/server/profiles";

const T0 = Date.UTC(2026, 10, 18);

describe("ảnh đại diện chọn trong game", () => {
  it("đặt chân dung tướng đã có, chặn tướng chưa có, về chữ cái đầu bằng null", async () => {
    const accounts = new MemoryAccountStore();
    const profiles = new MemoryProfileStore();
    await accounts.createPassword("g_a", "shan", "hash", T0);
    const ok = await chooseAvatar("g_a", "dinhBoLinh", { accounts, profiles });
    assert.ok(ok.ok && ok.avatarUrl === "/art/characters/dinh-bo-linh/portrait.webp");
    assert.equal((await accounts.get("g_a"))?.avatarUrl, "/art/characters/dinh-bo-linh/portrait.webp");
    assert.deepEqual(await chooseAvatar("g_a", "leHoan", { accounts, profiles }), { ok: false, error: "notOwned" });
    assert.deepEqual(await chooseAvatar("g_a", null, { accounts, profiles }), { ok: true, avatarUrl: null });
    assert.equal((await accounts.get("g_a"))?.avatarUrl, null);
  });

  it("trình danh lại bằng Google không ghi đè ảnh chọn trong game", async () => {
    const accounts = new MemoryAccountStore();
    const profiles = new MemoryProfileStore();
    const google = { provider: "google", subject: "s1", name: "Shan", avatarUrl: "https://example.com/a.png" } as const;
    await accounts.link("g_b", google, T0);
    assert.equal((await accounts.get("g_b"))?.avatarUrl, "https://example.com/a.png");
    await chooseAvatar("g_b", "dinhBoLinh", { accounts, profiles });
    await accounts.link("g_b", google, T0 + 1);
    assert.equal((await accounts.get("g_b"))?.avatarUrl, "/art/characters/dinh-bo-linh/portrait.webp");
  });
});
