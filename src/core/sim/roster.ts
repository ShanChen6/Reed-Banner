// Mô phỏng sức mạnh từng nhân vật kèm: mỗi trận 3vs3, phe 0 là Đinh Bộ Lĩnh + nhân vật cần đo + một bạn
// ngẫu nhiên, phe 1 là Đinh Bộ Lĩnh + 2 nhân vật ngẫu nhiên; hai phe cùng hệ nhân vật chính (xoay 7 hệ) và cùng
// cấp. Bạn và đối thủ rút từ cả kho nhân vật kèm nên 50% là ngang mức trung bình.
// Dùng để cân tướng thường, tướng lịch sử và sứ quân, xem docs/03-characters/danh-sach-nhan-vat.md.

import { ELEMENTS, type FighterConfig, type SideIndex } from "../battle";
import { autoProgress, buildMain, leveledFoe } from "../progress";
import { createRng } from "../rng";
import type { Matchup } from "./sim";

/**
 * `count` trận cho mỗi nhân vật trong `candidates`, cùng cấp `level`. `pool` là kho để rút bạn và đối thủ
 * (bỏ chính nhân vật đang đo).
 */
export function rosterMatchups(
  candidates: readonly FighterConfig[],
  pool: readonly FighterConfig[],
  count: number,
  level: number,
  seed = 1,
): Map<string, Matchup[]> {
  const out = new Map<string, Matchup[]>();
  const built = new Map(pool.map((f) => [f.id, leveledFoe(f, level)]));
  const at = (f: FighterConfig) => built.get(f.id) ?? leveledFoe(f, level);
  const mainP = autoProgress(level, null);
  for (const c of candidates) {
    const rng = createRng(seed);
    const others = pool.filter((f) => f.id !== c.id);
    const pick = (n: number) => {
      const left = [...others];
      return Array.from({ length: n }, () => left.splice(rng.int(0, left.length - 1), 1)[0]!);
    };
    out.set(
      c.id,
      Array.from({ length: count }, (_, i) => {
        const element = ELEMENTS[Math.floor(i / 2) % ELEMENTS.length]!;
        const main = buildMain(mainP, element, "tuongSi");
        const [mate, f1, f2] = pick(3) as [FighterConfig, FighterConfig, FighterConfig];
        return {
          sides: [
            { fighters: [main, at(c), at(mate)], leader: 0 },
            { fighters: [main, at(f1), at(f2)], leader: 0 },
          ],
          seed: (seed + i * 7919) >>> 0,
          firstSide: (i % 2) as SideIndex,
        };
      }),
    );
  }
  return out;
}
