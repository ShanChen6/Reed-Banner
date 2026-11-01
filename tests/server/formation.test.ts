import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_RANKED_TURNS,
  REWARD_GOLD,
  legalPlacements,
  periodKey,
  transition,
  type PuzzleState,
} from "../../src/core/binh-phap";
import {
  MemoryFormationStore,
  claimFormation,
  formationOverview,
  formationSalt,
  formationSeed,
  moveFormation,
  startFormation,
  type FormationDeps,
  type FormationView,
} from "../../src/server/formation";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";

const DAY = 24 * 3600_000;
const T0 = Date.parse("2026-11-04T05:00:00Z"); // thứ Tư, 12 giờ trưa giờ Việt Nam

function deps(over: Partial<FormationDeps> = {}): FormationDeps {
  let n = 0;
  return {
    store: new MemoryFormationStore(),
    profiles: new MemoryProfileStore(),
    now: T0,
    secret: "khoa-bi-mat-cho-test",
    enabled: true,
    newId: () => `f_${++n}`,
    isSignedIn: async () => true,
    ...over,
  };
}
const at = (d: FormationDeps, now: number): FormationDeps => ({ ...d, now });

/**
 * Bot greedy chỉ nhìn bản công khai (không seed, không RNG), như một người chơi thật: chọn nước cho nhiều ô khai
 * thông và điểm nhất. `variant` đổi nước chọn ở vài lượt để mỗi người chơi ra một kết quả khác nhau.
 */
function chooseCommand(view: FormationView, variant = 0) {
  const p = view.puzzle;
  const state = { ...p, seed: 0, rngState: 0 } as PuzzleState;
  if (p.hand.kind === "eraser" && p.discardHeat < 2) return { kind: "discard" } as const;
  const ranked = legalPlacements(state)
    .map((i) => {
      const t = transition(state, { kind: "place", row: Math.floor(i / p.width), col: i % p.width });
      return { i, v: t.ok ? t.state.coveredCount * 1000 + t.state.score : -1 };
    })
    .sort((a, b) => b.v - a.v);
  if (ranked.length === 0) return { kind: "discard" } as const;
  const pick = ranked[(view.seq + variant) % 4 === 0 ? Math.min(1, ranked.length - 1) : 0]!;
  return { kind: "place", row: Math.floor(pick.i / p.width), col: pick.i % p.width } as const;
}

let variants = 0;
async function playOut(d: FormationDeps, owner: string, level: string, variant = variants++): Promise<FormationView> {
  const started = await startFormation(d, owner, level);
  assert.ok(started.ok);
  let view = started.view;
  for (let i = 0; i < 1000 && view.status === "playing"; i++) {
    const r = await moveFormation(d, owner, level, view.seq, chooseCommand(view, variant));
    assert.ok(r.ok, JSON.stringify(r));
    view = r.view;
  }
  assert.notEqual(view.status, "playing");
  return view;
}

describe("Trận Đồ xếp hạng: cổng vào", () => {
  it("tắt cờ, thiếu khóa bí mật, bậc lạ hoặc bậc hướng dẫn đều bị từ chối", async () => {
    assert.deepEqual(await startFormation(deps({ enabled: false }), "a", "thuong"), { ok: false, error: "featureDisabled" });
    assert.deepEqual(await startFormation(deps({ secret: undefined }), "a", "thuong"), { ok: false, error: "unavailable" });
    for (const level of ["huong-dan", "la", 5, null, undefined]) assert.deepEqual(await startFormation(deps(), "a", level), { ok: false, error: "unknownLevel" });
    assert.deepEqual(await formationOverview(deps({ enabled: false }), "a"), { enabled: false, canPlay: false, levels: [] });
  });
});

