// LT-04: tài khoản Tầm Tướng Ký thuần (phiếu, lượt, gợi ý theo ngày, chống gửi trùng) và phần nối vào hồ sơ
// (phiếu từ nhiệm vụ, thành tựu bộ). Design Freeze mục 7.3, 7.5.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DAILY_QUESTS,
  NEW_QUESTS,
  applyProfileAction,
  newProfile,
  parseProfile,
  rollQuests,
  vnDay,
  type Profile,
} from "../../../src/core";
import { achievementProgress, ttkAchievements } from "../../../src/core/progress/achievements";
import {
  SLICE_PACK,
  TTK_COMBINES_PER_SESSION,
  TTK_MAX_TICKETS,
  TTK_SESSION_MS,
  TTK_START_TICKETS,
  buildCatalog,
  combineInSession,
  grantTickets,
  hintsLeft,
  makeableRecipes,
  newTtkAccount,
  normalizeTtkAccount,
  openSession,
  parseTtkAccount,
  spendHint,
  validatePack,
  CORE_CATALOG_DEPS,
  type TtkAccount,
} from "../../../src/core/tam-tuong-ky";

const catalog = buildCatalog(SLICE_PACK);
const T0 = Date.parse("2026-11-04T05:00:00Z");
const DAY = 24 * 3600_000;
let n = 0;
const rid = () => `req-${String(++n).padStart(6, "0")}`;

const open = (a: TtkAccount = newTtkAccount(catalog), now = T0) => {
  const r = openSession(a, rid(), now);
  assert.ok(r.ok);
  return r.account;
};

/** Ghép mọi công thức ghép được trong các lượt liên tiếp (tự mở lượt khi hết, cộng phiếu nếu cần). */
function discoverAll(start: TtkAccount): TtkAccount {
  let a = start;
  for (let more = true; more; ) {
    more = false;
    for (const r of makeableRecipes(catalog, a.discovery)) {
      if (!a.session || a.session.combinesLeft === 0) a = open(grantTickets(a, 1));
      const out = combineInSession(catalog, a, rid(), r.first, r.second, T0);
      assert.ok(out.ok);
      a = out.account;
      more = true;
    }
  }
  return a;
}

describe("phiếu và lượt", () => {
  it("tài khoản mới có 3 phiếu, chưa có lượt", () => {
    const a = newTtkAccount(catalog);
    assert.equal(a.tickets, TTK_START_TICKETS);
    assert.equal(a.session, null);
  });

  it("mở lượt trừ 1 phiếu, lượt có 15 lần ghép", () => {
    const a = open();
    assert.equal(a.tickets, TTK_START_TICKETS - 1);
    assert.equal(a.session?.combinesLeft, TTK_COMBINES_PER_SESSION);
  });

  it("đang có lượt dở thì mở lượt trả lượt cũ, không trừ phiếu", () => {
    const a = open();
    const r = openSession(a, rid(), T0 + 1000);
    assert.ok(r.ok && r.response.kind === "session" && !r.response.charged);
    assert.equal(r.account.tickets, a.tickets);
    assert.equal(r.account.session?.id, a.session?.id);
  });

  it("hết phiếu, không có lượt: noTicket, không đổi gì", () => {
    const empty = { ...newTtkAccount(catalog), tickets: 0 };
    assert.deepEqual(openSession(empty, rid(), T0), { ok: false, error: "noTicket" });
  });

  it("lượt hết hạn sau 24 giờ: ghép báo noSession, mở lượt mới thì trừ phiếu", () => {
    const a = open();
    assert.deepEqual(combineInSession(catalog, a, rid(), "elt.moc", "elt.moc", T0 + TTK_SESSION_MS), { ok: false, error: "noSession" });
    const r = openSession(a, rid(), T0 + TTK_SESSION_MS);
    assert.ok(r.ok && r.response.kind === "session" && r.response.charged);
  });

  it("chỉ created và noRecipe trừ lần ghép; alreadyKnown và invalid không trừ", () => {
    let a = open();
    const step = (x: string, y: string) => {
      const r = combineInSession(catalog, a, rid(), x, y, T0);
      assert.ok(r.ok);
      a = r.account;
      return a.session!.combinesLeft;
    };
    assert.equal(step("elt.moc", "elt.moc"), 14); // created
    assert.equal(step("elt.loi", "elt.loi"), 13); // noRecipe
    assert.equal(step("elt.moc", "elt.moc"), 13); // alreadyKnown
    assert.equal(step("elt.kim", "elt.xyz"), 13); // invalid
  });

  it("hết lần ghép thì không ghép được nữa", () => {
    let a = open();
    for (let i = 0; i < TTK_COMBINES_PER_SESSION; i++) {
      const r = combineInSession(catalog, a, rid(), "elt.loi", "elt.loi", T0);
      assert.ok(r.ok);
      a = r.account;
    }
    assert.deepEqual(combineInSession(catalog, a, rid(), "elt.loi", "elt.loi", T0), { ok: false, error: "noSession" });
  });

  it("cùng requestId gửi lại: cùng phản hồi, không trừ lần hai", () => {
    const a = open();
    const id = rid();
    const first = combineInSession(catalog, a, id, "elt.moc", "elt.moc", T0);
    assert.ok(first.ok);
    const again = combineInSession(catalog, first.account, id, "elt.moc", "elt.moc", T0);
    assert.ok(again.ok && again.replayed);
    assert.deepEqual(again.response, first.response);
    assert.equal(again.account, first.account);
    const reopen = openSession(first.account, a.session!.id, T0);
    assert.ok(reopen.ok && reopen.replayed);
    assert.equal(reopen.account.tickets, first.account.tickets);
  });

  it("requestId hoặc input sai: badRequest", () => {
    const a = open();
    assert.deepEqual(combineInSession(catalog, a, "x", "elt.moc", "elt.moc", T0), { ok: false, error: "badRequest" });
    assert.deepEqual(combineInSession(catalog, a, rid(), 1, "elt.moc", T0), { ok: false, error: "badRequest" });
    assert.deepEqual(spendHint(catalog, a, rid(), 3, "d"), { ok: false, error: "badRequest" });
  });

  it("ghép đủ ba tướng qua nhiều lượt", () => {
    const all = discoverAll(newTtkAccount(catalog));
    for (const h of ["hero.nguyenBac", "hero.leHoan", "hero.dinhNgoc"]) assert.ok(all.discovery.discoveredNodeIds.includes(h));
  });

  it("phiếu cộng thêm không vượt trần 10", () => {
    assert.equal(grantTickets(newTtkAccount(catalog), 100).tickets, TTK_MAX_TICKETS);
  });
});

