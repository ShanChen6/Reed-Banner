import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAIN_ID, PVP_DRAFT_TURN_MS, PVP_PREP_MS, createDraft, draftBeginPrep, draftPrepDone, draftPrepReady, draftPrepSwap, draftBan, draftCatchUp, draftOver, draftPick, draftStep, type DraftHero, type PvpDraft } from "../../../src/core";

const T0 = 1_000_000;
const hero = (id: string, level = 3, element: DraftHero["element"] = "kim", profession: DraftHero["profession"] = "tuongSi"): DraftHero => ({ id, name: id, level, element, profession });
const ROSTER = ["h1", "h2", "h3", "h4", "h5", "h6", "h7"];

function make(ratings: Record<string, number> = {}): PvpDraft {
  const humans = [["a1", "a2", "a3"], ["b1", "b2", "b3"]] as const;
  const owned = Object.fromEntries([...humans[0], ...humans[1]].map((p) => [p, [hero(MAIN_ID, 5, "hoa", "phapSu"), hero("h1", 2), hero("h2", 4)]]));
  return createDraft({ humans, names: {}, ratings: { a1: 1100, a2: 1100, a3: 1100, b1: 1000, b2: 1000, b3: 1000, ...ratings }, owned, roster: ROSTER, seed: 7, now: T0 });
}

