import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findValidMoves, GRACE_MS, TURN_MS } from "../../src/core";
import { actBattle, createBattleFor, getBattle, httpStatus, parseAction, parseNewBattle } from "../../src/server/battles";
import { newGuestId, signGuest, verifyGuest } from "../../src/server/guest";
import { MemoryMatchStore } from "../../src/server/store";

const T0 = 5_000_000;
const input = { mode: "3v3", element: "kim", profession: "ySu", companions: ["haVan", "maiThanh"], difficulty: "easy" };

async function setup(seed = 4) {
  const store = new MemoryMatchStore();
  let n = 0;
  const created = await createBattleFor("g_1", parseNewBattle(input)!, { store, now: T0, seed, newId: () => `m_${++n}` });
  assert.ok(created.ok);
  return { store, id: created.id, view: created.view };
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
    const { store, id, view } = await setup();
    const mv = findValidMoves(view.battle.board as never)[0]!;
    const body = { seq: view.seq, action: { type: "swap", from: mv.from, to: mv.to } };
    assert.deepEqual(await actBattle(id, "g_khac", body, { store, now: T0 + 1000 }), { ok: false, error: "notFound" });
    const r = await actBattle(id, "g_1", body, { store, now: T0 + 1000 });
    assert.ok(r.ok, r.ok ? "" : r.error);
    assert.ok(r.view.seq > view.seq);
    const again = await actBattle(id, "g_1", body, { store, now: T0 + 2000 });
    assert.equal(!again.ok && again.error, "staleSeq");
    assert.equal(httpStatus("staleSeq"), 409);
  });

  it("xem trận chạy bù lượt hết giờ và lưu lại", async () => {
    const { store, id, view } = await setup();
    const later = T0 + 2 * (TURN_MS + GRACE_MS) + 5;
    const r = await getBattle(id, "g_1", { store, now: later });
    assert.ok(r.ok);
    assert.ok(r.events.some((e) => e.type === "timeout"));
    assert.ok(r.view.seq > view.seq);
    assert.equal((await store.get(id))!.match.seq, r.view.seq);
    // Ghi kèm điều kiện seq: bản cũ không ghi đè được bản mới.
    const stale = (await store.get(id))!;
    assert.equal(await store.save(stale, view.seq), false);
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