describe("gợi ý theo ngày", () => {
  const day = vnDay(T0);
  const nextDay = vnDay(T0 + DAY);

  it("2 lượt mỗi ngày; hết thì noHint; sang ngày mới có lại, không cộng dồn", () => {
    let a = open();
    for (const level of [1, 2] as const) {
      const r = spendHint(catalog, a, rid(), level, day);
      assert.ok(r.ok && r.response.kind === "hint" && r.response.hint);
      a = r.account;
    }
    assert.equal(hintsLeft(a, day), 0);
    assert.deepEqual(spendHint(catalog, a, rid(), 1, day), { ok: false, error: "noHint" });
    assert.equal(hintsLeft(a, nextDay), 2);
    assert.equal(hintsLeft(newTtkAccount(catalog), day), 2);
  });

  it("gợi ý không cần lượt đang mở và không tốn phiếu", () => {
    const a = newTtkAccount(catalog);
    const r = spendHint(catalog, a, rid(), 1, day);
    assert.ok(r.ok);
    assert.equal(r.account.tickets, a.tickets);
  });

  it("không còn công thức nào để gợi ý thì không trừ lượt", () => {
    const all = discoverAll(newTtkAccount(catalog));
    const r = spendHint(catalog, all, rid(), 2, day);
    assert.ok(r.ok && r.response.kind === "hint" && r.response.hint === null);
    assert.equal(hintsLeft(r.account, day), 2);
  });
});

describe("lưu và phiên bản", () => {
  it("JSON round-trip giữ nguyên", () => {
    const a = open();
    assert.deepEqual(parseTtkAccount(JSON.parse(JSON.stringify(a))), a);
  });

  it("dữ liệu hỏng thì null; trường lạ bị chặn trong giới hạn", () => {
    assert.equal(parseTtkAccount(null), null);
    assert.equal(parseTtkAccount({ version: 2 }), null);
    const a = parseTtkAccount({ ...newTtkAccount(catalog), tickets: 999, hints: { day: 5, used: 9 }, session: { id: 1 } });
    assert.ok(a);
    assert.equal(a.tickets, 0);
    assert.deepEqual(a.hints, { day: "", used: 0 });
    assert.equal(a.session, null);
  });

  it("ID không còn trong catalog bị bỏ, starter luôn có, tướng đã mở giữ nguyên", () => {
    const base = newTtkAccount(catalog);
    const raw: TtkAccount = {
      ...base,
      discovery: { ...base.discovery, contentVersion: 0, discoveredNodeIds: ["mat.cu", "hero.dinhNgoc", "hero.dinhNgoc"], discoveredRecipeIds: ["r.cu", "r.dinhNgoc"] },
    };
    const norm = normalizeTtkAccount(parseTtkAccount(raw)!, catalog);
    assert.deepEqual(norm.discovery.discoveredNodeIds, [...catalog.starters, "hero.dinhNgoc"]);
    assert.deepEqual(norm.discovery.discoveredRecipeIds, ["r.dinhNgoc"]);
    assert.equal(norm.discovery.contentVersion, SLICE_PACK.contentVersion);
  });

  it("hồ sơ lưu rồi đọc lại giữ tamTuongKy; hồ sơ cũ không có trường này vẫn đọc được", () => {
    const p: Profile = { ...newProfile(), tamTuongKy: open() };
    assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(p))).tamTuongKy, p.tamTuongKy);
    assert.equal(parseProfile(JSON.parse(JSON.stringify(newProfile()))).tamTuongKy, undefined);
    assert.equal(parseProfile({ ...newProfile(), tamTuongKy: "hỏng" }).tamTuongKy, undefined);
  });
});

