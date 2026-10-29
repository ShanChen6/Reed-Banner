# Kỹ năng theo nghề, hệ và nhân vật

> Trạng thái: **SUPERSEDED** — thay bởi [Kỹ năng hiện hành](../README.md) (qua [21](21-combo-dong-doi.md)). Giữ để truy vết quyết định, không dùng làm luật hiện hành.

> Cập nhật tiếp theo: [kỹ năng phiên bản 2 và combo đồng đội](21-combo-dong-doi.md). Layout mới đổi tuyệt chiêu sang ô 4, nghề nâng cao sang ô 5, có chuyển hồ sơ giữ điểm. Các định nghĩa legacy/lịch sử bên dưới cần đọc cùng tài liệu phiên bản 2.

> Thiết kế triển khai 22/10/2026. Số liệu khởi đầu, chưa kết luận cân bằng.
> Tài liệu này thay khung 6 chiêu hệ cũ ở 06, 12 và 14 cho nhân vật chơi được.

> Thông số lịch sử ở bảng dưới: giá `role_thuThanh` hiện hành được cập nhật tại [thiết kế23](../README.md).

## Khung và nguồn dữ liệu

Một hàm `characterSkills(profession, element, characterId)` lắp danh sách; `buildMain` / `buildCompanion` lọc theo tiến trình và áp cấp kỹ năng. Không tạo 42 bộ riêng.

| Ô ổn định | Nguồn | Mở cấp | Hiển thị |
|---|---|---|---|
| 1 | Nghề cơ bản | 1 | 1 |
| 2 | Hệ, bàn cờ | 1 | 2 |
| 3 | Nghề, vai trò chính | 5 | 3 |
| 5 | Nhân vật | 10 | 4 |
| 4 | Nghề, chiến thuật | 15 | 5 |
| 6 | Hệ, bổ trợ | 20 | 6 |

Nguồn nghề được xác định bằng `profession`, hệ bằng `element`, riêng bằng `character`; tuyệt chiêu mặc định của Đinh Bộ Lĩnh là ô 5 theo hệ. Nội tại nghề và bị động Nộ thủ lĩnh giữ nguyên.

## 18 chiêu nghề

Bảng ghi thứ tự thực thi; % Công là ATK người tung, % máu là máu tối đa người nhận. Mọi chiêu nghề mới có ID riêng với tiền tố `role_`, tận dụng tên và cơ chế cũ nhưng không thay dữ liệu chiêu nghề AI. Không tự cộng dấu ấn vào chiêu nghề mới, trừ bước Ngũ hành ấn ghi rõ: tránh nghề nào cũng hồi phục/Khiên hoặc khống chế nhờ hệ, khiến hai chiêu hệ mất ý nghĩa.

