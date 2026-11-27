import assert from "node:assert/strict";
import test from "node:test";

import {
  BOARD_SIZE,
  JAIL_BAIL,
  JAIL_TILE,
  JAIL_TRIES,
  MAX_TURNS,
  REGION_TILES,
  SALARY,
  SCENIC_RENT,
  START_CASH,
  TILES,
  act,
  buyoutOf,
  chooseAction,
  newDtk,
  rentOf,
  resign,
  sellOf,
  type DtkState,
  type Seat,
} from "../../../src/core/dien-trang-ky";

const seats = (n: number): Seat[] => ["tranLam", "phamBachHo", "nguyenKhoan", "doCanhThac"].slice(0, n).map((bot) => ({ name: bot, element: "hoa", bot }));

function playOut(s: DtkState): DtkState {
  for (let i = 0; i < 20_000 && s.phase.k !== "ended"; i++) {
    const r = act(s, s.turn, chooseAction(s));
    assert.ok(r.ok, `máy ra lệnh sai ở pha ${s.phase.k}`);
    s = r.state;
  }
  return s;
}

test("bàn 40 ô: 24 ô đất, bốn danh thắng, mười hai vùng mỗi vùng hai ô, bốn góc riêng", () => {
  assert.equal(BOARD_SIZE, 40);
  assert.equal(TILES.filter((t) => t.kind === "land").length, 24);
  assert.ok(REGION_TILES.every((r) => r.length === 2));
  assert.deepEqual(TILES.flatMap((t, i) => (t.kind === "scenic" ? [i] : [])), [5, 15, 25, 35]);
  assert.deepEqual([0, 10, 20, 30].map((i) => TILES[i]!.kind), ["start", "jail", "festival", "boat"]);
});

test("cùng seed, cùng lệnh thì ra cùng ván", () => {
  const a = playOut(newDtk({ seats: seats(4), seed: 42 }));
  const b = playOut(newDtk({ seats: seats(4), seed: 42 }));
  assert.deepEqual(a, b);
  assert.equal(a.ranking!.length, 4);
  assert.equal(new Set(a.ranking).size, 4);
});

test("máy chơi tới khi chỉ còn một người, không chạm chốt an toàn", () => {
  for (let seed = 1; seed <= 40; seed++) {
    const s = playOut(newDtk({ seats: seats(2 + (seed % 3)), seed }));
    assert.equal(s.phase.k, "ended");
    assert.ok(s.turns < MAX_TURNS);
    assert.equal(s.players.filter((p) => !p.out).length, 1);
    assert.equal(s.ranking![0], s.players.findIndex((p) => !p.out));
  }
});

test("lệnh sai lượt hoặc sai pha bị từ chối, trạng thái cũ không đổi", () => {
  const s = newDtk({ seats: seats(2), seed: 3 });
  assert.deepEqual(act(s, 1, { t: "roll" }), { ok: false, error: "notYourTurn" });
  assert.deepEqual(act(s, 0, { t: "pay" }), { ok: false, error: "illegal" });
  const before = JSON.stringify(s);
  act(s, 0, { t: "roll" });
  assert.equal(JSON.stringify(s), before);
});

/** Đặt người chơi lên ô `tile`; pha dựng thẳng trong từng test cho dễ kiểm. */
function at(s: DtkState, seat: number, tile: number): DtkState {
  const d = structuredClone(s);
  d.turn = seat;
  d.players[seat]!.pos = tile;
  return d;
}

test("mua đất kèm xây, đi vào đất người khác thì nộp tô hoặc mua lại gấp đôi giá trị", () => {
  let s = at(newDtk({ seats: seats(2), seed: 9 }), 0, 1);
  s.phase = { k: "buy", tile: 1 };
  const r = act(s, 0, { t: "buy", level: 2 });
  assert.ok(r.ok);
  s = r.state;
  assert.deepEqual(s.plots[1], { owner: 0, level: 2 });
  assert.equal(s.players[0]!.cash, START_CASH - 60 - 30 - 30);

  s = at(s, 1, 1);
  const rent = rentOf(s, 1);
  const buyout = buyoutOf(s, 1);
  assert.equal(rent, Math.round(60 * 1.2));
  assert.equal(buyout, 2 * (60 + 30 + 30));
  s.phase = { k: "rent", tile: 1, owner: 0, amount: rent, buyout };
  const paid = act(s, 1, { t: "pay" });
  assert.ok(paid.ok);
  assert.equal(paid.state.players[1]!.cash, START_CASH - rent);
  assert.equal(paid.state.players[0]!.cash, s.players[0]!.cash + rent);

  const bought = act(s, 1, { t: "buyout" });
  assert.ok(bought.ok);
  assert.deepEqual(bought.state.plots[1], { owner: 1, level: 2 });
  assert.equal(bought.state.players[1]!.cash, START_CASH - buyout);
});

