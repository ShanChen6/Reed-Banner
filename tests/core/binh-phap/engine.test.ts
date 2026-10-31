import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RULESETS,
  checkPlacement,
  createPuzzle,
  idx,
  legalPlacements,
  parsePuzzle,
  replay,
  serializePuzzle,
  transition,
  type BoardPiece,
  type Cell,
  type Command,
  type Piece,
  type PuzzleState,
  type Ruleset,
} from "../../../src/core/binh-phap";
import type { Element, Profession } from "../../../src/core/battle";

const NHAP_MON = RULESETS[0]!; // 3×3
const KHO = RULESETS[2]!; // 8×8
const THUONG = RULESETS[1]!; // 5×5

const n = (profession: Profession, element: Element, uid = `${profession}-${element}`): BoardPiece => ({
  kind: "normal",
  uid,
  characterId: "dinhBoLinh",
  profession,
  element,
});
const wild = (uid = "w"): BoardPiece => ({ kind: "wild", uid });
const eraser: Piece = { kind: "eraser", uid: "e" };

/** State thử: đặt sẵn quân và quân đang cầm, ô có quân tự động là đã khai thông. */
function setup(rules: Ruleset, pieces: Record<string, BoardPiece>, hand: Piece, extra: Partial<PuzzleState> = {}, covered: number[] = []): PuzzleState {
  const base = createPuzzle(rules, 1);
  const cells: Cell[] = base.cells.map((c) => ({ ...c }));
  for (const [key, piece] of Object.entries(pieces)) {
    const [r, c] = key.split(",").map(Number) as [number, number];
    cells[idx(rules.width, r, c)] = { covered: true, piece };
  }
  for (const i of covered) cells[i] = { ...cells[i]!, covered: true };
  const coveredCount = cells.filter((c) => c.covered).length;
  return { ...base, cells, hand, coveredCount, ...extra };
}
const place = (row: number, col: number): Command => ({ kind: "place", row, col });

describe("đặt quân thường", () => {
  it("bàn trống: đặt được ở mọi ô", () => {
    const s = setup(KHO, {}, n("ySu", "kim"));
    assert.equal(legalPlacements(s).length, 64);
  });

  it("bàn có quân: chỉ ô kề 4 hướng, không tính chéo", () => {
    const s = setup(KHO, { "3,3": n("ySu", "kim") }, n("ySu", "moc"));
    const legal = legalPlacements(s).map((i) => [Math.floor(i / 8), i % 8]);
    assert.deepEqual(legal, [[2, 3], [3, 2], [3, 4], [4, 3]]);
    assert.deepEqual(checkPlacement(s, s.hand, 2, 2), { ok: false, reason: "notAdjacent", blockers: [] });
  });

  it("ví dụ docs: trên Y sư–Kim, trái Pháp sư–Hỏa, đặt Y sư–Hỏa hợp lệ", () => {
    const s = setup(KHO, { "2,3": n("ySu", "kim"), "3,2": n("phapSu", "hoa") }, n("ySu", "hoa"));
    assert.deepEqual(checkPlacement(s, s.hand, 3, 3), { ok: true });
  });

  it("khớp một quân kề nhưng sai quân kề kia thì không hợp lệ", () => {
    const s = setup(KHO, { "2,3": n("ySu", "kim"), "3,2": n("phapSu", "hoa") }, n("ySu", "moc"));
    const c = checkPlacement(s, s.hand, 3, 3);
    assert.equal(c.ok, false);
    assert.deepEqual(!c.ok && c.reason, "mismatch");
    assert.deepEqual(!c.ok && c.blockers, [idx(8, 3, 2)]);
  });

  it("ô đã có quân thì bị chiếm", () => {
    const s = setup(KHO, { "3,3": n("ySu", "kim") }, n("ySu", "kim"));
    assert.equal(checkPlacement(s, s.hand, 3, 3).ok, false);
    assert.equal(!checkPlacement(s, s.hand, 3, 3).ok && (checkPlacement(s, s.hand, 3, 3) as { reason: string }).reason, "occupied");
  });

  it("ngoài bàn bị từ chối", () => {
    const s = setup(KHO, {}, n("ySu", "kim"));
    for (const [r, c] of [[-1, 0], [0, 8], [8, 0], [0.5, 1]] as const) {
      assert.equal(transition(s, place(r, c)).ok, false);
    }
  });
});