describe("Trận Đồ xếp hạng: chỉ tài khoản đã đăng nhập", () => {
  const guestsOnly = (): FormationDeps => deps({ isSignedIn: async (id) => id !== "khach" });

  it("khách không mở ván, không đi nước, không nhận thưởng", async () => {
    const d = guestsOnly();
    assert.deepEqual(await startFormation(d, "khach", "thuong"), { ok: false, error: "loginRequired" });
    assert.deepEqual(await moveFormation(d, "khach", "thuong", 0, { kind: "discard" }), { ok: false, error: "loginRequired" });
    assert.deepEqual(await claimFormation(at(d, T0 + DAY), "khach", "thuong", periodKey("thuong", d.now)!), { ok: false, error: "loginRequired" });
    assert.equal(await d.store.get("thuong", periodKey("thuong", d.now)!, "khach"), null); // không để lại ván nào
  });

  it("tài khoản đăng nhập chơi bình thường; khách không xem bảng (canPlay false, danh sách rỗng)", async () => {
    const d = guestsOnly();
    assert.ok((await startFormation(d, "tai-khoan", "thuong")).ok);
    const asGuest = await formationOverview(d, "khach");
    assert.equal(asGuest.canPlay, false);
    assert.equal(asGuest.enabled, true);
    assert.deepEqual(asGuest.levels, []);
    assert.equal((await formationOverview(d, null)).canPlay, false);
    assert.equal((await formationOverview(d, "tai-khoan")).canPlay, true);
    assert.equal((await formationOverview(d, "tai-khoan")).levels.length, 3);
  });

  it("cờ tắt thì báo tắt trước khi hỏi đăng nhập", async () => {
    assert.deepEqual(await startFormation({ ...guestsOnly(), enabled: false }, "khach", "thuong"), { ok: false, error: "featureDisabled" });
  });
});

describe("Trận Đồ xếp hạng: mở ván", () => {
  it("mọi người chơi cùng một bàn trong cùng kỳ; kỳ khác thì bàn khác", async () => {
    const d = deps();
    const a = await startFormation(d, "a", "kho");
    const b = await startFormation(d, "b", "kho");
    assert.ok(a.ok && b.ok);
    assert.deepEqual(a.view.puzzle, b.view.puzzle);
    const next = await startFormation(at(d, T0 + 7 * DAY), "a", "dai-tran");
    const cur = await startFormation(d, "a", "dai-tran");
    assert.ok(next.ok && cur.ok);
    assert.notDeepEqual(next.view.puzzle.cells, cur.view.puzzle.cells);
  });

  it("mở lại thì nối đúng ván cũ, không bày bàn mới và không reset", async () => {
    const d = deps();
    const first = await startFormation(d, "a", "thuong");
    assert.ok(first.ok && !first.resumed);
    const moved = await moveFormation(d, "a", "thuong", 0, chooseCommand(first.view));
    assert.ok(moved.ok);
    const again = await startFormation(d, "a", "thuong");
    assert.ok(again.ok && again.resumed);
    assert.deepEqual(again.view, moved.view);
  });

  it("hai request mở cùng lúc chỉ tạo một ván", async () => {
    const d = deps();
    const rs = await Promise.all([startFormation(d, "a", "thuong"), startFormation(d, "a", "thuong")]);
    assert.ok(rs.every((r) => r.ok));
    assert.equal(rs.filter((r) => r.ok && !r.resumed).length, 1);
  });

  it("không lộ seed hoặc trạng thái RNG, kể cả trong JSON", async () => {
    const d = deps();
    const r = await startFormation(d, "a", "kho");
    assert.ok(r.ok);
    const json = JSON.stringify(r.view);
    assert.ok(!("seed" in r.view.puzzle) && !("rngState" in r.view.puzzle));
    const seed = formationSeed(d.secret!, "kho", periodKey("kho", d.now)!);
    assert.ok(!json.includes(`"seed"`) && !json.includes(`"rngState"`));
    assert.ok(!json.includes(`:${seed},`) && !json.includes(`:${seed}}`));
  });

  it("tổng quan có endsAt và theme của kỳ; theme khớp theme của ván khi mở", async () => {
    const d = deps();
    const before = (await formationOverview(d, "a")).levels;
    for (const l of before) {
      assert.ok(l.endsAt > d.now && l.endsAt - d.now <= 7 * DAY);
      assert.equal(typeof l.theme, "number");
      assert.ok(!JSON.stringify(l).includes(formationSalt(d.secret!, l.level, l.period)));
    }
    for (const level of ["thuong", "kho", "dai-tran"]) {
      const started = await startFormation(d, "a", level);
      assert.ok(started.ok);
      assert.equal(started.view.puzzle.theme, before.find((l) => l.level === level)!.theme, level);
    }
    const thuong = before.find((l) => l.level === "thuong")!;
    assert.equal(thuong.endsAt, Date.parse("2026-11-04T17:00:00Z")); // 0 giờ VN ngày 05/11
  });

  it("ván lưu có muối bí mật; bản gửi client chỉ có theme, không muối", async () => {
    const d = deps();
    const r = await startFormation(d, "a", "dai-tran");
    assert.ok(r.ok);
    const stored = (await d.store.get("dai-tran", periodKey("dai-tran", d.now)!, "a"))!;
    assert.equal(stored.state.salt, formationSalt(d.secret!, "dai-tran", periodKey("dai-tran", d.now)!));
    assert.match(stored.state.salt!, /^[0-9a-f]{32}$/);
    const json = JSON.stringify(r.view);
    assert.ok(!json.includes("salt") && !json.includes(stored.state.salt!));
    assert.equal(typeof r.view.puzzle.theme, "number");
    // Cùng kỳ cùng theme cho mọi người; muối khác nhau theo khóa, bậc và kỳ.
    const other = await startFormation(d, "b", "dai-tran");
    assert.ok(other.ok && other.view.puzzle.theme === r.view.puzzle.theme);
    assert.notEqual(formationSalt("k1", "kho", "2026-11-04"), formationSalt("k2", "kho", "2026-11-04"));
    assert.notEqual(formationSalt("k1", "kho", "2026-11-04"), formationSalt("k1", "thuong", "2026-11-04"));
    assert.notEqual(formationSalt("k1", "kho", "2026-11-04"), formationSalt("k1", "kho", "2026-11-05"));
    // Muối khác seed: biết seed không suy ra được muối.
    assert.notEqual(formationSalt("k1", "kho", "2026-11-04"), formationSeed("k1", "kho", "2026-11-04").toString(16));
  });

  it("seed phụ thuộc khóa bí mật, bậc và kỳ", () => {
    const s = formationSeed("k1", "kho", "2026-11-04");
    assert.equal(s, formationSeed("k1", "kho", "2026-11-04"));
    assert.notEqual(s, formationSeed("k2", "kho", "2026-11-04"));
    assert.notEqual(s, formationSeed("k1", "thuong", "2026-11-04"));
    assert.notEqual(s, formationSeed("k1", "kho", "2026-11-05"));
  });
});