| Nghề / ô | ID / tên | Năng lượng / mục tiêu | Các bước cấp 1 |
|---|---|---|---|
| Tướng sĩ / 1 | role_tramKich / Trảm kích | 30 / địch đơn | 210% Công |
| Tướng sĩ / 3 | role_phaTran / Phá trận | 45 / địch đơn | 250% Công, bỏ 30% DEF; Thủ −30% 2 lượt |
| Tướng sĩ / 4 | role_doatMenh / Đoạt mệnh | 60 / địch đơn | 260% Công; ×1.5 khi mục tiêu còn ≤35% máu trước đòn |
| Pháp sư / 1 | role_phepLan / Phép lan | 30 / mọi địch | 90% Công |
| Pháp sư / 3 | role_nguHanhAn / Ngũ hành ấn | 45 / địch đơn | 140% Công; dấu ấn hệ cường hóa chắc chắn |
| Pháp sư / 4 | role_thienDiaCong / Thiên địa cộng hưởng | 60 / mọi địch | 110% Công; phá vùng 3×3 |
| Binh lính / 1 | role_thuThanh / Thủ thành | 30 / bản thân | Khiêu khích 2 lượt; Khiên 20% máu |
| Binh lính / 3 | role_tuongKhien / Tường khiên | 45 / đội | Khiên 15% máu mỗi người |
| Binh lính / 4 | role_phanKich / Phản kích | 55 / bản thân | Phản đòn 40%, Thủ +30%, Khiêu khích: đều 2 lượt |
| Y sư / 1 | role_linhDuoc / Linh dược | 30 / đồng minh đơn | Hồi 22% máu; Thanh tẩy |
| Y sư / 3 | role_duongSinh / Dưỡng sinh | 45 / đội | Hồi phục 7% máu mỗi lượt, 3 lượt |
| Y sư / 4 | role_teDo / Tế độ | 55 / đội | Hồi 15% máu; Thanh tẩy |
| Mưu sĩ / 1 | role_muaChuoc / Mua chuộc | 30 / địch đơn | −40 năng lượng |
| Mưu sĩ / 3 | role_lyGian / Ly gián | 45 / địch đơn | Câm lặng 2 lượt |
| Mưu sĩ / 4 | role_catQuanLuong / Cắt quân lương | 55 / mọi địch | −15 lương phe địch; −10 năng lượng mỗi người |
| Quân sư / 1 | role_nghiBinh / Nghi binh | 30 / địch đơn | Công −30% 2 lượt |
| Quân sư / 3 | role_hieuLenh / Hiệu lệnh | 45 / đội | Công +25% 2 lượt |
| Quân sư / 4 | role_phaKe / Phá kế | 55 / mọi địch | Xua tan hiệu ứng có lợi |

Hiệu lệnh chuyển từ Tướng sĩ sang Quân sư. Phá trận giảm 300% → 250%, thêm xuyên DEF để dành khoảng trống cho Đoạt mệnh. Pháp sư có AoE ngay cấp 1; Ngũ hành ấn giữ bản sắc hiệu ứng hệ; Thiên địa cộng hưởng là chiêu phá bàn cờ mạnh có giá 60. Binh lính dùng Khiêu khích để chuyển đòn khỏi đồng đội, không thêm luật bảo vệ mới.

## 14 chiêu hệ

ID tiền tố `element_` tách khỏi dữ liệu hệ cũ của AI chiến dịch; tên chiêu tận dụng bản cũ. Ô 2 bàn cờ, ô 6 bổ trợ.

| Hệ / ô | ID / tên | Giá / mục tiêu | Các bước cấp 1 |
|---|---|---|---|
| Kim / 2 | element_luyenKimThanhKiem / Luyện Kim Thành Kiếm | 20 / mình | Biến 4 ô thường ngẫu nhiên thành kiếm |
| Kim / 6 | element_kimYNgungThan / Kim Ý Ngưng Thần | 35 / địch đơn | 130% Công, bỏ 50% DEF; không xuyên Khiên |
| Mộc / 2 | element_lucDiepPhong / Lục Diệp Phong | 35 / mình | Phá 5 ô ngẫu nhiên |
| Mộc / 6 | element_linhMocHoiSinh / Linh Mộc Hồi Sinh | 30 / mình | Hồi 11% máu; biến 3 ô thường thành tim |
| Thủy / 2 | element_thuyNguyetTuLinh / Thủy Nguyệt Tụ Linh | 20 / mình | Biến 5 ô thường thành âm dương |
| Thủy / 6 | element_thanhLuuTayTran / Thanh Lưu Tẩy Trần | 30 / mình | Thanh tẩy; hồi 10% máu |
| Hỏa / 2 | element_phongHoaThieuDoanh / Phóng Hỏa Thiêu Doanh | 35 / mình | Phá vùng 3×3 chọn tâm |
| Hỏa / 6 | element_noHoaThieuThan / Nộ Hỏa Thiêu Thân | 30 / mình | Công +35%, Thủ −15%: 2 lượt |
| Thổ / 2 | element_hauThoTichLuong / Hậu Thổ Tích Lương | 20 / mình | Biến 5 ô thường thành lương |
| Thổ / 6 | element_thachGiap / Thạch Giáp | 30 / mình | Khiên 20% máu |
| Lôi / 2 | element_loiTruGiangThe / Lôi Trụ Giáng Thế | 40 / mình | Phá 1 cột chọn |
| Lôi / 6 | element_tinhDienHoThan / Tĩnh Điện Hộ Thân | 30 / địch đơn | −20 năng lượng; bản thân +10 năng lượng |
| Phong / 2 | element_phongQuyenTanVan / Phong Quyển Tàn Vân | 40 / mình | Xoay 8 ô quanh tâm, ±1 hoặc ±2 nấc |
| Phong / 6 | element_thanhPhongTuKhi / Thanh Phong Tụ Khí | 30 / đội | +10 năng lượng mỗi người; Thủ +10% cả đội 2 lượt |

