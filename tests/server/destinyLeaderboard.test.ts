import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MemoryDestinyLeaderboardStore,
  destinyLeaderboardView,
  type DestinyLeaderboardSubmission,
} from "../../src/server/destinyLeaderboard";
import { destinyCycleById } from "../../src/server/destinyCycle";

const CYCLE = "2026-10-19";
const NEXT = "2026-10-26";
const row = (
  ownerId: string,
  clearedFloor: number,
  totalTurns: number,
  completedAt: number,
  cycleId = CYCLE,
): DestinyLeaderboardSubmission => ({
  eventId: `${cycleId}:${ownerId}:${clearedFloor}:${totalTurns}:${completedAt}`,
  cycleId,
  ownerId,
  clearedFloor,
  totalTurns,
  completedAt,
});

describe("Destiny leaderboard theo cycle", () => {
  it("xếp floor cao, lượt thấp, hoàn thành sớm rồi owner ổn định", async () => {
    const store = new MemoryDestinyLeaderboardStore();
    await store.submit(row("guest_b", 5, 30, 100));
    await store.submit(row("guest_a", 5, 30, 100));
    await store.submit(row("guest_c", 5, 30, 90));
    await store.submit(row("guest_d", 5, 20, 200));
    await store.submit(row("guest_e", 6, 99, 300));
    assert.deepEqual((await store.page(CYCLE, 0, 10)).map(({ ownerId }) => ownerId),
      ["guest_e", "guest_d", "guest_c", "guest_a", "guest_b"]);
    assert.equal((await store.rankOf(CYCLE, "guest_b"))?.rank, 5);
  });

  it("từ chối floor/cycle hỏng, duplicate event và update kém hơn", async () => {
    const store = new MemoryDestinyLeaderboardStore();
    const best = row("g1", 3, 15, 100);
    assert.equal(await store.submit({ ...best, clearedFloor: 0 }), false);
    assert.equal(await store.submit({ ...best, cycleId: "2026-10-20" }), false);
    assert.equal(await store.submit(best), true);
    assert.equal(await store.submit(best), false);
    assert.equal(await store.submit({ ...row("g1", 3, 20, 90), eventId: "worse" }), false);
    assert.equal(await store.submit({ ...row("g1", 3, 10, 110), eventId: "better" }), true);
    assert.equal((await store.rankOf(CYCLE, "g1"))?.entry.totalTurns, 10);
  });

  it("cô lập cycle, truy vấn lịch sử, phân trang và không lộ ownerId", async () => {
    const store = new MemoryDestinyLeaderboardStore();
    await store.submit(row("guest_secret_1234", 4, 20, 100));
    await store.submit(row("guest_next_9876", 8, 10, 200, NEXT));
    assert.deepEqual((await store.page(CYCLE, 0, 10)).map(({ clearedFloor }) => clearedFloor), [4]);
    assert.deepEqual((await store.page(NEXT, 0, 10)).map(({ clearedFloor }) => clearedFloor), [8]);
    const cycle = destinyCycleById(CYCLE)!;
    const view = await destinyLeaderboardView(store, cycle, null, 0, 1);
    assert.equal(view.entries[0]?.name, "Khách 1234");
    assert.equal("ownerId" in (view.entries[0] ?? {}), false);
    assert.equal(view.nextCursor, null);

    await store.submit(row("guest_more_5678", 3, 30, 300));
    const first = await destinyLeaderboardView(store, cycle, "guest_more_5678", 0, 1);
    assert.equal(first.nextCursor, "1");
    assert.equal(first.mine?.rank, 2);
    const second = await destinyLeaderboardView(store, cycle, null, 1, 1);
    assert.equal(second.entries[0]?.rank, 2);
  });
});