describe("Quân Lệnh và Thu Hồi", () => {
  it("Quân Lệnh đặt được ở ô trống bất kỳ, kể cả không kề", () => {
    const s = setup(KHO, { "0,0": n("ySu", "kim") }, wild());
    assert.equal(legalPlacements(s).length, 63);
  });

  it("quân thường đặt cạnh Quân Lệnh coi như khớp, nhưng vẫn phải khớp quân kề khác", () => {
    const s = setup(KHO, { "3,2": wild(), "2,3": n("ySu", "kim") }, n("quanSu", "moc"));
    assert.equal(checkPlacement(s, s.hand, 3, 3).ok, false); // Quân sư–Mộc không khớp Y sư–Kim
    const only = setup(KHO, { "3,2": wild() }, n("quanSu", "moc"));
    assert.deepEqual(checkPlacement(only, only.hand, 3, 3), { ok: true });
  });

  it("Thu Hồi xóa quân, giữ vệt khai thông và không tăng covered", () => {
    const s = setup(KHO, { "3,3": n("ySu", "kim") }, eraser);
    const t = transition(s, place(3, 3));
    assert.ok(t.ok);
    assert.equal(t.state.cells[idx(8, 3, 3)]!.piece, null);
    assert.equal(t.state.cells[idx(8, 3, 3)]!.covered, true);
    assert.equal(t.state.coveredCount, s.coveredCount);
    assert.ok(t.events.some((e) => e.type === "erased"));
  });

  it("Thu Hồi xóa được cả Quân Lệnh; ô trống bị chặn", () => {
    const s = setup(KHO, { "3,3": wild() }, eraser);
    assert.ok(transition(s, place(3, 3)).ok);
    const bad = transition(s, place(0, 0));
    assert.deepEqual(bad, { ok: false, reason: "empty" });
  });
});

describe("hàng, cột và khai thông", () => {
  it("hàng đủ quân thì xóa hàng, giữ covered, cộng điểm và hạ thanh về 0", () => {
    const s = setup(NHAP_MON, { "0,0": n("ySu", "kim"), "0,1": n("ySu", "hoa") }, n("tuongSi", "hoa"), { discardHeat: 2 });
    const t = transition(s, place(0, 2));
    assert.ok(t.ok);
    for (let c = 0; c < 3; c++) {
      assert.equal(t.state.cells[idx(3, 0, c)]!.piece, null);
      assert.equal(t.state.cells[idx(3, 0, c)]!.covered, true);
    }
    assert.equal(t.state.discardHeat, 0);
    assert.equal(t.state.linesCleared, 1);
    assert.deepEqual(t.events.filter((e) => e.type === "lineCleared"), [{ type: "lineCleared", axis: "row", index: 0 }]);
  });

  it("hàng và cột kín cùng lúc: xóa hợp các ô, mỗi đường tính điểm một lần", () => {
    const s = setup(
      NHAP_MON,
      { "0,0": n("ySu", "kim"), "0,1": n("ySu", "kim"), "1,0": n("ySu", "kim") },
      n("ySu", "kim"),
    );
    const t = transition(s, place(0, 2));
    assert.ok(t.ok);
    assert.equal(t.state.linesCleared, 1); // chỉ hàng 0; cột 2 chưa kín
    const s2 = setup(
      NHAP_MON,
      { "0,1": n("ySu", "kim"), "0,2": n("ySu", "kim"), "1,0": n("ySu", "kim"), "2,0": n("ySu", "kim") },
      n("ySu", "kim"),
    );
    const t2 = transition(s2, place(0, 0));
    assert.ok(t2.ok);
    assert.equal(t2.state.linesCleared, 2); // hàng 0 và cột 0 giao nhau ở (0,0)
    assert.equal(t2.state.score, 10 + 2 * 50 + 5 * 2 /* hai quân kề khớp hoàn hảo: (0,1) và (1,0) */);
    assert.equal(t2.state.cells.filter((c) => c.piece).length, 0);
  });

  it("xóa xong, bàn trống thì đặt được ở ô bất kỳ", () => {
    const s = setup(NHAP_MON, { "0,0": n("ySu", "kim"), "0,1": n("ySu", "kim") }, n("ySu", "kim"));
    const t = transition(s, place(0, 2));
    assert.ok(t.ok && t.state.phase === "playing");
    assert.equal(legalPlacements(t.state, n("tuongSi", "hoa")).length, 9);
  });

  it("thắng khi mọi ô đã khai thông, xét trước khi sinh quân mới (RNG không tiến)", () => {
    const covered = Array.from({ length: 9 }, (_, i) => i).filter((i) => i !== 8);
    const s = setup(NHAP_MON, { "2,1": n("ySu", "kim") }, n("ySu", "kim"), {}, covered);
    const t = transition(s, place(2, 2));
    assert.ok(t.ok);
    assert.equal(t.state.phase, "won");
    assert.equal(t.state.coveredCount, 9);
    assert.equal(t.state.rngState, s.rngState);
    assert.ok(t.events.some((e) => e.type === "won"));
    assert.ok(!t.events.some((e) => e.type === "spawned"));
    assert.deepEqual(transition(t.state, place(0, 0)), { ok: false, reason: "finished" });
  });

  it("đặt lại vào ô đã khai thông chỉ không tăng coveredCount", () => {
    const s = setup(NHAP_MON, { "1,1": n("ySu", "kim") }, n("ySu", "kim"), {}, [0]);
    const t = transition(s, place(0, 1));
    assert.ok(t.ok && t.state.coveredCount === s.coveredCount + 1);
    const again = setup(NHAP_MON, { "1,1": n("ySu", "kim") }, n("ySu", "kim"), {}, [1]);
    const t2 = transition(again, place(0, 1));
    assert.ok(t2.ok && t2.state.coveredCount === again.coveredCount);
  });
});

