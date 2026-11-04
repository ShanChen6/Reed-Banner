// Mô phỏng LT-05 cho Tầm Tướng Ký: độ khó chế độ Thường (người biết công thức, người mới thử ngẫu nhiên có/không gợi ý)
// và nguyên liệu chế độ Hạng (số bó nguyên tố cần cho danh sách đề cử 5/7/10 tướng). Deterministic theo seed.
// Chạy: pnpm tsx scripts/tam-tuong-ky-sim.ts [--runs 200]
// Ghi: docs/reports/2026-11-04-tam-tuong-ky-lt05/sim.json; tóm tắt ở docs/02-game-modes/future/18-tam-tuong-ky-lt05-pack-1.md.

import { mkdirSync, writeFileSync } from "node:fs";
import { ELEMENTS, type Element } from "../src/core/battle";
import {
  ACTIVE_PACK,
  buildCatalog,
  combineNormal,
  computeMetrics,
  hintFor,
  initialDiscovery,
  type DiscoveryState,
  type NodeId,
  type Recipe,
} from "../src/core/tam-tuong-ky";

const OUT = "docs/reports/2026-11-04-tam-tuong-ky-lt05";
const runsArg = process.argv.indexOf("--runs");
const RUNS = runsArg > 0 ? Number(process.argv[runsArg + 1]) : 200;

const catalog = buildCatalog(ACTIVE_PACK);
const pack = catalog.pack;
const heroes = pack.nodes.filter((n) => n.kind === "character").map((n) => n.id);
const metrics = computeMetrics(pack);

// ——— Cây ghép rẻ nhất (theo số nguyên tố) của mỗi node ———
const bestRecipe = new Map<NodeId, Recipe>();
for (const r of pack.recipes) {
  const cur = bestRecipe.get(r.result);
  const cost = (x: Recipe) => metrics.get(x.first)!.starterCost + metrics.get(x.second)!.starterCost;
  if (!cur || cost(r) < cost(cur)) bestRecipe.set(r.result, r);
}
const elementOf = new Map(pack.nodes.filter((n) => n.kind === "element").map((n) => [n.id, n.element!]));

/** Số đơn vị mỗi hệ tiêu khi ghép node ở chế độ Hạng (nguyên liệu trung gian bị tiêu nên cây có lặp). */
const needMemo = new Map<NodeId, Record<Element, number>>();
function elementNeed(id: NodeId): Record<Element, number> {
  const e = elementOf.get(id);
  if (e) return Object.fromEntries(ELEMENTS.map((x) => [x, x === e ? 1 : 0])) as Record<Element, number>;
  const hit = needMemo.get(id);
  if (hit) return hit;
  const r = bestRecipe.get(id)!;
  const a = elementNeed(r.first);
  const b = elementNeed(r.second);
  const out = Object.fromEntries(ELEMENTS.map((x) => [x, a[x] + b[x]])) as Record<Element, number>;
  needMemo.set(id, out);
  return out;
}

/** Số công thức khác nhau cần ghép để mở node ở chế độ Thường (không tiêu nguyên liệu nên mỗi node một lần). */
function distinctCombines(id: NodeId, seen = new Set<NodeId>()): Set<NodeId> {
  if (elementOf.has(id) || seen.has(id)) return seen;
  seen.add(id);
  const r = bestRecipe.get(id)!;
  distinctCombines(r.first, seen);
  distinctCombines(r.second, seen);
  return seen;
}

