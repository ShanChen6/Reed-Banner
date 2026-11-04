// LT-06: server chế độ Hạng tuần Tầm Tướng Ký và bó nguyên tố trong thưởng hạng các chế độ theo tuần.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { newProfile, seasonKey } from "../../src/core";
import { PACK_1, TTK_HERO_POINTS, buildCatalog, featuredFor, newTtkAccount } from "../../src/core/tam-tuong-ky";
import { MemoryProfileStore, loadProfile, type ProfileStore } from "../../src/server/profiles";
import { MemoryRankRewardStore, bundlesFor, claimRankReward, pendingRankRewards, seasonSource, withTtkBundles } from "../../src/server/rankRewards";
import { MemorySeasonStore } from "../../src/server/seasons";
import { buyTamTuongKyBundle, combineTamTuongKyRanked, getTamTuongKyRanked, type TamTuongKyDeps } from "../../src/server/tamTuongKy";

const T0 = Date.parse("2026-11-04T05:00:00Z");
const OWNER = "acc-1";
const catalog = buildCatalog(PACK_1);
let n = 0;
const rid = () => `req-${String(++n).padStart(6, "0")}`;

function deps(over: Partial<TamTuongKyDeps> = {}): TamTuongKyDeps {
  return { profiles: new MemoryProfileStore(), now: T0, enabled: true, rankedEnabled: true, seasons: new MemorySeasonStore(), isSignedIn: async (id) => id.startsWith("acc"), ...over };
}

function planFor(heroId: string): [string, string][] {
  const byResult = new Map(PACK_1.recipes.map((r) => [r.result, r]));
  const out: [string, string][] = [];
  const visit = (id: string) => {
    const r = byResult.get(id);
    if (!r) return;
    visit(r.first);
    visit(r.second);
    out.push([r.first, r.second]);
  };
  visit(heroId);
  return out;
}

describe("server chế độ Hạng", () => {
  it("cờ Hạng tắt: featureDisabled; khách: loginRequired", async () => {
    const off = await getTamTuongKyRanked(deps({ rankedEnabled: false }), OWNER);
    assert.deepEqual([off.ok, !off.ok && off.error], [false, "featureDisabled"]);
    const guest = await getTamTuongKyRanked(deps(), "guest-1");
    assert.deepEqual([guest.ok, !guest.ok && guest.error], [false, "loginRequired"]);
  });

  it("vào tuần: 21 đơn vị cấp nền, 7 ô đề cử chỉ có lời dẫn và điểm, không lộ tên", async () => {
    const r = await getTamTuongKyRanked(deps(), OWNER);
    assert.ok(r.ok);
    assert.equal(r.view.week, seasonKey(T0));
    assert.equal(r.view.units, 21);
    assert.equal(r.view.featured.length, 7);
    const json = JSON.stringify(r.view.featured);
    for (const h of PACK_1.nodes.filter((x) => x.kind === "character")) {
      assert.doesNotMatch(json, new RegExp(h.nameVi), h.id);
      assert.doesNotMatch(json, new RegExp(`"${h.characterId}"`), h.id);
    }
    for (const f of r.view.featured) assert.ok(f.clue.length > 0 && f.found === null && [200, 300].includes(f.points));
  });

  it("vào lại trong tuần không cộng cấp nền lần hai", async () => {
    const d = deps();
    await getTamTuongKyRanked(d, OWNER);
    const r = await getTamTuongKyRanked(d, OWNER);
    assert.ok(r.ok);
    assert.equal(r.view.units, 21);
  });

  it("ghép ra tướng đề cử: cộng điểm, ghi bảng tuần, ô hiện tên sau khi ghép", async () => {
    const d = deps();
    const hero = featuredFor(PACK_1, seasonKey(T0)).find((id) => catalog.nodes.get(id)!.tier === "dacBiet")!;
    let last;
    for (const [a, b] of planFor(hero)) last = await combineTamTuongKyRanked(d, OWNER, rid(), a, b);
    assert.ok(last && last.ok);
    assert.equal(last.view.points, TTK_HERO_POINTS.dacBiet);
    assert.equal(last.view.units, 21 - 10);
    const slot = last.view.featured.find((f) => f.found);
    assert.equal(slot?.found?.nodeId, hero);
    assert.deepEqual(last.view.board.mine, { rank: 1, points: TTK_HERO_POINTS.dacBiet });
    assert.equal(last.view.board.top[0]?.points, TTK_HERO_POINTS.dacBiet);
  });

  it("hai request cùng requestId song song: chỉ tiêu nguyên liệu một lần", async () => {
    const d = deps();
    await getTamTuongKyRanked(d, OWNER);
    const id = rid();
    await Promise.all([combineTamTuongKyRanked(d, OWNER, id, "elt.loi", "elt.loi"), combineTamTuongKyRanked(d, OWNER, id, "elt.loi", "elt.loi")]);
    const r = await getTamTuongKyRanked(d, OWNER);
    assert.ok(r.ok);
    assert.equal(r.view.units, 19);
  });

  it("mua bó trừ 300 vàng trong cùng lần ghi; không đủ vàng thì noGold, vàng giữ nguyên", async () => {
    const d = deps();
    await d.profiles.put(OWNER, { ...newProfile(), gold: 650 }, 0, T0);
    const one = await buyTamTuongKyBundle(d, OWNER, rid());
    assert.ok(one.ok);
    assert.equal(one.view.gold, 350);
    assert.equal(one.view.units, 21 + 7);
    const two = await buyTamTuongKyBundle(d, OWNER, rid());
    assert.ok(two.ok);
    const three = await buyTamTuongKyBundle(d, OWNER, rid());
    assert.ok(!three.ok && three.error === "shopLimit");
    assert.equal((await loadProfile(d.profiles, OWNER)).profile.gold, 50);
    const poor = deps();
    const r = await buyTamTuongKyBundle(poor, OWNER, rid());
    assert.ok(!r.ok && r.error === "noGold");
  });
});

