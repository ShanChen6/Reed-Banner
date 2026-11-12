import assert from 'node:assert/strict';
import { it } from 'node:test';
import { DAY_MS, nextTrialSweepResetAt, destinyCycleId, vnDay, vnDayStart, vnWeek } from '../../src/core';
import { periodEnd } from '../../src/core/binh-phap/ranked';
import { activeDestinyCycle, destinyCycleById } from '../../src/server/destinyCycle';

// Các công thức cũ, chép nguyên từ trước khi gộp vào src/core/vnTime.ts (12/11/2026), để chứng minh kết quả không đổi.
const OLD = {
  mondayOf(now: number) {
    const local = new Date(now + 7 * 60 * 60 * 1_000);
    const day = local.getUTCDay();
    const mondayOffset = day === 0 ? 6 : day - 1;
    return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - mondayOffset)).toISOString().slice(0, 10);
  },
  nextReset(now: number) {
    const [y, m, d] = vnDay(now).split('-').map(Number);
    return Date.UTC(y!, m! - 1, d! + 1) - 7 * 60 * 60 * 1_000;
  },
  periodEnd(key: string, days: number) {
    return Date.parse(`${key}T00:00:00.000Z`) - 7 * 3600_000 + days * 24 * 3600_000;
  },
};

function samples(): number[] {
  const out: number[] = [];
  // Quanh nửa đêm giờ Việt Nam (17:00 UTC) mọi ngày trong tuần, cả năm nhuận và ranh giới năm.
  for (const base of [Date.UTC(2026, 10, 15, 17), Date.UTC(2024, 1, 28, 17), Date.UTC(2026, 11, 31, 17), Date.UTC(1970, 0, 5, 17)])
    for (let d = 0; d < 9; d++) for (const off of [-1, 0, 1, 3_600_000, -3_600_000]) out.push(base + d * DAY_MS + off);
  let x = 12345;
  for (let i = 0; i < 2000; i++) { x = (x * 1103515245 + 12345) % 2 ** 31; out.push(Math.floor((x / 2 ** 31) * 4.1e12)); }
  return out.filter((t) => t >= 0);
}

it('vnWeek, destinyCycleId và chu kỳ server khớp công thức cũ', () => {
  for (const now of samples()) {
    const monday = OLD.mondayOf(now);
    assert.equal(vnWeek(now), monday, String(now));
    assert.equal(destinyCycleId(now), monday, String(now));
    const active = activeDestinyCycle(now);
    assert.ok(active.ok);
    if (active.ok) {
      assert.equal(active.cycle.cycleId, monday);
      assert.equal(active.cycle.startAt, Date.parse(`${monday}T00:00:00.000Z`) - 7 * 3_600_000);
      assert.ok(active.cycle.startAt <= now && now < active.cycle.endAt);
    }
  }
});

it('mốc 0 giờ ngày kế tiếp và hết kỳ Trận Đồ khớp công thức cũ', () => {
  for (const now of samples()) {
    assert.equal(nextTrialSweepResetAt(now), OLD.nextReset(now), String(now));
    assert.equal(periodEnd('thuong', now), OLD.periodEnd(vnDay(now), 1));
    assert.equal(periodEnd('dai-tran', now), OLD.periodEnd(vnWeek(now), 7));
  }
  assert.equal(vnDayStart('2026-11-16'), Date.UTC(2026, 10, 15, 17));
  assert.ok(Number.isNaN(vnDayStart('không-phải-ngày')));
});

it('thời điểm không hợp lệ không ném lỗi', () => {
  for (const bad of [-1, 1.5, Number.NaN, 8.64e15]) {
    assert.equal(destinyCycleId(bad), null);
    assert.deepEqual(activeDestinyCycle(bad), { ok: false, error: 'invalid_time' });
  }
  assert.equal(destinyCycleById('2026-11-17'), null, 'không phải thứ Hai');
});