describe("Bỏ Lệnh", () => {
  it("bỏ quân tăng thanh, sinh quân mới và tiến RNG", () => {
    const s = createPuzzle(NHAP_MON, 7);
    const t = transition(s, { kind: "discard" });
    assert.ok(t.ok);
    assert.equal(t.state.discardHeat, 1);
    assert.equal(t.state.discarded, 1);
    assert.notEqual(t.state.rngState, s.rngState);
    assert.notEqual(t.state.hand.uid, s.hand.uid);
  });

  it("thanh đầy mà còn bỏ nữa thì thua", () => {
    let s = createPuzzle(NHAP_MON, 7);
    for (let i = 0; i < NHAP_MON.maxHeat; i++) {
      const t = transition(s, { kind: "discard" });
      assert.ok(t.ok);
      s = t.state;
    }
    assert.equal(s.discardHeat, NHAP_MON.maxHeat);
    assert.equal(s.phase, "playing");
    const lost = transition(s, { kind: "discard" });
    assert.ok(lost.ok && lost.state.phase === "lost");
    assert.deepEqual(transition(lost.state, { kind: "discard" }), { ok: false, reason: "finished" });
  });

  it("đặt quân thành công hạ thanh 1 và không xuống dưới 0", () => {
    const hot = setup(KHO, {}, n("ySu", "kim"), { discardHeat: 2 });
    const t = transition(hot, place(0, 0));
    assert.ok(t.ok && t.state.discardHeat === 1);
    const cold = setup(KHO, {}, n("ySu", "kim"), { discardHeat: 0 });
    const t2 = transition(cold, place(0, 0));
    assert.ok(t2.ok && t2.state.discardHeat === 0);
  });
});

