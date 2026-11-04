// LT-06: chế độ Hạng tuần thuần (đề cử xoay vòng, cấp nền, điểm, cửa hàng, túi tự chọn) và gợi ý nhắm tướng, dấu
// “còn công thức chưa tìm” của chế độ Thường. Design Freeze mục 3.2 (P-8, P-9, P-11…P-19), A-23.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PACK_1,
  TTK_BASE_BUNDLES,
  TTK_BUNDLE_UNITS,
  TTK_FEATURED_PER_WEEK,
  TTK_HERO_POINTS,
  TTK_SHOP_PRICE,
  buildCatalog,
  buyBundle,
  combineInRanked,
  combineNormal,
  enterRankedWeek,
  featuredFor,
  grantBundles,
  hintFor,
  hintTarget,
  initialDiscovery,
  newTtkAccount,
  openIngredients,
  parseTtkAccount,
  pointsOfSeasonScore,
  rankedSeasonScore,
  rotationOrder,
  weekIndex,
  type TtkAccount,
} from "../../../src/core/tam-tuong-ky";

const catalog = buildCatalog(PACK_1);
const WEEK = "2026-11-02";
let n = 0;
const rid = () => `req-${String(++n).padStart(6, "0")}`;
const tier = (id: string) => PACK_1.nodes.find((x) => x.id === id)!.tier!;

/** Đường ghép rẻ nhất tới một tướng (các công thức theo thứ tự). */
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

function craft(account: TtkAccount, heroId: string, week = WEEK): TtkAccount {
  let a = account;
  for (const [x, y] of planFor(heroId)) {
    const r = combineInRanked(catalog, a, rid(), x, y, week);
    assert.ok(r.ok && r.response.kind === "rankedCombine" && r.response.status === "created", `${x}+${y}`);
    a = r.account;
  }
  return a;
}

describe("đề cử tuần", () => {
  it("khóa tuần ra số thứ tự tuần", () => {
    assert.equal(weekIndex("2026-01-05"), 0);
    assert.equal(weekIndex("2026-01-12"), 1);
    assert.equal(weekIndex(WEEK), 43);
  });

  it("thứ tự xoay vòng có đủ 12 tướng, không trùng", () => {
    const order = rotationOrder(PACK_1);
    assert.equal(order.length, 12);
    assert.equal(new Set(order).size, 12);
  });

  it("mỗi tuần 7 tướng khác nhau, có ít nhất một tướng đặc biệt; giống nhau cho mọi lần gọi", () => {
    for (let w = 0; w < 24; w++) {
      const week = new Date(Date.UTC(2026, 0, 5 + 7 * w)).toISOString().slice(0, 10);
      const list = featuredFor(PACK_1, week);
      assert.equal(list.length, TTK_FEATURED_PER_WEEK);
      assert.equal(new Set(list).size, TTK_FEATURED_PER_WEEK);
      assert.ok(list.some((id) => tier(id) === "dacBiet"), week);
      assert.deepEqual(featuredFor(PACK_1, week), list);
    }
  });

  it("sau 12 tuần mỗi tướng được đề cử đúng 7 lần", () => {
    const count = new Map<string, number>();
    for (let w = 0; w < 12; w++) {
      const week = new Date(Date.UTC(2026, 0, 5 + 7 * w)).toISOString().slice(0, 10);
      for (const id of featuredFor(PACK_1, week)) count.set(id, (count.get(id) ?? 0) + 1);
    }
    assert.deepEqual([...new Set(count.values())], [7]);
  });
});

describe("tuần Hạng", () => {
  it("vào tuần lần đầu: cấp nền 3 bó (21 đơn vị); vào lại trong tuần không cộng thêm", () => {
    const a = enterRankedWeek(newTtkAccount(catalog), WEEK);
    assert.equal(a.units, TTK_BASE_BUNDLES * TTK_BUNDLE_UNITS);
    assert.equal(enterRankedWeek(a, WEEK), a);
  });

  it("sang tuần mới: bỏ kho tuần, giữ nguyên tố dư trong túi, điểm về 0", () => {
    const a = craft(enterRankedWeek(newTtkAccount(catalog), WEEK), "hero.vuPhong");
    assert.ok(a.ranked!.points > 0 || !featuredFor(PACK_1, WEEK).includes("hero.vuPhong"));
    const next = enterRankedWeek({ ...a, ranked: { ...a.ranked!, stock: { "mat.cloud": 2 } } }, "2026-11-09");
    assert.deepEqual(next.ranked, { week: "2026-11-09", stock: {}, heroesCreated: [], unitsSpent: 0, points: 0, shopBought: 0 });
    assert.equal(next.units, a.units + 21);
  });

  it("ghép ra tướng đề cử: cộng điểm theo bậc một lần; tướng không đề cử: 0 điểm", () => {
    const featured = featuredFor(PACK_1, WEEK);
    const special = featured.find((id) => tier(id) === "dacBiet")!;
    const historic = featured.find((id) => tier(id) === "lichSu")!;
    const outside = PACK_1.nodes.find((x) => x.kind === "character" && !featured.includes(x.id))!.id;
    let a = grantBundles(enterRankedWeek(newTtkAccount(catalog), WEEK), 20);
    a = craft(a, special);
    assert.equal(a.ranked!.points, TTK_HERO_POINTS.dacBiet);
    a = craft(a, historic);
    assert.equal(a.ranked!.points, TTK_HERO_POINTS.dacBiet + TTK_HERO_POINTS.lichSu);
    a = craft(a, special);
    assert.equal(a.ranked!.points, TTK_HERO_POINTS.dacBiet + TTK_HERO_POINTS.lichSu);
    a = craft(a, outside);
    assert.equal(a.ranked!.points, TTK_HERO_POINTS.dacBiet + TTK_HERO_POINTS.lichSu);
    assert.ok(a.discovery.discoveredNodeIds.includes(outside));
  });

  it("ghép sai tiêu nguyên liệu; cùng requestId gửi lại không tiêu lần hai", () => {
    const a = enterRankedWeek(newTtkAccount(catalog), WEEK);
    const id = rid();
    const r = combineInRanked(catalog, a, id, "elt.loi", "elt.loi", WEEK);
    assert.ok(r.ok && r.response.kind === "rankedCombine" && r.response.status === "noRecipe");
    assert.equal(r.account.units, a.units - 2);
    const again = combineInRanked(catalog, r.account, id, "elt.loi", "elt.loi", WEEK);
    assert.ok(again.ok && again.replayed);
    assert.equal(again.account.units, r.account.units);
  });

  it("vào thẳng bằng thao tác ghép cũng nhận cấp nền", () => {
    const r = combineInRanked(catalog, newTtkAccount(catalog), rid(), "elt.thuy", "elt.phong", WEEK);
    assert.ok(r.ok);
    assert.equal(r.account.units, 21 - 2);
  });

  it("điểm bảng mùa: điểm tướng trước, bằng điểm thì ít nguyên tố tiêu hơn xếp trên", () => {
    const base = { week: WEEK, stock: {}, heroesCreated: [], shopBought: 0 };
    const a = rankedSeasonScore({ ...base, points: 300, unitsSpent: 40 });
    const b = rankedSeasonScore({ ...base, points: 300, unitsSpent: 13 });
    const c = rankedSeasonScore({ ...base, points: 500, unitsSpent: 900 });
    assert.ok(c > b && b > a);
    assert.equal(pointsOfSeasonScore(b), 300);
  });
});