// ——— RNG deterministic ———
function lcg(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface Run {
  readonly firstHero: number;
  readonly sixHeroes: number;
  readonly allHeroes: number;
  readonly hintsUsed: number;
}

/**
 * Người mới: thử cặp có thứ tự chưa thử trong số yếu tố đã có (không lặp cặp đã thử). Có gợi ý thì mỗi “ngày”
 * (`combinesPerDay` lần ghép) dùng 2 gợi ý mức 2 rồi thử trước các cặp có nguyên liệu được gợi ý.
 */
/**
 * Phương án gợi ý nhắm tướng (chưa có trong game): lộ một nguyên liệu của công thức ghép được ngay nằm trên cây của
 * tướng chưa tìm rẻ nhất. Dùng để so với gợi ý hiện tại (công thức nông nhất trong cả sổ).
 */
function targetedIngredient(s: DiscoveryState): NodeId | null {
  const known = new Set(s.discoveredNodeIds);
  for (const h of heroes.filter((x) => !known.has(x)).sort((a, b) => metrics.get(a)!.minCombines - metrics.get(b)!.minCombines)) {
    const tree = [...distinctCombines(h)].map((id) => bestRecipe.get(id)!);
    const next = tree.find((r) => !known.has(r.result) && known.has(r.first) && known.has(r.second));
    if (next) return catalog.nodes.get(next.second)?.kind === "element" ? next.first : next.second;
  }
  return null;
}

function novice(seed: number, withHints: boolean, combinesPerDay: number, badges = false, targeted = false, cap = 60000): Run {
  const rand = lcg(seed);
  let s: DiscoveryState = initialDiscovery(catalog);
  const tried = new Set<string>();
  let combines = 0;
  let hintsUsed = 0;
  let focus: NodeId[] = [];
  let firstHero = -1;
  let six = -1;
  const found = () => heroes.filter((h) => s.discoveredNodeIds.includes(h)).length;
  while (found() < heroes.length && combines < cap) {
    if (withHints && combines % combinesPerDay === 0) {
      focus = [];
      for (let k = 0; k < 2; k++) {
        const h = hintFor(catalog, s, 2);
        const id = targeted ? targetedIngredient(s) : h && h.level === 2 ? h.ingredientId : null;
        if (id) {
          focus.push(id);
          hintsUsed++;
        }
      }
    }
    // Dấu “còn công thức chưa tìm”: chỉ thử yếu tố còn là nguyên liệu của công thức chưa tìm (không nói cặp nào).
    const open = badges
      ? new Set(pack.recipes.filter((r) => !s.discoveredRecipeIds.includes(r.id)).flatMap((r) => [r.first, r.second]))
      : null;
    const usable = s.discoveredNodeIds.filter((id) => catalog.nodes.get(id)?.kind !== "character" && (!open || open.has(id)));
    const untried = (a: NodeId, b: NodeId) => !tried.has(`${a}>${b}`);
    let pair: [NodeId, NodeId] | null = null;
    for (const f of focus) {
      const options = usable.flatMap((x) => [[f, x], [x, f]] as [NodeId, NodeId][]).filter(([a, b]) => untried(a, b));
      if (options.length) {
        pair = options[Math.floor(rand() * options.length)]!;
        break;
      }
    }
    if (!pair) {
      for (let tries = 0; tries < 200 && !pair; tries++) {
        const a = usable[Math.floor(rand() * usable.length)]!;
        const b = usable[Math.floor(rand() * usable.length)]!;
        if (untried(a, b)) pair = [a, b];
      }
      if (!pair) {
        const all = usable.flatMap((a) => usable.map((b) => [a, b] as [NodeId, NodeId])).filter(([a, b]) => untried(a, b));
        if (!all.length) break;
        pair = all[Math.floor(rand() * all.length)]!;
      }
    }
    tried.add(`${pair[0]}>${pair[1]}`);
    const out = combineNormal(catalog, s, pair[0], pair[1]);
    s = out.next;
    combines++;
    const n = found();
    if (n >= 1 && firstHero < 0) firstHero = combines;
    if (n >= 6 && six < 0) six = combines;
  }
  return { firstHero, sixHeroes: six, allHeroes: combines, hintsUsed };
}

const quantile = (xs: number[], q: number) => {
  const a = [...xs].sort((x, y) => x - y);
  return a[Math.min(a.length - 1, Math.floor(q * a.length))]!;
};
const summary = (xs: number[]) => ({ p25: quantile(xs, 0.25), median: quantile(xs, 0.5), p75: quantile(xs, 0.75) });

/** Phiếu mỗi tuần theo P-10: nhiệm vụ ngày 7 × 1 + “Thắng 15 trận” 2 + điểm danh ngày 7: 1. */
const TICKETS_PER_WEEK = 7 + 2 + 1;

function normalMode() {
  const optimalAll = pack.recipes.length; // mỗi node một công thức cần ghép
  const perHero = Object.fromEntries(heroes.map((h) => [h, distinctCombines(h).size]));
  const out: Record<string, unknown> = { optimal: { allHeroes: new Set(heroes.flatMap((h) => [...distinctCombines(h)])).size, perHero, recipesInPack: optimalAll } };
  for (const perTicket of [15, 20]) {
    const perDay = Math.round((TICKETS_PER_WEEK / 7) * perTicket);
    for (const [withHints, badges, targeted] of [[false, false, false], [true, false, false], [true, true, false], [true, true, true]] as const) {
      const runs = Array.from({ length: RUNS }, (_, i) => novice(1000 + i, withHints, perDay, badges, targeted));
      const days = (k: keyof Run) => summary(runs.map((r) => Math.ceil(Number(r[k]) / perDay)));
      out[`novice_${withHints ? "hints" : "noHints"}${badges ? "_badges" : ""}${targeted ? "_targeted" : ""}_${perTicket}`] = {
        combinesPerDay: perDay,
        combines: { firstHero: summary(runs.map((r) => r.firstHero)), sixHeroes: summary(runs.map((r) => r.sixHeroes)), allHeroes: summary(runs.map((r) => r.allHeroes)) },
        days: { firstHero: days("firstHero"), sixHeroes: days("sixHeroes"), allHeroes: days("allHeroes") },
        hintsUsed: summary(runs.map((r) => r.hintsUsed)),
      };
    }
  }
  return out;
}

// ——— Chế độ Hạng ———
/** Xoay vòng: thứ tự đề cử cố định, mỗi tuần lấy N tướng kế tiếp; đặc biệt rải đều trong vòng. */
function rotation(n: number, weeks: number): NodeId[][] {
  const specials = heroes.filter((h) => catalog.nodes.get(h)?.tier === "dacBiet");
  const historic = heroes.filter((h) => !specials.includes(h));
  const order: NodeId[] = [];
  const gap = Math.ceil(historic.length / specials.length);
  historic.forEach((h, i) => {
    if (i % gap === 0 && specials[i / gap]) order.push(specials[i / gap]!);
    order.push(h);
  });
  return Array.from({ length: weeks }, (_, w) => Array.from({ length: n }, (_, i) => order[(w * n + i) % order.length]!));
}

const bundlesFor = (list: readonly NodeId[]) => Math.max(...ELEMENTS.map((e) => list.reduce((sum, h) => sum + elementNeed(h)[e], 0)));

/** Số tướng ghép được với `bundles` bó (mỗi bó 1 đơn vị mỗi hệ), chọn tướng rẻ trước; giả sử đã biết công thức. */
function completable(list: readonly NodeId[], bundles: number): number {
  const stock = Object.fromEntries(ELEMENTS.map((e) => [e, bundles])) as Record<Element, number>;
  let n = 0;
  for (const h of [...list].sort((a, b) => metrics.get(a)!.starterCost - metrics.get(b)!.starterCost)) {
    const need = elementNeed(h);
    if (ELEMENTS.every((e) => stock[e] >= need[e])) {
      for (const e of ELEMENTS) stock[e] -= need[e];
      n++;
    }
  }
  return n;
}

/** Nguồn bó mỗi tuần (P-11, P-12, P-13): cấp nền 3; nửa trên ở hai chế độ tuần 2+2; top 10 ở hai chế độ 3+3; mua tối đa 2. */
const SUPPLY = {
  "cấp nền": 3,
  "cấp nền + nửa trên 2 chế độ": 3 + 2 + 2,
  "cấp nền + nửa trên 2 chế độ + mua 2": 3 + 2 + 2 + 2,
  "cấp nền + top 10 hai chế độ + mua 2": 3 + 3 + 3 + 2,
};

/** Phương án bó tự chọn (7 đơn vị, người chơi chọn hệ): số tướng ghép được, chọn tướng rẻ trước. */
function completableFlexible(list: readonly NodeId[], bundles: number): number {
  let units = bundles * ELEMENTS.length;
  let n = 0;
  for (const h of [...list].sort((a, b) => metrics.get(a)!.starterCost - metrics.get(b)!.starterCost)) {
    const cost = metrics.get(h)!.starterCost;
    if (units >= cost) {
      units -= cost;
      n++;
    }
  }
  return n;
}

function rankedMode() {
  const perHero = Object.fromEntries(heroes.map((h) => [h, { combines: metrics.get(h)!.minCombines, units: metrics.get(h)!.starterCost, byElement: elementNeed(h) }]));
  const out: Record<string, unknown> = { perHero };
  for (const n of [5, 7, 10]) {
    const weeks = rotation(n, 12);
    const need = weeks.map(bundlesFor);
    const done = Object.fromEntries(
      Object.entries(SUPPLY).map(([label, b]) => [label, summary(weeks.map((w) => completable(w, b)))]),
    );
    const flexible = Object.fromEntries(
      Object.entries(SUPPLY).map(([label, b]) => [label, summary(weeks.map((w) => completableFlexible(w, b)))]),
    );
    const flexNeed = weeks.map((w) => Math.ceil(w.reduce((sum, h) => sum + metrics.get(h)!.starterCost, 0) / ELEMENTS.length));
    out[`featured_${n}`] = { bundlesToFinish: summary(need), completedBySupply: done, flexibleBundlesToFinish: summary(flexNeed), completedBySupplyFlexible: flexible, combinesToFinish: summary(weeks.map((w) => w.reduce((s, h) => s + metrics.get(h)!.minCombines, 0))) };
  }
  return out;
}

const result = { pack: pack.id, contentVersion: pack.contentVersion, runs: RUNS, ticketsPerWeek: TICKETS_PER_WEEK, normal: normalMode(), ranked: rankedMode() };
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/sim.json`, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
