/** Ánh xạ dùng chung cho giao diện và bảng file xem thử trên server. */
const PHOTOS: Readonly<Record<string, string>> = {
  tranCuong: "/art/characters/tran-cuong/portrait.webp",
  ngoXuongXi: "/art/characters/ngo-xuong-xi/portrait.webp",
  phamBachHo: "/art/characters/pham-bach-ho/portrait.webp",
  tranLam: "/art/characters/tran-lam/portrait.webp",
  ngoNhatKhanh: "/art/characters/ngo-nhat-khanh/portrait.webp",
  dinhLien: "/art/characters/dinh-lien/portrait.webp",
  dinhBoLinh: "/art/characters/dinh-bo-linh/portrait.webp",
  nguyenBac: "/art/characters/nguyenBac/portrait.webp",
  trinhTu: "/art/characters/trinh-tu/portrait.webp",
  luuCo: "/art/characters/luu-co/portrait.webp",
  dinhDien: "/art/characters/dinh-dien/portrait.webp",
  leHoan: "/art/characters/le-hoan/portrait.webp",
  kieuCongHan: "/art/characters/kieu-cong-han/portrait.webp",
  nguyenKhoan: "/art/characters/nguyen-khoan/portrait.webp",
  kieuThuan: "/art/characters/kieu-thuan/portrait.webp",
  lyKhue: "/art/characters/ly-khue/portrait.webp",
  nguyenThuTiep: "/art/characters/nguyen-thu-tiep/portrait.webp",
  luDuong: "/art/characters/lu-duong/portrait.webp",
  nguyenSieu: "/art/characters/nguyen-sieu/portrait.webp",
  doCanhThac: "/art/characters/do-canh-thac/portrait.webp",
  chuNgan: "/art/characters/chu-ngan/portrait.webp",
  caoKien: "/art/characters/cao-kien/portrait.webp",
  chauNgoc: "/art/characters/chau-ngoc/portrait.webp",
  toKim: "/art/characters/to-kim/portrait.webp",
  nghiemThiet: "/art/characters/nghiem-thiet/portrait.webp",
  lamTung: "/art/characters/lam-tung/portrait.webp",
  damThao: "/art/characters/dam-thao/portrait.webp",
  hoangMoc: "/art/characters/hoang-moc/portrait.webp",
  lucDiep: "/art/characters/luc-diep/portrait.webp",
  nhanTruc: "/art/characters/nhan-truc/portrait.webp",
  samTue: "/art/characters/sam-tue/portrait.webp",
  hoLang: "/art/characters/ho-lang/portrait.webp",
  khaSon: "/art/characters/kha-son/portrait.webp",
  daoLam: "/art/characters/dao-lam/portrait.webp",
  thaiHa: "/art/characters/thai-ha/portrait.webp",
  maiThanh: "/art/characters/mai-thanh/portrait.webp",
  quachAn: "/art/characters/quach-an/portrait.webp",
  viTrieu: "/art/characters/vi-trieu/portrait.webp",
  haVan: "/art/characters/ha-van/portrait.webp",
  tonDiem: "/art/characters/ton-diem/portrait.webp",
  lyLiet: "/art/characters/ly-liet/portrait.webp",
  truongViem: "/art/characters/truong-viem/portrait.webp",
  hongDan: "/art/characters/hong-dan/portrait.webp",
  ninhHoa: "/art/characters/ninh-hoa/portrait.webp",
  doanNham: "/art/characters/doan-nham/portrait.webp",
  leThach: "/art/characters/le-thach/portrait.webp",
  beLien: "/art/characters/be-lien/portrait.webp",
  maNhac: "/art/characters/ma-nhac/portrait.webp",
  taThach: "/art/characters/ta-thach/portrait.webp",
  tongTan: "/art/characters/tong-tan/portrait.webp",
  vuLoi: "/art/characters/vu-loi/portrait.webp",
  ongChan: "/art/characters/ong-chan/portrait.webp",
  tieuMinh: "/art/characters/tieu-minh/portrait.webp",
  tuKinh: "/art/characters/tu-kinh/portrait.webp",
  macVan: "/art/characters/mac-van/portrait.webp",
  huaLang: "/art/characters/hua-lang/portrait.webp",
  lieuYen: "/art/characters/lieu-yen/portrait.webp",
  manhTuong: "/art/characters/manh-tuong/portrait.webp",
  bachSuong: "/art/characters/bach-suong/portrait.webp",
  buiPhieu: "/art/characters/bui-phieu/portrait.webp",
  phungPhong: "/art/characters/phung-phong/portrait.webp",
  bachNoLang: "/art/characters/bach-no-lang/portrait.webp",
  thanhLamXa: "/art/characters/thanh-lam-xa/portrait.webp",
  lamGiangPhiDiep: "/art/characters/lam-giang-phi-diep/portrait.webp",
  xichDiemLuan: "/art/characters/xich-diem-luan/portrait.webp",
  tranSonThach: "/art/characters/tran-son-thach/portrait.webp",
  loiMinhXa: "/art/characters/loi-minh-xa/portrait.webp",
  tatPhongLang: "/art/characters/tat-phong-lang/portrait.webp",
  dinhNgoc: "/art/characters/dinh-ngoc/portrait.webp",
  vuPhong: "/art/characters/vu-phong/portrait.webp",
  bachPhongDao: "/art/characters/bach-phong-dao/portrait.webp",
  docAnh: "/art/characters/doc-anh/portrait.webp",
  hanGiangKhach: "/art/characters/han-giang-khach/portrait.webp",
  xichDa: "/art/characters/xich-da/portrait.webp",
  diaAn: "/art/characters/dia-an/portrait.webp",
  loiAnh: "/art/characters/loi-anh/portrait.webp",
  voAnh: "/art/characters/vo-anh/portrait.webp",
};