describe("bó nguyên tố trong thưởng hạng", () => {
  it("chỉ chế độ theo tuần có bó, theo bậc 5/4/3/2/1", () => {
    assert.deepEqual(["top1", "top3", "top10", "half", "win"].map((t) => bundlesFor("survival", t as never)), [5, 4, 3, 2, 1]);
    assert.equal(bundlesFor("daily", "top1"), 0);
    assert.equal(bundlesFor("tamTuongKy", "top1"), 5);
  });

  it("chỉ cộng cho người đã vào Tầm Tướng Ký", () => {
    const p = newProfile();
    assert.equal(withTtkBundles(p, 3), p);
    const q = { ...p, tamTuongKy: newTtkAccount(catalog) };
    assert.equal(withTtkBundles(q, 3).tamTuongKy?.units, 21);
  });

  it("nhận thưởng Trấn Ải tuần trước: vàng + bó khi cờ bật; cờ tắt thì chỉ vàng và không nhắc bó", async () => {
    const seasons = new MemorySeasonStore();
    const lastWeek = seasonKey(T0 - 7 * 24 * 3600_000);
    await seasons.best("survival", lastWeek, OWNER, 12, T0 - 7 * 24 * 3600_000);
    const run = async (ttkBundles: boolean) => {
      const profiles: ProfileStore = new MemoryProfileStore();
      await profiles.put(OWNER, { ...newProfile(), tamTuongKy: newTtkAccount(catalog) }, 0, T0);
      const d = { sources: [seasonSource("survival", seasons)], claims: new MemoryRankRewardStore(), profiles, now: T0, isSignedIn: async () => true, ttkBundles };
      const pending = await pendingRankRewards(d, OWNER);
      const claim = await claimRankReward(d, OWNER, "survival", lastWeek);
      return { pending, claim, profile: (await loadProfile(profiles, OWNER)).profile };
    };
    const on = await run(true);
    assert.equal(on.pending.items[0]?.bundles, 5);
    assert.ok(on.claim.ok && on.claim.bundles === 5);
    assert.equal(on.profile.tamTuongKy?.units, 35);
    const off = await run(false);
    assert.equal(off.pending.items[0]?.bundles, undefined);
    assert.ok(off.claim.ok && off.claim.bundles === undefined);
    assert.equal(off.profile.tamTuongKy?.units, 0);
  });

  it("bảng tuần Tầm Tướng Ký là nguồn thưởng hạng: kỳ tuần trước khép thì có thưởng", async () => {
    const seasons = new MemorySeasonStore();
    const lastWeek = seasonKey(T0 - 7 * 24 * 3600_000);
    await seasons.best("tamTuongKy", lastWeek, OWNER, 300_986, T0 - 7 * 24 * 3600_000);
    const d = { sources: [seasonSource("tamTuongKy", seasons)], claims: new MemoryRankRewardStore(), profiles: new MemoryProfileStore(), now: T0, isSignedIn: async () => true, ttkBundles: true };
    const pending = await pendingRankRewards(d, OWNER);
    assert.deepEqual(pending.items.map((i) => [i.mode, i.period, i.rank, i.gold, i.bundles]), [["tamTuongKy", lastWeek, 1, 500, 5]]);
  });
});

describe("bảng tuần trên trang Xếp hạng", () => {
  it("cờ Hạng tắt hoặc khách: bị chặn", async () => {
    const { tamTuongKyBoard } = await import("../../src/server/tamTuongKy");
    const off = await tamTuongKyBoard(deps({ rankedEnabled: false }), OWNER);
    assert.deepEqual(off, { ok: false, error: "featureDisabled" });
    const guest = await tamTuongKyBoard(deps(), "guest-1");
    assert.deepEqual(guest, { ok: false, error: "loginRequired" });
  });

  it("giải điểm bảng mùa thành điểm và số nguyên tố đã tiêu, xếp đúng thứ tự", async () => {
    const { tamTuongKyBoard } = await import("../../src/server/tamTuongKy");
    const d = deps();
    const week = seasonKey(T0);
    await d.seasons!.best("tamTuongKy", week, "acc-2", 300 * 1000 + (999 - 40), T0);
    await d.seasons!.best("tamTuongKy", week, OWNER, 300 * 1000 + (999 - 13), T0 + 1);
    await d.seasons!.best("tamTuongKy", week, "acc-3", 500 * 1000 + (999 - 90), T0 + 2);
    const r = await tamTuongKyBoard(d, OWNER);
    assert.ok(r.ok);
    assert.equal(r.week, week);
    assert.deepEqual(r.top.map((x) => [x.rank, x.points, x.unitsSpent, x.mine]), [[1, 500, 90, false], [2, 300, 13, true], [3, 300, 40, false]]);
    assert.deepEqual(r.mine, { rank: 2, points: 300, unitsSpent: 13 });
  });
});
