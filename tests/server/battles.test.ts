import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ABANDON_MS, applyProfileAction, autoProgress, findValidMoves, GRACE_MS, newProfile, TURN_MS } from "../../src/core";
import { actBattle, createBattleFor, getBattle, httpStatus, parseAction, parseNewBattle } from "../../src/server/battles";
import { newGuestId, signGuest, verifyGuest } from "../../src/server/guest";
import { loadProfile, MemoryProfileStore, updateProfile } from "../../src/server/profiles";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 5_000_000;
const input = { mode: "3v3", element: "kim", profession: "ySu", companions: ["haVan", "maiThanh"], difficulty: "easy" };

async function setup(seed = 4) {
  const store = new MemoryMatchStore();
  const profiles = new MemoryProfileStore();
  let n = 0;
  const created = await createBattleFor("g_1", parseNewBattle(input)!, { store, profiles, now: T0, seed, newId: () => `m_${++n}` });
  assert.ok(created.ok);
  return { store, profiles, id: created.id, view: created.view };
}

describe("dịch vụ trận online", () => {
  it("kiểm tra body tạo trận", () => {
    assert.ok(parseNewBattle(input));
    assert.equal(parseNewBattle({ ...input, companions: ["haVan"] }), null);
    assert.equal(parseNewBattle({ ...input, companions: ["haVan", "haVan"] }), null);
    assert.equal(parseNewBattle({ ...input, element: "go" }), null);
    assert.deepEqual(parseNewBattle({ ...input, mode: "1v1" })?.companions, []);
    assert.equal(parseNewBattle(null), null);
  });

  it("kiểm tra hình dạng hành động", () => {
    assert.deepEqual(parseAction({ seq: 0, action: { type: "swap", from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, x: 1 } }), {
      seq: 0,
      action: { type: "swap", from: { row: 0, col: 0 }, to: { row: 0, col: 1 } },
    });
    assert.equal(parseAction({ seq: "0", action: { type: "timeout" } }), null);
    assert.equal(parseAction({ seq: 0, action: { type: "skill", skill: "x", cell: { row: "a" } } }), null);
    assert.equal(parseAction({ seq: 0, action: { type: "hack" } }), null);
  });

  it("tạo trận: đội người chơi đúng lựa chọn, đối thủ không trùng đồng đội, client không thấy seed", async () => {
    const { view } = await setup();
    const mine = view.battle.sides[0].fighters.map((f) => f.id);
    const foes = view.battle.sides[1].fighters.map((f) => f.id);
    assert.deepEqual(mine, ["dinhBoLinh", "haVan", "maiThanh"]);
    assert.equal(foes.length, 3);
    assert.ok(!foes.some((f) => mine.includes(f)));
    assert.equal(view.battle.sides[0].fighters[0]!.profession, "ySu");
    assert.equal(JSON.stringify(view).includes("Rng"), false);
  });

  it("đánh một nước, chặn người khác, chặn gửi lặp", async () => {
    const { store, profiles, id, view } = await setup();
    const mv = findValidMoves(view.battle.board as never)[0]!;
    const body = { seq: view.seq, action: { type: "swap", from: mv.from, to: mv.to } };
    assert.deepEqual(await actBattle(id, "g_khac", body, { store, profiles, now: T0 + 1000 }), { ok: false, error: "notFound" });
    const r = await actBattle(id, "g_1", body, { store, profiles, now: T0 + 1000 });
    assert.ok(r.ok, r.ok ? "" : r.error);
    assert.ok(r.view.seq > view.seq);
    const again = await actBattle(id, "g_1", body, { store, profiles, now: T0 + 2000 });
    assert.equal(!again.ok && again.error, "staleSeq");
    assert.equal(httpStatus("staleSeq"), 409);
  });

  it("xem trận chạy bù lượt hết giờ và lưu lại", async () => {
    const { store, profiles, id, view } = await setup();
    const later = T0 + 2 * (TURN_MS + GRACE_MS) + 5;
    const r = await getBattle(id, "g_1", { store, profiles, now: later });
    assert.ok(r.ok);
    assert.ok(r.events.some((e) => e.type === "timeout"));
    assert.ok(r.view.seq > view.seq);
    assert.equal((await store.get(id))!.match.seq, r.view.seq);
    // Ghi kèm điều kiện seq: bản cũ không ghi đè được bản mới.
    const stale = (await store.get(id))!;
    assert.equal(await store.save(stale, view.seq), false);
  });

  it("trận kết thúc thì cộng thưởng vào hồ sơ đúng một lần", async () => {
    const { store, profiles, id } = await setup();
    const before = (await loadProfile(profiles, "g_1")).version;
    // Bỏ trận quá 24 giờ: xử thua, vẫn nhận kinh nghiệm cơ bản.
    const later = T0 + ABANDON_MS + 1000;
    const r = await getBattle(id, "g_1", { store, profiles, now: later });
    assert.ok(r.ok && r.view.battle.winner === 1 && r.view.forfeited);
    assert.ok(r.outcome && !r.outcome.rewards.won);
    const { profile, version } = await loadProfile(profiles, "g_1");
    assert.equal(version, before + 1);
    assert.equal(profile.main.xp, r.outcome.rewards.xp[0]);
    assert.equal(profile.companions.haVan!.xp, r.outcome.rewards.xp[1]);
    // Thua có 30% rơi món (phẩm tối đa Lục); món rơi nằm trong túi đồ với id của hồ sơ.
    assert.deepEqual(profile.bag, r.outcome.drop ? [r.outcome.drop] : []);
    if (r.outcome.drop) assert.ok(r.outcome.drop.tier <= 2 && r.outcome.drop.id === "g1");
    const again = await getBattle(id, "g_1", { store, profiles, now: later + 1000 });
    assert.ok(again.ok && again.outcome === undefined);
    assert.equal((await loadProfile(profiles, "g_1")).version, before + 1);
  });

  it("tạo trận theo hồ sơ: đội mang cấp đã lên, đối thủ cùng cấp, lưu nguyên tố và nghề vừa chọn", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 4, newId: () => "m_x" };
    const low = await createBattleFor("g_2", parseNewBattle(input)!, { ...deps, newId: () => "m_low" });
    const cur = await loadProfile(profiles, "g_2");
    assert.ok(await profiles.put("g_2", { ...cur.profile, main: autoProgress(10, null) }, cur.version));
    const high = await createBattleFor("g_2", parseNewBattle(input)!, deps);
    assert.ok(low.ok && high.ok);
    const hp = (v: typeof low.view, side: 0 | 1) => v.battle.sides[side].fighters[0]!.maxHp;
    assert.ok(hp(high.view, 0) > hp(low.view, 0));
    assert.ok(hp(high.view, 1) > hp(low.view, 1));
    const saved = (await loadProfile(profiles, "g_2")).profile;
    assert.equal(saved.element, "kim");
    assert.equal(saved.profession, "ySu");
  });

  it("chỉ ra trận nhân vật kèm đã có; mua rồi thì được", async () => {
    const store = new MemoryMatchStore();
    const profiles = new MemoryProfileStore();
    const deps = { store, profiles, now: T0, seed: 4, newId: () => "m_shop" };
    const withShop = parseNewBattle({ ...input, companions: ["haVan", "daoLam"] })!;
    assert.ok(withShop, "nhân vật cửa hàng là id hợp lệ");
    assert.deepEqual(await createBattleFor("g_3", withShop, deps), { ok: false, error: "badRequest" });
    const cur = await loadProfile(profiles, "g_3");
    assert.ok(await profiles.put("g_3", { ...cur.profile, gold: 5000 }, cur.version));
    const bought = await updateProfile(profiles, "g_3", (p) => applyProfileAction(p, { type: "buyCompanion", character: "daoLam" }), T0);
    assert.ok(bought.ok);
    const created = await createBattleFor("g_3", withShop, deps);
    assert.ok(created.ok);
    assert.deepEqual(created.view.battle.sides[0].fighters.map((f) => f.id), ["dinhBoLinh", "haVan", "daoLam"]);
  });

  it("ghi hồ sơ kèm điều kiện version: bị ghi trước thì đọc lại và thử lại", async () => {
    const profiles = new MemoryProfileStore();
    let first = true;
    const r = await updateProfile(
      profiles,
      "g_3",
      (p) => {
        if (first) {
          // Một request khác ghi chen vào giữa lúc đọc và lúc ghi.
          first = false;
          void profiles.put("g_3", { ...newProfile(), gold: 100 }, 0);
        }
        return { ok: true, profile: { ...p, gold: p.gold + 5 } };
      },
      T0,
    );
    assert.ok(r.ok);
    assert.equal(r.stored.profile.gold, 105);
    assert.equal(r.stored.version, 2);
  });

  it("cookie khách có chữ ký, sửa id thì không hợp lệ", () => {
    const id = newGuestId();
    const v = signGuest(id, "k");
    assert.equal(verifyGuest(v, "k"), id);
    assert.equal(verifyGuest(v.replace("g_", "g_x"), "k"), null);
    assert.equal(verifyGuest(v, "khac"), null);
    assert.equal(verifyGuest(undefined, "k"), null);
  });
});

describe("kiểm tra cấu hình", () => {
  it("không có DATABASE_URL thì báo dùng bộ nhớ", async () => {
    const { checkDatabase } = await import("../../src/server/store");
    const saved = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    assert.deepEqual(await checkDatabase(), { kind: "memory", ok: true });
    if (saved !== undefined) process.env.DATABASE_URL = saved;
  });
});
