import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DESTINY_CYCLE_DAYS,
  DESTINY_TIME_ZONE,
  activeDestinyCycle,
  destinyCycleById,
  destinyCycleSeed,
  publicDestinyCycle,
} from "../../src/server/destinyCycle";

const SECRET = "private-destiny-cycle-secret";
const monday = Date.UTC(2026, 9, 18, 17); // 2026-10-19 00:00 UTC+7

describe("Destiny cycle scheduler", () => {
  it("đổi cycle đúng ranh giới Chủ nhật → thứ Hai giờ Việt Nam", () => {
    const before = activeDestinyCycle(monday - 1);
    const at = activeDestinyCycle(monday);
    assert.ok(before.ok && at.ok);
    if (!before.ok || !at.ok) return;
    assert.equal(before.cycle.cycleId, "2026-10-12");
    assert.equal(at.cycle.cycleId, "2026-10-19");
    assert.equal(at.cycle.startAt, monday);
    assert.equal(at.cycle.endAt, monday + DESTINY_CYCLE_DAYS * 86_400_000);
    assert.equal(DESTINY_TIME_ZONE, "Asia/Ho_Chi_Minh");
  });

  it("không phụ thuộc timezone/DST của máy và bất biến trong cùng cycle", () => {
    for (const id of ["2026-01-05", "2026-06-01", "2026-10-19"]) {
      const cycle = destinyCycleById(id);
      assert.ok(cycle);
      if (!cycle) continue;
      assert.equal(cycle.endAt - cycle.startAt, 7 * 86_400_000);
      const start = activeDestinyCycle(cycle.startAt);
      const end = activeDestinyCycle(cycle.endAt - 1);
      assert.ok(start.ok && end.ok);
      if (start.ok && end.ok) {
        assert.deepEqual(start.cycle, cycle);
        assert.deepEqual(end.cycle, cycle);
      }
    }
    assert.equal(destinyCycleById("2026-10-20"), null);
    assert.deepEqual(activeDestinyCycle(Number.NaN), { ok: false, error: "invalid_time" });
  });

  it("HMAC seed ổn định, tách purpose và không lộ trong metadata public", () => {
    const cycle = destinyCycleById("2026-10-19")!;
    const rulesA = destinyCycleSeed(cycle, SECRET, "rules");
    const rulesB = destinyCycleSeed(cycle, SECRET, "rules");
    const battle = destinyCycleSeed(cycle, SECRET, "battle");
    assert.equal(rulesA, rulesB);
    assert.notEqual(rulesA, battle);
    assert.notEqual(rulesA, destinyCycleSeed(cycle, `${SECRET}-other`, "rules"));
    assert.equal(rulesA?.includes(SECRET), false);
    assert.equal(JSON.stringify(publicDestinyCycle(cycle)).includes(SECRET), false);
    assert.doesNotMatch(JSON.stringify(publicDestinyCycle(cycle)), /seed/i);
    assert.equal(destinyCycleSeed(cycle, "short", "rules"), null);
  });
});
