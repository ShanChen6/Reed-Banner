/**
 * Biểu tượng bị động: ảnh tròn Shan vẽ (05/11/2026) ở public/art/passives/<mã>.webp, đã cắt theo một vòng tròn đều.
 * Mã là khóa của COMBO_PASSIVES (bị động nghề 1), CHASE_PASSIVES (truy kích) hoặc rage_<hệ> (bị động thủ lĩnh khi đầy Nộ, PASSIVES). Bị động chưa có ảnh vẽ chấm tròn chữ cái đầu.
 */

/** 29 bị động dùng chung (7 nghề 1 Cơ hội, 8 truy kích theo nghề, 14 theo hệ) và 21 bị động riêng (14 Xạ thủ/Sát thủ mở rộng, Đinh Ngọc, Trần Vũ Phong). */
export const PASSIVE_ART = new Set([
  "pursuit", "resonance", "retaliation", "renewal", "phongLenh", "interdiction", "coordination",
  "martial", "arcane", "guardian", "medic", "strategist", "commander", "marksmanPrepared", "assassinPrepared",
  "kim1", "kim2", "moc1", "moc2", "thuy1", "thuy2", "hoa1", "hoa2", "tho1", "tho2", "loi1", "loi2", "phong1", "phong2",
  "noThanhBenBi", "reHoNguoi", "canhGioiBenSong", "hoaCotTruyKich", "sonTranKienThu", "chopThoiCo", "thuanGioHoiNhip",
  "anKhuyetQuyetTam", "lamAnhTiepNhip", "tinhThuyHoiTuc", "daTapThuaHu", "phucDiaPhanKich", "tanVuHoiNhip", "duAmTiepVan",
  "dn_thoMachHoThan", "dn_mocTucDuongSinh", "dn_loiYDoatCo",
  "vp_truongThietHoiDap", "vp_phiDiepTheoGio", "vp_hoaAnVanSau", "vp_loiVanTranPhap",
  "rage_kim", "rage_moc", "rage_thuy", "rage_hoa", "rage_tho", "rage_loi", "rage_phong",
]);

/** Mã ảnh bị động thủ lĩnh khi đầy Nộ của một hệ. */
export const ragePassiveId = (element: string) => `rage_${element}`;

export function passiveArt(id: string): string | undefined {
  return PASSIVE_ART.has(id) ? `/art/passives/${id}.webp` : undefined;
}

/** Huy hiệu tròn của một bị động; `name` dùng cho alt/title và chữ dự phòng. */
export function PassiveIcon({ id, name, className = "size-6" }: { id: string; name: string; className?: string }) {
  const src = passiveArt(id);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} title={name} className={`inline-block shrink-0 rounded-full ${className}`} loading="lazy" />;
  }
  return (
    <span
      title={name}
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-frame-bronze/60 bg-wood-inset text-[10px] font-semibold text-title-on-wood ${className}`}
    >
      {name.charAt(0)}
    </span>
  );
}