describe("phiếu từ nhiệm vụ và điểm danh", () => {
  const withQuests = (claimed: string[], ttk = true): Profile => {
    const q = rollQuests(NEW_QUESTS, T0);
    return {
      ...newProfile(),
      quests: { ...q, dayStats: { play: 99, win: 99, coins: 999, daily: 9 }, weekStats: { win: 99 }, claimed },
      ...(ttk ? { tamTuongKy: newTtkAccount(catalog) } : {}),
    };
  };
  const daily = DAILY_QUESTS.map((d) => d.id);

  it("nhận nốt nhiệm vụ ngày cuối cùng: +1 phiếu; các nhiệm vụ trước đó không cộng", () => {
    const early = applyProfileAction(withQuests([]), { type: "claimQuest", id: daily[0]! }, T0);
    assert.ok(early.ok);
    assert.equal(early.profile.tamTuongKy?.tickets, TTK_START_TICKETS);
    const last = applyProfileAction(withQuests(daily.slice(0, -1)), { type: "claimQuest", id: daily.at(-1)! }, T0);
    assert.ok(last.ok);
    assert.equal(last.profile.tamTuongKy?.tickets, TTK_START_TICKETS + 1);
  });

  it("nhiệm vụ tuần Thắng 15 trận: +2 phiếu", () => {
    const r = applyProfileAction(withQuests([]), { type: "claimQuest", id: "w.win15" }, T0);
    assert.ok(r.ok);
    assert.equal(r.profile.tamTuongKy?.tickets, TTK_START_TICKETS + 2);
  });

  it("điểm danh ngày thứ 7: +1 phiếu; ngày khác không cộng", () => {
    const yesterday = vnDay(T0 - DAY);
    const p = (streak: number): Profile => ({ ...withQuests([]), quests: { ...withQuests([]).quests, checkIn: { last: yesterday, streak } } });
    const seven = applyProfileAction(p(6), { type: "checkIn" }, T0);
    const two = applyProfileAction(p(1), { type: "checkIn" }, T0);
    assert.ok(seven.ok && two.ok);
    assert.equal(seven.profile.tamTuongKy?.tickets, TTK_START_TICKETS + 1);
    assert.equal(two.profile.tamTuongKy?.tickets, TTK_START_TICKETS);
  });

  it("chưa vào Tầm Tướng Ký thì không tạo dữ liệu, vàng vẫn cộng như cũ", () => {
    const p = withQuests([], false);
    const r = applyProfileAction(p, { type: "claimQuest", id: "w.win15" }, T0);
    assert.ok(r.ok);
    assert.equal(r.profile.tamTuongKy, undefined);
    assert.equal(r.profile.gold, p.gold + 400);
  });
});

describe("thành tựu bộ", () => {
  it("slice có hai bộ hợp lệ: lịch sử (2 tướng) và cả gói (3 tướng)", () => {
    const defs = ttkAchievements(SLICE_PACK);
    assert.deepEqual(defs.map((d) => [d.id, d.target, d.gold]), [["ttk.slice-1.lichSu", 2, 200], ["ttk.slice-1.all", 3, 1000]]);
  });

  it("mở một tướng lẻ chưa đủ bộ; mở đủ thì done", () => {
    const [lichSu] = ttkAchievements(SLICE_PACK);
    const one: Profile = { ...newProfile(), tamTuongKy: { ...newTtkAccount(catalog), discovery: { ...newTtkAccount(catalog).discovery, discoveredNodeIds: ["hero.leHoan"] } } };
    assert.equal(achievementProgress(one, lichSu!).done, false);
    const all: Profile = { ...newProfile(), tamTuongKy: discoverAll(newTtkAccount(catalog)) };
    assert.equal(achievementProgress(all, lichSu!).done, true);
  });

  it("bộ sai (1 tướng, tướng không có, trùng ID) bị validator chặn", () => {
    const bad = { ...SLICE_PACK, achievementSets: [{ id: "x", title: "x", gold: 1, heroIds: ["hero.leHoan"] }, { id: "x", title: "y", gold: 1, heroIds: ["hero.leHoan", "mat.reed"] }] };
    const codes = validatePack(bad, CORE_CATALOG_DEPS).map((i) => i.code);
    assert.equal(codes.filter((c) => c === "badAchievementSet").length, 2);
  });
});
