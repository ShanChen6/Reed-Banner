import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ABANDON_MS,
  AI_SIDE,
  catchUpDifficulty,
  findValidMoves,
  GRACE_MS,
  HUMAN,
  humanAct,
  mainCharacter,
  settle,
  startMatch,
  STARTER_COMPANIONS,
  TURN_MS,
  viewOf,
  type Match,
  type SideIndex,
} from "../../../src/core";

const T0 = 1_000_000;

function newMatch(firstSide: SideIndex = HUMAN, seed = 5): Match {
  return startMatch({
    sides: [
      { fighters: [mainCharacter("moc")], leader: 0 },
      { fighters: [STARTER_COMPANIONS[0]!], leader: 0 },
    ],
    difficulty: "normal",
    seed,
    firstSide,
    now: T0,
  }).match;
}

const firstMove = (m: Match) => {
  const mv = findValidMoves(m.battle.board)[0]!;
  return { type: "swap" as const, from: mv.from, to: mv.to };
};

describe("trận online", () => {
  it("bắt đầu có đồng hồ; AI đi trước thì đánh luôn lượt đầu", () => {
    const m = newMatch();
    assert.equal(m.battle.turn.side, HUMAN);
    assert.equal(m.battle.turn.deadline, T0 + TURN_MS);
    const ai = newMatch(AI_SIDE);
    assert.equal(ai.battle.turn.side, HUMAN);
    assert.ok(ai.seq > 0);
  });

  it("nước đi hợp lệ tăng seq, AI đánh luôn rồi trả lượt lại cho người chơi", () => {
    const m = newMatch();
    const r = humanAct(m, firstMove(m), m.seq, T0 + 1000);
    assert.ok(r.ok);
    assert.ok(r.match.seq > m.seq);
    assert.ok(r.events.some((e) => e.type === "swap"));
    if (r.match.battle.winner === null) assert.equal(r.match.battle.turn.side, HUMAN);
    assert.equal(r.match.lastHumanAt, T0 + 1000);
  });

  it("từ chối seq cũ (gửi lặp) và nước đi trễ quá ân hạn", () => {
    const m = newMatch();
    const r1 = humanAct(m, firstMove(m), m.seq, T0 + 1000);
    assert.ok(r1.ok);
    const again = humanAct(r1.match, firstMove(m), m.seq, T0 + 2000);
    assert.equal(again.ok, false);
    assert.equal(!again.ok && again.error, "staleSeq");
    const late = humanAct(m, firstMove(m), m.seq, T0 + TURN_MS + GRACE_MS + 1);
    assert.equal(late.ok, false);
    // Hết giờ được chạy bù trước khi xét nước đi: lượt đã qua tay AI và quay về với đồng hồ mới.
    assert.ok(late.match.seq > m.seq);
    assert.ok(late.events.some((e) => e.type === "timeout"));
  });

  it("chạy bù đúng số lượt đã quá hạn, theo mốc thời gian lúc đó", () => {
    const m = newMatch();
    const { match, events } = settle(m, T0 + 3 * (TURN_MS + GRACE_MS) + 10);
    const timeouts = events.filter((e) => e.type === "timeout").length;
    assert.ok(timeouts >= 2 && timeouts <= 3, `timeouts=${timeouts}`);
    if (match.battle.winner === null) {
      assert.equal(match.battle.turn.side, HUMAN);
      assert.ok(match.battle.turn.deadline! + GRACE_MS >= T0 + 3 * (TURN_MS + GRACE_MS) + 10);
    }
    // Chưa quá hạn thì không đổi gì.
    assert.deepEqual(settle(m, T0 + TURN_MS), { match: m, events: [] });
  });

  it("bỏ dở quá 24 giờ thì xử thua; trận đã xong không đổi", () => {
    const m = newMatch();
    const { match } = settle(m, T0 + ABANDON_MS + 1);
    assert.equal(match.battle.winner, AI_SIDE);
    assert.equal(match.forfeited, true);
    assert.deepEqual(settle(match, T0 + 2 * ABANDON_MS).events, []);
    const r = humanAct(match, firstMove(m), match.seq, T0 + ABANDON_MS + 2);
    assert.equal(!r.ok && r.error, "battleOver");
  });

  it("cùng seed và cùng chuỗi hành động cho cùng kết quả; view không lộ luồng ngẫu nhiên", () => {
    const a = humanAct(newMatch(), firstMove(newMatch()), 0, T0 + 500);
    const b = humanAct(newMatch(), firstMove(newMatch()), 0, T0 + 500);
    assert.deepEqual(a, b);
    const v = viewOf(a.match) as unknown as Record<string, unknown>;
    assert.equal("boardRng" in (v.battle as object), false);
    assert.equal("aiRng" in (v.battle as object), false);
    assert.equal(catchUpDifficulty("boss"), "hard");
    assert.equal(catchUpDifficulty("easy"), "easy");
  });
});
