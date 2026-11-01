import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { GET as arenaGet, POST as arenaPost } from "../../src/app/api/arena/route";
import { POST as destinyBattles } from "../../src/app/api/destiny/battles/route";
import { POST as destinyReward } from "../../src/app/api/destiny/reward/route";
import { POST as destinyRun } from "../../src/app/api/destiny/run/route";
import { POST as destinyStop } from "../../src/app/api/destiny/stop/route";
import { actBattle, createBattleFor, getBattle, httpStatus, parseNewBattle, type Deps } from "../../src/server/battles";
import { MemoryDailyStore } from "../../src/server/daily";
import { signGuest } from "../../src/server/guest";
import { MemoryProfileStore } from "../../src/server/profiles";
import { MemoryMatchStore, accountStore } from "../../src/server/store";

const T0 = 5_000_000;
const base = { mode: "3v3", element: "kim", profession: "ySu", companions: ["haVan", "maiThanh"], difficulty: "easy" };

function deps(signedIn: boolean | ((id: string) => boolean) | undefined): Deps {
  let n = 0;
  return {
    store: new MemoryMatchStore(),
    profiles: new MemoryProfileStore(),
    daily: new MemoryDailyStore(),
    dailySecret: "bí mật",
    now: T0,
    seed: 5,
    newId: () => `m_${++n}`,
    ...(signedIn === undefined ? {} : { isSignedIn: async (id: string) => (typeof signedIn === "function" ? signedIn(id) : signedIn) }),
  };
}

describe("chế độ online có xếp hạng và thưởng: chặn khách ở tầng service", () => {
  it("khách không mở được Sinh tồn, Nhật Lệnh, Quần Hùng", async () => {
    const d = deps(false);
    for (const body of [{ ...base, survival: true }, { daily: true }, { ...base, arena: 0 }]) {
      const input = parseNewBattle(body);
      assert.ok(input, JSON.stringify(body));
      assert.deepEqual(await createBattleFor("khach", input, d), { ok: false, error: "loginRequired" });
    }
    assert.equal(httpStatus("loginRequired"), 401);
  });

  it("khách vẫn chơi thường thoải mái (1vs1, 3vs3 online)", async () => {
    const d = deps(false);
    assert.ok((await createBattleFor("khach", parseNewBattle(base)!, d)).ok);
    assert.ok((await createBattleFor("khach", parseNewBattle({ ...base, mode: "1v1", companions: [] })!, d)).ok);
  });

  it("tài khoản đăng nhập mở được Sinh tồn và Nhật Lệnh", async () => {
    const d = deps(true);
    assert.ok((await createBattleFor("tk", parseNewBattle({ ...base, survival: true })!, d)).ok);
    assert.ok((await createBattleFor("tk2", parseNewBattle({ daily: true })!, d)).ok);
  });

  it("không có isSignedIn (caller nội bộ, test cũ) thì không chặn", async () => {
    assert.ok((await createBattleFor("x", parseNewBattle({ ...base, survival: true })!, deps(undefined))).ok);
  });

  it("trận xếp hạng đang dở của khách không xem, không đi tiếp được; trận thường thì được", async () => {
    // Tạo khi còn là tài khoản, rồi mô phỏng khách (đăng xuất, xóa cookie) bằng isSignedIn trả false.
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const open = { ...deps(true), store, profiles };
    const ranked = await createBattleFor("g", parseNewBattle({ ...base, survival: true })!, open);
    const normal = await createBattleFor("g", parseNewBattle(base)!, { ...open, newId: () => "m_normal" });
    assert.ok(ranked.ok && normal.ok);
    const guest = { ...open, isSignedIn: async () => false };
    assert.deepEqual(await getBattle(ranked.id, "g", guest), { ok: false, error: "loginRequired" });
    assert.deepEqual(await actBattle(ranked.id, "g", { seq: 0, action: { type: "nextWave" } }, guest), { ok: false, error: "loginRequired" });
    assert.ok((await getBattle(normal.id, "g", guest)).ok);
  });
});

describe("route chế độ online có xếp hạng và thưởng", () => {
  const saved = { secret: process.env.SESSION_SECRET, db: process.env.DATABASE_URL, destiny: process.env.DESTINY_ENABLED };
  beforeEach(() => {
    delete process.env.DATABASE_URL;
    process.env.SESSION_SECRET = "khoa-test-chan-khach";
    process.env.DESTINY_ENABLED = "true";
  });
  afterEach(() => {
    for (const [k, v] of [["SESSION_SECRET", saved.secret], ["DATABASE_URL", saved.db], ["DESTINY_ENABLED", saved.destiny]] as const) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
  const req = (path: string, method: "GET" | "POST", cookie?: string, body: unknown = {}) =>
    new NextRequest(`http://localhost${path}`, {
      method,
      headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
    });

  it("khách (không cookie hoặc cookie khách) bị 401 ở Quần Hùng và Thiên Mệnh, không tạo cookie", async () => {
    const guest = `colau_guest=${signGuest("g_chi_la_khach_chan")}`;
    for (const cookie of [undefined, guest]) {
      for (const res of [
        await arenaGet(req("/api/arena", "GET", cookie)),
        await arenaPost(req("/api/arena", "POST", cookie, { action: "defend" })),
        await destinyRun(req("/api/destiny/run", "POST", cookie, { rosterIds: [] })),
      ]) {
        assert.equal(res.status, 401);
        assert.equal((await res.json()).error, "loginRequired");
        assert.equal(res.headers.get("set-cookie"), null);
      }
    }
    for (const handler of [destinyBattles, destinyReward]) {
      assert.equal((await handler(req("/api/x", "POST", guest))).status, 401);
    }
  });

  it("khách vẫn kết thúc được run Thiên Mệnh có sẵn (stop không bị chặn)", async () => {
    const res = await destinyStop(req("/api/destiny/stop", "POST", `colau_guest=${signGuest("g_khach_dung_run")}`));
    assert.notEqual(res.status, 401);
  });

  it("tài khoản đăng nhập vào được Quần Hùng", async () => {
    const id = "g_tai_khoan_quan_hung";
    await accountStore().link(id, { provider: "github", subject: "tk-quan-hung", name: "Người Thử", avatarUrl: null }, Date.now());
    const res = await arenaGet(req("/api/arena", "GET", `colau_guest=${signGuest(id)}`));
    assert.equal(res.status, 200);
  });
});
