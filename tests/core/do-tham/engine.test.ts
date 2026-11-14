import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DT_ITEM_PICKS,
  DT_ITEM_TARGET,
  DT_LEVELS,
  DT_LEVEL_ORDER,
  countAround,
  deduce,
  deduceClosure,
  dtAct,
  flagsOf,
  generateLayout,
  isGuessFree,
  neighbors,
  newGame,
  openedOf,
  viewOf,
  type DtLevel,
  type DtState,
} from "../../../src/core/do-tham";
import { ELEMENTS } from "../../../src/core/battle/elements";

const mid = (s: { width: number; height: number }) => Math.floor(s.height / 2) * s.width + Math.floor(s.width / 2);
const must = (s: DtState, a: Parameters<typeof dtAct>[1]): DtState => {
  const r = dtAct(s, a);
  assert.ok(r.ok, `${JSON.stringify(a)} -> ${r.ok ? "" : r.reason}`);
  return r.state;
};

/** Người dò chỉ dùng suy luận: mở nước đầu rồi lặp lại các ô chắc chắn. Trả về ván cuối. */
function playByLogic(level: DtLevel, seed: number): DtState {
  let s = newGame(level, seed);
  s = must(s, { type: "open", index: mid(s) });
  for (let guard = 0; guard < 5000 && s.phase === "playing"; guard++) {
    const d = deduceClosure(s.width, s.height, viewOf(s), s.mines);
    const safe = d.safe.find((i) => s.cells[i] === "hidden");
    if (safe === undefined) break;
    s = must(s, { type: "open", index: safe });
  }
  return s;
}

describe("Do Thám: bàn và bậc", () => {
  it("ba bậc đúng cỡ kinh điển", () => {
    assert.deepEqual(DT_LEVEL_ORDER, ["nhapMon", "thuong", "kho"]);
    assert.deepEqual(DT_LEVELS.nhapMon, { width: 9, height: 9, mines: 10 });
    assert.deepEqual(DT_LEVELS.thuong, { width: 16, height: 16, mines: 40 });
    assert.deepEqual(DT_LEVELS.kho, { width: 30, height: 16, mines: 99 });
  });

  it("ô kề: góc 3, cạnh 5, giữa 8", () => {
    assert.equal(neighbors(0, 9, 9).length, 3);
    assert.equal(neighbors(4, 9, 9).length, 5);
    assert.equal(neighbors(40, 9, 9).length, 8);
  });

  it("ván mới chưa có bẫy, nước đầu mới đặt bẫy; ô đầu và 8 ô quanh luôn an toàn", () => {
    for (const level of DT_LEVEL_ORDER) {
      for (const first of [0, mid(DT_LEVELS[level]), DT_LEVELS[level].width * DT_LEVELS[level].height - 1]) {
        const s0 = newGame(level, 12345);
        assert.equal(s0.trap, null);
        assert.equal(s0.phase, "ready");
        const s1 = must(s0, { type: "open", index: first });
        const trap = s1.trap as boolean[];
        assert.equal(trap.filter(Boolean).length, DT_LEVELS[level].mines);
        for (const i of [first, ...neighbors(first, s1.width, s1.height)]) assert.equal(trap[i], false);
        assert.notEqual(s1.phase, "lost");
      }
    }
  });

  it("cùng seed và ô đầu ra cùng một bàn, seed khác ra bàn khác", () => {
    const { width, height, mines } = DT_LEVELS.thuong;
    const a = generateLayout(777, width, height, mines, 100);
    const b = generateLayout(777, width, height, mines, 100);
    const c = generateLayout(778, width, height, mines, 100);
    assert.deepEqual(a, b);
    assert.notDeepEqual(a.trap, c.trap);
  });
});

describe("Do Thám: bàn suy luận được, không phải đoán", () => {
  it("mỗi bậc, nhiều seed: chỉ dùng suy luận từ nước đầu là thắng", () => {
    for (const level of DT_LEVEL_ORDER) {
      for (let seed = 1; seed <= (level === "kho" ? 6 : 12); seed++) {
        const s = playByLogic(level, seed * 104729);
        assert.equal(s.guessFree, true, `${level} seed ${seed} hết số lần thử`);
        assert.equal(s.phase, "won", `${level} seed ${seed}`);
      }
    }
  });

  it("isGuessFree nhận ra bàn phải đoán (hai ô góc không phân biệt được)", () => {
    // 2×2 một bẫy: mở ô (0,0) hiện 1, ba ô còn lại không phân biệt được bằng suy luận.
    const trap = [false, true, false, false];
    assert.equal(isGuessFree(trap, 2, 2, 1, 0), false);
  });

  it("deduce: số 0 chung quanh là an toàn, số bằng ô trống là bẫy", () => {
    const view = [1, -1, -1, -1];
    assert.deepEqual([...deduce(2, 2, view, 3).mine].sort(), [1, 2, 3]);
    const safe = [...deduce(2, 2, [0, -1, -1, -1], 0).safe].sort();
    assert.deepEqual(safe, [1, 2, 3]);
  });
});