Kim bổ trợ bằng một đòn xuyên giáp vừa phải, không thay Tướng sĩ; Lôi không thêm Câm lặng để giữ vai trò Mưu sĩ; Phong hỗ trợ nhịp đội nhưng không cho hành động thêm. Hồi/Thủ của hệ chỉ tác động nhỏ, phần lớn lên bản thân; không thay Y sư/Binh lính.

## Tuyệt chiêu và luật chung

Giữ nguyên toàn bộ 42 tuyệt chiêu tướng thường, 6 chiêu lịch sử, 12 chiêu sứ quân, cùng 7 tuyệt chiêu hệ mặc định của Đinh Bộ Lĩnh trong `skills.ts`; tên, giá, bước, hệ số, xác suất và vùng không đổi (danh sách đầy đủ ở 12 lịch sử §2–8 ô 5 và 14 §4–6). Chỉ mở ô 5 ở cấp 10. Chiêu riêng thay ô 5, không cộng chiêu thứ bảy.

Mỗi kỹ năng có cấp 1–5: mỗi cấp thêm 10% hệ số sát thương/hồi/Khiên/Công±/Thủ±/Hồi phục/Thiêu đốt/Phản đòn; cấp 5 giảm 10% giá, làm tròn xuống bội 5. Giá nâng 1,1,2,2. Không tăng xuyên giáp, ngưỡng kết liễu, thời lượng, xác suất, năng lượng, lương, số ô. Quy tắc này áp dụng cả 18+14 chiêu và tuyệt chiêu.

1vs1: mọi chiêu đội tác động bản thân, AoE sát thương ×1.5, Khiêu khích không chuyển đòn. 3vs3: đội/mọi địch gồm người còn sống, đơn mục tiêu chọn người còn sống; Khiêu khích chuyển sát thương đơn theo luật hiện hành. Thanh tẩy xóa hiệu ứng bất lợi; Xua tan chỉ xóa hiệu ứng có lợi. Khiên/Hồi phục làm mới theo luật không cộng dồn. Giữ tối đa một kỹ năng trước đổi ô mỗi lượt, Câm lặng, chi phí, Nộ, hiệu ứng bị động và giới hạn đóng băng hiện hành.

Thu hoạch do mọi kỹ năng phá/biến/xoay bàn cờ (kể cả cascade) chỉ 50% sát thương kiếm và năng lượng âm dương, không lượt thêm; loại ô khác giữ nguyên. Nội tại nghề vẫn tác động lên thu hoạch theo luật hiện hành; không coi hồi trực tiếp bằng chiêu là ghép tim. Ngũ hành ấn dùng bảng dấu ấn cường hóa ở 05; các chiêu nghề mới khác không có dấu ấn. Không thay chiêu nghề AI cũ.

## Ánh xạ cũ → mới và lưu trữ

| Ô lưu | Trước | Sau | Điểm nâng |
|---|---|---|---|
| o1 | Bàn cờ hệ | Nghề cơ bản | Giữ nguyên cấp kỹ năng |
| o2 | Hỗ trợ nhỏ hệ | Bàn cờ hệ | Giữ nguyên |
| o3 | Đòn hệ đơn | Nghề vai trò chính | Giữ nguyên |
| o4 | AoE hệ, cấp 10 | Nghề chiến thuật, cấp 15 | Giữ nguyên kể cả tạm khóa |
| o5 | Tuyệt chiêu cấp 20 | Tuyệt chiêu cấp 10 | Giữ nguyên, tự mở theo cấp |
| o6 | Hỗ trợ lớn hệ cấp 15 | Hệ bổ trợ cấp 20 | Giữ nguyên kể cả tạm khóa |

