/**
 * Sổ đăng ký hình động nhân vật trên sân khấu trận. Tọa độ theo hệ của file PSD gốc (1024×1024); ảnh
 * từng lớp nằm ở public/art/characters/<thư mục>/<lớp>.webp và được thu nhỏ theo `texScale` cho nhẹ.
 * Cách tách lớp và dựng khớp: docs/06-art/ke-hoach-do-hoa.md mục 4.4.
 *
 * Mỗi nhân vật một file trong thư mục này, tên theo `dir` (thư mục tranh trong public/art/characters/).
 * Thêm nhân vật: tạo `<dir>.ts` xuất một `WarriorRig` hoặc `MageRig`, import ở dưới và thêm vào `RIGS`.
 */

import type { Element, Profession } from "@/core";
import { ALL_COMPANIONS } from "@/core/roster/roster";
import { MAGE_PARTS, type Rig } from "./types";
import { DAO_LAM } from "./dao-lam";
import { TRAN_CUONG } from "./tran-cuong";
import { DINH_BO_LINH } from "./dinh-bo-linh";
import { NGUYEN_BAC } from "./nguyenBac";
import { DINH_DIEN } from "./dinh-dien";
import { LUU_CO } from "./luu-co";
import { TRINH_TU } from "./trinh-tu";
import { LE_HOAN } from "./le-hoan";
import { DINH_LIEN } from "./dinh-lien";
import { TRAN_LAM } from "./tran-lam";
import { NGO_NHAT_KHANH } from "./ngo-nhat-khanh";
import { PHAM_BACH_HO } from "./pham-bach-ho";
import { NGO_XUONG_XI } from "./ngo-xuong-xi";
import { KIEU_CONG_HAN } from "./kieu-cong-han";
import { NGUYEN_KHOAN } from "./nguyen-khoan";
import { KIEU_THUAN } from "./kieu-thuan";
import { LY_KHUE } from "./ly-khue";
import { NGUYEN_THU_TIEP } from "./nguyen-thu-tiep";
import { LU_DUONG } from "./lu-duong";
import { NGUYEN_SIEU } from "./nguyen-sieu";
import { DO_CANH_THAC } from "./do-canh-thac";
import { CHU_NGAN } from "./chu-ngan";
import { CAO_KIEN } from "./cao-kien";
import { CHAU_NGOC } from "./chau-ngoc";
import { TO_KIM } from "./to-kim";
import { NGHIEM_THIET } from "./nghiem-thiet";
import { LAM_TUNG } from "./lam-tung";
import { DAM_THAO } from "./dam-thao";
import { HOANG_MOC } from "./hoang-moc";
import { LUC_DIEP } from "./luc-diep";
import { NHAN_TRUC } from "./nhan-truc";
import { SAM_TUE } from "./sam-tue";
import { HO_LANG } from "./ho-lang";
import { KHA_SON } from "./kha-son";
import { THAI_HA } from "./thai-ha";
import { MAI_THANH } from "./mai-thanh";
import { QUACH_AN } from "./quach-an";
import { VI_TRIEU } from "./vi-trieu";
import { HA_VAN } from "./ha-van";
import { TON_DIEM } from "./ton-diem";
import { LY_LIET } from "./ly-liet";
import { TRUONG_VIEM } from "./truong-viem";
import { HONG_DAN } from "./hong-dan";
import { NINH_HOA } from "./ninh-hoa";
import { DOAN_NHAM } from "./doan-nham";
import { LE_THACH } from "./le-thach";
import { BE_LIEN } from "./be-lien";
import { MA_NHAC } from "./ma-nhac";
import { TA_THACH } from "./ta-thach";
import { TONG_TAN } from "./tong-tan";
import { VU_LOI } from "./vu-loi";
import { ONG_CHAN } from "./ong-chan";
import { TIEU_MINH } from "./tieu-minh";
import { TU_KINH } from "./tu-kinh";
import { MAC_VAN } from "./mac-van";
import { HUA_LANG } from "./hua-lang";
import { LIEU_YEN } from "./lieu-yen";
import { MANH_TUONG } from "./manh-tuong";
import { BACH_SUONG } from "./bach-suong";
import { BUI_PHIEU } from "./bui-phieu";
import { PHUNG_PHONG } from "./phung-phong";
import { BACH_NO_LANG } from "./bach-no-lang";
import { THANH_LAM_XA } from "./thanh-lam-xa";
import { LAM_GIANG_PHI_DIEP } from "./lam-giang-phi-diep";
import { XICH_DIEM_LUAN } from "./xich-diem-luan";
import { TRAN_SON_THACH } from "./tran-son-thach";
import { LOI_MINH_XA } from "./loi-minh-xa";
import { TAT_PHONG_LANG } from "./tat-phong-lang";
import { DINH_NGOC } from "./dinh-ngoc";
import { BACH_PHONG_DAO } from "./bach-phong-dao";
import { DOC_ANH } from "./doc-anh";
import { HAN_GIANG_KHACH } from "./han-giang-khach";
import { XICH_DA } from "./xich-da";
import { DIA_AN } from "./dia-an";
import { LOI_ANH } from "./loi-anh";
import { VO_ANH } from "./vo-anh";
import { VU_PHONG } from "./vu-phong";
import { NPC_RIGS } from "./npc";

export * from "./types";