describe("Trận Đồ xếp hạng: đi nước", () => {
  it("nước hợp lệ tăng seq; lệnh sai không đổi gì; seq lệch bị từ chối kèm ván hiện tại", async () => {
    const d = deps();
    const s = await startFormation(d, "a", "thuong");
    assert.ok(s.ok);
    const r = await moveFormation(d, "a", "thuong", 0, chooseCommand(s.view));
    assert.ok(r.ok && r.view.seq === 1);
    // Lệnh sai luật: ô ngoài bàn.
    const bad = await moveFormation(d, "a", "thuong", 1, { kind: "place", row: 99, col: 0 });
    assert.deepEqual(bad, { ok: false, error: "rejected", reason: "outOfBounds" });
    const after = await startFormation(d, "a", "thuong");
    assert.ok(after.ok && after.view.seq === 1);
    assert.deepEqual(after.view.puzzle, r.view.puzzle);
    // Gửi lại seq cũ (trùng lệnh hoặc hai tab).
    const stale = await moveFormation(d, "a", "thuong", 0, chooseCommand(s.view));
    assert.ok(!stale.ok && stale.error === "conflict" && stale.view?.seq === 1);
  });

  it("dữ liệu rác bị từ chối, chưa mở ván thì không đi được", async () => {
    const d = deps();
    assert.deepEqual(await moveFormation(d, "a", "thuong", 0, { kind: "discard" }), { ok: false, error: "noAttempt" });
    await startFormation(d, "a", "thuong");
    for (const [seq, cmd] of [[0, null], [0, { kind: "x" }], [0, { kind: "place", row: "1", col: 1 }], ["0", { kind: "discard" }], [0.5, { kind: "discard" }]] as const) {
      assert.deepEqual(await moveFormation(d, "a", "thuong", seq, cmd), { ok: false, error: "badRequest" });
    }
  });

  it("chỉ chạy được ván của chính mình", async () => {
    const d = deps();
    await startFormation(d, "a", "thuong");
    assert.deepEqual(await moveFormation(d, "b", "thuong", 0, { kind: "discard" }), { ok: false, error: "noAttempt" });
  });

  it("chơi hết ván: thắng hoặc thua, rồi không đi thêm được", async () => {
    const d = deps();
    const view = await playOut(d, "a", "thuong");
    if (view.status === "won") {
      assert.ok(view.score !== null && view.score > 0 && view.rank === 1);
      assert.equal(view.puzzle.coveredCount, view.puzzle.cells.filter((c) => !c.blocked).length);
    } else assert.equal(view.rank, null);
    const more = await moveFormation(d, "a", "thuong", view.seq, { kind: "discard" });
    assert.ok(!more.ok && more.error === "finished");
  });

  it("quá số lệnh tối đa thì xử thua", async () => {
    const d = deps();
    const s = await startFormation(d, "a", "thuong");
    assert.ok(s.ok);
    const entry = (await d.store.get("thuong", periodKey("thuong", d.now)!, "a"))!;
    assert.ok(await d.store.save({ ...entry, state: { ...entry.state, turn: MAX_RANKED_TURNS - 1 }, seq: entry.seq + 1 }, entry.seq));
    const cur = await startFormation(d, "a", "thuong");
    assert.ok(cur.ok);
    const r = await moveFormation(d, "a", "thuong", cur.view.seq, chooseCommand(cur.view));
    assert.ok(r.ok && r.view.status === "lost" && r.view.rank === null);
  });
});

