import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { GET as getOverview, POST as postQueue } from "../../src/app/api/pvp/route";
import { GET as getMatch, POST as postAction } from "../../src/app/api/pvp/[id]/route";
import { GET as getRoom, POST as postRoom } from "../../src/app/api/pvp/rooms/route";
import { pvpEnabled } from "../../src/server/featureFlags";

const saved = process.env.PVP_ENABLED;
afterEach(() => {
  if (saved === undefined) delete process.env.PVP_ENABLED;
  else process.env.PVP_ENABLED = saved;
});

const req = (path: string, init?: ConstructorParameters<typeof NextRequest>[1]) => new NextRequest(`http://localhost${path}`, init);
const post = (path: string, body: unknown) =>
  req(path, { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost" }, body: JSON.stringify(body) });
const params = Promise.resolve({ id: "m1" });

describe("PvP: cờ tính năng và cổng đăng nhập", () => {
  it("cờ PVP_ENABLED mặc định tắt, chỉ chuỗi true mới bật", () => {
    assert.equal(pvpEnabled({}), false);
    assert.equal(pvpEnabled({ PVP_ENABLED: "1" }), false);
    assert.equal(pvpEnabled({ PVP_ENABLED: "true" }), true);
  });

  it("cờ tắt thì mọi route trả featureDisabled (503)", async () => {
    delete process.env.PVP_ENABLED;
    for (const res of [
      await getOverview(req("/api/pvp")),
      await postQueue(post("/api/pvp", { action: "queue", format: "duel" })),
      await getMatch(req("/api/pvp/m1"), { params }),
      await postAction(post("/api/pvp/m1", { action: { type: "swap", from: { row: 0, col: 0 }, to: { row: 0, col: 1 } } }), { params }),
      await getRoom(req("/api/pvp/rooms")),
      await postRoom(post("/api/pvp/rooms", { action: "create" })),
    ]) {
      assert.equal(res.status, 503);
      assert.equal((await res.json()).error, "featureDisabled");
    }
  });

  it("cờ bật nhưng chưa đăng nhập thì trả loginRequired (401)", async () => {
    process.env.PVP_ENABLED = "true";
    for (const res of [
      await getOverview(req("/api/pvp")),
      await postQueue(post("/api/pvp", { action: "queue", format: "duel" })),
      await getMatch(req("/api/pvp/m1"), { params }),
      await postAction(post("/api/pvp/m1", { action: { type: "swap", from: { row: 0, col: 0 }, to: { row: 0, col: 1 } } }), { params }),
      await getRoom(req("/api/pvp/rooms")),
      await postRoom(post("/api/pvp/rooms", { action: "create" })),
    ]) {
      assert.equal(res.status, 401);
      assert.equal((await res.json()).error, "loginRequired");
    }
  });

  it("POST khác nguồn bị từ chối", async () => {
    process.env.PVP_ENABLED = "true";
    const res = await postQueue(req("/api/pvp", { method: "POST", headers: { origin: "http://evil.example", "content-type": "application/json" }, body: "{}" }));
    assert.equal(res.status, 403);
  });
});
