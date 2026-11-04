// LT-04: dịch vụ server Tầm Tướng Ký trên kho hồ sơ trong bộ nhớ (cờ, đăng nhập, lượt, gửi trùng, song song).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TTK_START_TICKETS } from "../../src/core/tam-tuong-ky";
import { MemoryProfileStore, loadProfile } from "../../src/server/profiles";
import {
  combineTamTuongKy,
  getTamTuongKy,
  hintTamTuongKy,
  openTamTuongKySession,
  ttkHttpStatus,
  type TamTuongKyDeps,
} from "../../src/server/tamTuongKy";

const T0 = Date.parse("2026-11-04T05:00:00Z");
const OWNER = "acc-1";

function deps(over: Partial<TamTuongKyDeps> = {}): TamTuongKyDeps {
  return { profiles: new MemoryProfileStore(), now: T0, enabled: true, isSignedIn: async (id) => id === OWNER, ...over };
}

describe("server Tầm Tướng Ký", () => {
  it("cờ tắt: featureDisabled (403) cho mọi API", async () => {
    const d = deps({ enabled: false });
    for (const r of [await getTamTuongKy(d, OWNER), await openTamTuongKySession(d, OWNER, "req-00000001")]) {
      assert.deepEqual([r.ok, !r.ok && r.error], [false, "featureDisabled"]);
    }
    assert.equal(ttkHttpStatus("featureDisabled"), 403);
  });

  it("khách hoặc không có cookie: loginRequired (401)", async () => {
    const d = deps();
    for (const owner of ["guest-9", null]) {
      const r = await combineTamTuongKy(d, owner, "req-00000001", "elt.moc", "elt.moc");
      assert.deepEqual([r.ok, !r.ok && r.error], [false, "loginRequired"]);
    }
    assert.equal(ttkHttpStatus("loginRequired"), 401);
  });

  it("GET không ghi hồ sơ; tài khoản mới hiện 3 phiếu, chưa có lượt", async () => {
    const d = deps();
    const r = await getTamTuongKy(d, OWNER);
    assert.ok(r.ok);
    assert.equal(r.view.tickets, TTK_START_TICKETS);
    assert.equal(r.view.session, null);
    assert.equal(r.view.hintsLeft, 2);
    assert.equal((await loadProfile(d.profiles, OWNER)).version, 0);
  });

  it("ghép khi chưa mở lượt: noSession (409)", async () => {
    const r = await combineTamTuongKy(deps(), OWNER, "req-00000001", "elt.moc", "elt.moc");
    assert.deepEqual([r.ok, !r.ok && r.error], [false, "noSession"]);
    assert.equal(ttkHttpStatus("noSession"), 409);
  });

  it("mở lượt, ghép, gợi ý: lưu vào hồ sơ tài khoản", async () => {
    const d = deps();
    const opened = await openTamTuongKySession(d, OWNER, "req-00000001");
    assert.ok(opened.ok);
    assert.equal(opened.view.tickets, TTK_START_TICKETS - 1);
    const made = await combineTamTuongKy(d, OWNER, "req-00000002", "elt.moc", "elt.moc");
    assert.ok(made.ok && made.response?.kind === "combine" && made.response.status === "created");
    assert.equal(made.view.session?.combinesLeft, 14);
    const hint = await hintTamTuongKy(d, OWNER, "req-00000003", 1);
    assert.ok(hint.ok);
    assert.equal(hint.view.hintsLeft, 1);
    const stored = await loadProfile(d.profiles, OWNER);
    assert.ok(stored.profile.tamTuongKy?.discovery.discoveredNodeIds.includes("mat.bamboo"));
    assert.equal(stored.profile.gold, 0);
  });

  it("hai request cùng requestId song song: chỉ trừ một lần ghép", async () => {
    const d = deps();
    await openTamTuongKySession(d, OWNER, "req-00000001");
    const [a, b] = await Promise.all([
      combineTamTuongKy(d, OWNER, "req-00000002", "elt.loi", "elt.loi"),
      combineTamTuongKy(d, OWNER, "req-00000002", "elt.loi", "elt.loi"),
    ]);
    assert.ok(a.ok && b.ok);
    assert.deepEqual(a.response, b.response);
    const now = await getTamTuongKy(d, OWNER);
    assert.ok(now.ok);
    assert.equal(now.view.session?.combinesLeft, 14);
  });

  it("mở lượt song song bằng hai requestId: chỉ trừ một phiếu", async () => {
    const d = deps();
    await Promise.all([openTamTuongKySession(d, OWNER, "req-00000001"), openTamTuongKySession(d, OWNER, "req-00000009")]);
    const now = await getTamTuongKy(d, OWNER);
    assert.ok(now.ok);
    assert.equal(now.view.tickets, TTK_START_TICKETS - 1);
  });

  it("hết phiếu: noTicket kèm view hiện tại", async () => {
    const d = deps();
    for (let i = 0; i < TTK_START_TICKETS; i++) {
      await openTamTuongKySession(d, OWNER, `req-open-${i}`);
      for (let k = 0; k < 15; k++) await combineTamTuongKy(d, OWNER, `req-${i}-${k}-xx`, "elt.loi", "elt.loi");
    }
    const r = await openTamTuongKySession(d, OWNER, "req-last-0001");
    assert.ok(!r.ok && r.error === "noTicket");
    assert.equal(r.view?.tickets, 0);
  });
});
