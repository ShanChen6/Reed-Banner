// Bốn bậc của Trận Đồ, theo yêu cầu của Shan (01/11/2026): Hướng dẫn 3×3 (không xếp hạng, không thưởng), Thường 5×5,
// Khó 6×6, Đại trận cỡ ngẫu nhiên mỗi cạnh 7–10. Giá trị là điểm xuất phát, đo bằng
// `pnpm exec tsx scripts/binh-phap-sim.ts` (docs/02-game-modes/future/05-binh-phap-balance-qa.md).
// Đổi bất kỳ giá trị nào của một bậc phải tăng `version` của bậc đó.
//
// Ghi chú cân bằng (đo 600 ván mỗi cấu hình, bot random và greedy):
// - Số nghề × hệ và thanh Bỏ Lệnh mới là núm độ khó chính; chướng ngại rút ngắn đường nên giúp dọn hàng dễ hơn.
// - Đại trận lấy đủ 8 nghề × 7 hệ (gồm Xạ thủ, Sát thủ): random chỉ thắng khoảng 2%, greedy khoảng 33%, tức là
//   kỹ năng quyết định kết quả, hợp với bậc có bảng xếp hạng.
// - Chướng ngại của Đại trận tăng theo diện tích (10% ở 7×7 đến 16% ở 10×10) và có trần 72 ô chơi được để ván
//   dài khoảng 100 nước thay vì hơn 150 ở bàn 10×10.

import { fusionsForLevel } from "./specials";
import type { Ruleset } from "./types";

export const SCHEMA_VERSION = 3;

const SCORE = { place: 10, perfectNeighbor: 5, line: 50, win: 500, winPerHeatLeft: 100, winPerTurnSaved: 5, parTurnsPerCell: 3 } as const;

export const RULESETS: readonly Ruleset[] = [
  {
    id: "huong-dan",
    version: 1,
    name: "Hướng dẫn",
    blurb: "Sa bàn 3×3, hai nghề và hai hệ, không chướng ngại. Học luật; không xếp hạng, không thưởng.",
    width: 3,
    height: 3,
    professions: ["tuongSi", "ySu"],
    elements: ["kim", "hoa"],
    wildPermille: 0,
    eraserPermille: 0,
    fusionPermille: 0,
    fusions: fusionsForLevel("huong-dan"),
    obstaclePercent: 0,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "thuong",
    version: 3,
    name: "Thường",
    blurb: "Sa bàn 5×5 có vài chướng ngại, ba nghề và bốn hệ, có Quân Lệnh và Thu Hồi.",
    width: 5,
    height: 5,
    professions: ["tuongSi", "phapSu", "ySu"],
    elements: ["kim", "thuy", "hoa", "tho"],
    wildPermille: 80,
    eraserPermille: 40,
    fusionPermille: 0,
    fusions: fusionsForLevel("thuong"),
    obstaclePercent: 8,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "kho",
    version: 3,
    name: "Khó",
    blurb: "Sa bàn 6×6, bốn nghề và năm hệ, nhiều chướng ngại hơn.",
    width: 6,
    height: 6,
    professions: ["tuongSi", "binhLinh", "muuSi", "ySu"],
    elements: ["kim", "moc", "tho", "loi", "phong"],
    wildPermille: 80,
    eraserPermille: 40,
    fusionPermille: 15,
    fusions: fusionsForLevel("kho"),
    obstaclePercent: 10,
    maxHeat: 3,
    score: SCORE,
  },
  {
    id: "dai-tran",
    version: 3,
    name: "Đại trận",
    blurb: "Sa bàn cỡ ngẫu nhiên, mỗi cạnh từ 7 đến 10 ô, đủ tám nghề và bảy hệ. Mỗi ván một bản đồ khác.",
    width: 10,
    height: 10,
    randomSize: { min: 7, max: 10, obstaclePercentAtMin: 10, obstaclePercentAtMax: 16, maxPlayable: 72 },
    professions: ["tuongSi", "phapSu", "binhLinh", "ySu", "muuSi", "quanSu", "xaThu", "satThu"],
    elements: ["kim", "moc", "thuy", "hoa", "tho", "loi", "phong"],
    wildPermille: 100,
    eraserPermille: 40,
    fusionPermille: 15,
    fusions: fusionsForLevel("dai-tran"),
    obstaclePercent: 13,
    maxHeat: 3,
    score: SCORE,
  },
];

/** Bậc không xếp hạng, không thưởng (bậc học). */
export const UNRANKED_RULESET_IDS: readonly string[] = ["huong-dan"];

export function rulesetById(id: string): Ruleset | undefined {
  return RULESETS.find((r) => r.id === id);
}