Ánh xạ ID của toàn bộ bộ hệ cũ (ô ghi là ô cũ):

| Hệ | Ô 1 cũ → ô 2 mới | Ô 2 cũ → ô 6 mới | Ô 3/4/6 cũ chỉ giữ cho AI chiến dịch | Ô 5 giữ nguyên |
|---|---|---|---|---|
| Kim | luyenKimThanhKiem → element_luyenKimThanhKiem | kimYNgungThan → element_kimYNgungThan (đổi tăng Công thành xuyên giáp) | doanKimNhatTuyen / thietKyTungHoanh / giapDongHoThe | kimAnPhaThien |
| Mộc | lucDiepPhong → element_lucDiepPhong | linhMocHoiSinh → element_linhMocHoiSinh | thanhMocHoPhap / cuongVuThienDiep / thanhTrucBaoPhu | coThuTranThien |
| Thủy | thuyNguyetTuLinh → element_thuyNguyetTuLinh | thanhLuuTayTran → element_thanhLuuTayTran | hanBangTien / bachDangTrieuDang / linhThuyHoMenh | thuyKiepVanTrung |
| Hỏa | phongHoaThieuDoanh → element_phongHoaThieuDoanh | noHoaThieuThan → element_noHoaThieuThan | xichDiemTien / hoaThieuLienTrai / ducHoaTrungSinh | lietDiemPhanThanh |
| Thổ | hauThoTichLuong → element_hauThoTichLuong | thachGiap → element_thachGiap | sonBangDiaLiet / diaChanTamQuan / kienThanhBatDong | thaiSonApDinh |
| Lôi | loiTruGiangThe → element_loiTruGiangThe | tinhDienHoThan → element_tinhDienHoThan (đổi Thanh tẩy/Thủ thành trao đổi năng lượng) | loiTienXuyenVan / loiVongThienLa / loiDinhHieuLenh | cuuTieuLoiPhat |
| Phong | phongQuyenTanVan → element_phongQuyenTanVan | thanhPhongTuKhi → element_thanhPhongTuKhi (đổi Công bản thân thành nhịp năng lượng/Thủ đội) | phongNhanLietKhong / cuongPhongQuetTran / phongHanhVanLy | baoTapCanKhon |

Chiêu riêng của 60 nhân vật ánh xạ ID sang chính nó. Chiêu nghề mới tái dùng ID gốc sau tiền tố `role_` theo bảng 18 chiêu, ngoại trừ hai chiêu mới `role_doatMenh`, `role_thienDiaCong`. `hieuLenh` cũ của Tướng sĩ chỉ ở preset AI; `role_hieuLenh` thuộc Quân sư. `phepCong`, `bayTran` cũ không có trong bộ người chơi mới.

Hồ sơ hiện dùng `version: 1` và khóa ô, không cần chuyển dữ liệu, hoàn điểm hay đổi version. Không di chuyển điểm từ ô này sang ô khác để tránh mất đầu tư khi đổi nghề/hệ. Đọc nhiều lần không thêm điểm. Hồ sơ cổ có chiêu nhánh/id dùng cơ chế chuyển đổi riêng: chỉ hoàn điểm thực đã chi theo bảng giá nâng và giá nhánh, giữ trường còn lại; xóa khóa cũ/nhánh là dấu hiệu đã chuyển, không lặp. Không đặt lại điểm theo tổng cấp vì có thể làm mất điểm hoặc cộng thêm ngoài số thực chi.

## AI chiến dịch và kiểm chứng

