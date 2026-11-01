import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { GET as overview } from "../../src/app/api/formation/route";
import { POST as claim } from "../../src/app/api/formation/claim/route";
import { POST as move } from "../../src/app/api/formation/move/route";
import { POST as start } from "../../src/app/api/formation/start/route";
import { formationRankedEnabled } from "../../src/server/featureFlags";
import { signGuest } from "../../src/server/guest";
import { accountStore } from "../../src/server/store";

const ORIGIN = "http://localhost";
const post = (path: string, body: unknown, cookie?: string, origin: string | null = ORIGIN) =>
  new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(origin ? { origin } : {}), ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });

const saved = { flag: process.env.FORMATION_RANKED_ENABLED, secret: process.env.SESSION_SECRET, db: process.env.DATABASE_URL };
beforeEach(() => {
  delete process.env.DATABASE_URL;
  process.env.SESSION_SECRET = "khoa-test-route";
});
afterEach(() => {
  for (const [k, v] of [["FORMATION_RANKED_ENABLED", saved.flag], ["SESSION_SECRET", saved.secret], ["DATABASE_URL", saved.db]] as const) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("cờ tính năng Trận Đồ xếp hạng", () => {
  it("chỉ chuỗi true mới bật; mặc định tắt", () => {
    assert.equal(formationRankedEnabled({}), false);
    for (const v of ["", "1", "TRUE", "yes", "false"]) assert.equal(formationRankedEnabled({ FORMATION_RANKED_ENABLED: v }), false);
    assert.equal(formationRankedEnabled({ FORMATION_RANKED_ENABLED: "true" }), true);
  });
});

describe("route Trận Đồ xếp hạng", () => {
  it("tắt cờ: tổng quan báo tắt, mở ván bị 403 và không tạo cookie", async () => {
    delete process.env.FORMATION_RANKED_ENABLED;
    const o = await (await overview(new NextRequest(`${ORIGIN}/api/formation`))).json();
    assert.equal(o.enabled, false);
    const r = await start(post("/api/formation/start", { level: "thuong" }));
    assert.equal(r.status, 403);
    assert.equal(r.headers.get("set-cookie"), null);
  });

  it("chặn POST khác nguồn gốc", async () => {
    process.env.FORMATION_RANKED_ENABLED = "true";
    assert.equal((await start(post("/api/formation/start", { level: "thuong" }, undefined, "http://evil.example"))).status, 400);
    assert.equal((await start(post("/api/formation/start", { level: "thuong" }, undefined, null))).status, 400);
    assert.equal((await move(post("/api/formation/move", { level: "thuong", seq: 0, command: { kind: "discard" } }, undefined, null))).status, 400);
    assert.equal((await claim(post("/api/formation/claim", { level: "thuong", period: "2026-11-04" }, undefined, "http://evil.example"))).status, 400);
  });

  it("khách (chưa đăng nhập) không chơi được: không có cookie hoặc cookie khách đều bị 401, không tạo cookie mới", async () => {
    process.env.FORMATION_RANKED_ENABLED = "true";
    const noCookie = await start(post("/api/formation/start", { level: "kho" }));
    assert.equal(noCookie.status, 401);
    assert.equal(noCookie.headers.get("set-cookie"), null);
    const guest = `colau_guest=${signGuest("g_chi_la_khach")}`;
    assert.equal((await start(post("/api/formation/start", { level: "kho" }, guest))).status, 401);
    assert.equal((await move(post("/api/formation/move", { level: "kho", seq: 0, command: { kind: "discard" } }, guest))).status, 401);
    assert.equal((await claim(post("/api/formation/claim", { level: "kho", period: "2026-11-01" }, guest))).status, 401);
    const o = await (await overview(new NextRequest(`${ORIGIN}/api/formation`, { headers: { cookie: guest } }))).json();
    assert.equal(o.enabled, true);
    assert.equal(o.canPlay, false);
  });

  it("luồng đầy đủ với tài khoản đã đăng nhập: mở ván, đi nước, không lộ seed, bậc lạ bị 404", async () => {
    process.env.FORMATION_RANKED_ENABLED = "true";
    const id = "g_tai_khoan_thu";
    await accountStore().link(id, { provider: "github", subject: "tai-khoan-thu", name: "Người Thử", avatarUrl: null }, Date.now());
    const cookie = `colau_guest=${signGuest(id)}`;
    const res = await start(post("/api/formation/start", { level: "kho" }, cookie));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.view.level, "kho");
    assert.ok(!("seed" in body.view.puzzle) && !("rngState" in body.view.puzzle));

    const moved = await move(post("/api/formation/move", { level: "kho", seq: 0, command: { kind: "discard" } }, cookie));
    assert.equal(moved.status, 200);
    const mb = await moved.json();
    assert.equal(mb.view.seq, 1);
    assert.ok(Array.isArray(mb.events));

    const stale = await move(post("/api/formation/move", { level: "kho", seq: 0, command: { kind: "discard" } }, cookie));
    assert.equal(stale.status, 409);
    const bad = await move(post("/api/formation/move", { level: "kho", seq: 1, command: { kind: "place", row: 999, col: 0 } }, cookie));
    assert.equal(bad.status, 422);

    const unknown = await start(post("/api/formation/start", { level: "huong-dan" }, cookie));
    assert.equal(unknown.status, 404);

    const o = await (await overview(new NextRequest(`${ORIGIN}/api/formation`, { headers: { cookie } }))).json();
    assert.equal(o.enabled, true);
    assert.equal(o.canPlay, true);
    const kho = o.levels.find((l: { level: string }) => l.level === "kho");
    assert.equal(kho.mine.seq, 1);
    assert.deepEqual(o.levels.map((l: { level: string }) => l.level), ["thuong", "kho", "dai-tran"]);
  });
});