test("hùng cứ nhân tô, bậc 5 chỉ xây được khi giữ đủ vùng", () => {
  let s = newDtk({ seats: seats(2), seed: 5 });
  s = structuredClone(s);
  s.plots[1] = { owner: 0, level: 4 };
  s.phase = { k: "build", tile: 1 };
  assert.equal(act(s, 0, { t: "build", level: 5 }).ok, false);
  s.plots[3] = { owner: 0, level: 0 };
  assert.equal(rentOf(s, 1), Math.round(60 * 3.2 * 1.5));
  const r = act(s, 0, { t: "build", level: 5 });
  assert.ok(r.ok);
  assert.equal(r.state.plots[1]!.level, 5);
});

test("thiếu tiền thì bán đất nửa giá, bán hết vẫn thiếu thì phá sản và đất về trống", () => {
  let s = structuredClone(newDtk({ seats: seats(3), seed: 11 }));
  s.plots[38] = { owner: 1, level: 4 };
  s.plots[39] = { owner: 1, level: 4 };
  s.plots[1] = { owner: 0, level: 1 };
  s.players[0]!.cash = 100;
  s.players[0]!.pos = 38;
  s.phase = { k: "raise", amount: 150, payees: [{ seat: 1, amount: 150 }] };
  const sold = act(s, 0, { t: "sell", tile: 1 });
  assert.ok(sold.ok);
  assert.equal(sold.state.plots[1]!.owner, null);
  assert.equal(sellOf(s, 1), 45);
  // 100 + 45 vẫn thiếu, còn ô để bán thì vẫn ở pha bán; hết ô thì tự phá sản khi thu tô lần sau.
  s = sold.state;
  assert.equal(s.phase.k, "raise");
  const out = act(s, 0, { t: "bankrupt" });
  assert.ok(out.ok);
  assert.equal(out.state.players[0]!.out, true);
  assert.equal(out.state.players[1]!.cash, START_CASH + 145);
});

test("danh thắng: không xây nhà, tô tăng theo số danh thắng cùng chủ", () => {
  const s = structuredClone(newDtk({ seats: seats(2), seed: 4 }));
  s.phase = { k: "buy", tile: 5 };
  s.players[0]!.pos = 5;
  assert.deepEqual(act(s, 0, { t: "buy", level: 1 }), { ok: false, error: "illegal" });
  const r = act(s, 0, { t: "buy", level: 0 });
  assert.ok(r.ok);
  const d = structuredClone(r.state);
  assert.equal(rentOf(d, 5), SCENIC_RENT[1]);
  d.plots[15] = { owner: 0, level: 0 };
  d.plots[25] = { owner: 0, level: 0 };
  assert.equal(rentOf(d, 5), SCENIC_RENT[3]);
});

test("Lao Ngục: bị giam, đổ hỏng thì ở lại, nộp tiền chuộc thì ra", () => {
  const s = structuredClone(newDtk({ seats: seats(2), seed: 8 }));
  s.players[0]!.jail = JAIL_TRIES;
  s.players[0]!.pos = JAIL_TILE;
  const bailed = act(s, 0, { t: "bail" });
  assert.ok(bailed.ok);
  assert.equal(bailed.state.players[0]!.jail, 0);
  assert.equal(bailed.state.players[0]!.cash, START_CASH - JAIL_BAIL);
  assert.equal(bailed.state.phase.k, "roll");
  // Đổ thử nhiều seed: không ra đôi thì vẫn ở ô ngục, lần thử giảm.
  for (let seed = 1; seed < 40; seed++) {
    const t = structuredClone(newDtk({ seats: seats(2), seed }));
    t.players[0]!.jail = JAIL_TRIES;
    t.players[0]!.pos = JAIL_TILE;
    const r = act(t, 0, { t: "roll" });
    assert.ok(r.ok);
    const [a, b] = r.state.dice!;
    if (a !== b) {
      assert.equal(r.state.players[0]!.pos, JAIL_TILE);
      assert.equal(r.state.players[0]!.jail, JAIL_TRIES - 1);
    } else assert.equal(r.state.players[0]!.jail, 0);
  }
  assert.deepEqual(act(newDtk({ seats: seats(2), seed: 1 }), 0, { t: "bail" }), { ok: false, error: "illegal" });
});

test("đi qua Hoa Lư nhận lương vòng", () => {
  const s = structuredClone(newDtk({ seats: seats(2), seed: 1 }));
  s.players[0]!.pos = 38;
  const r = act(s, 0, { t: "roll" });
  assert.ok(r.ok);
  const p = r.state.players[0]!;
  assert.ok(p.pos < 38);
  const salary = r.state.log.find((e) => e.k === "salary");
  assert.ok(salary && salary.k === "salary" && salary.amount === SALARY);
});

test("xin thua lúc người khác đang đi: đất về trống, ván vẫn chạy", () => {
  const s = newDtk({ seats: seats(3), seed: 2 });
  const r = resign(s, 2);
  assert.ok(r.ok);
  assert.equal(r.state.players[2]!.out, true);
  assert.equal(r.state.turn, 0);
  const two = resign(r.state, 1);
  assert.ok(two.ok);
  assert.equal(two.state.phase.k, "ended");
  assert.deepEqual(two.state.ranking, [0, 1, 2]);
  assert.deepEqual(resign(two.state, 0), { ok: false, error: "ended" });
});
