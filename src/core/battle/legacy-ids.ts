// Mã cũ đã đổi tên: dạng `rb0xx_…` của 14 Xạ thủ/Sát thủ mở rộng (RB-062..075, đổi 06/11/2026) và mã cũ của tướng dung
// hợp Minh Nguyệt cùng sáu kỹ năng, ba bị động riêng (đổi 19/11/2026). Dữ liệu đã lưu trước ngày đổi (hồ sơ: tướng đã có,
// đội, trang bị, nhiệm vụ phụ, sổ Tầm Tướng Ký; trận đang chơi; phòng thủ, đối thủ Đấu trường; Đấu người; Trận Đồ) có thể
// còn mã cũ: server chạy `migrateLegacyIds` khi đọc từ DB. Không xóa bảng này khi dữ liệu cũ còn có thể tồn tại.

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
  // Minh Nguyệt: id nhân vật (tướng đã có, đội, trang bị, nhiệm vụ phụ), node và công thức Tầm Tướng Ký, kỹ năng, bị động.
  dinhNgoc: "minhNguyet",
  "hero.dinhNgoc": "hero.minhNguyet",
  "r.dinhNgoc": "r.minhNguyet",
  dn_kimQuangPhaTran: "mn_kimQuangPhaTran",
  dn_thuyAnhXuyenLuu: "mn_thuyAnhXuyenLuu",
  dn_hoaBoDoatMenh: "mn_hoaBoDoatMenh",
  dn_vanTuongQuyNhat: "mn_vanTuongQuyNhat",
  dn_thoAnTranTam: "mn_thoAnTranTam",
  dn_loiVanKhaiLo: "mn_loiVanKhaiLo",
  dn_thoMachHoThan: "mn_thoMachHoThan",
  dn_mocTucDuongSinh: "mn_mocTucDuongSinh",
  dn_loiYDoatCo: "mn_loiYDoatCo",
};

/**
 * Mã cũ nằm bên trong một chuỗi ghép (cặp đã thử của Tầm Tướng Ký `hero.x>elt.kim`), không phải cả chuỗi: thay khi đứng
 * giữa dấu nháy và dấu `>`.
 */
const LEGACY_INNER: readonly (readonly [RegExp, string])[] = [[/(?<=[">])hero\.dinhNgoc(?=[">])/g, "hero.minhNguyet"]];

const escape = (id: string) => id.replace(/\./g, "\\.");
const LEGACY_PATTERN = new RegExp(`"(${Object.keys(LEGACY_IDS).map(escape).join("|")})"`, "g");

/**
 * Thay mọi chuỗi JSON đúng bằng một mã cũ (giá trị hoặc khóa) bằng mã mới. Trả lại chính đối tượng
 * khi không có mã cũ nào, để đường đọc thường không tốn thêm bản sao.
 */
export function migrateLegacyIds<T>(value: T): T {
  if (value === null || value === undefined) return value;
  const json = JSON.stringify(value);
  LEGACY_PATTERN.lastIndex = 0;
  const inner = LEGACY_INNER.some(([re]) => ((re.lastIndex = 0), re.test(json)));
  LEGACY_PATTERN.lastIndex = 0;
  if (!inner && !LEGACY_PATTERN.test(json)) return value;
  let out = json.replace(LEGACY_PATTERN, (_, id: string) => `"${LEGACY_IDS[id]}"`);
  for (const [re, to] of LEGACY_INNER) out = out.replace(re, to);
  return JSON.parse(out) as T;
}
