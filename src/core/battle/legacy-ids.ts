// Mã cũ dạng `rb0xx_…` của 14 Xạ thủ/Sát thủ mở rộng (RB-062..075), đổi sang tên chiêu/bị động ngày 06/11/2026.
// Dữ liệu đã lưu trước ngày đổi (trận đang chơi, phòng thủ và đối thủ Đấu trường, hồ sơ) có thể còn mã cũ:
// server chạy `migrateLegacyIds` khi đọc từ DB. Không xóa bảng này khi dữ liệu cũ còn có thể tồn tại.

/** Mã cũ → mã mới: 14 tuyệt chiêu ô 4 và 14 bị động riêng. */
export const LEGACY_IDS: Readonly<Record<string, string>> = {
  rb_bnl_thietNoPhaThanh: "thietNoPhaThanh",
  rb_tlx_lucTienTroiDuong: "lucTienTroiDuong",
  rb064_lieuDiepToaGiang: "lieuDiepToaGiang",
  rb065_xichLuanLietTran: "xichLuanLietTran",
  rb066_tranSonHoTran: "tranSonHoTran",
  rb067_loiChamTuocKhi: "loiChamTuocKhi",
  rb068_phongLangNhieuTran: "phongLangNhieuTran",
  rb069_ultimate: "thietAnDoatMenh",
  rb070_ultimate: "docAnhTiemCham",
  rb071_ultimate: "hanGiangTangNhan",
  rb072_ultimate: "xichDaSongSat",
  rb073_ultimate: "diaPhucLietTrao",
  rb074_ultimate: "baoVuLeHoa",
  rb075_ultimate: "voThanhDoatPhach",
  rb_bnl_passive: "noThanhBenBi",
  rb_tlx_passive: "reHoNguoi",
  rb064_canhGioi: "canhGioiBenSong",
  rb065_hoaCot: "hoaCotTruyKich",
  rb066_kienThu: "sonTranKienThu",
  rb067_chopThoiCo: "chopThoiCo",
  rb068_hoiNhip: "thuanGioHoiNhip",
  rb069_passive: "anKhuyetQuyetTam",
  rb070_passive: "lamAnhTiepNhip",
  rb071_passive: "tinhThuyHoiTuc",
  rb072_passive: "daTapThuaHu",
  rb073_passive: "phucDiaPhanKich",
  rb074_passive: "tanVuHoiNhip",
  rb075_passive: "duAmTiepVan",
};

const LEGACY_PATTERN = new RegExp(`"(${Object.keys(LEGACY_IDS).join("|")})"`, "g");

/**
 * Thay mọi chuỗi JSON đúng bằng một mã cũ (giá trị hoặc khóa) bằng mã mới. Trả lại chính đối tượng
 * khi không có mã cũ nào, để đường đọc thường không tốn thêm bản sao.
 */
export function migrateLegacyIds<T>(value: T): T {
  if (value === null || value === undefined) return value;
  const json = JSON.stringify(value);
  LEGACY_PATTERN.lastIndex = 0;
  if (!LEGACY_PATTERN.test(json)) return value;
  return JSON.parse(json.replace(LEGACY_PATTERN, (_, id: string) => `"${LEGACY_IDS[id]}"`)) as T;
}