export function portraitUrl(id: string): string | null {
  return PHOTOS[id] ?? null;
}

/**
 * Nhân vật đã có chân dung bán thân phong cách mới (`bust.webp` 384×384, nền tranh sương; prompt ở
 * docs/06-art/prompts/chan-dung-lich-su.md). Thiếu thì ô chân dung dùng `portrait.webp` như cũ. Thêm id vào đây khi có ảnh.
 */
export const BUST_IDS: ReadonlySet<string> = new Set(["nguyenBac", "haVan", "maiThanh", "leThach", "phungPhong", "toKim", "tranCuong", "lamTung", "hoLang", "lyLiet", "khaSon", "huaLang", "tongTan", "chuNgan", "damThao", "daoLam", "doanNham", "vuLoi", "lieuYen", "caoKien", "hoangMoc", "thaiHa", "truongViem", "manhTuong", "ongChan", "hongDan", "lucDiep", "chauNgoc", "beLien", "tieuMinh", "bachSuong", "ninhHoa", "quachAn", "nhanTruc", "maNhac", "buiPhieu", "tuKinh", "samTue", "viTrieu", "macVan", "tonDiem", "taThach", "bachNoLang", "thanhLamXa", "lamGiangPhiDiep", "xichDiemLuan", "nghiemThiet", "tranSonThach", "loiMinhXa", "tatPhongLang", "bachPhongDao", "docAnh", "hanGiangKhach", "xichDa", "diaAn", "loiAnh", "dinhBoLinh", "luuCo", "trinhTu", "leHoan", "voAnh", "dinhDien", "dinhLien", "phamBachHo", "lyKhue", "doCanhThac", "ngoXuongXi", "nguyenThuTiep", "tranLam"]);

export function bustUrl(id: string): string | null {
  const photo = BUST_IDS.has(id) ? portraitUrl(id) : null;
  return photo ? photo.replace(/\/[^/]+$/, "/bust.webp") : null;
}

/**
 * Hệ đã có tranh nền sân khấu ở trang chi tiết tướng (`public/art/stage/he-<hệ>.webp`, khổ ngang 2:1, vầng sáng ở giữa;
 * prompt ở docs/06-art/prompts/nen-phong-thai.md). Thiếu thì sân khấu giữ nền gỗ tối với quầng sáng màu hệ như cũ.
 * Thêm hệ vào đây khi có tranh.
 */
export const STAGE_BACKDROP_ELEMENTS: ReadonlySet<string> = new Set(["kim", "moc", "thuy", "hoa", "tho", "loi", "phong"]);

export function stageBackdropUrl(element: string): string | null {
  return STAGE_BACKDROP_ELEMENTS.has(element) ? `/art/stage/he-${element}.webp` : null;
}
