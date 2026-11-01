// Bốn bậc của Trận Đồ. Bàn là hình chữ nhật tùy ý (width × height); bàn càng lớn, càng nhiều nghề/hệ và càng nhiều
// chướng ngại thì càng khó. Giá trị là điểm xuất phát, đo bằng `pnpm exec tsx scripts/binh-phap-sim.ts`
// (docs/02-game-modes/future/05-binh-phap-balance-qa.md). Đổi bất kỳ giá trị nào phải tăng `version` của bậc đó.

import type { Ruleset } from "./types";

export const SCHEMA_VERSION = 2;

const SCORE = { place: 10, perfectNeighbor: 5, line: 50, win: 500, winPerHeatLeft: 100, winPerTurnSaved: 5, parTurnsPerCell: 3 } as const;

export const RULESETS: readonly Ruleset[] = [
  {
    id: "nhap-mon",
    version: 2,
    name: "Nhập môn",
    blurb: "Sa bàn 3×3, hai nghề và hai hệ, không chướng ngại. Học luật đặt quân.",
    width: 3,
    height: 3,
    professions: ["tuongSi", "ySu"],
    elements: ["kim", "hoa"],
    wildPermille: 0,
    eraserPermille: 0,
    obstaclePercent: 0,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "thuong",
    version: 2,
    name: "Thường",
    blurb: "Sa bàn 5×7 có chướng ngại, ba nghề và bốn hệ, có Quân Lệnh và Thu Hồi.",
    width: 5,
    height: 7,
    professions: ["tuongSi", "phapSu", "ySu"],
    elements: ["kim", "thuy", "hoa", "tho"],
    wildPermille: 80,
    eraserPermille: 40,
    obstaclePercent: 10,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "kho",
    version: 2,
    name: "Khó",
    blurb: "Sa bàn 7×9 nhiều chướng ngại, bốn nghề và năm hệ.",
    width: 7,
    height: 9,
    professions: ["tuongSi", "binhLinh", "muuSi", "ySu"],
    elements: ["moc", "tho", "loi", "kim", "phong"],
    wildPermille: 80,
    eraserPermille: 40,
    obstaclePercent: 12,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "dai-tran",
    version: 2,
    name: "Đại trận",
    blurb: "Sa bàn 9×9 dày chướng ngại, sáu nghề và sáu hệ. Ít quân khớp nhất.",
    width: 9,
    height: 9,
    professions: ["tuongSi", "phapSu", "binhLinh", "ySu", "muuSi", "quanSu"],
    elements: ["kim", "moc", "thuy", "hoa", "tho", "phong"],
    wildPermille: 100,
    eraserPermille: 40,
    obstaclePercent: 14,
    maxHeat: 3,
    score: SCORE,
  },
];

export function rulesetById(id: string): Ruleset | undefined {
  return RULESETS.find((r) => r.id === id);
}
