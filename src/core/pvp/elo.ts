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

/** Vàng mỗi trận PvP cho người được tính điểm: thắng, thua (đề xuất, chờ Shan duyệt). */
export const PVP_GOLD_WIN = 60;
export const PVP_GOLD_LOSS = 20;
/** Trần vàng PvP mỗi người mỗi ngày (giờ Việt Nam). Số trận không bị giới hạn, chỉ vàng bị giới hạn. */
export const PVP_GOLD_DAILY_CAP = 300;
/** Một người chỉ có vàng ở bấy nhiêu trận đầu mỗi ngày với cùng một đối thủ; trận sau vẫn tính điểm nhưng không có vàng. */
export const PVP_GOLD_PER_OPPONENT = 2;
/** Hạn chế ghép trận khi phá trận lần thứ hai trong tuần: 15 phút, gấp đôi mỗi lần lặp lại, tối đa 24 giờ. */
export const PVP_BAN_BASE_MS = 15 * 60_000;
export const PVP_BAN_MAX_MS = 24 * 60 * 60_000;

/** Vàng gốc của một trận cho người được tính điểm, đã giảm theo số AI trong trận (làm tròn). */
export function pvpGoldBase(won: boolean, aiCount: number): number {
  return Math.round((won ? PVP_GOLD_WIN : PVP_GOLD_LOSS) * pvpAiFactor(aiCount));
}

/**
 * Hậu quả của lần phá trận thứ `count` trong tuần: lần đầu chỉ cảnh cáo, từ lần hai bị hạn chế ghép trận
 * (`PVP_BAN_BASE_MS` nhân đôi mỗi lần, không quá `PVP_BAN_MAX_MS`). Trả số mili giây bị hạn chế, 0 là chỉ cảnh cáo.
 */
export function pvpBanMs(count: number): number {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("Số lần phá trận không hợp lệ");
  if (count === 1) return 0;
  return Math.min(PVP_BAN_MAX_MS, PVP_BAN_BASE_MS * 2 ** (count - 2));
}
