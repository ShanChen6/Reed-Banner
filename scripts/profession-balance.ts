// Cân bằng nghề × hệ của Đinh Bộ Lĩnh: vòng tròn 56 dựng (8 nghề × 7 hệ), mỗi cặp đấu cả hai lượt đi trước.
// Chạy: node --import tsx scripts/profession-balance.ts [--level 20] [--mode 1v1|3v3] [--seeds 1] [--json]
// 3v3: mỗi phe là Đinh Bộ Lĩnh + haVan + maiThanh (cùng hai tướng kèm), để chỉ đo khác biệt nghề × hệ của thủ lĩnh.
import { parseArgs } from "node:util";
import {
  ALL_PROFESSIONS, ELEMENTS, STARTER_COMPANIONS, autoProgress, buildMain, leveledFoe, runBattle,
  type Element, type FighterConfig, type Profession, type SideIndex,
} from "../src/core";

const { values } = parseArgs({
  args: process.argv.slice(2).filter((a) => a !== "--"),
  options: { level: { type: "string", default: "20" }, mode: { type: "string", default: "1v1" }, seeds: { type: "string", default: "1" }, json: { type: "boolean", default: false } },
});
const level = Number(values.level);
const mode = values.mode as "1v1" | "3v3";
const seeds = Number(values.seeds);
const progress = autoProgress(level, null);
const mates = ["haVan", "maiThanh"].map((id) => leveledFoe(STARTER_COMPANIONS.find((c) => c.id === id)!, level));
interface Build { readonly profession: Profession; readonly element: Element; readonly unit: FighterConfig }
const builds: Build[] = ALL_PROFESSIONS.flatMap((profession) => ELEMENTS.map((element) => ({ profession, element, unit: buildMain(progress, element, profession) })));
const team = (b: Build) => ({ fighters: mode === "1v1" ? [b.unit] : [b.unit, ...mates], leader: 0 });

const wins = new Map<Build, { w: number; n: number }>(builds.map((b) => [b, { w: 0, n: 0 }]));
const pairWins = new Map<string, { w: number; n: number }>();
let battles = 0;
for (let i = 0; i < builds.length; i++) for (let j = i + 1; j < builds.length; j++) {
  const a = builds[i]!, b = builds[j]!;
  for (let s = 0; s < seeds; s++) for (const first of [0, 1] as SideIndex[]) {
    const r = runBattle({ sides: [team(a), team(b)], seed: (1 + s * 7919 + i * 31 + j) >>> 0, firstSide: first });
    battles++;
    const score = r.winner === null ? 0.5 : r.winner === 0 ? 1 : 0;
    for (const [x, y, v] of [[a, b, score], [b, a, 1 - score]] as const) {
      const t = wins.get(x)!; t.w += v; t.n++;
      const key = `${x.profession}>${y.profession}`; const p = pairWins.get(key) ?? { w: 0, n: 0 }; p.w += v; p.n++; pairWins.set(key, p);
    }
  }
}
const rate = (t: { w: number; n: number }) => (t.n ? t.w / t.n : 0);
const group = (key: (b: Build) => string) => {
  const g = new Map<string, { w: number; n: number }>();
  for (const b of builds) { const t = wins.get(b)!, k = key(b), c = g.get(k) ?? { w: 0, n: 0 }; c.w += t.w; c.n += t.n; g.set(k, c); }
  return Object.fromEntries([...g].map(([k, v]) => [k, Number((rate(v) * 100).toFixed(1))]));
};
const out = {
  level, mode, battles,
  byProfession: group((b) => b.profession),
  byElement: group((b) => b.element),
  builds: builds.map((b) => ({ profession: b.profession, element: b.element, rate: Number((rate(wins.get(b)!) * 100).toFixed(1)) })).sort((x, y) => y.rate - x.rate),
  matrix: Object.fromEntries(ALL_PROFESSIONS.map((p) => [p, Object.fromEntries(ALL_PROFESSIONS.filter((q) => q !== p).map((q) => [q, Number((rate(pairWins.get(`${p}>${q}`)!) * 100).toFixed(0))]))])),
};
if (values.json) console.log(JSON.stringify(out));
else {
  console.log(`Cấp ${level}, ${mode}, ${battles} trận`);
  console.log("Theo nghề:", out.byProfession);
  console.log("Theo hệ:", out.byElement);
  console.log("Cao nhất:", out.builds.slice(0, 6).map((b) => `${b.profession}/${b.element} ${b.rate}`).join(", "));
  console.log("Thấp nhất:", out.builds.slice(-6).map((b) => `${b.profession}/${b.element} ${b.rate}`).join(", "));
}
