// Bộ sưu tập địa danh Trận Đồ (V2-05): id bản đồ đã khai thông, lưu trong hồ sơ để không mất khi đổi máy.
// Danh sách id hợp lệ nằm ở đây để server từ chối id lạ; `tests/game/formation-maps.test.ts` kiểm khớp với kho bản đồ ở
// `src/app/game/formation/maps.ts` (thêm bản đồ mới thì thêm id vào cả hai nơi).

export const FORMATION_PLACE_IDS: readonly string[] = [
  "hoaLu", "tranLam", "phamBachHo", "ngoXuongXi", "ngoNhatKhanh", "nguyenKhoan", "kieuCongHan", "kieuThuan", "lyKhue",
  "nguyenThuTiep", "luDuong", "nguyenSieu", "doCanhThac", "coLoa", "bachDang", "daiLa", "luyLau", "aiChau", "hoanChau",
  "tanVien", "dongLua", "damSen", "langVenSong", "benThuyen", "trungDu", "cuaBien", "chuaCoTrenDoi", "thanhDatCoHao",
  "rungGia", "nuiDaVoi",
];

export interface FormationCollectionState {
  /** Id địa danh đã khai thông, theo thứ tự thu được, không trùng. */
  readonly collection: readonly string[];
}

const VALID: ReadonlySet<string> = new Set(FORMATION_PLACE_IDS);

/** Giữ id hợp lệ, bỏ trùng; không có địa danh nào thì trả undefined để hồ sơ không mang trường rỗng. */
export function parseFormationCollection(raw: unknown): FormationCollectionState | undefined {
  const list = (raw as Partial<FormationCollectionState> | null)?.collection;
  if (!Array.isArray(list)) return undefined;
  const collection = [...new Set(list.filter((id): id is string => typeof id === "string" && VALID.has(id)))];
  return collection.length > 0 ? { collection } : undefined;
}

/** Gộp thêm địa danh (id lạ bị bỏ qua). */
export function mergeCollection(state: FormationCollectionState | undefined, ids: readonly string[]): FormationCollectionState {
  const have = state?.collection ?? [];
  return { collection: [...new Set([...have, ...ids.filter((id) => VALID.has(id))])] };
}
