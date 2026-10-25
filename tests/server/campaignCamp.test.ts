import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMPAIGN_FOOD_START,
  applyProfileAction,
  completeCampaignNode,
  newProfile,
  type CampaignMissionId,
  type CampaignProgressV2,
} from "../../src/core";
import {
  createBattleFor,
  getBattle,
  parseNewBattle,
} from "../../src/server/battles";
import { completeCampaignEvent } from "../../src/server/campaignEvents";
import {
  MemoryProfileStore,
  loadProfile,
  updateProfile,
} from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 17_000_000;
const OWNER = "g_camp";
const ids = (n: number) =>
  Array.from(
    { length: n },
    (_, i) => `M${String(i + 1).padStart(2, "0")}` as CampaignMissionId,
  );

function complete(list: readonly CampaignMissionId[]): CampaignProgressV2 {
  let next = newProfile().campaign;
  for (const id of list) {
    const r = completeCampaignNode(next, id);
    assert.ok(r.ok, id);
    next = r.campaign;
  }
  return next;
}

async function setup(done: number, supply: number) {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  const seed = newProfile();
  assert.ok(
    await profiles.put(
      OWNER,
      { ...seed, gold: 5000, campaign: { ...complete(ids(done)), supply } },
      0,
    ),
  );
  let n = 0;
  const deps = (now: number) => ({
    store,
    profiles,
    now,
    seed: 54,
    newId: () => `m_${++n}`,
  });
  return { store, profiles, deps };
}

/** Chốt trận người chơi thắng, đặt lương cuối trận của phe người chơi. */
async function finish(store: MemoryMatchStore, id: string, food: number) {
  const rec = (await store.get(id))!;
  const sides = rec.match.battle.sides.map((side, i) => ({
    ...side,
    ...(i === 0 ? { food } : {}),
    fighters:
      i === 0 ? side.fighters : side.fighters.map((f) => ({ ...f, hp: 0 })),
  })) as unknown as typeof rec.match.battle.sides;
  const battle = {
    ...rec.match.battle,
    sides,
    winner: 0 as const,
    turn: { ...rec.match.battle.turn, number: 12 },
  };
  assert.ok(
    await store.save(
      { ...rec, match: { ...rec.match, battle, seq: rec.match.seq + 1 } },
      rec.match.seq,
    ),
  );
}

const m04 = (companions: unknown) => ({
  campaignMission: "M04",
  campaignChoice: undefined,
  element: "hoa",
  profession: "tuongSi",
  companions,
});

describe("Doanh trại Campaign: đội hình và lương", () => {
  it("không bắt đầu được trận 3vs3 thiếu đội hợp lệ", async () => {
    const { deps } = await setup(3, 50);
    assert.equal(parseNewBattle(m04(["haVan"])), null, "thiếu người");
    assert.equal(parseNewBattle(m04(["haVan", "haVan"])), null, "trùng người");
    assert.equal(parseNewBattle(m04([])), null, "không có ai");
    assert.equal(parseNewBattle(m04(["haVan", "khongCo"])), null, "id lạ");
    // Nhân vật có thật nhưng chưa sở hữu: server từ chối.
    const notOwned = await createBattleFor(
      OWNER,
      parseNewBattle(m04(["haVan", "tranLam"]))!,
      deps(T0),
    );
    assert.deepEqual(notOwned, { ok: false, error: "badRequest" });
    const ok = await createBattleFor(
      OWNER,
      parseNewBattle(m04(["leThach", "toKim"]))!,
      deps(T0 + 1),
    );
    assert.ok(ok.ok);
    // Đội chọn ở màn chuẩn bị (không phải đội lưu ở hồ sơ) là đội ra trận.
    assert.deepEqual(
      ok.view.battle.sides[0]!.fighters.map((f) => f.id).slice(1),
      ["leThach", "toKim"],
    );
  });

  it("đổi nghề ở màn chuẩn bị được lưu khi xuất quân", async () => {
    const { profiles, deps } = await setup(3, 50);
    const r = await createBattleFor(
      OWNER,
      parseNewBattle({ ...m04(["haVan", "maiThanh"]), profession: "quanSu" })!,
      deps(T0),
    );
    assert.ok(r.ok);
    const p = (await loadProfile(profiles, OWNER)).profile;
    assert.equal(p.profession, "quanSu");
    assert.equal(r.view.battle.sides[0]!.fighters[0]!.profession, "quanSu");
  });

  it("hai trận mở song song không hoàn lương cho nhau; lương mua giữa trận không bị ghi đè", async () => {
    const { store, profiles, deps } = await setup(3, 50);
    const body = parseNewBattle(m04(["haVan", "maiThanh"]))!;
    const a = await createBattleFor(OWNER, body, deps(T0));
    const b = await createBattleFor(OWNER, body, deps(T0 + 1));
    assert.ok(a.ok && b.ok);
    assert.equal(
      (await store.get(a.id))!.match.campaignScenario?.startFood,
      50,
    );
    await finish(store, a.id, 30); // tiêu 20
    await getBattle(a.id, OWNER, deps(T0 + 10));
    assert.equal(
      (await loadProfile(profiles, OWNER)).profile.campaign.supply,
      30,
    );
    await finish(store, b.id, 45); // tiêu 5
    await getBattle(b.id, OWNER, deps(T0 + 20));
    // Trước đây hồ sơ lấy thẳng lương cuối trận b (45), hoàn lại 15 lương của trận a.
    assert.equal(
      (await loadProfile(profiles, OWNER)).profile.campaign.supply,
      25,
    );

    const c = await createBattleFor(OWNER, body, deps(T0 + 30));
    assert.ok(c.ok);
    const bought = await updateProfile(
      profiles,
      OWNER,
      (p) => {
        const r = applyProfileAction(p, { type: "buyFood", amount: 50 }, T0);
        return r.ok
          ? { ok: true, profile: r.profile }
          : { ok: false, error: r.error };
      },
      T0 + 31,
    );
    assert.ok(bought.ok);
    assert.equal(bought.stored.profile.campaign.supply, 75);
    await finish(store, c.id, 20); // tiêu 5
    await getBattle(c.id, OWNER, deps(T0 + 40));
    assert.equal(
      (await loadProfile(profiles, OWNER)).profile.campaign.supply,
      70,
    );
  });

  it("sự kiện và ngoại giao không trừ hay nạp lương, gửi lại cũng không", async () => {
    const fresh = await setup(0, CAMPAIGN_FOOD_START);
    const s1 = await completeCampaignEvent(
      fresh.profiles,
      OWNER,
      { eventId: "e_m01", nodeId: "M01", choice: "listen" },
      T0,
    );
    assert.ok(s1.ok);
    assert.equal(s1.profile.campaign.supply, CAMPAIGN_FOOD_START);

    const { profiles } = await setup(5, 33);
    for (const [i, eventId] of ["e_m06", "e_m06_retry"].entries()) {
      const r = await completeCampaignEvent(
        profiles,
        OWNER,
        { eventId, nodeId: "M06", choice: "keepWord" },
        T0 + i,
      );
      assert.ok(r.ok);
      assert.equal(r.profile.campaign.supply, 33);
    }
  });
});