/** Lớp ảnh của một bộ xương. */
export function partsOf(rig: Rig): readonly string[] {
  return rig.skeleton === "mage"
    ? MAGE_PARTS
    : [
        "body",
        "armR",
        "sword",
        "arm",
        "head",
        ...rig.cloth.map((c) => c.name),
        ...rig.covers.map((c) => c.name),
        ...Object.values(rig.poses ?? {}).map((p) => p.name),
        ...(rig.down ? [rig.down.name] : []),
      ];
}

/** Hình động theo id nhân vật. Nhân vật chưa có hình động thì sân khấu dùng chân dung. */
const RIGS: Readonly<Record<string, Rig>> = {
  daoLam: DAO_LAM,
  tranCuong: TRAN_CUONG,
  dinhBoLinh: DINH_BO_LINH,
  nguyenBac: NGUYEN_BAC,
  dinhDien: DINH_DIEN,
  luuCo: LUU_CO,
  trinhTu: TRINH_TU,
  leHoan: LE_HOAN,
  dinhLien: DINH_LIEN,
  tranLam: TRAN_LAM,
  ngoNhatKhanh: NGO_NHAT_KHANH,
  phamBachHo: PHAM_BACH_HO,
  ngoXuongXi: NGO_XUONG_XI,
  kieuCongHan: KIEU_CONG_HAN,
  nguyenKhoan: NGUYEN_KHOAN,
  kieuThuan: KIEU_THUAN,
  lyKhue: LY_KHUE,
  nguyenThuTiep: NGUYEN_THU_TIEP,
  luDuong: LU_DUONG,
  nguyenSieu: NGUYEN_SIEU,
  doCanhThac: DO_CANH_THAC,
  chuNgan: CHU_NGAN,
  caoKien: CAO_KIEN,
  chauNgoc: CHAU_NGOC,
  toKim: TO_KIM,
  nghiemThiet: NGHIEM_THIET,
  lamTung: LAM_TUNG,
  damThao: DAM_THAO,
  hoangMoc: HOANG_MOC,
  lucDiep: LUC_DIEP,
  nhanTruc: NHAN_TRUC,
  samTue: SAM_TUE,
  hoLang: HO_LANG,
  khaSon: KHA_SON,
  thaiHa: THAI_HA,
  maiThanh: MAI_THANH,
  quachAn: QUACH_AN,
  viTrieu: VI_TRIEU,
  haVan: HA_VAN,
  tonDiem: TON_DIEM,
  lyLiet: LY_LIET,
  truongViem: TRUONG_VIEM,
  hongDan: HONG_DAN,
  ninhHoa: NINH_HOA,
  doanNham: DOAN_NHAM,
  leThach: LE_THACH,
  beLien: BE_LIEN,
  maNhac: MA_NHAC,
  taThach: TA_THACH,
  tongTan: TONG_TAN,
  vuLoi: VU_LOI,
  ongChan: ONG_CHAN,
  tieuMinh: TIEU_MINH,
  tuKinh: TU_KINH,
  macVan: MAC_VAN,
  huaLang: HUA_LANG,
  lieuYen: LIEU_YEN,
  manhTuong: MANH_TUONG,
  bachSuong: BACH_SUONG,
  buiPhieu: BUI_PHIEU,
  phungPhong: PHUNG_PHONG,
  bachNoLang: BACH_NO_LANG,
  thanhLamXa: THANH_LAM_XA,
  lamGiangPhiDiep: LAM_GIANG_PHI_DIEP,
  xichDiemLuan: XICH_DIEM_LUAN,
  tranSonThach: TRAN_SON_THACH,
  loiMinhXa: LOI_MINH_XA,
  tatPhongLang: TAT_PHONG_LANG,
  dinhNgoc: DINH_NGOC,
  vuPhong: VU_PHONG,
  bachPhongDao: BACH_PHONG_DAO,
  docAnh: DOC_ANH,
  hanGiangKhach: HAN_GIANG_KHACH,
  xichDa: XICH_DA,
  diaAn: DIA_AN,
  loiAnh: LOI_ANH,
  voAnh: VO_ANH,
  ...NPC_RIGS,
};

export function rigOf(id: string): Rig | null {
  return RIGS[id] ?? null;
}

/**
 * Rig dùng trong trận cho một nhân vật cụ thể. Đinh Bộ Lĩnh và NPC (`adaptiveFx`) mượn hiệu ứng tuyệt chiêu và màu của nhân
 * vật kèm cùng nghề, cùng hệ có hiệu ứng riêng, vì tuyệt chiêu của Đinh Bộ Lĩnh đổi theo nghề và hệ người chơi chọn, còn NPC không có hiệu ứng riêng.
 */
export function rigFor(f: { readonly id: string; readonly element: Element; readonly profession: Profession }): Rig | null {
  const rig = rigOf(f.id);
  if (!rig || rig.skeleton !== "warrior" || !rig.adaptiveFx) return rig;
  for (const c of ALL_COMPANIONS) {
    if (c.element !== f.element || c.profession !== f.profession) continue;
    const twin = rigOf(c.id);
    if (twin?.skeleton === "warrior" && twin.strikeFx) return { ...rig, strikeFx: twin.strikeFx, fxColor: twin.fxColor };
  }
  return rig;
}

export function rigIds(): readonly string[] {
  return Object.keys(RIGS);
}

/** Đường dẫn ảnh của một lớp. */
export function partUrl(rig: Rig, part: string): string {
  return `/art/characters/${rig.dir}/${part}.webp`;
}
