// Sinh các cặp đấu cho mô phỏng từ đội hình khởi đầu.

import type { Element, FighterConfig, SideConfig, SideIndex } from "../battle";
import { mainCharacter, STARTER_COMPANIONS } from "../roster";
import type { Matchup } from "./sim";

export type SimMode = "1v1" | "3v3";

function combinations<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  const out: T[][] = [];
  items.forEach((item, i) => {
    for (const rest of combinations(items.slice(i + 1), k - 1)) out.push([item, ...rest]);
  });
  return out;
}

const team = (fighters: readonly FighterConfig[]): SideConfig => ({ fighters, leader: 0 });

/**
 * Đội hình mỗi phe xoay vòng qua mọi tổ hợp:
 * - 3vs3: nhân vật chính + 2 nhân vật kèm, đấu 3 nhân vật kèm (như đội AI).
 * - 1vs1: nhân vật chính hoặc một nhân vật kèm, đấu một nhân vật kèm khác.
 * Phe đi trước luân phiên theo trận. `element` là nguyên tố của nhân vật chính.
 */
export function buildMatchups(mode: SimMode, count: number, seed = 1, element: Element = "moc"): Matchup[] {
  const main = mainCharacter(element);
  const pool = STARTER_COMPANIONS;
  let pairs: [SideConfig, SideConfig][];
  if (mode === "3v3") {
    const players = combinations(pool, 2).map((c) => team([main, ...c]));
    const foes = combinations(pool, 3).map((c) => team(c));
    pairs = players.flatMap((p) => foes.map((f): [SideConfig, SideConfig] => [p, f]));
  } else {
    const all = [main, ...pool];
    pairs = all.flatMap((a) => pool.filter((b) => b.id !== a.id).map((b): [SideConfig, SideConfig] => [team([a]), team([b])]));
  }
  return Array.from({ length: count }, (_, i) => ({
    sides: pairs[i % pairs.length]!,
    seed: (seed + i * 7919) >>> 0,
    firstSide: (i % 2) as SideIndex,
  }));
}
