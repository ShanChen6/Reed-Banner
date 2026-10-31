// Bốn bậc của Trận Đồ. Bàn càng lớn và bộ quân càng đa dạng thì càng khó; giá trị là điểm xuất phát,
// chốt sau khi chạy `pnpm exec tsx scripts/binh-phap-sim.ts` (docs 05-binh-phap-balance-qa.md).

import type { Ruleset } from "./types";

export const SCHEMA_VERSION = 1;

const SCORE = { place: 10, perfectNeighbor: 5, line: 50, win: 500 } as const;

export const RULESETS: readonly Ruleset[] = [
  {
    id: "nhap-mon",
    version: 1,
    name: "Nhập môn",
    blurb: "Sa bàn 3×3, hai nghề và hai hệ. Học luật đặt quân.",
    width: 3,
    height: 3,
    professions: ["tuongSi", "ySu"],
    elements: ["kim", "hoa"],
    wildPermille: 0,
    eraserPermille: 0,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "thuong",
    version: 1,
    name: "Thường",
    blurb: "Sa bàn 5×5, ba nghề và bốn hệ, có Quân Lệnh và Thu Hồi.",
    width: 5,
    height: 5,
    professions: ["tuongSi", "phapSu", "ySu"],
    elements: ["kim", "thuy", "hoa", "tho"],
    wildPermille: 60,
    eraserPermille: 60,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "kho",
    version: 1,
    name: "Khó",
    blurb: "Sa bàn 8×8, bốn nghề và bốn hệ.",
    width: 8,
    height: 8,
    professions: ["tuongSi", "binhLinh", "muuSi", "ySu"],
    elements: ["moc", "tho", "loi", "kim"],
    wildPermille: 50,
    eraserPermille: 50,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "dai-tran",
    version: 1,
    name: "Đại trận",
    blurb: "Sa bàn 8×8, sáu nghề và sáu hệ. Ít quân khớp nhất.",
    width: 8,
    height: 8,
    professions: ["tuongSi", "phapSu", "binhLinh", "ySu", "muuSi", "quanSu"],
    elements: ["kim", "moc", "thuy", "hoa", "tho", "phong"],
    wildPermille: 50,
    eraserPermille: 50,
    maxHeat: 3,
    score: SCORE,
  },
];

export function rulesetById(id: string): Ruleset | undefined {
  return RULESETS.find((r) => r.id === id);
}
