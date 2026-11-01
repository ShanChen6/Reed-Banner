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
  generateObstacles,
  playableCount,
} from "../../../src/core/binh-phap";
import type { Element, Profession } from "../../../src/core/battle";
import { createRng } from "../../../src/core/rng";

const NHAP_MON = RULESETS[0]!; // 3×3
// Bàn thử 8×8 đặc (cùng id "kho" để reducer tìm được bộ luật); bậc Khó thật là 7×9 có chướng ngại.
const KHO: Ruleset = { ...RULESETS[2]!, width: 8, height: 8, obstaclePercent: 0 };
const THUONG: Ruleset = { ...RULESETS[1]!, width: 5, height: 5, obstaclePercent: 0 };

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
  // Bàn thử luôn đặc: bỏ chướng ngại sinh theo seed để vị trí quân trong test cố định.
  const cells: Cell[] = base.cells.map((c) => ({ ...c, blocked: false }));
  for (const [key, piece] of Object.entries(pieces)) {
    const [r, c] = key.split(",").map(Number) as [number, number];
    cells[idx(rules.width, r, c)] = { blocked: false, covered: true, piece };
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
    const real = RULESETS[1]!;
    let s = createPuzzle(real, 21);
    for (let i = 0; i < 10; i++) {
      const legal = legalPlacements(s);
      const t = transition(s, legal.length ? place(Math.floor(legal[0]! / real.width), legal[0]! % real.width) : { kind: "discard" });
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

describe("chướng ngại và bàn chữ nhật", () => {
  const wall = (rules: Ruleset, ...blockedAt: [number, number][]): PuzzleState => {
    const base = setup(rules, {}, n("ySu", "kim"));
    const cells = base.cells.map((c, i) => ({ ...c, blocked: blockedAt.some(([r, col]) => idx(rules.width, r, col) === i) }));
    return { ...base, cells };
  };

  it("ô chướng ngại không đặt được, kể cả Quân Lệnh và Thu Hồi", () => {
    const s = wall(NHAP_MON, [1, 1]);
    assert.equal(!checkPlacement(s, n("ySu", "kim"), 1, 1).ok && (checkPlacement(s, n("ySu", "kim"), 1, 1) as { reason: string }).reason, "blocked");
    assert.deepEqual(transition({ ...s, hand: wild() }, place(1, 1)), { ok: false, reason: "blocked" });
    assert.deepEqual(transition({ ...s, hand: eraser }, place(1, 1)), { ok: false, reason: "blocked" });
    assert.equal(legalPlacements(s).length, 8);
  });

  it("chướng ngại không làm cầu nối: quân chỉ kề chướng ngại thì không đặt được", () => {
    const base = setup(NHAP_MON, { "0,0": n("ySu", "kim") }, n("ySu", "kim"));
    const s: PuzzleState = { ...base, cells: base.cells.map((c, i) => ({ ...c, blocked: i === idx(3, 0, 1) })) };
    assert.deepEqual(legalPlacements(s).map((i) => [Math.floor(i / 3), i % 3]), [[1, 0]]);
  });

  it("thắng khi khai thông hết ô chơi được, không cần ô chướng ngại", () => {
    const base = setup(NHAP_MON, { "2,1": n("ySu", "kim") }, n("ySu", "kim"));
    const blockedAt = idx(3, 0, 0);
    const covered = base.cells.map((c, i) => (i === blockedAt || i === idx(3, 2, 2) ? c : { ...c, covered: true }));
    const cells = covered.map((c, i) => (i === blockedAt ? { ...c, blocked: true, covered: false } : c));
    const s: PuzzleState = { ...base, cells, coveredCount: cells.filter((c) => c.covered).length };
    assert.equal(playableCount(cells), 8);
    const t = transition(s, place(2, 2));
    assert.ok(t.ok && t.state.phase === "won");
  });

  it("hàng có chướng ngại kín khi mọi ô chơi được đã có quân, nhưng đường dưới 3 ô chơi được thì không tính", () => {
    const base = setup(NHAP_MON, { "1,0": n("ySu", "kim"), "1,2": n("ySu", "kim") }, n("ySu", "kim"));
    const s3: PuzzleState = { ...base, cells: base.cells.map((c, i) => ({ ...c, blocked: i === idx(3, 0, 0) })) };
    assert.equal(transition(s3, place(1, 1)).ok && (transition(s3, place(1, 1)) as { state: PuzzleState }).state.linesCleared, 1); // hàng 1 đủ 3 ô
    // Hàng 0 chỉ còn 2 ô chơi được: đặt kín cũng không dọn.
    const only2 = setup(NHAP_MON, { "0,1": n("ySu", "kim") }, n("ySu", "kim"));
    const cells = only2.cells.map((c, i) => ({ ...c, blocked: i === idx(3, 0, 0) }));
    const t = transition({ ...only2, cells }, place(0, 2));
    assert.ok(t.ok && t.state.linesCleared === 0);
  });

  it("bàn 5×7: chỉ số hàng-trước-cột đúng và kề 4 hướng không vượt biên", () => {
    const rules: Ruleset = { ...RULESETS[1]!, obstaclePercent: 0 };
    assert.equal(rules.width * rules.height, 35);
    const s = setup(rules, { "6,4": n("ySu", "kim") }, n("ySu", "moc"));
    assert.deepEqual(legalPlacements(s).map((i) => [Math.floor(i / 5), i % 5]), [[5, 4], [6, 3]]);
  });

  it("sinh chướng ngại xác định, đủ số lượng và các ô còn lại luôn liền nhau", () => {
    for (const [w, h, pct] of [[5, 7, 10], [7, 9, 12], [9, 9, 14], [9, 9, 40]] as const) {
      for (let seed = 1; seed <= 25; seed++) {
        const a = generateObstacles(createRng(seed), w, h, pct);
        assert.deepEqual(a, generateObstacles(createRng(seed), w, h, pct));
        const count = a.filter(Boolean).length;
        assert.ok(count <= Math.round((w * h * pct) / 100));
        assert.ok(count >= Math.round((w * h * pct) / 100) - 2, `${w}x${h} ${pct}% seed ${seed}: ${count}`);
        // Liền nhau: lan từ một ô trống phải tới mọi ô trống.
        const free = a.map((b, i) => (b ? -1 : i)).filter((i) => i >= 0);
        const seen = new Set([free[0]!]);
        const stack = [free[0]!];
        while (stack.length) {
          const at = stack.pop()!;
          for (const nb of [at - w, at + w, at % w ? at - 1 : -1, (at + 1) % w ? at + 1 : -1]) {
            if (nb >= 0 && nb < w * h && !a[nb] && !seen.has(nb)) { seen.add(nb); stack.push(nb); }
          }
        }
        assert.equal(seen.size, free.length);
      }
    }
  });

  it("ván của bậc Thường có chướng ngại khác nhau theo seed và lưu/nạp giữ nguyên", () => {
    const rules = RULESETS[1]!;
    const a = createPuzzle(rules, 1);
    const b = createPuzzle(rules, 2);
    assert.equal(a.width, 5);
    assert.equal(a.height, 7);
    assert.ok(a.cells.some((c) => c.blocked));
    assert.notDeepEqual(a.cells.map((c) => c.blocked), b.cells.map((c) => c.blocked));
    assert.deepEqual(parsePuzzle(serializePuzzle(a)), a);
  });

  it("nạp từ chối ô chướng ngại có quân hoặc đã khai thông", () => {
    const good = JSON.parse(serializePuzzle(createPuzzle(RULESETS[1]!, 1))) as { cells: { blocked: boolean; covered: boolean; piece: unknown }[] };
    const i = good.cells.findIndex((c) => c.blocked);
    for (const bad of [{ covered: true, piece: null }, { covered: false, piece: { kind: "wild", uid: "w" } }]) {
      const cells = good.cells.map((c, k) => (k === i ? { blocked: true, ...bad } : c));
      assert.equal(parsePuzzle({ ...good, cells }), null);
    }
  });

  it("thưởng thắng cộng theo vạch Bỏ Lệnh còn lại và số nước tiết kiệm", () => {
    const covered = Array.from({ length: 9 }, (_, i) => i).filter((i) => i !== 8);
    const win = (extra: Partial<PuzzleState>) => {
      const s = setup(NHAP_MON, { "2,1": n("ySu", "kim") }, n("ySu", "kim"), extra, covered);
      const t = transition(s, place(2, 2));
      assert.ok(t.ok && t.state.phase === "won");
      return t.state.score;
    };
    const w = NHAP_MON.score;
    const par = Math.floor(w.parTurnsPerCell * 9);
    // turn = 4 → tiết kiệm par − 5 nước; thanh trống 3 vạch (heat 0).
    const cool = win({ turn: 4, discardHeat: 0 });
    assert.equal(cool, w.place + w.perfectNeighbor + w.win + w.winPerHeatLeft * 3 + w.winPerTurnSaved * (par - 5));
    const hot = win({ turn: 4, discardHeat: 3 });
    assert.equal(hot, w.place + w.perfectNeighbor + w.win + w.winPerHeatLeft * 1 + w.winPerTurnSaved * (par - 5)); // thanh 3 → đặt thành công hạ còn 2 → trống 1 vạch
    assert.ok(win({ turn: 40, discardHeat: 0 }) < cool);
  });
});