describe("bất biến và xác định", () => {
  it("lệnh sai không đổi gì (state, RNG, điểm, thanh)", () => {
    const s = setup(KHO, { "3,3": n("ySu", "kim") }, n("ySu", "moc"), { discardHeat: 1, score: 40 });
    const frozen = JSON.stringify(s);
    for (const cmd of [place(0, 0), place(3, 3), place(-1, 2), { kind: "nope" } as unknown as Command]) {
      assert.equal(transition(s, cmd).ok, false);
    }
    assert.equal(JSON.stringify(s), frozen);
  });

  it("cùng seed và dãy lệnh cho cùng state; seed khác cho ván khác", () => {
    const play = (seed: number) => {
      let s = createPuzzle(THUONG, seed);
      const cmds: Command[] = [];
      for (let i = 0; i < 40 && s.phase === "playing"; i++) {
        const legal = legalPlacements(s);
        const cmd: Command = legal.length ? place(Math.floor(legal[0]! / 5), legal[0]! % 5) : { kind: "discard" };
        const t = transition(s, cmd);
        if (!t.ok) throw new Error("lệnh hợp lệ bị từ chối");
        s = t.state;
        cmds.push(cmd);
      }
      return { s, cmds };
    };
    const a = play(99);
    const b = play(99);
    assert.deepEqual(a.s, b.s);
    assert.deepEqual(replay(THUONG, 99, a.cmds), a.s);
    assert.notDeepEqual(play(100).s.cells, a.s.cells);
  });

  it("không bao giờ sinh hai quân đặc biệt liên tiếp và không sinh Thu Hồi trên bàn trống", () => {
    const rules: Ruleset = { ...THUONG, wildPermille: 400, eraserPermille: 400 };
    let s = createPuzzle(rules, 5);
    assert.notEqual(s.hand.kind, "eraser");
    let prev = s.hand.kind;
    for (let i = 0; i < 400; i++) {
      const t = transition(s, { kind: "discard" });
      if (!t.ok) break;
      s = t.state.phase === "lost" ? createPuzzle(rules, i) : t.state;
      if (prev !== "normal") assert.equal(s.hand.kind === "normal" || t.state.phase === "lost", true);
      if (t.state.phase !== "lost") assert.notEqual(s.hand.kind === "eraser" && s.cells.every((c) => !c.piece), true);
      prev = s.hand.kind;
    }
  });

  it("quân thường chỉ lấy nghề/hệ trong bộ quân của bậc, và nhân vật có đúng nghề–hệ đó", () => {
    let s = createPuzzle(KHO, 3);
    for (let i = 0; i < 300; i++) {
      const h = s.hand;
      if (h.kind === "normal") {
        assert.ok(KHO.professions.includes(h.profession) && KHO.elements.includes(h.element));
      }
      const t = transition(s, { kind: "discard" });
      if (!t.ok || t.state.phase === "lost") s = createPuzzle(KHO, i + 10);
      else s = t.state;
    }
  });
});

describe("lưu và nạp", () => {
  it("vòng tròn serialize/parse giữ nguyên state", () => {
    let s = createPuzzle(THUONG, 21);
    for (let i = 0; i < 10; i++) {
      const legal = legalPlacements(s);
      const t = transition(s, legal.length ? place(Math.floor(legal[0]! / 5), legal[0]! % 5) : { kind: "discard" });
      if (!t.ok || t.state.phase !== "playing") break;
      s = t.state;
    }
    assert.deepEqual(parsePuzzle(serializePuzzle(s)), s);
  });

  it("dữ liệu hỏng thì trả null chứ không ném lỗi", () => {
    const good = JSON.parse(serializePuzzle(createPuzzle(NHAP_MON, 1))) as Record<string, unknown>;
    const bads: unknown[] = [
      null,
      "{",
      42,
      { ...good, schemaVersion: 99 },
      { ...good, rulesetId: "la" },
      { ...good, rulesVersion: 99 },
      { ...good, width: 4 },
      { ...good, cells: [] },
      { ...good, phase: "won" },
      { ...good, coveredCount: 5 },
      { ...good, discardHeat: 9 },
      { ...good, rngState: -1 },
      { ...good, hand: { kind: "normal", uid: "x", characterId: "a", profession: "rồng", element: "kim" } },
      { ...good, cells: (good.cells as unknown[]).map((c, i) => (i === 0 ? { covered: false, piece: { kind: "wild", uid: "w" } } : c)) },
    ];
    for (const b of bads) assert.equal(parsePuzzle(b), null);
  });
});
