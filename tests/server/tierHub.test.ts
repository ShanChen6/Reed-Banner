import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ARENA_START } from "../../src/core";
import { MemoryArenaStore } from "../../src/server/arena";
import { MemoryProfileStore, loadProfile, updateProfile } from "../../src/server/profiles";
import { MemoryPvpStore } from "../../src/server/pvp";
import { claimHubTier, isTierHubId, tierOverview, type TierHubDeps } from "../../src/server/tierHub";

const T0 = Date.UTC(2026, 10, 18, 3);
const off = { formation: false, destiny: false, tamTuongKy: false };

describe("trang Thưởng Bậc", () => {
  it("chỉ có dải của chế độ đang bật, đúng thứ tự trang", async () => {
    const profiles = new MemoryProfileStore();
    const few = await tierOverview("g_h", { profiles, now: T0, enabled: off });
    assert.deepEqual(few.map((l) => l.id), ["survival", "daily"]);
    const all = await tierOverview("g_h", {
      profiles,
      arena: new MemoryArenaStore(),
      pvp: new MemoryPvpStore(),
      now: T0,
      enabled: { formation: true, destiny: true, tamTuongKy: true },
    });
    assert.deepEqual(all.map((l) => l.id), ["arena", "pvp", "survival", "formation", "daily", "destiny", "tamTuongKy"]);
    assert.ok(all.every((l) => l.tiers.length === 6 && l.claimed.length === 0));
    // Chưa đánh Quần Hùng: điểm khởi đầu, chưa tạo bản ghi đấu trường.
    assert.equal(all[0]!.score, ARENA_START);
  });

  it("nhận qua trang gọi đúng hàm nhận của chế độ, mỗi bậc một lần", async () => {
    const profiles = new MemoryProfileStore();
    const deps: TierHubDeps = { profiles, now: T0, enabled: off };
    await updateProfile(profiles, "g_h", (p) => ({ ok: true, profile: { ...p, survival: { best: 6 } } }), T0);
    const gold0 = (await loadProfile(profiles, "g_h")).profile.gold;
    const r = await claimHubTier("g_h", "survival", "bac", deps);
    assert.ok(r.ok && r.gold === 150);
    assert.deepEqual(await claimHubTier("g_h", "survival", "bac", deps), { ok: false, error: "claimed" });
    assert.equal((await loadProfile(profiles, "g_h")).profile.gold, gold0 + 150);
    const survival = (await tierOverview("g_h", deps)).find((l) => l.id === "survival")!;
    assert.equal(survival.score, 6);
    assert.deepEqual(survival.claimed, ["bac"]);
  });

  it("chưa vào Quần Hùng vẫn nhận được bậc Đồng ở điểm khởi đầu đang hiện", async () => {
    const deps: TierHubDeps = { profiles: new MemoryProfileStore(), arena: new MemoryArenaStore(), now: T0, enabled: off };
    const r = await claimHubTier("g_a", "arena", "dong", deps);
    assert.ok(r.ok && r.gold === 50);
    assert.deepEqual(await claimHubTier("g_a", "arena", "bac", deps), { ok: false, error: "notReached" });
  });

  it("chế độ tắt thì không nhận được", async () => {
    const deps: TierHubDeps = { profiles: new MemoryProfileStore(), now: T0, enabled: off };
    for (const id of ["arena", "pvp", "formation", "destiny", "tamTuongKy"] as const)
      assert.deepEqual(await claimHubTier("g_h", id, "dong", deps), { ok: false, error: "featureDisabled" }, id);
    assert.ok(isTierHubId("daily") && !isTierHubId("campaign"));
  });
});
