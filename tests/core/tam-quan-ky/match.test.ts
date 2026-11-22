import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BLUE,
  RED,
  legalMoves,
  newGame,
  newTqkMatch,
  parseTqkMove,
  tqkMachine,
  tqkPlay,
  tqkPosition,
  tqkResign,
  tqkSettle,
  tqkTimeLeft,
} from "../../../src/core/tam-quan-ky";

const T0 = 1_000_000;
const online = () => newTqkMatch({ mode: "online", level: null, rival: "x", human: RED, clockMs: 60_000, startedAt: T0 });

describe("Tam Quân Kỳ: ván server làm trọng tài", () => {
  it("chỉ nhận nước đúng lượt và đúng luật, trừ đồng hồ bên vừa đi", () => {
    const m = online();
    const move = legalMoves(newGame())[0]!;
    assert.deepEqual(tqkPlay(m, BLUE, move, T0 + 1000), { ok: false, error: "notYourTurn" });
    assert.deepEqual(tqkPlay(m, RED, { ...move, to: move.from }, T0), { ok: false, error: "illegal" });
    const r = tqkPlay(m, RED, move, T0 + 5000);
    assert.ok(r.ok);
    assert.equal(r.match.moves.length, 1);
    assert.equal(r.match.timeLeft.r, 55_000);
    assert.equal(r.match.timeLeft.b, 60_000);
    assert.equal(r.match.turnStartedAt, T0 + 5000);
    assert.equal(tqkPosition(r.match).toMove, BLUE);
  });

  it("phòng chưa bắt đầu thì chưa đi được", () => {
    const m = newTqkMatch({ mode: "online", level: null, rival: "x", human: RED, clockMs: 60_000, startedAt: null });
    assert.deepEqual(tqkPlay(m, RED, legalMoves(newGame())[0]!, T0), { ok: false, error: "waiting" });
  });

  it("cạn đồng hồ thì bên tới lượt thua, không đi tiếp được", () => {
    const m = online();
    assert.equal(tqkSettle(m, T0 + 59_000), m);
    const late = tqkSettle(m, T0 + 61_000);
    assert.deepEqual(late.ended, { loser: RED, reason: "timeout" });
    assert.deepEqual(tqkPosition(late).result, { winner: BLUE, reason: "timeout" });
    assert.deepEqual(tqkPlay(m, RED, legalMoves(newGame())[0]!, T0 + 61_000), { ok: false, error: "ended" });
    assert.equal(tqkTimeLeft(m, newGame(), T0 + 20_000).r, 40_000);
  });

  it("không đồng hồ thì không bao giờ hết giờ", () => {
    const m = newTqkMatch({ mode: "ai", level: "easy", rival: "x", human: BLUE, clockMs: 0, startedAt: T0 });
    assert.equal(tqkSettle(m, T0 + 10 ** 9), m);
    assert.equal(tqkMachine(m), RED);
  });

  it("đầu hàng kết thúc ván, đầu hàng lần nữa thì báo đã xong", () => {
    const r = tqkResign(online(), BLUE, T0);
    assert.ok(r.ok);
    assert.deepEqual(tqkPosition(r.match).result, { winner: RED, reason: "resign" });
    assert.deepEqual(tqkResign(r.match, RED, T0), { ok: false, error: "ended" });
  });

  it("kiểm dữ liệu nước đi gửi lên", () => {
    assert.deepEqual(parseTqkMove({ from: 1, to: 2, unit: "stack", kind: "move", extra: 1 }), { from: 1, to: 2, unit: "stack", kind: "move" });
    assert.equal(parseTqkMove({ from: 1, to: 999, unit: "stack", kind: "move" }), null);
    assert.equal(parseTqkMove({ from: 1, to: 2, unit: "all", kind: "move" }), null);
    assert.equal(parseTqkMove({ from: 1, to: 2, unit: 0, kind: "fly" }), null);
    assert.equal(parseTqkMove("e2e4"), null);
  });
});