describe("Do Thám: mở, cờ và mở nhanh", () => {
  it("mở ô số 0 lan ra, không chạm bẫy; ô mở không vượt số ô an toàn", () => {
    const s = must(newGame("thuong", 4242), { type: "open", index: mid(DT_LEVELS.thuong) });
    assert.ok(openedOf(s) > 9);
    assert.ok(openedOf(s) <= s.width * s.height - s.mines);
  });

  it("cờ: cắm, gỡ, không mở được ô có cờ, không cắm lên ô đã mở", () => {
    let s = newGame("nhapMon", 9);
    s = must(s, { type: "flag", index: 0 });
    assert.equal(s.cells[0], "flag");
    assert.equal(s.phase, "ready");
    assert.equal(flagsOf(s), 1);
    assert.deepEqual(dtAct(s, { type: "open", index: 0 }), { ok: false, reason: "flagged" });
    s = must(s, { type: "flag", index: 0 });
    assert.equal(s.cells[0], "hidden");
    s = must(s, { type: "open", index: mid(s) });
    const open = s.cells.findIndex((c) => c === "open");
    assert.deepEqual(dtAct(s, { type: "flag", index: open }), { ok: false, reason: "alreadyOpen" });
    assert.deepEqual(dtAct(s, { type: "open", index: open }), { ok: false, reason: "alreadyOpen" });
  });

  it("chạm bẫy là thua và ghi ô bẫy; sau đó không đi được nữa", () => {
    let s = must(newGame("nhapMon", 31), { type: "open", index: 40 });
    const trap = (s.trap as boolean[]).findIndex(Boolean);
    s = must(s, { type: "open", index: trap });
    assert.equal(s.phase, "lost");
    assert.equal(s.hit, trap);
    assert.deepEqual(dtAct(s, { type: "open", index: 0 }), { ok: false, reason: "notPlaying" });
  });

  it("mở nhanh: đủ cờ thì mở nốt, thiếu cờ bị từ chối, cắm sai cờ thì sa bẫy", () => {
    let s = must(newGame("thuong", 2024), { type: "open", index: mid(DT_LEVELS.thuong) });
    const counts = s.counts as number[];
    const trap = s.trap as boolean[];
    const target = s.cells.findIndex((c, i) => c === "open" && (counts[i] as number) > 0 && neighbors(i, s.width, s.height).some((n) => s.cells[n] === "hidden"));
    assert.ok(target >= 0);
    assert.deepEqual(dtAct(s, { type: "chord", index: target }), { ok: false, reason: "chordMismatch" });
    const around = neighbors(target, s.width, s.height);
    const wrongFlags = around.filter((n) => !trap[n] && s.cells[n] === "hidden").slice(0, 1);
    const rightFlags = around.filter((n) => trap[n]);
    // Cắm đủ số cờ nhưng một cờ sai: mở nhanh phải trúng bẫy thật.
    if (wrongFlags.length > 0 && rightFlags.length > 0) {
      let w = s;
      for (const f of [...rightFlags.slice(1), ...wrongFlags]) w = must(w, { type: "flag", index: f });
      if (flagsOf(w) === (counts[target] as number)) assert.equal(must(w, { type: "chord", index: target }).phase, "lost");
    }
    for (const f of rightFlags) s = must(s, { type: "flag", index: f });
    const after = must(s, { type: "chord", index: target });
    assert.ok(openedOf(after) > openedOf(s));
    assert.notEqual(after.phase, "lost");
  });

  it("thắng khi mở hết ô an toàn; bẫy còn lại tự cắm cờ", () => {
    const s = playByLogic("nhapMon", 5);
    assert.equal(s.phase, "won");
    assert.equal(flagsOf(s), s.mines);
    assert.equal(openedOf(s), s.width * s.height - s.mines);
  });

  it("trạng thái ván chuyển qua JSON được", () => {
    const s = must(newGame("thuong", 99, ["kim", "tho"]), { type: "open", index: 100 });
    assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
  });
});

