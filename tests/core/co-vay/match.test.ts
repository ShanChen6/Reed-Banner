import assert from "node:assert/strict";
import test from "node:test";

import { BLACK, PASS, WHITE, goPlay, goPosition, goResign, goSettle, goTimeLeft, newGoMatch, parseGoPoint } from "../../../src/core/co-vay";

const fresh = (mode: "full" | "capture" = "full", clockMs = 60_000) =>
  newGoMatch({ size: 9, mode, elements: { [BLACK]: "hoa", [WHITE]: "thuy" } as const, clockMs, startedAt: 0 });

test("ván đấu người: đi đúng lượt, nước sai và chưa tới lượt bị từ chối", () => {
  let m = fresh();
  assert.deepEqual(goPlay(m, WHITE, 40, 10), { ok: false, error: "notYourTurn" });
  const r = goPlay(m, BLACK, 40, 1000);
  assert.ok(r.ok);
  m = r.match;
  assert.deepEqual(goPlay(m, WHITE, 40, 1500), { ok: false, error: "illegal" });
  assert.equal(goTimeLeft(m, 1000)[BLACK], 59_000);
  assert.equal(goTimeLeft(m, 3000)[WHITE], 58_000);
});

test("phòng chưa có người vào thì chưa đi được", () => {
  const m = { ...fresh(), turnStartedAt: null };
  assert.deepEqual(goPlay(m, BLACK, 40, 0), { ok: false, error: "waiting" });
});

test("hai bên bỏ lượt thì server đếm điểm", () => {
  let m = fresh();
  for (const [c, p] of [[BLACK, 40], [WHITE, PASS], [BLACK, PASS]] as const) {
    const r = goPlay(m, c, p, 10);
    assert.ok(r.ok);
    m = r.match;
  }
  assert.equal(m.result?.reason, "score");
  assert.equal(m.result?.winner, BLACK);
  assert.equal(m.result?.score?.black, 81);
  assert.equal(m.result?.score?.white, 7.5);
  assert.deepEqual(goPlay(m, WHITE, 0, 20), { ok: false, error: "ended" });
});

test("ván nhập môn: bắt được quân đầu tiên là thắng", () => {
  let m = fresh("capture");
  // Thế chéo giữa bàn 9x9: Trắng ở 30 và 40, Đen ở 31 và 39. Trắng 30 còn hai khí 21 và 29.
  assert.deepEqual([30, 31, 39, 40].map((p) => goPosition(m).board[p]), [WHITE, BLACK, BLACK, WHITE]);
  for (const [c, p] of [[BLACK, 21], [WHITE, 0]] as const) {
    const r = goPlay(m, c, p, 0);
    assert.ok(r.ok);
    m = r.match;
  }
  const r = goPlay(m, BLACK, 29, 0);
  assert.ok(r.ok);
  assert.deepEqual(r.match.result, { winner: BLACK, reason: "capture" });
});

test("hết giờ và đầu hàng", () => {
  const m = fresh("full", 5_000);
  const late = goSettle(m, 6_000);
  assert.deepEqual(late.result, { winner: WHITE, reason: "timeout" });
  assert.deepEqual(goPlay(m, BLACK, 40, 6_000), { ok: false, error: "ended" });
  const r = goResign(m, BLACK, 100);
  assert.ok(r.ok && r.match.result?.winner === WHITE && r.match.result.reason === "resign");
});

test("kiểm điểm gửi lên", () => {
  assert.equal(parseGoPoint(PASS, 9), PASS);
  assert.equal(parseGoPoint(80, 9), 80);
  assert.equal(parseGoPoint(81, 9), null);
  assert.equal(parseGoPoint("4", 9), null);
  assert.equal(parseGoPoint(1.5, 9), null);
});