describe("Trận Đồ xếp hạng: bảng và thưởng", () => {
  /** Chơi tới khi có ván thắng (bot greedy thắng phần lớn), mỗi người một ván trong cùng kỳ. */
  async function winners(d: FormationDeps, level: string, owners: string[]) {
    const out: { owner: string; view: FormationView }[] = [];
    for (const o of owners) {
      const v = await playOut(d, o, level);
      if (v.status === "won") out.push({ owner: o, view: v });
    }
    return out;
  }

  it("bảng xếp theo điểm, hạng nhất quán với rankOf, người xem được đánh dấu", async () => {
    const d = deps();
    const owners = Array.from({ length: 12 }, (_, i) => `nguoi-${i}`);
    const won = await winners(d, "thuong", owners);
    assert.ok(won.length >= 3, "bot nên thắng vài ván");
    const view = await formationOverview(d, won[0]!.owner);
    const l = view.levels.find((x) => x.level === "thuong")!;
    assert.equal(l.winners, won.length);
    assert.equal(l.top.length, won.length);
    for (let i = 1; i < l.top.length; i++) assert.ok(l.top[i - 1]!.score >= l.top[i]!.score);
    assert.equal(l.top.filter((r) => r.mine).length, 1);
    assert.equal(l.mine?.rank, l.top.find((r) => r.mine)!.rank);
  });

  it("không nhận thưởng khi kỳ chưa khép lại; sau khi khép thì nhận đúng một lần, đúng bậc", async () => {
    const d = deps();
    const won = await winners(d, "thuong", Array.from({ length: 10 }, (_, i) => `nguoi-${i}`));
    assert.ok(won.length >= 2);
    const w = won[0]!;
    const period = periodKey("thuong", d.now)!;
    assert.deepEqual(await claimFormation(d, w.owner, "thuong", period), { ok: false, error: "notClaimable" });
    const rankBefore = (await formationOverview(d, w.owner)).levels.find((l) => l.level === "thuong")!.mine?.rank;
    const next = at(d, T0 + DAY);
    const pending = (await formationOverview(next, w.owner)).levels.find((l) => l.level === "thuong")!.claimable;
    assert.equal(pending.length, 1);
    const r = await claimFormation(next, w.owner, "thuong", period);
    assert.ok(r.ok);
    assert.equal(r.gold, REWARD_GOLD.thuong![r.tier]);
    assert.equal(r.rank, rankBefore); // hạng chốt khi nhận bằng hạng cuối kỳ
    assert.equal(r.winners, won.length);
    assert.equal((await loadProfile(d.profiles, w.owner)).profile.gold - (await loadProfile(new MemoryProfileStore(), "x")).profile.gold, r.gold);
    assert.deepEqual(await claimFormation(next, w.owner, "thuong", period), { ok: false, error: "alreadyClaimed" });
    assert.equal((await formationOverview(next, w.owner)).levels.find((l) => l.level === "thuong")!.claimable.length, 0);
  });

  it("nhận song song chỉ cộng vàng một lần", async () => {
    const d = deps();
    const w = (await winners(d, "thuong", ["a", "b", "c", "d"]))[0]!;
    const next = at(d, T0 + DAY);
    const rs = await Promise.all(Array.from({ length: 5 }, () => claimFormation(next, w.owner, "thuong", periodKey("thuong", d.now)!)));
    assert.equal(rs.filter((r) => r.ok).length, 1);
    const base = (await loadProfile(new MemoryProfileStore(), "x")).profile.gold;
    const gold = (await loadProfile(d.profiles, w.owner)).profile.gold;
    const first = rs.find((r) => r.ok)!;
    assert.ok(first.ok);
    assert.equal(gold - base, first.gold);
  });

  it("ván thua hoặc người không chơi không có thưởng; kỳ hoặc bậc sai thì không hợp lệ", async () => {
    const d = deps();
    await startFormation(d, "chua-xong", "thuong");
    const next = at(d, T0 + DAY);
    const period = periodKey("thuong", d.now)!;
    assert.deepEqual(await claimFormation(next, "chua-xong", "thuong", period), { ok: false, error: "notClaimable" });
    assert.deepEqual(await claimFormation(next, "chua-bao-gio", "thuong", period), { ok: false, error: "notClaimable" });
    assert.deepEqual(await claimFormation(next, "a", "huong-dan", period), { ok: false, error: "unknownLevel" });
    for (const p of [null, 5, "hôm qua", "2026-1-1"]) assert.deepEqual(await claimFormation(next, "a", "thuong", p), { ok: false, error: "badRequest" });
  });

  it("cộng vàng hỏng thì hoàn lại cờ nhận để thử lại được", async () => {
    const d = deps();
    const w = (await winners(d, "thuong", ["a", "b", "c", "d"]))[0]!;
    const broken: ProfileStore = { get: d.profiles.get.bind(d.profiles), put: async () => false };
    const next = at(d, T0 + DAY);
    const period = periodKey("thuong", d.now)!;
    assert.deepEqual(await claimFormation({ ...next, profiles: broken }, w.owner, "thuong", period), { ok: false, error: "conflict" });
    const retry = await claimFormation(next, w.owner, "thuong", period);
    assert.ok(retry.ok);
  });

  it("thưởng Đại trận lớn hơn Khó lớn hơn Thường ở cùng bậc thưởng", () => {
    for (const tier of ["top1", "top3", "top10", "half", "win"] as const) {
      assert.ok(REWARD_GOLD.thuong![tier] < REWARD_GOLD.kho![tier] && REWARD_GOLD.kho![tier] < REWARD_GOLD["dai-tran"]![tier]);
    }
  });

  it("Đại trận theo tuần: cùng một ván suốt tuần, thưởng chỉ nhận sau chủ nhật", async () => {
    const d = deps(); // thứ Tư
    const first = await startFormation(d, "a", "dai-tran");
    const sat = await startFormation(at(d, T0 + 3 * DAY), "a", "dai-tran"); // thứ Bảy cùng tuần
    assert.ok(first.ok && sat.ok && sat.resumed);
    const period = periodKey("dai-tran", d.now)!;
    assert.deepEqual(await claimFormation(at(d, T0 + 4 * DAY), "a", "dai-tran", period), { ok: false, error: "notClaimable" }); // chủ nhật
    const nextWeek = await startFormation(at(d, T0 + 5 * DAY), "a", "dai-tran"); // thứ Hai tuần sau: ván mới
    assert.ok(nextWeek.ok && !nextWeek.resumed);
  });
});

