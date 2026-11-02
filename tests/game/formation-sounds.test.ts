import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RULESETS, createPuzzle, legalPlacements, transition, type PuzzleEvent } from "../../src/core/binh-phap";
import { CUE_IDS } from "../../src/app/game/audio/cues";
import { cuesForEvents, flameCue, FORMATION_PRELOAD, isPerfectPlacement, musicFor, tensionLayer } from "../../src/app/game/formation/sounds";

const piece = { kind: "normal", uid: "p1", characterId: "x", profession: "tuongSi", element: "kim" } as const;
const ids = (events: readonly PuzzleEvent[], prev = 0) => cuesForEvents(events, prev).map((c) => c.id);

describe("âm thanh Trận Đồ: ánh xạ sự kiện sang cue", () => {
  it("đặt quân thường ra tiếng đặt, ô che tan chỉ một tiếng dù nhiều ô", () => {
    const out = ids([
      { type: "placed", row: 0, col: 0, piece },
      { type: "covered", row: 0, col: 0 },
      { type: "covered", row: 0, col: 1 },
    ]);
    assert.deepEqual(out, ["formation.place", "formation.fogclear"]);
  });

  it("Quân Lệnh, dung hợp và Thu Hồi có cue riêng", () => {
    assert.deepEqual(ids([{ type: "placed", row: 0, col: 0, piece: { kind: "wild", uid: "w" } }]), ["formation.wild"]);
    assert.deepEqual(ids([{ type: "placed", row: 0, col: 0, piece: { kind: "fusion", uid: "f", characterId: "dinhNgoc" } }]), ["formation.fusion"]);
    assert.deepEqual(ids([{ type: "erased", row: 0, col: 0, piece }]), ["formation.eraser"]);
  });

  it("nhiều đường dọn cùng lúc là một tiếng quét cao hơn", () => {
    const one = cuesForEvents([{ type: "lineCleared", axis: "row", index: 0 }]);
    const three = cuesForEvents([
      { type: "lineCleared", axis: "row", index: 0 },
      { type: "lineCleared", axis: "col", index: 1 },
      { type: "lineCleared", axis: "col", index: 2 },
    ]);
    assert.equal(one.length, 1);
    assert.equal(three.length, 1);
    assert.equal(one[0]!.rate, 1);
    assert.ok(three[0]!.rate! > one[0]!.rate!);
  });

  it("Bỏ Lệnh: tiếng vò giấy và ngọn lửa theo bậc mới", () => {
    for (const [heat, cue] of [[1, "formation.flame1"], [2, "formation.flame2"], [3, "formation.flame3"]] as const) {
      assert.deepEqual(ids([{ type: "discarded", piece, heat }, { type: "heat", heat }], heat - 1), ["formation.discard", cue]);
      assert.equal(flameCue(heat), cue);
    }
  });

  it("lửa hạ khi đặt thành công thì có tiếng lụi, không bùng lại", () => {
    assert.deepEqual(ids([{ type: "placed", row: 0, col: 0, piece }, { type: "heat", heat: 1 }], 2), ["formation.place", "formation.flamedown"]);
  });

  it("thắng và thua", () => {
    assert.ok(ids([{ type: "won" }]).includes("formation.win"));
    assert.ok(ids([{ type: "lost", reason: "heat" }]).includes("formation.lose"));
  });

  it("sự kiện chỉ để hiển thị (spawned) không ra tiếng", () => {
    assert.deepEqual(ids([{ type: "spawned", piece }]), []);
  });

  it("chạy ván thật: mọi cue sinh ra đều là mã đã khai báo", () => {
    const known = new Set<string>(CUE_IDS);
    for (const rules of RULESETS) {
      let s = createPuzzle(rules, 7);
      for (let i = 0; i < 80 && s.phase === "playing"; i++) {
        const legal = legalPlacements(s);
        const t = transition(s, legal.length ? { kind: "place", row: Math.floor(legal[0]! / s.width), col: legal[0]! % s.width } : { kind: "discard" });
        assert.ok(t.ok);
        for (const c of cuesForEvents(t.events, s.discardHeat)) assert.ok(known.has(c.id), c.id);
        s = t.state;
      }
    }
  });

  it("lớp căng thẳng tăng theo thanh Bỏ Lệnh", () => {
    assert.equal(tensionLayer(0, 3), 0);
    assert.ok(Math.abs(tensionLayer(1, 3) - 1 / 3) < 1e-9);
    assert.equal(tensionLayer(3, 3), 1);
    assert.equal(tensionLayer(9, 3), 1);
    assert.equal(tensionLayer(1, 0), 0);
  });

  it("nhạc theo màn", () => {
    const s = createPuzzle(RULESETS[0]!, 1);
    assert.equal(musicFor(null), "formation_menu");
    assert.equal(musicFor(s), "formation_play");
    assert.equal(musicFor({ ...s, phase: "won" }), "formation_result_win");
    assert.equal(musicFor({ ...s, phase: "lost" }), "formation_result_lose");
  });

  it("đặt khớp cả nghề lẫn hệ với một quân kề thì có tiếng ngân", () => {
    const s = createPuzzle(RULESETS[0]!, 1);
    const same = { kind: "normal", uid: "a", characterId: "x", profession: "tuongSi", element: "kim" } as const;
    const half = { kind: "normal", uid: "b", characterId: "y", profession: "tuongSi", element: "hoa" } as const;
    const cells = s.cells.map((c, i) => (i === 1 ? { ...c, piece: same } : c));
    const hand = { ...same, uid: "h" };
    assert.equal(isPerfectPlacement({ ...s, cells, hand }, 0, 0), true);
    assert.equal(isPerfectPlacement({ ...s, cells, hand: { ...half, uid: "h" } }, 0, 0), false);
    assert.equal(isPerfectPlacement({ ...s, cells, hand: { kind: "wild", uid: "w" } }, 0, 0), false);
    assert.equal(isPerfectPlacement({ ...s, cells, hand }, 2, 2), false);
  });

  it("danh sách tải sẵn chỉ chứa mã hợp lệ", () => {
    for (const c of FORMATION_PRELOAD) assert.ok((CUE_IDS as readonly string[]).includes(c));
  });
});
