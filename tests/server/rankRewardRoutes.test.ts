import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { vnDay } from "../../src/core";
import { GET as pending } from "../../src/app/api/rank-rewards/route";
import { POST as claim } from "../../src/app/api/rank-rewards/claim/route";
import { signGuest } from "../../src/server/guest";
import { accountStore, dailyStore, profileStore } from "../../src/server/store";
import { loadProfile } from "../../src/server/profiles";

const ORIGIN = "http://localhost";
const post = (body: unknown, cookie?: string, origin: string | null = ORIGIN) =>
  new NextRequest(`${ORIGIN}/api/rank-rewards/claim`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(origin ? { origin } : {}), ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
const get = (cookie?: string) => new NextRequest(`${ORIGIN}/api/rank-rewards`, { headers: cookie ? { cookie } : {} });

const saved = { secret: process.env.SESSION_SECRET, db: process.env.DATABASE_URL };
beforeEach(() => {
  delete process.env.DATABASE_URL;
  process.env.SESSION_SECRET = "khoa-test-thuong-hang";
});
afterEach(() => {
  for (const [k, v] of [["SESSION_SECRET", saved.secret], ["DATABASE_URL", saved.db]] as const) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("route thưởng hạng theo kỳ", () => {
  it("khách và người chưa đăng nhập: danh sách rỗng, nhận bị 401, khác nguồn gốc bị 400", async () => {
    const guest = `colau_guest=${signGuest("g_khach_thuong")}`;
    for (const cookie of [undefined, guest]) {
      const b = await (await pending(get(cookie))).json();
      assert.deepEqual([b.canClaim, b.items], [false, []]);
    }
    assert.equal((await claim(post({ mode: "daily", period: "2026-01-01" }))).status, 401);
    assert.equal((await claim(post({ mode: "daily", period: "2026-01-01" }, guest))).status, 401);
    assert.equal((await claim(post({ mode: "daily", period: "2026-01-01" }, guest, "http://evil.example"))).status, 400);
    assert.equal((await claim(post({ mode: "daily", period: "2026-01-01" }, guest, null))).status, 400);
  });

  it("tài khoản đăng nhập: thấy thưởng hôm qua, nhận đúng một lần, vàng vào hồ sơ", async () => {
    const id = "g_tai_khoan_thuong";
    await accountStore().link(id, { provider: "github", subject: "tk-thuong-hang", name: "Người Thử", avatarUrl: null }, Date.now());
    const cookie = `colau_guest=${signGuest(id)}`;
    const yesterday = vnDay(Date.now() - 24 * 3600_000);
    await dailyStore().start(yesterday, id, "m_thu", 1);
    await dailyStore().finish(yesterday, id, { won: true, turns: 20, permille: 800, score: 999_000 }, 2);

    const list = await (await pending(get(cookie))).json();
    assert.equal(list.canClaim, true);
    const item = list.items.find((i: { mode: string; period: string }) => i.mode === "daily" && i.period === yesterday);
    assert.ok(item && item.gold > 0);

    const first = await claim(post({ mode: "daily", period: yesterday }, cookie));
    assert.equal(first.status, 200);
    assert.equal((await first.json()).gold, item.gold);
    assert.equal((await loadProfile(profileStore(), id)).profile.gold >= item.gold, true);
    assert.equal((await claim(post({ mode: "daily", period: yesterday }, cookie))).status, 409);
    assert.equal((await claim(post({ mode: "la", period: yesterday }, cookie))).status, 404);
    assert.equal((await claim(post({ mode: "daily", period: vnDay(Date.now()) }, cookie))).status, 409);
  });
});