describe("PvP cấm chọn", () => {
  it("phe điểm cao cấm trước, phe điểm thấp chọn trước; mỗi phe cấm 3, mỗi người một lượt chọn", () => {
    const d = make();
    assert.equal(d.banFirst, 0);
    assert.deepEqual(d.steps.slice(0, 6).map((s) => [s.kind, s.side]), [["ban", 0], ["ban", 1], ["ban", 0], ["ban", 1], ["ban", 0], ["ban", 1]]);
    assert.deepEqual(d.steps.slice(6).map((s) => [s.kind, s.side]), [["pick", 1], ["pick", 0], ["pick", 1], ["pick", 0], ["pick", 1], ["pick", 0]]);
    assert.equal(make({ a1: 900, a2: 900, a3: 900 }).banFirst, 1);
  });

  it("chỉ người tới lượt mới cấm; không cấm thẳng Đinh Bộ Lĩnh hay tướng đã cấm", () => {
    const d = make();
    assert.deepEqual(draftBan(d, "b1", { kind: "hero", id: "h1" }, T0), { ok: false, error: "notYourTurn" });
    assert.deepEqual(draftBan(d, "a1", { kind: "hero", id: MAIN_ID }, T0), { ok: false, error: "badBan" });
    assert.deepEqual(draftBan(d, "a1", { kind: "hero", id: "khongCo" }, T0), { ok: false, error: "badBan" });
    const r = draftBan(d, "a1", { kind: "hero", id: "h3" }, T0 + 1000);
    assert.ok(r.ok);
    if (r.ok) {
      assert.equal(r.draft.deadline, T0 + 1000 + PVP_DRAFT_TURN_MS);
      assert.deepEqual(draftBan(r.draft, "b1", { kind: "hero", id: "h3" }, T0), { ok: false, error: "badBan" });
    }
  });

  it("cấm hệ hoặc nghề thì Đinh Bộ Lĩnh không chọn được hệ, nghề đó; cả trận chỉ một Đinh Bộ Lĩnh", () => {
    let d = make();
    const bans = [["a1", { kind: "element", value: "hoa" }], ["b1", { kind: "profession", value: "quanSu" }], ["a2", { kind: "hero", id: "h5" }], ["b2", { kind: "hero", id: "h6" }], ["a3", { kind: "hero", id: "h7" }], ["b3", { kind: "hero", id: "h4" }]] as const;
    for (const [who, ban] of bans) {
      const r = draftBan(d, who, ban, T0);
      assert.ok(r.ok, who);
      if (r.ok) d = r.draft;
    }
    assert.equal(draftStep(d)?.kind, "pick");
    // Đinh Bộ Lĩnh mặc định hệ hỏa đã bị cấm.
    assert.deepEqual(draftPick(d, "b1", { hero: MAIN_ID }, T0), { ok: false, error: "banned" });
    const ok = draftPick(d, "b1", { hero: MAIN_ID, element: "kim" }, T0);
    assert.ok(ok.ok);
    if (!ok.ok) return;
    // Phe kia không chọn Đinh Bộ Lĩnh được nữa.
    assert.deepEqual(draftPick(ok.draft, "a1", { hero: MAIN_ID, element: "kim" }, T0), { ok: false, error: "dblTaken" });
    assert.deepEqual(draftPick(ok.draft, "a1", { hero: "khongCo" }, T0), { ok: false, error: "badHero" });
    assert.deepEqual(draftPick(ok.draft, "b2", { hero: "h1" }, T0), { ok: false, error: "notYourTurn" });
  });

  it("bỏ lượt: chạy bù tới lúc hết giờ thì máy cấm ngẫu nhiên và chọn thay, mỗi người một tướng, không trùng trong phe", () => {
    const done = draftCatchUp(make(), T0 + 20 * PVP_DRAFT_TURN_MS);
    assert.equal(draftOver(done), true);
    assert.equal(done.bans.length, 6);
    assert.ok(done.bans.every((b) => b.auto));
    // Mỗi người chỉ có Đinh Bộ Lĩnh và hai tướng: phe không có Đinh Bộ Lĩnh thiếu một tướng nên một chỗ do máy điền.
    assert.equal(done.picks.length, 5);
    assert.equal(done.picks.filter((p) => p.hero.id === MAIN_ID).length, 1);
    for (const side of [0, 1]) {
      const ids = done.picks.filter((p) => p.side === side).map((p) => p.hero.id);
      assert.equal(new Set(ids).size, ids.length);
    }
    // Kết quả xác định theo hạt giống.
    assert.deepEqual(draftCatchUp(make(), T0 + 20 * PVP_DRAFT_TURN_MS), done);
  });

  it("chưa hết giờ thì chạy bù không đổi gì", () => {
    const d = make();
    assert.equal(draftCatchUp(d, T0 + PVP_DRAFT_TURN_MS - 1), d);
  });

  it("chuẩn bị: đội hình theo ghế rồi tướng máy; chỉ đội trưởng đổi chỗ; sẵn sàng hết hoặc hết giờ thì xong", () => {
    const done = draftCatchUp(make(), T0 + 20 * PVP_DRAFT_TURN_MS);
    const filler = hero("f1", 3);
    const fillers = [[filler, filler, filler].slice(0, 3 - done.picks.filter((p) => p.side === 0).length), [filler, filler, filler].slice(0, 3 - done.picks.filter((p) => p.side === 1).length)] as const;
    const d = draftBeginPrep(done, fillers, T0);
    assert.deepEqual(d.prep!.lineup.map((l) => l.length), [3, 3]);
    assert.equal(d.prep!.deadline, T0 + PVP_PREP_MS);
    assert.deepEqual(draftPrepSwap(d, "a2", 0, 1), { ok: false, error: "notCaptain" });
    assert.deepEqual(draftPrepSwap(d, "a1", 0, 3), { ok: false, error: "badSlot" });
    assert.deepEqual(draftPrepSwap(make(), "a1", 0, 1), { ok: false, error: "notPrep" });
    const r = draftPrepSwap(d, "a1", 0, 2);
    assert.ok(r.ok);
    if (r.ok) assert.deepEqual(r.draft.prep!.lineup[0].map((s) => s.hero.id), [d.prep!.lineup[0][2]!.hero.id, d.prep!.lineup[0][1]!.hero.id, d.prep!.lineup[0][0]!.hero.id]);
    assert.equal(draftPrepDone(d, T0 + 1000), false);
    let all = d;
    for (const o of ["a1", "a2", "a3", "b1", "b2", "b3"]) {
      assert.equal(draftPrepDone(all, T0 + 1000), false);
      const x = draftPrepReady(all, o);
      assert.ok(x.ok);
      if (x.ok) all = x.draft;
    }
    assert.equal(draftPrepDone(all, T0 + 1000), true);
    assert.equal(draftPrepDone(d, T0 + PVP_PREP_MS), true);
  });
});