describe("Do Thám: đạo cụ nguyên tố", () => {
  const started = (picks: Parameters<typeof newGame>[2], level: DtLevel = "thuong", seed = 5151) =>
    must(newGame(level, seed, picks), { type: "open", index: mid(DT_LEVELS[level]) });

  it("mang tối đa hai đạo cụ khác nhau, mỗi hệ có cách chọn mục tiêu", () => {
    assert.equal(DT_ITEM_PICKS, 2);
    assert.equal(newGame("nhapMon", 1, ["kim", "kim", "moc", "thuy"]).items.length, 2);
    for (const e of ELEMENTS) assert.ok(DT_ITEM_TARGET[e]);
  });

  it("không có đạo cụ hoặc đã dùng thì bị từ chối", () => {
    const s = started(["kim"]);
    assert.deepEqual(dtAct(s, { type: "item", element: "hoa", index: 0 }), { ok: false, reason: "noItem" });
    const used = must(s, { type: "item", element: "kim" });
    assert.deepEqual(dtAct(used, { type: "item", element: "kim" }), { ok: false, reason: "used" });
  });

  it("Kim: cắm cờ đúng một ô có bẫy thật", () => {
    const s = started(["kim"]);
    const r = must(s, { type: "item", element: "kim" });
    assert.equal(flagsOf(r), 1);
    const i = r.cells.findIndex((c) => c === "flag");
    assert.equal((r.trap as boolean[])[i], true);
  });

  it("Mộc: ô an toàn thì mở, ô có bẫy thì tự cắm cờ mà không thua", () => {
    const s = started(["moc"]);
    const trap = s.trap as boolean[];
    const bad = trap.findIndex((t, i) => t && s.cells[i] === "hidden");
    const r1 = must(s, { type: "item", element: "moc", index: bad });
    assert.equal(r1.cells[bad], "flag");
    assert.notEqual(r1.phase, "lost");
    const good = trap.findIndex((t, i) => !t && s.cells[i] === "hidden");
    const r2 = must(s, { type: "item", element: "moc", index: good });
    assert.equal(r2.cells[good], "open");
  });

  it("Thủy: báo đúng số bẫy trong vùng 3×3", () => {
    const s = started(["thuy"]);
    const trap = s.trap as boolean[];
    const center = 20;
    const want = [center, ...neighbors(center, s.width, s.height)].filter((i) => trap[i]).length;
    const r = must(s, { type: "item", element: "thuy", index: center });
    assert.deepEqual(r.info, { kind: "area", index: center, count: want });
    assert.equal(must(r, { type: "flag", index: 0 }).info, null);
  });

  it("Lôi: báo đúng số bẫy cả hàng hoặc cả cột", () => {
    const s = started(["loi"]);
    const trap = s.trap as boolean[];
    const idx = 3 * s.width + 7;
    const row = Array.from({ length: s.width }, (_, x) => trap[3 * s.width + x]).filter(Boolean).length;
    const r = must(s, { type: "item", element: "loi", index: idx, axis: "row" });
    assert.deepEqual(r.info, { kind: "line", axis: "row", at: 3, count: row });
    const col = Array.from({ length: s.height }, (_, y) => trap[y * s.width + 7]).filter(Boolean).length;
    const c = must(started(["loi"]), { type: "item", element: "loi", index: idx, axis: "col" });
    assert.deepEqual(c.info, { kind: "line", axis: "col", at: 7, count: col });
    assert.deepEqual(dtAct(started(["loi"]), { type: "item", element: "loi", index: idx }), { ok: false, reason: "needTarget" });
  });

  it("Hỏa: mở các ô an toàn và cắm cờ các bẫy trong vùng 3×3, không thua", () => {
    const s = started(["hoa"], "thuong", 777);
    const trap = s.trap as boolean[];
    const center = s.cells.findIndex((c, i) => c === "hidden" && neighbors(i, s.width, s.height).some((n) => trap[n]));
    const r = must(s, { type: "item", element: "hoa", index: center });
    assert.notEqual(r.phase, "lost");
    for (const i of [center, ...neighbors(center, s.width, s.height)]) {
      assert.equal(r.cells[i], trap[i] ? "flag" : "open");
    }
  });

  it("Thổ: khiên đất đỡ đúng một lần sa bẫy", () => {
    let s = started(["tho"]);
    s = must(s, { type: "item", element: "tho" });
    assert.equal(s.shield, "active");
    const trap = s.trap as boolean[];
    const [a, b] = trap.flatMap((t, i) => (t && s.cells[i] === "hidden" ? [i] : []));
    s = must(s, { type: "open", index: a as number });
    assert.equal(s.phase, "playing");
    assert.equal(s.shield, "spent");
    assert.equal(s.cells[a as number], "flag");
    s = must(s, { type: "open", index: b as number });
    assert.equal(s.phase, "lost");
  });

  it("Thổ dùng được trước nước đầu; đạo cụ khác cần ván đã bắt đầu", () => {
    const s = newGame("nhapMon", 3, ["tho", "kim"]);
    assert.deepEqual(dtAct(s, { type: "item", element: "kim" }), { ok: false, reason: "notStarted" });
    assert.equal(must(s, { type: "item", element: "tho" }).shield, "active");
  });

  it("Phong: gợi ý đúng một ô chắc chắn, luôn khớp với bàn thật", () => {
    for (let seed = 1; seed <= 8; seed++) {
      const s = started(["phong"], "thuong", seed * 31337);
      const r = dtAct(s, { type: "item", element: "phong" });
      assert.ok(r.ok);
      if (!r.ok || r.state.info?.kind !== "hint") continue;
      const trap = s.trap as boolean[];
      assert.equal(trap[r.state.info.index], r.state.info.certain === "mine", `seed ${seed}`);
    }
  });
});

describe("Do Thám: đếm bẫy quanh ô", () => {
  it("countAround khớp với số ô kề có bẫy", () => {
    const trap = [true, false, false, false, false, false, false, false, true];
    const c = countAround(trap, 3, 3);
    assert.equal(c[4], 2);
    assert.equal(c[1], 1);
    assert.equal(c[0], 0);
  });
});
