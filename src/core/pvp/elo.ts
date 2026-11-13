// Điểm hạng PvP (Quần Hùng online): mỗi người một điểm Elo riêng, mỗi thể thức một điểm. Luật ở
// docs/02-game-modes/future/quan-hung-pvp-truc-tiep.md mục 3.7. Thuần, không đọc giờ hay ngẫu nhiên.

/** Điểm khởi đầu của mỗi thể thức. */
export const PVP_ELO_START = 1000;
/** Hệ số Elo: mỗi người đổi `K × hệ số AI × (kết quả − kỳ vọng)`. */
export const PVP_ELO_K = 32;
/** Mỗi tướng AI điền trong trận (cả hai phe cộng lại) giảm hệ số đi bấy nhiêu. */
export const PVP_AI_FACTOR_STEP = 0.25;
/** Hệ số tối thiểu khi trận có AI: trận có AI vẫn được tính điểm, nhưng ít hơn. */
export const PVP_AI_FACTOR_MIN = 0.25;

/** Xác suất thắng kỳ vọng của bên có điểm `mine` trước bên có điểm `theirs`. */
export function pvpExpected(mine: number, theirs: number): number {
  return 1 / (1 + 10 ** ((theirs - mine) / 400));
}

/** Hệ số giảm điểm theo số tướng AI trong cả trận: 1 khi toàn người thật, thấp nhất `PVP_AI_FACTOR_MIN`. */
export function pvpAiFactor(aiCount: number): number {
  if (!Number.isInteger(aiCount) || aiCount < 0) throw new RangeError("Số AI không hợp lệ");
  return Math.max(PVP_AI_FACTOR_MIN, 1 - PVP_AI_FACTOR_STEP * aiCount);
}

/** Điểm trung bình của một phe; phe không có người thật nào thì lấy điểm khởi đầu. */
export function pvpSideRating(humanRatings: readonly number[]): number {
  if (humanRatings.length === 0) return PVP_ELO_START;
  return humanRatings.reduce((a, b) => a + b, 0) / humanRatings.length;
}

/**
 * Số điểm đổi của một người sau trận. `own` và `foe` là điểm trung bình hai phe (1vs1 thì là điểm của chính hai người),
 * `myRating` là điểm của người đó. Kỳ vọng tính từ điểm phe, nhưng kết quả cộng vào điểm của riêng người đó.
 */
export function pvpEloDelta(params: { readonly won: boolean; readonly own: number; readonly foe: number; readonly aiCount: number }): number {
  const expected = pvpExpected(params.own, params.foe);
  const raw = PVP_ELO_K * pvpAiFactor(params.aiCount) * ((params.won ? 1 : 0) - expected);
  // Làm tròn về số nguyên gần nhất, tránh -0.
  return Math.round(raw) + 0;
}