Sứ quân/thủ lĩnh chiến dịch giữ khung hệ cũ với mốc cũ và chiêu riêng luôn mở; tùy tướng giữ nấc 1 + một nhánh. Đây là preset chiến dịch tường minh, khác với sứ quân người chơi sở hữu. Tháp/sinh tồn giữ sứ quân trùm theo preset chiến dịch qua `encounterFighter` của danh mục 12 sứ quân (`warlords.ts`, trước CAMP-08.04 là `stageFighter`); tướng thường và đội người chơi nhận khung mới. Thử thách ngày giữ thủ lĩnh sứ quân preset chiến dịch, hai tùy tướng rút từ kho tướng thường nhận khung mới. Đấu trường dựng từ đội sở hữu nên dùng khung mới.

AI xét từng mục tiêu hợp lệ để chọn giá trị cao nhất: hồi không vượt máu thiếu, Thanh tẩy chỉ tính debuff, Xua tan chỉ tính buff, Câm lặng ưu tiên người có chiêu và năng lượng; tránh lãng phí hiệu ứng đã có. Hiệu ứng tự hại trừ điểm, Khiêu khích chỉ có giá trị khi bảo vệ người khác. Chấm bàn cờ theo thu hoạch giảm hiện hành, không nhìn RNG ô rơi. Phá vùng chấm nhanh mọi vùng khác nhau rồi mô phỏng cascade cho 6 vùng triển vọng nhất; không tối ưu tuyệt đối mọi cascade.

Kiểm tra: CI lint/typecheck/test/build, test 42 tổ hợp và mọi nhân vật, mốc mở/đổi nghề/hệ/hồ sơ, tương tác mới, quyết định AI. `scripts/skill-audit.ts` chạy seed 1 và 73, cấp 9/10/15/20, đủ 6 nghề, 1vs1/3vs3; thêm Bố Hải, Tam Đái, Phong Châu, Đỗ Động. So cùng script trên trước/sau; báo từng nhóm, tỉ lệ thắng, phân vị lượt, số chiêu/trận. Mẫu nhỏ phục vụ chẩn đoán, không chứng minh cân bằng. Báo cáo thực nghiệm được bổ sung sau chạy.

## Chơi thử và bàn giao

Trong màn Luyện tập, đổi nghề nhưng giữ nguyên hệ Mộc và cùng trang bị để thấy 3 chiêu nghề đổi, 2 chiêu hệ và tuyệt chiêu mặc định giữ nguyên. Chuyển sang Tiến trình để kiểm tra ô 5 ở cấp 10, ô 4 cấp 15, ô 6 cấp 20. Đổi hệ/nghề rồi trở lại màn nâng cấp: sao nâng ở mỗi ô giữ nguyên; ô bị khóa tạm không mất điểm.

- Tướng sĩ: dùng Phá trận trước, Đoạt mệnh khi đối thủ còn ≤35% máu; so sát thương trước/sau ngưỡng.
- Pháp sư: dùng Phép lan trong 3vs3, Ngũ hành ấn để tạo hiệu ứng đúng hệ; Thiên địa cộng hưởng chọn vùng có kiếm/âm dương/ô đặc biệt.
- Binh lính: Thủ thành trước đợt địch đánh đơn, Tường khiên khi đồng đội yếu; thử 1vs1 để thấy Khiêu khích không chuyển đòn.
- Y sư: Linh dược chọn người đang thiếu máu/bị Câm lặng; Dưỡng sinh trước trận kéo dài; Tế độ khi nhiều người cùng mất máu/debuff.
- Mưu sĩ: Mua chuộc người đang nhiều năng lượng, Ly gián trước lượt tung chiêu, Cắt quân lương khi địch gần ngưỡng đói.
- Quân sư: Nghi binh đối thủ có ATK cao, Hiệu lệnh trước lượt đội tấn công; Phá kế sau khi địch bật Khiên/Công/Hồi phục.

Kết quả kiểm chứng và mô phỏng ở [Báo cáo cải tổ](../../../reports/2026-10-22-ky-nang.md). Không tự merge, push hay triển khai production.

Kiểm chứng tiếp sau cải tổ: [AI, Tinh thần A–E và trình duyệt](../../../reports/2026-10-22-tinh-than-ai.md). Khung kỹ năng, hệ số, mốc mở, luật lương và Tinh thần mặc định không đổi trong đợt đó.