describe("cửa hàng và túi", () => {
  it("mua bó: 300 vàng, +7 đơn vị, tối đa 2 bó mỗi tuần; thiếu vàng thì noGold", () => {
    let a = enterRankedWeek(newTtkAccount(catalog), WEEK);
    for (let i = 0; i < 2; i++) {
      const r = buyBundle(a, rid(), 1000, WEEK);
      assert.ok(r.ok);
      assert.equal(r.goldSpent, TTK_SHOP_PRICE);
      assert.equal(r.account.units, a.units + 7);
      a = r.account;
    }
    assert.deepEqual(buyBundle(a, rid(), 1000, WEEK), { ok: false, error: "shopLimit" });
    assert.deepEqual(buyBundle(enterRankedWeek(newTtkAccount(catalog), WEEK), rid(), 299, WEEK), { ok: false, error: "noGold" });
  });

  it("mua lại bằng cùng requestId không trừ vàng lần hai", () => {
    const a = enterRankedWeek(newTtkAccount(catalog), WEEK);
    const id = rid();
    const first = buyBundle(a, id, 1000, WEEK);
    assert.ok(first.ok);
    const again = buyBundle(first.account, id, 700, WEEK);
    assert.ok(again.ok && again.replayed && again.goldSpent === 0);
  });

  it("túi và tuần Hạng lưu/đọc lại được; dữ liệu tuần hỏng thì bỏ", () => {
    const a = buyBundle(enterRankedWeek(newTtkAccount(catalog), WEEK), rid(), 1000, WEEK);
    assert.ok(a.ok);
    assert.deepEqual(parseTtkAccount(JSON.parse(JSON.stringify(a.account))), a.account);
    const broken = parseTtkAccount({ ...a.account, ranked: { week: "tuần trước" }, units: -5 });
    assert.equal(broken?.ranked, null);
    assert.equal(broken?.units, 0);
  });
});

describe("gợi ý nhắm tướng và dấu còn công thức (chế độ Thường)", () => {
  it("gợi ý chỉ tới công thức ghép được ngay trên đường tới một tướng chưa tìm", () => {
    let s = initialDiscovery(catalog);
    for (let i = 0; i < 40; i++) {
      const target = hintTarget(catalog, s);
      if (!target) break;
      assert.ok(s.discoveredNodeIds.includes(target.first) && s.discoveredNodeIds.includes(target.second));
      s = combineNormal(catalog, s, target.first, target.second).next;
    }
    assert.ok(s.discoveredNodeIds.some((id) => id.startsWith("hero.")), "40 lần ghép theo gợi ý phải ra ít nhất một tướng");
  });

  it("gợi ý mức 2 là một nguyên liệu của công thức nhắm tới, không lộ cả hai", () => {
    const s = initialDiscovery(catalog);
    const target = hintTarget(catalog, s)!;
    const h = hintFor(catalog, s, 2);
    assert.ok(h && h.level === 2 && [target.first, target.second].includes(h.ingredientId));
    assert.deepEqual(Object.keys(h).sort(), ["hintGroup", "ingredientId", "level"]);
  });

  it("dấu: yếu tố còn là nguyên liệu của công thức chưa tìm; ghép hết thì không còn dấu", () => {
    const s = initialDiscovery(catalog);
    const open = openIngredients(catalog, s);
    assert.ok(open.has("elt.loi"));
    let all = s;
    for (let more = true; more; ) {
      more = false;
      const t = hintTarget(catalog, all);
      if (t) {
        all = combineNormal(catalog, all, t.first, t.second).next;
        more = true;
      }
    }
    assert.equal(openIngredients(catalog, all).size, 0);
  });
});
