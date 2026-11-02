// Cân bằng nhân vật đặc biệt (Đinh Ngọc, Vũ Phong): đấu 56 dựng Đinh Bộ Lĩnh (8 nghề × 7 hệ) như profession-balance.ts.
// Mốc so sánh: win-rate của chính 56 dựng đó trong vòng tròn (trung bình luôn ≈ 50%); nhân vật đặc biệt nên nằm trong dải
// của chúng, không nên là ngoại lệ trên cùng. Chạy từng phần song song bằng --shard k/n rồi gộp bằng --merge.
//   node --import tsx scripts/special-balance.ts --who vuPhong --level 30 --mode 1v1 --seeds 2 --shard 0/4 > out.0.json
//   node --import tsx scripts/special-balance.ts --merge out.0.json out.1.json ...
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import {
  ALL_PROFESSIONS, ELEMENTS, STARTER_COMPANIONS, autoProgress, buildCompanion, buildMain, leveledFoe, runBattle, specialById,
  type Element, type FighterConfig, type Profession, type SideIndex,
} from "../src/core";

const { values, positionals } = parseArgs({
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: {
    who: { type: "string", default: "vuPhong" }, level: { type: "string", default: "30" }, mode: { type: "string", default: "1v1" },
    seeds: { type: "string", default: "2" }, shard: { type: "string", default: "0/1" }, merge: { type: "boolean", default: false },
    ref: { type: "boolean", default: false }, refstep: { type: "string", default: "1" },
  },
  allowPositionals: true,
});

interface Tally { w: number; n: number; uses: Record<string, number>; turns: number }
const wilson = (w: number, n: number): [number, number] => {
  if (!n) return [0, 0];
  const z = 1.96, p = w / n, d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n);
  return [(c - m) / d, (c + m) / d];
};
const pct = (x: number) => (100 * x).toFixed(1) + "%";

if (values.merge) {
  const t: Tally = { w: 0, n: 0, uses: {}, turns: 0 };
  for (const f of positionals) {
    const j = JSON.parse(readFileSync(f, "utf8")) as Tally;
    t.w += j.w; t.n += j.n; t.turns += j.turns;
    for (const [k, v] of Object.entries(j.uses)) t.uses[k] = (t.uses[k] ?? 0) + v;
  }
  const [lo, hi] = wilson(t.w, t.n);
  console.log(`thắng ${pct(t.w / t.n)} [${pct(lo)}–${pct(hi)}] n=${t.n} lượt TB ${(t.turns / t.n).toFixed(0)}`);
  console.log("chiêu:", Object.entries(t.uses).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(" "));
  process.exit(0);
}

const level = Number(values.level);
const mode = values.mode as "1v1" | "3v3";
const seeds = Number(values.seeds);
const [shard, shards] = values.shard.split("/").map(Number) as [number, number];
const progress = autoProgress(level, null);
const mates = ["haVan", "maiThanh"].map((id) => leveledFoe(STARTER_COMPANIONS.find((c) => c.id === id)!, level));
interface Build { readonly profession: Profession; readonly element: Element; readonly unit: FighterConfig }
const builds: Build[] = ALL_PROFESSIONS.flatMap((profession) => ELEMENTS.map((element) => ({ profession, element, unit: buildMain(progress, element, profession) })));
const team = (u: FighterConfig) => ({ fighters: mode === "1v1" ? [u] : [u, ...mates], leader: 0 });
const tally: Tally = { w: 0, n: 0, uses: {}, turns: 0 };

if (values.ref) {
  // Mốc: win-rate từng dựng ĐBL đấu 55 dựng còn lại; in phân bố.
  const step = Number(values.refstep);
  const rates = builds.filter((_, i) => i % step === 0).map((a) => {
    const i = builds.indexOf(a);
    let w = 0, n = 0;
    builds.forEach((b, j) => {
      if (i === j || (j + i) % shards !== shard) return;
      for (let s = 0; s < seeds; s++) for (const first of [0, 1] as SideIndex[]) {
        const r = runBattle({ sides: [team(a.unit), team(b.unit)], seed: (1 + s * 7919 + i * 31 + j) >>> 0, firstSide: first });
        n++; w += r.winner === null ? 0.5 : r.winner === 0 ? 1 : 0;
      }
    });
    return { id: `${a.profession}/${a.element}`, w, n };
  });
  console.log(JSON.stringify(rates));
  process.exit(0);
}

const me = values.who === "dinhNgoc" || values.who === "vuPhong" ? buildCompanion(specialById(values.who)!, progress) : null;
if (!me) throw new Error("--who dinhNgoc|vuPhong");
builds.forEach((b, j) => {
  if (j % shards !== shard) return;
  for (let s = 0; s < seeds; s++) for (const first of [0, 1] as SideIndex[]) {
    const r = runBattle({ sides: [team(me), team(b.unit)], seed: (1 + s * 7919 + j) >>> 0, firstSide: first });
    tally.n++; tally.turns += r.turns;
    if (r.winner === 0) tally.w++; else if (r.winner === null) tally.w += 0.5;
    for (const [k, v] of Object.entries(r.skillUses)) if (k.startsWith(values.who === "vuPhong" ? "vp_" : "dn_")) tally.uses[k] = (tally.uses[k] ?? 0) + v;
  }
});
console.log(JSON.stringify(tally));
