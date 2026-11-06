import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MemoryFormationStore, type FormationEntry } from "../../src/server/formation";
import { honorsOf } from "../../src/server/honors";
import { MemoryRankRewardStore } from "../../src/server/rankRewards";

const entry = (over: Partial<FormationEntry>): FormationEntry => ({
  id: "f1", level: "kho", period: "2026-11-01", ownerId: "u1", state: null, seq: 1, status: "won", score: 100, turns: 10,
  startedAt: 1, finishedAt: 2, claimedAt: 50, rewardGold: 150, ...over,
});

describe("Công Trạng (V2-06)", () => {
  it("khách không có công trạng", async () => {
    const deps = { claims: new MemoryRankRewardStore(), formation: new MemoryFormationStore(), isSignedIn: async () => false };
    assert.deepEqual(await honorsOf(deps, "u1"), { signedIn: false, items: [] });
    assert.deepEqual(await honorsOf(deps, null), { signedIn: false, items: [] });
  });

  it("gom sổ thưởng chung và Trận Đồ, mới nhận trước, chỉ của chính người đó", async () => {
    const claims = new MemoryRankRewardStore();
    await claims.claim({ mode: "survival", period: "2026-10-26", ownerId: "u1", rank: 3, gold: 300, claimedAt: 100 });
    await claims.claim({ mode: "arena", period: "2026-10-26", ownerId: "u2", rank: 1, gold: 600, claimedAt: 110 });
    const formation = new MemoryFormationStore();
    await formation.create(entry({}));
    await formation.create(entry({ id: "f2", ownerId: "u2", score: 200, claimedAt: 60 }));
    await formation.create(entry({ id: "f3", period: "2026-11-02", claimedAt: null, rewardGold: null }));
    const r = await honorsOf({ claims, formation, isSignedIn: async () => true }, "u1");
    assert.equal(r.signedIn, true);
    assert.deepEqual(r.items.map((i) => [i.source, i.rank, i.gold]), [["survival", 3, 300], ["formation:kho", 2, 150]]);
    assert.equal(r.items[1]!.participants, 2);
    assert.equal(r.items[1]!.title, "Trận Đồ · Khó");
  });
});
