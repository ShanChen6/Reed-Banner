# Bản đồ kỹ năng baseline F

> Cập nhật: 22/10/2026

Sinh bằng `pnpm exec tsx scripts/baseline-skills.ts`. Nguồn, trigger, mục tiêu, thời hạn, cộng dồn, giới hạn và nâng cấp từng bị động nằm trong [inventory.json](inventory.json), mục definitions. Bốn bị động mở cấp1, không nâng riêng, không dùng Nộ. Sáu chủ động mở theo cấp ghi ở từng ô; nâng1–5, giá1/1/2/2. Tài liệu22 và code là nguồn hiện hành.

## Nhân vật sở hữu: 42 bộ ĐBL +60 đồng hành

| Nhân vật | Nghề / hệ | Bốn bị động: nghề1 / nghề2 / hệ1 / hệ2 | Sáu chủ động: ô:ID (cấp mở) |
|---|---|---|---|
| Đinh Bộ Lĩnh (dinhBoLinh) | tuongSi/kim | pursuit / martial / kim1 / kim2 | 1:role_tramKich (1) / 2:element_luyenKimThanhKiem (1) / 3:role_phaTran (5) / 4:dbl_tuongSi_kim (10) / 5:role_doatMenh (15) / 6:element_kimYNgungThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | tuongSi/moc | pursuit / martial / moc1 / moc2 | 1:role_tramKich (1) / 2:element_lucDiepPhong (1) / 3:role_phaTran (5) / 4:dbl_tuongSi_moc (10) / 5:role_doatMenh (15) / 6:element_linhMocHoiSinh (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | tuongSi/thuy | pursuit / martial / thuy1 / thuy2 | 1:role_tramKich (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_phaTran (5) / 4:dbl_tuongSi_thuy (10) / 5:role_doatMenh (15) / 6:element_thanhLuuTayTran (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | tuongSi/hoa | pursuit / martial / hoa1 / hoa2 | 1:role_tramKich (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_phaTran (5) / 4:dbl_tuongSi_hoa (10) / 5:role_doatMenh (15) / 6:element_noHoaThieuThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | tuongSi/tho | pursuit / martial / tho1 / tho2 | 1:role_tramKich (1) / 2:element_hauThoTichLuong (1) / 3:role_phaTran (5) / 4:dbl_tuongSi_tho (10) / 5:role_doatMenh (15) / 6:element_thachGiap (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | tuongSi/loi | pursuit / martial / loi1 / loi2 | 1:role_tramKich (1) / 2:element_loiTruGiangThe (1) / 3:role_phaTran (5) / 4:dbl_tuongSi_loi (10) / 5:role_doatMenh (15) / 6:element_tinhDienHoThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | tuongSi/phong | pursuit / martial / phong1 / phong2 | 1:role_tramKich (1) / 2:element_phongQuyenTanVan (1) / 3:role_phaTran (5) / 4:dbl_tuongSi_phong (10) / 5:role_doatMenh (15) / 6:element_thanhPhongTuKhi (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | phapSu/kim | resonance / arcane / kim1 / kim2 | 1:role_phepLan (1) / 2:element_luyenKimThanhKiem (1) / 3:role_nguHanhAn (5) / 4:dbl_phapSu_kim (10) / 5:role_thienDiaCong (15) / 6:element_kimYNgungThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | phapSu/moc | resonance / arcane / moc1 / moc2 | 1:role_phepLan (1) / 2:element_lucDiepPhong (1) / 3:role_nguHanhAn (5) / 4:dbl_phapSu_moc (10) / 5:role_thienDiaCong (15) / 6:element_linhMocHoiSinh (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | phapSu/thuy | resonance / arcane / thuy1 / thuy2 | 1:role_phepLan (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_nguHanhAn (5) / 4:dbl_phapSu_thuy (10) / 5:role_thienDiaCong (15) / 6:element_thanhLuuTayTran (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | phapSu/hoa | resonance / arcane / hoa1 / hoa2 | 1:role_phepLan (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_nguHanhAn (5) / 4:dbl_phapSu_hoa (10) / 5:role_thienDiaCong (15) / 6:element_noHoaThieuThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | phapSu/tho | resonance / arcane / tho1 / tho2 | 1:role_phepLan (1) / 2:element_hauThoTichLuong (1) / 3:role_nguHanhAn (5) / 4:dbl_phapSu_tho (10) / 5:role_thienDiaCong (15) / 6:element_thachGiap (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | phapSu/loi | resonance / arcane / loi1 / loi2 | 1:role_phepLan (1) / 2:element_loiTruGiangThe (1) / 3:role_nguHanhAn (5) / 4:dbl_phapSu_loi (10) / 5:role_thienDiaCong (15) / 6:element_tinhDienHoThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | phapSu/phong | resonance / arcane / phong1 / phong2 | 1:role_phepLan (1) / 2:element_phongQuyenTanVan (1) / 3:role_nguHanhAn (5) / 4:dbl_phapSu_phong (10) / 5:role_thienDiaCong (15) / 6:element_thanhPhongTuKhi (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | binhLinh/kim | retaliation / guardian / kim1 / kim2 | 1:role_thuThanh (1) / 2:element_luyenKimThanhKiem (1) / 3:role_tuongKhien (5) / 4:dbl_binhLinh_kim (10) / 5:role_phanKich (15) / 6:element_kimYNgungThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | binhLinh/moc | retaliation / guardian / moc1 / moc2 | 1:role_thuThanh (1) / 2:element_lucDiepPhong (1) / 3:role_tuongKhien (5) / 4:dbl_binhLinh_moc (10) / 5:role_phanKich (15) / 6:element_linhMocHoiSinh (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | binhLinh/thuy | retaliation / guardian / thuy1 / thuy2 | 1:role_thuThanh (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_tuongKhien (5) / 4:dbl_binhLinh_thuy (10) / 5:role_phanKich (15) / 6:element_thanhLuuTayTran (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | binhLinh/hoa | retaliation / guardian / hoa1 / hoa2 | 1:role_thuThanh (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_tuongKhien (5) / 4:dbl_binhLinh_hoa (10) / 5:role_phanKich (15) / 6:element_noHoaThieuThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | binhLinh/tho | retaliation / guardian / tho1 / tho2 | 1:role_thuThanh (1) / 2:element_hauThoTichLuong (1) / 3:role_tuongKhien (5) / 4:dbl_binhLinh_tho (10) / 5:role_phanKich (15) / 6:element_thachGiap (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | binhLinh/loi | retaliation / guardian / loi1 / loi2 | 1:role_thuThanh (1) / 2:element_loiTruGiangThe (1) / 3:role_tuongKhien (5) / 4:dbl_binhLinh_loi (10) / 5:role_phanKich (15) / 6:element_tinhDienHoThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | binhLinh/phong | retaliation / guardian / phong1 / phong2 | 1:role_thuThanh (1) / 2:element_phongQuyenTanVan (1) / 3:role_tuongKhien (5) / 4:dbl_binhLinh_phong (10) / 5:role_phanKich (15) / 6:element_thanhPhongTuKhi (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | ySu/kim | renewal / medic / kim1 / kim2 | 1:role_linhDuoc (1) / 2:element_luyenKimThanhKiem (1) / 3:role_duongSinh (5) / 4:dbl_ySu_kim (10) / 5:role_teDo (15) / 6:element_kimYNgungThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | ySu/moc | renewal / medic / moc1 / moc2 | 1:role_linhDuoc (1) / 2:element_lucDiepPhong (1) / 3:role_duongSinh (5) / 4:dbl_ySu_moc (10) / 5:role_teDo (15) / 6:element_linhMocHoiSinh (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | ySu/thuy | renewal / medic / thuy1 / thuy2 | 1:role_linhDuoc (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_duongSinh (5) / 4:dbl_ySu_thuy (10) / 5:role_teDo (15) / 6:element_thanhLuuTayTran (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | ySu/hoa | renewal / medic / hoa1 / hoa2 | 1:role_linhDuoc (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_duongSinh (5) / 4:dbl_ySu_hoa (10) / 5:role_teDo (15) / 6:element_noHoaThieuThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | ySu/tho | renewal / medic / tho1 / tho2 | 1:role_linhDuoc (1) / 2:element_hauThoTichLuong (1) / 3:role_duongSinh (5) / 4:dbl_ySu_tho (10) / 5:role_teDo (15) / 6:element_thachGiap (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | ySu/loi | renewal / medic / loi1 / loi2 | 1:role_linhDuoc (1) / 2:element_loiTruGiangThe (1) / 3:role_duongSinh (5) / 4:dbl_ySu_loi (10) / 5:role_teDo (15) / 6:element_tinhDienHoThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | ySu/phong | renewal / medic / phong1 / phong2 | 1:role_linhDuoc (1) / 2:element_phongQuyenTanVan (1) / 3:role_duongSinh (5) / 4:dbl_ySu_phong (10) / 5:role_teDo (15) / 6:element_thanhPhongTuKhi (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | muuSi/kim | interdiction / strategist / kim1 / kim2 | 1:role_muaChuoc (1) / 2:element_luyenKimThanhKiem (1) / 3:role_lyGian (5) / 4:dbl_muuSi_kim (10) / 5:role_catQuanLuong (15) / 6:element_kimYNgungThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | muuSi/moc | interdiction / strategist / moc1 / moc2 | 1:role_muaChuoc (1) / 2:element_lucDiepPhong (1) / 3:role_lyGian (5) / 4:dbl_muuSi_moc (10) / 5:role_catQuanLuong (15) / 6:element_linhMocHoiSinh (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | muuSi/thuy | interdiction / strategist / thuy1 / thuy2 | 1:role_muaChuoc (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_lyGian (5) / 4:dbl_muuSi_thuy (10) / 5:role_catQuanLuong (15) / 6:element_thanhLuuTayTran (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | muuSi/hoa | interdiction / strategist / hoa1 / hoa2 | 1:role_muaChuoc (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_lyGian (5) / 4:dbl_muuSi_hoa (10) / 5:role_catQuanLuong (15) / 6:element_noHoaThieuThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | muuSi/tho | interdiction / strategist / tho1 / tho2 | 1:role_muaChuoc (1) / 2:element_hauThoTichLuong (1) / 3:role_lyGian (5) / 4:dbl_muuSi_tho (10) / 5:role_catQuanLuong (15) / 6:element_thachGiap (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | muuSi/loi | interdiction / strategist / loi1 / loi2 | 1:role_muaChuoc (1) / 2:element_loiTruGiangThe (1) / 3:role_lyGian (5) / 4:dbl_muuSi_loi (10) / 5:role_catQuanLuong (15) / 6:element_tinhDienHoThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | muuSi/phong | interdiction / strategist / phong1 / phong2 | 1:role_muaChuoc (1) / 2:element_phongQuyenTanVan (1) / 3:role_lyGian (5) / 4:dbl_muuSi_phong (10) / 5:role_catQuanLuong (15) / 6:element_thanhPhongTuKhi (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | quanSu/kim | coordination / commander / kim1 / kim2 | 1:role_nghiBinh (1) / 2:element_luyenKimThanhKiem (1) / 3:role_hieuLenh (5) / 4:dbl_quanSu_kim (10) / 5:role_phaKe (15) / 6:element_kimYNgungThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | quanSu/moc | coordination / commander / moc1 / moc2 | 1:role_nghiBinh (1) / 2:element_lucDiepPhong (1) / 3:role_hieuLenh (5) / 4:dbl_quanSu_moc (10) / 5:role_phaKe (15) / 6:element_linhMocHoiSinh (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | quanSu/thuy | coordination / commander / thuy1 / thuy2 | 1:role_nghiBinh (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_hieuLenh (5) / 4:dbl_quanSu_thuy (10) / 5:role_phaKe (15) / 6:element_thanhLuuTayTran (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | quanSu/hoa | coordination / commander / hoa1 / hoa2 | 1:role_nghiBinh (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_hieuLenh (5) / 4:dbl_quanSu_hoa (10) / 5:role_phaKe (15) / 6:element_noHoaThieuThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | quanSu/tho | coordination / commander / tho1 / tho2 | 1:role_nghiBinh (1) / 2:element_hauThoTichLuong (1) / 3:role_hieuLenh (5) / 4:dbl_quanSu_tho (10) / 5:role_phaKe (15) / 6:element_thachGiap (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | quanSu/loi | coordination / commander / loi1 / loi2 | 1:role_nghiBinh (1) / 2:element_loiTruGiangThe (1) / 3:role_hieuLenh (5) / 4:dbl_quanSu_loi (10) / 5:role_phaKe (15) / 6:element_tinhDienHoThan (20) |
| Đinh Bộ Lĩnh (dinhBoLinh) | quanSu/phong | coordination / commander / phong1 / phong2 | 1:role_nghiBinh (1) / 2:element_phongQuyenTanVan (1) / 3:role_hieuLenh (5) / 4:dbl_quanSu_phong (10) / 5:role_phaKe (15) / 6:element_thanhPhongTuKhi (20) |
| Hà Vân (haVan) | phapSu/hoa | resonance / arcane / hoa1 / hoa2 | 1:role_phepLan (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_nguHanhAn (5) / 4:hoaVuLieuNguyen (10) / 5:role_thienDiaCong (15) / 6:element_noHoaThieuThan (20) |
| Lê Thạch (leThach) | binhLinh/tho | retaliation / guardian / tho1 / tho2 | 1:role_thuThanh (1) / 2:element_hauThoTichLuong (1) / 3:role_tuongKhien (5) / 4:tranSonHoQuan (10) / 5:role_phanKich (15) / 6:element_thachGiap (20) |
| Mai Thanh (maiThanh) | ySu/thuy | renewal / medic / thuy1 / thuy2 | 1:role_linhDuoc (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_duongSinh (5) / 4:camLoHoiXuan (10) / 5:role_teDo (15) / 6:element_thanhLuuTayTran (20) |
| Tô Kim (toKim) | muuSi/kim | interdiction / strategist / kim1 / kim2 | 1:role_muaChuoc (1) / 2:element_luyenKimThanhKiem (1) / 3:role_lyGian (5) / 4:kimNganLyTan (10) / 5:role_catQuanLuong (15) / 6:element_kimYNgungThan (20) |
| Phùng Phong (phungPhong) | quanSu/phong | coordination / commander / phong1 / phong2 | 1:role_nghiBinh (1) / 2:element_phongQuyenTanVan (1) / 3:role_hieuLenh (5) / 4:phongVanBienTran (10) / 5:role_phaKe (15) / 6:element_thanhPhongTuKhi (20) |
| Trần Cương (tranCuong) | tuongSi/kim | pursuit / martial / kim1 / kim2 | 1:role_tramKich (1) / 2:element_luyenKimThanhKiem (1) / 3:role_phaTran (5) / 4:kimQuaThietMa (10) / 5:role_doatMenh (15) / 6:element_kimYNgungThan (20) |
| Lý Liệt (lyLiet) | tuongSi/hoa | pursuit / martial / hoa1 / hoa2 | 1:role_tramKich (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_phaTran (5) / 4:xichHoaDoatKy (10) / 5:role_doatMenh (15) / 6:element_noHoaThieuThan (20) |
| Đào Lam (daoLam) | phapSu/thuy | resonance / arcane / thuy1 / thuy2 | 1:role_phepLan (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_nguHanhAn (5) / 4:bangHaPhongToa (10) / 5:role_thienDiaCong (15) / 6:element_thanhLuuTayTran (20) |
| Vũ Lôi (vuLoi) | phapSu/loi | resonance / arcane / loi1 / loi2 | 1:role_phepLan (1) / 2:element_loiTruGiangThe (1) / 3:role_nguHanhAn (5) / 4:thienLoiGiangThe (10) / 5:role_thienDiaCong (15) / 6:element_tinhDienHoThan (20) |
| Hoàng Mộc (hoangMoc) | binhLinh/moc | retaliation / guardian / moc1 / moc2 | 1:role_thuThanh (1) / 2:element_lucDiepPhong (1) / 3:role_tuongKhien (5) / 4:reGiaGiuThanh (10) / 5:role_phanKich (15) / 6:element_linhMocHoiSinh (20) |
| Cao Kiên (caoKien) | binhLinh/kim | retaliation / guardian / kim1 / kim2 | 1:role_thuThanh (1) / 2:element_luyenKimThanhKiem (1) / 3:role_tuongKhien (5) / 4:thietBichDongThanh (10) / 5:role_phanKich (15) / 6:element_kimYNgungThan (20) |
| Lục Diệp (lucDiep) | ySu/moc | renewal / medic / moc1 / moc2 | 1:role_linhDuoc (1) / 2:element_lucDiepPhong (1) / 3:role_duongSinh (5) / 4:xuanMocVanSinh (10) / 5:role_teDo (15) / 6:element_linhMocHoiSinh (20) |
| Bạch Sương (bachSuong) | ySu/phong | renewal / medic / phong1 / phong2 | 1:role_linhDuoc (1) / 2:element_phongQuyenTanVan (1) / 3:role_duongSinh (5) / 4:gioLanhTayUe (10) / 5:role_teDo (15) / 6:element_thanhPhongTuKhi (20) |
| Ninh Hỏa (ninhHoa) | muuSi/hoa | interdiction / strategist / hoa1 / hoa2 | 1:role_muaChuoc (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_lyGian (5) / 4:hoaThieuKhoLuong (10) / 5:role_catQuanLuong (15) / 6:element_noHoaThieuThan (20) |
| Quách Ẩn (quachAn) | muuSi/thuy | interdiction / strategist / thuy1 / thuy2 | 1:role_muaChuoc (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_lyGian (5) / 4:thuyDonLyGian (10) / 5:role_catQuanLuong (15) / 6:element_thanhLuuTayTran (20) |
| Tạ Thạch (taThach) | quanSu/tho | coordination / commander / tho1 / tho2 | 1:role_nghiBinh (1) / 2:element_hauThoTichLuong (1) / 3:role_hieuLenh (5) / 4:batTranThachLuy (10) / 5:role_phaKe (15) / 6:element_thachGiap (20) |
| Mạc Vân (macVan) | quanSu/loi | coordination / commander / loi1 / loi2 | 1:role_nghiBinh (1) / 2:element_loiTruGiangThe (1) / 3:role_hieuLenh (5) / 4:loiTranKinhHon (10) / 5:role_phaKe (15) / 6:element_tinhDienHoThan (20) |
| Lâm Tùng (lamTung) | tuongSi/moc | pursuit / martial / moc1 / moc2 | 1:role_tramKich (1) / 2:element_lucDiepPhong (1) / 3:role_phaTran (5) / 4:trucLamPhaTran (10) / 5:role_doatMenh (15) / 6:element_linhMocHoiSinh (20) |
| Hồ Lãng (hoLang) | tuongSi/thuy | pursuit / martial / thuy1 / thuy2 | 1:role_tramKich (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_phaTran (5) / 4:langDaoTram (10) / 5:role_doatMenh (15) / 6:element_thanhLuuTayTran (20) |
| Kha Sơn (khaSon) | tuongSi/tho | pursuit / martial / tho1 / tho2 | 1:role_tramKich (1) / 2:element_hauThoTichLuong (1) / 3:role_phaTran (5) / 4:sonHaTranKich (10) / 5:role_doatMenh (15) / 6:element_thachGiap (20) |
| Tống Tấn (tongTan) | tuongSi/loi | pursuit / martial / loi1 / loi2 | 1:role_tramKich (1) / 2:element_loiTruGiangThe (1) / 3:role_phaTran (5) / 4:loiDaoLienTram (10) / 5:role_doatMenh (15) / 6:element_tinhDienHoThan (20) |
| Hứa Lăng (huaLang) | tuongSi/phong | pursuit / martial / phong1 / phong2 | 1:role_tramKich (1) / 2:element_phongQuyenTanVan (1) / 3:role_phaTran (5) / 4:truyPhongDoatMenh (10) / 5:role_doatMenh (15) / 6:element_thanhPhongTuKhi (20) |
| Chu Ngân (chuNgan) | phapSu/kim | resonance / arcane / kim1 / kim2 | 1:role_phepLan (1) / 2:element_luyenKimThanhKiem (1) / 3:role_nguHanhAn (5) / 4:nganChamTanXa (10) / 5:role_thienDiaCong (15) / 6:element_kimYNgungThan (20) |
| Đàm Thảo (damThao) | phapSu/moc | resonance / arcane / moc1 / moc2 | 1:role_phepLan (1) / 2:element_lucDiepPhong (1) / 3:role_nguHanhAn (5) / 4:kinhCucTrienThan (10) / 5:role_thienDiaCong (15) / 6:element_linhMocHoiSinh (20) |
| Doãn Nham (doanNham) | phapSu/tho | resonance / arcane / tho1 / tho2 | 1:role_phepLan (1) / 2:element_hauThoTichLuong (1) / 3:role_nguHanhAn (5) / 4:diaMachBungPhat (10) / 5:role_thienDiaCong (15) / 6:element_thachGiap (20) |
| Liễu Yên (lieuYen) | phapSu/phong | resonance / arcane / phong1 / phong2 | 1:role_phepLan (1) / 2:element_phongQuyenTanVan (1) / 3:role_nguHanhAn (5) / 4:phongAnCuongLuu (10) / 5:role_thienDiaCong (15) / 6:element_thanhPhongTuKhi (20) |
| Thái Hà (thaiHa) | binhLinh/thuy | retaliation / guardian / thuy1 / thuy2 | 1:role_thuThanh (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_tuongKhien (5) / 4:thuyTraiLienHoan (10) / 5:role_phanKich (15) / 6:element_thanhLuuTayTran (20) |
| Trương Viêm (truongViem) | binhLinh/hoa | retaliation / guardian / hoa1 / hoa2 | 1:role_thuThanh (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_tuongKhien (5) / 4:viemGiapHoDoanh (10) / 5:role_phanKich (15) / 6:element_noHoaThieuThan (20) |
| Ông Chấn (ongChan) | binhLinh/loi | retaliation / guardian / loi1 / loi2 | 1:role_thuThanh (1) / 2:element_loiTruGiangThe (1) / 3:role_tuongKhien (5) / 4:chanLoiThietVe (10) / 5:role_phanKich (15) / 6:element_tinhDienHoThan (20) |
| Mạnh Tường (manhTuong) | binhLinh/phong | retaliation / guardian / phong1 / phong2 | 1:role_thuThanh (1) / 2:element_phongQuyenTanVan (1) / 3:role_tuongKhien (5) / 4:phongLuyHoKy (10) / 5:role_phanKich (15) / 6:element_thanhPhongTuKhi (20) |
| Châu Ngọc (chauNgoc) | ySu/kim | renewal / medic / kim1 / kim2 | 1:role_linhDuoc (1) / 2:element_luyenKimThanhKiem (1) / 3:role_duongSinh (5) / 4:kimChamDoMenh (10) / 5:role_teDo (15) / 6:element_kimYNgungThan (20) |
| Hồng Đan (hongDan) | ySu/hoa | renewal / medic / hoa1 / hoa2 | 1:role_linhDuoc (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_duongSinh (5) / 4:danHoaHoiNguyen (10) / 5:role_teDo (15) / 6:element_noHoaThieuThan (20) |
| Bế Liên (beLien) | ySu/tho | renewal / medic / tho1 / tho2 | 1:role_linhDuoc (1) / 2:element_hauThoTichLuong (1) / 3:role_duongSinh (5) / 4:hauThoDuongNguyen (10) / 5:role_teDo (15) / 6:element_thachGiap (20) |
| Tiêu Minh (tieuMinh) | ySu/loi | renewal / medic / loi1 / loi2 | 1:role_linhDuoc (1) / 2:element_loiTruGiangThe (1) / 3:role_duongSinh (5) / 4:loiChamKhoiTu (10) / 5:role_teDo (15) / 6:element_tinhDienHoThan (20) |
| Nhan Trúc (nhanTruc) | muuSi/moc | interdiction / strategist / moc1 / moc2 | 1:role_muaChuoc (1) / 2:element_lucDiepPhong (1) / 3:role_lyGian (5) / 4:trucDocMeHon (10) / 5:role_catQuanLuong (15) / 6:element_linhMocHoiSinh (20) |
| Mã Nhạc (maNhac) | muuSi/tho | interdiction / strategist / tho1 / tho2 | 1:role_muaChuoc (1) / 2:element_hauThoTichLuong (1) / 3:role_lyGian (5) / 4:doanDaoTuyetLuong (10) / 5:role_catQuanLuong (15) / 6:element_thachGiap (20) |
| Từ Kinh (tuKinh) | muuSi/loi | interdiction / strategist / loi1 / loi2 | 1:role_muaChuoc (1) / 2:element_loiTruGiangThe (1) / 3:role_lyGian (5) / 4:kinhLoiDoatKhi (10) / 5:role_catQuanLuong (15) / 6:element_tinhDienHoThan (20) |
| Bùi Phiêu (buiPhieu) | muuSi/phong | interdiction / strategist / phong1 / phong2 | 1:role_muaChuoc (1) / 2:element_phongQuyenTanVan (1) / 3:role_lyGian (5) / 4:phieuPhongLyGian (10) / 5:role_catQuanLuong (15) / 6:element_thanhPhongTuKhi (20) |
| Nghiêm Thiết (nghiemThiet) | quanSu/kim | coordination / commander / kim1 / kim2 | 1:role_nghiBinh (1) / 2:element_luyenKimThanhKiem (1) / 3:role_hieuLenh (5) / 4:thietTranPhaGiap (10) / 5:role_phaKe (15) / 6:element_kimYNgungThan (20) |
| Sầm Tuệ (samTue) | quanSu/moc | coordination / commander / moc1 / moc2 | 1:role_nghiBinh (1) / 2:element_lucDiepPhong (1) / 3:role_hieuLenh (5) / 4:thanhLamBayTran (10) / 5:role_phaKe (15) / 6:element_linhMocHoiSinh (20) |
| Vi Triều (viTrieu) | quanSu/thuy | coordination / commander / thuy1 / thuy2 | 1:role_nghiBinh (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_hieuLenh (5) / 4:trieuDangVayThanh (10) / 5:role_phaKe (15) / 6:element_thanhLuuTayTran (20) |
| Tôn Diệm (tonDiem) | quanSu/hoa | coordination / commander / hoa1 / hoa2 | 1:role_nghiBinh (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_hieuLenh (5) / 4:hoaCongLienKe (10) / 5:role_phaKe (15) / 6:element_noHoaThieuThan (20) |
| Nguyễn Bặc (nguyenBac) | tuongSi/hoa | pursuit / martial / hoa1 / hoa2 | 1:role_tramKich (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_phaTran (5) / 4:dinhQuocHoaKy (10) / 5:role_doatMenh (15) / 6:element_noHoaThieuThan (20) |
| Đinh Điền (dinhDien) | binhLinh/tho | retaliation / guardian / tho1 / tho2 | 1:role_thuThanh (1) / 2:element_hauThoTichLuong (1) / 3:role_tuongKhien (5) / 4:ngoaiGiapHoQuan (10) / 5:role_phanKich (15) / 6:element_thachGiap (20) |
| Lưu Cơ (luuCo) | muuSi/kim | interdiction / strategist / kim1 / kim2 | 1:role_muaChuoc (1) / 2:element_luyenKimThanhKiem (1) / 3:role_lyGian (5) / 4:doHoPhuLenh (10) / 5:role_catQuanLuong (15) / 6:element_kimYNgungThan (20) |
| Trịnh Tú (trinhTu) | ySu/moc | renewal / medic / moc1 / moc2 | 1:role_linhDuoc (1) / 2:element_lucDiepPhong (1) / 3:role_duongSinh (5) / 4:hoaLuThaoDuoc (10) / 5:role_teDo (15) / 6:element_linhMocHoiSinh (20) |
| Lê Hoàn (leHoan) | quanSu/loi | coordination / commander / loi1 / loi2 | 1:role_nghiBinh (1) / 2:element_loiTruGiangThe (1) / 3:role_hieuLenh (5) / 4:thapDaoLoiBinh (10) / 5:role_phaKe (15) / 6:element_tinhDienHoThan (20) |
| Đinh Liễn (dinhLien) | phapSu/thuy | resonance / arcane / thuy1 / thuy2 | 1:role_phepLan (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_nguHanhAn (5) / 4:namVietVuongAn (10) / 5:role_thienDiaCong (15) / 6:element_thanhLuuTayTran (20) |
| Trần Lãm (tranLam) | quanSu/thuy | coordination / commander / thuy1 / thuy2 | 1:role_nghiBinh (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_hieuLenh (5) / 4:boHaiTranGiang (10) / 5:role_phaKe (15) / 6:element_thanhLuuTayTran (20) |
| Phạm Bạch Hổ (phamBachHo) | tuongSi/hoa | pursuit / martial / hoa1 / hoa2 | 1:role_tramKich (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_phaTran (5) / 4:bachHoXuatSon (10) / 5:role_doatMenh (15) / 6:element_noHoaThieuThan (20) |
| Ngô Xương Xí (ngoXuongXi) | muuSi/kim | interdiction / strategist / kim1 / kim2 | 1:role_muaChuoc (1) / 2:element_luyenKimThanhKiem (1) / 3:role_lyGian (5) / 4:ngoGiaDiMuu (10) / 5:role_catQuanLuong (15) / 6:element_kimYNgungThan (20) |
| Ngô Nhật Khánh (ngoNhatKhanh) | quanSu/phong | coordination / commander / phong1 / phong2 | 1:role_nghiBinh (1) / 2:element_phongQuyenTanVan (1) / 3:role_hieuLenh (5) / 4:duongLamPhongKhoi (10) / 5:role_phaKe (15) / 6:element_thanhPhongTuKhi (20) |
| Nguyễn Khoan (nguyenKhoan) | binhLinh/tho | retaliation / guardian / tho1 / tho2 | 1:role_thuThanh (1) / 2:element_hauThoTichLuong (1) / 3:role_tuongKhien (5) / 4:tamDaiKienThanh (10) / 5:role_phanKich (15) / 6:element_thachGiap (20) |
| Kiều Công Hãn (kieuCongHan) | phapSu/loi | resonance / arcane / loi1 / loi2 | 1:role_phepLan (1) / 2:element_loiTruGiangThe (1) / 3:role_nguHanhAn (5) / 4:phongChauLoiKich (10) / 5:role_thienDiaCong (15) / 6:element_tinhDienHoThan (20) |
| Kiều Thuận (kieuThuan) | ySu/moc | renewal / medic / moc1 / moc2 | 1:role_linhDuoc (1) / 2:element_lucDiepPhong (1) / 3:role_duongSinh (5) / 4:hoiHoSinhKhi (10) / 5:role_teDo (15) / 6:element_linhMocHoiSinh (20) |
| Lý Khuê (lyKhue) | tuongSi/kim | pursuit / martial / kim1 / kim2 | 1:role_tramKich (1) / 2:element_luyenKimThanhKiem (1) / 3:role_phaTran (5) / 4:sieuLoaiPhaGiap (10) / 5:role_doatMenh (15) / 6:element_kimYNgungThan (20) |
| Nguyễn Thủ Tiệp (nguyenThuTiep) | muuSi/thuy | interdiction / strategist / thuy1 / thuy2 | 1:role_muaChuoc (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_lyGian (5) / 4:tienDuDoatLuong (10) / 5:role_catQuanLuong (15) / 6:element_thanhLuuTayTran (20) |
| Lữ Đường (luDuong) | phapSu/thuy | resonance / arcane / thuy1 / thuy2 | 1:role_phepLan (1) / 2:element_thuyNguyetTuLinh (1) / 3:role_nguHanhAn (5) / 4:teGiangThuyTran (10) / 5:role_thienDiaCong (15) / 6:element_thanhLuuTayTran (20) |
| Nguyễn Siêu (nguyenSieu) | binhLinh/hoa | retaliation / guardian / hoa1 / hoa2 | 1:role_thuThanh (1) / 2:element_phongHoaThieuDoanh (1) / 3:role_tuongKhien (5) / 4:phuLietHoaLuy (10) / 5:role_phanKich (15) / 6:element_noHoaThieuThan (20) |
| Đỗ Cảnh Thạc (doCanhThac) | tuongSi/tho | pursuit / martial / tho1 / tho2 | 1:role_tramKich (1) / 2:element_hauThoTichLuong (1) / 3:role_phaTran (5) / 4:doDongKienTam (10) / 5:role_doatMenh (15) / 6:element_thachGiap (20) |

## Preset đối thủ PvE

Chỉ liệt kê các chiêu thực sự mở theo cấp màn; không gán sáu ô người chơi cho tùy tướng legacy. Các chế độ tháp/sinh tồn/ngày tái dùng builder theo luật hiện hành.

| Màn | Nhân vật | Bốn bị động | Chủ động thực mang |
|---|---|---|---|
| coLau | coLau-tre | retaliation / guardian / tho1 / tho2 | thuThanh@1 |
| boHai | tranLam | coordination / commander / thuy1 / thuy2 | thuyNguyetTuLinh@2 / thanhLuuTayTran@1 / boHaiTranGiang@2 |
| dangChau | phamBachHo | pursuit / martial / hoa1 / hoa2 | phongHoaThieuDoanh@2 / noHoaThieuThan@2 / bachHoXuatSon@2 |
| binhKieu | ngoXuongXi | interdiction / strategist / kim1 / kim2 | luyenKimThanhKiem@3 / kimYNgungThan@2 / doanKimNhatTuyen@2 / ngoGiaDiMuu@3 |
| binhKieu | binhKieu-pho | retaliation / guardian / kim1 / kim2 | thuThanh@2 / tuongKhien@1 |
| binhKieu | binhKieu-y | renewal / medic / thuy1 / thuy2 | linhDuoc@2 / teDo@1 |
| duongLam | ngoNhatKhanh | coordination / commander / phong1 / phong2 | phongQuyenTanVan@3 / thanhPhongTuKhi@3 / phongNhanLietKhong@2 / duongLamPhongKhoi@3 |
| duongLam | duongLam-pho | pursuit / martial / tho1 / tho2 | tramKich@2 / hieuLenh@2 |
| duongLam | duongLam-y | renewal / medic / moc1 / moc2 | linhDuoc@2 / duongSinh@2 |
| tamDai | nguyenKhoan | retaliation / guardian / tho1 / tho2 | hauThoTichLuong@3 / thachGiap@3 / sonBangDiaLiet@3 / tamDaiKienThanh@3 |
| tamDai | tamDai-pho | retaliation / guardian / tho1 / tho2 | thuThanh@3 / phanKich@3 |
| tamDai | tamDai-phap | resonance / arcane / hoa1 / hoa2 | phepCong@3 / phepLan@2 |
| phongChau | kieuCongHan | resonance / arcane / loi1 / loi2 | loiTruGiangThe@4 / tinhDienHoThan@3 / loiTienXuyenVan@3 / phongChauLoiKich@4 |
| phongChau | phongChau-pho | retaliation / guardian / tho1 / tho2 | thuThanh@3 / phanKich@3 |
| phongChau | phongChau-muu | interdiction / strategist / phong1 / phong2 | muaChuoc@3 / lyGian@3 |
| hoiHo | kieuThuan | renewal / medic / moc1 / moc2 | lucDiepPhong@3 / linhMocHoiSinh@3 / thanhMocHoPhap@3 / cuongVuThienDiep@3 / hoiHoSinhKhi@3 |
| hoiHo | hoiHo-pho | retaliation / guardian / thuy1 / thuy2 | thuThanh@3 / tuongKhien@3 |
| hoiHo | hoiHo-phap | resonance / arcane / moc1 / moc2 | phepCong@3 / nguHanhAn@3 |
| sieuLoai | lyKhue | pursuit / martial / kim1 / kim2 | luyenKimThanhKiem@4 / kimYNgungThan@3 / doanKimNhatTuyen@3 / thietKyTungHoanh@3 / sieuLoaiPhaGiap@4 |
| sieuLoai | sieuLoai-pho | retaliation / guardian / kim1 / kim2 | thuThanh@4 / phanKich@3 |
| sieuLoai | sieuLoai-quan | coordination / commander / tho1 / tho2 | nghiBinh@4 / bayTran@3 |
| tienDu | nguyenThuTiep | interdiction / strategist / thuy1 / thuy2 | thuyNguyetTuLinh@4 / thanhLuuTayTran@4 / hanBangTien@3 / bachDangTrieuDang@3 / tienDuDoatLuong@4 |
| tienDu | tienDu-pho | pursuit / martial / thuy1 / thuy2 | tramKich@4 / phaTran@3 |
| tienDu | tienDu-y | renewal / medic / moc1 / moc2 | linhDuoc@4 / teDo@3 |
| teGiang | luDuong | resonance / arcane / thuy1 / thuy2 | thuyNguyetTuLinh@4 / thanhLuuTayTran@4 / hanBangTien@3 / bachDangTrieuDang@3 / linhThuyHoMenh@3 / teGiangThuyTran@4 |
| teGiang | teGiang-pho | retaliation / guardian / thuy1 / thuy2 | thuThanh@4 / phanKich@4 |
| teGiang | teGiang-quan | coordination / commander / phong1 / phong2 | nghiBinh@4 / bayTran@4 |
| tayPhuLiet | nguyenSieu | retaliation / guardian / hoa1 / hoa2 | phongHoaThieuDoanh@4 / noHoaThieuThan@4 / xichDiemTien@4 / hoaThieuLienTrai@3 / ducHoaTrungSinh@3 / phuLietHoaLuy@4 |
| tayPhuLiet | tayPhuLiet-pho | pursuit / martial / hoa1 / hoa2 | tramKich@5 / phaTran@4 |
| tayPhuLiet | tayPhuLiet-muu | interdiction / strategist / loi1 / loi2 | muaChuoc@5 / catQuanLuong@4 |
| doDong | doCanhThac | pursuit / martial / tho1 / tho2 | hauThoTichLuong@4 / thachGiap@4 / sonBangDiaLiet@4 / diaChanTamQuan@3 / doDongKienTam@4 / kienThanhBatDong@3 |
| doDong | doDong-pho | retaliation / guardian / kim1 / kim2 | thuThanh@5 / phanKich@5 |
| doDong | doDong-quan | coordination / commander / thuy1 / thuy2 | nghiBinh@5 / bayTran@4 |
